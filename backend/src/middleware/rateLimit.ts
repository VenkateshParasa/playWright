/**
 * Rate Limiting Middleware
 * Protect endpoints from abuse with configurable rate limits
 */

import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { securityConfig } from '../config/security.js';

/**
 * Store for tracking rate limit violations
 */
const violationStore = new Map<string, number>();

/**
 * Get client identifier (IP + User ID if available)
 */
const getClientId = (req: Request): string => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const userId = (req as any).user?.userId;
  return userId ? `${ip}-${userId}` : ip;
};

/**
 * Custom rate limit handler
 */
const rateLimitHandler = (req: Request, res: Response): void => {
  const clientId = getClientId(req);
  const violations = violationStore.get(clientId) || 0;

  // Track violations
  violationStore.set(clientId, violations + 1);

  // Log excessive violations
  if (violations > 10) {
    console.warn('Excessive rate limit violations:', {
      clientId,
      violations,
      path: req.path,
      timestamp: new Date().toISOString(),
    });
  }

  res.status(429).json({
    success: false,
    message: 'Too many requests, please try again later',
    retryAfter: res.getHeader('Retry-After'),
  });
};

/**
 * Skip rate limiting for certain conditions
 */
const skipRateLimit = (req: Request): boolean => {
  // Skip for health checks
  if (req.path === '/health') {
    return true;
  }

  // Skip for whitelisted IPs (if configured)
  const whitelistedIps = process.env.RATE_LIMIT_WHITELIST?.split(',') || [];
  const clientIp = req.ip || req.socket.remoteAddress || '';
  if (whitelistedIps.includes(clientIp)) {
    return true;
  }

  return false;
};

/**
 * Authentication rate limiter
 * Strict limits for login/register endpoints
 */
export const authRateLimiter = rateLimit({
  windowMs: securityConfig.rateLimit.auth.windowMs,
  max: securityConfig.rateLimit.auth.max,
  message: securityConfig.rateLimit.auth.message,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipRateLimit,
  handler: rateLimitHandler,
  keyGenerator: getClientId,
});

/**
 * Password reset rate limiter
 */
export const passwordResetRateLimiter = rateLimit({
  windowMs: securityConfig.rateLimit.passwordReset.windowMs,
  max: securityConfig.rateLimit.passwordReset.max,
  message: securityConfig.rateLimit.passwordReset.message,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipRateLimit,
  handler: rateLimitHandler,
  keyGenerator: getClientId,
});

/**
 * General API rate limiter
 */
export const apiRateLimiter = rateLimit({
  windowMs: securityConfig.rateLimit.api.windowMs,
  max: securityConfig.rateLimit.api.max,
  message: securityConfig.rateLimit.api.message,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipRateLimit,
  handler: rateLimitHandler,
  keyGenerator: getClientId,
});

/**
 * Strict rate limiter for sensitive operations
 */
export const strictRateLimiter = rateLimit({
  windowMs: securityConfig.rateLimit.strict.windowMs,
  max: securityConfig.rateLimit.strict.max,
  message: securityConfig.rateLimit.strict.message,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipRateLimit,
  handler: rateLimitHandler,
  keyGenerator: getClientId,
});

/**
 * Custom rate limiter with per-user limits
 */
export const createUserRateLimiter = (windowMs: number, maxRequests: number) => {
  const userLimits = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: Function): void => {
    const userId = (req as any).user?.userId;

    if (!userId) {
      // If no user, use IP-based rate limiting
      apiRateLimiter(req, res, next);
      return;
    }

    const now = Date.now();
    const userLimit = userLimits.get(userId);

    if (!userLimit || now > userLimit.resetTime) {
      // Create new window
      userLimits.set(userId, {
        count: 1,
        resetTime: now + windowMs,
      });
      next();
      return;
    }

    if (userLimit.count >= maxRequests) {
      const retryAfter = Math.ceil((userLimit.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter.toString());
      res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later',
        retryAfter,
      });
      return;
    }

    // Increment count
    userLimit.count++;
    userLimits.set(userId, userLimit);
    next();
  };
};

/**
 * Clean up old violation records periodically
 */
setInterval(() => {
  if (violationStore.size > 10000) {
    violationStore.clear();
    console.log('Rate limit violation store cleared');
  }
}, 60 * 60 * 1000); // Every hour

/**
 * Get rate limit status for monitoring
 */
export const getRateLimitStatus = () => {
  return {
    violationCount: violationStore.size,
    topViolators: Array.from(violationStore.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([clientId, count]) => ({ clientId, count })),
  };
};

/**
 * Reset rate limit for a specific client (admin function)
 */
export const resetRateLimit = (clientId: string): boolean => {
  if (violationStore.has(clientId)) {
    violationStore.delete(clientId);
    return true;
  }
  return false;
};

/**
 * Block client temporarily (add to temporary blacklist)
 */
const blockedClients = new Map<string, number>();

export const blockClient = (clientId: string, durationMs: number = 3600000): void => {
  const blockUntil = Date.now() + durationMs;
  blockedClients.set(clientId, blockUntil);

  console.warn('Client blocked:', {
    clientId,
    blockUntil: new Date(blockUntil).toISOString(),
  });
};

/**
 * Check if client is blocked
 */
export const isClientBlocked = (req: Request): boolean => {
  const clientId = getClientId(req);
  const blockUntil = blockedClients.get(clientId);

  if (!blockUntil) {
    return false;
  }

  if (Date.now() > blockUntil) {
    blockedClients.delete(clientId);
    return false;
  }

  return true;
};

/**
 * Middleware to check if client is blocked
 */
export const checkBlockedClient = (req: Request, res: Response, next: Function): void => {
  if (isClientBlocked(req)) {
    res.status(403).json({
      success: false,
      message: 'Access temporarily blocked due to suspicious activity',
    });
    return;
  }

  next();
};

/**
 * Clean up expired blocks
 */
setInterval(() => {
  const now = Date.now();
  for (const [clientId, blockUntil] of blockedClients.entries()) {
    if (now > blockUntil) {
      blockedClients.delete(clientId);
    }
  }
}, 5 * 60 * 1000); // Every 5 minutes

/**
 * Adaptive rate limiting based on system load
 */
export const adaptiveRateLimiter = (baseMax: number, baseWindowMs: number) => {
  return rateLimit({
    windowMs: baseWindowMs,
    max: async (req: Request) => {
      // Adjust limits based on system load
      const load = process.memoryUsage().heapUsed / process.memoryUsage().heapTotal;

      if (load > 0.9) {
        // High load: reduce limit by 50%
        return Math.floor(baseMax * 0.5);
      } else if (load > 0.7) {
        // Medium load: reduce limit by 25%
        return Math.floor(baseMax * 0.75);
      }

      // Normal load: use base limit
      return baseMax;
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: skipRateLimit,
    handler: rateLimitHandler,
    keyGenerator: getClientId,
  });
};
