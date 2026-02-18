/**
 * Performance Optimization Utilities
 * Central export file for all optimization utilities
 */

// Lazy loading utilities
export {
  lazyLoad,
  preloadComponent,
  lazyLoadWithRetry,
  prefetchOnInteraction,
  LazyImageLoader
} from './lazyLoad';

// Debounce and throttle utilities
export {
  useDebounce,
  useThrottle,
  debounce,
  throttle,
  rafThrottle,
  useDebouncedValue,
  useThrottledValue
} from './debounceThrottle';

// Virtual scrolling utilities
export {
  useVirtualScroll,
  useVirtualGrid,
  WindowedList,
  useInfiniteScroll,
  DynamicSizeVirtualizer
} from './virtualScroll';

// Image optimization utilities
export {
  getOptimizedImageUrl,
  generateSrcSet,
  LazyImage,
  ProgressiveImage,
  supportsWebP,
  supportsAVIF,
  getBestImageFormat,
  convertToOptimalFormat,
  preloadImages,
  ResponsivePicture,
  useResponsiveImage,
  compressImage
} from './imageOptimization';

// Performance monitoring utilities
export {
  PerformanceMonitor,
  PerformanceTracker,
  ResourceMonitor,
  MemoryMonitor,
  LongTaskMonitor,
  initPerformanceMonitoring
} from './performanceMonitoring';

export type {
  PerformanceMetric,
  WebVitalsReport
} from './performanceMonitoring';

// React optimization utilities
export {
  deepEqual,
  shallowEqual,
  memoWithComparison,
  deepMemo,
  useStableCallback,
  useDeepMemo,
  usePrevious,
  useWhyDidYouUpdate,
  useRenderCount,
  useBatchedState,
  useLazyComputed,
  createMemoizedListItem,
  useEventCallback,
  useIntersectionObserver,
  RenderWhenVisible,
  useConditionalRender,
  renderOptimizedList,
  memo,
  useMemo,
  useCallback,
  useRef,
  useEffect
} from './reactOptimization';

export type {
  ListItemProps
} from './reactOptimization';

/**
 * Quick start guide for optimization utilities
 *
 * @example Lazy loading a component
 * ```tsx
 * import { lazyLoad } from '@/utils/optimization';
 *
 * const HeavyComponent = lazyLoad(
 *   () => import('./HeavyComponent'),
 *   { fallback: <Loading /> }
 * );
 * ```
 *
 * @example Debouncing search input
 * ```tsx
 * import { useDebouncedValue } from '@/utils/optimization';
 *
 * const [search, setSearch] = useState('');
 * const debouncedSearch = useDebouncedValue(search, 300);
 * ```
 *
 * @example Virtual scrolling for large lists
 * ```tsx
 * import { WindowedList } from '@/utils/optimization';
 *
 * <WindowedList
 *   items={items}
 *   itemHeight={60}
 *   height={600}
 *   renderItem={(item) => <Item data={item} />}
 * />
 * ```
 *
 * @example Image optimization
 * ```tsx
 * import { LazyImage, useResponsiveImage } from '@/utils/optimization';
 *
 * <LazyImage
 *   src="/image.jpg"
 *   alt="Description"
 *   loading="lazy"
 * />
 * ```
 *
 * @example Performance monitoring
 * ```tsx
 * import { initPerformanceMonitoring } from '@/utils/optimization';
 *
 * const monitor = initPerformanceMonitoring();
 * monitor.subscribe((metric) => {
 *   console.log(`${metric.name}: ${metric.value}ms`);
 * });
 * ```
 *
 * @example React optimization
 * ```tsx
 * import { deepMemo, useStableCallback } from '@/utils/optimization';
 *
 * const MemoizedComponent = deepMemo(MyComponent);
 *
 * const stableCallback = useStableCallback((data) => {
 *   processData(data);
 * });
 * ```
 */

// Performance best practices
export const PERFORMANCE_BEST_PRACTICES = {
  // Bundle size recommendations
  bundleSize: {
    initial: 250 * 1024, // 250KB
    total: 1000 * 1024, // 1MB
    lazy: 500 * 1024 // 500KB per lazy chunk
  },

  // Core Web Vitals thresholds
  coreWebVitals: {
    FCP: 1800, // First Contentful Paint (ms)
    LCP: 2500, // Largest Contentful Paint (ms)
    FID: 100, // First Input Delay (ms)
    CLS: 0.1, // Cumulative Layout Shift
    TTFB: 800, // Time to First Byte (ms)
    INP: 200 // Interaction to Next Paint (ms)
  },

  // Cache durations
  cache: {
    images: 30 * 24 * 60 * 60, // 30 days
    fonts: 365 * 24 * 60 * 60, // 1 year
    scripts: 7 * 24 * 60 * 60, // 7 days
    api: 10 * 60, // 10 minutes
    static: 90 * 24 * 60 * 60 // 90 days
  },

  // Virtual scrolling thresholds
  virtualScrolling: {
    enabled: 100, // Enable for lists > 100 items
    itemHeight: 60, // Default item height
    overscan: 3 // Items to render outside viewport
  },

  // Image optimization
  images: {
    quality: 85, // JPEG/WebP quality
    maxWidth: 1920, // Maximum width
    formats: ['avif', 'webp', 'jpeg'], // Preferred formats
    lazyLoadThreshold: '50px' // Root margin for lazy loading
  },

  // Debounce/throttle delays
  delays: {
    search: 300, // Search input debounce
    resize: 100, // Window resize throttle
    scroll: 100, // Scroll event throttle
    autocomplete: 200 // Autocomplete debounce
  }
};

export default {
  lazyLoad,
  useDebounce,
  useThrottle,
  useVirtualScroll,
  WindowedList,
  LazyImage,
  initPerformanceMonitoring,
  deepMemo,
  useStableCallback,
  PERFORMANCE_BEST_PRACTICES
};
