import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { UserProgress } from '../models/UserProgress.js';
import { createAuditLog, generateChanges } from '../services/auditLog.js';
import crypto from 'crypto';
import { hashPassword } from '../utils/password.js';

/**
 * Get all users with pagination, filters, and search
 */
export async function getAllUsers(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      role,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      startDate,
      endDate,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query: any = {};

    // Search by name or email
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by role
    if (role && role !== 'all') {
      query.role = role;
    }

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Filter by registration date
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate as string);
      if (endDate) query.createdAt.$lte = new Date(endDate as string);
    }

    // Build sort
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password -emailVerificationToken -passwordResetToken')
        .sort(sort)
        .limit(limitNum)
        .skip(skip)
        .lean(),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message,
    });
  }
}

/**
 * Get user by ID with full details
 */
export async function getUserById(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .select('-password -emailVerificationToken -passwordResetToken')
      .lean();

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Get user progress
    const progress = await UserProgress.findOne({ userId: id }).lean();

    res.status(200).json({
      success: true,
      data: {
        user,
        progress,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message,
    });
  }
}

/**
 * Update user details
 */
export async function updateUser(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Fields that can be updated
    const allowedFields = [
      'firstName',
      'lastName',
      'email',
      'role',
      'avatar',
      'isEmailVerified',
    ];

    // Get old user data for audit log
    const oldUser = await User.findById(id).lean();
    if (!oldUser) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Filter updates to only allowed fields
    const filteredUpdates: any = {};
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    }

    // Update user
    const user = await User.findByIdAndUpdate(id, filteredUpdates, {
      new: true,
      runValidators: true,
    })
      .select('-password -emailVerificationToken -passwordResetToken')
      .lean();

    // Create audit log
    const changes = generateChanges(oldUser, filteredUpdates, allowedFields);
    await createAuditLog(req, {
      action: 'user.update',
      resource: 'user',
      resourceId: id,
      changes,
    });

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message,
    });
  }
}

/**
 * Delete user
 */
export async function deleteUser(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const { hardDelete = false } = req.query;

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    if (hardDelete === 'true') {
      // Permanently delete user and all related data
      await Promise.all([
        User.findByIdAndDelete(id),
        UserProgress.findOneAndDelete({ userId: id }),
        // Add other related data deletions here (flashcards, quiz attempts, etc.)
      ]);

      await createAuditLog(req, {
        action: 'user.delete',
        resource: 'user',
        resourceId: id,
        metadata: { hardDelete: true, email: user.email },
      });
    } else {
      // Soft delete - mark as deleted
      await User.findByIdAndUpdate(id, {
        status: 'deleted',
      });

      await createAuditLog(req, {
        action: 'user.delete',
        resource: 'user',
        resourceId: id,
        metadata: { hardDelete: false, email: user.email },
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message,
    });
  }
}

/**
 * Suspend user account
 */
export async function suspendUser(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      {
        status: 'suspended',
        suspendedAt: new Date(),
        suspendedBy: req.user?.userId,
        suspendedReason: reason,
      },
      { new: true }
    )
      .select('-password')
      .lean();

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    await createAuditLog(req, {
      action: 'user.suspend',
      resource: 'user',
      resourceId: id,
      metadata: { reason },
    });

    res.status(200).json({
      success: true,
      message: 'User suspended successfully',
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to suspend user',
      error: error.message,
    });
  }
}

/**
 * Activate user account
 */
export async function activateUser(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      {
        status: 'active',
        $unset: { suspendedAt: 1, suspendedBy: 1, suspendedReason: 1 },
      },
      { new: true }
    )
      .select('-password')
      .lean();

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    await createAuditLog(req, {
      action: 'user.activate',
      resource: 'user',
      resourceId: id,
    });

    res.status(200).json({
      success: true,
      message: 'User activated successfully',
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to activate user',
      error: error.message,
    });
  }
}

/**
 * Reset user password (admin action)
 */
export async function resetUserPassword(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const { sendEmail = true } = req.body;

    // Generate temporary password
    const tempPassword = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await hashPassword(tempPassword);

    await User.findByIdAndUpdate(id, {
      password: hashedPassword,
    });

    await createAuditLog(req, {
      action: 'user.resetPassword',
      resource: 'user',
      resourceId: id,
      metadata: { sendEmail },
    });

    // TODO: Send email with temporary password if sendEmail is true

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
      data: {
        tempPassword: sendEmail ? undefined : tempPassword,
        emailSent: sendEmail,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: error.message,
    });
  }
}

