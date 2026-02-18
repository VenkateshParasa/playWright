# Lesson Player - Quick Start Guide

## Installation

The lesson player uses existing dependencies in the project:

```bash
cd frontend
npm install
```

Dependencies used:
- `react-markdown` - For markdown rendering
- `lucide-react` - For icons
- `react-router-dom` - For routing

## Basic Usage

### 1. View a Lesson

Navigate to `/lessons/:lessonId` to view a lesson:

```tsx
import { Link } from 'react-router-dom';

<Link to="/lessons/lesson-1">View Introduction to Playwright</Link>
```

### 2. Import Components

```tsx
// Import individual components
import {
  LessonPlayer,
  LessonContent,
  CodeExample,
  TableOfContents,
  LessonNavigation,
  LessonProgress,
} from '../components/lessons';

// Or import from index
import { LessonPlayer } from '../components/lessons';
```

### 3. Use Utility Functions

```tsx
import {
  calculateReadingTime,
  saveLessonProgress,
  loadLessonProgress,
  initializeDarkMode,
} from '../lib/utils/lessonUtils';

// Calculate reading time
const readingTime = calculateReadingTime(markdownContent);
console.log(readingTime.text); // "12 min read"

// Save progress
saveLessonProgress('lesson-1', {
  completed: true,
  bookmarked: false,
  timeSpent: 720, // seconds
  lastAccessedAt: new Date().toISOString(),
});

// Initialize dark mode
initializeDarkMode();
```

## Creating Lesson Content

### Markdown Format

Create lesson content in markdown format:

```markdown
# Lesson Title

## Introduction

Your introduction text here.

## Main Content

### Subsection

More content here.

## Code Examples

\`\`\`typescript
import { test } from '@playwright/test';

test('example', async ({ page }) => {
  await page.goto('https://example.com');
});
\`\`\`

## Summary

Key takeaways...

## Resources

- [Link 1](https://example.com)
- [Link 2](https://example.com)
```

### Supported Markdown Features

- **Headings**: `# H1` through `###### H6`
- **Bold**: `**bold text**`
- **Italic**: `*italic text*`
- **Code blocks**: Triple backticks with language
- **Inline code**: Single backticks
- **Links**: `[text](url)`
- **Images**: `![alt](url)`
- **Lists**: Ordered and unordered
- **Blockquotes**: `> quote`
- **Tables**: GitHub Flavored Markdown tables
- **Horizontal rules**: `---`

### Code Block Example

````markdown
```typescript
// Example TypeScript code
const greeting: string = "Hello, World!";
console.log(greeting);
```
````

### Highlighting Lines

To highlight specific lines (requires custom implementation):

````markdown
```typescript {2,4-6}
const items = [1, 2, 3];
const doubled = items.map(x => x * 2); // Highlighted
const result = doubled.reduce((a, b) => a + b);
const average = result / items.length; // Highlighted
const formatted = average.toFixed(2); // Highlighted
console.log(formatted); // Highlighted
```
````

## Keyboard Shortcuts

Users can navigate lessons using these shortcuts:

| Shortcut | Action |
|----------|--------|
| `←` | Previous lesson |
| `→` | Next lesson |
| `Ctrl/Cmd + B` | Toggle bookmark |
| `Ctrl/Cmd + M` | Mark as complete |
| `Esc` | Back to lessons list |

## Styling

### Import Styles

Add to your main CSS file:

```css
@import './styles/lesson-player.css';
```

### Dark Mode

The lesson player automatically supports dark mode:

```tsx
// Toggle dark mode
import { toggleDarkMode } from '../lib/utils/lessonUtils';

<button onClick={toggleDarkMode}>
  Toggle Dark Mode
</button>
```

### Custom Styling

Override styles using Tailwind classes or custom CSS:

```tsx
<LessonPlayer
  className="custom-lesson-player"
  // ... other props
/>
```

```css
.custom-lesson-player {
  max-width: 1400px;
  margin: 0 auto;
}
```

## API Integration

Replace mock data with real API calls:

### Fetch Lesson

```typescript
async function fetchLesson(lessonId: string) {
  const response = await fetch(`/api/lessons/${lessonId}`);
  return response.json();
}
```

### Fetch Content

