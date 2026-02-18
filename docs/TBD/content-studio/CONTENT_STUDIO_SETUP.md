# Content Studio - Installation and Setup Guide

## Prerequisites

Before setting up the Content Studio, ensure you have:

- Node.js 18+ installed
- MongoDB 6.0+ running
- npm or yarn package manager
- Basic knowledge of React and Node.js

## Required Dependencies

### Frontend Dependencies

Add the following to your frontend `package.json`:

```json
{
  "dependencies": {
    "@dnd-kit/core": "^6.0.8",
    "@dnd-kit/sortable": "^7.0.2",
    "@dnd-kit/utilities": "^3.2.1",
    "@tiptap/react": "^2.1.13",
    "@tiptap/starter-kit": "^2.1.13",
    "@tiptap/extension-code-block-lowlight": "^2.1.13",
    "@tiptap/extension-image": "^2.1.13",
    "@tiptap/extension-link": "^2.1.13",
    "@tiptap/extension-table": "^2.1.13",
    "@tiptap/extension-table-row": "^2.1.13",
    "@tiptap/extension-table-cell": "^2.1.13",
    "@tiptap/extension-table-header": "^2.1.13",
    "lowlight": "^3.1.0",
    "highlight.js": "^11.9.0"
  }
}
```

### Backend Dependencies

These are already included in the project, but ensure you have:

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.3",
    "multer": "^1.4.5-lts.1",
    "crypto": "^1.0.1"
  }
}
```

## Installation Steps

### 1. Install Frontend Dependencies

```bash
cd frontend
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-code-block-lowlight
npm install @tiptap/extension-image @tiptap/extension-link @tiptap/extension-table
npm install @tiptap/extension-table-row @tiptap/extension-table-cell @tiptap/extension-table-header
npm install lowlight highlight.js
```

Or using yarn:

```bash
yarn add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
yarn add @tiptap/react @tiptap/starter-kit @tiptap/extension-code-block-lowlight
yarn add @tiptap/extension-image @tiptap/extension-link @tiptap/extension-table
yarn add @tiptap/extension-table-row @tiptap/extension-table-cell @tiptap/extension-table-header
yarn add lowlight highlight.js
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install multer
```

### 3. Configure File Upload

Create uploads directory:

```bash
mkdir -p backend/public/uploads
```

Update your backend `server.ts` to include multer:

```typescript
import multer from 'multer';
import path from 'path';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024 // 2GB
  },
  fileFilter: (req, file, cb) => {
    // Add file type validation
    cb(null, true);
  }
});

export { upload };
```

### 4. Setup Routes

Create studio routes in `/backend/src/routes/studio/index.ts`:

```typescript
import express from 'express';
import * as courseController from '../../controllers/studio/courseController.js';
import * as lessonController from '../../controllers/studio/lessonController.js';
import * as assetController from '../../controllers/studio/assetController.js';
import * as quizController from '../../controllers/studio/quizController.js';
import { authenticateToken, requireRole } from '../../middleware/auth.js';
import { upload } from '../../config/upload.js';

const router = express.Router();

// Apply authentication and instructor role requirement
router.use(authenticateToken);
router.use(requireRole(['instructor', 'admin']));

// Course routes
router.get('/courses', courseController.getCourses);
router.post('/courses', courseController.createCourse);
router.get('/courses/:id', courseController.getCourse);
router.put('/courses/:id', courseController.updateCourse);
router.delete('/courses/:id', courseController.deleteCourse);
router.put('/courses/:id/structure', courseController.updateCourseStructure);
router.post('/courses/:id/publish', courseController.toggleCoursePublish);
router.post('/courses/:id/duplicate', courseController.duplicateCourse);
router.get('/courses/templates', courseController.getCourseTemplates);
router.post('/courses/templates/:id', courseController.createFromTemplate);
router.get('/courses/:id/stats', courseController.getCourseStats);

