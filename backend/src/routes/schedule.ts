/**
 * Schedule Routes
 * API routes for schedule and calendar operations
 */

import express from 'express';
import {
  getCalendarData,
  getForecastData,
  getHeatmapData,
  getRetentionCurve,
  getDayBreakdown,
  getSettings,
  updateSettings,
  getStudyTimeAnalytics,
  rescheduleCards,
} from '../controllers/scheduleController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/schedule/calendar
 * @desc    Get calendar data for date range
 * @query   start: YYYY-MM-DD, end: YYYY-MM-DD
 * @access  Private
 */
router.get('/calendar', getCalendarData);

/**
 * @route   GET /api/schedule/forecast
 * @desc    Get forecast for next N days
 * @query   days: number (default: 7)
 * @access  Private
 */
router.get('/forecast', getForecastData);

/**
 * @route   GET /api/schedule/heatmap
 * @desc    Get heatmap data for a year
 * @query   year: number (default: current year)
 * @access  Private
 */
router.get('/heatmap', getHeatmapData);

/**
 * @route   GET /api/schedule/retention
 * @desc    Get retention curve data
 * @query   category: string (optional)
 * @access  Private
 */
router.get('/retention', getRetentionCurve);

/**
 * @route   GET /api/schedule/breakdown/:date
 * @desc    Get cards due on specific date
 * @param   date: YYYY-MM-DD
 * @access  Private
 */
router.get('/breakdown/:date', getDayBreakdown);

/**
 * @route   GET /api/schedule/settings
 * @desc    Get user's schedule settings
 * @access  Private
 */
router.get('/settings', getSettings);

/**
 * @route   PUT /api/schedule/settings
 * @desc    Update schedule settings
 * @body    Partial schedule settings
 * @access  Private
 */
router.put('/settings', updateSettings);

/**
 * @route   GET /api/schedule/study-time
 * @desc    Get study time analytics
 * @access  Private
 */
router.get('/study-time', getStudyTimeAnalytics);

/**
 * @route   POST /api/schedule/reschedule
 * @desc    Manually reschedule cards
 * @body    { items: [{ cardId, newDueDate, reason? }] }
 * @access  Private
 */
router.post('/reschedule', rescheduleCards);

export default router;
