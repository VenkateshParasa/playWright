# Content Editor System - User Guide

## Overview

The Content Editor System is a comprehensive content management solution for the Playwright & Selenium Learning Platform. It allows administrators to create, edit, and manage lessons, quizzes, exercises, and flashcards with a rich editing experience.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Installation](#installation)
3. [Content Types](#content-types)
4. [Editor Features](#editor-features)
5. [Workflow Guide](#workflow-guide)
6. [API Reference](#api-reference)
7. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites

- Admin access to the platform
- Modern web browser (Chrome, Firefox, Safari, or Edge)
- Basic understanding of Markdown (for lesson content)

### Accessing the Content Editor

1. Log in with your admin credentials
2. Navigate to `/admin/content` or click "Content Management" in the admin menu
3. You'll see a list of all existing content

---

## Installation

### Frontend Dependencies

Install the required dependencies for the Content Editor:

```bash
cd frontend
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-code-block-lowlight @tiptap/extension-image @tiptap/extension-link @tiptap/extension-placeholder lowlight react-dropzone
```

### Backend Dependencies

Install multer for file uploads:

```bash
cd backend
npm install multer @types/multer
```

### Create Upload Directory

```bash
mkdir -p backend/uploads/media
```

---

## Content Types

### 1. Lessons

**Purpose:** Text-based educational content with markdown support

**Key Features:**
- Rich markdown editor with live preview
- Learning objectives
- Prerequisites linking
- Category and tag organization
- Media upload support
- Version history
- Track assignment (30-day/60-day/both)

**Best Practices:**
- Keep lessons focused on a single topic
- Include 3-5 learning objectives
- Use code examples with proper syntax highlighting
- Add images to illustrate complex concepts
- Link prerequisite lessons for learning paths

### 2. Quizzes

**Purpose:** Assessment and knowledge validation

**Key Features:**
- Multiple choice questions (single/multiple answers)
- True/False questions
- Rich text questions with images
- Configurable time limits and passing scores
- Detailed explanations for answers
- Question randomization
- Retry options

**Best Practices:**
- Write clear, unambiguous questions
- Provide comprehensive explanations
- Mix difficulty levels
- Aim for 5-10 questions per quiz
- Set reasonable time limits (1-2 minutes per question)

### 3. Exercises

**Purpose:** Hands-on coding challenges

**Key Features:**
- Monaco code editor integration
- Multiple language support (TypeScript, JavaScript, Java)
- Starter code templates
- Solution code
- Test case management
- Progressive hints system
- Hidden test cases for validation

**Best Practices:**
- Provide clear problem descriptions
- Include edge cases in test cases
- Add at least 3-5 test cases
- Progressive hints (start with high-level, get more specific)
- Include both visible and hidden test cases

### 4. Flashcards

**Purpose:** Spaced repetition learning and memorization

**Key Features:**
- Simple front/back card format
- Bulk import from JSON
- Export to JSON
- Category and tag organization
- Difficulty levels

**Best Practices:**
- Keep cards concise (one concept per card)
- Use clear, direct language
- Group related cards into decks
- Use bulk import for large sets
- Export regularly for backup

---

## Editor Features

### Markdown Editor (Lessons)

#### Toolbar Features

- **Text Formatting:** Bold, Italic, Inline Code
- **Headings:** H1, H2, H3
- **Lists:** Bullet points, Numbered lists
- **Links:** Insert hyperlinks
- **Images:** Upload or link images
- **Code Blocks:** Syntax-highlighted code blocks

#### View Modes

1. **Edit Mode:** Full-width markdown editing
2. **Split View:** Side-by-side editor and preview
3. **Preview Mode:** Full-width rendered preview

#### Keyboard Shortcuts

- `Ctrl/Cmd + B` - Bold
- `Ctrl/Cmd + I` - Italic
- `Ctrl/Cmd + K` - Insert link
- `Ctrl/Cmd + `` ` `` - Inline code
- `Tab` - Insert 2 spaces
- `Esc` - Exit fullscreen

#### Fullscreen Mode

Click the fullscreen icon (⛶) to expand the editor. Press `Esc` to exit.

### Media Uploader

#### Supported Formats

- **Images:** JPEG, JPG, PNG, GIF
- **Videos:** MP4, MOV

#### File Size Limits

- Maximum file size: 10MB per file
- Maximum files per upload: 10

#### Usage

1. Click "Upload Media" button
2. Drag and drop files or click to browse
3. Wait for upload to complete
4. Copy the image URL to use in content
5. Click "Use These Files" when done

### Publishing Settings

#### Status Options

1. **Draft:** Not visible to users (default)
2. **Published:** Immediately visible to all users
3. **Scheduled:** Publish at a specific date/time

#### Scheduling

1. Select "Scheduled" status
2. Choose date and time
3. Content will auto-publish at the specified time

#### Track Assignment (Lessons Only)

- **30-Day Track:** Accelerated learning path
- **60-Day Track:** Comprehensive learning path
- **Both Tracks:** Available in both tracks

### Preview Mode

Before publishing, preview your content to see how users will experience it:

1. Click the "Preview" button
2. Review all content, formatting, and media
3. Close preview and make adjustments if needed
4. Publish when satisfied

---

## Workflow Guide

### Creating a New Lesson

1. **Access Content Management**
   - Go to `/admin/content`
   - Click "Create New" → "Lesson"

2. **Fill Basic Information**
   - Title (required): Clear, descriptive title
   - Description: Brief summary (2-3 sentences)
   - Duration: Estimated time in minutes
   - Difficulty: Beginner/Intermediate/Advanced
   - Category: e.g., "Playwright Basics", "Selectors"

3. **Write Content**
   - Use the markdown editor
   - Add headings, lists, code blocks
   - Upload images if needed
   - Use split view for live preview

4. **Add Learning Objectives**
   - Click "Add" under Learning Objectives
   - Enter objective (e.g., "Understand CSS selectors")
   - Add 3-5 objectives per lesson

5. **Configure Publishing**
   - Select learning track (30-day/60-day/both)
   - Add relevant tags
   - Choose status (draft/published/scheduled)

6. **Preview and Publish**
   - Click "Preview" to review
   - Click "Save Draft" to save progress
   - Click "Publish" when ready

### Creating a Quiz

1. **Access Quiz Editor**
   - Go to `/admin/content`
   - Click "Create New" → "Quiz"

2. **Configure Quiz Settings**
   - Title and description
   - Time limit (minutes)
   - Passing score (percentage)
   - Difficulty level

3. **Add Questions**
   - Choose question type (Multiple Choice/True-False)
   - Write question text
   - Add options (for multiple choice)
   - Select correct answer(s)
   - Add explanation
   - Set points value
   - Click "Add Question"

4. **Configure Options**
   - ☑ Randomize question order
   - ☑ Randomize option order
   - ☑ Show feedback after submission
   - ☑ Allow retries

5. **Preview and Publish**
   - Review all questions
   - Check explanations
   - Verify correct answers
   - Publish when ready

### Creating an Exercise

1. **Access Exercise Editor**
   - Go to `/admin/content`
   - Click "Create New" → "Exercise"

2. **Basic Configuration**
   - Title and description
   - Programming language
   - Difficulty and time estimate

3. **Add Starter Code**
   - Write template code for students
   - Include function signatures
   - Add comments for guidance

4. **Add Solution Code**
   - Write the complete solution
   - Follow best practices
   - Add comments explaining key concepts

5. **Create Test Cases**
   - Input: Test input values
   - Expected Output: Correct output
   - Description: What the test validates
   - Hidden: Check if validation-only test
   - Add at least 3-5 test cases

6. **Add Hints**
   - Start with high-level hints
   - Progress to more specific guidance
   - Don't give away the solution
   - Add 2-4 hints per exercise

7. **Publish**
   - Preview exercise
   - Test code if possible
   - Verify test cases
   - Publish when ready

### Creating Flashcard Decks

#### Method 1: Manual Entry

1. **Access Flashcard Editor**
   - Go to `/admin/content`
   - Click "Create New" → "Flashcard Deck"

2. **Configure Deck**
   - Title and description
   - Category and difficulty
   - Tags for organization

3. **Add Cards**
   - Enter question/term (front)
   - Enter answer/definition (back)
   - Click "Add Card"
   - Repeat for all cards

#### Method 2: Bulk Import

1. **Prepare JSON File**
   ```json
   [
     {
       "front": "What is Playwright?",
       "back": "A Node.js library for browser automation"
     },
     {
       "front": "What is a selector?",
       "back": "A pattern used to locate elements on a page"
     }
   ]
   ```

2. **Import**
   - Click "Import JSON"
   - Paste JSON data
   - Click "Import"
   - Review imported cards

3. **Export**
   - Click "Export JSON" to backup
   - Save file for future use

---

## Auto-Save Feature

The Content Editor automatically saves your work every 30 seconds when changes are detected.

### Auto-Save Indicator

- **Yellow warning:** "Unsaved changes"
- **Timestamp:** "Last saved: [time]"

### Manual Save

Click "Save Draft" at any time to manually save your work.

---

## Version History (Lessons)

Lessons automatically maintain version history:

- Every update creates a new version
- Previous versions are preserved
- Versions include:
  - Version number
  - Content snapshot
  - Update timestamp
  - Author name

**Note:** Version history is automatic and cannot be manually edited.

---

## Bulk Operations

### Selecting Multiple Items

1. Check boxes next to content items
2. Or click "Select All" checkbox in header

### Available Bulk Actions

- **Publish:** Make multiple items live
- **Unpublish:** Return items to draft status
- **Delete:** Remove multiple items (cannot be undone)

### Using Bulk Actions

1. Select items
2. Click desired action button
3. Confirm the operation
4. Wait for completion

---

## API Reference

### Content List

```
GET /api/admin/content
```

Returns all content items across all types.

### Lessons

```
GET    /api/admin/lessons          - List all lessons
GET    /api/admin/lessons/:id      - Get lesson by ID
POST   /api/admin/lessons          - Create new lesson
PUT    /api/admin/lessons/:id      - Update lesson
DELETE /api/admin/lessons/:id      - Delete lesson
```

### Quizzes

```
GET    /api/admin/quizzes          - List all quizzes
GET    /api/admin/quizzes/:id      - Get quiz by ID
POST   /api/admin/quizzes          - Create new quiz
PUT    /api/admin/quizzes/:id      - Update quiz
DELETE /api/admin/quizzes/:id      - Delete quiz
```

### Exercises

```
GET    /api/admin/exercises        - List all exercises
GET    /api/admin/exercises/:id    - Get exercise by ID
POST   /api/admin/exercises        - Create new exercise
PUT    /api/admin/exercises/:id    - Update exercise
DELETE /api/admin/exercises/:id    - Delete exercise
```

### Flashcards

```
GET    /api/admin/flashcards       - List all flashcard decks
GET    /api/admin/flashcards/:id   - Get deck by ID
POST   /api/admin/flashcards       - Create new deck
PUT    /api/admin/flashcards/:id   - Update deck
DELETE /api/admin/flashcards/:id   - Delete deck
```

### Bulk Operations

```
POST /api/admin/content/bulk-publish    - Publish multiple items
POST /api/admin/content/bulk-unpublish  - Unpublish multiple items
POST /api/admin/content/bulk-delete     - Delete multiple items
```

Request body:
```json
{
  "contentIds": ["id1", "id2", "id3"]
}
```

### Publish/Unpublish Individual Content

```
POST /api/admin/content/:id/publish   - Publish single item
POST /api/admin/content/:id/unpublish - Unpublish single item
```

### Media Upload

```
POST /api/admin/media/upload
```

Request: `multipart/form-data` with file field named `file`

Response:
```json
{
  "url": "/uploads/media/filename.jpg",
  "filename": "filename.jpg"
}
```

---

## Troubleshooting

### Common Issues

#### 1. Auto-save not working

**Symptoms:** Changes not saved after 30 seconds

**Solutions:**
- Check internet connection
- Look for error messages
- Manually click "Save Draft"
- Refresh page and check if changes persisted

#### 2. Media upload fails

**Symptoms:** Upload button not responding or error message

**Solutions:**
- Check file size (max 10MB)
- Verify file format (JPEG, PNG, GIF, MP4, MOV)
- Check internet connection
- Try uploading one file at a time
- Clear browser cache

#### 3. Preview not showing content

**Symptoms:** Preview mode shows blank or old content

**Solutions:**
- Close and reopen preview
- Save draft before previewing
- Check for syntax errors in markdown
- Refresh the page

#### 4. Cannot publish content

**Symptoms:** Publish button disabled or error on publish

**Solutions:**
- Verify all required fields are filled:
  - Lessons: Title, content
  - Quizzes: Title, at least one question
  - Exercises: Title, starter code, at least one test case
  - Flashcards: Title, at least one card
- Check for validation errors
- Save draft first
- Check admin permissions

#### 5. Markdown not rendering correctly

**Symptoms:** Formatting looks wrong in preview

**Solutions:**
- Check markdown syntax
- Ensure proper spacing (blank lines between elements)
- Verify code block formatting (triple backticks)
- Test in split view mode

#### 6. Lost unsaved changes

**Prevention:**
- Enable auto-save (default)
- Save frequently with "Save Draft"
- Don't close browser tabs with unsaved work
- Browser will warn before closing with unsaved changes

**Recovery:**
- Check if auto-save captured changes
- Look for draft version
- Unfortunately, unsaved work cannot be recovered

---

## Keyboard Shortcuts Reference

### Global Shortcuts

- `Ctrl/Cmd + S` - Save draft (in supported browsers)
- `Esc` - Close modals/exit fullscreen

### Markdown Editor

- `Ctrl/Cmd + B` - Bold text
- `Ctrl/Cmd + I` - Italic text
- `Ctrl/Cmd + K` - Insert link
- `Ctrl/Cmd + `` ` `` - Inline code
- `Tab` - Insert indentation
- `Shift + Tab` - Remove indentation

### Code Editor (Exercises)

Monaco editor provides full IDE-like shortcuts:
- `Ctrl/Cmd + F` - Find
- `Ctrl/Cmd + H` - Find and replace
- `Alt + Up/Down` - Move line up/down
- `Ctrl/Cmd + /` - Toggle comment
- `Ctrl/Cmd + D` - Duplicate line

---

## Best Practices

### Content Organization

1. **Use consistent naming conventions**
   - Prefix lessons: "Lesson 1:", "Lesson 2:"
   - Descriptive quiz names: "Selectors Quiz", "Async Handling Quiz"

2. **Tag appropriately**
   - Use lowercase tags
   - Be consistent: "playwright" not "Playwright"
   - Common tags: "basics", "advanced", "selectors", "async"

3. **Set difficulty accurately**
   - Beginner: Basic concepts, minimal prerequisites
   - Intermediate: Assumes basic knowledge
   - Advanced: Complex topics, multiple prerequisites

### Content Quality

1. **Write clear learning objectives**
   - Start with action verbs: "Understand", "Implement", "Debug"
   - Be specific and measurable
   - Limit to 3-5 per lesson

2. **Use examples liberally**
   - Include code examples for technical concepts
   - Add images for visual concepts
   - Show both correct and incorrect approaches

3. **Test your content**
   - Preview before publishing
   - Have someone else review if possible
   - Test all code examples
   - Verify all quiz answers
   - Run through exercises yourself

### Publishing Strategy

1. **Draft first**
   - Always start as draft
   - Review thoroughly
   - Get feedback from peers

2. **Schedule strategically**
   - Schedule releases for specific dates
   - Batch related content
   - Consider user time zones

3. **Update regularly**
   - Keep content current
   - Update examples with new features
   - Refresh screenshots and videos

---

## Support

### Getting Help

- Check this guide first
- Review error messages carefully
- Check browser console for technical errors
- Contact platform administrators

### Reporting Issues

When reporting problems, include:
- What you were trying to do
- What happened instead
- Error messages (if any)
- Browser and version
- Screenshots if relevant

---

## Appendix

### Markdown Syntax Quick Reference

```markdown
# Heading 1
## Heading 2
### Heading 3

**bold text**
*italic text*
`inline code`

- Bullet point 1
- Bullet point 2

1. Numbered item 1
2. Numbered item 2

[Link text](https://example.com)
![Image alt text](image-url.jpg)

\`\`\`javascript
// Code block
function example() {
  return "Hello";
}
\`\`\`
```

### JSON Format for Flashcard Import

```json
[
  {
    "front": "Question or term",
    "back": "Answer or definition"
  },
  {
    "front": "Another question",
    "back": "Another answer"
  }
]
```

### Recommended Image Sizes

- **Lesson images:** 800-1200px width
- **Quiz question images:** 600px max width
- **Thumbnails:** 200-300px width

### File Naming Conventions

- Use lowercase
- Separate words with hyphens
- Be descriptive: `playwright-selectors-diagram.png`
- Avoid spaces and special characters

---

## Changelog

### Version 1.0.0 (2024)
- Initial release
- Lesson, Quiz, Exercise, Flashcard editors
- Markdown editor with live preview
- Media uploader
- Bulk operations
- Publishing and scheduling
- Auto-save functionality
- Version history for lessons

---

**Last Updated:** 2024
**Version:** 1.0.0
**Platform:** Playwright & Selenium Learning Platform
