import { Request, Response } from 'express';
import { Tenant } from '../../models/Tenant';
import { User } from '../../models/User';
import { SecurityPolicy } from '../../models/SecurityPolicy';
import { AuditLog } from '../../models/AuditLog';
import { SsoService } from '../../services/sso';

/**
 * Get current tenant details
 */
export const getTenantDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const tenant = req.tenant;

    if (!tenant) {
      res.status(404).json({ error: 'Tenant not found' });
      return;
    }

    res.json(tenant);
  } catch (error) {
    console.error('Error fetching tenant:', error);
    res.status(500).json({ error: 'Failed to fetch tenant details' });
  }
};

/**
 * Update tenant settings
 */
export const updateTenant = async (req: Request, res: Response): Promise<void> => {
  try {
    const tenant = req.tenant;
    const user = (req as any).user;

    if (!tenant) {
      res.status(404).json({ error: 'Tenant not found' });
      return;
    }

    // Check permissions
    if (!user || (user.tenantRole !== 'owner' && user.tenantRole !== 'admin' && user.role !== 'super_admin')) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    const { name, branding, settings } = req.body;

    // Update allowed fields
    if (name) tenant.name = name;
    if (branding) tenant.branding = { ...tenant.branding, ...branding };
    if (settings) tenant.settings = { ...tenant.settings, ...settings };

    await tenant.save();

    // Log audit event
    await AuditLog.create({
      tenantId: tenant._id,
      userId: user._id,
      userEmail: user.email,
      userRole: user.role,
      action: 'tenant.update',
      category: 'tenant',
      severity: 'info',
      resource: 'tenant',
      resourceId: tenant._id.toString(),
      changes: Object.keys(req.body).map(field => ({
        field,
        oldValue: (tenant as any)[field],
        newValue: req.body[field],
      })),
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      status: 'success',
    });

    res.json({
      message: 'Tenant updated successfully',
      tenant,
    });
  } catch (error) {
    console.error('Error updating tenant:', error);
    res.status(500).json({ error: 'Failed to update tenant' });
  }
};

/**
 * Get tenant users
 */
export const getTenantUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const tenant = req.tenant;

    if (!tenant) {
      res.status(404).json({ error: 'Tenant not found' });
      return;
    }

    const { page = 1, limit = 20, role, status, search } = req.query;

    const query: any = { tenantId: tenant._id };

    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 })
      .select('-password -passwordHistory -mfaSecret -mfaBackupCodes');

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching tenant users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

/**
 * Get tenant SSO configuration
 */
export const getSsoConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const tenant = req.tenant;

    if (!tenant) {
      res.status(404).json({ error: 'Tenant not found' });
      return;
    }

    res.json({
      enabled: tenant.ssoConfig.enabled,
      provider: tenant.ssoConfig.provider,
      // Return config without sensitive data (already handled by model transform)
      config: tenant.ssoConfig,
    });
  } catch (error) {
    console.error('Error fetching SSO config:', error);
    res.status(500).json({ error: 'Failed to fetch SSO configuration' });
  }
};

/**
 * Update tenant SSO configuration
 */
export const updateSsoConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const tenant = req.tenant;
    const user = (req as any).user;

    if (!tenant) {
      res.status(404).json({ error: 'Tenant not found' });
      return;
    }

    // Only tenant owners can update SSO
    if (!user || user.tenantRole !== 'owner') {
      res.status(403).json({ error: 'Only tenant owners can configure SSO' });
      return;
    }

    const { enabled, provider, config } = req.body;

    // Update SSO configuration
    tenant.ssoConfig.enabled = enabled !== undefined ? enabled : tenant.ssoConfig.enabled;

    if (provider) {
      tenant.ssoConfig.provider = provider;

      // Update provider-specific config
      if (provider === 'saml' && config) {
        tenant.ssoConfig.saml = { ...tenant.ssoConfig.saml, ...config };
      } else if (provider === 'oauth2' && config) {
        tenant.ssoConfig.oauth2 = { ...tenant.ssoConfig.oauth2, ...config };
      } else if (provider === 'ldap' && config) {
        tenant.ssoConfig.ldap = { ...tenant.ssoConfig.ldap, ...config };
      }
    }

    // Validate configuration
    const validation = SsoService.validateConfig(tenant);
    if (!validation.valid) {
      res.status(400).json({
        error: 'Invalid SSO configuration',
        errors: validation.errors,
      });
      return;
    }

    await tenant.save();

    // Log audit event
    await AuditLog.create({
      tenantId: tenant._id,
      userId: user._id,
      userEmail: user.email,
      userRole: user.role,
      action: 'sso.configure',
      category: 'security',
      severity: 'warning',
      resource: 'tenant',
      resourceId: tenant._id.toString(),
      metadata: { provider, enabled },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      status: 'success',
    });

    res.json({
      message: 'SSO configuration updated successfully',
      ssoConfig: tenant.ssoConfig,
    });
  } catch (error) {
    console.error('Error updating SSO config:', error);
    res.status(500).json({ error: 'Failed to update SSO configuration' });
  }
};

