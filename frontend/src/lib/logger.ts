/**
 * Frontend Logger Utility
 *
 * Features:
 * - Structured logging (debug, info, warn, error)
 * - Log levels configuration
 * - Console logging in development
 * - Remote logging in production
 * - Log batching for performance
 * - Context enrichment (user, page, timestamp)
 * - Sensitive data filtering
 */

import { captureMessage, captureException, addBreadcrumb } from './sentry';

// Log levels
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

// Log configuration
const LOG_LEVEL = (import.meta.env.VITE_LOG_LEVEL as keyof typeof LogLevel) || 'INFO';
const REMOTE_LOGGING_ENABLED = import.meta.env.VITE_REMOTE_LOGGING !== 'false';
const LOG_API_URL = import.meta.env.VITE_LOG_API_URL || '/api/logs';
const BATCH_SIZE = 10;
const BATCH_INTERVAL = 5000; // 5 seconds

// Types
export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  timestamp: number;
  url: string;
  userAgent: string;
  userId?: string;
  sessionId?: string;
}

// Storage
const logQueue: LogEntry[] = [];
let batchTimer: ReturnType<typeof setTimeout> | null = null;
let currentUserId: string | undefined;
let currentSessionId: string | undefined;

/**
 * Initialize logger
 */
export function initLogger(): void {
  // Get session ID
  currentSessionId = sessionStorage.getItem('analytics-session-id') || undefined;

  // Set up batch processing
  startBatchProcessing();

  // Flush logs before page unload
  window.addEventListener('beforeunload', () => {
    flushLogs();
  });

  console.info(`Logger initialized with level: ${LOG_LEVEL}`);
}

/**
 * Set user ID for log context
 */
export function setLogUserId(userId: string): void {
  currentUserId = userId;
}

/**
 * Clear user ID (e.g., on logout)
 */
export function clearLogUserId(): void {
  currentUserId = undefined;
}

/**
 * Debug log
 */
export function debug(message: string, context?: Record<string, any>): void {
  log(LogLevel.DEBUG, message, context);
}

/**
 * Info log
 */
export function info(message: string, context?: Record<string, any>): void {
  log(LogLevel.INFO, message, context);
}

/**
 * Warning log
 */
export function warn(message: string, context?: Record<string, any>): void {
  log(LogLevel.WARN, message, context);
}

/**
 * Error log
 */
export function error(message: string, context?: Record<string, any>): void {
  log(LogLevel.ERROR, message, context);
}

/**
 * Fatal error log
 */
export function fatal(message: string, context?: Record<string, any>): void {
  log(LogLevel.FATAL, message, context);
}

/**
 * Log exception
 */
