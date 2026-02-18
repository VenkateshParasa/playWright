/**
 * IndexedDB Integration Tests
 * Comprehensive tests for database operations, sync, migration, and utilities
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  openDatabase,
  closeDatabase,
  deleteDatabase,
  DB_NAME,
  STORE_NAMES,
  type Flashcard,
  type Lesson,
  type Progress,
  type Quiz,
} from '../schema';
import {
  db,
  flashcardOps,
  lessonOps,
  progressOps,
  validateFlashcard,
  validateLesson,
  validateProgress,
  ValidationError,
  NotFoundError,
  DuplicateError,
} from '../operations';
import {
  syncManager,
  syncQueue,
  conflictResolver,
  SyncQueueManager,
  ConflictResolver,
} from '../sync';
import {
  migrationManager,
  DataMigrationUtils,
} from '../migration';
import {
  exportDatabase,
  importDatabase,
  getCacheStats,
  clearCache,
  getStorageEstimate,
  healthCheck,
} from '../utils';

// ============================================================================
// Test Utilities
// ============================================================================

function createMockFlashcard(id: string): Flashcard {
  return {
    id,
    front: `Front ${id}`,
    back: `Back ${id}`,
    category: 'testing',
    tags: ['test', 'mock'],
    difficulty: 'medium',
    easinessFactor: 2.5,
    interval: 1,
    repetitions: 0,
    nextReviewDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    syncStatus: 'synced',
    version: 1,
  };
}

function createMockLesson(id: string): Lesson {
  return {
    id,
    title: `Lesson ${id}`,
    slug: `lesson-${id}`,
    description: 'Test lesson',
    content: '# Test Content',
    moduleId: 'module-1',
    week: 1,
    order: 1,
    track: '30-day',
    difficulty: 'beginner',
    estimatedTime: 30,
    tags: ['test'],
    prerequisites: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    syncStatus: 'synced',
    version: 1,
  };
}

function createMockProgress(id: string, userId: string, entityId: string): Progress {
  return {
    id,
    userId,
    entityType: 'lesson',
    entityId,
    status: 'in-progress',
    progressPercentage: 50,
    timeSpent: 300,
    lastAccessedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    syncStatus: 'synced',
    version: 1,
  };
}

// ============================================================================
// Schema Tests
// ============================================================================

describe('Database Schema', () => {
  beforeEach(async () => {
    await deleteDatabase();
  });

  afterEach(async () => {
    closeDatabase();
  });

  it('should create database with correct name and version', async () => {
    const db = await openDatabase();
    expect(db.name).toBe(DB_NAME);
    expect(db.version).toBeGreaterThanOrEqual(1);
  });

  it('should create all required object stores', async () => {
    const db = await openDatabase();
    const expectedStores = Object.values(STORE_NAMES);

    for (const storeName of expectedStores) {
      expect(db.objectStoreNames.contains(storeName)).toBe(true);
    }
  });

  it('should create indexes for flashcards store', async () => {
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAMES.FLASHCARDS, 'readonly');
    const store = tx.objectStore(STORE_NAMES.FLASHCARDS);

    expect(store.indexNames.contains('by-category')).toBe(true);
    expect(store.indexNames.contains('by-next-review')).toBe(true);
    expect(store.indexNames.contains('by-sync-status')).toBe(true);
  });

  it('should create indexes for lessons store', async () => {
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAMES.LESSONS, 'readonly');
    const store = tx.objectStore(STORE_NAMES.LESSONS);

    expect(store.indexNames.contains('by-module')).toBe(true);
    expect(store.indexNames.contains('by-track')).toBe(true);
    expect(store.indexNames.contains('by-slug')).toBe(true);
  });
});

// ============================================================================
// CRUD Operations Tests
// ============================================================================

describe('Flashcard Operations', () => {
  beforeEach(async () => {
    await deleteDatabase();
    await openDatabase();
  });

  afterEach(async () => {
    closeDatabase();
  });

  describe('Create', () => {
    it('should add a new flashcard', async () => {
      const card = createMockFlashcard('card-1');
      const id = await flashcardOps.add(card);

      expect(id).toBe('card-1');

      const retrieved = await flashcardOps.get('card-1');
      expect(retrieved).toBeDefined();
      expect(retrieved?.front).toBe('Front card-1');
    });

    it('should throw error for duplicate flashcard', async () => {
      const card = createMockFlashcard('card-1');
      await flashcardOps.add(card);

      await expect(flashcardOps.add(card)).rejects.toThrow(DuplicateError);
    });

    it('should validate flashcard data', async () => {
      const invalidCard = { ...createMockFlashcard('card-1'), front: '' };

      await expect(flashcardOps.add(invalidCard)).rejects.toThrow(ValidationError);
    });

    it('should bulk add flashcards', async () => {
      const cards = [
        createMockFlashcard('card-1'),
        createMockFlashcard('card-2'),
        createMockFlashcard('card-3'),
      ];

      await flashcardOps.bulkAdd(cards);

      const all = await flashcardOps.getAll();
      expect(all.length).toBe(3);
    });
  });

  describe('Read', () => {
    it('should get flashcard by id', async () => {
      const card = createMockFlashcard('card-1');
      await flashcardOps.add(card);

      const retrieved = await flashcardOps.get('card-1');
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe('card-1');
    });

    it('should return undefined for non-existent flashcard', async () => {
      const retrieved = await flashcardOps.get('non-existent');
      expect(retrieved).toBeUndefined();
    });

    it('should get all flashcards', async () => {
      await flashcardOps.add(createMockFlashcard('card-1'));
      await flashcardOps.add(createMockFlashcard('card-2'));

      const all = await flashcardOps.getAll();
      expect(all.length).toBe(2);
    });

    it('should get flashcards by category', async () => {
      const card1 = createMockFlashcard('card-1');
      card1.category = 'javascript';
      const card2 = createMockFlashcard('card-2');
      card2.category = 'typescript';

      await flashcardOps.add(card1);
      await flashcardOps.add(card2);

      const jsCards = await flashcardOps.getByCategory('javascript');
      expect(jsCards.length).toBe(1);
      expect(jsCards[0].id).toBe('card-1');
    });

    it('should get due flashcards', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const dueCard = createMockFlashcard('card-1');
      dueCard.nextReviewDate = pastDate;

      const notDueCard = createMockFlashcard('card-2');
      notDueCard.nextReviewDate = futureDate;

      await flashcardOps.add(dueCard);
      await flashcardOps.add(notDueCard);

      const dueCards = await flashcardOps.getDueCards();
      expect(dueCards.length).toBe(1);
      expect(dueCards[0].id).toBe('card-1');
    });
  });

  describe('Update', () => {
    it('should update a flashcard', async () => {
      const card = createMockFlashcard('card-1');
      await flashcardOps.add(card);

      const updated = { ...card, front: 'Updated Front' };
      await flashcardOps.update(updated);

      const retrieved = await flashcardOps.get('card-1');
      expect(retrieved?.front).toBe('Updated Front');
      expect(retrieved?.version).toBe(2);
    });

    it('should throw error when updating non-existent flashcard', async () => {
      const card = createMockFlashcard('non-existent');
      await expect(flashcardOps.update(card)).rejects.toThrow(NotFoundError);
    });
  });

  describe('Delete', () => {
    it('should delete a flashcard', async () => {
      const card = createMockFlashcard('card-1');
      await flashcardOps.add(card);

      await flashcardOps.delete('card-1');

      const retrieved = await flashcardOps.get('card-1');
      expect(retrieved).toBeUndefined();
    });

    it('should throw error when deleting non-existent flashcard', async () => {
      await expect(flashcardOps.delete('non-existent')).rejects.toThrow(NotFoundError);
    });
  });
});

describe('Lesson Operations', () => {
  beforeEach(async () => {
    await deleteDatabase();
    await openDatabase();
  });

  afterEach(async () => {
    closeDatabase();
  });

  it('should add and retrieve a lesson', async () => {
    const lesson = createMockLesson('lesson-1');
    await lessonOps.add(lesson);

    const retrieved = await lessonOps.get('lesson-1');
    expect(retrieved).toBeDefined();
    expect(retrieved?.title).toBe('Lesson lesson-1');
  });

  it('should get lesson by slug', async () => {
    const lesson = createMockLesson('lesson-1');
    await lessonOps.add(lesson);

    const retrieved = await lessonOps.getBySlug('lesson-lesson-1');
    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe('lesson-1');
  });

  it('should get lessons by module', async () => {
    const lesson1 = createMockLesson('lesson-1');
    lesson1.moduleId = 'module-1';
    const lesson2 = createMockLesson('lesson-2');
    lesson2.moduleId = 'module-2';

    await lessonOps.add(lesson1);
    await lessonOps.add(lesson2);

    const module1Lessons = await lessonOps.getByModule('module-1');
    expect(module1Lessons.length).toBe(1);
    expect(module1Lessons[0].id).toBe('lesson-1');
  });

  it('should get lessons by track', async () => {
    const lesson1 = createMockLesson('lesson-1');
    lesson1.track = '30-day';
    const lesson2 = createMockLesson('lesson-2');
    lesson2.track = '60-day';

    await lessonOps.add(lesson1);
    await lessonOps.add(lesson2);

    const track30Lessons = await lessonOps.getByTrack('30-day');
    expect(track30Lessons.length).toBe(1);
    expect(track30Lessons[0].id).toBe('lesson-1');
  });
});

describe('Progress Operations', () => {
  beforeEach(async () => {
    await deleteDatabase();
    await openDatabase();
  });

  afterEach(async () => {
    closeDatabase();
  });

  it('should track progress for a lesson', async () => {
    const progress = createMockProgress('progress-1', 'user-1', 'lesson-1');
    await progressOps.add(progress);

    const retrieved = await progressOps.get('progress-1');
    expect(retrieved).toBeDefined();
    expect(retrieved?.progressPercentage).toBe(50);
  });

  it('should get progress by user and entity', async () => {
    const progress = createMockProgress('progress-1', 'user-1', 'lesson-1');
    await progressOps.add(progress);

    const retrieved = await progressOps.getByUserAndEntity('user-1', 'lesson', 'lesson-1');
    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe('progress-1');
  });

  it('should upsert progress', async () => {
    const progress = createMockProgress('progress-1', 'user-1', 'lesson-1');
    await progressOps.upsert(progress);

    const updated = { ...progress, progressPercentage: 100 };
    await progressOps.upsert(updated);

    const retrieved = await progressOps.get('progress-1');
    expect(retrieved?.progressPercentage).toBe(100);
  });

  it('should get progress by status', async () => {
    const progress1 = createMockProgress('progress-1', 'user-1', 'lesson-1');
    progress1.status = 'completed';
    const progress2 = createMockProgress('progress-2', 'user-1', 'lesson-2');
    progress2.status = 'in-progress';

    await progressOps.add(progress1);
    await progressOps.add(progress2);

    const completed = await progressOps.getByStatus('completed');
    expect(completed.length).toBe(1);
    expect(completed[0].id).toBe('progress-1');
  });
});

// ============================================================================
// Sync Tests
// ============================================================================

describe('Sync Queue Manager', () => {
  let queueManager: SyncQueueManager;

  beforeEach(async () => {
    await deleteDatabase();
    await openDatabase();
    queueManager = new SyncQueueManager();
  });

  afterEach(async () => {
    closeDatabase();
  });

  it('should enqueue sync operations', async () => {
    const id = await queueManager.enqueue('flashcards', 'create', 'card-1', {});
    expect(id).toBeDefined();

    const pending = await queueManager.getPending();
    expect(pending.length).toBe(1);
  });

  it('should mark operation as processing', async () => {
    const id = await queueManager.enqueue('flashcards', 'create', 'card-1', {});
    await queueManager.markAsProcessing(id);

    const pending = await queueManager.getPending();
    expect(pending.length).toBe(0);
  });

  it('should mark operation as completed', async () => {
    const id = await queueManager.enqueue('flashcards', 'create', 'card-1', {});
    await queueManager.markAsCompleted(id);

    const stats = await queueManager.getStats();
    expect(stats.completed).toBe(1);
  });

  it('should mark operation as failed', async () => {
    const id = await queueManager.enqueue('flashcards', 'create', 'card-1', {});
    await queueManager.markAsFailed(id, 'Test error');

    const failed = await queueManager.getFailed();
    expect(failed.length).toBe(1);
    expect(failed[0].error).toBe('Test error');
  });

  it('should retry failed operations', async () => {
    const id = await queueManager.enqueue('flashcards', 'create', 'card-1', {});
    await queueManager.markAsFailed(id, 'Test error');
    await queueManager.retry(id);

    const pending = await queueManager.getPending();
    expect(pending.length).toBe(1);
  });

  it('should get sync queue statistics', async () => {
    await queueManager.enqueue('flashcards', 'create', 'card-1', {});
    await queueManager.enqueue('flashcards', 'update', 'card-2', {});

    const stats = await queueManager.getStats();
    expect(stats.pending).toBe(2);
    expect(stats.total).toBe(2);
  });
});

describe('Conflict Resolver', () => {
  let resolver: ConflictResolver;

  beforeEach(() => {
    resolver = new ConflictResolver();
  });

  it('should resolve conflict using server-wins strategy', () => {
    const local = createMockFlashcard('card-1');
    local.front = 'Local Front';

    const server = createMockFlashcard('card-1');
    server.front = 'Server Front';

    const resolved = resolver.serverWins(local, server);
    expect(resolved.front).toBe('Server Front');
    expect(resolved.syncStatus).toBe('synced');
  });

  it('should resolve conflict using client-wins strategy', () => {
    const local = createMockFlashcard('card-1');
    local.front = 'Local Front';

    const server = createMockFlashcard('card-1');
    server.front = 'Server Front';

    const resolved = resolver.clientWins(local, server);
    expect(resolved.front).toBe('Local Front');
    expect(resolved.syncStatus).toBe('synced');
  });

  it('should detect conflicts', () => {
    const local = createMockFlashcard('card-1');
    local.version = 2;
    local.updatedAt = new Date();
    local.lastSyncedAt = new Date(Date.now() - 10000);

    const server = createMockFlashcard('card-1');
    server.version = 3;
    server.updatedAt = new Date();

    const hasConflict = resolver.hasConflict(local, server);
    expect(hasConflict).toBe(true);
  });

  it('should merge progress with cumulative data', () => {
    const local = createMockProgress('progress-1', 'user-1', 'lesson-1');
    local.progressPercentage = 60;
    local.timeSpent = 300;

    const server = createMockProgress('progress-1', 'user-1', 'lesson-1');
    server.progressPercentage = 50;
    server.timeSpent = 400;

    const resolved = resolver['mergeProgress'](local, server);
    expect(resolved.progressPercentage).toBe(60); // Max
    expect(resolved.timeSpent).toBe(400); // Max
  });
});

// ============================================================================
// Migration Tests
// ============================================================================

describe('Migration Manager', () => {
  beforeEach(async () => {
    await deleteDatabase();
  });

  afterEach(async () => {
    closeDatabase();
  });

  it('should get current database version', async () => {
    await openDatabase();
    const version = await migrationManager.getCurrentVersion();
    expect(version).toBeGreaterThanOrEqual(1);
  });

  it('should verify database integrity', async () => {
    await openDatabase();
    const integrity = await migrationManager.verifyIntegrity();
    expect(integrity.valid).toBe(true);
    expect(integrity.errors.length).toBe(0);
  });

  it('should create and restore backup', async () => {
    await openDatabase();

    // Add some data
    const card = createMockFlashcard('card-1');
    await flashcardOps.add(card);

    // Create backup
    const backup = await migrationManager.createBackup();
    expect(backup).toBeDefined();
    expect(backup.stores).toContain('flashcards');

    // Delete data
    await flashcardOps.delete('card-1');
    let retrieved = await flashcardOps.get('card-1');
    expect(retrieved).toBeUndefined();

    // Restore backup
    await migrationManager.restoreFromBackup();
    retrieved = await flashcardOps.get('card-1');
    expect(retrieved).toBeDefined();
  });

  it('should get backup metadata', async () => {
    await openDatabase();
    await migrationManager.createBackup();

    const metadata = migrationManager.getBackupMetadata();
    expect(metadata).toBeDefined();
    expect(metadata?.version).toBeGreaterThanOrEqual(1);
  });
});

// ============================================================================
// Utility Tests
// ============================================================================

describe('Database Export/Import', () => {
  beforeEach(async () => {
    await deleteDatabase();
    await openDatabase();
  });

  afterEach(async () => {
    closeDatabase();
  });

  it('should export database', async () => {
    // Add test data
    await flashcardOps.add(createMockFlashcard('card-1'));
    await lessonOps.add(createMockLesson('lesson-1'));

    const exported = await exportDatabase();
    expect(exported.version).toBeGreaterThanOrEqual(1);
    expect(exported.stores.flashcards.length).toBe(1);
    expect(exported.stores.lessons.length).toBe(1);
  });

  it('should import database', async () => {
    // Create export data
    const exportData = await exportDatabase();
    exportData.stores.flashcards = [createMockFlashcard('card-1')];

    // Clear and import
    await clearCache();
    const result = await importDatabase(exportData, { clearExisting: true });

    expect(result.success).toBe(true);
    expect(result.imported).toBeGreaterThan(0);

    const cards = await flashcardOps.getAll();
    expect(cards.length).toBe(1);
  });
});

describe('Cache Management', () => {
  beforeEach(async () => {
    await deleteDatabase();
    await openDatabase();
  });

  afterEach(async () => {
    closeDatabase();
  });

  it('should get cache statistics', async () => {
    await flashcardOps.add(createMockFlashcard('card-1'));
    await flashcardOps.add(createMockFlashcard('card-2'));

    const stats = await getCacheStats();
    expect(stats.totalRecords).toBeGreaterThan(0);
    expect(stats.storesRecords.flashcards).toBe(2);
  });

  it('should clear cache', async () => {
    await flashcardOps.add(createMockFlashcard('card-1'));
    await lessonOps.add(createMockLesson('lesson-1'));

    await clearCache();

    const cards = await flashcardOps.getAll();
    const lessons = await lessonOps.getAll();

    expect(cards.length).toBe(0);
    expect(lessons.length).toBe(0);
  });

  it('should perform health check', async () => {
    const health = await healthCheck();
    expect(health.healthy).toBe(true);
    expect(health.stores.length).toBeGreaterThan(0);
  });
});

describe('Storage Management', () => {
  it('should get storage estimate', async () => {
    const estimate = await getStorageEstimate();
    expect(estimate).toBeDefined();
    expect(estimate.usage).toBeGreaterThanOrEqual(0);
    expect(estimate.quota).toBeGreaterThanOrEqual(0);
  });
});

// ============================================================================
// Validation Tests
// ============================================================================

describe('Data Validation', () => {
  it('should validate flashcard with missing front', () => {
    const card = createMockFlashcard('card-1');
    card.front = '';

    expect(() => validateFlashcard(card)).toThrow(ValidationError);
  });

  it('should validate flashcard with missing back', () => {
    const card = createMockFlashcard('card-1');
    card.back = '';

    expect(() => validateFlashcard(card)).toThrow(ValidationError);
  });

  it('should validate flashcard with invalid easiness factor', () => {
    const card = createMockFlashcard('card-1');
    card.easinessFactor = 3.0;

    expect(() => validateFlashcard(card)).toThrow(ValidationError);
  });

  it('should validate lesson with missing title', () => {
    const lesson = createMockLesson('lesson-1');
    lesson.title = '';

    expect(() => validateLesson(lesson)).toThrow(ValidationError);
  });

  it('should validate progress with missing userId', () => {
    const progress = createMockProgress('progress-1', '', 'lesson-1');

    expect(() => validateProgress(progress)).toThrow(ValidationError);
  });

  it('should validate progress with invalid percentage', () => {
    const progress = createMockProgress('progress-1', 'user-1', 'lesson-1');
    progress.progressPercentage = 150;

    expect(() => validateProgress(progress)).toThrow(ValidationError);
  });
});

// ============================================================================
// Integration Tests
// ============================================================================

describe('End-to-End Integration', () => {
  beforeEach(async () => {
    await deleteDatabase();
    await openDatabase();
  });

  afterEach(async () => {
    closeDatabase();
  });

  it('should handle complete flashcard workflow', async () => {
    // Create
    const card = createMockFlashcard('card-1');
    await flashcardOps.add(card);

    // Read
    let retrieved = await flashcardOps.get('card-1');
    expect(retrieved).toBeDefined();

    // Update
    retrieved!.easinessFactor = 2.3;
    await flashcardOps.update(retrieved!);

    // Verify update
    retrieved = await flashcardOps.get('card-1');
    expect(retrieved?.easinessFactor).toBe(2.3);
    expect(retrieved?.version).toBe(2);

    // Delete
    await flashcardOps.delete('card-1');
    retrieved = await flashcardOps.get('card-1');
    expect(retrieved).toBeUndefined();
  });

  it('should handle progress tracking workflow', async () => {
    // Create lesson
    const lesson = createMockLesson('lesson-1');
    await lessonOps.add(lesson);

    // Track progress
    const progress = createMockProgress('progress-1', 'user-1', 'lesson-1');
    progress.status = 'not-started';
    progress.progressPercentage = 0;
    await progressOps.add(progress);

    // Update progress
    progress.status = 'in-progress';
    progress.progressPercentage = 50;
    await progressOps.update(progress);

    // Complete
    progress.status = 'completed';
    progress.progressPercentage = 100;
    progress.completedAt = new Date();
    await progressOps.update(progress);

    // Verify
    const final = await progressOps.get('progress-1');
    expect(final?.status).toBe('completed');
    expect(final?.progressPercentage).toBe(100);
    expect(final?.completedAt).toBeDefined();
  });

  it('should handle offline sync workflow', async () => {
    const queueManager = new SyncQueueManager();

    // Create offline changes
    const card = createMockFlashcard('card-1');
    await flashcardOps.add(card);
    await queueManager.enqueue('flashcards', 'create', 'card-1', card);

    // Update offline
    card.front = 'Updated Front';
    await flashcardOps.update(card);
    await queueManager.enqueue('flashcards', 'update', 'card-1', card);

    // Check queue
    const pending = await queueManager.getPending();
    expect(pending.length).toBe(2);

    // Simulate sync
    for (const item of pending) {
      await queueManager.markAsProcessing(item.id);
      await queueManager.markAsCompleted(item.id);
    }

    const stats = await queueManager.getStats();
    expect(stats.pending).toBe(0);
    expect(stats.completed).toBe(2);
  });
});
