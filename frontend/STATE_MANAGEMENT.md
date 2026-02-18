# State Management System Documentation

## Overview

This learning platform uses a hybrid state management approach:
- **Zustand** for global client state (auth, UI, settings, progress, SRS)
- **React Query (TanStack Query)** for server state (API data, caching, synchronization)

All stores are enhanced with:
- **Persistence** (localStorage/IndexedDB)
- **DevTools** integration (Redux DevTools)
- **Type-safety** with TypeScript
- **Optimistic updates** support
- **Cache invalidation** strategies

---

## Table of Contents

1. [Architecture](#architecture)
2. [Stores](#stores)
3. [React Query Setup](#react-query-setup)
4. [Persistence](#persistence)
5. [DevTools](#devtools)
6. [Usage Examples](#usage-examples)
7. [Best Practices](#best-practices)

---

## Architecture

### Client State (Zustand)

```
┌─────────────────────────────────────────┐
│          Zustand Stores                 │
├─────────────────────────────────────────┤
│  - authStore      (authentication)      │
│  - progressStore  (learning progress)   │
│  - srsStore       (spaced repetition)   │
│  - settingsStore  (user preferences)    │
│  - uiStore        (UI state)            │
└─────────────────────────────────────────┘
           ↓                    ↓
    ┌──────────┐         ┌──────────┐
    │ Persist  │         │ DevTools │
    └──────────┘         └──────────┘
```

### Server State (React Query)

```
┌─────────────────────────────────────────┐
│       React Query Client                │
├─────────────────────────────────────────┤
│  - Query Cache (lessons, quizzes, etc)  │
│  - Mutation Cache (updates, creates)    │
│  - Optimistic Updates                   │
│  - Cache Invalidation                   │
└─────────────────────────────────────────┘
```

---

## Stores

### 1. Auth Store (`authStore.ts`)

Manages user authentication and session state.

**State:**
```typescript
{
  user: User | null,
  token: string | null,
  isAuthenticated: boolean,
  isLoading: boolean,
  error: string | null
}
```

**Actions:**
- `login(email, password)` - Authenticate user
- `register(email, password, name)` - Register new user
- `logout()` - Clear session
- `updateUser(updates)` - Update user profile
- `refreshAuth()` - Refresh authentication
- `clearError()` - Clear error messages
- `setToken(token)` - Set auth token

**Usage:**
```typescript
import { useAuthStore } from '@/stores';

function LoginForm() {
  const { login, isLoading, error } = useAuthStore();

  const handleSubmit = async (email: string, password: string) => {
    try {
      await login(email, password);
    } catch (err) {
      // Error handled in store
    }
  };
}
```

**Utility Functions:**
```typescript
import { getAuthToken, hasRole, isAuthenticated } from '@/stores';

const token = getAuthToken();
const isAdmin = hasRole('admin');
const loggedIn = isAuthenticated();
```

---

### 2. Progress Store (`progressStore.ts`)

Tracks user learning progress, completed lessons, quiz attempts, and study time.

**State:**
```typescript
{
  lessons: Record<string, LessonProgress>,
  quizzes: Record<string, QuizAttempt[]>,
  exercises: Record<string, ExerciseProgress>,
  modules: Record<string, ModuleProgress>,
  overallProgress: number,
  currentStreak: number,
  longestStreak: number,
  totalStudyTime: number,
  lastStudyDate?: string,
  isLoading: boolean
}
```

**Actions:**
- `markLessonComplete(lessonId)` - Mark lesson as completed
- `updateLessonTime(lessonId, timeSpent)` - Track study time
- `toggleBookmark(lessonId)` - Bookmark/unbookmark lesson
- `addQuizAttempt(quizId, attempt)` - Record quiz attempt
- `updateExerciseProgress(exerciseId, progress)` - Update exercise status
- `calculateOverallProgress()` - Recalculate progress percentage
- `updateStreak()` - Update daily study streak
- `syncProgress()` - Sync with backend
- `resetProgress()` - Clear all progress

**Usage:**
```typescript
import { useProgressStore } from '@/stores';

function LessonView() {
  const { markLessonComplete, updateLessonTime } = useProgressStore();

  const handleComplete = () => {
    markLessonComplete('lesson-123');
    updateLessonTime('lesson-123', 1800); // 30 minutes
  };
}
```

---

### 3. SRS Store (`srsStore.ts`)

Manages flashcards and spaced repetition using the SM-2 algorithm.

**State:**
```typescript
{
  cards: Record<string, FlashCard>,
  reviews: Record<string, CardReview>,
  dueCards: string[],
  currentSession: ReviewSession | null,
  isReviewing: boolean,
  dailyLimit: number,
  reviewedToday: number,
  isLoading: boolean
}
```

**Actions:**
- `loadCards()` - Load flashcards from API
- `reviewCard(cardId, quality)` - Record review (0-5 quality rating)
- `startSession()` - Begin review session
- `endSession()` - End review session
- `skipCard(cardId)` - Skip a card
- `undoLastReview()` - Undo last review
- `updateDailyLimit(limit)` - Set daily review limit
- `calculateDueCards()` - Recalculate due cards
- `getCardStats(cardId)` - Get card statistics
- `syncReviews()` - Sync with backend

**SM-2 Algorithm:**
The store implements the SuperMemo 2 algorithm for optimal spacing:
- Quality 0-2: Failed recall (reset interval)
- Quality 3-5: Successful recall (increase interval)
- Ease factor adjusts based on performance
- Next review date calculated automatically

**Usage:**
```typescript
import { useSRSStore, getNextDueCard } from '@/stores';

function FlashcardReview() {
  const { reviewCard, dueCards } = useSRSStore();
  const nextCard = getNextDueCard();

  const handleRating = (quality: number) => {
    if (nextCard) {
      reviewCard(nextCard.id, quality);
    }
  };
}
```

---

### 4. Settings Store (`settingsStore.ts`)

Manages user preferences and application settings.

**State:**
```typescript
{
  theme: 'light' | 'dark' | 'auto',
  language: 'en' | 'es' | 'fr' | 'de',
  notifications: NotificationPreferences,
  study: StudyPreferences,
  privacy: PrivacySettings,
  isLoading: boolean
}
```

**Actions:**
- `updateTheme(theme)` - Change theme
- `updateLanguage(language)` - Change language
- `updateNotifications(preferences)` - Update notification settings
- `updateStudyPreferences(preferences)` - Update study settings
- `updatePrivacy(settings)` - Update privacy settings
- `syncSettings()` - Sync with backend
- `resetSettings()` - Reset to defaults

**Usage:**
```typescript
import { useSettingsStore, isDarkMode } from '@/stores';

function Settings() {
  const { theme, updateTheme } = useSettingsStore();
  const darkMode = isDarkMode();

  return (
    <select value={theme} onChange={(e) => updateTheme(e.target.value)}>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="auto">Auto</option>
    </select>
  );
}
```

---

### 5. UI Store (`uiStore.ts`)

Manages UI state including sidebar, toasts, modals, and sync status.

**State:**
```typescript
{
  sidebarOpen: boolean,
  sidebarCollapsed: boolean,
  toasts: Toast[],
  modals: Modal[],
  isOnline: boolean,
  isSyncing: boolean,
  lastSyncAt?: string,
  globalLoading: boolean,
  pageTitle: string,
  breadcrumbs: Breadcrumb[]
}
```

**Actions:**
- `toggleSidebar()` - Toggle sidebar
- `collapseSidebar(collapsed)` - Collapse/expand sidebar
- `showToast(toast)` - Show toast notification
- `hideToast(id)` - Hide toast
- `openModal(modal)` - Open modal
- `closeModal(id)` - Close modal
- `closeAllModals()` - Close all modals
- `setOnlineStatus(isOnline)` - Update online status
- `setSyncStatus(isSyncing)` - Update sync status
- `setGlobalLoading(loading)` - Show/hide global loader
- `setPageTitle(title)` - Update page title
- `setBreadcrumbs(breadcrumbs)` - Update breadcrumbs

**Usage:**
```typescript
import { showSuccessToast, showErrorToast } from '@/stores';

function SaveButton() {
  const handleSave = async () => {
    try {
      await saveData();
      showSuccessToast('Saved successfully!');
    } catch (error) {
      showErrorToast('Failed to save');
    }
  };
}
```

---

## React Query Setup

### Provider Setup

Wrap your app with `QueryProvider`:

```typescript
import { QueryProvider } from '@/stores';

function App() {
  return (
    <QueryProvider>
      <YourApp />
    </QueryProvider>
  );
}
```

### Query Keys

Use the `queryKeys` factory for consistent key generation:

```typescript
import { queryKeys } from '@/stores';

// Lessons
queryKeys.lessons.all           // ['lessons']
queryKeys.lessons.lists()       // ['lessons', 'list']
queryKeys.lessons.list(filters) // ['lessons', 'list', filters]
queryKeys.lessons.detail(id)    // ['lessons', 'detail', id]

// Progress
queryKeys.progress.all          // ['progress']
queryKeys.progress.overall()    // ['progress', 'overall']
queryKeys.progress.lesson(id)   // ['progress', 'lesson', id]
```

### Using Queries

```typescript
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/stores';

function LessonList() {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.lessons.lists(),
    queryFn: fetchLessons,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

### Using Mutations

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/stores';

function CreateLesson() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createLesson,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.lessons.all
      });
    },
  });
}
```

### Optimistic Updates

```typescript
import { createOptimisticMutation } from '@/stores';

const mutation = createOptimisticMutation({
  queryKey: queryKeys.lessons.detail(id),
  mutationFn: updateLesson,
  updateFn: (old, variables) => ({
    ...old,
    ...variables,
  }),
});
```

### Cache Invalidation

```typescript
import { invalidateQueries, invalidateQueriesMatching } from '@/stores';

// Invalidate specific keys
await invalidateQueries({
  keys: ['lessons', 'progress'],
});

// Invalidate by pattern
await invalidateQueriesMatching('lesson');
```

---

## Persistence

### localStorage vs IndexedDB

- **localStorage**: Small data (< 5MB), simple structures
- **IndexedDB**: Large data, complex objects, better performance

### Configuration

```typescript
persist(
  (set, get) => ({
    // Store implementation
  }),
  {
    name: 'store-name',
    storage: 'localStorage', // or 'indexedDB'
    version: 1,
    partialize: (state) => ({
      // Only persist specific fields
      user: state.user,
      token: state.token,
    }),
    migrate: (persistedState, version) => {
      // Handle version migrations
      if (version < 2) {
        return migrateToV2(persistedState);
      }
      return persistedState;
    },
  }
)
```

### Utility Functions

```typescript
import { clearAllStores, getStorageSize, exportStores, importStores } from '@/stores';

// Clear all persisted data
await clearAllStores();

// Get storage usage
const { localStorage, indexedDB } = await getStorageSize();

// Export all stores
const data = await exportStores();

// Import stores
await importStores(data);
```

---

## DevTools

### Redux DevTools Integration

All stores automatically connect to Redux DevTools in development:

```typescript
devtools(
  (set, get) => ({
    // Store implementation
  }),
  {
    name: 'StoreName',
    enabled: process.env.NODE_ENV === 'development',
  }
)
```

### Action Names

Actions are named for better debugging:

```typescript
set({ user }, false, 'auth/login/success');
//              ↑     ↑
//           replace  action name
```

### Browser Console Access

In development, all stores are accessible via console:

```javascript
__ZUSTAND_STORES__.auth.getState()
__ZUSTAND_STORES__.progress.getState()
```

### Performance Monitoring

```typescript
import { monitorPerformance } from '@/stores';

const store = monitorPerformance('StoreName', 16)(storeConfig);
// Logs warnings for updates taking > 16ms
```

---

## Usage Examples

### 1. Complete User Flow

```typescript
import { useAuthStore, useProgressStore, showSuccessToast } from '@/stores';

function LessonComplete() {
  const { user } = useAuthStore();
  const { markLessonComplete, updateLessonTime } = useProgressStore();

  const handleComplete = async () => {
    const lessonId = 'lesson-123';
    const timeSpent = 1800; // 30 minutes

    // Update local state
    markLessonComplete(lessonId);
    updateLessonTime(lessonId, timeSpent);

    // Show feedback
    showSuccessToast(`Great job, ${user?.name}!`);

    // Sync with backend (automatic via store)
  };
}
```

### 2. Flashcard Review Session

```typescript
import { useSRSStore, getNextDueCard } from '@/stores';

function ReviewSession() {
  const {
    startSession,
    endSession,
    reviewCard,
    currentSession
  } = useSRSStore();

  const nextCard = getNextDueCard();

  useEffect(() => {
    startSession();
    return () => endSession();
  }, []);

  const handleRating = (quality: number) => {
    if (nextCard) {
      reviewCard(nextCard.id, quality);
    }
  };

  return (
    <div>
      {currentSession && (
        <p>Reviewed: {currentSession.cardsReviewed} / {currentSession.totalCards}</p>
      )}
      {/* Card UI */}
    </div>
  );
}
```

### 3. Settings Panel

```typescript
import { useSettingsStore } from '@/stores';

function SettingsPanel() {
  const {
    theme,
    notifications,
    updateTheme,
    updateNotifications,
  } = useSettingsStore();

  return (
    <div>
      <select value={theme} onChange={(e) => updateTheme(e.target.value)}>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="auto">Auto</option>
      </select>

      <label>
        <input
          type="checkbox"
          checked={notifications.srsReviewsDue}
          onChange={(e) =>
            updateNotifications({ srsReviewsDue: e.target.checked })
          }
        />
        SRS Review Notifications
      </label>
    </div>
  );
}
```

### 4. Progress Dashboard

```typescript
import { useProgressStore, formatStudyTime } from '@/stores';

function ProgressDashboard() {
  const {
    overallProgress,
    currentStreak,
    totalStudyTime,
    lessons,
  } = useProgressStore();

  const completedCount = Object.values(lessons).filter(l => l.completed).length;
  const totalCount = Object.values(lessons).length;

  return (
    <div>
      <h2>Your Progress</h2>
      <p>Overall: {overallProgress}%</p>
      <p>Streak: {currentStreak} days</p>
      <p>Study Time: {formatStudyTime(totalStudyTime)}</p>
      <p>Lessons: {completedCount} / {totalCount}</p>
    </div>
  );
}
```

---

## Best Practices

### 1. Store Organization

✅ **Do:**
- Keep stores focused and single-responsibility
- Use selectors for derived state
- Extract complex logic to utility functions
- Name actions clearly (verb + noun)

❌ **Don't:**
- Mix unrelated concerns in one store
- Store derived/computed values
- Duplicate data across stores
- Use generic action names

### 2. Performance

✅ **Do:**
- Use selectors to subscribe to specific slices
- Memoize expensive computations
- Debounce frequent updates
- Use `partialize` to limit persisted data

❌ **Don't:**
- Subscribe to entire store unnecessarily
- Perform heavy operations in store actions
- Persist large datasets to localStorage
- Update state too frequently

### 3. Type Safety

✅ **Do:**
- Define comprehensive types
- Use strict TypeScript mode
- Type all store actions
- Export and reuse types

❌ **Don't:**
- Use `any` types
- Skip type definitions
- Ignore TypeScript errors
- Use implicit types

### 4. Side Effects

✅ **Do:**
- Handle async operations in actions
- Use try-catch for error handling
- Show user feedback for operations
- Sync with backend after updates

❌ **Don't:**
- Perform side effects in components
- Ignore error states
- Update state without validation
- Skip loading states

### 5. Testing

✅ **Do:**
- Test store actions in isolation
- Mock API calls
- Test error scenarios
- Verify state transitions

❌ **Don't:**
- Test implementation details
- Rely on store internals
- Skip edge cases
- Test UI and store together

---

## Migration Guide

### From Redux to Zustand

```typescript
// Redux
const mapStateToProps = (state) => ({
  user: state.auth.user,
});
const mapDispatchToProps = { login };
connect(mapStateToProps, mapDispatchToProps)(Component);

// Zustand
const { user, login } = useAuthStore();
```

### From Context to Zustand

```typescript
// Context
const { user } = useContext(AuthContext);

// Zustand
const { user } = useAuthStore();
```

---

## Troubleshooting

### State Not Persisting

1. Check browser storage permissions
2. Verify `partialize` configuration
3. Check for quota exceeded errors
4. Clear old data: `clearAllStores()`

### DevTools Not Working

1. Install Redux DevTools extension
2. Check `enabled` flag in devtools config
3. Verify `NODE_ENV === 'development'`

### Performance Issues

1. Use selective subscriptions
2. Check for unnecessary re-renders
3. Profile with React DevTools
4. Monitor state update frequency

### Type Errors

1. Run `npm run type-check`
2. Update type definitions
3. Check for missing imports
4. Verify TypeScript version

---

## Resources

- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [React Query Documentation](https://tanstack.com/query)
- [Redux DevTools](https://github.com/reduxjs/redux-devtools)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [SM-2 Algorithm](https://en.wikipedia.org/wiki/SuperMemo#Description_of_SM-2_algorithm)
