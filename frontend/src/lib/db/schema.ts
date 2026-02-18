/**
 * IndexedDB Schema Definition
 * Defines all object stores, indexes, and version management for offline storage
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Database configuration
export const DB_NAME = 'playwright-learning-platform';
export const DB_VERSION = 1;

// ============================================================================
// Type Definitions for Database Entities
// ============================================================================

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';

  // SRS fields
  easinessFactor: number; // SM-2 algorithm
  interval: number; // Days until next review
  repetitions: number;
  nextReviewDate: Date;
  lastReviewDate?: Date;

  // Metadata
  createdAt: Date;
  updatedAt: Date;

  // Sync fields
  syncStatus: 'synced' | 'pending' | 'conflict';
  lastSyncedAt?: Date;
  version: number;
}

export interface Lesson {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string; // Markdown content

  // Organization
  moduleId: string;
  week: number;
  order: number;
  track: '30-day' | '60-day' | 'both';

  // Metadata
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // Minutes
  tags: string[];
  prerequisites: string[]; // Lesson IDs

  // Resources
  videoUrl?: string;
  codeExamples?: {
    language: string;
    code: string;
    title: string;
  }[];

  // Dates
  createdAt: Date;
  updatedAt: Date;

  // Sync fields
  syncStatus: 'synced' | 'pending' | 'conflict';
  lastSyncedAt?: Date;
  version: number;
}

export interface Progress {
  id: string;
  userId: string;
  entityType: 'lesson' | 'quiz' | 'exercise' | 'flashcard';
  entityId: string;

  // Progress tracking
  status: 'not-started' | 'in-progress' | 'completed';
  progressPercentage: number; // 0-100
  timeSpent: number; // Seconds

  // Lesson-specific
  lastPosition?: number; // For resuming reading
  bookmarked?: boolean;

  // Quiz/Exercise-specific
  score?: number;
  attempts?: number;
  bestScore?: number;

  // SRS-specific
  totalReviews?: number;
  successRate?: number;

  // Dates
  startedAt?: Date;
  completedAt?: Date;
  lastAccessedAt: Date;
  createdAt: Date;
  updatedAt: Date;

  // Sync fields
  syncStatus: 'synced' | 'pending' | 'conflict';
  lastSyncedAt?: Date;
  version: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  lessonId?: string;

  // Configuration
  timeLimit?: number; // Minutes
  passingScore: number; // Percentage
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showResults: boolean;

  // Questions
  questions: QuizQuestion[];

  // Metadata
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];

  // Dates
  createdAt: Date;
  updatedAt: Date;

  // Sync fields
  syncStatus: 'synced' | 'pending' | 'conflict';
  lastSyncedAt?: Date;
  version: number;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'multiple-answer' | 'true-false' | 'code-snippet';
  question: string;
  options: string[];
  correctAnswers: number[]; // Index(es) of correct option(s)
  explanation?: string;
  codeSnippet?: string;
  points: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;

  // Attempt data
  answers: { questionId: string; selectedAnswers: number[] }[];
  score: number;
  percentage: number;
  passed: boolean;

  // Timing
  startedAt: Date;
  completedAt?: Date;
  timeSpent: number; // Seconds

  // Metadata
  attemptNumber: number;

  // Sync fields
  syncStatus: 'synced' | 'pending' | 'conflict';
  lastSyncedAt?: Date;
  version: number;
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  instructions: string;
  lessonId?: string;

  // Code exercise details
  language: 'typescript' | 'javascript' | 'java';
  starterCode: string;
  solution?: string;
  hints: string[];

  // Test cases
  testCases: {
    id: string;
    input: string;
    expectedOutput: string;
    isHidden: boolean;
  }[];

  // Metadata
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number; // Minutes
  tags: string[];

  // Dates
  createdAt: Date;
  updatedAt: Date;

  // Sync fields
  syncStatus: 'synced' | 'pending' | 'conflict';
  lastSyncedAt?: Date;
  version: number;
}

export interface ExerciseSubmission {
  id: string;
  exerciseId: string;
  userId: string;

  // Submission data
  code: string;
  language: string;

  // Results
  passed: boolean;
  testResults: {
    testId: string;
    passed: boolean;
    output?: string;
    error?: string;
  }[];
  score: number;

  // Timing
  submittedAt: Date;
  timeSpent: number; // Seconds

  // Metadata
  attemptNumber: number;

  // Sync fields
  syncStatus: 'synced' | 'pending' | 'conflict';
  lastSyncedAt?: Date;
  version: number;
}

export interface SyncQueue {
  id: string;
  storeName: string;
  operation: 'create' | 'update' | 'delete';
  entityId: string;
  data: any;
  timestamp: Date;
  retryCount: number;
  error?: string;
  status: 'pending' | 'processing' | 'failed' | 'completed';
}

export interface AppSettings {
  id: string; // Always 'settings'
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    enabled: boolean;
    reviewReminders: boolean;
    achievementAlerts: boolean;
    soundEffects: boolean;
  };
  study: {
    dailyReviewLimit: number;
    autoPlayNext: boolean;
    showHints: boolean;
  };
  privacy: {
    analyticsEnabled: boolean;
    shareProgress: boolean;
  };
  lastUpdated: Date;
}

// ============================================================================
// IndexedDB Schema Interface
// ============================================================================

export interface PlaywrightLearningDB extends DBSchema {
  flashcards: {
    key: string;
    value: Flashcard;
    indexes: {
      'by-category': string;
      'by-next-review': Date;
      'by-sync-status': 'synced' | 'pending' | 'conflict';
      'by-updated-at': Date;
    };
  };
  lessons: {
    key: string;
    value: Lesson;
    indexes: {
      'by-module': string;
      'by-track': '30-day' | '60-day' | 'both';
      'by-week': number;
      'by-slug': string;
      'by-sync-status': 'synced' | 'pending' | 'conflict';
    };
  };
  progress: {
    key: string;
    value: Progress;
    indexes: {
      'by-user-entity': [string, string, string]; // [userId, entityType, entityId]
      'by-status': 'not-started' | 'in-progress' | 'completed';
      'by-last-accessed': Date;
      'by-sync-status': 'synced' | 'pending' | 'conflict';
    };
  };
  quizzes: {
    key: string;
    value: Quiz;
    indexes: {
      'by-lesson': string;
      'by-sync-status': 'synced' | 'pending' | 'conflict';
    };
  };
  quizAttempts: {
    key: string;
    value: QuizAttempt;
    indexes: {
      'by-user-quiz': [string, string]; // [userId, quizId]
      'by-sync-status': 'synced' | 'pending' | 'conflict';
    };
  };
  exercises: {
    key: string;
    value: Exercise;
    indexes: {
      'by-lesson': string;
      'by-language': string;
      'by-sync-status': 'synced' | 'pending' | 'conflict';
    };
  };
  exerciseSubmissions: {
    key: string;
    value: ExerciseSubmission;
    indexes: {
      'by-user-exercise': [string, string]; // [userId, exerciseId]
      'by-sync-status': 'synced' | 'pending' | 'conflict';
    };
  };
  syncQueue: {
    key: string;
    value: SyncQueue;
    indexes: {
      'by-status': 'pending' | 'processing' | 'failed' | 'completed';
      'by-timestamp': Date;
      'by-store-operation': [string, string]; // [storeName, operation]
    };
  };
  settings: {
    key: string;
    value: AppSettings;
  };
}

// ============================================================================
// Database Connection and Initialization
// ============================================================================

let dbInstance: IDBPDatabase<PlaywrightLearningDB> | null = null;

/**
 * Initialize and open the IndexedDB database
 * Creates all object stores and indexes on first run or version upgrade
 */
