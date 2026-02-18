/**
 * Input Sanitization Middleware
 * Sanitize and clean user input to prevent injection attacks
 */

import { Request, Response, NextFunction } from 'express';
import { securityConfig } from '../config/security.js';

/**
 * Remove HTML tags from string
 */
const stripHtml = (str: string): string => {
  return str.replace(/<[^>]*>/g, '');
};

/**
 * Escape HTML special characters
 */
const escapeHtml = (str: string): string => {
  const htmlEscapeMap: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return str.replace(/[&<>"'/]/g, char => htmlEscapeMap[char]);
};

/**
 * Remove null bytes
 */
const removeNullBytes = (str: string): string => {
  return str.replace(/\0/g, '');
};

/**
 * Normalize whitespace
 */
const normalizeWhitespace = (str: string): string => {
  return str.replace(/\s+/g, ' ').trim();
};

/**
 * Remove SQL keywords
 */
const removeSqlKeywords = (str: string): string => {
  const sqlKeywords = [
    'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER',
    'EXEC', 'EXECUTE', 'UNION', 'TRUNCATE', 'SCRIPT', 'JAVASCRIPT',
  ];

  let sanitized = str;
  sqlKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    sanitized = sanitized.replace(regex, '');
  });

  return sanitized;
};

/**
 * Remove script tags and event handlers
 */
const removeScripts = (str: string): string => {
  // Remove script tags
  let sanitized = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '');

  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');

  return sanitized;
};

/**
 * Sanitize string value
 */
const sanitizeString = (value: string, options: SanitizeOptions = {}): string => {
  let sanitized = value;

  // Remove null bytes
  sanitized = removeNullBytes(sanitized);

  // Remove scripts if not allowing HTML
  if (!options.allowHtml) {
    sanitized = removeScripts(sanitized);
    sanitized = stripHtml(sanitized);
  }

  // Escape HTML if specified
  if (options.escapeHtml) {
    sanitized = escapeHtml(sanitized);
  }

  // Remove SQL keywords if specified
  if (options.removeSql) {
    sanitized = removeSqlKeywords(sanitized);
  }

  // Normalize whitespace if specified
  if (options.normalizeWhitespace) {
    sanitized = normalizeWhitespace(sanitized);
  }

  // Trim if specified
  if (options.trim !== false) {
    sanitized = sanitized.trim();
  }

  return sanitized;
};

/**
 * Sanitize object recursively
 */
const sanitizeObject = (obj: any, options: SanitizeOptions = {}): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj, options);
  }

  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, options));
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize key
      const sanitizedKey = sanitizeString(key, { trim: true, removeSql: true });
      // Sanitize value
      sanitized[sanitizedKey] = sanitizeObject(value, options);
    }
    return sanitized;
  }

  return obj;
};

/**
 * Sanitization options
 */
interface SanitizeOptions {
  allowHtml?: boolean;
  escapeHtml?: boolean;
  removeSql?: boolean;
  normalizeWhitespace?: boolean;
  trim?: boolean;
}

/**
 * Basic sanitization middleware
 */
export const sanitizeInput = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const options: SanitizeOptions = {
    allowHtml: false,
    escapeHtml: false,
    removeSql: true,
    normalizeWhitespace: true,
    trim: true,
  };

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query, options);
  }

  // Sanitize body
  if (req.body) {
    req.body = sanitizeObject(req.body, options);
  }

  // Sanitize params
  if (req.params) {
    req.params = sanitizeObject(req.params, options);
  }

  next();
};

/**
 * Strict sanitization (removes all HTML, SQL keywords)
 */
export const strictSanitize = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const options: SanitizeOptions = {
    allowHtml: false,
    escapeHtml: true,
    removeSql: true,
    normalizeWhitespace: true,
    trim: true,
  };

  if (req.query) {
    req.query = sanitizeObject(req.query, options);
  }

  if (req.body) {
    req.body = sanitizeObject(req.body, options);
  }

  if (req.params) {
    req.params = sanitizeObject(req.params, options);
  }

  next();
};

/**
 * Sanitize with allowed HTML (for rich text editors)
 */
export const sanitizeWithHtml = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const options: SanitizeOptions = {
    allowHtml: true, // Allow HTML but still remove dangerous scripts
    escapeHtml: false,
    removeSql: true,
    normalizeWhitespace: false,
    trim: true,
  };

  if (req.body) {
    req.body = sanitizeObject(req.body, options);
  }

  next();
};

/**
 * Sanitize for search queries
 */