// Lesson routes
router.get('/lessons', lessonController.getLessons);
router.post('/lessons', lessonController.createLesson);
router.get('/lessons/:id', lessonController.getLesson);
router.put('/lessons/:id', lessonController.updateLesson);
router.delete('/lessons/:id', lessonController.deleteLesson);
router.post('/lessons/:id/publish', lessonController.toggleLessonPublish);
router.post('/lessons/:id/duplicate', lessonController.duplicateLesson);
router.post('/lessons/reorder', lessonController.reorderLessons);
router.post('/lessons/:id/code-block', lessonController.addCodeBlock);
router.post('/lessons/:id/video', lessonController.addVideo);
router.post('/lessons/:id/resource', lessonController.addResource);

// Asset routes
router.get('/assets', assetController.getAssets);
router.post('/assets/upload', upload.single('file'), assetController.uploadAsset);
router.get('/assets/:id', assetController.getAsset);
router.put('/assets/:id', assetController.updateAsset);
router.delete('/assets/:id', assetController.deleteAsset);
router.post('/assets/bulk-delete', assetController.bulkDeleteAssets);
router.get('/assets/folders', assetController.getFolders);
router.get('/assets/tags', assetController.getTags);
router.get('/assets/:id/usage', assetController.getAssetUsage);
router.get('/assets/stats', assetController.getAssetStats);
router.post('/assets/move-folder', assetController.moveToFolder);
router.post('/assets/add-tags', assetController.addTags);

// Quiz routes
router.get('/quizzes', quizController.getQuizzes);
router.post('/quizzes', quizController.createQuiz);
router.get('/quizzes/:id', quizController.getQuiz);
router.put('/quizzes/:id', quizController.updateQuiz);
router.delete('/quizzes/:id', quizController.deleteQuiz);
router.post('/quizzes/:id/question', quizController.addQuestion);
router.put('/quizzes/:id/question/:questionId', quizController.updateQuestion);
router.delete('/quizzes/:id/question/:questionId', quizController.deleteQuestion);
router.post('/quizzes/:id/reorder', quizController.reorderQuestions);
router.post('/quizzes/:id/bulk-import', quizController.bulkImportQuestions);
router.post('/quizzes/:id/publish', quizController.toggleQuizPublish);
router.get('/quizzes/:id/stats', quizController.getQuizStats);
router.post('/quizzes/:id/duplicate', quizController.duplicateQuiz);

export default router;
```

Then add to main server:

```typescript
import studioRoutes from './routes/studio/index.js';

app.use('/api/studio', studioRoutes);
```

### 5. Setup Frontend Routes

Add studio routes to your frontend router:

```typescript
import { lazy } from 'react';

const CourseBuilder = lazy(() => import('./pages/studio/CourseBuilder'));
const LessonEditor = lazy(() => import('./pages/studio/LessonEditor'));
const VideoEditor = lazy(() => import('./pages/studio/VideoEditor'));
const QuizBuilder = lazy(() => import('./pages/studio/QuizBuilder'));
const AssetLibrary = lazy(() => import('./pages/studio/AssetLibrary'));

