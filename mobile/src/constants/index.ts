import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// API Configuration
export const API_CONFIG = {
  BASE_URL: __DEV__
    ? Platform.OS === 'android'
      ? 'http://10.0.2.2:3001/api'
      : 'http://localhost:3001/api'
    : 'https://api.pwlearning.com/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
};

// App Configuration
export const APP_CONFIG = {
  NAME: 'Playwright & Selenium Learning',
  VERSION: '1.0.0',
  BUILD_NUMBER: '1',
  BUNDLE_ID: 'com.pwlearning.app',
};

// Screen Dimensions
export const SCREEN = {
  WIDTH: width,
  HEIGHT: height,
  IS_SMALL: width < 375,
  IS_MEDIUM: width >= 375 && width < 414,
  IS_LARGE: width >= 414,
};

// Colors
export const COLORS = {
  light: {
    primary: '#4F46E5',
    secondary: '#7C3AED',
    accent: '#EC4899',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    card: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    info: '#3B82F6',
  },
  dark: {
    primary: '#6366F1',
    secondary: '#8B5CF6',
    accent: '#F472B6',
    background: '#111827',
    surface: '#1F2937',
    card: '#374151',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    border: '#4B5563',
    error: '#F87171',
    success: '#34D399',
    warning: '#FBBF24',
    info: '#60A5FA',
  },
};

// Typography
export const FONTS = {
  regular: 'Roboto-Regular',
  medium: 'Roboto-Medium',
  bold: 'Roboto-Bold',
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
};

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

// Border Radius
export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Shadows
export const SHADOWS = {
  sm: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    android: {
      elevation: 2,
    },
  }),
  md: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    android: {
      elevation: 4,
    },
  }),
  lg: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
    android: {
      elevation: 8,
    },
  }),
};

// Animation Duration
export const ANIMATION = {
  fast: 200,
  normal: 300,
  slow: 500,
};

// Z-Index
export const Z_INDEX = {
  modal: 1000,
  overlay: 900,
  dropdown: 800,
  header: 700,
  footer: 600,
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@auth_token',
  REFRESH_TOKEN: '@refresh_token',
  USER_DATA: '@user_data',
  SETTINGS: '@settings',
  OFFLINE_LESSONS: '@offline_lessons',
  THEME: '@theme',
  ONBOARDING_COMPLETE: '@onboarding_complete',
  BIOMETRIC_ENABLED: '@biometric_enabled',
};

// Query Keys
export const QUERY_KEYS = {
  USER: 'user',
  LESSONS: 'lessons',
  LESSON_DETAIL: 'lessonDetail',
  FLASHCARDS: 'flashcards',
  QUIZZES: 'quizzes',
  QUIZ_DETAIL: 'quizDetail',
  EXERCISES: 'exercises',
  PROGRESS: 'progress',
  ACHIEVEMENTS: 'achievements',
  NOTIFICATIONS: 'notifications',
};

// Notification Types
export const NOTIFICATION_TYPES = {
  LESSON_REMINDER: 'lesson_reminder',
  QUIZ_AVAILABLE: 'quiz_available',
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  DAILY_REMINDER: 'daily_reminder',
  STREAK_REMINDER: 'streak_reminder',
};

// Lesson Categories
export const LESSON_CATEGORIES = [
  { id: 'playwright', name: 'Playwright', icon: 'play-circle' },
  { id: 'selenium', name: 'Selenium', icon: 'web' },
  { id: 'testing', name: 'Testing', icon: 'check-circle' },
  { id: 'automation', name: 'Automation', icon: 'auto-fix' },
  { id: 'advanced', name: 'Advanced', icon: 'trending-up' },
];

// Difficulty Levels
export const DIFFICULTY_LEVELS = [
  { value: 'beginner', label: 'Beginner', color: '#10B981' },
  { value: 'intermediate', label: 'Intermediate', color: '#F59E0B' },
  { value: 'advanced', label: 'Advanced', color: '#EF4444' },
];

// Quiz Settings
export const QUIZ_CONFIG = {
  MIN_PASSING_SCORE: 70,
  TIME_PER_QUESTION: 60, // seconds
  MAX_ATTEMPTS: 3,
};

// Flashcard Settings
export const FLASHCARD_CONFIG = {
  CARDS_PER_SESSION: 20,
  NEW_CARDS_PER_DAY: 10,
  REVIEW_INTERVALS: [1, 3, 7, 14, 30], // days
};

// Study Goals
export const STUDY_GOALS = [
  { value: 15, label: '15 minutes/day' },
  { value: 30, label: '30 minutes/day' },
  { value: 60, label: '1 hour/day' },
  { value: 120, label: '2 hours/day' },
];

// Language Support
export const SUPPORTED_LANGUAGES = [
  { code: 'javascript', name: 'JavaScript', icon: 'language-javascript' },
  { code: 'python', name: 'Python', icon: 'language-python' },
  { code: 'java', name: 'Java', icon: 'language-java' },
];

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Please log in to continue.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Welcome back!',
  REGISTER: 'Account created successfully!',
  LOGOUT: 'Logged out successfully.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  SETTINGS_SAVED: 'Settings saved successfully.',
  LESSON_COMPLETED: 'Lesson completed!',
  QUIZ_SUBMITTED: 'Quiz submitted successfully.',
};

// Platform Specific
export const IS_IOS = Platform.OS === 'ios';
export const IS_ANDROID = Platform.OS === 'android';
export const IS_WEB = Platform.OS === 'web';

// Biometric Types
export const BIOMETRIC_TYPES = {
  FINGERPRINT: 1,
  FACE_ID: 2,
  IRIS: 3,
};

// Deep Link Prefixes
export const DEEP_LINK_PREFIXES = [
  'pwlearning://',
  'https://pwlearning.com',
  'https://app.pwlearning.com',
];

// Share Options
export const SHARE_OPTIONS = {
  dialogTitle: 'Share your progress',
  message: 'Check out my progress on Playwright & Selenium Learning!',
  subject: 'My Learning Progress',
};
