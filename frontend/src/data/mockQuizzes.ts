/**
 * Mock Quiz Data
 * Sample quizzes with multiple question types for testing and demonstration
 */

import type { Quiz } from '../types/quiz';

export const mockQuizzes: Quiz[] = [
  {
    id: 'quiz-playwright-basics',
    title: 'Playwright Basics Quiz',
    description: 'Test your knowledge of Playwright fundamentals and core concepts',
    lessonId: 'lesson-playwright-intro',
    moduleId: 'module-week1',
    timeLimit: 900, // 15 minutes
    passingScore: 70,
    randomizeQuestions: false,
    randomizeOptions: true,
    allowReview: true,
    showExplanations: true,
    maxAttempts: 3,
    difficulty: 'easy',
    tags: ['playwright', 'fundamentals', 'basics'],
    createdAt: '2024-01-15T10:00:00Z',
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'What is Playwright?',
        points: 10,
        difficulty: 'easy',
        category: 'Fundamentals',
        allowMultiple: false,
        options: [
          {
            id: 'a',
            text: 'A testing framework for modern web applications',
            isCorrect: true,
          },
          {
            id: 'b',
            text: 'A JavaScript framework for building UIs',
            isCorrect: false,
          },
          {
            id: 'c',
            text: 'A database management system',
            isCorrect: false,
          },
          {
            id: 'd',
            text: 'A CSS preprocessor',
            isCorrect: false,
          },
        ],
        explanation:
          'Playwright is an open-source testing framework developed by Microsoft for automating and testing web applications across multiple browsers.',
      },
      {
        id: 'q2',
        type: 'multiple-choice',
        question: 'Which browsers does Playwright support? (Select all that apply)',
        points: 15,
        difficulty: 'easy',
        category: 'Fundamentals',
        allowMultiple: true,
        options: [
          { id: 'a', text: 'Chromium', isCorrect: true },
          { id: 'b', text: 'Firefox', isCorrect: true },
          { id: 'c', text: 'WebKit (Safari)', isCorrect: true },
          { id: 'd', text: 'Internet Explorer', isCorrect: false },
        ],
        explanation:
          'Playwright supports Chromium, Firefox, and WebKit browsers, enabling cross-browser testing. Internet Explorer is not supported as it has been deprecated.',
      },
      {
        id: 'q3',
        type: 'true-false',
        question: 'Playwright can automatically wait for elements to be ready before performing actions.',
        points: 10,
        difficulty: 'easy',
        category: 'Auto-waiting',
        correctAnswer: true,
        explanation:
          'True. Playwright has built-in auto-waiting mechanisms that wait for elements to be actionable before performing operations, reducing the need for manual waits.',
      },
      {
        id: 'q4',
        type: 'code-snippet',
        question: 'What will the following code do?',
        points: 15,
        difficulty: 'medium',
        category: 'Locators',
        code: `await page.locator('button').click();`,
        language: 'typescript',
        allowMultiple: false,
        options: [
          { id: 'a', text: 'Click all buttons on the page', isCorrect: false },
          { id: 'b', text: 'Click the first button found on the page', isCorrect: true },
          { id: 'c', text: 'Throw an error if multiple buttons exist', isCorrect: false },
          { id: 'd', text: 'Do nothing', isCorrect: false },
        ],
        explanation:
          'The code will click the first button element found on the page. Playwright locators are lazy and are evaluated when an action is performed.',
      },
      {
        id: 'q5',
        type: 'multiple-choice',
        question: 'Which command is used to run Playwright tests?',
        points: 10,
        difficulty: 'easy',
        category: 'CLI',
        allowMultiple: false,
        options: [
          { id: 'a', text: 'npx playwright test', isCorrect: true },
          { id: 'b', text: 'npm test playwright', isCorrect: false },
          { id: 'c', text: 'playwright run', isCorrect: false },
          { id: 'd', text: 'node playwright', isCorrect: false },
        ],
        explanation: 'The command "npx playwright test" is used to run Playwright tests from the command line.',
      },
      {
        id: 'q6',
        type: 'true-false',
        question: 'Playwright tests can only be written in JavaScript.',
        points: 10,
        difficulty: 'easy',
        category: 'Languages',
        correctAnswer: false,
        explanation:
          'False. Playwright supports multiple programming languages including JavaScript, TypeScript, Python, Java, and .NET.',
      },
      {
        id: 'q7',
        type: 'multiple-choice',
        question: 'What does the "page" object represent in Playwright?',
        points: 10,
        difficulty: 'medium',
        category: 'Core Concepts',
        allowMultiple: false,
        options: [
          { id: 'a', text: 'A browser tab or window', isCorrect: true },
          { id: 'b', text: 'A DOM element', isCorrect: false },
          { id: 'c', text: 'The entire browser instance', isCorrect: false },
          { id: 'd', text: 'A test file', isCorrect: false },
        ],
        explanation:
          'The "page" object in Playwright represents a single browser tab or window. It provides methods to interact with the page content.',
      },
      {
        id: 'q8',
        type: 'code-snippet',
        question: 'What is the purpose of this code?',
        points: 15,
        difficulty: 'medium',
        category: 'Navigation',
        code: `await page.goto('https://example.com');`,
        language: 'typescript',
        allowMultiple: false,
        options: [
          { id: 'a', text: 'Navigate to the specified URL', isCorrect: true },
          { id: 'b', text: 'Open a new browser window', isCorrect: false },
          { id: 'c', text: 'Reload the current page', isCorrect: false },
          { id: 'd', text: 'Close the browser', isCorrect: false },
        ],
        explanation: 'The page.goto() method navigates to the specified URL and waits for the page to load.',
      },
    ],
  },
  {
    id: 'quiz-selenium-advanced',
    title: 'Advanced Selenium Concepts',
    description: 'Challenge your understanding of advanced Selenium WebDriver techniques',
    lessonId: 'lesson-selenium-advanced',
    moduleId: 'module-week4',
    timeLimit: 1200, // 20 minutes
    passingScore: 75,
    randomizeQuestions: true,
    randomizeOptions: true,
    allowReview: true,
    showExplanations: true,
    difficulty: 'hard',
    tags: ['selenium', 'webdriver', 'advanced'],
    createdAt: '2024-01-20T14:00:00Z',
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'Which design pattern is commonly used in Selenium test automation?',
        points: 10,
        difficulty: 'medium',
        category: 'Design Patterns',
        allowMultiple: false,
        options: [
          { id: 'a', text: 'Page Object Model (POM)', isCorrect: true },
          { id: 'b', text: 'Singleton Pattern', isCorrect: false },
          { id: 'c', text: 'Factory Pattern', isCorrect: false },
          { id: 'd', text: 'Observer Pattern', isCorrect: false },
        ],
        explanation:
          'Page Object Model (POM) is the most commonly used design pattern in Selenium to create an object repository for web UI elements, making tests more maintainable.',
      },
      {
        id: 'q2',
        type: 'multiple-choice',
        question: 'What are explicit waits used for in Selenium? (Select all that apply)',
        points: 15,
        difficulty: 'medium',
        category: 'Waits',
        allowMultiple: true,
        options: [
          {
            id: 'a',
            text: 'Waiting for specific conditions to be met',
            isCorrect: true,
          },
          {
            id: 'b',
            text: 'Pausing execution for a fixed time',
            isCorrect: false,
          },
          {
            id: 'c',
            text: 'Waiting for elements to be visible',
            isCorrect: true,
          },
          {
            id: 'd',
            text: 'Waiting for elements to be clickable',
            isCorrect: true,
          },
        ],
        explanation:
          'Explicit waits are used to wait for specific conditions like element visibility, clickability, or presence. They are more intelligent than fixed-time waits.',
      },
      {
        id: 'q3',
        type: 'true-false',
        question: 'Selenium Grid allows parallel test execution across multiple machines.',
        points: 10,
        difficulty: 'easy',
        category: 'Grid',
        correctAnswer: true,
        explanation:
          'True. Selenium Grid enables distributed test execution across multiple machines and browsers, allowing for parallel testing and faster execution.',
      },
      {
        id: 'q4',
        type: 'code-snippet',
        question: 'What does this code accomplish?',
        points: 15,
        difficulty: 'hard',
        category: 'Interactions',
        code: `Actions actions = new Actions(driver);
actions.moveToElement(element).click().build().perform();`,
        language: 'java',
        allowMultiple: false,
        options: [
          {
            id: 'a',
            text: 'Hover over an element and then click it',
            isCorrect: true,
          },
          { id: 'b', text: 'Double-click an element', isCorrect: false },
          { id: 'c', text: 'Right-click an element', isCorrect: false },
          { id: 'd', text: 'Drag and drop an element', isCorrect: false },
        ],
        explanation:
          'This code uses the Actions class to move the mouse to an element and then click it. This is useful for elements that require hover before clicking.',
      },
      {
        id: 'q5',
        type: 'multiple-choice',
        question: 'Which locator strategy is generally the most reliable?',
        points: 10,
        difficulty: 'medium',
        category: 'Locators',
        allowMultiple: false,
        options: [
          { id: 'a', text: 'ID', isCorrect: true },
          { id: 'b', text: 'XPath', isCorrect: false },
          { id: 'c', text: 'CSS Selector', isCorrect: false },
          { id: 'd', text: 'Link Text', isCorrect: false },
        ],
        explanation:
          'ID is generally the most reliable locator as it is unique on a page and performs faster than other locators. However, it requires elements to have IDs.',
      },
      {
        id: 'q6',
        type: 'true-false',
        question: 'Implicit waits apply globally to all elements in a WebDriver session.',
        points: 10,
        difficulty: 'medium',
        category: 'Waits',
        correctAnswer: true,
        explanation:
          'True. Implicit waits are set once and apply to all findElement() and findElements() calls throughout the WebDriver session.',
      },
    ],
  },
  {
    id: 'quiz-quick-test',
    title: 'Quick Knowledge Check',
    description: 'A short quiz with no time limit to test basic concepts',
    timeLimit: 0, // No time limit
    passingScore: 60,
    randomizeQuestions: false,
    randomizeOptions: false,
    allowReview: true,
    showExplanations: true,
    difficulty: 'easy',
    tags: ['quick', 'basics'],
    createdAt: '2024-01-25T09:00:00Z',
    questions: [
      {
        id: 'q1',
        type: 'true-false',
        question: 'Automated testing completely replaces the need for manual testing.',
        points: 10,
        difficulty: 'easy',
        category: 'Testing Concepts',
        correctAnswer: false,
        explanation:
          'False. While automated testing is powerful, manual testing is still important for exploratory testing, usability testing, and cases where automation is not feasible.',
      },
      {
        id: 'q2',
        type: 'multiple-choice',
        question: 'What is a locator in web automation?',
        points: 10,
        difficulty: 'easy',
        category: 'Fundamentals',
        allowMultiple: false,
        options: [
          {
            id: 'a',
            text: 'A way to identify and find elements on a web page',
            isCorrect: true,
          },
          { id: 'b', text: 'A type of browser', isCorrect: false },
          { id: 'c', text: 'A testing framework', isCorrect: false },
          { id: 'd', text: 'A design pattern', isCorrect: false },
        ],
        explanation:
          'A locator is a strategy or method used to identify and find elements on a web page, such as by ID, class name, XPath, or CSS selector.',
      },
      {
        id: 'q3',
        type: 'true-false',
        question: 'Both Playwright and Selenium can be used for API testing.',
        points: 10,
        difficulty: 'medium',
        category: 'Capabilities',
        correctAnswer: true,
        explanation:
          'True. While both are primarily known for browser automation, Playwright has built-in API testing capabilities, and Selenium can be combined with libraries like REST Assured for API testing.',
      },
    ],
  },
];

// Helper function to get quiz by ID
export const getQuizById = (id: string): Quiz | undefined => {
  return mockQuizzes.find((quiz) => quiz.id === id);
};

// Helper function to get quizzes by lesson
export const getQuizzesByLesson = (lessonId: string): Quiz[] => {
  return mockQuizzes.filter((quiz) => quiz.lessonId === lessonId);
};

// Helper function to get quizzes by difficulty
export const getQuizzesByDifficulty = (difficulty: 'easy' | 'medium' | 'hard'): Quiz[] => {
  return mockQuizzes.filter((quiz) => quiz.difficulty === difficulty);
};
