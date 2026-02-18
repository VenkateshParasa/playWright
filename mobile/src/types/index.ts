// API Types
export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: 'student' | 'instructor' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  order: number;
  videoUrl?: string;
  attachments?: Attachment[];
  isCompleted?: boolean;
  progress?: number;
  downloadedAt?: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  reviewCount: number;
  nextReviewDate: string;
  lastReviewedAt?: string;
  easinessFactor: number;
  interval: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  duration: number;
  passingScore: number;
  questions: Question[];
  attempts: QuizAttempt[];
}

export interface Question {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'code' | 'fill-in-blank';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  answers: Answer[];
  startedAt: string;
  completedAt?: string;
}

export interface Answer {
  questionId: string;
  answer: string | string[];
  isCorrect: boolean;
  timeSpent: number;
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  instructions: string;
  starterCode: string;
  solution: string;
  testCases: TestCase[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  language: 'javascript' | 'python' | 'java';
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface Progress {
  userId: string;
  lessonsCompleted: number;
  totalLessons: number;
  quizzesCompleted: number;
  totalQuizzes: number;
  exercisesCompleted: number;
  totalExercises: number;
  flashcardsReviewed: number;
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  achievements: Achievement[];
  weeklyProgress: WeeklyProgress[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress: number;
  total: number;
}

export interface WeeklyProgress {
  week: string;
  lessonsCompleted: number;
  quizzesCompleted: number;
  exercisesCompleted: number;
  flashcardsReviewed: number;
  hoursStudied: number;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'lesson' | 'quiz' | 'flashcard' | 'achievement' | 'reminder';
  data?: any;
  isRead: boolean;
  createdAt: string;
}

export interface Settings {
  notifications: {
    enabled: boolean;
    dailyReminder: boolean;
    reminderTime: string;
    achievementAlerts: boolean;
    lessonUpdates: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    fontSize: 'small' | 'medium' | 'large';
  };
  study: {
    dailyGoal: number;
    autoPlayVideos: boolean;
    showHints: boolean;
  };
  privacy: {
    shareProgress: boolean;
    showProfile: boolean;
  };
  security: {
    biometricEnabled: boolean;
    requirePinOnLaunch: boolean;
  };
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Onboarding: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
};

export type MainTabParamList = {
  Home: undefined;
  Lessons: undefined;
  Flashcards: undefined;
  Quiz: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  Dashboard: undefined;
  LessonDetail: { lessonId: string };
  QuizDetail: { quizId: string };
  ExerciseDetail: { exerciseId: string };
};

export type LessonStackParamList = {
  LessonList: undefined;
  LessonDetail: { lessonId: string };
  LessonPlayer: { lessonId: string };
};

export type FlashcardStackParamList = {
  FlashcardList: undefined;
  FlashcardReview: { category?: string };
  FlashcardStats: undefined;
};

export type QuizStackParamList = {
  QuizList: undefined;
  QuizDetail: { quizId: string };
  QuizTaking: { quizId: string };
  QuizResult: { attemptId: string };
};

export type ProfileStackParamList = {
  ProfileOverview: undefined;
  Settings: undefined;
  Progress: undefined;
  Achievements: undefined;
  EditProfile: undefined;
};

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Store Types
export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LessonState {
  lessons: Lesson[];
  currentLesson: Lesson | null;
  isLoading: boolean;
  error: string | null;
  downloadedLessons: string[];
}

export interface FlashcardState {
  flashcards: Flashcard[];
  currentCard: Flashcard | null;
  reviewQueue: Flashcard[];
  isLoading: boolean;
  error: string | null;
}

export interface QuizState {
  quizzes: Quiz[];
  currentQuiz: Quiz | null;
  currentAttempt: QuizAttempt | null;
  isLoading: boolean;
  error: string | null;
}

export interface ProgressState {
  progress: Progress | null;
  isLoading: boolean;
  error: string | null;
}

export interface SettingsState extends Settings {}

// Utility Types
export type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

export type Theme = 'light' | 'dark';

export type NetworkStatus = 'online' | 'offline' | 'unknown';
