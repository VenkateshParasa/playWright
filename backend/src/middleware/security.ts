/**
 * Security Middleware Collection
 * Comprehensive security middleware for protecting the application
 */

import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import { securityConfig } from '../config/security.js';
import { sanitizeObject } from '../utils/encryption.js';

/**
 * Configure Helmet security headers
 */
export const securityHeaders = () => {
  return helmet({
    contentSecurityPolicy: {
      directives: securityConfig.headers.contentSecurityPolicy.directives,
    },
    hsts: {
      maxAge: securityConfig.headers.hsts.maxAge,
      includeSubDomains: securityConfig.headers.hsts.includeSubDomains,
      preload: securityConfig.headers.hsts.preload,
    },
    frameguard: {
      action: 'deny',
    },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: {
      policy: securityConfig.headers.referrerPolicy as any,
    },
  });
};

/**
 * Additional security headers
 */
export const additionalHeaders = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Permissions Policy
  const permissionsPolicy = Object.entries(securityConfig.headers.permissionsPolicy)
    .map(([key, value]) => `${key}=(${Array.isArray(value) ? value.join(' ') : value})`)
    .join(', ');
  res.setHeader('Permissions-Policy', permissionsPolicy);

  // Remove powered-by header
  res.removeHeader('X-Powered-By');

  // Cache control for sensitive data
  if (req.path.includes('/api/auth') || req.path.includes('/api/user')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  next();
};

/**
 * SQL Injection detection
 */
export const detectSqlInjection = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const checkForSqlInjection = (value: string): boolean => {
    const patterns = securityConfig.monitoring.sqlInjectionPatterns;
    return patterns.some(pattern => pattern.test(value));
  };

  const checkObject = (obj: any): boolean => {
    if (typeof obj === 'string') {
      return checkForSqlInjection(obj);
    }

    if (Array.isArray(obj)) {
      return obj.some(checkObject);
    }

    if (typeof obj === 'object' && obj !== null) {
      return Object.values(obj).some(checkObject);
    }

    return false;
  };

  // Check query parameters
  if (checkObject(req.query)) {
    res.status(400).json({
      success: false,
      message: 'Invalid query parameters',
    });
    return;
  }

  // Check body
  if (checkObject(req.body)) {
    res.status(400).json({
      success: false,
      message: 'Invalid request data',
    });
    return;
  }

  next();
};

/**
 * XSS detection
 */
export const detectXss = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const checkForXss = (value: string): boolean => {
    const patterns = securityConfig.monitoring.xssPatterns;
    return patterns.some(pattern => pattern.test(value));
  };

  const checkObject = (obj: any): boolean => {
    if (typeof obj === 'string') {
      return checkForXss(obj);
    }

    if (Array.isArray(obj)) {
      return obj.some(checkObject);
    }

    if (typeof obj === 'object' && obj !== null) {
      return Object.values(obj).some(checkObject);
    }

    return false;
  };

  // Check query parameters
  if (checkObject(req.query)) {
    res.status(400).json({
      success: false,
      message: 'Invalid query parameters',
    });
    return;
  }

  // Check body
  if (checkObject(req.body)) {
    res.status(400).json({
      success: false,
      message: 'Invalid request data',
    });
    return;
  }

  next();
};

/**
 * Path traversal detection
 */
export const detectPathTraversal = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const checkForPathTraversal = (value: string): boolean => {
    const patterns = securityConfig.monitoring.pathTraversalPatterns;
    return patterns.some(pattern => pattern.test(value));
  };

  const checkObject = (obj: any): boolean => {
    if (typeof obj === 'string') {
      return checkForPathTraversal(obj);
    }

    if (Array.isArray(obj)) {
      return obj.some(checkObject);
    }

    if (typeof obj === 'object' && obj !== null) {
      return Object.values(obj).some(checkObject);
    }

    return false;
  };

  // Check URL path
  if (checkForPathTraversal(req.path)) {
    res.status(400).json({
      success: false,
      message: 'Invalid path',
    });
    return;
  }

  // Check query parameters
  if (checkObject(req.query)) {
    res.status(400).json({
      success: false,
      message: 'Invalid query parameters',
    });
    return;
  }

  // Check body
  if (checkObject(req.body)) {
    res.status(400).json({
      success: false,
      message: 'Invalid request data',
    });
    return;
  }

  next();
};

/**
 * Request size limit
 */
export const requestSizeLimit = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const contentLength = parseInt(req.headers['content-length'] || '0', 10);
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (contentLength > maxSize) {
    res.status(413).json({
      success: false,
      message: 'Request entity too large',
    });
    return;
  }

  next();
};

/**
 * Request timeout
 */
