/**
 * Encryption Utilities
 * Provides encryption/decryption and hashing functions for sensitive data
 */

import crypto from 'crypto';
import { securityConfig } from '../config/security.js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const algorithm = securityConfig.encryption.algorithm;

/**
 * Encrypt data using AES-256-GCM
 */
export const encrypt = (text: string): string => {
  try {
    const iv = crypto.randomBytes(securityConfig.encryption.ivLength);
    const cipher = crypto.createCipheriv(
      algorithm,
      Buffer.from(ENCRYPTION_KEY.slice(0, 32)),
      iv
    );

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Return IV, encrypted data, and auth tag concatenated
    return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
  } catch (error) {
    throw new Error('Encryption failed');
  }
};

/**
 * Decrypt data using AES-256-GCM
 */
export const decrypt = (encryptedData: string): string => {
  try {
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const [ivHex, encryptedText, authTagHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(
      algorithm,
      Buffer.from(ENCRYPTION_KEY.slice(0, 32)),
      iv
    );
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    throw new Error('Decryption failed');
  }
};

/**
 * Hash data using SHA-256
 */
export const hash = (data: string): string => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Hash data using SHA-512
 */
export const hashSHA512 = (data: string): string => {
  return crypto.createHash('sha512').update(data).digest('hex');
};

/**
 * Generate secure random token
 */
export const generateSecureToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate secure random string (alphanumeric)
 */
export const generateSecureString = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomBytes = crypto.randomBytes(length);

  for (let i = 0; i < length; i++) {
    result += chars[randomBytes[i] % chars.length];
  }

  return result;
};

/**
 * Generate API key
 */
export const generateApiKey = (): string => {
  const prefix = 'plp'; // Playwright Learning Platform
  const randomPart = generateSecureToken(securityConfig.api.apiKeyLength / 2);
  return `${prefix}_${randomPart}`;
};

/**
 * Hash API key for storage
 */
export const hashApiKey = (apiKey: string): string => {
  return crypto
    .createHash('sha256')
    .update(apiKey + process.env.API_KEY_SALT || 'default-salt')
    .digest('hex');
};

/**
 * Verify API key
 */
export const verifyApiKey = (apiKey: string, hashedApiKey: string): boolean => {
  const hashedInput = hashApiKey(apiKey);
  return crypto.timingSafeEqual(Buffer.from(hashedInput), Buffer.from(hashedApiKey));
};

/**
 * Create HMAC signature
 */
export const createHmacSignature = (data: string, secret: string): string => {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
};

/**
 * Verify HMAC signature
 */
export const verifyHmacSignature = (
  data: string,
  signature: string,
  secret: string
): boolean => {
  const expectedSignature = createHmacSignature(data, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
};

/**
 * Derive key from password using PBKDF2
 */
export const deriveKey = (
  password: string,
  salt: string,
  iterations: number = securityConfig.encryption.iterations
): Buffer => {
  return crypto.pbkdf2Sync(
    password,
    salt,
    iterations,
    securityConfig.encryption.keyLength,
    securityConfig.encryption.digest
  );
};

/**
 * Generate salt
 */
export const generateSalt = (): string => {
  return crypto.randomBytes(securityConfig.encryption.saltLength).toString('hex');
};

/**
 * Mask sensitive data (show only first/last few characters)
 */
export const maskSensitiveData = (
  data: string,
  showFirst: number = 4,
  showLast: number = 4
): string => {
  if (data.length <= showFirst + showLast) {
    return '*'.repeat(data.length);
  }

  const first = data.slice(0, showFirst);
  const last = data.slice(-showLast);
  const masked = '*'.repeat(data.length - showFirst - showLast);

  return `${first}${masked}${last}`;
};

/**
 * Mask email address
 */
export const maskEmail = (email: string): string => {
  const [username, domain] = email.split('@');
  if (!domain) return maskSensitiveData(email);

  const maskedUsername =
    username.length > 3
      ? `${username.slice(0, 2)}${'*'.repeat(username.length - 2)}`
      : '*'.repeat(username.length);

  return `${maskedUsername}@${domain}`;
};

/**
 * Mask credit card number
 */
export const maskCreditCard = (cardNumber: string): string => {
  const cleaned = cardNumber.replace(/\s/g, '');
  if (cleaned.length < 12) return '*'.repeat(cleaned.length);

  return `${'*'.repeat(cleaned.length - 4)}${cleaned.slice(-4)}`;
};

/**
 * Mask phone number
 */
export const maskPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 6) return '*'.repeat(cleaned.length);

  return `${'*'.repeat(cleaned.length - 4)}${cleaned.slice(-4)}`;
};

