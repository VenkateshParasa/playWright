/**
 * Backend Performance Optimization Utilities
 * Central export file for all backend optimization utilities
 */

// Cache utilities
export {
  CacheManager,
  cache,
  cacheMiddleware,
  userCacheMiddleware,
  invalidateCache,
  invalidateUserCache,
  Cacheable,
  LRUCache,
  QueryCache,
  etagCacheMiddleware
} from '../middleware/cache';

// Compression utilities
export {
  setupCompression,
  brotliCompression,
  smartCompression,
  compressContentType,
  compressJSON,
  compressHTML,
  compressText,
  dynamicCompression,
  servePrecompressed,
  CompressionStats,
  compressionMonitoring,
  getCompressionStats
} from '../middleware/compression';

// Database optimization utilities
export {
  connectDatabase,
  createIndexes,
  IndexStrategies,
  QueryOptimizer,
  PoolMonitor,
  QueryPerformanceTracker,
  healthCheck,
  optimizeCollection,
  getSlowQueries,
  defaultOptions
} from '../config/database';

/**
 * Quick start guide for backend optimization utilities
 *
 * @example Enable caching
 * ```typescript
 * import { cacheMiddleware } from './utils/optimization';
 *
 * // Cache GET requests for 10 minutes
 * app.get('/api/lessons', cacheMiddleware(600), getLessons);
 * ```
 *
 * @example Enable compression
 * ```typescript
 * import { setupCompression } from './utils/optimization';
 *
 * app.use(setupCompression());
 * ```
 *
 * @example Optimize database queries
 * ```typescript
 * import { QueryOptimizer, IndexStrategies } from './utils/optimization';
 *
 * // Use lean queries
 * const users = await User.find().lean();
 *
 * // Add indexes
 * userSchema.index({ email: 1 }, { unique: true });
 * ```
 *
 * @example Monitor query performance
 * ```typescript
 * import { QueryPerformanceTracker } from './utils/optimization';
 *
 * const tracker = new QueryPerformanceTracker();
 * const result = await tracker.track('getUser', () => User.findById(id));
 * ```
 */

// Performance recommendations
export const BACKEND_PERFORMANCE_BEST_PRACTICES = {
  // Cache durations
  cache: {
    shortLived: 5 * 60, // 5 minutes
    standard: 10 * 60, // 10 minutes
    medium: 30 * 60, // 30 minutes
    longLived: 60 * 60, // 1 hour
    static: 24 * 60 * 60 // 24 hours
  },

  // Database connection pooling
  database: {
    maxPoolSize: 10,
    minPoolSize: 5,
    maxIdleTimeMS: 60000,
    serverSelectionTimeoutMS: 5000
  },

  // Query optimization
  queries: {
    maxResults: 100,
    defaultPageSize: 20,
    maxPageSize: 100,
    leanByDefault: true,
    selectOnlyNeeded: true
  },

  // Compression
  compression: {
    threshold: 1024, // 1KB
    level: 6, // 0-9
    preferBrotli: true
  },

  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // requests per window
    standardHeaders: true
  },

  // Response times (ms)
  responseTime: {
    target: 100,
    warning: 200,
    critical: 500
  }
};

export default {
  cache,
  cacheMiddleware,
  setupCompression,
  connectDatabase,
  QueryOptimizer,
  IndexStrategies,
  BACKEND_PERFORMANCE_BEST_PRACTICES
};
