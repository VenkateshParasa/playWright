// Component Showcase - Example usage of lesson components
// This file demonstrates how to use each component

import React from 'react';
import {
  LessonCard,
  CompactLessonCard,
  ProgressBadge,
  ProgressIcon,
  ProgressIndicator,
  LessonSearch,
  LessonFilters,
  LessonList,
} from '../components/lessons';
import { Lesson, LessonFilters as LessonFiltersType } from '../types/lesson.types';
import { mockLessons } from '../data/mockLessons';

// Example: Using LessonCard
export function LessonCardExample() {
  const lesson = mockLessons[0];

  return (
    <div className="p-4 max-w-md">
      <h2 className="text-xl font-bold mb-4">Lesson Card Example</h2>
      <LessonCard lesson={lesson} onClick={() => console.log('Clicked:', lesson.id)} />
    </div>
  );
}

// Example: Using CompactLessonCard
export function CompactLessonCardExample() {
  const lesson = mockLessons[1];

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Compact Lesson Card Example</h2>
      <CompactLessonCard lesson={lesson} />
    </div>
  );
}

// Example: Using ProgressBadge
export function ProgressBadgeExample() {
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold mb-4">Progress Badge Examples</h2>

      <div className="space-y-2">
        <h3 className="font-semibold">Status Badges:</h3>
        <div className="flex flex-wrap gap-3">
          <ProgressBadge status="completed" />
          <ProgressBadge status="in-progress" progress={45} />
          <ProgressBadge status="available" />
          <ProgressBadge status="locked" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Sizes:</h3>
        <div className="flex flex-wrap items-center gap-3">
          <ProgressBadge status="completed" size="sm" />
          <ProgressBadge status="completed" size="md" />
          <ProgressBadge status="completed" size="lg" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Progress Indicator:</h3>
        <div className="max-w-sm">
          <ProgressIndicator progress={65} status="in-progress" />
        </div>
      </div>
    </div>
  );
}

// Example: Using LessonSearch
export function LessonSearchExample() {
  const [searchQuery, setSearchQuery] = React.useState('');

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Lesson Search Example</h2>
      <LessonSearch onSearch={setSearchQuery} placeholder="Search lessons..." />
      {searchQuery && (
        <p className="mt-4 text-sm text-gray-600">Searching for: {searchQuery}</p>
      )}
    </div>
  );
}

// Example: Using LessonFilters
export function LessonFiltersExample() {
  const [filters, setFilters] = React.useState<LessonFiltersType>({
    track: 'all',
    difficulty: 'all',
    status: 'all',
    week: 'all',
    tags: [],
    searchQuery: '',
    sortBy: 'order',
    sortOrder: 'asc',
  });

  return (
    <div className="p-4 max-w-md">
      <h2 className="text-xl font-bold mb-4">Lesson Filters Example</h2>
      <LessonFilters filters={filters} onFilterChange={setFilters} totalResults={20} />
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">Active Filters:</h3>
        <pre className="text-xs overflow-auto">{JSON.stringify(filters, null, 2)}</pre>
      </div>
    </div>
  );
}

// Example: Using LessonList
export function LessonListExample() {
  const [viewMode, setViewMode] = React.useState<'grid' | 'list' | 'grouped'>('grid');
  const lessons = mockLessons.slice(0, 6);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Lesson List Example</h2>

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setViewMode('grid')}
          className={`px-4 py-2 rounded ${
            viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          Grid
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`px-4 py-2 rounded ${
            viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          List
        </button>
        <button
          onClick={() => setViewMode('grouped')}
          className={`px-4 py-2 rounded ${
            viewMode === 'grouped' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          Grouped
        </button>
      </div>

      <LessonList lessons={lessons} viewMode={viewMode} />
    </div>
  );
}

// Example: Complete Integration
export function CompleteExample() {
  const [filters, setFilters] = React.useState<LessonFiltersType>({
    track: 'all',
    difficulty: 'all',
    status: 'all',
    week: 'all',
    tags: [],
    searchQuery: '',
    sortBy: 'order',
    sortOrder: 'asc',
  });

  const [viewMode, setViewMode] = React.useState<'grid' | 'list' | 'grouped'>('grid');

  // Filter lessons based on current filters
  const filteredLessons = mockLessons.filter((lesson) => {
    if (filters.track !== 'all' && lesson.track !== filters.track && lesson.track !== 'both') {
      return false;
    }
    if (filters.difficulty !== 'all' && lesson.difficulty !== filters.difficulty) {
      return false;
    }
    if (filters.status !== 'all' && lesson.status !== filters.status) {
      return false;
    }
    if (filters.week !== 'all' && lesson.week !== filters.week) {
      return false;
    }
    if (
      filters.searchQuery &&
      !lesson.title.toLowerCase().includes(filters.searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Complete Lesson Browser Example</h1>

      <div className="mb-6">
        <LessonSearch onSearch={(query) => setFilters({ ...filters, searchQuery: query })} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <LessonFilters
            filters={filters}
            onFilterChange={setFilters}
            totalResults={filteredLessons.length}
          />
        </div>

        <div className="lg:col-span-3">
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded ${
                viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded ${
                viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('grouped')}
              className={`px-4 py-2 rounded ${
                viewMode === 'grouped' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              Grouped
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Showing {filteredLessons.length} of {mockLessons.length} lessons
          </p>

          <LessonList lessons={filteredLessons} viewMode={viewMode} />
        </div>
      </div>
    </div>
  );
}

// Export all examples
export default {
  LessonCardExample,
  CompactLessonCardExample,
  ProgressBadgeExample,
  LessonSearchExample,
  LessonFiltersExample,
  LessonListExample,
  CompleteExample,
};
