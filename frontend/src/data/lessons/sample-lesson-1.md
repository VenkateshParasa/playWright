# Introduction to Playwright

## Overview

Playwright is a modern end-to-end testing framework that enables reliable and fast automation across all modern browsers. It was created by Microsoft and is built on top of the DevTools protocol.

## Why Playwright?

Playwright offers several advantages over other testing frameworks:

1. **Cross-browser support** - Test on Chromium, Firefox, and WebKit with a single API
2. **Auto-wait** - Playwright automatically waits for elements to be ready before performing actions
3. **Network interception** - Mock and modify network requests
4. **Multiple contexts** - Run tests in parallel with isolated browser contexts
5. **Developer tools** - Built-in inspector, trace viewer, and code generator

## Key Features

### Auto-waiting

One of Playwright's most powerful features is its built-in auto-waiting mechanism. Before performing any action, Playwright automatically waits for the element to be:

- Attached to the DOM
- Visible on the page
- Stable (not animating)
- Enabled
- Not obscured by other elements

This eliminates the need for manual `sleep()` or `wait()` calls in your tests.

### Browser Contexts

Playwright uses browser contexts to provide isolated environments for each test. This is similar to incognito mode - each context has its own cookies, cache, and local storage.

```typescript
import { test } from '@playwright/test';

test('example test with context', async ({ page }) => {
  // Navigate to a page
  await page.goto('https://example.com');

  // Interact with elements
  await page.click('button#submit');

  // Assert the result
  await expect(page.locator('h1')).toHaveText('Success');
});
```

### Network Interception

Playwright allows you to intercept and modify network requests, which is useful for:

- Mocking API responses
- Testing error scenarios
- Speeding up tests by avoiding unnecessary requests
- Testing with different data sets

```typescript
// Mock API response
await page.route('**/api/users', route => {
  route.fulfill({
    status: 200,
    body: JSON.stringify([
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' }
    ])
  });
});
```

## Getting Started

### Installation

To install Playwright in your project:

```bash
npm init playwright@latest
```

This command will:
1. Install Playwright and its dependencies
2. Create a `playwright.config.ts` file
3. Add example tests
4. Install browsers

### Your First Test

Here's a simple test that navigates to a page and verifies its title:

```typescript
import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Expect a title "to contain" a substring
  await expect(page).toHaveTitle(/Playwright/);
});
```

### Running Tests

You can run tests in different ways:

```bash
# Run all tests
npx playwright test

# Run tests in headed mode
npx playwright test --headed

# Run a specific test file
npx playwright test example.spec.ts

# Run tests in debug mode
npx playwright test --debug
```

## Best Practices

1. **Use locators wisely** - Prefer user-facing attributes like `role`, `text`, and `label` over CSS selectors
2. **Keep tests isolated** - Each test should be independent and not rely on the state from previous tests
3. **Use fixtures** - Leverage Playwright's fixture system for setup and teardown
4. **Handle flakiness** - Use auto-waiting and retry mechanisms to handle timing issues
5. **Organize tests** - Group related tests and use descriptive names

## Common Patterns

### Page Object Model

The Page Object Model (POM) is a design pattern that helps organize your test code:

```typescript
// login.page.ts
export class LoginPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('/login');
  }

  async login(username: string, password: string) {
    await this.page.fill('#username', username);
    await this.page.fill('#password', password);
    await this.page.click('button[type="submit"]');
  }

  async getErrorMessage() {
    return await this.page.textContent('.error-message');
  }
}

// test file
test('login with invalid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.login('invalid', 'credentials');

  const error = await loginPage.getErrorMessage();
  expect(error).toContain('Invalid username or password');
});
```

### Handling Dynamic Content

When dealing with dynamic content, use Playwright's waiting mechanisms:

```typescript
// Wait for element to appear
await page.waitForSelector('.dynamic-content');

// Wait for network to be idle
await page.waitForLoadState('networkidle');

// Wait for specific request
await page.waitForRequest('**/api/data');

// Wait for specific response
await page.waitForResponse(response =>
  response.url().includes('/api/data') && response.status() === 200
);
```

## Summary

In this lesson, we covered:
- What Playwright is and why it's useful
- Key features like auto-waiting and browser contexts
- How to install and set up Playwright
- Writing your first test
- Best practices and common patterns

## Next Steps

In the next lesson, we'll dive deeper into:
- Advanced selectors and locators
- Handling different types of elements (forms, dropdowns, file uploads)
- Working with multiple pages and frames
- Screenshot and video capture

## Resources

- [Official Playwright Documentation](https://playwright.dev/)
- [Playwright GitHub Repository](https://github.com/microsoft/playwright)
- [Playwright Discord Community](https://discord.com/invite/playwright)
- [Best Practices Guide](https://playwright.dev/docs/best-practices)

## Quiz

Test your understanding of this lesson:

1. What are the three browsers supported by Playwright?
2. What is a browser context in Playwright?
3. Name three things Playwright automatically waits for before performing an action.
4. How do you run Playwright tests in debug mode?

---

*Estimated reading time: 12 minutes*
*Difficulty: Beginner*
*Prerequisites: Basic JavaScript/TypeScript knowledge*
