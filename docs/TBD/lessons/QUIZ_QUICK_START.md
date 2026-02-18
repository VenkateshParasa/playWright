# Quiz System - Quick Start Guide

## Installation

```bash
cd frontend
npm install react-syntax-highlighter @types/react-syntax-highlighter
```

## Quick Start

### 1. Access the Quiz Page
Navigate to `/quiz` in your application.

### 2. Take a Quiz
```typescript
// Quiz automatically starts when you click "Start Quiz" button
// Progress is auto-saved every second
// Submit when complete or let timer expire
```

### 3. View Results
Results are displayed immediately after submission with:
- Overall score and percentage
- Pass/fail status
- Detailed question-by-question review
- Option to retry or exit

## Creating Custom Quizzes

Add to `frontend/src/data/mockQuizzes.ts`:

```typescript
{
  id: 'quiz-my-custom-quiz',
  title: 'My Custom Quiz',
  description: 'Test description',
  timeLimit: 600, // 10 minutes (0 = no limit)
  passingScore: 70, // 70%
  randomizeQuestions: false,
  randomizeOptions: true,
  allowReview: true,
  showExplanations: true,
  maxAttempts: 3, // undefined = unlimited
  difficulty: 'medium',
  tags: ['custom', 'test'],
  createdAt: new Date().toISOString(),
  questions: [
    // Multiple Choice (Single Answer)
    {
      id: 'q1',
      type: 'multiple-choice',
      question: 'What is React?',
      points: 10,
      difficulty: 'easy',
      category: 'React',
      allowMultiple: false,
      options: [
        { id: 'a', text: 'A JavaScript library', isCorrect: true },
        { id: 'b', text: 'A database', isCorrect: false },
        { id: 'c', text: 'A CSS framework', isCorrect: false },
        { id: 'd', text: 'An IDE', isCorrect: false },
      ],
      explanation: 'React is a JavaScript library for building user interfaces.',
    },

    // Multiple Choice (Multiple Answers)
    {
      id: 'q2',
      type: 'multiple-choice',
      question: 'Select all JavaScript frameworks:',
      points: 15,
      difficulty: 'medium',
      category: 'JavaScript',
      allowMultiple: true,
      options: [
        { id: 'a', text: 'React', isCorrect: true },
        { id: 'b', text: 'Vue', isCorrect: true },
        { id: 'c', text: 'Django', isCorrect: false },
        { id: 'd', text: 'Angular', isCorrect: true },
      ],
      explanation: 'React, Vue, and Angular are JavaScript frameworks. Django is Python.',
    },

    // True/False
    {
      id: 'q3',
      type: 'true-false',
      question: 'TypeScript is a superset of JavaScript.',
      points: 10,
      difficulty: 'easy',
      category: 'TypeScript',
      correctAnswer: true,
      explanation: 'True. TypeScript adds static typing to JavaScript.',
    },

    // Code Snippet
    {
      id: 'q4',
      type: 'code-snippet',
      question: 'What will this code output?',
      points: 15,
      difficulty: 'hard',
      category: 'JavaScript',
      code: `console.log(typeof null);`,
      language: 'javascript',
      allowMultiple: false,
      options: [
        { id: 'a', text: 'null', isCorrect: false },
        { id: 'b', text: 'object', isCorrect: true },
        { id: 'c', text: 'undefined', isCorrect: false },
        { id: 'd', text: 'number', isCorrect: false },
      ],
      explanation: 'typeof null returns "object" due to a historical bug in JavaScript.',
    },
  ],
}
```

## Using the Quiz Store

### Start a Quiz
```typescript
import { useQuizStore } from '../stores/quizStore';
import { mockQuizzes } from '../data/mockQuizzes';

const startQuiz = useQuizStore((state) => state.startQuiz);
startQuiz(mockQuizzes[0]);
```

### Answer a Question
```typescript
const answerQuestion = useQuizStore((state) => state.answerQuestion);

// Single answer
answerQuestion('q1', 'option-a');

// Multiple answers
answerQuestion('q2', ['option-a', 'option-c']);

// True/False
answerQuestion('q3', true);
```

### Navigate Questions
```typescript
const goToQuestion = useQuizStore((state) => state.goToQuestion);
const nextQuestion = useQuizStore((state) => state.nextQuestion);
const previousQuestion = useQuizStore((state) => state.previousQuestion);

goToQuestion(5); // Jump to question 5
nextQuestion(); // Go to next
previousQuestion(); // Go to previous
```

### Mark for Review
```typescript
const markForReview = useQuizStore((state) => state.markForReview);
const unmarkForReview = useQuizStore((state) => state.unmarkForReview);

markForReview('q1');
unmarkForReview('q1');
```

### Submit Quiz
```typescript
const submitQuiz = useQuizStore((state) => state.submitQuiz);
submitQuiz(); // Calculates results and shows results page
```

