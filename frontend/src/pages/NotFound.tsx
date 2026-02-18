import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Animation */}
        <div className="mb-8">
          <div className="inline-block">
            <h1 className="text-9xl font-bold text-blue-600 mb-4 animate-bounce">404</h1>
            <div className="h-2 bg-blue-600 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Error Message */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h2>
          <p className="text-lg text-gray-600 mb-6">
            Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
          </p>

          {/* Suggestions */}
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center justify-center gap-2">
              <Search className="w-5 h-5" />
              What you can do:
            </h3>
            <ul className="text-sm text-gray-700 space-y-2 text-left max-w-md mx-auto">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Check the URL for any typos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Use the navigation menu to find what you need</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Return to the home page and start fresh</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Contact support if you think this is an error</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Home className="w-5 h-5" />
              Go to Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="text-sm text-gray-600">
          <span>Quick links: </span>
          <Link to="/lessons" className="text-blue-600 hover:underline">
            Lessons
          </Link>
          <span className="mx-2">•</span>
          <Link to="/exercises" className="text-blue-600 hover:underline">
            Exercises
          </Link>
          <span className="mx-2">•</span>
          <Link to="/flashcards" className="text-blue-600 hover:underline">
            Flashcards
          </Link>
          <span className="mx-2">•</span>
          <Link to="/progress" className="text-blue-600 hover:underline">
            Progress
          </Link>
        </div>
      </div>
    </div>
  );
}
