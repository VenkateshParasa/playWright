/**
 * NotificationSettings Component
 * Manages user preferences for all notification types
 * Includes email, push, and in-app notification settings
 */

import { useState } from 'react';
import { useSettingsStore } from '../../stores/settingsStore';
import type { NotificationPreferences } from '../../types/store';

export default function NotificationSettings() {
  const { notifications, updateNotifications } = useSettingsStore();
  const [testingPush, setTestingPush] = useState(false);

  const handleToggle = (key: keyof NotificationPreferences) => {
    updateNotifications({ [key]: !notifications[key] });
  };

  const handleTestPushNotification = async () => {
    if (!('Notification' in window)) {
      alert('Push notifications are not supported in this browser');
      return;
    }

    setTestingPush(true);

    try {
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        new Notification('Test Notification', {
          body: 'This is a test notification from Learning Platform',
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
        });
      } else {
        alert('Notification permission denied');
      }
    } catch (error) {
      console.error('Error testing push notification:', error);
      alert('Failed to send test notification');
    } finally {
      setTestingPush(false);
    }
  };

  const notificationGroups = [
    {
      title: 'Learning Notifications',
      description: 'Stay updated on your learning progress',
      items: [
        {
          key: 'srsReviewsDue' as keyof NotificationPreferences,
          label: 'SRS Reviews Due',
          description: 'Notify when flashcards are ready for review',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          ),
        },
        {
          key: 'newLessonAvailable' as keyof NotificationPreferences,
          label: 'New Lessons',
          description: 'Alert when new lessons are available',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          ),
        },
        {
          key: 'quizDeadline' as keyof NotificationPreferences,
          label: 'Quiz Deadlines',
          description: 'Remind about upcoming quiz deadlines',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
        },
      ],
    },
    {
      title: 'Achievement Notifications',
      description: 'Celebrate your progress and milestones',
      items: [
        {
          key: 'achievementUnlocked' as keyof NotificationPreferences,
          label: 'Achievements',
          description: 'Notify when you unlock achievements',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
          ),
        },
        {
          key: 'feedbackReceived' as keyof NotificationPreferences,
          label: 'Feedback',
          description: 'Alert when you receive feedback on submissions',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
          ),
        },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Notification Preferences
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Choose what notifications you want to receive and how you want to receive them.
        </p>
      </div>

      {/* Notification Groups */}
      {notificationGroups.map((group) => (
        <div key={group.title} className="space-y-4">
          <div>
            <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {group.title}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">{group.description}</p>
          </div>

          <div className="space-y-3">
            {group.items.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start space-x-3 flex-1">
                  <div className="text-gray-600 dark:text-gray-400 mt-0.5">{item.icon}</div>
                  <div className="flex-1">
                    <label
                      htmlFor={item.key}
                      className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer"
                    >
                      {item.label}
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {item.description}
                    </p>
                  </div>
                </div>
                <button
                  id={item.key}
                  type="button"
                  role="switch"
                  aria-checked={notifications[item.key]}
                  onClick={() => handleToggle(item.key)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    notifications[item.key] ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      notifications[item.key] ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Delivery Methods */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
        <div>
          <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Delivery Methods
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Choose how you want to receive notifications
          </p>
        </div>

        <div className="space-y-3">
          {/* Email Notifications */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-start space-x-3 flex-1">
              <svg
                className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <div className="flex-1">
                <label
                  htmlFor="emailNotifications"
                  className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer"
                >
                  Email Notifications
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Receive notifications via email
                </p>
              </div>
            </div>
            <button
              id="emailNotifications"
              type="button"
              role="switch"
              aria-checked={notifications.emailNotifications}
              onClick={() => handleToggle('emailNotifications')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                notifications.emailNotifications
                  ? 'bg-blue-600'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  notifications.emailNotifications ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Push Notifications */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-start space-x-3 flex-1">
              <svg
                className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <div className="flex-1">
                <label
                  htmlFor="pushNotifications"
                  className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer"
                >
                  Push Notifications
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Receive browser push notifications
                </p>
              </div>
            </div>
            <button
              id="pushNotifications"
              type="button"
              role="switch"
              aria-checked={notifications.pushNotifications}
              onClick={() => handleToggle('pushNotifications')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                notifications.pushNotifications
                  ? 'bg-blue-600'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  notifications.pushNotifications ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Sound */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-start space-x-3 flex-1">
              <svg
                className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
              </svg>
              <div className="flex-1">
                <label
                  htmlFor="sound"
                  className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer"
                >
                  Sound Effects
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Play sound with notifications
                </p>
              </div>
            </div>
            <button
              id="sound"
              type="button"
              role="switch"
              aria-checked={notifications.sound}
              onClick={() => handleToggle('sound')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                notifications.sound ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  notifications.sound ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Test Push Notification */}
      {notifications.pushNotifications && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <button
            onClick={handleTestPushNotification}
            disabled={testingPush}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
          >
            {testingPush ? 'Sending...' : 'Send Test Notification'}
          </button>
        </div>
      )}
    </div>
  );
}
