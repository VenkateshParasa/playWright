import crypto from 'crypto';

/**
 * Generate CSRF token
 */
export const generateCsrfToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Verify CSRF token
 */
export const verifyCsrfToken = (token: string, sessionToken: string): boolean => {
  return token === sessionToken;
};
