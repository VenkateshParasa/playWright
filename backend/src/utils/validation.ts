/**
 * Input Validation Schemas
 * Comprehensive validation for all user inputs
 */

import { body, param, query, ValidationChain } from 'express-validator';
import { securityConfig } from '../config/security.js';

/**
 * Email validation
 */
export const validateEmail = (): ValidationChain => {
  return body('email')
    .trim()
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail()
    .isLength({ max: 254 })
    .withMessage('Email too long');
};

/**
 * Password validation with strength requirements
 */
export const validatePassword = (field: string = 'password'): ValidationChain => {
  const { minLength, maxLength, requireUppercase, requireLowercase, requireNumbers, requireSpecialChars } =
    securityConfig.password;

  let validator = body(field)
    .isString()
    .withMessage('Password must be a string')
    .isLength({ min: minLength, max: maxLength })
    .withMessage(`Password must be between ${minLength} and ${maxLength} characters`);

  if (requireUppercase) {
    validator = validator
      .matches(/[A-Z]/)
      .withMessage('Password must contain at least one uppercase letter');
  }

  if (requireLowercase) {
    validator = validator
      .matches(/[a-z]/)
      .withMessage('Password must contain at least one lowercase letter');
  }

  if (requireNumbers) {
    validator = validator
      .matches(/[0-9]/)
      .withMessage('Password must contain at least one number');
  }

  if (requireSpecialChars) {
    validator = validator
      .matches(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/)
      .withMessage('Password must contain at least one special character');
  }

  return validator.custom((value) => {
    // Check for common passwords
    const commonPasswords = [
      'password',
      'Password123',
      '12345678',
      'qwerty',
      'abc123',
      'password1',
      'Password1!',
    ];
    if (commonPasswords.includes(value)) {
      throw new Error('Password is too common');
    }
    return true;
  });
};

/**
 * Username validation
 */
export const validateUsername = (): ValidationChain => {
  return body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, hyphens, and underscores')
    .custom((value) => {
      // Reserved usernames
      const reserved = ['admin', 'root', 'system', 'api', 'test', 'user'];
      if (reserved.includes(value.toLowerCase())) {
        throw new Error('Username is reserved');
      }
      return true;
    });
};

/**
 * Name validation (first/last name)
 */
export const validateName = (field: string): ValidationChain => {
  return body(field)
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage(`${field} must be between 1 and 50 characters`)
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage(`${field} can only contain letters, spaces, hyphens, and apostrophes`)
    .customSanitizer((value) => {
      // Remove multiple spaces and trim
      return value.replace(/\s+/g, ' ').trim();
    });
};

/**
 * MongoDB ObjectId validation
 */
export const validateObjectId = (field: string = 'id'): ValidationChain => {
  return param(field)
    .trim()
    .matches(/^[0-9a-fA-F]{24}$/)
    .withMessage('Invalid ID format');
};

/**
 * URL validation
 */
export const validateUrl = (field: string): ValidationChain => {
  return body(field)
    .trim()
    .isURL({
      protocols: ['http', 'https'],
      require_protocol: true,
    })
    .withMessage('Invalid URL')
    .isLength({ max: 2048 })
    .withMessage('URL too long')
    .custom((value) => {
      // Block localhost and internal IPs in production
      if (process.env.NODE_ENV === 'production') {
        const url = new URL(value);
        if (
          url.hostname === 'localhost' ||
          url.hostname === '127.0.0.1' ||
          url.hostname.startsWith('192.168.') ||
          url.hostname.startsWith('10.') ||
          url.hostname.startsWith('172.')
        ) {
          throw new Error('Internal URLs are not allowed');
        }
      }
      return true;
    });
};

/**
 * Phone number validation
 */
export const validatePhoneNumber = (field: string): ValidationChain => {
  return body(field)
    .optional()
    .trim()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Invalid phone number format (use E.164 format)');
};

/**
 * Date validation
 */
export const validateDate = (field: string): ValidationChain => {
  return body(field)
    .isISO8601()
    .withMessage('Invalid date format (use ISO 8601)')
    .toDate();
};

/**
 * Enum validation
 */
