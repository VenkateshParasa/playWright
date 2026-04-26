# Exercise API Client and Store Implementation

This document provides comprehensive documentation for the Exercise API client and updated exerciseStore implementation.

## Overview

The implementation includes:
1. **Exercise API Client** (`frontend/src/lib/api/exercises.ts`) - Handles all API communication with the backend
2. **Updated Exercise Store** (`frontend/src/stores/exerciseStore.ts`) - Zustand store with API integration
3. **Store Export** (`frontend/src/stores/index.ts`) - Centralized export point

## Files Created/Modified

### Created Files
- `/frontend/src/lib/api/exercises.ts` - Exercise API client
- `/frontend/src/examples/ExerciseUsageExample.tsx` - Usage examples

### Modified Files
- `/frontend/src/stores/exerciseStore.ts` - Added API methods and loading states
- `/frontend/src/stores/index.ts` - Added exerciseStore export

---

## 1. Exercise API Client (`/frontend/src/lib/api/exercises.ts`)

### Features

The API client provides the following functions:

#### Core Functions

##### `getAllExercises(params?: ExerciseQueryParams): Promise<ExercisesResponse>`
Fetches all exercises with optional filters.

**Parameters:**
```typescript
{
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  category?: string;
  language?: 'typescript' | 'javascript' | 'java';
  tags?: string | string[];
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
```

**Returns:**
```typescript
{
  success: boolean;
  exercises: Exercise[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
```

**Example:**
```typescript
import { getAllExercises } from '@/lib/api/exercises';

// Get all exercises
const response = await getAllExercises();

// Get filtered exercises
const filtered = await getAllExercises({
  difficulty: 'beginner',
  category: 'arrays',
  limit: 10
});
```

##### `getExerciseById(id: string): Promise<Exercise>`
Fetches a specific exercise by its ID.

**Example:**
```typescript
import { getExerciseById } from '@/lib/api/exercises';

const exercise = await getExerciseById('exercise-123');
```

##### `submitExerciseSolution(id: string, code: string): Promise<SubmitSolutionResponse>`
Submits code for validation and returns test results.

**Returns:**
```typescript
{
  success: boolean;
  result: {
    allTestsPassed: boolean;
    score: number;
    testResults: TestResult[];
    hiddenTestCount: number;
    executionTime: number;
    logs?: string[];
    error?: string;
  };
}
```

**Example:**
```typescript
import { submitExerciseSolution } from '@/lib/api/exercises';

const result = await submitExerciseSolution('exercise-123', userCode);
if (result.result.allTestsPassed) {
  console.log('All tests passed!');
}
```

#### Helper Functions

##### `getExercisesByCategory(category: string, page?: number, limit?: number)`
Get exercises filtered by category.

##### `getExercisesByDifficulty(difficulty: string, page?: number, limit?: number)`
Get exercises filtered by difficulty level.

##### `getExerciseCategories(): Promise<CategoryResponse>`
Get all available exercise categories.

##### `getExerciseStats(id: string)`
Get statistics for a specific exercise.

### Implementation Details

- Uses the centralized `apiFetch` client from `@/lib/api/client`
- Automatically uses `VITE_API_BASE_URL` environment variable
- Includes CSRF token handling for POST requests
- Proper error handling with typed responses
- All responses follow the backend API contract

---

## 2. Updated Exercise Store (`/frontend/src/stores/exerciseStore.ts`)

### New State Properties

```typescript
interface ExerciseStore {
  // Existing properties
  currentExercise: Exercise | null;
  currentCode: string;
  isRunning: boolean;
  testResults: TestResult[];
  consoleLogs: ConsoleLog[];
  timeSpent: number;
  progress: Record<string, ExerciseProgress>;

  // NEW: API-related state
  exercises: Exercise[];        // List of loaded exercises
  isLoading: boolean;           // Loading state for API calls
  error: string | null;         // Error message from API calls
}
```

### New Methods

#### `loadExercises(params?: ExerciseQueryParams): Promise<void>`
Loads exercises from the API with optional filters.

