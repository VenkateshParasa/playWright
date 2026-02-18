/**
 * Backend Error Handler Middleware
 *
 * Features:
 * - Catch all unhandled errors
 * - Log errors with full context
 * - Return appropriate error responses
 * - Hide internal errors from clients
 * - Track error rates
 * - Send alerts for critical errors
 * - Error categorization (validation, auth, server, etc.)
 */

import { Request, Response, NextFunction } from 'express';
import { logError, error as logErrorMessage } from './logger.js';

// Error types
export enum ErrorType {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  CONFLICT = 'conflict',
  RATE_LIMIT = 'rate_limit',
  DATABASE = 'database',
  EXTERNAL_API = 'external_api',
  INTERNAL = 'internal',
}

// Custom error class
export class AppError extends Error {
  public statusCode: number;
  public errorType: ErrorType;
  public isOperational: boolean;
  public details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    errorType: ErrorType = ErrorType.INTERNAL,
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorType = errorType;
    this.isOperational = isOperational;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Validation error
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, ErrorType.VALIDATION, true, details);
  }
}

// Authentication error
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, ErrorType.AUTHENTICATION, true);
  }
}

// Authorization error
export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403, ErrorType.AUTHORIZATION, true);
  }
}

// Not found error
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, ErrorType.NOT_FOUND, true);
  }
}

// Conflict error
export class ConflictError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 409, ErrorType.CONFLICT, true, details);
  }
}

// Rate limit error
export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, ErrorType.RATE_LIMIT, true);
  }
}

// Database error
export class DatabaseError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 500, ErrorType.DATABASE, false, details);
  }
}

// External API error
export class ExternalAPIError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 502, ErrorType.EXTERNAL_API, false, details);
  }
}

// Error tracking
interface ErrorStats {
  count: number;
  lastOccurred: Date;
  firstOccurred: Date;
}

const errorStats = new Map<string, ErrorStats>();

/**
 * Error handler middleware
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Default error properties
  let statusCode = 500;
  let errorType = ErrorType.INTERNAL;
  let isOperational = false;
  let message = 'Internal server error';
  let details: any = undefined;

  // Extract error properties
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorType = err.errorType;
    isOperational = err.isOperational;
    message = err.message;
    details = err.details;
  } else {
    // Handle specific error types
    if (err.name === 'ValidationError') {
      statusCode = 400;
      errorType = ErrorType.VALIDATION;
      isOperational = true;
      message = err.message;
    } else if (err.name === 'CastError') {
      statusCode = 400;
      errorType = ErrorType.VALIDATION;
      isOperational = true;
      message = 'Invalid ID format';
    } else if (err.name === 'MongoError' || err.name === 'MongoServerError') {
      statusCode = 500;
      errorType = ErrorType.DATABASE;
      isOperational = false;
      message = 'Database error occurred';
    } else if (err.name === 'JsonWebTokenError') {
      statusCode = 401;
      errorType = ErrorType.AUTHENTICATION;
      isOperational = true;
      message = 'Invalid token';
    } else if (err.name === 'TokenExpiredError') {
      statusCode = 401;
      errorType = ErrorType.AUTHENTICATION;
      isOperational = true;
      message = 'Token expired';
    }
  }

  // Track error
  trackError(errorType, err);

  // Log error
  logError(err, {
    requestId: (req as any).requestId,
    method: req.method,
    url: req.originalUrl,
    statusCode,
    errorType,
    isOperational,
    userId: (req as any).user?.id,
    ip: req.ip,
  });

  // Send response
  const errorResponse: any = {
    success: false,
    error: {
      type: errorType,
      message: isOperational ? message : 'An unexpected error occurred',
      requestId: (req as any).requestId,
    },
  };

  // Include details in development or for operational errors
  if (process.env.NODE_ENV === 'development' || isOperational) {
    if (details) {
      errorResponse.error.details = details;
    }
  }

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
}

/**
 * Not found handler
 */
export function notFoundHandler(req: Request, res: Response): void {
  const message = `Cannot ${req.method} ${req.originalUrl}`;

  logErrorMessage('Route not found', {
    requestId: (req as any).requestId,
    method: req.method,
    url: req.originalUrl,
  });

  res.status(404).json({
    success: false,
    error: {
      type: ErrorType.NOT_FOUND,
      message,
      requestId: (req as any).requestId,
    },
  });
}

/**
 * Track error occurrence
 */
function trackError(errorType: ErrorType, err: Error): void {
  const key = `${errorType}:${err.message}`;
  const now = new Date();

  const stats = errorStats.get(key);

  if (stats) {
    stats.count++;
    stats.lastOccurred = now;
  } else {
    errorStats.set(key, {
      count: 1,
      lastOccurred: now,
      firstOccurred: now,
    });
  }

  // Clean up old entries (older than 1 hour)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  for (const [key, stats] of errorStats.entries()) {
    if (stats.lastOccurred < oneHourAgo) {
      errorStats.delete(key);
    }
  }
}

/**
 * Get error statistics
 */
export function getErrorStats(): Map<string, ErrorStats> {
  return new Map(errorStats);
}

/**
 * Clear error statistics
 */
export function clearErrorStats(): void {
  errorStats.clear();
}

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors automatically
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Handle uncaught exceptions
 */
export function handleUncaughtException(): void {
  process.on('uncaughtException', (err: Error) => {
    logError(err, {
      type: 'uncaughtException',
      fatal: true,
    });

    console.error('Uncaught exception, exiting...');
    process.exit(1);
  });
}

/**
 * Handle unhandled promise rejections
 */
export function handleUnhandledRejection(): void {
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    const err = reason instanceof Error ? reason : new Error(String(reason));

    logError(err, {
      type: 'unhandledRejection',
      promise: String(promise),
    });
  });
}

/**
 * Graceful shutdown
 */
export function setupGracefulShutdown(server: any): void {
  const shutdown = async (signal: string): Promise<void> => {
    console.log(`\n${signal} received, shutting down gracefully...`);

    // Stop accepting new connections
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });

    // Force shutdown after timeout
    setTimeout(() => {
      console.error('Forced shutdown');
      process.exit(1);
    }, 10000); // 10 seconds
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

export default {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  DatabaseError,
  ExternalAPIError,
  handleUncaughtException,
  handleUnhandledRejection,
  setupGracefulShutdown,
  getErrorStats,
  clearErrorStats,
};
