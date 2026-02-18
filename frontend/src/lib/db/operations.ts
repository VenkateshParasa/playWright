/**
 * IndexedDB CRUD Operations
 * Provides type-safe operations for all database stores with error handling,
 * validation, and transaction management
 */

import {
  openDatabase,
  getDatabase,
  type PlaywrightLearningDB,
  type StoreName,
  type Flashcard,
  type Lesson,
  type Progress,
  type Quiz,
  type QuizAttempt,
  type Exercise,
  type ExerciseSubmission,
  type SyncQueue,
  type AppSettings,
  STORE_NAMES,
} from './schema';

// ============================================================================
// Type Utilities
// ============================================================================

type StoreValue<S extends StoreName> = PlaywrightLearningDB[S]['value'];
type StoreKey<S extends StoreName> = PlaywrightLearningDB[S]['key'];

// ============================================================================
// Error Classes
// ============================================================================

export class DBError extends Error {
  constructor(
    message: string,
    public code: string,
    public store?: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'DBError';
  }
}

export class ValidationError extends DBError {
  constructor(message: string, store?: string) {
    super(message, 'VALIDATION_ERROR', store);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends DBError {
  constructor(id: string, store: string) {
    super(`Entity with id ${id} not found in ${store}`, 'NOT_FOUND', store);
    this.name = 'NotFoundError';
  }
}

export class DuplicateError extends DBError {
  constructor(id: string, store: string) {
    super(`Entity with id ${id} already exists in ${store}`, 'DUPLICATE', store);
    this.name = 'DuplicateError';
  }
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate common entity fields
 */
function validateEntity(entity: any, storeName: string): void {
  if (!entity) {
    throw new ValidationError('Entity cannot be null or undefined', storeName);
  }

  if (!entity.id || typeof entity.id !== 'string') {
    throw new ValidationError('Entity must have a valid id', storeName);
  }
}

/**
 * Validate flashcard data
 */
export function validateFlashcard(flashcard: Partial<Flashcard>): void {
  validateEntity(flashcard, STORE_NAMES.FLASHCARDS);

  if (!flashcard.front || flashcard.front.trim().length === 0) {
    throw new ValidationError('Flashcard front cannot be empty', STORE_NAMES.FLASHCARDS);
  }

  if (!flashcard.back || flashcard.back.trim().length === 0) {
    throw new ValidationError('Flashcard back cannot be empty', STORE_NAMES.FLASHCARDS);
  }

  if (flashcard.easinessFactor !== undefined && (flashcard.easinessFactor < 1.3 || flashcard.easinessFactor > 2.5)) {
    throw new ValidationError('Easiness factor must be between 1.3 and 2.5', STORE_NAMES.FLASHCARDS);
  }

  if (flashcard.interval !== undefined && flashcard.interval < 0) {
    throw new ValidationError('Interval cannot be negative', STORE_NAMES.FLASHCARDS);
  }
}

/**
 * Validate lesson data
 */
export function validateLesson(lesson: Partial<Lesson>): void {
  validateEntity(lesson, STORE_NAMES.LESSONS);

  if (!lesson.title || lesson.title.trim().length === 0) {
    throw new ValidationError('Lesson title cannot be empty', STORE_NAMES.LESSONS);
  }

  if (!lesson.content || lesson.content.trim().length === 0) {
    throw new ValidationError('Lesson content cannot be empty', STORE_NAMES.LESSONS);
  }

  if (lesson.estimatedTime !== undefined && lesson.estimatedTime < 0) {
    throw new ValidationError('Estimated time cannot be negative', STORE_NAMES.LESSONS);
  }
}

/**
 * Validate progress data
 */
export function validateProgress(progress: Partial<Progress>): void {
  validateEntity(progress, STORE_NAMES.PROGRESS);

  if (!progress.userId) {
    throw new ValidationError('Progress must have a userId', STORE_NAMES.PROGRESS);
  }

  if (!progress.entityId) {
    throw new ValidationError('Progress must have an entityId', STORE_NAMES.PROGRESS);
  }

  if (!progress.entityType) {
    throw new ValidationError('Progress must have an entityType', STORE_NAMES.PROGRESS);
  }

  if (progress.progressPercentage !== undefined && (progress.progressPercentage < 0 || progress.progressPercentage > 100)) {
    throw new ValidationError('Progress percentage must be between 0 and 100', STORE_NAMES.PROGRESS);
  }
}

// ============================================================================
// Generic CRUD Operations
// ============================================================================

/**
 * Add a new entity to a store
 */
export async function add<S extends StoreName>(
  storeName: S,
  entity: StoreValue<S>
): Promise<StoreKey<S>> {
  try {
    const db = await openDatabase();

    // Check for duplicates
    const existing = await db.get(storeName, (entity as any).id);
    if (existing) {
      throw new DuplicateError((entity as any).id, storeName);
    }

    const key = await db.add(storeName, entity);
    return key;
  } catch (error) {
    if (error instanceof DBError) throw error;
    throw new DBError(
      `Failed to add entity to ${storeName}`,
      'ADD_ERROR',
      storeName,
      error as Error
    );
  }
}

/**
 * Get an entity by its key
 */
export async function get<S extends StoreName>(
  storeName: S,
  key: StoreKey<S>
): Promise<StoreValue<S> | undefined> {
  try {
    const db = await openDatabase();
    return await db.get(storeName, key);
  } catch (error) {
    throw new DBError(
      `Failed to get entity from ${storeName}`,
      'GET_ERROR',
      storeName,
      error as Error
    );
  }
}

/**
 * Get an entity by its key (throws if not found)
 */
export async function getOrThrow<S extends StoreName>(
  storeName: S,
  key: StoreKey<S>
): Promise<StoreValue<S>> {
  const entity = await get(storeName, key);
  if (!entity) {
    throw new NotFoundError(key as string, storeName);
  }
  return entity;
}

/**
 * Get all entities from a store
 */
export async function getAll<S extends StoreName>(
  storeName: S
): Promise<StoreValue<S>[]> {
  try {
    const db = await openDatabase();
    return await db.getAll(storeName);
  } catch (error) {
    throw new DBError(
      `Failed to get all entities from ${storeName}`,
      'GET_ALL_ERROR',
      storeName,
      error as Error
    );
  }
}

/**
 * Update an entity (must exist)
 */
export async function update<S extends StoreName>(
  storeName: S,
  entity: StoreValue<S>
): Promise<StoreKey<S>> {
  try {
    const db = await openDatabase();

    // Verify entity exists
    const existing = await db.get(storeName, (entity as any).id);
    if (!existing) {
      throw new NotFoundError((entity as any).id, storeName);
    }

    // Update version and timestamp
    const updatedEntity = {
      ...entity,
      updatedAt: new Date(),
      version: ((existing as any).version || 0) + 1,
    } as StoreValue<S>;

    const key = await db.put(storeName, updatedEntity);
    return key;
  } catch (error) {
    if (error instanceof DBError) throw error;
    throw new DBError(
      `Failed to update entity in ${storeName}`,
      'UPDATE_ERROR',
      storeName,
      error as Error
    );
  }
}

/**
 * Put an entity (add or update)
 */
export async function put<S extends StoreName>(
  storeName: S,
  entity: StoreValue<S>
): Promise<StoreKey<S>> {
  try {
    const db = await openDatabase();
    const key = await db.put(storeName, entity);
    return key;
  } catch (error) {
    throw new DBError(
      `Failed to put entity in ${storeName}`,
      'PUT_ERROR',
      storeName,
      error as Error
    );
  }
}

/**
 * Delete an entity by key
 */
export async function remove<S extends StoreName>(
  storeName: S,
  key: StoreKey<S>
): Promise<void> {
  try {
    const db = await openDatabase();

    // Verify entity exists
    const existing = await db.get(storeName, key);
    if (!existing) {
      throw new NotFoundError(key as string, storeName);
    }

    await db.delete(storeName, key);
  } catch (error) {
    if (error instanceof DBError) throw error;
    throw new DBError(
      `Failed to delete entity from ${storeName}`,
      'DELETE_ERROR',
      storeName,
      error as Error
    );
  }
}

/**
 * Delete multiple entities by keys
 */
export async function removeMany<S extends StoreName>(
  storeName: S,
  keys: StoreKey<S>[]
): Promise<void> {
  try {
    const db = await openDatabase();
    const tx = db.transaction(storeName, 'readwrite');

    await Promise.all([
      ...keys.map(key => tx.store.delete(key)),
      tx.done,
    ]);
  } catch (error) {
    throw new DBError(
      `Failed to delete multiple entities from ${storeName}`,
      'DELETE_MANY_ERROR',
      storeName,
      error as Error
    );
  }
}

/**
 * Clear all entities from a store
 */
export async function clear<S extends StoreName>(storeName: S): Promise<void> {
  try {
    const db = await openDatabase();
    await db.clear(storeName);
  } catch (error) {
    throw new DBError(
      `Failed to clear ${storeName}`,
      'CLEAR_ERROR',
      storeName,
      error as Error
    );
  }
}

/**
 * Count entities in a store
 */
export async function count<S extends StoreName>(storeName: S): Promise<number> {
  try {
    const db = await openDatabase();
    return await db.count(storeName);
  } catch (error) {
    throw new DBError(
      `Failed to count entities in ${storeName}`,
      'COUNT_ERROR',
      storeName,
      error as Error
    );
  }
}

// ============================================================================
// Flashcards Operations
// ============================================================================

export const flashcardOps = {
  /**
   * Add a new flashcard
   */
  async add(flashcard: Flashcard): Promise<string> {
    validateFlashcard(flashcard);
    return await add(STORE_NAMES.FLASHCARDS, flashcard);
  },

  /**
   * Get flashcard by ID
   */
  async get(id: string): Promise<Flashcard | undefined> {
    return await get(STORE_NAMES.FLASHCARDS, id);
  },

  /**
   * Update flashcard
   */
  async update(flashcard: Flashcard): Promise<string> {
    validateFlashcard(flashcard);
    return await update(STORE_NAMES.FLASHCARDS, flashcard);
  },

  /**
   * Delete flashcard
   */
  async delete(id: string): Promise<void> {
    return await remove(STORE_NAMES.FLASHCARDS, id);
  },

  /**
   * Get all flashcards
   */
  async getAll(): Promise<Flashcard[]> {
    return await getAll(STORE_NAMES.FLASHCARDS);
  },

  /**
   * Get flashcards by category
   */
  async getByCategory(category: string): Promise<Flashcard[]> {
    const db = await openDatabase();
    return await db.getAllFromIndex(STORE_NAMES.FLASHCARDS, 'by-category', category);
  },

  /**
   * Get due flashcards for review
   */
  async getDueCards(beforeDate: Date = new Date()): Promise<Flashcard[]> {
    const db = await openDatabase();
    const range = IDBKeyRange.upperBound(beforeDate);
    return await db.getAllFromIndex(STORE_NAMES.FLASHCARDS, 'by-next-review', range);
  },

  /**
   * Get pending sync flashcards
   */
  async getPendingSync(): Promise<Flashcard[]> {
    const db = await openDatabase();
    return await db.getAllFromIndex(STORE_NAMES.FLASHCARDS, 'by-sync-status', 'pending');
  },

  /**
   * Bulk add flashcards
   */
  async bulkAdd(flashcards: Flashcard[]): Promise<void> {
    flashcards.forEach(card => validateFlashcard(card));
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAMES.FLASHCARDS, 'readwrite');

    await Promise.all([
      ...flashcards.map(card => tx.store.add(card)),
      tx.done,
    ]);
  },
};

// ============================================================================
// Lessons Operations
// ============================================================================

export const lessonOps = {
  /**
   * Add a new lesson
   */
  async add(lesson: Lesson): Promise<string> {
    validateLesson(lesson);
    return await add(STORE_NAMES.LESSONS, lesson);
  },

  /**
   * Get lesson by ID
   */
  async get(id: string): Promise<Lesson | undefined> {
    return await get(STORE_NAMES.LESSONS, id);
  },

  /**
   * Get lesson by slug
   */
  async getBySlug(slug: string): Promise<Lesson | undefined> {
    const db = await openDatabase();
    return await db.getFromIndex(STORE_NAMES.LESSONS, 'by-slug', slug);
  },

  /**
   * Update lesson
   */
  async update(lesson: Lesson): Promise<string> {
    validateLesson(lesson);
    return await update(STORE_NAMES.LESSONS, lesson);
  },

  /**
   * Delete lesson
   */
  async delete(id: string): Promise<void> {
    return await remove(STORE_NAMES.LESSONS, id);
  },

  /**
   * Get all lessons
   */
  async getAll(): Promise<Lesson[]> {
    return await getAll(STORE_NAMES.LESSONS);
  },

  /**
   * Get lessons by module
   */
  async getByModule(moduleId: string): Promise<Lesson[]> {
    const db = await openDatabase();
    return await db.getAllFromIndex(STORE_NAMES.LESSONS, 'by-module', moduleId);
  },

  /**
   * Get lessons by track
   */
  async getByTrack(track: '30-day' | '60-day' | 'both'): Promise<Lesson[]> {
    const db = await openDatabase();
    return await db.getAllFromIndex(STORE_NAMES.LESSONS, 'by-track', track);
  },

  /**
   * Get lessons by week
   */
  async getByWeek(week: number): Promise<Lesson[]> {
    const db = await openDatabase();
    return await db.getAllFromIndex(STORE_NAMES.LESSONS, 'by-week', week);
  },

  /**
   * Bulk add lessons
   */
  async bulkAdd(lessons: Lesson[]): Promise<void> {
    lessons.forEach(lesson => validateLesson(lesson));
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAMES.LESSONS, 'readwrite');

    await Promise.all([
      ...lessons.map(lesson => tx.store.add(lesson)),
      tx.done,
    ]);
  },
};

// ============================================================================
// Progress Operations
// ============================================================================

export const progressOps = {
  /**
   * Add new progress entry
   */
  async add(progress: Progress): Promise<string> {
    validateProgress(progress);
    return await add(STORE_NAMES.PROGRESS, progress);
  },

  /**
   * Get progress by ID
   */
  async get(id: string): Promise<Progress | undefined> {
    return await get(STORE_NAMES.PROGRESS, id);
  },

  /**
   * Get progress for a specific user and entity
   */
  async getByUserAndEntity(
    userId: string,
    entityType: Progress['entityType'],
    entityId: string
  ): Promise<Progress | undefined> {
    const db = await openDatabase();
    return await db.getFromIndex(
      STORE_NAMES.PROGRESS,
      'by-user-entity',
      [userId, entityType, entityId]
    );
  },

  /**
   * Update progress
   */
  async update(progress: Progress): Promise<string> {
    validateProgress(progress);
    return await update(STORE_NAMES.PROGRESS, progress);
  },

  /**
   * Update or create progress
   */
  async upsert(progress: Progress): Promise<string> {
    validateProgress(progress);
    return await put(STORE_NAMES.PROGRESS, progress);
  },

  /**
   * Delete progress
   */
  async delete(id: string): Promise<void> {
    return await remove(STORE_NAMES.PROGRESS, id);
  },

  /**
   * Get all progress entries
   */
  async getAll(): Promise<Progress[]> {
    return await getAll(STORE_NAMES.PROGRESS);
  },

  /**
   * Get progress by status
   */
  async getByStatus(status: Progress['status']): Promise<Progress[]> {
    const db = await openDatabase();
    return await db.getAllFromIndex(STORE_NAMES.PROGRESS, 'by-status', status);
  },

  /**
   * Get recently accessed progress
   */
  async getRecentlyAccessed(limit: number = 10): Promise<Progress[]> {
    const db = await openDatabase();
    const all = await db.getAllFromIndex(STORE_NAMES.PROGRESS, 'by-last-accessed');
    return all.reverse().slice(0, limit);
  },
};

// ============================================================================
// Quiz Operations
// ============================================================================

export const quizOps = {
  /**
   * Add a new quiz
   */
  async add(quiz: Quiz): Promise<string> {
    return await add(STORE_NAMES.QUIZZES, quiz);
  },

  /**
   * Get quiz by ID
   */
  async get(id: string): Promise<Quiz | undefined> {
    return await get(STORE_NAMES.QUIZZES, id);
  },

  /**
   * Update quiz
   */
  async update(quiz: Quiz): Promise<string> {
    return await update(STORE_NAMES.QUIZZES, quiz);
  },

  /**
   * Delete quiz
   */
  async delete(id: string): Promise<void> {
    return await remove(STORE_NAMES.QUIZZES, id);
  },

  /**
   * Get all quizzes
   */
  async getAll(): Promise<Quiz[]> {
    return await getAll(STORE_NAMES.QUIZZES);
  },

  /**
   * Get quizzes by lesson
   */
  async getByLesson(lessonId: string): Promise<Quiz[]> {
    const db = await openDatabase();
    return await db.getAllFromIndex(STORE_NAMES.QUIZZES, 'by-lesson', lessonId);
  },
};

// ============================================================================
// Quiz Attempt Operations
// ============================================================================

export const quizAttemptOps = {
  /**
   * Add a new quiz attempt
   */
  async add(attempt: QuizAttempt): Promise<string> {
    return await add(STORE_NAMES.QUIZ_ATTEMPTS, attempt);
  },

  /**
   * Get quiz attempt by ID
   */
  async get(id: string): Promise<QuizAttempt | undefined> {
    return await get(STORE_NAMES.QUIZ_ATTEMPTS, id);
  },

  /**
   * Get all attempts for a user and quiz
   */
  async getByUserAndQuiz(userId: string, quizId: string): Promise<QuizAttempt[]> {
    const db = await openDatabase();
    return await db.getAllFromIndex(
      STORE_NAMES.QUIZ_ATTEMPTS,
      'by-user-quiz',
      [userId, quizId]
    );
  },

  /**
   * Get best attempt for a user and quiz
   */
  async getBestAttempt(userId: string, quizId: string): Promise<QuizAttempt | undefined> {
    const attempts = await this.getByUserAndQuiz(userId, quizId);
    if (attempts.length === 0) return undefined;

    return attempts.reduce((best, current) =>
      current.score > best.score ? current : best
    );
  },
};

// ============================================================================
// Exercise Operations
// ============================================================================

export const exerciseOps = {
  /**
   * Add a new exercise
   */
  async add(exercise: Exercise): Promise<string> {
    return await add(STORE_NAMES.EXERCISES, exercise);
  },

  /**
   * Get exercise by ID
   */
  async get(id: string): Promise<Exercise | undefined> {
    return await get(STORE_NAMES.EXERCISES, id);
  },

  /**
   * Update exercise
   */
  async update(exercise: Exercise): Promise<string> {
    return await update(STORE_NAMES.EXERCISES, exercise);
  },

  /**
   * Delete exercise
   */
  async delete(id: string): Promise<void> {
    return await remove(STORE_NAMES.EXERCISES, id);
  },

  /**
   * Get all exercises
   */
  async getAll(): Promise<Exercise[]> {
    return await getAll(STORE_NAMES.EXERCISES);
  },

  /**
   * Get exercises by lesson
   */
  async getByLesson(lessonId: string): Promise<Exercise[]> {
    const db = await openDatabase();
    return await db.getAllFromIndex(STORE_NAMES.EXERCISES, 'by-lesson', lessonId);
  },

  /**
   * Get exercises by language
   */
  async getByLanguage(language: string): Promise<Exercise[]> {
    const db = await openDatabase();
    return await db.getAllFromIndex(STORE_NAMES.EXERCISES, 'by-language', language);
  },
};

// ============================================================================
// Exercise Submission Operations
// ============================================================================

export const exerciseSubmissionOps = {
  /**
   * Add a new submission
   */
  async add(submission: ExerciseSubmission): Promise<string> {
    return await add(STORE_NAMES.EXERCISE_SUBMISSIONS, submission);
  },

  /**
   * Get submission by ID
   */
  async get(id: string): Promise<ExerciseSubmission | undefined> {
    return await get(STORE_NAMES.EXERCISE_SUBMISSIONS, id);
  },

  /**
   * Get all submissions for a user and exercise
   */
  async getByUserAndExercise(userId: string, exerciseId: string): Promise<ExerciseSubmission[]> {
    const db = await openDatabase();
    return await db.getAllFromIndex(
      STORE_NAMES.EXERCISE_SUBMISSIONS,
      'by-user-exercise',
      [userId, exerciseId]
    );
  },

  /**
   * Get best submission for a user and exercise
   */
  async getBestSubmission(userId: string, exerciseId: string): Promise<ExerciseSubmission | undefined> {
    const submissions = await this.getByUserAndExercise(userId, exerciseId);
    if (submissions.length === 0) return undefined;

    return submissions.reduce((best, current) =>
      current.score > best.score ? current : best
    );
  },
};

// ============================================================================
// Settings Operations
// ============================================================================

export const settingsOps = {
  /**
   * Get app settings
   */
  async get(): Promise<AppSettings | undefined> {
    return await get(STORE_NAMES.SETTINGS, 'settings');
  },

  /**
   * Update app settings
   */
  async update(settings: AppSettings): Promise<string> {
    return await put(STORE_NAMES.SETTINGS, { ...settings, id: 'settings' });
  },

  /**
   * Get or create default settings
   */
  async getOrDefault(): Promise<AppSettings> {
    const settings = await this.get();
    if (settings) return settings;

    const defaultSettings: AppSettings = {
      id: 'settings',
      theme: 'auto',
      notifications: {
        enabled: true,
        reviewReminders: true,
        achievementAlerts: true,
        soundEffects: false,
      },
      study: {
        dailyReviewLimit: 50,
        autoPlayNext: true,
        showHints: true,
      },
      privacy: {
        analyticsEnabled: true,
        shareProgress: true,
      },
      lastUpdated: new Date(),
    };

    await this.update(defaultSettings);
    return defaultSettings;
  },
};

// ============================================================================
// Export all operations
// ============================================================================

export const db = {
  flashcards: flashcardOps,
  lessons: lessonOps,
  progress: progressOps,
  quizzes: quizOps,
  quizAttempts: quizAttemptOps,
  exercises: exerciseOps,
  exerciseSubmissions: exerciseSubmissionOps,
  settings: settingsOps,
};
