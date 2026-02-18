/**
 * Central Store Exports
 * Single entry point for all store imports
 */

// Stores
export { useAuthStore, getAuthToken, hasRole, hasAnyRole, getUserId, isAuthenticated } from './authStore';
export { useProgressStore, isLessonCompleted, getBestQuizScore, hasPassedQuiz, getTotalCompletedLessons, formatStudyTime } from './progressStore';
export { useSRSStore, getNextDueCard, isDailyLimitReached, getTotalCardsCount } from './srsStore';
export { useSettingsStore, getEffectiveTheme, isDarkMode, isNotificationEnabled, getDailyReviewLimit, areKeyboardShortcutsEnabled, exportSettings, importSettings } from './settingsStore';
export { useUIStore, showSuccessToast, showErrorToast, showInfoToast, showWarningToast, openConfirmModal, isOnline, isSyncing } from './uiStore';
export { useSearchStore, selectQuery, selectResults, selectSuggestions, selectRecentSearches, selectFilters, selectIsLoading, selectIsOpen, selectSelectedIndex, selectSelectedResult } from './searchStore';

// Types
export type * from '../types/store';

// React Query
export { QueryProvider, queryClient, queryKeys, invalidateQueries, invalidateQueriesMatching, removeQueries, clearCache, prefetchQuery, setQueryData, getQueryData, createOptimisticMutation, useInvalidateQueries, usePrefetch, useQueryState, enableBackgroundSync, syncOnReconnect, exportQueryCache, importQueryCache, getQueryStats, logQueryStats } from '../lib/query/client';

// Persistence
export { persist, createDebouncedPersist, excludeKeys, includeKeys, clearAllStores, getStorageSize, exportStores, importStores } from '../lib/store/persistence';

// Devtools
export { devtools, createAction, withDevtools, enhanceStore, logStateChanges, createLogger, monitorPerformance, registerStore, getAllStores } from '../lib/store/devtools';
