# Advanced Locators and Selectors

## Introduction

In this lesson, we'll explore Playwright's powerful locator API and learn how to effectively target elements in your tests. Choosing the right locator strategy is crucial for writing maintainable and reliable tests.

## Locator Philosophy

Playwright recommends a user-facing approach to selecting elements. Instead of using CSS selectors or XPath, prefer locators that reflect how users interact with your application.

### Recommended Priority

1. **Role-based locators** - `getByRole()`
2. **Text-based locators** - `getByText()`, `getByLabel()`
3. **Test ID locators** - `getByTestId()`
4. **CSS selectors** - Last resort

## Role-based Locators

The most robust way to locate elements is by their ARIA role:

```typescript
// Click a button
await page.getByRole('button', { name: 'Submit' }).click();

// Click a link
await page.getByRole('link', { name: 'Learn more' }).click();

// Fill a textbox
await page.getByRole('textbox', { name: 'Email' }).fill('user@example.com');

// Select a checkbox
await page.getByRole('checkbox', { name: 'Accept terms' }).check();

// Select from a listbox
await page.getByRole('listbox').selectOption('option1');
```

### Common ARIA Roles

- `button` - Buttons and button-like elements
- `link` - Anchor tags and links
- `textbox` - Input fields
- `checkbox` - Checkboxes
- `radio` - Radio buttons
- `combobox` - Select dropdowns
- `listbox` - List elements
- `heading` - Heading elements (h1-h6)
- `navigation` - Navigation sections
- `dialog` - Modal dialogs

## Text-based Locators

Text-based locators are great for finding elements by their visible text:

```typescript
// Exact text match
await page.getByText('Welcome back').click();

// Substring match
await page.getByText('Welcome', { exact: false }).click();

// Regular expression
await page.getByText(/welcome/i).click();

// Label-based (for form inputs)
await page.getByLabel('Username').fill('john.doe');
await page.getByLabel('Password').fill('secret123');
```

### Placeholder-based Locators

For inputs with placeholder text:

```typescript
await page.getByPlaceholder('Enter your email').fill('user@example.com');
await page.getByPlaceholder(/search/i).fill('playwright');
```

## Test ID Locators

When other locators aren't suitable, use data-testid attributes:

```typescript
// In your HTML
// <button data-testid="submit-button">Submit</button>

// In your test
await page.getByTestId('submit-button').click();
```

You can configure a custom test ID attribute in your Playwright config:

```typescript
// playwright.config.ts
export default {
  use: {
    testIdAttribute: 'data-test-id' // or 'data-cy', etc.
  }
};
```

## Filtering Locators

You can chain and filter locators to be more specific:

```typescript
// Find a button within a specific section
await page
  .locator('section.checkout')
  .getByRole('button', { name: 'Pay now' })
  .click();

// Filter by text
await page
  .getByRole('listitem')
  .filter({ hasText: 'Product 1' })
  .click();

// Filter by another locator
await page
  .getByRole('listitem')
  .filter({ has: page.getByRole('heading', { name: 'Product 1' }) })
  .click();

// Get nth element
await page.getByRole('button').nth(2).click();
await page.getByRole('button').first().click();
await page.getByRole('button').last().click();
```

## CSS and XPath Selectors

While not recommended as the first choice, you can still use CSS and XPath:

```typescript
// CSS selectors
await page.locator('button.submit').click();
await page.locator('#main-form input[name="email"]').fill('test@example.com');
await page.locator('.product-card:has(h2:text("Product 1"))').click();

// XPath
await page.locator('xpath=//button[contains(text(), "Submit")]').click();
```

## Handling Multiple Elements

When working with lists or multiple matching elements:

```typescript
// Get all matching elements
const products = page.getByRole('listitem');

// Count elements
const count = await products.count();
console.log(`Found ${count} products`);

// Iterate over elements
for (let i = 0; i < count; i++) {
  const text = await products.nth(i).textContent();
  console.log(`Product ${i + 1}: ${text}`);
}

// Use locator.all() for concurrent operations
const items = await page.getByRole('listitem').all();
for (const item of items) {
  console.log(await item.textContent());
}
```

## Waiting for Elements

Playwright has built-in auto-waiting, but you can be explicit when needed:

