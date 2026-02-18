/**
 * Performance Monitoring System
 *
 * Features:
 * - Web Vitals tracking (CLS, FID, LCP, FCP, TTFB)
 * - Custom performance marks
 * - Resource timing
 * - Long task monitoring
 * - API response time tracking
 * - Component render time
 * - Bundle size monitoring
 * - Report to backend or external service
 *
 * Required package: npm install web-vitals
 */

import { onCLS, onFID, onLCP, onFCP, onTTFB, Metric } from 'web-vitals';
import { trackEvent } from './analytics';
import { addBreadcrumb } from './sentry';

// Performance configuration
const PERFORMANCE_ENABLED = import.meta.env.VITE_PERFORMANCE_MONITORING !== 'false';
const PERFORMANCE_API_URL = import.meta.env.VITE_PERFORMANCE_API_URL || '/api/performance';
const PERFORMANCE_SAMPLE_RATE = parseFloat(import.meta.env.VITE_PERFORMANCE_SAMPLE_RATE || '1.0');

// Types
export interface PerformanceMetric {
  name: string;
  value: number;
  rating?: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
  id?: string;
  timestamp: number;
  url: string;
}

export interface ResourceTiming {
  name: string;
  duration: number;
  size?: number;
  type: string;
  startTime: number;
}

export interface APITiming {
  url: string;
  method: string;
  duration: number;
  status: number;
  timestamp: number;
}

export interface ComponentTiming {
  componentName: string;
  phase: 'mount' | 'update';
  duration: number;
  timestamp: number;
}

// Storage for metrics
const metrics: PerformanceMetric[] = [];
const apiTimings: APITiming[] = [];
const componentTimings: ComponentTiming[] = [];

// Long task observer
let longTaskObserver: PerformanceObserver | null = null;

/**
 * Initialize performance monitoring
 */
export function initPerformanceMonitoring(): void {
  if (!PERFORMANCE_ENABLED) {
    console.info('Performance monitoring is disabled');
    return;
  }

  // Check if we should track based on sample rate
  if (Math.random() > PERFORMANCE_SAMPLE_RATE) {
    console.info('Performance monitoring skipped due to sample rate');
    return;
  }

  // Track Web Vitals
  trackWebVitals();

  // Monitor long tasks
  monitorLongTasks();

  // Monitor resources
  monitorResources();

  // Send metrics periodically
  startMetricsReporting();

  // Send metrics before page unload
  window.addEventListener('beforeunload', () => {
    sendMetrics();
  });

  console.info('Performance monitoring initialized');
}

/**
 * Track Web Vitals metrics
 */
function trackWebVitals(): void {
  // Cumulative Layout Shift
  onCLS(handleMetric);

  // First Input Delay
  onFID(handleMetric);

  // Largest Contentful Paint
  onLCP(handleMetric);

  // First Contentful Paint
  onFCP(handleMetric);

  // Time to First Byte
  onTTFB(handleMetric);
}

/**
 * Handle Web Vitals metric
 */
function handleMetric(metric: Metric): void {
  const performanceMetric: PerformanceMetric = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    timestamp: Date.now(),
    url: window.location.pathname,
  };

  metrics.push(performanceMetric);

  // Log to console in development
  if (import.meta.env.DEV) {
    console.log(`[Performance] ${metric.name}:`, {
      value: metric.value,
      rating: metric.rating,
    });
  }

  // Track in analytics
  trackEvent({
    name: 'web_vitals',
    properties: {
      metric: metric.name,
      value: metric.value,
      rating: metric.rating,
    },
  });

  // Add breadcrumb
  addBreadcrumb(
    `Web Vital: ${metric.name}`,
    'performance',
    metric.rating === 'poor' ? 'warning' : 'info',
    { value: metric.value, rating: metric.rating }
  );
}

/**
 * Monitor long tasks (tasks that block the main thread for >50ms)
 */
