import express from 'express';
import multer from 'multer';
import path from 'path';
import { authMiddleware } from '../../middleware/auth';
import { adminMiddleware } from '../../middleware/admin';
import * as contentController from '../../controllers/admin/contentController';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/media/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and videos are allowed.'));
    }
  },
});

// Apply auth and admin middleware to all routes
router.use(authMiddleware);
router.use(adminMiddleware);

// Content List
router.get('/content', contentController.getAllContent);

// Lessons
router.get('/lessons', contentController.getAllLessons);
router.get('/lessons/:id', contentController.getLessonById);
router.post('/lessons', contentController.createLesson);
router.put('/lessons/:id', contentController.updateLesson);
router.delete('/lessons/:id', contentController.deleteLesson);

// Quizzes
router.get('/quizzes', contentController.getAllQuizzes);
router.get('/quizzes/:id', contentController.getQuizById);
router.post('/quizzes', contentController.createQuiz);
router.put('/quizzes/:id', contentController.updateQuiz);
router.delete('/quizzes/:id', contentController.deleteQuiz);

// Exercises
router.get('/exercises', contentController.getAllExercises);
router.get('/exercises/:id', contentController.getExerciseById);
router.post('/exercises', contentController.createExercise);
router.put('/exercises/:id', contentController.updateExercise);
router.delete('/exercises/:id', contentController.deleteExercise);

// Flashcards
router.get('/flashcards', contentController.getAllFlashcardDecks);
router.get('/flashcards/:id', contentController.getFlashcardDeckById);
router.post('/flashcards', contentController.createFlashcardDeck);
router.put('/flashcards/:id', contentController.updateFlashcardDeck);
router.delete('/flashcards/:id', contentController.deleteFlashcardDeck);

// Bulk operations
router.post('/content/bulk-publish', contentController.bulkPublish);
router.post('/content/bulk-unpublish', contentController.bulkUnpublish);
router.post('/content/bulk-delete', contentController.bulkDelete);

// Individual publish/unpublish
router.post('/content/:id/publish', contentController.publishContent);
router.post('/content/:id/unpublish', contentController.unpublishContent);

// Media upload
router.post('/media/upload', upload.single('file'), contentController.uploadMedia);

// Delete content by ID (generic)
router.delete('/content/:id', contentController.deleteContent);

export default router;
