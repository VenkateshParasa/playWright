# Exercise Backend Implementation

This document describes the complete backend infrastructure for the Exercise system.

## Overview

The Exercise system provides a complete coding challenge platform with:
- Code execution and testing
- Progress tracking
- Multiple difficulty levels
- Category-based organization
- Hints and solutions
- Real-time test feedback

## Files Created

### Models

#### 1. `backend/src/models/Exercise.ts`
The main Exercise model with the following features:
- **Fields**: title, description, difficulty, category, language, tags, instructions, learning objectives
- **Code**: starterCode, solution, testCases, hints
- **Metadata**: viewCount, completionCount, averageScore, attemptCount
- **Indexes**: Optimized for queries by difficulty, category, language, tags
- **Methods**:
  - `incrementView()` - Track views
  - `recordAttempt(passed, score)` - Track attempts and update stats
  - `getVisibleTestCases()` - Filter hidden test cases

#### 2. `backend/src/models/ExerciseProgress.ts`
Tracks user progress on exercises:
- **Fields**: userId, exerciseId, currentCode, attempts, completed, bestScore
- **Nested Documents**: Attempts with test results and execution details
- **Methods**:
  - `recordAttempt()` - Save attempt with results
  - `revealHint(hintId)` - Track revealed hints
  - `viewSolution()` - Mark solution as viewed
  - `saveCurrentCode(code)` - Auto-save user code
- **Statics**:
  - `getOrCreate(userId, exerciseId)` - Get or create progress
  - `getUserProgress(userId)` - Get all user progress
  - `getUserStats(userId)` - Aggregate user statistics

### Services

#### 3. `backend/src/services/codeExecutionService.ts`
Handles secure code execution:
- **Features**:
  - Sandboxed execution using worker threads
  - Test case validation
  - Security checks (blocks dangerous operations)
  - Timeout handling
  - Result comparison (handles arrays, objects, primitives)
- **Main Methods**:
  - `executeCode(request)` - Execute code with all test cases
  - `validateCode(code)` - Security validation
- **Response**: Test results, execution time, score, pass/fail status

### Controllers

#### 4. `backend/src/controllers/exerciseController.ts`
API endpoint handlers:
- `getAllExercises` - List with filters (difficulty, category, language, tags, search)
- `getExerciseById` - Get single exercise (hides solution for students)
- `getExercisesByCategory` - Filter by category
- `getExercisesByDifficulty` - Filter by difficulty
- `submitSolution` - Submit code, run tests, track progress
- `getCategories` - List all categories with counts
- `getExerciseStats` - Exercise statistics

### Routes

#### 5. `backend/src/routes/exercises.ts`
RESTful API routes:
```
GET    /api/exercises                      - List all exercises
GET    /api/exercises/categories           - Get categories
GET    /api/exercises/category/:category   - Get by category
GET    /api/exercises/difficulty/:level    - Get by difficulty
GET    /api/exercises/:id                  - Get single exercise
GET    /api/exercises/:id/stats            - Get exercise stats
POST   /api/exercises/:id/submit           - Submit solution (authenticated)
```

### Scripts

#### 6. `backend/src/scripts/seedExercises.ts`
Seeds initial exercises from frontend data:
- 4 beginner-level exercises
- Arrays, Strings, Logic categories
- Complete with test cases, hints, and solutions
- Run with: `npm run seed:exercises`

## Architecture

### Data Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ├─── GET /api/exercises
       │    └─> exerciseController.getAllExercises()
       │        └─> Exercise.find() with filters
       │
       ├─── GET /api/exercises/:id
       │    └─> exerciseController.getExerciseById()
       │        ├─> Exercise.findById()
       │        ├─> exercise.incrementView()
       │        └─> Filter test cases & solution
       │
       └─── POST /api/exercises/:id/submit
            └─> exerciseController.submitSolution()
                ├─> Exercise.findById()
                ├─> codeExecutionService.validateCode()
                ├─> codeExecutionService.executeCode()
                │   └─> Worker Thread Execution
                │       ├─> Wrap code with test
                │       ├─> Execute in sandbox
                │       ├─> Compare results
                │       └─> Return test results
                ├─> exercise.recordAttempt()
                └─> ExerciseProgress.recordAttempt()
