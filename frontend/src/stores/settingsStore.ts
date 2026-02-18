/**
 * Settings Store
 * Manages user preferences including theme, notifications, study settings, and privacy
 * Enhanced with devtools and persistence
 */

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import type {
  SettingsStore,
  Theme,
  Language,
  NotificationPreferences,
  StudyPreferences,
  PrivacySettings,
} from '../types/store';

// ============================================================================
// Initial State
// ============================================================================

const defaultNotifications: NotificationPreferences = {
  srsReviewsDue: true,
  newLessonAvailable: true,
  quizDeadline: true,
  achievementUnlocked: true,
  feedbackReceived: true,
  emailNotifications: true,
  pushNotifications: false,
  sound: true,
};

const defaultStudyPreferences: StudyPreferences = {
  dailyReviewLimit: 50,
  studyReminders: true,
  reminderTime: '09:00',
  autoPlayVideos: false,
  showHints: true,
  keyboardShortcuts: true,
};

const defaultPrivacySettings: PrivacySettings = {
  showProfile: true,
  shareProgress: true,
  allowAnalytics: true,
};

const initialState = {
  theme: 'light' as Theme,
  language: 'en' as Language,
  notifications: defaultNotifications,
  study: defaultStudyPreferences,
  privacy: defaultPrivacySettings,
  isLoading: false,
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Applies theme to document
 */
const applyTheme = (theme: Theme): void => {
  const root = document.documentElement;

  if (theme === 'dark') {
    root.classList.add('dark');
  } else if (theme === 'light') {
    root.classList.remove('dark');
  } else {
    // Auto mode - check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
};

// ============================================================================
// Store Implementation
// ============================================================================

export const useSettingsStore = create<SettingsStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // ====================================================================
        // Update Theme
        // ====================================================================
        updateTheme: (theme: Theme) => {
          applyTheme(theme);

          set({ theme }, false, 'settings/updateTheme');
        },

        // ====================================================================
        // Update Language
        // ====================================================================
        updateLanguage: (language: Language) => {
          // TODO: Implement i18n language switching
          set({ language }, false, 'settings/updateLanguage');

          // Update document lang attribute
          document.documentElement.lang = language;
        },

        // ====================================================================
        // Update Notifications
        // ====================================================================
        updateNotifications: (preferences: Partial<NotificationPreferences>) => {
          set(
            {
              notifications: {
                ...get().notifications,
                ...preferences,
              },
            },
            false,
            'settings/updateNotifications'
          );

          // Request push notification permission if enabling
          if (preferences.pushNotifications && 'Notification' in window) {
            Notification.requestPermission().then((permission) => {
              if (permission !== 'granted') {
                console.warn('Push notification permission denied');
                set(
                  {
                    notifications: {
                      ...get().notifications,
                      pushNotifications: false,
                    },
                  },
                  false,
                  'settings/pushNotificationDenied'
                );
              }
            });
          }
        },

        // ====================================================================
        // Update Study Preferences
        // ====================================================================
        updateStudyPreferences: (preferences: Partial<StudyPreferences>) => {
          set(
            {
              study: {
                ...get().study,
                ...preferences,
              },
            },
            false,
            'settings/updateStudyPreferences'
          );

          // Update daily review limit in SRS store if it exists
          if (preferences.dailyReviewLimit !== undefined) {
            // Import SRS store dynamically to avoid circular dependency
            import('./srsStore').then(({ useSRSStore }) => {
              useSRSStore.getState().updateDailyLimit(preferences.dailyReviewLimit!);
            });
          }
        },

        // ====================================================================
        // Update Privacy
        // ====================================================================
        updatePrivacy: (settings: Partial<PrivacySettings>) => {
          set(
            {
              privacy: {
                ...get().privacy,
                ...settings,
              },
            },
            false,
            'settings/updatePrivacy'
          );

          // Handle analytics opt-out
          if (settings.allowAnalytics === false) {
            // TODO: Disable analytics tracking
            console.log('Analytics disabled');
          }
        },

        // ====================================================================
        // Sync Settings
        // ====================================================================
        syncSettings: async () => {
          set({ isLoading: true }, false, 'settings/sync/start');

          try {
            // TODO: Replace with actual API call
            const response = await fetch('/api/settings', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
              },
              body: JSON.stringify({
                theme: get().theme,
                language: get().language,
                notifications: get().notifications,
                study: get().study,
                privacy: get().privacy,
              }),
            });

            if (!response.ok) {
              throw new Error('Failed to sync settings');
            }

            set({ isLoading: false }, false, 'settings/sync/success');
          } catch (error) {
            console.error('Failed to sync settings:', error);
            set({ isLoading: false }, false, 'settings/sync/error');
          }
        },

        // ====================================================================
        // Reset Settings
        // ====================================================================
        resetSettings: () => {
          set(
            {
              theme: 'light',
              language: 'en',
              notifications: defaultNotifications,
              study: defaultStudyPreferences,
              privacy: defaultPrivacySettings,
            },
            false,
            'settings/reset'
          );

          // Reapply theme
          applyTheme('light');
        },
      }),
      {
        name: 'settings-storage',
        onRehydrateStorage: () => {
          return (state) => {
            if (state) {
              // Apply theme on rehydration
              applyTheme(state.theme);

              // Set language
              document.documentElement.lang = state.language;
            }
          };
        },
      }
    ),
    {
      name: 'SettingsStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

// Listen to system theme changes for auto mode
if (typeof window !== 'undefined') {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  mediaQuery.addEventListener('change', (e) => {
    const settings = useSettingsStore.getState();
    if (settings.theme === 'auto') {
      applyTheme('auto');
    }
  });
}

// ============================================================================
// Selectors
// ============================================================================

export const selectTheme = (state: SettingsStore) => state.theme;
export const selectLanguage = (state: SettingsStore) => state.language;
export const selectNotifications = (state: SettingsStore) => state.notifications;
export const selectStudyPreferences = (state: SettingsStore) => state.study;
export const selectPrivacySettings = (state: SettingsStore) => state.privacy;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Gets current effective theme (resolves 'auto' to 'light' or 'dark')
 */
export const getEffectiveTheme = (): 'light' | 'dark' => {
  const theme = useSettingsStore.getState().theme;

  if (theme === 'auto') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  return theme;
};

/**
 * Checks if dark mode is active
 */
export const isDarkMode = (): boolean => {
  return getEffectiveTheme() === 'dark';
};

/**
 * Checks if a notification type is enabled
 */
export const isNotificationEnabled = (
  type: keyof NotificationPreferences
): boolean => {
  return useSettingsStore.getState().notifications[type];
};

/**
 * Gets daily review limit
 */
export const getDailyReviewLimit = (): number => {
  return useSettingsStore.getState().study.dailyReviewLimit;
};

/**
 * Checks if keyboard shortcuts are enabled
 */
export const areKeyboardShortcutsEnabled = (): boolean => {
  return useSettingsStore.getState().study.keyboardShortcuts;
};

/**
 * Exports all settings to JSON
 */
export const exportSettings = (): string => {
  const state = useSettingsStore.getState();

  return JSON.stringify(
    {
      theme: state.theme,
      language: state.language,
      notifications: state.notifications,
      study: state.study,
      privacy: state.privacy,
    },
    null,
    2
  );
};

/**
 * Imports settings from JSON
 */
export const importSettings = (json: string): boolean => {
  try {
    const settings = JSON.parse(json);
    const state = useSettingsStore.getState();

    // Validate and apply settings
    if (settings.theme) state.updateTheme(settings.theme);
    if (settings.language) state.updateLanguage(settings.language);
    if (settings.notifications) state.updateNotifications(settings.notifications);
    if (settings.study) state.updateStudyPreferences(settings.study);
    if (settings.privacy) state.updatePrivacy(settings.privacy);

    return true;
  } catch (error) {
    console.error('Failed to import settings:', error);
    return false;
  }
};
