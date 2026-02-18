
# Playwright + Selenium Learning Platform - Comprehensive Implementation Prompt

## Executive Summary

Build a production-ready, full-stack learning platform that teaches Playwright (JavaScript/TypeScript) and Selenium (Java) to developers with basic-medium JavaScript and medium Java knowledge. The platform must be completable in 30-60 days and include a React PWA frontend, spaced repetition system (SRS), automated assessments, and CI/CD integration.

---

## 🎯 Project Objectives

### Primary Goals
1. **Curriculum Delivery**: Structured 30-day (intensive) and 60-day (extended) learning tracks
2. **Interactive Learning**: Hands-on coding exercises with instant feedback
3. **Knowledge Retention**: SM-2 algorithm-based spaced repetition system
4. **Assessment System**: Automated quizzes, coding challenges, and project evaluations
5. **Progressive Web App**: Offline-capable, installable learning platform
6. **CI/CD Integration**: Automated testing and grading infrastructure

### Success Metrics
- Learner can write production-ready Playwright and Selenium tests
- 80%+ knowledge retention after 30 days (measured via SRS)
- All exercises auto-gradable with detailed feedback
- PWA achieves 90+ Lighthouse score
- Platform works offline with full SRS functionality

---

## 📚 Curriculum Structure

### 30-Day Intensive Track

#### Week 1: Foundations (Days 1-7)
**Day 1-2: Environment Setup & Tooling**
- Objectives:
  - Install Node.js, Java JDK, Maven/Gradle
  - Set up VS Code with extensions (Playwright Test, Java Extension Pack)
  - Initialize Playwright and Selenium projects
  - Run first "Hello World" tests
- Deliverables:
  - Working Playwright project with sample test
  - Working Selenium Java project with sample test
  - Screenshot of successful test runs
- Assessment: MCQ on tooling + verify test execution screenshots

**Day 3-4: Browser Automation Basics**
- Objectives:
  - Understand browser automation concepts
  - Learn Playwright vs Selenium differences
  - Master basic navigation and interactions
- Topics:
  - Browser contexts and pages
  - Navigation methods
  - Basic element interactions (click, type, select)
- Hands-on:
  - Automate login flow in Playwright
  - Automate login flow in Selenium
  - Compare code patterns
- Assessment: Code exercise - automate a 3-step user flow

**Day 5-7: Selectors & Locators Mastery**
- Objectives:
  - Master CSS selectors, XPath, and Playwright locators
  - Understand selector best practices
  - Learn selector debugging techniques
- Topics:
  - CSS selectors (class, id, attribute, pseudo-classes)
  - XPath axes and functions
  - Playwright locators (getByRole, getByText, getByTestId)
  - Selector priority and resilience
- Hands-on:
  - Build selector playground tool
  - Refactor brittle selectors to resilient ones
  - Create page object with optimal selectors
- Assessment: Selector challenge - find 10 elements using different strategies
- SRS Cards: 15 cards on selector syntax and best practices

#### Week 2: Intermediate Automation (Days 8-14)
**Day 8-10: Waits, Assertions & Synchronization**
- Objectives:
  - Eliminate flaky tests with proper waits
  - Master assertion libraries
  - Handle dynamic content
- Topics:
  - Explicit vs implicit waits
  - Playwright auto-waiting
  - Custom wait conditions
  - Assertion libraries (expect, AssertJ)
- Hands-on:
  - Fix 5 flaky tests
  - Implement custom wait conditions
  - Test AJAX-heavy application
- Assessment: Debug and fix flaky test suite
- SRS Cards: 12 cards on wait strategies

**Day 11-14: Page Object Model & Test Architecture**
- Objectives:
  - Design maintainable test suites
  - Implement Page Object Model (POM)
  - Organize test data and fixtures
- Topics:
  - POM principles and patterns
  - Base page classes
  - Test data management
  - Fixtures and hooks
- Hands-on:
  - Refactor tests to POM
  - Create reusable components
  - Implement test data factory
- Project: Build POM for e-commerce site (3 pages minimum)
- Assessment: Code review of POM implementation
- SRS Cards: 10 cards on design patterns

#### Week 3: Advanced Features (Days 15-21)
**Day 15-17: Advanced Playwright**
- Objectives:
  - Master Playwright-specific features
  - Implement network interception
  - Handle authentication and storage state
- Topics:
  - Network mocking and interception
  - Request/response manipulation
  - Authentication state management
  - File uploads and downloads
  - Multi-tab and iframe handling
- Hands-on:
  - Mock API responses
  - Implement login state reuse
  - Test file upload/download
- Assessment: Build test suite with network mocking
- SRS Cards: 15 cards on Playwright APIs

