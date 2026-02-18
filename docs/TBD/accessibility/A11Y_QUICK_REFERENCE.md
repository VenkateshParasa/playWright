# Accessibility Quick Reference Checklist

Quick checklist for developers to ensure accessibility compliance.

## Before Every Commit

- [ ] Run `npm run test:a11y`
- [ ] Run `npm run lint` (includes jsx-a11y rules)
- [ ] Test with keyboard only (no mouse)
- [ ] Check focus indicators are visible

## Component Development

### Buttons
- [ ] Use `<button>` or `AccessibleButton` component
- [ ] Provide visible label or `aria-label`
- [ ] Don't use `<div>` with `onClick` unless necessary
- [ ] Ensure 44×44px minimum size (mobile)
```tsx
// ✅ Good
<AccessibleButton onClick={handleClick}>Save</AccessibleButton>

// ❌ Bad
<div onClick={handleClick}>Save</div>
```

### Links
- [ ] Use `<a>` with valid `href`
- [ ] Link text describes destination
- [ ] Don't use "click here" or "read more" alone
```tsx
// ✅ Good
<a href="/learn-more">Learn more about accessibility</a>

// ❌ Bad
<a href="/learn-more">Click here</a>
```

### Forms
- [ ] Every input has a label
- [ ] Use `AccessibleInput` component
- [ ] Mark required fields
- [ ] Provide helpful error messages
- [ ] Use proper input types
```tsx
// ✅ Good
<AccessibleInput
  label="Email"
  type="email"
  required
  error={errors.email}
/>

// ❌ Bad
<input type="text" placeholder="Email" />
```

### Images
- [ ] All images have `alt` attribute
- [ ] Alt text describes image content
- [ ] Decorative images: `alt=""` or `aria-hidden="true"`
```tsx
// ✅ Good - Content image
<img src="chart.png" alt="Sales increased 50% from Q1 to Q2" />

// ✅ Good - Decorative
<img src="divider.png" alt="" role="presentation" />

// ❌ Bad
<img src="chart.png" />
```

### Headings
- [ ] Start with `<h1>` (one per page)
- [ ] Don't skip heading levels
- [ ] Use headings for structure, not styling
```tsx
// ✅ Good
<h1>Page Title</h1>
<h2>Section</h2>
<h3>Subsection</h3>

// ❌ Bad
<h1>Page Title</h1>
<h4>Section</h4>
```

### Modals/Dialogs
- [ ] Use `AccessibleModal` component
- [ ] Include close button
- [ ] Support Escape key
- [ ] Trap focus inside modal
- [ ] Return focus on close
```tsx
// ✅ Good
<AccessibleModal
  isOpen={isOpen}
  onClose={onClose}
  title="Modal Title"
>
  Content
</AccessibleModal>
```

### Dynamic Content
- [ ] Use `LiveRegion` for announcements
- [ ] Announce loading states
- [ ] Announce errors
- [ ] Announce success messages
```tsx
// ✅ Good
const { announceError, announceSuccess } = useAnnouncer();

try {
  await saveData();
  announceSuccess('Data saved successfully');
} catch (error) {
  announceError('Failed to save data');
}
```

## Keyboard Navigation

- [ ] All interactive elements reachable via Tab
- [ ] Logical tab order
- [ ] Focus indicators visible
- [ ] Support Escape key in dialogs
- [ ] Support arrow keys in menus/lists
- [ ] Add skip links on pages

```tsx
// ✅ Add skip links
<SkipLink href="#main-content">Skip to main content</SkipLink>

// ✅ Keyboard shortcuts
useKeyboardNavigation([
  {
    key: 'Escape',
    handler: closeModal
  }
]);
```

## ARIA Usage

- [ ] Use semantic HTML first
- [ ] ARIA only when HTML insufficient
- [ ] Valid ARIA roles
- [ ] Required ARIA attributes present
- [ ] No redundant ARIA

```tsx
// ✅ Good - Semantic HTML
<button>Click me</button>

// ⚠️ Acceptable - When necessary
<div role="button" tabIndex={0} onClick={...} onKeyDown={...}>
  Custom button
</div>

// ❌ Bad - Redundant ARIA
<button role="button">Click me</button>
```

