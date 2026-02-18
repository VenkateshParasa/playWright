import { Router } from 'express';
import * as notificationController from '../controllers/notificationController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get notifications for current user
router.get('/', notificationController.getNotifications);

// Get notification by ID
router.get('/:id', notificationController.getNotificationById);

// Get notification statistics
router.get('/stats', notificationController.getNotificationStats);

// Create notification (admin only or system)
router.post('/', notificationController.createNotification);

// Update notification (mark as read, archive, etc.)
router.patch('/:id', notificationController.updateNotification);

// Batch update notifications
router.patch('/batch/update', notificationController.batchUpdateNotifications);

// Delete notification
router.delete('/:id', notificationController.deleteNotification);

// Batch delete notifications
router.delete('/batch/delete', notificationController.batchDeleteNotifications);

// Clear all notifications
router.delete('/clear/all', notificationController.clearAllNotifications);

// Notification preferences
router.get('/preferences/current', notificationController.getPreferences);
router.put('/preferences/current', notificationController.updatePreferences);

// Push notification subscription
router.post('/subscribe', notificationController.subscribeToPush);
router.post('/unsubscribe', notificationController.unsubscribeFromPush);

// Send test notification
router.post('/test', notificationController.sendTestNotification);

export default router;