export const validateEnum = (field: string, allowedValues: string[]): ValidationChain => {
  return body(field)
    .isIn(allowedValues)
    .withMessage(`${field} must be one of: ${allowedValues.join(', ')}`);
};

/**
 * Array validation
 */
export const validateArray = (
  field: string,
  minLength: number = 0,
  maxLength: number = 100
): ValidationChain => {
  return body(field)
    .isArray({ min: minLength, max: maxLength })
    .withMessage(`${field} must be an array with ${minLength}-${maxLength} items`);
};

/**
 * Numeric validation
 */
export const validateNumber = (
  field: string,
  min?: number,
  max?: number
): ValidationChain => {
  let validator = body(field)
    .isNumeric()
    .withMessage(`${field} must be a number`);

  if (min !== undefined && max !== undefined) {
    validator = validator
      .isFloat({ min, max })
      .withMessage(`${field} must be between ${min} and ${max}`);
  } else if (min !== undefined) {
    validator = validator
      .isFloat({ min })
      .withMessage(`${field} must be at least ${min}`);
  } else if (max !== undefined) {
    validator = validator
      .isFloat({ max })
      .withMessage(`${field} must be at most ${max}`);
  }

  return validator;
};

/**
 * Integer validation
 */
export const validateInteger = (
  field: string,
  min?: number,
  max?: number
): ValidationChain => {
  let validator = body(field)
    .isInt()
    .withMessage(`${field} must be an integer`);

  if (min !== undefined && max !== undefined) {
    validator = validator
      .isInt({ min, max })
      .withMessage(`${field} must be between ${min} and ${max}`);
  } else if (min !== undefined) {
    validator = validator
      .isInt({ min })
      .withMessage(`${field} must be at least ${min}`);
  } else if (max !== undefined) {
    validator = validator
      .isInt({ max })
      .withMessage(`${field} must be at most ${max}`);
  }

  return validator;
};

/**
 * Boolean validation
 */
export const validateBoolean = (field: string): ValidationChain => {
  return body(field)
    .isBoolean()
    .withMessage(`${field} must be a boolean`)
    .toBoolean();
};

/**
 * Text content validation (prevent XSS)
 */
export const validateTextContent = (
  field: string,
  minLength: number = 1,
  maxLength: number = 5000
): ValidationChain => {
  return body(field)
    .trim()
    .isLength({ min: minLength, max: maxLength })
    .withMessage(`${field} must be between ${minLength} and ${maxLength} characters`)
    .customSanitizer((value) => {
      // Remove HTML tags
      return value.replace(/<[^>]*>/g, '');
    })
    .custom((value) => {
      // Check for script injection attempts
      const xssPatterns = securityConfig.monitoring.xssPatterns;
      for (const pattern of xssPatterns) {
        if (pattern.test(value)) {
          throw new Error('Invalid content detected');
        }
      }
      return true;
    });
};

/**
 * Rich text validation (for editors)
 */
export const validateRichText = (
  field: string,
  maxLength: number = 50000
): ValidationChain => {
  return body(field)
    .isLength({ max: maxLength })
    .withMessage(`${field} is too long`)
    .custom((value) => {
      // Allow only safe HTML tags
      const allowedTags = [
        'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre',
      ];

      const tagPattern = /<(\/?)([\w-]+)[^>]*>/g;
      let match;

      while ((match = tagPattern.exec(value)) !== null) {
        const tag = match[2].toLowerCase();
        if (!allowedTags.includes(tag)) {
          throw new Error(`HTML tag <${tag}> is not allowed`);
        }
      }

      // Check for dangerous attributes
      const dangerousAttrs = ['onclick', 'onerror', 'onload', 'onmouseover'];
      for (const attr of dangerousAttrs) {
        if (value.toLowerCase().includes(attr)) {
          throw new Error('Dangerous HTML attributes detected');
        }
      }

      return true;
    });
};

/**
 * File upload validation
 */
