# Content Studio Guide

## Overview

The Content Studio is a comprehensive authoring platform for instructors to create, manage, and publish high-quality courses, lessons, quizzes, and learning materials for the Playwright & Selenium Learning Platform.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Course Builder](#course-builder)
3. [Lesson Editor](#lesson-editor)
4. [Quiz Builder](#quiz-builder)
5. [Video Editor](#video-editor)
6. [Asset Library](#asset-library)
7. [Content Versioning](#content-versioning)
8. [Best Practices](#best-practices)

## Getting Started

### Accessing the Content Studio

Navigate to `/studio` to access the Content Studio dashboard. You must have instructor or admin privileges to access the studio.

### Studio Dashboard

The dashboard provides:
- Quick access to all your courses
- Recent activity and analytics
- Draft content that needs attention
- Publishing workflow status

## Course Builder

### Creating a New Course

1. Click "New Course" from the studio dashboard
2. Fill in basic course information:
   - **Title**: Clear, descriptive course title
   - **Description**: Detailed overview of what students will learn
   - **Category**: Select appropriate category (Playwright, Selenium, etc.)
   - **Level**: Beginner, Intermediate, Advanced, or Expert
   - **Learning Objectives**: List 3-5 key learning outcomes

### Course Structure

#### Sections

Courses are organized into sections:
- Each section represents a major topic or module
- Sections can contain multiple lessons
- Drag and drop to reorder sections
- Sections can be published independently

#### Lesson Organization

Within each section:
- Add lessons using the "+ Add Lesson" button
- Reorder lessons by dragging
- Set lesson duration estimates
- Mark lessons as free (accessible to non-enrolled students)

### Course Settings

#### Basic Settings
- **Prerequisites**: Link to required courses
- **Estimated Duration**: Total course time (auto-calculated from lessons)
- **Language**: Course language (default: English)
- **Tags**: Add searchable tags

#### Pricing
- **Price**: Set course price (0 for free courses)
- **Currency**: USD, EUR, etc.
- **Premium**: Mark as premium content

#### Features
- **Allow Discussions**: Enable/disable course discussions
- **Allow Reviews**: Enable/disable student reviews
- **Certificate**: Enable certificate upon completion

### Publishing a Course

Before publishing, ensure:
- [ ] Course has at least one section with lessons
- [ ] All lessons have content
- [ ] Learning objectives are defined
- [ ] Thumbnail is uploaded
- [ ] Course information is complete

Click "Publish" to make the course live.

### Course Templates

Use templates to quickly create courses:
1. Browse template library
2. Select a template
3. Customize content
4. Publish your course

Template categories:
- Beginner courses
- Advanced topics
- Certification prep
- Hands-on workshops

## Lesson Editor

### Rich Text Editor

The lesson editor uses TipTap, a powerful WYSIWYG editor with:

#### Text Formatting
- **Bold**, *Italic*, Underline
- Headings (H1-H6)
- Lists (bulleted and numbered)
- Blockquotes
- Links
- Code inline

#### Content Elements

**Code Blocks**
```typescript
// Insert syntax-highlighted code
const playwright = require('playwright');

async function example() {
  const browser = await playwright.chromium.launch();
  // Your test code here
}
```

**Images**
- Click the image icon
- Upload from asset library or provide URL
- Add alt text for accessibility

**Videos**
- Embed YouTube or Vimeo videos
- Upload self-hosted videos
- Add chapter markers

**Interactive Elements**
- Tabs for organizing content
- Accordions for collapsible sections
- Callouts for important notes
- Code sandboxes for live coding

### Lesson Settings

#### Basic Information
- **Title**: Lesson name
- **Description**: Brief summary
- **Duration**: Estimated completion time
- **Difficulty**: Easy, Medium, or Hard

#### Learning Objectives
Define what students will learn in this specific lesson.

#### Resources
Attach downloadable resources:
- PDF guides
- Code templates
- Exercise files
- Reference materials

### Markdown Support

You can also write in Markdown:
```markdown
# Heading 1
## Heading 2

**Bold text**
*Italic text*

- Bullet point
- Another point

1. Numbered list
2. Second item
```

### Preview Mode

Always preview your lesson before publishing:
- Click "Preview" to see student view
- Check formatting and layout
- Test interactive elements
- Verify all media loads correctly

## Quiz Builder

### Creating a Quiz

1. Navigate to Quiz Builder
2. Click "New Quiz"
3. Configure quiz settings
4. Add questions
5. Publish

### Quiz Settings

#### Grading
- **Passing Score**: Minimum percentage to pass (default: 70%)
- **Show Correct Answers**: Display answers after submission
- **Auto-Grade**: Automatically grade objective questions

#### Attempts
- **Max Attempts**: Limit number of attempts (blank = unlimited)
- **Time Limit**: Maximum time in minutes (blank = no limit)

#### Randomization
- **Shuffle Questions**: Randomize question order
- **Shuffle Options**: Randomize answer choices
- **Question Bank**: Pull random questions from a bank

### Question Types

#### Multiple Choice
- Add 2-6 options
- Mark one or more as correct
- Add explanation for each option
- Support for partial credit

#### True/False
- Simple true or false questions
- Add explanation for correct answer

#### Fill in the Blank
- Students type the answer
- Support for multiple acceptable answers
- Case-sensitive option

#### Code Questions
- Provide starter code
- Define test cases
- Auto-grade with test runner
- Hide some test cases

#### Essay Questions
- Manual grading required
- Rubric support
- Word count limits

### Question Bank

Build a question bank for randomization:
1. Add questions to the bank
2. Enable "Randomize from Bank"
3. Set number of questions to show
4. Questions are selected randomly per attempt

### Bulk Import

Import questions from CSV:
```csv
Type,Question,Option A,Option B,Option C,Correct,Points
multiple-choice,"What is Playwright?","A framework","A tool","A library","A",1
true-false,"Selenium supports multiple browsers","TRUE","FALSE","TRUE","TRUE",1
```

## Video Editor

### Uploading Videos

Supported formats:
- MP4 (recommended)
- WebM
- MOV
- Maximum size: 2GB

### Video Tools

#### Trimming
- Set start and end points
- Remove unwanted sections
- Preview changes before saving

#### Chapters
Add chapter markers for easy navigation:
1. Play video to desired point
2. Click "Add Chapter"
3. Name the chapter
4. Repeat for all key sections

#### Captions
Add accessibility captions:
- Upload SRT or VTT files
- Support multiple languages
- Auto-sync with video

#### Thumbnail Selection
- Select frame from video
- Upload custom thumbnail
- Recommended size: 1280x720

### Quality Settings

Choose video quality/resolution:
- 1080p (Full HD)
- 720p (HD)
- 480p (SD)
- Auto (adaptive streaming)

## Asset Library

### Overview

Centralized media library for all course assets:
- Images
- Videos
- Documents
- Archives
- Audio files

### Uploading Assets

1. Click "Upload"
2. Select files or drag and drop
3. Add metadata:
   - Title
   - Description
   - Tags
   - Folder location
   - Alt text (for images)

### Organization

#### Folders
Create folders to organize assets:
- By course
- By content type
- By topic
- Custom structure

#### Tags
Add tags for easy searching:
- Topic tags (playwright, selenium)
- Content tags (screenshot, diagram)
- Custom tags

### Asset Usage Tracking

View where assets are used:
- Courses using the asset
- Lessons referencing the asset
- Prevent deletion of in-use assets
- Update propagation

### Bulk Operations

Select multiple assets to:
- Move to folder
- Add tags
- Delete
- Download as ZIP

## Content Versioning

### Automatic Versioning

Content is automatically versioned when:
- Publishing a course
- Major content changes
- Manual version creation

### Version History

View all versions:
- Version number
- Created date and time
- Created by (user)
- Change log
- Diff comparison

### Restoring Versions

To restore a previous version:
1. View version history
2. Select version to restore
3. Preview changes
4. Click "Restore"
5. Current version is backed up first

### Version Comparison

Compare two versions:
- Side-by-side diff view
- Highlighted changes
- Added/removed/modified content

## Best Practices

### Course Creation

1. **Start with clear objectives**
   - Define what students will learn
   - Structure course around outcomes
   - Keep objectives measurable

2. **Organize logically**
   - Progressive difficulty
   - Build on previous concepts
   - Group related topics

3. **Engage students**
   - Mix content types (video, text, quizzes)
   - Add hands-on exercises
   - Include real-world examples

### Lesson Design

1. **Keep lessons focused**
   - One main concept per lesson
   - 10-15 minutes ideal length
   - Include summary

2. **Use multimedia**
   - Add relevant images
   - Embed demo videos
   - Include code examples

3. **Provide resources**
   - Downloadable materials
   - Additional reading
   - Practice exercises

### Quiz Design

1. **Align with objectives**
   - Test what you taught
   - Mix difficulty levels
   - Include explanations

2. **Question quality**
   - Clear, unambiguous wording
   - Plausible distractors
   - Avoid "all of the above"

3. **Feedback matters**
   - Explain correct answers
   - Point to relevant content
   - Encourage learning

### Video Production

1. **Quality standards**
   - 1080p minimum resolution
   - Clear audio
   - Good lighting
   - Steady camera

2. **Content**
   - Script key points
   - Keep under 15 minutes
   - Show, don't just tell
   - Edit out mistakes

3. **Accessibility**
   - Add captions
   - Provide transcripts
   - Clear speech
   - Visual demonstrations

### Asset Management

1. **Naming conventions**
   - Descriptive filenames
   - Include dates if relevant
   - Use lowercase
   - No spaces (use hyphens)

2. **Organization**
   - Consistent folder structure
   - Tag appropriately
   - Delete unused assets
   - Regular cleanup

3. **Optimization**
   - Compress images
   - Optimize videos
   - Appropriate file formats
   - Balance quality and size

## Support and Resources

### Help Documentation
- Complete API documentation
- Video tutorials
- FAQ section
- Community forums

### Technical Support
- Email: studio-support@learning-platform.com
- Live chat: Available 9 AM - 5 PM EST
- Ticket system: For complex issues

### Updates and Changes
- Release notes published monthly
- Feature announcements
- Deprecation notices
- Migration guides

## Appendix

### Keyboard Shortcuts

#### Editor
- `Ctrl/Cmd + B`: Bold
- `Ctrl/Cmd + I`: Italic
- `Ctrl/Cmd + K`: Insert link
- `Ctrl/Cmd + S`: Save
- `Ctrl/Cmd + Z`: Undo
- `Ctrl/Cmd + Shift + Z`: Redo

#### Course Builder
- `Ctrl/Cmd + N`: New section
- `Ctrl/Cmd + L`: New lesson
- `Ctrl/Cmd + P`: Preview
- `Ctrl/Cmd + Shift + P`: Publish

### File Format Support

#### Images
- JPEG, PNG, GIF, WebP
- SVG (vector graphics)
- Maximum: 10MB per image

#### Videos
- MP4, WebM, MOV
- H.264 or H.265 codec
- Maximum: 2GB per video

#### Documents
- PDF, DOCX, XLSX, PPTX
- TXT, MD, CSV
- Maximum: 50MB per file

### API Reference

For programmatic access to the Content Studio, see the [API Documentation](/docs/api).

---

**Version**: 1.0.0
**Last Updated**: 2024
**Maintained by**: Platform Team
