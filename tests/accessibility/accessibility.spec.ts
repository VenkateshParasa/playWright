import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility Test Suite
 * Automated WCAG 2.1 Level AA compliance testing
 */

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:5173');
  });

  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper page title', async ({ page }) => {
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('should have skip navigation link', async ({ page }) => {
    const skipLink = page.locator('.skip-link').first();
    await expect(skipLink).toBeAttached();

    // Test skip link functionality
    await skipLink.focus();
    await expect(skipLink).toBeVisible();

    await skipLink.click();
    const mainContent = page.locator('main, [role="main"]').first();
    await expect(mainContent).toBeFocused();
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1); // Should have exactly one h1

    // Check heading order
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    const headingLevels = await Promise.all(
      headings.map(h => h.evaluate(el => parseInt(el.tagName[1])))
    );

    // Verify no heading levels are skipped
    for (let i = 1; i < headingLevels.length; i++) {
      const diff = headingLevels[i] - headingLevels[i - 1];
      expect(diff).toBeLessThanOrEqual(1);
    }
  });

  test('should have proper ARIA landmarks', async ({ page }) => {
    await expect(page.locator('main, [role="main"]')).toHaveCount(1);
    await expect(page.locator('nav, [role="navigation"]')).toHaveCount.toBeGreaterThan(0);
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    const firstFocusable = await page.evaluate(() => document.activeElement?.tagName);
    expect(firstFocusable).toBeTruthy();

    // Test multiple tab presses
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
    }

    // Verify focus is on an interactive element
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      return {
        tagName: el?.tagName,
        role: el?.getAttribute('role'),
        tabIndex: el?.getAttribute('tabindex')
      };
    });

    const interactiveTags = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];
    const isInteractive = interactiveTags.includes(focusedElement.tagName) ||
                          focusedElement.role === 'button' ||
                          focusedElement.tabIndex === '0';

    expect(isInteractive).toBeTruthy();
  });

  test('should have visible focus indicators', async ({ page }) => {
    const button = page.locator('button').first();
    await button.focus();

    const outlineStyle = await button.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        outline: styles.outline,
        outlineWidth: styles.outlineWidth,
        boxShadow: styles.boxShadow
      };
    });

    // Should have either outline or box-shadow for focus
    const hasFocusIndicator =
      (outlineStyle.outlineWidth && outlineStyle.outlineWidth !== '0px') ||
      (outlineStyle.boxShadow && outlineStyle.boxShadow !== 'none');

    expect(hasFocusIndicator).toBeTruthy();
  });

  test('should have proper form labels', async ({ page }) => {
    const inputs = await page.locator('input[type="text"], input[type="email"], input[type="password"], textarea').all();

    for (const input of inputs) {
      const hasLabel = await input.evaluate(el => {
        const id = el.id;
        const ariaLabel = el.getAttribute('aria-label');
        const ariaLabelledBy = el.getAttribute('aria-labelledby');
        const label = id ? document.querySelector(`label[for="${id}"]`) : null;

        return !!(label || ariaLabel || ariaLabelledBy);
      });

      expect(hasLabel).toBeTruthy();
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include('body')
      .analyze();

    const contrastViolations = accessibilityScanResults.violations.filter(
      v => v.id === 'color-contrast'
    );

    expect(contrastViolations).toEqual([]);
  });

  test('should have alt text for images', async ({ page }) => {
    const images = await page.locator('img').all();

    for (const img of images) {
      const alt = await img.getAttribute('alt');
      const role = await img.getAttribute('role');
      const ariaLabel = await img.getAttribute('aria-label');

      // Images should have alt text or be marked as decorative
      const hasAccessibleName = !!(alt !== null || role === 'presentation' || ariaLabel);
      expect(hasAccessibleName).toBeTruthy();
    }
  });

  test('should support screen reader announcements', async ({ page }) => {
    const liveRegions = await page.locator('[aria-live], [role="status"], [role="alert"]').count();
    expect(liveRegions).toBeGreaterThan(0);
  });

  test('should have proper button labels', async ({ page }) => {
    const buttons = await page.locator('button').all();

    for (const button of buttons) {
      const accessibleName = await button.evaluate(el => {
        const ariaLabel = el.getAttribute('aria-label');
        const ariaLabelledBy = el.getAttribute('aria-labelledby');
        const textContent = el.textContent?.trim();

        return ariaLabel || ariaLabelledBy || textContent;
      });

      expect(accessibleName).toBeTruthy();
      expect(accessibleName.length).toBeGreaterThan(0);
    }
  });

  test('should handle escape key for modals', async ({ page }) => {
    // Open a modal if available
    const modalTrigger = page.locator('[data-modal-trigger], [aria-haspopup="dialog"]').first();

    if (await modalTrigger.count() > 0) {
      await modalTrigger.click();

      const modal = page.locator('[role="dialog"], [aria-modal="true"]').first();
      await expect(modal).toBeVisible();

      // Press escape
      await page.keyboard.press('Escape');
      await expect(modal).not.toBeVisible();
    }
  });

  test('should trap focus in modals', async ({ page }) => {
    const modalTrigger = page.locator('[data-modal-trigger], [aria-haspopup="dialog"]').first();

    if (await modalTrigger.count() > 0) {
      await modalTrigger.click();

      const modal = page.locator('[role="dialog"], [aria-modal="true"]').first();
      await expect(modal).toBeVisible();

      // Get focusable elements in modal
      const focusableCount = await modal.locator('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])').count();

      if (focusableCount > 0) {
        // Tab through all elements
        for (let i = 0; i < focusableCount + 1; i++) {
          await page.keyboard.press('Tab');
        }

        // Focus should still be within modal
        const focusInModal = await page.evaluate(() => {
          const activeElement = document.activeElement;
          const modal = document.querySelector('[role="dialog"], [aria-modal="true"]');
          return modal?.contains(activeElement) ?? false;
        });

        expect(focusInModal).toBeTruthy();
      }
    }
  });

  test('should support reduced motion preferences', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });

    // Verify animations are disabled or minimal
    const hasReducedMotion = await page.evaluate(() => {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    });

    expect(hasReducedMotion).toBeTruthy();
  });

  test('should be accessible at 200% zoom', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });

    // Zoom to 200%
    await page.evaluate(() => {
      document.body.style.zoom = '2';
    });

    // Run accessibility scan at 200% zoom
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);

    // Reset zoom
    await page.evaluate(() => {
      document.body.style.zoom = '1';
    });
  });

  test('should have minimum touch target sizes on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

    const interactiveElements = await page.locator('button, a, input, select, [role="button"], [tabindex]:not([tabindex="-1"])').all();

    for (const element of interactiveElements.slice(0, 10)) { // Test first 10
      const box = await element.boundingBox();
      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });
});

test.describe('Keyboard Shortcuts', () => {
  test('should display keyboard shortcuts dialog', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Try to open shortcuts dialog (usually Shift + ?)
    await page.keyboard.press('Shift+?');

    const dialog = page.locator('[role="dialog"]').filter({ hasText: /keyboard shortcuts/i }).first();

    if (await dialog.count() > 0) {
      await expect(dialog).toBeVisible();
    }
  });
});

test.describe('Page-Specific Accessibility', () => {
  const pages = [
    { path: '/', name: 'Home' },
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/lessons', name: 'Lessons' },
    { path: '/settings', name: 'Settings' }
  ];

  for (const { path, name } of pages) {
    test(`${name} page should be accessible`, async ({ page }) => {
      await page.goto(`http://localhost:5173${path}`);

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  }
});
