/**
 * State Provider Setup Example
 * This file shows how to integrate the state management system in your app
 */

import React, { useEffect } from 'react';
import { QueryProvider } from './lib/query/client';
import { useAuthStore } from './stores/authStore';
import { useSettingsStore } from './stores/settingsStore';
import { useSRSStore } from './stores/srsStore';
import { useProgressStore } from './stores/progressStore';

// ============================================================================
// Store Initializer Component
// ============================================================================

/**
 * Initializes all stores on app startup
 * Rehydrates persisted state and loads initial data
 */
export const StoreInitializer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { refreshAuth, isAuthenticated } = useAuthStore();
  const { theme } = useSettingsStore();
  const { loadCards, calculateDueCards } = useSRSStore();
  const { calculateOverallProgress } = useProgressStore();

  useEffect(() => {
    // Initialize auth on mount
    const initAuth = async () => {
      await refreshAuth();
    };

    initAuth();
  }, [refreshAuth]);

  useEffect(() => {
    // Load data when authenticated
    if (isAuthenticated) {
      loadCards();
      calculateDueCards();
      calculateOverallProgress();
    }
  }, [isAuthenticated, loadCards, calculateDueCards, calculateOverallProgress]);

  useEffect(() => {
    // Apply theme on mount
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return <>{children}</>;
};

// ============================================================================
// App Providers
// ============================================================================

/**
 * Main app provider wrapper
 * Combines React Query and store initialization
 */
export const AppProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <QueryProvider
      config={{
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        retry: 3,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
      }}
    >
      <StoreInitializer>{children}</StoreInitializer>
    </QueryProvider>
  );
};

// ============================================================================
// Usage in main.tsx or App.tsx
// ============================================================================

/**
 * Example setup in main.tsx:
 *
 * import { AppProviders } from './lib/providers';
 *
 * ReactDOM.createRoot(document.getElementById('root')!).render(
 *   <React.StrictMode>
 *     <AppProviders>
 *       <App />
 *     </AppProviders>
 *   </React.StrictMode>
 * );
 */

// ============================================================================
// Store Hooks Examples
// ============================================================================

/**
 * Example: Using auth store in a component
 */
export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    clearError,
  } = useAuthStore();

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    clearError,
  };
};

/**
 * Example: Using progress with derived state
 */
export const useProgress = () => {
  const {
    lessons,
    overallProgress,
    currentStreak,
    totalStudyTime,
    markLessonComplete,
    updateLessonTime,
  } = useProgressStore();

  // Derived state
  const completedLessons = Object.values(lessons).filter((l) => l.completed).length;
  const totalLessons = Object.values(lessons).length;
  const completionRate = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return {
    overallProgress,
    currentStreak,
    totalStudyTime,
    completedLessons,
    totalLessons,
    completionRate,
    markLessonComplete,
    updateLessonTime,
  };
};

/**
 * Example: Using SRS with session management
 */
export const useSRSSession = () => {
  const {
    dueCards,
    currentSession,
    isReviewing,
    reviewedToday,
    dailyLimit,
    startSession,
    endSession,
    reviewCard,
  } = useSRSStore();

  const canStartSession = dueCards.length > 0 && reviewedToday < dailyLimit;
  const progress = currentSession
    ? (currentSession.cardsReviewed / currentSession.totalCards) * 100
    : 0;

  return {
    dueCards,
    currentSession,
    isReviewing,
    canStartSession,
    progress,
    reviewedToday,
    dailyLimit,
    startSession,
    endSession,
    reviewCard,
  };
};

/**
 * Example: Using settings with theme toggle
 */
export const useTheme = () => {
  const { theme, updateTheme } = useSettingsStore();

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    updateTheme(newTheme);
  };

  const isDark = theme === 'dark';

  return {
    theme,
    isDark,
    updateTheme,
    toggleTheme,
  };
};

// ============================================================================
// React Query Hook Examples
// ============================================================================

/**
 * Example: Fetching lessons with React Query
 */
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './lib/query/client';

export const useLessons = (filters?: string) => {
  return useQuery({
    queryKey: filters ? queryKeys.lessons.list(filters) : queryKeys.lessons.lists(),
    queryFn: async () => {
      const response = await fetch(`/api/lessons${filters ? `?${filters}` : ''}`);
      if (!response.ok) throw new Error('Failed to fetch lessons');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Example: Mutation with optimistic update
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useCompleteLesson = () => {
  const queryClient = useQueryClient();
  const { markLessonComplete } = useProgressStore();

  return useMutation({
    mutationFn: async (lessonId: string) => {
      const response = await fetch(`/api/lessons/${lessonId}/complete`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to complete lesson');
      return response.json();
    },
    onMutate: async (lessonId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.lessons.detail(lessonId) });

      // Snapshot previous value
      const previousLesson = queryClient.getQueryData(queryKeys.lessons.detail(lessonId));

      // Optimistically update local state
      markLessonComplete(lessonId);

      // Optimistically update cache
      queryClient.setQueryData(queryKeys.lessons.detail(lessonId), (old: any) => ({
        ...old,
        completed: true,
      }));

      return { previousLesson };
    },
    onError: (err, lessonId, context) => {
      // Rollback on error
      if (context?.previousLesson) {
        queryClient.setQueryData(
          queryKeys.lessons.detail(lessonId),
          context.previousLesson
        );
      }
    },
    onSettled: (data, error, lessonId) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.lessons.detail(lessonId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.progress.overall() });
    },
  });
};

// ============================================================================
// Sync Helper
// ============================================================================

/**
 * Hook to sync all stores with backend
 */
export const useSyncAll = () => {
  const { syncProgress } = useProgressStore();
  const { syncReviews } = useSRSStore();
  const { syncSettings } = useSettingsStore();
  const { setSyncStatus } = useUIStore();

  const syncAll = async () => {
    setSyncStatus(true);

    try {
      await Promise.all([
        syncProgress(),
        syncReviews(),
        syncSettings(),
      ]);
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncStatus(false);
    }
  };

  return { syncAll };
};

// ============================================================================
// Global Error Handler
// ============================================================================

/**
 * Global error boundary for store errors
 */
import { showErrorToast } from './stores/uiStore';

export const setupGlobalErrorHandler = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    showErrorToast('An unexpected error occurred');
  });

  // Handle global errors
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    showErrorToast('An unexpected error occurred');
  });
};

// ============================================================================
// Development Helpers
// ============================================================================

/**
 * Development mode store inspector
 */
export const exposeStoresInDev = () => {
  if (process.env.NODE_ENV === 'development') {
    // Already exposed via devtools.ts
    console.log('🔍 Stores available in console via __ZUSTAND_STORES__');
    console.log('Example: __ZUSTAND_STORES__.auth.getState()');
  }
};

// ============================================================================
// Initialize on app startup
// ============================================================================

if (typeof window !== 'undefined') {
  setupGlobalErrorHandler();
  exposeStoresInDev();
}
