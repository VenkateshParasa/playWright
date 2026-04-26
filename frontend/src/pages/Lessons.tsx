import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchLessonIndex, fetchLessonsByTrack } from '@/lib/api/lessons';
import { Lesson, LessonIndex } from '@/types/lesson';

export default function Lessons() {
  const [index, setIndex] = useState<LessonIndex | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<'playwright' | 'selenium'>('playwright');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const indexData = await fetchLessonIndex();
        setIndex(indexData);
        
        const lessonsData = await fetchLessonsByTrack(selectedTrack);
        setLessons(lessonsData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load lessons');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [selectedTrack]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" role="status" aria-live="polite">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" aria-hidden="true"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading lessons...</p>
          <span className="sr-only">Loading content, please wait</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" role="alert" aria-live="assertive">
        <div className="max-w-md text-center p-6 bg-white rounded-lg shadow-soft">
          <div className="text-red-600 text-5xl mb-4" aria-hidden="true">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Lessons</h2>
          <p className="text-gray-600 mb-2">{error}</p>
          <p className="text-sm text-gray-500 mb-6">
            Make sure the backend server is running at http://localhost:3001
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
            aria-label="Retry loading lessons"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const groupedLessons = lessons.reduce((acc, lesson) => {
    if (!acc[lesson.category]) {
      acc[lesson.category] = [];
    }
    acc[lesson.category].push(lesson);
    return acc;
  }, {} as Record<string, Lesson[]>);

  return (
    <div className="animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Lessons</h1>
        <p className="text-gray-600 text-lg">
          Choose your learning track and start mastering test automation
        </p>
      </div>

      {/* Track Selector */}
      <div className="mb-8 flex flex-wrap gap-3" role="tablist" aria-label="Learning tracks">
        <button
          onClick={() => setSelectedTrack('playwright')}
          role="tab"
          aria-selected={selectedTrack === 'playwright'}
          aria-controls="lessons-content"
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            selectedTrack === 'playwright'
              ? 'bg-indigo-600 text-white shadow-md scale-105'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <span aria-hidden="true">🎭</span> Playwright
        </button>
        <button
          onClick={() => setSelectedTrack('selenium')}
          role="tab"
          aria-selected={selectedTrack === 'selenium'}
          aria-controls="lessons-content"
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            selectedTrack === 'selenium'
              ? 'bg-indigo-600 text-white shadow-md scale-105'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <span aria-hidden="true">🔧</span> Selenium
        </button>
      </div>

      {/* Statistics */}
      {index && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8" role="region" aria-label="Course statistics">
          <div className="card text-center">
            <div className="text-2xl md:text-3xl font-bold text-indigo-600">
              {index.tracks[selectedTrack].totalLessons}
            </div>
            <div className="text-xs md:text-sm text-gray-600 mt-1">Total Lessons</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl md:text-3xl font-bold text-indigo-600">
              {Object.values(index.tracks[selectedTrack].categories).reduce(
                (sum, cat) => sum + cat.estimatedHours,
                0
              )}h
            </div>
            <div className="text-xs md:text-sm text-gray-600 mt-1">Estimated Time</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl md:text-3xl font-bold text-indigo-600">
              {Object.keys(index.tracks[selectedTrack].categories).length}
            </div>
            <div className="text-xs md:text-sm text-gray-600 mt-1">Categories</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl md:text-3xl font-bold text-indigo-600">
              {lessons.reduce((sum, lesson) => sum + lesson.estimatedXP, 0)}
            </div>
            <div className="text-xs md:text-sm text-gray-600 mt-1">Total XP</div>
          </div>
        </div>
      )}

      {/* Lessons by Category */}
      <div id="lessons-content" role="tabpanel" aria-label={`${selectedTrack} lessons`}>
        {Object.entries(groupedLessons).map(([category, categoryLessons]) => (
          <section key={category} className="mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 capitalize flex items-center">
              <span className="w-1 h-8 bg-indigo-600 rounded-full mr-3"></span>
              {category} Level
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {categoryLessons.map((lesson) => (
                <Link
                  key={lesson.id}
                  to={`/lessons/${lesson.id}`}
                  className="card-hover group focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  aria-label={`${lesson.title}, ${lesson.duration} minutes, ${lesson.estimatedXP} XP`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {lesson.title}
                    </h3>
                    <span className="text-sm text-indigo-600 font-medium whitespace-nowrap ml-2 flex-shrink-0">
                      {lesson.duration}min
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {lesson.description}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500 font-medium">
                      {lesson.estimatedXP} XP
                    </span>
                    <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-medium">
                      Lesson {lesson.order}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}

        {lessons.length === 0 && !loading && (
          <div className="text-center py-16 bg-white rounded-lg shadow-soft">
            <div className="text-gray-400 text-6xl mb-4" aria-hidden="true">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Lessons Available</h3>
            <p className="text-gray-600">No lessons found for this track yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