**Day 18-21: Cross-Browser & Parallel Testing**
- Objectives:
  - Run tests across browsers
  - Implement parallel execution
  - Configure test runners
- Topics:
  - Browser configuration (Chromium, Firefox, WebKit)
  - Parallel test execution
  - Test sharding
  - Reporters and artifacts
- Hands-on:
  - Configure multi-browser tests
  - Optimize test execution time
  - Generate HTML reports
- Assessment: Optimize test suite to run in <2 minutes
- SRS Cards: 8 cards on test configuration

#### Week 4: Integration & Capstone (Days 22-30)
**Day 22-25: React PWA Testing**
- Objectives:
  - Test React applications
  - Verify PWA functionality
  - Implement visual regression testing
- Topics:
  - Component testing vs E2E testing
  - Testing React hooks and state
  - PWA manifest and service worker testing
  - Accessibility testing
- Hands-on:
  - Write E2E tests for React PWA
  - Verify offline functionality
  - Run accessibility audits
- Assessment: Test suite for React PWA with 80% coverage
- SRS Cards: 12 cards on React testing patterns

**Day 26-30: Capstone Project & CI/CD**
- Objectives:
  - Build complete test automation framework
  - Integrate with CI/CD pipeline
  - Present final project
- Capstone Requirements:
  - Test framework for provided React PWA
  - Both Playwright and Selenium implementations
  - Page Object Model architecture
  - Parallel execution configured
  - CI/CD pipeline (GitHub Actions)
  - Test report generation
  - README with setup instructions
- Assessment: 
  - Code review (40%)
  - Test coverage (30%)
  - CI/CD integration (20%)
  - Documentation (10%)

### 60-Day Extended Track

Follows same modules with:
- 2x time per module for deeper exploration
- Additional exercises per topic
- Weekly code review sessions
- Mid-module mini-projects
- Peer review assignments
- Advanced topics:
  - Visual regression testing (Percy/Applitools)
  - Performance testing integration
  - Docker containerization
  - Test data generation strategies
  - Advanced reporting (Allure)

---

## 🏗️ Technical Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     React PWA Frontend                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Dashboard │  │ Lessons  │  │Flashcards│  │Exercises │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│         │              │              │              │       │
│         └──────────────┴──────────────┴──────────────┘       │
│                        │                                      │
│                   ┌────▼────┐                                │
│                   │ Service │                                │
│                   │ Worker  │                                │
│                   └────┬────┘                                │
│                        │                                      │
│              ┌─────────┴─────────┐                          │
│              │                   │                          │
│         ┌────▼────┐        ┌────▼────┐                     │
│         │IndexedDB│        │  Cache  │                     │
│         └─────────┘        └─────────┘                     │
└─────────────────────────────────────────────────────────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
         ┌──────────▼──────┐   ┌─────▼──────┐
         │  Backend API    │   │   GitHub   │
         │  (Optional)     │   │   Actions  │
         └─────────────────┘   └────────────┘
                │                     │
         ┌──────┴──────┐       ┌─────┴──────┐
         │  PostgreSQL │       │ Playwright │
         │  or SQLite  │       │  Selenium  │
         └─────────────┘       └────────────┘
