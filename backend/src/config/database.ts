import mongoose from 'mongoose';

/**
 * Optimized database configuration for MongoDB
 * Includes connection pooling, indexing strategies, and query optimization
 */

interface DatabaseConfig {
  uri: string;
  options?: mongoose.ConnectOptions;
  poolSize?: number;
  maxPoolSize?: number;
  minPoolSize?: number;
}

/**
 * Default connection options with optimizations
 */
export const defaultOptions: mongoose.ConnectOptions = {
  // Connection pooling
  maxPoolSize: 10, // Maximum connections in pool
  minPoolSize: 5, // Minimum connections in pool

  // Timeouts
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,

  // Monitoring
  heartbeatFrequencyMS: 10000,

  // Performance
  maxIdleTimeMS: 60000, // Close idle connections after 60s

  // Compression
  compressors: ['zlib'],
  zlibCompressionLevel: 6,

  // Read/Write concerns
  retryWrites: true,
  retryReads: true,
  w: 'majority',

  // Auto-indexing (disable in production)
  autoIndex: process.env.NODE_ENV !== 'production',
};

/**
 * Connect to MongoDB with optimized settings
 */
export async function connectDatabase(config: DatabaseConfig): Promise<void> {
  const { uri, options = {} } = config;

  try {
    const mergedOptions = {
      ...defaultOptions,
      ...options
    };

    await mongoose.connect(uri, mergedOptions);

    console.log('✅ Connected to MongoDB');

    // Connection event handlers
    mongoose.connection.on('connected', () => {
      console.log('MongoDB connection established');
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

    // Enable query logging in development
    if (process.env.NODE_ENV === 'development') {
      mongoose.set('debug', true);
    }

  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

/**
 * Create optimized indexes for a model
 */
export async function createIndexes(modelName: string): Promise<void> {
  try {
    const model = mongoose.model(modelName);
    await model.createIndexes();
    console.log(`✅ Indexes created for ${modelName}`);
  } catch (error) {
    console.error(`❌ Failed to create indexes for ${modelName}:`, error);
  }
}

/**
 * Common indexing strategies
 */
export const IndexStrategies = {
  /**
   * Single field index
   */
  singleField: (field: string) => ({
    [field]: 1
  }),

  /**
   * Compound index
   */
  compound: (...fields: string[]) => {
    return fields.reduce((acc, field) => {
      acc[field] = 1;
      return acc;
    }, {} as Record<string, number>);
  },

  /**
   * Text search index
   */
  textSearch: (...fields: string[]) => {
    return fields.reduce((acc, field) => {
      acc[field] = 'text';
      return acc;
    }, {} as Record<string, string>);
  },

  /**
   * Unique index
   */
  unique: (field: string) => ({
    index: { [field]: 1 },
    unique: true
  }),

  /**
   * TTL index (for auto-deletion)
   */
  ttl: (field: string, seconds: number) => ({
    index: { [field]: 1 },
    expireAfterSeconds: seconds
  }),

  /**
   * Geospatial index
   */
  geo2d: (field: string) => ({
    [field]: '2d'
  }),

  geo2dsphere: (field: string) => ({
    [field]: '2dsphere'
  }),

  /**
   * Sparse index (only index documents with the field)
   */
  sparse: (field: string) => ({
    index: { [field]: 1 },
    sparse: true
  }),

  /**
   * Partial index (with filter)
   */
  partial: (field: string, filter: Record<string, any>) => ({
    index: { [field]: 1 },
    partialFilterExpression: filter
  })
};

/**
 * Query optimization utilities
 */
export class QueryOptimizer {
  /**
   * Explain query execution
   */
  static async explain(query: mongoose.Query<any, any>) {
    return await query.explain('executionStats');
  }

  /**
   * Add lean() to queries that don't need Mongoose documents
   */
  static lean<T>(query: mongoose.Query<T, any>): mongoose.Query<T, any> {
    return query.lean();
  }

  /**
   * Select only needed fields
   */
  static select<T>(
    query: mongoose.Query<T, any>,
    fields: string[]
  ): mongoose.Query<T, any> {
    return query.select(fields.join(' '));
  }

  /**
   * Add pagination
   */
  static paginate<T>(
    query: mongoose.Query<T[], any>,
    page: number = 1,
    limit: number = 10
  ): mongoose.Query<T[], any> {
    const skip = (page - 1) * limit;
    return query.skip(skip).limit(limit);
  }

  /**
   * Batch operations
   */
  static async bulkWrite(model: mongoose.Model<any>, operations: any[]) {
    return await model.bulkWrite(operations, { ordered: false });
  }

  /**
   * Aggregation with index hints
   */
  static aggregateWithHint(
    model: mongoose.Model<any>,
    pipeline: any[],
    hint: Record<string, number>
  ) {
    return model.aggregate(pipeline).hint(hint);
  }
}

/**
 * Connection pool monitoring
 */
export class PoolMonitor {
  /**
   * Get connection pool stats
   */
  static getStats() {
    const connection = mongoose.connection;

    return {
      readyState: connection.readyState,
      host: connection.host,
      port: connection.port,
      name: connection.name,
      collections: Object.keys(connection.collections).length
    };
  }

  /**
   * Monitor pool events
   */
  static monitor() {
    const connection = mongoose.connection;

    connection.on('open', () => {
      console.log('Connection pool opened');
    });

    connection.on('close', () => {
      console.log('Connection pool closed');
    });

    connection.on('error', (err) => {
      console.error('Connection pool error:', err);
    });
  }
}

/**
 * Query performance tracking
 */
export class QueryPerformanceTracker {
  private queries: Map<string, { count: number; totalTime: number }> = new Map();

  /**
   * Track query execution
   */
  async track<T>(
    name: string,
    queryFn: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();

    try {
      const result = await queryFn();
      const duration = Date.now() - startTime;

      this.recordQuery(name, duration);

      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Record query execution
   */
  private recordQuery(name: string, duration: number) {
    const existing = this.queries.get(name) || { count: 0, totalTime: 0 };

    this.queries.set(name, {
      count: existing.count + 1,
      totalTime: existing.totalTime + duration
    });
  }

  /**
   * Get query statistics
   */
  getStats() {
    const stats: any[] = [];

    this.queries.forEach((value, key) => {
      stats.push({
        query: key,
        count: value.count,
        totalTime: value.totalTime,
        averageTime: value.totalTime / value.count
      });
    });

    return stats.sort((a, b) => b.totalTime - a.totalTime);
  }

  /**
   * Reset statistics
   */
  reset() {
    this.queries.clear();
  }
}

/**
 * Database health check
 */
export async function healthCheck(): Promise<{
  healthy: boolean;
  message: string;
  stats?: any;
}> {
  try {
    const state = mongoose.connection.readyState;

    if (state !== 1) {
      return {
        healthy: false,
        message: 'Database not connected'
      };
    }

    // Ping database
    await mongoose.connection.db.admin().ping();

    return {
      healthy: true,
      message: 'Database healthy',
      stats: PoolMonitor.getStats()
    };
  } catch (error) {
    return {
      healthy: false,
      message: `Database health check failed: ${error}`
    };
  }
}

/**
 * Optimize collection
 */
export async function optimizeCollection(collectionName: string): Promise<void> {
  try {
    const collection = mongoose.connection.collection(collectionName);

    // Rebuild indexes
    await collection.reIndex();

    console.log(`✅ Optimized collection: ${collectionName}`);
  } catch (error) {
    console.error(`❌ Failed to optimize collection ${collectionName}:`, error);
  }
}

/**
 * Get slow queries (requires MongoDB profiling to be enabled)
 */
export async function getSlowQueries(minDuration: number = 100): Promise<any[]> {
  try {
    const db = mongoose.connection.db;
    const profileCollection = db.collection('system.profile');

    return await profileCollection
      .find({ millis: { $gte: minDuration } })
      .sort({ millis: -1 })
      .limit(10)
      .toArray();
  } catch (error) {
    console.error('Failed to get slow queries:', error);
    return [];
  }
}

export default {
  connectDatabase,
  createIndexes,
  IndexStrategies,
  QueryOptimizer,
  PoolMonitor,
  QueryPerformanceTracker,
  healthCheck,
  optimizeCollection,
  getSlowQueries
};
