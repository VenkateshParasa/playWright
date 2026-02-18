import { Clock, TrendingUp, X } from 'lucide-react';
import { useSearchStore } from '../../stores/searchStore';
import { SearchSuggestion } from '../../types/search.types';

interface SearchSuggestionsProps {
  suggestions?: SearchSuggestion[];
  onSuggestionClick?: (suggestion: string) => void;
  className?: string;
}

export default function SearchSuggestions({
  suggestions = [],
  onSuggestionClick,
  className = '',
}: SearchSuggestionsProps) {
  const { recentSearches, removeRecentSearch, clearRecentSearches, setQuery } = useSearchStore();

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSuggestionClick?.(suggestion);
  };

  const handleRecentSearchClick = (query: string) => {
    setQuery(query);
    onSuggestionClick?.(query);
  };

  const handleRemoveRecentSearch = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    removeRecentSearch(id);
  };

  const hasContent = suggestions.length > 0 || recentSearches.length > 0;

  if (!hasContent) {
    return null;
  }

  return (
    <div className={`border-t border-gray-200 ${className}`}>
      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">
              Suggestions
            </span>
          </div>
          <div className="space-y-1">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion.text)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">
                    {suggestion.text}
                  </span>
                  {suggestion.count !== undefined && (
                    <span className="text-xs text-gray-500">
                      {suggestion.count} {suggestion.count === 1 ? 'result' : 'results'}
                    </span>
                  )}
                </div>
                {suggestion.type && (
                  <span className="text-xs text-gray-500 capitalize">
                    in {suggestion.type}s
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                Recent Searches
              </span>
            </div>
            <button
              onClick={clearRecentSearches}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear all
            </button>
          </div>
          <div className="space-y-1">
            {recentSearches.slice(0, 5).map((search) => (
              <button
                key={search.id}
                onClick={() => handleRecentSearchClick(search.query)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors group flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 group-hover:text-gray-900 truncate">
                      {search.query}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-500">
                      {search.resultsCount} {search.resultsCount === 1 ? 'result' : 'results'}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">
                      {formatRelativeTime(search.timestamp)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => handleRemoveRecentSearch(e, search.id)}
                  className="flex-shrink-0 ml-2 p-1 rounded hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove from recent searches"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Tips */}
      <div className="px-4 py-3 bg-blue-50 border-t border-blue-100">
        <p className="text-xs text-blue-700">
          <strong>Tip:</strong> Use filters to narrow down your search results by type, difficulty,
          or track.
        </p>
      </div>
    </div>
  );
}

/**
 * Format timestamp as relative time
 */
function formatRelativeTime(timestamp: Date): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  return date.toLocaleDateString();
}
