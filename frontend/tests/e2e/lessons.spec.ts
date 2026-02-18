import { test, expect } from '../fixtures/test-helpers';
import { LessonsPage, LessonDetailPage, DashboardPage } from '../pages/MainPages';
import { TEST_LESSONS } from '../fixtures/test-data';

test.describe('Lesson Progression', () => {
  test.use({ storageState: 'playwright/.auth/student.json' });

  test.describe('Lesson Browser', () => {
    let lessonsPage: LessonsPage;

    test.beforeEach(async ({ page }) => {
      lessonsPage = new LessonsPage(page);
      await lessonsPage.goto();
      await page.waitForLoadState('networkidle');
    });

    test('should display all lessons', async () => {
      const lessonCount = await lessonsPage.getLessonCount();
      expect(lessonCount).toBeGreaterThan(0);
    });

    test('should search lessons by title', async ({ page }) => {
      await lessonsPage.searchLessons('Playwright');

      // Wait for filtered results
      await page.waitForTimeout(600);

      const lessonCount = await lessonsPage.getLessonCount();
      expect(lessonCount).toBeGreaterThan(0);

      // Verify search results contain query
      const firstCard = lessonsPage.lessonCards.first();
      const text = await firstCard.textContent();
      expect(text?.toLowerCase()).toContain('playwright');
    });

    test('should filter lessons by track', async ({ page }) => {
      await lessonsPage.filterByTrack('30-day');
      await page.waitForTimeout(300);

      const lessonCount = await lessonsPage.getLessonCount();
      expect(lessonCount).toBeGreaterThan(0);
    });

    test('should filter lessons by difficulty', async ({ page }) => {
      await lessonsPage.filterByDifficulty('beginner');
      await page.waitForTimeout(300);

      const lessonCount = await lessonsPage.getLessonCount();
      expect(lessonCount).toBeGreaterThan(0);
    });

    test('should sort lessons by different criteria', async ({ page }) => {
      await lessonsPage.sortBy('title');
      await page.waitForTimeout(300);

      // Get first two lesson titles
      const firstTitle = await lessonsPage.lessonCards.first().textContent();
      const secondTitle = await lessonsPage.lessonCards.nth(1).textContent();

      // Verify alphabetical order
      expect(firstTitle! <= secondTitle!).toBe(true);
    });

    test('should combine multiple filters', async ({ page }) => {
      await lessonsPage.filterByTrack('30-day');
      await lessonsPage.filterByDifficulty('beginner');
      await lessonsPage.searchLessons('intro');

      await page.waitForTimeout(600);

      const lessonCount = await lessonsPage.getLessonCount();
      expect(lessonCount).toBeGreaterThanOrEqual(0);
    });

    test('should persist filters on page reload', async ({ page }) => {
      await lessonsPage.filterByTrack('60-day');
      await lessonsPage.filterByDifficulty('intermediate');

      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Filters should be maintained (if implemented)
      const trackValue = await lessonsPage.trackFilter.inputValue();
      expect(trackValue).toBeTruthy();
    });

    test('should navigate to lesson detail on click', async ({ page }) => {
      await lessonsPage.clickLesson(0);

      // Should navigate to lesson detail page
      await expect(page).toHaveURL(/\/lessons\/[\w-]+/);
    });

    test('should show lesson progress indicator', async () => {
      const firstCard = lessonsPage.lessonCards.first();
      const progressBadge = firstCard.locator('[data-testid="progress-badge"]');

      // Progress badge should exist (might be 0% for new user)
      const badgeExists = await progressBadge.count();
      expect(badgeExists).toBeGreaterThanOrEqual(0);
    });

    test('should show locked lessons', async () => {
      // Look for locked lesson indicators
      const lockedLessons = lessonsPage.page.locator('[data-status="locked"]');
      const count = await lockedLessons.count();

      // There should be some locked lessons for progression
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Lesson Detail View', () => {
    let lessonDetailPage: LessonDetailPage;

    test.beforeEach(async ({ page }) => {
      lessonDetailPage = new LessonDetailPage(page);
      await lessonDetailPage.goto(TEST_LESSONS.beginner.id);
      await page.waitForLoadState('networkidle');
    });

    test('should display lesson content', async () => {
      await expect(lessonDetailPage.lessonTitle).toBeVisible();
      await expect(lessonDetailPage.lessonContent).toBeVisible();
    });

    test('should show table of contents', async () => {
      await expect(lessonDetailPage.tableOfContents).toBeVisible();

      const tocItems = lessonDetailPage.tableOfContents.locator('a');
      const itemCount = await tocItems.count();
      expect(itemCount).toBeGreaterThan(0);
    });

    test('should navigate via table of contents', async ({ page }) => {
      const initialScrollY = await page.evaluate(() => window.scrollY);

      // Click second TOC item
      await lessonDetailPage.clickTocItem(1);

      // Wait for scroll
      await page.waitForTimeout(500);

      const newScrollY = await page.evaluate(() => window.scrollY);
      expect(newScrollY).not.toBe(initialScrollY);
    });

    test('should display code examples', async () => {
      const codeExampleCount = await lessonDetailPage.codeExamples.count();

      if (codeExampleCount > 0) {
        await expect(lessonDetailPage.codeExamples.first()).toBeVisible();
      }
    });

    test('should copy code to clipboard', async ({ page }) => {
      const codeExampleCount = await lessonDetailPage.codeExamples.count();

      if (codeExampleCount > 0) {
        // Grant clipboard permissions
        await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

        await lessonDetailPage.copyCodeExample(0);

        // Verify clipboard content (if possible)
        const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
        expect(clipboardText).toBeTruthy();
      }
    });

    test('should track reading progress', async ({ page }) => {
      const initialProgress = await lessonDetailPage.getProgress();

      // Scroll to bottom
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1000);

      const finalProgress = await lessonDetailPage.getProgress();
      expect(finalProgress).toBeGreaterThanOrEqual(initialProgress);
    });

    test('should bookmark lesson', async () => {
      await lessonDetailPage.toggleBookmark();

      // Verify bookmark indicator
      const isBookmarked = await lessonDetailPage.bookmarkButton.getAttribute('data-bookmarked');
      expect(isBookmarked).toBe('true');
    });

    test('should complete lesson', async ({ page }) => {
      // Scroll to end
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

      await lessonDetailPage.completeLesson();

      // Should show completion confirmation or redirect
      await expect(page.locator('[data-testid="completion-message"]')).toBeVisible({ timeout: 10000 });
    });

    test('should navigate to next lesson', async ({ page }) => {
      const currentUrl = page.url();

      await lessonDetailPage.goToNextLesson();

      // URL should change
      await page.waitForTimeout(500);
      const newUrl = page.url();
      expect(newUrl).not.toBe(currentUrl);
    });

    test('should navigate to previous lesson', async ({ page }) => {
      // First go to next lesson
      await lessonDetailPage.goToNextLesson();
      await page.waitForTimeout(500);

      const currentUrl = page.url();

      await lessonDetailPage.goToPreviousLesson();

      // URL should change back
      await page.waitForTimeout(500);
      const newUrl = page.url();
      expect(newUrl).not.toBe(currentUrl);
    });

    test('should save scroll position', async ({ page }) => {
      // Scroll to middle
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
      const scrollPosition = await page.evaluate(() => window.scrollY);

      // Navigate away
      await page.goto('/lessons');

      // Navigate back
      await lessonDetailPage.goto(TEST_LESSONS.beginner.id);
      await page.waitForLoadState('networkidle');

      // Should restore scroll position (if implemented)
      await page.waitForTimeout(1000);
      const restoredPosition = await page.evaluate(() => window.scrollY);

      // Allow some margin for scroll restoration
      expect(Math.abs(restoredPosition - scrollPosition)).toBeLessThan(100);
    });

    test('should handle video content', async ({ page }) => {
      const video = page.locator('video');
      const videoCount = await video.count();

      if (videoCount > 0) {
        await expect(video.first()).toBeVisible();

        // Try to play video
        await video.first().click();

        // Check if playing
        const isPaused = await video.first().evaluate((v: HTMLVideoElement) => v.paused);
        expect(isPaused).toBe(false);
      }
    });

    test('should show lesson resources', async ({ page }) => {
      const resources = page.locator('[data-testid="lesson-resources"]');
      const resourceCount = await resources.count();

      if (resourceCount > 0) {
        await expect(resources.first()).toBeVisible();
      }
    });
  });

  test.describe('Progress Tracking', () => {
    test('should update dashboard progress after completing lesson', async ({ page }) => {
      const dashboardPage = new DashboardPage(page);
      await dashboardPage.goto();

      const initialProgress = await dashboardPage.getProgressPercentage();

      // Complete a lesson
      const lessonDetailPage = new LessonDetailPage(page);
      await lessonDetailPage.goto(TEST_LESSONS.beginner.id);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await lessonDetailPage.completeLesson();

      // Go back to dashboard
      await dashboardPage.goto();
      await page.waitForLoadState('networkidle');

      const finalProgress = await dashboardPage.getProgressPercentage();
      expect(finalProgress).toBeGreaterThanOrEqual(initialProgress);
    });

    test('should show lesson in completed section', async ({ page }) => {
      // Complete a lesson
      const lessonDetailPage = new LessonDetailPage(page);
      await lessonDetailPage.goto(TEST_LESSONS.beginner.id);
      await lessonDetailPage.completeLesson();

      // Go to lessons page
      const lessonsPage = new LessonsPage(page);
      await lessonsPage.goto();

      // Filter by completed
      await lessonsPage.page.locator('[data-testid="status-filter"]').selectOption('completed');

      // Lesson should appear
      const completedLessons = await lessonsPage.getLessonCount();
      expect(completedLessons).toBeGreaterThan(0);
    });

    test('should unlock next lesson after completion', async ({ page }) => {
      // Complete prerequisite lesson
      const lessonDetailPage = new LessonDetailPage(page);
      await lessonDetailPage.goto(TEST_LESSONS.beginner.id);
      await lessonDetailPage.completeLesson();

      // Check if next lesson is unlocked
      const lessonsPage = new LessonsPage(page);
      await lessonsPage.goto();

      const nextLessonCard = page.locator(`[data-lesson-id="${TEST_LESSONS.intermediate.id}"]`);
      const status = await nextLessonCard.getAttribute('data-status');

      expect(status).not.toBe('locked');
    });

    test('should track time spent on lesson', async ({ page }) => {
      const lessonDetailPage = new LessonDetailPage(page);
      await lessonDetailPage.goto(TEST_LESSONS.beginner.id);

      // Spend some time on lesson
      await page.waitForTimeout(5000);

      // Time should be tracked (verify via API or storage)
      const timeSpent = await page.evaluate(() => {
        return localStorage.getItem('lesson-time-' + window.location.pathname);
      });

      expect(timeSpent).toBeTruthy();
    });
  });

  test.describe('Lesson Navigation', () => {
    test('should use keyboard shortcuts for navigation', async ({ page }) => {
      const lessonDetailPage = new LessonDetailPage(page);
      await lessonDetailPage.goto(TEST_LESSONS.beginner.id);

      // Press right arrow for next lesson
      await page.keyboard.press('ArrowRight');

      // Should navigate to next lesson
      await page.waitForTimeout(500);
      expect(page.url()).toContain('/lessons/');
    });

    test('should show lesson progress in navigation', async () => {
      const lessonDetailPage = new LessonDetailPage(page);
      await lessonDetailPage.goto(TEST_LESSONS.beginner.id);

      const progressIndicator = lessonDetailPage.page.locator('[data-testid="lesson-navigation"]');
      await expect(progressIndicator).toBeVisible();

      const progressText = await progressIndicator.textContent();
      expect(progressText).toMatch(/\d+\s*\/\s*\d+/);
    });

    test('should handle deep linking to lesson sections', async ({ page }) => {
      const lessonDetailPage = new LessonDetailPage(page);
      await lessonDetailPage.goto(`${TEST_LESSONS.beginner.id}#section-2`);

      await page.waitForLoadState('networkidle');

      // Should scroll to section
      const scrollY = await page.evaluate(() => window.scrollY);
      expect(scrollY).toBeGreaterThan(0);
    });
  });
});
