# Intelligent Tutoring System

## Overview

The Intelligent Tutoring System provides personalized, AI-powered learning assistance with progressive hints, debugging help, concept explanations, and adaptive learning paths.

## Features

1. **Progressive Hint System** - Step-by-step guidance without giving away solutions
2. **Debugging Assistance** - Detect mistakes and suggest fixes
3. **Concept Explanations** - Clear, level-appropriate explanations
4. **Learning Path Recommendations** - Personalized next steps
5. **AI Teaching Assistant** - Answer questions and provide resources
6. **Study Plan Generation** - Custom study schedules
7. **Learning Style Analysis** - Adapt to individual preferences

## Progressive Hints

### How It Works

Hints are provided in progressive levels, from general guidance to near-solution hints:

**Level 1**: General approach
```
"Start by breaking down the problem into smaller steps. What is the main goal?"
```

**Level 2**: Structure guidance
```
"Consider using a function that takes the input and processes it step by step."
```

**Level 3**: Implementation detail
```
"You'll need to iterate through the data. Think about which loop structure works best."
```

**Level 4**: Specific guidance
```
"Initialize your variables before the loop. Process each item and accumulate results."
```

**Level 5**: Near solution
```javascript
// Here's the basic structure:
function solve(input) {
  // initialize
  // process
  // return result
}
```

### Usage

```typescript
import { tutoringService } from './services/ai/tutoringService';

const request = {
  userId: 'user-123',
  exerciseId: 'ex-456',
  context: {
    attempts: 2,        // Number of previous attempts
    timeSpent: 300,     // Seconds spent
    errors: [],
  },
  type: 'hint',
};

const response = await tutoringService.getTutoringResponse(request);

console.log(response.content);    // The hint text
console.log(response.level);      // Hint level (1-5)
console.log(response.nextSteps);  // Suggested actions
```

### Adaptive Difficulty

Hints adapt based on:
- Number of attempts
- Time spent on problem
- Previous hint effectiveness
- Student's skill level
- Error patterns

## Debugging Assistance

### Common Mistake Detection

The system detects and explains common programming mistakes:

```typescript
const mistakes = [
  {
    type: 'missing-return',
    description: 'Your function may be missing a return statement',
    suggestion: 'Add a return statement to return the result',
    lineNumber: 15,
    commonMistake: true,
    resources: [
      {
        title: 'Understanding Return Statements',
        url: '/docs/functions',
        type: 'documentation',
      },
    ],
  },
];
```

### Detected Mistakes

1. **Syntax Errors**
   - Missing semicolons
   - Unclosed brackets/parentheses
   - Invalid syntax

2. **Logic Errors**
   - Missing return statements
   - Infinite loops
   - Off-by-one errors
   - Incorrect conditions

3. **Best Practice Violations**
   - Using `var` instead of `let`/`const`
   - Missing error handling
   - Not using strict equality (`===`)

4. **Async/Await Issues**
   - Missing `await` keywords
   - Unhandled promise rejections
   - Callback hell

### Debug Request

```typescript
const request = {
  userId: 'user-123',
  exerciseId: 'ex-456',
  context: {
    currentCode: '/* student code */',
    attempts: 3,
    timeSpent: 600,
    errors: [
      'TypeError: Cannot read property "length" of undefined',
      'ReferenceError: result is not defined',
    ],
  },
  type: 'debug',
};

const response = await tutoringService.getTutoringResponse(request);
```

### Debug Response

```typescript
{
  type: 'debug',
  content: `I found some issues in your code:

1. Undefined Variable: You're trying to use 'result' before declaring it.
   Suggestion: Declare 'result' with let or const before using it.

2. Null/Undefined Check: You're accessing '.length' without checking if the variable exists.
   Suggestion: Add a check: if (array && array.length > 0) { ... }`,

  suggestions: [
    'Declare all variables before use',
    'Check for null/undefined before accessing properties',
  ],
  nextSteps: [
    'Fix the identified issues',
    'Test your code',
    'Compare output with expected results',
  ],
}
```

## Concept Explanations

### Request Explanation

```typescript
const request = {
  userId: 'user-123',
  exerciseId: 'ex-456',
  context: {
    attempts: 0,
    timeSpent: 0,
    errors: [],
  },
  type: 'concept',
  specificQuestion: 'What are promises in JavaScript?',
};

const response = await tutoringService.getTutoringResponse(request);
```

### Explanation Structure

```markdown
## Understanding Promises

**Definition**: A Promise is an object representing the eventual completion or failure of an asynchronous operation.

**Why it matters**: Promises help you write cleaner asynchronous code and avoid callback hell.

**How to use it**:
1. Create a promise with `new Promise((resolve, reject) => {...})`
2. Use `.then()` for success handling
3. Use `.catch()` for error handling
4. Or use async/await for cleaner syntax

**Example**:
```javascript
const myPromise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('Success!');
  }, 1000);
});

