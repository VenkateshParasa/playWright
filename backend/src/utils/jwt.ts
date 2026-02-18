import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';

export interface JWTPayload {
  userId: string;
  email: string;
  role?: string;
}

/**
 * Generate JWT access token
 */
export const generateAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'playwright-learning-platform',
  });
};

/**
 * Generate JWT refresh token
 */
export const generateRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    issuer: 'playwright-learning-platform',
  });
};

/**
 * Verify and decode JWT token
 */
export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Generate password reset token (short-lived)
 */
export const generatePasswordResetToken = (email: string): string => {
  return jwt.sign({ email, type: 'password-reset' }, JWT_SECRET, {
    expiresIn: '1h',
    issuer: 'playwright-learning-platform',
  });
};

/**
 * Verify password reset token
 */
export const verifyPasswordResetToken = (token: string): { email: string } => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.type !== 'password-reset') {
      throw new Error('Invalid token type');
    }
    return { email: decoded.email };
  } catch (error) {
    throw new Error('Invalid or expired reset token');
  }
};

/**
 * Generate email verification token
 */
export const generateEmailVerificationToken = (email: string): string => {
  return jwt.sign({ email, type: 'email-verification' }, JWT_SECRET, {
    expiresIn: '24h',
    issuer: 'playwright-learning-platform',
  });
};

/**
 * Verify email verification token
 */
export const verifyEmailVerificationToken = (token: string): { email: string } => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.type !== 'email-verification') {
      throw new Error('Invalid token type');
    }
    return { email: decoded.email };
  } catch (error) {
    throw new Error('Invalid or expired verification token');
  }
};
