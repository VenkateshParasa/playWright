import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Settings Page Object Model
 */
export class SettingsPage extends BasePage {
  readonly themeToggle: Locator;
  readonly languageSelect: Locator;
  readonly emailNotificationsToggle: Locator;
  readonly pushNotificationsToggle: Locator;
  readonly dailyGoalInput: Locator;
  readonly saveButton: Locator;
  readonly exportDataButton: Locator;
  readonly deleteAccountButton: Locator;

  constructor(page: Page) {
    super(page);
    this.themeToggle = page.locator('[data-testid="theme-toggle"]');
    this.languageSelect = page.locator('[data-testid="language-select"]');
    this.emailNotificationsToggle = page.locator('[data-testid="email-notifications"]');
    this.pushNotificationsToggle = page.locator('[data-testid="push-notifications"]');
    this.dailyGoalInput = page.locator('[data-testid="daily-goal"]');
    this.saveButton = page.locator('[data-testid="save-settings"]');
    this.exportDataButton = page.locator('[data-testid="export-data"]');
    this.deleteAccountButton = page.locator('[data-testid="delete-account"]');
  }

  async goto() {
    await super.goto('/settings');
  }

  async toggleTheme() {
    await this.themeToggle.click();
  }

  async selectLanguage(language: string) {
    await this.languageSelect.selectOption(language);
  }

  async toggleEmailNotifications() {
    await this.emailNotificationsToggle.click();
  }

  async setDailyGoal(minutes: number) {
    await this.dailyGoalInput.fill(minutes.toString());
  }

  async saveSettings() {
    await this.saveButton.click();
  }

  async exportData() {
    await this.exportDataButton.click();
  }
}

/**
 * Admin Dashboard Page Object Model
 */
export class AdminDashboardPage extends BasePage {
  readonly userStats: Locator;
  readonly contentStats: Locator;
  readonly analyticsChart: Locator;
  readonly recentActivity: Locator;

  constructor(page: Page) {
    super(page);
    this.userStats = page.locator('[data-testid="user-stats"]');
    this.contentStats = page.locator('[data-testid="content-stats"]');
    this.analyticsChart = page.locator('[data-testid="analytics-chart"]');
    this.recentActivity = page.locator('[data-testid="recent-activity"]');
  }

  async goto() {
    await super.goto('/admin');
  }

  async getTotalUsers(): Promise<number> {
    const text = await this.userStats.locator('[data-stat="total"]').textContent();
    return parseInt(text?.replace(/,/g, '') || '0');
  }

  async getActiveUsers(): Promise<number> {
    const text = await this.userStats.locator('[data-stat="active"]').textContent();
    return parseInt(text?.replace(/,/g, '') || '0');
  }
}

/**
 * Admin User Management Page Object Model
 */
export class AdminUsersPage extends BasePage {
  readonly searchInput: Locator;
  readonly roleFilter: Locator;
  readonly statusFilter: Locator;
  readonly userTable: Locator;
  readonly addUserButton: Locator;
  readonly bulkActionsButton: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page.locator('[data-testid="user-search"]');
    this.roleFilter = page.locator('[data-testid="role-filter"]');
    this.statusFilter = page.locator('[data-testid="status-filter"]');
    this.userTable = page.locator('[data-testid="user-table"]');
    this.addUserButton = page.locator('[data-testid="add-user"]');
    this.bulkActionsButton = page.locator('[data-testid="bulk-actions"]');
  }

  async goto() {
    await super.goto('/admin/users');
  }

  async searchUsers(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(500);
  }

  async filterByRole(role: 'all' | 'student' | 'instructor' | 'admin') {
    await this.roleFilter.selectOption(role);
  }

  async filterByStatus(status: 'all' | 'active' | 'suspended' | 'deleted') {
    await this.statusFilter.selectOption(status);
  }

  async getUserCount(): Promise<number> {
    return await this.userTable.locator('tbody tr').count();
  }

  async clickUser(email: string) {
    await this.page.click(`[data-user-email="${email}"]`);
  }

  async suspendUser(email: string) {
    await this.page.click(`[data-user-email="${email}"] [data-action="suspend"]`);
  }

  async deleteUser(email: string) {
    await this.page.click(`[data-user-email="${email}"] [data-action="delete"]`);
  }
}

/**
 * Admin Content Management Page Object Model
 */
export class AdminContentPage extends BasePage {
  readonly contentType: Locator;
  readonly addContentButton: Locator;
  readonly contentList: Locator;
  readonly publishButton: Locator;

