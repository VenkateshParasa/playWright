# E2E Testing Quick Reference

## Quick Commands

### Run All Tests
```bash
npm run test:e2e
```

### Run Specific Browser
```bash
npm run test:e2e -- --project=chromium
npm run test:e2e -- --project=firefox
npm run test:e2e -- --project=webkit
```

### Run Specific Test File
```bash
npm run test:e2e tests/e2e/auth.spec.ts
npm run test:e2e tests/e2e/lessons.spec.ts
```

### Debug Mode
```bash
npm run test:e2e:debug
npm run test:e2e:headed
npm run test:e2e:ui
```

### Generate Report
```bash
npx playwright show-report
```

## Test File Structure

```
tests/
├── e2e/                    # E2E test files
│   ├── auth.spec.ts        # 25 tests - Authentication
│   ├── lessons.spec.ts     # 38 tests - Lesson system
│   ├── quiz.spec.ts        # 32 tests - Quiz system
│   ├── flashcards.spec.ts  # 28 tests - Flashcard reviews
│   ├── exercises.spec.ts   # 30 tests - Coding exercises
│   ├── admin.spec.ts       # 45 tests - Admin features
│   └── settings.spec.ts    # 33 tests - Settings & offline
├── integration/            # API tests
│   └── api.api.spec.ts     # 35 tests - API endpoints
├── performance/            # Performance tests
│   └── performance.spec.ts # 28 tests - Lighthouse, metrics
├── fixtures/               # Test data & helpers
│   ├── test-data.ts        # Mock data constants
│   └── test-helpers.ts     # Helper functions
├── pages/                  # Page Object Models
│   ├── BasePage.ts
│   ├── AuthPages.ts
│   ├── MainPages.ts
│   └── AdminPages.ts
└── setup/                  # Global setup/teardown
    ├── global-setup.ts
    └── global-teardown.ts
```

## Test Counts by Feature

| Feature | Test Count | File |
|---------|-----------|------|
| Authentication | 25 | auth.spec.ts |
| Lessons | 38 | lessons.spec.ts |
| Quiz System | 32 | quiz.spec.ts |
| Flashcards | 28 | flashcards.spec.ts |
| Exercises | 30 | exercises.spec.ts |
| Admin | 45 | admin.spec.ts |
| Settings | 33 | settings.spec.ts |
| API | 35 | api.api.spec.ts |
| Performance | 28 | performance.spec.ts |
| **Total** | **294** | |

## Common Test Patterns

### Using Page Objects
```typescript
import { LoginPage } from '../pages/AuthPages';

test('login flow', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('user@test.com', 'password');
});
```

### Using Test Data
```typescript
import { TEST_USERS } from '../fixtures/test-data';

test('with test user', async ({ page }) => {
  await loginPage.login(
    TEST_USERS.student.email,
    TEST_USERS.student.password
  );
});
```

### Using Authentication Fixtures
```typescript
test.use({ storageState: 'playwright/.auth/student.json' });

test('authenticated test', async ({ page }) => {
  // Already logged in as student
  await page.goto('/dashboard');
});
```

### API Testing
```typescript
test('API endpoint', async ({ request }) => {
  const response = await request.post('/api/login', {
    data: { email: 'test@test.com', password: 'pass' }
  });

  expect(response.status()).toBe(200);
  const data = await response.json();
  expect(data).toHaveProperty('token');
});
```

## Environment Variables

```env
# Required
PLAYWRIGHT_BASE_URL=http://localhost:5173
API_BASE_URL=http://localhost:3000

# Optional
CI=true
LHCI_GITHUB_APP_TOKEN=<token>
SLACK_WEBHOOK=<webhook-url>
TEST_GREP=<pattern>
```

## Debugging Tips

### View Test in Browser
```bash
npx playwright test --headed --slow-mo=1000
```

### Debug Specific Test
```bash
npx playwright test auth.spec.ts:10 --debug
```

### View Trace
```bash
npx playwright show-trace trace.zip
```

### Generate Tests
```bash
npx playwright codegen http://localhost:5173
```

## CI/CD

Tests run automatically on:
- Push to main/develop
- Pull requests
- Daily at 2 AM
- Manual trigger

View reports at:
`https://[org].github.io/[repo]/test-reports/[run-number]`

## Test Data

### Pre-defined Users
```typescript
TEST_USERS = {
  student: { email: 'student@test.com', password: 'Test123!@#' },
  instructor: { email: 'instructor@test.com', password: 'Test123!@#' },
  admin: { email: 'admin@test.com', password: 'Admin123!@#' },
}
```

### Generate Random User
```typescript
const user = generateTestUser('student');
// Returns: { email: 'test-[timestamp]@test.com', ... }
```

## Common Selectors

```typescript
// By test ID (preferred)
page.locator('[data-testid="submit-button"]')

// By role
page.getByRole('button', { name: 'Submit' })

// By text
page.getByText('Login')

// By label
page.getByLabel('Email')

// By placeholder
page.getByPlaceholder('Enter email')
```

## Waiting Strategies

```typescript
// Wait for network idle
await page.waitForLoadState('networkidle');

// Wait for URL
await page.waitForURL('/dashboard');

// Wait for selector
await page.waitForSelector('[data-testid="element"]');

// Wait for response
await page.waitForResponse('/api/data');

// Wait for timeout (avoid if possible)
await page.waitForTimeout(1000);
```

## Assertions

```typescript
// Visibility
await expect(element).toBeVisible();
await expect(element).toBeHidden();

// Text
await expect(element).toHaveText('Hello');
await expect(element).toContainText('ello');

// Value
await expect(input).toHaveValue('test');

// URL
await expect(page).toHaveURL('/dashboard');

// Count
await expect(elements).toHaveCount(5);

// Attribute
await expect(element).toHaveAttribute('data-id', '123');
```

## Performance Thresholds

```typescript
{
  performance: 80,      // Lighthouse performance score
  accessibility: 90,    // Lighthouse accessibility score
  'best-practices': 85, // Lighthouse best practices
  seo: 85,             // Lighthouse SEO score
  FCP: 1500,           // First Contentful Paint (ms)
  LCP: 2500,           // Largest Contentful Paint (ms)
  TTI: 3500,           // Time to Interactive (ms)
  CLS: 0.1,            // Cumulative Layout Shift
}
```

## Test Coverage Goals

- Overall: >85%
- Critical paths: 100%
- API endpoints: >90%
- Error handling: >80%
- Edge cases: >70%

## Support

- Documentation: `TESTING_GUIDE.md`
- Coverage Report: `TEST_COVERAGE_REPORT.md`
- Playwright Docs: https://playwright.dev
- GitHub Issues: Create issue for test failures
