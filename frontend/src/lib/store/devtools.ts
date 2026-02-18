/**
 * Devtools middleware for Zustand stores
 * Enables Redux DevTools integration for debugging state changes
 */

import { StateCreator, StoreMutatorIdentifier } from 'zustand';

// ============================================================================
// Types
// ============================================================================

interface DevtoolsConfig {
  name: string;
  enabled?: boolean;
  anonymousActionType?: string;
  trace?: boolean;
  traceLimit?: number;
}

interface DevtoolsExtension {
  connect(options: any): DevtoolsConnection;
}

interface DevtoolsConnection {
  init(state: any): void;
  send(action: any, state: any): void;
  subscribe(listener: (message: any) => void): () => void;
}

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__?: DevtoolsExtension;
  }
}

// ============================================================================
// Devtools Middleware
// ============================================================================

export interface Devtools {
  <
    T,
    Mps extends [StoreMutatorIdentifier, unknown][] = [],
    Mcs extends [StoreMutatorIdentifier, unknown][] = []
  >(
    config: StateCreator<T, Mps, Mcs>,
    options: DevtoolsConfig
  ): StateCreator<T, Mps, Mcs>;
}

export const devtools = <T extends object>(
  config: StateCreator<T>,
  options: DevtoolsConfig
): StateCreator<T> => {
  return (set, get, api) => {
    const {
      name,
      enabled = process.env.NODE_ENV === 'development',
      anonymousActionType = 'anonymous',
      trace = false,
      traceLimit = 25,
    } = options;

    // Check if devtools is available and enabled
    const extension = enabled && window.__REDUX_DEVTOOLS_EXTENSION__;

    if (!extension) {
      // Return original store if devtools not available
      return config(set, get, api);
    }

    // Connect to devtools
    const devtoolsConnection = extension.connect({
      name,
      trace,
      traceLimit,
      features: {
        pause: true,
        lock: true,
        persist: true,
        export: true,
        import: 'custom',
        jump: true,
        skip: true,
        reorder: true,
        dispatch: true,
        test: true,
      },
    });

    // Track if we're currently setting state to avoid infinite loops
    let isTimeTraveling = false;

    // Initialize devtools with initial state
    const initialState = config(
      (partial, replace, actionName) => {
        const nextState =
          typeof partial === 'function' ? partial(get()) : partial;

        if (!isTimeTraveling) {
          set(nextState, replace);

          // Send action to devtools
          const action = {
            type: actionName || anonymousActionType,
            ...(typeof nextState === 'object' ? nextState : { value: nextState }),
          };

          devtoolsConnection.send(action, get());
        } else {
          set(nextState, replace);
        }
      },
      get,
      api
    );

    // Subscribe to devtools messages (time travel, etc.)
    devtoolsConnection.subscribe((message: any) => {
      if (message.type === 'DISPATCH' && message.state) {
        try {
          isTimeTraveling = true;
          const newState = JSON.parse(message.state);
          set(newState, true);
        } catch (error) {
          console.error('Failed to parse devtools state:', error);
        } finally {
          isTimeTraveling = false;
        }
      } else if (message.type === 'ACTION' && message.payload) {
        try {
          // Handle dispatched actions from devtools
          const action = JSON.parse(message.payload);
          console.log('Devtools action:', action);
        } catch (error) {
          console.error('Failed to parse devtools action:', error);
        }
      }
    });

    // Initialize devtools with initial state
    devtoolsConnection.init(get());

    return initialState;
  };
};

// ============================================================================
// Action Helpers
// ============================================================================

/**
 * Creates a named action for better devtools tracking
 */
export const createAction = (type: string, payload?: any) => {
  return {
    type,
    payload,
    timestamp: Date.now(),
  };
};

/**
 * Wraps a store action with devtools tracking
 */
export const withDevtools = <T extends (...args: any[]) => any>(
  actionName: string,
  action: T
): T => {
  return ((...args: Parameters<T>) => {
    const result = action(...args);

    // If action returns a promise, track async completion
    if (result instanceof Promise) {
      result
        .then(() => {
          console.log(`[${actionName}] completed successfully`);
        })
        .catch((error) => {
          console.error(`[${actionName}] failed:`, error);
        });
    }

    return result;
  }) as T;
};

// ============================================================================
// Store Enhancer
// ============================================================================

/**
 * Enhances a store with devtools and additional debugging capabilities
 */
