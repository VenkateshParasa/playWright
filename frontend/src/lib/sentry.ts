/**
 * Sentry Integration for Error Tracking
 *
 * Features:
 * - Initialize Sentry SDK
 * - Capture exceptions automatically
 * - Custom error boundaries
 * - Breadcrumb logging
 * - User context tracking
 * - Release tracking
 * - Environment tagging
 * - Performance monitoring
 *
 * Required package: npm install @sentry/react
 */

import * as Sentry from '@sentry/react';

// Environment configuration
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT || 'development';
const RELEASE = import.meta.env.VITE_APP_VERSION || '1.0.0';

// Performance monitoring sample rates
const TRACES_SAMPLE_RATE = {
  production: 0.1,  // 10% in production
  staging: 0.5,     // 50% in staging
  development: 1.0  // 100% in development
};

const REPLAYS_SESSION_SAMPLE_RATE = {
  production: 0.1,
  staging: 0.5,
  development: 0
};

const REPLAYS_ERROR_SAMPLE_RATE = {
  production: 1.0,
  staging: 1.0,
  development: 0
};

/**
 * Initialize Sentry SDK
 */
export function initSentry(): void {
  // Skip initialization if DSN is not configured
  if (!SENTRY_DSN) {
    console.warn('Sentry DSN not configured. Error tracking is disabled.');
    return;
  }

  // Skip initialization in development if explicitly disabled
  if (ENVIRONMENT === 'development' && import.meta.env.VITE_DISABLE_SENTRY === 'true') {
    console.info('Sentry disabled in development mode');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,
    release: `learning-platform@${RELEASE}`,

    // Enable performance monitoring
    integrations: [
      new Sentry.BrowserTracing({
        // Set sampling rate for performance monitoring
        tracePropagationTargets: ['localhost', /^https:\/\/yourserver\.io\/api/],
      }),
      new Sentry.Replay({
        // Mask all text content, images, and user input
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Performance Monitoring
    tracesSampleRate: TRACES_SAMPLE_RATE[ENVIRONMENT as keyof typeof TRACES_SAMPLE_RATE] || 0,

    // Session Replay
    replaysSessionSampleRate: REPLAYS_SESSION_SAMPLE_RATE[ENVIRONMENT as keyof typeof REPLAYS_SESSION_SAMPLE_RATE] || 0,
    replaysOnErrorSampleRate: REPLAYS_ERROR_SAMPLE_RATE[ENVIRONMENT as keyof typeof REPLAYS_ERROR_SAMPLE_RATE] || 0,

    // Filter out sensitive data
    beforeSend(event, hint) {
      // Remove sensitive data from event
      if (event.request) {
        delete event.request.cookies;

        // Remove authorization headers
        if (event.request.headers) {
          delete event.request.headers['Authorization'];
          delete event.request.headers['authorization'];
        }
      }

      // Filter out certain errors
      const error = hint.originalException;
      if (error && typeof error === 'object' && 'message' in error) {
        const message = String(error.message);

        // Ignore network errors from browser extensions
        if (message.includes('chrome-extension://') || message.includes('moz-extension://')) {
          return null;
        }

        // Ignore ResizeObserver errors (harmless browser quirk)
        if (message.includes('ResizeObserver')) {
          return null;
        }
      }

      return event;
    },

    // Breadcrumbs configuration
    beforeBreadcrumb(breadcrumb, hint) {
      // Filter out console breadcrumbs in production
      if (breadcrumb.category === 'console' && ENVIRONMENT === 'production') {
        return null;
      }

      // Sanitize URLs in breadcrumbs
      if (breadcrumb.data && breadcrumb.data.url) {
        breadcrumb.data.url = sanitizeUrl(breadcrumb.data.url);
      }

      return breadcrumb;
    },

    // Ignore certain errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'atomicFindClose',
      // Network errors
      'NetworkError',
      'Failed to fetch',
      'Load failed',
      // Random plugins/extensions
      'fb_xd_fragment',
      'bmi_SafeAddOnload',
      'EBCallBackMessageReceived',
      // Common user errors
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
    ],

    // Deny URLs (e.g., browser extensions)
    denyUrls: [
      /extensions\//i,
      /^chrome:\/\//i,
      /^moz-extension:\/\//i,
    ],
  });

  console.info(`Sentry initialized for ${ENVIRONMENT} environment`);
}

/**
 * Set user context for error tracking
 */
export function setUserContext(user: {
  id: string;
  email?: string;
  username?: string;
}): void {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });
}

