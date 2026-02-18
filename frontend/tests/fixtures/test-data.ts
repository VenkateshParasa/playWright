/**
 * Test Data Factory
 * Provides test data for E2E and integration tests
 */

export const TEST_USERS = {
  student: {
    email: 'student@test.com',
    password: 'Test123!@#',
    firstName: 'Test',
    lastName: 'Student',
    role: 'student',
  },
  instructor: {
    email: 'instructor@test.com',
    password: 'Test123!@#',
    firstName: 'Test',
    lastName: 'Instructor',
    role: 'instructor',
  },
  admin: {
    email: 'admin@test.com',
    password: 'Admin123!@#',
    firstName: 'Test',
    lastName: 'Admin',
    role: 'admin',
  },
  newUser: {
    email: `test-${Date.now()}@test.com`,
    password: 'Test123!@#',
    firstName: 'New',
    lastName: 'User',
    role: 'student',
  },
};

export const TEST_LESSONS = {
  beginner: {
    id: 'lesson-1',
    title: 'Introduction to Playwright',
    description: 'Learn the basics of Playwright',
    track: '30-day',
    week: 1,
    module: 1,
    order: 1,
    status: 'available',
    difficulty: 'beginner',
    estimatedDuration: 30,
  },
  intermediate: {
    id: 'lesson-2',
    title: 'Advanced Selectors',
    description: 'Master complex selectors',
    track: '60-day',
    week: 2,
    module: 2,
    order: 2,
    status: 'available',
    difficulty: 'intermediate',
    estimatedDuration: 45,
  },
  advanced: {
    id: 'lesson-3',
    title: 'CI/CD Integration',
    description: 'Integrate tests in CI/CD pipeline',
    track: 'both',
    week: 4,
    module: 4,
    order: 3,
    status: 'locked',
    difficulty: 'advanced',
    estimatedDuration: 60,
  },
};

export const TEST_QUIZZES = {
  basic: {
    id: 'quiz-1',
    title: 'Playwright Basics Quiz',
    description: 'Test your knowledge of Playwright basics',
    lessonId: 'lesson-1',
    timeLimit: 600,
    passingScore: 70,
    allowReview: true,
    showExplanations: true,
    difficulty: 'easy',
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'What is Playwright?',
        options: [
          { id: 'o1', text: 'A testing framework', isCorrect: true },
          { id: 'o2', text: 'A database', isCorrect: false },
          { id: 'o3', text: 'A web server', isCorrect: false },
          { id: 'o4', text: 'An IDE', isCorrect: false },
        ],
        allowMultiple: false,
        points: 10,
        difficulty: 'easy',
        explanation: 'Playwright is a modern testing framework for web applications.',
      },
      {
        id: 'q2',
        type: 'true-false',
        question: 'Playwright supports multiple browsers',
        correctAnswer: true,
        points: 10,
        difficulty: 'easy',
        explanation: 'Playwright supports Chromium, Firefox, and WebKit.',
      },
    ],
  },
  advanced: {
    id: 'quiz-2',
    title: 'Advanced Testing Quiz',
    description: 'Challenge yourself with advanced concepts',
    lessonId: 'lesson-3',
    timeLimit: 900,
    passingScore: 80,
    allowReview: true,
    showExplanations: true,
    difficulty: 'hard',
    questions: [
      {
        id: 'q1',
        type: 'code-snippet',
        question: 'What does this code do?',
        code: 'await page.locator("button").click();',
        language: 'javascript',
        options: [
          { id: 'o1', text: 'Clicks the first button', isCorrect: true },
          { id: 'o2', text: 'Clicks all buttons', isCorrect: false },
          { id: 'o3', text: 'Hovers over button', isCorrect: false },
        ],
        allowMultiple: false,
        points: 15,
        difficulty: 'hard',
      },
    ],
  },
};

export const TEST_FLASHCARDS = {
  basic: [
    {
      id: 'card-1',
      front: 'What is a locator in Playwright?',
      back: 'A way to find elements on the page',
      category: 'Basics',
      tags: ['playwright', 'locators'],
      difficulty: 'easy',
      interval: 1,
      easinessFactor: 2.5,
      repetitions: 0,
    },
    {
      id: 'card-2',
      front: 'What is the difference between click() and dblclick()?',
      back: 'click() performs a single click, dblclick() performs a double click',
      category: 'Actions',
      tags: ['playwright', 'actions'],
      difficulty: 'medium',
      interval: 1,
      easinessFactor: 2.5,
      repetitions: 0,
    },
  ],
};

