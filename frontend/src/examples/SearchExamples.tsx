/**
 * Search Feature Examples
 *
 * This file demonstrates various ways to use the Global Search functionality
 */

import { useSearch, useSearchShortcut } from '../hooks/useSearch';
import { useSearchStore } from '../stores/searchStore';
import { getSearchIndex } from '../lib/search';

// =============================================================================
// Example 1: Basic Search Usage in a Component
// =============================================================================

export function BasicSearchExample() {
  const { query, results, performSearch } = useSearch();

  const handleSearch = async () => {
    await performSearch('playwright');
    console.log('Search results:', results);
  };

  return (
    <div>
      <button onClick={handleSearch}>
        Search for "playwright"
      </button>
      <div>Found {results.length} results</div>
    </div>
  );
}

// =============================================================================
// Example 2: Using Search Store Directly
// =============================================================================

export function DirectStoreExample() {
  const {
    query,
    results,
    setQuery,
    openSearch,
    filters,
    setFilters
  } = useSearchStore();

  const handleCustomSearch = () => {
    // Set query
    setQuery('page object model');

    // Set filters
    setFilters({
      type: 'lesson',
      difficulty: 'medium',
    });

    // Open search modal
    openSearch();
  };

  return (
    <button onClick={handleCustomSearch}>
      Open Search with Filters
    </button>
  );
}

// =============================================================================
// Example 3: Keyboard Shortcut Hook
// =============================================================================

export function KeyboardShortcutExample() {
  // Automatically sets up Cmd/Ctrl + K shortcut
  const { openSearch, isOpen } = useSearchShortcut();

  return (
    <div>
      <p>Press Cmd/Ctrl + K to open search</p>
      <p>Search is {isOpen ? 'open' : 'closed'}</p>
      <button onClick={openSearch}>Or click here</button>
    </div>
  );
}

// =============================================================================
// Example 4: Recent Searches
// =============================================================================

export function RecentSearchesExample() {
  const {
    recentSearches,
    removeRecentSearch,
    clearRecentSearches
  } = useSearchStore();

  return (
    <div>
      <h3>Recent Searches</h3>
      <ul>
        {recentSearches.map((search) => (
          <li key={search.id}>
            {search.query} - {search.resultsCount} results
            <button onClick={() => removeRecentSearch(search.id)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
      <button onClick={clearRecentSearches}>Clear All</button>
    </div>
  );
}

// =============================================================================
// Example 5: Custom Search with Index
// =============================================================================

export function CustomSearchExample() {
  const searchContent = async (query: string) => {
    const index = getSearchIndex();

    // Get all items of a specific type
    const lessons = index.getItemsByType('lesson');
    console.log('Total lessons:', lessons.length);

    // Perform search
    const results = index.search(query, 10);
    console.log('Search results:', results);

    // Get categories
    const categories = index.getCategories();
    console.log('Available categories:', categories);

    // Get tags
    const tags = index.getTags();
    console.log('Available tags:', tags);

    return results;
  };

  return (
    <button onClick={() => searchContent('selenium')}>
      Custom Search
    </button>
  );
}

// =============================================================================
// Example 6: Search Analytics Tracking
// =============================================================================

export function AnalyticsExample() {
  const { trackAnalytics, analytics } = useSearchStore();

  const handleSearchComplete = (query: string, selectedId: string) => {
    trackAnalytics({
      query,
      resultsCount: 42,
      filters: {
        type: 'lesson',
        difficulty: 'all',
        category: 'all',
        track: 'all',
      },
      selectedResultId: selectedId,
      selectedResultType: 'lesson',
    });
  };

  const viewAnalytics = () => {
    console.log('Search Analytics:', analytics);
    console.log('Total searches:', analytics.length);

    // Most popular searches
    const searchCounts = analytics.reduce((acc, item) => {
      acc[item.query] = (acc[item.query] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('Search frequency:', searchCounts);
  };

  return (
    <div>
      <button onClick={() => handleSearchComplete('test', 'lesson-1')}>
        Track Search
      </button>
      <button onClick={viewAnalytics}>
        View Analytics
      </button>
    </div>
  );
}

// =============================================================================
// Example 7: Programmatic Filter Control
// =============================================================================

export function FilterControlExample() {
  const { filters, setFilters, resetFilters } = useSearchStore();

  const setLessonFilter = () => {
    setFilters({ type: 'lesson' });
  };

  const setDifficultyFilter = () => {
    setFilters({ difficulty: 'hard' });
  };

  const setMultipleFilters = () => {
    setFilters({
      type: 'exercise',
      difficulty: 'medium',
      track: '30-day',
    });
  };

  return (
    <div>
      <h3>Current Filters:</h3>
      <pre>{JSON.stringify(filters, null, 2)}</pre>

      <button onClick={setLessonFilter}>
        Filter Lessons
      </button>
      <button onClick={setDifficultyFilter}>
        Filter Hard
      </button>
      <button onClick={setMultipleFilters}>
        Multiple Filters
      </button>
      <button onClick={resetFilters}>
        Reset Filters
      </button>
    </div>
  );
}

// =============================================================================
// Example 8: Search Index Management
// =============================================================================

export function IndexManagementExample() {
  const rebuildIndex = async () => {
    const { rebuildSearchIndex } = await import('../lib/search');
    await rebuildSearchIndex();
    console.log('Search index rebuilt');
  };

  const inspectIndex = () => {
    const index = getSearchIndex();
    const items = index.getAllItems();

    // Count by type
    const typeCounts = items.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('Index statistics:');
    console.log('Total items:', items.length);
    console.log('By type:', typeCounts);
    console.log('Categories:', index.getCategories().length);
    console.log('Tags:', index.getTags().length);
  };

  return (
    <div>
      <button onClick={rebuildIndex}>
        Rebuild Index
      </button>
      <button onClick={inspectIndex}>
        Inspect Index
      </button>
    </div>
  );
}

// =============================================================================
// Example 9: Keyboard Navigation Demo
// =============================================================================

export function KeyboardNavigationExample() {
  const {
    selectedIndex,
    moveSelectionUp,
    moveSelectionDown,
    results
  } = useSearchStore();

  const selectedResult = results[selectedIndex];

  return (
    <div>
      <h3>Selected Result: {selectedIndex}</h3>
      {selectedResult && (
        <div>
          <h4>{selectedResult.title}</h4>
          <p>{selectedResult.description}</p>
        </div>
      )}

      <button onClick={moveSelectionUp}>↑ Previous</button>
      <button onClick={moveSelectionDown}>↓ Next</button>

      <p>Or use Arrow Up/Down keys</p>
    </div>
  );
}

// =============================================================================
// Example 10: Integration with React Router
// =============================================================================

import { useNavigate } from 'react-router-dom';

export function RouterIntegrationExample() {
  const navigate = useNavigate();
  const { closeSearch } = useSearchStore();

  const handleResultClick = (resultUrl: string) => {
    // Close search modal
    closeSearch();

    // Navigate to result
    navigate(resultUrl);
  };

  return (
    <button onClick={() => handleResultClick('/lessons/lesson-1')}>
      Navigate to Result
    </button>
  );
}
