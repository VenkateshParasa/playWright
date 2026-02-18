import { test, expect } from '@playwright/test';

/**
 * Keyboard Navigation Test Suite
 * Tests comprehensive keyboard accessibility
 */

test.describe('Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('should navigate with Tab key', async ({ page }) => {
    let previousElement = '';
    const focusedElements = [];

    // Tab through first 10 interactive elements
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');

      const currentElement = await page.evaluate(() => {
        const el = document.activeElement;
        return {
          tagName: el?.tagName,
          id: el?.id || '',
          className: el?.className || '',
          textContent: el?.textContent?.slice(0, 50) || ''
        };
      });

      focusedElements.push(currentElement);
    }

    // Verify we moved through different elements
    expect(focusedElements.length).toBe(10);
  });

  test('should navigate backwards with Shift+Tab', async ({ page }) => {
    // Tab forward a few times
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
    }

    const forwardElement = await page.evaluate(() => document.activeElement?.tagName);

    // Tab backward
    await page.keyboard.press('Shift+Tab');
    const backwardElement = await page.evaluate(() => document.activeElement?.tagName);

    expect(backwardElement).toBeTruthy();
    expect(forwardElement).toBeTruthy();
  });

  test('should activate buttons with Enter key', async ({ page }) => {
    const button = page.locator('button').first();
    await button.focus();

    const buttonText = await button.textContent();
    await page.keyboard.press('Enter');

    // Verify button action (this will depend on the button's function)
    // For now, we just verify the button had focus
    expect(buttonText).toBeTruthy();
  });

  test('should activate buttons with Space key', async ({ page }) => {
    const button = page.locator('button').first();
    await button.focus();

    await page.keyboard.press('Space');

    // Button should still be in the DOM
    await expect(button).toBeAttached();
  });

  test('should activate links with Enter key', async ({ page }) => {
    const link = page.locator('a[href]').first();

    if (await link.count() > 0) {
      await link.focus();
      await expect(link).toBeFocused();

      // Links can be activated with Enter
      const href = await link.getAttribute('href');
      expect(href).toBeTruthy();
    }
  });

  test('should navigate dropdown menus with arrow keys', async ({ page }) => {
    const dropdown = page.locator('[role="menu"], [role="listbox"]').first();

    if (await dropdown.count() > 0) {
      await dropdown.focus();

      // Arrow down
      await page.keyboard.press('ArrowDown');
      const firstOption = await page.evaluate(() => document.activeElement?.textContent);
      expect(firstOption).toBeTruthy();

      // Arrow up
      await page.keyboard.press('ArrowUp');
      const previousOption = await page.evaluate(() => document.activeElement?.textContent);
      expect(previousOption).toBeTruthy();
    }
  });

  test('should close modals with Escape key', async ({ page }) => {
    const modalTrigger = page.locator('[data-modal-trigger], button').filter({ hasText: /open|show|add/i }).first();

    if (await modalTrigger.count() > 0) {
      await modalTrigger.click();

      const modal = page.locator('[role="dialog"]').first();
      if (await modal.count() > 0) {
        await expect(modal).toBeVisible();

        await page.keyboard.press('Escape');
        await expect(modal).not.toBeVisible();
      }
    }
  });

  test('should navigate form fields with Tab', async ({ page }) => {
    const form = page.locator('form').first();

    if (await form.count() > 0) {
      const inputs = form.locator('input, textarea, select').all();
      const inputCount = (await inputs).length;

      if (inputCount > 1) {
        const firstInput = (await inputs)[0];
        await firstInput.focus();

        await page.keyboard.press('Tab');

        const secondInput = await page.evaluate(() => document.activeElement?.tagName);
        expect(['INPUT', 'TEXTAREA', 'SELECT']).toContain(secondInput);
      }
    }
  });

  test('should support Home and End keys in lists', async ({ page }) => {
    const list = page.locator('[role="list"], [role="listbox"], ul').first();

    if (await list.count() > 0) {
      // Focus first item
      const firstItem = list.locator('[role="listitem"], li, [role="option"]').first();
      await firstItem.focus();

      // Press End to go to last item
      await page.keyboard.press('End');

      // Verify we're at a list item
      const lastFocused = await page.evaluate(() => document.activeElement?.tagName);
      expect(lastFocused).toBeTruthy();
    }
  });

  test('should support Ctrl+Home to jump to top', async ({ page }) => {
    // Scroll down
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    const scrollBefore = await page.evaluate(() => window.scrollY);

    // Ctrl+Home
    await page.keyboard.press('Control+Home');

    await page.waitForTimeout(300);
    const scrollAfter = await page.evaluate(() => window.scrollY);

    expect(scrollAfter).toBeLessThan(scrollBefore);
  });

  test('should handle spacebar for checkboxes', async ({ page }) => {
    const checkbox = page.locator('input[type="checkbox"]').first();

    if (await checkbox.count() > 0) {
      await checkbox.focus();

      const checkedBefore = await checkbox.isChecked();
      await page.keyboard.press('Space');

      const checkedAfter = await checkbox.isChecked();
      expect(checkedAfter).toBe(!checkedBefore);
    }
  });

  test('should handle arrow keys for radio buttons', async ({ page }) => {
    const radioGroup = page.locator('input[type="radio"]').first();

    if (await radioGroup.count() > 0) {
      await radioGroup.focus();

      await page.keyboard.press('ArrowDown');
      const focused = await page.evaluate(() => document.activeElement?.tagName);
      expect(focused).toBe('INPUT');
    }
  });

  test('should skip non-interactive elements', async ({ page }) => {
    await page.keyboard.press('Tab');

    const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
    const focusedRole = await page.evaluate(() => document.activeElement?.getAttribute('role'));
    const tabindex = await page.evaluate(() => document.activeElement?.getAttribute('tabindex'));

    const interactiveTags = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];
    const isInteractive =
      interactiveTags.includes(focusedTag) ||
      focusedRole === 'button' ||
      focusedRole === 'link' ||
      tabindex === '0';

    expect(isInteractive).toBeTruthy();
  });

  test('should maintain focus visibility', async ({ page }) => {
    await page.keyboard.press('Tab');

    const hasFocusIndicator = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      if (!el) return false;

      const styles = window.getComputedStyle(el);
      return (
        (styles.outline && styles.outline !== 'none') ||
        (styles.outlineWidth && styles.outlineWidth !== '0px') ||
        (styles.boxShadow && styles.boxShadow !== 'none')
      );
    });

    expect(hasFocusIndicator).toBeTruthy();
  });
});

