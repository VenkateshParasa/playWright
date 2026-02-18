import { Request, Response } from 'express';
import { Tenant } from '../../models/Tenant';
import { User } from '../../models/User';
import { SecurityPolicy } from '../../models/SecurityPolicy';
import { AuditLog } from '../../models/AuditLog';
import { Session } from '../../models/Session';
import { Parser } from 'json2csv';
import bcrypt from 'bcrypt';

/**
 * Get all tenants (super admin only)
 */
export const getAllTenants = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, status, plan, search } = req.query;

    const query: any = {};

    if (status) query.status = status;
    if (plan) query.plan = plan;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
        { domain: { $regex: search, $options: 'i' } },
      ];
    }

    const tenants = await Tenant.find(query)
      .populate('ownerId', 'firstName lastName email')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await Tenant.countDocuments(query);

    // Get usage stats for each tenant
    const tenantsWithStats = await Promise.all(
      tenants.map(async (tenant) => {
        const userCount = await User.countDocuments({ tenantId: tenant._id });
        return {
          ...tenant.toJSON(),
          userCount,
        };
      })
    );

    res.json({
      tenants: tenantsWithStats,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching tenants:', error);
    res.status(500).json({ error: 'Failed to fetch tenants' });
  }
};

/**
 * Create new tenant
 */
export const createTenant = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { name, slug, plan = 'free', ownerEmail, ownerFirstName, ownerLastName, ownerPassword } = req.body;

    // Validate required fields
    if (!name || !slug || !ownerEmail) {
      res.status(400).json({ error: 'Name, slug, and owner email are required' });
      return;
    }

    // Check if slug is unique
    const existingTenant = await Tenant.findOne({ slug });
    if (existingTenant) {
      res.status(400).json({ error: 'Tenant slug already exists' });
      return;
    }

    // Create owner user
    const hashedPassword = await bcrypt.hash(ownerPassword || 'ChangeMe123!', 10);
    const owner = await User.create({
      email: ownerEmail,
      password: hashedPassword,
      firstName: ownerFirstName || 'Admin',
      lastName: ownerLastName || 'User',
      role: 'tenant_admin',
      tenantRole: 'owner',
      isEmailVerified: true,
      status: 'active',
    });

    // Create tenant
    const tenant = await Tenant.create({
      name,
      slug,
      plan,
      status: plan === 'free' ? 'trial' : 'active',
      ownerId: owner._id,
      admins: [owner._id],
      trialEndsAt: plan === 'free' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : undefined,
    });

    // Update owner with tenant ID
    owner.tenantId = tenant._id;
    await owner.save();

    // Create default security policy
    await SecurityPolicy.create({ tenantId: tenant._id });

    // Log audit event
    await AuditLog.create({
      userId: user._id,
      userEmail: user.email,
      userRole: user.role,
      action: 'tenant.create',
      category: 'tenant',
      severity: 'info',
      resource: 'tenant',
      resourceId: tenant._id.toString(),
      metadata: { tenantName: name, plan },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      status: 'success',
    });

    res.status(201).json({
      message: 'Tenant created successfully',
      tenant,
      owner: {
        id: owner._id,
        email: owner.email,
        temporaryPassword: ownerPassword || 'ChangeMe123!',
      },
    });
  } catch (error) {
    console.error('Error creating tenant:', error);
    res.status(500).json({ error: 'Failed to create tenant' });
  }
};

/**
 * Update tenant (super admin)
 */
