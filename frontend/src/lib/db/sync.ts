/**
 * IndexedDB Sync Manager
 * Handles offline synchronization, conflict resolution, and sync queue management
 */

import {
  openDatabase,
  type SyncQueue,
  type StoreName,
  STORE_NAMES,
  type Flashcard,
  type Lesson,
  type Progress,
  type Quiz,
  type QuizAttempt,
  type Exercise,
  type ExerciseSubmission,
} from './schema';
import { add, get, update, remove, getAll } from './operations';

// ============================================================================
// Types
// ============================================================================

export type SyncableEntity =
  | Flashcard
  | Lesson
  | Progress
  | Quiz
  | QuizAttempt
  | Exercise
  | ExerciseSubmission;

export type SyncStrategy = 'server-wins' | 'client-wins' | 'merge' | 'manual';

export interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  conflicts: number;
  errors: SyncError[];
}

export interface SyncError {
  entityId: string;
  storeName: string;
  operation: string;
  error: string;
  timestamp: Date;
}

export interface ConflictResolution {
  entityId: string;
  storeName: string;
  strategy: SyncStrategy;
  localVersion: SyncableEntity;
  serverVersion: SyncableEntity;
  resolved?: SyncableEntity;
}

// ============================================================================
// Sync Queue Operations
// ============================================================================

export class SyncQueueManager {
  /**
   * Add an operation to the sync queue
   */
  async enqueue(
    storeName: string,
    operation: 'create' | 'update' | 'delete',
    entityId: string,
    data: any
  ): Promise<string> {
    const queueItem: SyncQueue = {
      id: `${storeName}-${operation}-${entityId}-${Date.now()}`,
      storeName,
      operation,
      entityId,
      data,
      timestamp: new Date(),
      retryCount: 0,
      status: 'pending',
    };

    return await add(STORE_NAMES.SYNC_QUEUE, queueItem);
  }

  /**
   * Get all pending sync operations
   */
  async getPending(): Promise<SyncQueue[]> {
    const db = await openDatabase();
    return await db.getAllFromIndex(STORE_NAMES.SYNC_QUEUE, 'by-status', 'pending');
  }

  /**
   * Get failed sync operations
   */
  async getFailed(): Promise<SyncQueue[]> {
    const db = await openDatabase();
    return await db.getAllFromIndex(STORE_NAMES.SYNC_QUEUE, 'by-status', 'failed');
  }

  /**
   * Mark a sync operation as processing
   */
  async markAsProcessing(id: string): Promise<void> {
    const item = await get(STORE_NAMES.SYNC_QUEUE, id);
    if (item) {
      await update(STORE_NAMES.SYNC_QUEUE, { ...item, status: 'processing' });
    }
  }

  /**
   * Mark a sync operation as completed
   */
  async markAsCompleted(id: string): Promise<void> {
    const item = await get(STORE_NAMES.SYNC_QUEUE, id);
    if (item) {
      await update(STORE_NAMES.SYNC_QUEUE, { ...item, status: 'completed' });
    }
  }

  /**
   * Mark a sync operation as failed
   */
  async markAsFailed(id: string, error: string): Promise<void> {
    const item = await get(STORE_NAMES.SYNC_QUEUE, id);
    if (item) {
      await update(STORE_NAMES.SYNC_QUEUE, {
        ...item,
        status: 'failed',
        error,
        retryCount: item.retryCount + 1,
      });
    }
  }

  /**
   * Retry a failed sync operation
   */
  async retry(id: string): Promise<void> {
    const item = await get(STORE_NAMES.SYNC_QUEUE, id);
    if (item && item.status === 'failed') {
      await update(STORE_NAMES.SYNC_QUEUE, {
        ...item,
        status: 'pending',
        error: undefined,
      });
    }
  }

  /**
   * Retry all failed operations
   */
  async retryAll(): Promise<void> {
    const failed = await this.getFailed();
    for (const item of failed) {
      await this.retry(item.id);
    }
  }

  /**
   * Clear completed sync operations
   */
  async clearCompleted(): Promise<void> {
    const db = await openDatabase();
    const completed = await db.getAllFromIndex(STORE_NAMES.SYNC_QUEUE, 'by-status', 'completed');

    const tx = db.transaction(STORE_NAMES.SYNC_QUEUE, 'readwrite');
    await Promise.all([
      ...completed.map(item => tx.store.delete(item.id)),
      tx.done,
    ]);
  }

