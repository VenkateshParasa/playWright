import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import Exercise from '../models/Exercise.js';
import codeExecutionService from '../services/codeExecutionService.js';

/**
 * Get all exercises with optional filters
 */
export const getAllExercises = async (req: AuthRequest, res: Response) => {
  try {
    const {
      difficulty,
      category,
      language,
      tags,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query: any = { isPublished: true };

    // Apply filters
    if (difficulty) {
      query.difficulty = difficulty;
    }
    if (category) {
      query.category = category;
    }
    if (language) {
      query.language = language;
    }
    if (tags) {
      const tagArray = typeof tags === 'string' ? tags.split(',') : tags;
      query.tags = { $in: tagArray };
    }

    // Text search
    if (search) {
      query.$text = { $search: search as string };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sort: any = { [sortBy as string]: sortOrder === 'desc' ? -1 : 1 };

    const [exercises, total] = await Promise.all([
      Exercise.find(query)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .select('-solution -testCases') // Don't send solution and test cases to students
        .lean(),
      Exercise.countDocuments(query)
    ]);

    res.json({
      success: true,
      exercises,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get exercises error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exercises',
      error: (error as Error).message
    });
  }
};

/**
 * Get exercise by ID
 */
export const getExerciseById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const exercise = await Exercise.findById(id);

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found'
      });
    }

    // Increment view count
    await exercise.incrementView();

    // Filter out hidden test cases and solution for students
    const exerciseData = exercise.toObject();

    // Only show visible test cases
    exerciseData.testCases = exercise.getVisibleTestCases();

    // Remove solution unless user is admin/instructor
    if (!req.user || !['admin', 'instructor'].includes(req.user.role || '')) {
      delete exerciseData.solution;
    }

    res.json({
      success: true,
      exercise: exerciseData
    });
  } catch (error) {
    console.error('Get exercise error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exercise',
      error: (error as Error).message
    });
  }
};

/**
 * Get exercises by category
 */
export const getExercisesByCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const query = {
      category,
      isPublished: true
    };

    const skip = (Number(page) - 1) * Number(limit);

    const [exercises, total] = await Promise.all([
      Exercise.find(query)
        .sort({ difficulty: 1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select('-solution -testCases')
        .lean(),
      Exercise.countDocuments(query)
    ]);

    res.json({
      success: true,
      category,
      exercises,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get exercises by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exercises',
      error: (error as Error).message
    });
  }
};

/**
 * Get exercises by difficulty
 */
export const getExercisesByDifficulty = async (req: AuthRequest, res: Response) => {
  try {
    const { difficulty } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Validate difficulty
    if (!['beginner', 'intermediate', 'advanced'].includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid difficulty level'
      });
    }

    const query = {
      difficulty,
      isPublished: true
    };

    const skip = (Number(page) - 1) * Number(limit);

    const [exercises, total] = await Promise.all([
      Exercise.find(query)
        .sort({ category: 1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select('-solution -testCases')
        .lean(),
      Exercise.countDocuments(query)
    ]);

    res.json({
      success: true,
      difficulty,
      exercises,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get exercises by difficulty error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exercises',
      error: (error as Error).message
    });
  }
};

/**
 * Submit solution and run tests
 */
export const submitSolution = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { code } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Code is required'
      });
    }

    // Get exercise with all test cases
    const exercise = await Exercise.findById(id);

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found'
      });
    }

    // Validate code for security
    const validation = codeExecutionService.validateCode(code);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Code validation failed',
        errors: validation.errors
      });
    }

    // Execute code with test cases
    const result = await codeExecutionService.executeCode({
      code,
      language: exercise.language,
      testCases: exercise.testCases,
      timeout: 10000 // 10 seconds
    });

    // Record attempt
    await exercise.recordAttempt(result.allTestsPassed, result.score);

    // Filter out hidden test results for response
    const visibleTestResults = result.testResults.filter(tr => {
      const testCase = exercise.testCases.find(tc => tc.id === tr.testId);
      return testCase && !testCase.hidden;
    });

    // Send response with visible test results
    res.json({
      success: true,
      result: {
        ...result,
        testResults: visibleTestResults,
        hiddenTestCount: result.testResults.length - visibleTestResults.length
      }
    });
  } catch (error) {
    console.error('Submit solution error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to execute code',
      error: (error as Error).message
    });
  }
};

/**
 * Get exercise categories (aggregated)
 */
export const getCategories = async (req: AuthRequest, res: Response) => {
  try {
    const categories = await Exercise.aggregate([
      { $match: { isPublished: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          difficulties: { $addToSet: '$difficulty' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      categories: categories.map(c => ({
        name: c._id,
        count: c.count,
        difficulties: c.difficulties
      }))
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: (error as Error).message
    });
  }
};

/**
 * Get exercise statistics
 */
export const getExerciseStats = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const exercise = await Exercise.findById(id).select(
      'viewCount completionCount attemptCount averageScore'
    );

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found'
      });
    }

    const completionRate = exercise.attemptCount > 0
      ? Math.round((exercise.completionCount / exercise.attemptCount) * 100)
      : 0;

    res.json({
      success: true,
      stats: {
        viewCount: exercise.viewCount,
        completionCount: exercise.completionCount,
        attemptCount: exercise.attemptCount,
        averageScore: Math.round(exercise.averageScore),
        completionRate
      }
    });
  } catch (error) {
    console.error('Get exercise stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exercise stats',
      error: (error as Error).message
    });
  }
};

export default {
  getAllExercises,
  getExerciseById,
  getExercisesByCategory,
  getExercisesByDifficulty,
  submitSolution,
  getCategories,
  getExerciseStats
};