function monitorLongTasks(): void {
  if (!('PerformanceObserver' in window)) {
    console.warn('PerformanceObserver not supported');
    return;
  }

  try {
    longTaskObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const longTask = entry as PerformanceEntry;

        if (longTask.duration > 50) {
          const metric: PerformanceMetric = {
            name: 'long_task',
            value: longTask.duration,
            rating: longTask.duration > 100 ? 'poor' : 'needs-improvement',
            timestamp: Date.now(),
            url: window.location.pathname,
          };

          metrics.push(metric);

          // Log warning for long tasks
          console.warn(`Long task detected: ${longTask.duration}ms`);

          // Add breadcrumb
          addBreadcrumb(
            'Long Task Detected',
            'performance',
            'warning',
            { duration: longTask.duration }
          );
        }
      }
    });

    longTaskObserver.observe({ entryTypes: ['longtask'] });
  } catch (error) {
    console.warn('Failed to observe long tasks:', error);
  }
}

/**
 * Monitor resource loading performance
 */
function monitorResources(): void {
  if (!('PerformanceObserver' in window)) {
    return;
  }

  try {
    const resourceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const resource = entry as PerformanceResourceTiming;

        // Skip data URIs and browser extensions
        if (resource.name.startsWith('data:') ||
            resource.name.includes('chrome-extension://') ||
            resource.name.includes('moz-extension://')) {
          continue;
        }

        const resourceTiming: ResourceTiming = {
          name: resource.name,
          duration: resource.duration,
          size: resource.transferSize,
          type: resource.initiatorType,
          startTime: resource.startTime,
        };

        // Log slow resources
        if (resource.duration > 1000) {
          console.warn(`Slow resource: ${resource.name} (${resource.duration}ms)`);

          addBreadcrumb(
            'Slow Resource',
            'performance',
            'warning',
            resourceTiming
          );
        }
      }
    });

    resourceObserver.observe({ entryTypes: ['resource'] });
  } catch (error) {
    console.warn('Failed to observe resources:', error);
  }
}

/**
 * Track API call performance
 */
export function trackAPICall(
  url: string,
  method: string,
  duration: number,
  status: number
): void {
  const timing: APITiming = {
    url,
    method,
    duration,
    status,
    timestamp: Date.now(),
  };

  apiTimings.push(timing);

  // Log slow API calls
  if (duration > 1000) {
    console.warn(`Slow API call: ${method} ${url} (${duration}ms)`);

    addBreadcrumb(
      'Slow API Call',
      'performance',
      'warning',
      timing
    );
  }

  // Track in analytics
  trackEvent({
    name: 'api_call',
    properties: {
      url,
      method,
      duration,
      status,
    },
  });
}

/**
 * Track component render time
 */
export function trackComponentRender(
  componentName: string,
  phase: 'mount' | 'update',
  duration: number
): void {
  const timing: ComponentTiming = {
    componentName,
    phase,
    duration,
    timestamp: Date.now(),
  };

  componentTimings.push(timing);

  // Log slow renders
  if (duration > 16) { // More than one frame at 60fps
    console.warn(`Slow ${phase}: ${componentName} (${duration}ms)`);

    addBreadcrumb(
      'Slow Component Render',
      'performance',
      'warning',
      timing
    );
  }
}

/**
 * Create custom performance mark
 */
export function mark(name: string): void {
  if ('performance' in window && 'mark' in performance) {
    performance.mark(name);
  }
}

/**
 * Measure time between two marks
 */
export function measure(
  name: string,
  startMark: string,
  endMark?: string
): number | null {
  if (!('performance' in window && 'measure' in performance)) {
    return null;
  }

  try {
    if (endMark) {
      performance.measure(name, startMark, endMark);
    } else {
      performance.measure(name, startMark);
    }

    const measures = performance.getEntriesByName(name, 'measure');
    const measure = measures[measures.length - 1];

    if (measure) {
      const metric: PerformanceMetric = {
        name,
        value: measure.duration,
        timestamp: Date.now(),
        url: window.location.pathname,
      };

      metrics.push(metric);

      return measure.duration;
    }
  } catch (error) {
    console.warn(`Failed to measure performance: ${name}`, error);
  }

  return null;
}

/**
 * Get performance metrics summary
 */
export function getMetricsSummary(): {
  webVitals: PerformanceMetric[];
  apiCalls: APITiming[];
  components: ComponentTiming[];
  longTasks: PerformanceMetric[];
} {
  return {
    webVitals: metrics.filter(m =>
      ['CLS', 'FID', 'LCP', 'FCP', 'TTFB'].includes(m.name)
    ),
    apiCalls: [...apiTimings],
    components: [...componentTimings],
    longTasks: metrics.filter(m => m.name === 'long_task'),
  };
}

