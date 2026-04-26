# Exercise API & Store - Quick Reference

## Import

```typescript
import { useExerciseStore } from '@/stores';
import {
  getAllExercises,
  getExerciseById,
  submitExerciseSolution
} from '@/lib/api/exercises';
```

---

## API Functions

### Get All Exercises
```typescript
const response = await getAllExercises({
  difficulty: 'beginner',
  category: 'arrays',
  limit: 20,
  page: 1
});
// Returns: { success, exercises, pagination }
```

### Get Exercise by ID
```typescript
const exercise = await getExerciseById('exercise-123');
// Returns: Exercise
```

### Submit Solution
```typescript
const result = await submitExerciseSolution('exercise-123', code);
// Returns: { success, result: { allTestsPassed, score, testResults, ... } }
```

---

## Store Methods

### Load Exercises
```typescript
const { loadExercises, exercises, isLoading, error } = useExerciseStore();

await loadExercises({ difficulty: 'beginner' });
```

### Load Exercise by ID
```typescript
const { loadExerciseById } = useExerciseStore();

const exercise = await loadExerciseById('exercise-123');
```

### Set Current Exercise
```typescript
const { setCurrentExercise } = useExerciseStore();

setCurrentExercise(exercise);
// Automatically loads saved code from progress
```

### Manage Code
```typescript
const { currentCode, setCurrentCode, saveProgress } = useExerciseStore();

setCurrentCode('console.log("Hello")');
saveProgress(); // Saves to localStorage
```

### Track Progress
```typescript
const { getExerciseProgress, progress } = useExerciseStore();

const myProgress = getExerciseProgress('exercise-123');
// Returns: { attempts, bestScore, completed, ... }
```

### Hints & Solutions
```typescript
const { revealHint, revealSolution } = useExerciseStore();

revealHint('hint-1');
revealSolution();
```

### Attempts
```typescript
const { addAttempt, loadAttempt } = useExerciseStore();

addAttempt({
  exerciseId: 'ex-123',
  code: userCode,
  testResults: results,
  passed: true,
  score: 95,
  timeSpent: 300
});
```

### Completion
```typescript
const { markAsCompleted } = useExerciseStore();

markAsCompleted(); // Marks current exercise as completed
```

### Reset
```typescript
const { resetExercise } = useExerciseStore();

resetExercise(); // Resets to starter code
```

---

## Common Patterns

### Exercise List Component
```typescript
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

### Exercise Detail Component
```typescript
function ExerciseDetail({ id }) {
  const {
    currentExercise,
    isLoading,
    loadExerciseById,
    setCurrentExercise
  } = useExerciseStore();

  useEffect(() => {
    loadExerciseById(id).then(ex => {
      if (ex) setCurrentExercise(ex);
    });
  }, [id]);

  if (isLoading) return <div>Loading...</div>;
  if (!currentExercise) return null;

  return <div>{currentExercise.title}</div>;
}
```

### Code Editor Component
```typescript
function CodeEditor() {
  const { currentCode, setCurrentCode, saveProgress } = useExerciseStore();

  return (
    <textarea
      value={currentCode}
      onChange={(e) => {
        setCurrentCode(e.target.value);
        saveProgress();
      }}
    />
  );
}
```

---

## State Properties

| Property | Type | Description |
|----------|------|-------------|
| `exercises` | `Exercise[]` | List of loaded exercises |
| `currentExercise` | `Exercise \| null` | Currently selected exercise |
| `currentCode` | `string` | User's current code |
| `isLoading` | `boolean` | API loading state |
| `error` | `string \| null` | Error message |
| `isRunning` | `boolean` | Code execution state |
| `testResults` | `TestResult[]` | Latest test results |
| `consoleLogs` | `ConsoleLog[]` | Console output |
| `timeSpent` | `number` | Seconds spent |
| `progress` | `Record<string, ExerciseProgress>` | User progress per exercise |

---

## Query Parameters

```typescript
interface ExerciseQueryParams {
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

---

## Exercise Type

```typescript
interface Exercise {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  estimatedTime: number;
  language: 'typescript' | 'javascript' | 'java';
  starterCode: string;
  solution: string;
  testCases: TestCase[];
  hints: Hint[];
  instructions: string[];
  learningObjectives: string[];
  tags: string[];
}
```

---

## Environment Setup

```env
# .env or .env.local
VITE_API_BASE_URL=http://localhost:5000
```

---

## Error Handling

```typescript
const { loadExercises, error } = useExerciseStore();

try {
  await loadExercises();
} catch (err) {
  console.error('Failed to load:', err);
}

// Or check error state
if (error) {
  return <div className="error">{error}</div>;
}
```

---

## localStorage

Persisted data:
- ✅ `progress` - All user progress

Session-only data:
- ❌ `exercises` - Load from API each session
- ❌ `currentExercise` - Set explicitly
- ❌ `isLoading` - Runtime state
- ❌ `error` - Runtime state

---

## Tips

1. Always check `isLoading` before rendering
2. Handle `error` state gracefully
3. Call `loadExercises()` in `useEffect`
4. Use `saveProgress()` to persist code changes
5. Filter exercises to reduce API payload
6. Progress is auto-saved in localStorage

---

## Files

- API: `/frontend/src/lib/api/exercises.ts`
- Store: `/frontend/src/stores/exerciseStore.ts`
- Types: `/frontend/src/types/exercise.ts`
- Examples: `/frontend/src/examples/ExerciseUsageExample.tsx`
