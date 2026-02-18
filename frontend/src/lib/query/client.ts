/**
 * React Query configuration and provider setup
 * Manages server state with caching, invalidation, and optimistic updates
 */

import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React from 'react';

// ============================================================================
// Types
// ============================================================================

interface QueryConfig {
  staleTime?: number;
  cacheTime?: number;
  retry?: number | boolean;
  retryDelay?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
  refetchOnMount?: boolean;
}

interface CacheInvalidationStrategy {
  keys: string[];
  invalidateOn?: 'success' | 'error' | 'settled';
  exact?: boolean;
}

// ============================================================================
// Default Query Configuration
// ============================================================================

const defaultQueryConfig: QueryConfig = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
  retry: 3,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
  refetchOnMount: true,
};

// ============================================================================
// Query Client Setup
// ============================================================================

const queryCache = new QueryCache({
  onError: (error, query) => {
    console.error('Query error:', {
      queryKey: query.queryKey,
      error,
    });

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        // Handle authentication errors
        console.warn('Authentication error detected, redirecting to login...');
        // Dispatch logout action or redirect
      } else if (error.message.includes('503') || error.message.includes('Service Unavailable')) {
        // Handle service unavailable
        console.warn('Service temporarily unavailable');
      }
    }
  },
  onSuccess: (data, query) => {
    // Log successful queries in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Query success:', {
        queryKey: query.queryKey,
        data,
      });
    }
  },
});

const mutationCache = new MutationCache({
  onError: (error, variables, context, mutation) => {
    console.error('Mutation error:', {
      mutationKey: mutation.options.mutationKey,
      error,
      variables,
    });
  },
  onSuccess: (data, variables, context, mutation) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Mutation success:', {
        mutationKey: mutation.options.mutationKey,
        data,
      });
    }
  },
});

export const queryClient = new QueryClient({
  queryCache,
  mutationCache,
  defaultOptions: {
    queries: defaultQueryConfig,
    mutations: {
      retry: 1,
      onError: (error) => {
        console.error('Mutation failed:', error);
      },
    },
  },
});

// ============================================================================
// Query Provider Component
// ============================================================================

interface QueryProviderProps {
  children: React.ReactNode;
  config?: QueryConfig;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({
  children,
  config,
}) => {
  // Merge custom config with defaults
  if (config) {
    queryClient.setDefaultOptions({
      queries: { ...defaultQueryConfig, ...config },
    });
  }

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      )}
    </QueryClientProvider>
  );
};

// ============================================================================
// Cache Invalidation Helpers
// ============================================================================

/**
 * Query key factory for consistent key generation
 */
export const queryKeys = {
  // Auth
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
  },

  // Lessons
  lessons: {
    all: ['lessons'] as const,
    lists: () => [...queryKeys.lessons.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.lessons.lists(), filters] as const,
    details: () => [...queryKeys.lessons.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.lessons.details(), id] as const,
  },

  // Progress
  progress: {
    all: ['progress'] as const,
    overall: () => [...queryKeys.progress.all, 'overall'] as const,
    module: (id: string) => [...queryKeys.progress.all, 'module', id] as const,
    lesson: (id: string) => [...queryKeys.progress.all, 'lesson', id] as const,
  },

  // SRS
  srs: {
    all: ['srs'] as const,
    cards: () => [...queryKeys.srs.all, 'cards'] as const,
    dueCards: () => [...queryKeys.srs.all, 'due'] as const,
    reviews: () => [...queryKeys.srs.all, 'reviews'] as const,
    stats: () => [...queryKeys.srs.all, 'stats'] as const,
  },

  // Quizzes
  quizzes: {
    all: ['quizzes'] as const,
    lists: () => [...queryKeys.quizzes.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.quizzes.all, 'detail', id] as const,
    attempts: (id: string) => [...queryKeys.quizzes.all, 'attempts', id] as const,
  },

  // Exercises
  exercises: {
    all: ['exercises'] as const,
    lists: () => [...queryKeys.exercises.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.exercises.all, 'detail', id] as const,
    submissions: (id: string) =>
      [...queryKeys.exercises.all, 'submissions', id] as const,
  },

  // Settings
  settings: {
    all: ['settings'] as const,
    user: () => [...queryKeys.settings.all, 'user'] as const,
  },
};

/**
 * Invalidates queries based on strategy
 */
export const invalidateQueries = async (
  strategy: CacheInvalidationStrategy
): Promise<void> => {
  const { keys, exact = false } = strategy;

  for (const key of keys) {
    await queryClient.invalidateQueries({
      queryKey: [key],
      exact,
    });
  }
};

/**
 * Invalidates all queries matching a pattern
 */
export const invalidateQueriesMatching = async (
  pattern: string
): Promise<void> => {
  await queryClient.invalidateQueries({
    predicate: (query) => {
      return query.queryKey.some(
        (key) => typeof key === 'string' && key.includes(pattern)
      );
    },
  });
};

/**
 * Removes specific queries from cache
 */
export const removeQueries = (queryKey: string[]): void => {
  queryClient.removeQueries({ queryKey });
};

/**
 * Clears all cached queries
 */
export const clearCache = (): void => {
  queryClient.clear();
};

/**
 * Prefetches data for faster navigation
 */
