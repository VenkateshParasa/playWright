import React, { useState, useEffect } from 'react';
import {
  Bell,
  Volume2,
  Monitor,
  Mail,
  Moon,
  Clock,
  Save,
  X,
  Check,
  AlertCircle,
  TestTube,
} from 'lucide-react';
import { useNotificationStore } from '../../stores/notificationStore';
import { pushNotificationService } from '../../lib/notifications/pushNotifications';
import { notificationManager } from '../../lib/notifications/notificationManager';
import type { NotificationType, NotificationPreferences } from '../../types/notification.types';

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ isOpen, onClose }) => {
  const { preferences, updatePreferences } = useNotificationStore();
  const [localPrefs, setLocalPrefs] = useState(preferences);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');

  useEffect(() => {
    setLocalPrefs(preferences);
  }, [preferences]);

  useEffect(() => {
    if (isOpen) {
      checkPushStatus();
    }
  }, [isOpen]);

  const checkPushStatus = async () => {
    setPushSupported(pushNotificationService.isSupported());
    setPermissionStatus(pushNotificationService.getPermissionStatus());
    setPushSubscribed(await pushNotificationService.isSubscribed());
  };

  const notificationTypes: { type: NotificationType; label: string; description: string }[] = [
    {
      type: 'srs_reviews_due',
      label: 'SRS Reviews Due',
      description: 'Notify when flashcards are ready for review',
    },
    {
      type: 'new_lesson',
      label: 'New Lesson Available',
      description: 'Notify when new lessons are unlocked',
    },
    {
      type: 'quiz_deadline',
      label: 'Quiz Deadlines',
      description: 'Remind about upcoming quiz deadlines',
    },
    {
      type: 'achievement_unlocked',
      label: 'Achievements',
      description: 'Celebrate when you unlock achievements',
    },
    {
      type: 'feedback_received',
      label: 'Feedback Received',
      description: 'Notify when you receive feedback on submissions',
    },
    {
      type: 'streak_milestone',
      label: 'Streak Milestones',
      description: 'Celebrate your learning streaks',
    },
    {
      type: 'lesson_completed',
      label: 'Lesson Completed',
      description: 'Confirm when you complete a lesson',
    },
    {
      type: 'system',
      label: 'System Notifications',
      description: 'Important system messages and updates',
    },
  ];

  const handleToggleGlobal = (key: keyof NotificationPreferences) => {
    setLocalPrefs({
      ...localPrefs,
      [key]: !localPrefs[key],
    });
  };

  const handleToggleType = (type: NotificationType, channel: 'enabled' | 'sound' | 'desktop' | 'email') => {
    setLocalPrefs({
      ...localPrefs,
      preferences: {
        ...localPrefs.preferences,
        [type]: {
          ...localPrefs.preferences[type],
          [channel]: !localPrefs.preferences[type][channel],
        },
      },
    });
  };

  const handleQuietHoursChange = (field: 'enabled' | 'startTime' | 'endTime', value: any) => {
    setLocalPrefs({
      ...localPrefs,
      quietHours: {
        ...localPrefs.quietHours!,
        [field]: value,
      },
    });
  };

  const handleDailyDigestChange = (field: 'enabled' | 'time', value: any) => {
    setLocalPrefs({
      ...localPrefs,
      dailyDigest: {
        ...localPrefs.dailyDigest!,
        [field]: value,
      },
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updatePreferences(localPrefs);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRequestPermission = async () => {
    try {
      const permission = await notificationManager.requestPermission();
      setPermissionStatus(permission);
      if (permission === 'granted') {
        await handleEnablePush();
      }
    } catch (error) {
      console.error('Failed to request permission:', error);
    }
  };

  const handleEnablePush = async () => {
    try {
      await pushNotificationService.subscribe();
      setPushSubscribed(true);
    } catch (error) {
      console.error('Failed to enable push notifications:', error);
    }
  };

  const handleDisablePush = async () => {
    try {
      await pushNotificationService.unsubscribe();
      setPushSubscribed(false);
    } catch (error) {
      console.error('Failed to disable push notifications:', error);
    }
  };

  const handleTestNotification = async () => {
    try {
      await pushNotificationService.sendTestNotification();
    } catch (error) {
      console.error('Failed to send test notification:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white dark:bg-gray-900 shadow-xl overflow-y-auto">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="flex items-center space-x-3">
              <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Notification Settings
              </h2>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 space-y-8">
            {/* Global Settings */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Global Settings
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Enable Notifications
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Master switch for all notifications
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localPrefs.enabled}
                      onChange={() => handleToggleGlobal('enabled')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Volume2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Notification Sounds
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Play sounds for notifications
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localPrefs.soundEnabled}
                      onChange={() => handleToggleGlobal('soundEnabled')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Monitor className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Desktop Notifications
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Show browser notifications
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localPrefs.desktopEnabled}
                      onChange={() => handleToggleGlobal('desktopEnabled')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Email Notifications
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Receive notifications via email
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localPrefs.emailEnabled}
                      onChange={() => handleToggleGlobal('emailEnabled')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </section>

            {/* Push Notifications */}
            {pushSupported && (
              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Push Notifications
                </h3>

                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Browser Push Notifications
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Status: {permissionStatus === 'granted' ? 'Enabled' : permissionStatus === 'denied' ? 'Denied' : 'Not enabled'}
                      </p>
                    </div>

                    {permissionStatus === 'granted' ? (
                      pushSubscribed ? (
                        <button
                          onClick={handleDisablePush}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Disable
                        </button>
                      ) : (
                        <button
                          onClick={handleEnablePush}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Enable
                        </button>
                      )
                    ) : (
                      <button
                        onClick={handleRequestPermission}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Request Permission
                      </button>
                    )}
                  </div>

                  {pushSubscribed && (
                    <button
                      onClick={handleTestNotification}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      <TestTube size={16} />
                      <span>Send Test Notification</span>
                    </button>
                  )}
                </div>
              </section>
            )}

            {/* Notification Types */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Notification Types
              </h3>

              <div className="space-y-4">
                {notificationTypes.map(({ type, label, description }) => (
                  <div key={type} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{label}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localPrefs.preferences[type].enabled}
                          onChange={() => handleToggleType(type, 'enabled')}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {localPrefs.preferences[type].enabled && (
                      <div className="flex items-center space-x-4 pl-4 border-l-2 border-gray-300 dark:border-gray-600">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={localPrefs.preferences[type].sound}
                            onChange={() => handleToggleType(type, 'sound')}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Sound</span>
                        </label>

                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={localPrefs.preferences[type].desktop}
                            onChange={() => handleToggleType(type, 'desktop')}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Desktop</span>
                        </label>

                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={localPrefs.preferences[type].email}
                            onChange={() => handleToggleType(type, 'email')}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Email</span>
                        </label>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Quiet Hours */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quiet Hours
              </h3>

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Enable Quiet Hours</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Pause notifications during specified times
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localPrefs.quietHours?.enabled}
                      onChange={(e) => handleQuietHoursChange('enabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {localPrefs.quietHours?.enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={localPrefs.quietHours.startTime}
                        onChange={(e) => handleQuietHoursChange('startTime', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={localPrefs.quietHours.endTime}
                        onChange={(e) => handleQuietHoursChange('endTime', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Daily Digest */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Daily Digest
              </h3>

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Enable Daily Digest</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Receive a daily summary of notifications
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localPrefs.dailyDigest?.enabled}
                      onChange={(e) => handleDailyDigestChange('enabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {localPrefs.dailyDigest?.enabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Delivery Time
                    </label>
                    <input
                      type="time"
                      value={localPrefs.dailyDigest.time}
                      onChange={(e) => handleDailyDigestChange('time', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="flex items-center justify-between">
              {saveSuccess && (
                <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                  <Check size={20} />
                  <span className="text-sm font-medium">Settings saved successfully!</span>
                </div>
              )}

              <div className="flex items-center space-x-3 ml-auto">
                <button
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Missing import
import { RefreshCw } from 'lucide-react';

export default NotificationSettings;