  constructor(page: Page) {
    super(page);
    this.contentType = page.locator('[data-testid="content-type"]');
    this.addContentButton = page.locator('[data-testid="add-content"]');
    this.contentList = page.locator('[data-testid="content-list"]');
    this.publishButton = page.locator('[data-testid="publish"]');
  }

  async goto() {
    await super.goto('/admin/content');
  }

  async selectContentType(type: 'lessons' | 'quizzes' | 'flashcards' | 'exercises') {
    await this.contentType.selectOption(type);
  }

  async addContent() {
    await this.addContentButton.click();
  }

  async editContent(id: string) {
    await this.page.click(`[data-content-id="${id}"] [data-action="edit"]`);
  }

  async deleteContent(id: string) {
    await this.page.click(`[data-content-id="${id}"] [data-action="delete"]`);
  }

  async publishContent(id: string) {
    await this.page.click(`[data-content-id="${id}"] [data-action="publish"]`);
  }
}

/**
 * Exercises Page Object Model
 */
export class ExercisesPage extends BasePage {
  readonly exerciseTitle: Locator;
  readonly codeEditor: Locator;
  readonly runButton: Locator;
  readonly submitButton: Locator;
  readonly testResults: Locator;
  readonly hintButton: Locator;
  readonly solutionButton: Locator;
  readonly consoleOutput: Locator;

  constructor(page: Page) {
    super(page);
    this.exerciseTitle = page.locator('[data-testid="exercise-title"]');
    this.codeEditor = page.locator('.monaco-editor');
    this.runButton = page.locator('[data-testid="run-code"]');
    this.submitButton = page.locator('[data-testid="submit-solution"]');
    this.testResults = page.locator('[data-testid="test-results"]');
    this.hintButton = page.locator('[data-testid="show-hint"]');
    this.solutionButton = page.locator('[data-testid="show-solution"]');
    this.consoleOutput = page.locator('[data-testid="console-output"]');
  }

  async goto(exerciseId: string) {
    await super.goto(`/exercises/${exerciseId}`);
  }

  async writeCode(code: string) {
    // Monaco editor requires special handling
    await this.page.evaluate((codeToWrite) => {
      const editor = (window as any).monaco?.editor?.getModels()[0];
      if (editor) {
        editor.setValue(codeToWrite);
      }
    }, code);
  }

  async runCode() {
    await this.runButton.click();
  }

  async submitSolution() {
    await this.submitButton.click();
  }

  async showHint() {
    await this.hintButton.click();
  }

  async showSolution() {
    await this.solutionButton.click();
  }

  async getConsoleOutput(): Promise<string> {
    return await this.consoleOutput.textContent() || '';
  }

  async getTestResults(): Promise<string> {
    return await this.testResults.textContent() || '';
  }
}

/**
 * Profile Page Object Model
 */
export class ProfilePage extends BasePage {
  readonly avatarUpload: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailDisplay: Locator;
  readonly bioTextarea: Locator;
  readonly saveButton: Locator;
  readonly achievementsList: Locator;
  readonly statsDisplay: Locator;

  constructor(page: Page) {
    super(page);
    this.avatarUpload = page.locator('[data-testid="avatar-upload"]');
    this.firstNameInput = page.locator('input[name="firstName"]');
    this.lastNameInput = page.locator('input[name="lastName"]');
    this.emailDisplay = page.locator('[data-testid="email"]');
    this.bioTextarea = page.locator('textarea[name="bio"]');
    this.saveButton = page.locator('[data-testid="save-profile"]');
    this.achievementsList = page.locator('[data-testid="achievements-list"]');
    this.statsDisplay = page.locator('[data-testid="stats"]');
  }

  async goto() {
    await super.goto('/profile');
  }

  async updateProfile(data: { firstName?: string; lastName?: string; bio?: string }) {
    if (data.firstName) {
      await this.firstNameInput.fill(data.firstName);
    }
    if (data.lastName) {
      await this.lastNameInput.fill(data.lastName);
    }
    if (data.bio) {
      await this.bioTextarea.fill(data.bio);
    }
    await this.saveButton.click();
  }

  async uploadAvatar(filePath: string) {
    await this.avatarUpload.setInputFiles(filePath);
  }

  async getAchievementCount(): Promise<number> {
    return await this.achievementsList.locator('[data-testid="achievement"]').count();
  }
}
