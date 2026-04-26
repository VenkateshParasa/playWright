import { Router } from 'express';
import {
  getAllExercises,
  getExerciseById,
  getExercisesByCategory,
  getExercisesByDifficulty,
  submitSolution,
  getCategories,
  getExerciseStats
} from '../controllers/exerciseController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = Router();

/**
 * @route   GET /api/exercises
 * @desc    Get all exercises with optional filters
 * @access  Public
 * @query   difficulty, category, language, tags, search, page, limit, sortBy, sortOrder
 */
router.get('/', optionalAuth, getAllExercises);

/**
 * @route   GET /api/exercises/categories
 * @desc    Get all exercise categories with counts
 * @access  Public
 */
router.get('/categories', getCategories);

/**
 * @route   GET /api/exercises/category/:category
 * @desc    Get exercises by category
 * @access  Public
 * @params  category
 */
router.get('/category/:category', optionalAuth, getExercisesByCategory);

/**
 * @route   GET /api/exercises/difficulty/:difficulty
 * @desc    Get exercises by difficulty level
 * @access  Public
 * @params  difficulty (beginner, intermediate, advanced)
 */
router.get('/difficulty/:difficulty', optionalAuth, getExercisesByDifficulty);

/**
 * @route   GET /api/exercises/:id
 * @desc    Get specific exercise by ID
 * @access  Public
 * @params  id
 */
router.get('/:id', optionalAuth, getExerciseById);

/**
 * @route   GET /api/exercises/:id/stats
 * @desc    Get exercise statistics
 * @access  Public
 * @params  id
 */
router.get('/:id/stats', getExerciseStats);

/**
 * @route   POST /api/exercises/:id/submit
 * @desc    Submit solution and run tests
 * @access  Private (requires authentication)
 * @params  id
 * @body    { code: string }
 */
router.post('/:id/submit', authenticate, submitSolution);

export default router;