export const validateFileUpload = () => {
  return [
    body('filename')
      .trim()
      .notEmpty()
      .withMessage('Filename is required')
      .matches(/^[a-zA-Z0-9_.-]+$/)
      .withMessage('Invalid filename format')
      .custom((value) => {
        const ext = value.substring(value.lastIndexOf('.')).toLowerCase();
        if (!securityConfig.fileUpload.allowedExtensions.includes(ext)) {
          throw new Error(`File extension ${ext} is not allowed`);
        }
        return true;
      }),
    body('mimetype')
      .isIn(securityConfig.fileUpload.allowedMimeTypes)
      .withMessage('File type not allowed'),
    body('size')
      .isInt({ max: securityConfig.fileUpload.maxSize })
      .withMessage(`File size must not exceed ${securityConfig.fileUpload.maxSize / 1024 / 1024}MB`),
  ];
};

/**
 * Search query validation
 */
export const validateSearchQuery = (): ValidationChain => {
  return query('q')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Search query must be between 1 and 200 characters')
    .custom((value) => {
      // Check for SQL injection patterns
      const sqlPatterns = securityConfig.monitoring.sqlInjectionPatterns;
      for (const pattern of sqlPatterns) {
        if (pattern.test(value)) {
          throw new Error('Invalid search query');
        }
      }
      return true;
    });
};

/**
 * Pagination validation
 */
export const validatePagination = () => {
  return [
    query('page')
      .optional()
      .isInt({ min: 1, max: 10000 })
      .withMessage('Page must be between 1 and 10000')
      .toInt(),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
      .toInt(),
  ];
};

/**
 * Sort validation
 */
export const validateSort = (allowedFields: string[]): ValidationChain => {
  return query('sort')
    .optional()
    .custom((value) => {
      const [field, order] = value.split(':');

      if (!allowedFields.includes(field)) {
        throw new Error(`Sort field must be one of: ${allowedFields.join(', ')}`);
      }

      if (order && !['asc', 'desc'].includes(order)) {
        throw new Error('Sort order must be asc or desc');
      }

      return true;
    });
};

/**
 * JWT token validation
 */
export const validateToken = (field: string = 'token'): ValidationChain => {
  return body(field)
    .trim()
    .notEmpty()
    .withMessage('Token is required')
    .matches(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/)
    .withMessage('Invalid token format');
};

/**
 * API key validation
 */
export const validateApiKey = (): ValidationChain => {
  return body('apiKey')
    .trim()
    .notEmpty()
    .withMessage('API key is required')
    .matches(/^plp_[a-f0-9]{64}$/)
    .withMessage('Invalid API key format');
};

/**
 * Color hex validation
 */
export const validateColorHex = (field: string): ValidationChain => {
  return body(field)
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Invalid color hex format');
};

/**
 * Slug validation
 */
export const validateSlug = (field: string): ValidationChain => {
  return body(field)
    .trim()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug must contain only lowercase letters, numbers, and hyphens')
    .isLength({ min: 3, max: 100 })
    .withMessage('Slug must be between 3 and 100 characters');
};

/**
 * Version validation (semver)
 */
export const validateVersion = (field: string): ValidationChain => {
  return body(field)
    .matches(/^\d+\.\d+\.\d+$/)
    .withMessage('Version must be in semver format (e.g., 1.0.0)');
};

/**
 * IP address validation
 */
export const validateIpAddress = (field: string): ValidationChain => {
  return body(field)
    .isIP()
    .withMessage('Invalid IP address');
};

/**
 * UUID validation
 */
export const validateUUID = (field: string): ValidationChain => {
  return body(field)
    .isUUID()
    .withMessage('Invalid UUID format');
};

/**
 * Credit card validation (basic)
 */
export const validateCreditCard = (field: string): ValidationChain => {
  return body(field)
    .isCreditCard()
    .withMessage('Invalid credit card number');
};

/**
 * Base64 validation
 */
export const validateBase64 = (field: string): ValidationChain => {
  return body(field)
    .isBase64()
    .withMessage('Invalid Base64 format');
};

/**
 * JSON validation
 */
export const validateJSON = (field: string): ValidationChain => {
  return body(field)
    .custom((value) => {
      try {
        JSON.parse(value);
        return true;
      } catch {
        throw new Error('Invalid JSON format');
      }
    });
};
