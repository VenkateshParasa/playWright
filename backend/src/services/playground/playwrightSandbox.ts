import { chromium, firefox, webkit, Browser, BrowserContext, Page } from 'playwright';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

export interface PlaywrightSession {
  id: string;
  userId: string;
  browser: 'chromium' | 'firefox' | 'webkit';
  status: 'active' | 'recording' | 'stopped';
  createdAt: Date;
  expiresAt: Date;
  recordings: Recording[];
  screenshots: Screenshot[];
}

export interface Recording {
  id: string;
  name: string;
  code: string;
  language: 'javascript' | 'python' | 'java' | 'csharp';
  createdAt: Date;
}

export interface Screenshot {
  id: string;
  name: string;
  path: string;
  timestamp: Date;
}

export interface PlaywrightAction {
  type: 'navigate' | 'click' | 'type' | 'select' | 'hover' | 'screenshot' | 'evaluate';
  selector?: string;
  value?: string;
  url?: string;
  code?: string;
  options?: any;
}

export interface PlaywrightExecutionResult {
  success: boolean;
  result?: any;
  screenshot?: string;
  error?: string;
  console?: string[];
  network?: NetworkEvent[];
}

export interface NetworkEvent {
  url: string;
  method: string;
  status?: number;
  timestamp: Date;
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;
}

export interface ElementInfo {
  selector: string;
  tagName: string;
  id?: string;
  className?: string;
  attributes: Record<string, string>;
  text?: string;
  xpath?: string;
}

class PlaywrightSandboxService {
  private sessions: Map<string, {
    session: PlaywrightSession;
    browser: Browser;
    context: BrowserContext;
    page: Page;
    consoleMessages: string[];
    networkEvents: NetworkEvent[];
    recording: boolean;
    recordedActions: PlaywrightAction[];
  }> = new Map();

  private screenshotsDir = '/tmp/playwright-screenshots';
  private videosDir = '/tmp/playwright-videos';

  constructor() {
    this.initDirectories();
    this.startCleanupScheduler();
  }

  private async initDirectories(): Promise<void> {
    try {
      await fs.mkdir(this.screenshotsDir, { recursive: true });
      await fs.mkdir(this.videosDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create directories:', error);
    }
  }

  /**
   * Create a new Playwright session
   */
  async createSession(
    userId: string,
    browserType: 'chromium' | 'firefox' | 'webkit' = 'chromium',
    duration: number = 30 // minutes
  ): Promise<PlaywrightSession> {
    const sessionId = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + duration * 60 * 1000);

    // Launch browser
    let browser: Browser;
    switch (browserType) {
      case 'firefox':
        browser = await firefox.launch({ headless: true });
        break;
      case 'webkit':
        browser = await webkit.launch({ headless: true });
        break;
      default:
        browser = await chromium.launch({ headless: true });
    }

    // Create context with video recording
    const context = await browser.newContext({
      recordVideo: {
        dir: this.videosDir,
        size: { width: 1280, height: 720 },
      },
      viewport: { width: 1280, height: 720 },
    });

    // Create page
    const page = await context.newPage();

    // Setup console and network listeners
    const consoleMessages: string[] = [];
    const networkEvents: NetworkEvent[] = [];

    page.on('console', (msg) => {
      consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
    });

    page.on('request', (request) => {
      networkEvents.push({
        url: request.url(),
        method: request.method(),
        timestamp: new Date(),
        requestHeaders: request.headers(),
      });
    });

    page.on('response', (response) => {
      const existingEvent = networkEvents.find((e) => e.url === response.url());
      if (existingEvent) {
        existingEvent.status = response.status();
        existingEvent.responseHeaders = response.headers();
      }
    });

    const session: PlaywrightSession = {
      id: sessionId,
      userId,
      browser: browserType,
      status: 'active',
      createdAt: new Date(),
      expiresAt,
      recordings: [],
      screenshots: [],
    };

    this.sessions.set(sessionId, {
      session,
      browser,
      context,
      page,
      consoleMessages,
      networkEvents,
      recording: false,
      recordedActions: [],
    });

    return session;
  }

  /**
   * Get session
   */
  getSession(sessionId: string): PlaywrightSession | null {
    const sessionData = this.sessions.get(sessionId);
    return sessionData?.session || null;
  }

