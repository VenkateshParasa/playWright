import { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

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

// Simple Layout component
function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-indigo-600">Test Automation Academy</h1>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
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
