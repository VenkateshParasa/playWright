import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  SearchResult,
  SearchFiltersState,
  SearchSuggestion,
  RecentSearch,
  SearchAnalytics,
  SearchState,
} from '../types/search.types';

interface SearchStore extends SearchState {
  // Actions
  setQuery: (query: string) => void;
  setResults: (results: SearchResult[]) => void;
  setSuggestions: (suggestions: SearchSuggestion[]) => void;
  setFilters: (filters: Partial<SearchFiltersState>) => void;
  resetFilters: () => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsOpen: (isOpen: boolean) => void;
  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;
  addRecentSearch: (query: string, resultsCount: number) => void;
  clearRecentSearches: () => void;
  removeRecentSearch: (id: string) => void;
  trackAnalytics: (analytics: Omit<SearchAnalytics, 'timestamp'>) => void;
  setSelectedIndex: (index: number) => void;
  moveSelectionUp: () => void;
  moveSelectionDown: () => void;
  clearSearch: () => void;
}

const defaultFilters: SearchFiltersState = {
  type: 'all',
  difficulty: 'all',
  category: 'all',
  track: 'all',
};

const MAX_RECENT_SEARCHES = 10;
const MAX_ANALYTICS_ENTRIES = 100;

export const useSearchStore = create<SearchStore>()(
  persist(
    (set, get) => ({
      // Initial state
      query: '',
      results: [],
      suggestions: [],
      recentSearches: [],
      filters: defaultFilters,
      isLoading: false,
      isOpen: false,
      analytics: [],
      selectedIndex: -1,

      // Actions
      setQuery: (query) => {
        set({ query });
      },

      setResults: (results) => {
        set({ results, selectedIndex: results.length > 0 ? 0 : -1 });
      },

      setSuggestions: (suggestions) => {
        set({ suggestions });
      },

      setFilters: (filters) => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
        }));
      },

      resetFilters: () => {
        set({ filters: defaultFilters });
      },

      setIsLoading: (isLoading) => {
        set({ isLoading });
      },

      setIsOpen: (isOpen) => {
        set({ isOpen });
        if (!isOpen) {
          // Reset selection when closing
          set({ selectedIndex: -1 });
        }
      },

      openSearch: () => {
        set({ isOpen: true });
      },

      closeSearch: () => {
        set({ isOpen: false, selectedIndex: -1 });
      },

      toggleSearch: () => {
        set((state) => ({
          isOpen: !state.isOpen,
          selectedIndex: !state.isOpen ? -1 : state.selectedIndex,
        }));
      },

      addRecentSearch: (query, resultsCount) => {
        if (!query.trim()) return;

        set((state) => {
          // Remove existing search with same query
          const filtered = state.recentSearches.filter(
            (search) => search.query.toLowerCase() !== query.toLowerCase()
          );

          // Add new search at the beginning
          const newSearch: RecentSearch = {
            id: `search-${Date.now()}`,
            query: query.trim(),
            timestamp: new Date(),
            resultsCount,
          };

          // Keep only the most recent searches
          const updated = [newSearch, ...filtered].slice(0, MAX_RECENT_SEARCHES);

          return { recentSearches: updated };
        });
      },

      clearRecentSearches: () => {
        set({ recentSearches: [] });
      },

      removeRecentSearch: (id) => {
        set((state) => ({
          recentSearches: state.recentSearches.filter((search) => search.id !== id),
        }));
      },

      trackAnalytics: (analytics) => {
        set((state) => {
          const newEntry: SearchAnalytics = {
            ...analytics,
            timestamp: new Date(),
          };

          // Keep only the most recent analytics entries
          const updated = [newEntry, ...state.analytics].slice(0, MAX_ANALYTICS_ENTRIES);

          return { analytics: updated };
        });
      },

      setSelectedIndex: (index) => {
        const { results } = get();
        if (index >= -1 && index < results.length) {
          set({ selectedIndex: index });
        }
      },

      moveSelectionUp: () => {
        set((state) => {
          const newIndex = state.selectedIndex > 0 ? state.selectedIndex - 1 : state.results.length - 1;
          return { selectedIndex: newIndex };
        });
      },

      moveSelectionDown: () => {
        set((state) => {
          const newIndex = state.selectedIndex < state.results.length - 1 ? state.selectedIndex + 1 : 0;
          return { selectedIndex: newIndex };
        });
      },

      clearSearch: () => {
        set({
          query: '',
          results: [],
          suggestions: [],
          selectedIndex: -1,
        });
      },
    }),
    {
      name: 'search-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        recentSearches: state.recentSearches,
        analytics: state.analytics,
        filters: state.filters,
      }),
    }
  )
);

// Selectors
export const selectQuery = (state: SearchStore) => state.query;
export const selectResults = (state: SearchStore) => state.results;
export const selectSuggestions = (state: SearchStore) => state.suggestions;
export const selectRecentSearches = (state: SearchStore) => state.recentSearches;
export const selectFilters = (state: SearchStore) => state.filters;
export const selectIsLoading = (state: SearchStore) => state.isLoading;
export const selectIsOpen = (state: SearchStore) => state.isOpen;
export const selectSelectedIndex = (state: SearchStore) => state.selectedIndex;
export const selectSelectedResult = (state: SearchStore) => {
  const { results, selectedIndex } = state;
  return selectedIndex >= 0 && selectedIndex < results.length ? results[selectedIndex] : null;
};
