/**
 * Settings Validation Utilities
 * Validates settings data before saving
 */

import type {
  Theme,
  Language,
  NotificationPreferences,
  StudyPreferences,
  PrivacySettings,
} from '../../types/store';

/**
 * Validates theme value
 */
export const isValidTheme = (theme: any): theme is Theme => {
  return ['light', 'dark', 'auto'].includes(theme);
};

/**
 * Validates language value
 */
export const isValidLanguage = (language: any): language is Language => {
  return ['en', 'es', 'fr', 'de'].includes(language);
};

/**
 * Validates notification preferences
 */
export const validateNotificationPreferences = (
  prefs: Partial<NotificationPreferences>
): boolean => {
  const validKeys: (keyof NotificationPreferences)[] = [
    'srsReviewsDue',
    'newLessonAvailable',
    'quizDeadline',
    'achievementUnlocked',
    'feedbackReceived',
    'emailNotifications',
    'pushNotifications',
    'sound',
  ];

  for (const key of Object.keys(prefs)) {
    if (!validKeys.includes(key as keyof NotificationPreferences)) {
      return false;
    }
    if (typeof prefs[key as keyof NotificationPreferences] !== 'boolean') {
      return false;
    }
  }

  return true;
};

/**
 * Validates study preferences
 */
export const validateStudyPreferences = (
  prefs: Partial<StudyPreferences>
): boolean => {
  if (prefs.dailyReviewLimit !== undefined) {
    if (
      typeof prefs.dailyReviewLimit !== 'number' ||
      prefs.dailyReviewLimit < 1 ||
      prefs.dailyReviewLimit > 500
    ) {
      return false;
    }
  }

  if (prefs.studyReminders !== undefined) {
    if (typeof prefs.studyReminders !== 'boolean') {
      return false;
    }
  }

  if (prefs.reminderTime !== undefined) {
    if (typeof prefs.reminderTime !== 'string') {
      return false;
    }
    // Validate HH:mm format
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(prefs.reminderTime)) {
      return false;
    }
  }

  if (prefs.autoPlayVideos !== undefined) {
    if (typeof prefs.autoPlayVideos !== 'boolean') {
      return false;
    }
  }

  if (prefs.showHints !== undefined) {
    if (typeof prefs.showHints !== 'boolean') {
      return false;
    }
  }

  if (prefs.keyboardShortcuts !== undefined) {
    if (typeof prefs.keyboardShortcuts !== 'boolean') {
      return false;
    }
  }

  return true;
};

/**
 * Validates privacy settings
 */
export const validatePrivacySettings = (
  settings: Partial<PrivacySettings>
): boolean => {
  const validKeys: (keyof PrivacySettings)[] = [
    'showProfile',
    'shareProgress',
    'allowAnalytics',
  ];

  for (const key of Object.keys(settings)) {
    if (!validKeys.includes(key as keyof PrivacySettings)) {
      return false;
    }
    if (typeof settings[key as keyof PrivacySettings] !== 'boolean') {
      return false;
    }
  }

  return true;
};

/**
 * Validates all settings
 */
export const validateSettings = (settings: any): boolean => {
  if (settings.theme !== undefined && !isValidTheme(settings.theme)) {
    return false;
  }

  if (settings.language !== undefined && !isValidLanguage(settings.language)) {
    return false;
  }

  if (
    settings.notifications !== undefined &&
    !validateNotificationPreferences(settings.notifications)
  ) {
    return false;
  }

  if (
    settings.study !== undefined &&
    !validateStudyPreferences(settings.study)
  ) {
    return false;
  }

  if (
    settings.privacy !== undefined &&
    !validatePrivacySettings(settings.privacy)
  ) {
    return false;
  }

  return true;
};
