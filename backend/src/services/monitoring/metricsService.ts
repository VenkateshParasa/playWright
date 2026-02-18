/**
 * Metrics Collection Service (Prometheus)
 * Collects and exposes application metrics
 */

import { Request, Response } from 'express';

export interface Metric {
  name: string;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  help: string;
  value?: number;
  labels?: Record<string, string>;
}

/**
 * Prometheus Metrics Registry
 */
export class MetricsRegistry {
  private metrics: Map<string, Metric> = new Map();
  private counters: Map<string, number> = new Map();
  private gauges: Map<string, number> = new Map();
  private histograms: Map<string, number[]> = new Map();

  /**
   * Register a new metric
   */
  register(metric: Metric): void {
    this.metrics.set(metric.name, metric);

    switch (metric.type) {
      case 'counter':
        this.counters.set(metric.name, 0);
        break;
      case 'gauge':
        this.gauges.set(metric.name, 0);
        break;
      case 'histogram':
        this.histograms.set(metric.name, []);
        break;
    }
  }

  /**
   * Increment counter
   */
  incrementCounter(name: string, value: number = 1, labels?: Record<string, string>): void {
    const key = this.getMetricKey(name, labels);
    const current = this.counters.get(key) || 0;
    this.counters.set(key, current + value);
  }

  /**
   * Set gauge value
   */
  setGauge(name: string, value: number, labels?: Record<string, string>): void {
    const key = this.getMetricKey(name, labels);
    this.gauges.set(key, value);
  }

  /**
   * Increment gauge
   */
  incrementGauge(name: string, value: number = 1, labels?: Record<string, string>): void {
    const key = this.getMetricKey(name, labels);
    const current = this.gauges.get(key) || 0;
    this.gauges.set(key, current + value);
  }

  /**
   * Decrement gauge
   */
  decrementGauge(name: string, value: number = 1, labels?: Record<string, string>): void {
    const key = this.getMetricKey(name, labels);
    const current = this.gauges.get(key) || 0;
    this.gauges.set(key, Math.max(0, current - value));
  }

  /**
   * Observe histogram value
   */
  observeHistogram(name: string, value: number, labels?: Record<string, string>): void {
    const key = this.getMetricKey(name, labels);
    const values = this.histograms.get(key) || [];
    values.push(value);
    this.histograms.set(key, values);

    // Keep only last 1000 values to prevent memory issues
    if (values.length > 1000) {
      values.shift();
    }
  }

  /**
   * Get metric key with labels
   */
  private getMetricKey(name: string, labels?: Record<string, string>): string {
    if (!labels || Object.keys(labels).length === 0) {
      return name;
    }

    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');

    return `${name}{${labelStr}}`;
  }

  /**
   * Export metrics in Prometheus format
   */
  export(): string {
    const lines: string[] = [];

    // Export counters
    for (const [key, value] of this.counters.entries()) {
      const metric = this.getMetricFromKey(key);
      if (metric) {
        lines.push(`# HELP ${metric.name} ${metric.help}`);
        lines.push(`# TYPE ${metric.name} counter`);
        lines.push(`${key} ${value}`);
      }
    }

    // Export gauges
    for (const [key, value] of this.gauges.entries()) {
      const metric = this.getMetricFromKey(key);
      if (metric) {
        lines.push(`# HELP ${metric.name} ${metric.help}`);
        lines.push(`# TYPE ${metric.name} gauge`);
        lines.push(`${key} ${value}`);
      }
    }

    // Export histograms
    for (const [key, values] of this.histograms.entries()) {
      const metric = this.getMetricFromKey(key);
      if (metric && values.length > 0) {
        lines.push(`# HELP ${metric.name} ${metric.help}`);
        lines.push(`# TYPE ${metric.name} histogram`);

        const sorted = values.slice().sort((a, b) => a - b);
        const sum = values.reduce((a, b) => a + b, 0);
        const count = values.length;

        // Quantiles
        const quantiles = [0.5, 0.9, 0.95, 0.99];
        for (const q of quantiles) {
          const index = Math.floor(q * count);
          lines.push(`${key}{quantile="${q}"} ${sorted[index]}`);
        }

        lines.push(`${key}_sum ${sum}`);
        lines.push(`${key}_count ${count}`);
      }
    }

    return lines.join('\n');
  }

  private getMetricFromKey(key: string): Metric | undefined {
    const baseName = key.split('{')[0];
    return this.metrics.get(baseName);
  }

  /**
   * Get all metrics as JSON
   */
  toJSON(): any {
    return {
      counters: Array.from(this.counters.entries()).map(([name, value]) => ({
        name,
        value,
      })),
      gauges: Array.from(this.gauges.entries()).map(([name, value]) => ({
        name,
        value,
      })),
      histograms: Array.from(this.histograms.entries()).map(([name, values]) => ({
        name,
        count: values.length,
        sum: values.reduce((a, b) => a + b, 0),
        avg: values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0,
      })),
    };
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
  }
}