export function logException(err: Error, context?: Record<string, any>): void {
  const logEntry: LogEntry = {
    level: LogLevel.ERROR,
    message: err.message,
    context: {
      ...context,
      error: {
        name: err.name,
        message: err.message,
        stack: err.stack,
      },
    },
    timestamp: Date.now(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    userId: currentUserId,
    sessionId: currentSessionId,
  };

  // Console output
  if (shouldLogToConsole(LogLevel.ERROR)) {
    console.error(`[${new Date().toISOString()}] ERROR:`, err.message, context, err);
  }

  // Add to queue
  logQueue.push(logEntry);

  // Also send to Sentry
  captureException(err, sanitizeContext(context));

  // Process queue if needed
  checkQueue();
}

/**
 * Core logging function
 */
function log(level: LogLevel, message: string, context?: Record<string, any>): void {
  // Check if we should log this level
  if (level < LogLevel[LOG_LEVEL as keyof typeof LogLevel]) {
    return;
  }

  // Create log entry
  const logEntry: LogEntry = {
    level,
    message,
    context: sanitizeContext(context),
    timestamp: Date.now(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    userId: currentUserId,
    sessionId: currentSessionId,
  };

  // Console output
  if (shouldLogToConsole(level)) {
    logToConsole(logEntry);
  }

  // Add breadcrumb for Sentry
  if (level >= LogLevel.WARN) {
    const sentryLevel = level === LogLevel.WARN ? 'warning' :
                       level === LogLevel.ERROR ? 'error' : 'fatal';

    addBreadcrumb(message, 'log', sentryLevel, context);
  }

  // Send to Sentry if error or fatal
  if (level >= LogLevel.ERROR) {
    captureMessage(message, level === LogLevel.FATAL ? 'fatal' : 'error', context);
  }

  // Add to queue for remote logging
  if (REMOTE_LOGGING_ENABLED && import.meta.env.PROD) {
    logQueue.push(logEntry);
    checkQueue();
  }
}

/**
 * Check if should log to console
 */
function shouldLogToConsole(level: LogLevel): boolean {
  // Always log to console in development
  if (import.meta.env.DEV) {
    return true;
  }

  // In production, only log warnings and errors
  return level >= LogLevel.WARN;
}

/**
 * Log to console with appropriate method
 */
function logToConsole(entry: LogEntry): void {
  const timestamp = new Date(entry.timestamp).toISOString();
  const levelName = LogLevel[entry.level];

  const logArgs = [
    `[${timestamp}] ${levelName}:`,
    entry.message,
  ];

  if (entry.context) {
    logArgs.push(entry.context);
  }

  switch (entry.level) {
    case LogLevel.DEBUG:
      console.debug(...logArgs);
      break;
    case LogLevel.INFO:
      console.info(...logArgs);
      break;
    case LogLevel.WARN:
      console.warn(...logArgs);
      break;
    case LogLevel.ERROR:
    case LogLevel.FATAL:
      console.error(...logArgs);
      break;
  }
}

/**
 * Sanitize context to remove sensitive data
 */
function sanitizeContext(context?: Record<string, any>): Record<string, any> | undefined {
  if (!context) {
    return undefined;
  }

  const sensitiveKeys = [
    'password',
    'token',
    'apiKey',
    'secret',
    'authorization',
    'creditCard',
    'ssn',
    'pin',
  ];

  const sanitized: Record<string, any> = {};

  for (const key in context) {
    const lowerKey = key.toLowerCase();

    // Check if key is sensitive
    if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof context[key] === 'object' && context[key] !== null) {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeContext(context[key]);
    } else {
      sanitized[key] = context[key];
    }
  }

  return sanitized;
}

/**
 * Check if queue should be processed
 */
function checkQueue(): void {
  if (logQueue.length >= BATCH_SIZE) {
    flushLogs();
  }
}

/**
 * Start batch processing timer
 */
function startBatchProcessing(): void {
  if (batchTimer) {
    clearInterval(batchTimer);
  }

  batchTimer = setInterval(() => {
    if (logQueue.length > 0) {
      flushLogs();
    }
  }, BATCH_INTERVAL);
}

/**
 * Flush logs to backend
 */
async function flushLogs(): Promise<void> {
  if (logQueue.length === 0) {
    return;
  }

  // Get logs to send
  const logsToSend = [...logQueue];
  logQueue.length = 0;

  try {
    // Use sendBeacon for reliability (works even if page is closing)
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify({ logs: logsToSend })], {
        type: 'application/json',
      });
      const sent = navigator.sendBeacon(LOG_API_URL, blob);

      if (!sent) {
        console.warn('Failed to send logs via beacon');
        // Put logs back in queue
        logQueue.unshift(...logsToSend);
      }
    } else {
      // Fallback to fetch
      const response = await fetch(LOG_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs: logsToSend }),
      });

      if (!response.ok) {
        console.warn('Failed to send logs:', response.statusText);
        // Put logs back in queue
        logQueue.unshift(...logsToSend);
      }
    }
  } catch (err) {
    console.error('Error sending logs:', err);
    // Put logs back in queue
    logQueue.unshift(...logsToSend);
  }
}

/**
 * Create logger with context
 */
export function createLogger(defaultContext: Record<string, any>) {
  return {
    debug: (message: string, context?: Record<string, any>) =>
      debug(message, { ...defaultContext, ...context }),

    info: (message: string, context?: Record<string, any>) =>
      info(message, { ...defaultContext, ...context }),

    warn: (message: string, context?: Record<string, any>) =>
      warn(message, { ...defaultContext, ...context }),

    error: (message: string, context?: Record<string, any>) =>
      error(message, { ...defaultContext, ...context }),

    fatal: (message: string, context?: Record<string, any>) =>
      fatal(message, { ...defaultContext, ...context }),

    exception: (err: Error, context?: Record<string, any>) =>
      logException(err, { ...defaultContext, ...context }),
  };
}

/**
 * Timer utility for performance logging
 */
export class Timer {
  private startTime: number;
  private name: string;

  constructor(name: string) {
    this.name = name;
    this.startTime = performance.now();
  }

  end(context?: Record<string, any>): number {
    const duration = performance.now() - this.startTime;

    debug(`Timer: ${this.name}`, {
      ...context,
      duration: `${duration.toFixed(2)}ms`,
    });

    return duration;
  }
}

/**
 * Create timer
 */
export function timer(name: string): Timer {
  return new Timer(name);
}

/**
 * Clean up logger
 */
export function destroyLogger(): void {
  if (batchTimer) {
    clearInterval(batchTimer);
    batchTimer = null;
  }

  flushLogs();
}

export default {
  initLogger,
  setLogUserId,
  clearLogUserId,
  debug,
  info,
  warn,
  error,
  fatal,
  logException,
  createLogger,
  timer,
  destroyLogger,
  LogLevel,
};
