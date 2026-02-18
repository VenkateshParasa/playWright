import { Page, Locator } from '@playwright/test';

/**
 * Base Page Object
 * Provides common functionality for all page objects
 */
export class BasePage {
  constructor(protected page: Page) {}

  async goto(path: string = '') {
    await this.page.goto(path);
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  async screenshot(name: string) {
    return await this.page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
  }

  async clickElement(selector: string) {
    await this.page.click(selector);
  }

  async fillInput(selector: string, value: string) {
    await this.page.fill(selector, value);
  }

  async getText(selector: string): Promise<string> {
    return await this.page.textContent(selector) || '';
  }

  async isVisible(selector: string): Promise<boolean> {
    return await this.page.isVisible(selector);
  }

  async waitForSelector(selector: string, timeout: number = 10000) {
    return await this.page.waitForSelector(selector, { timeout });
  }
}
