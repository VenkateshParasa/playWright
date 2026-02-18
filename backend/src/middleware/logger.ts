/**
 * Backend Logging Middleware
 *
 * Features:
 * - Request/response logging
 * - Log request ID for tracing
 * - Log method, URL, status code, response time
 * - Log user ID if authenticated
 * - Log request body (excluding sensitive data)
 * - Log error stack traces
 * - Structured JSON logging
 * - Different log levels (debug, info, warn, error)
 */

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Log levels
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

// Configuration
const LOG_LEVEL = process.env.LOG_LEVEL || LogLevel.INFO;
const LOG_TO_FILE = process.env.LOG_TO_FILE === 'true';
const LOG_FILE_PATH = process.env.LOG_FILE_PATH || path.join(__dirname, '../../logs/app.log');
const LOG_REQUEST_BODY = process.env.LOG_REQUEST_BODY !== 'false';
const LOG_RESPONSE_BODY = process.env.LOG_RESPONSE_BODY === 'true';

// Sensitive fields to redact
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'apiKey',
  'secret',
  'authorization',
  'creditCard',
  'ssn',
  'pin',
  'accessToken',
  'refreshToken',
];

// Extended Request type
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      startTime?: number;
    }
  }
}

/**
 * Request logging middleware
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  // Generate unique request ID
  req.requestId = uuidv4();
  req.startTime = Date.now();

  // Add request ID to response headers
  res.setHeader('X-Request-ID', req.requestId);

  // Log incoming request
  logRequest(req);

  // Capture original end function
  const originalEnd = res.end;

  // Override end function to log response
  res.end = function (this: Response, ...args: any[]): Response {
    // Log response
    logResponse(req, res);

    // Call original end function
    return originalEnd.apply(this, args as any);
  };

  next();
}

/**
 * Log incoming request
 */
function logRequest(req: Request): void {
  const logData = {
    type: 'request',
    requestId: req.requestId,
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    path: req.path,
    query: sanitizeData(req.query),
    headers: sanitizeHeaders(req.headers),
    body: LOG_REQUEST_BODY ? sanitizeData(req.body) : undefined,
    ip: req.ip || req.socket.remoteAddress,
    userAgent: req.get('user-agent'),
    userId: (req as any).user?.id,
  };

  log(LogLevel.INFO, 'Incoming request', logData);
}

/**
 * Log outgoing response
 */
function logResponse(req: Request, res: Response): void {
  const duration = req.startTime ? Date.now() - req.startTime : 0;

  const logData = {
    type: 'response',
    requestId: req.requestId,
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode,
    duration: `${duration}ms`,
    contentLength: res.get('content-length'),
    userId: (req as any).user?.id,
  };

  // Determine log level based on status code
  let level = LogLevel.INFO;
  if (res.statusCode >= 500) {
    level = LogLevel.ERROR;
  } else if (res.statusCode >= 400) {
    level = LogLevel.WARN;
  }

  log(level, `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`, logData);

  // Log slow requests
  if (duration > 1000) {
    log(LogLevel.WARN, 'Slow request detected', {
      ...logData,
      threshold: '1000ms',
    });
  }
}

/**
 * Core logging function
 */
export function log(
  level: LogLevel,
  message: string,
  data?: Record<string, any>
): void {
  // Check if we should log this level
  if (shouldLog(level)) {
    const logEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...data,
      environment: process.env.NODE_ENV,
      hostname: process.env.HOSTNAME || 'unknown',
    };

    // Console output
    logToConsole(level, logEntry);

    // File output
    if (LOG_TO_FILE) {
      logToFile(logEntry);
    }
  }
}

/**
 * Debug log
 */
export function debug(message: string, data?: Record<string, any>): void {
  log(LogLevel.DEBUG, message, data);
}

/**
 * Info log
 */
export function info(message: string, data?: Record<string, any>): void {
  log(LogLevel.INFO, message, data);
}

/**
 * Warning log
 */
export function warn(message: string, data?: Record<string, any>): void {
  log(LogLevel.WARN, message, data);
}

/**
 * Error log
 */
export function error(message: string, data?: Record<string, any>): void {
  log(LogLevel.ERROR, message, data);
}

/**
 * Fatal error log
 */
export function fatal(message: string, data?: Record<string, any>): void {
  log(LogLevel.FATAL, message, data);
}

/**
 * Log error with stack trace
 */
export function logError(err: Error, context?: Record<string, any>): void {
  log(LogLevel.ERROR, err.message, {
    ...context,
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
    },
  });
}

/**
 * Check if should log this level
 */
