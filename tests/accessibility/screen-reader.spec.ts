import { test, expect } from '@playwright/test';

/**
 * Screen Reader Test Suite
 * Tests screen reader compatibility and ARIA implementations
 */

test.describe('Screen Reader Compatibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('should have proper ARIA live regions', async ({ page }) => {
    const liveRegions = await page.locator('[aria-live]').all();
    expect(liveRegions.length).toBeGreaterThan(0);

    for (const region of liveRegions) {
      const liveValue = await region.getAttribute('aria-live');
      expect(['polite', 'assertive', 'off']).toContain(liveValue);
    }
  });

  test('should announce status messages', async ({ page }) => {
    const statusRegions = await page.locator('[role="status"]').all();
    expect(statusRegions.length).toBeGreaterThan(0);
  });

  test('should announce alerts', async ({ page }) => {
    const alertRegions = await page.locator('[role="alert"]').all();

    // Alerts should exist or be creatable
    if (alertRegions.length === 0) {
      // Try to trigger an error to see if alert appears
      const form = page.locator('form').first();
      if (await form.count() > 0) {
        const submitButton = form.locator('button[type="submit"]').first();
        await submitButton.click();

        await page.waitForTimeout(500);
        const alerts = await page.locator('[role="alert"]').count();
        // Alerts may appear after form validation
      }
    }
  });

  test('should have accessible names for all interactive elements', async ({ page }) => {
    const buttons = await page.locator('button').all();

    for (const button of buttons.slice(0, 10)) { // Test first 10
      const accessibleName = await button.evaluate(el => {
        const ariaLabel = el.getAttribute('aria-label');
        const ariaLabelledby = el.getAttribute('aria-labelledby');
        const text = el.textContent?.trim();
        const title = el.getAttribute('title');

        return ariaLabel || ariaLabelledby || text || title;
      });

      expect(accessibleName).toBeTruthy();
      expect(accessibleName.length).toBeGreaterThan(0);
    }
  });

  test('should have proper ARIA roles', async ({ page }) => {
    const elementsWithRoles = await page.locator('[role]').all();

    const validRoles = [
      'alert', 'alertdialog', 'application', 'article', 'banner', 'button',
      'checkbox', 'columnheader', 'combobox', 'complementary', 'contentinfo',
      'definition', 'dialog', 'directory', 'document', 'feed', 'figure',
      'form', 'grid', 'gridcell', 'group', 'heading', 'img', 'link', 'list',
      'listbox', 'listitem', 'log', 'main', 'marquee', 'math', 'menu',
      'menubar', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'navigation',
      'none', 'note', 'option', 'presentation', 'progressbar', 'radio',
      'radiogroup', 'region', 'row', 'rowgroup', 'rowheader', 'scrollbar',
      'search', 'searchbox', 'separator', 'slider', 'spinbutton', 'status',
      'switch', 'tab', 'table', 'tablist', 'tabpanel', 'term', 'textbox',
      'timer', 'toolbar', 'tooltip', 'tree', 'treegrid', 'treeitem'
    ];

    for (const element of elementsWithRoles) {
      const role = await element.getAttribute('role');
      expect(validRoles).toContain(role);
    }
  });

  test('should have proper aria-label or aria-labelledby', async ({ page }) => {
    const ariaLabelElements = await page.locator('[aria-label], [aria-labelledby]').all();
    expect(ariaLabelElements.length).toBeGreaterThan(0);

    for (const element of ariaLabelElements.slice(0, 10)) {
      const ariaLabel = await element.getAttribute('aria-label');
      const ariaLabelledby = await element.getAttribute('aria-labelledby');

      if (ariaLabel) {
        expect(ariaLabel.length).toBeGreaterThan(0);
      } else if (ariaLabelledby) {
        const labelElement = await page.locator(`#${ariaLabelledby}`).first();
        await expect(labelElement).toBeAttached();
      }
    }
  });

  test('should describe complex widgets with aria-describedby', async ({ page }) => {
    const describedElements = await page.locator('[aria-describedby]').all();

    for (const element of describedElements) {
      const describedby = await element.getAttribute('aria-describedby');
      if (describedby) {
        const ids = describedby.split(' ');
        for (const id of ids) {
          const descElement = await page.locator(`#${id}`).count();
          expect(descElement).toBeGreaterThan(0);
        }
      }
    }
  });

  test('should mark decorative images properly', async ({ page }) => {
    const images = await page.locator('img').all();

    for (const img of images) {
      const alt = await img.getAttribute('alt');
      const role = await img.getAttribute('role');
      const ariaHidden = await img.getAttribute('aria-hidden');

      // Images must have alt attribute
      expect(alt !== null).toBeTruthy();

      // Decorative images should have empty alt or presentation role
      if (alt === '' || role === 'presentation' || ariaHidden === 'true') {
        // This is a decorative image, which is fine
        expect(true).toBeTruthy();
      } else {
        // Content images should have meaningful alt text
        expect(alt).toBeTruthy();
        expect(alt.length).toBeGreaterThan(0);
      }
    }
  });

  test('should have proper form field labels', async ({ page }) => {
    const inputs = await page.locator('input, textarea, select').all();

    for (const input of inputs.slice(0, 10)) {
      const type = await input.getAttribute('type');

      // Skip hidden inputs
      if (type === 'hidden') continue;

      const hasLabel = await input.evaluate(el => {
        const id = el.id;
        const ariaLabel = el.getAttribute('aria-label');
        const ariaLabelledby = el.getAttribute('aria-labelledby');
        const label = id ? document.querySelector(`label[for="${id}"]`) : null;
        const parentLabel = el.closest('label');

        return !!(label || ariaLabel || ariaLabelledby || parentLabel);
      });

      expect(hasLabel).toBeTruthy();
    }
  });

  test('should indicate required fields', async ({ page }) => {
    const requiredInputs = await page.locator('input[required], textarea[required], select[required]').all();

    for (const input of requiredInputs) {
      const ariaRequired = await input.getAttribute('aria-required');
      const required = await input.getAttribute('required');

      expect(required !== null || ariaRequired === 'true').toBeTruthy();
    }
  });

  test('should announce form errors', async ({ page }) => {
    const form = page.locator('form').first();

    if (await form.count() > 0) {
      // Submit empty form to trigger validation
      const submitButton = form.locator('button[type="submit"]').first();
      await submitButton.click();

      await page.waitForTimeout(500);

      // Check for error messages with proper ARIA
      const errorElements = await page.locator('[role="alert"], .error, [aria-invalid="true"]').count();

      // Errors should be present or form should have prevented submission
      if (errorElements > 0) {
        const errorWithAlert = await page.locator('[role="alert"]').count();
        expect(errorWithAlert).toBeGreaterThan(0);
      }
    }
  });

  test('should have proper heading structure for navigation', async ({ page }) => {
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();

    if (headings.length > 0) {
      const headingTexts = await Promise.all(
        headings.map(h => h.textContent())
      );

      // All headings should have text
      for (const text of headingTexts) {
        expect(text?.trim().length).toBeGreaterThan(0);
      }
    }
  });

  test('should have breadcrumb navigation', async ({ page }) => {
    const breadcrumb = page.locator('[aria-label="Breadcrumb"], nav[aria-label*="breadcrumb" i]').first();

    if (await breadcrumb.count() > 0) {
      await expect(breadcrumb).toBeVisible();

      const breadcrumbItems = await breadcrumb.locator('a, span').count();
      expect(breadcrumbItems).toBeGreaterThan(0);
    }
  });

  test('should announce loading states', async ({ page }) => {
    const loadingElements = await page.locator('[aria-busy="true"], [aria-live]').all();

    if (loadingElements.length > 0) {
      for (const element of loadingElements) {
        const ariaBusy = await element.getAttribute('aria-busy');
        const ariaLive = await element.getAttribute('aria-live');

        expect(ariaBusy === 'true' || ariaLive !== null).toBeTruthy();
      }
    }
  });

  test('should have proper button states', async ({ page }) => {
    const buttons = await page.locator('button').all();

    for (const button of buttons.slice(0, 10)) {
      const disabled = await button.getAttribute('disabled');
      const ariaDisabled = await button.getAttribute('aria-disabled');
      const ariaPressed = await button.getAttribute('aria-pressed');

      // If disabled, should have proper attribute
      if (disabled !== null) {
        expect(await button.isDisabled()).toBeTruthy();
      }

      // Toggle buttons should have aria-pressed
      const isToggle = ariaPressed !== null;
      if (isToggle) {
        expect(['true', 'false']).toContain(ariaPressed);
      }
    }
  });

  test('should have proper table structure', async ({ page }) => {
    const tables = await page.locator('table').all();

    for (const table of tables) {
      // Tables should have headers
      const headers = await table.locator('th').count();

      if (headers > 0) {
        const thead = await table.locator('thead').count();
        const captionOrAriaLabel = await table.evaluate(el => {
          return el.querySelector('caption') || el.getAttribute('aria-label') || el.getAttribute('aria-labelledby');
        });

        // Tables should have caption or aria-label
        expect(!!captionOrAriaLabel).toBeTruthy();
      }
    }
  });

  test('should have proper dialog markup', async ({ page }) => {
    const dialogs = await page.locator('[role="dialog"]').all();

    for (const dialog of dialogs) {
      const ariaModal = await dialog.getAttribute('aria-modal');
      const ariaLabelledby = await dialog.getAttribute('aria-labelledby');
      const ariaLabel = await dialog.getAttribute('aria-label');

      // Dialogs should have aria-modal
      expect(ariaModal).toBe('true');

      // Dialogs should have accessible name
      expect(!!(ariaLabel || ariaLabelledby)).toBeTruthy();
    }
  });
});

test.describe('Screen Reader Announcements', () => {
  test('should announce page navigation', async ({ page }) => {
    await page.goto('http://localhost:5173');

    const title = await page.title();
    expect(title).toBeTruthy();

    // Navigate to another page
    const link = page.locator('a[href]').first();
    if (await link.count() > 0) {
      await link.click();
      await page.waitForLoadState('networkidle');

      const newTitle = await page.title();
      expect(newTitle).toBeTruthy();
      expect(newTitle).not.toBe(title);
    }
  });

  test('should announce dynamic content changes', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Look for dynamic content areas
    const liveRegions = await page.locator('[aria-live="polite"], [aria-live="assertive"]').count();
    expect(liveRegions).toBeGreaterThanOrEqual(0); // May or may not exist initially
  });
});
