/**
 * Multi-Level Caching Configuration
 * Implements L1 (Memory), L2 (Redis), L3 (Database) caching strategy
 */

import Redis from 'ioredis';
import NodeCache from 'node-cache';

// Cache TTL configurations (in seconds)
export const CACHE_TTL = {
  SHORT: 60,           // 1 minute - frequently changing data
  MEDIUM: 300,         // 5 minutes - moderately changing data
  LONG: 3600,          // 1 hour - slowly changing data
  VERY_LONG: 86400,    // 24 hours - rarely changing data
  PERMANENT: 0         // No expiration
};

// L1 Cache - In-Memory (Node-Cache)
export class L1Cache {
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({
      stdTTL: CACHE_TTL.MEDIUM,
      checkperiod: 120,
      useClones: false, // For performance
      maxKeys: 10000    // Limit memory usage
    });
  }

  get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  set<T>(key: string, value: T, ttl?: number): boolean {
    return this.cache.set(key, value, ttl || CACHE_TTL.MEDIUM);
  }

  del(key: string | string[]): number {
    return this.cache.del(key);
  }

  flush(): void {
    this.cache.flushAll();
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  keys(): string[] {
    return this.cache.keys();
  }

  getStats() {
    return this.cache.getStats();
  }
}

// L2 Cache - Redis Cluster Configuration
export class RedisClusterCache {
  private client: Redis.Cluster;
  private readonly keyPrefix = 'psl:'; // Playwright Selenium Learning prefix

  constructor() {
    const nodes = process.env.REDIS_CLUSTER_NODES?.split(',').map(node => {
      const [host, port] = node.split(':');
      return { host, port: parseInt(port, 10) };
    }) || [
      { host: 'localhost', port: 6379 },
      { host: 'localhost', port: 6380 },
      { host: 'localhost', port: 6381 }
    ];

    this.client = new Redis.Cluster(nodes, {
      redisOptions: {
        password: process.env.REDIS_PASSWORD,
        tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
        connectTimeout: 10000,
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        enableOfflineQueue: true,
      },
      clusterRetryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      enableAutoPipelining: true,
      slotsRefreshTimeout: 10000,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.client.on('error', (err) => {
      console.error('Redis Cluster Error:', err);
    });

    this.client.on('connect', () => {
      console.log('Redis Cluster connected');
    });

    this.client.on('ready', () => {
      console.log('Redis Cluster ready');
    });

    this.client.on('reconnecting', () => {
      console.log('Redis Cluster reconnecting...');
    });
  }

  private prefixKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(this.prefixKey(key));
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await this.client.setex(this.prefixKey(key), ttl, serialized);
      } else {
        await this.client.set(this.prefixKey(key), serialized);
      }
      return true;
    } catch (error) {
      console.error('Redis SET error:', error);
      return false;
    }
  }

  async del(key: string | string[]): Promise<number> {
    try {
      const keys = Array.isArray(key) ? key.map(k => this.prefixKey(k)) : [this.prefixKey(key)];
      return await this.client.del(...keys);
    } catch (error) {
      console.error('Redis DEL error:', error);
      return 0;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(this.prefixKey(key));
      return result === 1;
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      return false;
    }
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      const result = await this.client.expire(this.prefixKey(key), seconds);
      return result === 1;
    } catch (error) {
      console.error('Redis EXPIRE error:', error);
      return false;
    }
  }

  async increment(key: string, amount: number = 1): Promise<number> {
    try {
      return await this.client.incrby(this.prefixKey(key), amount);
    } catch (error) {
      console.error('Redis INCR error:', error);
      return 0;
    }
  }

  async flush(pattern: string = '*'): Promise<void> {
    try {
      const keys = await this.client.keys(this.prefixKey(pattern));
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (error) {
      console.error('Redis FLUSH error:', error);
    }
  }

  // Cache warming
  async warmCache(data: { key: string; value: any; ttl?: number }[]): Promise<void> {
    const pipeline = this.client.pipeline();
    for (const item of data) {
      const serialized = JSON.stringify(item.value);
      if (item.ttl) {
        pipeline.setex(this.prefixKey(item.key), item.ttl, serialized);
      } else {
        pipeline.set(this.prefixKey(item.key), serialized);
      }
    }
    await pipeline.exec();
  }

  // Pub/Sub for cache invalidation
  async publish(channel: string, message: any): Promise<number> {
    return await this.client.publish(channel, JSON.stringify(message));
  }

  subscribe(channel: string, callback: (message: any) => void): void {
    const subscriber = this.client.duplicate();
    subscriber.subscribe(channel);
    subscriber.on('message', (ch, message) => {
      if (ch === channel) {
        callback(JSON.parse(message));
      }
    });
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
  }
}

