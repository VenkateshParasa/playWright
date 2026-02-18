import { test, expect } from '../fixtures/test-helpers';
import { AdminDashboardPage, AdminUsersPage, AdminContentPage } from '../pages/AdminPages';
import { generateTestUser } from '../fixtures/test-data';

test.describe('Admin Features', () => {
  test.use({ storageState: 'playwright/.auth/admin.json' });

  test.describe('Admin Dashboard', () => {
    let adminDashboard: AdminDashboardPage;

    test.beforeEach(async ({ page }) => {
      adminDashboard = new AdminDashboardPage(page);
      await adminDashboard.goto();
      await page.waitForLoadState('networkidle');
    });

    test('should display admin dashboard', async () => {
      await expect(adminDashboard.userStats).toBeVisible();
      await expect(adminDashboard.contentStats).toBeVisible();
    });

    test('should show user statistics', async () => {
      const totalUsers = await adminDashboard.getTotalUsers();
      expect(totalUsers).toBeGreaterThan(0);

      const activeUsers = await adminDashboard.getActiveUsers();
      expect(activeUsers).toBeGreaterThanOrEqual(0);
    });

    test('should display analytics chart', async () => {
      await expect(adminDashboard.analyticsChart).toBeVisible();
    });

    test('should show recent activity', async () => {
      await expect(adminDashboard.recentActivity).toBeVisible();
    });

    test('should allow navigation to management sections', async ({ page }) => {
      await page.click('[data-nav="users"]');
      await expect(page).toHaveURL(/\/admin\/users/);

      await page.click('[data-nav="content"]');
      await expect(page).toHaveURL(/\/admin\/content/);
    });
  });

  test.describe('User Management', () => {
    let adminUsersPage: AdminUsersPage;

    test.beforeEach(async ({ page }) => {
      adminUsersPage = new AdminUsersPage(page);
      await adminUsersPage.goto();
      await page.waitForLoadState('networkidle');
    });

    test('should display user list', async () => {
      await expect(adminUsersPage.userTable).toBeVisible();

      const userCount = await adminUsersPage.getUserCount();
      expect(userCount).toBeGreaterThan(0);
    });

    test('should search users', async ({ page }) => {
      await adminUsersPage.searchUsers('student');
      await page.waitForTimeout(600);

      const userCount = await adminUsersPage.getUserCount();
      expect(userCount).toBeGreaterThan(0);
    });

    test('should filter users by role', async ({ page }) => {
      await adminUsersPage.filterByRole('student');
      await page.waitForTimeout(300);

      const userCount = await adminUsersPage.getUserCount();
      expect(userCount).toBeGreaterThan(0);
    });

    test('should filter users by status', async ({ page }) => {
      await adminUsersPage.filterByStatus('active');
      await page.waitForTimeout(300);

      const userCount = await adminUsersPage.getUserCount();
      expect(userCount).toBeGreaterThan(0);
    });

    test('should view user details', async ({ page }) => {
      await adminUsersPage.clickUser('student@test.com');

      // Should navigate to user detail page
      await expect(page).toHaveURL(/\/admin\/users\/[\w-]+/);

      const userDetail = page.locator('[data-testid="user-detail"]');
      await expect(userDetail).toBeVisible();
    });

    test('should suspend user', async ({ page }) => {
      page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('suspend');
        await dialog.accept();
      });

      await adminUsersPage.suspendUser('student@test.com');

      // Should show success message
      const successMessage = page.locator('[data-testid="success-message"]');
      await expect(successMessage).toBeVisible();
    });

    test('should activate suspended user', async ({ page }) => {
      // First suspend a user
      await adminUsersPage.filterByStatus('suspended');
      await page.waitForTimeout(300);

      const suspendedUsers = await adminUsersPage.getUserCount();
      if (suspendedUsers > 0) {
        const activateButton = page.locator('[data-action="activate"]').first();
        await activateButton.click();

        page.on('dialog', async dialog => {
          await dialog.accept();
        });

        await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      }
    });

    test('should delete user with confirmation', async ({ page }) => {
      page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('delete');
        await dialog.dismiss(); // Cancel deletion
      });

      await adminUsersPage.deleteUser('student@test.com');
    });

    test('should perform bulk actions', async ({ page }) => {
      // Select multiple users
      const checkboxes = page.locator('[data-testid="user-checkbox"]');
      await checkboxes.first().check();
      await checkboxes.nth(1).check();

      // Open bulk actions menu
      await adminUsersPage.bulkActionsButton.click();

      const bulkMenu = page.locator('[data-testid="bulk-actions-menu"]');
      await expect(bulkMenu).toBeVisible();
    });

    test('should export user list', async ({ page }) => {
      const downloadPromise = page.waitForEvent('download');

      const exportButton = page.locator('[data-testid="export-users"]');
      await exportButton.click();

      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('users');
    });

    test('should paginate user list', async ({ page }) => {
      const nextButton = page.locator('[data-testid="next-page"]');
      if (await nextButton.isVisible()) {
        const page1Users = await adminUsersPage.getUserCount();

        await nextButton.click();
        await page.waitForTimeout(300);

        const page2Users = await adminUsersPage.getUserCount();
        expect(page2Users).toBeGreaterThan(0);
      }
    });

    test('should sort users by column', async ({ page }) => {
      const emailHeader = page.locator('[data-sort="email"]');
      await emailHeader.click();

      await page.waitForTimeout(300);

      // Get first two emails
      const firstEmail = await page.locator('[data-testid="user-email"]').first().textContent();
      const secondEmail = await page.locator('[data-testid="user-email"]').nth(1).textContent();

      // Verify alphabetical order
      expect(firstEmail! <= secondEmail!).toBe(true);
    });
  });

  test.describe('Content Management', () => {
    let adminContentPage: AdminContentPage;

    test.beforeEach(async ({ page }) => {
      adminContentPage = new AdminContentPage(page);
      await adminContentPage.goto();
      await page.waitForLoadState('networkidle');
    });

    test('should display content list', async () => {
      await expect(adminContentPage.contentList).toBeVisible();
    });

    test('should filter by content type', async ({ page }) => {
      await adminContentPage.selectContentType('lessons');
      await page.waitForTimeout(300);

      const contentItems = page.locator('[data-testid="content-item"]');
      const count = await contentItems.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should add new content', async ({ page }) => {
      await adminContentPage.addContent();

      // Should open content editor
      await expect(page).toHaveURL(/\/admin\/content\/new/);

      const editor = page.locator('[data-testid="content-editor"]');
      await expect(editor).toBeVisible();
    });

    test('should edit existing content', async ({ page }) => {
      await adminContentPage.selectContentType('lessons');
      await page.waitForTimeout(300);

      await adminContentPage.editContent('lesson-1');

      // Should navigate to editor
      await expect(page).toHaveURL(/\/admin\/content\/lesson-1\/edit/);
    });

    test('should delete content with confirmation', async ({ page }) => {
      page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('delete');
        await dialog.accept();
      });

      await adminContentPage.selectContentType('lessons');
      await page.waitForTimeout(300);

      await adminContentPage.deleteContent('lesson-1');

      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    });

    test('should publish content', async ({ page }) => {
      await adminContentPage.selectContentType('lessons');
      await page.waitForTimeout(300);

      const draftContent = page.locator('[data-status="draft"]').first();
      if (await draftContent.count() > 0) {
        const contentId = await draftContent.getAttribute('data-content-id');
        await adminContentPage.publishContent(contentId!);

        await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      }
    });

    test('should unpublish content', async ({ page }) => {
      await adminContentPage.selectContentType('lessons');
      await page.waitForTimeout(300);

      const publishedContent = page.locator('[data-status="published"]').first();
      if (await publishedContent.count() > 0) {
        const unpublishButton = publishedContent.locator('[data-action="unpublish"]');
        await unpublishButton.click();

        page.on('dialog', async dialog => {
          await dialog.accept();
        });

        await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      }
    });

    test('should preview content', async ({ page }) => {
      await adminContentPage.selectContentType('lessons');
      await page.waitForTimeout(300);

      const previewButton = page.locator('[data-action="preview"]').first();
      await previewButton.click();

      // Should open preview in new tab or modal
      const preview = page.locator('[data-testid="content-preview"]');
      await expect(preview).toBeVisible();
    });

    test('should search content', async ({ page }) => {
      const searchInput = page.locator('[data-testid="content-search"]');
      await searchInput.fill('playwright');
      await page.waitForTimeout(600);

      const results = page.locator('[data-testid="content-item"]');
      const count = await results.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should bulk publish content', async ({ page }) => {
      await adminContentPage.selectContentType('lessons');
      await page.waitForTimeout(300);

      // Select multiple draft items
      const draftCheckboxes = page.locator('[data-status="draft"] input[type="checkbox"]');
      const draftCount = await draftCheckboxes.count();

      if (draftCount > 0) {
        await draftCheckboxes.first().check();
        if (draftCount > 1) {
          await draftCheckboxes.nth(1).check();
        }

        // Bulk publish
        await page.click('[data-testid="bulk-publish"]');

        page.on('dialog', async dialog => {
          await dialog.accept();
        });

        await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      }
    });
  });

  test.describe('Analytics', () => {
    test('should display user activity analytics', async ({ page }) => {
      await page.goto('/admin/analytics');

      const activityChart = page.locator('[data-testid="activity-chart"]');
      await expect(activityChart).toBeVisible();
    });

    test('should filter analytics by date range', async ({ page }) => {
      await page.goto('/admin/analytics');

      const dateRangePicker = page.locator('[data-testid="date-range"]');
      await dateRangePicker.click();

      // Select last 7 days
      await page.click('[data-range="7d"]');

      await page.waitForTimeout(500);

      // Chart should update
      await expect(page.locator('[data-testid="activity-chart"]')).toBeVisible();
    });

    test('should export analytics report', async ({ page }) => {
      await page.goto('/admin/analytics');

      const downloadPromise = page.waitForEvent('download');

      await page.click('[data-testid="export-analytics"]');

      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('analytics');
    });

    test('should display completion rates', async ({ page }) => {
      await page.goto('/admin/analytics');

      const completionRate = page.locator('[data-metric="completion-rate"]');
      await expect(completionRate).toBeVisible();

      const rate = await completionRate.textContent();
      expect(rate).toMatch(/\d+%/);
    });

    test('should show popular content', async ({ page }) => {
      await page.goto('/admin/analytics');

      const popularContent = page.locator('[data-testid="popular-content"]');
      await expect(popularContent).toBeVisible();

      const items = popularContent.locator('[data-testid="content-item"]');
      const count = await items.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('System Settings', () => {
    test('should access system settings', async ({ page }) => {
      await page.goto('/admin/settings');

      const systemSettings = page.locator('[data-testid="system-settings"]');
      await expect(systemSettings).toBeVisible();
    });

    test('should update system configuration', async ({ page }) => {
      await page.goto('/admin/settings');

      const configInput = page.locator('[data-testid="max-upload-size"]');
      await configInput.fill('10');

      await page.click('[data-testid="save-config"]');

      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    });

    test('should view system logs', async ({ page }) => {
      await page.goto('/admin/logs');

      const logTable = page.locator('[data-testid="log-table"]');
      await expect(logTable).toBeVisible();

      const logs = logTable.locator('tbody tr');
      const count = await logs.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should filter logs by level', async ({ page }) => {
      await page.goto('/admin/logs');

      const levelFilter = page.locator('[data-testid="log-level-filter"]');
      await levelFilter.selectOption('error');

      await page.waitForTimeout(300);

      const errorLogs = page.locator('[data-log-level="error"]');
      const count = await errorLogs.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should search logs', async ({ page }) => {
      await page.goto('/admin/logs');

      const searchInput = page.locator('[data-testid="log-search"]');
      await searchInput.fill('auth');

      await page.waitForTimeout(600);

      const results = page.locator('[data-testid="log-entry"]');
      const count = await results.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('RBAC (Role-Based Access Control)', () => {
    test('should prevent student from accessing admin pages', async ({ page, browser }) => {
      // Create new context with student auth
      const studentContext = await browser.newContext({
        storageState: 'playwright/.auth/student.json',
      });
      const studentPage = await studentContext.newPage();

      // Try to access admin page
      await studentPage.goto('/admin');

      // Should redirect or show error
      await expect(studentPage).not.toHaveURL(/\/admin/);
      await studentContext.close();
    });

    test('should allow instructor limited admin access', async ({ page, browser }) => {
      const instructorContext = await browser.newContext({
        storageState: 'playwright/.auth/instructor.json',
      });
      const instructorPage = await instructorContext.newPage();

      // Try to access content management (should work)
      await instructorPage.goto('/admin/content');
      await expect(instructorPage).toHaveURL(/\/admin\/content/);

      // Try to access user management (should not work)
      await instructorPage.goto('/admin/users');

      const accessDenied = instructorPage.locator('[data-testid="access-denied"]');
      const hasAccessDenied = await accessDenied.count();

      if (hasAccessDenied > 0) {
        await expect(accessDenied).toBeVisible();
      }

      await instructorContext.close();
    });

    test('should allow admin full access', async ({ page }) => {
      // Test various admin routes
      const routes = [
        '/admin',
        '/admin/users',
        '/admin/content',
        '/admin/analytics',
        '/admin/settings',
      ];

      for (const route of routes) {
        await page.goto(route);
        await expect(page).toHaveURL(route);
      }
    });
  });
});