  /**
   * Execute Playwright action
   */
  async executeAction(
    sessionId: string,
    action: PlaywrightAction
  ): Promise<PlaywrightExecutionResult> {
    const sessionData = this.sessions.get(sessionId);
    if (!sessionData) {
      return { success: false, error: 'Session not found' };
    }

    const { page, consoleMessages, networkEvents, recording, recordedActions } = sessionData;

    // Record action if recording
    if (recording) {
      recordedActions.push(action);
    }

    try {
      let result: any;

      switch (action.type) {
        case 'navigate':
          if (!action.url) {
            throw new Error('URL is required for navigate action');
          }
          await page.goto(action.url, { waitUntil: 'networkidle', ...action.options });
          result = { url: page.url() };
          break;

        case 'click':
          if (!action.selector) {
            throw new Error('Selector is required for click action');
          }
          await page.click(action.selector, action.options);
          result = { clicked: action.selector };
          break;

        case 'type':
          if (!action.selector || !action.value) {
            throw new Error('Selector and value are required for type action');
          }
          await page.fill(action.selector, action.value, action.options);
          result = { typed: action.value };
          break;

        case 'select':
          if (!action.selector || !action.value) {
            throw new Error('Selector and value are required for select action');
          }
          await page.selectOption(action.selector, action.value, action.options);
          result = { selected: action.value };
          break;

        case 'hover':
          if (!action.selector) {
            throw new Error('Selector is required for hover action');
          }
          await page.hover(action.selector, action.options);
          result = { hovered: action.selector };
          break;

        case 'screenshot':
          const screenshotPath = path.join(
            this.screenshotsDir,
            `${sessionId}-${Date.now()}.png`
          );
          await page.screenshot({ path: screenshotPath, fullPage: true, ...action.options });
          const screenshotData = await fs.readFile(screenshotPath);
          const screenshot = screenshotData.toString('base64');

          // Save screenshot info
          sessionData.session.screenshots.push({
            id: crypto.randomBytes(8).toString('hex'),
            name: `Screenshot ${sessionData.session.screenshots.length + 1}`,
            path: screenshotPath,
            timestamp: new Date(),
          });

          result = { screenshot: screenshotPath };
          return {
            success: true,
            result,
            screenshot: `data:image/png;base64,${screenshot}`,
            console: [...consoleMessages],
            network: [...networkEvents],
          };

        case 'evaluate':
          if (!action.code) {
            throw new Error('Code is required for evaluate action');
          }
          result = await page.evaluate(action.code);
          break;

        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }

      return {
        success: true,
        result,
        console: [...consoleMessages],
        network: [...networkEvents],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        console: [...consoleMessages],
        network: [...networkEvents],
      };
    }
  }

  /**
   * Execute Playwright script
   */
  async executeScript(
    sessionId: string,
    code: string,
    language: 'javascript' | 'python' = 'javascript'
  ): Promise<PlaywrightExecutionResult> {
    const sessionData = this.sessions.get(sessionId);
    if (!sessionData) {
      return { success: false, error: 'Session not found' };
    }

    try {
      // For JavaScript, we can execute directly
      if (language === 'javascript') {
        const result = await sessionData.page.evaluate(code);
        return {
          success: true,
          result,
          console: [...sessionData.consoleMessages],
          network: [...sessionData.networkEvents],
        };
      }

      // For other languages, we'd need to transpile or use a different execution method
      return {
        success: false,
        error: 'Language not supported for direct execution',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        console: [...sessionData.consoleMessages],
        network: [...sessionData.networkEvents],
      };
    }
  }

  /**
   * Start recording actions
   */
  async startRecording(sessionId: string): Promise<void> {
    const sessionData = this.sessions.get(sessionId);
    if (!sessionData) {
      throw new Error('Session not found');
    }

    sessionData.recording = true;
    sessionData.recordedActions = [];
    sessionData.session.status = 'recording';
  }

  /**
   * Stop recording and generate code
   */
  async stopRecording(
    sessionId: string,
    language: 'javascript' | 'python' | 'java' | 'csharp' = 'javascript'
  ): Promise<Recording> {
    const sessionData = this.sessions.get(sessionId);
    if (!sessionData) {
      throw new Error('Session not found');
    }

    sessionData.recording = false;
    sessionData.session.status = 'active';

    // Generate code from recorded actions
    const code = this.generateCode(sessionData.recordedActions, language);

    const recording: Recording = {
      id: crypto.randomBytes(8).toString('hex'),
      name: `Recording ${sessionData.session.recordings.length + 1}`,
      code,
      language,
      createdAt: new Date(),
    };

    sessionData.session.recordings.push(recording);
    return recording;
  }