### Get Quiz History
```typescript
const quizHistory = useQuizStore((state) => state.quizHistory);
const getBestScore = useQuizStore((state) => state.getBestScore);
const getQuizHistory = useQuizStore((state) => state.getQuizHistory);

// Get all attempts for a quiz
const attempts = getQuizHistory('quiz-playwright-basics');

// Get best score
const bestScore = getBestScore('quiz-playwright-basics');
```

### Retry a Quiz
```typescript
const retryQuiz = useQuizStore((state) => state.retryQuiz);
retryQuiz('quiz-playwright-basics');
```

## Component Props

### QuizPlayer
```typescript
<QuizPlayer
  quiz={quiz}           // Quiz object
  onExit={() => {}}     // Exit handler
  className=""          // Optional CSS class
/>
```

### Question
```typescript
<Question
  question={question}
  questionNumber={1}
  totalQuestions={10}
  selectedAnswer={answer}
  onAnswer={(answer) => {}}
  disabled={false}
  showCorrectAnswer={false}
  markedForReview={false}
  onToggleReview={() => {}}
  className=""
/>
```

### MultipleChoice
```typescript
<MultipleChoice
  question={question}
  selectedAnswers={['a', 'b']}
  onAnswer={(answer) => {}}
  disabled={false}
  showCorrectAnswer={false}
  className=""
/>
```

### TrueFalse
```typescript
<TrueFalse
  question={question}
  selectedAnswer={true}
  onAnswer={(answer) => {}}
  disabled={false}
  showCorrectAnswer={false}
  className=""
/>
```

### QuizTimer
```typescript
<QuizTimer
  timeLimit={600}       // seconds
  onTimeUp={() => {}}   // callback when time expires
  className=""
/>
```

### QuizNavigation
```typescript
<QuizNavigation
  questions={questions}
  currentIndex={0}
  answers={answers}
  onNavigate={(index) => {}}
  onPrevious={() => {}}
  onNext={() => {}}
  className=""
/>
```

### QuizResults
```typescript
<QuizResults
  result={result}
  quiz={quiz}
  onRetry={() => {}}
  onExit={() => {}}
  showDetailedReview={true}
  className=""
/>
```

## Styling

All components use Tailwind CSS. Key color schemes:

- **Primary**: Blue (`bg-blue-600`)
- **Success**: Green (`bg-green-600`)
- **Warning**: Orange/Yellow (`bg-orange-600`)
- **Error**: Red (`bg-red-600`)
- **Neutral**: Gray (`bg-gray-600`)

## LocalStorage Keys

- `quiz-progress-{quizId}`: Current quiz progress
- `quiz-storage`: Quiz history (via Zustand persist)

## Timer Behavior

- Green: > 50% time remaining
- Yellow: 25-50% time remaining
- Red: < 25% time remaining
- Auto-submits at 0:00

## Anti-Cheating Features

Active during quiz (disabled after submission):
- Right-click context menu disabled
- Copy/paste disabled
- Page close/refresh warning

## Status Indicators

In navigation:
- **Green**: Question answered
- **Orange**: Marked for review
- **White**: Unanswered
- **Blue**: Current question

## Best Practices

1. **Always provide explanations** for educational value
2. **Set appropriate time limits** (1-2 minutes per question)
3. **Balance difficulty** across questions
4. **Use clear question wording**
5. **Provide helpful explanations** even for correct answers
6. **Test on multiple devices** before deploying

## Troubleshooting

### Quiz won't start
- Check that quiz object has all required fields
- Verify questions array is not empty
- Check browser console for errors

### Timer not working
- Ensure `timeLimit > 0` in quiz config
- Check that timer component is mounted
- Verify browser tab is active

### Answers not saving
- Check localStorage is enabled in browser
- Verify no console errors
- Check `answerQuestion` is being called

### Navigation not working
- Ensure question IDs are unique
- Verify answers object structure
- Check currentIndex is valid

## Support

For issues or questions, check:
1. Browser console for errors
2. Redux DevTools (development mode)
3. LocalStorage inspector
4. Network tab for API calls (if backend integrated)

## Performance Tips

1. Use `React.memo()` for question components if rendering is slow
2. Debounce auto-save if localStorage writes are slow
3. Lazy load quiz data if dataset is large
4. Use code splitting for quiz routes
5. Optimize images and media in questions

## Migration to Backend

To connect to a real backend:

1. Update `quizStore.ts` actions to call API endpoints
2. Replace `mockQuizzes.ts` with API fetching
3. Add authentication headers to requests
4. Implement server-side validation
5. Store quiz history in database
6. Add quiz analytics endpoints

Example:
```typescript
// In quizStore.ts
startQuiz: async (quizId: string) => {
  const response = await fetch(`/api/quizzes/${quizId}`);
  const quiz = await response.json();
  // ... rest of logic
}
```
