/**
 * Distributed Tracing Service (Jaeger/Zipkin)
 * OpenTelemetry instrumentation for request tracing
 */

import { Request, Response, NextFunction } from 'express';

export interface Span {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  operationName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  tags: Record<string, any>;
  logs: Array<{ timestamp: number; fields: Record<string, any> }>;
  status?: 'ok' | 'error';
}

export interface Trace {
  traceId: string;
  spans: Span[];
  startTime: number;
  endTime?: number;
  duration?: number;
}

/**
 * Tracing Context
 */
export class TracingContext {
  private static contexts: Map<string, TracingContext> = new Map();

  public traceId: string;
  public spans: Map<string, Span> = new Map();

  constructor(traceId?: string) {
    this.traceId = traceId || this.generateId();
    TracingContext.contexts.set(this.traceId, this);
  }

  static get(traceId: string): TracingContext | undefined {
    return TracingContext.contexts.get(traceId);
  }

  static getOrCreate(traceId?: string): TracingContext {
    if (traceId) {
      const existing = TracingContext.contexts.get(traceId);
      if (existing) return existing;
    }
    return new TracingContext(traceId);
  }

  startSpan(operationName: string, parentSpanId?: string): Span {
    const span: Span = {
      traceId: this.traceId,
      spanId: this.generateId(),
      parentSpanId,
      operationName,
      startTime: Date.now(),
      tags: {},
      logs: [],
    };

    this.spans.set(span.spanId, span);
    return span;
  }

  finishSpan(spanId: string, status?: 'ok' | 'error'): void {
    const span = this.spans.get(spanId);
    if (span) {
      span.endTime = Date.now();
      span.duration = span.endTime - span.startTime;
      span.status = status || 'ok';
    }
  }

  setTag(spanId: string, key: string, value: any): void {
    const span = this.spans.get(spanId);
    if (span) {
      span.tags[key] = value;
    }
  }

  log(spanId: string, fields: Record<string, any>): void {
    const span = this.spans.get(spanId);
    if (span) {
      span.logs.push({
        timestamp: Date.now(),
        fields,
      });
    }
  }

  getTrace(): Trace {
    const spans = Array.from(this.spans.values());
    const startTime = Math.min(...spans.map(s => s.startTime));
    const endTimes = spans.filter(s => s.endTime).map(s => s.endTime!);
    const endTime = endTimes.length > 0 ? Math.max(...endTimes) : undefined;

    return {
      traceId: this.traceId,
      spans,
      startTime,
      endTime,
      duration: endTime ? endTime - startTime : undefined,
    };
  }