// Add to your routes
{
  path: '/studio',
  element: <ProtectedRoute roles={['instructor', 'admin']} />,
  children: [
    { path: 'courses', element: <CourseList /> },
    { path: 'courses/new', element: <CourseBuilder /> },
    { path: 'courses/:id', element: <CourseBuilder /> },
    { path: 'lessons/new', element: <LessonEditor /> },
    { path: 'lessons/:id', element: <LessonEditor /> },
    { path: 'videos/:id', element: <VideoEditor /> },
    { path: 'quizzes/new', element: <QuizBuilder /> },
    { path: 'quizzes/:id', element: <QuizBuilder /> },
    { path: 'assets', element: <AssetLibrary /> }
  ]
}
```

### 6. Environment Variables

Add to your `.env` file:

```env
# File Upload Configuration
UPLOAD_DIR=public/uploads
MAX_FILE_SIZE=2147483648
ALLOWED_FILE_TYPES=image/*,video/*,application/pdf,application/zip

# CDN Configuration (optional)
CDN_ENABLED=false
CDN_URL=https://cdn.example.com
CDN_BUCKET=learning-platform-assets

# Content Settings
ENABLE_VERSIONING=true
MAX_VERSIONS=10
AUTO_SAVE_INTERVAL=30000
```

### 7. Database Indexes

Create indexes for better performance:

```javascript
// Run in MongoDB shell
db.courses.createIndex({ slug: 1 }, { unique: true });
db.courses.createIndex({ category: 1, isPublished: 1 });
db.courses.createIndex({ instructors: 1 });
db.courses.createIndex({ status: 1 });

db.lessons.createIndex({ slug: 1 });
db.lessons.createIndex({ courseId: 1, order: 1 });
db.lessons.createIndex({ courseId: 1, isPublished: 1, order: 1 });

db.assets.createIndex({ checksum: 1 });
db.assets.createIndex({ type: 1 });
db.assets.createIndex({ folder: 1 });
db.assets.createIndex({ tags: 1 });
db.assets.createIndex({ createdBy: 1 });

db.quizzes.createIndex({ slug: 1 });
db.quizzes.createIndex({ courseId: 1 });
db.quizzes.createIndex({ lessonId: 1 });
```

## Configuration

### TipTap Editor Configuration

The lesson editor uses TipTap with custom configuration. You can customize extensions:

```typescript
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { lowlight } from 'lowlight';

// Register languages
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';

lowlight.registerLanguage('javascript', javascript);
lowlight.registerLanguage('typescript', typescript);
lowlight.registerLanguage('python', python);
lowlight.registerLanguage('java', java);

const editor = useEditor({
  extensions: [
    StarterKit,
    CodeBlockLowlight.configure({ lowlight }),
    // Add more extensions
  ],
  content: '<p>Start writing...</p>'
});
```

### File Upload Limits

Configure file size limits in your backend:

```typescript
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '2147483648'),
    files: 10
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || ['*'];
    const isAllowed = allowedTypes.some(type => {
      if (type === '*') return true;
      if (type.endsWith('/*')) {
        return file.mimetype.startsWith(type.replace('/*', '/'));
      }
      return file.mimetype === type;
    });

    if (isAllowed) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'));
    }
  }
});
```

## Testing

### Test Course Creation

```bash
curl -X POST http://localhost:3000/api/studio/courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Test Course",
    "description": "Test description",
    "category": "playwright",
    "level": "beginner"
  }'
```

### Test Asset Upload

```bash
curl -X POST http://localhost:3000/api/studio/assets/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test-image.jpg" \
  -F "title=Test Image"
```

## Troubleshooting

### Common Issues

**1. File Upload Fails**
- Check upload directory exists and has write permissions
- Verify file size is within limits
- Check file type is allowed

**2. TipTap Editor Not Loading**
- Ensure all TipTap packages are installed
- Check browser console for errors
- Verify lowlight language registration

**3. Drag and Drop Not Working**
- Ensure @dnd-kit packages are installed
- Check for z-index conflicts
- Verify sensors are configured correctly

**4. MongoDB Connection Issues**
- Verify MongoDB is running
- Check connection string in .env
- Ensure database user has correct permissions

### Debug Mode

Enable debug logging:

```typescript
// Backend
process.env.DEBUG = 'studio:*';

// Frontend
localStorage.setItem('DEBUG', 'studio:*');
```

## Production Deployment

### Checklist

- [ ] Set NODE_ENV=production
- [ ] Configure CDN for assets
- [ ] Setup S3 or cloud storage
- [ ] Enable file compression
- [ ] Setup backup strategy
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Setup monitoring
- [ ] Configure SSL/TLS
- [ ] Setup error logging

### Performance Optimization

1. **Enable CDN**:
```env
CDN_ENABLED=true
CDN_URL=https://cdn.example.com
```

2. **Configure Caching**:
```typescript
app.use('/uploads', express.static('public/uploads', {
  maxAge: '1y',
  etag: true
}));
```

3. **Optimize Images**:
```bash
npm install sharp
```

Then add image optimization middleware.

## Support

- Documentation: `/docs/CONTENT_STUDIO_GUIDE.md`
- Instructor Manual: `/docs/INSTRUCTOR_MANUAL.md`
- API Docs: `/docs/API_DOCUMENTATION.md`

## License

This content studio is part of the Playwright & Selenium Learning Platform.

---

**Version**: 1.0.0
**Last Updated**: February 2024
