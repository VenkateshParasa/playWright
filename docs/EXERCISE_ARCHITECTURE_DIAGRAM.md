# Exercise API Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND APPLICATION                           │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                         REACT COMPONENTS                                 │
│                                                                          │
│  ExerciseList.tsx    ExerciseDetail.tsx    CodeEditor.tsx               │
│       │                    │                     │                       │
│       └────────────────────┴─────────────────────┘                       │
│                              │                                           │
│                              ▼                                           │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                         ZUSTAND STORE                                    │
│                    useExerciseStore                                      │
│                                                                          │
│  State:                          Methods:                               │
│  ├─ exercises: Exercise[]        ├─ loadExercises()        (NEW)       │
│  ├─ currentExercise: Exercise?   ├─ loadExerciseById()     (NEW)       │
│  ├─ currentCode: string          ├─ setCurrentExercise()                │
│  ├─ isLoading: boolean (NEW)     ├─ setCurrentCode()                    │
│  ├─ error: string? (NEW)         ├─ saveProgress()                      │
│  ├─ testResults: TestResult[]    ├─ addAttempt()                        │
│  ├─ progress: {...}              ├─ markAsCompleted()                   │
│  └─ ...                          └─ ...                                 │
│                                                                          │
│              ┌──────────────────┐                                       │
│              │  localStorage    │  (Progress Persistence)               │
│              └──────────────────┘                                       │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         API CLIENT LAYER                                 │
│                   /lib/api/exercises.ts                                  │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  getAllExercises(params)                                        │   │
│  │  getExerciseById(id)                                            │   │
│  │  submitExerciseSolution(id, code)                               │   │
│  │  getExercisesByCategory(category)                               │   │
│  │  getExercisesByDifficulty(difficulty)                           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                              │                                           │
│                              ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    apiFetch (client.ts)                         │   │
│  │  - CSRF Token Handling                                          │   │
│  │  - Error Handling                                               │   │
│  │  - JSON Parsing                                                 │   │
│  │  - Credentials: include                                         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/HTTPS
                              │ (VITE_API_BASE_URL)
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           BACKEND API                                    │
│                      (Express.js Server)                                 │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  GET  /api/exercises              (getAllExercises)            │   │
│  │  GET  /api/exercises/:id          (getExerciseById)            │   │
│  │  POST /api/exercises/:id/submit   (submitSolution)             │   │
│  │  GET  /api/exercises/categories   (getCategories)              │   │
│  │  GET  /api/exercises/category/:c  (getByCategory)              │   │
│  │  GET  /api/exercises/difficulty/:d (getByDifficulty)           │   │
│  │  GET  /api/exercises/:id/stats    (getExerciseStats)           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                              │                                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │           Middleware Layer                                       │  │
│  │  ├─ authenticate (JWT verification)                              │  │
│  │  ├─ optionalAuth (optional auth)                                 │  │
│  │  └─ CSRF protection                                              │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                              │                                           │
│                              ▼                                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │          Exercise Controller                                     │  │
│  │  ├─ Validation                                                   │  │
│  │  ├─ Business Logic                                               │  │
│  │  ├─ Code Execution Service                                       │  │
│  │  └─ Response Formatting                                          │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                              │                                           │
│                              ▼                                           │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                           DATABASE LAYER                                 │
│                           MongoDB                                        │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Exercise Collection                                             │  │
│  │  ├─ id: ObjectId                                                 │  │
│  │  ├─ title: String                                                │  │
│  │  ├─ description: String                                          │  │
│  │  ├─ difficulty: String                                           │  │
│  │  ├─ category: String                                             │  │
│  │  ├─ starterCode: String                                          │  │
│  │  ├─ solution: String                                             │  │
│  │  ├─ testCases: Array                                             │  │
│  │  ├─ hints: Array                                                 │  │
│  │  └─ ...                                                          │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                         DATA FLOW EXAMPLES                               │
└─────────────────────────────────────────────────────────────────────────┘

1. LOADING EXERCISES:
   Component → useExerciseStore.loadExercises()
           → exercises.ts → getAllExercises()
           → apiFetch → GET /api/exercises
           → Backend → MongoDB
           → Response → Store State Updated → Component Renders

2. LOADING SPECIFIC EXERCISE:
   Component → useExerciseStore.loadExerciseById(id)
           → exercises.ts → getExerciseById(id)
           → apiFetch → GET /api/exercises/:id
           → Backend → MongoDB
           → Response → Return Exercise → setCurrentExercise()

3. SUBMITTING CODE:
   Component → exercises.ts → submitExerciseSolution(id, code)
           → apiFetch → POST /api/exercises/:id/submit
           → Backend → Code Execution Service
           → Test Results → Response
           → Store → setTestResults()

4. SAVING PROGRESS:
   Component → useExerciseStore.saveProgress()
           → Update Store State
           → localStorage.setItem('exercise-storage', progress)
           (No API call - local only)


┌─────────────────────────────────────────────────────────────────────────┐
│                         ENVIRONMENT CONFIG                               │
└─────────────────────────────────────────────────────────────────────────┘

Frontend (.env):
┌────────────────────────────────┐
│ VITE_API_BASE_URL=             │
│   http://localhost:5000        │
└────────────────────────────────┘
                │
                ▼
Backend (.env):
┌────────────────────────────────┐
│ PORT=5000                      │
│ MONGODB_URI=...                │
│ JWT_SECRET=...                 │
└────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                      TYPE SAFETY FLOW                                    │
└─────────────────────────────────────────────────────────────────────────┘

TypeScript Types:
┌──────────────────────┐
│  /types/exercise.ts  │
│  ├─ Exercise         │─────┐
│  ├─ TestResult       │     │
│  ├─ ExerciseProgress │     │
│  └─ ...              │     │
└──────────────────────┘     │
                             │
         ┌───────────────────┴────────────────────┐
         ▼                                        ▼
┌──────────────────┐                    ┌──────────────────┐
│  Store Types     │                    │  API Types       │
│  (exerciseStore) │                    │  (exercises.ts)  │
└──────────────────┘                    └──────────────────┘
         │                                        │
         └───────────────────┬────────────────────┘
                             ▼
                    Component IntelliSense
                    (Full Type Safety)
```

## Legend

- **NEW**: Newly added functionality
- **→**: Data flow direction
- **▼**: Hierarchy/dependency
- **├─**: Contains/includes
- **└─**: End of list

## Key Points

1. **Separation of Concerns**: API layer is separate from state management
2. **Type Safety**: TypeScript types flow through entire stack
3. **Error Handling**: Errors caught at each layer and propagated up
4. **Persistence**: Progress stored locally, exercises fetched from API
5. **Backward Compatible**: All existing functionality preserved
6. **Scalable**: Easy to add new endpoints or features
