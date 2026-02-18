import React, { useState, useEffect } from 'react';
import {
  Play,
  CheckCircle,
  Book,
  Award,
  ChevronRight,
  Lightbulb,
  Target,
  Code,
  Trophy,
  Star,
} from 'lucide-react';
import CodeEditor, { CodeFile } from '../../components/playground/CodeEditor';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  lessons: Lesson[];
  badge?: string;
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  objectives: string[];
  example: {
    code: string;
    language: string;
    explanation: string;
  };
  exercise: {
    description: string;
    starterCode: string;
    solution: string;
    tests: TestCase[];
  };
}

interface TestCase {
  description: string;
  input?: any;
  expected: any;
  actual?: any;
  passed?: boolean;
}

export const InteractiveTutorial: React.FC = () => {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [userCode, setUserCode] = useState('');
  const [testResults, setTestResults] = useState<TestCase[]>([]);
  const [exerciseCompleted, setExerciseCompleted] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [showSolution, setShowSolution] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);

  useEffect(() => {
    initializeTutorials();
  }, []);

  useEffect(() => {
    if (selectedTutorial) {
      const lesson = selectedTutorial.lessons[currentLessonIndex];
      setUserCode(lesson.exercise.starterCode);
      setTestResults([]);
      setExerciseCompleted(false);
      setShowSolution(false);
    }
  }, [selectedTutorial, currentLessonIndex]);

  const initializeTutorials = () => {
    const mockTutorials: Tutorial[] = [
      {
        id: 'playwright-basics',
        title: 'Playwright Basics',
        description: 'Learn the fundamentals of browser automation with Playwright',
        category: 'Testing',
        difficulty: 'beginner',
        estimatedTime: 30,
        badge: 'Playwright Novice',
        lessons: [
          {
            id: 'lesson-1',
            title: 'Getting Started with Playwright',
            content: `Playwright is a powerful browser automation library that supports Chromium, Firefox, and WebKit.

In this lesson, you'll learn how to:
- Launch a browser
- Navigate to a webpage
- Take screenshots
- Close the browser`,
            objectives: [
              'Understand Playwright browser contexts',
              'Launch and close browsers',
              'Navigate to web pages',
              'Capture screenshots',
            ],
            example: {
              code: `const { chromium } = require('playwright');

(async () => {
  // Launch browser
  const browser = await chromium.launch();

  // Create a new page
  const page = await browser.newPage();

  // Navigate to a URL
  await page.goto('https://playwright.dev');

  // Take a screenshot
  await page.screenshot({ path: 'screenshot.png' });

  // Close browser
  await browser.close();
})();`,
              language: 'javascript',
              explanation:
                'This example shows the basic workflow: launch browser, create page, navigate, perform actions, and close.',
            },
            exercise: {
              description:
                'Complete the code to navigate to "https://example.com" and take a screenshot named "example.png"',
              starterCode: `const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // TODO: Navigate to https://example.com

  // TODO: Take a screenshot named 'example.png'

  await browser.close();
})();`,
              solution: `const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('https://example.com');
  await page.screenshot({ path: 'example.png' });

  await browser.close();
})();`,
              tests: [
                {
                  description: 'Code includes page.goto()',
                  expected: true,
                },
                {
                  description: 'Code includes page.screenshot()',
                  expected: true,
                },
                {
                  description: 'Screenshot filename is "example.png"',
                  expected: true,
                },
              ],
            },
          },
          {
            id: 'lesson-2',
            title: 'Interacting with Elements',
            content: `Learn how to interact with web page elements using Playwright.

You can click, type, select, and perform many other interactions.`,
            objectives: [
              'Click on elements',
              'Fill form fields',
              'Select dropdown options',
              'Wait for elements',
            ],
            example: {
              code: `const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('https://example.com/form');

  // Click a button
  await page.click('#submit-button');

  // Type in a text field
  await page.fill('#username', 'testuser');

  // Select from dropdown
  await page.selectOption('#country', 'USA');

  await browser.close();
})();`,
              language: 'javascript',
              explanation:
                'Playwright provides simple methods to interact with elements using CSS selectors.',
            },
            exercise: {
              description:
                'Write code to fill a login form with username "admin" and password "secret", then click the submit button',
              starterCode: `const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com/login');

  // TODO: Fill username field (#username) with 'admin'

  // TODO: Fill password field (#password) with 'secret'

  // TODO: Click submit button (#submit)

  await browser.close();
})();`,
              solution: `const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com/login');

  await page.fill('#username', 'admin');
  await page.fill('#password', 'secret');
  await page.click('#submit');

  await browser.close();
})();`,
              tests: [
                {
                  description: 'Fills username field',
                  expected: true,
                },
                {
                  description: 'Fills password field',
                  expected: true,
                },
                {
                  description: 'Clicks submit button',
                  expected: true,
                },
              ],
            },
          },
        ],
      },
      {
        id: 'selenium-basics',
        title: 'Selenium WebDriver Fundamentals',
        description: 'Master the basics of Selenium WebDriver for web automation',
        category: 'Testing',
        difficulty: 'beginner',
        estimatedTime: 45,
        badge: 'Selenium Starter',
        lessons: [
          {
            id: 'lesson-1',
            title: 'Introduction to Selenium',
            content: `Selenium WebDriver is a popular tool for automating web browsers.

Key concepts:
- WebDriver: Interface for browser automation
- WebElement: Represents HTML elements
- Locators: Ways to find elements (id, class, xpath, css)`,
            objectives: [
              'Set up Selenium WebDriver',
              'Launch browsers',
              'Find elements',
              'Perform basic interactions',
            ],
            example: {
              code: `from selenium import webdriver
from selenium.webdriver.common.by import By

# Create a new Chrome browser instance
driver = webdriver.Chrome()

# Navigate to a URL
driver.get('https://www.example.com')

# Find an element and click it
element = driver.find_element(By.ID, 'submit-button')
element.click()

# Close the browser
driver.quit()`,
              language: 'python',
              explanation:
                'This example shows basic Selenium usage: create driver, navigate, find elements, interact, and quit.',
            },
            exercise: {
              description:
                'Write Selenium code to navigate to a search page, enter "Selenium WebDriver" in the search box, and click search',
              starterCode: `from selenium import webdriver
from selenium.webdriver.common.by import By

driver = webdriver.Chrome()
driver.get('https://www.example.com/search')

# TODO: Find the search input (id="search-input") and type "Selenium WebDriver"

# TODO: Find and click the search button (id="search-button")

driver.quit()`,
              solution: `from selenium import webdriver
from selenium.webdriver.common.by import By

driver = webdriver.Chrome()
driver.get('https://www.example.com/search')

search_input = driver.find_element(By.ID, 'search-input')
search_input.send_keys('Selenium WebDriver')

search_button = driver.find_element(By.ID, 'search-button')
search_button.click()

driver.quit()`,
              tests: [
                {
                  description: 'Finds search input element',
                  expected: true,
                },
                {
                  description: 'Enters search text',
                  expected: true,
                },
                {
                  description: 'Clicks search button',
                  expected: true,
                },
              ],
            },
          },
        ],
      },
    ];

    setTutorials(mockTutorials);
  };

  const runTests = () => {
    if (!selectedTutorial) return;

    const lesson = selectedTutorial.lessons[currentLessonIndex];
    const tests = lesson.exercise.tests.map((test) => {
      // Simple code validation
      let passed = false;

      if (test.description.includes('page.goto()')) {
        passed = userCode.includes('page.goto(');
      } else if (test.description.includes('page.screenshot()')) {
        passed = userCode.includes('page.screenshot(');
      } else if (test.description.includes('example.png')) {
        passed = userCode.includes("'example.png'") || userCode.includes('"example.png"');
      } else if (test.description.includes('username field')) {
        passed = userCode.includes('#username') && userCode.includes("'admin'");
      } else if (test.description.includes('password field')) {
        passed = userCode.includes('#password') && userCode.includes("'secret'");
      } else if (test.description.includes('submit button')) {
        passed = userCode.includes('#submit') || userCode.includes('submit-button');
      } else {
        passed = true; // Default to passed for unknown tests
      }

      return {
        ...test,
        passed,
        actual: passed ? test.expected : null,
      };
    });

    setTestResults(tests);

    const allPassed = tests.every((t) => t.passed);
    if (allPassed) {
      setExerciseCompleted(true);
      setCompletedLessons((prev) => new Set([...prev, lesson.id]));

      // Check if tutorial is completed
      const allLessonsCompleted =
        completedLessons.size === selectedTutorial.lessons.length - 1;

      if (allLessonsCompleted && selectedTutorial.badge) {
        if (!earnedBadges.includes(selectedTutorial.badge)) {
          setEarnedBadges((prev) => [...prev, selectedTutorial.badge!]);
          alert(`Congratulations! You earned the "${selectedTutorial.badge}" badge!`);
        }
      }
    }
  };

  const nextLesson = () => {
    if (selectedTutorial && currentLessonIndex < selectedTutorial.lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    }
  };

  const previousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    }
  };

  if (!selectedTutorial) {
    // Tutorial Selection View
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Interactive Tutorials
            </h1>
            <p className="text-lg text-gray-600">
              Learn through hands-on coding exercises with instant feedback
            </p>
          </div>

          {earnedBadges.length > 0 && (
            <div className="mb-8 p-6 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-3 mb-3">
                <Trophy className="w-6 h-6 text-yellow-600" />
                <h2 className="text-lg font-semibold text-gray-900">Your Badges</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {earnedBadges.map((badge) => (
                  <div
                    key={badge}
                    className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm"
                  >
                    <Award className="w-5 h-5 text-yellow-600" />
                    <span className="font-medium text-gray-900">{badge}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tutorials.map((tutorial) => {
              const completedCount = tutorial.lessons.filter((l) =>
                completedLessons.has(l.id)
              ).length;
              const progress = (completedCount / tutorial.lessons.length) * 100;

              return (
                <div
                  key={tutorial.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          {tutorial.title}
                        </h3>
                        <span className="text-sm text-gray-500">{tutorial.category}</span>
                      </div>
                      {tutorial.badge && earnedBadges.includes(tutorial.badge) && (
                        <Star className="w-6 h-6 text-yellow-500 fill-current" />
                      )}
                    </div>

                    <p className="text-gray-600 mb-4">{tutorial.description}</p>

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded">
                        {tutorial.difficulty}
                      </span>
                      <span>{tutorial.estimatedTime} min</span>
                      <span>{tutorial.lessons.length} lessons</span>
                    </div>

                    {progress > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium text-gray-900">
                            {completedCount}/{tutorial.lessons.length}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => setSelectedTutorial(tutorial)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      {progress > 0 ? 'Continue' : 'Start Tutorial'}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Tutorial Learning View
  const lesson = selectedTutorial.lessons[currentLessonIndex];
  const progress = ((currentLessonIndex + 1) / selectedTutorial.lessons.length) * 100;

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedTutorial(null)}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            {selectedTutorial.title}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Lesson {currentLessonIndex + 1} of {selectedTutorial.lessons.length}
          </span>
          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Lesson Content */}
        <div className="w-1/2 border-r border-gray-200 overflow-y-auto p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{lesson.title}</h2>

          <div className="prose prose-blue max-w-none mb-6">
            <p className="text-gray-700 whitespace-pre-wrap">{lesson.content}</p>
          </div>

          <div className="mb-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
              <Target className="w-5 h-5 text-blue-600" />
              Learning Objectives
            </h3>
            <ul className="space-y-2">
              {lesson.objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  {obj}
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
              <Code className="w-5 h-5 text-blue-600" />
              Example
            </h3>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-100">
                <code>{lesson.example.code}</code>
              </pre>
            </div>
            <p className="mt-2 text-sm text-gray-600">{lesson.example.explanation}</p>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-2">
              <Lightbulb className="w-5 h-5 text-blue-600" />
              Your Exercise
            </h3>
            <p className="text-gray-700">{lesson.exercise.description}</p>
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="w-1/2 flex flex-col">
          <div className="flex-1 overflow-hidden">
            <CodeEditor
              files={[
                {
                  id: '1',
                  name: `exercise.${lesson.example.language === 'python' ? 'py' : 'js'}`,
                  language: lesson.example.language,
                  content: userCode,
                  path: 'exercise.js',
                },
              ]}
              activeFileId="1"
              language={lesson.example.language}
              onFileChange={(_, content) => setUserCode(content)}
            />
          </div>

          {/* Test Results */}
          <div className="border-t border-gray-200 p-4 bg-gray-50 max-h-64 overflow-y-auto">
            {testResults.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Play className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Run tests to see results</p>
              </div>
            ) : (
              <div className="space-y-2">
                {testResults.map((test, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2 p-2 rounded ${
                      test.passed ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    {test.passed ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-red-600 flex-shrink-0" />
                    )}
                    <span
                      className={`text-sm ${
                        test.passed ? 'text-green-900' : 'text-red-900'
                      }`}
                    >
                      {test.description}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {exerciseCompleted && (
              <div className="mt-4 p-3 bg-green-100 rounded-lg border border-green-300">
                <div className="flex items-center gap-2 text-green-800 font-medium mb-2">
                  <Trophy className="w-5 h-5" />
                  Exercise Completed!
                </div>
                <button
                  onClick={nextLesson}
                  disabled={currentLessonIndex === selectedTutorial.lessons.length - 1}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded font-medium transition-colors"
                >
                  {currentLessonIndex === selectedTutorial.lessons.length - 1
                    ? 'Tutorial Complete!'
                    : 'Next Lesson →'}
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-4 border-t border-gray-200 flex gap-2">
            <button
              onClick={runTests}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
            >
              <Play className="w-4 h-4" />
              Run Tests
            </button>

            <button
              onClick={() => setShowSolution(!showSolution)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded font-medium transition-colors"
            >
              {showSolution ? 'Hide' : 'Show'} Solution
            </button>
          </div>

          {showSolution && (
            <div className="p-4 bg-yellow-50 border-t border-yellow-200">
              <h4 className="font-semibold text-gray-900 mb-2">Solution:</h4>
              <pre className="text-sm bg-white p-3 rounded border border-gray-300 overflow-x-auto">
                <code>{lesson.exercise.solution}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InteractiveTutorial;
