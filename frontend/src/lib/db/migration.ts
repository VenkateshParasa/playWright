/**
 * Database Migration Manager
 * Handles schema version upgrades, data migrations, and rollback capabilities
 */

import {
  openDB,
  type IDBPDatabase,
  type DBSchema,
} from 'idb';
import {
  DB_NAME,
  DB_VERSION,
  type PlaywrightLearningDB,
  type StoreName,
  STORE_NAMES,
  closeDatabase,
  openDatabase,
} from './schema';
import { getAll, put, remove } from './operations';

// ============================================================================
// Migration Types
// ============================================================================

export interface Migration {
  version: number;
  name: string;
  description: string;
  up: (db: IDBPDatabase<PlaywrightLearningDB>) => Promise<void>;
  down?: (db: IDBPDatabase<PlaywrightLearningDB>) => Promise<void>;
}

export interface MigrationResult {
  success: boolean;
  version: number;
  migrationsApplied: string[];
  errors: string[];
  duration: number;
}

export interface BackupMetadata {
  version: number;
  timestamp: Date;
  size: number;
  stores: string[];
}

// ============================================================================
// Migration Registry
// ============================================================================

/**
 * All database migrations in order
 * Each migration should have both up and down functions for rollback capability
 */
export const migrations: Migration[] = [
  // Version 1: Initial schema (already applied in schema.ts)
  {
    version: 1,
    name: 'initial_schema',
    description: 'Create initial database schema with all object stores',
    up: async (db) => {
      // Already handled in schema.ts upgrade function
      console.log('Version 1: Initial schema already applied');
    },
    down: async (db) => {
      // Cannot rollback from version 1
      throw new Error('Cannot rollback from initial version');
    },
  },

  // Example: Version 2 migration (for future use)
  // {
  //   version: 2,
  //   name: 'add_flashcard_statistics',
  //   description: 'Add statistics fields to flashcards',
  //   up: async (db) => {
  //     const tx = db.transaction(STORE_NAMES.FLASHCARDS, 'readwrite');
  //     const store = tx.objectStore(STORE_NAMES.FLASHCARDS);
  //     const allCards = await store.getAll();
  //
  //     for (const card of allCards) {
  //       await store.put({
  //         ...card,
  //         statistics: {
  //           totalReviews: 0,
  //           correctReviews: 0,
  //           averageResponseTime: 0,
  //         },
  //       });
  //     }
  //
  //     await tx.done;
  //   },
  //   down: async (db) => {
  //     const tx = db.transaction(STORE_NAMES.FLASHCARDS, 'readwrite');
  //     const store = tx.objectStore(STORE_NAMES.FLASHCARDS);
  //     const allCards = await store.getAll();
  //
  //     for (const card of allCards) {
  //       const { statistics, ...rest } = card as any;
  //       await store.put(rest);
  //     }
  //
  //     await tx.done;
  //   },
  // },
];

// ============================================================================
// Migration Manager
// ============================================================================

export class MigrationManager {
  private backupKey = 'db_backup_metadata';

  /**
   * Get current database version
   */
  async getCurrentVersion(): Promise<number> {
    try {
      const db = await openDatabase();
      return db.version;
    } catch (error) {
      console.error('Failed to get database version:', error);
      return 0;
    }
  }

  /**
   * Check if migrations are needed
   */
  async needsMigration(): Promise<boolean> {
    const currentVersion = await this.getCurrentVersion();
    return currentVersion < DB_VERSION;
  }

  /**
   * Get pending migrations
   */
  async getPendingMigrations(): Promise<Migration[]> {
    const currentVersion = await this.getCurrentVersion();
    return migrations.filter(m => m.version > currentVersion && m.version <= DB_VERSION);
  }

  /**
   * Run all pending migrations
   */
  async migrate(): Promise<MigrationResult> {
    const startTime = Date.now();
    const result: MigrationResult = {
      success: false,
      version: 0,
      migrationsApplied: [],
      errors: [],
      duration: 0,
    };

    try {
      const pending = await this.getPendingMigrations();

      if (pending.length === 0) {
        result.success = true;
        result.version = await this.getCurrentVersion();
        result.duration = Date.now() - startTime;
        return result;
      }

      console.log(`Running ${pending.length} pending migrations...`);

      // Create backup before migration
      await this.createBackup();

      // Run each migration
      for (const migration of pending) {
        try {
          console.log(`Running migration: ${migration.name} (v${migration.version})`);
          const db = await openDatabase();
          await migration.up(db);
          result.migrationsApplied.push(migration.name);
          console.log(`✓ Migration ${migration.name} completed`);
        } catch (error) {
          const errorMsg = `Failed to run migration ${migration.name}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`;
          console.error(errorMsg);
          result.errors.push(errorMsg);
          throw error; // Stop on first error
        }
      }

      result.success = true;
      result.version = await this.getCurrentVersion();
    } catch (error) {
      result.success = false;
      result.errors.push(
        error instanceof Error ? error.message : 'Unknown migration error'
      );

      // Attempt to restore from backup
      console.log('Migration failed, attempting to restore from backup...');
      try {
        await this.restoreFromBackup();
        console.log('✓ Backup restored successfully');
      } catch (restoreError) {
        console.error('Failed to restore backup:', restoreError);
        result.errors.push('Failed to restore backup after migration error');
      }
    } finally {
      result.duration = Date.now() - startTime;
    }

    return result;
  }