```

### Frontend Architecture (React PWA)

#### Technology Stack
```json
{
  "core": {
    "react": "^18.2.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  },
  "routing": {
    "react-router-dom": "^6.20.0"
  },
  "state": {
    "zustand": "^4.4.0",
    "react-query": "^5.0.0"
  },
  "ui": {
    "tailwindcss": "^3.4.0",
    "shadcn-ui": "latest",
    "lucide-react": "^0.300.0"
  },
  "pwa": {
    "vite-plugin-pwa": "^0.17.0",
    "workbox-window": "^7.0.0"
  },
  "storage": {
    "idb": "^8.0.0"
  },
  "code": {
    "monaco-editor": "^0.45.0",
    "@monaco-editor/react": "^4.6.0"
  },
  "testing": {
    "@playwright/test": "^1.40.0",
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.0.0"
  }
}
```

#### Project Structure
```
frontend/
├── public/
│   ├── manifest.json
│   ├── icons/
│   │   ├── icon-72x72.png
│   │   ├── icon-96x96.png
│   │   ├── icon-128x128.png
│   │   ├── icon-144x144.png
│   │   ├── icon-152x152.png
│   │   ├── icon-192x192.png
│   │   ├── icon-384x384.png
│   │   └── icon-512x512.png
│   └── robots.txt
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── vite-env.d.ts
│   ├── components/
│   │   ├── ui/                    # shadcn components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── progress.tsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Layout.tsx
│   │   ├── lessons/
│   │   │   ├── LessonCard.tsx
│   │   │   ├── LessonPlayer.tsx
│   │   │   ├── CodeExample.tsx
│   │   │   └── LessonProgress.tsx
│   │   ├── flashcards/
│   │   │   ├── FlashCard.tsx
│   │   │   ├── CardDeck.tsx
│   │   │   ├── ReviewSession.tsx
│   │   │   └── QualityButtons.tsx
│   │   ├── exercises/
│   │   │   ├── CodeEditor.tsx
│   │   │   ├── ExerciseRunner.tsx
│   │   │   ├── TestResults.tsx
│   │   │   └── HintSystem.tsx
│   │   └── dashboard/
│   │       ├── ProgressChart.tsx
│   │       ├── StreakCounter.tsx
│   │       ├── UpcomingReviews.tsx
│   │       └── AchievementBadges.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Lessons.tsx
│   │   ├── LessonDetail.tsx
│   │   ├── Flashcards.tsx
│   │   ├── Exercises.tsx
│   │   ├── Projects.tsx
│   │   ├── Progress.tsx
│   │   └── Settings.tsx
│   ├── lib/
│   │   ├── srs/
│   │   │   ├── sm2-algorithm.ts
│   │   │   ├── card-scheduler.ts
│   │   │   └── types.ts
│   │   ├── db/
│   │   │   ├── schema.ts
│   │   │   ├── operations.ts
│   │   │   └── sync.ts
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   └── endpoints.ts
│   │   └── utils/
│   │       ├── date.ts
│   │       ├── storage.ts
│   │       └── validation.ts
│   ├── hooks/
│   │   ├── useSRS.ts
│   │   ├── useProgress.ts
│   │   ├── useOfflineSync.ts
│   │   └── useLessonState.ts
│   ├── stores/
│   │   ├── authStore.ts
│   │   ├── progressStore.ts
│   │   ├── srsStore.ts
│   │   └── settingsStore.ts
│   ├── data/
│   │   ├── curriculum/
│   │   │   ├── 30-day/
│   │   │   │   ├── week1/
│   │   │   │   │   ├── day1.json
│   │   │   │   │   └── ...
│   │   │   │   └── ...
│   │   │   └── 60-day/
│   │   │       └── ...
│   │   ├── flashcards/
│   │   │   ├── playwright-basics.json
│   │   │   ├── selenium-basics.json
│   │   │   └── ...
│   │   └── exercises/
│   │       ├── selectors-challenge.json
│   │       └── ...
│   ├── styles/
│   │   ├── globals.css
│   │   └── themes.css
│   └── types/
│       ├── curriculum.ts
│       ├── srs.ts
│       ├── exercise.ts
│       └── user.ts
├── tests/
│   ├── e2e/
│   │   ├── auth.spec.ts
│   │   ├── lessons.spec.ts
│   │   ├── flashcards.spec.ts
│   │   └── offline.spec.ts
│   └── unit/
│       ├── srs.test.ts
│       └── utils.test.ts
├── playwright.config.ts
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

#### Key Component Specifications

**1. SRS Implementation (SM-2 Algorithm)**

```typescript
// src/lib/srs/types.ts
export interface SRSCard {
  id: string;
  front: string;
  back: string;
  ease: number;        // Easiness factor (default: 2.5)
  interval: number;    // Days until next review
  repetitions: number; // Number of successful reviews
  due: Date;          // Next review date
  tags: string[];
  category: 'playwright' | 'selenium' | 'general';
  difficulty: 'easy' | 'medium' | 'hard';
  history: ReviewHistory[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewHistory {
  date: Date;
  quality: number;     // 0-5 rating
  timeSpent: number;   // Seconds
  previousInterval: number;
  newInterval: number;
}

export type QualityRating = 0 | 1 | 2 | 3 | 4 | 5;
// 0: Complete blackout
// 1: Incorrect, but familiar
// 2: Incorrect, but easy to recall
// 3: Correct, but difficult
// 4: Correct, with hesitation
// 5: Perfect recall

// src/lib/srs/sm2-algorithm.ts
export class SM2Scheduler {
  /**
   * Calculate next review date using SM-2 algorithm
   * @param card Current card state
   * @param quality Quality rating (0-5)
   * @returns Updated card with new scheduling
   */
  static scheduleNext(card: SRSCard, quality: QualityRating): SRSCard {
    let { ease, interval, repetitions } = card;
    
    // Update easiness factor
    ease = Math.max(1.3, ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
    
    // Calculate new interval
    if (quality < 3) {
      // Failed recall - reset
      repetitions = 0;
      interval = 1;
    } else {
      repetitions += 1;
      if (repetitions === 1) {
        interval = 1;
      } else if (repetitions === 2) {
        interval = 6;
      } else {
        interval = Math.round(interval * ease);
      }
    }
    
    const due = new Date();
    due.setDate(due.getDate() + interval);
    
    return {
      ...card,
      ease,
      interval,
      repetitions,
      due,
      updatedAt: new Date(),
      history: [
        ...card.history,
        {
          date: new Date(),
          quality,
          timeSpent: 0, // Track separately
          previousInterval: card.interval,
          newInterval: interval
        }
      ]
    };
  }
  
  /**
   * Get cards due for review
   */
  static getDueCards(cards: SRSCard[]): SRSCard[] {
    const now = new Date();
    return cards
      .filter(card => card.due <= now)
      .sort((a, b) => a.due.getTime() - b.due.getTime());
  }
  
  /**
   * Get upcoming review schedule
   */
  static getUpcomingReviews(cards: SRSCard[], days: number = 7): Map<string, number> {
    const schedule = new Map<string, number>();
    const now = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      
      const count = cards.filter(card => {
        const cardDate = card.due.toISOString().split('T')[0];
        return cardDate === dateKey;
      }).length;
      
      schedule.set(dateKey, count);
    }
    
    return schedule;
  }
}
```

**2. IndexedDB Schema**

```typescript
// src/lib/db/schema.ts
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface LearningPlatformDB extends DBSchema {
  cards: {
    key: string;
    value: SRSCard;
    indexes: {
      'by-due': Date;
      'by-category': string;
      'by-tags': string;
    };
  };
  progress: {
    key: string;
    value: {
      lessonId: string;
      completed: boolean;
      score: number;
      timeSpent: number;
      lastAccessed: Date;
    };
  };
  exercises: {
    key: string;
    value: {
      exerciseId: string;
      attempts: number;
      passed: boolean;
      code: string;
      lastAttempt: Date;
    };
  };
  syncQueue: {
    key: number;
    value: {
      type: 'card' | 'progress' | 'exercise';
      action: 'create' | 'update' | 'delete';
      data: any;
      timestamp: Date;
    };
  };
}

export async function initDB(): Promise<IDBPDatabase<LearningPlatformDB>> {
  return openDB<LearningPlatformDB>('learning-platform', 1, {
    upgrade(db) {
      // Cards store
      const cardStore = db.createObjectStore('cards', { keyPath: 'id' });
      cardStore.createIndex('by-due', 'due');
      cardStore.createIndex('by-category', 'category');
      cardStore.createIndex('by-tags', 'tags', { multiEntry: true });
      
      // Progress store
      db.createObjectStore('progress', { keyPath: 'lessonId' });
      
      // Exercises store
      db.createObjectStore('exercises', { keyPath: 'exerciseId' });
      
      // Sync queue
      db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
    }
  });
}
```

**3. Service Worker Configuration**

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'icons/*.png'],
      manifest: {
        name: 'Playwright & Selenium Learning Platform',
        short_name: 'Test Automation Academy',
        description: 'Master Playwright and Selenium in 30-60 days',
        theme_color: '#4F46E5',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icons/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png'
          },
          {
            src: 'icons/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png'
          },
          {
            src: 'icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: 'icons/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png'
          },
          {
            src: 'icons/icon-152x152.png',
            sizes: '152x152',
            type: 'image/png'
          },
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      }
    })
  ]
});
```

**4. Code Editor Component**

```typescript
// src/components/exercises/CodeEditor.tsx
import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Play, RotateCcw, Lightbulb } from 'lucide-react';