/**
 * Get user statistics
 */
export async function getUserStats(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const weekStart = new Date(now.setDate(now.getDate() - 7));
    const monthStart = new Date(now.setDate(now.getDate() - 30));

    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      deletedUsers,
      newUsersThisWeek,
      newUsersThisMonth,
      activeToday,
      activeThisWeek,
      activeThisMonth,
      roleDistribution,
    ] = await Promise.all([
      User.countDocuments({ status: { $ne: 'deleted' } }),
      User.countDocuments({ status: 'active' }),
      User.countDocuments({ status: 'suspended' }),
      User.countDocuments({ status: 'deleted' }),
      User.countDocuments({ createdAt: { $gte: weekStart } }),
      User.countDocuments({ createdAt: { $gte: monthStart } }),
      User.countDocuments({ lastLogin: { $gte: todayStart } }),
      User.countDocuments({ lastLogin: { $gte: weekStart } }),
      User.countDocuments({ lastLogin: { $gte: monthStart } }),
      User.aggregate([
        { $match: { status: { $ne: 'deleted' } } },
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalUsers,
        active: activeUsers,
        suspended: suspendedUsers,
        deleted: deletedUsers,
        newRegistrations: {
          thisWeek: newUsersThisWeek,
          thisMonth: newUsersThisMonth,
        },
        activeUsers: {
          today: activeToday,
          thisWeek: activeThisWeek,
          thisMonth: activeThisMonth,
        },
        roleDistribution: roleDistribution.reduce((acc: any, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics',
      error: error.message,
    });
  }
}

/**
 * Bulk operations on users
 */
export async function bulkUserOperations(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const { operation, userIds, data } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      res.status(400).json({
        success: false,
        message: 'User IDs are required',
      });
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
            suspendedBy: req.user?.userId,
            suspendedReason: data?.reason || 'Bulk suspension',
          }
        );

        await createAuditLog(req, {
          action: 'bulk.suspend',
          resource: 'bulk',
          metadata: { userIds, count: userIds.length, reason: data?.reason },
        });
        break;

      case 'activate':
        result = await User.updateMany(
          { _id: { $in: userIds } },
          {
            status: 'active',
            $unset: { suspendedAt: 1, suspendedBy: 1, suspendedReason: 1 },
          }
        );

        await createAuditLog(req, {
          action: 'bulk.activate',
          resource: 'bulk',
          metadata: { userIds, count: userIds.length },
        });
        break;

      case 'delete':
        result = await User.updateMany(
          { _id: { $in: userIds } },
          { status: 'deleted' }
        );

        await createAuditLog(req, {
          action: 'bulk.delete',
          resource: 'bulk',
          metadata: { userIds, count: userIds.length },
        });
        break;

      case 'export':
        const users = await User.find({ _id: { $in: userIds } })
          .select('-password -emailVerificationToken -passwordResetToken')
          .lean();

        await createAuditLog(req, {
          action: 'bulk.export',
          resource: 'bulk',
          metadata: { userIds, count: userIds.length },
        });

        res.status(200).json({
          success: true,
          message: 'Users exported successfully',
          data: users,
        });
        return;

      default:
        res.status(400).json({
          success: false,
          message: 'Invalid operation',
        });
        return;
    }

    res.status(200).json({
      success: true,
      message: `Bulk ${operation} completed successfully`,
      data: {
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Bulk operation failed',
      error: error.message,
    });
  }
}

/**
 * Get user activity timeline
 */
export async function getUserActivity(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const { limit = 50 } = req.query;

    // Get user progress with activity details
    const progress = await UserProgress.findOne({ userId: id }).lean();

    if (!progress) {
      res.status(404).json({
        success: false,
        message: 'User progress not found',
      });
      return;
    }

    // Build activity timeline from various sources
    const activities: any[] = [];

    // Lesson completions
    if (progress.lessonsCompleted) {
      for (const lessonId of progress.lessonsCompleted.slice(0, Number(limit))) {
        activities.push({
          type: 'lesson_completed',
          resourceId: lessonId,
          timestamp: new Date(), // You'd want to store actual completion timestamps
        });
      }
    }

    // Sort by timestamp descending
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    res.status(200).json({
      success: true,
      data: activities.slice(0, Number(limit)),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user activity',
      error: error.message,
    });
  }
}
