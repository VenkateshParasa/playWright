import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.js';
import { Resource, Action, hasPermission } from '../types/permissions.js';

/**
 * RBAC Middleware - Check if user has permission for resource and action
 */
export const checkPermission = (resource: Resource, action: Action) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const userRole = req.user.role || 'student';
    const hasAccess = hasPermission(userRole, resource, action);

    if (!hasAccess) {
      res.status(403).json({
        success: false,
        message: `Insufficient permissions. Required: ${action} on ${resource}`,
        requiredPermission: { resource, action },
      });
      return;
    }

    next();
  };
};

/**
 * Require admin role
 */
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
    return;
  }

  next();
};

/**
 * Require instructor or admin role
 */
export const requireInstructorOrAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
    return;
  }

  if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Instructor or admin access required',
    });
    return;
  }

  next();
};

/**
 * Allow users to access only their own resources
 */
export const requireSelfOrAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
    return;
  }

  const targetUserId = req.params.id || req.params.userId;
  const isAdmin = req.user.role === 'admin';
  const isSelf = req.user.userId === targetUserId;

  if (!isAdmin && !isSelf) {
    res.status(403).json({
      success: false,
      message: 'You can only access your own resources',
    });
    return;
  }

  next();
};
