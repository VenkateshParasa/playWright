/**
 * State persistence utilities for localStorage and IndexedDB
 * Provides automatic state serialization/deserialization with versioning
 */

import { StateCreator, StoreMutatorIdentifier } from 'zustand';
import { openDB, DBSchema, IDBPDatabase } from 'idb';

// ============================================================================
// Types
// ============================================================================

interface StorageConfig {
  name: string;
  version?: number;
  storage?: 'localStorage' | 'indexedDB';
  partialize?: (state: any) => any;
  migrate?: (persistedState: any, version: number) => any;
  merge?: (persistedState: any, currentState: any) => any;
  onRehydrateStorage?: (state: any) => void;
}

interface PersistedState {
  state: any;
  version: number;
  timestamp: number;
}

// ============================================================================
// IndexedDB Schema
// ============================================================================

interface StateDB extends DBSchema {
  store: {
    key: string;
    value: PersistedState;
  };
}

let dbInstance: IDBPDatabase<StateDB> | null = null;

const getDB = async (): Promise<IDBPDatabase<StateDB>> => {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<StateDB>('zustand-store', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('store')) {
        db.createObjectStore('store');
      }
    },
  });

  return dbInstance;
};

// ============================================================================
// Storage Adapters
// ============================================================================

const localStorageAdapter = {
  async getItem(key: string): Promise<PersistedState | null> {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Failed to get item from localStorage:', error);
      return null;
    }
  },

  async setItem(key: string, value: PersistedState): Promise<void> {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to set item in localStorage:', error);
      // Handle quota exceeded error
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        // Clear old data or notify user
        console.warn('localStorage quota exceeded');
      }
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove item from localStorage:', error);
    }
  },
};

const indexedDBAdapter = {
  async getItem(key: string): Promise<PersistedState | null> {
    try {
      const db = await getDB();
      return (await db.get('store', key)) || null;
    } catch (error) {
      console.error('Failed to get item from IndexedDB:', error);
      return null;
    }
  },

  async setItem(key: string, value: PersistedState): Promise<void> {
    try {
      const db = await getDB();
      await db.put('store', value, key);
    } catch (error) {
      console.error('Failed to set item in IndexedDB:', error);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      const db = await getDB();
      await db.delete('store', key);
    } catch (error) {
      console.error('Failed to remove item from IndexedDB:', error);
    }
  },
};

// ============================================================================
// Storage Manager
// ============================================================================

class StorageManager {
  private adapter: typeof localStorageAdapter | typeof indexedDBAdapter;

  constructor(type: 'localStorage' | 'indexedDB' = 'localStorage') {
    this.adapter = type === 'indexedDB' ? indexedDBAdapter : localStorageAdapter;
  }

  async get(key: string): Promise<PersistedState | null> {
    return this.adapter.getItem(key);
  }

  async set(key: string, value: PersistedState): Promise<void> {
    return this.adapter.setItem(key, value);
  }

  async remove(key: string): Promise<void> {
    return this.adapter.removeItem(key);
  }

  async clear(): Promise<void> {
    if (this.adapter === localStorageAdapter) {
      localStorage.clear();
    } else {
      const db = await getDB();
      const tx = db.transaction('store', 'readwrite');
      await tx.objectStore('store').clear();
    }
  }
}

// ============================================================================
// Persist Middleware
// ============================================================================

export interface Persist {
  <
    T,
    Mps extends [StoreMutatorIdentifier, unknown][] = [],
    Mcs extends [StoreMutatorIdentifier, unknown][] = []
  >(
    config: StateCreator<T, Mps, Mcs>,
    options: StorageConfig
  ): StateCreator<T, Mps, Mcs>;
}

