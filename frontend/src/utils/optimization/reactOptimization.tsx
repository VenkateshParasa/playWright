/**
 * React component optimization utilities
 * Memoization, callback optimization, and render optimization
 */

import { memo, useMemo, useCallback, useRef, useEffect } from 'react';

/**
 * Deep comparison for objects and arrays
 */
export function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;

  if (a == null || b == null) return false;

  if (typeof a !== 'object' || typeof b !== 'object') return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }

  return true;
}

/**
 * Shallow comparison for objects
 */
export function shallowEqual(a: any, b: any): boolean {
  if (a === b) return true;

  if (typeof a !== 'object' || typeof b !== 'object') return false;
  if (a == null || b == null) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  return keysA.every((key) => a[key] === b[key]);
}

/**
 * Create a memoized component with custom comparison
 */
export function memoWithComparison<T extends React.ComponentType<any>>(
  Component: T,
  areEqual?: (prevProps: any, nextProps: any) => boolean
): T {
  return memo(Component, areEqual) as T;
}

/**
 * Memoize component with deep comparison
 */
export function deepMemo<T extends React.ComponentType<any>>(Component: T): T {
  return memo(Component, deepEqual) as T;
}

/**
 * Stable callback that doesn't change between renders
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T
): T {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback((...args: any[]) => {
    return callbackRef.current(...args);
  }, []) as T;
}

/**
 * Memoized value with deep comparison
 */
export function useDeepMemo<T>(factory: () => T, deps: any[]): T {
  const ref = useRef<{ deps: any[]; value: T }>();

  if (!ref.current || !deepEqual(ref.current.deps, deps)) {
    ref.current = {
      deps,
      value: factory()
    };
  }

  return ref.current.value;
}

/**
 * Previous value hook
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

/**
 * Compare and log why a component re-rendered
 */
export function useWhyDidYouUpdate(name: string, props: Record<string, any>) {
  const previousProps = useRef<Record<string, any>>();

  useEffect(() => {
    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changedProps: Record<string, { from: any; to: any }> = {};

      allKeys.forEach((key) => {
        if (previousProps.current![key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current![key],
            to: props[key]
          };
        }
      });

      if (Object.keys(changedProps).length > 0) {
        console.log('[why-did-you-update]', name, changedProps);
      }
    }

    previousProps.current = props;
  });
}

/**
 * Optimized render counter
 */
export function useRenderCount(componentName: string) {
  const renders = useRef(0);

  useEffect(() => {
    renders.current += 1;
  });

  if (import.meta.env.DEV) {
    console.log(`${componentName} rendered ${renders.current} times`);
  }

  return renders.current;
}

/**
 * Batch state updates
 */
export function useBatchedState<T>(
  initialState: T
): [T, (updates: Partial<T>) => void] {
  const [state, setState] = useState<T>(initialState);
  const updateQueue = useRef<Partial<T>[]>([]);
  const rafId = useRef<number | null>(null);

  const batchedSetState = useCallback((updates: Partial<T>) => {
    updateQueue.current.push(updates);

    if (rafId.current === null) {
      rafId.current = requestAnimationFrame(() => {
        const mergedUpdates = updateQueue.current.reduce(
          (acc, update) => ({ ...acc, ...update }),
          {} as Partial<T>
        );

        setState((prev) => ({ ...prev, ...mergedUpdates }));
        updateQueue.current = [];
        rafId.current = null;
      });
    }
  }, []);

  useEffect(() => {
    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  return [state, batchedSetState];
}

/**
 * Lazy computed value
 */
export function useLazyComputed<T>(
  factory: () => T,
  deps: any[]
): () => T {
  const computed = useRef<{ deps: any[]; value: T } | null>(null);

  return useCallback(() => {
    if (!computed.current || !shallowEqual(computed.current.deps, deps)) {
      computed.current = {
        deps,
        value: factory()
      };
    }
    return computed.current.value;
  }, deps);
}

/**
 * Prevent unnecessary re-renders for list items
 */
export interface ListItemProps<T> {
  item: T;
  index: number;
  onUpdate?: (item: T, index: number) => void;
}

export function createMemoizedListItem<T>(
  Component: React.ComponentType<ListItemProps<T>>,
  areEqual?: (prev: ListItemProps<T>, next: ListItemProps<T>) => boolean
) {
  const defaultAreEqual = (
    prev: ListItemProps<T>,
    next: ListItemProps<T>
  ) => {
    return (
      prev.index === next.index &&
      prev.item === next.item &&
      prev.onUpdate === next.onUpdate
    );
  };

  return memo(Component, areEqual || defaultAreEqual);
}

/**
 * Optimized event handler
 */
export function useEventCallback<T extends (...args: any[]) => any>(
  fn: T
): T {
  const ref = useRef<T>(fn);

  useEffect(() => {
    ref.current = fn;
  }, [fn]);

  return useCallback((...args: any[]) => {
    const { current } = ref;
    return current(...args);
  }, []) as T;
}

/**
 * Intersection observer hook for visibility tracking
 */
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
): boolean {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        ...options
      }
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref, options.threshold, options.rootMargin]);

  return isIntersecting;
}

/**
 * Render only when visible
 */
interface RenderWhenVisibleProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
}

export function RenderWhenVisible({
  children,
  fallback = null,
  threshold = 0.1,
  rootMargin = '50px'
}: RenderWhenVisibleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(ref, { threshold, rootMargin });
  const hasBeenVisible = useRef(false);

  if (isVisible && !hasBeenVisible.current) {
    hasBeenVisible.current = true;
  }

  return (
    <div ref={ref}>
      {hasBeenVisible.current ? children : fallback}
    </div>
  );
}

/**
 * Conditional rendering optimization
 */
export function useConditionalRender<T>(
  condition: boolean,
  factory: () => T,
  deps: any[]
): T | null {
  const value = useMemo(() => {
    return condition ? factory() : null;
  }, [condition, ...deps]);

  return value;
}

/**
 * Optimized list rendering
 */
export function renderOptimizedList<T>(
  items: T[],
  renderItem: (item: T, index: number) => React.ReactNode,
  keyExtractor: (item: T, index: number) => string | number
) {
  return items.map((item, index) => {
    const key = keyExtractor(item, index);
    return (
      <React.Fragment key={key}>
        {renderItem(item, index)}
      </React.Fragment>
    );
  });
}

function useState<T>(initialValue: T): [T, (value: T) => void] {
  const ref = useRef({ value: initialValue });
  return [ref.current.value, (newValue: T) => { ref.current.value = newValue; }];
}

// Re-export React hooks for consistency
export { memo, useMemo, useCallback, useRef, useEffect };
