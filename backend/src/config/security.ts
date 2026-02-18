/**
 * Security Configuration
 * Centralized security settings for the application
 */

export const securityConfig = {
  // Password Policy
  password: {
    minLength: 12,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?',
    expiryDays: 90, // Password expiration
    preventReuse: 5, // Prevent reusing last 5 passwords
    maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days in milliseconds
  },

  // Account Lockout
  accountLockout: {
    maxFailedAttempts: 5,
    lockoutDuration: 30 * 60 * 1000, // 30 minutes in milliseconds
    resetFailedAttemptsAfter: 15 * 60 * 1000, // 15 minutes
  },

  // Session Management
  session: {
    accessTokenExpiry: '15m', // 15 minutes
    refreshTokenExpiry: '7d', // 7 days
    sessionTimeout: 30 * 60 * 1000, // 30 minutes of inactivity
    maxSessions: 5, // Max concurrent sessions per user
    absoluteTimeout: 12 * 60 * 60 * 1000, // 12 hours absolute timeout
  },

  // Two-Factor Authentication
  twoFactor: {
    enabled: process.env.TWO_FACTOR_ENABLED === 'true',
    issuer: 'Playwright Learning Platform',
    codeExpiry: 5 * 60 * 1000, // 5 minutes
    backupCodesCount: 10,
  },

  // Rate Limiting
  rateLimit: {
    // Authentication endpoints
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // 5 attempts per window
      message: 'Too many authentication attempts, please try again later',
    },
    // Password reset
    passwordReset: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 3, // 3 attempts per hour
      message: 'Too many password reset attempts, please try again later',
    },
    // General API
    api: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // 100 requests per window
      message: 'Too many requests, please try again later',
    },
    // Strict endpoints (registration, etc)
    strict: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 5, // 5 requests per hour
      message: 'Request limit exceeded, please try again later',
    },
  },

  // CSRF Protection
  csrf: {
    tokenLength: 32,
    cookieName: 'XSRF-TOKEN',
    headerName: 'X-CSRF-TOKEN',
    cookieOptions: {
      httpOnly: false, // Must be false so frontend can read it
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  },

  // Cookie Settings
  cookies: {
    accessToken: {
      name: 'accessToken',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 15 * 60 * 1000, // 15 minutes
    },
    refreshToken: {
      name: 'refreshToken',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  },

  // Security Headers
  headers: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://cdn.jsdelivr.net'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
        connectSrc: ["'self'", process.env.API_URL || 'http://localhost:5000'],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
      },
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: 'strict-origin-when-cross-origin',
    permissionsPolicy: {
      camera: ['none'],
      microphone: ['none'],
      geolocation: ['none'],
      payment: ['none'],
    },
  },

  // File Upload
  fileUpload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/json',
    ],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.txt', '.json'],
    scanForMalware: process.env.MALWARE_SCAN_ENABLED === 'true',
  },

  // Request Limits
  requestLimits: {
    bodySize: '10mb',
    urlEncodedLimit: '10mb',
    jsonLimit: '10mb',
    requestTimeout: 30000, // 30 seconds
  },

  // Encryption
  encryption: {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    ivLength: 16,
    saltLength: 64,
    tagLength: 16,
    iterations: 100000,
    digest: 'sha512',
  },

  // API Security
  api: {
    apiKeyHeader: 'X-API-Key',
    apiKeyLength: 64,
    requireApiKey: process.env.REQUIRE_API_KEY === 'true',
    versionHeader: 'X-API-Version',
    currentVersion: '1.0',
  },

  // CORS
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-CSRF-Token',
      'X-API-Key',
      'X-API-Version',
    ],
    exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
    maxAge: 600, // 10 minutes
  },

  // Audit Logging
  audit: {
    enabled: true,
    sensitiveFields: [
      'password',
      'token',
      'secret',
      'apiKey',
      'creditCard',
      'ssn',
      'privateKey',
    ],
    logLevel: process.env.LOG_LEVEL || 'info',
    retention: 90, // days
  },

  // Data Protection
  dataProtection: {
    encryptPII: true,
    maskPII: true,
    anonymizeAnalytics: true,
    gdprCompliant: true,
    dataRetentionDays: 365,
    anonymizeAfterDays: 90,
  },

  // Security Monitoring
  monitoring: {
    suspiciousActivityThreshold: 10, // Suspicious events before alert
    bruteForceThreshold: 5, // Failed login attempts
    sqlInjectionPatterns: [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
      /(\bOR\b.*=.*|AND\b.*=.*)/gi,
      /(;|\-\-|\/\*|\*\/|xp_|sp_)/gi,
    ],
    xssPatterns: [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /onerror\s*=/gi,
      /onload\s*=/gi,
    ],
    pathTraversalPatterns: [/\.\.[\/\\]/g, /\.\.\\/g],
  },

  // Error Messages
  errorMessages: {
    generic: 'An error occurred. Please try again later.',
    authentication: 'Invalid credentials',
    authorization: 'Insufficient permissions',
    validation: 'Invalid input provided',
    rateLimit: 'Too many requests. Please try again later.',
    maintenance: 'System is under maintenance. Please try again later.',
  },
};

/**
 * Get security configuration
 */
export const getSecurityConfig = () => securityConfig;

/**
 * Validate security configuration
 */
export const validateSecurityConfig = (): boolean => {
  const errors: string[] = [];

  // Validate JWT secret
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long');
  }

  // Validate encryption key
  if (!process.env.ENCRYPTION_KEY || process.env.ENCRYPTION_KEY.length < 32) {
    errors.push('ENCRYPTION_KEY must be at least 32 characters long');
  }

  // Validate production settings
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your-secret-key-change-in-production') {
      errors.push('JWT_SECRET must be changed in production');
    }

    if (!securityConfig.cookies.accessToken.secure) {
      errors.push('Secure cookies must be enabled in production');
    }
  }

  if (errors.length > 0) {
    console.error('Security configuration errors:');
    errors.forEach(error => console.error(`  - ${error}`));
    return false;
  }

  return true;
};

/**
 * Initialize security configuration
 */
export const initSecurityConfig = (): void => {
  if (!validateSecurityConfig()) {
    console.warn('⚠️  Security configuration validation failed. Please check your environment variables.');
  } else {
    console.log('✓ Security configuration validated successfully');
  }
};
