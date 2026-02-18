/**
 * Progress Routes
 * API endpoints for progress tracking and analytics
 */

import { Router } from 'express';
import * as progressController from '../controllers/progressController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ============================================================================
// Progress Statistics Routes
// ============================================================================

/**
 * GET /api/progress
 * Get comprehensive progress statistics for the authenticated user
 */
router.get('/', progressController.getProgressStatistics);

/**
 * GET /api/progress/overall
 * Get overall progress summary
 */
router.get('/overall', progressController.getOverallProgress);

/**
 * GET /api/progress/modules
 * Get progress by module/week
 */
router.get('/modules', progressController.getModuleProgress);

/**
 * GET /api/progress/modules/:moduleId
 * Get specific module progress
 */
router.get('/modules/:moduleId', progressController.getModuleProgressById);

// ============================================================================
// Time-Based Progress Routes
// ============================================================================

/**
 * GET /api/progress/daily
 * Get daily progress statistics
 * Query params: startDate, endDate
 */
router.get('/daily', progressController.getDailyProgress);

/**
 * GET /api/progress/weekly
 * Get weekly progress statistics
 * Query params: weekNumber
 */
router.get('/weekly', progressController.getWeeklyProgress);

/**
 * GET /api/progress/monthly
 * Get monthly progress statistics
 * Query params: month, year
 */
router.get('/monthly', progressController.getMonthlyProgress);

// ============================================================================
// Milestone Routes
// ============================================================================

/**
 * GET /api/progress/milestones
 * Get all milestones and their status
 */
router.get('/milestones', progressController.getMilestones);

/**
 * GET /api/progress/milestones/completed
 * Get completed milestones
 */
router.get('/milestones/completed', progressController.getCompletedMilestones);

/**
 * POST /api/progress/milestones/:milestoneId/celebrate
 * Mark milestone as celebrated
 */
router.post('/milestones/:milestoneId/celebrate', progressController.celebrateMilestone);

// ============================================================================
// Performance Metrics Routes
// ============================================================================

/**
 * GET /api/progress/performance
 * Get performance metrics (scores, retention, etc.)
 */
router.get('/performance', progressController.getPerformanceMetrics);

/**
 * GET /api/progress/analytics
 * Get advanced analytics and trends
 */
router.get('/analytics', progressController.getProgressAnalytics);

// ============================================================================
// Report Generation Routes
// ============================================================================

/**
 * POST /api/progress/report/generate
 * Generate a progress report
 * Body: { startDate, endDate, format }
 */
router.post('/report/generate', progressController.generateReport);

/**
 * GET /api/progress/report/export
 * Export progress data
 * Query params: format (csv, json, pdf), startDate, endDate
 */
router.get('/report/export', progressController.exportProgress);

// ============================================================================
// Sync and Update Routes
// ============================================================================

/**
 * POST /api/progress/sync
 * Sync local progress with server
 * Body: { lessons, quizzes, exercises, flashcards, streak, studyTime }
 */
router.post('/sync', progressController.syncProgress);

/**
 * PUT /api/progress/update
 * Update specific progress item
 * Body: { type, itemId, completed, score, timeSpent }
 */
router.put('/update', progressController.updateProgress);

/**
 * POST /api/progress/reset
 * Reset progress (admin only or with confirmation)
 */
router.post('/reset', progressController.resetProgress);

// ============================================================================
// Streak Routes
// ============================================================================

/**
 * GET /api/progress/streak
 * Get current streak information
 */
router.get('/streak', progressController.getStreak);

/**
 * POST /api/progress/streak/update
 * Update streak (called when user completes activity)
 */
router.post('/streak/update', progressController.updateStreak);

export default router;
