import { useEffect, useRef, useState, useCallback } from 'react';

interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

interface VirtualScrollResult<T> {
  virtualItems: T[];
  totalHeight: number;
  offsetY: number;
  scrollToIndex: (index: number) => void;
}

/**
 * Virtual scrolling hook for rendering large lists efficiently
 * Only renders items that are visible in the viewport
 */
export function useVirtualScroll<T>(
  items: T[],
  { itemHeight, containerHeight, overscan = 3 }: VirtualScrollOptions
): VirtualScrollResult<T> {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollRef = useRef<HTMLElement | null>(null);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const virtualItems = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    setScrollTop(target.scrollTop);
  }, []);

  const scrollToIndex = useCallback((index: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = index * itemHeight;
    }
  }, [itemHeight]);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    scrollElement.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollElement.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return {
    virtualItems,
    totalHeight,
    offsetY,
    scrollToIndex
  };
}

/**
 * Virtual grid scrolling for 2D grids
 */
interface VirtualGridOptions {
  rowHeight: number;
  columnWidth: number;
  containerHeight: number;
  containerWidth: number;
  columns: number;
  overscan?: number;
}

export function useVirtualGrid<T>(
  items: T[],
  {
    rowHeight,
    columnWidth,
    containerHeight,
    containerWidth,
    columns,
    overscan = 1
  }: VirtualGridOptions
) {
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const totalRows = Math.ceil(items.length / columns);

  const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const endRow = Math.min(
    totalRows - 1,
    Math.ceil((scrollTop + containerHeight) / rowHeight) + overscan
  );

  const startCol = Math.max(0, Math.floor(scrollLeft / columnWidth) - overscan);
  const endCol = Math.min(
    columns - 1,
    Math.ceil((scrollLeft + containerWidth) / columnWidth) + overscan
  );

  const virtualItems: Array<{ item: T; row: number; col: number }> = [];

  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      const index = row * columns + col;
      if (index < items.length) {
        virtualItems.push({
          item: items[index],
          row,
          col
        });
      }
    }
  }

  return {
    virtualItems,
    totalHeight: totalRows * rowHeight,
    totalWidth: columns * columnWidth,
    offsetY: startRow * rowHeight,
    offsetX: startCol * columnWidth,
    setScrollTop,
    setScrollLeft
  };
}

/**
 * Windowed list component
 */
interface WindowedListProps<T> {
  items: T[];
  itemHeight: number;
  height: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
}

export function WindowedList<T>({
  items,
  itemHeight,
  height,
  renderItem,
  overscan = 3,
  className = ''
}: WindowedListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + height) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ height, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Intersection Observer based infinite scroll
 */
export function useInfiniteScroll(
  callback: () => void,
  options: IntersectionObserverInit = {}
) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const targetRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          callback();
        }
      },
      {
        threshold: 0.1,
        ...options
      }
    );

    const target = targetRef.current;
    if (target && observerRef.current) {
      observerRef.current.observe(target);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [callback, options]);

  return targetRef;
}

/**
 * Dynamic item height virtual scroll
 * For lists where items have variable heights
 */
export class DynamicSizeVirtualizer {
  private itemHeights: Map<number, number> = new Map();
  private estimatedHeight: number;

  constructor(estimatedHeight: number = 50) {
    this.estimatedHeight = estimatedHeight;
  }

  setItemHeight(index: number, height: number) {
    this.itemHeights.set(index, height);
  }

  getItemHeight(index: number): number {
    return this.itemHeights.get(index) || this.estimatedHeight;
  }

  getOffsetTop(index: number): number {
    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += this.getItemHeight(i);
    }
    return offset;
  }

  getTotalHeight(itemCount: number): number {
    let height = 0;
    for (let i = 0; i < itemCount; i++) {
      height += this.getItemHeight(i);
    }
    return height;
  }

  getVisibleRange(scrollTop: number, containerHeight: number, itemCount: number) {
    let startIndex = 0;
    let currentOffset = 0;

    // Find start index
    for (let i = 0; i < itemCount; i++) {
      const itemHeight = this.getItemHeight(i);
      if (currentOffset + itemHeight > scrollTop) {
        startIndex = i;
        break;
      }
      currentOffset += itemHeight;
    }

    // Find end index
    let endIndex = startIndex;
    let viewportBottom = scrollTop + containerHeight;
    currentOffset = this.getOffsetTop(startIndex);

    for (let i = startIndex; i < itemCount; i++) {
      currentOffset += this.getItemHeight(i);
      if (currentOffset > viewportBottom) {
        endIndex = i;
        break;
      }
      endIndex = i;
    }

    return { startIndex, endIndex };
  }
}
