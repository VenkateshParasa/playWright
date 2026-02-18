import { Filter, X } from 'lucide-react';
import { useState } from 'react';
import { useSearchStore } from '../../stores/searchStore';
import { SearchResultType, SearchDifficulty } from '../../types/search.types';

interface SearchFiltersProps {
  onFiltersChange?: () => void;
  className?: string;
}

const typeOptions: { value: SearchResultType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'lesson', label: 'Lessons' },
  { value: 'exercise', label: 'Exercises' },
  { value: 'flashcard', label: 'Flashcards' },
  { value: 'quiz', label: 'Quizzes' },
];

const difficultyOptions: { value: SearchDifficulty; label: string }[] = [
  { value: 'all', label: 'All Levels' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

const trackOptions = [
  { value: 'all', label: 'All Tracks' },
  { value: '30-day', label: '30-Day Track' },
  { value: '60-day', label: '60-Day Track' },
  { value: 'both', label: 'Both Tracks' },
];

export default function SearchFilters({ onFiltersChange, className = '' }: SearchFiltersProps) {
  const { filters, setFilters, resetFilters } = useSearchStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const activeFiltersCount = [
    filters.type !== 'all',
    filters.difficulty !== 'all',
    filters.track !== 'all',
    filters.category !== 'all',
  ].filter(Boolean).length;

  const handleFilterChange = (key: string, value: any) => {
    setFilters({ [key]: value });
    onFiltersChange?.();
  };

  const handleReset = () => {
    resetFilters();
    onFiltersChange?.();
  };

  return (
    <div className={`border-t border-gray-200 bg-gray-50 ${className}`}>
      {/* Filter Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Filters</span>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-blue-600 text-white rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleReset();
              }}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear all
            </button>
          )}
          <span className="text-gray-400 text-sm">
            {isExpanded ? '▲' : '▼'}
          </span>
        </div>
      </button>

      {/* Filter Options */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Type Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Content Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {typeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleFilterChange('type', option.value)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    filters.type === option.value
                      ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Difficulty Level
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {difficultyOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleFilterChange('difficulty', option.value)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    filters.difficulty === option.value
                      ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Track Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Learning Track
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {trackOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleFilterChange('track', option.value)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    filters.track === option.value
                      ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Filters Summary */}
          {activeFiltersCount > 0 && (
            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700">Active Filters</span>
                <button
                  onClick={handleReset}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.type !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                    Type: {typeOptions.find((o) => o.value === filters.type)?.label}
                    <button
                      onClick={() => handleFilterChange('type', 'all')}
                      className="hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.difficulty !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                    Level: {difficultyOptions.find((o) => o.value === filters.difficulty)?.label}
                    <button
                      onClick={() => handleFilterChange('difficulty', 'all')}
                      className="hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.track !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                    Track: {trackOptions.find((o) => o.value === filters.track)?.label}
                    <button
                      onClick={() => handleFilterChange('track', 'all')}
                      className="hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
