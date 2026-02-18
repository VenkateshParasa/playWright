# Content Studio Quick Reference

## Quick Links

- **Dashboard**: `/studio`
- **Course Builder**: `/studio/courses/new`
- **Lesson Editor**: `/studio/lessons/new`
- **Quiz Builder**: `/studio/quizzes/new`
- **Asset Library**: `/studio/assets`
- **Video Editor**: `/studio/videos/:id`

## Common Tasks

### Create a Course

1. Go to `/studio/courses/new`
2. Fill in basic info (title, description, category)
3. Add learning objectives
4. Create sections
5. Add lessons to sections
6. Preview and publish

**Keyboard Shortcut**: `Ctrl/Cmd + N` (from studio dashboard)

### Create a Lesson

1. Go to `/studio/lessons/new`
2. Enter lesson title
3. Write content using rich editor
4. Add code blocks, videos, or resources
5. Set difficulty and duration
6. Save and attach to course

**Keyboard Shortcuts**:
- `Ctrl/Cmd + B`: Bold
- `Ctrl/Cmd + I`: Italic
- `Ctrl/Cmd + K`: Insert link
- `Ctrl/Cmd + S`: Save

### Upload Assets

1. Go to `/studio/assets`
2. Click "Upload"
3. Drag files or click to browse
4. Add metadata (title, tags, folder)
5. Upload completes automatically

**Supported Types**: Images, Videos, Documents, Archives

### Build a Quiz

1. Go to `/studio/quizzes/new`
2. Configure quiz settings
3. Add questions (MCQ, True/False, Code, etc.)
4. Set points and difficulty
5. Add explanations
6. Publish

## Editor Tips

### Rich Text Editor

**Text Formatting**:
- Bold: `**text**` or `Ctrl+B`
- Italic: `*text*` or `Ctrl+I`
- Code: `` `code` ``
- Heading: `# Heading`

**Insert Elements**:
- Image: Click image icon or paste URL
- Code block: ```language
- Link: `Ctrl+K`
- Table: Click table icon

### Code Blocks

Supported languages:
- JavaScript/TypeScript
- Python
- Java
- HTML/CSS
- And more...

Syntax:
````
```javascript
const test = 'code here';
```
````

### Videos

Supported platforms:
- YouTube: Paste video URL
- Vimeo: Paste video URL
- Self-hosted: Upload MP4

## API Quick Reference

### Courses

```bash
# List courses
GET /api/studio/courses

# Create course
POST /api/studio/courses
{
  "title": "Course Title",
  "description": "Description",
  "category": "playwright",
  "level": "beginner"
}

# Get course
GET /api/studio/courses/:id

# Update course
PUT /api/studio/courses/:id

# Publish course
POST /api/studio/courses/:id/publish
{ "publish": true }
```

### Lessons

```bash
# Create lesson
POST /api/studio/lessons
{
  "title": "Lesson Title",
  "courseId": "course_id",
  "content": "<p>Content</p>",
  "difficulty": "medium"
}

# Update lesson
PUT /api/studio/lessons/:id

# Add code block
POST /api/studio/lessons/:id/code-block
{
  "language": "javascript",
  "code": "console.log('hello');"
}
```

### Assets

```bash
# Upload asset
POST /api/studio/assets/upload
Content-Type: multipart/form-data
file: [binary]

# List assets
GET /api/studio/assets?type=image&folder=course1

# Delete asset
DELETE /api/studio/assets/:id
```

### Quizzes

```bash
# Create quiz
POST /api/studio/quizzes
{
  "title": "Quiz Title",
  "passingScore": 70
}

