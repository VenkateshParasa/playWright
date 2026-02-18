import { Request, Response } from 'express';
import * as notificationService from '../services/notificationService';

// Get notifications for current user
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      type,
      priority,
      read,
      archived,
      limit = 50,
      offset = 0
    } = req.query;

    const filter: any = { userId };

    if (type) filter.type = type;
    if (priority) filter.priority = priority;
    if (read !== undefined) filter.read = read === 'true';
    if (archived !== undefined) filter.archived = archived === 'true';

    const result = await notificationService.getNotifications(
      filter,
      parseInt(limit as string),
      parseInt(offset as string)
    );

    res.json(result);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// Get notification by ID
export const getNotificationById = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const notification = await notificationService.getNotificationById(id, userId);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    console.error('Error fetching notification:', error);
    res.status(500).json({ error: 'Failed to fetch notification' });
  }
};

// Get notification statistics
export const getNotificationStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const stats = await notificationService.getNotificationStats(userId);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({ error: 'Failed to fetch notification stats' });
  }
};

// Create notification
export const createNotification = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user is admin (implement role check)
    // if (!req.user?.isAdmin) {
    //   return res.status(403).json({ error: 'Forbidden' });
    // }

    const notification = await notificationService.createNotification(req.body);
    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
};

// Update notification
export const updateNotification = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const notification = await notificationService.updateNotification(
      id,
      userId,
      req.body
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
};

// Batch update notifications
export const batchUpdateNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { notificationIds, updates } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({ error: 'Invalid notification IDs' });
    }

    const result = await notificationService.batchUpdateNotifications(
      notificationIds,
      userId,
      updates
    );

    res.json(result);
  } catch (error) {
    console.error('Error batch updating notifications:', error);
    res.status(500).json({ error: 'Failed to batch update notifications' });
  }
};

// Delete notification
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const success = await notificationService.deleteNotification(id, userId);

    if (!success) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

// Batch delete notifications
export const batchDeleteNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { notificationIds } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({ error: 'Invalid notification IDs' });
    }

    const result = await notificationService.batchDeleteNotifications(
      notificationIds,
      userId
    );

    res.json(result);
  } catch (error) {
    console.error('Error batch deleting notifications:', error);
    res.status(500).json({ error: 'Failed to batch delete notifications' });
  }
};

// Clear all notifications
export const clearAllNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await notificationService.clearAllNotifications(userId);
    res.json(result);
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({ error: 'Failed to clear notifications' });
  }
};

// Get notification preferences
export const getPreferences = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const preferences = await notificationService.getPreferences(userId);
    res.json(preferences);
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
};

// Update notification preferences
export const updatePreferences = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const preferences = await notificationService.updatePreferences(
      userId,
      req.body
    );

    res.json(preferences);
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
};

// Subscribe to push notifications
export const subscribeToPush = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const subscription = await notificationService.subscribeToPush(
      userId,
      req.body
    );

    res.json(subscription);
  } catch (error) {
    console.error('Error subscribing to push:', error);
    res.status(500).json({ error: 'Failed to subscribe to push notifications' });
  }
};

// Unsubscribe from push notifications
export const unsubscribeFromPush = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await notificationService.unsubscribeFromPush(
      userId,
      req.body
    );

    res.json(result);
  } catch (error) {
    console.error('Error unsubscribing from push:', error);
    res.status(500).json({ error: 'Failed to unsubscribe from push notifications' });
  }
};

// Send test notification
export const sendTestNotification = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await notificationService.sendTestNotification(userId);
    res.json({ success: true, message: 'Test notification sent' });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ error: 'Failed to send test notification' });
  }
};
