import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchLessonById } from '@/lib/api/lessons';
import { Lesson } from '@/types/lesson';
import ReactMarkdown from 'react-markdown';

export default function LessonDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLesson() {
      if (!id) {
        setError('Lesson ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const lessonData = await fetchLessonById(id);
        setLesson(lessonData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load lesson');
      } finally {
        setLoading(false);
      }
    }

    loadLesson();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-md text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Lesson ID is required
          </h2>
          <p className="text-gray-600 mb-6">
            The lesson you're looking for doesn't exist or couldn't be loaded.
          </p>
          <Link
            to="/lessons"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            ← Back to Lessons
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/lessons"
          className="text-indigo-600 hover:text-indigo-700 mb-4 inline-block"
        >
          ← Back to Lessons
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {lesson.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="capitalize">{lesson.track}</span>
              <span>•</span>
              <span className="capitalize">{lesson.category}</span>
              <span>•</span>
              <span>{lesson.duration} minutes</span>
              <span>•</span>
              <span>{lesson.estimatedXP} XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-indigo-50 p-6 rounded-lg mb-8">
        <p className="text-gray-700">{lesson.description}</p>
      </div>

      {/* Learning Objectives */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Learning Objectives
        </h2>
        <ul className="space-y-2">
          {lesson.objectives.map((objective, index) => (
            <li key={index} className="flex items-start">
              <span className="text-indigo-600 mr-2">✓</span>
              <span className="text-gray-700">{objective}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Lesson Content */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Content</h2>
        <div className="space-y-8">
          {lesson.content.sections.map((section, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {section.title}
              </h3>
              
              {section.type === 'text' && section.content && (
                <div className="prose max-w-none">
                  <ReactMarkdown>{section.content}</ReactMarkdown>
                </div>
              )}
              
              {section.type === 'code' && section.code && (
                <div>
                  {section.explanation && (
                    <p className="text-gray-700 mb-4">{section.explanation}</p>
                  )}
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                    <code className={`language-${section.language || 'javascript'}`}>
                      {section.code}
                    </code>
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Key Takeaways */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Key Takeaways
        </h2>
        <ul className="space-y-2">
          {lesson.keyTakeaways.map((takeaway, index) => (
            <li key={index} className="flex items-start">
              <span className="text-indigo-600 mr-2">💡</span>
              <span className="text-gray-700">{takeaway}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Resources */}
      {lesson.resources.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Additional Resources
          </h2>
          <div className="space-y-2">
            {lesson.resources.map((resource, index) => (
              <a
                key={index}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">
                      {resource.title}
                    </div>
                    <div className="text-sm text-gray-600 capitalize">
                      {resource.type}
                    </div>
                  </div>
                  <span className="text-indigo-600">→</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-8 border-t">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-gray-700 hover:text-gray-900"
        >
          ← Previous
        </button>
        
        {lesson.nextLesson && (
          <Link
            to={`/lessons/${lesson.nextLesson}`}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Next Lesson →
          </Link>
        )}
      </div>
    </div>
  );
}
