import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Code,
  CreditCard,
  HelpCircle,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { SearchResult, SearchResultType } from '../../types/search.types';
import { useSearchStore } from '../../stores/searchStore';

interface SearchResultsProps {
  results: SearchResult[];
  onResultClick?: (result: SearchResult) => void;
  maxResults?: number;
  showAll?: boolean;
}

const typeIcons: Record<SearchResultType, React.ElementType> = {
  lesson: FileText,
  exercise: Code,
  flashcard: CreditCard,
  quiz: HelpCircle,
};

const typeColors: Record<SearchResultType, string> = {
  lesson: 'text-blue-600 bg-blue-50',
  exercise: 'text-green-600 bg-green-50',
  flashcard: 'text-purple-600 bg-purple-50',
  quiz: 'text-orange-600 bg-orange-50',
};

const typeLabels: Record<SearchResultType, string> = {
  lesson: 'Lesson',
  exercise: 'Exercise',
  flashcard: 'Flashcard',
  quiz: 'Quiz',
};

const difficultyColors: Record<string, string> = {
  easy: 'text-green-600 bg-green-50',
  medium: 'text-yellow-600 bg-yellow-50',
  hard: 'text-red-600 bg-red-50',
};

export default function SearchResults({
  results,
  onResultClick,
  maxResults = 10,
  showAll = false,
}: SearchResultsProps) {
  const navigate = useNavigate();
  const { selectedIndex, closeSearch, trackAnalytics, addRecentSearch, query, filters } =
    useSearchStore();

  const displayResults = showAll ? results : results.slice(0, maxResults);
  const hasMoreResults = !showAll && results.length > maxResults;

  const handleResultClick = (result: SearchResult, index: number) => {
    // Track analytics
    trackAnalytics({
      query,
      resultsCount: results.length,
      filters,
      selectedResultId: result.id,
      selectedResultType: result.type,
    });

    // Add to recent searches
    addRecentSearch(query, results.length);

    // Close search modal
    closeSearch();

    // Navigate to result
    navigate(result.url);

    // Call optional callback
    onResultClick?.(result);
  };

  if (results.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No results found</h3>
        <p className="text-gray-500">
          Try adjusting your search or filters to find what you're looking for
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {displayResults.map((result, index) => {
        const Icon = typeIcons[result.type];
        const isSelected = index === selectedIndex;

        return (
          <button
            key={result.id}
            onClick={() => handleResultClick(result, index)}
            data-result-index={index}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors group ${
              isSelected
                ? 'bg-blue-50 border-2 border-blue-500'
                : 'hover:bg-gray-50 border-2 border-transparent'
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Type Icon */}
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                  typeColors[result.type]
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Title */}
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4
                    className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors"
                    dangerouslySetInnerHTML={{
                      __html: result.highlights?.title || result.title,
                    }}
                  />
                  <ChevronRight
                    className={`flex-shrink-0 w-5 h-5 text-gray-400 transition-transform ${
                      isSelected ? 'translate-x-1' : ''
                    }`}
                  />
                </div>

                {/* Description */}
                <p
                  className="text-sm text-gray-600 line-clamp-2 mb-2"
                  dangerouslySetInnerHTML={{
                    __html: result.highlights?.description || result.description,
                  }}
                />

                {/* Metadata */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Type Badge */}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-700">
                    {typeLabels[result.type]}
                  </span>

                  {/* Difficulty Badge */}
                  {result.difficulty && result.difficulty !== 'all' && (
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${
                        difficultyColors[result.difficulty]
                      }`}
                    >
                      {result.difficulty.charAt(0).toUpperCase() + result.difficulty.slice(1)}
                    </span>
                  )}

                  {/* Category */}
                  {result.category && (
                    <span className="text-xs text-gray-500">{result.category}</span>
                  )}

                  {/* Duration */}
                  {result.metadata?.duration && (
                    <span className="text-xs text-gray-500">
                      {result.metadata.duration} min
                    </span>
                  )}

                  {/* Score (for debugging) */}
                  {result.score !== undefined && process.env.NODE_ENV === 'development' && (
                    <span className="text-xs text-gray-400">
                      Score: {result.score.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Tags */}
                {result.tags && result.tags.length > 0 && (
                  <div className="flex items-center gap-1 mt-2 flex-wrap">
                    {result.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-1.5 py-0.5 text-xs text-gray-600 bg-gray-100 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {result.tags.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{result.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </button>
        );
      })}

      {/* Show More */}
      {hasMoreResults && (
        <div className="pt-2 px-4 text-center">
          <p className="text-sm text-gray-500">
            Showing {displayResults.length} of {results.length} results
          </p>
        </div>
      )}
    </div>
  );
}
