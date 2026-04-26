import { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Lazy load pages for code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Lessons = lazy(() => import('./pages/Lessons'));
const LessonDetail = lazy(() => import('./pages/LessonDetail'));
const Flashcards = lazy(() => import('./pages/Flashcards'));
const Exercises = lazy(() => import('./pages/Exercises'));
const Progress = lazy(() => import('./pages/Progress'));
const Settings = lazy(() => import('./pages/Settings'));
const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Register'));
const ForgotPassword = lazy(() => import('./pages/Auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/Auth/ResetPassword'));

// Examples
const ExamplesIndex = lazy(() => import('./pages/Examples/index'));
const DashboardExample = lazy(() => import('./pages/Examples/DashboardExample'));
const LessonsExample = lazy(() => import('./pages/Examples/LessonsExample'));
const ExercisesExample = lazy(() => import('./pages/Examples/ExercisesExample'));
const AchievementsExample = lazy(() => import('./pages/Examples/AchievementsExample'));
const SearchExample = lazy(() => import('./pages/Examples/SearchExample'));
const NotificationsExample = lazy(() => import('./pages/Examples/NotificationsExample'));

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

// Simple Layout component with improved navigation
function Layout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Dashboard' },
    { to: '/lessons', label: 'Lessons' },
    { to: '/flashcards', label: 'Flashcards' },
    { to: '/exercises', label: 'Exercises' },
    { to: '/progress', label: 'Progress' },
    { to: '/examples', label: 'Examples' },
  ];

  // Check if a link is active
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center mr-2">
                  <span className="text-white font-bold text-sm">TA</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900 hidden sm:block">
                  Test Automation Academy
                </h1>
                <h1 className="text-xl font-bold text-gray-900 sm:hidden">TAA</h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const active = isActive(link.to);
                return active ? (
                  <span
                    key={link.to}
                    className="relative px-3 py-2 text-sm font-medium text-indigo-600 cursor-default"
                    aria-current="page"
                  >
                    {link.label}
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"></span>
                  </span>
                ) : (
                  <a
                    key={link.to}
                    href={link.to}
                    className="relative px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    {link.label}
                  </a>
                );
              })}
              <a
                href="/settings"
                className="text-gray-700 hover:text-indigo-600 p-2 rounded-md transition-colors"
                aria-label="Settings"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </a>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors"
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden animate-slideDown">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              {navLinks.map((link) => {
                const active = isActive(link.to);
                return active ? (
                  <span
                    key={link.to}
                    className="block px-3 py-2 rounded-md text-base font-medium text-indigo-600 bg-indigo-50 cursor-default"
                    aria-current="page"
                  >
                    {link.label}
                  </span>
                ) : (
                  <a
                    key={link.to}
                    href={link.to}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                );
              })}
              <a
                href="/settings"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Settings
              </a>
            </div>
          </div>
        )}
      </nav>
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © 2024 Test Automation Academy. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Simple ProtectedRoute component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // Add your authentication logic here
  return <>{children}</>;
}

// Simple PageTransition wrapper
function PageTransition({ children }: { children: React.ReactNode }) {
  return <div className="animate-fadeIn">{children}</div>;
}

function App() {
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);

  useEffect(() => {
    // Listen for service worker update event
    const handleUpdateAvailable = () => {
      setShowUpdateNotification(true);
    };

    const handleOfflineReady = () => {
      console.log('App is ready for offline use');
    };

    window.addEventListener('sw-update-available', handleUpdateAvailable);
    window.addEventListener('sw-offline-ready', handleOfflineReady);

    return () => {
      window.removeEventListener('sw-update-available', handleUpdateAvailable);
      window.removeEventListener('sw-offline-ready', handleOfflineReady);
    };
  }, []);

  return (
    <Router>
      {/* Update notification when new version available */}
      {showUpdateNotification && (
        <div className="fixed top-4 right-4 bg-white shadow-lg rounded-lg p-4 max-w-sm z-50">
          <p className="text-sm font-medium">A new version is available!</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
          >
            Refresh to update
          </button>
          <button
            onClick={() => setShowUpdateNotification(false)}
            className="ml-4 text-sm text-gray-600 hover:text-gray-500"
          >
            Dismiss
          </button>
        </div>
      )}

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes - Auth Pages */}
          <Route
            path="/login"
            element={
              <PageTransition>
                <Login />
              </PageTransition>
            }
          />
          <Route
            path="/register"
            element={
              <PageTransition>
                <Register />
              </PageTransition>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PageTransition>
                <ForgotPassword />
              </PageTransition>
            }
          />
          <Route
            path="/reset-password"
            element={
              <PageTransition>
                <ResetPassword />
              </PageTransition>
            }
          />

          {/* Protected Routes - Main App */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <PageTransition>
                    <Dashboard />
                  </PageTransition>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/lessons"
            element={
              <ProtectedRoute>
                <Layout>
                  <PageTransition>
                    <Lessons />
                  </PageTransition>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/lessons/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <PageTransition>
                    <LessonDetail />
                  </PageTransition>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/flashcards"
            element={
              <ProtectedRoute>
                <Layout>
                  <PageTransition>
                    <Flashcards />
                  </PageTransition>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/exercises"
            element={
              <ProtectedRoute>
                <Layout>
                  <PageTransition>
                    <Exercises />
                  </PageTransition>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/exercises/:exerciseId"
            element={
              <ProtectedRoute>
                <Layout>
                  <PageTransition>
                    <Exercises />
                  </PageTransition>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/progress"
            element={
              <ProtectedRoute>
                <Layout>
                  <PageTransition>
                    <Progress />
                  </PageTransition>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Layout>
                  <PageTransition>
                    <Settings />
                  </PageTransition>
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Examples Routes */}
          <Route
            path="/examples"
            element={
              <ProtectedRoute>
                <Layout>
                  <PageTransition>
                    <ExamplesIndex />
                  </PageTransition>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/examples/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <PageTransition>
                    <DashboardExample />
                  </PageTransition>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/examples/lessons"
            element={
              <ProtectedRoute>
                <Layout>
                  <PageTransition>
                    <LessonsExample />
                  </PageTransition>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/examples/exercises"
            element={
              <ProtectedRoute>
                <Layout>
                  <PageTransition>
                    <ExercisesExample />
                  </PageTransition>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/examples/achievements"
            element={
              <ProtectedRoute>
                <Layout>
                  <PageTransition>
                    <AchievementsExample />
                  </PageTransition>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/examples/search"
            element={
              <ProtectedRoute>
                <Layout>
                  <PageTransition>
                    <SearchExample />
                  </PageTransition>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/examples/notifications"
            element={
              <ProtectedRoute>
                <Layout>
                  <PageTransition>
                    <NotificationsExample />
                  </PageTransition>
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* 404 Not Found */}
          <Route
            path="*"
            element={
              <PageTransition>
                <div className="text-center py-12">
                  <h1 className="text-4xl font-bold text-gray-900">404</h1>
                  <p className="mt-2 text-gray-600">Page not found</p>
                </div>
              </PageTransition>
            }
          />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