**Example:**
```typescript
const { loadExercises, exercises, isLoading, error } = useExerciseStore();

// Load all exercises
await loadExercises();

// Load with filters
await loadExercises({
  difficulty: 'beginner',
  limit: 20
});
```

#### `loadExerciseById(id: string): Promise<Exercise | null>`
Loads a specific exercise by ID from the API.

**Example:**
```typescript
const { loadExerciseById, setCurrentExercise } = useExerciseStore();

const exercise = await loadExerciseById('exercise-123');
if (exercise) {
  setCurrentExercise(exercise);
}
```

### Existing Methods (Unchanged)

All existing methods are preserved for backward compatibility:

- `setCurrentExercise(exercise: Exercise)`
- `setCurrentCode(code: string)`
- `setIsRunning(isRunning: boolean)`
- `setTestResults(results: TestResult[])`
- `addConsoleLog(log: ConsoleLog)`
- `clearConsoleLogs()`
- `incrementTimeSpent()`
- `resetTimeSpent()`
- `getExerciseProgress(exerciseId: string)`
- `saveProgress()`
- `revealHint(hintId: string)`
- `revealSolution()`
- `addAttempt(attempt: Omit<ExerciseAttempt, 'id' | 'timestamp'>)`
- `loadAttempt(attempt: ExerciseAttempt)`
- `markAsCompleted()`
- `resetExercise()`

### LocalStorage Persistence

The store maintains localStorage persistence for:
- `progress` - User progress on all exercises

The following state is NOT persisted (session-only):
- `exercises` - Must be loaded from API each session
- `isLoading` - Resets on reload
- `error` - Resets on reload
- `currentExercise` - Must be set explicitly
- `currentCode` - Loaded from progress when setting exercise
- `testResults` - Session-only
- `consoleLogs` - Session-only
- `timeSpent` - Session-only

---

## 3. Usage Examples

### Basic Exercise List

```typescript
import { useEffect } from 'react';
import { useExerciseStore } from '@/stores';

function ExerciseList() {
  const { exercises, isLoading, error, loadExercises } = useExerciseStore();

  useEffect(() => {
    loadExercises();
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {exercises.map(ex => (
        <li key={ex.id}>{ex.title}</li>
      ))}
    </ul>
  );
}
```

### Exercise Detail Page

```typescript
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useExerciseStore } from '@/stores';

function ExercisePage() {
  const { id } = useParams();
  const {
    currentExercise,
    isLoading,
    error,
    loadExerciseById,
    setCurrentExercise
  } = useExerciseStore();

  useEffect(() => {
    const load = async () => {
      const exercise = await loadExerciseById(id);
      if (exercise) {
        setCurrentExercise(exercise);
      }
    };
    load();
  }, [id]);

  if (isLoading) return <div>Loading exercise...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!currentExercise) return <div>Exercise not found</div>;

  return (
    <div>
      <h1>{currentExercise.title}</h1>
      <p>{currentExercise.description}</p>
    </div>
  );
}
```

### Code Editor with Auto-Save

```typescript
import { useExerciseStore } from '@/stores';

function CodeEditor() {
  const {
    currentCode,
    setCurrentCode,
    saveProgress
  } = useExerciseStore();

  const handleChange = (code: string) => {
    setCurrentCode(code);
    // Auto-save after 1 second of inactivity
    setTimeout(() => saveProgress(), 1000);
  };

  return (
    <textarea
      value={currentCode}
      onChange={(e) => handleChange(e.target.value)}
    />
  );
}
```

### Filtering Exercises

```typescript
function FilteredExercises() {
  const { loadExercises, exercises, isLoading } = useExerciseStore();
  const [difficulty, setDifficulty] = useState('beginner');

  useEffect(() => {
    loadExercises({ difficulty });
  }, [difficulty]);

  return (
    <div>
      <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
      </select>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {exercises.map(ex => (
            <li key={ex.id}>{ex.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## 4. API Endpoints Used

The client connects to the following backend endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/exercises` | GET | Get all exercises with filters |
| `/api/exercises/:id` | GET | Get specific exercise |
| `/api/exercises/:id/submit` | POST | Submit solution for validation |
| `/api/exercises/category/:category` | GET | Get exercises by category |
| `/api/exercises/difficulty/:difficulty` | GET | Get exercises by difficulty |
| `/api/exercises/categories` | GET | Get all categories |
| `/api/exercises/:id/stats` | GET | Get exercise statistics |

