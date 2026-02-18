#!/usr/bin/env python3
"""
Generate comprehensive lesson content for Playwright & Selenium Learning Platform
"""
import json
import os

# Lesson templates for remaining Playwright Beginner lessons (7-10)
playwright_beginner_lessons = {
    7: {
        "id": "pw-beginner-007",
        "title": "Page Object Model Basics",
        "slug": "page-object-model-basics",
        "track": "playwright",
        "category": "beginner",
        "order": 7,
        "duration": 30,
        "description": "Learn the Page Object Model (POM) design pattern to create maintainable and reusable test code.",
        "objectives": [
            "Understand the Page Object Model pattern",
            "Create page object classes for web pages",
            "Implement reusable methods and locators",
            "Organize test code for better maintainability"
        ],
        "prerequisites": ["pw-beginner-006"],
        "content": {
            "sections": [
                {
                    "title": "What is Page Object Model?",
                    "type": "text",
                    "content": "# Page Object Model (POM)\n\nPage Object Model is a design pattern that creates an object repository for web elements. Instead of writing locators directly in tests, you encapsulate them in page classes.\n\n## Benefits\n\n**Maintainability**: If a locator changes, update it in one place\n**Reusability**: Share page methods across multiple tests\n**Readability**: Tests read like business requirements\n**Separation**: Separate test logic from page structure\n\n## Without POM\n\n```typescript\ntest('login', async ({ page }) => {\n  await page.goto('https://example.com/login');\n  await page.fill('#email', 'user@test.com');\n  await page.fill('#password', 'password');\n  await page.click('button[type=\"submit\"]');\n  await expect(page).toHaveURL('/dashboard');\n});\n```\n\n## With POM\n\n```typescript\ntest('login', async ({ page }) => {\n  const loginPage = new LoginPage(page);\n  await loginPage.goto();\n  await loginPage.login('user@test.com', 'password');\n  await expect(page).toHaveURL('/dashboard');\n});\n```\n\nMuch cleaner and more maintainable!"
                },
                {
                    "title": "Creating a Page Object",
                    "type": "code",
                    "language": "typescript",
                    "code": "// pages/LoginPage.ts\nimport { Page, Locator } from '@playwright/test';\n\nexport class LoginPage {\n  readonly page: Page;\n  readonly emailInput: Locator;\n  readonly passwordInput: Locator;\n  readonly submitButton: Locator;\n  readonly errorMessage: Locator;\n\n  constructor(page: Page) {\n    this.page = page;\n    this.emailInput = page.locator('#email');\n    this.passwordInput = page.locator('#password');\n    this.submitButton = page.locator('button[type=\"submit\"]');\n    this.errorMessage = page.locator('.error-message');\n  }\n\n  async goto() {\n    await this.page.goto('/login');\n  }\n\n  async login(email: string, password: string) {\n    await this.emailInput.fill(email);\n    await this.passwordInput.fill(password);\n    await this.submitButton.click();\n  }\n\n  async getErrorMessage() {\n    return await this.errorMessage.textContent();\n  }\n}",
                    "explanation": "A page object encapsulates locators and actions for a specific page. All page interactions go through these methods."
                },
                {
                    "title": "Using Page Objects in Tests",
                    "type": "code",
                    "language": "typescript",
                    "code": "// tests/login.spec.ts\nimport { test, expect } from '@playwright/test';\nimport { LoginPage } from '../pages/LoginPage';\n\ntest.describe('Login Tests', () => {\n  test('successful login', async ({ page }) => {\n    const loginPage = new LoginPage(page);\n    await loginPage.goto();\n    await loginPage.login('user@example.com', 'password123');\n    await expect(page).toHaveURL('/dashboard');\n  });\n\n  test('login with invalid credentials', async ({ page }) => {\n    const loginPage = new LoginPage(page);\n    await loginPage.goto();\n    await loginPage.login('user@example.com', 'wrongpassword');\n    \n    const error = await loginPage.getErrorMessage();\n    expect(error).toContain('Invalid credentials');\n  });\n\n  test('login with empty fields', async ({ page }) => {\n    const loginPage = new LoginPage(page);\n    await loginPage.goto();\n    await loginPage.login('', '');\n    \n    await expect(loginPage.errorMessage).toBeVisible();\n  });\n});",
                    "explanation": "Tests become much simpler and more readable. They describe what you're testing, not how."
                }
            ]
        },
        "keyTakeaways": [
            "Page Object Model separates page structure from test logic",
            "Locators and actions are encapsulated in page classes",
            "Tests become more readable and maintainable",
            "Changes to UI only require updates in one place",
            "Page objects promote code reuse across tests",
            "Each page should have its own class",
            "Methods should represent user actions on the page"
        ],
        "resources": [
            {
                "title": "Page Object Model",
                "url": "https://playwright.dev/docs/pom",
                "type": "documentation"
            }
        ],
        "quiz": "pw-beginner-quiz-007",
        "nextLesson": "pw-beginner-008",
        "estimatedXP": 200,
        "tags": ["playwright", "pom", "page-object-model", "design-pattern"]
    },
    8: {
        "id": "pw-beginner-008",
        "title": "Running Tests",
        "slug": "running-tests",
        "track": "playwright",
        "category": "beginner",
        "order": 8,
        "duration": 25,
        "description": "Master different ways to run Playwright tests including command line options, filtering, and test modes.",
        "objectives": [
            "Run tests using various command line options",
            "Filter and select specific tests to run",
            "Use different execution modes (headed, UI, debug)",
            "Generate and view test reports"
        ],
        "prerequisites": ["pw-beginner-007"],
        "content": {
            "sections": [
                {
                    "title": "Basic Test Execution",
                    "type": "code",
                    "language": "bash",
                    "code": "# Run all tests\nnpx playwright test\n\n# Run tests in a specific file\nnpx playwright test login.spec.ts\n\n# Run tests in a directory\nnpx playwright test tests/auth/\n\n# Run tests with specific title\nnpx playwright test -g \"login\"\n\n# Run tests in headed mode (see browser)\nnpx playwright test --headed\n\n# Run in specific browser\nnpx playwright test --project=chromium\nnpx playwright test --project=firefox\nnpx playwright test --project=webkit\n\n# Run in all browsers\nnpx playwright test --project=chromium --project=firefox --project=webkit",
                    "explanation": "These are the most common commands for running tests. Start with basic runs, then add options as needed."
                },
                {
                    "title": "Test Filtering",
                    "type": "code",
                    "language": "bash",
                    "code": "# Filter by test name (grep)\nnpx playwright test -g \"user can login\"\n\n# Multiple filters\nnpx playwright test -g \"login|signup\"\n\n# Negative filter (exclude tests)\nnpx playwright test -g \"login\" -gv \"social\"\n\n# Run only tests with specific tag\nnpx playwright test --grep @smoke\n\n# Run failed tests from last run\nnpx playwright test --last-failed\n\n# Run tests that match pattern\nnpx playwright test login signup\n\n# Run single test by line number (in UI mode)\nnpx playwright test login.spec.ts:15",
                    "explanation": "Filtering allows you to run specific subsets of tests, which is useful during development."
                },
                {
                    "title": "Execution Modes",
                    "type": "code",
                    "language": "bash",
                    "code": "# Headed mode - see browser\nnpx playwright test --headed\n\n# UI mode - interactive test runner\nnpx playwright test --ui\n\n# Debug mode - step through tests\nnpx playwright test --debug\n\n# Debug specific test\nnpx playwright test login.spec.ts:15 --debug\n\n# Headed with slow motion\nnpx playwright test --headed --slow-mo=1000\n\n# Run in parallel (default)\nnpx playwright test --workers=4\n\n# Run serially (one at a time)\nnpx playwright test --workers=1\n\n# Run specific number of workers\nnpx playwright test --workers=50%",
                    "explanation": "Different modes help with debugging and understanding test execution."
                }
            ]
        },
        "keyTakeaways": [
            "npx playwright test runs all tests by default",
            "Use --headed to see browser, --ui for interactive mode",
            "Filter tests with -g flag or file/directory paths",
            "--debug mode allows step-by-step test execution",
            "Tests run in parallel by default for speed",
            "--project flag runs tests in specific browsers",
            "Test reports are generated automatically"
        ],
        "resources": [
            {
                "title": "Running Tests",
                "url": "https://playwright.dev/docs/running-tests",
                "type": "documentation"
            }
        ],
        "quiz": "pw-beginner-quiz-008",
        "nextLesson": "pw-beginner-009",
        "estimatedXP": 150,
        "tags": ["playwright", "test-execution", "cli", "running-tests"]
    },
    9: {
        "id": "pw-beginner-009",
        "title": "Debugging Tests",
        "slug": "debugging-tests",
        "track": "playwright",
        "category": "beginner",
        "order": 9,
        "duration": 30,
        "description": "Learn essential debugging techniques and tools to troubleshoot and fix failing tests effectively.",
        "objectives": [
            "Use Playwright Inspector for step-by-step debugging",
            "Leverage VS Code debugging capabilities",
            "Utilize trace viewer for post-mortem analysis",
            "Apply debugging best practices"
        ],
        "prerequisites": ["pw-beginner-008"],
        "content": {
            "sections": [
                {
                    "title": "Playwright Inspector",
                    "type": "code",
                    "language": "bash",
                    "code": "# Open Playwright Inspector\nnpx playwright test --debug\n\n# Debug specific test\nnpx playwright test login.spec.ts --debug\n\n# Debug from specific line\nnpx playwright test login.spec.ts:25 --debug\n\n# Inspector features:\n# - Step through test line by line\n# - Pause and resume execution\n# - Explore page state at each step\n# - Test locators interactively\n# - See screenshots and logs\n# - Time travel through test execution",
                    "explanation": "Playwright Inspector is your primary debugging tool. It provides a visual interface to step through tests."
                },
                {
                    "title": "Using page.pause()",
                    "type": "code",
                    "language": "typescript",
                    "code": "import { test } from '@playwright/test';\n\ntest('debug with pause', async ({ page }) => {\n  await page.goto('https://example.com');\n  \n  // Pause here - Inspector opens automatically\n  await page.pause();\n  \n  // Continue with test after inspecting\n  await page.click('button');\n  \n  // Pause again at a different point\n  await page.pause();\n  \n  await page.fill('input', 'text');\n});\n\n// Pro tip: Remove page.pause() before committing!",
                    "explanation": "page.pause() stops test execution and opens the Inspector. Great for debugging specific sections."
                },
                {
                    "title": "Trace Viewer",
                    "type": "code",
                    "language": "typescript",
                    "code": "// playwright.config.ts - Enable traces\nexport default defineConfig({\n  use: {\n    // Capture trace on first retry\n    trace: 'on-first-retry',\n    \n    // Or always capture (slower)\n    trace: 'on',\n    \n    // Or only on failure\n    trace: 'retain-on-failure',\n  },\n});\n\n// View trace after test\n// npx playwright show-trace trace.zip\n\n// Trace viewer shows:\n// - Timeline of all actions\n// - Screenshots at each step\n// - Network requests\n// - Console logs\n// - DOM snapshots\n// - Source code",
                    "explanation": "Traces provide complete test execution history. Perfect for debugging CI failures."
                }
            ]
        },
        "keyTakeaways": [
            "Use --debug flag to open Playwright Inspector",
            "page.pause() stops execution and opens Inspector",
            "Trace Viewer provides post-mortem analysis of test runs",
            "Enable traces in config for automatic capture on failure",
            "VS Code extension provides integrated debugging",
            "Screenshots and videos help diagnose visual issues",
            "Console logs and network requests aid in troubleshooting"
        ],
        "resources": [
            {
                "title": "Debugging Guide",
                "url": "https://playwright.dev/docs/debug",
                "type": "documentation"
            },
            {
                "title": "Trace Viewer",
                "url": "https://playwright.dev/docs/trace-viewer",
                "type": "documentation"
            }
        ],
        "quiz": "pw-beginner-quiz-009",
        "nextLesson": "pw-beginner-010",
        "estimatedXP": 200,
        "tags": ["playwright", "debugging", "inspector", "trace-viewer"]
    },
    10: {
        "id": "pw-beginner-010",
        "title": "Test Configuration",
        "slug": "test-configuration",
        "track": "playwright",
        "category": "beginner",
        "order": 10,
        "duration": 30,
        "description": "Master Playwright configuration options to customize test behavior, timeouts, browsers, and more.",
        "objectives": [
            "Configure global test settings",
            "Set up multiple browser projects",
            "Manage timeouts and retries",
            "Configure reporters and output directories"
        ],
        "prerequisites": ["pw-beginner-009"],
        "content": {
            "sections": [
                {
                    "title": "Configuration File Structure",
                    "type": "code",
                    "language": "typescript",
                    "code": "// playwright.config.ts\nimport { defineConfig, devices } from '@playwright/test';\n\nexport default defineConfig({\n  // Test directory\n  testDir: './tests',\n  \n  // Test match pattern\n  testMatch: '**/*.spec.ts',\n  \n  // Global timeout for each test\n  timeout: 30000,\n  \n  // Expect timeout for assertions\n  expect: {\n    timeout: 5000\n  },\n  \n  // Run tests in parallel\n  fullyParallel: true,\n  \n  // Fail fast on CI\n  forbidOnly: !!process.env.CI,\n  \n  // Retry failed tests\n  retries: process.env.CI ? 2 : 0,\n  \n  // Worker configuration\n  workers: process.env.CI ? 1 : undefined,\n  \n  // Reporter configuration\n  reporter: [\n    ['html'],\n    ['list'],\n    ['json', { outputFile: 'results.json' }]\n  ],\n  \n  // Global setup/teardown\n  globalSetup: './global-setup.ts',\n  globalTeardown: './global-teardown.ts',\n  \n  // Shared settings for all projects\n  use: {\n    baseURL: 'http://localhost:3000',\n    trace: 'on-first-retry',\n    screenshot: 'only-on-failure',\n    video: 'retain-on-failure',\n    actionTimeout: 10000,\n  },\n  \n  // Browser projects\n  projects: [\n    {\n      name: 'chromium',\n      use: { ...devices['Desktop Chrome'] },\n    },\n    {\n      name: 'firefox',\n      use: { ...devices['Desktop Firefox'] },\n    },\n    {\n      name: 'webkit',\n      use: { ...devices['Desktop Safari'] },\n    },\n    {\n      name: 'Mobile Chrome',\n      use: { ...devices['Pixel 5'] },\n    },\n  ],\n  \n  // Web server for local development\n  webServer: {\n    command: 'npm run start',\n    port: 3000,\n    reuseExistingServer: !process.env.CI,\n  },\n});",
                    "explanation": "This is a comprehensive configuration covering all major settings. Customize based on your needs."
                },
                {
                    "title": "Environment-Specific Configuration",
                    "type": "code",
                    "language": "typescript",
                    "code": "// playwright.config.ts - Environment-based config\nimport { defineConfig } from '@playwright/test';\n\nconst isCI = !!process.env.CI;\nconst isProduction = process.env.NODE_ENV === 'production';\n\nexport default defineConfig({\n  // Different settings for CI vs local\n  retries: isCI ? 2 : 0,\n  workers: isCI ? 1 : undefined,\n  \n  use: {\n    baseURL: isProduction \n      ? 'https://production.example.com'\n      : 'http://localhost:3000',\n    \n    // More aggressive timeouts locally\n    actionTimeout: isCI ? 10000 : 5000,\n    \n    // Only capture traces on CI\n    trace: isCI ? 'on' : 'on-first-retry',\n  },\n  \n  // HTML report in CI, list locally\n  reporter: isCI \n    ? [['html'], ['github']]\n    : [['list'], ['html']],\n});",
                    "explanation": "Adapt configuration based on environment. CI often needs different settings than local development."
                }
            ]
        },
        "keyTakeaways": [
            "playwright.config.ts is the main configuration file",
            "Configure timeouts, retries, and parallelization",
            "Set up multiple browser projects for cross-browser testing",
            "Use environment variables for different configurations",
            "Configure reporters for different output formats",
            "baseURL simplifies navigation in tests",
            "Web server config can auto-start your application"
        ],
        "resources": [
            {
                "title": "Test Configuration",
                "url": "https://playwright.dev/docs/test-configuration",
                "type": "documentation"
            }
        ],
        "quiz": "pw-beginner-quiz-010",
        "nextLesson": "pw-intermediate-001",
        "estimatedXP": 200,
        "tags": ["playwright", "configuration", "setup", "config"]
    }
}

def create_lesson_file(category_path, lesson_data):
    """Create a lesson JSON file"""
    lesson_number = lesson_data['order']
    filename = f"lesson-{lesson_number:03d}.json"
    filepath = os.path.join(category_path, filename)

    with open(filepath, 'w') as f:
        json.dump(lesson_data, f, indent=2)
    print(f"Created: {filepath}")

def main():
    base_path = "/Users/venkateshparasa/Documents/playWright/backend/data/lessons"

    # Create Playwright beginner lessons 7-10
    pw_beginner_path = os.path.join(base_path, "playwright/beginner")
    for lesson_num, lesson_data in playwright_beginner_lessons.items():
        create_lesson_file(pw_beginner_path, lesson_data)

if __name__ == "__main__":
    main()
    print("\nLesson generation complete!")