```typescript
async function fetchLessonContent(lessonId: string) {
  const response = await fetch(`/api/lessons/${lessonId}/content`);
  return response.text();
}
```

### Update Progress

```typescript
async function updateProgress(lessonId: string, data: {
  completed: boolean;
  timeSpent: number;
}) {
  await fetch(`/api/progress/lessons/${lessonId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}
```

### Save Bookmark

```typescript
async function toggleBookmark(lessonId: string, bookmarked: boolean) {
  const method = bookmarked ? 'POST' : 'DELETE';
  await fetch(`/api/bookmarks/lessons/${lessonId}`, { method });
}
```

## TypeScript Types

All components are fully typed. Import types:

```typescript
import type {
  Lesson,
  LessonContentType,
  LessonNavigationType,
  TableOfContentsItem,
  CodeExampleType,
  LessonPosition,
  LessonBookmark,
} from '../types/lesson.types';
```

## Testing

### Component Testing

```tsx
import { render, screen } from '@testing-library/react';
import { LessonContent } from '../components/lessons';

test('renders markdown content', () => {
  const markdown = '# Hello World';
  render(<LessonContent content={markdown} />);
  expect(screen.getByText('Hello World')).toBeInTheDocument();
});
```

### E2E Testing with Playwright

```typescript
import { test, expect } from '@playwright/test';

test('complete lesson flow', async ({ page }) => {
  await page.goto('/lessons/lesson-1');

  // Check content loads
  await expect(page.locator('h1')).toContainText('Introduction');

  // Mark as complete
  await page.click('button:has-text("Mark as Complete")');
  await expect(page.locator('text=Completed')).toBeVisible();

  // Navigate to next lesson
  await page.click('button:has-text("Next Lesson")');
  await expect(page).toHaveURL(/lesson-2/);
});
```

## Performance Tips

1. **Lazy Load Images**: Already implemented with `loading="lazy"`
2. **Code Splitting**: Use dynamic imports for lessons
3. **Memoization**: Wrap expensive calculations in `useMemo`
4. **Virtual Scrolling**: For very long lessons
5. **Cache Content**: Use service workers to cache lesson content

## Troubleshooting

### Content Not Loading

Check the fetch path matches your content location:

```typescript
const response = await fetch('/src/data/lessons/sample-lesson-1.md');
```

### Dark Mode Not Working

Ensure Tailwind is configured for dark mode:

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class', // or 'media'
  // ... rest of config
}
```

### Styles Not Applied

Import the CSS file in your main entry point:

```typescript
// main.tsx
import './styles/lesson-player.css';
```

### TypeScript Errors

Make sure all types are properly imported:

```typescript
import type { Lesson } from '../types/lesson.types';
```

## Examples

### Minimal Lesson Page

```tsx
import { LessonPlayer } from '../components/lessons';

export default function MinimalLesson() {
  const lesson = {
    id: 'test-lesson',
    title: 'Test Lesson',
    description: 'A test lesson',
    // ... other required fields
  };

  const content = {
    id: 'content-1',
    lessonId: 'test-lesson',
    content: '# Hello\n\nThis is a test lesson.',
    resources: [],
    codeExamples: [],
  };

  const navigation = {
    currentIndex: 1,
    totalLessons: 1,
  };

  return (
    <LessonPlayer
      lesson={lesson}
      lessonContent={content}
      navigation={navigation}
      isCompleted={false}
      isBookmarked={false}
      timeSpent={0}
      onMarkComplete={() => {}}
      onToggleBookmark={() => {}}
      onUpdateTime={() => {}}
    />
  );
}
```

### Custom Code Block

```tsx
import { CodeExample } from '../components/lessons';

export default function MyComponent() {
  return (
    <CodeExample
      code={`const greeting = "Hello, World!";
console.log(greeting);`}
      language="typescript"
      title="Greeting Example"
      filename="greeting.ts"
      showLineNumbers={true}
      highlightLines={[2]}
    />
  );
}
```

## Resources

- [React Markdown Documentation](https://github.com/remarkjs/react-markdown)
- [Lucide Icons](https://lucide.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Support

For issues or questions:
1. Check the implementation documentation
2. Review the sample lessons
3. Examine component prop types
4. Test with the provided mock data
