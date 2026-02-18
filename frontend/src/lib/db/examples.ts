/**
 * Usage Examples for IndexedDB Integration
 * Real-world examples of how to use the database in your application
 */

import {
  initializeDatabase,
  db,
  syncManager,
  exportDatabaseToFile,
  getCacheStats,
  type Flashcard,
  type Progress,
  type SyncApiClient,
} from '@/lib/db';

// ============================================================================
// Example 1: App Initialization
// ============================================================================

/**
 * Initialize database when app starts
 * Place this in your App.tsx or main entry point
 */
export async function initializeApp() {
  try {
    console.log('Initializing database...');
    await initializeDatabase();
    console.log('✓ Database ready');

    // Check storage status
    const stats = await getCacheStats();
    console.log(`Database size: ${(stats.totalSize / 1024).toFixed(2)} KB`);
    console.log(`Total records: ${stats.totalRecords}`);
  } catch (error) {
    console.error('Failed to initialize database:', error);
    // Fallback to online-only mode
  }
}

// ============================================================================
// Example 2: Flashcard Review Session
// ============================================================================

/**
 * Complete flashcard review workflow
 */
export async function reviewFlashcards(userId: string) {
  // Get due flashcards
  const dueCards = await db.flashcards.getDueCards();
  console.log(`${dueCards.length} cards due for review`);

  for (const card of dueCards) {
    // Show card to user
    // ... UI logic ...

    // User rates card (0-5)
    const rating = await getUserRating();

    // Update SRS data (implement SM-2 algorithm)
    const updatedCard = calculateNextReview(card, rating);

    // Save to database
    await db.flashcards.update(updatedCard);

    // Track progress
    await updateReviewProgress(userId, card.id);
  }

  console.log('Review session completed!');
}

function calculateNextReview(card: Flashcard, rating: number): Flashcard {
  // SM-2 algorithm implementation
  let { easinessFactor, interval, repetitions } = card;

  if (rating >= 3) {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easinessFactor);
    }
    repetitions++;
  } else {
    repetitions = 0;
    interval = 1;
  }

  easinessFactor = Math.max(
    1.3,
    easinessFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02))
  );

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return {
    ...card,
    easinessFactor,
    interval,
    repetitions,
    nextReviewDate,
    lastReviewDate: new Date(),
    updatedAt: new Date(),
    syncStatus: 'pending',
    version: card.version + 1,
  };
}

async function getUserRating(): Promise<number> {
  // Placeholder - implement actual UI
  return 4;
}

async function updateReviewProgress(userId: string, cardId: string) {
  const progress = await db.progress.getByUserAndEntity(userId, 'flashcard', cardId);

  if (progress) {
    progress.totalReviews = (progress.totalReviews || 0) + 1;
    progress.lastAccessedAt = new Date();
    await db.progress.update(progress);
  }
}

// ============================================================================
// Example 3: Lesson Progress Tracking
// ============================================================================

/**
 * Track user progress through a lesson
 */
export async function trackLessonProgress(
  userId: string,
  lessonId: string,
  percentage: number,
  timeSpent: number
) {
  // Get or create progress
  let progress = await db.progress.getByUserAndEntity(userId, 'lesson', lessonId);

  if (!progress) {
    progress = {
      id: `progress-${userId}-${lessonId}`,
      userId,
      entityType: 'lesson',
      entityId: lessonId,
      status: 'in-progress',
      progressPercentage: 0,
      timeSpent: 0,
      lastAccessedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      syncStatus: 'synced',
      version: 1,
    };
  }

  // Update progress
  progress.progressPercentage = percentage;
  progress.timeSpent += timeSpent;
  progress.lastAccessedAt = new Date();

  // Mark as completed if 100%
  if (percentage >= 100 && progress.status !== 'completed') {
    progress.status = 'completed';
    progress.completedAt = new Date();
  }

  // Save
  await db.progress.upsert(progress);

  // Track for sync
  await syncManager.trackChange('progress', 'update', progress.id, progress);

  return progress;
}

/**
 * Get user's overall progress
 */