/**
 * Get performance score (0-100)
 */
export function getPerformanceScore(): number {
  const summary = getMetricsSummary();
  let score = 100;

  // Deduct points for poor Web Vitals
  summary.webVitals.forEach(metric => {
    if (metric.rating === 'poor') {
      score -= 15;
    } else if (metric.rating === 'needs-improvement') {
      score -= 5;
    }
  });

  // Deduct points for slow API calls
  const slowAPICalls = summary.apiCalls.filter(api => api.duration > 1000).length;
  score -= Math.min(slowAPICalls * 5, 20);

  // Deduct points for long tasks
  score -= Math.min(summary.longTasks.length * 5, 20);

  return Math.max(score, 0);
}

/**
 * Send metrics to backend
 */
async function sendMetrics(): Promise<void> {
  if (metrics.length === 0 && apiTimings.length === 0 && componentTimings.length === 0) {
    return;
  }

  const data = {
    metrics: [...metrics],
    apiTimings: [...apiTimings],
    componentTimings: [...componentTimings],
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: Date.now(),
  };

  // Clear arrays
  metrics.length = 0;
  apiTimings.length = 0;
  componentTimings.length = 0;

  try {
    // Use sendBeacon for reliability
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      const sent = navigator.sendBeacon(PERFORMANCE_API_URL, blob);

      if (!sent) {
        console.warn('Failed to send performance metrics via beacon');
      }
    } else {
      // Fallback to fetch
      await fetch(PERFORMANCE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    }
  } catch (error) {
    console.error('Failed to send performance metrics:', error);
  }
}

/**
 * Start periodic metrics reporting
 */
function startMetricsReporting(): void {
  // Send metrics every 30 seconds
  setInterval(() => {
    sendMetrics();
  }, 30000);
}

/**
 * Get navigation timing
 */
export function getNavigationTiming(): Record<string, number> | null {
  if (!('performance' in window) || !performance.timing) {
    return null;
  }

  const timing = performance.timing;
  const navigation = {
    dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
    tcpConnection: timing.connectEnd - timing.connectStart,
    serverResponse: timing.responseEnd - timing.requestStart,
    pageLoad: timing.loadEventEnd - timing.navigationStart,
    domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
    domInteractive: timing.domInteractive - timing.navigationStart,
  };

  return navigation;
}

/**
 * Get memory usage (Chrome only)
 */
export function getMemoryUsage(): {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  usagePercent: number;
} | null {
  const memory = (performance as any).memory;

  if (!memory) {
    return null;
  }

  return {
    usedJSHeapSize: memory.usedJSHeapSize,
    totalJSHeapSize: memory.totalJSHeapSize,
    jsHeapSizeLimit: memory.jsHeapSizeLimit,
    usagePercent: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
  };
}

/**
 * Clear performance data
 */
export function clearPerformanceData(): void {
  metrics.length = 0;
  apiTimings.length = 0;
  componentTimings.length = 0;

  if ('performance' in window && 'clearMarks' in performance) {
    performance.clearMarks();
    performance.clearMeasures();
  }
}

/**
 * HOC for tracking component performance
 */
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
): React.ComponentType<P> {
  const name = componentName || Component.displayName || Component.name || 'Unknown';

  return (props: P) => {
    const startTime = React.useRef<number>(0);

    React.useEffect(() => {
      // Track mount time
      const mountTime = performance.now() - startTime.current;
      trackComponentRender(name, 'mount', mountTime);
    }, []);

    React.useEffect(() => {
      // Track update time
      const updateTime = performance.now() - startTime.current;
      if (updateTime > 0) {
        trackComponentRender(name, 'update', updateTime);
      }
    });

    startTime.current = performance.now();

    return React.createElement(Component, props);
  };
}

export default {
  initPerformanceMonitoring,
  trackAPICall,
  trackComponentRender,
  mark,
  measure,
  getMetricsSummary,
  getPerformanceScore,
  getNavigationTiming,
  getMemoryUsage,
  clearPerformanceData,
  withPerformanceTracking,
};
