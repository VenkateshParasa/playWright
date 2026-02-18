/**
 * Monitoring Service
 *
 * Features:
 * - Health check endpoint
 * - Database connection monitoring
 * - External API availability checks
 * - Memory usage monitoring
 * - CPU usage monitoring
 * - Request rate monitoring
 * - Error rate monitoring
 * - Response time percentiles (p50, p95, p99)
 * - Alert thresholds
 */

import os from 'os';
import mongoose from 'mongoose';
import { getMetrics, getRequestStats } from '../utils/metricsCollector.js';
import { getErrorStats } from '../middleware/errorHandler.js';

// System status types
export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
}

export interface DetailedHealth extends SystemHealth {
  database: DatabaseHealth;
  memory: MemoryHealth;
  cpu: CPUHealth;
  requests: RequestHealth;
  errors: ErrorHealth;
  dependencies: DependencyHealth[];
}

export interface DatabaseHealth {
  status: 'connected' | 'disconnected' | 'error';
  responseTime?: number;
  connections?: number;
}

export interface MemoryHealth {
  used: number;
  total: number;
  percentage: number;
  heapUsed: number;
  heapTotal: number;
}

export interface CPUHealth {
  usage: number;
  loadAverage: number[];
  cores: number;
}

export interface RequestHealth {
  total: number;
  perMinute: number;
  averageResponseTime: number;
  p50: number;
  p95: number;
  p99: number;
}

export interface ErrorHealth {
  total: number;
  rate: number;
  recentErrors: Array<{
    type: string;
    count: number;
    lastOccurred: Date;
  }>;
}

export interface DependencyHealth {
  name: string;
  status: 'healthy' | 'unhealthy';
  responseTime?: number;
  error?: string;
}

// Application start time
const startTime = Date.now();

// Cache for health checks
let cachedHealth: DetailedHealth | null = null;
let lastHealthCheck = 0;
const HEALTH_CHECK_CACHE_TTL = 5000; // 5 seconds

/**
 * Get basic system health
 */
export async function getSystemHealth(): Promise<SystemHealth> {
  const uptime = Date.now() - startTime;
  const status = await determineSystemStatus();

  return {
    status,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(uptime / 1000), // Convert to seconds
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  };
}

/**
 * Get detailed system health
 */
export async function getDetailedHealth(): Promise<DetailedHealth> {
  // Return cached health if available and fresh
  const now = Date.now();
  if (cachedHealth && (now - lastHealthCheck) < HEALTH_CHECK_CACHE_TTL) {
    return cachedHealth;
  }

  const [
    systemHealth,
    databaseHealth,
    memoryHealth,
    cpuHealth,
    requestHealth,
    errorHealth,
    dependencyHealth,
  ] = await Promise.all([
    getSystemHealth(),
    checkDatabaseHealth(),
    checkMemoryHealth(),
    checkCPUHealth(),
    checkRequestHealth(),
    checkErrorHealth(),
    checkDependencies(),
  ]);

  const detailedHealth: DetailedHealth = {
    ...systemHealth,
    database: databaseHealth,
    memory: memoryHealth,
    cpu: cpuHealth,
    requests: requestHealth,
    errors: errorHealth,
    dependencies: dependencyHealth,
  };

  // Cache the result
  cachedHealth = detailedHealth;
  lastHealthCheck = now;

  return detailedHealth;
}

/**
 * Check database health
 */
async function checkDatabaseHealth(): Promise<DatabaseHealth> {
  try {
    const startTime = Date.now();

    // Check MongoDB connection
    if (mongoose.connection.readyState === 1) {
      // Ping database
      await mongoose.connection.db.admin().ping();
      const responseTime = Date.now() - startTime;

      return {
        status: 'connected',
        responseTime,
        connections: mongoose.connection.db.serverConfig?.connections?.length || 0,
      };
    } else {
      return {
        status: 'disconnected',
      };
    }
  } catch (error) {
    console.error('Database health check failed:', error);
    return {
      status: 'error',
    };
  }
}

/**
 * Check memory health
 */
function checkMemoryHealth(): MemoryHealth {
  const memoryUsage = process.memoryUsage();
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;

  return {
    used: usedMemory,
    total: totalMemory,
    percentage: (usedMemory / totalMemory) * 100,
    heapUsed: memoryUsage.heapUsed,
    heapTotal: memoryUsage.heapTotal,
  };
}

/**
 * Check CPU health
 */
function checkCPUHealth(): CPUHealth {
  const cpus = os.cpus();
  const loadAverage = os.loadavg();

  // Calculate CPU usage
  let totalIdle = 0;
  let totalTick = 0;

  cpus.forEach(cpu => {
    for (const type in cpu.times) {
      totalTick += cpu.times[type as keyof typeof cpu.times];
    }
    totalIdle += cpu.times.idle;
  });

  const usage = 100 - Math.floor((totalIdle / totalTick) * 100);

  return {
    usage,
    loadAverage,
    cores: cpus.length,
  };
}

