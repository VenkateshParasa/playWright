import { useState } from 'react';
import {
  Filter,
  ChevronDown,
  X,
  Calendar,
  BarChart3,
  Tag,
  CheckCircle2,
  ArrowUpDown,
} from 'lucide-react';
import { LessonFilters, LessonTrack, DifficultyLevel, SortOption } from '../../types/lesson.types';
import { lessonTags } from '../../data/mockLessons';

interface LessonFiltersProps {
  filters: LessonFilters;
  onFilterChange: (filters: LessonFilters) => void;
  totalResults: number;
  className?: string;
}

export default function LessonFiltersComponent({
  filters,
  onFilterChange,
  totalResults,
  className = '',
}: LessonFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const updateFilter = (key: keyof LessonFilters, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const toggleTag = (tagId: string) => {
    const newTags = filters.tags.includes(tagId)
      ? filters.tags.filter((t) => t !== tagId)
      : [...filters.tags, tagId];
    updateFilter('tags', newTags);
  };

  const clearFilters = () => {
    onFilterChange({
      track: 'all',
      difficulty: 'all',
      status: 'all',
      week: 'all',
      tags: [],
      searchQuery: filters.searchQuery, // Keep search query
      sortBy: 'order',
      sortOrder: 'asc',
    });
  };

  const hasActiveFilters =
    filters.track !== 'all' ||
    filters.difficulty !== 'all' ||
    filters.status !== 'all' ||
    filters.week !== 'all' ||
    filters.tags.length > 0;

  const activeFilterCount =
    (filters.track !== 'all' ? 1 : 0) +
    (filters.difficulty !== 'all' ? 1 : 0) +
    (filters.status !== 'all' ? 1 : 0) +
    (filters.week !== 'all' ? 1 : 0) +
    filters.tags.length;

  return (
    <div className={`bg-white rounded-lg shadow-md p-5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          {activeFilterCount > 0 && (
            <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">{totalResults} lessons</span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="lg:hidden p-1 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Toggle filters"
          >
            <ChevronDown
              className={`w-5 h-5 text-gray-600 transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Filters Content */}
      <div
        className={`space-y-4 ${
          isExpanded ? 'block' : 'hidden'
        } lg:block transition-all duration-200`}
      >
        {/* Track Filter */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4" />
            Learning Track
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['all', '30-day', '60-day'] as const).map((track) => (
              <button
                key={track}
                onClick={() => updateFilter('track', track)}
                className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                  filters.track === track
                    ? 'bg-blue-100 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {track === 'all' ? 'All' : track}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Filter */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <BarChart3 className="w-4 h-4" />
            Difficulty
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((difficulty) => (
              <button
                key={difficulty}
                onClick={() => updateFilter('difficulty', difficulty)}
                className={`px-3 py-2 text-sm font-medium rounded-md border capitalize transition-colors ${
                  filters.difficulty === difficulty
                    ? 'bg-blue-100 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {difficulty}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <CheckCircle2 className="w-4 h-4" />
            Status
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['all', 'completed', 'in-progress', 'available', 'locked'] as const).map(
              (status) => (
                <button
                  key={status}
                  onClick={() => updateFilter('status', status)}
                  className={`px-3 py-2 text-sm font-medium rounded-md border capitalize transition-colors ${
                    filters.status === status
                      ? 'bg-blue-100 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {status === 'all' ? 'All' : status.replace('-', ' ')}
                </button>
              )
            )}
          </div>
        </div>

        {/* Week Filter */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4" />
            Week
          </label>
          <select
            value={filters.week}
            onChange={(e) =>
              updateFilter('week', e.target.value === 'all' ? 'all' : parseInt(e.target.value))
            }
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Weeks</option>
            <option value="1">Week 1</option>
            <option value="2">Week 2</option>
            <option value="3">Week 3</option>
            <option value="4">Week 4</option>
          </select>
        </div>

        {/* Tags Filter */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Tag className="w-4 h-4" />
            Tags
          </label>
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
            {lessonTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-all ${
                  filters.tags.includes(tag.id)
                    ? 'bg-blue-100 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <ArrowUpDown className="w-4 h-4" />
            Sort By
          </label>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value as SortOption)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="order">Default Order</option>
              <option value="title">Title</option>
              <option value="difficulty">Difficulty</option>
              <option value="duration">Duration</option>
            </select>
            <select
              value={filters.sortOrder}
              onChange={(e) => updateFilter('sortOrder', e.target.value as 'asc' | 'desc')}
              className="px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
          >
            <X className="w-4 h-4" />
            Clear All Filters
          </button>
        )}
      </div>
    </div>
  );
}

// Active Filters Bar (to show above lesson list)
export function ActiveFiltersBar({
  filters,
  onFilterChange,
  className = '',
}: {
  filters: LessonFilters;
  onFilterChange: (filters: LessonFilters) => void;
  className?: string;
}) {
  const removeFilter = (key: keyof LessonFilters) => {
    if (key === 'tags') {
      onFilterChange({ ...filters, tags: [] });
    } else {
      onFilterChange({ ...filters, [key]: 'all' });
    }
  };

  const removeTag = (tagId: string) => {
    onFilterChange({ ...filters, tags: filters.tags.filter((t) => t !== tagId) });
  };

  const hasActiveFilters =
    filters.track !== 'all' ||
    filters.difficulty !== 'all' ||
    filters.status !== 'all' ||
    filters.week !== 'all' ||
    filters.tags.length > 0;

  if (!hasActiveFilters) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-sm font-medium text-gray-600">Active filters:</span>
      {filters.track !== 'all' && (
        <FilterChip label={`Track: ${filters.track}`} onRemove={() => removeFilter('track')} />
      )}
      {filters.difficulty !== 'all' && (
        <FilterChip
          label={`Difficulty: ${filters.difficulty}`}
          onRemove={() => removeFilter('difficulty')}
        />
      )}
      {filters.status !== 'all' && (
        <FilterChip
          label={`Status: ${filters.status}`}
          onRemove={() => removeFilter('status')}
        />
      )}
      {filters.week !== 'all' && (
        <FilterChip label={`Week: ${filters.week}`} onRemove={() => removeFilter('week')} />
      )}
      {filters.tags.map((tagId) => {
        const tag = lessonTags.find((t) => t.id === tagId);
        return tag ? (
          <FilterChip key={tagId} label={tag.name} onRemove={() => removeTag(tagId)} />
        ) : null;
      })}
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full border border-blue-200">
      <span>{label}</span>
      <button
        onClick={onRemove}
        className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}