// Create metrics registry
export const metricsRegistry = new MetricsRegistry();

// Register default metrics
metricsRegistry.register({
  name: 'http_requests_total',
  type: 'counter',
  help: 'Total number of HTTP requests',
});

metricsRegistry.register({
  name: 'http_request_duration_seconds',
  type: 'histogram',
  help: 'HTTP request duration in seconds',
});

metricsRegistry.register({
  name: 'http_response_size_bytes',
  type: 'histogram',
  help: 'HTTP response size in bytes',
});

metricsRegistry.register({
  name: 'active_connections',
  type: 'gauge',
  help: 'Number of active connections',
});

metricsRegistry.register({
  name: 'database_queries_total',
  type: 'counter',
  help: 'Total number of database queries',
});

metricsRegistry.register({
  name: 'database_query_duration_seconds',
  type: 'histogram',
  help: 'Database query duration in seconds',
});

metricsRegistry.register({
  name: 'cache_hits_total',
  type: 'counter',
  help: 'Total number of cache hits',
});

metricsRegistry.register({
  name: 'cache_misses_total',
  type: 'counter',
  help: 'Total number of cache misses',
});

metricsRegistry.register({
  name: 'queue_messages_total',
  type: 'counter',
  help: 'Total number of queue messages',
});

metricsRegistry.register({
  name: 'queue_processing_duration_seconds',
  type: 'histogram',
  help: 'Queue message processing duration in seconds',
});

metricsRegistry.register({
  name: 'errors_total',
  type: 'counter',
  help: 'Total number of errors',
});

metricsRegistry.register({
  name: 'user_sessions_active',
  type: 'gauge',
  help: 'Number of active user sessions',
});

/**
 * Metrics Middleware
 */
export function metricsMiddleware(req: Request, res: Response, next: Function): void {
  const start = Date.now();

  // Track active connections
  metricsRegistry.incrementGauge('active_connections');

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;

    // Track request metrics
    metricsRegistry.incrementCounter('http_requests_total', 1, {
      method: req.method,
      route: req.route?.path || req.path,
      status: res.statusCode.toString(),
    });

    metricsRegistry.observeHistogram('http_request_duration_seconds', duration, {
      method: req.method,
      route: req.route?.path || req.path,
    });

    // Track response size
    const contentLength = parseInt(res.get('content-length') || '0', 10);
    if (contentLength > 0) {
      metricsRegistry.observeHistogram('http_response_size_bytes', contentLength);
    }

    // Track errors
    if (res.statusCode >= 400) {
      metricsRegistry.incrementCounter('errors_total', 1, {
        status: res.statusCode.toString(),
        route: req.route?.path || req.path,
      });
    }

    // Decrement active connections
    metricsRegistry.decrementGauge('active_connections');
  });

  next();
}

/**
 * Metrics endpoint handler
 */
export function metricsHandler(req: Request, res: Response): void {
  res.set('Content-Type', 'text/plain; version=0.0.4');
  res.send(metricsRegistry.export());
}

/**
 * Custom metrics helpers
 */
export const Metrics = {
  incrementCounter: (name: string, value?: number, labels?: Record<string, string>) => {
    metricsRegistry.incrementCounter(name, value, labels);
  },

  setGauge: (name: string, value: number, labels?: Record<string, string>) => {
    metricsRegistry.setGauge(name, value, labels);
  },

  observeHistogram: (name: string, value: number, labels?: Record<string, string>) => {
    metricsRegistry.observeHistogram(name, value, labels);
  },

  trackDatabaseQuery: async <T>(operation: () => Promise<T>): Promise<T> => {
    const start = Date.now();
    try {
      const result = await operation();
      const duration = (Date.now() - start) / 1000;

      metricsRegistry.incrementCounter('database_queries_total', 1, { status: 'success' });
      metricsRegistry.observeHistogram('database_query_duration_seconds', duration);

      return result;
    } catch (error) {
      metricsRegistry.incrementCounter('database_queries_total', 1, { status: 'error' });
      throw error;
    }
  },

  trackCacheAccess: (hit: boolean) => {
    if (hit) {
      metricsRegistry.incrementCounter('cache_hits_total');
    } else {
      metricsRegistry.incrementCounter('cache_misses_total');
    }
  },

  trackQueueMessage: async <T>(operation: () => Promise<T>): Promise<T> => {
    const start = Date.now();
    try {
      const result = await operation();
      const duration = (Date.now() - start) / 1000;

      metricsRegistry.incrementCounter('queue_messages_total', 1, { status: 'success' });
      metricsRegistry.observeHistogram('queue_processing_duration_seconds', duration);

      return result;
    } catch (error) {
      metricsRegistry.incrementCounter('queue_messages_total', 1, { status: 'error' });
      throw error;
    }
  },
};