---

## 5. Environment Configuration

The API client uses the following environment variable:

```env
VITE_API_BASE_URL=http://localhost:5000
```

Make sure this is set in your `.env` file or `.env.local` file.

---

## 6. Error Handling

The API client includes comprehensive error handling:

1. **Network Errors**: Caught and returned as error state
2. **HTTP Errors**: Parsed from response and returned
3. **Validation Errors**: Included in error response
4. **Loading States**: Properly managed in store

Example error handling:

```typescript
const { loadExercises, error, isLoading } = useExerciseStore();

useEffect(() => {
  loadExercises().catch(err => {
    console.error('Failed to load exercises:', err);
  });
}, []);

if (error) {
  return <div className="error">{error}</div>;
}
```

---

## 7. Type Safety

All API functions and store methods are fully typed using TypeScript:

- Request parameters are validated at compile time
- Response types match backend contracts
- Store state is type-safe
- Exercise types are imported from `@/types/exercise`

---

## 8. Testing

You can test the implementation with:

```bash
# Run the verification script
node /tmp/test-exercise-api.mjs

# Expected output:
# ✅ All checks passed! Exercise API and Store are properly set up.
```

---

## 9. Migration Guide

### From Mock Data to API

If you were previously using mock data, here's how to migrate:

**Before:**
```typescript
// Mock data
const exercises = [
  { id: '1', title: 'Exercise 1', ... },
  // ...
];
```

**After:**
```typescript
import { useExerciseStore } from '@/stores';

function Component() {
  const { exercises, loadExercises } = useExerciseStore();

  useEffect(() => {
    loadExercises();
  }, []);

  // Use exercises state
}
```

---

## 10. Best Practices

1. **Always check loading state** before rendering exercises
2. **Handle errors gracefully** with user-friendly messages
3. **Use auto-save** for code changes to prevent data loss
4. **Leverage localStorage** - progress is automatically persisted
5. **Load exercises on mount** - Call `loadExercises()` in `useEffect`
6. **Use filters** to reduce API payload size
7. **Cache API responses** where appropriate

---

## 11. Troubleshooting

### Issue: "Failed to load exercises"
- Check that backend is running
- Verify `VITE_API_BASE_URL` is correct
- Check browser console for network errors

### Issue: "Exercise not found"
- Verify the exercise ID is correct
- Check that the exercise is published in the database
- Ensure user has proper permissions

### Issue: "Code submission fails"
- Check authentication (requires login)
- Verify CSRF token is present
- Check code validation errors in response

---

## 12. Next Steps

Consider implementing:

1. **Caching** - Use React Query for better caching
2. **Optimistic Updates** - Update UI before API confirmation
3. **Offline Support** - Cache exercises for offline use
4. **Real-time Updates** - WebSocket integration for live test results
5. **Code Execution** - Client-side code execution using Web Workers

---

## Files Reference

- **API Client**: `/frontend/src/lib/api/exercises.ts`
- **Exercise Store**: `/frontend/src/stores/exerciseStore.ts`
- **Store Index**: `/frontend/src/stores/index.ts`
- **Usage Examples**: `/frontend/src/examples/ExerciseUsageExample.tsx`
- **Types**: `/frontend/src/types/exercise.ts`

---

## Summary

The Exercise API client and store provide a complete solution for:
- Loading exercises from the backend API
- Managing exercise state with Zustand
- Persisting user progress in localStorage
- Handling loading and error states
- Submitting code for validation
- Tracking user attempts and progress

All existing functionality is preserved for backward compatibility, and new features integrate seamlessly with the existing codebase.
