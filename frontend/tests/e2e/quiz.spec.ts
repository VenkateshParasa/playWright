import { test, expect } from '../fixtures/test-helpers';
import { QuizPage, QuizResultsPage } from '../pages/MainPages';
import { TEST_QUIZZES, getQuizAnswers } from '../fixtures/test-data';

test.describe('Quiz System', () => {
  test.use({ storageState: 'playwright/.auth/student.json' });

  test.describe('Quiz Taking', () => {
    let quizPage: QuizPage;

    test.beforeEach(async ({ page }) => {
      quizPage = new QuizPage(page);
      await quizPage.goto(TEST_QUIZZES.basic.id);
      await page.waitForLoadState('networkidle');
    });

    test('should display quiz information', async () => {
      await expect(quizPage.quizTitle).toBeVisible();
      await expect(quizPage.questionText).toBeVisible();
      await expect(quizPage.timerDisplay).toBeVisible();
    });

    test('should display all answer options', async () => {
      const optionCount = await quizPage.answerOptions.count();
      expect(optionCount).toBeGreaterThan(0);
    });

    test('should select single answer for multiple choice', async ({ page }) => {
      await quizPage.selectAnswer(0);

      // Verify selection
      const selectedOption = quizPage.answerOptions.nth(0);
      const isChecked = await selectedOption.locator('input').isChecked();
      expect(isChecked).toBe(true);
    });

    test('should select multiple answers when allowed', async ({ page }) => {
      // Assuming quiz allows multiple answers
      const multiChoiceIndicator = page.locator('[data-allow-multiple="true"]');
      const hasMultiChoice = await multiChoiceIndicator.count();

      if (hasMultiChoice > 0) {
        await quizPage.selectMultipleAnswers([0, 1]);

        const firstChecked = await quizPage.answerOptions.nth(0).locator('input').isChecked();
        const secondChecked = await quizPage.answerOptions.nth(1).locator('input').isChecked();

        expect(firstChecked).toBe(true);
        expect(secondChecked).toBe(true);
      }
    });

    test('should navigate between questions', async ({ page }) => {
      const firstQuestion = await quizPage.questionText.textContent();

      await quizPage.selectAnswer(0);
      await quizPage.nextQuestion();

      await page.waitForTimeout(300);

      const secondQuestion = await quizPage.questionText.textContent();
      expect(secondQuestion).not.toBe(firstQuestion);

      await quizPage.previousQuestion();
      await page.waitForTimeout(300);

      const backToFirst = await quizPage.questionText.textContent();
      expect(backToFirst).toBe(firstQuestion);
    });

    test('should show question progress', async () => {
      const currentQuestion = await quizPage.getCurrentQuestionNumber();
      expect(currentQuestion).toBeGreaterThan(0);

      const progressText = await quizPage.progressIndicator.textContent();
      expect(progressText).toMatch(/\d+\s*\/\s*\d+/);
    });

    test('should mark question for review', async ({ page }) => {
      await quizPage.markForReview();

      // Verify marked status
      const isMarked = await quizPage.markForReviewButton.getAttribute('data-marked');
      expect(isMarked).toBe('true');
    });

    test('should show timer countdown', async ({ page }) => {
      const initialTime = await quizPage.getRemainingTime();

      await page.waitForTimeout(2000);

      const laterTime = await quizPage.getRemainingTime();
      expect(laterTime).not.toBe(initialTime);
    });

    test('should auto-save progress', async ({ page }) => {
      await quizPage.selectAnswer(0);
      await quizPage.nextQuestion();

      // Progress should be saved to localStorage or API
      const savedProgress = await page.evaluate(() => {
        return localStorage.getItem('quiz-progress');
      });

      expect(savedProgress).toBeTruthy();
    });

    test('should restore progress after page reload', async ({ page }) => {
      await quizPage.selectAnswer(0);
      await quizPage.nextQuestion();

      const questionBefore = await quizPage.getCurrentQuestionNumber();

      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');

      const questionAfter = await quizPage.getCurrentQuestionNumber();
      expect(questionAfter).toBe(questionBefore);
    });

    test('should submit quiz after answering all questions', async ({ page }) => {
      // Answer all questions quickly
      for (let i = 0; i < TEST_QUIZZES.basic.questions.length; i++) {
        await quizPage.selectAnswer(0);

        if (i < TEST_QUIZZES.basic.questions.length - 1) {
          await quizPage.nextQuestion();
          await page.waitForTimeout(200);
        }
      }

      await quizPage.submitQuiz();

      // Should navigate to results page
      await expect(page).toHaveURL(/\/quiz\/.*\/results/);
    });

    test('should warn before submitting incomplete quiz', async ({ page }) => {
      page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('unanswered');
        await dialog.accept();
      });

      await quizPage.submitQuiz();
    });

    test('should handle timeout', async ({ page }) => {
      // Mock timer expiry
      await page.evaluate(() => {
        const event = new CustomEvent('quiz-timeout');
        window.dispatchEvent(event);
      });

      // Should auto-submit or show warning
      await page.waitForTimeout(1000);

      const url = page.url();
      expect(url).toMatch(/results|timeout/);
    });

    test('should prevent navigation away without confirmation', async ({ page }) => {
      await quizPage.selectAnswer(0);

      page.on('dialog', async dialog => {
        expect(dialog.type()).toBe('beforeunload');
        await dialog.accept();
      });

      // Try to navigate away
      await page.goto('/dashboard');
    });

    test('should handle true/false questions', async ({ page }) => {
      // Look for true/false question
      const trueFalseIndicator = page.locator('[data-question-type="true-false"]');
      const hasTrueFalse = await trueFalseIndicator.count();

      if (hasTrueFalse > 0) {
        const trueOption = page.locator('[data-answer="true"]');
        await trueOption.click();

        const isSelected = await trueOption.locator('input').isChecked();
        expect(isSelected).toBe(true);
      }
    });

    test('should handle code snippet questions', async ({ page }) => {
      const codeSnippet = page.locator('[data-question-type="code-snippet"]');
      const hasCodeSnippet = await codeSnippet.count();

      if (hasCodeSnippet > 0) {
        await expect(page.locator('pre code')).toBeVisible();
      }
    });

    test('should support keyboard navigation', async ({ page }) => {
      // Select answer with number key
      await page.keyboard.press('1');

      // Navigate with arrow keys
      await page.keyboard.press('ArrowRight');

      const currentQuestion = await quizPage.getCurrentQuestionNumber();
      expect(currentQuestion).toBeGreaterThan(1);
    });
  });

  test.describe('Quiz Results', () => {
    test.beforeEach(async ({ page }) => {
      const quizPage = new QuizPage(page);
      await quizPage.goto(TEST_QUIZZES.basic.id);
      await page.waitForLoadState('networkidle');

      // Complete quiz quickly
      for (let i = 0; i < TEST_QUIZZES.basic.questions.length; i++) {
        await quizPage.selectAnswer(0);
        if (i < TEST_QUIZZES.basic.questions.length - 1) {
          await quizPage.nextQuestion();
          await page.waitForTimeout(100);
        }
      }

      await quizPage.submitQuiz();
      await page.waitForURL(/\/results/);
    });

    test('should display quiz score', async ({ page }) => {
      const resultsPage = new QuizResultsPage(page);

      await expect(resultsPage.scoreDisplay).toBeVisible();
      await expect(resultsPage.percentageDisplay).toBeVisible();

      const score = await resultsPage.getScore();
      expect(score).toBeGreaterThanOrEqual(0);

      const percentage = await resultsPage.getPercentage();
      expect(percentage).toBeGreaterThanOrEqual(0);
      expect(percentage).toBeLessThanOrEqual(100);
    });

    test('should show pass/fail status', async ({ page }) => {
      const resultsPage = new QuizResultsPage(page);
      const percentage = await resultsPage.getPercentage();

      if (percentage >= TEST_QUIZZES.basic.passingScore) {
        await expect(resultsPage.passedBadge).toBeVisible();
      }
    });

    test('should display question results', async ({ page }) => {
      const resultsPage = new QuizResultsPage(page);

      const questionResultCount = await resultsPage.questionResults.count();
      expect(questionResultCount).toBe(TEST_QUIZZES.basic.questions.length);
    });

    test('should show explanations for answers', async ({ page }) => {
      const explanations = page.locator('[data-testid="explanation"]');
      const explanationCount = await explanations.count();

      expect(explanationCount).toBeGreaterThan(0);
    });

    test('should allow quiz retry', async ({ page }) => {
      const resultsPage = new QuizResultsPage(page);
      await resultsPage.retryQuiz();

      // Should navigate back to quiz
      await expect(page).toHaveURL(/\/quiz\/[^/]+$/);
    });

    test('should allow answer review', async ({ page }) => {
      const resultsPage = new QuizResultsPage(page);
      await resultsPage.reviewAnswers();

      // Should show detailed review
      await expect(page.locator('[data-testid="review-mode"]')).toBeVisible();
    });

    test('should save results to history', async ({ page }) => {
      // Navigate to quiz history
      await page.goto('/quiz/history');

      // Latest quiz should appear
      const historyItems = page.locator('[data-testid="quiz-history-item"]');
      const count = await historyItems.count();

      expect(count).toBeGreaterThan(0);
    });

    test('should update user statistics', async ({ page }) => {
      await page.goto('/profile');

      // Check if quiz completion is reflected
      const quizStats = page.locator('[data-stat="quizzes-completed"]');
      const count = await quizStats.textContent();

      expect(parseInt(count || '0')).toBeGreaterThan(0);
    });

    test('should unlock achievements', async ({ page }) => {
      // Check for achievement notification
      const achievementNotification = page.locator('[data-testid="achievement-unlocked"]');
      const hasAchievement = await achievementNotification.count();

      if (hasAchievement > 0) {
        await expect(achievementNotification).toBeVisible();
      }
    });
  });

  test.describe('Quiz Retake', () => {
    test('should allow multiple attempts', async ({ page }) => {
      const quizPage = new QuizPage(page);

      for (let attempt = 0; attempt < 2; attempt++) {
        await quizPage.goto(TEST_QUIZZES.basic.id);

        // Complete quiz
        for (let i = 0; i < TEST_QUIZZES.basic.questions.length; i++) {
          await quizPage.selectAnswer(0);
          if (i < TEST_QUIZZES.basic.questions.length - 1) {
            await quizPage.nextQuestion();
            await page.waitForTimeout(100);
          }
        }

        await quizPage.submitQuiz();
        await page.waitForURL(/\/results/);

        if (attempt < 1) {
          const resultsPage = new QuizResultsPage(page);
          await resultsPage.retryQuiz();
        }
      }
    });

    test('should track best score across attempts', async ({ page }) => {
      // Take quiz twice
      for (let i = 0; i < 2; i++) {
        const quizPage = new QuizPage(page);
        await quizPage.goto(TEST_QUIZZES.basic.id);

        // Complete quiz
        for (let j = 0; j < TEST_QUIZZES.basic.questions.length; j++) {
          await quizPage.selectAnswer(i === 0 ? 0 : 1); // Different answers
          if (j < TEST_QUIZZES.basic.questions.length - 1) {
            await quizPage.nextQuestion();
            await page.waitForTimeout(100);
          }
        }

        await quizPage.submitQuiz();
        await page.waitForURL(/\/results/);

        if (i < 1) {
          const resultsPage = new QuizResultsPage(page);
          await resultsPage.retryQuiz();
        }
      }

      // Check history for best score
      await page.goto('/quiz/history');
      const bestScore = page.locator('[data-testid="best-score"]');
      await expect(bestScore).toBeVisible();
    });

    test('should respect max attempts limit', async ({ page }) => {
      if (TEST_QUIZZES.basic.maxAttempts) {
        const maxAttempts = TEST_QUIZZES.basic.maxAttempts;

        for (let attempt = 0; attempt < maxAttempts + 1; attempt++) {
          const quizPage = new QuizPage(page);
          await quizPage.goto(TEST_QUIZZES.basic.id);

          if (attempt < maxAttempts) {
            // Should allow quiz
            await expect(quizPage.questionText).toBeVisible();

            // Complete quickly
            for (let i = 0; i < TEST_QUIZZES.basic.questions.length; i++) {
              await quizPage.selectAnswer(0);
              if (i < TEST_QUIZZES.basic.questions.length - 1) {
                await quizPage.nextQuestion();
                await page.waitForTimeout(50);
              }
            }

            await quizPage.submitQuiz();
            await page.waitForURL(/\/results/);

            const resultsPage = new QuizResultsPage(page);
            await resultsPage.retryQuiz();
          } else {
            // Should show max attempts reached
            const errorMessage = page.locator('[data-testid="max-attempts-error"]');
            await expect(errorMessage).toBeVisible();
          }
        }
      }
    });
  });
});