export async function openDatabase(): Promise<IDBPDatabase<PlaywrightLearningDB>> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<PlaywrightLearningDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      console.log(`Upgrading database from version ${oldVersion} to ${newVersion}`);

      // Version 1: Initial schema
      if (oldVersion < 1) {
        // Flashcards store
        if (!db.objectStoreNames.contains('flashcards')) {
          const flashcardStore = db.createObjectStore('flashcards', { keyPath: 'id' });
          flashcardStore.createIndex('by-category', 'category');
          flashcardStore.createIndex('by-next-review', 'nextReviewDate');
          flashcardStore.createIndex('by-sync-status', 'syncStatus');
          flashcardStore.createIndex('by-updated-at', 'updatedAt');
        }

        // Lessons store
        if (!db.objectStoreNames.contains('lessons')) {
          const lessonStore = db.createObjectStore('lessons', { keyPath: 'id' });
          lessonStore.createIndex('by-module', 'moduleId');
          lessonStore.createIndex('by-track', 'track');
          lessonStore.createIndex('by-week', 'week');
          lessonStore.createIndex('by-slug', 'slug', { unique: true });
          lessonStore.createIndex('by-sync-status', 'syncStatus');
        }

        // Progress store
        if (!db.objectStoreNames.contains('progress')) {
          const progressStore = db.createObjectStore('progress', { keyPath: 'id' });
          progressStore.createIndex('by-user-entity', ['userId', 'entityType', 'entityId'], { unique: true });
          progressStore.createIndex('by-status', 'status');
          progressStore.createIndex('by-last-accessed', 'lastAccessedAt');
          progressStore.createIndex('by-sync-status', 'syncStatus');
        }

        // Quizzes store
        if (!db.objectStoreNames.contains('quizzes')) {
          const quizStore = db.createObjectStore('quizzes', { keyPath: 'id' });
          quizStore.createIndex('by-lesson', 'lessonId');
          quizStore.createIndex('by-sync-status', 'syncStatus');
        }

        // Quiz attempts store
        if (!db.objectStoreNames.contains('quizAttempts')) {
          const attemptStore = db.createObjectStore('quizAttempts', { keyPath: 'id' });
          attemptStore.createIndex('by-user-quiz', ['userId', 'quizId']);
          attemptStore.createIndex('by-sync-status', 'syncStatus');
        }

        // Exercises store
        if (!db.objectStoreNames.contains('exercises')) {
          const exerciseStore = db.createObjectStore('exercises', { keyPath: 'id' });
          exerciseStore.createIndex('by-lesson', 'lessonId');
          exerciseStore.createIndex('by-language', 'language');
          exerciseStore.createIndex('by-sync-status', 'syncStatus');
        }

        // Exercise submissions store
        if (!db.objectStoreNames.contains('exerciseSubmissions')) {
          const submissionStore = db.createObjectStore('exerciseSubmissions', { keyPath: 'id' });
          submissionStore.createIndex('by-user-exercise', ['userId', 'exerciseId']);
          submissionStore.createIndex('by-sync-status', 'syncStatus');
        }

        // Sync queue store
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
          syncStore.createIndex('by-status', 'status');
          syncStore.createIndex('by-timestamp', 'timestamp');
          syncStore.createIndex('by-store-operation', ['storeName', 'operation']);
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }
      }

      // Future versions would be handled here
      // if (oldVersion < 2) { ... }
    },
    blocked() {
      console.warn('Database upgrade blocked - another tab may have the database open');
    },
    blocking() {
      console.warn('This database version is blocking a newer version from opening');
      if (dbInstance) {
        dbInstance.close();
        dbInstance = null;
      }
    },
    terminated() {
      console.error('Database connection was unexpectedly terminated');
      dbInstance = null;
    }
  });

  return dbInstance;
}

/**
 * Get the current database instance
 * Throws error if database is not initialized
 */
export function getDatabase(): IDBPDatabase<PlaywrightLearningDB> {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call openDatabase() first.');
  }
  return dbInstance;
}

/**
 * Close the database connection
 */
export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

/**
 * Delete the entire database
 * Useful for testing or complete data reset
 */
export async function deleteDatabase(): Promise<void> {
  closeDatabase();
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => {
      console.warn('Database deletion blocked');
    };
  });
}

// ============================================================================
// Store Names (for type safety)
// ============================================================================

export const STORE_NAMES = {
  FLASHCARDS: 'flashcards',
  LESSONS: 'lessons',
  PROGRESS: 'progress',
  QUIZZES: 'quizzes',
  QUIZ_ATTEMPTS: 'quizAttempts',
  EXERCISES: 'exercises',
  EXERCISE_SUBMISSIONS: 'exerciseSubmissions',
  SYNC_QUEUE: 'syncQueue',
  SETTINGS: 'settings',
} as const;

export type StoreName = keyof PlaywrightLearningDB;