  private generateId(): string {
    return `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
  }

  cleanup(): void {
    TracingContext.contexts.delete(this.traceId);
    this.spans.clear();
  }
}

/**
 * Tracing Service
 */
export class TracingService {
  private traces: Map<string, Trace> = new Map();
  private readonly maxTraces = 1000;
  private exportEndpoint?: string;

  constructor(config?: { exportEndpoint?: string }) {
    this.exportEndpoint = config?.exportEndpoint || process.env.TRACING_ENDPOINT;
  }

  createTrace(traceId?: string): TracingContext {
    return TracingContext.getOrCreate(traceId);
  }

  getTrace(traceId: string): Trace | undefined {
    return this.traces.get(traceId);
  }

  async exportTrace(traceId: string): Promise<void> {
    const context = TracingContext.get(traceId);
    if (!context) return;

    const trace = context.getTrace();
    this.traces.set(traceId, trace);

    // Limit stored traces
    if (this.traces.size > this.maxTraces) {
      const oldestKey = this.traces.keys().next().value;
      this.traces.delete(oldestKey);
    }

    // Export to Jaeger/Zipkin if configured
    if (this.exportEndpoint) {
      await this.sendToCollector(trace);
    }

    // Cleanup context
    context.cleanup();
  }

  private async sendToCollector(trace: Trace): Promise<void> {
    try {
      await fetch(this.exportEndpoint!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.formatTraceForJaeger(trace)),
      });
    } catch (error) {
      console.error('Failed to export trace:', error);
    }
  }

  private formatTraceForJaeger(trace: Trace): any {
    return {
      data: [
        {
          traceID: trace.traceId,
          spans: trace.spans.map(span => ({
            traceID: span.traceId,
            spanID: span.spanId,
            parentSpanID: span.parentSpanId,
            operationName: span.operationName,
            startTime: span.startTime * 1000, // Convert to microseconds
            duration: span.duration ? span.duration * 1000 : 0,
            tags: Object.entries(span.tags).map(([key, value]) => ({
              key,
              type: typeof value,
              value: String(value),
            })),
            logs: span.logs.map(log => ({
              timestamp: log.timestamp * 1000,
              fields: Object.entries(log.fields).map(([key, value]) => ({
                key,
                type: typeof value,
                value: String(value),
              })),
            })),
          })),
        },
      ],
    };
  }

  getStats() {
    return {
      totalTraces: this.traces.size,
      traces: Array.from(this.traces.values()).map(trace => ({
        traceId: trace.traceId,
        spans: trace.spans.length,
        duration: trace.duration,
        startTime: new Date(trace.startTime).toISOString(),
      })),
    };
  }
}

// Singleton instance
export const tracingService = new TracingService();

/**
 * Tracing Middleware
 */
export function tracingMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Extract or create trace ID
  const traceId = req.headers['x-trace-id'] as string || undefined;
  const parentSpanId = req.headers['x-span-id'] as string || undefined;

  // Create tracing context
  const context = tracingService.createTrace(traceId);

  // Start root span for this request
  const span = context.startSpan(`${req.method} ${req.path}`, parentSpanId);

  // Add request tags
  context.setTag(span.spanId, 'http.method', req.method);
  context.setTag(span.spanId, 'http.url', req.url);
  context.setTag(span.spanId, 'http.path', req.path);
  context.setTag(span.spanId, 'http.host', req.hostname);
  context.setTag(span.spanId, 'http.user_agent', req.get('user-agent'));

  // Attach tracing context to request
  (req as any).tracingContext = context;
  (req as any).spanId = span.spanId;

  // Add trace headers to response
  res.setHeader('X-Trace-Id', context.traceId);
  res.setHeader('X-Span-Id', span.spanId);

  res.on('finish', async () => {
    // Add response tags
    context.setTag(span.spanId, 'http.status_code', res.statusCode);

    // Finish span
    context.finishSpan(span.spanId, res.statusCode >= 400 ? 'error' : 'ok');

    // Export trace
    await tracingService.exportTrace(context.traceId);
  });

  next();
}

/**
 * Tracing Helpers
 */
export const Tracing = {
  /**
   * Create a child span
   */
  startSpan(req: Request, operationName: string): string | null {
    const context = (req as any).tracingContext as TracingContext;
    const parentSpanId = (req as any).spanId as string;

    if (!context) return null;

    const span = context.startSpan(operationName, parentSpanId);
    return span.spanId;
  },

  /**
   * Finish a span
   */
  finishSpan(req: Request, spanId: string, status?: 'ok' | 'error'): void {
    const context = (req as any).tracingContext as TracingContext;
    if (context) {
      context.finishSpan(spanId, status);
    }
  },

  /**
   * Add tag to span
   */
  setTag(req: Request, spanId: string, key: string, value: any): void {
    const context = (req as any).tracingContext as TracingContext;
    if (context) {
      context.setTag(spanId, key, value);
    }
  },

  /**
   * Add log to span
   */
  log(req: Request, spanId: string, fields: Record<string, any>): void {
    const context = (req as any).tracingContext as TracingContext;
    if (context) {
      context.log(spanId, fields);
    }
  },

  /**
   * Trace an async operation
   */
  async trace<T>(
    req: Request,
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const spanId = Tracing.startSpan(req, operationName);
    if (!spanId) return operation();

    try {
      const result = await operation();
      Tracing.finishSpan(req, spanId, 'ok');
      return result;
    } catch (error) {
      Tracing.setTag(req, spanId, 'error', true);
      Tracing.log(req, spanId, {
        event: 'error',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      Tracing.finishSpan(req, spanId, 'error');
      throw error;
    }
  },
};

/**
 * Database query tracing decorator
 */
export function traced(operationName: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const req = args[0]; // Assume first arg is request

      if (req && (req as any).tracingContext) {
        return await Tracing.trace(req, `${operationName}.${propertyKey}`, () =>
          originalMethod.apply(this, args)
        );
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