  /**
   * Rollback to a specific version
   */
  async rollback(targetVersion: number): Promise<MigrationResult> {
    const startTime = Date.now();
    const result: MigrationResult = {
      success: false,
      version: 0,
      migrationsApplied: [],
      errors: [],
      duration: 0,
    };

    try {
      const currentVersion = await this.getCurrentVersion();

      if (targetVersion >= currentVersion) {
        throw new Error('Target version must be less than current version');
      }

      // Get migrations to rollback (in reverse order)
      const toRollback = migrations
        .filter(m => m.version > targetVersion && m.version <= currentVersion)
        .reverse();

      if (toRollback.length === 0) {
        result.success = true;
        result.version = currentVersion;
        result.duration = Date.now() - startTime;
        return result;
      }

      console.log(`Rolling back ${toRollback.length} migrations...`);

      // Create backup before rollback
      await this.createBackup();

      // Run each rollback
      for (const migration of toRollback) {
        if (!migration.down) {
          throw new Error(`Migration ${migration.name} does not support rollback`);
        }

        try {
          console.log(`Rolling back: ${migration.name} (v${migration.version})`);
          const db = await openDatabase();
          await migration.down(db);
          result.migrationsApplied.push(`rollback:${migration.name}`);
          console.log(`✓ Rollback ${migration.name} completed`);
        } catch (error) {
          const errorMsg = `Failed to rollback migration ${migration.name}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`;
          console.error(errorMsg);
          result.errors.push(errorMsg);
          throw error;
        }
      }

      result.success = true;
      result.version = targetVersion;
    } catch (error) {
      result.success = false;
      result.errors.push(
        error instanceof Error ? error.message : 'Unknown rollback error'
      );
    } finally {
      result.duration = Date.now() - startTime;
    }

    return result;
  }

  /**
   * Create a backup of the entire database
   */
  async createBackup(): Promise<BackupMetadata> {
    try {
      const db = await openDatabase();
      const backup: any = {};
      const stores: string[] = [];
      let totalSize = 0;

      // Backup each store
      for (const storeName of db.objectStoreNames) {
        const data = await getAll(storeName as StoreName);
        backup[storeName] = data;
        stores.push(storeName);
        totalSize += JSON.stringify(data).length;
      }

      const metadata: BackupMetadata = {
        version: db.version,
        timestamp: new Date(),
        size: totalSize,
        stores,
      };

      // Store backup in localStorage (for small databases)
      // For larger databases, consider IndexedDB backup or file export
      localStorage.setItem(this.backupKey, JSON.stringify(metadata));
      localStorage.setItem(`${this.backupKey}_data`, JSON.stringify(backup));

      console.log(`✓ Backup created: ${(totalSize / 1024).toFixed(2)} KB`);
      return metadata;
    } catch (error) {
      console.error('Failed to create backup:', error);
      throw error;
    }
  }