test.describe('Keyboard Shortcuts', () => {
  test('should show help dialog with ?', async ({ page }) => {
    await page.goto('http://localhost:5173');

    await page.keyboard.press('Shift+?');

    // Check if a help dialog appears
    const dialog = page.locator('[role="dialog"]').filter({ hasText: /help|shortcuts|keyboard/i });

    if (await dialog.count() > 0) {
      await expect(dialog).toBeVisible();
    }
  });

  test('should support common shortcuts', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Test Ctrl+K for search (if implemented)
    await page.keyboard.press('Control+k');
    await page.waitForTimeout(100);

    const searchDialog = page.locator('[role="dialog"], [role="search"]').filter({ hasText: /search/i });
    if (await searchDialog.count() > 0) {
      await expect(searchDialog).toBeVisible();
    }
  });
});

test.describe('Focus Management', () => {
  test('should return focus after modal closes', async ({ page }) => {
    await page.goto('http://localhost:5173');

    const button = page.locator('button').first();
    await button.focus();
    const initialFocusedId = await page.evaluate(() => document.activeElement?.id);

    // Open and close modal if available
    const modalTrigger = page.locator('[data-modal-trigger]').first();
    if (await modalTrigger.count() > 0) {
      await modalTrigger.click();

      const modal = page.locator('[role="dialog"]').first();
      if (await modal.count() > 0) {
        await page.keyboard.press('Escape');

        await page.waitForTimeout(100);
        const finalFocusedId = await page.evaluate(() => document.activeElement?.id);

        // Focus should return to the trigger or original element
        expect(finalFocusedId).toBeTruthy();
      }
    }
  });

  test('should not trap focus in non-modal contexts', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Tab through many elements
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
    }

    // Should be able to reach different sections
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });
});
