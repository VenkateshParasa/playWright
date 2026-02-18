# Lesson Content Guide

## Overview

This guide explains the structure of lesson content for the Playwright & Selenium Learning Platform. All lessons are stored as JSON files following a consistent schema.

## Directory Structure

```
backend/data/lessons/
├── index.json                 # Master index of all lessons
├── curriculum.json            # Learning paths and progression
├── playwright/
│   ├── beginner/
│   │   ├── lesson-001.json
│   │   ├── lesson-002.json
│   │   └── ... (10 lessons total)
│   ├── intermediate/
│   │   └── ... (10 lessons)
│   └── advanced/
│       └── ... (10 lessons)
└── selenium/
    ├── beginner/
    │   └── ... (10 lessons)
    ├── intermediate/
    │   └── ... (10 lessons)
    └── advanced/
        └── ... (10 lessons)
```

## Lesson JSON Schema

Each lesson follows this structure:

```json
{
  "id": "string",              // Unique identifier (e.g., "pw-beginner-001")
  "title": "string",           // Lesson title
  "slug": "string",            // URL-friendly slug
  "track": "string",           // "playwright" or "selenium"
  "category": "string",        // "beginner", "intermediate", or "advanced"
  "order": number,             // Lesson order within category (1-10)
  "duration": number,          // Estimated minutes to complete
  "description": "string",     // Short description (1-2 sentences)
  "objectives": ["string"],    // Learning objectives (3-5 items)
  "prerequisites": ["string"], // Required lesson IDs (empty for first lesson)
  "content": {
    "sections": [              // Array of content sections
      {
        "title": "string",
        "type": "text|code|video",
        "content": "string",   // For text sections (Markdown supported)
        "language": "string",  // For code sections (typescript, java, python)
        "code": "string",      // For code sections
        "explanation": "string", // For code sections
        "url": "string",       // For video sections
        "duration": number     // For video sections (seconds)
      }
    ]
  },
  "keyTakeaways": ["string"],  // 5-7 key points
  "resources": [               // External resources
    {
      "title": "string",
      "url": "string",
      "type": "documentation|video|article|tool"
    }
  ],
  "quiz": "string",           // Quiz ID (if applicable)
  "nextLesson": "string",     // Next lesson ID (null for last lesson)
  "estimatedXP": number,      // XP earned upon completion
  "tags": ["string"]          // Searchable tags
}
```

## Field Descriptions

### Required Fields

- **id**: Unique identifier following pattern: `{track-prefix}-{category}-{order:03d}`
  - Playwright: `pw-beginner-001`, `pw-intermediate-005`, `pw-advanced-010`
  - Selenium: `sel-beginner-001`, `sel-intermediate-005`, `sel-advanced-010`

- **title**: Clear, descriptive title (e.g., "Introduction to Playwright")

- **slug**: URL-friendly version of title (lowercase, hyphens, e.g., "introduction-to-playwright")

- **track**: Either "playwright" or "selenium"

- **category**: One of "beginner", "intermediate", or "advanced"

- **order**: Number 1-10 indicating position within category

- **duration**: Estimated completion time in minutes
  - Beginner: 15-30 minutes
  - Intermediate: 25-35 minutes
  - Advanced: 30-45 minutes

### Content Structure

#### Text Sections

Text sections support Markdown and should include:

```json
{
  "title": "Understanding Locators",
  "type": "text",
  "content": "# Heading\n\nParagraph text with **bold** and *italic*.\n\n## Subheading\n\n- Bullet point 1\n- Bullet point 2"
}
```

