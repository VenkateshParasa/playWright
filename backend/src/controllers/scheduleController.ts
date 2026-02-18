/**
 * Schedule Controller
 * Handles HTTP requests for schedule-related operations
 */

import { Request, Response } from 'express';
import { scheduleService } from '../services/scheduleService';

/**
 * Get calendar data
 * GET /api/schedule/calendar?start=YYYY-MM-DD&end=YYYY-MM-DD
 */
export const getCalendarData = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { start, end } = req.query;

    if (!start || !end) {
      res.status(400).json({ message: 'Start and end dates are required' });
      return;
    }

    const startDate = new Date(start as string);
    const endDate = new Date(end as string);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      res.status(400).json({ message: 'Invalid date format' });
      return;
    }

    const calendar = await scheduleService.getCalendarData(userId, startDate, endDate);

    res.json({ calendar });
  } catch (error) {
    console.error('Error getting calendar data:', error);
    res.status(500).json({ message: 'Failed to fetch calendar data' });
  }
};

/**
 * Get forecast data
 * GET /api/schedule/forecast?days=30
 */
export const getForecastData = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const days = parseInt(req.query.days as string) || 7;

    if (days < 1 || days > 365) {
      res.status(400).json({ message: 'Days must be between 1 and 365' });
      return;
    }

    const forecast = await scheduleService.getForecastData(userId, days);

    res.json({ forecast });
  } catch (error) {
    console.error('Error getting forecast data:', error);
    res.status(500).json({ message: 'Failed to fetch forecast data' });
  }
};

/**
 * Get heatmap data
 * GET /api/schedule/heatmap?year=2024
 */
export const getHeatmapData = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const year = parseInt(req.query.year as string) || new Date().getFullYear();

    if (year < 2000 || year > 2100) {
      res.status(400).json({ message: 'Invalid year' });
      return;
    }

    const heatmap = await scheduleService.getHeatmapData(userId, year);

    res.json({ heatmap });
  } catch (error) {
    console.error('Error getting heatmap data:', error);
    res.status(500).json({ message: 'Failed to fetch heatmap data' });
  }
};

/**
 * Get retention curve
 * GET /api/schedule/retention?category=xyz
 */
export const getRetentionCurve = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const categoryId = req.query.category as string | undefined;

    const retentionCurve = await scheduleService.getRetentionCurve(userId, categoryId);

    res.json({ retentionCurve });
  } catch (error) {
    console.error('Error getting retention curve:', error);
    res.status(500).json({ message: 'Failed to fetch retention curve' });
  }
};

/**
 * Get day breakdown
 * GET /api/schedule/breakdown/:date
 */
export const getDayBreakdown = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { date } = req.params;

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
      return;
    }

    const breakdown = await scheduleService.getDayBreakdown(userId, date);

    res.json({ breakdown });
  } catch (error) {
    console.error('Error getting day breakdown:', error);
    res.status(500).json({ message: 'Failed to fetch day breakdown' });
  }
};

/**
 * Get schedule settings
 * GET /api/schedule/settings
 */
export const getSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    // For now, return default settings
    // In a real app, these would be stored per-user in the database
    const settings = {
      maxNewCardsPerDay: 20,
      maxReviewsPerDay: 200,
      learningSteps: [1, 10, 60, 1440],
      graduatingInterval: 1,
      easyIntervalMultiplier: 1.3,
      maximumInterval: 36500,
      reviewOrder: 'due-date',
      newCardIntroductionRate: 20,
    };

    res.json({ settings });
  } catch (error) {
    console.error('Error getting settings:', error);
    res.status(500).json({ message: 'Failed to fetch settings' });
  }
};

/**
 * Update schedule settings
 * PUT /api/schedule/settings
 */
export const updateSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const newSettings = req.body;

    // Validate settings
    if (newSettings.maxNewCardsPerDay !== undefined) {
      if (newSettings.maxNewCardsPerDay < 0 || newSettings.maxNewCardsPerDay > 999) {
        res.status(400).json({ message: 'Max new cards must be between 0 and 999' });
        return;
      }
    }

    if (newSettings.maxReviewsPerDay !== undefined) {
      if (newSettings.maxReviewsPerDay < 0 || newSettings.maxReviewsPerDay > 9999) {
        res.status(400).json({ message: 'Max reviews must be between 0 and 9999' });
        return;
      }
    }

    // In a real app, save to database
    // For now, just return the updated settings
    const settings = {
      maxNewCardsPerDay: newSettings.maxNewCardsPerDay || 20,
      maxReviewsPerDay: newSettings.maxReviewsPerDay || 200,
      learningSteps: newSettings.learningSteps || [1, 10, 60, 1440],
      graduatingInterval: newSettings.graduatingInterval || 1,
      easyIntervalMultiplier: newSettings.easyIntervalMultiplier || 1.3,
      maximumInterval: newSettings.maximumInterval || 36500,
      reviewOrder: newSettings.reviewOrder || 'due-date',
      newCardIntroductionRate: newSettings.newCardIntroductionRate || 20,
    };

    res.json({ settings });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Failed to update settings' });
  }
};

/**
 * Get study time analytics
 * GET /api/schedule/study-time
 */
export const getStudyTimeAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    const analytics = await scheduleService.getStudyTimeAnalytics(userId);

    res.json({ analytics });
  } catch (error) {
    console.error('Error getting study time analytics:', error);
    res.status(500).json({ message: 'Failed to fetch study time analytics' });
  }
};

/**
 * Manual reschedule cards
 * POST /api/schedule/reschedule
 */
export const rescheduleCards = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ message: 'Items array is required' });
      return;
    }

    // Validate items
    for (const item of items) {
      if (!item.cardId || !item.newDueDate) {
        res.status(400).json({ message: 'Each item must have cardId and newDueDate' });
        return;
      }

      // Validate date
      const newDate = new Date(item.newDueDate);
      if (isNaN(newDate.getTime())) {
        res.status(400).json({ message: 'Invalid date format' });
        return;
      }
    }

    await scheduleService.rescheduleCards(userId, items);

    res.json({ message: 'Cards rescheduled successfully' });
  } catch (error) {
    console.error('Error rescheduling cards:', error);
    res.status(500).json({ message: 'Failed to reschedule cards' });
  }
};
