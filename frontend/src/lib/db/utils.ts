/**
 * IndexedDB Utility Functions
 * Export/import database, cache management, and other utility operations
 */

import {
  openDatabase,
  closeDatabase,
  deleteDatabase,
  type PlaywrightLearningDB,
  type StoreName,
  STORE_NAMES,
  DB_NAME,
  DB_VERSION,
} from './schema';
import { getAll, clear, count } from './operations';
import { syncQueue } from './sync';

// ============================================================================
// Export/Import Types
// ============================================================================

export interface DatabaseExport {
  version: number;
  exportedAt: Date;
  stores: {
    [key: string]: any[];
  };
  metadata: {
    totalRecords: number;
    storesCounts: { [key: string]: number };
  };
}

export interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: string[];
  stores: { [key: string]: number };
}

export interface CacheStats {
  totalSize: number;
  storesSizes: { [key: string]: number };
  totalRecords: number;
  storesRecords: { [key: string]: number };
  lastUpdated: Date;
}

// ============================================================================
// Export Functionality
// ============================================================================

/**
 * Export entire database to JSON
 */
export async function exportDatabase(): Promise<DatabaseExport> {
  try {
    const db = await openDatabase();
    const stores: { [key: string]: any[] } = {};
    const storesCounts: { [key: string]: number } = {};
    let totalRecords = 0;

    // Export each store
    for (const storeName of Object.values(STORE_NAMES)) {
      try {
        const data = await getAll(storeName as StoreName);
        stores[storeName] = data;
        storesCounts[storeName] = data.length;
        totalRecords += data.length;
      } catch (error) {
        console.error(`Failed to export store ${storeName}:`, error);
        stores[storeName] = [];
        storesCounts[storeName] = 0;
      }
    }

    const exportData: DatabaseExport = {
      version: DB_VERSION,
      exportedAt: new Date(),
      stores,
      metadata: {
        totalRecords,
        storesCounts,
      },
    };

    return exportData;
  } catch (error) {
    console.error('Failed to export database:', error);
    throw new Error('Database export failed');
  }
}

/**
 * Export database to JSON file (download)
 */
export async function exportDatabaseToFile(filename?: string): Promise<void> {
  try {
    const data = await exportDatabase();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `playwright-learning-backup-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('✓ Database exported to file');
  } catch (error) {
    console.error('Failed to export database to file:', error);
    throw error;
  }
}

/**
 * Export specific stores to JSON
 */
export async function exportStores(storeNames: StoreName[]): Promise<DatabaseExport> {
  try {
    const db = await openDatabase();
    const stores: { [key: string]: any[] } = {};
    const storesCounts: { [key: string]: number } = {};
    let totalRecords = 0;

    for (const storeName of storeNames) {
      try {
        const data = await getAll(storeName);
        stores[storeName] = data;
        storesCounts[storeName] = data.length;
        totalRecords += data.length;
      } catch (error) {
        console.error(`Failed to export store ${storeName}:`, error);
        stores[storeName] = [];
        storesCounts[storeName] = 0;
      }
    }

    return {
      version: DB_VERSION,
      exportedAt: new Date(),
      stores,
      metadata: {
        totalRecords,
        storesCounts,
      },
    };
  } catch (error) {
    console.error('Failed to export stores:', error);
    throw error;
  }
}

// ============================================================================
// Import Functionality
// ============================================================================

/**
 * Import database from JSON export
 */
export async function importDatabase(
  data: DatabaseExport,
  options: {
    clearExisting?: boolean;
    skipValidation?: boolean;
  } = {}
): Promise<ImportResult> {
  const result: ImportResult = {
    success: false,
    imported: 0,
    failed: 0,
    errors: [],
    stores: {},
  };

  try {
    // Validate version compatibility
    if (!options.skipValidation && data.version > DB_VERSION) {
      throw new Error(
        `Cannot import from newer version (${data.version}) to current version (${DB_VERSION})`
      );
    }

    const db = await openDatabase();

    // Clear existing data if requested
    if (options.clearExisting) {
      for (const storeName of Object.values(STORE_NAMES)) {
        try {
          await clear(storeName as StoreName);
        } catch (error) {
          console.warn(`Failed to clear store ${storeName}:`, error);
        }
      }
    }

    // Import each store
    for (const [storeName, items] of Object.entries(data.stores)) {
      if (!Array.isArray(items)) {
        result.errors.push(`Invalid data for store ${storeName}`);
        continue;
      }

      let storeImported = 0;
      let storeFailed = 0;

      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);

      for (const item of items) {
        try {
          // Convert date strings back to Date objects
          const processedItem = processDates(item);
          await store.put(processedItem);
          storeImported++;
        } catch (error) {
          storeFailed++;
          result.errors.push(
            `Failed to import item in ${storeName}: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`
          );
        }
      }

      await tx.done;

      result.stores[storeName] = storeImported;
      result.imported += storeImported;
      result.failed += storeFailed;
    }

    result.success = result.failed === 0;
    console.log(`✓ Database import completed: ${result.imported} records imported`);

    return result;
  } catch (error) {
    result.errors.push(
      `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    return result;
  }
}

