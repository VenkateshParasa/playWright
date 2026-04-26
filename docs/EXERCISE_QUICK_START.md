# Exercise System - Quick Start Guide

## Getting Started

### 1. Prerequisites
- Node.js v18+ installed
- MongoDB running (locally or cloud)
- Backend server dependencies installed

### 2. Seed Initial Exercises

Run the seed script to populate the database with 4 initial exercises:

```bash
cd backend
npm run seed:exercises
```

Expected output:
```
Connected to MongoDB
Cleared existing exercises
Inserted 4 exercises

Exercises seeded:
- Sum of Array Elements (beginner, Arrays)
- Palindrome Checker (beginner, Strings)
- FizzBuzz (beginner, Logic)
- Find Maximum Number (beginner, Arrays)

Seed completed successfully!
```

### 3. Start the Backend Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

### 4. Test the API

#### List All Exercises
```bash
curl http://localhost:5000/api/exercises
```

#### Get Single Exercise
```bash
curl http://localhost:5000/api/exercises/<exercise-id>
```

#### Submit a Solution (requires authentication)
```bash
curl -X POST http://localhost:5000/api/exercises/<exercise-id>/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "code": "function sumArray(numbers) { return numbers.reduce((a, b) => a + b, 0); }"
  }'
```

## API Endpoints Reference

### Public Endpoints (No Auth Required)

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| GET | `/api/exercises` | List all exercises | `difficulty`, `category`, `language`, `tags`, `search`, `page`, `limit` |
| GET | `/api/exercises/categories` | Get all categories | - |
| GET | `/api/exercises/category/:category` | Get by category | `page`, `limit` |
| GET | `/api/exercises/difficulty/:level` | Get by difficulty | `page`, `limit` |
| GET | `/api/exercises/:id` | Get single exercise | - |
| GET | `/api/exercises/:id/stats` | Get exercise stats | - |

### Authenticated Endpoints (Require Auth Token)

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| POST | `/api/exercises/:id/submit` | Submit solution | `{ code: string }` |

## Example API Calls

### 1. Get All Beginner Exercises
```bash
curl "http://localhost:5000/api/exercises?difficulty=beginner"
```

Response:
```json
{
  "success": true,
  "exercises": [
    {
      "id": "...",
      "title": "Sum of Array Elements",
      "difficulty": "beginner",
      "category": "Arrays",
      "estimatedTime": 10,
      "language": "javascript",
      "tags": ["arrays", "loops", "reduce", "fundamentals"],
      "viewCount": 0,
      "completionCount": 0,
      "isPublished": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 4,
    "pages": 1
  }
}
```

### 2. Get Exercises by Category
```bash
curl "http://localhost:5000/api/exercises/category/Arrays"
```

### 3. Search Exercises
```bash
curl "http://localhost:5000/api/exercises?search=array"
```

### 4. Get Single Exercise with Details
```bash
curl "http://localhost:5000/api/exercises/<id>"
```

Response includes:
- Full exercise details
- Instructions and learning objectives
- Starter code
- Visible test cases (hidden ones excluded)
- Hints
- Solution (only for admin/instructor)

### 5. Submit Solution
```bash
curl -X POST "http://localhost:5000/api/exercises/<id>/submit" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "code": "function sumArray(numbers) { return numbers.reduce((sum, num) => sum + num, 0); }"
  }'
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

## Exercise Data Structure

### Available Exercises (After Seeding)

1. **Sum of Array Elements**
   - Category: Arrays
   - Difficulty: Beginner
   - Time: 10 minutes
   - Tests: 6 (1 hidden)
   - Hints: 3 levels

2. **Palindrome Checker**
   - Category: Strings
   - Difficulty: Beginner
   - Time: 15 minutes
   - Tests: 7 (1 hidden)
   - Hints: 3 levels

3. **FizzBuzz**
   - Category: Logic
   - Difficulty: Beginner
   - Time: 15 minutes
   - Tests: 5 (1 hidden)
   - Hints: 3 levels

4. **Find Maximum Number**
   - Category: Arrays
   - Difficulty: Beginner
   - Time: 10 minutes
   - Tests: 6 (1 hidden)
   - Hints: 3 levels

## Testing Code Execution

### Valid Solution Example
```javascript
// For "Sum of Array Elements" exercise
function sumArray(numbers) {
  if (numbers.length === 0) {
    return 0;
  }
  return numbers.reduce((sum, num) => sum + num, 0);
}
```

This should pass all tests and return score: 100

### Invalid Solution Example
```javascript
// Wrong implementation
function sumArray(numbers) {
  return 0; // Always returns 0
}
```

This will fail most tests and return a low score.

## Security Features

The code execution service includes:

1. **Code Validation**: Blocks dangerous operations
   - No `require('fs')`
   - No `require('child_process')`
   - No `eval()` or `Function()`
   - No `process` access

2. **Execution Limits**:
   - 10-second timeout per test
   - Sandboxed worker threads
   - Memory limits (when using Docker)

3. **Test Case Protection**:
   - Hidden test cases not revealed to students
   - Solution hidden unless admin/instructor

## Troubleshooting

### Problem: Seed script fails
**Solution**: Check MongoDB connection in `.env` file:
```
MONGO_URI=mongodb://localhost:27017/playwright_learning
```

### Problem: Code execution timeout
**Solution**: Ensure the worker file exists and is accessible:
```bash
ls workers/codeExecutor.ts
```

### Problem: 404 on /api/exercises
**Solution**: Verify the route is registered in server.ts:
```typescript
app.use('/api/exercises', exercisesRoutes);
```

### Problem: "Authentication required" on submit
**Solution**: Include valid JWT token in Authorization header:
```bash
-H "Authorization: Bearer <token>"
```

## Development Tips

### Adding New Exercises

You can add exercises directly to MongoDB or modify the seed script:

```javascript
{
  title: 'New Exercise',
  description: 'Description here',
  difficulty: 'beginner',
  category: 'Arrays',
  estimatedTime: 15,
  language: 'javascript',
  starterCode: '// Your starter code',
  solution: '// Solution code',
  testCases: [
    {
      id: 'test-1',
      name: 'Test name',
      input: [/* input array */],
      expectedOutput: /* expected value */,
      hidden: false
    }
  ],
  hints: [
    {
      id: 'hint-1',
      level: 1,
      content: 'Hint text'
    }
  ],
  instructions: ['Step 1', 'Step 2'],
  learningObjectives: ['Objective 1'],
  tags: ['tag1', 'tag2'],
  isPublished: true
}
```

### Monitoring Submissions

Check the ExerciseProgress collection in MongoDB to see user submissions:

```javascript
db.exerciseprogresses.find({ userId: ObjectId("...") })
```

## Next Steps

1. **Frontend Integration**:
   - Use the types from `frontend/src/types/exercise.ts`
   - Create API client following the lessons pattern
   - Build exercise list and detail pages

2. **Enhanced Features**:
   - Add user progress tracking UI
   - Implement hints reveal system
   - Show solution after completion
   - Add leaderboards
   - Implement code editor with syntax highlighting

3. **Production Deployment**:
   - Review security in `workers/codeExecutor.ts`
   - Implement Docker-based code execution
   - Add rate limiting
   - Set up monitoring and logging
   - Configure proper CORS settings

## Resources

- **Backend Implementation**: `/docs/EXERCISE_BACKEND_IMPLEMENTATION.md`
- **File Summary**: `/docs/EXERCISE_BACKEND_FILES_SUMMARY.md`
- **Worker Documentation**: `/workers/codeExecutor.ts` (see comments)
- **Frontend Types**: `/frontend/src/types/exercise.ts`
