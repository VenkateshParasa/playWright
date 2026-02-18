import { useEffect, useCallback, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useSearchStore } from '../../stores/searchStore';
import { getSearchIndex, convertToSearchResults, applyFilters, sortByRelevance } from '../../lib/search';
import SearchBar from './SearchBar';
import SearchResults from './SearchResults';
import SearchFilters from './SearchFilters';
import SearchSuggestions from './SearchSuggestions';

interface GlobalSearchProps {
  onClose?: () => void;
}

export default function GlobalSearch({ onClose }: GlobalSearchProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    isOpen,
    query,
    results,
    filters,
    closeSearch,
    setResults,
    setIsLoading,
    moveSelectionUp,
    moveSelectionDown,
    selectedIndex,
    clearSearch,
  } = useSearchStore();

  // Initialize search index
  useEffect(() => {
    const initializeIndex = async () => {
      const searchIndex = getSearchIndex();
      // Wait for index to build
      await new Promise((resolve) => setTimeout(resolve, 100));
      setIsInitialized(true);
    };

    initializeIndex();
  }, []);

  // Handle search
  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim() || !isInitialized) {
        setResults([]);
        return;
      }

      setIsLoading(true);

      try {
        // Get search index
        const searchIndex = getSearchIndex();

        // Perform fuzzy search
        const fuseResults = searchIndex.search(searchQuery, 50);

        // Convert to search results
        let searchResults = convertToSearchResults(fuseResults, filters);

        // Apply filters
        searchResults = applyFilters(searchResults, filters);

        // Sort by relevance
        searchResults = sortByRelevance(searchResults);

        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [isInitialized, filters, setResults, setIsLoading]
  );

  // Handle search query change
  useEffect(() => {
    if (isOpen && query) {
      performSearch(query);
    }
  }, [query, isOpen, performSearch]);

  // Handle filter changes
  const handleFiltersChange = useCallback(() => {
    if (query) {
      performSearch(query);
    }
  }, [query, performSearch]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to toggle search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          closeSearch();
          onClose?.();
        } else {
          useSearchStore.getState().openSearch();
        }
        return;
      }

      // Only handle these keys when search is open
      if (!isOpen) return;

      // Escape to close
      if (e.key === 'Escape') {
        e.preventDefault();
        closeSearch();
        onClose?.();
        return;
      }

      // Arrow keys for navigation
      if (results.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          moveSelectionDown();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          moveSelectionUp();
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
          e.preventDefault();
          // Trigger click on selected result
          const selectedResult = results[selectedIndex];
          if (selectedResult) {
            // The SearchResults component will handle navigation
            document.querySelector<HTMLButtonElement>(
              `[data-result-index="${selectedIndex}"]`
            )?.click();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeSearch, onClose, results, selectedIndex, moveSelectionUp, moveSelectionDown]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        closeSearch();
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, closeSearch, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  // Clear search on close
  useEffect(() => {
    if (!isOpen) {
      // Small delay to allow animations
      const timer = setTimeout(() => {
        clearSearch();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, clearSearch]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity" />

      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-start justify-center p-4 pt-[10vh]">
          <div
            ref={modalRef}
            className="w-full max-w-3xl bg-white rounded-xl shadow-2xl overflow-hidden transform transition-all"
          >
            {/* Header */}
            <div className="border-b border-gray-200">
              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-sm font-medium text-gray-700">Search</span>
                <button
                  onClick={() => {
                    closeSearch();
                    onClose?.();
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Close search"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Search Bar */}
              <SearchBar onSearch={performSearch} />
            </div>

            {/* Content */}
            <div className="max-h-[60vh] overflow-y-auto">
              {query ? (
                <>
                  {/* Results */}
                  <div className="p-2">
                    <SearchResults results={results} />
                  </div>

                  {/* Filters */}
                  <SearchFilters onFiltersChange={handleFiltersChange} />
                </>
              ) : (
                /* Suggestions when no query */
                <SearchSuggestions onSuggestionClick={performSearch} />
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-white border border-gray-300 rounded font-mono text-xs">
                      ↑
                    </kbd>
                    <kbd className="px-2 py-1 bg-white border border-gray-300 rounded font-mono text-xs">
                      ↓
                    </kbd>
                    <span>to navigate</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-white border border-gray-300 rounded font-mono text-xs">
                      Enter
                    </kbd>
                    <span>to select</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-white border border-gray-300 rounded font-mono text-xs">
                      Esc
                    </kbd>
                    <span>to close</span>
                  </div>
                </div>
                {results.length > 0 && (
                  <span className="text-gray-600 font-medium">
                    {results.length} {results.length === 1 ? 'result' : 'results'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
