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
      <div className="flex items-center justify-center min-h-[60vh]" role="status" aria-live="polite">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" aria-hidden="true"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading lesson...</p>
          <span className="sr-only">Loading lesson content, please wait</span>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" role="alert" aria-live="assertive">
        <div className="max-w-md text-center p-8 bg-white rounded-lg shadow-soft">
          <div className="text-red-600 text-6xl mb-4" aria-hidden="true">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Lesson Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "The lesson you're looking for doesn't exist or couldn't be loaded."}
          </p>
          <Link
            to="/lessons"
            className="btn btn-primary"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Lessons
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto animate-fadeIn">
      {/* Header */}
      <header className="mb-8">
        <Link
          to="/lessons"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-6 font-medium transition-colors group"
        >
          <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Lessons
        </Link>
        
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            {lesson.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium capitalize">
              {lesson.track}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-700 font-medium capitalize">
              {lesson.category}
            </span>
            <span className="inline-flex items-center text-gray-600">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {lesson.duration} minutes
            </span>
            <span className="inline-flex items-center text-gray-600">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              {lesson.estimatedXP} XP
            </span>
          </div>
        </div>
      </header>

      {/* Description */}
      <div className="card bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-100 mb-8">
        <p className="text-gray-700 text-lg leading-relaxed">{lesson.description}</p>
      </div>

      {/* Learning Objectives */}
      <section className="mb-10" aria-labelledby="objectives-heading">
        <h2 id="objectives-heading" className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="w-1 h-8 bg-indigo-600 rounded-full mr-3"></span>
          Learning Objectives
        </h2>
        <ul className="space-y-3 card">
          {lesson.objectives.map((objective, index) => (
            <li key={index} className="flex items-start group">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 mt-0.5 group-hover:bg-indigo-600 group-hover:text-white transition-colors" aria-hidden="true">
                ✓
              </span>
              <span className="text-gray-700 leading-relaxed">{objective}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Lesson Content */}
      <section className="mb-10" aria-labelledby="content-heading">
        <h2 id="content-heading" className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="w-1 h-8 bg-indigo-600 rounded-full mr-3"></span>
          Content
        </h2>
        <div className="space-y-6">
          {lesson.content.sections.map((section, index) => (
            <div key={index} className="card-hover">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 text-sm font-bold">
                  {index + 1}
                </span>
                {section.title}
              </h3>
              
              {section.type === 'text' && section.content && (
                <div className="prose-content">
                  <ReactMarkdown>{section.content}</ReactMarkdown>
                </div>
              )}
              
              {section.type === 'code' && section.code && (
                <div>
                  {section.explanation && (
                    <p className="text-gray-700 mb-4 leading-relaxed">{section.explanation}</p>
                  )}
                  <div className="relative group">
                    <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto scrollbar-thin">
                      <code className={`language-${section.language || 'javascript'}`}>
                        {section.code}
                      </code>
                    </pre>
                    <button
                      onClick={() => navigator.clipboard.writeText(section.code || '')}
                      className="absolute top-3 right-3 p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Copy code to clipboard"
                      title="Copy code"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Key Takeaways */}
      <section className="mb-10" aria-labelledby="takeaways-heading">
        <h2 id="takeaways-heading" className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="w-1 h-8 bg-indigo-600 rounded-full mr-3"></span>
          Key Takeaways
        </h2>
        <ul className="space-y-3 card bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-100">
          {lesson.keyTakeaways.map((takeaway, index) => (
            <li key={index} className="flex items-start group">
              <span className="flex-shrink-0 text-2xl mr-3" aria-hidden="true">💡</span>
              <span className="text-gray-700 leading-relaxed">{takeaway}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Resources */}
      {lesson.resources.length > 0 && (
        <section className="mb-10" aria-labelledby="resources-heading">
          <h2 id="resources-heading" className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="w-1 h-8 bg-indigo-600 rounded-full mr-3"></span>
            Additional Resources
          </h2>
          <div className="space-y-3">
            {lesson.resources.map((resource, index) => (
              <a
                key={index}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card-hover group flex items-center justify-between"
              >
                <div className="flex items-center flex-1 min-w-0">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mr-4">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                      {resource.title}
                    </div>
                    <div className="text-sm text-gray-600 capitalize">
                      {resource.type}
                    </div>
                  </div>
                </div>
                <svg className="w-5 h-5 text-indigo-600 flex-shrink-0 ml-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Navigation */}
      <nav className="flex items-center justify-between pt-8 border-t border-gray-200" aria-label="Lesson navigation">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost group"
          aria-label="Go to previous page"
        >
          <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Previous
        </button>
        
        {lesson.nextLesson && (
          <Link
            to={`/lessons/${lesson.nextLesson}`}
            className="btn btn-primary group"
            aria-label="Go to next lesson"
          >
            Next Lesson
            <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        )}
      </nav>
    </article>
  );
}
