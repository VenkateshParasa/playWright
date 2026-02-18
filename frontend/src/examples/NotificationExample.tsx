import React, { useEffect } from 'react';
import { Bell, Send } from 'lucide-react';
import { notificationManager } from '../../lib/notifications';
import { pushNotificationService } from '../../lib/notifications';
import { useNotificationStore } from '../../stores/notificationStore';
import { NotificationType, NotificationPriority } from '../../types/notification.types';

/**
 * Example component demonstrating how to use the notification system
 * This is for demonstration purposes only
 */
const NotificationExample: React.FC = () => {
  const { notifications, unreadCount, preferences } = useNotificationStore();
  const userId = 'demo-user'; // Replace with actual user ID

  // Initialize notification system
  useEffect(() => {
    // Check if push notifications are supported
    if (pushNotificationService.isSupported()) {
      console.log('Push notifications are supported');
    }

    // Request permission if not already granted
    if (notificationManager.getPermissionStatus() === 'default') {
      notificationManager.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }
  }, []);

  // Example: Send different types of notifications
  const sendExampleNotifications = () => {
    // SRS Review notification
    notificationManager.notifyReviewsDue(10, userId);

    // New lesson notification
    notificationManager.notifyNewLesson('Advanced Playwright Patterns', userId);

    // Quiz deadline notification
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    notificationManager.notifyQuizDeadline('Week 2 Quiz', tomorrow, userId);

    // Achievement notification
    notificationManager.notifyAchievement('Fast Learner', userId);

    // Feedback notification
    notificationManager.notifyFeedback('Exercise: Locators Practice', userId);

    // Streak milestone notification
    notificationManager.notifyStreakMilestone(7, userId);
  };

  // Example: Send custom notification
  const sendCustomNotification = () => {
    const notification = notificationManager.create({
      userId,
      type: NotificationType.SYSTEM,
      title: 'Custom Notification',
      message: 'This is a custom notification with multiple actions',
      priority: NotificationPriority.HIGH,
      actions: [
        {
          label: 'View Details',
          url: '/details',
          primary: true,
        },
        {
          label: 'Dismiss',
          url: '#',
        },
      ],
      metadata: {
        customField: 'custom value',
      },
    });

    notificationManager.send(notification);
  };

  // Example: Subscribe to push notifications
  const handleSubscribePush = async () => {
    try {
      // Set VAPID public key (replace with your actual key)
      pushNotificationService.setVapidPublicKey('YOUR_VAPID_PUBLIC_KEY');

      // Subscribe
      const subscription = await pushNotificationService.subscribe();
      console.log('Subscribed to push notifications:', subscription);
    } catch (error) {
      console.error('Failed to subscribe:', error);
    }
  };

  // Example: Send test push notification
  const handleTestPush = async () => {
    try {
      await pushNotificationService.sendTestNotification();
    } catch (error) {
      console.error('Failed to send test notification:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Notification System Examples
        </h1>

        {/* Current State */}
        <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
            Current State
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Notifications</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {notifications.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Unread</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {unreadCount}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Notifications Enabled</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {preferences.enabled ? 'Yes' : 'No'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Sound Enabled</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {preferences.soundEnabled ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
        </div>

        {/* Example Actions */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Send Example Notifications
            </h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={sendExampleNotifications}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Bell size={20} />
                <span>Send All Examples</span>
              </button>

              <button
                onClick={sendCustomNotification}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Send size={20} />
                <span>Send Custom</span>
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Push Notifications
            </h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSubscribePush}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Subscribe to Push
              </button>

              <button
                onClick={handleTestPush}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Send Test Push
              </button>
            </div>
          </div>
        </div>

        {/* Code Examples */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Code Examples
          </h2>

          <div className="space-y-4">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Send SRS Review Notification
              </h3>
              <pre className="text-sm text-gray-700 dark:text-gray-300 overflow-x-auto">
                {`notificationManager.notifyReviewsDue(10, userId);`}
              </pre>
            </div>

            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Send Custom Notification
              </h3>
              <pre className="text-sm text-gray-700 dark:text-gray-300 overflow-x-auto">
                {`const notification = notificationManager.create({
  userId: 'user-id',
  type: NotificationType.SYSTEM,
  title: 'Custom Title',
  message: 'Custom message',
  priority: NotificationPriority.HIGH,
  actions: [
    { label: 'Action', url: '/path', primary: true }
  ]
});

notificationManager.send(notification);`}
              </pre>
            </div>

            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Access Notification Store
              </h3>
              <pre className="text-sm text-gray-700 dark:text-gray-300 overflow-x-auto">
                {`const {
  notifications,
  unreadCount,
  markAsRead,
  deleteNotification
} = useNotificationStore();`}
              </pre>
            </div>

            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Subscribe to Push Notifications
              </h3>
              <pre className="text-sm text-gray-700 dark:text-gray-300 overflow-x-auto">
                {`// Set VAPID public key
pushNotificationService.setVapidPublicKey(key);

// Subscribe
const subscription = await pushNotificationService.subscribe();

// Send test notification
await pushNotificationService.sendTestNotification();`}
              </pre>
            </div>
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Recent Notifications
          </h2>
          {notifications.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">
              No notifications yet. Click "Send All Examples" to see some notifications.
            </p>
          ) : (
            <div className="space-y-2">
              {notifications.slice(0, 5).map(notification => (
                <div
                  key={notification.id}
                  className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Type: {notification.type} | Priority: {notification.priority}
                      </p>
                    </div>
                    {!notification.read && (
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                        New
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationExample;