/**
 * Import database from JSON file
 */
export async function importDatabaseFromFile(
  file: File,
  options?: { clearExisting?: boolean; skipValidation?: boolean }
): Promise<ImportResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const json = event.target?.result as string;
        const data: DatabaseExport = JSON.parse(json);
        const result = await importDatabase(data, options);
        resolve(result);
      } catch (error) {
        reject(new Error('Failed to parse import file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read import file'));
    };

    reader.readAsText(file);
  });
}

/**
 * Process dates in imported data (convert ISO strings to Date objects)
 */
function processDates(obj: any): any {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    // Try to parse as date
    const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
    if (dateRegex.test(obj)) {
      return new Date(obj);
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(processDates);
  }

  if (typeof obj === 'object') {
    const processed: any = {};
    for (const [key, value] of Object.entries(obj)) {
      processed[key] = processDates(value);
    }
    return processed;
  }

  return obj;
}

// ============================================================================
// Cache Management
// ============================================================================

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<CacheStats> {
  try {
    const db = await openDatabase();
    const storesSizes: { [key: string]: number } = {};
    const storesRecords: { [key: string]: number } = {};
    let totalRecords = 0;

    for (const storeName of Object.values(STORE_NAMES)) {
      try {
        const recordCount = await count(storeName as StoreName);
        const data = await getAll(storeName as StoreName);
        const size = new Blob([JSON.stringify(data)]).size;

        storesRecords[storeName] = recordCount;
        storesSizes[storeName] = size;
        totalRecords += recordCount;
      } catch (error) {
        console.error(`Failed to get stats for ${storeName}:`, error);
        storesRecords[storeName] = 0;
        storesSizes[storeName] = 0;
      }
    }

    const totalSize = Object.values(storesSizes).reduce((sum, size) => sum + size, 0);

    return {
      totalSize,
      storesSizes,
      totalRecords,
      storesRecords,
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error('Failed to get cache stats:', error);
    throw error;
  }
}

/**
 * Clear all cached data (keeps structure)
 */
export async function clearCache(): Promise<void> {
  try {
    console.log('Clearing cache...');

    for (const storeName of Object.values(STORE_NAMES)) {
      try {
        await clear(storeName as StoreName);
        console.log(`✓ Cleared ${storeName}`);
      } catch (error) {
        console.error(`Failed to clear ${storeName}:`, error);
      }
    }

    console.log('✓ Cache cleared successfully');
  } catch (error) {
    console.error('Failed to clear cache:', error);
    throw error;
  }
}

/**
 * Clear cache for specific stores
 */
export async function clearStores(storeNames: StoreName[]): Promise<void> {
  try {
    for (const storeName of storeNames) {
      await clear(storeName);
      console.log(`✓ Cleared ${storeName}`);
    }
  } catch (error) {
    console.error('Failed to clear stores:', error);
    throw error;
  }
}

/**
 * Clear old data based on age
 */
export async function clearOldData(
  storeName: StoreName,
  daysOld: number
): Promise<number> {
  try {
    const db = await openDatabase();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const allItems = await getAll(storeName);
    const oldItems = allItems.filter((item: any) => {
      const updatedAt = item.updatedAt || item.createdAt;
      return updatedAt && new Date(updatedAt) < cutoffDate;
    });

    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);

    for (const item of oldItems) {
      await store.delete((item as any).id);
    }

    await tx.done;

    console.log(`✓ Cleared ${oldItems.length} old items from ${storeName}`);
    return oldItems.length;
  } catch (error) {
    console.error(`Failed to clear old data from ${storeName}:`, error);
    throw error;
  }
}

