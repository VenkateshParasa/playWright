import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

// Store for tracking API key usage
const apiKeyUsage = new Map<string, { count: number; resetAt: number }>();

/**
 * Custom rate limiter for API keys
 * Uses the rate limit specified in the API key document
 */
export const apiKeyRateLimit = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.apiKey) {
    return next();
  }

  const keyId = req.apiKey._id.toString();
  const now = Date.now();
  const hourInMs = 60 * 60 * 1000;

  // Get or create usage record
  let usage = apiKeyUsage.get(keyId);

  // Reset if hour has passed
  if (!usage || usage.resetAt < now) {
    usage = {
      count: 0,
      resetAt: now + hourInMs,
    };
    apiKeyUsage.set(keyId, usage);
  }

  // Check rate limit
  if (usage.count >= req.apiKey.rateLimit) {
    const resetIn = Math.ceil((usage.resetAt - now) / 1000);
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Rate limit exceeded. Your limit is ${req.apiKey.rateLimit} requests per hour.`,
        retryAfter: resetIn,
      },
    });
    return;
  }

  // Increment usage
  usage.count++;

  // Add rate limit headers
  res.setHeader('X-RateLimit-Limit', req.apiKey.rateLimit.toString());
  res.setHeader('X-RateLimit-Remaining', (req.apiKey.rateLimit - usage.count).toString());
  res.setHeader('X-RateLimit-Reset', new Date(usage.resetAt).toISOString());

  next();
};

/**
 * General rate limiter for public API endpoints
 * More lenient than internal API
 */
export const publicApiRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 100 requests per hour for unauthenticated requests
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later',
    },
  },
  skip: (req) => {
    // Skip if authenticated (will use apiKeyRateLimit instead)
    return !!req.apiKey || !!req.oauth;
  },
});

/**
 * Strict rate limiter for sensitive endpoints (auth, registration)
 */
export const strictRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many attempts, please try again later',
    },
  },
});

/**
 * Webhook endpoint rate limiter
 */
export const webhookRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 webhook registrations per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many webhook operations, please slow down',
    },
  },
});

/**
 * OAuth2 endpoint rate limiter
 */
export const oauthRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 token requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many token requests, please slow down',
    },
  },
});

/**
 * Cleanup old usage records periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [keyId, usage] of apiKeyUsage.entries()) {
    if (usage.resetAt < now) {
      apiKeyUsage.delete(keyId);
    }
  }
}, 60 * 60 * 1000); // Cleanup every hour
