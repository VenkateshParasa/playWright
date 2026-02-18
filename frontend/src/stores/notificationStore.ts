import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Notification,
  NotificationPreferences,
  NotificationFilter,
  NotificationStats,
  NotificationType,
  NotificationPriority,
  UpdateNotificationRequest,
} from '../types/notification.types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences;
  isLoading: boolean;
  error: string | null;
  lastFetch: Date | null;
}

interface NotificationActions {
  // Fetch notifications
  fetchNotifications: (filter?: NotificationFilter) => Promise<void>;

  // Add notification
  addNotification: (notification: Notification) => void;

  // Update notification
  updateNotification: (id: string, updates: UpdateNotificationRequest) => Promise<void>;

  // Mark as read/unread
  markAsRead: (id: string) => Promise<void>;
  markAsUnread: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;

  // Archive
  archiveNotification: (id: string) => Promise<void>;
  unarchiveNotification: (id: string) => Promise<void>;

  // Delete
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;

  // Batch operations
  batchMarkAsRead: (ids: string[]) => Promise<void>;
  batchArchive: (ids: string[]) => Promise<void>;
  batchDelete: (ids: string[]) => Promise<void>;

  // Preferences
  updatePreferences: (preferences: Partial<NotificationPreferences>) => Promise<void>;
  toggleNotificationType: (type: NotificationType, enabled: boolean) => void;

  // Statistics
  getStats: () => NotificationStats;

  // Filters
  filterNotifications: (filter: NotificationFilter) => Notification[];

  // Clear error
  clearError: () => void;

  // Real-time updates
  handleRealtimeUpdate: (notification: Notification) => void;
}

type NotificationStore = NotificationState & NotificationActions;

