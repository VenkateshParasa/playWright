# IndexedDB Integration

A comprehensive IndexedDB implementation for offline storage in the Playwright & Selenium Learning Platform. This module provides type-safe CRUD operations, offline synchronization, conflict resolution, and database management utilities.

## Features

- ✅ **Type-Safe Operations**: Full TypeScript support with strict typing
- ✅ **Multiple Object Stores**: Flashcards, Lessons, Progress, Quizzes, Exercises, and more
- ✅ **Offline Sync**: Queue and synchronize changes when online
- ✅ **Conflict Resolution**: Multiple strategies (server-wins, client-wins, merge)
- ✅ **Data Validation**: Built-in validation for all entities
- ✅ **Migration Support**: Schema versioning with rollback capability
- ✅ **Export/Import**: Full database backup and restore
- ✅ **Cache Management**: Clear cache, manage storage quota
- ✅ **Performance Optimized**: Indexed queries for fast lookups
- ✅ **Error Handling**: Comprehensive error types and handling
- ✅ **Comprehensive Tests**: Full test coverage with Vitest

## Installation

The `idb` library is already included in package.json:

```json
{
  "dependencies": {
    "idb": "^8.0.0"
  }
}
```

## Quick Start

### Initialize Database

```typescript
import { initializeDatabase, cleanupDatabase } from '@/lib/db';

// In your app initialization (e.g., App.tsx)
await initializeDatabase();

// On app close or component unmount
cleanupDatabase();
```

### Basic CRUD Operations

```typescript
import { db } from '@/lib/db';

// Create a flashcard
const flashcard = {
  id: 'card-1',
  front: 'What is Playwright?',
  back: 'A browser automation framework',
  category: 'basics',
  tags: ['playwright', 'testing'],
  difficulty: 'easy',
  easinessFactor: 2.5,
  interval: 1,
  repetitions: 0,
  nextReviewDate: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  syncStatus: 'synced',
  version: 1,
};

await db.flashcards.add(flashcard);

// Read
const card = await db.flashcards.get('card-1');

// Update
card.easinessFactor = 2.3;
await db.flashcards.update(card);

// Delete
await db.flashcards.delete('card-1');

// Get all
const allCards = await db.flashcards.getAll();

// Get due cards
const dueCards = await db.flashcards.getDueCards();

// Get by category
const jsCards = await db.flashcards.getByCategory('javascript');
```

### Progress Tracking

```typescript
import { progressOps } from '@/lib/db';

// Track lesson progress
const progress = {
  id: 'progress-1',
  userId: 'user-123',
  entityType: 'lesson',
  entityId: 'lesson-1',
  status: 'in-progress',
  progressPercentage: 50,
  timeSpent: 300,
  lastAccessedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  syncStatus: 'synced',
  version: 1,
};

await progressOps.add(progress);

// Get progress for specific entity
const userProgress = await progressOps.getByUserAndEntity(
  'user-123',
  'lesson',
  'lesson-1'
);

// Update or create (upsert)
await progressOps.upsert(progress);

// Get recently accessed
const recent = await progressOps.getRecentlyAccessed(10);
```

## Offline Synchronization

### Track Changes

```typescript
import { syncManager } from '@/lib/db';

// Track a change for later sync
await syncManager.trackChange(
  'flashcards',
  'update',
  'card-1',
  flashcardData
);
```

### Sync with Server

```typescript
import { syncManager, type SyncApiClient } from '@/lib/db';

// Implement API client
const apiClient: SyncApiClient = {
  async create(storeName, entity) {
    await fetch(`/api/${storeName}`, {
      method: 'POST',
      body: JSON.stringify(entity),
    });
  },
  async update(storeName, entity) {
    await fetch(`/api/${storeName}/${entity.id}`, {
      method: 'PUT',
      body: JSON.stringify(entity),
    });
  },
  async delete(storeName, entityId) {
    await fetch(`/api/${storeName}/${entityId}`, {
      method: 'DELETE',
    });
  },
  async get(storeName, entityId) {
    const res = await fetch(`/api/${storeName}/${entityId}`);
    return await res.json();
  },
  async getUpdates(storeName, since) {
    const res = await fetch(
      `/api/${storeName}?since=${since.toISOString()}`
    );
    return await res.json();
  },
};

// Sync all pending changes
const result = await syncManager.syncAll(apiClient, 'merge');

console.log(`Synced: ${result.synced}, Failed: ${result.failed}`);

// Pull updates from server
await syncManager.pullUpdates(apiClient, 'flashcards', 'merge');
```

### Conflict Resolution

```typescript
import { conflictResolver, type SyncStrategy } from '@/lib/db';

// Available strategies: 'server-wins', 'client-wins', 'merge', 'manual'
syncManager.setDefaultStrategy('merge');

// Manual conflict resolution
const resolved = conflictResolver.intelligentMerge(
  localVersion,
  serverVersion,
  'flashcards'
);
```

## Database Management

### Export/Import

```typescript
import {
  exportDatabase,
  exportDatabaseToFile,
  importDatabase,
  importDatabaseFromFile,
} from '@/lib/db';

// Export to JSON
const data = await exportDatabase();

// Export to file (downloads)
await exportDatabaseToFile('backup.json');

// Import from JSON
const result = await importDatabase(data, {
  clearExisting: true,
  skipValidation: false,
});

// Import from file
const file = event.target.files[0];
await importDatabaseFromFile(file, { clearExisting: true });
```

### Cache Management

```typescript
import {
  getCacheStats,
  clearCache,
  clearStores,
  clearOldData,
} from '@/lib/db';

// Get statistics
const stats = await getCacheStats();
console.log(`Total size: ${stats.totalSize} bytes`);
console.log(`Total records: ${stats.totalRecords}`);

// Clear all cache
await clearCache();

// Clear specific stores
await clearStores(['flashcards', 'lessons']);

// Clear old data (older than 30 days)
await clearOldData('flashcards', 30);
```

