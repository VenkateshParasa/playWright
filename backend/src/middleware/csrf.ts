import { Request, Response, NextFunction } from 'express';
import { verifyCsrfToken } from '../utils/csrf.js';

/**
 * Middleware to verify CSRF token
 */
export const csrfProtection = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Skip CSRF check for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    next();
    return;
  }

  const csrfToken = req.headers['x-csrf-token'] as string;
  const sessionToken = req.cookies.csrfToken;

  if (!csrfToken || !sessionToken) {
    res.status(403).json({
      success: false,
      message: 'CSRF token missing',
    });
    return;
  }

  if (!verifyCsrfToken(csrfToken, sessionToken)) {
    res.status(403).json({
      success: false,
      message: 'Invalid CSRF token',
    });
    return;
  }

  next();
};
