import { test, expect } from './fixtures';

test.describe('Homepage', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Playwright & Selenium Learning Platform/);
  });

  test('should display main navigation', async ({ page }) => {
    await page.goto('/');

    // Check for main navigation elements
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('should be accessible', async ({ page }) => {
    await page.goto('/');

    // Check for basic accessibility
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page).toHaveTitle(/Playwright & Selenium Learning Platform/);
  });

  test('should work on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await expect(page).toHaveTitle(/Playwright & Selenium Learning Platform/);
  });
});