## Color & Contrast

- [ ] Contrast ratio ≥ 4.5:1 (normal text)
- [ ] Contrast ratio ≥ 3:1 (large text, 18pt+)
- [ ] Don't convey info by color alone
- [ ] Test with color blind simulation

Tools: Chrome DevTools, axe DevTools

## Responsive & Mobile

- [ ] Touch targets ≥ 44×44px
- [ ] Works in portrait & landscape
- [ ] Text readable without zoom
- [ ] No horizontal scroll at 320px width

## Testing Checklist

### Automated
```bash
npm run test:a11y
npm run lint
npm run lighthouse
```

### Manual
- [ ] Tab through entire page
- [ ] Test with screen reader (NVDA/VoiceOver)
- [ ] Zoom to 200%
- [ ] Test with keyboard only
- [ ] Check focus indicators
- [ ] Test on mobile device

### Browser Extensions
- [ ] Run axe DevTools scan
- [ ] Run WAVE evaluation
- [ ] Check Lighthouse accessibility score

## Common Mistakes to Avoid

### ❌ Don't Do This

1. `<div onClick={...}>` without role/tabindex
2. `<input>` without label
3. `<img>` without alt attribute
4. Using color alone to convey information
5. `outline: none` without alternative focus style
6. `<div>` for clickable elements
7. Empty link text: `<a href="...">Click here</a>`
8. Skipping heading levels
9. Using placeholder as label
10. Not testing with keyboard

### ✅ Do This Instead

1. Use `<button>` or add proper ARIA
2. Use `<AccessibleInput>` with label prop
3. Always include meaningful alt text
4. Use icons + text labels
5. Provide visible focus indicators
6. Use `<button>` or `<a>`
7. Descriptive link text
8. Logical heading hierarchy
9. Separate label element
10. Test regularly with keyboard only

## Quick Fixes

### Missing Alt Text
```tsx
// Before
<img src="logo.png" />

// After
<img src="logo.png" alt="Company Logo" />
```

### Missing Label
```tsx
// Before
<input type="email" placeholder="Email" />

// After
<AccessibleInput label="Email" type="email" />
```

### Poor Focus Indicator
```tsx
// Before (in CSS)
button:focus { outline: none; }

// After
button:focus-visible {
  outline: 2px solid #4f46e5;
  outline-offset: 2px;
}
```

### Click Without Keyboard
```tsx
// Before
<div onClick={handleClick}>Click me</div>

// After
<AccessibleButton onClick={handleClick}>Click me</AccessibleButton>
```

### Missing Live Region
```tsx
// Before
{error && <p>{error}</p>}

// After
{error && <p role="alert">{error}</p>}
```

## Code Review Checklist

When reviewing PRs, verify:

- [ ] Semantic HTML used
- [ ] Interactive elements keyboard accessible
- [ ] Forms properly labeled
- [ ] ARIA used appropriately (not overused)
- [ ] Color contrast sufficient
- [ ] Alt text on images
- [ ] Focus management correct
- [ ] Heading hierarchy logical
- [ ] Tests pass
- [ ] No accessibility warnings in console

## Resources

- **Components:** `/frontend/src/components/accessibility/`
- **Hooks:** `/frontend/src/hooks/`
- **Styles:** `/frontend/src/styles/accessibility.css`
- **Tests:** `/tests/accessibility/`
- **Docs:** `/docs/A11Y_*.md`

## Getting Help

- **Guide:** [A11Y_IMPLEMENTATION.md](./docs/A11Y_IMPLEMENTATION.md)
- **Setup:** [A11Y_SETUP_GUIDE.md](./docs/A11Y_SETUP_GUIDE.md)
- **Audit:** [A11Y_AUDIT_REPORT.md](./docs/A11Y_AUDIT_REPORT.md)
- **Email:** accessibility@example.com
- **Slack:** #accessibility

---

**Print this and keep it at your desk!**

Quick keyboard test: Tab through your page. Can you reach and activate everything?