/**
 * Sanitize object by removing/masking sensitive fields
 */
export const sanitizeObject = (obj: any, sensitiveFields: string[] = []): any => {
  const defaultSensitiveFields = securityConfig.audit.sensitiveFields;
  const allSensitiveFields = [...defaultSensitiveFields, ...sensitiveFields];

  const sanitize = (value: any): any => {
    if (value === null || value === undefined) {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map(sanitize);
    }

    if (typeof value === 'object') {
      const sanitized: any = {};
      for (const [key, val] of Object.entries(value)) {
        const lowerKey = key.toLowerCase();
        if (allSensitiveFields.some(field => lowerKey.includes(field.toLowerCase()))) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = sanitize(val);
        }
      }
      return sanitized;
    }

    return value;
  };

  return sanitize(obj);
};

/**
 * Generate One-Time Password (OTP)
 */
export const generateOTP = (length: number = 6): string => {
  const digits = '0123456789';
  let otp = '';
  const randomBytes = crypto.randomBytes(length);

  for (let i = 0; i < length; i++) {
    otp += digits[randomBytes[i] % digits.length];
  }

  return otp;
};

/**
 * Generate backup codes for 2FA
 */
export const generateBackupCodes = (count: number = 10): string[] => {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = generateSecureString(12).toUpperCase();
    // Format: XXXX-XXXX-XXXX
    const formatted = `${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}`;
    codes.push(formatted);
  }
  return codes;
};

/**
 * Constant-time string comparison (prevents timing attacks)
 */
export const constantTimeCompare = (a: string, b: string): boolean => {
  if (a.length !== b.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
};

/**
 * Encrypt PII (Personally Identifiable Information)
 */
export const encryptPII = (data: string): string => {
  if (!securityConfig.dataProtection.encryptPII) {
    return data;
  }
  return encrypt(data);
};

/**
 * Decrypt PII
 */
export const decryptPII = (encryptedData: string): string => {
  if (!securityConfig.dataProtection.encryptPII) {
    return encryptedData;
  }
  return decrypt(encryptedData);
};

/**
 * Hash sensitive data for comparison (e.g., tokens)
 */
export const hashForComparison = (data: string): string => {
  return crypto
    .createHash('sha256')
    .update(data + (process.env.HASH_SALT || 'default-salt'))
    .digest('hex');
};

/**
 * Generate CSRF token
 */
export const generateCsrfToken = (): string => {
  return crypto.randomBytes(securityConfig.csrf.tokenLength).toString('hex');
};

/**
 * Validate file signature (magic numbers)
 */
export const validateFileSignature = (buffer: Buffer, expectedType: string): boolean => {
  const signatures: { [key: string]: string[] } = {
    'image/jpeg': ['ffd8ffe0', 'ffd8ffe1', 'ffd8ffe2'],
    'image/png': ['89504e47'],
    'image/gif': ['47494638'],
    'application/pdf': ['25504446'],
  };

  const fileSignature = buffer.slice(0, 4).toString('hex');
  const expectedSignatures = signatures[expectedType];

  if (!expectedSignatures) {
    return false;
  }

  return expectedSignatures.some(sig => fileSignature.startsWith(sig));
};

/**
 * Generate checksum for file integrity
 */
export const generateFileChecksum = (buffer: Buffer): string => {
  return crypto.createHash('sha256').update(buffer).digest('hex');
};