export const TEST_EXERCISES = {
  basic: {
    id: 'ex-1',
    title: 'Write Your First Test',
    description: 'Create a simple test that navigates to a page',
    difficulty: 'beginner',
    language: 'javascript',
    starterCode: `import { test, expect } from '@playwright/test';\n\ntest('my first test', async ({ page }) => {\n  // Your code here\n});\n`,
    solution: `import { test, expect } from '@playwright/test';\n\ntest('my first test', async ({ page }) => {\n  await page.goto('https://playwright.dev/');\n  await expect(page).toHaveTitle(/Playwright/);\n});\n`,
    testCases: [
      {
        input: 'https://playwright.dev/',
        expectedOutput: 'Test passes',
      },
    ],
  },
};

export const TEST_NOTIFICATIONS = {
  achievement: {
    type: 'achievement',
    title: 'First Lesson Completed!',
    message: 'You completed your first lesson',
    priority: 'high',
  },
  reminder: {
    type: 'reminder',
    title: 'Time to Review',
    message: 'You have 5 flashcards due for review',
    priority: 'medium',
  },
};

export const TEST_ACHIEVEMENTS = {
  firstLesson: {
    id: 'first-lesson',
    title: 'First Steps',
    description: 'Complete your first lesson',
    icon: 'trophy',
    unlockedAt: new Date().toISOString(),
  },
  weekStreak: {
    id: 'week-streak',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: 'flame',
    unlockedAt: new Date().toISOString(),
  },
};

export const TEST_SETTINGS = {
  theme: {
    mode: 'dark',
    primaryColor: 'blue',
    fontSize: 'medium',
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: false,
    dailyReminders: true,
    weeklyDigest: true,
  },
  study: {
    dailyGoal: 30,
    autoplayVideos: false,
    showHints: true,
    difficulty: 'progressive',
  },
  privacy: {
    profileVisibility: 'public',
    showProgress: true,
    allowAnalytics: true,
  },
};

/**
 * Generate random test user
 */
export function generateTestUser(role: 'student' | 'instructor' | 'admin' = 'student') {
  const timestamp = Date.now();
  return {
    email: `test-${timestamp}@test.com`,
    password: 'Test123!@#',
    firstName: 'Test',
    lastName: `User${timestamp}`,
    role,
  };
}

/**
 * Generate multiple test users
 */
export function generateTestUsers(count: number, role: 'student' | 'instructor' | 'admin' = 'student') {
  return Array.from({ length: count }, () => generateTestUser(role));
}

/**
 * Get quiz answer payload
 */
export function getQuizAnswers(quiz: any, correct: boolean = true) {
  const answers: Record<string, any> = {};

  quiz.questions.forEach((question: any) => {
    if (question.type === 'multiple-choice' || question.type === 'code-snippet') {
      const correctOption = question.options.find((o: any) => o.isCorrect);
      const incorrectOption = question.options.find((o: any) => !o.isCorrect);
      answers[question.id] = {
        questionId: question.id,
        answer: correct ? correctOption?.id : incorrectOption?.id,
        markedForReview: false,
        timeSpent: 30,
      };
    } else if (question.type === 'true-false') {
      answers[question.id] = {
        questionId: question.id,
        answer: correct ? question.correctAnswer : !question.correctAnswer,
        markedForReview: false,
        timeSpent: 20,
      };
    }
  });

  return answers;
}

/**
 * Mock API responses
 */
export const MOCK_API_RESPONSES = {
  login: {
    success: {
      token: 'mock-jwt-token',
      user: TEST_USERS.student,
    },
    error: {
      message: 'Invalid credentials',
    },
  },
  lessons: {
    success: Object.values(TEST_LESSONS),
    error: {
      message: 'Failed to load lessons',
    },
  },
  progress: {
    success: {
      lessonsCompleted: ['lesson-1'],
      quizzesCompleted: ['quiz-1'],
      flashcardsReviewed: 10,
      totalStudyTime: 120,
      streak: 5,
    },
  },
};