/**
 * Reset entire database (delete and recreate)
 */
export async function resetDatabase(): Promise<void> {
  try {
    console.log('Resetting database...');

    // Clear sync queue first
    await syncQueue.clearCompleted();

    // Delete database
    await deleteDatabase();

    // Reopen (will recreate)
    await openDatabase();

    console.log('✓ Database reset successfully');
  } catch (error) {
    console.error('Failed to reset database:', error);
    throw error;
  }
}

/**
 * Compact database (export and re-import to reduce fragmentation)
 */
export async function compactDatabase(): Promise<void> {
  try {
    console.log('Compacting database...');

    // Export current data
    const backup = await exportDatabase();

    // Reset database
    await deleteDatabase();

    // Reopen
    await openDatabase();

    // Import data back
    await importDatabase(backup, { clearExisting: false });

    console.log('✓ Database compacted successfully');
  } catch (error) {
    console.error('Failed to compact database:', error);
    throw error;
  }
}

// ============================================================================
// Storage Estimation
// ============================================================================

/**
 * Estimate storage quota usage
 */
export async function getStorageEstimate(): Promise<{
  usage: number;
  quota: number;
  percentUsed: number;
  available: number;
}> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    const usage = estimate.usage || 0;
    const quota = estimate.quota || 0;
    const percentUsed = quota > 0 ? (usage / quota) * 100 : 0;
    const available = quota - usage;

    return {
      usage,
      quota,
      percentUsed,
      available,
    };
  }

  // Fallback for browsers that don't support Storage API
  return {
    usage: 0,
    quota: 0,
    percentUsed: 0,
    available: 0,
  };
}

/**
 * Check if storage quota is sufficient
 */
export async function hasStorageSpace(requiredBytes: number): Promise<boolean> {
  try {
    const estimate = await getStorageEstimate();
    return estimate.available >= requiredBytes;
  } catch (error) {
    console.warn('Failed to check storage space:', error);
    return true; // Assume space is available if check fails
  }
}

/**
 * Request persistent storage
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if ('storage' in navigator && 'persist' in navigator.storage) {
    try {
      const isPersisted = await navigator.storage.persist();
      console.log(
        isPersisted
          ? '✓ Persistent storage granted'
          : '⚠ Persistent storage not granted'
      );
      return isPersisted;
    } catch (error) {
      console.error('Failed to request persistent storage:', error);
      return false;
    }
  }
  return false;
}

/**
 * Check if storage is persisted
 */
export async function isStoragePersisted(): Promise<boolean> {
  if ('storage' in navigator && 'persisted' in navigator.storage) {
    try {
      return await navigator.storage.persisted();
    } catch (error) {
      console.error('Failed to check storage persistence:', error);
      return false;
    }
  }
  return false;
}

// ============================================================================
// Health Check
// ============================================================================

/**
 * Perform health check on database
 */
export async function healthCheck(): Promise<{
  healthy: boolean;
  version: number;
  stores: string[];
  issues: string[];
}> {
  const result = {
    healthy: true,
    version: 0,
    stores: [] as string[],
    issues: [] as string[],
  };

  try {
    const db = await openDatabase();
    result.version = db.version;

    // Check all stores exist
    for (const storeName of Object.values(STORE_NAMES)) {
      if (db.objectStoreNames.contains(storeName)) {
        result.stores.push(storeName);
      } else {
        result.healthy = false;
        result.issues.push(`Missing store: ${storeName}`);
      }
    }

    // Check for excessive pending syncs
    const stats = await syncQueue.getStats();
    if (stats.pending > 1000) {
      result.issues.push(`High number of pending syncs: ${stats.pending}`);
    }

    if (stats.failed > 100) {
      result.issues.push(`High number of failed syncs: ${stats.failed}`);
    }

    // Check storage quota
    const storage = await getStorageEstimate();
    if (storage.percentUsed > 90) {
      result.issues.push(
        `Storage quota almost full: ${storage.percentUsed.toFixed(1)}%`
      );
    }

    result.healthy = result.issues.length === 0;
  } catch (error) {
    result.healthy = false;
    result.issues.push(
      `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  return result;
}

// ============================================================================
// Format Helpers
// ============================================================================

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format percentage
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}
