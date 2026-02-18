/**
 * Community Notification Service
 * Handles creating and sending community-related notifications to users
 */

import Notification from '../models/Notification.js';
import mongoose from 'mongoose';

export interface NotificationData {
  recipient: mongoose.Types.ObjectId | string;
  sender?: mongoose.Types.ObjectId | string;
  type: 'reply' | 'mention' | 'group_invite' | 'buddy_request' | 'group_message' | 'achievement' | 'leaderboard' | 'best_answer' | 'upvote' | 'follow';
  title: string;
  message: string;
  link?: string;
  reference?: {
    model: string;
    id: mongoose.Types.ObjectId;
  };
}

/**
 * Send notification to user
 */
export async function sendNotification(data: NotificationData): Promise<void> {
  try {
    await Notification.create({
      recipient: data.recipient,
      sender: data.sender,
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link,
      reference: data.reference,
      isRead: false,
    });

    // In a real application, you would also:
    // 1. Send push notification via service worker
    // 2. Send email notification (if user has email notifications enabled)
    // 3. Emit socket.io event for real-time notification
  } catch (error) {
    console.error('Error sending notification:', error);
    // Don't throw error to avoid breaking the main flow
  }
}

/**
 * Send bulk notifications
 */
export async function sendBulkNotifications(
  notifications: NotificationData[]
): Promise<void> {
  try {
    const notificationDocs = notifications.map(data => ({
      recipient: data.recipient,
      sender: data.sender,
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link,
      reference: data.reference,
      isRead: false,
    }));

    await Notification.insertMany(notificationDocs);
  } catch (error) {
    console.error('Error sending bulk notifications:', error);
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(
  notificationId: string
): Promise<void> {
  try {
    const notification = await Notification.findById(notificationId);
    if (notification) {
      await notification.markAsRead();
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
}

/**
 * Mark all notifications as read for user
 */
export async function markAllNotificationsAsRead(
  userId: string
): Promise<void> {
  try {
    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
  }
}

/**
 * Get unread notification count for user
 */
export async function getUnreadNotificationCount(
  userId: string
): Promise<number> {
  try {
    return await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
}

/**
 * Get recent notifications for user
 */
export async function getRecentNotifications(
  userId: string,
  limit: number = 20
): Promise<any[]> {
  try {
    return await Notification.find({ recipient: userId })
      .populate('sender', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  } catch (error) {
    console.error('Error getting recent notifications:', error);
    return [];
  }
}

/**
 * Delete old notifications (cleanup)
 */
export async function deleteOldNotifications(daysOld: number = 90): Promise<void> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    await Notification.deleteMany({
      createdAt: { $lt: cutoffDate },
      isRead: true,
    });
  } catch (error) {
    console.error('Error deleting old notifications:', error);
  }
}

/**
 * Generate weekly digest data for user
 */
export async function generateWeeklyDigest(userId: string): Promise<any> {
  try {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const notifications = await Notification.find({
      recipient: userId,
      createdAt: { $gte: weekAgo },
    })
      .populate('sender', 'firstName lastName')
      .sort({ createdAt: -1 });

    // Group notifications by type
    const grouped = notifications.reduce((acc: any, notification) => {
      if (!acc[notification.type]) {
        acc[notification.type] = [];
      }
      acc[notification.type].push(notification);
      return acc;
    }, {});

    return {
      period: {
        start: weekAgo,
        end: new Date(),
      },
      totalNotifications: notifications.length,
      byType: grouped,
      highlights: notifications.slice(0, 10), // Top 10 notifications
    };
  } catch (error) {
    console.error('Error generating weekly digest:', error);
    return null;
  }
}

/**
 * Send achievement notification
 */
export async function sendAchievementNotification(
  userId: string,
  achievementName: string,
  achievementDescription: string
): Promise<void> {
  await sendNotification({
    recipient: userId,
    type: 'achievement',
    title: 'Achievement Unlocked!',
    message: `You earned the "${achievementName}" achievement! ${achievementDescription}`,
    link: '/achievements',
  });
}

/**
 * Send leaderboard position notification
 */
export async function sendLeaderboardNotification(
  userId: string,
  position: number,
  category: string
): Promise<void> {
  let message = '';

  if (position === 1) {
    message = `Congratulations! You're #1 in ${category}!`;
  } else if (position <= 10) {
    message = `You're now #${position} in ${category}!`;
  } else if (position <= 100) {
    message = `You've reached #${position} in ${category}!`;
  }

  if (message) {
    await sendNotification({
      recipient: userId,
      type: 'leaderboard',
      title: 'Leaderboard Update',
      message,
      link: '/community/leaderboard',
    });
  }
}

/**
 * Batch notification preferences check
 * In a real application, this would check user's notification preferences
 */
export async function shouldSendNotification(
  userId: string,
  notificationType: string
): Promise<boolean> {
  // Placeholder - in real app, check user's notification settings
  return true;
}
