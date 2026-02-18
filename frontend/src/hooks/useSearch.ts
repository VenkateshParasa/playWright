import { useCallback, useEffect } from 'react';
import { useSearchStore } from '../stores/searchStore';
import { getSearchIndex, convertToSearchResults, applyFilters, sortByRelevance } from '../lib/search';

/**
 * Custom hook for using the search functionality
 */
export function useSearch() {
  const {
    query,
    results,
    filters,
    isLoading,
    isOpen,
    setResults,
    setIsLoading,
    setQuery,
    openSearch,
    closeSearch,
    toggleSearch,
  } = useSearchStore();

  /**
   * Perform search with current query and filters
   */
  const performSearch = useCallback(
    async (searchQuery?: string) => {
      const q = searchQuery || query;

      if (!q.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);

      try {
        const searchIndex = getSearchIndex();
        const fuseResults = searchIndex.search(q, 50);
        let searchResults = convertToSearchResults(fuseResults, filters);
        searchResults = applyFilters(searchResults, filters);
        searchResults = sortByRelevance(searchResults);
        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [query, filters, setResults, setIsLoading]
  );

  /**
   * Clear search results and query
   */
  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
  }, [setQuery, setResults]);

  return {
    query,
    results,
    filters,
    isLoading,
    isOpen,
    performSearch,
    clearSearch,
    setQuery,
    openSearch,
    closeSearch,
    toggleSearch,
  };
}

/**
 * Custom hook for keyboard shortcuts
 */
export function useSearchShortcut() {
  const { openSearch, closeSearch, isOpen } = useSearchStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to toggle search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          closeSearch();
        } else {
          openSearch();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, openSearch, closeSearch]);

  return { openSearch, closeSearch, isOpen };
}