```typescript
// Wait for element to be visible
await page.getByText('Loading...').waitFor({ state: 'hidden' });
await page.getByText('Data loaded').waitFor({ state: 'visible' });

// Wait for element to be attached
await page.getByTestId('dynamic-content').waitFor({ state: 'attached' });

// Wait with timeout
await page.getByText('Slow element').waitFor({
  state: 'visible',
  timeout: 10000 // 10 seconds
});
```

## Assertions with Locators

Use Playwright's assertions for better error messages:

```typescript
import { expect } from '@playwright/test';

// Visibility assertions
await expect(page.getByText('Success')).toBeVisible();
await expect(page.getByText('Loading')).toBeHidden();

// Content assertions
await expect(page.getByRole('heading')).toHaveText('Welcome');
await expect(page.getByTestId('status')).toContainText('Active');

// Count assertions
await expect(page.getByRole('listitem')).toHaveCount(5);

// Attribute assertions
await expect(page.getByRole('link')).toHaveAttribute('href', '/home');

// State assertions
await expect(page.getByRole('checkbox')).toBeChecked();
await expect(page.getByRole('button')).toBeEnabled();
await expect(page.getByRole('textbox')).toBeEditable();
```

## Complex Scenarios

### Forms

```typescript
// Fill form with multiple fields
await page.getByLabel('First Name').fill('John');
await page.getByLabel('Last Name').fill('Doe');
await page.getByLabel('Email').fill('john.doe@example.com');
await page.getByLabel('Country').selectOption('USA');
await page.getByLabel('I agree to terms').check();
await page.getByRole('button', { name: 'Sign up' }).click();
```

### Tables

```typescript
// Locate table rows
const table = page.getByRole('table');
const rows = table.locator('tbody tr');

// Find specific row by text
const targetRow = rows.filter({ hasText: 'John Doe' });

// Click button in specific row
await targetRow.getByRole('button', { name: 'Edit' }).click();

// Get cell value
const email = await targetRow.locator('td').nth(2).textContent();
```

### Shadow DOM

```typescript
// Pierce shadow DOM
await page.locator('custom-element').locator('button').click();

// Or use CSS with >>>
await page.locator('custom-element >>> button').click();
```

## Best Practices

1. **Prefer user-facing locators** - Use `getByRole()`, `getByText()`, and `getByLabel()`
2. **Be specific but flexible** - Avoid overly specific selectors that break easily
3. **Use test IDs sparingly** - Only when no better option exists
4. **Avoid absolute XPath** - They're fragile and hard to maintain
5. **Chain locators for precision** - Narrow down from container to target
6. **Use meaningful test IDs** - If you must use test IDs, make them descriptive

## Anti-patterns

Avoid these common mistakes:

```typescript
// ❌ Don't use brittle CSS selectors
await page.locator('div > div:nth-child(3) > button').click();

// ✅ Do use semantic locators
await page.getByRole('button', { name: 'Submit' }).click();

// ❌ Don't rely on order without context
await page.locator('button').nth(5).click();

// ✅ Do add filtering context
await page.locator('.payment-section').getByRole('button').nth(1).click();

// ❌ Don't use absolute XPath
await page.locator('/html/body/div[1]/div[2]/button').click();

// ✅ Do use relative XPath with semantic meaning
await page.locator('//button[contains(@class, "submit")]').click();
```

## Summary

In this lesson, we covered:
- Playwright's locator philosophy and priority
- Role-based, text-based, and test ID locators
- Filtering and chaining locators
- Handling multiple elements
- Assertions with locators
- Complex scenarios like forms and tables
- Best practices and anti-patterns

## Practice Exercise

Try to complete this exercise:

1. Navigate to a real website (e.g., https://demo.playwright.dev/todomvc/)
2. Add three todo items using `getByPlaceholder()` and `getByRole()`
3. Mark the second item as complete using filtering
4. Assert the count of remaining items
5. Clear all completed items

## Next Steps

In the next lesson, we'll explore:
- Interacting with different types of form elements
- File uploads and downloads
- Handling dialogs and popups
- Working with iframes

## Resources

- [Playwright Locators Guide](https://playwright.dev/docs/locators)
- [ARIA Roles Reference](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles)
- [CSS Selectors Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors)

---

*Estimated reading time: 15 minutes*
*Difficulty: Intermediate*
*Prerequisites: Introduction to Playwright*