// Multi-Level Cache Manager
export class CacheManager {
  private l1: L1Cache;
  private l2: RedisClusterCache;

  constructor() {
    this.l1 = new L1Cache();
    this.l2 = new RedisClusterCache();
  }

  async get<T>(key: string): Promise<T | null> {
    // Try L1 first
    const l1Value = this.l1.get<T>(key);
    if (l1Value !== undefined) {
      return l1Value;
    }

    // Try L2 if L1 miss
    const l2Value = await this.l2.get<T>(key);
    if (l2Value !== null) {
      // Populate L1 for next access
      this.l1.set(key, l2Value, CACHE_TTL.SHORT);
      return l2Value;
    }

    return null;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    // Set in both L1 and L2
    this.l1.set(key, value, ttl);
    await this.l2.set(key, value, ttl);
  }

  async invalidate(key: string | string[]): Promise<void> {
    const keys = Array.isArray(key) ? key : [key];

    // Invalidate L1
    this.l1.del(keys);

    // Invalidate L2
    await this.l2.del(keys);

    // Publish invalidation event for distributed cache
    await this.l2.publish('cache:invalidate', { keys, timestamp: Date.now() });
  }

  async warmCache(data: { key: string; value: any; ttl?: number }[]): Promise<void> {
    // Warm L2 (Redis) first
    await this.l2.warmCache(data);

    // Then warm L1 for immediate access
    for (const item of data) {
      this.l1.set(item.key, item.value, item.ttl);
    }
  }

  // Stale-while-revalidate pattern
  async getWithRevalidation<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    ttl: number = CACHE_TTL.MEDIUM
  ): Promise<T> {
    const cached = await this.get<T>(key);

    if (cached !== null) {
      // Return cached value and revalidate in background
      this.revalidateInBackground(key, fetchFunction, ttl);
      return cached;
    }

    // No cache, fetch fresh data
    const fresh = await fetchFunction();
    await this.set(key, fresh, ttl);
    return fresh;
  }

  private async revalidateInBackground<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    ttl: number
  ): Promise<void> {
    try {
      const fresh = await fetchFunction();
      await this.set(key, fresh, ttl);
    } catch (error) {
      console.error('Background revalidation error:', error);
    }
  }

  getStats() {
    return {
      l1: this.l1.getStats(),
      timestamp: new Date().toISOString()
    };
  }
}

// Singleton instance
export const cacheManager = new CacheManager();

// Cache key builders
export const CacheKeys = {
  user: (id: string) => `user:${id}`,
  userProgress: (userId: string) => `user:${userId}:progress`,
  course: (id: string) => `course:${id}`,
  lesson: (id: string) => `lesson:${id}`,
  quiz: (id: string) => `quiz:${id}`,
  leaderboard: (type: string) => `leaderboard:${type}`,
  achievements: (userId: string) => `achievements:${userId}`,
  analytics: (userId: string, period: string) => `analytics:${userId}:${period}`,
  apiResponse: (endpoint: string, params: string) => `api:${endpoint}:${params}`,
};

// Cache invalidation patterns
export const InvalidationPatterns = {
  userAll: (userId: string) => `user:${userId}:*`,
  courseAll: (courseId: string) => `course:${courseId}:*`,
  leaderboardAll: () => `leaderboard:*`,
};