/**
 * Test SSO configuration
 */
export const testSsoConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const tenant = req.tenant;

    if (!tenant) {
      res.status(404).json({ error: 'Tenant not found' });
      return;
    }

    const result = await SsoService.testConfig(tenant);

    res.json(result);
  } catch (error) {
    console.error('Error testing SSO config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test SSO configuration',
    });
  }
};

/**
 * Get tenant security policy
 */
export const getSecurityPolicy = async (req: Request, res: Response): Promise<void> => {
  try {
    const tenant = req.tenant;

    if (!tenant) {
      res.status(404).json({ error: 'Tenant not found' });
      return;
    }

    let policy = await SecurityPolicy.findOne({ tenantId: tenant._id });

    // Create default policy if not exists
    if (!policy) {
      policy = await SecurityPolicy.create({ tenantId: tenant._id });
    }

    res.json(policy);
  } catch (error) {
    console.error('Error fetching security policy:', error);
    res.status(500).json({ error: 'Failed to fetch security policy' });
  }
};

/**
 * Update tenant security policy
 */
export const updateSecurityPolicy = async (req: Request, res: Response): Promise<void> => {
  try {
    const tenant = req.tenant;
    const user = (req as any).user;

    if (!tenant) {
      res.status(404).json({ error: 'Tenant not found' });
      return;
    }

    // Only tenant owners can update security policy
    if (!user || user.tenantRole !== 'owner') {
      res.status(403).json({ error: 'Only tenant owners can update security policy' });
      return;
    }

    let policy = await SecurityPolicy.findOne({ tenantId: tenant._id });

    if (!policy) {
      policy = new SecurityPolicy({ tenantId: tenant._id });
    }

    // Update policy fields
    const allowedFields = [
      'ipWhitelist',
      'ipBlacklist',
      'geoRestrictions',
      'passwordPolicy',
      'mfaPolicy',
      'sessionPolicy',
      'rateLimiting',
      'auditSettings',
      'complianceMode',
      'customRules',
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        (policy as any)[field] = req.body[field];
      }
    });

    await policy.save();

    // Log audit event
    await AuditLog.create({
      tenantId: tenant._id,
      userId: user._id,
      userEmail: user.email,
      userRole: user.role,
      action: 'security.policy.update',
      category: 'security',
      severity: 'warning',
      resource: 'security-policy',
      resourceId: policy._id.toString(),
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      status: 'success',
    });

    res.json({
      message: 'Security policy updated successfully',
      policy,
    });
  } catch (error) {
    console.error('Error updating security policy:', error);
    res.status(500).json({ error: 'Failed to update security policy' });
  }
};

/**
 * Get tenant usage statistics
 */
export const getTenantUsage = async (req: Request, res: Response): Promise<void> => {
  try {
    const tenant = req.tenant;

    if (!tenant) {
      res.status(404).json({ error: 'Tenant not found' });
      return;
    }

    // Get current usage
    const userCount = await User.countDocuments({ tenantId: tenant._id, status: 'active' });

    // Update tenant usage
    tenant.usage = {
      ...tenant.usage,
      users: userCount,
    } as any;

    await tenant.save();

    res.json({
      current: tenant.usage,
      quotas: tenant.quotas,
      plan: tenant.plan,
      percentages: {
        users: ((tenant.usage?.users || 0) / tenant.quotas.maxUsers) * 100,
        storage: ((tenant.usage?.storage || 0) / tenant.quotas.maxStorage) * 100,
        apiCalls: ((tenant.usage?.apiCallsThisHour || 0) / tenant.quotas.maxApiCallsPerHour) * 100,
      },
    });
  } catch (error) {
    console.error('Error fetching tenant usage:', error);
    res.status(500).json({ error: 'Failed to fetch usage statistics' });
  }
};
