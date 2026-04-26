# Exercises API Documentation

## Overview
The backend now serves JavaScript coding exercises as static JSON files following the same simple Express.js pattern as lessons.

## Directory Structure
```
backend/
├── data/
│   └── exercises/
│       ├── ex-1-array-sum.json          # Sum of Array Elements
│       ├── ex-2-palindrome.json         # Palindrome Checker
│       ├── ex-3-fizzbuzz.json           # FizzBuzz
│       ├── ex-4-find-max.json           # Find Maximum Number
│       └── javascript-exercises.json     # Index file
├── server.js                             # Updated with exercise routes
└── EXERCISES_API.md                      # This file

```

## API Endpoints

### 1. List All Exercises
**GET** `/api/exercises`

Returns the index of all available JavaScript exercises.

**Response:**
```json
{
  "version": "1.0.0",
  "lastUpdated": "2026-02-19",
  "category": "JavaScript Fundamentals",
  "totalExercises": 4,
  "exercises": [
    {
      "id": "ex-1-array-sum",
      "title": "Sum of Array Elements",
      "difficulty": "beginner",
      "category": "Arrays",
      "estimatedTime": 10,
      "language": "javascript",
      "tags": ["arrays", "loops", "reduce", "fundamentals"],
      "file": "ex-1-array-sum.json"
    }
    // ... more exercises
  ]
}
```

### 2. Get Exercise by ID
**GET** `/api/exercises/:id`

Returns the complete details of a specific exercise.

**Example:** `GET /api/exercises/ex-1-array-sum`

**Response:**
```json
{
  "id": "ex-1-array-sum",
  "title": "Sum of Array Elements",
  "description": "Write a function that takes an array...",
  "difficulty": "beginner",
  "category": "Arrays",
  "estimatedTime": 10,
  "language": "javascript",
  "instructions": [
    "Create a function named `sumArray`...",
    // ... more instructions
  ],
  "learningObjectives": [
    "Practice working with arrays in JavaScript",
    // ... more objectives
  ],
  "tags": ["arrays", "loops", "reduce", "fundamentals"],
  "starterCode": "// Write your function here\nfunction sumArray(numbers) {\n  // Your code here\n}\n",
  "solution": "function sumArray(numbers) {\n  // ... solution code\n}\n",
  "testCases": [
    {
      "id": "test-1",
      "name": "Sum of positive numbers",
      "input": [[1, 2, 3, 4, 5]],
      "expectedOutput": 15
    }
    // ... more test cases
  ],
  "hints": [
    {
      "id": "hint-1",
      "level": 1,
      "content": "You can use the array reduce() method..."
    }
    // ... more hints
  ]
}
```

### 3. Execute Code (Placeholder)
**POST** `/api/exercises/execute`

Placeholder endpoint for code execution. Returns a message indicating that code execution should be handled client-side using web workers for security.

**Request Body:**
```json
{
  "code": "function sumArray(numbers) { ... }",
  "testCases": [...]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Code execution should be handled client-side using web workers for security",
  "note": "This endpoint is a placeholder for validation purposes"
}
```

## Available Exercises

### 1. Sum of Array Elements (ex-1-array-sum)
- **Difficulty:** Beginner
- **Category:** Arrays
- **Time:** 10 minutes
- **Skills:** Array iteration, reduce method, edge cases

### 2. Palindrome Checker (ex-2-palindrome)
- **Difficulty:** Beginner
- **Category:** Strings
- **Time:** 15 minutes
- **Skills:** String manipulation, regex, two-pointer technique

### 3. FizzBuzz (ex-3-fizzbuzz)
- **Difficulty:** Beginner
- **Category:** Logic
- **Time:** 15 minutes
- **Skills:** Conditional logic, modulo operator, arrays

### 4. Find Maximum Number (ex-4-find-max)
- **Difficulty:** Beginner
- **Category:** Arrays
- **Time:** 10 minutes
- **Skills:** Array traversal, algorithm implementation, loops

## Server Updates

The `server.js` file has been updated with:

1. **JSON body parsing middleware:** `app.use(express.json())`
2. **Exercise listing route:** `GET /api/exercises`
3. **Individual exercise route:** `GET /api/exercises/:id`
4. **Code execution placeholder:** `POST /api/exercises/execute`

## Testing

To start the server:
```bash
cd backend
node server.js
```

The server will display:
```
🚀 Backend server running on http://localhost:3001
📚 Lessons available at http://localhost:3001/data/lessons/
💪 Exercises available at http://localhost:3001/api/exercises
💚 Health check: http://localhost:3001/health
```

Test the endpoints:
```bash
# List all exercises
curl http://localhost:3001/api/exercises

# Get specific exercise
curl http://localhost:3001/api/exercises/ex-1-array-sum

# Test code execution endpoint
curl -X POST http://localhost:3001/api/exercises/execute \
  -H "Content-Type: application/json" \
  -d '{"code":"function test() {}","testCases":[]}'
```

## Architecture Notes

- **No Database:** All data stored as static JSON files
- **No TypeScript:** Plain JavaScript only
- **Simple Express:** Follows existing pattern from lessons API
- **Client-Side Execution:** Code execution handled in browser using web workers
- **No MongoDB:** File-based storage only

## Next Steps

To integrate with the frontend:

1. Update the frontend to fetch from `/api/exercises` instead of importing from TypeScript
2. Implement client-side code execution using web workers
3. Add state management for exercise progress (if needed)
4. Update the exercises page to use the API endpoints

## File Structure

Each exercise JSON file contains:
- Exercise metadata (id, title, description, difficulty, etc.)
- Instructions (step-by-step guide)
- Learning objectives
- Tags
- Starter code
- Solution code
- Test cases (with input/output pairs)
- Hints (progressive difficulty levels)