  /**
   * Clear old completed operations (older than specified days)
   */
  async clearOldCompleted(daysOld: number = 7): Promise<void> {
    const db = await openDatabase();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const completed = await db.getAllFromIndex(STORE_NAMES.SYNC_QUEUE, 'by-status', 'completed');
    const oldItems = completed.filter(item => item.timestamp < cutoffDate);

    const tx = db.transaction(STORE_NAMES.SYNC_QUEUE, 'readwrite');
    await Promise.all([
      ...oldItems.map(item => tx.store.delete(item.id)),
      tx.done,
    ]);
  }

  /**
   * Get sync queue statistics
   */
  async getStats(): Promise<{
    pending: number;
    processing: number;
    failed: number;
    completed: number;
    total: number;
  }> {
    const db = await openDatabase();

    const [pending, processing, failed, completed] = await Promise.all([
      db.getAllFromIndex(STORE_NAMES.SYNC_QUEUE, 'by-status', 'pending'),
      db.getAllFromIndex(STORE_NAMES.SYNC_QUEUE, 'by-status', 'processing'),
      db.getAllFromIndex(STORE_NAMES.SYNC_QUEUE, 'by-status', 'failed'),
      db.getAllFromIndex(STORE_NAMES.SYNC_QUEUE, 'by-status', 'completed'),
    ]);

    return {
      pending: pending.length,
      processing: processing.length,
      failed: failed.length,
      completed: completed.length,
      total: pending.length + processing.length + failed.length + completed.length,
    };
  }
}

// ============================================================================
// Conflict Resolution
// ============================================================================

export class ConflictResolver {
  /**
   * Resolve conflict using server-wins strategy
   */
  serverWins<T extends SyncableEntity>(local: T, server: T): T {
    return {
      ...server,
      syncStatus: 'synced',
      lastSyncedAt: new Date(),
    } as T;
  }

  /**
   * Resolve conflict using client-wins strategy
   */
  clientWins<T extends SyncableEntity>(local: T, server: T): T {
    return {
      ...local,
      version: (server as any).version || (local as any).version,
      syncStatus: 'synced',
      lastSyncedAt: new Date(),
    } as T;
  }

  /**
   * Resolve conflict using merge strategy (most recent wins per field)
   */
  merge<T extends SyncableEntity>(local: T, server: T): T {
    const localTime = (local as any).updatedAt?.getTime() || 0;
    const serverTime = (server as any).updatedAt?.getTime() || 0;

    // Use the most recently updated version as base
    const base = serverTime > localTime ? server : local;
    const other = serverTime > localTime ? local : server;

    // Merge specific fields that might have changed independently
    const merged = {
      ...base,
      // Preserve higher version number
      version: Math.max((local as any).version || 0, (server as any).version || 0) + 1,
      // Mark as synced
      syncStatus: 'synced' as const,
      lastSyncedAt: new Date(),
      updatedAt: new Date(),
    };

    return merged as T;
  }

  /**
   * Resolve conflict using intelligent merge for specific entity types
   */
  intelligentMerge<T extends SyncableEntity>(local: T, server: T, storeName: string): T {
    // Type-specific merge logic
    switch (storeName) {
      case STORE_NAMES.FLASHCARDS:
        return this.mergeFlashcard(local as Flashcard, server as Flashcard) as T;

      case STORE_NAMES.PROGRESS:
        return this.mergeProgress(local as Progress, server as Progress) as T;

      default:
        return this.merge(local, server);
    }
  }

