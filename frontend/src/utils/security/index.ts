/**
 * Frontend Security Utilities
 * Client-side security helpers and validation
 */

/**
 * Sanitize HTML to prevent XSS
 */
export const sanitizeHtml = (dirty: string): string => {
  const element = document.createElement('div');
  element.textContent = dirty;
  return element.innerHTML;
};

/**
 * Escape HTML special characters
 */
export const escapeHtml = (unsafe: string): string => {
  const htmlEscapeMap: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return unsafe.replace(/[&<>"'/]/g, (char) => htmlEscapeMap[char]);
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

/**
 * Validate password strength
 */
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  errors: string[];
} => {
  const errors: string[] = [];
  let score = 0;

  // Length check
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long');
  } else {
    score += 1;
    if (password.length >= 16) score += 1;
  }

  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    score += 1;
  }

  // Lowercase check
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    score += 1;
  }

  // Number check
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  } else {
    score += 1;
  }

  // Special character check
  if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  } else {
    score += 1;
  }

  // Common password check
  const commonPasswords = [
    'password',
    'Password123',
    '12345678',
    'qwerty',
    'abc123',
    'password1',
    'Password1!',
  ];

  if (commonPasswords.includes(password)) {
    errors.push('Password is too common');
    score = 0;
  }

  // Determine strength
  let strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  if (score <= 2) {
    strength = 'weak';
  } else if (score <= 4) {
    strength = 'medium';
  } else if (score <= 5) {
    strength = 'strong';
  } else {
    strength = 'very-strong';
  }

  return {
    isValid: errors.length === 0,
    strength,
    errors,
  };
};

/**
 * Validate URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Check if URL is safe (not pointing to internal resources)
 */
export const isSafeUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);

    // Block localhost and internal IPs
    const hostname = urlObj.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.16.') ||
      hostname.includes('local')
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

/**
 * Detect potential XSS in string
 */
export const detectXss = (input: string): boolean => {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /onerror\s*=/gi,
    /onload\s*=/gi,
    /<iframe/gi,
    /<embed/gi,
    /<object/gi,
  ];

  return xssPatterns.some((pattern) => pattern.test(input));
};

/**
 * Sanitize user input for display
 */
export const sanitizeInput = (input: string): string => {
  // Remove script tags and event handlers
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/javascript:/gi, '');

  return sanitized;
};

/**
 * Generate secure random string
 */
export const generateRandomString = (length: number = 32): string => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);

  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset[randomValues[i] % charset.length];
  }

  return result;
};

/**
 * Hash string using SHA-256
 */
export const hashString = async (str: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Secure local storage with encryption
 */
export class SecureStorage {
  private static readonly prefix = 'secure_';

  /**
   * Encrypt data (simple XOR cipher - use proper encryption in production)
   */
  private static encrypt(data: string, key: string): string {
    let encrypted = '';
    for (let i = 0; i < data.length; i++) {
      encrypted += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(encrypted);
  }

  /**
   * Decrypt data
   */
  private static decrypt(encryptedData: string, key: string): string {
    const encrypted = atob(encryptedData);
    let decrypted = '';
    for (let i = 0; i < encrypted.length; i++) {
      decrypted += String.fromCharCode(encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return decrypted;
  }

  /**
   * Set encrypted item in localStorage
   */
  static setItem(key: string, value: any, encryptionKey?: string): void {
    try {
      const stringValue = JSON.stringify(value);
      const finalValue = encryptionKey
        ? this.encrypt(stringValue, encryptionKey)
        : stringValue;

      localStorage.setItem(this.prefix + key, finalValue);
    } catch (error) {
      console.error('Error setting secure storage item:', error);
    }
  }

  /**
   * Get and decrypt item from localStorage
   */
  static getItem<T>(key: string, encryptionKey?: string): T | null {
    try {
      const storedValue = localStorage.getItem(this.prefix + key);
      if (!storedValue) return null;

      const stringValue = encryptionKey
        ? this.decrypt(storedValue, encryptionKey)
        : storedValue;

      return JSON.parse(stringValue);
    } catch (error) {
      console.error('Error getting secure storage item:', error);
      return null;
    }
  }

  /**
   * Remove item from localStorage
   */
  static removeItem(key: string): void {
    localStorage.removeItem(this.prefix + key);
  }

  /**
   * Clear all secure storage items
   */
  static clear(): void {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }
}

/**
 * Validate file upload
 */
export const validateFileUpload = (
  file: File,
  options: {
    maxSize?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
  } = {}
): { isValid: boolean; error?: string } => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf'],
  } = options;

  // Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`,
    };
  }

  // Check MIME type
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type ${file.type} is not allowed`,
    };
  }

  // Check file extension
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    return {
      isValid: false,
      error: `File extension ${ext} is not allowed`,
    };
  }

  return { isValid: true };
};

/**
 * Mask email address
 */
export const maskEmail = (email: string): string => {
  const [username, domain] = email.split('@');
  if (!domain) return email;

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
 * Debounce function for rate limiting user actions
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function for rate limiting
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Check if browser supports required security features
 */
export const checkSecurityFeatures = (): {
  supported: boolean;
  missing: string[];
} => {
  const missing: string[] = [];

  if (!window.crypto || !window.crypto.subtle) {
    missing.push('Web Crypto API');
  }

  if (!('Promise' in window)) {
    missing.push('Promises');
  }

  if (!window.localStorage) {
    missing.push('Local Storage');
  }

  if (!window.sessionStorage) {
    missing.push('Session Storage');
  }

  return {
    supported: missing.length === 0,
    missing,
  };
};

/**
 * Detect if running in iframe (clickjacking protection)
 */
export const isInIframe = (): boolean => {
  return window.self !== window.top;
};

/**
 * Prevent iframe embedding
 */
export const preventIframeEmbedding = (): void => {
  if (isInIframe()) {
    console.warn('Application is running in an iframe');
    // Optionally break out of iframe
    // window.top!.location = window.self.location;
  }
};

/**
 * Content Security Policy violation reporter
 */
export const setupCspReporting = (reportUrl: string): void => {
  document.addEventListener('securitypolicyviolation', (event) => {
    const violation = {
      blockedUri: event.blockedURI,
      violatedDirective: event.violatedDirective,
      effectiveDirective: event.effectiveDirective,
      originalPolicy: event.originalPolicy,
      sourceFile: event.sourceFile,
      lineNumber: event.lineNumber,
      columnNumber: event.columnNumber,
      statusCode: event.statusCode,
      timestamp: new Date().toISOString(),
    };

    // Report violation to server
    fetch(reportUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(violation),
    }).catch(console.error);

    console.warn('CSP Violation:', violation);
  });
};

/**
 * Disable autocomplete for sensitive forms
 */
export const disableAutocomplete = (formId: string): void => {
  const form = document.getElementById(formId);
  if (form) {
    form.setAttribute('autocomplete', 'off');
    const inputs = form.querySelectorAll('input');
    inputs.forEach((input) => {
      input.setAttribute('autocomplete', 'off');
    });
  }
};
