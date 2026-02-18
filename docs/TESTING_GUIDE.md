# Testing Guide

## Comprehensive Testing Documentation for Playwright & Selenium Learning Platform

### Table of Contents

1. [Overview](#overview)
2. [Test Architecture](#test-architecture)
3. [Getting Started](#getting-started)
4. [Test Types](#test-types)
5. [Writing Tests](#writing-tests)
6. [Running Tests](#running-tests)
7. [CI/CD Integration](#cicd-integration)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)
10. [Contributing](#contributing)

---

## Overview

This testing suite provides comprehensive coverage for the Playwright & Selenium Learning Platform, including:

- **E2E Tests**: Full user journey testing across all features
- **Integration Tests**: API and backend integration testing
- **Performance Tests**: Lighthouse audits and performance monitoring
- **Visual Regression Tests**: UI consistency testing
- **Accessibility Tests**: WCAG compliance testing

### Technology Stack

- **Playwright**: Modern E2E testing framework
- **Vitest**: Fast unit testing framework
- **Testing Library**: Component testing utilities
- **Lighthouse CI**: Performance auditing
- **GitHub Actions**: CI/CD automation

---

## Test Architecture

### Directory Structure

```
frontend/
├── tests/
│   ├── e2e/                      # End-to-end tests
│   │   ├── auth.spec.ts          # Authentication flows
│   │   ├── lessons.spec.ts       # Lesson progression
│   │   ├── quiz.spec.ts          # Quiz system
│   │   ├── flashcards.spec.ts    # Flashcard reviews
│   │   ├── exercises.spec.ts     # Coding exercises
│   │   ├── admin.spec.ts         # Admin features
│   │   ├── settings.spec.ts      # Settings & preferences
│   │   └── offline.spec.ts       # Offline functionality
│   ├── integration/              # API integration tests
│   │   └── api.api.spec.ts       # Backend API tests
│   ├── performance/              # Performance tests
│   │   └── performance.spec.ts   # Lighthouse & metrics
│   ├── fixtures/                 # Test data and helpers
│   │   ├── test-data.ts          # Mock data
│   │   └── test-helpers.ts       # Helper functions
│   ├── pages/                    # Page Object Models
│   │   ├── BasePage.ts           # Base page class
│   │   ├── AuthPages.ts          # Login/register pages
│   │   ├── MainPages.ts          # Dashboard, lessons, etc.
│   │   └── AdminPages.ts         # Admin pages
│   ├── setup/                    # Global setup/teardown
│   │   ├── global-setup.ts       # Pre-test setup
│   │   └── global-teardown.ts    # Post-test cleanup
│   └── utils/                    # Test utilities
├── playwright.config.ts          # Playwright configuration
└── vitest.config.ts             # Vitest configuration
```

### Test Patterns

#### Page Object Model (POM)

We use the Page Object Model pattern to:
- Encapsulate page-specific logic
- Reduce code duplication
- Improve test maintainability
- Separate test logic from page structure

Example:
```typescript
class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
```

#### Test Fixtures

Custom fixtures provide:
- Reusable test setup
- Authentication helpers
- Database management
- API mocking

Example:
```typescript
test.use({ storageState: 'playwright/.auth/student.json' });

test('should access dashboard', async ({ page }) => {
  // Already authenticated as student
  await page.goto('/dashboard');
});
```

---

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Git

### Installation

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Install Playwright browsers**:
   ```bash
   npx playwright install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env.test
   ```

4. **Start the application**:
   ```bash
   npm run dev
   ```

### First Test Run

Run a single test file:
```bash
npm run test:e2e -- tests/e2e/home.spec.ts
```

Run in headed mode (see browser):
```bash
npm run test:e2e:headed
```

Run in debug mode:
```bash
npm run test:e2e:debug
```

---

## Test Types

### 1. End-to-End Tests

Test complete user workflows from start to finish.

**Location**: `tests/e2e/`

**What we test**:
- Authentication (login, register, password reset)
- Lesson browsing and completion
- Quiz taking and results
- Flashcard review sessions
- Coding exercises
- Admin features
- Settings and preferences
- Offline functionality

**Example**:
```typescript
test('complete lesson workflow', async ({ page }) => {
  const lessonsPage = new LessonsPage(page);
  await lessonsPage.goto();
  await lessonsPage.clickLesson(0);

  const lessonDetailPage = new LessonDetailPage(page);
  await lessonDetailPage.completeLesson();

  await expect(page.locator('[data-testid="completion-message"]')).toBeVisible();
});
```

### 2. API Integration Tests

Test backend API endpoints directly without UI.

**Location**: `tests/integration/`

**What we test**:
- Authentication endpoints
- CRUD operations
- Error handling
- Rate limiting
- File uploads
- Validation

**Example**:
```typescript
test('POST /api/auth/login', async ({ request }) => {
  const response = await request.post(`${API_BASE_URL}/api/auth/login`, {
    data: { email: 'test@test.com', password: 'password' }
  });

  expect(response.status()).toBe(200);
  const data = await response.json();
  expect(data).toHaveProperty('token');
});
```

### 3. Performance Tests

Test application performance and optimization.

**Location**: `tests/performance/`

**What we test**:
- Lighthouse scores (Performance, Accessibility, SEO)
- Page load times
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)
- Cumulative Layout Shift (CLS)
- Bundle sizes
- Memory leaks
- API response times

**Example**:
```typescript
test('homepage performance', async ({ page }) => {
  await page.goto('/');

  await playAudit({
    page,
    thresholds: {
      performance: 80,
      accessibility: 90,
      'best-practices': 85,
      seo: 85,
    },
  });
});
```

### 4. Visual Regression Tests

Test for unintended visual changes.

**Location**: `tests/e2e/*.visual.spec.ts`

**What we test**:
- Critical page layouts
- Component styling
- Responsive designs
- Dark/light themes

**Example**:
```typescript
test('dashboard screenshot', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveScreenshot('dashboard.png');
});
```

### 5. Accessibility Tests

Test for WCAG compliance.

**Location**: `tests/e2e/*.a11y.spec.ts`

**What we test**:
- Keyboard navigation
- Screen reader compatibility
- Color contrast
- ARIA attributes
- Focus management

---

## Writing Tests

### Test Naming Convention

```typescript
test.describe('Feature Name', () => {
  test.describe('Sub-feature', () => {
    test('should do specific action when condition', async ({ page }) => {
      // Test implementation
    });
  });
});
```

### Best Practices

#### 1. Use Page Objects

**Bad**:
```typescript
test('login', async ({ page }) => {
  await page.fill('input[name="email"]', 'test@test.com');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');
});
```

**Good**:
```typescript
test('login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.login('test@test.com', 'password');
});
```

#### 2. Use Test Data Constants

**Bad**:
```typescript
test('login', async ({ page }) => {
  await loginPage.login('student@test.com', 'Test123!@#');
});
```

**Good**:
```typescript
test('login', async ({ page }) => {
  await loginPage.login(TEST_USERS.student.email, TEST_USERS.student.password);
});
```

#### 3. Wait for Network Idle

**Bad**:
```typescript
await page.goto('/dashboard');
await page.click('[data-testid="button"]');
```

**Good**:
```typescript
await page.goto('/dashboard');
await page.waitForLoadState('networkidle');
await page.click('[data-testid="button"]');
```

#### 4. Use Data Test IDs

**Bad**:
```typescript
await page.click('.btn.btn-primary.submit-btn');
```

**Good**:
```typescript
await page.click('[data-testid="submit-button"]');
```

#### 5. Handle Async Operations

**Bad**:
```typescript
await page.click('[data-testid="save"]');
expect(page.url()).toContain('/success');
```

**Good**:
```typescript
await page.click('[data-testid="save"]');
await page.waitForURL('**/success');
await expect(page).toHaveURL(/success/);
```

#### 6. Clean Up After Tests

```typescript
test.afterEach(async ({ page }) => {
  // Clean up test data
  await page.evaluate(() => localStorage.clear());
});
```

### Test Data Management

Use the test data factory:

```typescript
import { TEST_USERS, generateTestUser } from '../fixtures/test-data';

// Use predefined test user
test('with existing user', async ({ page }) => {
  await loginPage.login(TEST_USERS.student.email, TEST_USERS.student.password);
});

// Generate unique test user
test('with new user', async ({ page }) => {
  const user = generateTestUser();
  await registerPage.register(user);
});
```

---

## Running Tests

### Local Development

```bash
# Run all tests
npm run test:e2e

# Run specific file
npm run test:e2e tests/e2e/auth.spec.ts

# Run tests matching pattern
npm run test:e2e --grep "login"

# Run in headed mode
npm run test:e2e:headed

# Run in debug mode
npm run test:e2e:debug

# Run in UI mode
npm run test:e2e:ui

# Run on specific browser
npm run test:e2e -- --project=chromium
npm run test:e2e -- --project=firefox
npm run test:e2e -- --project=webkit

# Run API tests only
npm run test:e2e -- --project=api

# Run performance tests
npm run test:e2e tests/performance/

# Run with retries
npm run test:e2e -- --retries=2

# Run in parallel
npm run test:e2e -- --workers=4

# Generate HTML report
npm run test:e2e -- --reporter=html

# Update snapshots
npm run test:e2e -- --update-snapshots
```

### Test Filtering

```bash
# By test name
npx playwright test --grep "should login"

# By file name
npx playwright test auth.spec.ts

# By tag
npx playwright test --grep @smoke

# Invert match
npx playwright test --grep-invert "slow"
```

### Debugging

```bash
# Debug specific test
npx playwright test auth.spec.ts --debug

# Debug from specific line
npx playwright test auth.spec.ts:10 --debug

# Headed mode with slowMo
npx playwright test --headed --slow-mo=1000

# Show browser
npx playwright test --headed

# Pause on failure
npx playwright test --pause-on-failure
```

### Reports

View HTML report:
```bash
npx playwright show-report
```

View trace:
```bash
npx playwright show-trace trace.zip
```

---

## CI/CD Integration

### GitHub Actions

The test suite runs automatically on:
- Push to main/develop branches
- Pull requests
- Daily schedule (2 AM)
- Manual workflow dispatch

**Workflow stages**:
1. Install dependencies
2. Lint and type check
3. Run unit tests
4. Run E2E tests (sharded across browsers)
5. Run API tests
6. Run performance tests
7. Run visual regression tests
8. Merge reports
9. Publish to GitHub Pages
10. Send notifications

### Environment Variables

Required for CI:
```env
PLAYWRIGHT_BASE_URL=http://localhost:5173
API_BASE_URL=http://localhost:3000
CI=true
```

Optional:
```env
LHCI_GITHUB_APP_TOKEN=<lighthouse-token>
SLACK_WEBHOOK=<slack-webhook-url>
```

### Test Sharding

Tests are automatically sharded across multiple workers:

```yaml
strategy:
  matrix:
    project: [chromium, firefox, webkit]
    shard: [1, 2, 3, 4]
```

This runs 12 parallel jobs (3 browsers × 4 shards).

---

## Best Practices

### Test Organization

1. **Group related tests**: Use `test.describe()` blocks
2. **Use descriptive names**: Test names should be self-explanatory
3. **Keep tests independent**: Each test should run in isolation
4. **Use setup/teardown**: Share common setup logic
5. **Avoid test interdependencies**: Don't rely on test execution order

### Performance

1. **Use parallel execution**: Run tests concurrently when possible
2. **Reuse authentication**: Use storage state for auth
3. **Mock external services**: Don't depend on external APIs
4. **Optimize selectors**: Use efficient locator strategies
5. **Clean up properly**: Remove test data after tests

### Reliability

1. **Wait for elements**: Use proper waiting strategies
2. **Handle async operations**: Always await promises
3. **Use retry logic**: Add retries for flaky tests
4. **Implement timeouts**: Set appropriate timeout values
5. **Check multiple states**: Verify both positive and negative cases

### Maintenance

1. **Use Page Objects**: Encapsulate page logic
2. **Extract common logic**: Create reusable helpers
3. **Keep tests simple**: One assertion per test when possible
4. **Document complex tests**: Add comments for clarity
5. **Update regularly**: Keep tests in sync with features

---

## Troubleshooting

### Common Issues

#### 1. Tests Timing Out

**Problem**: Tests fail with timeout errors

**Solution**:
```typescript
// Increase timeout for slow operations
test.setTimeout(120000); // 2 minutes

// Wait for specific conditions
await page.waitForLoadState('networkidle');
await page.waitForSelector('[data-testid="element"]');
```

#### 2. Flaky Tests

**Problem**: Tests pass/fail inconsistently

**Solutions**:
- Add proper waits: `waitForLoadState`, `waitForSelector`
- Use `waitForURL` instead of checking URL immediately
- Add retries: `test.describe.configure({ retries: 2 })`
- Check for race conditions
- Ensure proper cleanup

#### 3. Authentication Issues

**Problem**: Tests fail because not authenticated

**Solution**:
```typescript
// Use authenticated fixture
test.use({ storageState: 'playwright/.auth/student.json' });

// Or manually authenticate
test.beforeEach(async ({ page, authHelper }) => {
  await authHelper.login(TEST_USERS.student.email, TEST_USERS.student.password);
});
```

#### 4. Element Not Found

**Problem**: `Locator.click: No element found`

**Solutions**:
- Wait for element: `await element.waitFor()`
- Check selector: Use Playwright Inspector
- Verify page loaded: `await page.waitForLoadState()`
- Use correct locator strategy
- Check for dynamic content

#### 5. Screenshots Differ

**Problem**: Visual regression tests failing

**Solutions**:
- Update snapshots: `--update-snapshots`
- Check for animations: Use `animations: 'disabled'`
- Wait for fonts: `await page.waitForLoadState('networkidle')`
- Use consistent viewport size
- Disable anti-aliasing variations

### Debug Tools

**Playwright Inspector**:
```bash
npx playwright test --debug
```

**Trace Viewer**:
```bash
npx playwright show-trace trace.zip
```

**Codegen** (Record tests):
```bash
npx playwright codegen http://localhost:5173
```

**VS Code Extension**:
Install "Playwright Test for VSCode" for:
- Test running from editor
- Debugging support
- Test generation
- Pick locators

---

## Contributing

### Adding New Tests

1. **Create test file** in appropriate directory
2. **Import fixtures** and page objects
3. **Write test** following naming conventions
4. **Add test data** to fixtures if needed
5. **Run locally** to verify
6. **Create PR** with test coverage report

### Test Review Checklist

- [ ] Tests are independent
- [ ] Proper waits and assertions
- [ ] Page objects used appropriately
- [ ] Test data constants used
- [ ] No hardcoded values
- [ ] Cleanup implemented
- [ ] Tests pass locally
- [ ] Tests pass in CI
- [ ] Documentation updated

### Reporting Issues

When reporting test failures:
1. Test name and file
2. Error message and stack trace
3. Screenshots/videos if available
4. Steps to reproduce
5. Environment details (OS, browser, etc.)

---

## Additional Resources

- [Playwright Documentation](https://playwright.dev)
- [Vitest Documentation](https://vitest.dev)
- [Testing Library](https://testing-library.com)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Project README](../README.md)

---

## Support

For questions or issues:
- Create an issue on GitHub
- Contact the QA team
- Check existing documentation
- Review test examples

---

**Last Updated**: 2025-02-17
**Version**: 1.0.0
