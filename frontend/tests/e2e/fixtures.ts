import { test as base } from '@playwright/test';

// Extend base test with custom fixtures
export const test = base.extend<{
  authenticatedPage: any;
}>({
  authenticatedPage: async ({ page }, use) => {
    // Setup: Login or set auth token
    await page.goto('/');
    // Add authentication logic here
    // e.g., await page.evaluate(() => localStorage.setItem('token', 'test-token'));

    await use(page);

    // Teardown: Clear auth state
    await page.evaluate(() => localStorage.clear());
  },
});

export { expect } from '@playwright/test';