export const updateTenant = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { tenantId } = req.params;
    const updates = req.body;

    const tenant = await Tenant.findById(tenantId);

    if (!tenant) {
      res.status(404).json({ error: 'Tenant not found' });
      return;
    }

    // Update allowed fields
    const allowedFields = ['name', 'status', 'plan', 'quotas', 'branding', 'settings'];
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        (tenant as any)[field] = updates[field];
      }
    });

    await tenant.save();

    // Log audit event
    await AuditLog.create({
      userId: user._id,
      userEmail: user.email,
      userRole: user.role,
      action: 'tenant.update',
      category: 'admin',
      severity: 'warning',
      resource: 'tenant',
      resourceId: tenant._id.toString(),
      changes: Object.keys(updates).map(field => ({
        field,
        oldValue: (tenant as any)[field],
        newValue: updates[field],
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
 * Suspend tenant
 */
export const suspendTenant = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { tenantId } = req.params;
    const { reason } = req.body;

    const tenant = await Tenant.findById(tenantId);

    if (!tenant) {
      res.status(404).json({ error: 'Tenant not found' });
      return;
    }

    tenant.status = 'suspended';
    tenant.suspendedAt = new Date();
    tenant.suspendedBy = user._id;
    tenant.suspendedReason = reason;

    await tenant.save();

    // Revoke all active sessions for tenant users
    await Session.updateMany(
      { tenantId: tenant._id, status: 'active' },
      {
        status: 'revoked',
        revokedAt: new Date(),
        revokedBy: user._id,
        revokedReason: 'Tenant suspended',
      }
    );

    // Log audit event
    await AuditLog.create({
      userId: user._id,
      userEmail: user.email,
      userRole: user.role,
      action: 'tenant.suspend',
      category: 'admin',
      severity: 'critical',
      resource: 'tenant',
      resourceId: tenant._id.toString(),
      metadata: { reason },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      status: 'success',
    });

    res.json({
      message: 'Tenant suspended successfully',
      tenant,
    });
  } catch (error) {
    console.error('Error suspending tenant:', error);
    res.status(500).json({ error: 'Failed to suspend tenant' });
  }
};

/**
 * Activate tenant
 */
export const activateTenant = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { tenantId } = req.params;

    const tenant = await Tenant.findById(tenantId);

    if (!tenant) {
      res.status(404).json({ error: 'Tenant not found' });
      return;
    }

    tenant.status = 'active';
    tenant.suspendedAt = undefined;
    tenant.suspendedBy = undefined;
    tenant.suspendedReason = undefined;

    await tenant.save();

    // Log audit event
    await AuditLog.create({
      userId: user._id,
      userEmail: user.email,
      userRole: user.role,
      action: 'tenant.activate',
      category: 'admin',
      severity: 'warning',
      resource: 'tenant',
      resourceId: tenant._id.toString(),
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      status: 'success',
    });

    res.json({
      message: 'Tenant activated successfully',
      tenant,
    });
  } catch (error) {
    console.error('Error activating tenant:', error);
    res.status(500).json({ error: 'Failed to activate tenant' });
  }
};

/**
 * Delete tenant (soft delete)
 */
export const deleteTenant = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { tenantId } = req.params;

    const tenant = await Tenant.findById(tenantId);

    if (!tenant) {
      res.status(404).json({ error: 'Tenant not found' });
      return;
    }

    tenant.status = 'deleted';
    await tenant.save();

    // Revoke all sessions
    await Session.updateMany(
      { tenantId: tenant._id, status: 'active' },
      {
        status: 'revoked',
        revokedAt: new Date(),
        revokedBy: user._id,
        revokedReason: 'Tenant deleted',
      }
    );

    // Soft delete all users
    await User.updateMany(
      { tenantId: tenant._id },
      { status: 'deleted' }
    );

    // Log audit event
    await AuditLog.create({
      userId: user._id,
      userEmail: user.email,
      userRole: user.role,
      action: 'tenant.delete',
      category: 'admin',
      severity: 'critical',
      resource: 'tenant',
      resourceId: tenant._id.toString(),
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      status: 'success',
    });

    res.json({
      message: 'Tenant deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting tenant:', error);
    res.status(500).json({ error: 'Failed to delete tenant' });
  }
};

/**
 * Get all users (super admin)
 */
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, tenantId, role, status, search } = req.query;

    const query: any = {};

    if (tenantId) query.tenantId = tenantId;
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
      .populate('tenantId', 'name slug')
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
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

/**
 * User impersonation (for support)
 */
export const impersonateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const admin = (req as any).user;
    const { userId } = req.params;

    const targetUser = await User.findById(userId);

    if (!targetUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Cannot impersonate other super admins
    if (targetUser.role === 'super_admin') {
      res.status(403).json({ error: 'Cannot impersonate super admins' });
      return;
    }

    // Log audit event
    await AuditLog.create({
      userId: admin._id,
      userEmail: admin.email,
      userRole: admin.role,
      action: 'user.impersonate',
      category: 'admin',
      severity: 'critical',
      resource: 'user',
      resourceId: targetUser._id.toString(),
      metadata: {
        targetEmail: targetUser.email,
        targetRole: targetUser.role,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      status: 'success',
    });

    // Generate impersonation token (implement JWT with special claims)
    const jwt = require('jsonwebtoken');
    const impersonationToken = jwt.sign(
      {
        userId: targetUser._id,
        email: targetUser.email,
        role: targetUser.role,
        tenantId: targetUser.tenantId,
        impersonatedBy: admin._id,
        impersonation: true,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Impersonation started',
      token: impersonationToken,
      user: targetUser,
      expiresIn: '1h',
    });
  } catch (error) {
    console.error('Error impersonating user:', error);
    res.status(500).json({ error: 'Failed to impersonate user' });
  }
};

/**
 * Bulk user operations
 */
