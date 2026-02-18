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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading lessons...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-600">{error}</p>
          <p className="text-sm text-gray-500 mt-2">
            Make sure the backend server is running at http://localhost:3001
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Lessons</h1>
        <p className="text-gray-600">
          Choose your learning track and start mastering test automation
        </p>
      </div>

      {/* Track Selector */}
      <div className="mb-8 flex gap-4">
        <button
          onClick={() => setSelectedTrack('playwright')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            selectedTrack === 'playwright'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🎭 Playwright
        </button>
        <button
          onClick={() => setSelectedTrack('selenium')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            selectedTrack === 'selenium'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🔧 Selenium
        </button>
      </div>

      {/* Statistics */}
      {index && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-indigo-600">
              {index.tracks[selectedTrack].totalLessons}
            </div>
            <div className="text-sm text-gray-600">Total Lessons</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-indigo-600">
              {Object.values(index.tracks[selectedTrack].categories).reduce(
                (sum, cat) => sum + cat.estimatedHours,
                0
              )}h
            </div>
            <div className="text-sm text-gray-600">Estimated Time</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-indigo-600">
              {Object.keys(index.tracks[selectedTrack].categories).length}
            </div>
            <div className="text-sm text-gray-600">Categories</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-indigo-600">
              {lessons.reduce((sum, lesson) => sum + lesson.estimatedXP, 0)}
            </div>
            <div className="text-sm text-gray-600">Total XP</div>
          </div>
        </div>
      )}

      {/* Lessons by Category */}
      {Object.entries(groupedLessons).map(([category, categoryLessons]) => (
        <div key={category} className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 capitalize">
            {category} Level
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryLessons.map((lesson) => (
              <Link
                key={lesson.id}
                to={`/lessons/${lesson.id}`}
                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {lesson.title}
                  </h3>
                  <span className="text-sm text-indigo-600 font-medium">
                    {lesson.duration}min
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {lesson.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {lesson.estimatedXP} XP
                  </span>
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                    Lesson {lesson.order}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}

      {lessons.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-600">No lessons found for this track.</p>
        </div>
      )}
    </div>
  );
}
