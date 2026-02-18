import express from 'express';
import * as tenantController from '../controllers/admin/tenantController';
import { authenticate, authorize } from '../middleware/auth';
import { requireTenant } from '../middleware/tenancy';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get current tenant details
router.get('/details', requireTenant, tenantController.getTenantDetails);

// Update tenant settings (tenant admin only)
router.put(
  '/update',
  requireTenant,
  authorize(['tenant_admin', 'super_admin']),
  tenantController.updateTenant
);

// Get tenant users (tenant admin only)
router.get(
  '/users',
  requireTenant,
  authorize(['tenant_admin', 'super_admin']),
  tenantController.getTenantUsers
);

// SSO Configuration
router.get(
  '/sso/config',
  requireTenant,
  authorize(['tenant_admin', 'super_admin']),
  tenantController.getSsoConfig
);

router.put(
  '/sso/config',
  requireTenant,
  authorize(['tenant_admin', 'super_admin']),
  tenantController.updateSsoConfig
);

router.post(
  '/sso/test',
  requireTenant,
  authorize(['tenant_admin', 'super_admin']),
  tenantController.testSsoConfig
);

// Security Policy
router.get(
  '/security/policy',
  requireTenant,
  authorize(['tenant_admin', 'super_admin']),
  tenantController.getSecurityPolicy
);

router.put(
  '/security/policy',
  requireTenant,
  authorize(['tenant_admin', 'super_admin']),
  tenantController.updateSecurityPolicy
);

// Usage Statistics
router.get(
  '/usage',
  requireTenant,
  authorize(['tenant_admin', 'super_admin']),
  tenantController.getTenantUsage
);

export default router;