// Default preferences
const defaultPreferences: NotificationPreferences = {
  enabled: true,
  soundEnabled: true,
  desktopEnabled: true,
  emailEnabled: false,
  preferences: {
    srs_reviews_due: { enabled: true, sound: true, desktop: true, email: false },
    new_lesson: { enabled: true, sound: true, desktop: true, email: false },
    quiz_deadline: { enabled: true, sound: true, desktop: true, email: true },
    achievement_unlocked: { enabled: true, sound: true, desktop: true, email: false },
    feedback_received: { enabled: true, sound: true, desktop: true, email: true },
    streak_milestone: { enabled: true, sound: true, desktop: true, email: false },
    lesson_completed: { enabled: true, sound: false, desktop: false, email: false },
    system: { enabled: true, sound: false, desktop: true, email: false },
  },
  quietHours: {
    enabled: false,
    startTime: '22:00',
    endTime: '08:00',
  },
  dailyDigest: {
    enabled: false,
    time: '09:00',
  },
};

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      // State
      notifications: [],
      unreadCount: 0,
      preferences: defaultPreferences,
      isLoading: false,
      error: null,
      lastFetch: null,

      // Fetch notifications
      fetchNotifications: async (filter?: NotificationFilter) => {
        set({ isLoading: true, error: null });
        try {
          // API call would go here
          // const response = await notificationApi.getNotifications(filter);
          // For now, simulate with mock data
          const mockNotifications: Notification[] = [];

          set({
            notifications: mockNotifications,
            unreadCount: mockNotifications.filter(n => !n.read).length,
            isLoading: false,
            lastFetch: new Date(),
          });
        } catch (error: any) {
          set({
            error: error.message || 'Failed to fetch notifications',
            isLoading: false,
          });
        }
      },

      // Add notification
      addNotification: (notification: Notification) => {
        const { notifications, preferences } = get();

        // Check if notification type is enabled
        const typePrefs = preferences.preferences[notification.type];
        if (!typePrefs?.enabled) return;

        // Check quiet hours
        if (preferences.quietHours?.enabled) {
          const now = new Date();
          const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
          const { startTime, endTime } = preferences.quietHours;

          if (currentTime >= startTime || currentTime <= endTime) {
            // Queue for later delivery
            return;
          }
        }

        set({
          notifications: [notification, ...notifications],
          unreadCount: get().unreadCount + 1,
        });
      },

      // Update notification
      updateNotification: async (id: string, updates: UpdateNotificationRequest) => {
        const { notifications } = get();

        try {
          // API call would go here
          // await notificationApi.updateNotification(id, updates);

          const updatedNotifications = notifications.map(n =>
            n.id === id
              ? {
                  ...n,
                  ...updates,
                  readAt: updates.read && !n.read ? new Date() : n.readAt,
                }
              : n
          );

          set({
            notifications: updatedNotifications,
            unreadCount: updatedNotifications.filter(n => !n.read && !n.archived).length,
          });
        } catch (error: any) {
          set({ error: error.message || 'Failed to update notification' });
        }
      },

      // Mark as read/unread
      markAsRead: async (id: string) => {
        await get().updateNotification(id, { read: true });
      },

      markAsUnread: async (id: string) => {
        await get().updateNotification(id, { read: false });
      },

      markAllAsRead: async () => {
        const { notifications } = get();
        const unreadIds = notifications.filter(n => !n.read).map(n => n.id);

        try {
          // API call would go here
          // await notificationApi.batchUpdate(unreadIds, { read: true });

          const updatedNotifications = notifications.map(n => ({
            ...n,
            read: true,
            readAt: !n.read ? new Date() : n.readAt,
          }));

          set({
            notifications: updatedNotifications,
            unreadCount: 0,
          });
        } catch (error: any) {
          set({ error: error.message || 'Failed to mark all as read' });
        }
      },

      // Archive
      archiveNotification: async (id: string) => {
        await get().updateNotification(id, { archived: true, read: true });
      },

      unarchiveNotification: async (id: string) => {
        await get().updateNotification(id, { archived: false });
      },

      // Delete
      deleteNotification: async (id: string) => {
        const { notifications } = get();

        try {
          // API call would go here
          // await notificationApi.deleteNotification(id);

          const updatedNotifications = notifications.filter(n => n.id !== id);

          set({
            notifications: updatedNotifications,
            unreadCount: updatedNotifications.filter(n => !n.read && !n.archived).length,
          });
        } catch (error: any) {
          set({ error: error.message || 'Failed to delete notification' });
        }
      },

      clearAll: async () => {
        try {
          // API call would go here
          // await notificationApi.clearAll();

          set({
            notifications: [],
            unreadCount: 0,
          });
        } catch (error: any) {
          set({ error: error.message || 'Failed to clear notifications' });
        }
      },

      // Batch operations
      batchMarkAsRead: async (ids: string[]) => {
        const { notifications } = get();

        try {
          // API call would go here
          // await notificationApi.batchUpdate(ids, { read: true });

          const updatedNotifications = notifications.map(n =>
            ids.includes(n.id)
              ? { ...n, read: true, readAt: !n.read ? new Date() : n.readAt }
              : n
          );

          set({
            notifications: updatedNotifications,
            unreadCount: updatedNotifications.filter(n => !n.read && !n.archived).length,
          });
        } catch (error: any) {
          set({ error: error.message || 'Failed to mark as read' });
        }
      },

      batchArchive: async (ids: string[]) => {
        const { notifications } = get();

        try {
          // API call would go here
          // await notificationApi.batchUpdate(ids, { archived: true });

          const updatedNotifications = notifications.map(n =>
            ids.includes(n.id) ? { ...n, archived: true, read: true } : n
          );

          set({
            notifications: updatedNotifications,
            unreadCount: updatedNotifications.filter(n => !n.read && !n.archived).length,
          });
        } catch (error: any) {
          set({ error: error.message || 'Failed to archive notifications' });
        }
      },

      batchDelete: async (ids: string[]) => {
        const { notifications } = get();

        try {
          // API call would go here
          // await notificationApi.batchDelete(ids);

          const updatedNotifications = notifications.filter(n => !ids.includes(n.id));

          set({
            notifications: updatedNotifications,
            unreadCount: updatedNotifications.filter(n => !n.read && !n.archived).length,
          });
        } catch (error: any) {
          set({ error: error.message || 'Failed to delete notifications' });
        }
      },

      // Preferences
      updatePreferences: async (preferences: Partial<NotificationPreferences>) => {
        const currentPrefs = get().preferences;

        try {
          // API call would go here
          // await notificationApi.updatePreferences(preferences);

          set({
            preferences: {
              ...currentPrefs,
              ...preferences,
            },
          });
        } catch (error: any) {
          set({ error: error.message || 'Failed to update preferences' });
        }
      },

      toggleNotificationType: (type: NotificationType, enabled: boolean) => {
        const { preferences } = get();

        set({
          preferences: {
            ...preferences,
            preferences: {
              ...preferences.preferences,
              [type]: {
                ...preferences.preferences[type],
                enabled,
              },
            },
          },
        });
      },

      // Statistics
      getStats: () => {
        const { notifications } = get();

        const stats: NotificationStats = {
          total: notifications.length,
          unread: notifications.filter(n => !n.read && !n.archived).length,
          byType: {} as Record<NotificationType, number>,
          byPriority: {} as Record<NotificationPriority, number>,
        };

        // Count by type
        notifications.forEach(n => {
          stats.byType[n.type] = (stats.byType[n.type] || 0) + 1;
          stats.byPriority[n.priority] = (stats.byPriority[n.priority] || 0) + 1;
        });

        return stats;
      },

      // Filter notifications
      filterNotifications: (filter: NotificationFilter) => {
        const { notifications } = get();

        return notifications.filter(n => {
          if (filter.types && !filter.types.includes(n.type)) return false;
          if (filter.priority && !filter.priority.includes(n.priority)) return false;
          if (filter.read !== undefined && n.read !== filter.read) return false;
          if (filter.archived !== undefined && n.archived !== filter.archived) return false;
          if (filter.startDate && new Date(n.createdAt) < filter.startDate) return false;
          if (filter.endDate && new Date(n.createdAt) > filter.endDate) return false;

          return true;
        });
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },

      // Real-time updates
      handleRealtimeUpdate: (notification: Notification) => {
        get().addNotification(notification);
      },
    }),
    {
      name: 'notification-storage',
      partialize: (state) => ({
        preferences: state.preferences,
        notifications: state.notifications.slice(0, 50), // Only persist last 50
      }),
    }
  )
);
