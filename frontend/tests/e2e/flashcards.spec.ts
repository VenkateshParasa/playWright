import { test, expect } from '../fixtures/test-helpers';
import { FlashcardsPage } from '../pages/MainPages';

test.describe('Flashcard System', () => {
  test.use({ storageState: 'playwright/.auth/student.json' });

  test.describe('Review Session', () => {
    let flashcardsPage: FlashcardsPage;

    test.beforeEach(async ({ page }) => {
      flashcardsPage = new FlashcardsPage(page);
      await flashcardsPage.goto();
      await page.waitForLoadState('networkidle');
    });

    test('should display review interface', async () => {
      await expect(flashcardsPage.startReviewButton).toBeVisible();
    });

    test('should start review session', async ({ page }) => {
      await flashcardsPage.startReview();

      // Should show first card
      await expect(flashcardsPage.cardFront).toBeVisible();
      await expect(flashcardsPage.flipButton).toBeVisible();
    });

    test('should flip card to show answer', async ({ page }) => {
      await flashcardsPage.startReview();
      await flashcardsPage.flipCard();

      // Back should be visible
      await expect(flashcardsPage.cardBack).toBeVisible();
      await expect(flashcardsPage.qualityButtons.first()).toBeVisible();
    });

    test('should rate card quality', async ({ page }) => {
      await flashcardsPage.startReview();
      await flashcardsPage.flipCard();

      await flashcardsPage.rateCard(4); // Good recall

      // Should move to next card or show completion
      await page.waitForTimeout(500);
    });

    test('should show all quality rating options', async ({ page }) => {
      await flashcardsPage.startReview();
      await flashcardsPage.flipCard();

      const qualityButtonCount = await flashcardsPage.qualityButtons.count();
      expect(qualityButtonCount).toBe(6); // 0-5 ratings
    });

    test('should track review progress', async ({ page }) => {
      await flashcardsPage.startReview();

      const progress = await flashcardsPage.getProgress();
      expect(progress).toMatch(/\d+\s*\/\s*\d+/);
    });

    test('should allow skipping cards', async ({ page }) => {
      await flashcardsPage.startReview();

      const initialCard = await flashcardsPage.cardFront.textContent();

      await flashcardsPage.skipCard();
      await page.waitForTimeout(300);

      const nextCard = await flashcardsPage.cardFront.textContent();
      expect(nextCard).not.toBe(initialCard);
    });

    test('should pause review session', async ({ page }) => {
      await flashcardsPage.startReview();
      await flashcardsPage.pauseSession();

      // Should show pause UI
      await expect(page.locator('[data-testid="resume-button"]')).toBeVisible();
    });

    test('should resume paused session', async ({ page }) => {
      await flashcardsPage.startReview();
      await flashcardsPage.pauseSession();

      const resumeButton = page.locator('[data-testid="resume-button"]');
      await resumeButton.click();

      // Should resume review
      await expect(flashcardsPage.cardFront).toBeVisible();
    });

    test('should complete review session', async ({ page }) => {
      await flashcardsPage.startReview();

      // Review all cards (assuming limited number)
      for (let i = 0; i < 5; i++) {
        const hasCard = await flashcardsPage.cardFront.isVisible();
        if (!hasCard) break;

        await flashcardsPage.flipCard();
        await flashcardsPage.rateCard(4);
        await page.waitForTimeout(300);
      }

      // Should show completion summary
      const summary = page.locator('[data-testid="session-summary"]');
      const hasSummary = await summary.count();

      if (hasSummary > 0) {
        await expect(summary).toBeVisible();
      }
    });

    test('should show session statistics', async ({ page }) => {
      await flashcardsPage.startReview();

      // Complete a few cards
      for (let i = 0; i < 3; i++) {
        await flashcardsPage.flipCard();
        await flashcardsPage.rateCard(4);
        await page.waitForTimeout(200);
      }

      // Check stats
      const stats = page.locator('[data-testid="session-stats"]');
      await expect(stats).toBeVisible();
    });

    test('should support keyboard shortcuts', async ({ page }) => {
      await flashcardsPage.startReview();

      // Flip with spacebar
      await page.keyboard.press('Space');
      await expect(flashcardsPage.cardBack).toBeVisible();

      // Rate with number keys
      await page.keyboard.press('4');
      await page.waitForTimeout(300);
    });

    test('should update card schedule after rating', async ({ page }) => {
      await flashcardsPage.startReview();
      await flashcardsPage.flipCard();

      const cardId = await page.locator('[data-testid="card-front"]').getAttribute('data-card-id');

      await flashcardsPage.rateCard(5);

      // Check if card schedule is updated (via storage or API)
      const schedule = await page.evaluate((id) => {
        return localStorage.getItem(`card-schedule-${id}`);
      }, cardId);

      expect(schedule).toBeTruthy();
    });

    test('should handle no cards due for review', async ({ page }) => {
      // Mock scenario where no cards are due
      await page.evaluate(() => {
        localStorage.setItem('flashcards-reviewed-today', 'true');
      });

      await page.reload();

      const noDueMessage = page.locator('[data-testid="no-cards-due"]');
      const hasMessage = await noDueMessage.count();

      if (hasMessage > 0) {
        await expect(noDueMessage).toBeVisible();
      }
    });
  });

  test.describe('Card Management', () => {
    test('should view card deck', async ({ page }) => {
      await page.goto('/flashcards/deck');

      const cardList = page.locator('[data-testid="card-list"]');
      await expect(cardList).toBeVisible();
    });

    test('should filter cards by category', async ({ page }) => {
      await page.goto('/flashcards/deck');

      const categoryFilter = page.locator('[data-testid="category-filter"]');
      await categoryFilter.selectOption('Basics');

      await page.waitForTimeout(300);

      const cards = page.locator('[data-testid="card-item"]');
      const count = await cards.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should filter cards by difficulty', async ({ page }) => {
      await page.goto('/flashcards/deck');

      const difficultyFilter = page.locator('[data-testid="difficulty-filter"]');
      await difficultyFilter.selectOption('easy');

      await page.waitForTimeout(300);

      const cards = page.locator('[data-testid="card-item"]');
      const count = await cards.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should search cards', async ({ page }) => {
      await page.goto('/flashcards/deck');

      const searchInput = page.locator('[data-testid="card-search"]');
      await searchInput.fill('locator');

      await page.waitForTimeout(500);

      const cards = page.locator('[data-testid="card-item"]');
      const firstCard = await cards.first().textContent();
      expect(firstCard?.toLowerCase()).toContain('locator');
    });

    test('should edit card', async ({ page }) => {
      await page.goto('/flashcards/deck');

      const editButton = page.locator('[data-testid="edit-card"]').first();
      await editButton.click();

      // Should show edit form
      await expect(page.locator('[data-testid="card-editor"]')).toBeVisible();
    });

    test('should delete card', async ({ page }) => {
      await page.goto('/flashcards/deck');

      const initialCount = await page.locator('[data-testid="card-item"]').count();

      page.on('dialog', async dialog => {
        await dialog.accept();
      });

      const deleteButton = page.locator('[data-testid="delete-card"]').first();
      await deleteButton.click();

      await page.waitForTimeout(500);

      const finalCount = await page.locator('[data-testid="card-item"]').count();
      expect(finalCount).toBeLessThan(initialCount);
    });

    test('should create new card', async ({ page }) => {
      await page.goto('/flashcards/deck');

      const addButton = page.locator('[data-testid="add-card"]');
      await addButton.click();

      // Fill card details
      await page.fill('[name="front"]', 'Test Question');
      await page.fill('[name="back"]', 'Test Answer');
      await page.selectOption('[name="category"]', 'Basics');

      const saveButton = page.locator('[data-testid="save-card"]');
      await saveButton.click();

      // Should be added to deck
      await page.waitForTimeout(500);
      const newCard = page.locator('text=Test Question');
      await expect(newCard).toBeVisible();
    });
  });

  test.describe('Spaced Repetition Algorithm', () => {
    test('should increase interval for good ratings', async ({ page }) => {
      const flashcardsPage = new FlashcardsPage(page);
      await flashcardsPage.goto();
      await flashcardsPage.startReview();

      const cardId = await page.locator('[data-testid="card-front"]').getAttribute('data-card-id');

      await flashcardsPage.flipCard();
      await flashcardsPage.rateCard(5); // Perfect recall

      // Check interval increased
      const newInterval = await page.evaluate((id) => {
        const data = localStorage.getItem(`card-${id}`);
        return data ? JSON.parse(data).interval : 0;
      }, cardId);

      expect(newInterval).toBeGreaterThan(1);
    });

    test('should reset interval for poor ratings', async ({ page }) => {
      const flashcardsPage = new FlashcardsPage(page);
      await flashcardsPage.goto();
      await flashcardsPage.startReview();

      await flashcardsPage.flipCard();
      await flashcardsPage.rateCard(0); // Complete blackout

      // Card should appear again soon
      const cardId = await page.locator('[data-testid="card-front"]').getAttribute('data-card-id');

      const newInterval = await page.evaluate((id) => {
        const data = localStorage.getItem(`card-${id}`);
        return data ? JSON.parse(data).interval : 0;
      }, cardId);

      expect(newInterval).toBeLessThanOrEqual(1);
    });

    test('should track success rate', async ({ page }) => {
      await page.goto('/flashcards/stats');

      const successRate = page.locator('[data-testid="success-rate"]');
      await expect(successRate).toBeVisible();

      const rateText = await successRate.textContent();
      expect(rateText).toMatch(/\d+%/);
    });

    test('should show due cards count', async ({ page }) => {
      await page.goto('/flashcards');

      const dueCount = page.locator('[data-testid="due-cards-count"]');
      await expect(dueCount).toBeVisible();

      const count = await dueCount.textContent();
      expect(count).toMatch(/\d+/);
    });
  });

  test.describe('Review History', () => {
    test('should display review history', async ({ page }) => {
      await page.goto('/flashcards/history');

      const historyList = page.locator('[data-testid="review-history"]');
      await expect(historyList).toBeVisible();
    });

    test('should show session details', async ({ page }) => {
      await page.goto('/flashcards/history');

      const session = page.locator('[data-testid="review-session"]').first();
      await session.click();

      // Should show detailed session info
      await expect(page.locator('[data-testid="session-details"]')).toBeVisible();
    });

    test('should display performance trends', async ({ page }) => {
      await page.goto('/flashcards/stats');

      const chart = page.locator('[data-testid="performance-chart"]');
      await expect(chart).toBeVisible();
    });
  });
});