### Storage Management

```typescript
import {
  getStorageEstimate,
  hasStorageSpace,
  requestPersistentStorage,
} from '@/lib/db';

// Check storage quota
const estimate = await getStorageEstimate();
console.log(`Used: ${estimate.percentUsed}%`);

// Check if enough space
const hasSpace = await hasStorageSpace(10 * 1024 * 1024); // 10 MB

// Request persistent storage
const granted = await requestPersistentStorage();
```

### Health Check

```typescript
import { healthCheck } from '@/lib/db';

const health = await healthCheck();

if (!health.healthy) {
  console.error('Database issues:', health.issues);
}
```

## Schema Migrations

### Create Migration

```typescript
// In migration.ts
export const migrations: Migration[] = [
  {
    version: 2,
    name: 'add_flashcard_statistics',
    description: 'Add statistics fields to flashcards',
    up: async (db) => {
      const tx = db.transaction('flashcards', 'readwrite');
      const store = tx.objectStore('flashcards');
      const allCards = await store.getAll();

      for (const card of allCards) {
        await store.put({
          ...card,
          statistics: {
            totalReviews: 0,
            correctReviews: 0,
          },
        });
      }

      await tx.done;
    },
    down: async (db) => {
      // Rollback logic
    },
  },
];
```

### Run Migrations

```typescript
import { migrationManager } from '@/lib/db';

// Check if migrations needed
const needsMigration = await migrationManager.needsMigration();

// Run migrations
const result = await migrationManager.migrate();

// Rollback to version
await migrationManager.rollback(1);

// Create backup before migration
await migrationManager.createBackup();

// Restore from backup
await migrationManager.restoreFromBackup();
```

## Error Handling

```typescript
import {
  DBError,
  ValidationError,
  NotFoundError,
  DuplicateError,
} from '@/lib/db';

try {
  await db.flashcards.add(flashcard);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Validation failed:', error.message);
  } else if (error instanceof DuplicateError) {
    console.error('Flashcard already exists');
  } else if (error instanceof NotFoundError) {
    console.error('Flashcard not found');
  } else if (error instanceof DBError) {
    console.error('Database error:', error.code);
  }
}
```

## React Hooks Example

```typescript
// hooks/useFlashcards.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/db';

export function useFlashcards() {
  const queryClient = useQueryClient();

  const flashcards = useQuery({
    queryKey: ['flashcards'],
    queryFn: () => db.flashcards.getAll(),
  });

  const addFlashcard = useMutation({
    mutationFn: (flashcard) => db.flashcards.add(flashcard),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
    },
  });

  const updateFlashcard = useMutation({
    mutationFn: (flashcard) => db.flashcards.update(flashcard),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
    },
  });

  return {
    flashcards: flashcards.data || [],
    isLoading: flashcards.isLoading,
    addFlashcard: addFlashcard.mutate,
    updateFlashcard: updateFlashcard.mutate,
  };
}
```

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

## Database Schema

### Object Stores

1. **flashcards**: SRS flashcards with SM-2 algorithm data
2. **lessons**: Course lessons with markdown content
3. **progress**: User progress tracking for all entities
4. **quizzes**: Quiz definitions with questions
5. **quizAttempts**: User quiz attempt history
6. **exercises**: Coding exercises with test cases
7. **exerciseSubmissions**: User exercise submissions
8. **syncQueue**: Offline sync queue
9. **settings**: Application settings

### Indexes

Each store has indexes for efficient queries:
- **flashcards**: by-category, by-next-review, by-sync-status
- **lessons**: by-module, by-track, by-week, by-slug
- **progress**: by-user-entity, by-status, by-last-accessed
- **quizzes**: by-lesson
- **exercises**: by-lesson, by-language

## Performance Considerations

1. **Indexed Queries**: Use indexed fields for filtering (category, status, etc.)
2. **Bulk Operations**: Use bulk add/update for multiple records
3. **Transaction Management**: Operations are automatically batched in transactions
4. **Cache Strategy**: Clear old data periodically to maintain performance
5. **Storage Quota**: Monitor storage usage and request persistent storage

## Best Practices

1. **Initialize Early**: Call `initializeDatabase()` when app starts
2. **Cleanup**: Call `cleanupDatabase()` when app closes
3. **Sync Regularly**: Sync when online to prevent large queues
4. **Handle Conflicts**: Choose appropriate conflict resolution strategy
5. **Backup Data**: Export database before major migrations
6. **Monitor Health**: Run health checks periodically
7. **Validate Data**: Always validate before storing
8. **Handle Errors**: Wrap operations in try-catch blocks

## API Reference

See individual file documentation:
- `schema.ts`: Database schema and type definitions
- `operations.ts`: CRUD operations for all stores
- `sync.ts`: Sync queue and conflict resolution
- `migration.ts`: Schema versioning and migrations
- `utils.ts`: Export/import and cache management
- `index.ts`: Main entry point and initialization

## Troubleshooting

### Database not initializing
```typescript
// Check if IndexedDB is supported
if (!window.indexedDB) {
  console.error('IndexedDB not supported');
}
```

### Storage quota exceeded
```typescript
// Check quota usage
const estimate = await getStorageEstimate();
if (estimate.percentUsed > 80) {
  await clearOldData('flashcards', 30);
}
```

### Sync conflicts
```typescript
// Use more aggressive conflict resolution
syncManager.setDefaultStrategy('server-wins');
```

### Migration failed
```typescript
// Restore from backup
await migrationManager.restoreFromBackup();
```

## License

This module is part of the Playwright & Selenium Learning Platform.