  /**
   * Restore database from backup
   */
  async restoreFromBackup(): Promise<void> {
    try {
      const metadataStr = localStorage.getItem(this.backupKey);
      const dataStr = localStorage.getItem(`${this.backupKey}_data`);

      if (!metadataStr || !dataStr) {
        throw new Error('No backup found');
      }

      const metadata: BackupMetadata = JSON.parse(metadataStr);
      const backup = JSON.parse(dataStr);

      console.log(`Restoring backup from ${metadata.timestamp}...`);

      // Close existing connection
      closeDatabase();

      // Delete and recreate database
      await new Promise<void>((resolve, reject) => {
        const request = indexedDB.deleteDatabase(DB_NAME);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      // Reopen database (will recreate schema)
      const db = await openDatabase();

      // Restore each store
      for (const storeName of metadata.stores) {
        const data = backup[storeName] || [];
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);

        for (const item of data) {
          await store.put(item);
        }

        await tx.done;
      }

      console.log('✓ Backup restored successfully');
    } catch (error) {
      console.error('Failed to restore backup:', error);
      throw error;
    }
  }

  /**
   * Get backup metadata
   */
  getBackupMetadata(): BackupMetadata | null {
    try {
      const metadataStr = localStorage.getItem(this.backupKey);
      if (!metadataStr) return null;

      const metadata = JSON.parse(metadataStr);
      // Parse date string back to Date object
      metadata.timestamp = new Date(metadata.timestamp);
      return metadata;
    } catch (error) {
      console.error('Failed to get backup metadata:', error);
      return null;
    }
  }

  /**
   * Delete backup
   */
  deleteBackup(): void {
    localStorage.removeItem(this.backupKey);
    localStorage.removeItem(`${this.backupKey}_data`);
    console.log('✓ Backup deleted');
  }

  /**
   * Verify database integrity
   */
  async verifyIntegrity(): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const result = {
      valid: true,
      errors: [] as string[],
      warnings: [] as string[],
    };

    try {
      const db = await openDatabase();

      // Check if all expected stores exist
      const expectedStores = Object.values(STORE_NAMES);
      for (const storeName of expectedStores) {
        if (!db.objectStoreNames.contains(storeName)) {
          result.valid = false;
          result.errors.push(`Missing object store: ${storeName}`);
        }
      }

      // Check for orphaned data
      // (e.g., progress entries for non-existent lessons)
      // This would require more complex validation logic

      // Check sync status consistency
      const syncableStores = [
        STORE_NAMES.FLASHCARDS,
        STORE_NAMES.LESSONS,
        STORE_NAMES.PROGRESS,
      ];

      for (const storeName of syncableStores) {
        const items = await getAll(storeName as StoreName);
        const pendingCount = items.filter((item: any) => item.syncStatus === 'pending').length;
        const conflictCount = items.filter((item: any) => item.syncStatus === 'conflict').length;

        if (conflictCount > 0) {
          result.warnings.push(
            `${storeName} has ${conflictCount} items with sync conflicts`
          );
        }

        if (pendingCount > 100) {
          result.warnings.push(
            `${storeName} has ${pendingCount} pending sync items (consider syncing)`
          );
        }
      }
    } catch (error) {
      result.valid = false;
      result.errors.push(
        `Integrity check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    return result;
  }

  /**
   * Get migration history
   */
  getMigrationHistory(): Migration[] {
    return migrations;
  }

  /**
   * Check if a specific migration has been applied
   */
  async isMigrationApplied(version: number): Promise<boolean> {
    const currentVersion = await this.getCurrentVersion();
    return version <= currentVersion;
  }
}

// ============================================================================
// Data Migration Utilities
// ============================================================================

/**
 * Utility class for common data migration operations
 */
export class DataMigrationUtils {
  /**
   * Add a new field to all items in a store with a default value
   */
  static async addField<S extends StoreName>(
    storeName: S,
    fieldName: string,
    defaultValue: any
  ): Promise<void> {
    const db = await openDatabase();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const allItems = await store.getAll();

    for (const item of allItems) {
      if (!(fieldName in item)) {
        await store.put({
          ...item,
          [fieldName]: defaultValue,
        });
      }
    }

    await tx.done;
  }

  /**
   * Remove a field from all items in a store
   */
  static async removeField<S extends StoreName>(
    storeName: S,
    fieldName: string
  ): Promise<void> {
    const db = await openDatabase();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const allItems = await store.getAll();

    for (const item of allItems) {
      if (fieldName in item) {
        const { [fieldName]: removed, ...rest } = item as any;
        await store.put(rest);
      }
    }

    await tx.done;
  }

  /**
   * Rename a field in all items in a store
   */
  static async renameField<S extends StoreName>(
    storeName: S,
    oldName: string,
    newName: string
  ): Promise<void> {
    const db = await openDatabase();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const allItems = await store.getAll();

    for (const item of allItems) {
      if (oldName in item && !(newName in item)) {
        const { [oldName]: value, ...rest } = item as any;
        await store.put({
          ...rest,
          [newName]: value,
        });
      }
    }

    await tx.done;
  }

  /**
   * Transform field values using a mapping function
   */
  static async transformField<S extends StoreName>(
    storeName: S,
    fieldName: string,
    transformer: (value: any) => any
  ): Promise<void> {
    const db = await openDatabase();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const allItems = await store.getAll();

    for (const item of allItems) {
      if (fieldName in item) {
        await store.put({
          ...item,
          [fieldName]: transformer((item as any)[fieldName]),
        });
      }
    }

    await tx.done;
  }
}

// ============================================================================
// Export singleton instance
// ============================================================================

export const migrationManager = new MigrationManager();