**Best Practices**:
- Use headers (# ## ###) to structure content
- Include bullet points for lists
- Use code blocks for inline code: \`locator.click()\`
- Keep paragraphs concise (3-5 sentences)
- Add visual hierarchy with proper heading levels

#### Code Sections

Code sections demonstrate practical examples:

```json
{
  "title": "Basic Navigation",
  "type": "code",
  "language": "typescript",
  "code": "import { test } from '@playwright/test';\n\ntest('navigate', async ({ page }) => {\n  await page.goto('https://example.com');\n});",
  "explanation": "This example shows how to navigate to a URL using Playwright."
}
```

**Best Practices**:
- Include import statements for context
- Add comments explaining complex parts
- Show complete, runnable examples
- Provide explanation field for learning context
- Use proper language: "typescript", "javascript", "java", "python"

#### Video Sections (Optional)

```json
{
  "title": "Video Tutorial",
  "type": "video",
  "url": "https://example.com/video.mp4",
  "duration": 300
}
```

### Objectives

Learning objectives should be:
- **Specific**: "Learn how to use CSS selectors" not "Learn selectors"
- **Actionable**: Use verbs like "Create", "Implement", "Master", "Understand"
- **Measurable**: Student should know if they achieved it
- **3-5 items** per lesson

Example:
```json
"objectives": [
  "Understand what Playwright is and its core capabilities",
  "Learn the benefits of using Playwright for test automation",
  "Compare Playwright with other testing tools",
  "Identify use cases where Playwright excels"
]
```

### Prerequisites

- Array of lesson IDs that must be completed first
- Empty array `[]` for first lesson in track
- Previous lesson for sequential lessons
- Can reference lessons from previous categories

Examples:
```json
// First lesson
"prerequisites": []

// Sequential lesson
"prerequisites": ["pw-beginner-001"]

// First lesson of new category
"prerequisites": ["pw-beginner-010"]

// Multiple prerequisites
"prerequisites": ["pw-beginner-005", "pw-beginner-006"]
```

### Key Takeaways

5-7 bullet points summarizing the lesson:

```json
"keyTakeaways": [
  "Playwright is a modern, open-source automation framework developed by Microsoft",
  "It supports testing across Chromium, Firefox, and WebKit with a single API",
  "Auto-waiting capability eliminates most timing issues and reduces flaky tests",
  "Playwright excels at testing modern web applications built with JavaScript frameworks",
  "Browser contexts enable fast, isolated test execution without launching new browsers"
]
```

**Best Practices**:
- Start with most important concepts
- Keep each point concise (1-2 sentences)
- Focus on practical takeaways
- Use specific, not generic, statements

### Resources

External links for further learning:

```json
"resources": [
  {
    "title": "Official Playwright Documentation",
    "url": "https://playwright.dev",
    "type": "documentation"
  },
  {
    "title": "Playwright GitHub Repository",
    "url": "https://github.com/microsoft/playwright",
    "type": "repository"
  }
]
```

**Resource Types**:
- `documentation`: Official docs, API references
- `video`: Video tutorials, conference talks
- `article`: Blog posts, guides
- `tool`: Testing tools, utilities
- `repository`: GitHub repos, code examples

### Tags

Searchable keywords:

```json
"tags": ["playwright", "introduction", "basics", "overview", "getting-started"]
```

**Best Practices**:
- Include track name
- Include category level
- Add topic-specific keywords
- Use lowercase, hyphenated terms
- 4-6 tags per lesson

## Content Quality Guidelines

### Length

- **Text Sections**: 500-1500 words total per lesson
- **Code Examples**: 2-5 examples per lesson
- **Sections**: 4-7 sections per lesson

### Writing Style

1. **Clear and Concise**: Avoid jargon, explain technical terms
2. **Practical**: Include real-world examples and use cases
3. **Progressive**: Build on previous lessons
4. **Engaging**: Use examples students can relate to
5. **Structured**: Use headers, bullet points, code blocks

### Code Examples

1. **Complete**: Show full, runnable code
2. **Commented**: Explain non-obvious parts
3. **Realistic**: Use real-world scenarios
4. **Error-free**: Test all code examples
5. **Formatted**: Proper indentation and style

### Common Patterns

#### Introduction Section

Every lesson should start with:
- What you'll learn
- Why it's important
- How it fits into the bigger picture

```markdown
# Introduction to [Topic]

[Topic] is essential for [reason]. In this lesson, you'll learn [objectives].

By mastering [topic], you'll be able to [benefits].
```

#### Code Example Pattern

```json
{
  "title": "Practical Example",
  "type": "code",
  "language": "typescript",
  "code": "// Import required modules\nimport { test, expect } from '@playwright/test';\n\n// Test case\ntest('descriptive test name', async ({ page }) => {\n  // Arrange - Set up\n  await page.goto('https://example.com');\n  \n  // Act - Perform action\n  await page.click('button');\n  \n  // Assert - Verify result\n  await expect(page).toHaveURL('/success');\n});",
  "explanation": "This example demonstrates [concept]. Notice how [key point]."
}
```

#### Best Practices Section

Include a section on best practices:

```markdown
## Best Practices

1. **Always [do this]**: Because [reason]
2. **Avoid [this pattern]**: It leads to [problem]
3. **Prefer [this approach]**: It's more [benefit]
```

## Adding New Lessons

### Step 1: Determine Lesson Details

- Choose track (Playwright or Selenium)
- Choose category (beginner/intermediate/advanced)
- Assign order number (1-10)
- Create unique ID following naming convention

### Step 2: Create Lesson File

Create a new JSON file in the appropriate directory:

```bash
backend/data/lessons/{track}/{category}/lesson-{order:03d}.json
```

### Step 3: Write Content

Follow the schema and guidelines above to create high-quality content.

### Step 4: Update Index

Add entry to `index.json`:

```json
{
  "id": "new-lesson-id",
  "title": "Lesson Title",
  "slug": "lesson-slug",
  "track": "playwright",
  "category": "beginner",
  "order": 11,
  // ... other fields
}
```

### Step 5: Update Curriculum (if needed)

If creating a new learning path, update `curriculum.json`.

## Lesson Progression

### Beginner Track (Lessons 1-10)

Focus on fundamentals:
- Installation and setup
- Basic concepts
- Simple examples
- Core features
- Essential patterns

### Intermediate Track (Lessons 11-20)

Advanced features:
- Complex scenarios
- Advanced patterns
- Integration techniques
- Performance optimization
- Real-world applications

### Advanced Track (Lessons 21-30)

Expert techniques:
- Framework design
- CI/CD integration
- Custom solutions
- Best practices
- Professional patterns

## XP Values

Experience points awarded per lesson:

- **Beginner**: 100-200 XP
- **Intermediate**: 150-250 XP
- **Advanced**: 200-300 XP

Factors affecting XP:
- Lesson complexity
- Code examples included
- Practical exercises
- Length and depth

## Quality Checklist

Before submitting a new lesson:

- [ ] All required fields are present
- [ ] JSON is valid and properly formatted
- [ ] Code examples are tested and work
- [ ] Links in resources are valid
- [ ] Markdown formatting is correct
- [ ] Content is 500-1500 words
- [ ] 2-5 code examples included
- [ ] 5-7 key takeaways listed
- [ ] Tags are relevant and lowercase
- [ ] Prerequisites are accurate
- [ ] Next lesson link is correct
- [ ] Objectives are specific and actionable
- [ ] No spelling or grammar errors

## Examples

### Good Lesson Title

✅ "Introduction to Playwright"
✅ "Advanced Locators (CSS, XPath, nth, has)"
✅ "CI/CD Integration"

❌ "Lesson 1"
❌ "Testing"
❌ "How to use Playwright for testing your application"

### Good Objectives

✅ "Create page object classes for web pages"
✅ "Implement retry logic to handle flaky tests"
✅ "Configure Playwright for multiple environments"

❌ "Learn about page objects"
❌ "Understand testing"
❌ "Know how to write tests"

### Good Code Example

```typescript
// ✅ Good - Complete, commented, realistic
import { test, expect } from '@playwright/test';

test('user can login successfully', async ({ page }) => {
  // Navigate to login page
  await page.goto('/login');

  // Fill in credentials
  await page.fill('[name="email"]', 'user@example.com');
  await page.fill('[name="password"]', 'password123');

  // Submit form
  await page.click('button[type="submit"]');

  // Verify successful login
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('.welcome')).toBeVisible();
});
```

```typescript
// ❌ Bad - Incomplete, no context
page.goto('/login');
page.click('button');
```

## Maintenance

### Updating Lessons

When updating existing lessons:

1. Increment the version in metadata (if tracked)
2. Update `lastUpdated` timestamp
3. Test all code examples still work
4. Check all external links are still valid
5. Update prerequisites if lesson order changes

### Deprecating Lessons

If a lesson becomes outdated:

1. Mark as deprecated in metadata
2. Add warning in lesson content
3. Point to replacement lesson
4. Don't delete immediately (for backwards compatibility)

## Support

For questions or issues with lesson content:

1. Check this guide first
2. Review existing lessons for examples
3. Consult the JSON schema
4. Reach out to content maintainers

## Version History

- **v1.0.0** (2026-02-17): Initial lesson content structure
  - 60 lessons created (30 Playwright, 30 Selenium)
  - Established content guidelines
  - Created index and curriculum structure