export const requestTimeout = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const timeout = setTimeout(() => {
    res.status(408).json({
      success: false,
      message: 'Request timeout',
    });
  }, securityConfig.requestLimits.requestTimeout);

  res.on('finish', () => {
    clearTimeout(timeout);
  });

  next();
};

/**
 * Sanitize request data
 */
export const sanitizeRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  // Sanitize body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  next();
};

/**
 * API version check
 */
export const checkApiVersion = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const apiVersion = req.headers[securityConfig.api.versionHeader.toLowerCase()];
  const currentVersion = securityConfig.api.currentVersion;

  if (!apiVersion) {
    // Version not specified, allow but log
    console.warn(`API version not specified for ${req.path}`);
    next();
    return;
  }

  if (apiVersion !== currentVersion) {
    res.status(400).json({
      success: false,
      message: `API version ${apiVersion} is not supported. Current version: ${currentVersion}`,
    });
    return;
  }

  next();
};

/**
 * HTTPS enforcement
 */
export const enforceHttps = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (process.env.NODE_ENV === 'production' && !req.secure && req.get('x-forwarded-proto') !== 'https') {
    return res.redirect(301, `https://${req.hostname}${req.url}`);
  }
  next();
};

/**
 * IP whitelist
 */
export const ipWhitelist = (allowedIps: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const clientIp = req.ip || req.socket.remoteAddress || '';

    if (!allowedIps.includes(clientIp)) {
      res.status(403).json({
        success: false,
        message: 'Access denied',
      });
      return;
    }

    next();
  };
};

/**
 * IP blacklist
 */
export const ipBlacklist = (blockedIps: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const clientIp = req.ip || req.socket.remoteAddress || '';

    if (blockedIps.includes(clientIp)) {
      res.status(403).json({
        success: false,
        message: 'Access denied',
      });
      return;
    }

    next();
  };
};

/**
 * User agent validation
 */
export const validateUserAgent = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const userAgent = req.headers['user-agent'];

  if (!userAgent) {
    res.status(400).json({
      success: false,
      message: 'User agent required',
    });
    return;
  }

  // Block known bad bots
  const blockedBots = [
    'AhrefsBot',
    'SemrushBot',
    'DotBot',
    'MJ12bot',
    'BLEXBot',
  ];

  if (blockedBots.some(bot => userAgent.includes(bot))) {
    res.status(403).json({
      success: false,
      message: 'Access denied',
    });
    return;
  }

  next();
};

/**
 * Method override protection
 */
export const protectMethodOverride = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Block method override headers
  if (req.headers['x-http-method-override'] || req.headers['x-method-override']) {
    res.status(400).json({
      success: false,
      message: 'Method override not allowed',
    });
    return;
  }

  next();
};

/**
 * Content type validation
 */
export const validateContentType = (allowedTypes: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Skip for GET, HEAD, OPTIONS
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      next();
      return;
    }

    const contentType = req.headers['content-type'];

    if (!contentType) {
      res.status(400).json({
        success: false,
        message: 'Content-Type header required',
      });
      return;
    }

    const isAllowed = allowedTypes.some(type => contentType.includes(type));

    if (!isAllowed) {
      res.status(415).json({
        success: false,
        message: 'Unsupported content type',
      });
      return;
    }

    next();
  };
};

/**
 * Origin validation
 */
export const validateOrigin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const origin = req.headers.origin || req.headers.referer;
  const allowedOrigin = securityConfig.cors.origin;

  if (origin && !origin.startsWith(allowedOrigin)) {
    res.status(403).json({
      success: false,
      message: 'Invalid origin',
    });
    return;
  }

  next();
};

/**
 * Slow down repeated requests
 */
export const slowDown = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Implementation would track request counts and add delays
  // This is a placeholder for a full implementation
  next();
};

/**
 * Security audit logging
 */
export const securityAuditLog = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!securityConfig.audit.enabled) {
    next();
    return;
  }

  const auditData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    ip: req.ip || req.socket.remoteAddress,
    userAgent: req.headers['user-agent'],
    userId: (req as any).user?.userId,
  };

  // Log sensitive operations
  if (
    req.path.includes('/auth') ||
    req.path.includes('/admin') ||
    req.path.includes('/delete') ||
    req.method === 'DELETE'
  ) {
    console.log('Security Audit:', JSON.stringify(auditData));
  }

  next();
};

/**
 * Combined security middleware
 */
export const applySecurity = () => {
  return [
    securityHeaders(),
    additionalHeaders,
    enforceHttps,
    requestSizeLimit,
    requestTimeout,
    detectSqlInjection,
    detectXss,
    detectPathTraversal,
    protectMethodOverride,
    validateUserAgent,
    securityAuditLog,
  ];
};
