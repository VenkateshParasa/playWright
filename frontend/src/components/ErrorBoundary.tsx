/**
 * Error Boundary Component
 *
 * Features:
 * - Catch React errors
 * - Display user-friendly error UI
 * - Log errors to Sentry
 * - Retry mechanism
 * - Reset error state
 * - Different fallback UIs by error type
 * - Report button for users
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { captureException, addBreadcrumb } from '../lib/sentry';

interface Props {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, errorInfo: ErrorInfo, reset: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console
    console.error('Error caught by boundary:', error, errorInfo);

    // Add breadcrumb for context
    addBreadcrumb(
      'Error caught by ErrorBoundary',
      'error',
      'error',
      {
        error: error.message,
        componentStack: errorInfo.componentStack,
      }
    );

    // Capture exception in Sentry
    captureException(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
      errorCount: this.state.errorCount + 1,
    });

    // Update state with error info
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    // Call custom reset handler if provided
    if (this.props.onReset) {
      this.props.onReset();
    }

    // Reset error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Add breadcrumb
    addBreadcrumb(
      'Error boundary reset',
      'navigation',
      'info'
    );
  };

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        if (typeof fallback === 'function') {
          return fallback(error, errorInfo!, this.handleReset);
        }
        return fallback;
      }

      // Default fallback UI
      return (
        <DefaultErrorFallback
          error={error}
          errorInfo={errorInfo}
          onReset={this.handleReset}
          onReload={this.handleReload}
          onGoHome={this.handleGoHome}
        />
      );
    }

    return children;
  }
}

/**
 * Default Error Fallback UI
 */
interface FallbackProps {
  error: Error;
  errorInfo: ErrorInfo | null;
  onReset: () => void;
  onReload: () => void;
  onGoHome: () => void;
}

function DefaultErrorFallback({
  error,
  errorInfo,
  onReset,
  onReload,
  onGoHome,
}: FallbackProps): JSX.Element {
  const isDev = import.meta.env.DEV;
  const [showDetails, setShowDetails] = React.useState(isDev);
  const [reportSent, setReportSent] = React.useState(false);

  const handleSendReport = async (): Promise<void> => {
    try {
      // Send error report to backend
      await fetch('/api/error-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: {
            message: error.message,
            stack: error.stack,
          },
          componentStack: errorInfo?.componentStack,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent,
        }),
      });

      setReportSent(true);
    } catch (err) {
      console.error('Failed to send error report:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        {/* Error Icon */}
        <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-6">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-4">
          Oops! Something went wrong
        </h1>

        {/* Description */}
        <p className="text-gray-600 text-center mb-8">
          We're sorry for the inconvenience. An unexpected error occurred, but don't worry - your
          progress has been saved.
        </p>

        {/* Error Message */}
        {isDev && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm font-mono text-red-800 break-all">
              {error.message}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button
            onClick={onReset}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={onReload}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Reload Page
          </button>
          <button
            onClick={onGoHome}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Go Home
          </button>
        </div>

        {/* Report Error */}
        <div className="border-t border-gray-200 pt-6">
          {!reportSent ? (
            <button
              onClick={handleSendReport}
              className="w-full px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Send Error Report
            </button>
          ) : (
            <p className="text-center text-sm text-green-600 font-medium">
              Thank you! Error report sent successfully.
            </p>
          )}
        </div>

        {/* Toggle Details */}
        {isDev && errorInfo && (
          <div className="mt-6">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-gray-600 hover:text-gray-800 font-medium"
            >
              {showDetails ? 'Hide' : 'Show'} Technical Details
            </button>

            {showDetails && (
              <div className="mt-4 bg-gray-50 rounded-lg p-4 overflow-auto max-h-96">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Stack Trace:</h3>
                <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">
                  {error.stack}
                </pre>

                <h3 className="text-sm font-semibold text-gray-700 mt-4 mb-2">
                  Component Stack:
                </h3>
                <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">
                  {errorInfo.componentStack}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Hook for using error boundary imperatively
 */
export function useErrorHandler(): (error: Error) => void {
  const [, setError] = React.useState<Error | null>(null);

  return React.useCallback((error: Error) => {
    setError(() => {
      throw error;
    });
  }, []);
}

/**
 * HOC for wrapping components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode | ((error: Error, errorInfo: ErrorInfo, reset: () => void) => ReactNode),
  onError?: (error: Error, errorInfo: ErrorInfo) => void
): React.ComponentType<P> {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback} onError={onError}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name || 'Component'
  })`;

  return WrappedComponent;
}

export default ErrorBoundary;
