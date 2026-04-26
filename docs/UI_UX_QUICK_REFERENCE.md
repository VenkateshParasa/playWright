# UI/UX Quick Reference Guide

Quick reference for developers working with the improved UI/UX system.

## Design Tokens

### Colors
```css
/* Primary Actions */
bg-indigo-600 text-white          /* Primary buttons */
bg-indigo-50 text-indigo-700      /* Primary badges */

/* Success States */
bg-green-600 text-white           /* Success buttons */
bg-green-50 text-green-700        /* Success badges */

/* Warning States */
bg-amber-600 text-white           /* Warning buttons */
bg-amber-50 text-amber-700        /* Warning badges */

/* Error States */
bg-red-600 text-white             /* Error buttons */
bg-red-50 text-red-700            /* Error badges */

/* Neutral */
bg-gray-100 text-gray-700         /* Secondary buttons */
bg-white text-gray-900            /* Cards */
```

### Spacing
```css
gap-3 md:gap-4                    /* Grid gaps */
p-4 md:p-6                        /* Card padding */
mb-6 md:mb-8                      /* Section margins */
```

### Typography
```css
text-3xl md:text-4xl font-bold    /* Page headings */
text-2xl md:text-3xl font-bold    /* Section headings */
text-lg font-semibold             /* Card titles */
text-sm text-gray-600             /* Meta text */
```

## Component Classes

### Buttons
```tsx
// Primary action
<button className="btn btn-primary">
  Submit
</button>

// Secondary action
<button className="btn btn-secondary">
  Cancel
</button>

// Ghost/transparent
<button className="btn btn-ghost">
  Close
</button>
```

### Cards
```tsx
// Basic card
<div className="card">
  Content
</div>

// Card with hover effect
<div className="card-hover">
  Content
</div>
```

### Inputs
```tsx
<input
  type="text"
  className="input"
  placeholder="Enter text"
/>
```

### Links
```tsx
<a href="/path" className="link">
  Link text
</a>
```

## Animations

### Page Transitions
```tsx
<div className="animate-fadeIn">
  Page content
</div>
```

### Slide Animations
```tsx
// Slide up from bottom
<div className="animate-slideUp">
  Content
</div>

// Slide down from top
<div className="animate-slideDown">
  Content
</div>
```

### Scale Animation
```tsx
<div className="animate-scaleIn">
  Content
</div>
```

### Hover Effects
```tsx
// Translate on hover
<button className="group">
  <span className="group-hover:translate-x-1 transition-transform">
    →
  </span>
</button>

// Scale on hover
<div className="hover:scale-105 transition-transform">
  Content
</div>
```

## Accessibility Patterns

### Loading States
```tsx
<div role="status" aria-live="polite">
  <div className="animate-spin" aria-hidden="true">
    {/* Spinner */}
  </div>
  <p>Loading...</p>
  <span className="sr-only">Loading content, please wait</span>
</div>
```

### Error States
```tsx
<div role="alert" aria-live="assertive">
  <h2>Error Title</h2>
  <p>{errorMessage}</p>
  <button aria-label="Retry loading">
    Retry
  </button>
</div>
```

### Navigation
```tsx
<nav aria-label="Main navigation">
  <button
    aria-expanded={isOpen}
    aria-controls="menu-id"
    aria-label="Toggle menu"
  >
    Menu
  </button>
</nav>
```

### Tabs
```tsx
<div role="tablist" aria-label="Content tabs">
  <button
    role="tab"
    aria-selected={isActive}
    aria-controls="panel-id"
  >
    Tab 1
  </button>
</div>
<div
  id="panel-id"
  role="tabpanel"
  aria-label="Tab 1 content"
>
  Content
</div>
```

### Sections
```tsx
<section aria-labelledby="heading-id">
  <h2 id="heading-id">Section Title</h2>
  <p>Content</p>
</section>
```

## Responsive Patterns

### Grid Layouts
```tsx
// 1 column mobile, 2 tablet, 3 desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id} />)}
</div>

// 2 columns mobile, 4 desktop
<div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
  {stats.map(stat => <Stat key={stat.id} />)}
</div>
```

