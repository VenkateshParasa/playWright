# Project Structure

Complete folder structure for the Playwright & Selenium Learning Platform.

```
playwright-selenium-learning/
│
├── README.md                                    # Main project documentation
├── COMPREHENSIVE_IMPLEMENTATION_PROMPT.md       # Detailed implementation guide
├── FEATURES_IMPLEMENTATION.md                   # Feature breakdown and checklist
├── PROJECT_STRUCTURE.md                         # This file
├── learning_program_spec.md                     # Original specification
├── .gitignore                                   # Git ignore rules
│
├── frontend/                                    # React PWA Application
│   ├── public/
│   │   ├── manifest.json                        # PWA manifest
│   │   ├── robots.txt
│   │   ├── icons/                               # PWA icons (various sizes)
│   │   │   ├── icon-72x72.png
│   │   │   ├── icon-96x96.png
│   │   │   ├── icon-128x128.png
│   │   │   ├── icon-144x144.png
│   │   │   ├── icon-152x152.png
│   │   │   ├── icon-192x192.png
│   │   │   ├── icon-384x384.png
│   │   │   └── icon-512x512.png
│   │   └── fonts/                               # Custom fonts (if needed)
│   │
│   ├── src/
│   │   ├── main.tsx                             # Application entry point
│   │   ├── App.tsx                              # Root component with routing
│   │   ├── vite-env.d.ts                        # Vite type definitions
│   │   │
│   │   ├── components/
│   │   │   ├── ui/                              # shadcn/ui components
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── progress.tsx
│   │   │   │   ├── tabs.tsx
│   │   │   │   ├── toast.tsx
│   │   │   │   └── ...
│   │   │   │
│   │   │   ├── layout/
│   │   │   │   ├── Layout.tsx                   # Main layout wrapper
│   │   │   │   ├── Header.tsx                   # Top navigation
│   │   │   │   ├── Sidebar.tsx                  # Side navigation
│   │   │   │   ├── Footer.tsx                   # Footer component
│   │   │   │   └── Breadcrumbs.tsx              # Breadcrumb navigation
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   ├── WelcomeCard.tsx              # Welcome message
│   │   │   │   ├── ProgressOverview.tsx         # Overall progress display
│   │   │   │   ├── StreakCounter.tsx            # Daily streak tracker
│   │   │   │   ├── UpcomingReviews.tsx          # SRS reviews due
│   │   │   │   ├── RecentAchievements.tsx       # Latest badges earned
│   │   │   │   ├── StudyTimeChart.tsx           # Time spent studying
│   │   │   │   └── QuickActions.tsx             # Quick action buttons
│   │   │   │
│   │   │   ├── lessons/
│   │   │   │   ├── LessonList.tsx               # List of all lessons
│   │   │   │   ├── LessonCard.tsx               # Individual lesson card
│   │   │   │   ├── LessonPlayer.tsx             # Lesson content viewer
│   │   │   │   ├── LessonContent.tsx            # Markdown content renderer
│   │   │   │   ├── CodeExample.tsx              # Code snippet display
│   │   │   │   ├── TableOfContents.tsx          # Lesson TOC
│   │   │   │   ├── LessonNavigation.tsx         # Prev/Next navigation
│   │   │   │   ├── LessonProgress.tsx           # Lesson completion tracker
│   │   │   │   └── LessonFilters.tsx            # Filter/search lessons
│   │   │   │
│   │   │   ├── flashcards/
│   │   │   │   ├── FlashCard.tsx                # Single flashcard component
│   │   │   │   ├── CardDeck.tsx                 # Deck of cards
│   │   │   │   ├── ReviewSession.tsx            # Review session manager
│   │   │   │   ├── QualityButtons.tsx           # Rating buttons (0-5)
│   │   │   │   ├── SessionStats.tsx             # Session statistics
│   │   │   │   ├── ProgressBar.tsx              # Review progress
│   │   │   │   ├── CardTimer.tsx                # Time per card
│   │   │   │   ├── CardBrowser.tsx              # Browse all cards
│   │   │   │   ├── CardEditor.tsx               # Edit card content
│   │   │   │   ├── CardFilters.tsx              # Filter cards
│   │   │   │   ├── CardStats.tsx                # Card statistics
│   │   │   │   ├── ReviewCalendar.tsx           # Calendar view
│   │   │   │   ├── ReviewHeatmap.tsx            # Activity heatmap
│   │   │   │   └── RetentionGraph.tsx           # Retention rate chart
│   │   │   │
│   │   │   ├── exercises/
│   │   │   │   ├── CodeEditor.tsx               # Monaco editor wrapper
│   │   │   │   ├── ExerciseRunner.tsx           # Run code and tests
│   │   │   │   ├── TestResults.tsx              # Display test results
│   │   │   │   ├── ConsoleOutput.tsx            # Console output display
│   │   │   │   ├── HintSystem.tsx               # Progressive hints
│   │   │   │   ├── SolutionViewer.tsx           # Show solution
│   │   │   │   ├── CodeDiff.tsx                 # Compare code
│   │   │   │   └── AttemptHistory.tsx           # Previous attempts
│   │   │   │
│   │   │   ├── quiz/
│   │   │   │   ├── QuizPlayer.tsx               # Quiz interface
│   │   │   │   ├── Question.tsx                 # Single question
│   │   │   │   ├── MultipleChoice.tsx           # MCQ component
│   │   │   │   ├── TrueFalse.tsx                # True/False question
│   │   │   │   ├── QuizTimer.tsx                # Countdown timer
│   │   │   │   ├── QuizNavigation.tsx           # Question navigation
│   │   │   │   ├── QuizResults.tsx              # Results display
│   │   │   │   └── AnswerExplanation.tsx        # Explanation display
│   │   │   │
│   │   │   ├── code/
│   │   │   │   ├── CodeBlock.tsx                # Syntax highlighted code
│   │   │   │   ├── CodePlayground.tsx           # Interactive playground
│   │   │   │   ├── ConsoleOutput.tsx            # Console display
│   │   │   │   └── LanguageSelector.tsx         # Language switcher
│   │   │   │
│   │   │   ├── search/
│   │   │   │   ├── GlobalSearch.tsx             # Global search modal
│   │   │   │   ├── SearchBar.tsx                # Search input
│   │   │   │   ├── SearchResults.tsx            # Results display
│   │   │   │   ├── SearchFilters.tsx            # Filter options
│   │   │   │   └── SearchSuggestions.tsx        # Autocomplete
│   │   │   │
│   │   │   ├── notifications/
│   │   │   │   ├── NotificationCenter.tsx       # Notification panel
│   │   │   │   ├── NotificationItem.tsx         # Single notification
│   │   │   │   └── NotificationSettings.tsx     # Preferences
│   │   │   │
│   │   │   ├── settings/
│   │   │   │   ├── ThemeSettings.tsx            # Theme selection
│   │   │   │   ├── NotificationSettings.tsx     # Notification prefs
│   │   │   │   ├── StudySettings.tsx            # Study preferences
│   │   │   │   ├── PrivacySettings.tsx          # Privacy options
│   │   │   │   └── DataExport.tsx               # Export user data
│   │   │   │
│   │   │   ├── progress/
│   │   │   │   ├── ProgressOverview.tsx         # Overall progress
│   │   │   │   ├── ModuleProgress.tsx           # Progress by module
│   │   │   │   ├── ProgressChart.tsx            # Visual charts
│   │   │   │   ├── Statistics.tsx               # Detailed stats
│   │   │   │   ├── Milestones.tsx               # Milestone display
│   │   │   │   └── ProgressReport.tsx           # Exportable report
│   │   │   │
│   │   │   ├── achievements/
│   │   │   │   ├── AchievementBadge.tsx         # Badge component
│   │   │   │   ├── AchievementList.tsx          # All achievements
│   │   │   │   ├── AchievementNotification.tsx  # Unlock notification
│   │   │   │   ├── Leaderboard.tsx              # User rankings
│   │   │   │   └── DailyChallenge.tsx           # Daily challenges
│   │   │   │
│   │   │   └── admin/
│   │   │       ├── MarkdownEditor.tsx           # Content editor
│   │   │       ├── MediaUploader.tsx            # File upload
│   │   │       ├── ContentPreview.tsx           # Preview content
│   │   │       ├── PublishSettings.tsx          # Publish options
│   │   │       ├── UserMetrics.tsx              # User analytics
│   │   │       ├── ContentMetrics.tsx           # Content analytics
│   │   │       └── EngagementMetrics.tsx        # Engagement stats
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx                    # Main dashboard
│   │   │   ├── Lessons.tsx                      # Lessons list page
│   │   │   ├── LessonDetail.tsx                 # Single lesson page
│   │   │   ├── Flashcards.tsx                   # Flashcards page
│   │   │   ├── Exercises.tsx                    # Exercises list
│   │   │   ├── Exercise.tsx                     # Single exercise
│   │   │   ├── Quiz.tsx                         # Quiz page
│   │   │   ├── Projects.tsx                     # Projects page
│   │   │   ├── Progress.tsx                     # Progress page
│   │   │   ├── Settings.tsx                     # Settings page
│   │   │   ├── Auth/
│   │   │   │   ├── Login.tsx                    # Login page
│   │   │   │   ├── Register.tsx                 # Registration page
│   │   │   │   ├── ForgotPassword.tsx           # Password reset
│   │   │   │   └── ResetPassword.tsx            # New password
│   │   │   └── admin/
│   │   │       ├── ContentEditor.tsx            # Content management
│   │   │       ├── UserManagement.tsx           # User admin
│   │   │       ├── UserDetail.tsx               # User details
│   │   │       └── Analytics.tsx                # Analytics dashboard
│   │   │
│   │   ├── lib/
│   │   │   ├── srs/
│   │   │   │   ├── sm2-algorithm.ts             # SM-2 implementation
│   │   │   │   ├── card-scheduler.ts            # Card scheduling logic
│   │   │   │   ├── types.ts                     # SRS type definitions
│   │   │   │   ├── utils.ts                     # SRS utilities
│   │   │   │   └── __tests__/
│   │   │   │       ├── sm2-algorithm.test.ts
│   │   │   │       └── card-scheduler.test.ts
│   │   │   │
│   │   │   ├── db/
│   │   │   │   ├── schema.ts                    # IndexedDB schema
│   │   │   │   ├── operations.ts                # CRUD operations
│   │   │   │   ├── sync.ts                      # Sync logic
│   │   │   │   ├── migration.ts                 # Schema migrations
│   │   │   │   └── __tests__/
│   │   │   │       └── db.test.ts
│   │   │   │
│   │   │   ├── api/
│   │   │   │   ├── client.ts                    # API client setup
│   │   │   │   ├── endpoints.ts                 # API endpoints
│   │   │   │   └── auth.ts                      # Auth API calls
│   │   │   │
│   │   │   ├── sync/
│   │   │   │   ├── syncManager.ts               # Sync coordinator
│   │   │   │   ├── conflictResolver.ts          # Conflict resolution
│   │   │   │   ├── syncQueue.ts                 # Offline queue
│   │   │   │   └── networkMonitor.ts            # Network status
│   │   │   │
│   │   │   ├── notifications/
│   │   │   │   ├── pushNotifications.ts         # Push API
│   │   │   │   └── notificationManager.ts       # Notification logic
│   │   │   │
│   │   │   └── utils/
│   │   │       ├── date.ts                      # Date utilities
│   │   │       ├── storage.ts                   # Storage helpers
│   │   │       ├── validation.ts                # Validation functions
│   │   │       └── cn.ts                        # Class name utility
│   │   │
│   │   ├── hooks/
│   │   │   ├── useSRS.ts                        # SRS hook
│   │   │   ├── useProgress.ts                   # Progress tracking
│   │   │   ├── useOfflineSync.ts                # Offline sync
│   │   │   ├── useLessonState.ts                # Lesson state
│   │   │   ├── useAuth.ts                       # Authentication
│   │   │   └── useLocalStorage.ts               # Local storage
│   │   │
│   │   ├── stores/
│   │   │   ├── authStore.ts                     # Auth state
│   │   │   ├── progressStore.ts                 # Progress state
│   │   │   ├── srsStore.ts                      # SRS state
│   │   │   ├── settingsStore.ts                 # Settings state
│   │   │   └── uiStore.ts                       # UI state
│   │   │
│   │   ├── data/
│   │   │   ├── curriculum/
│   │   │   │   ├── 30-day/
│   │   │   │   │   ├── week1/
│   │   │   │   │   │   ├── day1.json
│   │   │   │   │   │   ├── day2.json
│   │   │   │   │   │   └── ...
│   │   │   │   │   ├── week2/
│   │   │   │   │   ├── week3/
│   │   │   │   │   └── week4/
│   │   │   │   └── 60-day/
│   │   │   │       └── ...
│   │   │   │
│   │   │   ├── flashcards/
│   │   │   │   ├── playwright-basics.json
│   │   │   │   ├── playwright-advanced.json
│   │   │   │   ├── selenium-basics.json
│   │   │   │   ├── selenium-advanced.json
│   │   │   │   └── general-testing.json
│   │   │   │
│   │   │   └── exercises/
│   │   │       ├── selectors-challenge.json
│   │   │       ├── waits-exercise.json
│   │   │       ├── pom-exercise.json
│   │   │       └── ...
│   │   │
│   │   ├── styles/
│   │   │   ├── globals.css                      # Global styles
│   │   │   └── themes.css                       # Theme variables
│   │   │
│   │   └── types/
│   │       ├── curriculum.ts                    # Curriculum types
│   │       ├── srs.ts                           # SRS types
│   │       ├── exercise.ts                      # Exercise types
│   │       ├── user.ts                          # User types
│   │       └── api.ts                           # API types
│   │
│   ├── tests/
│   │   ├── unit/                                # Unit tests
│   │   │   ├── srs.test.ts
│   │   │   └── utils.test.ts
│   │   ├── integration/                         # Integration tests
│   │   │   └── api.test.ts
│   │   └── e2e/                                 # E2E tests
│   │       ├── auth.spec.ts
│   │       ├── lessons.spec.ts
│   │       ├── flashcards.spec.ts
│   │       └── offline.spec.ts
│   │
│   ├── index.html                               # HTML entry point
│   ├── package.json                             # Dependencies
│   ├── vite.config.ts                           # Vite configuration
│   ├── tsconfig.json                            # TypeScript config
│   ├── tsconfig.node.json                       # Node TypeScript config
│   ├── tailwind.config.js                       # Tailwind config
│   ├── postcss.config.js                        # PostCSS config
│   ├── playwright.config.ts                     # Playwright config
│   ├── vitest.config.ts                         # Vitest config
│   ├── .eslintrc.json                           # ESLint config
│   ├── .prettierrc                              # Prettier config
│   └── .gitignore                               # Git ignore
│
├── playwright-runner/                           # Playwright Examples
│   ├── tests/
│   │   ├── examples/
│   │   │   ├── 01-basic-navigation.spec.ts
│   │   │   ├── 02-selectors.spec.ts
│   │   │   ├── 03-interactions.spec.ts
│   │   │   ├── 04-assertions.spec.ts
│   │   │   ├── 05-waits.spec.ts
│   │   │   ├── 06-page-objects.spec.ts
│   │   │   ├── 07-fixtures.spec.ts
│   │   │   ├── 08-network-mocking.spec.ts
│   │   │   ├── 09-authentication.spec.ts
│   │   │   └── 10-file-handling.spec.ts
│   │   │
│   │   ├── exercises/
│   │   │   ├── exercise-01-login.spec.ts
│   │   │   ├── exercise-02-form-validation.spec.ts
│   │   │   ├── exercise-03-navigation.spec.ts
│   │   │   └── ...
│   │   │
│   │   └── capstone/
│   │       └── ecommerce-suite.spec.ts
│   │
│   ├── pages/
│   │   ├── BasePage.ts                          # Base page class
│   │   ├── LoginPage.ts                         # Login page object
│   │   ├── HomePage.ts                          # Home page object
│   │   ├── ProductPage.ts                       # Product page object
│   │   └── CheckoutPage.ts                      # Checkout page object
│   │
│   ├── fixtures/
│   │   ├── test-data.ts                         # Test data
│   │   ├── custom-fixtures.ts                   # Custom fixtures
│   │   └── auth.setup.ts                        # Auth setup
│   │
│   ├── utils/
│   │   ├── helpers.ts                           # Helper functions
│   │   ├── test-helpers.ts                      # Test utilities
│   │   └── reporters.ts                         # Custom reporters
│   │
│   ├── playwright.config.ts                     # Playwright config
│   ├── package.json                             # Dependencies
│   ├── tsconfig.json                            # TypeScript config
│   └── README.md                                # Documentation
│
├── selenium-java/                               # Selenium Java Examples
│   ├── src/
│   │   ├── main/
│   │   │   └── java/
│   │   │       └── com/
│   │   │           └── testautomation/
│   │   │               ├── pages/
│   │   │               │   ├── BasePage.java
│   │   │               │   ├── LoginPage.java
│   │   │               │   ├── HomePage.java
│   │   │               │   └── ProductPage.java
│   │   │               │
│   │   │               ├── utils/
│   │   │               │   ├── DriverFactory.java
│   │   │               │   ├── ConfigReader.java
│   │   │               │   ├── WaitHelper.java
│   │   │               │   └── ScreenshotHelper.java
│   │   │               │
│   │   │               └── config/
│   │   │                   └── TestConfig.java
│   │   │
│   │   └── test/
│   │       ├── java/
│   │       │   └── com/
│   │       │       └── testautomation/
│   │       │           ├── tests/
│   │       │           │   ├── BaseTest.java
│   │       │           │   ├── LoginTests.java
│   │       │           │   ├── NavigationTests.java
│   │       │           │   ├── FormTests.java
│   │       │           │   └── E2ETests.java
│   │       │           │
│   │       │           └── exercises/
│   │       │               ├── Exercise01_Selectors.java
│   │       │               ├── Exercise02_Waits.java
│   │       │               └── Exercise03_PageObjects.java
│   │       │
│   │       └── resources/
│   │           ├── config.properties
│   │           ├── testdata/
│   │           │   ├── users.json
│   │           │   └── products.json
│   │           └── drivers/
│   │               └── .gitkeep
│   │
│   ├── pom.xml                                  # Maven configuration
│   ├── testng.xml                               # TestNG suite
│   └── README.md                                # Documentation
│
├── backend/                                     # Optional Backend API
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts                          # Auth routes
│   │   │   ├── lessons.ts                       # Lesson routes
│   │   │   ├── srs.ts                           # SRS routes
│   │   │   ├── exercises.ts                     # Exercise routes
│   │   │   ├── projects.ts                      # Project routes
│   │   │   └── admin.ts                         # Admin routes
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── lessonController.ts
│   │   │   ├── srsController.ts
│   │   │   ├── exerciseController.ts
│   │   │   ├── projectController.ts
│   │   │   └── adminController.ts
│   │   │
│   │   ├── services/
│   │   │   ├── authService.ts
│   │   │   ├── srsService.ts
│   │   │   ├── autoGrader.ts
│   │   │   ├── codeAnalyzer.ts
│   │   │   ├── testRunner.ts
│   │   │   ├── codeRunner.ts
│   │   │   ├── testHarness.ts
│   │   │   ├── githubIntegration.ts
│   │   │   ├── notificationService.ts
│   │   │   └── emailService.ts
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.ts                          # Auth middleware
│   │   │   ├── rbac.ts                          # Role-based access
│   │   │   ├── logger.ts                        # Logging
│   │   │   ├── errorHandler.ts                  # Error handling
│   │   │   └── rateLimit.ts                     # Rate limiting
│   │   │
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Lesson.ts
│   │   │   ├── Card.ts
│   │   │   ├── Exercise.ts
│   │   │   ├── Quiz.ts
│   │   │   └── Progress.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── jwt.ts                           # JWT utilities
│   │   │   ├── sandbox.ts                       # Code sandboxing
│   │   │   ├── feedback.ts                      # Feedback generation
│   │   │   ├── validation.ts                    # Input validation
│   │   │   └── monitoring.ts                    # Monitoring utils
│   │   │
│   │   ├── config/
│   │   │   ├── database.ts                      # DB configuration
│   │   │   └── env.ts                           # Environment config
│   │   │
│   │   └── index.ts                             # Server entry point
│   │
│   ├── tests/
│   │   ├── unit/
│   │   └── integration/
│   │
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── docs/                                        # Documentation
│   ├── user-guide.md                            # User documentation
│   ├── developer-guide.md                       # Developer docs
│   ├── api.md                                   # API documentation
│   ├── architecture.md                          # Architecture docs
│   ├── deployment.md                            # Deployment guide
│   └── contributing.md                          # Contributing guide
│
├── .github/
│   └── workflows/
│       ├── ci.yml                               # Main CI workflow
│       ├── playwright.yml                       # Playwright tests
│       ├── selenium.yml                         # Selenium tests
│       ├── frontend.yml                         # Frontend CI/CD
│       ├── backend.yml                          # Backend CI/CD
│       ├── grade-submission.yml                 # Auto-grading
│       ├── deploy-staging.yml                   # Staging deployment
│       └── deploy-production.yml                # Production deployment
│
└── scripts/                                     # Utility scripts
    ├── create-placeholders.sh                   # Create placeholder files
    ├── deploy.sh                                # Deployment script
    ├── migrate.sh                               # Database migration
    ├── seed-data.sh                             # Seed initial data
    └── generate-icons.sh                        # Generate PWA icons
```