  /**
   * Merge flashcard with SRS-specific logic
   */
  private mergeFlashcard(local: Flashcard, server: Flashcard): Flashcard {
    // For flashcards, prioritize SRS data from the version with more reviews
    const useLocalSRS = (local.repetitions || 0) >= (server.repetitions || 0);

    return {
      // Content: use most recent
      ...(server.updatedAt > local.updatedAt ? server : local),

      // SRS data: use version with more progress
      easinessFactor: useLocalSRS ? local.easinessFactor : server.easinessFactor,
      interval: useLocalSRS ? local.interval : server.interval,
      repetitions: useLocalSRS ? local.repetitions : server.repetitions,
      nextReviewDate: useLocalSRS ? local.nextReviewDate : server.nextReviewDate,
      lastReviewDate: useLocalSRS ? local.lastReviewDate : server.lastReviewDate,

      // Metadata
      version: Math.max(local.version, server.version) + 1,
      syncStatus: 'synced',
      lastSyncedAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Merge progress with cumulative data
   */
  private mergeProgress(local: Progress, server: Progress): Progress {
    return {
      ...server,

      // Use maximum values for cumulative fields
      progressPercentage: Math.max(local.progressPercentage, server.progressPercentage),
      timeSpent: Math.max(local.timeSpent || 0, server.timeSpent || 0),
      attempts: Math.max(local.attempts || 0, server.attempts || 0),
      bestScore: Math.max(local.bestScore || 0, server.bestScore || 0),
      totalReviews: Math.max(local.totalReviews || 0, server.totalReviews || 0),

      // Use most advanced status
      status: this.getMostAdvancedStatus(local.status, server.status),

      // Use most recent dates
      startedAt: this.getEarlierDate(local.startedAt, server.startedAt),
      completedAt: this.getLaterDate(local.completedAt, server.completedAt),
      lastAccessedAt: this.getLaterDate(local.lastAccessedAt, server.lastAccessedAt),

      // Metadata
      version: Math.max(local.version, server.version) + 1,
      syncStatus: 'synced',
      lastSyncedAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Get most advanced progress status
   */
  private getMostAdvancedStatus(
    status1: Progress['status'],
    status2: Progress['status']
  ): Progress['status'] {
    const order = ['not-started', 'in-progress', 'completed'];
    const index1 = order.indexOf(status1);
    const index2 = order.indexOf(status2);
    return order[Math.max(index1, index2)] as Progress['status'];
  }

  /**
   * Get earlier date
   */
  private getEarlierDate(date1?: Date, date2?: Date): Date | undefined {
    if (!date1) return date2;
    if (!date2) return date1;
    return date1 < date2 ? date1 : date2;
  }

  /**
   * Get later date
   */
  private getLaterDate(date1?: Date, date2?: Date): Date | undefined {
    if (!date1) return date2;
    if (!date2) return date1;
    return date1 > date2 ? date1 : date2;
  }

  /**
   * Detect if there's a conflict between local and server versions
   */
  hasConflict<T extends SyncableEntity>(local: T, server: T): boolean {
    const localVersion = (local as any).version || 0;
    const serverVersion = (server as any).version || 0;
    const localUpdated = (local as any).updatedAt?.getTime() || 0;
    const serverUpdated = (server as any).updatedAt?.getTime() || 0;
    const lastSynced = (local as any).lastSyncedAt?.getTime() || 0;

    // Conflict if both have been modified since last sync
    return (
      localVersion !== serverVersion &&
      localUpdated > lastSynced &&
      serverUpdated > lastSynced
    );
  }
}

// ============================================================================
// Sync Manager
// ============================================================================

export class SyncManager {
  private queueManager: SyncQueueManager;
  private conflictResolver: ConflictResolver;
  private syncInProgress = false;
  private defaultStrategy: SyncStrategy = 'merge';

  constructor() {
    this.queueManager = new SyncQueueManager();
    this.conflictResolver = new ConflictResolver();
  }

  /**
   * Set default conflict resolution strategy
   */
  setDefaultStrategy(strategy: SyncStrategy): void {
    this.defaultStrategy = strategy;
  }

  /**
   * Track a change for later synchronization
   */
  async trackChange(
    storeName: string,
    operation: 'create' | 'update' | 'delete',
    entityId: string,
    data: any
  ): Promise<void> {
    await this.queueManager.enqueue(storeName, operation, entityId, data);
  }

  /**
   * Synchronize all pending changes with server
   */
  async syncAll(
    apiClient: SyncApiClient,
    strategy: SyncStrategy = this.defaultStrategy
  ): Promise<SyncResult> {
    if (this.syncInProgress) {
      throw new Error('Sync already in progress');
    }

    this.syncInProgress = true;
    const result: SyncResult = {
      success: true,
      synced: 0,
      failed: 0,
      conflicts: 0,
      errors: [],
    };

    try {
      const pendingItems = await this.queueManager.getPending();

      for (const item of pendingItems) {
        try {
          await this.queueManager.markAsProcessing(item.id);
          await this.syncItem(item, apiClient, strategy);
          await this.queueManager.markAsCompleted(item.id);
          result.synced++;
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          await this.queueManager.markAsFailed(item.id, errorMsg);
          result.failed++;
          result.errors.push({
            entityId: item.entityId,
            storeName: item.storeName,
            operation: item.operation,
            error: errorMsg,
            timestamp: new Date(),
          });
        }
      }

      // Clean up old completed items
      await this.queueManager.clearOldCompleted(7);

      result.success = result.failed === 0;
    } finally {
      this.syncInProgress = false;
    }

    return result;
  }

  /**
   * Synchronize a single item
   */
  private async syncItem(
    item: SyncQueue,
    apiClient: SyncApiClient,
    strategy: SyncStrategy
  ): Promise<void> {
    const { storeName, operation, entityId, data } = item;

    switch (operation) {
      case 'create':
        await apiClient.create(storeName, data);
        break;

      case 'update': {
        const serverVersion = await apiClient.get(storeName, entityId);
        if (serverVersion && this.conflictResolver.hasConflict(data, serverVersion)) {
          // Handle conflict
          const resolved = await this.resolveConflict(data, serverVersion, storeName, strategy);
          await apiClient.update(storeName, resolved);
        } else {
          await apiClient.update(storeName, data);
        }
        break;
      }

      case 'delete':
        await apiClient.delete(storeName, entityId);
        break;
    }
  }

  /**
   * Resolve a conflict between local and server versions
   */
  private async resolveConflict(
    local: SyncableEntity,
    server: SyncableEntity,
    storeName: string,
    strategy: SyncStrategy
  ): Promise<SyncableEntity> {
    switch (strategy) {
      case 'server-wins':
        return this.conflictResolver.serverWins(local, server);

      case 'client-wins':
        return this.conflictResolver.clientWins(local, server);

      case 'merge':
        return this.conflictResolver.intelligentMerge(local, server, storeName);

      case 'manual':
        throw new Error('Manual conflict resolution required');

      default:
        return this.conflictResolver.merge(local, server);
    }
  }

  /**
   * Pull updates from server and merge with local data
   */
  async pullUpdates(
    apiClient: SyncApiClient,
    storeName: string,
    strategy: SyncStrategy = this.defaultStrategy
  ): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      synced: 0,
      failed: 0,
      conflicts: 0,
      errors: [],
    };

    try {
      const lastSyncTime = await this.getLastSyncTime(storeName);
      const updates = await apiClient.getUpdates(storeName, lastSyncTime);

      for (const serverEntity of updates) {
        try {
          const localEntity = await get(storeName as StoreName, (serverEntity as any).id);

          if (!localEntity) {
            // New entity from server
            await add(storeName as StoreName, {
              ...serverEntity,
              syncStatus: 'synced',
              lastSyncedAt: new Date(),
            });
            result.synced++;
          } else if (this.conflictResolver.hasConflict(localEntity as any, serverEntity)) {
            // Conflict detected
            const resolved = await this.resolveConflict(
              localEntity as any,
              serverEntity,
              storeName,
              strategy
            );
            await update(storeName as StoreName, resolved as any);
            result.conflicts++;
            result.synced++;
          } else {
            // No conflict, update with server version
            await update(storeName as StoreName, {
              ...serverEntity,
              syncStatus: 'synced',
              lastSyncedAt: new Date(),
            });
            result.synced++;
          }
        } catch (error) {
          result.failed++;
          result.errors.push({
            entityId: (serverEntity as any).id,
            storeName,
            operation: 'pull',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date(),
          });
        }
      }

      await this.updateLastSyncTime(storeName);
    } catch (error) {
      result.success = false;
      result.errors.push({
        entityId: 'N/A',
        storeName,
        operation: 'pull',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      });
    }

    return result;
  }

  /**
   * Get last sync time for a store
   */
  private async getLastSyncTime(storeName: string): Promise<Date> {
    // This would typically be stored in settings or metadata
    // For now, return epoch
    return new Date(0);
  }

  /**
   * Update last sync time for a store
   */
  private async updateLastSyncTime(storeName: string): Promise<void> {
    // This would typically be stored in settings or metadata
    // Implementation depends on your requirements
  }

  /**
   * Check if sync is currently in progress
   */
  isSyncing(): boolean {
    return this.syncInProgress;
  }

  /**
   * Get sync queue statistics
   */
  async getStats(): Promise<ReturnType<SyncQueueManager['getStats']>> {
    return await this.queueManager.getStats();
  }

  /**
   * Retry failed sync operations
   */
  async retryFailed(): Promise<void> {
    await this.queueManager.retryAll();
  }
}

// ============================================================================
// Sync API Client Interface
// ============================================================================

/**
 * Interface for API client that handles server communication
 * Implement this interface in your API layer
 */
export interface SyncApiClient {
  /**
   * Create entity on server
   */
  create(storeName: string, entity: any): Promise<void>;

  /**
   * Update entity on server
   */
  update(storeName: string, entity: any): Promise<void>;

  /**
   * Delete entity on server
   */
  delete(storeName: string, entityId: string): Promise<void>;

  /**
   * Get entity from server
   */
  get(storeName: string, entityId: string): Promise<any>;

  /**
   * Get updates since last sync
   */
  getUpdates(storeName: string, since: Date): Promise<any[]>;
}

// ============================================================================
// Export instances
// ============================================================================

export const syncManager = new SyncManager();
export const syncQueue = new SyncQueueManager();
export const conflictResolver = new ConflictResolver();