export const prefetchQuery = async <T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  config?: QueryConfig
): Promise<void> => {
  await queryClient.prefetchQuery({
    queryKey,
    queryFn,
    ...config,
  });
};

/**
 * Sets query data manually (useful for optimistic updates)
 */
export const setQueryData = <T>(queryKey: string[], updater: T | ((old: T) => T)): void => {
  queryClient.setQueryData(queryKey, updater);
};

/**
 * Gets current query data
 */
export const getQueryData = <T>(queryKey: string[]): T | undefined => {
  return queryClient.getQueryData<T>(queryKey);
};

// ============================================================================
// Optimistic Update Helpers
// ============================================================================

export interface OptimisticUpdateConfig<TData, TVariables> {
  queryKey: string[];
  mutationFn: (variables: TVariables) => Promise<TData>;
  updateFn: (oldData: TData | undefined, variables: TVariables) => TData;
  onSuccess?: (data: TData, variables: TVariables, context: any) => void;
  onError?: (error: Error, variables: TVariables, context: any) => void;
}

/**
 * Creates an optimistic update mutation
 */
export const createOptimisticMutation = <TData, TVariables>({
  queryKey,
  mutationFn,
  updateFn,
  onSuccess,
  onError,
}: OptimisticUpdateConfig<TData, TVariables>) => {
  return {
    mutationFn,
    onMutate: async (variables: TVariables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<TData>(queryKey);

      // Optimistically update cache
      queryClient.setQueryData<TData>(queryKey, (old) => updateFn(old, variables));

      // Return context with snapshot
      return { previousData };
    },
    onError: (error: Error, variables: TVariables, context: any) => {
      // Rollback to previous value on error
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      onError?.(error, variables, context);
    },
    onSuccess: (data: TData, variables: TVariables, context: any) => {
      onSuccess?.(data, variables, context);
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey });
    },
  };
};

// ============================================================================
// Cache Management Hooks
// ============================================================================

/**
 * Hook to manually invalidate queries
 */
export const useInvalidateQueries = () => {
  const queryClient = useQueryClient();

  return React.useCallback(
    (queryKey: string[], exact: boolean = false) => {
      return queryClient.invalidateQueries({ queryKey, exact });
    },
    [queryClient]
  );
};

/**
 * Hook to prefetch data
 */
export const usePrefetch = () => {
  const queryClient = useQueryClient();

  return React.useCallback(
    async <T,>(
      queryKey: string[],
      queryFn: () => Promise<T>,
      config?: QueryConfig
    ) => {
      await queryClient.prefetchQuery({
        queryKey,
        queryFn,
        ...config,
      });
    },
    [queryClient]
  );
};

/**
 * Hook to get query state
 */
export const useQueryState = (queryKey: string[]) => {
  const queryClient = useQueryClient();
  const queryState = queryClient.getQueryState(queryKey);

  return {
    isFetching: queryState?.isFetching ?? false,
    isLoading: queryState?.status === 'loading',
    isError: queryState?.status === 'error',
    isSuccess: queryState?.status === 'success',
    data: queryState?.data,
    error: queryState?.error,
    dataUpdatedAt: queryState?.dataUpdatedAt,
  };
};

// ============================================================================
// Background Sync
// ============================================================================

/**
 * Enables background refetching for specific queries
 */
export const enableBackgroundSync = (
  queryKey: string[],
  interval: number = 30000 // 30 seconds
): (() => void) => {
  const intervalId = setInterval(() => {
    queryClient.invalidateQueries({ queryKey });
  }, interval);

  return () => clearInterval(intervalId);
};

/**
 * Syncs all queries when coming back online
 */
export const syncOnReconnect = (): void => {
  const handleOnline = () => {
    console.log('Connection restored, syncing queries...');
    queryClient.invalidateQueries();
  };

  window.addEventListener('online', handleOnline);

  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
  };
};

// ============================================================================
// Cache Persistence
// ============================================================================

/**
 * Exports query cache to JSON
 */
export const exportQueryCache = (): string => {
  const cache = queryClient.getQueryCache().getAll();
  const serializable = cache.map((query) => ({
    queryKey: query.queryKey,
    state: query.state,
  }));
  return JSON.stringify(serializable, null, 2);
};

/**
 * Imports query cache from JSON
 */
export const importQueryCache = (cacheJson: string): void => {
  try {
    const cache = JSON.parse(cacheJson);
    cache.forEach((item: any) => {
      queryClient.setQueryData(item.queryKey, item.state.data);
    });
  } catch (error) {
    console.error('Failed to import query cache:', error);
  }
};

// ============================================================================
// Query Stats
// ============================================================================

/**
 * Gets statistics about the query cache
 */
export const getQueryStats = () => {
  const cache = queryClient.getQueryCache().getAll();

  return {
    totalQueries: cache.length,
    activeQueries: cache.filter((q) => q.getObserversCount() > 0).length,
    staleQueries: cache.filter((q) => q.isStale()).length,
    fetchingQueries: cache.filter((q) => q.state.isFetching).length,
    errorQueries: cache.filter((q) => q.state.status === 'error').length,
  };
};

/**
 * Logs query cache statistics
 */
export const logQueryStats = (): void => {
  const stats = getQueryStats();
  console.table(stats);
};

// Initialize connection monitoring
if (typeof window !== 'undefined') {
  syncOnReconnect();
}
