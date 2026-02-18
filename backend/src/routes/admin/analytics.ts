import express from 'express';
import {
  getUserMetrics,
  getContentMetrics,
  getEngagementMetrics,
  getProgressMetrics,
  getSRSMetrics,
  getOverviewMetrics,
  generateReport,
} from '../../controllers/admin/analyticsController';
import { protect, restrictTo } from '../../middleware/auth';

const router = express.Router();

// Protect all routes - require authentication and admin role
router.use(protect);
router.use(restrictTo('admin'));

/**
 * @route   GET /api/admin/analytics/users
 * @desc    Get user metrics (growth, retention, engagement)
 * @access  Admin
 * @query   startDate, endDate (optional)
 */
router.get('/users', getUserMetrics);

/**
 * @route   GET /api/admin/analytics/content
 * @desc    Get content metrics (lessons, quizzes, completion rates)
 * @access  Admin
 * @query   startDate, endDate (optional)
 */
router.get('/content', getContentMetrics);

/**
 * @route   GET /api/admin/analytics/engagement
 * @desc    Get engagement metrics (study time, sessions, activity)
 * @access  Admin
 * @query   startDate, endDate (optional)
 */
router.get('/engagement', getEngagementMetrics);

/**
 * @route   GET /api/admin/analytics/progress
 * @desc    Get progress metrics (completion rates, stuck users)
 * @access  Admin
 * @query   startDate, endDate (optional)
 */
router.get('/progress', getProgressMetrics);

/**
 * @route   GET /api/admin/analytics/srs
 * @desc    Get SRS metrics (cards, reviews, retention)
 * @access  Admin
 * @query   startDate, endDate (optional)
 */
router.get('/srs', getSRSMetrics);

/**
 * @route   GET /api/admin/analytics/overview
 * @desc    Get all metrics combined
 * @access  Admin
 * @query   startDate, endDate (optional)
 */
router.get('/overview', getOverviewMetrics);

/**
 * @route   POST /api/admin/analytics/report
 * @desc    Generate analytics report
 * @access  Admin
 * @body    { startDate, endDate, metrics[], format }
 */
router.post('/report', generateReport);

export default router;
