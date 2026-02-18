import { chromium, FullConfig } from '@playwright/test';
import { TEST_USERS } from '../fixtures/test-data';
import path from 'path';
import fs from 'fs';

/**
 * Global setup for Playwright tests
 * Runs once before all tests
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup...');

  // Create auth directory if it doesn't exist
  const authDir = path.join(process.cwd(), 'playwright/.auth');
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  // Launch browser for authentication
  const browser = await chromium.launch();
  const baseURL = config.projects[0].use.baseURL || 'http://localhost:5173';

  // Authenticate different user roles
  await authenticateUser(browser, baseURL, TEST_USERS.student, 'student');
  await authenticateUser(browser, baseURL, TEST_USERS.instructor, 'instructor');
  await authenticateUser(browser, baseURL, TEST_USERS.admin, 'admin');

  await browser.close();

  console.log('✅ Global setup completed');
}

async function authenticateUser(browser: any, baseURL: string, user: any, role: string) {
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to login
    await page.goto(`${baseURL}/login`);

    // Fill login form
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForURL(`${baseURL}/dashboard`, { timeout: 10000 });

    // Save authenticated state
    await context.storageState({
      path: `playwright/.auth/${role}.json`,
    });

    console.log(`✅ Authenticated ${role} user`);
  } catch (error) {
    console.error(`❌ Failed to authenticate ${role}:`, error);
    // Create empty storage state so tests can run
    await context.storageState({
      path: `playwright/.auth/${role}.json`,
    });
  } finally {
    await page.close();
    await context.close();
  }
}

export default globalSetup;
