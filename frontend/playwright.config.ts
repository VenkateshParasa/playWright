import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/**
 * Comprehensive Playwright Configuration for E2E Testing
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests/e2e',

  /* Maximum time one test can run for */
  timeout: 60 * 1000,

  /* Test timeout for each assertion */
  expect: {
    timeout: 10000,
  },

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI for stability */
  workers: process.env.CI ? 2 : undefined,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', {
      outputFolder: 'playwright-report',
      open: 'never'
    }],
    ['json', {
      outputFile: 'playwright-report/results.json'
    }],
    ['junit', {
      outputFile: 'playwright-report/junit.xml'
    }],
    ['list'],
    ['github'],
  ],

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: process.env.CI ? 'on-first-retry' : 'retain-on-failure',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',

    /* Video recording */
    video: process.env.CI ? 'retain-on-failure' : 'off',

    /* Maximum time each action can take */
    actionTimeout: 15000,

    /* Navigation timeout */
    navigationTimeout: 30000,

    /* Automatically accept download dialogs */
    acceptDownloads: true,

    /* Emulate timezone */
    timezoneId: 'America/New_York',

    /* Locale */
    locale: 'en-US',

    /* Ignore HTTPS errors */
    ignoreHTTPSErrors: true,

    /* Bypass CSP */
    bypassCSP: false,

    /* Context options */
    permissions: [],

    /* Viewport size */
    viewport: { width: 1280, height: 720 },

    /* User agent */
    userAgent: 'PlaywrightTestBot/1.0',
  },

  /* Global setup and teardown */
  globalSetup: require.resolve('./tests/setup/global-setup.ts'),
  globalTeardown: require.resolve('./tests/setup/global-teardown.ts'),

  /* Configure projects for major browsers */
  projects: [
    // Setup project for authentication
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    // Desktop browsers
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--disable-web-security', '--disable-features=IsolateOrigins,site-per-process'],
        },
      },
      dependencies: ['setup'],
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
      dependencies: ['setup'],
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
      dependencies: ['setup'],
    },

    // Branded browsers
    {
      name: 'edge',
      use: {
        ...devices['Desktop Edge'],
        channel: 'msedge',
      },
      dependencies: ['setup'],
    },

    {
      name: 'chrome',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
      dependencies: ['setup'],
    },

    // Mobile viewports
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
      },
      dependencies: ['setup'],
    },

    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 12'],
      },
      dependencies: ['setup'],
    },

    {
      name: 'Mobile Safari Landscape',
      use: {
        ...devices['iPhone 12 landscape'],
      },
      dependencies: ['setup'],
    },

    // Tablet viewports
    {
      name: 'iPad',
      use: {
        ...devices['iPad Pro'],
      },
      dependencies: ['setup'],
    },

    // Accessibility tests
    {
      name: 'accessibility',
      testMatch: /.*\.a11y\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
      },
      dependencies: ['setup'],
    },

    // Visual regression tests
    {
      name: 'visual',
      testMatch: /.*\.visual\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
      },
      dependencies: ['setup'],
    },

    // API tests - no browser needed
    {
      name: 'api',
      testMatch: /.*\.api\.spec\.ts/,
      use: {
        baseURL: process.env.API_BASE_URL || 'http://localhost:3000',
      },
    },
  ],

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  outputDir: 'test-results/',

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: 'ignore',
    stderr: 'pipe',
  },

  /* Grep pattern for test names */
  grep: process.env.TEST_GREP ? new RegExp(process.env.TEST_GREP) : undefined,
  grepInvert: process.env.TEST_GREP_INVERT ? new RegExp(process.env.TEST_GREP_INVERT) : undefined,
});
