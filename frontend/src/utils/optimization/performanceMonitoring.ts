/**
 * Performance monitoring utilities
 * Track Core Web Vitals and custom metrics
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

export interface WebVitalsReport {
  CLS: PerformanceMetric | null;
  FID: PerformanceMetric | null;
  FCP: PerformanceMetric | null;
  LCP: PerformanceMetric | null;
  TTFB: PerformanceMetric | null;
  INP: PerformanceMetric | null;
}

/**
 * Performance thresholds based on Core Web Vitals
 */
const THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FID: { good: 100, poor: 300 },
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 }
};

/**
 * Get rating based on thresholds
 */
function getRating(
  value: number,
  thresholds: { good: number; poor: number }
): 'good' | 'needs-improvement' | 'poor' {
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Track Core Web Vitals
 */
export class PerformanceMonitor {
  private metrics: WebVitalsReport = {
    CLS: null,
    FID: null,
    FCP: null,
    LCP: null,
    TTFB: null,
    INP: null
  };

  private observers: Map<string, PerformanceObserver> = new Map();
  private callbacks: Set<(metric: PerformanceMetric) => void> = new Set();

  constructor() {
    if (typeof window === 'undefined') return;

    this.initCLS();
    this.initLCP();
    this.initFID();
    this.initFCP();
    this.initTTFB();
    this.initINP();
  }

  /**
   * Cumulative Layout Shift (CLS)
   */
  private initCLS() {
    let clsValue = 0;
    let sessionValue = 0;
    let sessionEntries: PerformanceEntry[] = [];

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as any[]) {
        if (!entry.hadRecentInput) {
          const firstSessionEntry = sessionEntries[0];
          const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

          if (
            sessionValue &&
            entry.startTime - lastSessionEntry.startTime < 1000 &&
            entry.startTime - firstSessionEntry.startTime < 5000
          ) {
            sessionValue += entry.value;
            sessionEntries.push(entry);
          } else {
            sessionValue = entry.value;
            sessionEntries = [entry];
          }

          if (sessionValue > clsValue) {
            clsValue = sessionValue;
            this.reportMetric('CLS', clsValue);
          }
        }
      }
    });

    try {
      observer.observe({ type: 'layout-shift', buffered: true });
      this.observers.set('CLS', observer);
    } catch (e) {
      // Layout shift not supported
    }
  }

  /**
   * Largest Contentful Paint (LCP)
   */
  private initLCP() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;

      if (lastEntry) {
        this.reportMetric('LCP', lastEntry.renderTime || lastEntry.loadTime);
      }
    });

    try {
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
      this.observers.set('LCP', observer);
    } catch (e) {
      // LCP not supported
    }
  }

  /**
   * First Input Delay (FID)
   */
  private initFID() {
    const observer = new PerformanceObserver((list) => {
      const firstEntry = list.getEntries()[0] as any;

      if (firstEntry) {
        this.reportMetric('FID', firstEntry.processingStart - firstEntry.startTime);
      }
    });

    try {
      observer.observe({ type: 'first-input', buffered: true });
      this.observers.set('FID', observer);
    } catch (e) {
      // FID not supported
    }
  }

  /**
   * First Contentful Paint (FCP)
   */
  private initFCP() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fcpEntry = entries.find((entry) => entry.name === 'first-contentful-paint');

      if (fcpEntry) {
        this.reportMetric('FCP', fcpEntry.startTime);
      }
    });

    try {
      observer.observe({ type: 'paint', buffered: true });
      this.observers.set('FCP', observer);
    } catch (e) {
      // FCP not supported
    }
  }

  /**
   * Time to First Byte (TTFB)
   */
  private initTTFB() {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    if (navigationEntry) {
      const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
      this.reportMetric('TTFB', ttfb);
    }
  }

  /**
   * Interaction to Next Paint (INP)
   */
  private initINP() {
    let longestInteraction = 0;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as any[]) {
        const duration = entry.processingEnd - entry.startTime;

        if (duration > longestInteraction) {
          longestInteraction = duration;
          this.reportMetric('INP', duration);
        }
      }
    });

    try {
      observer.observe({ type: 'event', buffered: true, durationThreshold: 16 });
      this.observers.set('INP', observer);
    } catch (e) {
      // INP not supported
    }
  }

  /**
   * Report metric
   */
  private reportMetric(name: keyof WebVitalsReport, value: number) {
    const threshold = THRESHOLDS[name];
    const rating = getRating(value, threshold);

    const metric: PerformanceMetric = {
      name,
      value,
      rating,
      timestamp: Date.now()
    };

    this.metrics[name] = metric;

    // Notify callbacks
    this.callbacks.forEach((callback) => callback(metric));

    // Send to analytics
    this.sendToAnalytics(metric);
  }

  /**
   * Subscribe to metric updates
   */
  public subscribe(callback: (metric: PerformanceMetric) => void) {
    this.callbacks.add(callback);

    return () => {
      this.callbacks.delete(callback);
    };
  }

  /**
   * Get all metrics
   */
  public getMetrics(): WebVitalsReport {
    return { ...this.metrics };
  }

  /**
   * Send to analytics
   */
  private sendToAnalytics(metric: PerformanceMetric) {
    // Send to your analytics service
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', metric.name, {
        value: Math.round(metric.value),
        metric_rating: metric.rating,
        event_category: 'Web Vitals'
      });
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.log(`[Performance] ${metric.name}:`, {
        value: `${metric.value.toFixed(2)}ms`,
        rating: metric.rating
      });
    }
  }

  /**
   * Disconnect all observers
   */
  public disconnect() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();
    this.callbacks.clear();
  }
}