export const persist = <T extends object>(
  config: StateCreator<T>,
  options: StorageConfig
): StateCreator<T> => {
  return (set, get, api) => {
    const {
      name,
      version = 1,
      storage = 'localStorage',
      partialize = (state) => state,
      migrate,
      merge = (persistedState, currentState) => ({
        ...currentState,
        ...persistedState,
      }),
      onRehydrateStorage,
    } = options;

    const storageManager = new StorageManager(storage);
    const storageKey = `zustand-${name}`;

    // Hydrate state from storage
    const hydrate = async () => {
      try {
        const persistedData = await storageManager.get(storageKey);

        if (persistedData) {
          let state = persistedData.state;

          // Handle version migration
          if (migrate && persistedData.version !== version) {
            state = migrate(state, persistedData.version);
          }

          // Merge with current state
          const currentState = get();
          const mergedState = merge(state, currentState);

          // Update store
          set(mergedState as Partial<T>, true);

          if (onRehydrateStorage) {
            onRehydrateStorage(mergedState);
          }
        }
      } catch (error) {
        console.error('Failed to hydrate state:', error);
      }
    };

    // Persist state to storage
    const persistState = async () => {
      try {
        const state = partialize(get());
        const persistedData: PersistedState = {
          state,
          version,
          timestamp: Date.now(),
        };
        await storageManager.set(storageKey, persistedData);
      } catch (error) {
        console.error('Failed to persist state:', error);
      }
    };

    // Initialize store and hydrate
    const initialState = config(
      (partial, replace) => {
        set(partial, replace);
        persistState(); // Persist on every state change
      },
      get,
      api
    );

    // Hydrate on initialization
    hydrate();

    return initialState;
  };
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Creates a debounced persist function to reduce storage writes
 */
export const createDebouncedPersist = (delay: number = 1000) => {
  let timeoutId: NodeJS.Timeout | null = null;

  return (persistFn: () => void) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      persistFn();
      timeoutId = null;
    }, delay);
  };
};

/**
 * Partialize helper to exclude specific keys from persistence
 */
export const excludeKeys = <T extends object>(
  state: T,
  keys: (keyof T)[]
): Partial<T> => {
  const result = { ...state };
  keys.forEach((key) => {
    delete result[key];
  });
  return result;
};

/**
 * Partialize helper to include only specific keys in persistence
 */
export const includeKeys = <T extends object>(
  state: T,
  keys: (keyof T)[]
): Partial<T> => {
  const result: Partial<T> = {};
  keys.forEach((key) => {
    if (key in state) {
      result[key] = state[key];
    }
  });
  return result;
};

/**
 * Clear all persisted stores
 */
export const clearAllStores = async () => {
  // Clear localStorage
  Object.keys(localStorage)
    .filter((key) => key.startsWith('zustand-'))
    .forEach((key) => localStorage.removeItem(key));

  // Clear IndexedDB
  try {
    const db = await getDB();
    const tx = db.transaction('store', 'readwrite');
    await tx.objectStore('store').clear();
  } catch (error) {
    console.error('Failed to clear IndexedDB:', error);
  }
};

/**
 * Get storage size estimation
 */
export const getStorageSize = async (): Promise<{
  localStorage: number;
  indexedDB: number;
}> => {
  let localStorageSize = 0;
  let indexedDBSize = 0;

  // Calculate localStorage size
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('zustand-')) {
      localStorageSize += localStorage.getItem(key)?.length || 0;
    }
  });

  // Calculate IndexedDB size (estimation)
  try {
    const db = await getDB();
    const tx = db.transaction('store', 'readonly');
    const store = tx.objectStore('store');
    const keys = await store.getAllKeys();

    for (const key of keys) {
      const value = await store.get(key);
      if (value) {
        indexedDBSize += JSON.stringify(value).length;
      }
    }
  } catch (error) {
    console.error('Failed to calculate IndexedDB size:', error);
  }

  return {
    localStorage: localStorageSize,
    indexedDB: indexedDBSize,
  };
};

/**
 * Export all stores to JSON
 */
export const exportStores = async (): Promise<Record<string, any>> => {
  const stores: Record<string, any> = {};

  // Export from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('zustand-')) {
      try {
        const value = localStorage.getItem(key);
        if (value) {
          stores[key] = JSON.parse(value);
        }
      } catch (error) {
        console.error(`Failed to export ${key}:`, error);
      }
    }
  });

  // Export from IndexedDB
  try {
    const db = await getDB();
    const tx = db.transaction('store', 'readonly');
    const store = tx.objectStore('store');
    const keys = await store.getAllKeys();

    for (const key of keys) {
      const value = await store.get(key);
      if (value) {
        stores[key] = value;
      }
    }
  } catch (error) {
    console.error('Failed to export from IndexedDB:', error);
  }

  return stores;
};

/**
 * Import stores from JSON
 */
export const importStores = async (
  stores: Record<string, PersistedState>
): Promise<void> => {
  for (const [key, value] of Object.entries(stores)) {
    try {
      // Determine storage type from key or value
      const useIndexedDB = value.state && Object.keys(value.state).length > 100; // Large states go to IndexedDB

      if (useIndexedDB) {
        await indexedDBAdapter.setItem(key, value);
      } else {
        await localStorageAdapter.setItem(key, value);
      }
    } catch (error) {
      console.error(`Failed to import ${key}:`, error);
    }
  }
};
