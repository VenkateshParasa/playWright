import express from 'express';
import { authenticate } from '../../middleware/auth.js';
import { requireAdmin } from '../../middleware/rbac.js';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  suspendUser,
  activateUser,
  resetUserPassword,
  getUserStats,
  bulkUserOperations,
  getUserActivity,
} from '../../controllers/admin/userController.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

/**
 * GET /api/admin/users
 * Get all users with pagination, filters, and search
 * Query params:
 *   - page: number (default: 1)
 *   - limit: number (default: 20)
 *   - search: string (search by name/email)
 *   - role: 'student' | 'instructor' | 'admin' | 'all'
 *   - status: 'active' | 'suspended' | 'deleted' | 'all'
 *   - sortBy: string (default: 'createdAt')
 *   - sortOrder: 'asc' | 'desc' (default: 'desc')
 *   - startDate: ISO date string
 *   - endDate: ISO date string
 */
router.get('/', getAllUsers);

/**
 * GET /api/admin/users/stats
 * Get user statistics
 */
router.get('/stats', getUserStats);

/**
 * GET /api/admin/users/:id
 * Get user by ID with full details
 */
router.get('/:id', getUserById);

/**
 * PUT /api/admin/users/:id
 * Update user details
 * Body: { firstName?, lastName?, email?, role?, avatar?, isEmailVerified? }
 */
router.put('/:id', updateUser);

/**
 * DELETE /api/admin/users/:id
 * Delete user (soft delete by default)
 * Query params:
 *   - hardDelete: boolean (default: false)
 */
router.delete('/:id', deleteUser);

/**
 * POST /api/admin/users/:id/suspend
 * Suspend user account
 * Body: { reason: string }
 */
router.post('/:id/suspend', suspendUser);

/**
 * POST /api/admin/users/:id/activate
 * Activate user account
 */
router.post('/:id/activate', activateUser);

/**
 * POST /api/admin/users/:id/reset-password
 * Reset user password (generates temporary password)
 * Body: { sendEmail?: boolean }
 */
router.post('/:id/reset-password', resetUserPassword);

/**
 * GET /api/admin/users/:id/activity
 * Get user activity timeline
 * Query params:
 *   - limit: number (default: 50)
 */
router.get('/:id/activity', getUserActivity);

/**
 * POST /api/admin/users/bulk
 * Bulk operations on users
 * Body: {
 *   operation: 'suspend' | 'activate' | 'delete' | 'export',
 *   userIds: string[],
 *   data?: { reason?: string }
 * }
 */
router.post('/bulk', bulkUserOperations);

export default router;
