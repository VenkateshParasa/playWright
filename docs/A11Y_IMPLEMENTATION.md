# Accessibility Implementation Guide for Developers

## Overview

This guide provides comprehensive information for developers on implementing and maintaining WCAG 2.1 Level AA accessibility compliance in the learning platform.

## Table of Contents

1. [Architecture](#architecture)
2. [Components](#components)
3. [Hooks](#hooks)
4. [Styling](#styling)
5. [Testing](#testing)
6. [Best Practices](#best-practices)
7. [Common Patterns](#common-patterns)
8. [Troubleshooting](#troubleshooting)

---

## Architecture

### Accessibility Layer Structure

```
frontend/src/
├── components/
│   └── accessibility/
│       ├── SkipLink.tsx              # Skip navigation links
│       ├── ScreenReaderOnly.tsx       # SR-only content
│       ├── FocusTrap.tsx              # Focus management
│       ├── LiveRegion.tsx             # ARIA live regions
│       ├── KeyboardShortcutsDialog.tsx # Shortcuts help
│       ├── AccessibleButton.tsx        # Accessible button component
│       ├── AccessibleInput.tsx         # Accessible input component
│       ├── AccessibleModal.tsx         # Accessible modal dialog
│       └── index.ts                    # Barrel export
├── hooks/
│   ├── useKeyboardNavigation.ts       # Keyboard nav hook
│   ├── useFocusTrap.ts                # Focus trap hook
│   └── useAnnouncer.ts                # Screen reader announcer
└── styles/
    └── accessibility.css               # A11y styles

tests/accessibility/
├── accessibility.spec.ts               # General a11y tests
├── keyboard-navigation.spec.ts         # Keyboard tests
└── screen-reader.spec.ts               # Screen reader tests
```

---

## Components

### SkipLink

Provides keyboard users the ability to skip repetitive navigation.

**Usage:**

```tsx
import { SkipLink } from '@/components/accessibility';

function App() {
  return (
    <>
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      <SkipLink href="#navigation">Skip to navigation</SkipLink>

      <nav id="navigation">...</nav>
      <main id="main-content">...</main>
    </>
  );
}
```

**WCAG Criteria:** 2.4.1 (Bypass Blocks) - Level A

**Props:**
- `href` (string, required): Target element ID
- `children` (ReactNode, required): Link text
- `className` (string, optional): Additional CSS classes

### ScreenReaderOnly

Hides content visually while keeping it accessible to screen readers.

**Usage:**

```tsx
import { ScreenReaderOnly } from '@/components/accessibility';

function DeleteButton() {
  return (
    <button>
      <TrashIcon />
      <ScreenReaderOnly>Delete item</ScreenReaderOnly>
    </button>
  );
}
```

**WCAG Criteria:** 1.3.1 (Info and Relationships) - Level A

**Props:**
- `children` (ReactNode, required): Content to hide
- `as` (element, optional): HTML element type (default: 'span')
- `focusable` (boolean, optional): Show when focused (default: false)
- `className` (string, optional): Additional CSS classes

### FocusTrap

Traps keyboard focus within a container (for modals/dialogs).

**Usage:**

```tsx
import { FocusTrap } from '@/components/accessibility';

function Modal({ isOpen, onClose, children }) {
  return isOpen ? (
    <div className="modal-overlay">
      <FocusTrap active={isOpen}>
        <div className="modal">
          {children}
          <button onClick={onClose}>Close</button>
        </div>
      </FocusTrap>
    </div>
  ) : null;
}
```

**WCAG Criteria:** 2.1.2 (No Keyboard Trap) - Level A

**Props:**
- `active` (boolean, optional): Whether trap is active (default: true)
- `children` (ReactNode, required): Content to trap focus within
- `initialFocus` (HTMLElement, optional): Element to focus initially
- `returnFocus` (boolean, optional): Return focus on unmount (default: true)

### LiveRegion

ARIA live region for announcing dynamic content changes.

**Usage:**

```tsx
import { LiveRegion } from '@/components/accessibility';

function SearchResults({ count, isLoading }) {
  const message = isLoading
    ? 'Loading results...'
    : `Found ${count} results`;

  return (
    <>
      <LiveRegion message={message} politeness="polite" />
      {/* Your search results */}
    </>
  );
}
```

**WCAG Criteria:** 4.1.3 (Status Messages) - Level AA

**Props:**
- `message` (string, required): Message to announce
- `politeness` ('polite' | 'assertive' | 'off', optional): Announcement priority
- `atomic` (boolean, optional): Announce entire region (default: true)
- `clearAfter` (number, optional): Clear message after ms

### AccessibleButton

Fully accessible button with loading states and proper ARIA.

**Usage:**

```tsx
import { AccessibleButton } from '@/components/accessibility';

function SaveForm() {
  const [saving, setSaving] = useState(false);

  return (
    <AccessibleButton
      variant="primary"
      size="md"
      loading={saving}
      loadingText="Saving..."
      onClick={handleSave}
      icon={<SaveIcon />}
    >
      Save Changes
    </AccessibleButton>
  );
}
```

**Props:**
- `variant` ('primary' | 'secondary' | 'danger' | 'ghost'): Button style
- `size` ('sm' | 'md' | 'lg'): Button size
- `loading` (boolean): Show loading state
- `loadingText` (string): Text during loading
- `icon` (ReactNode): Icon element
- `iconPosition` ('left' | 'right'): Icon placement
- Plus all standard button HTML attributes

### AccessibleInput

Fully accessible input field with proper labels and error handling.

**Usage:**

```tsx
import { AccessibleInput } from '@/components/accessibility';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  return (
    <AccessibleInput
      label="Email Address"
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      error={error}
      hint="We'll never share your email"
      required
      icon={<MailIcon />}
    />
  );
}
```

**Props:**
- `label` (string, required): Input label
- `error` (string, optional): Error message
- `hint` (string, optional): Helper text
- `showLabel` (boolean): Show label visually (default: true)
- `icon` (ReactNode): Icon element
- `iconPosition` ('left' | 'right'): Icon placement
- Plus all standard input HTML attributes

### AccessibleModal

Fully accessible modal dialog with focus management.

**Usage:**

```tsx
import { AccessibleModal } from '@/components/accessibility';

function ConfirmDialog({ isOpen, onClose, onConfirm }) {
  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Action"
      size="md"
      closeOnEscape
      footer={
        <>
          <button onClick={onClose}>Cancel</button>
          <button onClick={onConfirm}>Confirm</button>
        </>
      }
    >
      <p>Are you sure you want to proceed?</p>
    </AccessibleModal>
  );
}
```

**Props:**
- `isOpen` (boolean, required): Modal visibility
- `onClose` (function, required): Close handler
- `title` (string, required): Modal title
- `children` (ReactNode, required): Modal content
- `size` ('sm' | 'md' | 'lg' | 'xl'): Modal width
- `closeOnOverlayClick` (boolean): Close on backdrop click
- `closeOnEscape` (boolean): Close on Escape key
- `showCloseButton` (boolean): Show close button
- `footer` (ReactNode): Footer content

---

## Hooks

### useKeyboardNavigation

Provides comprehensive keyboard navigation functionality.

**Usage:**

```tsx
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';

function MyComponent() {
  const { navigateToElement, focusFirstInContainer } = useKeyboardNavigation([
    {
      key: 's',
      ctrlKey: true,
      handler: (e) => {
        e.preventDefault();
        handleSave();
      },
      description: 'Save document'
    },
    {
      key: 'Escape',
      handler: () => closeModal()
    }
  ]);

  useEffect(() => {
    navigateToElement('#search-input');
  }, []);

  return <div>...</div>;
}
```

**API:**

- `navigateFocusable(direction: 'next' | 'previous')` - Navigate through focusable elements
- `navigateToElement(selector: string)` - Focus specific element
- `focusFirstInContainer(container: HTMLElement)` - Focus first focusable in container
- `createRovingTabIndex(container, itemSelector, orientation)` - Setup roving tabindex

### useFocusTrap

Traps keyboard focus within a container.

**Usage:**

```tsx
import { useFocusTrap } from '@/hooks/useFocusTrap';

function Dialog({ isOpen }) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useFocusTrap(dialogRef, isOpen, {
    returnFocus: true,
    escapeDeactivates: true
  });

  return (
    <div ref={dialogRef}>
      {/* Dialog content */}
    </div>
  );
}
```

**Parameters:**
- `containerRef` (RefObject): Container element reference
- `isActive` (boolean): Whether trap is active
- `options` (object):
  - `initialFocus`: Element to focus initially
  - `returnFocus`: Return focus on deactivate (default: true)
  - `escapeDeactivates`: Allow Escape to deactivate (default: true)

### useAnnouncer

Announces messages to screen readers using ARIA live regions.

**Usage:**

```tsx
import { useAnnouncer } from '@/hooks/useAnnouncer';

function SearchComponent() {
  const { announce, announceError, announceSuccess } = useAnnouncer();

  const handleSearch = async (query) => {
    announce('Searching...');

    try {
      const results = await searchAPI(query);
      announceSuccess(`Found ${results.length} results`);
    } catch (error) {
      announceError('Search failed. Please try again.');
    }
  };

  return <div>...</div>;
}
```

**API:**

- `announce(message, options)` - Generic announcement
- `announceError(message)` - Announce error (assertive)
- `announceSuccess(message)` - Announce success (polite, auto-clear)
- `announceLoading(message)` - Announce loading state
- `announceNavigation(location)` - Announce navigation
- `announcePageTitle(title)` - Announce page title
- `clear()` - Clear all announcements

---

## Styling

### Accessibility CSS

Import the accessibility stylesheet in your app:

```tsx
// main.tsx
import './styles/accessibility.css';
```

### Key Classes

**Screen Reader Only:**
```css
.sr-only /* Visually hidden, available to SR */
.sr-only-focusable /* Visible when focused */
```

**Skip Links:**
```css
.skip-link /* Skip navigation link */
```

**Focus Indicators:**
All interactive elements automatically receive focus indicators via CSS.

**Usage with Tailwind:**

```tsx
// Combine with Tailwind classes
<div className="sr-only">Screen reader only text</div>
<a href="#main" className="skip-link">Skip to content</a>
```

### Custom Focus Styles

Override default focus styles when needed:

```css
.my-button:focus-visible {
  outline: 2px solid #your-color;
  outline-offset: 2px;
}
```

---

## Testing

### Running Accessibility Tests

```bash
# Run all accessibility tests
npm run test:a11y

# Run specific test suite
npx playwright test tests/accessibility/accessibility.spec.ts

# Run in headed mode
npx playwright test tests/accessibility/ --headed

# Run with specific browser
npx playwright test tests/accessibility/ --project=chromium
```

### Test Suites

1. **accessibility.spec.ts** - General WCAG compliance
2. **keyboard-navigation.spec.ts** - Keyboard accessibility
3. **screen-reader.spec.ts** - Screen reader compatibility

### Manual Testing

**Screen Readers:**

1. **NVDA (Windows - Free)**
   - Download from https://www.nvaccess.org/
   - Insert + N to open menu
   - Insert + Q to quit

2. **VoiceOver (macOS)**
   - Cmd + F5 to toggle
   - VO = Ctrl + Alt
   - VO + A to start reading

3. **JAWS (Windows)**
   - Commercial product
   - Insert + J to open menu

**Browser Tools:**

1. **Chrome DevTools**
   - Elements > Accessibility pane
   - Lighthouse (Accessibility audit)

2. **axe DevTools Extension**
   - Install from Chrome Web Store
   - Analyze page for issues

3. **WAVE Extension**
   - Install from browser store
   - Visual accessibility evaluation

### Automated Testing in CI

Tests run automatically on every PR via GitHub Actions:

- `.github/workflows/accessibility.yml`
- Lighthouse CI
- Pa11y CI
- Axe-core
- Playwright accessibility tests

---

## Best Practices

### 1. Semantic HTML

Always use semantic HTML elements:

```tsx
// ✅ Good
<button onClick={handleClick}>Click me</button>
<nav><ul><li><a href="/home">Home</a></li></ul></nav>
<main><article><h1>Title</h1><p>Content</p></article></main>

// ❌ Bad
<div onClick={handleClick}>Click me</div>
<div><div><div><a href="/home">Home</a></div></div></div>
<div><div><div>Title</div><div>Content</div></div></div>
```

### 2. ARIA Usage

Use ARIA only when semantic HTML is insufficient:

```tsx
// ✅ Good - Semantic HTML, no ARIA needed
<button>Submit</button>

// ✅ Good - ARIA adds missing semantics
<div role="button" tabIndex={0} onClick={handleClick}>
  Submit
</div>

// ❌ Bad - Redundant ARIA
<button role="button">Submit</button>
```

**The First Rule of ARIA:** Don't use ARIA if you can use native HTML instead.

### 3. Keyboard Navigation

Ensure all interactive elements are keyboard accessible:

```tsx
// ✅ Good - Keyboard accessible
<button onClick={handleClick}>Action</button>
<a href="/page">Link</a>

// ✅ Good - Custom element with keyboard support
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Custom Button
</div>

// ❌ Bad - Not keyboard accessible
<div onClick={handleClick}>Action</div>
```

### 4. Focus Management

Manage focus appropriately:

```tsx
// ✅ Good - Focus management in modal
function Modal({ isOpen, onClose }) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && dialogRef.current) {
      const firstFocusable = dialogRef.current.querySelector('button');
      firstFocusable?.focus();
    }
  }, [isOpen]);

  return <div ref={dialogRef}>...</div>;
}
```

### 5. Form Accessibility

Always label form inputs:

```tsx
// ✅ Good - Explicit label
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// ✅ Good - Implicit label
<label>
  Email
  <input type="email" />
</label>

// ✅ Good - ARIA label
<input type="email" aria-label="Email address" />

// ❌ Bad - No label
<input type="email" placeholder="Email" />
```

### 6. Error Handling

Provide accessible error messages:

```tsx
// ✅ Good
<input
  id="email"
  type="email"
  aria-invalid={hasError}
  aria-describedby={hasError ? "email-error" : undefined}
/>
{hasError && (
  <p id="email-error" role="alert">
    Please enter a valid email address
  </p>
)}
```

### 7. Loading States

Announce loading states to screen readers:

```tsx
// ✅ Good
function SearchResults({ isLoading, results }) {
  return (
    <>
      <div aria-live="polite" aria-atomic="true">
        {isLoading ? 'Loading results...' : `${results.length} results found`}
      </div>
      {/* Results display */}
    </>
  );
}
```

### 8. Color Contrast

Ensure sufficient color contrast (4.5:1 for normal text, 3:1 for large text):

```css
/* ✅ Good - Sufficient contrast */
.text {
  color: #000000; /* Black */
  background: #ffffff; /* White */
  /* Contrast ratio: 21:1 */
}

/* ❌ Bad - Insufficient contrast */
.text {
  color: #999999; /* Light gray */
  background: #ffffff; /* White */
  /* Contrast ratio: 2.8:1 */
}
```

Use tools to check contrast:
- Chrome DevTools (Color picker shows contrast ratio)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

### 9. Alternative Text

Provide meaningful alt text for images:

```tsx
// ✅ Good - Descriptive alt text
<img src="chart.png" alt="Bar chart showing 50% increase in sales from Q1 to Q2" />

// ✅ Good - Decorative image
<img src="divider.png" alt="" role="presentation" />

// ❌ Bad - Generic alt text
<img src="chart.png" alt="Image" />

// ❌ Bad - Missing alt
<img src="chart.png" />
```

### 10. Heading Hierarchy

Maintain logical heading order:

```tsx
// ✅ Good - Logical hierarchy
<h1>Page Title</h1>
<h2>Section 1</h2>
<h3>Subsection 1.1</h3>
<h3>Subsection 1.2</h3>
<h2>Section 2</h2>

// ❌ Bad - Skipped levels
<h1>Page Title</h1>
<h4>Section</h4>
<h2>Another Section</h2>
```

---

## Common Patterns

### Modal Dialog

```tsx
import { AccessibleModal } from '@/components/accessibility';

function MyModal({ isOpen, onClose }) {
  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title="Modal Title"
    >
      <p>Modal content</p>
      <button onClick={onClose}>Close</button>
    </AccessibleModal>
  );
}
```

### Dropdown Menu

```tsx
function DropdownMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <div>
      <button
        ref={buttonRef}
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        Menu
      </button>
      {isOpen && (
        <ul role="menu">
          <li role="menuitem">
            <button onClick={handleAction1}>Action 1</button>
          </li>
          <li role="menuitem">
            <button onClick={handleAction2}>Action 2</button>
          </li>
        </ul>
      )}
    </div>
  );
}
```

### Tabs

```tsx
function Tabs({ tabs }) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div>
      <div role="tablist">
        {tabs.map((tab, index) => (
          <button
            key={index}
            role="tab"
            aria-selected={activeTab === index}
            aria-controls={`panel-${index}`}
            id={`tab-${index}`}
            onClick={() => setActiveTab(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, index) => (
        <div
          key={index}
          role="tabpanel"
          id={`panel-${index}`}
          aria-labelledby={`tab-${index}`}
          hidden={activeTab !== index}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
```

### Toast Notifications

```tsx
import { useAnnouncer } from '@/hooks/useAnnouncer';

function useToast() {
  const { announce } = useAnnouncer();

  const showToast = (message: string, type: 'success' | 'error') => {
    // Visual toast
    toast.show(message, type);

    // Screen reader announcement
    if (type === 'error') {
      announce(message, { politeness: 'assertive' });
    } else {
      announce(message, { politeness: 'polite', clearAfter: 5000 });
    }
  };

  return { showToast };
}
```

---

## Troubleshooting

### Issue: Focus not visible

**Solution:** Ensure focus styles are not being removed:

```css
/* ❌ Don't do this */
*:focus {
  outline: none;
}

/* ✅ Do this instead */
:focus-visible {
  outline: 2px solid #4f46e5;
  outline-offset: 2px;
}
```

### Issue: Screen reader not announcing changes

**Solution:** Use ARIA live regions:

```tsx
<div aria-live="polite" aria-atomic="true">
  {message}
</div>
```

### Issue: Keyboard trap

**Solution:** Ensure Tab works within components:

```tsx
// Use useFocusTrap hook for modals
// Verify focusable elements exist
// Test with Tab and Shift+Tab
```

### Issue: Form labels not associated

**Solution:** Use proper label association:

```tsx
// Method 1: For attribute
<label htmlFor="name">Name</label>
<input id="name" />

// Method 2: Wrapping
<label>
  Name
  <input />
</label>

// Method 3: ARIA
<input aria-label="Name" />
```

### Issue: Color contrast failures

**Solution:** Use WCAG-compliant colors:

```css
/* Check contrast ratio in DevTools */
/* Aim for 4.5:1 minimum for normal text */
/* Aim for 3:1 minimum for large text (18pt+) */
```

---

## Resources

### Documentation

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

### Tools

- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Color Contrast Analyzer](https://www.tpgi.com/color-contrast-checker/)

### Testing

- [Pa11y](https://pa11y.org/)
- [axe-core](https://github.com/dequelabs/axe-core)
- [Playwright Accessibility](https://playwright.dev/docs/accessibility-testing)

---

## Checklist

Before committing changes:

- [ ] Semantic HTML used where possible
- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible
- [ ] ARIA attributes correct
- [ ] Form inputs properly labeled
- [ ] Images have alt text
- [ ] Color contrast sufficient (4.5:1 minimum)
- [ ] Heading hierarchy logical
- [ ] Accessibility tests passing
- [ ] Manual screen reader test conducted
- [ ] Manual keyboard navigation test conducted

---

## Getting Help

For questions or issues:

- Check existing components in `/components/accessibility`
- Review test files in `/tests/accessibility`
- Consult WCAG 2.1 guidelines
- Ask in #accessibility Slack channel
- Email: dev-accessibility@example.com

---

**Remember:** Accessibility is not a feature to be added at the end; it's a fundamental part of good development practice. Build accessible from the start!