/**
 * Clear user context (e.g., on logout)
 */
export function clearUserContext(): void {
  Sentry.setUser(null);
}

/**
 * Add breadcrumb for tracking user actions
 */
export function addBreadcrumb(
  message: string,
  category: string,
  level: 'debug' | 'info' | 'warning' | 'error' | 'fatal' = 'info',
  data?: Record<string, any>
): void {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data: data ? sanitizeData(data) : undefined,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Capture exception manually
 */
export function captureException(error: Error, context?: Record<string, any>): void {
  Sentry.captureException(error, {
    contexts: context ? { custom: sanitizeData(context) } : undefined,
  });
}

/**
 * Capture message manually
 */
export function captureMessage(
  message: string,
  level: 'debug' | 'info' | 'warning' | 'error' | 'fatal' = 'info',
  context?: Record<string, any>
): void {
  Sentry.captureMessage(message, {
    level,
    contexts: context ? { custom: sanitizeData(context) } : undefined,
  });
}

/**
 * Set custom tags for context
 */
export function setTag(key: string, value: string): void {
  Sentry.setTag(key, value);
}

/**
 * Set multiple tags at once
 */
export function setTags(tags: Record<string, string>): void {
  Sentry.setTags(tags);
}

/**
 * Set custom context
 */
export function setContext(key: string, context: Record<string, any>): void {
  Sentry.setContext(key, sanitizeData(context));
}

/**
 * Start a new transaction for performance monitoring
 */
export function startTransaction(
  name: string,
  op: string,
  description?: string
): Sentry.Transaction {
  return Sentry.startTransaction({
    name,
    op,
    description,
  });
}

/**
 * Wrap a function with error handling
 */
export function withErrorHandler<T extends (...args: any[]) => any>(
  fn: T,
  errorMessage?: string
): T {
  return ((...args: Parameters<T>) => {
    try {
      const result = fn(...args);

      // Handle async functions
      if (result instanceof Promise) {
        return result.catch((error) => {
          captureException(error, {
            function: fn.name,
            arguments: sanitizeData(args),
            customMessage: errorMessage,
          });
          throw error;
        });
      }

      return result;
    } catch (error) {
      captureException(error as Error, {
        function: fn.name,
        arguments: sanitizeData(args),
        customMessage: errorMessage,
      });
      throw error;
    }
  }) as T;
}

/**
 * Sanitize sensitive data before sending to Sentry
 */
function sanitizeData(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sensitiveKeys = [
    'password',
    'token',
    'apiKey',
    'secret',
    'authorization',
    'creditCard',
    'ssn',
  ];

  const sanitized = Array.isArray(data) ? [...data] : { ...data };

  for (const key in sanitized) {
    if (typeof key === 'string') {
      const lowerKey = key.toLowerCase();

      // Check if key contains sensitive information
      if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive.toLowerCase()))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'object') {
        sanitized[key] = sanitizeData(sanitized[key]);
      }
    }
  }

  return sanitized;
}

/**
 * Sanitize URLs by removing query parameters with sensitive data
 */
function sanitizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const sensitiveParams = ['token', 'key', 'password', 'secret'];

    sensitiveParams.forEach(param => {
      if (urlObj.searchParams.has(param)) {
        urlObj.searchParams.set(param, '[REDACTED]');
      }
    });

    return urlObj.toString();
  } catch {
    return url;
  }
}

/**
 * Error boundary HOC
 */
export const withSentryErrorBoundary = Sentry.withErrorBoundary;

/**
 * Profiler for React components
 */
export const SentryProfiler = Sentry.Profiler;

export default {
  initSentry,
  setUserContext,
  clearUserContext,
  addBreadcrumb,
  captureException,
  captureMessage,
  setTag,
  setTags,
  setContext,
  startTransaction,
  withErrorHandler,
  withSentryErrorBoundary,
  SentryProfiler,
};
