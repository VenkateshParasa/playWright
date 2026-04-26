/**
 * Type definitions for all stores in the application
 * Provides type-safe state management across the platform
 */

// ============================================================================
// Auth Store Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'student' | 'instructor' | 'admin';
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  clearError: () => void;
  setToken: (token: string | null) => void;
  refreshAuth: () => Promise<void>;
}

export type AuthStore = AuthState & AuthActions;

// ============================================================================
// Progress Store Types
// ============================================================================

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  completedAt?: string;
  timeSpent: number; // in seconds
  lastAccessedAt?: string;
  bookmarked: boolean;
}

export interface QuizAttempt {
  quizId: string;
  score: number;
  maxScore: number;
  passed: boolean;
  completedAt: string;
  timeSpent: number;
  answers: Record<string, any>;
}

export interface ExerciseProgress {
  exerciseId: string;
  completed: boolean;
  completedAt?: string;
  attempts: number;
  bestScore: number;
  timeSpent: number;
}

export interface ModuleProgress {
  moduleId: string;
  lessonsCompleted: number;
  totalLessons: number;
  quizzesPassed: number;
  totalQuizzes: number;
  exercisesCompleted: number;
  totalExercises: number;
  overallProgress: number; // 0-100
}

export interface ProgressState {
  lessons: Record<string, LessonProgress>;
  quizzes: Record<string, QuizAttempt[]>;
  exercises: Record<string, ExerciseProgress>;
  modules: Record<string, ModuleProgress>;
  overallProgress: number;
  currentStreak: number;
  longestStreak: number;
  totalStudyTime: number; // in seconds
  lastStudyDate?: string;
  isLoading: boolean;
}

export interface ProgressActions {
  markLessonComplete: (lessonId: string) => void;
  updateLessonTime: (lessonId: string, timeSpent: number) => void;
  toggleBookmark: (lessonId: string) => void;
  addQuizAttempt: (quizId: string, attempt: Omit<QuizAttempt, 'quizId'>) => void;
  updateExerciseProgress: (exerciseId: string, progress: Partial<ExerciseProgress>) => void;
  completeExercise: (exerciseId: string, score: number, timeSpent: number) => void;
  calculateOverallProgress: () => void;
  updateStreak: () => void;
  syncProgress: () => Promise<void>;
  resetProgress: () => void;
}

export type ProgressStore = ProgressState & ProgressActions;

// ============================================================================
// SRS Store Types
// ============================================================================

export interface FlashCard {
  id: string;
  front: string;
  back: string;
  category: string;
  tags: string[];
  lessonId?: string;
}

export interface CardReview {
  cardId: string;
  quality: number; // 0-5 (SM-2 algorithm)
  easeFactor: number;
  interval: number; // days
  repetitions: number;
  nextReviewDate: string;
  lastReviewedAt: string;
  reviewHistory: ReviewRecord[];
}

export interface ReviewRecord {
  date: string;
  quality: number;
  timeSpent: number; // seconds
}

export interface ReviewSession {
  id: string;
  startedAt: string;
  completedAt?: string;
  cardsReviewed: number;
  totalCards: number;
  averageQuality: number;
  totalTime: number;
}

export interface SRSState {
  cards: Record<string, FlashCard>;
  reviews: Record<string, CardReview>;
  dueCards: string[]; // card IDs
  currentSession: ReviewSession | null;
  isReviewing: boolean;
  dailyLimit: number;
  reviewedToday: number;
  isLoading: boolean;
}

export interface SRSActions {
  loadCards: () => Promise<void>;
  reviewCard: (cardId: string, quality: number) => void;
  startSession: () => void;
  endSession: () => void;
  skipCard: (cardId: string) => void;
  undoLastReview: () => void;
  updateDailyLimit: (limit: number) => void;
  calculateDueCards: () => void;
  getCardStats: (cardId: string) => CardStats;
  syncReviews: () => Promise<void>;
}

export interface CardStats {
  totalReviews: number;
  averageQuality: number;
  successRate: number;
  currentStreak: number;
  retentionRate: number;
}

export type SRSStore = SRSState & SRSActions;

// ============================================================================
// Settings Store Types
// ============================================================================

export type Theme = 'light' | 'dark' | 'auto';
export type Language = 'en' | 'es' | 'fr' | 'de';

export interface NotificationPreferences {
  srsReviewsDue: boolean;
  newLessonAvailable: boolean;
  quizDeadline: boolean;
  achievementUnlocked: boolean;
  feedbackReceived: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  sound: boolean;
}

export interface StudyPreferences {
  dailyReviewLimit: number;
  studyReminders: boolean;
  reminderTime?: string; // HH:mm format
  autoPlayVideos: boolean;
  showHints: boolean;
  keyboardShortcuts: boolean;
}

export interface PrivacySettings {
  showProfile: boolean;
  shareProgress: boolean;
  allowAnalytics: boolean;
}

export interface SettingsState {
  theme: Theme;
  language: Language;
  notifications: NotificationPreferences;
  study: StudyPreferences;
  privacy: PrivacySettings;
  isLoading: boolean;
}

export interface SettingsActions {
  updateTheme: (theme: Theme) => void;
  updateLanguage: (language: Language) => void;
  updateNotifications: (preferences: Partial<NotificationPreferences>) => void;
  updateStudyPreferences: (preferences: Partial<StudyPreferences>) => void;
  updatePrivacy: (settings: Partial<PrivacySettings>) => void;
  syncSettings: () => Promise<void>;
  resetSettings: () => void;
}

export type SettingsStore = SettingsState & SettingsActions;

// ============================================================================
// UI Store Types
// ============================================================================

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

export interface Modal {
  id: string;
  type: string;
  props?: Record<string, any>;
}

export interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  toasts: Toast[];
  modals: Modal[];
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncAt?: string;
  globalLoading: boolean;
  pageTitle: string;
  breadcrumbs: Breadcrumb[];
}

export interface Breadcrumb {
  label: string;
  path?: string;
}

export interface UIActions {
  toggleSidebar: () => void;
  collapseSidebar: (collapsed: boolean) => void;
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
  openModal: (modal: Omit<Modal, 'id'>) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  setOnlineStatus: (isOnline: boolean) => void;
  setSyncStatus: (isSyncing: boolean) => void;
  updateLastSync: () => void;
  setGlobalLoading: (loading: boolean) => void;
  setPageTitle: (title: string) => void;
  setBreadcrumbs: (breadcrumbs: Breadcrumb[]) => void;
}

export type UIStore = UIState & UIActions;

// ============================================================================
// Persistence Types
// ============================================================================

export interface PersistConfig {
  name: string;
  storage: 'localStorage' | 'indexedDB';
  version: number;
  migrate?: (state: any, version: number) => any;
  partialize?: (state: any) => any;
}

// ============================================================================
// React Query Types
// ============================================================================

export interface QueryConfig {
  staleTime?: number;
  cacheTime?: number;
  retry?: number | boolean;
  retryDelay?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
}

export interface MutationConfig {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  retry?: number;
}

// ============================================================================
// Optimistic Update Types
// ============================================================================

export interface OptimisticUpdate<T> {
  type: string;
  payload: T;
  rollback?: () => void;
}

export interface OptimisticUpdateConfig {
  updateFn: (oldData: any, variables: any) => any;
  rollbackFn?: (oldData: any) => any;
}
