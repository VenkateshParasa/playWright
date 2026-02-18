/**
 * Enhanced Authentication Security
 * Account lockout, password policies, 2FA, and session management
 */

import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { generateOTP, generateBackupCodes, hash } from '../utils/encryption.js';
import { securityConfig } from '../config/security.js';

// Schema for failed login attempts
const loginAttemptSchema = new mongoose.Schema({
  identifier: { type: String, required: true, index: true }, // email or IP
  attempts: { type: Number, default: 0 },
  lastAttempt: { type: Date, default: Date.now },
  lockedUntil: { type: Date },
  createdAt: { type: Date, default: Date.now, expires: 86400 }, // Auto-delete after 24 hours
});

const LoginAttempt = mongoose.model('LoginAttempt', loginAttemptSchema);

// Schema for active sessions
const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  token: { type: String, required: true, unique: true },
  deviceInfo: {
    userAgent: String,
    ip: String,
    device: String,
    browser: String,
    os: String,
  },
  lastActivity: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

sessionSchema.index({ userId: 1, createdAt: -1 });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Session = mongoose.model('Session', sessionSchema);

// Schema for password history
const passwordHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const PasswordHistory = mongoose.model('PasswordHistory', passwordHistorySchema);

// Schema for 2FA
const twoFactorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
  secret: { type: String, required: true },
  enabled: { type: Boolean, default: false },
  backupCodes: [{ code: String, used: Boolean }],
  createdAt: { type: Date, default: Date.now },
});

const TwoFactor = mongoose.model('TwoFactor', twoFactorSchema);

/**
 * Check if account is locked
 */
export const checkAccountLockout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const identifier = req.body.email || req.ip;

    if (!identifier) {
      next();
      return;
    }

    const attempt = await LoginAttempt.findOne({ identifier });

    if (!attempt) {
      next();
      return;
    }

    // Check if account is locked
    if (attempt.lockedUntil && attempt.lockedUntil > new Date()) {
      const remainingTime = Math.ceil((attempt.lockedUntil.getTime() - Date.now()) / 1000 / 60);

      res.status(423).json({
        success: false,
        message: `Account is locked. Try again in ${remainingTime} minutes.`,
        lockedUntil: attempt.lockedUntil,
      });
      return;
    }

    // Reset if lockout expired
    if (attempt.lockedUntil && attempt.lockedUntil <= new Date()) {
      await LoginAttempt.deleteOne({ identifier });
    }

    next();
  } catch (error) {
    console.error('Error checking account lockout:', error);
    next();
  }
};

/**
 * Record failed login attempt
 */
export const recordFailedLogin = async (identifier: string): Promise<void> => {
  try {
    const { maxFailedAttempts, lockoutDuration } = securityConfig.accountLockout;

    let attempt = await LoginAttempt.findOne({ identifier });

    if (!attempt) {
      attempt = new LoginAttempt({ identifier, attempts: 1 });
    } else {
      attempt.attempts += 1;
      attempt.lastAttempt = new Date();

      // Lock account if threshold exceeded
      if (attempt.attempts >= maxFailedAttempts) {
        attempt.lockedUntil = new Date(Date.now() + lockoutDuration);

        console.warn('Account locked due to failed login attempts:', {
          identifier,
          attempts: attempt.attempts,
          lockedUntil: attempt.lockedUntil,
        });
      }
    }

    await attempt.save();
  } catch (error) {
    console.error('Error recording failed login:', error);
  }
};

/**
 * Reset failed login attempts (after successful login)
 */
export const resetFailedLoginAttempts = async (identifier: string): Promise<void> => {
  try {
    await LoginAttempt.deleteOne({ identifier });
  } catch (error) {
    console.error('Error resetting failed login attempts:', error);
  }
};

/**
 * Create new session
 */
