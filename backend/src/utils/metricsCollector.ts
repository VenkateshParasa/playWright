/**
 * Metrics Collector Utility
 *
 * Features:
 * - Collect application metrics
 * - Request count by endpoint
 * - Response time by endpoint
 * - Error count by type
 * - Database query performance
 * - Cache hit/miss rates
 * - User activity metrics
 * - Export to Prometheus format (optional)
 */

// Metrics storage
interface EndpointMetrics {
  count: number;
  responseTimes: number[];
  errors: number;
  lastAccessed: Date;
}

interface MetricsData {
  endpoints: Map<string, EndpointMetrics>;
  errors: Map<string, number>;
  requestCount: number;
  errorCount: number;
  startTime: number;
}

const metrics: MetricsData = {
  endpoints: new Map(),
  errors: new Map(),
  requestCount: 0,
  errorCount: 0,
  startTime: Date.now(),
};

/**
 * Record a request
 */
export function recordRequest(endpoint: string, responseTime: number, statusCode: number): void {
  metrics.requestCount++;

  const key = `${endpoint}`;
  const endpointMetrics = metrics.endpoints.get(key) || {
    count: 0,
    responseTimes: [],
    errors: 0,
    lastAccessed: new Date(),
  };

  endpointMetrics.count++;
  endpointMetrics.responseTimes.push(responseTime);
  endpointMetrics.lastAccessed = new Date();

  if (statusCode >= 400) {
    endpointMetrics.errors++;
    metrics.errorCount++;
  }

  // Keep only last 1000 response times to prevent memory issues
  if (endpointMetrics.responseTimes.length > 1000) {
    endpointMetrics.responseTimes = endpointMetrics.responseTimes.slice(-1000);
  }

  metrics.endpoints.set(key, endpointMetrics);
}

/**
 * Increment error count
 */
export function incrementErrorCount(errorType: string, statusCode: number): void {
  const key = `${errorType}:${statusCode}`;
  const count = metrics.errors.get(key) || 0;
  metrics.errors.set(key, count + 1);
}

/**
 * Get all metrics
 */
export function getMetrics(): MetricsData {
  return {
    ...metrics,
    endpoints: new Map(metrics.endpoints),
    errors: new Map(metrics.errors),
  };
}

/**
 * Get request statistics
 */
export function getRequestStats(): {
  totalRequests: number;
  requestsPerMinute: number;
  averageResponseTime: number;
  p50: number;
  p95: number;
  p99: number;
} {
  const uptime = (Date.now() - metrics.startTime) / 1000 / 60; // minutes
  const requestsPerMinute = metrics.requestCount / uptime;

  // Collect all response times
  const allResponseTimes: number[] = [];
  metrics.endpoints.forEach(endpoint => {
    allResponseTimes.push(...endpoint.responseTimes);
  });

  // Sort for percentile calculation
  allResponseTimes.sort((a, b) => a - b);

  const averageResponseTime =
    allResponseTimes.length > 0
      ? allResponseTimes.reduce((sum, time) => sum + time, 0) / allResponseTimes.length
      : 0;

  const p50 = calculatePercentile(allResponseTimes, 50);
  const p95 = calculatePercentile(allResponseTimes, 95);
  const p99 = calculatePercentile(allResponseTimes, 99);

  return {
    totalRequests: metrics.requestCount,
    requestsPerMinute,
    averageResponseTime,
    p50,
    p95,
    p99,
  };
}

/**
 * Get endpoint statistics
 */
export function getEndpointStats(): Array<{
  endpoint: string;
  count: number;
  averageResponseTime: number;
  errorRate: number;
  lastAccessed: Date;
}> {
  const stats: Array<{
    endpoint: string;
    count: number;
    averageResponseTime: number;
    errorRate: number;
    lastAccessed: Date;
  }> = [];

  metrics.endpoints.forEach((data, endpoint) => {
    const averageResponseTime =
      data.responseTimes.reduce((sum, time) => sum + time, 0) / data.responseTimes.length;
    const errorRate = (data.errors / data.count) * 100;

    stats.push({
      endpoint,
      count: data.count,
      averageResponseTime,
      errorRate,
      lastAccessed: data.lastAccessed,
    });
  });

  return stats.sort((a, b) => b.count - a.count);
}

/**
 * Calculate percentile
 */
function calculatePercentile(sortedArray: number[], percentile: number): number {
  if (sortedArray.length === 0) return 0;

  const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
  return sortedArray[Math.max(0, index)];
}

/**
 * Reset metrics
 */
export function resetMetrics(): void {
  metrics.endpoints.clear();
  metrics.errors.clear();
  metrics.requestCount = 0;
  metrics.errorCount = 0;
  metrics.startTime = Date.now();
}

/**
 * Export metrics in Prometheus format
 */
export function exportPrometheusMetrics(): string {
  const lines: string[] = [];

  // Request count
  lines.push('# HELP http_requests_total Total number of HTTP requests');
  lines.push('# TYPE http_requests_total counter');
  lines.push(`http_requests_total ${metrics.requestCount}`);

  // Error count
  lines.push('# HELP http_errors_total Total number of HTTP errors');
  lines.push('# TYPE http_errors_total counter');
  lines.push(`http_errors_total ${metrics.errorCount}`);

  // Requests by endpoint
  lines.push('# HELP http_requests_by_endpoint_total Total requests by endpoint');
  lines.push('# TYPE http_requests_by_endpoint_total counter');
  metrics.endpoints.forEach((data, endpoint) => {
    lines.push(`http_requests_by_endpoint_total{endpoint="${endpoint}"} ${data.count}`);
  });

  // Response time statistics
  const stats = getRequestStats();
  lines.push('# HELP http_response_time_ms Response time percentiles in milliseconds');
  lines.push('# TYPE http_response_time_ms gauge');
  lines.push(`http_response_time_ms{percentile="50"} ${stats.p50}`);
  lines.push(`http_response_time_ms{percentile="95"} ${stats.p95}`);
  lines.push(`http_response_time_ms{percentile="99"} ${stats.p99}`);

  return lines.join('\n');
}

export default {
  recordRequest,
  incrementErrorCount,
  getMetrics,
  getRequestStats,
  getEndpointStats,
  resetMetrics,
  exportPrometheusMetrics,
};
