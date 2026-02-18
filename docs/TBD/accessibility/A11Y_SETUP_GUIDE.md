# Accessibility Implementation - Setup Guide

This guide will help you set up and integrate the accessibility features into your development workflow.

## Table of Contents

1. [Installation](#installation)
2. [Integration](#integration)
3. [Configuration](#configuration)
4. [Testing Setup](#testing-setup)
5. [Development Workflow](#development-workflow)
6. [Troubleshooting](#troubleshooting)

---

## Installation

### 1. Install Dependencies

```bash
cd frontend
npm install
```

This will install all required accessibility testing tools:
- `@axe-core/playwright` - Automated accessibility testing
- `@axe-core/cli` - Command-line accessibility testing
- `@lhci/cli` - Lighthouse CI
- `pa11y-ci` - Pa11y accessibility testing

### 2. Install Playwright Browsers

```bash
npx playwright install chromium firefox webkit
```

### 3. Verify Installation

```bash
npm run test:a11y -- --help
```

---

## Integration

### 1. Import Accessibility Styles

Add to your main entry point (`src/main.tsx`):

```tsx
import './styles/accessibility.css';
```

### 2. Add Skip Links

Update your main layout or `App.tsx`:

```tsx
import { SkipLink } from './components/accessibility';

function App() {
  return (
    <>
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      <SkipLink href="#navigation">Skip to navigation</SkipLink>

      <header>
        {/* Your header */}
      </header>

      <nav id="navigation">
        {/* Your navigation */}
      </nav>

      <main id="main-content" tabIndex={-1}>
        {/* Your main content */}
      </main>
    </>
  );
}
```

### 3. Implement Live Regions

Create a global announcer in your root component:

```tsx
import { useEffect } from 'react';
import { useAnnouncer } from './hooks/useAnnouncer';

function App() {
  const { announceNavigation } = useAnnouncer();
  const location = useLocation();

  useEffect(() => {
    const pageTitle = document.title;
    announceNavigation(pageTitle);
  }, [location, announceNavigation]);

  return (
    // Your app content
  );
}
```

### 4. Replace Standard Components

Gradually replace standard components with accessible versions:

**Buttons:**
```tsx
// Before
<button onClick={handleClick}>Click me</button>

// After
import { AccessibleButton } from '@/components/accessibility';
<AccessibleButton onClick={handleClick}>Click me</AccessibleButton>
```

**Inputs:**
```tsx
// Before
<input type="email" placeholder="Email" />

// After
import { AccessibleInput } from '@/components/accessibility';
<AccessibleInput
  label="Email Address"
  type="email"
  required
/>
```

**Modals:**
```tsx
// Before
<div className="modal">...</div>

// After
import { AccessibleModal } from '@/components/accessibility';
<AccessibleModal
  isOpen={isOpen}
  onClose={onClose}
  title="Modal Title"
>
  ...
</AccessibleModal>
```

### 5. Add Keyboard Shortcuts

Create a keyboard shortcuts configuration:

```tsx
// src/config/keyboardShortcuts.ts
export const keyboardShortcuts = [
  {
    keys: ['Ctrl', 'K'],
    description: 'Open search',
    category: 'Navigation'
  },
  {
    keys: ['?'],
    description: 'Show keyboard shortcuts',
    category: 'Help'
  },
  // Add more shortcuts
];
```

Implement shortcuts in your app:

```tsx
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';
import { KeyboardShortcutsDialog } from './components/accessibility';
import { keyboardShortcuts } from './config/keyboardShortcuts';

function App() {
  const [showShortcuts, setShowShortcuts] = useState(false);

  useKeyboardNavigation([
    {
      key: '?',
      shiftKey: true,
      handler: () => setShowShortcuts(true),
      description: 'Show keyboard shortcuts'
    },
    {
      key: 'k',
      ctrlKey: true,
      handler: () => openSearch(),
      description: 'Open search'
    }
  ]);

  return (
    <>
      {/* Your app */}
      <KeyboardShortcutsDialog
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
        shortcuts={keyboardShortcuts}
      />
    </>
  );
}
```

---

## Configuration

### 1. TypeScript Configuration

The accessibility components use TypeScript. Ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "types": ["vite/client", "@testing-library/jest-dom"]
  }
}
```

### 2. Tailwind Configuration

If using Tailwind CSS, add accessibility plugin to `tailwind.config.js`:

```js
module.exports = {
  // ... other config
  plugins: [
    require('@tailwindcss/forms'),
    // Add custom accessibility utilities
  ],
  theme: {
    extend: {
      // Ensure minimum touch targets
      minHeight: {
        'touch': '44px',
      },
      minWidth: {
        'touch': '44px',
      }
    }
  }
}
```

### 3. ESLint Configuration

Add accessibility linting to `.eslintrc.cjs`:

```js
module.exports = {
  extends: [
    // ... other extends
    'plugin:jsx-a11y/recommended'
  ],
  plugins: [
    // ... other plugins
    'jsx-a11y'
  ],
  rules: {
    // Accessibility rules
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/anchor-has-content': 'error',
    'jsx-a11y/anchor-is-valid': 'error',
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/aria-proptypes': 'error',
    'jsx-a11y/aria-unsupported-elements': 'error',
    'jsx-a11y/click-events-have-key-events': 'error',
    'jsx-a11y/heading-has-content': 'error',
    'jsx-a11y/label-has-associated-control': 'error',
    'jsx-a11y/no-noninteractive-element-interactions': 'error',
    'jsx-a11y/role-has-required-aria-props': 'error',
  }
}
```

Install the plugin:
```bash
npm install --save-dev eslint-plugin-jsx-a11y
```

### 4. Playwright Configuration

Update `playwright.config.ts` to include accessibility tests:

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  projects: [
    {
      name: 'accessibility',
      testMatch: /accessibility.*\.spec\.ts/,
      use: {
        browserName: 'chromium',
      }
    },
    // ... other projects
  ]
});
```

---

## Testing Setup

### 1. Run Accessibility Tests

```bash
# Run all accessibility tests
npm run test:a11y

# Run specific test file
npx playwright test tests/accessibility/accessibility.spec.ts

# Run in headed mode (see browser)
npm run test:a11y:headed

# Run in debug mode
npx playwright test tests/accessibility/ --debug

# Run specific test
npx playwright test -g "should have proper heading hierarchy"
```

### 2. Run Lighthouse CI

```bash
# First, start your dev server
npm run dev

# In another terminal
npm run lighthouse
```

### 3. Run Pa11y CI

```bash
# First, start your dev server
npm run preview

# In another terminal
npm run pa11y
```

### 4. Manual Testing Checklist

Create a manual testing checklist (`docs/MANUAL_A11Y_TESTING.md`):

```markdown
## Keyboard Navigation
- [ ] Can tab to all interactive elements
- [ ] Focus order is logical
- [ ] Focus is always visible
- [ ] Can escape from modals with Esc
- [ ] Skip links work

## Screen Reader
- [ ] Test with NVDA/JAWS/VoiceOver
- [ ] All images have alt text
- [ ] Forms are properly labeled
- [ ] Dynamic content is announced
- [ ] Page structure makes sense

## Visual
- [ ] Text is readable at 200% zoom
- [ ] High contrast mode works
- [ ] Color is not only means of conveying info
- [ ] Focus indicators are visible

## Mobile
- [ ] Touch targets are at least 44×44px
- [ ] Works in portrait and landscape
- [ ] Text is readable without zoom
```

---

## Development Workflow

### 1. Before Committing

Run these checks:

```bash
# Type checking
npm run type-check

# Linting (includes accessibility rules)
npm run lint

# Accessibility tests
npm run test:a11y

# All checks
npm run validate && npm run test:a11y
```

### 2. During Development

Use browser extensions:

- **axe DevTools** - Install from Chrome Web Store
  - Click extension icon
  - Click "Scan ALL of my page"
  - Review and fix issues

- **WAVE** - Install from browser store
  - Click extension icon
  - Review highlighted issues
  - Check contrast

### 3. Code Review Checklist

When reviewing PRs, check:

- [ ] Semantic HTML used
- [ ] Interactive elements keyboard accessible
- [ ] Forms properly labeled
- [ ] Focus management correct
- [ ] ARIA used appropriately
- [ ] Color contrast sufficient
- [ ] Alt text provided for images
- [ ] Heading hierarchy logical
- [ ] Accessibility tests pass

### 4. CI/CD Integration

The accessibility workflow runs automatically on:
- Every pull request
- Every push to main/develop
- Weekly scheduled runs

Check the "Accessibility Testing" workflow in GitHub Actions.

---

## Troubleshooting

### Issue: Tests Failing Locally

**Solution:**
1. Ensure dev server is running: `npm run dev`
2. Update Playwright: `npx playwright install`
3. Clear cache: `rm -rf node_modules/.cache`
4. Check browser console for errors

### Issue: axe-core Import Error

**Solution:**
Install the package:
```bash
npm install --save-dev @axe-core/playwright
```

Update test imports:
```typescript
import AxeBuilder from '@axe-core/playwright';
```

### Issue: Skip Link Not Working

**Solution:**
Ensure main content has proper attributes:
```tsx
<main id="main-content" tabIndex={-1}>
```

The `tabIndex={-1}` makes the element programmatically focusable.

### Issue: Focus Not Visible

**Solution:**
Check if focus styles are being overridden. Ensure accessibility.css is imported after other stylesheets.

### Issue: Screen Reader Not Announcing

**Solution:**
1. Check if live regions exist in DOM
2. Verify aria-live attribute is set
3. Ensure message is not empty
4. Check browser console for errors

### Issue: Modal Focus Trap Not Working

**Solution:**
Ensure FocusTrap is wrapping modal content:
```tsx
<AccessibleModal isOpen={isOpen} ...>
  {/* Content automatically wrapped in FocusTrap */}
</AccessibleModal>
```

### Issue: Keyboard Shortcuts Conflicting

**Solution:**
Check for conflicts with:
- Browser shortcuts
- Screen reader shortcuts
- OS shortcuts

Use modifier keys (Ctrl/Cmd) to avoid conflicts.

---

## Best Practices

### 1. Start Accessible

Build accessibility in from the beginning, not as an afterthought.

### 2. Test Regularly

- Run automated tests with every build
- Manual test weekly
- User test quarterly

### 3. Use Semantic HTML First

Before reaching for ARIA, use semantic HTML:
```tsx
// Good
<button>Click me</button>

// Less good
<div role="button" tabIndex={0}>Click me</div>
```

### 4. Test with Real Users

Nothing beats testing with actual users who rely on assistive technology.

### 5. Keep Learning

Accessibility standards evolve. Stay updated:
- Follow @w3c on Twitter
- Subscribe to WebAIM newsletter
- Join accessibility communities

---

## Resources

### Learning
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM Resources](https://webaim.org/resources/)

### Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [Color Contrast Analyzer](https://www.tpgi.com/color-contrast-checker/)
- [Screen Reader Testing](https://www.nvaccess.org/)

### Communities
- [A11y Project](https://www.a11yproject.com/)
- [WebAIM Discussion List](https://webaim.org/discussion/)
- [Twitter #a11y](https://twitter.com/hashtag/a11y)

---

## Getting Help

### Internal Support
- Email: dev-accessibility@example.com
- Slack: #accessibility
- Office Hours: Tuesdays 2-3 PM

### External Resources
- WebAIM Help: help@webaim.org
- W3C WAI: wai@w3.org
- Deque Support: support@deque.com

---

## Next Steps

After completing this setup:

1. ✅ Review [A11Y_IMPLEMENTATION.md](./A11Y_IMPLEMENTATION.md) for development guidelines
2. ✅ Read [ACCESSIBILITY_GUIDE.md](./ACCESSIBILITY_GUIDE.md) for user-facing documentation
3. ✅ Check [KEYBOARD_SHORTCUTS.md](./KEYBOARD_SHORTCUTS.md) for complete shortcuts list
4. ✅ Review [A11Y_AUDIT_REPORT.md](./A11Y_AUDIT_REPORT.md) for current compliance status
5. ✅ Join accessibility Slack channel for ongoing support

---

**Remember:** Accessibility is a journey, not a destination. Keep improving!
