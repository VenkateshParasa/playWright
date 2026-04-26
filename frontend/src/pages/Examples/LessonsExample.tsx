/**
 * Lesson Components Example - Live Route
 * Uses real lessons from useLessonsStore.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LessonCard,
  CompactLessonCard,
  ProgressBadge,
  ProgressIndicator,
  LessonSearch,
  LessonFilters,
  LessonList,
} from '../../components/lessons';
import { LessonFilters as LessonFiltersType } from '../../types/lesson.types';
import { useLessonsStore } from '../../stores/lessonsStore';

export default function LessonsExample() {
  const navigate = useNavigate();
  const { lessons, isLoading } = useLessonsStore();

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

  const filteredLessons = lessons.filter((lesson) => {
    if (filters.track !== 'all' && lesson.track !== filters.track && lesson.track !== 'both') return false;
    if (filters.difficulty !== 'all' && lesson.difficulty !== filters.difficulty) return false;
    if (filters.status !== 'all' && lesson.status !== filters.status) return false;
    if (filters.week !== 'all' && lesson.week !== filters.week) return false;
    if (filters.searchQuery && !lesson.title.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false;
    return true;
  });

  const firstLesson = lessons[0];
  const secondLesson = lessons[1];

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/examples')} className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
          ← Examples
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lesson Components</h1>
          <p className="text-sm text-gray-500 mt-0.5">All lesson UI components with real store data ({lessons.length} lessons loaded)</p>
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-8 text-gray-500">Loading lessons...</div>
      )}

      {/* LessonCard */}
      {firstLesson && (
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">LessonCard</h2>
          <div className="max-w-md">
            <LessonCard lesson={firstLesson} onClick={() => navigate(`/lessons/${firstLesson.id}`)} />
          </div>
        </section>
      )}

      {/* CompactLessonCard */}
      {secondLesson && (
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">CompactLessonCard</h2>
          <div className="max-w-md">
            <CompactLessonCard lesson={secondLesson} />
          </div>
        </section>
      )}

      {/* ProgressBadge */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">ProgressBadge &amp; ProgressIndicator</h2>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <ProgressBadge status="completed" />
            <ProgressBadge status="in-progress" progress={45} />
            <ProgressBadge status="available" />
            <ProgressBadge status="locked" />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ProgressBadge status="completed" size="sm" />
            <ProgressBadge status="completed" size="md" />
            <ProgressBadge status="completed" size="lg" />
          </div>
          <div className="max-w-sm">
            <ProgressIndicator progress={65} status="in-progress" />
          </div>
        </div>
      </section>

      {/* LessonSearch */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">LessonSearch</h2>
        <LessonSearch
          onSearch={(q) => setFilters((f) => ({ ...f, searchQuery: q }))}
          placeholder="Search lessons..."
        />
      </section>

      {/* Complete Integration */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Complete Browser — LessonFilters + LessonList
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <LessonFilters filters={filters} onFilterChange={setFilters} totalResults={filteredLessons.length} />
          </div>
          <div className="lg:col-span-3">
            <div className="mb-4 flex gap-2">
              {(['grid', 'list', 'grouped'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-2 rounded capitalize text-sm font-medium ${
                    viewMode === mode ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Showing {filteredLessons.length} of {lessons.length} lessons
            </p>
            <LessonList lessons={filteredLessons} viewMode={viewMode} />
          </div>
        </div>
      </section>
    </div>
  );
}
