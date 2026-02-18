import express from 'express';
import * as superAdminController from '../controllers/admin/superAdminController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// All routes require super admin authentication
router.use(authenticate);
router.use(authorize(['super_admin']));

// Tenant Management
router.get('/tenants', superAdminController.getAllTenants);
router.post('/tenants', superAdminController.createTenant);
router.put('/tenants/:tenantId', superAdminController.updateTenant);
router.post('/tenants/:tenantId/suspend', superAdminController.suspendTenant);
router.post('/tenants/:tenantId/activate', superAdminController.activateTenant);
router.delete('/tenants/:tenantId', superAdminController.deleteTenant);

// User Management
router.get('/users', superAdminController.getAllUsers);
router.post('/users/:userId/impersonate', superAdminController.impersonateUser);
router.post('/users/bulk', superAdminController.bulkUserOperation);
router.get('/users/export', superAdminController.exportUsers);

// System Health
router.get('/health', superAdminController.getSystemHealth);

// Audit Logs
router.get('/audit-logs', superAdminController.getAuditLogs);

export default router;
