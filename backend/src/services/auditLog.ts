import { AuditLog } from '../models/AuditLog.js';
import { Request } from 'express';
import { AuthRequest } from '../middleware/auth.js';

export interface AuditLogData {
  action: string;
  resource: string;
  resourceId?: string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  metadata?: Record<string, any>;
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(
  req: AuthRequest,
  data: AuditLogData
): Promise<void> {
  try {
    if (!req.user) {
      console.error('Cannot create audit log: No user in request');
      return;
    }

    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      req.socket.remoteAddress ||
      'unknown';

    const userAgent = req.headers['user-agent'] || 'unknown';

    await AuditLog.create({
      adminId: req.user.userId,
      adminEmail: req.user.email,
      action: data.action,
      resource: data.resource,
      resourceId: data.resourceId,
      changes: data.changes,
      metadata: data.metadata,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    // Log error but don't throw - audit logging shouldn't break the main flow
    console.error('Failed to create audit log:', error);
  }
}

/**
 * Get audit logs with filters and pagination
 */
export async function getAuditLogs(params: {
  adminId?: string;
  resourceId?: string;
  action?: string;
  resource?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  skip?: number;
}) {
  const {
    adminId,
    resourceId,
    action,
    resource,
    startDate,
    endDate,
    limit = 50,
    skip = 0,
  } = params;

  const query: any = {};

  if (adminId) query.adminId = adminId;
  if (resourceId) query.resourceId = resourceId;
  if (action) query.action = action;
  if (resource) query.resource = resource;
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = startDate;
    if (endDate) query.timestamp.$lte = endDate;
  }

  const [logs, total] = await Promise.all([
    AuditLog.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip)
      .populate('adminId', 'firstName lastName email')
      .lean(),
    AuditLog.countDocuments(query),
  ]);

  return {
    logs,
    total,
    page: Math.floor(skip / limit) + 1,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get recent audit logs for a specific user
 */
export async function getUserAuditLogs(
  userId: string,
  limit: number = 20
): Promise<any[]> {
  return AuditLog.find({ resourceId: userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('adminId', 'firstName lastName email')
    .lean();
}

/**
 * Compare objects and generate change list
 */
export function generateChanges(
  oldObj: Record<string, any>,
  newObj: Record<string, any>,
  fieldsToTrack: string[]
): { field: string; oldValue: any; newValue: any }[] {
  const changes: { field: string; oldValue: any; newValue: any }[] = [];

  for (const field of fieldsToTrack) {
    const oldValue = oldObj[field];
    const newValue = newObj[field];

    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changes.push({
        field,
        oldValue,
        newValue,
      });
    }
  }

  return changes;
}