## Key Directories Explained

### Frontend (`/frontend`)
The React PWA application with all UI components, pages, and client-side logic.

### Playwright Runner (`/playwright-runner`)
Contains Playwright test examples, exercises, and page object models for learning.

### Selenium Java (`/selenium-java`)
Java-based Selenium tests with Maven configuration and TestNG integration.

### Backend (`/backend`)
Optional Node.js/Express backend API for user management, progress tracking, and auto-grading.

### Docs (`/docs`)
Comprehensive documentation for users, developers, and contributors.

### GitHub Workflows (`/.github/workflows`)
CI/CD pipelines for automated testing, grading, and deployment.

### Scripts (`/scripts`)
Utility scripts for setup, deployment, and maintenance tasks.

## File Count Summary

- **Frontend**: ~150+ files
- **Playwright Runner**: ~30+ files
- **Selenium Java**: ~20+ files
- **Backend**: ~40+ files
- **Documentation**: ~10+ files
- **CI/CD**: ~8+ files
- **Total**: ~250+ files

## Next Steps

1. Run `npm install` in each project directory
2. Follow setup instructions in README.md
3. Start with Phase 1 implementation (Foundation)
4. Refer to FEATURES_IMPLEMENTATION.md for detailed feature breakdown
5. Use COMPREHENSIVE_IMPLEMENTATION_PROMPT.md for technical guidance