/**
 * Custom performance marks and measures
 */
export class PerformanceTracker {
  /**
   * Mark a point in time
   */
  static mark(name: string) {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(name);
    }
  }

  /**
   * Measure between two marks
   */
  static measure(name: string, startMark: string, endMark?: string) {
    if (typeof performance !== 'undefined' && performance.measure) {
      try {
        const measure = performance.measure(name, startMark, endMark);
        return measure.duration;
      } catch (e) {
        console.warn(`Failed to measure ${name}:`, e);
        return 0;
      }
    }
    return 0;
  }

  /**
   * Clear marks and measures
   */
  static clear(name?: string) {
    if (typeof performance !== 'undefined') {
      if (name) {
        performance.clearMarks(name);
        performance.clearMeasures(name);
      } else {
        performance.clearMarks();
        performance.clearMeasures();
      }
    }
  }

  /**
   * Get all marks
   */
  static getMarks(): PerformanceMark[] {
    if (typeof performance !== 'undefined' && performance.getEntriesByType) {
      return performance.getEntriesByType('mark') as PerformanceMark[];
    }
    return [];
  }

  /**
   * Get all measures
   */
  static getMeasures(): PerformanceMeasure[] {
    if (typeof performance !== 'undefined' && performance.getEntriesByType) {
      return performance.getEntriesByType('measure') as PerformanceMeasure[];
    }
    return [];
  }
}

/**
 * Resource timing
 */
export class ResourceMonitor {
  /**
   * Get all resource timings
   */
  static getResources(): PerformanceResourceTiming[] {
    if (typeof performance !== 'undefined' && performance.getEntriesByType) {
      return performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    }
    return [];
  }

  /**
   * Get resources by type
   */
  static getResourcesByType(type: string): PerformanceResourceTiming[] {
    return this.getResources().filter((resource) =>
      resource.name.includes(type)
    );
  }

  /**
   * Calculate total resource size
   */
  static getTotalSize(): number {
    return this.getResources().reduce(
      (total, resource) => total + (resource.transferSize || 0),
      0
    );
  }

  /**
   * Get slowest resources
   */
  static getSlowestResources(limit: number = 10): PerformanceResourceTiming[] {
    return this.getResources()
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  /**
   * Clear resource timings
   */
  static clear() {
    if (typeof performance !== 'undefined' && performance.clearResourceTimings) {
      performance.clearResourceTimings();
    }
  }
}

/**
 * Memory monitoring
 */
export class MemoryMonitor {
  /**
   * Get memory usage (Chrome only)
   */
  static getMemoryUsage() {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        usagePercent: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      };
    }
    return null;
  }

  /**
   * Monitor memory continuously
   */
  static startMonitoring(interval: number = 5000, callback: (usage: any) => void) {
    const intervalId = setInterval(() => {
      const usage = this.getMemoryUsage();
      if (usage) {
        callback(usage);
      }
    }, interval);

    return () => clearInterval(intervalId);
  }
}

/**
 * Long task monitoring
 */
export class LongTaskMonitor {
  private observer: PerformanceObserver | null = null;
  private callback: ((duration: number) => void) | null = null;

  start(callback: (duration: number) => void) {
    this.callback = callback;

    if (typeof PerformanceObserver !== 'undefined') {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (this.callback) {
            this.callback(entry.duration);
          }
        }
      });

      try {
        this.observer.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // Long tasks not supported
      }
    }
  }

  stop() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.callback = null;
  }
}

/**
 * Initialize performance monitoring
 */
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return null;

  const monitor = new PerformanceMonitor();

  // Log summary on page unload
  window.addEventListener('beforeunload', () => {
    const metrics = monitor.getMetrics();
    console.table(metrics);
  });

  return monitor;
}