```

### Security

The code execution service implements multiple security layers:

1. **Code Validation**:
   - Blocks require() for fs, child_process, net
   - Blocks eval() and Function constructor
   - Blocks process, __dirname, __filename access

2. **Sandboxing**:
   - Worker threads isolation
   - VM2 sandbox (when available)
   - Execution timeouts (10 seconds default)
   - Memory limits

3. **Input Validation**:
   - Test case input sanitization
   - Code length limits
   - Function signature validation

### Test Execution

1. **Test Wrapping**: User code is wrapped with test execution logic
2. **Isolation**: Each test runs in a separate execution context
3. **Result Comparison**: Deep comparison of actual vs expected output
4. **Hidden Tests**: Some tests are hidden from students but used for grading
5. **Scoring**: Score = (passed tests / total tests) × 100

## API Examples

### Get All Exercises
```bash
GET /api/exercises?difficulty=beginner&category=Arrays&page=1&limit=20
```

Response:
```json
{
  "success": true,
  "exercises": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 4,
    "pages": 1
  }
}
```

### Submit Solution
```bash
POST /api/exercises/:id/submit
Content-Type: application/json
Authorization: Bearer <token>

{
  "code": "function sumArray(numbers) { return numbers.reduce((a, b) => a + b, 0); }"
}
```

Response:
```json
{
  "success": true,
  "result": {
    "success": true,
    "testResults": [
      {
        "testId": "test-1",
        "testName": "Sum of positive numbers",
        "passed": true,
        "actual": 15,
        "expected": 15,
        "executionTime": 5
      }
    ],
    "executionTime": 45,
    "allTestsPassed": true,
    "passedCount": 5,
    "totalCount": 5,
    "score": 100,
    "hiddenTestCount": 1
  }
}
```

## Database Schema

### Exercise Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  category: String,
  estimatedTime: Number,
  language: 'javascript' | 'typescript' | 'java',
  starterCode: String,
  solution: String,
  testCases: [
    {
      id: String,
      name: String,
      input: Mixed,
      expectedOutput: Mixed,
      hidden: Boolean
    }
  ],
  hints: [
    {
      id: String,
      level: Number,
      content: String
    }
  ],
  instructions: [String],
  learningObjectives: [String],
  tags: [String],
  viewCount: Number,
  completionCount: Number,
  averageScore: Number,
  attemptCount: Number,
  isPublished: Boolean,
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### ExerciseProgress Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  exerciseId: ObjectId,
  currentCode: String,
  hintsRevealed: [String],
  solutionViewed: Boolean,
  attempts: [
    {
      attemptNumber: Number,
      code: String,
      timestamp: Date,
      testResults: [...],
      passed: Boolean,
      score: Number,
      timeSpent: Number,
      executionTime: Number
    }
  ],
  attemptCount: Number,
  completed: Boolean,
  bestScore: Number,
  totalTimeSpent: Number,
  firstAttemptDate: Date,
  lastAttemptDate: Date,
  completedDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Integration with Server

The exercise routes are integrated in `backend/src/server.ts`:

```typescript
import exercisesRoutes from './routes/exercises.js';

// ...

app.use('/api/exercises', exercisesRoutes);
```

## Seed Data

Run the seed script to populate initial exercises:

```bash
npm run seed:exercises
```

This will insert 4 exercises:
1. Sum of Array Elements (Arrays, Beginner)
2. Palindrome Checker (Strings, Beginner)
3. FizzBuzz (Logic, Beginner)
4. Find Maximum Number (Arrays, Beginner)

## Future Enhancements

1. **Multi-language Support**:
   - Add Python execution
   - Add Java compilation and execution
   - Use Docker containers for isolation

2. **Advanced Features**:
   - Code templates and scaffolding
   - Performance benchmarking
   - Memory usage tracking
   - Code quality analysis

3. **Social Features**:
   - Share solutions
   - Discussion threads
   - Upvoting best solutions
   - Leaderboards

4. **Admin Features**:
   - Exercise creation UI
   - Test case management
   - Analytics dashboard
   - Bulk import/export

## Dependencies

Required packages (already in worker):
- `worker_threads` (Node.js built-in)
- `vm2` (for sandboxing) - optional but recommended

The worker at `workers/codeExecutor.ts` already has the necessary implementation for JavaScript execution.

## Testing

To test the implementation:

1. Start the backend server
2. Seed exercises: `npm run seed:exercises`
3. Test endpoints:
   - List exercises: `GET /api/exercises`
   - Get exercise: `GET /api/exercises/:id`
   - Submit solution: `POST /api/exercises/:id/submit` (requires auth)

## Security Considerations

**IMPORTANT**: The current implementation is suitable for development and learning. For production:

1. Use Docker containers for code execution
2. Implement rate limiting per user
3. Add resource quotas (CPU, memory, network)
4. Monitor for malicious code patterns
5. Log all executions for audit
6. Consider using managed services (AWS Lambda, Judge0)

See the security notes in `workers/codeExecutor.ts` for detailed recommendations.
