/**
 * IndexedDB Module Entry Point
 * Centralized exports for all database functionality
 */

// ============================================================================
// Schema & Types
// ============================================================================
export {
  // Database
  DB_NAME,
  DB_VERSION,
  openDatabase,
  getDatabase,
  closeDatabase,
  deleteDatabase,
  STORE_NAMES,

  // Types
  type PlaywrightLearningDB,
  type StoreName,
  type Flashcard,
  type Lesson,
  type Progress,
  type Quiz,
  type QuizQuestion,
  type QuizAttempt,
  type Exercise,
  type ExerciseSubmission,
  type SyncQueue,
  type AppSettings,
} from './schema';

// ============================================================================
// CRUD Operations
// ============================================================================
export {
  // Generic operations
  add,
  get,
  getOrThrow,
  getAll,
  update,
  put,
  remove,
  removeMany,
  clear,
  count,

  // Entity-specific operations
  flashcardOps,
  lessonOps,
  progressOps,
  quizOps,
  quizAttemptOps,
  exerciseOps,
  exerciseSubmissionOps,
  settingsOps,

  // Main DB interface
  db,

  // Validation
  validateFlashcard,
  validateLesson,
  validateProgress,

  // Errors
  DBError,
  ValidationError,
  NotFoundError,
  DuplicateError,
} from './operations';

// ============================================================================
// Sync & Offline Support
// ============================================================================
export {
  // Managers
  SyncManager,
  SyncQueueManager,
  ConflictResolver,
  syncManager,
  syncQueue,
  conflictResolver,

  // Types
  type SyncableEntity,
  type SyncStrategy,
  type SyncResult,
  type SyncError,
  type ConflictResolution,
  type SyncApiClient,
} from './sync';

// ============================================================================
// Migration & Versioning
// ============================================================================
export {
  // Migration manager
  MigrationManager,
  migrationManager,
  DataMigrationUtils,

  // Types
  type Migration,
  type MigrationResult,
  type BackupMetadata,

  // Migration registry
  migrations,
} from './migration';

// ============================================================================
// Utilities
// ============================================================================
export {
  // Export/Import
  exportDatabase,
  exportDatabaseToFile,
  exportStores,
  importDatabase,
  importDatabaseFromFile,

  // Cache management
  getCacheStats,
  clearCache,
  clearStores,
  clearOldData,
  resetDatabase,
  compactDatabase,

  // Storage management
  getStorageEstimate,
  hasStorageSpace,
  requestPersistentStorage,
  isStoragePersisted,

  // Health & monitoring
  healthCheck,

  // Formatting
  formatBytes,
  formatPercentage,

  // Types
  type DatabaseExport,
  type ImportResult,
  type CacheStats,
} from './utils';

// ============================================================================
// Initialization Helper
// ============================================================================

/**
 * Initialize the database with proper setup
 * Call this when your app starts
 */
export async function initializeDatabase(): Promise<void> {
  try {
    // Open database (creates schema if needed)
    await openDatabase();

    // Check for pending migrations
    const needsMigration = await migrationManager.needsMigration();
    if (needsMigration) {
      console.log('Pending migrations detected, running...');
      const result = await migrationManager.migrate();
      if (!result.success) {
        console.error('Migration failed:', result.errors);
        throw new Error('Database migration failed');
      }
      console.log('✓ Migrations completed');
    }

    // Verify integrity
    const integrity = await migrationManager.verifyIntegrity();
    if (!integrity.valid) {
      console.error('Database integrity issues:', integrity.errors);
      console.warn('Database warnings:', integrity.warnings);
    }

    // Request persistent storage
    await requestPersistentStorage();

    console.log('✓ Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

/**
 * Cleanup database resources
 * Call this when your app is closing or component unmounting
 */
export function cleanupDatabase(): void {
  closeDatabase();
  console.log('✓ Database connection closed');
}
