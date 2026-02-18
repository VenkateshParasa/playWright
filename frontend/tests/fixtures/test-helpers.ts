import { test as base, expect, Page, BrowserContext } from '@playwright/test';
import { TEST_USERS } from './test-data';

/**
 * Storage state paths for different user roles
 */
export const STORAGE_STATE = {
  student: 'playwright/.auth/student.json',
  instructor: 'playwright/.auth/instructor.json',
  admin: 'playwright/.auth/admin.json',
};

/**
 * Authentication helper
 */
export class AuthHelper {
  constructor(private page: Page) {}

  async login(email: string, password: string) {
    await this.page.goto('/login');
    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', password);
    await this.page.click('button[type="submit"]');

    // Wait for navigation after login
    await this.page.waitForURL('/dashboard', { timeout: 10000 });
  }

  async logout() {
    await this.page.click('[data-testid="user-menu"]');
    await this.page.click('[data-testid="logout-button"]');
    await this.page.waitForURL('/login');
  }

  async register(user: any) {
    await this.page.goto('/register');
    await this.page.fill('input[name="firstName"]', user.firstName);
    await this.page.fill('input[name="lastName"]', user.lastName);
    await this.page.fill('input[name="email"]', user.email);
    await this.page.fill('input[name="password"]', user.password);
    await this.page.fill('input[name="confirmPassword"]', user.password);
    await this.page.click('button[type="submit"]');

    // Wait for successful registration
    await this.page.waitForURL('/dashboard', { timeout: 10000 });
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.page.evaluate(() => localStorage.getItem('token'));
    return !!token;
  }

  async getAuthToken(): Promise<string | null> {
    return await this.page.evaluate(() => localStorage.getItem('token'));
  }

  async setAuthToken(token: string) {
    await this.page.evaluate((t) => localStorage.setItem('token', t), token);
  }
}

/**
 * Database helper for test data management
 */
export class DatabaseHelper {
  private apiUrl: string;

  constructor(apiUrl: string = 'http://localhost:3000') {
    this.apiUrl = apiUrl;
  }

  async seedTestData() {
    // Mock implementation - replace with actual API calls
    console.log('Seeding test data...');
  }

  async cleanupTestData() {
    // Mock implementation - replace with actual API calls
    console.log('Cleaning up test data...');
  }

  async createTestUser(user: any) {
    // Mock implementation
    return { id: 'test-user-id', ...user };
  }

  async deleteTestUser(userId: string) {
    // Mock implementation
    console.log(`Deleting user: ${userId}`);
  }

  async resetUserProgress(userId: string) {
    // Mock implementation
    console.log(`Resetting progress for user: ${userId}`);
  }
}

/**
 * API helper for backend testing
 */
export class APIHelper {
  private context: BrowserContext;
  private baseURL: string;

  constructor(context: BrowserContext, baseURL: string = 'http://localhost:3000') {
    this.context = context;
    this.baseURL = baseURL;
  }

  async request(method: string, endpoint: string, data?: any, token?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return await this.context.request.fetch(`${this.baseURL}${endpoint}`, {
      method,
      headers,
      data: data ? JSON.stringify(data) : undefined,
    });
  }

  async get(endpoint: string, token?: string) {
    return this.request('GET', endpoint, undefined, token);
  }

  async post(endpoint: string, data: any, token?: string) {
    return this.request('POST', endpoint, data, token);
  }

  async put(endpoint: string, data: any, token?: string) {
    return this.request('PUT', endpoint, data, token);
  }

  async delete(endpoint: string, token?: string) {
    return this.request('DELETE', endpoint, undefined, token);
  }
}

/**
 * Storage helper for localStorage and sessionStorage
 */
export class StorageHelper {
  constructor(private page: Page) {}

  async setItem(key: string, value: string, storage: 'local' | 'session' = 'local') {
    await this.page.evaluate(
      ({ k, v, s }) => {
        if (s === 'local') {
          localStorage.setItem(k, v);
        } else {
          sessionStorage.setItem(k, v);
        }
      },
      { k: key, v: value, s: storage }
    );
  }