# Add question
POST /api/studio/quizzes/:id/question
{
  "type": "multiple-choice",
  "question": "What is Playwright?",
  "options": [
    {"text": "A framework", "isCorrect": true},
    {"text": "A language", "isCorrect": false}
  ]
}
```

## Troubleshooting

### Common Issues

**Problem**: Can't save content
- Check internet connection
- Ensure you're logged in
- Try refreshing the page

**Problem**: File upload fails
- Check file size (max 2GB for videos, 10MB for images)
- Verify file type is supported
- Try smaller file or different format

**Problem**: Editor not loading
- Clear browser cache
- Disable browser extensions
- Try different browser

**Problem**: Can't publish course
- Ensure course has at least one section
- Verify all required fields are filled
- Check for validation errors

## Best Practices

### Course Creation

1. **Plan First**: Outline your course before creating
2. **Clear Objectives**: Define what students will learn
3. **Logical Structure**: Organize content progressively
4. **Mix Content**: Use videos, text, and exercises
5. **Test Everything**: Preview before publishing

### Content Writing

1. **Be Concise**: Short paragraphs, clear language
2. **Use Examples**: Show real-world applications
3. **Add Visuals**: Images, diagrams, code examples
4. **Break It Up**: Use headings and lists
5. **Proofread**: Check spelling and grammar

### Video Creation

1. **Quality Audio**: Use good microphone
2. **Clear Video**: 1080p minimum resolution
3. **Keep It Short**: 5-10 minutes per video
4. **Add Captions**: For accessibility
5. **Chapter Markers**: Help navigation

### Quiz Design

1. **Test Understanding**: Not just memorization
2. **Clear Questions**: Unambiguous wording
3. **Good Distractors**: Plausible wrong answers
4. **Provide Feedback**: Explain correct answers
5. **Balanced Difficulty**: Mix easy and hard questions

## Keyboard Shortcuts

### Global
- `Ctrl/Cmd + S`: Save
- `Ctrl/Cmd + P`: Preview
- `Ctrl/Cmd + Shift + P`: Publish
- `Ctrl/Cmd + Z`: Undo
- `Ctrl/Cmd + Shift + Z`: Redo

### Editor
- `Ctrl/Cmd + B`: Bold
- `Ctrl/Cmd + I`: Italic
- `Ctrl/Cmd + U`: Underline
- `Ctrl/Cmd + K`: Insert link
- `Ctrl/Cmd + Shift + C`: Code block
- `Ctrl/Cmd + Shift + 7`: Ordered list
- `Ctrl/Cmd + Shift + 8`: Bullet list

### Course Builder
- `Ctrl/Cmd + N`: New section
- `Ctrl/Cmd + L`: New lesson
- `Alt + Up/Down`: Reorder items

## File Specifications

### Images
- **Formats**: JPEG, PNG, GIF, WebP, SVG
- **Max Size**: 10MB
- **Recommended**: 1920x1080 or 16:9 aspect ratio
- **Thumbnails**: 1280x720

### Videos
- **Formats**: MP4, WebM, MOV
- **Max Size**: 2GB
- **Codec**: H.264 or H.265
- **Resolution**: 1080p recommended
- **Audio**: 44.1kHz, 192kbps

### Documents
- **Formats**: PDF, DOCX, XLSX, PPTX, TXT, MD, CSV
- **Max Size**: 50MB

## Version Control

### Creating Versions

Versions are created automatically:
- When publishing
- On major changes
- Can create manually

### Restoring Versions

1. View version history
2. Select version to restore
3. Preview changes
4. Confirm restore

### Comparing Versions

1. Open version history
2. Select two versions
3. View side-by-side diff
4. See added/removed/modified content

## Support

### Get Help

- **Documentation**: `/docs/content-studio-guide`
- **Video Tutorials**: `/tutorials/studio`
- **Community Forum**: `/community/instructors`
- **Email Support**: studio-support@platform.com
- **Live Chat**: Available 9 AM - 5 PM EST

### Report Issues

1. Check troubleshooting guide
2. Search community forum
3. Contact support with:
   - Description of issue
   - Steps to reproduce
   - Screenshots if applicable
   - Browser and OS info

## Resources

### Templates

- Course outline templates
- Lesson templates
- Quiz templates
- Email templates

### Tools

- Image editor (Canva, Figma)
- Screen recorder (OBS, Camtasia)
- Code formatter (Prettier)
- Grammar checker (Grammarly)

### Learning

- Instructor handbook
- Best practices guide
- Example courses
- Webinars and training

## Updates

### Recent Changes

**Version 1.0.0** (February 2024)
- Initial release
- Course builder with drag-and-drop
- Rich text lesson editor
- Quiz builder with multiple question types
- Asset library with organization
- Video editor with chapters
- Content versioning

### Coming Soon

- AI-powered content suggestions
- Advanced video editing
- Collaborative editing
- Mobile app
- Live streaming integration

---

**Last Updated**: February 2024
**Version**: 1.0.0

For detailed information, see the [Complete Studio Guide](/docs/CONTENT_STUDIO_GUIDE.md).