export async function getUserProgress(userId: string) {
  const allProgress = await db.progress.getAll();
  const userProgress = allProgress.filter(p => p.userId === userId);

  const stats = {
    total: userProgress.length,
    completed: userProgress.filter(p => p.status === 'completed').length,
    inProgress: userProgress.filter(p => p.status === 'in-progress').length,
    totalTimeSpent: userProgress.reduce((sum, p) => sum + (p.timeSpent || 0), 0),
  };

  return stats;
}

// ============================================================================
// Example 4: Offline Sync
// ============================================================================

/**
 * Sync data when online
 */
export async function syncWithServer() {
  // Check if online
  if (!navigator.onLine) {
    console.log('Offline - sync skipped');
    return;
  }

  // Create API client
  const apiClient: SyncApiClient = {
    async create(storeName, entity) {
      const response = await fetch(`/api/${storeName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entity),
      });
      if (!response.ok) throw new Error('Create failed');
    },

    async update(storeName, entity) {
      const response = await fetch(`/api/${storeName}/${entity.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entity),
      });
      if (!response.ok) throw new Error('Update failed');
    },

    async delete(storeName, entityId) {
      const response = await fetch(`/api/${storeName}/${entityId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Delete failed');
    },

    async get(storeName, entityId) {
      const response = await fetch(`/api/${storeName}/${entityId}`);
      if (!response.ok) throw new Error('Get failed');
      return await response.json();
    },

    async getUpdates(storeName, since) {
      const response = await fetch(
        `/api/${storeName}/updates?since=${since.toISOString()}`
      );
      if (!response.ok) throw new Error('Get updates failed');
      return await response.json();
    },
  };

  // Sync all pending changes
  const result = await syncManager.syncAll(apiClient, 'merge');

  console.log('Sync completed:');
  console.log(`  Synced: ${result.synced}`);
  console.log(`  Failed: ${result.failed}`);
  console.log(`  Conflicts: ${result.conflicts}`);

  if (result.errors.length > 0) {
    console.error('Sync errors:', result.errors);
  }

  return result;
}

/**
 * Set up automatic sync
 */
export function setupAutoSync(intervalMinutes: number = 5) {
  // Sync on page load
  syncWithServer();

  // Sync periodically
  const intervalId = setInterval(() => {
    syncWithServer();
  }, intervalMinutes * 60 * 1000);

  // Sync when coming online
  window.addEventListener('online', () => {
    console.log('Online - triggering sync');
    syncWithServer();
  });

  // Cleanup
  return () => {
    clearInterval(intervalId);
  };
}

// ============================================================================
// Example 5: Data Export/Import
// ============================================================================

/**
 * Export user data
 */
export async function exportUserData() {
  try {
    await exportDatabaseToFile(`backup-${Date.now()}.json`);
    console.log('✓ Data exported successfully');
  } catch (error) {
    console.error('Export failed:', error);
  }
}

/**
 * Import user data from file
 */
export async function importUserData(file: File) {
  try {
    const { importDatabaseFromFile } = await import('@/lib/db');

    const result = await importDatabaseFromFile(file, {
      clearExisting: false,
      skipValidation: false,
    });

    console.log('Import completed:');
    console.log(`  Imported: ${result.imported}`);
    console.log(`  Failed: ${result.failed}`);

    if (result.errors.length > 0) {
      console.error('Import errors:', result.errors);
    }

    return result;
  } catch (error) {
    console.error('Import failed:', error);
    throw error;
  }
}

// ============================================================================
// Example 6: Cache Management
// ============================================================================

/**
 * Clear old cached lessons
 */
export async function cleanupOldLessons(daysOld: number = 30) {
  const { clearOldData } = await import('@/lib/db');

  const count = await clearOldData('lessons', daysOld);
  console.log(`Cleared ${count} old lessons`);

  return count;
}

/**
 * Check storage and cleanup if needed
 */
export async function checkAndCleanupStorage() {
  const { getStorageEstimate, clearOldData } = await import('@/lib/db');

  const estimate = await getStorageEstimate();
  console.log(`Storage used: ${estimate.percentUsed.toFixed(1)}%`);

  if (estimate.percentUsed > 80) {
    console.log('Storage getting full, cleaning up...');

    // Clear old data
    await clearOldData('flashcards', 90);
    await clearOldData('quizAttempts', 60);
    await clearOldData('exerciseSubmissions', 60);

    const newEstimate = await getStorageEstimate();
    console.log(`Storage after cleanup: ${newEstimate.percentUsed.toFixed(1)}%`);
  }
}

// ============================================================================
// Example 7: React Hook Integration
// ============================================================================

/**
 * Custom hook for flashcards
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useFlashcards(category?: string) {
  const queryClient = useQueryClient();

  const flashcards = useQuery({
    queryKey: ['flashcards', category],
    queryFn: async () => {
      if (category) {
        return await db.flashcards.getByCategory(category);
      }
      return await db.flashcards.getAll();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const dueCards = useQuery({
    queryKey: ['flashcards', 'due'],
    queryFn: () => db.flashcards.getDueCards(),
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  const addFlashcard = useMutation({
    mutationFn: (flashcard: Flashcard) => db.flashcards.add(flashcard),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
    },
  });

  const updateFlashcard = useMutation({
    mutationFn: (flashcard: Flashcard) => db.flashcards.update(flashcard),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
    },
  });

  const deleteFlashcard = useMutation({
    mutationFn: (id: string) => db.flashcards.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
    },
  });

  return {
    flashcards: flashcards.data || [],
    dueCards: dueCards.data || [],
    isLoading: flashcards.isLoading || dueCards.isLoading,
    addFlashcard: addFlashcard.mutateAsync,
    updateFlashcard: updateFlashcard.mutateAsync,
    deleteFlashcard: deleteFlashcard.mutateAsync,
  };
}

/**
 * Custom hook for lesson progress
 */
export function useLessonProgress(userId: string, lessonId: string) {
  const queryClient = useQueryClient();

  const progress = useQuery({
    queryKey: ['progress', userId, lessonId],
    queryFn: () => db.progress.getByUserAndEntity(userId, 'lesson', lessonId),
  });

  const updateProgress = useMutation({
    mutationFn: ({
      percentage,
      timeSpent,
    }: {
      percentage: number;
      timeSpent: number;
    }) => trackLessonProgress(userId, lessonId, percentage, timeSpent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress', userId] });
    },
  });

  return {
    progress: progress.data,
    isLoading: progress.isLoading,
    updateProgress: updateProgress.mutateAsync,
  };
}

// ============================================================================
// Example 8: Error Handling
// ============================================================================

/**
 * Comprehensive error handling example
 */
export async function safeAddFlashcard(flashcard: Flashcard) {
  const { ValidationError, DuplicateError, DBError } = await import('@/lib/db');

  try {
    await db.flashcards.add(flashcard);
    return { success: true, message: 'Flashcard added successfully' };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        success: false,
        message: 'Invalid flashcard data',
        details: error.message,
      };
    } else if (error instanceof DuplicateError) {
      return {
        success: false,
        message: 'Flashcard already exists',
      };
    } else if (error instanceof DBError) {
      console.error('Database error:', error.code, error.message);
      return {
        success: false,
        message: 'Database error occurred',
        code: error.code,
      };
    } else {
      console.error('Unexpected error:', error);
      return {
        success: false,
        message: 'An unexpected error occurred',
      };
    }
  }
}

// ============================================================================
// Example 9: Background Sync with Service Worker
// ============================================================================

/**
 * Register background sync
 * Call this in your service worker registration
 */
export async function registerBackgroundSync() {
  if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('sync-database');
      console.log('✓ Background sync registered');
    } catch (error) {
      console.error('Failed to register background sync:', error);
    }
  }
}

// In service worker:
// self.addEventListener('sync', (event) => {
//   if (event.tag === 'sync-database') {
//     event.waitUntil(syncWithServer());
//   }
// });

// ============================================================================
// Example 10: Performance Monitoring
// ============================================================================

/**
 * Monitor database performance
 */
export async function monitorDatabasePerformance() {
  const start = performance.now();

  // Get stats
  const stats = await getCacheStats();

  const duration = performance.now() - start;

  console.log('Database Performance:');
  console.log(`  Query time: ${duration.toFixed(2)}ms`);
  console.log(`  Total size: ${(stats.totalSize / 1024).toFixed(2)} KB`);
  console.log(`  Total records: ${stats.totalRecords}`);

  // Warn if slow
  if (duration > 1000) {
    console.warn('Database query took longer than 1 second!');
  }

  return { duration, stats };
}
