import express from 'express';
import { authenticate } from '../../middleware/auth.js';
import { requireAdmin } from '../../middleware/rbac.js';
import { getAllRoles, getRoleByName } from '../../controllers/admin/roleController.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

/**
 * GET /api/admin/roles
 * Get all roles and their permissions
 */
router.get('/', getAllRoles);

/**
 * GET /api/admin/roles/:name
 * Get role by name with permissions
 */
router.get('/:name', getRoleByName);

export default router;