export const createSession = async (
  userId: string,
  token: string,
  req: Request
): Promise<void> => {
  try {
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const ip = req.ip || req.socket.remoteAddress || 'Unknown';

    // Parse user agent (simplified)
    const deviceInfo = {
      userAgent,
      ip,
      device: userAgent.includes('Mobile') ? 'Mobile' : 'Desktop',
      browser: userAgent.split('/')[0] || 'Unknown',
      os: userAgent.includes('Windows') ? 'Windows'
        : userAgent.includes('Mac') ? 'Mac'
        : userAgent.includes('Linux') ? 'Linux'
        : 'Unknown',
    };

    const expiresAt = new Date(Date.now() + securityConfig.session.absoluteTimeout);

    const session = new Session({
      userId,
      token,
      deviceInfo,
      expiresAt,
    });

    await session.save();

    // Enforce max sessions limit
    const sessions = await Session.find({ userId }).sort({ createdAt: -1 });

    if (sessions.length > securityConfig.session.maxSessions) {
      const sessionsToDelete = sessions.slice(securityConfig.session.maxSessions);
      const tokenIds = sessionsToDelete.map(s => s._id);
      await Session.deleteMany({ _id: { $in: tokenIds } });
    }
  } catch (error) {
    console.error('Error creating session:', error);
  }
};

/**
 * Update session activity
 */
export const updateSessionActivity = async (token: string): Promise<void> => {
  try {
    await Session.findOneAndUpdate(
      { token },
      { lastActivity: new Date() }
    );
  } catch (error) {
    console.error('Error updating session activity:', error);
  }
};

/**
 * Check session timeout
 */
export const checkSessionTimeout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies.accessToken || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      next();
      return;
    }

    const session = await Session.findOne({ token });

    if (!session) {
      next();
      return;
    }

    const inactiveTime = Date.now() - session.lastActivity.getTime();

    // Check inactivity timeout
    if (inactiveTime > securityConfig.session.sessionTimeout) {
      await Session.deleteOne({ token });

      res.status(401).json({
        success: false,
        message: 'Session expired due to inactivity',
        code: 'SESSION_TIMEOUT',
      });
      return;
    }

    // Update last activity
    await updateSessionActivity(token);

    next();
  } catch (error) {
    console.error('Error checking session timeout:', error);
    next();
  }
};

/**
 * Revoke session
 */
export const revokeSession = async (token: string): Promise<void> => {
  try {
    await Session.deleteOne({ token });
  } catch (error) {
    console.error('Error revoking session:', error);
  }
};

/**
 * Revoke all user sessions
 */
export const revokeAllUserSessions = async (userId: string): Promise<void> => {
  try {
    await Session.deleteMany({ userId });
  } catch (error) {
    console.error('Error revoking all user sessions:', error);
  }
};

/**
 * Get user active sessions
 */
export const getUserSessions = async (userId: string): Promise<any[]> => {
  try {
    return await Session.find({ userId }).sort({ lastActivity: -1 }).lean();
  } catch (error) {
    console.error('Error getting user sessions:', error);
    return [];
  }
};

/**
 * Save password to history
 */
export const savePasswordHistory = async (
  userId: string,
  passwordHash: string
): Promise<void> => {
  try {
    const history = new PasswordHistory({ userId, passwordHash });
    await history.save();

    // Keep only last N passwords
    const allPasswords = await PasswordHistory.find({ userId }).sort({ createdAt: -1 });

    if (allPasswords.length > securityConfig.password.preventReuse) {
      const toDelete = allPasswords.slice(securityConfig.password.preventReuse);
      const ids = toDelete.map(p => p._id);
      await PasswordHistory.deleteMany({ _id: { $in: ids } });
    }
  } catch (error) {
    console.error('Error saving password history:', error);
  }
};

/**
 * Check if password was used recently
 */
export const isPasswordReused = async (
  userId: string,
  passwordHash: string
): Promise<boolean> => {
  try {
    const history = await PasswordHistory.find({ userId })
      .sort({ createdAt: -1 })
      .limit(securityConfig.password.preventReuse);

    return history.some(p => p.passwordHash === passwordHash);
  } catch (error) {
    console.error('Error checking password reuse:', error);
    return false;
  }
};