  async getItem(key: string, storage: 'local' | 'session' = 'local'): Promise<string | null> {
    return await this.page.evaluate(
      ({ k, s }) => {
        if (s === 'local') {
          return localStorage.getItem(k);
        } else {
          return sessionStorage.getItem(k);
        }
      },
      { k: key, s: storage }
    );
  }

  async clear(storage: 'local' | 'session' | 'both' = 'both') {
    await this.page.evaluate((s) => {
      if (s === 'local' || s === 'both') {
        localStorage.clear();
      }
      if (s === 'session' || s === 'both') {
        sessionStorage.clear();
      }
    }, storage);
  }
}

/**
 * Wait helper for common wait scenarios
 */
export class WaitHelper {
  constructor(private page: Page) {}

  async waitForNetworkIdle() {
    await this.page.waitForLoadState('networkidle');
  }

  async waitForApiResponse(urlPattern: string | RegExp, timeout: number = 10000) {
    return await this.page.waitForResponse(urlPattern, { timeout });
  }

  async waitForElement(selector: string, timeout: number = 10000) {
    return await this.page.waitForSelector(selector, { timeout });
  }

  async waitForText(text: string, timeout: number = 10000) {
    return await this.page.waitForSelector(`text=${text}`, { timeout });
  }

  async waitForNavigation(urlPattern?: string | RegExp, timeout: number = 30000) {
    if (urlPattern) {
      await this.page.waitForURL(urlPattern, { timeout });
    } else {
      await this.page.waitForLoadState('load', { timeout });
    }
  }
}

/**
 * Screenshot helper for visual regression testing
 */
export class ScreenshotHelper {
  constructor(private page: Page) {}

  async takeFullPage(name: string) {
    return await this.page.screenshot({
      path: `screenshots/${name}.png`,
      fullPage: true,
    });
  }

  async takeElement(selector: string, name: string) {
    const element = await this.page.locator(selector);
    return await element.screenshot({
      path: `screenshots/${name}.png`,
    });
  }

  async compareSnapshot(name: string) {
    return await this.page.screenshot({
      animations: 'disabled',
      path: `screenshots/${name}.png`,
    });
  }
}

/**
 * Extended test fixtures with custom helpers
 */
type TestFixtures = {
  authenticatedPage: Page;
  studentPage: Page;
  instructorPage: Page;
  adminPage: Page;
  authHelper: AuthHelper;
  dbHelper: DatabaseHelper;
  apiHelper: APIHelper;
  storageHelper: StorageHelper;
  waitHelper: WaitHelper;
  screenshotHelper: ScreenshotHelper;
};

export const test = base.extend<TestFixtures>({
  /**
   * Page with student authentication
   */
  studentPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: STORAGE_STATE.student,
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  /**
   * Page with instructor authentication
   */
  instructorPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: STORAGE_STATE.instructor,
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  /**
   * Page with admin authentication
   */
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: STORAGE_STATE.admin,
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  /**
   * Generic authenticated page (defaults to student)
   */
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    const authHelper = new AuthHelper(page);
    await authHelper.login(TEST_USERS.student.email, TEST_USERS.student.password);

    await use(page);
    await context.close();
  },

  /**
   * Authentication helper
   */
  authHelper: async ({ page }, use) => {
    const helper = new AuthHelper(page);
    await use(helper);
  },

  /**
   * Database helper
   */
  dbHelper: async ({}, use) => {
    const helper = new DatabaseHelper();
    await use(helper);
  },

  /**
   * API helper
   */
  apiHelper: async ({ context }, use) => {
    const helper = new APIHelper(context);
    await use(helper);
  },

  /**
   * Storage helper
   */
  storageHelper: async ({ page }, use) => {
    const helper = new StorageHelper(page);
    await use(helper);
  },

  /**
   * Wait helper
   */
  waitHelper: async ({ page }, use) => {
    const helper = new WaitHelper(page);
    await use(helper);
  },

  /**
   * Screenshot helper
   */
  screenshotHelper: async ({ page }, use) => {
    const helper = new ScreenshotHelper(page);
    await use(helper);
  },
});

export { expect };