export const enhanceStore = <T extends object>(
  store: T,
  name: string
): T & { _debug: DebugAPI } => {
  const debugAPI: DebugAPI = {
    getState: () => store,

    setState: (newState: Partial<T>) => {
      Object.assign(store, newState);
    },

    subscribe: (listener: (state: T) => void) => {
      // Basic subscription implementation
      const intervalId = setInterval(() => {
        listener(store);
      }, 100);

      return () => clearInterval(intervalId);
    },

    history: [],

    addToHistory: (action: string, state: any) => {
      debugAPI.history.push({
        action,
        state: JSON.parse(JSON.stringify(state)),
        timestamp: Date.now(),
      });

      // Keep only last 50 entries
      if (debugAPI.history.length > 50) {
        debugAPI.history.shift();
      }
    },

    clearHistory: () => {
      debugAPI.history = [];
    },

    exportState: () => {
      return JSON.stringify(store, null, 2);
    },

    importState: (stateJson: string) => {
      try {
        const newState = JSON.parse(stateJson);
        Object.assign(store, newState);
        return true;
      } catch (error) {
        console.error('Failed to import state:', error);
        return false;
      }
    },
  };

  return Object.defineProperty(store, '_debug', {
    value: debugAPI,
    enumerable: false,
    writable: false,
  }) as T & { _debug: DebugAPI };
};

interface DebugAPI {
  getState: () => any;
  setState: (newState: any) => void;
  subscribe: (listener: (state: any) => void) => () => void;
  history: Array<{
    action: string;
    state: any;
    timestamp: number;
  }>;
  addToHistory: (action: string, state: any) => void;
  clearHistory: () => void;
  exportState: () => string;
  importState: (stateJson: string) => boolean;
}

// ============================================================================
// Development Utilities
// ============================================================================

/**
 * Logs all state changes in development
 */
export const logStateChanges = <T extends object>(
  storeName: string,
  oldState: T,
  newState: T,
  actionName?: string
): void => {
  if (process.env.NODE_ENV !== 'development') return;

  const changes: Record<string, { old: any; new: any }> = {};

  // Find changed keys
  Object.keys(newState).forEach((key) => {
    const typedKey = key as keyof T;
    if (oldState[typedKey] !== newState[typedKey]) {
      changes[key] = {
        old: oldState[typedKey],
        new: newState[typedKey],
      };
    }
  });

  if (Object.keys(changes).length > 0) {
    console.group(
      `%c[${storeName}] ${actionName || 'State Update'}`,
      'color: #4CAF50; font-weight: bold;'
    );
    console.log('Changes:', changes);
    console.log('New State:', newState);
    console.groupEnd();
  }
};

/**
 * Creates a middleware that logs all actions
 */
export const createLogger = (storeName: string) => {
  return <T extends object>(config: StateCreator<T>): StateCreator<T> => {
    return (set, get, api) => {
      return config(
        (partial, replace, actionName) => {
          const oldState = get();
          set(partial, replace);
          const newState = get();

          logStateChanges(storeName, oldState, newState, actionName as string);
        },
        get,
        api
      );
    };
  };
};

// ============================================================================
// Performance Monitoring
// ============================================================================

/**
 * Monitors store performance and logs slow updates
 */
export const monitorPerformance = <T extends object>(
  storeName: string,
  threshold: number = 16 // 16ms (one frame)
) => {
  return (config: StateCreator<T>): StateCreator<T> => {
    return (set, get, api) => {
      return config(
        (partial, replace, actionName) => {
          const startTime = performance.now();

          set(partial, replace);

          const endTime = performance.now();
          const duration = endTime - startTime;

          if (duration > threshold) {
            console.warn(
              `[${storeName}] Slow state update detected:`,
              `${actionName || 'unknown'} took ${duration.toFixed(2)}ms`
            );
          }
        },
        get,
        api
      );
    };
  };
};

// ============================================================================
// Global Devtools Access
// ============================================================================

// Make stores accessible from browser console in development
if (process.env.NODE_ENV === 'development') {
  (window as any).__ZUSTAND_STORES__ = {};
}

export const registerStore = (name: string, store: any): void => {
  if (process.env.NODE_ENV === 'development') {
    (window as any).__ZUSTAND_STORES__[name] = store;
    console.log(`[Zustand] Store "${name}" registered globally`);
  }
};

/**
 * Gets all registered stores (development only)
 */
export const getAllStores = (): Record<string, any> => {
  if (process.env.NODE_ENV === 'development') {
    return (window as any).__ZUSTAND_STORES__ || {};
  }
  return {};
};