export const bulkUserOperation = async (req: Request, res: Response): Promise<void> => {
  try {
    const admin = (req as any).user;
    const { operation, userIds, data } = req.body;

    if (!operation || !Array.isArray(userIds) || userIds.length === 0) {
      res.status(400).json({ error: 'Invalid request' });
      return;
    }

    let result;

    switch (operation) {
      case 'suspend':
        result = await User.updateMany(
          { _id: { $in: userIds } },
          {
            status: 'suspended',
            suspendedAt: new Date(),
            suspendedBy: admin._id,
            suspendedReason: data?.reason || 'Bulk suspension',
          }
        );
        break;

      case 'activate':
        result = await User.updateMany(
          { _id: { $in: userIds } },
          {
            status: 'active',
            $unset: { suspendedAt: '', suspendedBy: '', suspendedReason: '' },
          }
        );
        break;

      case 'delete':
        result = await User.updateMany(
          { _id: { $in: userIds } },
          { status: 'deleted' }
        );
        break;

      case 'updateRole':
        if (!data?.role) {
          res.status(400).json({ error: 'Role required for updateRole operation' });
          return;
        }
        result = await User.updateMany(
          { _id: { $in: userIds } },
          { role: data.role }
        );
        break;

      default:
        res.status(400).json({ error: 'Invalid operation' });
        return;
    }

    // Log audit event
    await AuditLog.create({
      userId: admin._id,
      userEmail: admin.email,
      userRole: admin.role,
      action: `bulk.${operation}`,
      category: 'admin',
      severity: 'warning',
      resource: 'user',
      metadata: {
        userCount: userIds.length,
        userIds,
        operation,
        data,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      status: 'success',
    });

    res.json({
      message: `Bulk ${operation} completed`,
      affected: result.modifiedCount,
    });
  } catch (error) {
    console.error('Error in bulk operation:', error);
    res.status(500).json({ error: 'Failed to perform bulk operation' });
  }
};

/**
 * Export users to CSV
 */
export const exportUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tenantId, role, status } = req.query;

    const query: any = {};
    if (tenantId) query.tenantId = tenantId;
    if (role) query.role = role;
    if (status) query.status = status;

    const users = await User.find(query)
      .populate('tenantId', 'name slug')
      .select('-password -passwordHistory -mfaSecret -mfaBackupCodes')
      .lean();

    // Transform data for CSV
    const csvData = users.map((user: any) => ({
      Email: user.email,
      'First Name': user.firstName,
      'Last Name': user.lastName,
      Role: user.role,
      Status: user.status,
      Tenant: user.tenantId?.name || 'N/A',
      'Email Verified': user.isEmailVerified ? 'Yes' : 'No',
      'MFA Enabled': user.mfaEnabled ? 'Yes' : 'No',
      'Last Login': user.lastLogin ? new Date(user.lastLogin).toISOString() : 'Never',
      'Created At': new Date(user.createdAt).toISOString(),
    }));

    const parser = new Parser();
    const csv = parser.parse(csvData);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users-export.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting users:', error);
    res.status(500).json({ error: 'Failed to export users' });
  }
};

/**
 * Get system health metrics
 */
export const getSystemHealth = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalTenants = await Tenant.countDocuments({ status: { $ne: 'deleted' } });
    const activeTenants = await Tenant.countDocuments({ status: 'active' });
    const suspendedTenants = await Tenant.countDocuments({ status: 'suspended' });
    const trialTenants = await Tenant.countDocuments({ status: 'trial' });

    const totalUsers = await User.countDocuments({ status: { $ne: 'deleted' } });
    const activeUsers = await User.countDocuments({ status: 'active' });

    const activeSessions = await Session.countDocuments({ status: 'active' });

    const recentErrors = await AuditLog.countDocuments({
      severity: { $in: ['error', 'critical'] },
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    const recentLogins = await AuditLog.countDocuments({
      action: { $in: ['auth.login', 'auth.sso.login'] },
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    res.json({
      tenants: {
        total: totalTenants,
        active: activeTenants,
        suspended: suspendedTenants,
        trial: trialTenants,
      },
      users: {
        total: totalUsers,
        active: activeUsers,
      },
      sessions: {
        active: activeSessions,
      },
      activity: {
        recentLogins24h: recentLogins,
        recentErrors24h: recentErrors,
      },
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error fetching system health:', error);
    res.status(500).json({ error: 'Failed to fetch system health' });
  }
};

/**
 * Get audit logs with filtering
 */
export const getAuditLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 50,
      tenantId,
      userId,
      category,
      severity,
      action,
      startDate,
      endDate,
    } = req.query;

    const query: any = {};

    if (tenantId) query.tenantId = tenantId;
    if (userId) query.userId = userId;
    if (category) query.category = category;
    if (severity) query.severity = severity;
    if (action) query.action = action;

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate as string);
      if (endDate) query.timestamp.$lte = new Date(endDate as string);
    }

    const logs = await AuditLog.find(query)
      .populate('userId', 'firstName lastName email')
      .populate('tenantId', 'name slug')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ timestamp: -1 });

    const total = await AuditLog.countDocuments(query);

    res.json({
      logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
};