/**
 * Enable 2FA for user
 */
export const enableTwoFactor = async (userId: string): Promise<{
  secret: string;
  backupCodes: string[];
  qrCode: string;
}> => {
  try {
    // Generate secret (in production, use speakeasy or similar)
    const secret = hash(userId + Date.now().toString());
    const backupCodes = generateBackupCodes(securityConfig.twoFactor.backupCodesCount);

    const twoFactor = new TwoFactor({
      userId,
      secret,
      enabled: false, // User must verify first
      backupCodes: backupCodes.map(code => ({ code: hash(code), used: false })),
    });

    await twoFactor.save();

    // Generate QR code data (in production, use qrcode library)
    const qrCode = `otpauth://totp/${securityConfig.twoFactor.issuer}?secret=${secret}`;

    return { secret, backupCodes, qrCode };
  } catch (error) {
    console.error('Error enabling 2FA:', error);
    throw error;
  }
};

/**
 * Verify 2FA code
 */
export const verifyTwoFactorCode = async (
  userId: string,
  code: string
): Promise<boolean> => {
  try {
    const twoFactor = await TwoFactor.findOne({ userId });

    if (!twoFactor || !twoFactor.enabled) {
      return false;
    }

    // In production, use proper TOTP verification (speakeasy)
    // This is a simplified version
    const expectedCode = hash(twoFactor.secret + Math.floor(Date.now() / 30000));
    const providedCode = hash(code);

    return expectedCode === providedCode;
  } catch (error) {
    console.error('Error verifying 2FA code:', error);
    return false;
  }
};

/**
 * Verify backup code
 */
export const verifyBackupCode = async (
  userId: string,
  code: string
): Promise<boolean> => {
  try {
    const twoFactor = await TwoFactor.findOne({ userId });

    if (!twoFactor) {
      return false;
    }

    const hashedCode = hash(code);
    const backupCode = twoFactor.backupCodes.find(
      bc => bc.code === hashedCode && !bc.used
    );

    if (!backupCode) {
      return false;
    }

    // Mark code as used
    backupCode.used = true;
    await twoFactor.save();

    return true;
  } catch (error) {
    console.error('Error verifying backup code:', error);
    return false;
  }
};

/**
 * Disable 2FA
 */
export const disableTwoFactor = async (userId: string): Promise<void> => {
  try {
    await TwoFactor.deleteOne({ userId });
  } catch (error) {
    console.error('Error disabling 2FA:', error);
  }
};

/**
 * Check if user has 2FA enabled
 */
export const isTwoFactorEnabled = async (userId: string): Promise<boolean> => {
  try {
    const twoFactor = await TwoFactor.findOne({ userId });
    return twoFactor?.enabled || false;
  } catch (error) {
    console.error('Error checking 2FA status:', error);
    return false;
  }
};

/**
 * Middleware to require 2FA verification
 */
export const requireTwoFactor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const twoFactorEnabled = await isTwoFactorEnabled(userId);

    if (!twoFactorEnabled) {
      next();
      return;
    }

    // Check if 2FA was verified in this session
    const twoFactorVerified = (req as any).session?.twoFactorVerified;

    if (!twoFactorVerified) {
      res.status(403).json({
        success: false,
        message: '2FA verification required',
        code: 'TWO_FACTOR_REQUIRED',
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Error checking 2FA requirement:', error);
    next();
  }
};

/**
 * Clean up expired sessions periodically
 */
export const cleanupExpiredSessions = async (): Promise<void> => {
  try {
    const result = await Session.deleteMany({
      expiresAt: { $lt: new Date() },
    });

    if (result.deletedCount > 0) {
      console.log(`Cleaned up ${result.deletedCount} expired sessions`);
    }
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error);
  }
};

// Run cleanup every hour
setInterval(cleanupExpiredSessions, 60 * 60 * 1000);

/**
 * Export models for use in controllers
 */
export { LoginAttempt, Session, PasswordHistory, TwoFactor };