myPromise.then(result => {
  console.log(result); // 'Success!' after 1 second
});
```

**Common mistakes to avoid**:
- Forgetting to return promises in chains
- Not handling rejections
- Creating unnecessary promise wrappers
```

### Difficulty Levels

**Beginner:**
- Simple language
- Basic examples
- Step-by-step instructions
- Analogies to real-world concepts

**Intermediate:**
- Technical terminology
- Complex examples
- Best practices
- Common patterns

**Advanced:**
- Deep technical details
- Edge cases
- Performance considerations
- Design patterns

## Learning Path Recommendations

### Generate Personalized Path

```typescript
const learningPath = await tutoringService.generateLearningPath('user-123');

{
  userId: 'user-123',
  currentLevel: 'intermediate',
  recommendations: [
    {
      lessonId: 'lesson-adv-arrays',
      title: 'Advanced Array Methods',
      reason: 'Based on your recent exercises',
      priority: 1,
      estimatedTime: 30,
      prerequisites: ['basic-arrays'],
    },
    {
      lessonId: 'lesson-async',
      title: 'Async Programming',
      reason: 'Fills a gap in your knowledge',
      priority: 2,
      estimatedTime: 45,
      prerequisites: ['promises', 'callbacks'],
    },
  ],
  skills: {
    current: ['variables', 'functions', 'loops', 'arrays'],
    target: ['async-await', 'error-handling', 'testing'],
    gaps: ['async-await', 'error-handling'],
  },
  adaptiveDifficulty: 'medium',
}
```

### Recommendation Algorithm

1. **Analyze Performance**: Review completed exercises and scores
2. **Identify Gaps**: Find missing prerequisite knowledge
3. **Consider Time**: Estimate time to complete each topic
4. **Prioritize**: Rank by importance and readiness
5. **Adapt**: Adjust difficulty based on recent performance

## AI Teaching Assistant

### Ask Questions

```typescript
const request = {
  userId: 'user-123',
  question: 'How do I handle errors in async functions?',
  context: {
    lessonId: 'lesson-async',
    currentCode: 'async function getData() { ... }',
    history: [
      // Previous Q&A in this session
    ],
  },
  type: 'question',
};

// POST /api/ai/tutoring/assistant/ask
```

### Response Format

```typescript
{
  answer: `To handle errors in async functions, you have several options:

1. **Try-Catch Blocks** (Recommended):
   \`\`\`javascript
   async function getData() {
     try {
       const response = await fetch('/api/data');
       const data = await response.json();
       return data;
     } catch (error) {
       console.error('Failed to fetch data:', error);
       throw error; // Re-throw or handle appropriately
     }
   }
   \`\`\`

2. **.catch() Method**:
   \`\`\`javascript
   async function getData() {
     return fetch('/api/data')
       .then(response => response.json())
       .catch(error => {
         console.error('Error:', error);
       });
   }
   \`\`\`

3. **Error Boundaries** (React):
   Use error boundaries to catch errors in component trees.`,

  confidence: 0.92,
  sources: [
    {
      title: 'Async/Await Error Handling',
      url: '/docs/async-error-handling',
      relevance: 0.95,
    },
    {
      title: 'JavaScript Promises',
      url: '/docs/promises',
      relevance: 0.85,
    },
  ],
  relatedQuestions: [
    'What are promise rejections?',
    'How do I handle multiple async operations?',
    'What is the difference between throw and return?',
  ],
  codeExamples: [
    {
      language: 'javascript',
      code: '// See examples above',
      explanation: 'These patterns show different approaches to error handling',
    },
  ],
}
```

### FAQ System

```http
GET /api/ai/tutoring/faq?query=playwright&category=getting-started

Response:
{
  "success": true,
  "faq": [
    {
      "question": "How do I get started with Playwright?",
      "answer": "Start by installing Playwright with npm...",
      "category": "getting-started",
      "helpful": 95
    }
  ]
}
```

## Study Plan Generation

### Create Study Plan

```typescript
const studyPlan = await tutoringService.generateStudyPlan(
  'user-123',
  ['Master Playwright', 'Learn async programming', 'Build test automation'],
  40 // hours available
);

{
  userId: 'user-123',
  goals: ['Master Playwright', 'Learn async programming', ...],
  timeAvailable: 40,
  plan: [
    {
      week: 1,
      topics: ['Playwright Basics', 'Selectors'],
      exercises: ['Ex 1.1', 'Ex 1.2', 'Ex 1.3'],
      estimatedHours: 8,
      milestones: ['Complete basic automation'],
    },
    {
      week: 2,
      topics: ['Async/Await', 'Promises'],
      exercises: ['Ex 2.1', 'Ex 2.2'],
      estimatedHours: 6,
      milestones: ['Understand async patterns'],
    },
    // ... more weeks
  ],
  adaptiveAdjustments: true,
}
```

### Adaptive Adjustments

The plan adapts based on:
- Actual completion time vs. estimated
- Exercise scores and attempts
- Engagement level
- Feedback provided
- Skill progression rate

## Learning Style Analysis

### Analyze Student's Style

```typescript
const learningStyle = await tutoringService.analyzeLearningStyle('user-123');

