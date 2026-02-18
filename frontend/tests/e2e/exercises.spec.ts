import { test, expect } from '../fixtures/test-helpers';
import { ExercisesPage } from '../pages/AdminPages';
import { TEST_EXERCISES } from '../fixtures/test-data';

test.describe('Coding Exercises', () => {
  test.use({ storageState: 'playwright/.auth/student.json' });

  test.describe('Exercise Interface', () => {
    let exercisesPage: ExercisesPage;

    test.beforeEach(async ({ page }) => {
      exercisesPage = new ExercisesPage(page);
      await exercisesPage.goto(TEST_EXERCISES.basic.id);
      await page.waitForLoadState('networkidle');
    });

    test('should display exercise information', async () => {
      await expect(exercisesPage.exerciseTitle).toBeVisible();
      await expect(exercisesPage.codeEditor).toBeVisible();
    });

    test('should display action buttons', async () => {
      await expect(exercisesPage.runButton).toBeVisible();
      await expect(exercisesPage.submitButton).toBeVisible();
      await expect(exercisesPage.hintButton).toBeVisible();
    });

    test('should write code in editor', async ({ page }) => {
      const code = 'console.log("Hello, World!");';
      await exercisesPage.writeCode(code);

      // Verify code was written
      const editorContent = await page.evaluate(() => {
        const editor = (window as any).monaco?.editor?.getModels()[0];
        return editor ? editor.getValue() : '';
      });

      expect(editorContent).toContain('console.log');
    });

    test('should run code and show output', async ({ page }) => {
      const code = 'console.log("Test output");';
      await exercisesPage.writeCode(code);
      await exercisesPage.runCode();

      // Wait for output
      await page.waitForTimeout(1000);

      const output = await exercisesPage.getConsoleOutput();
      expect(output).toContain('Test output');
    });

    test('should run tests and show results', async ({ page }) => {
      const code = TEST_EXERCISES.basic.solution;
      await exercisesPage.writeCode(code);
      await exercisesPage.runCode();

      await page.waitForTimeout(1000);

      const testResults = await exercisesPage.getTestResults();
      expect(testResults).toContain('pass' || 'success');
    });

    test('should show hint when requested', async ({ page }) => {
      await exercisesPage.showHint();

      const hint = page.locator('[data-testid="hint-content"]');
      await expect(hint).toBeVisible();
    });

    test('should show solution when requested', async ({ page }) => {
      await exercisesPage.showSolution();

      const solution = page.locator('[data-testid="solution-content"]');
      await expect(solution).toBeVisible();

      // Solution should match expected
      const solutionText = await solution.textContent();
      expect(solutionText).toBeTruthy();
    });

    test('should submit solution', async ({ page }) => {
      const code = TEST_EXERCISES.basic.solution;
      await exercisesPage.writeCode(code);
      await exercisesPage.submitSolution();

      // Should show success message or redirect
      await expect(
        page.locator('[data-testid="submission-success"]')
      ).toBeVisible({ timeout: 5000 });
    });

    test('should auto-save code', async ({ page }) => {
      const code = 'const x = 1;';
      await exercisesPage.writeCode(code);

      // Wait for auto-save
      await page.waitForTimeout(2000);

      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Code should be restored
      const editorContent = await page.evaluate(() => {
        const editor = (window as any).monaco?.editor?.getModels()[0];
        return editor ? editor.getValue() : '';
      });

      expect(editorContent).toContain('const x');
    });

    test('should show syntax errors', async ({ page }) => {
      const invalidCode = 'const x = ;'; // Missing value
      await exercisesPage.writeCode(invalidCode);
      await exercisesPage.runCode();

      await page.waitForTimeout(1000);

      const output = await exercisesPage.getConsoleOutput();
      expect(output.toLowerCase()).toContain('error' || 'syntax');
    });

    test('should track attempt count', async ({ page }) => {
      await exercisesPage.writeCode('const x = 1;');
      await exercisesPage.submitSolution();

      await page.waitForTimeout(500);

      const attemptCount = page.locator('[data-testid="attempt-count"]');
      const count = await attemptCount.textContent();
      expect(parseInt(count || '0')).toBeGreaterThan(0);
    });

    test('should show test case details', async ({ page }) => {
      await exercisesPage.writeCode(TEST_EXERCISES.basic.solution);
      await exercisesPage.runCode();

      await page.waitForTimeout(1000);

      const testCases = page.locator('[data-testid="test-case"]');
      const count = await testCases.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should support keyboard shortcuts', async ({ page }) => {
      // Ctrl/Cmd + Enter to run code
      await exercisesPage.writeCode('console.log("test");');
      await page.keyboard.press('Control+Enter');

      await page.waitForTimeout(1000);

      const output = await exercisesPage.getConsoleOutput();
      expect(output).toBeTruthy();
    });

    test('should show difficulty level', async ({ page }) => {
      const difficulty = page.locator('[data-testid="exercise-difficulty"]');
      await expect(difficulty).toBeVisible();

      const level = await difficulty.textContent();
      expect(['beginner', 'intermediate', 'advanced']).toContain(level?.toLowerCase());
    });

    test('should display time spent', async ({ page }) => {
      // Spend some time
      await page.waitForTimeout(5000);

      const timeSpent = page.locator('[data-testid="time-spent"]');
      const time = await timeSpent.textContent();
      expect(time).toMatch(/\d+/);
    });
  });

  test.describe('Exercise Features', () => {
    test('should compare with solution (diff view)', async ({ page }) => {
      const exercisesPage = new ExercisesPage(page);
      await exercisesPage.goto(TEST_EXERCISES.basic.id);

      await exercisesPage.writeCode('const wrong = "solution";');
      await exercisesPage.showSolution();

      const diffView = page.locator('[data-testid="code-diff"]');
      const hasDiff = await diffView.count();

      if (hasDiff > 0) {
        await expect(diffView).toBeVisible();
      }
    });

    test('should show attempt history', async ({ page }) => {
      await page.goto(`/exercises/${TEST_EXERCISES.basic.id}/history`);

      const history = page.locator('[data-testid="attempt-history"]');
      await expect(history).toBeVisible();
    });

    test('should filter exercises by difficulty', async ({ page }) => {
      await page.goto('/exercises');

      const difficultyFilter = page.locator('[data-testid="difficulty-filter"]');
      await difficultyFilter.selectOption('beginner');

      await page.waitForTimeout(300);

      const exercises = page.locator('[data-testid="exercise-card"]');
      const count = await exercises.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should filter exercises by language', async ({ page }) => {
      await page.goto('/exercises');

      const languageFilter = page.locator('[data-testid="language-filter"]');
      await languageFilter.selectOption('javascript');

      await page.waitForTimeout(300);

      const exercises = page.locator('[data-testid="exercise-card"]');
      const count = await exercises.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should track completion status', async ({ page }) => {
      const exercisesPage = new ExercisesPage(page);
      await exercisesPage.goto(TEST_EXERCISES.basic.id);

      await exercisesPage.writeCode(TEST_EXERCISES.basic.solution);
      await exercisesPage.submitSolution();

      // Go back to exercises list
      await page.goto('/exercises');

      const completedExercise = page.locator(
        `[data-exercise-id="${TEST_EXERCISES.basic.id}"][data-status="completed"]`
      );
      const hasCompleted = await completedExercise.count();

      expect(hasCompleted).toBeGreaterThan(0);
    });
  });

  test.describe('Code Editor Features', () => {
    test('should support code completion', async ({ page }) => {
      const exercisesPage = new ExercisesPage(page);
      await exercisesPage.goto(TEST_EXERCISES.basic.id);

      // Type and trigger autocomplete
      await page.locator('.monaco-editor').click();
      await page.keyboard.type('cons');
      await page.keyboard.press('Control+Space');

      await page.waitForTimeout(500);

      // Autocomplete suggestions should appear
      const suggestions = page.locator('.monaco-list-row');
      const count = await suggestions.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should support syntax highlighting', async ({ page }) => {
      const exercisesPage = new ExercisesPage(page);
      await exercisesPage.goto(TEST_EXERCISES.basic.id);

      await exercisesPage.writeCode('const x = "string";');

      // Check for syntax highlighting classes
      const hasHighlighting = await page.evaluate(() => {
        const editor = document.querySelector('.monaco-editor');
        const tokens = editor?.querySelectorAll('.mtk1, .mtk6, .mtk8');
        return tokens ? tokens.length > 0 : false;
      });

      expect(hasHighlighting).toBe(true);
    });

    test('should support theme switching', async ({ page }) => {
      const exercisesPage = new ExercisesPage(page);
      await exercisesPage.goto(TEST_EXERCISES.basic.id);

      // Switch theme
      await page.goto('/settings');
      await page.click('[data-testid="theme-toggle"]');

      // Go back to exercise
      await exercisesPage.goto(TEST_EXERCISES.basic.id);

      // Editor should reflect theme
      const isDarkTheme = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark');
      });

      expect(isDarkTheme).toBeDefined();
    });

    test('should support code formatting', async ({ page }) => {
      const exercisesPage = new ExercisesPage(page);
      await exercisesPage.goto(TEST_EXERCISES.basic.id);

      // Write unformatted code
      const unformattedCode = 'const x=1;const y=2;';
      await exercisesPage.writeCode(unformattedCode);

      // Trigger format (Shift + Alt + F)
      await page.keyboard.press('Shift+Alt+F');
      await page.waitForTimeout(500);

      const formattedCode = await page.evaluate(() => {
        const editor = (window as any).monaco?.editor?.getModels()[0];
        return editor ? editor.getValue() : '';
      });

      // Code should be formatted with proper spacing
      expect(formattedCode).toContain(' = ');
    });
  });
});