  /**
   * Get element information
   */
  async getElementInfo(sessionId: string, selector: string): Promise<ElementInfo | null> {
    const sessionData = this.sessions.get(sessionId);
    if (!sessionData) {
      throw new Error('Session not found');
    }

    try {
      const element = await sessionData.page.$(selector);
      if (!element) {
        return null;
      }

      const info = await element.evaluate((el) => {
        const attributes: Record<string, string> = {};
        for (const attr of el.attributes) {
          attributes[attr.name] = attr.value;
        }

        return {
          tagName: el.tagName.toLowerCase(),
          id: el.id,
          className: el.className,
          attributes,
          text: el.textContent?.trim(),
        };
      });

      return {
        selector,
        ...info,
        xpath: await this.getXPath(sessionData.page, selector),
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Get page HTML
   */
  async getPageHTML(sessionId: string): Promise<string> {
    const sessionData = this.sessions.get(sessionId);
    if (!sessionData) {
      throw new Error('Session not found');
    }

    return await sessionData.page.content();
  }

  /**
   * Get page URL
   */
  async getPageURL(sessionId: string): Promise<string> {
    const sessionData = this.sessions.get(sessionId);
    if (!sessionData) {
      throw new Error('Session not found');
    }

    return sessionData.page.url();
  }

  /**
   * Get console messages
   */
  getConsoleMessages(sessionId: string): string[] {
    const sessionData = this.sessions.get(sessionId);
    if (!sessionData) {
      throw new Error('Session not found');
    }

    return [...sessionData.consoleMessages];
  }

  /**
   * Get network events
   */
  getNetworkEvents(sessionId: string): NetworkEvent[] {
    const sessionData = this.sessions.get(sessionId);
    if (!sessionData) {
      throw new Error('Session not found');
    }

    return [...sessionData.networkEvents];
  }

  /**
   * Close session
   */
  async closeSession(sessionId: string): Promise<void> {
    const sessionData = this.sessions.get(sessionId);
    if (!sessionData) {
      return;
    }

    try {
      await sessionData.context.close();
      await sessionData.browser.close();
    } catch (error) {
      console.error('Error closing session:', error);
    }

    this.sessions.delete(sessionId);
  }

  /**
   * Generate code from recorded actions
   */
  private generateCode(actions: PlaywrightAction[], language: string): string {
    const codeGenerators: Record<string, (actions: PlaywrightAction[]) => string> = {
      javascript: this.generateJavaScriptCode.bind(this),
      python: this.generatePythonCode.bind(this),
      java: this.generateJavaCode.bind(this),
      csharp: this.generateCSharpCode.bind(this),
    };

    const generator = codeGenerators[language];
    return generator ? generator(actions) : '';
  }

  private generateJavaScriptCode(actions: PlaywrightAction[]): string {
    const lines = [
      "const { chromium } = require('playwright');",
      '',
      '(async () => {',
      '  const browser = await chromium.launch();',
      '  const context = await browser.newContext();',
      '  const page = await context.newPage();',
      '',
    ];

    for (const action of actions) {
      switch (action.type) {
        case 'navigate':
          lines.push(`  await page.goto('${action.url}');`);
          break;
        case 'click':
          lines.push(`  await page.click('${action.selector}');`);
          break;
        case 'type':
          lines.push(`  await page.fill('${action.selector}', '${action.value}');`);
          break;
        case 'select':
          lines.push(`  await page.selectOption('${action.selector}', '${action.value}');`);
          break;
        case 'hover':
          lines.push(`  await page.hover('${action.selector}');`);
          break;
        case 'screenshot':
          lines.push(`  await page.screenshot({ path: 'screenshot.png' });`);
          break;
      }
    }

    lines.push('', '  await browser.close();', '})();');
    return lines.join('\n');
  }

  private generatePythonCode(actions: PlaywrightAction[]): string {
    const lines = [
      'from playwright.sync_api import sync_playwright',
      '',
      'with sync_playwright() as p:',
      '    browser = p.chromium.launch()',
      '    context = browser.new_context()',
      '    page = context.new_page()',
      '',
    ];

    for (const action of actions) {
      switch (action.type) {
        case 'navigate':
          lines.push(`    page.goto('${action.url}')`);
          break;
        case 'click':
          lines.push(`    page.click('${action.selector}')`);
          break;
        case 'type':
          lines.push(`    page.fill('${action.selector}', '${action.value}')`);
          break;
        case 'select':
          lines.push(`    page.select_option('${action.selector}', '${action.value}')`);
          break;
        case 'hover':
          lines.push(`    page.hover('${action.selector}')`);
          break;
        case 'screenshot':
          lines.push(`    page.screenshot(path='screenshot.png')`);
          break;
      }
    }

    lines.push('', '    browser.close()');
    return lines.join('\n');
  }

  private generateJavaCode(actions: PlaywrightAction[]): string {
    const lines = [
      'import com.microsoft.playwright.*;',
      '',
      'public class PlaywrightTest {',
      '  public static void main(String[] args) {',
      '    try (Playwright playwright = Playwright.create()) {',
      '      Browser browser = playwright.chromium().launch();',
      '      BrowserContext context = browser.newContext();',
      '      Page page = context.newPage();',
      '',
    ];

    for (const action of actions) {
      switch (action.type) {
        case 'navigate':
          lines.push(`      page.navigate("${action.url}");`);
          break;
        case 'click':
          lines.push(`      page.click("${action.selector}");`);
          break;
        case 'type':
          lines.push(`      page.fill("${action.selector}", "${action.value}");`);
          break;
        case 'select':
          lines.push(`      page.selectOption("${action.selector}", "${action.value}");`);
          break;
        case 'hover':
          lines.push(`      page.hover("${action.selector}");`);
          break;
        case 'screenshot':
          lines.push(`      page.screenshot(new Page.ScreenshotOptions().setPath(Paths.get("screenshot.png")));`);
          break;
      }
    }

    lines.push('', '      browser.close();', '    }', '  }', '}');
    return lines.join('\n');
  }

  private generateCSharpCode(actions: PlaywrightAction[]): string {
    const lines = [
      'using Microsoft.Playwright;',
      '',
      'class Program',
      '{',
      '  static async Task Main()',
      '  {',
      '    using var playwright = await Playwright.CreateAsync();',
      '    await using var browser = await playwright.Chromium.LaunchAsync();',
      '    var context = await browser.NewContextAsync();',
      '    var page = await context.NewPageAsync();',
      '',
    ];

    for (const action of actions) {
      switch (action.type) {
        case 'navigate':
          lines.push(`    await page.GotoAsync("${action.url}");`);
          break;
        case 'click':
          lines.push(`    await page.ClickAsync("${action.selector}");`);
          break;
        case 'type':
          lines.push(`    await page.FillAsync("${action.selector}", "${action.value}");`);
          break;
        case 'select':
          lines.push(`    await page.SelectOptionAsync("${action.selector}", "${action.value}");`);
          break;
        case 'hover':
          lines.push(`    await page.HoverAsync("${action.selector}");`);
          break;
        case 'screenshot':
          lines.push(`    await page.ScreenshotAsync(new() { Path = "screenshot.png" });`);
          break;
      }
    }

    lines.push('  }', '}');
    return lines.join('\n');
  }

  /**
   * Get XPath for element
   */
  private async getXPath(page: Page, selector: string): Promise<string> {
    try {
      return await page.evaluate((sel) => {
        const element = document.querySelector(sel);
        if (!element) return '';

        const getPathTo = (el: Element): string => {
          if (el.id) return `//*[@id="${el.id}"]`;

          if (el === document.body) return '/html/body';

          let ix = 0;
          const siblings = el.parentNode?.children || [];
          for (let i = 0; i < siblings.length; i++) {
            const sibling = siblings[i];
            if (sibling === el) {
              const parentPath = el.parentNode ? getPathTo(el.parentNode as Element) : '';
              return `${parentPath}/${el.tagName.toLowerCase()}[${ix + 1}]`;
            }
            if (sibling.tagName === el.tagName) ix++;
          }
          return '';
        };

        return getPathTo(element);
      }, selector);
    } catch (error) {
      return '';
    }
  }

  /**
   * Cleanup expired sessions
   */
  private startCleanupScheduler(): void {
    setInterval(async () => {
      const now = Date.now();
      for (const [sessionId, sessionData] of this.sessions.entries()) {
        if (sessionData.session.expiresAt.getTime() < now) {
          try {
            await this.closeSession(sessionId);
            console.log(`Cleaned up expired Playwright session: ${sessionId}`);
          } catch (error) {
            console.error(`Failed to cleanup session ${sessionId}:`, error);
          }
        }
      }
    }, 60000); // Check every minute
  }
}

export default new PlaywrightSandboxService();