{
  style: 'visual-kinesthetic',
  preferences: [
    'Video tutorials',
    'Interactive exercises',
    'Code examples',
    'Diagrams and flowcharts',
  ],
  recommendations: [
    'Focus on visual diagrams',
    'Practice with hands-on exercises',
    'Review code examples thoroughly',
    'Use interactive debuggers',
  ],
}
```

### Learning Style Types

1. **Visual**: Diagrams, charts, videos
2. **Auditory**: Lectures, discussions
3. **Kinesthetic**: Hands-on practice, experiments
4. **Reading/Writing**: Documentation, written exercises

## Real-Time Assistance

### Live Coding Help

```typescript
const assistance = await tutoringService.provideRealtimeAssistance(
  currentCode,
  { line: 15, column: 20 }
);

{
  suggestions: [
    'Consider adding error handling',
    'This variable could be const instead of let',
  ],
  warnings: [
    'Unused variable detected on line 12',
  ],
  autocompletions: [
    'function',
    'const',
    'return',
  ],
}
```

## API Endpoints

### Get Tutoring Assistance

```http
POST /api/ai/tutoring/assist
Content-Type: application/json

{
  "exerciseId": "ex-123",
  "type": "hint",
  "context": {
    "currentCode": "...",
    "attempts": 2,
    "timeSpent": 300,
    "errors": []
  }
}
```

### Get Learning Path

```http
GET /api/ai/tutoring/learning-path/:userId
Authorization: Bearer <token>

Response:
{
  "success": true,
  "learningPath": {
    "currentLevel": "intermediate",
    "recommendations": [...],
    "skills": {...}
  }
}
```

### Generate Study Plan

```http
POST /api/ai/tutoring/study-plan
Content-Type: application/json

{
  "goals": ["Master Playwright", "Learn async"],
  "timeAvailable": 40
}
```

### Track Tutoring Session

```http
POST /api/ai/tutoring/session/track
Content-Type: application/json

{
  "exerciseId": "ex-123",
  "duration": 600,
  "hintsUsed": 2,
  "completed": true
}
```

## Analytics

### Tutoring Metrics

```typescript
const analytics = {
  totalSessions: 245,
  totalHintsUsed: 678,
  averageCompletionTime: 420, // seconds
  conceptsMastered: [
    'variables',
    'functions',
    'loops',
    'arrays',
  ],
  strugglingAreas: [
    'async-await',
    'error-handling',
  ],
  recommendedFocus: [
    'Practice error handling',
    'Review async concepts',
    'Complete async exercises',
  ],
};
```

### Effectiveness Tracking

- **Hint Effectiveness**: Did student solve after hint?
- **Explanation Clarity**: Student feedback ratings
- **Time to Mastery**: Learning curve analysis
- **Retention**: Long-term concept retention
- **Engagement**: Session frequency and duration

## Best Practices

### 1. Hint Design

- Start general, get specific gradually
- Never give away the complete solution
- Encourage problem-solving skills
- Provide relevant examples
- Link to learning resources

### 2. Debugging Help

- Identify specific error locations
- Explain why the error occurs
- Provide actionable suggestions
- Show corrected examples
- Encourage testing

### 3. Explanations

- Match student's skill level
- Use clear, simple language
- Provide code examples
- Include visualizations
- Reference official docs

### 4. Personalization

- Adapt to learning style
- Consider past performance
- Adjust difficulty dynamically
- Provide relevant recommendations
- Track progress over time

## Integration Example

```typescript
// Complete tutoring workflow
async function provideTutoring(userId: string, exerciseId: string) {
  // 1. Check if student is stuck
  const progress = await checkProgress(userId, exerciseId);

  if (progress.attempts > 3 && !progress.completed) {
    // 2. Offer assistance
    const assistance = await tutoringService.getTutoringResponse({
      userId,
      exerciseId,
      context: {
        currentCode: progress.code,
        attempts: progress.attempts,
        timeSpent: progress.timeSpent,
        errors: progress.errors,
      },
      type: 'hint',
    });

    // 3. Display hint
    await displayHint(assistance.content, assistance.level);

    // 4. Track session
    await trackSession(userId, exerciseId, {
      hintsUsed: 1,
      hintLevel: assistance.level,
    });
  }

  // 5. Update learning path if exercise completed
  if (progress.completed) {
    await tutoringService.generateLearningPath(userId);
  }
}
```

## Troubleshooting

### Common Issues

**1. Hints Too Obvious**
- Adjust hint progression
- Increase hint levels
- Add more intermediate steps

**2. Explanations Too Complex**
- Check student skill level
- Simplify language
- Add more examples

**3. Poor Recommendations**
- Update prerequisite graph
- Refine skill assessment
- Collect more student data

## Future Enhancements

- Voice-based tutoring
- Pair programming AI
- Collaborative problem solving
- Gamified hint system
- Peer learning matching
- Expert system integration
- Multi-modal explanations (video, audio, interactive)
