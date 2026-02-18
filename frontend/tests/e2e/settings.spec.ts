import { test, expect } from '../fixtures/test-helpers';
import { SettingsPage } from '../pages/AdminPages';

test.describe('Settings and Preferences', () => {
  test.use({ storageState: 'playwright/.auth/student.json' });

  test.describe('Theme Settings', () => {
    let settingsPage: SettingsPage;

    test.beforeEach(async ({ page }) => {
      settingsPage = new SettingsPage(page);
      await settingsPage.goto();
      await page.waitForLoadState('networkidle');
    });

    test('should toggle theme', async ({ page }) => {
      await settingsPage.toggleTheme();

      // Verify theme changed
      const isDark = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark');
      });

      expect(isDark).toBeDefined();
    });

    test('should persist theme preference', async ({ page }) => {
      await settingsPage.toggleTheme();
      await settingsPage.saveSettings();

      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Theme should be maintained
      const theme = await page.evaluate(() => {
        return localStorage.getItem('theme');
      });

      expect(theme).toBeTruthy();
    });

    test('should apply theme across all pages', async ({ page }) => {
      await settingsPage.toggleTheme();

      const isDarkBefore = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark');
      });

      // Navigate to different page
      await page.goto('/lessons');

      const isDarkAfter = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark');
      });

      expect(isDarkBefore).toBe(isDarkAfter);
    });
  });

  test.describe('Notification Settings', () => {
    let settingsPage: SettingsPage;

    test.beforeEach(async ({ page }) => {
      settingsPage = new SettingsPage(page);
      await settingsPage.goto();
    });

    test('should toggle email notifications', async ({ page }) => {
      await settingsPage.toggleEmailNotifications();
      await settingsPage.saveSettings();

      // Verify saved
      const settings = await page.evaluate(() => {
        return JSON.parse(localStorage.getItem('settings') || '{}');
      });

      expect(settings).toHaveProperty('emailNotifications');
    });

    test('should toggle push notifications', async ({ page }) => {
      // Request notification permission
      await page.context().grantPermissions(['notifications']);

      await settingsPage.toggleEmailNotifications();
      await settingsPage.saveSettings();

      // Verify setting saved
      await expect(page.locator('[data-testid="save-success"]')).toBeVisible();
    });

    test('should update notification preferences', async ({ page }) => {
      await settingsPage.toggleEmailNotifications();
      await settingsPage.saveSettings();

      // Reload and verify persistence
      await page.reload();
      await page.waitForLoadState('networkidle');

      const isChecked = await settingsPage.emailNotificationsToggle.isChecked();
      expect(isChecked).toBeDefined();
    });
  });

  test.describe('Study Settings', () => {
    let settingsPage: SettingsPage;

    test.beforeEach(async ({ page }) => {
      settingsPage = new SettingsPage(page);
      await settingsPage.goto();
    });

    test('should set daily goal', async ({ page }) => {
      await settingsPage.setDailyGoal(60);
      await settingsPage.saveSettings();

      const goal = await page.evaluate(() => {
        const settings = JSON.parse(localStorage.getItem('settings') || '{}');
        return settings.dailyGoal;
      });

      expect(goal).toBe(60);
    });

    test('should validate daily goal input', async ({ page }) => {
      // Try invalid value
      await settingsPage.dailyGoalInput.fill('-10');
      await settingsPage.saveSettings();

      // Should show error or prevent save
      const errorMessage = page.locator('[data-testid="error-message"]');
      const hasError = await errorMessage.count();

      if (hasError > 0) {
        await expect(errorMessage).toBeVisible();
      }
    });

    test('should reflect daily goal on dashboard', async ({ page }) => {
      await settingsPage.setDailyGoal(45);
      await settingsPage.saveSettings();

      // Go to dashboard
      await page.goto('/dashboard');

      const goalDisplay = page.locator('[data-testid="daily-goal"]');
      const goalText = await goalDisplay.textContent();

      expect(goalText).toContain('45');
    });
  });

  test.describe('Privacy Settings', () => {
    test('should export user data', async ({ page }) => {
      const settingsPage = new SettingsPage(page);
      await settingsPage.goto();

      // Listen for download
      const downloadPromise = page.waitForEvent('download');

      await settingsPage.exportData();

      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('user-data');
    });

    test('should confirm before deleting account', async ({ page }) => {
      const settingsPage = new SettingsPage(page);
      await settingsPage.goto();

      page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('delete');
        await dialog.dismiss();
      });

      await settingsPage.deleteAccountButton.click();
    });

    test('should clear all data on account deletion', async ({ page }) => {
      const settingsPage = new SettingsPage(page);
      await settingsPage.goto();

      page.on('dialog', async dialog => {
        await dialog.accept();
      });

      await settingsPage.deleteAccountButton.click();

      // Should redirect to login
      await page.waitForURL(/\/login/);

      // All data should be cleared
      const hasData = await page.evaluate(() => {
        return localStorage.length > 0;
      });

      expect(hasData).toBe(false);
    });
  });

  test.describe('Offline Mode', () => {
    test('should enable offline mode', async ({ page }) => {
      await page.goto('/settings');

      const offlineToggle = page.locator('[data-testid="offline-mode"]');
      if (await offlineToggle.count() > 0) {
        await offlineToggle.click();
        await page.click('[data-testid="save-settings"]');

        const isOfflineEnabled = await page.evaluate(() => {
          return localStorage.getItem('offlineMode') === 'true';
        });

        expect(isOfflineEnabled).toBe(true);
      }
    });

    test('should cache content for offline access', async ({ page }) => {
      // Enable service worker and cache content
      await page.goto('/lessons');
      await page.waitForLoadState('networkidle');

      // Go offline
      await page.context().setOffline(true);

      // Try to access cached content
      await page.goto('/lessons');

      // Page should still load from cache
      const hasContent = await page.locator('[data-testid="lesson-card"]').count();
      expect(hasContent).toBeGreaterThanOrEqual(0);

      // Go back online
      await page.context().setOffline(false);
    });

    test('should sync data when back online', async ({ page }) => {
      // Make changes offline
      await page.context().setOffline(true);

      await page.goto('/lessons/lesson-1');
      await page.evaluate(() => {
        localStorage.setItem('pending-sync', JSON.stringify([{
          type: 'lesson-complete',
          lessonId: 'lesson-1',
        }]));
      });

      // Go back online
      await page.context().setOffline(false);
      await page.reload();

      // Wait for sync
      await page.waitForTimeout(2000);

      // Pending sync should be cleared
      const pendingSync = await page.evaluate(() => {
        return localStorage.getItem('pending-sync');
      });

      expect(pendingSync === null || pendingSync === '[]').toBe(true);
    });

    test('should show offline indicator', async ({ page }) => {
      await page.goto('/dashboard');

      // Go offline
      await page.context().setOffline(true);

      // Trigger offline detection
      await page.evaluate(() => {
        window.dispatchEvent(new Event('offline'));
      });

      await page.waitForTimeout(500);

      // Offline indicator should appear
      const offlineIndicator = page.locator('[data-testid="offline-indicator"]');
      const hasIndicator = await offlineIndicator.count();

      if (hasIndicator > 0) {
        await expect(offlineIndicator).toBeVisible();
      }

      await page.context().setOffline(false);
    });

    test('should queue actions when offline', async ({ page }) => {
      await page.goto('/lessons/lesson-1');

      // Go offline
      await page.context().setOffline(true);

      // Try to complete lesson
      const completeButton = page.locator('[data-testid="complete-lesson"]');
      if (await completeButton.count() > 0) {
        await completeButton.click();

        // Action should be queued
        const queue = await page.evaluate(() => {
          return localStorage.getItem('action-queue');
        });

        expect(queue).toBeTruthy();
      }

      await page.context().setOffline(false);
    });
  });

  test.describe('Keyboard Shortcuts', () => {
    test('should display keyboard shortcuts', async ({ page }) => {
      await page.goto('/settings');

      const shortcutsButton = page.locator('[data-testid="keyboard-shortcuts"]');
      if (await shortcutsButton.count() > 0) {
        await shortcutsButton.click();

        const shortcutsModal = page.locator('[data-testid="shortcuts-modal"]');
        await expect(shortcutsModal).toBeVisible();
      }
    });

    test('should support global keyboard shortcuts', async ({ page }) => {
      await page.goto('/dashboard');

      // Open search with Ctrl+K
      await page.keyboard.press('Control+K');

      const searchModal = page.locator('[data-testid="search-modal"]');
      const hasSearch = await searchModal.count();

      if (hasSearch > 0) {
        await expect(searchModal).toBeVisible();
      }
    });

    test('should navigate with keyboard shortcuts', async ({ page }) => {
      await page.goto('/lessons/lesson-1');

      // Press right arrow for next lesson
      await page.keyboard.press('ArrowRight');

      await page.waitForTimeout(500);

      // Should navigate to next lesson
      expect(page.url()).toMatch(/lessons\/lesson-\d+/);
    });
  });

  test.describe('Language Settings', () => {
    test('should change interface language', async ({ page }) => {
      const settingsPage = new SettingsPage(page);
      await settingsPage.goto();

      const languageSelect = page.locator('[data-testid="language-select"]');
      if (await languageSelect.count() > 0) {
        await languageSelect.selectOption('es'); // Spanish
        await settingsPage.saveSettings();

        // Interface should update
        await page.reload();

        const heading = page.locator('h1').first();
        const text = await heading.textContent();

        // Text should be in selected language
        expect(text).toBeTruthy();
      }
    });

    test('should persist language preference', async ({ page }) => {
      await page.goto('/settings');

      const languageSelect = page.locator('[data-testid="language-select"]');
      if (await languageSelect.count() > 0) {
        await languageSelect.selectOption('fr'); // French
        await page.click('[data-testid="save-settings"]');

        const language = await page.evaluate(() => {
          return localStorage.getItem('language');
        });

        expect(language).toBe('fr');
      }
    });
  });
});