function shouldLog(level: LogLevel): boolean {
  const levels = [
    LogLevel.DEBUG,
    LogLevel.INFO,
    LogLevel.WARN,
    LogLevel.ERROR,
    LogLevel.FATAL,
  ];

  const currentLevelIndex = levels.indexOf(LOG_LEVEL as LogLevel);
  const logLevelIndex = levels.indexOf(level);

  return logLevelIndex >= currentLevelIndex;
}

/**
 * Log to console
 */
function logToConsole(level: LogLevel, logEntry: any): void {
  const { message, ...data } = logEntry;

  // Use colors in development
  if (process.env.NODE_ENV === 'development') {
    const colors = {
      [LogLevel.DEBUG]: '\x1b[36m',   // Cyan
      [LogLevel.INFO]: '\x1b[32m',    // Green
      [LogLevel.WARN]: '\x1b[33m',    // Yellow
      [LogLevel.ERROR]: '\x1b[31m',   // Red
      [LogLevel.FATAL]: '\x1b[35m',   // Magenta
    };
    const reset = '\x1b[0m';

    console.log(
      `${colors[level]}[${level.toUpperCase()}]${reset}`,
      message,
      Object.keys(data).length > 3 ? data : ''
    );
  } else {
    // Production: JSON format
    console.log(JSON.stringify(logEntry));
  }
}

/**
 * Log to file
 */
function logToFile(logEntry: any): void {
  try {
    // Ensure log directory exists
    const logDir = path.dirname(LOG_FILE_PATH);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    // Append to log file
    const logLine = JSON.stringify(logEntry) + '\n';
    fs.appendFileSync(LOG_FILE_PATH, logLine);

    // Check file size and rotate if needed
    rotateLogFileIfNeeded();
  } catch (err) {
    console.error('Failed to write to log file:', err);
  }
}

/**
 * Rotate log file if it exceeds size limit
 */
function rotateLogFileIfNeeded(): void {
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  try {
    const stats = fs.statSync(LOG_FILE_PATH);

    if (stats.size > MAX_FILE_SIZE) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const rotatedPath = LOG_FILE_PATH.replace('.log', `.${timestamp}.log`);

      fs.renameSync(LOG_FILE_PATH, rotatedPath);

      info('Log file rotated', {
        oldFile: LOG_FILE_PATH,
        newFile: rotatedPath,
        size: stats.size,
      });
    }
  } catch (err) {
    // Ignore errors (file might not exist yet)
  }
}

/**
 * Sanitize data to remove sensitive information
 */
function sanitizeData(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item));
  }

  const sanitized: Record<string, any> = {};

  for (const key in data) {
    const lowerKey = key.toLowerCase();

    // Check if key is sensitive
    if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof data[key] === 'object' && data[key] !== null) {
      sanitized[key] = sanitizeData(data[key]);
    } else {
      sanitized[key] = data[key];
    }
  }

  return sanitized;
}

/**
 * Sanitize HTTP headers
 */
function sanitizeHeaders(headers: any): Record<string, any> {
  const sanitized: Record<string, any> = { ...headers };

  // Remove sensitive headers
  const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];

  sensitiveHeaders.forEach(header => {
    if (sanitized[header]) {
      sanitized[header] = '[REDACTED]';
    }
  });

  return sanitized;
}

/**
 * Create logger with context
 */
export function createLogger(context: Record<string, any>) {
  return {
    debug: (message: string, data?: Record<string, any>) =>
      debug(message, { ...context, ...data }),

    info: (message: string, data?: Record<string, any>) =>
      info(message, { ...context, ...data }),

    warn: (message: string, data?: Record<string, any>) =>
      warn(message, { ...context, ...data }),

    error: (message: string, data?: Record<string, any>) =>
      error(message, { ...context, ...data }),

    fatal: (message: string, data?: Record<string, any>) =>
      fatal(message, { ...context, ...data }),

    logError: (err: Error, data?: Record<string, any>) =>
      logError(err, { ...context, ...data }),
  };
}

/**
 * Timer for performance logging
 */
export class Timer {
  private startTime: number;
  private name: string;
  private context?: Record<string, any>;

  constructor(name: string, context?: Record<string, any>) {
    this.name = name;
    this.context = context;
    this.startTime = Date.now();
  }

  end(): number {
    const duration = Date.now() - this.startTime;

    debug(`Timer: ${this.name}`, {
      ...this.context,
      duration: `${duration}ms`,
    });

    return duration;
  }
}

/**
 * Create timer
 */
export function timer(name: string, context?: Record<string, any>): Timer {
  return new Timer(name, context);
}

export default {
  requestLogger,
  log,
  debug,
  info,
  warn,
  error,
  fatal,
  logError,
  createLogger,
  timer,
  LogLevel,
};