/**
 * Check request health
 */
function checkRequestHealth(): RequestHealth {
  const metrics = getMetrics();
  const stats = getRequestStats();

  return {
    total: stats.totalRequests,
    perMinute: stats.requestsPerMinute,
    averageResponseTime: stats.averageResponseTime,
    p50: stats.p50,
    p95: stats.p95,
    p99: stats.p99,
  };
}

/**
 * Check error health
 */
function checkErrorHealth(): ErrorHealth {
  const errorStats = getErrorStats();
  const total = Array.from(errorStats.values()).reduce((sum, stat) => sum + stat.count, 0);
  const stats = getRequestStats();
  const errorRate = stats.totalRequests > 0 ? (total / stats.totalRequests) * 100 : 0;

  const recentErrors = Array.from(errorStats.entries())
    .map(([key, stat]) => ({
      type: key.split(':')[0],
      count: stat.count,
      lastOccurred: stat.lastOccurred,
    }))
    .sort((a, b) => b.lastOccurred.getTime() - a.lastOccurred.getTime())
    .slice(0, 10);

  return {
    total,
    rate: errorRate,
    recentErrors,
  };
}

/**
 * Check external dependencies
 */
async function checkDependencies(): Promise<DependencyHealth[]> {
  const dependencies: DependencyHealth[] = [];

  // Add checks for external services here
  // Example:
  // - Redis
  // - External APIs
  // - Message queues
  // etc.

  return dependencies;
}

/**
 * Determine overall system status
 */
async function determineSystemStatus(): Promise<'healthy' | 'degraded' | 'unhealthy'> {
  try {
    const [database, memory, cpu, errors] = await Promise.all([
      checkDatabaseHealth(),
      Promise.resolve(checkMemoryHealth()),
      Promise.resolve(checkCPUHealth()),
      Promise.resolve(checkErrorHealth()),
    ]);

    // Check critical conditions for unhealthy status
    if (database.status === 'error' || database.status === 'disconnected') {
      return 'unhealthy';
    }

    if (memory.percentage > 90) {
      return 'unhealthy';
    }

    // Check degraded conditions
    if (memory.percentage > 80 || cpu.usage > 80 || errors.rate > 5) {
      return 'degraded';
    }

    return 'healthy';
  } catch (error) {
    console.error('Failed to determine system status:', error);
    return 'unhealthy';
  }
}

/**
 * Check if system meets alert thresholds
 */
export async function checkAlertThresholds(): Promise<{
  alerts: Array<{
    severity: 'warning' | 'critical';
    message: string;
    value: number;
    threshold: number;
  }>;
}> {
  const alerts: Array<{
    severity: 'warning' | 'critical';
    message: string;
    value: number;
    threshold: number;
  }> = [];

  const health = await getDetailedHealth();

  // Memory alerts
  if (health.memory.percentage > 90) {
    alerts.push({
      severity: 'critical',
      message: 'Memory usage critical',
      value: health.memory.percentage,
      threshold: 90,
    });
  } else if (health.memory.percentage > 80) {
    alerts.push({
      severity: 'warning',
      message: 'Memory usage high',
      value: health.memory.percentage,
      threshold: 80,
    });
  }

  // CPU alerts
  if (health.cpu.usage > 90) {
    alerts.push({
      severity: 'critical',
      message: 'CPU usage critical',
      value: health.cpu.usage,
      threshold: 90,
    });
  } else if (health.cpu.usage > 80) {
    alerts.push({
      severity: 'warning',
      message: 'CPU usage high',
      value: health.cpu.usage,
      threshold: 80,
    });
  }

  // Error rate alerts
  if (health.errors.rate > 10) {
    alerts.push({
      severity: 'critical',
      message: 'Error rate critical',
      value: health.errors.rate,
      threshold: 10,
    });
  } else if (health.errors.rate > 5) {
    alerts.push({
      severity: 'warning',
      message: 'Error rate elevated',
      value: health.errors.rate,
      threshold: 5,
    });
  }

  // Response time alerts
  if (health.requests.p95 > 2000) {
    alerts.push({
      severity: 'critical',
      message: 'Response time p95 critical',
      value: health.requests.p95,
      threshold: 2000,
    });
  } else if (health.requests.p95 > 1000) {
    alerts.push({
      severity: 'warning',
      message: 'Response time p95 elevated',
      value: health.requests.p95,
      threshold: 1000,
    });
  }

  return { alerts };
}

export default {
  getSystemHealth,
  getDetailedHealth,
  checkAlertThresholds,
};
