import { Request, Response, NextFunction } from 'express';
import NodeCache from 'node-cache';

/**
 * In-memory cache implementation using node-cache
 * For production, consider Redis for distributed caching
 */

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  checkPeriod?: number; // Automatic delete check interval
  useClones?: boolean; // Clone data on get/set
  maxKeys?: number; // Maximum number of keys
}

/**
 * Cache manager class
 */
export class CacheManager {
  private cache: NodeCache;

  constructor(options: CacheOptions = {}) {
    this.cache = new NodeCache({
      stdTTL: options.ttl || 600, // 10 minutes default
      checkperiod: options.checkPeriod || 120,
      useClones: options.useClones !== false,
      maxKeys: options.maxKeys || 1000
    });
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  /**
   * Set value in cache
   */
  set<T>(key: string, value: T, ttl?: number): boolean {
    return this.cache.set(key, value, ttl || 0);
  }

  /**
   * Delete key from cache
   */
  delete(key: string): number {
    return this.cache.del(key);
  }

  /**
   * Delete multiple keys
   */
  deleteMany(keys: string[]): number {
    return this.cache.del(keys);
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Clear entire cache
   */
  flush(): void {
    this.cache.flushAll();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return this.cache.getStats();
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return this.cache.keys();
  }

  /**
   * Get TTL for key
   */
  getTtl(key: string): number | undefined {
    return this.cache.getTtl(key);
  }
}

/**
 * Default cache instance
 */
export const cache = new CacheManager({
  ttl: 600,
  checkPeriod: 120,
  maxKeys: 1000
});

/**
 * Cache middleware for Express routes
 */
export function cacheMiddleware(duration: number = 600) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip cache for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key from URL and query params
    const key = `cache:${req.originalUrl || req.url}`;

    // Check cache
    const cachedResponse = cache.get<any>(key);

    if (cachedResponse) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cachedResponse);
    }

    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to cache response
    res.json = function (body: any) {
      cache.set(key, body, duration);
      res.setHeader('X-Cache', 'MISS');
      return originalJson(body);
    };

    next();
  };
}

/**
 * Cache with user-specific keys
 */
export function userCacheMiddleware(duration: number = 600) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') {
      return next();
    }

    const userId = (req as any).user?.id || 'anonymous';
    const key = `cache:user:${userId}:${req.originalUrl || req.url}`;

    const cachedResponse = cache.get<any>(key);

    if (cachedResponse) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cachedResponse);
    }

    const originalJson = res.json.bind(res);

    res.json = function (body: any) {
      cache.set(key, body, duration);
      res.setHeader('X-Cache', 'MISS');
      return originalJson(body);
    };

    next();
  };
}

/**
 * Invalidate cache by pattern
 */
export function invalidateCache(pattern: string): number {
  const keys = cache.keys();
  const matchingKeys = keys.filter((key) => key.includes(pattern));
  return cache.deleteMany(matchingKeys);
}

/**
 * Invalidate user-specific cache
 */
export function invalidateUserCache(userId: string): number {
  return invalidateCache(`cache:user:${userId}`);
}

/**
 * Cache decorator for methods
 */
export function Cacheable(ttl: number = 600) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `method:${propertyKey}:${JSON.stringify(args)}`;
      const cached = cache.get(cacheKey);

      if (cached !== undefined) {
        return cached;
      }

      const result = await originalMethod.apply(this, args);
      cache.set(cacheKey, result, ttl);

      return result;
    };

    return descriptor;
  };
}

/**
 * Memoization with LRU cache
 */
export class LRUCache<K, V> {
  private maxSize: number;
  private cache: Map<K, V>;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;

    // Move to end (most recently used)
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);

    return value;
  }

  set(key: K, value: V): void {
    // Delete if exists (to reorder)
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // Add to end
    this.cache.set(key, value);

    // Remove oldest if over max size
    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

/**
 * Query result cache for database queries
 */
export class QueryCache {
  private cache: LRUCache<string, any>;

  constructor(maxSize: number = 100) {
    this.cache = new LRUCache(maxSize);
  }

  /**
   * Get cached query result
   */
  get(query: any, params?: any): any | undefined {
    const key = this.generateKey(query, params);
    return this.cache.get(key);
  }

  /**
   * Cache query result
   */
  set(query: any, params: any, result: any): void {
    const key = this.generateKey(query, params);
    this.cache.set(key, result);
  }

  /**
   * Generate cache key from query and params
   */
  private generateKey(query: any, params?: any): string {
    return JSON.stringify({ query, params });
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear();
  }
}

/**
 * API response caching with ETag support
 */
export function etagCacheMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') {
      return next();
    }

    const originalJson = res.json.bind(res);

    res.json = function (body: any) {
      const etag = generateETag(body);
      res.setHeader('ETag', etag);

      // Check if client has cached version
      if (req.headers['if-none-match'] === etag) {
        return res.status(304).end();
      }

      return originalJson(body);
    };

    next();
  };
}

/**
 * Generate ETag from response body
 */
function generateETag(body: any): string {
  const crypto = require('crypto');
  const hash = crypto.createHash('md5');
  hash.update(JSON.stringify(body));
  return `"${hash.digest('hex')}"`;
}

export default cache;