export const sanitizeSearch = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const options: SanitizeOptions = {
    allowHtml: false,
    escapeHtml: true,
    removeSql: true,
    normalizeWhitespace: true,
    trim: true,
  };

  if (req.query.q || req.query.search || req.query.query) {
    const searchField = req.query.q || req.query.search || req.query.query;
    if (typeof searchField === 'string') {
      const sanitized = sanitizeString(searchField, options);

      // Check if search query is too suspicious
      const suspiciousPatterns = [
        ...securityConfig.monitoring.sqlInjectionPatterns,
        ...securityConfig.monitoring.xssPatterns,
      ];

      for (const pattern of suspiciousPatterns) {
        if (pattern.test(sanitized)) {
          res.status(400).json({
            success: false,
            message: 'Invalid search query',
          });
          return;
        }
      }

      if (req.query.q) req.query.q = sanitized;
      if (req.query.search) req.query.search = sanitized;
      if (req.query.query) req.query.query = sanitized;
    }
  }

  next();
};

/**
 * Remove sensitive fields from request
 */
export const removeSensitiveFields = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const sensitiveFields = ['__proto__', 'constructor', 'prototype'];

  const removeSensitive = (obj: any): any => {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(removeSensitive);
    }

    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (!sensitiveFields.includes(key)) {
        cleaned[key] = removeSensitive(value);
      }
    }
    return cleaned;
  };

  if (req.body) {
    req.body = removeSensitive(req.body);
  }

  if (req.query) {
    req.query = removeSensitive(req.query);
  }

  next();
};

/**
 * Validate and sanitize file uploads
 */
export const sanitizeFileUpload = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // This would work with multer or similar file upload middleware
  const files = (req as any).files || (req as any).file;

  if (!files) {
    next();
    return;
  }

  const fileArray = Array.isArray(files) ? files : [files];

  for (const file of fileArray) {
    // Sanitize filename
    if (file.originalname) {
      // Remove path characters
      file.originalname = file.originalname.replace(/[/\\]/g, '');
      // Remove null bytes
      file.originalname = removeNullBytes(file.originalname);
      // Sanitize name
      file.originalname = sanitizeString(file.originalname, {
        allowHtml: false,
        removeSql: true,
        trim: true,
      });
    }

    // Check file extension
    const ext = file.originalname?.split('.').pop()?.toLowerCase();
    if (ext && !securityConfig.fileUpload.allowedExtensions.includes(`.${ext}`)) {
      res.status(400).json({
        success: false,
        message: `File type .${ext} is not allowed`,
      });
      return;
    }

    // Check file size
    if (file.size > securityConfig.fileUpload.maxSize) {
      res.status(400).json({
        success: false,
        message: `File size exceeds maximum allowed size of ${securityConfig.fileUpload.maxSize / 1024 / 1024}MB`,
      });
      return;
    }

    // Check MIME type
    if (file.mimetype && !securityConfig.fileUpload.allowedMimeTypes.includes(file.mimetype)) {
      res.status(400).json({
        success: false,
        message: `File type ${file.mimetype} is not allowed`,
      });
      return;
    }
  }

  next();
};

/**
 * Prevent NoSQL injection
 */
export const preventNoSqlInjection = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const checkForNoSqlInjection = (obj: any): boolean => {
    if (typeof obj === 'string') {
      // Check for MongoDB operators
      return /(\$where|\$ne|\$gt|\$lt|\$gte|\$lte|\$in|\$nin|\$or|\$and)/i.test(obj);
    }

    if (Array.isArray(obj)) {
      return obj.some(checkForNoSqlInjection);
    }

    if (typeof obj === 'object' && obj !== null) {
      // Check keys for MongoDB operators
      for (const key of Object.keys(obj)) {
        if (key.startsWith('$') || checkForNoSqlInjection(obj[key])) {
          return true;
        }
      }
    }

    return false;
  };

  if (checkForNoSqlInjection(req.query) || checkForNoSqlInjection(req.body)) {
    res.status(400).json({
      success: false,
      message: 'Invalid request data',
    });
    return;
  }

  next();
};

/**
 * Sanitize MongoDB query
 */
export const sanitizeMongoQuery = (query: any): any => {
  if (typeof query !== 'object' || query === null) {
    return query;
  }

  const sanitized: any = {};

  for (const [key, value] of Object.entries(query)) {
    // Skip MongoDB operators in keys
    if (key.startsWith('$')) {
      continue;
    }

    // Recursively sanitize nested objects
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeMongoQuery(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

/**
 * Export utility functions
 */
export {
  sanitizeString,
  sanitizeObject,
  stripHtml,
  escapeHtml,
  removeNullBytes,
  normalizeWhitespace,
  removeSqlKeywords,
  removeScripts,
};