### Flex Layouts
```tsx
// Stack on mobile, row on desktop
<div className="flex flex-col md:flex-row gap-4">
  <div>Left</div>
  <div>Right</div>
</div>

// Wrap items
<div className="flex flex-wrap gap-3">
  {tags.map(tag => <Badge key={tag} />)}
</div>
```

### Text Sizing
```tsx
<h1 className="text-3xl md:text-4xl lg:text-5xl">
  Responsive Heading
</h1>

<p className="text-base md:text-lg">
  Responsive paragraph
</p>
```

### Spacing
```tsx
<div className="p-4 md:p-6 lg:p-8">
  Responsive padding
</div>

<div className="mb-6 md:mb-8 lg:mb-10">
  Responsive margin
</div>
```

## Icon Patterns

### With Text
```tsx
<button className="flex items-center gap-2">
  <svg className="w-4 h-4" aria-hidden="true">
    {/* Icon */}
  </svg>
  Button Text
</button>
```

### Icon Only
```tsx
<button aria-label="Close dialog">
  <svg className="w-5 h-5" aria-hidden="true">
    {/* Icon */}
  </svg>
</button>
```

### Decorative
```tsx
<div>
  <span className="text-2xl" aria-hidden="true">
    💡
  </span>
  <p>Content</p>
</div>
```

## Common Patterns

### Card with Hover
```tsx
<Link
  to="/path"
  className="card-hover group"
>
  <h3 className="group-hover:text-indigo-600 transition-colors">
    Title
  </h3>
  <p>Description</p>
</Link>
```

### Badge
```tsx
<span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium">
  Badge Text
</span>
```

### Section Header
```tsx
<h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center">
  <span className="w-1 h-8 bg-indigo-600 rounded-full mr-3"></span>
  Section Title
</h2>
```

### Empty State
```tsx
<div className="text-center py-16 bg-white rounded-lg shadow-soft">
  <div className="text-gray-400 text-6xl mb-4" aria-hidden="true">
    📚
  </div>
  <h3 className="text-xl font-semibold text-gray-900 mb-2">
    No Items Found
  </h3>
  <p className="text-gray-600">
    Description of empty state
  </p>
</div>
```

### Loading Spinner
```tsx
<div className="flex items-center justify-center min-h-[60vh]">
  <div className="text-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
    <p className="mt-4 text-gray-600">Loading...</p>
  </div>
</div>
```

## Testing Checklist

### Accessibility
- [ ] All interactive elements have proper ARIA labels
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Focus indicators are visible
- [ ] Screen reader announces content correctly
- [ ] Color contrast meets WCAG AA (4.5:1)

### Responsive
- [ ] Works on mobile (< 640px)
- [ ] Works on tablet (640px - 1024px)
- [ ] Works on desktop (> 1024px)
- [ ] Touch targets are 44x44px minimum
- [ ] Text is readable at all sizes

### Performance
- [ ] Animations respect reduced motion
- [ ] No layout shift on load
- [ ] Images are optimized
- [ ] CSS is purged in production

## Common Mistakes to Avoid

❌ **Don't:**
```tsx
// Non-semantic HTML
<div onClick={handleClick}>Click me</div>

// Missing ARIA labels
<button>
  <svg>{/* Icon */}</svg>
</button>

// Hardcoded colors
<div className="bg-[#4f46e5]">Content</div>

// No responsive design
<div className="grid grid-cols-3">Items</div>
```

✅ **Do:**
```tsx
// Semantic HTML
<button onClick={handleClick}>Click me</button>

// Proper ARIA labels
<button aria-label="Close dialog">
  <svg aria-hidden="true">{/* Icon */}</svg>
</button>

// Design system colors
<div className="bg-indigo-600">Content</div>

// Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  Items
</div>
```

## Resources

- Full documentation: [`docs/UI_UX_IMPROVEMENTS.md`](./UI_UX_IMPROVEMENTS.md)
- Tailwind docs: https://tailwindcss.com/docs
- ARIA patterns: https://www.w3.org/WAI/ARIA/apg/patterns/

---

**Quick Tip**: Use browser DevTools to test responsive design and accessibility features!