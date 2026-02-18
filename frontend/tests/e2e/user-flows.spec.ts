import { test, expect } from './fixtures';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h1')).toContainText('Login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should show validation errors', async ({ page }) => {
    await page.goto('/login');

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Check for validation errors
    await expect(page.locator('.error')).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill in credentials
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill in invalid credentials
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');

    // Submit form
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('.error-message')).toBeVisible();
  });

  test('should logout successfully', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard');

    // Click logout button
    await authenticatedPage.click('button[aria-label="Logout"]');

    // Should redirect to home
    await expect(authenticatedPage).toHaveURL('/');
  });
});

test.describe('Lesson Navigation @smoke', () => {
  test('should navigate through lessons', async ({ page }) => {
    await page.goto('/lessons');

    // Check lessons are loaded
    await expect(page.locator('.lesson-card').first()).toBeVisible();

    // Click on first lesson
    await page.click('.lesson-card:first-child');

    // Should navigate to lesson detail
    await expect(page).toHaveURL(/.*lessons\/\d+/);
  });

  test('should complete a lesson', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/lessons/1');

    // Scroll to bottom
    await authenticatedPage.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Click complete button
    await authenticatedPage.click('button:has-text("Mark as Complete")');

    // Should show success message
    await expect(authenticatedPage.locator('.success-message')).toBeVisible();
  });
});

test.describe('Flashcard Review @smoke', () => {
  test('should start flashcard review', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/flashcards');

    // Start review
    await authenticatedPage.click('button:has-text("Start Review")');

    // Should show flashcard
    await expect(authenticatedPage.locator('.flashcard')).toBeVisible();
  });

  test('should flip flashcard', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/flashcards/review');

    // Click to flip
    await authenticatedPage.click('.flashcard');

    // Should show back of card
    await expect(authenticatedPage.locator('.flashcard-back')).toBeVisible();
  });

  test('should rate flashcard', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/flashcards/review');

    // Flip card
    await authenticatedPage.click('.flashcard');

    // Rate card
    await authenticatedPage.click('button[data-rating="4"]');

    // Should move to next card or show completion
    await expect(
      authenticatedPage.locator('.flashcard, .review-complete')
    ).toBeVisible();
  });
});

test.describe('Quiz Flow', () => {
  test('should take a quiz', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/quizzes');

    // Start quiz
    await authenticatedPage.click('.quiz-card:first-child button:has-text("Start Quiz")');

    // Answer questions
    await authenticatedPage.click('input[type="radio"]:first-child');
    await authenticatedPage.click('button:has-text("Next")');

    // Should navigate to next question
    await expect(authenticatedPage.locator('.question-number')).toContainText('2');
  });

  test('should submit quiz and see results', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/quizzes/1');

    // Answer all questions (simplified)
    for (let i = 0; i < 5; i++) {
      await authenticatedPage.click('input[type="radio"]:first-child');
      await authenticatedPage.click('button:has-text("Next")');
    }

    // Submit quiz
    await authenticatedPage.click('button:has-text("Submit")');

    // Should show results
    await expect(authenticatedPage.locator('.quiz-results')).toBeVisible();
    await expect(authenticatedPage.locator('.score')).toBeVisible();
  });
});

test.describe('Progress Tracking', () => {
  test('should display progress on dashboard', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard');

    // Check progress elements
    await expect(authenticatedPage.locator('.progress-bar')).toBeVisible();
    await expect(authenticatedPage.locator('.lessons-completed')).toBeVisible();
    await expect(authenticatedPage.locator('.streak-counter')).toBeVisible();
  });

  test('should update progress after completing lesson', async ({ authenticatedPage }) => {
    // Get initial progress
    await authenticatedPage.goto('/dashboard');
    const initialProgress = await authenticatedPage
      .locator('.progress-percentage')
      .textContent();

    // Complete a lesson
    await authenticatedPage.goto('/lessons/1');
    await authenticatedPage.click('button:has-text("Mark as Complete")');

    // Check updated progress
    await authenticatedPage.goto('/dashboard');
    const updatedProgress = await authenticatedPage
      .locator('.progress-percentage')
      .textContent();

    expect(updatedProgress).not.toBe(initialProgress);
  });
});