interface CodeEditorProps {
  language: 'javascript' | 'typescript' | 'java';
  initialCode: string;
  testCode: string;
  onRun: (code: string) => Promise<TestResult>;
  hints?: string[];
}

interface TestResult {
  passed: boolean;
  output: string;
  errors?: string[];
  coverage?: number;
}

export function CodeEditor({ language, initialCode, testCode, onRun, hints }: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const editorRef = useRef(null);

  const handleRun = async () => {
    setLoading(true);
    try {
      const testResult = await onRun(code);
      setResult(testResult);
    } catch (error) {
      setResult({
        passed: false,
        output: '',
        errors: [error.message]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCode(initialCode);
    setResult(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex gap-2">
          <Button onClick={handleRun} disabled={loading}>
            <Play className="w-4 h-4 mr-2" />
            {loading ? 'Running...' : 'Run Tests'}
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
        {hints && hints.length > 0 && (
          <Button variant="ghost" onClick={() => setShowHints(!showHints)}>
            <Lightbulb className="w-4 h-4 mr-2" />
            Hints ({hints.length})
          </Button>
        )}
      </div>

      <div className="flex-1 grid grid-cols-2 gap-4 p-4">
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-100 px-4 py-2 text-sm font-medium">
            Your Code
          </div>
          <Editor
            height="100%"
            language={language}
            value={code}
            onChange={(value) => setCode(value || '')}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true
            }}
            onMount={(editor) => {
              editorRef.current = editor;
            }}
          />
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-100 px-4 py-2 text-sm font-medium">
            Test Results
          </div>
          <div className="p-4 h-full overflow-auto bg-gray-900 text-white font-mono text-sm">
            {result ? (
              <div>
                <div className={`mb-4 ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
                  {result.passed ? '✓ All tests passed!' : '✗ Tests failed'}
                </div>
                <pre className="whitespace-pre-wrap">{result.output}</pre>
                {result.errors && result.errors.length > 0 && (
                  <div className="mt-4 text-red-400">
                    <div className="font-bold">Errors:</div>
                    {result.errors.map((error, i) => (
                      <div key={i} className="mt-2">{error}</div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-400">
                Click "Run Tests" to see results
              </div>
            )}
          </div>
        </div>
      </div>

      {showHints && hints && (
        <div className="border-t p-4 bg-yellow-50">
          <h3 className="font-medium mb-2">Hints:</h3>
          <ol className="list-decimal list-inside space-y-1">
            {hints.map((hint, i) => (
              <li key={i} className="text-sm">{hint}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
```

### Playwright Runner Project

```
playwright-runner/
├── tests/
│   ├── examples/
│   │   ├── 01-basic-navigation.spec.ts
│   │   ├── 02-selectors.spec.ts
│   │   ├── 03-interactions.spec.ts
│   │   ├── 04-assertions.spec.ts
│   │   ├── 05-waits.spec.ts
│   │   ├── 06-page-objects.spec.ts
│   │   ├── 07-fixtures.spec.ts
│   │   ├── 08-network-mocking.spec.ts
│   │   ├── 09-authentication.spec.ts
│   │   └── 10-file-handling.spec.ts
│   ├── exercises/
│   │   ├── exercise-01-login.spec.ts
│   │   ├── exercise-02-form-validation.spec.ts
│   │   └── ...
│   └── capstone/
│       └── ecommerce-suite.spec.ts
├── pages/
│   ├── BasePage.ts
│   ├── LoginPage.ts
│
│   ├── HomePage.ts
│   ├── ProductPage.ts
│   └── CheckoutPage.ts
├── fixtures/
│   ├── test-data.ts
│   ├── custom-fixtures.ts
│   └── auth.setup.ts
├── utils/
│   ├── helpers.ts
│   ├── test-helpers.ts
│   └── reporters.ts
├── playwright.config.ts
├── package.json
└── README.md
```

**Example Test Files:**

```typescript
// tests/examples/01-basic-navigation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Basic Navigation', () => {
  test('should navigate to homepage', async ({ page }) => {
    await page.goto('https://example.com');
    await expect(page).toHaveTitle(/Example Domain/);
  });

  test('should navigate using links', async ({ page }) => {
    await page.goto('https://example.com');
    await page.click('a[href="/about"]');
    await expect(page).toHaveURL(/.*about/);
  });
});

// tests/examples/06-page-objects.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';

test.describe('Page Object Model', () => {
  test('should login using page objects', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);

    await loginPage.goto();
    await loginPage.login('user@example.com', 'password123');
    
    await expect(homePage.welcomeMessage).toBeVisible();
  });
});

// pages/BasePage.ts
import { Page, Locator } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(path: string = '') {
    await this.page.goto(`${process.env.BASE_URL}${path}`);
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }
}

// pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.errorMessage = page.getByRole('alert');
  }

  async goto() {
    await super.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async getErrorMessage(): Promise<string> {
    return await this.errorMessage.textContent() || '';
  }
}

// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'junit.xml' }]
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Selenium Java Project

```
selenium-java/
├── src/
│   ├── main/
│   │   └── java/
│   │       └── com/
│   │           └── testautomation/
│   │               ├── pages/
│   │               │   ├── BasePage.java
│   │               │   ├── LoginPage.java
│   │               │   ├── HomePage.java
│   │               │   └── ProductPage.java
│   │               ├── utils/
│   │               │   ├── DriverFactory.java
│   │               │   ├── ConfigReader.java
│   │               │   ├── WaitHelper.java
│   │               │   └── ScreenshotHelper.java
│   │               └── config/
│   │                   └── TestConfig.java
│   └── test/
│       ├── java/
│       │   └── com/
│       │       └── testautomation/
│       │           ├── tests/
│       │           │   ├── BaseTest.java
│       │           │   ├── LoginTests.java
│       │           │   ├── NavigationTests.java
│       │           │   ├── FormTests.java
│       │           │   └── E2ETests.java
│       │           └── exercises/
│       │               ├── Exercise01_Selectors.java
│       │               ├── Exercise02_Waits.java
│       │               └── Exercise03_PageObjects.java
│       └── resources/
│           ├── config.properties
│           ├── testdata/
│           │   ├── users.json
│           │   └── products.json
│           └── drivers/
│               └── .gitkeep
├── pom.xml
└── README.md
```

**Example Java Files:**

```java
// src/main/java/com/testautomation/pages/BasePage.java
package com.testautomation.pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.support.ui.ExpectedConditions;
import java.time.Duration;

public class BasePage {
    protected WebDriver driver;
    protected WebDriverWait wait;
    
    public BasePage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        PageFactory.initElements(driver, this);
    }
    
    protected void waitForElement(WebElement element) {
        wait.until(ExpectedConditions.visibilityOf(element));
    }
    
    protected void waitForClickable(WebElement element) {
        wait.until(ExpectedConditions.elementToBeClickable(element));
    }
    
    public String getPageTitle() {
        return driver.getTitle();
    }
}

// src/main/java/com/testautomation/pages/LoginPage.java
package com.testautomation.pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

public class LoginPage extends BasePage {
    
    @FindBy(id = "email")
    private WebElement emailInput;
    
    @FindBy(id = "password")
    private WebElement passwordInput;
    
    @FindBy(css = "button[type='submit']")
    private WebElement loginButton;
    
    @FindBy(css = ".error-message")
    private WebElement errorMessage;
    
    public LoginPage(WebDriver driver) {
        super(driver);
    }
    
    public void navigateTo() {
        driver.get(System.getProperty("base.url", "http://localhost:3000") + "/login");
    }
    
    public void enterEmail(String email) {
        waitForElement(emailInput);
        emailInput.clear();
        emailInput.sendKeys(email);
    }
    
    public void enterPassword(String password) {
        waitForElement(passwordInput);
        passwordInput.clear();
        passwordInput.sendKeys(password);
    }
    
    public void clickLogin() {
        waitForClickable(loginButton);
        loginButton.click();
    }
    
    public void login(String email, String password) {
        enterEmail(email);
        enterPassword(password);
        clickLogin();
    }
    
    public String getErrorMessage() {
        waitForElement(errorMessage);
        return errorMessage.getText();
    }
    
    public boolean isErrorDisplayed() {
        try {
            return errorMessage.isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }
}

// src/test/java/com/testautomation/tests/BaseTest.java
package com.testautomation.tests;

import com.testautomation.utils.DriverFactory;
import org.openqa.selenium.WebDriver;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Parameters;

public class BaseTest {
    protected WebDriver driver;
    
    @BeforeMethod
    @Parameters({"browser"})
    public void setUp(String browser) {
        driver = DriverFactory.createDriver(browser);
        driver.manage().window().maximize();
    }
    
    @AfterMethod
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }
}

// src/test/java/com/testautomation/tests/LoginTests.java
package com.testautomation.tests;

import com.testautomation.pages.LoginPage;
import com.testautomation.pages.HomePage;
import org.testng.Assert;
import org.testng.annotations.Test;

public class LoginTests extends BaseTest {
    
    @Test(description = "Verify successful login with valid credentials")
    public void testSuccessfulLogin() {
        LoginPage loginPage = new LoginPage(driver);
        loginPage.navigateTo();
        loginPage.login("user@example.com", "password123");
        
        HomePage homePage = new HomePage(driver);
        Assert.assertTrue(homePage.isWelcomeMessageDisplayed(), 
            "Welcome message should be displayed after login");
    }
    
    @Test(description = "Verify error message with invalid credentials")
    public void testInvalidLogin() {
        LoginPage loginPage = new LoginPage(driver);
        loginPage.navigateTo();
        loginPage.login("invalid@example.com", "wrongpassword");
        
        Assert.assertTrue(loginPage.isErrorDisplayed(), 
            "Error message should be displayed");
        Assert.assertEquals(loginPage.getErrorMessage(), 
            "Invalid email or password", 
            "Error message text should match");
    }
}

// pom.xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.testautomation</groupId>
    <artifactId>selenium-java</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <selenium.version>4.16.0</selenium.version>
        <testng.version>7.8.0</testng.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.seleniumhq.selenium</groupId>
            <artifactId>selenium-java</artifactId>
            <version>${selenium.version}</version>
        </dependency>
        <dependency>
            <groupId>org.testng</groupId>
            <artifactId>testng</artifactId>
            <version>${testng.version}</version>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>io.github.bonigarcia</groupId>
            <artifactId>webdrivermanager</artifactId>
            <version>5.6.2</version>
        </dependency>
        <dependency>
            <groupId>org.assertj</groupId>
            <artifactId>assertj-core</artifactId>
            <version>3.24.2</version>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-surefire-plugin</artifactId>
                <version>3.2.2</version>
                <configuration>
                    <suiteXmlFiles>
                        <suiteXmlFile>testng.xml</suiteXmlFile>
                    </suiteXmlFiles>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

---

## 📊 Assessment System

### Assessment Types

#### 1. Multiple Choice Quizzes (MCQ)

```typescript
// src/types/assessment.ts
export interface Quiz {
  id: string;
  title: string;
  description: string;
  timeLimit: number; // minutes
  passingScore: number; // percentage
  questions: Question[];
  category: 'playwright' | 'selenium' | 'general';
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Question {
  id: string;
  type: 'single' | 'multiple' | 'true-false';
  question: string;
  code?: string; // Optional code snippet
  options: Option[];
  correctAnswers: string[]; // Option IDs
  explanation: string;
  points: number;
}

export interface Option {
  id: string;
  text: string;
  code?: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  answers: Map<string, string[]>; // questionId -> optionIds
  score: number;
  passed: boolean;
  startedAt: Date;
  completedAt: Date;
  timeSpent: number; // seconds
}
```

**Example Quiz Data:**

```json
{
  "id": "quiz-playwright-selectors",
  "title": "Playwright Selectors Mastery",
  "description": "Test your knowledge of Playwright selector strategies",
  "timeLimit": 15,
  "passingScore": 80,
  "category": "playwright",
  "difficulty": "medium",
  "questions": [
    {
      "id": "q1",
      "type": "single",
      "question": "Which Playwright locator is most resilient to UI changes?",
      "options": [
        { "id": "a", "text": "page.locator('#submit-button')" },
        { "id": "b", "text": "page.getByRole('button', { name: 'Submit' })" },
        { "id": "c", "text": "page.locator('button.btn-primary')" },
        { "id": "d", "text": "page.locator('xpath=//button[1]')" }
      ],
      "correctAnswers": ["b"],
      "explanation": "getByRole with accessible name is most resilient as it relies on semantic HTML and accessibility attributes, which are less likely to change than IDs or classes.",
      "points": 10
    }
  ]
}
```

#### 2. Coding Exercises

```typescript
export interface CodingExercise {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  language: 'javascript' | 'typescript' | 'java';
  framework: 'playwright' | 'selenium';
  starterCode: string;
  testCode: string;
  solution: string;
  hints: string[];
  timeEstimate: number; // minutes
  learningObjectives: string[];
}
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflows

```yaml
# .github/workflows/playwright.yml
name: Playwright Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    strategy:
      matrix:
        browser: [chromium, firefox, webkit]
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps ${{ matrix.browser }}
      - name: Run Playwright tests
        run: npx playwright test --project=${{ matrix.browser }}
```

---

## 📋 Implementation Checklist

### Phase 1: Foundation (Weeks 1-2)

- [ ] **Project Setup**
  - [ ] Initialize monorepo structure
  - [ ] Set up frontend (React + Vite + TypeScript)
  - [ ] Set up Playwright runner project
  - [ ] Set up Selenium Java project
  - [ ] Configure ESLint, Prettier, and code quality tools

- [ ] **Core Infrastructure**
  - [ ] Implement IndexedDB schema
  - [ ] Create SRS SM-2 algorithm
  - [ ] Set up service worker with Workbox
  - [ ] Configure PWA manifest
  - [ ] Implement offline sync queue

### Phase 2: Content & Features (Weeks 3-4)

- [ ] **Curriculum Content**
  - [ ] Write 30-day lesson plans (JSON format)
  - [ ] Write 60-day lesson plans
  - [ ] Create 100+ flashcards
  - [ ] Design 50+ coding exercises
  - [ ] Prepare capstone projects

- [ ] **UI Components**
  - [ ] Build Dashboard with progress tracking
  - [ ] Create Lesson Player with code examples
  - [ ] Implement Flashcard review interface
  - [ ] Build Code Editor with Monaco
  - [ ] Create Exercise Runner with test feedback

### Phase 3: Assessment & Grading (Week 5)

- [ ] **Assessment System**
  - [ ] Implement quiz engine
  - [ ] Create auto-grader for coding exercises
  - [ ] Build test harness runner
  - [ ] Implement feedback generation
  - [ ] Create progress analytics

### Phase 4: Testing & CI/CD (Week 6)

- [ ] **Testing**
  - [ ] Write E2E tests for all user flows
  - [ ] Create unit tests for SRS algorithm
  - [ ] Test offline functionality
  - [ ] Perform accessibility audit
  - [ ] Run Lighthouse performance tests

- [ ] **CI/CD**
  - [ ] Set up GitHub Actions workflows
  - [ ] Configure auto-grading pipeline
  - [ ] Implement deployment automation
  - [ ] Set up monitoring and alerts

---

## ✅ Acceptance Criteria

### Functional Requirements

1. **Learning Platform**
   - ✅ Users can browse 30-day and 60-day curriculum tracks
   - ✅ Lessons display with code examples and explanations
   - ✅ Progress is tracked and persisted
   - ✅ Platform works offline with full functionality

2. **Spaced Repetition System**
   - ✅ SM-2 algorithm correctly schedules reviews
   - ✅ Cards are presented based on due date
   - ✅ Quality ratings update scheduling
   - ✅ Review history is maintained
   - ✅ Upcoming reviews are visible on dashboard

3. **Assessment System**
   - ✅ Quizzes are auto-graded with instant feedback
   - ✅ Coding exercises run in sandboxed environment
   - ✅ Test results show detailed pass/fail information
   - ✅ Hints are available for exercises
   - ✅ Solutions are revealed after passing

4. **PWA Features**
   - ✅ App is installable on desktop and mobile
   - ✅ Lighthouse score ≥ 90 in all categories
   - ✅ Works offline with cached content
   - ✅ Service worker updates automatically
   - ✅ Push notifications for due reviews (optional)

### Technical Requirements

1. **Performance**
   - ✅ Initial page load < 2 seconds
   - ✅ Time to Interactive < 3 seconds
   - ✅ Code editor loads < 1 second
   - ✅ Quiz submission < 500ms
   - ✅ SRS review < 200ms per card

2. **Code Quality**
   - ✅ TypeScript strict mode enabled
   - ✅ ESLint passes with no errors
   - ✅ Test coverage ≥ 80%
   - ✅ No console errors in production
   - ✅ Accessibility score ≥ 95

3. **Browser Support**
   - ✅ Chrome/Edge (latest 2 versions)
   - ✅ Firefox (latest 2 versions)
   - ✅ Safari (latest 2 versions)
   - ✅ Mobile browsers (iOS Safari, Chrome Android)

---

## 🚀 Getting Started

### Prerequisites

```bash
# Required software
- Node.js 20+
- Java JDK 17+
- Maven 3.9+
- Git
```

### Quick Start

```bash
# Clone repository
git clone <repository-url>
cd learning-platform

# Install frontend dependencies
cd frontend
npm install

# Install Playwright
cd ../playwright-runner
npm install
npx playwright install

# Build Selenium project
cd ../selenium-java
mvn clean install

# Start development server
cd ../frontend
npm run dev
```

### Environment Variables

```env
# frontend/.env
VITE_API_URL=http://localhost:3001
VITE_ENABLE_OFFLINE=true
VITE_SRS_SYNC_INTERVAL=300000

# Backend (if using)
DATABASE_URL=postgresql://localhost:5432/learning_platform
JWT_SECRET=your-secret-key
PORT=3001
```

---

## 📚 Additional Resources

### Documentation to Create

1. **User Guide**
   - Getting started tutorial
   - Feature walkthroughs
   - FAQ section
   - Troubleshooting guide

2. **Developer Guide**
   - Architecture overview
   - API documentation
   - Contributing guidelines
   - Code style guide

3. **Curriculum Guide**
   - Learning path recommendations
   - Study tips
   - Best practices
   - Common pitfalls

### Recommended Tools

- **Design**: Figma for UI mockups
- **Project Management**: GitHub Projects
- **Documentation**: Docusaurus or VitePress
- **Monitoring**: Sentry for error tracking
- **Analytics**: Plausible or Google Analytics

---

## 🎯 Success Metrics

### Learning Outcomes

- **Knowledge Retention**: 80%+ after 30 days (measured via SRS)
- **Completion Rate**: 70%+ complete 30-day track
- **Skill Proficiency**: 90%+ pass capstone project
- **Time to Competency**: Average 35 days for 30-day track

### Platform Metrics

- **User Engagement**: 5+ sessions per week
- **Daily Active Users**: 60%+ of enrolled users
- **Exercise Completion**: 85%+ pass rate
- **Review Adherence**: 75%+ complete due SRS reviews

---

## 📝 Final Notes

This comprehensive prompt provides everything needed to build a production-ready Playwright and Selenium learning platform. The implementation should be iterative, with regular testing and user feedback incorporated throughout the development process.

**Key Success Factors:**
1. Focus on user experience and learning effectiveness
2. Ensure offline functionality works flawlessly
3. Make assessments challenging but fair
4. Provide clear, actionable feedback
5. Keep content up-to-date with latest framework versions

**Timeline:** 6-8 weeks for MVP, 12 weeks for full implementation with all features.

---

*Document created: 2026-02-16*
*Version: 1.0*
*Target Audience: Full-stack developers with React and Java experience*