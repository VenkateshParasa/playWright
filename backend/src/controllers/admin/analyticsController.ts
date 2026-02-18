import { Request, Response } from 'express';
import { analyticsService } from '../../services/analyticsService';

/**
 * Analytics Controller for Admin Dashboard
 * Provides aggregated metrics and insights
 */

/**
 * Get user metrics (growth, retention, engagement)
 */
export const getUserMetrics = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const dateRange =
      startDate && endDate
        ? {
            startDate: new Date(startDate as string),
            endDate: new Date(endDate as string),
          }
        : undefined;

    const metrics = await analyticsService.getUserMetrics(dateRange);

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error('Error fetching user metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user metrics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get content metrics (lessons, quizzes, completion rates)
 */
export const getContentMetrics = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const dateRange =
      startDate && endDate
        ? {
            startDate: new Date(startDate as string),
            endDate: new Date(endDate as string),
          }
        : undefined;

    const metrics = await analyticsService.getContentMetrics(dateRange);

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error('Error fetching content metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch content metrics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get engagement metrics (study time, sessions, activity)
 */
export const getEngagementMetrics = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const dateRange =
      startDate && endDate
        ? {
            startDate: new Date(startDate as string),
            endDate: new Date(endDate as string),
          }
        : undefined;

    const metrics = await analyticsService.getEngagementMetrics(dateRange);

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error('Error fetching engagement metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch engagement metrics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get progress metrics (completion rates, stuck users)
 */
export const getProgressMetrics = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const dateRange =
      startDate && endDate
        ? {
            startDate: new Date(startDate as string),
            endDate: new Date(endDate as string),
          }
        : undefined;

    const metrics = await analyticsService.getProgressMetrics(dateRange);

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error('Error fetching progress metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch progress metrics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get SRS metrics (cards, reviews, retention)
 */
export const getSRSMetrics = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const dateRange =
      startDate && endDate
        ? {
            startDate: new Date(startDate as string),
            endDate: new Date(endDate as string),
          }
        : undefined;

    const metrics = await analyticsService.getSRSMetrics(dateRange);

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error('Error fetching SRS metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch SRS metrics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get all metrics combined (overview)
 */
export const getOverviewMetrics = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const dateRange =
      startDate && endDate
        ? {
            startDate: new Date(startDate as string),
            endDate: new Date(endDate as string),
          }
        : undefined;

    // Fetch all metrics in parallel for better performance
    const [userMetrics, contentMetrics, engagementMetrics, progressMetrics, srsMetrics] =
      await Promise.all([
        analyticsService.getUserMetrics(dateRange),
        analyticsService.getContentMetrics(dateRange),
        analyticsService.getEngagementMetrics(dateRange),
        analyticsService.getProgressMetrics(dateRange),
        analyticsService.getSRSMetrics(dateRange),
      ]);

    res.json({
      success: true,
      data: {
        users: userMetrics,
        content: contentMetrics,
        engagement: engagementMetrics,
        progress: progressMetrics,
        srs: srsMetrics,
      },
    });
  } catch (error) {
    console.error('Error fetching overview metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch overview metrics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Generate analytics report
 */
export const generateReport = async (req: Request, res: Response) => {
  try {
    const {
      startDate,
      endDate,
      metrics = ['users', 'content', 'engagement', 'progress', 'srs'],
      format = 'json',
    } = req.body;

    const dateRange =
      startDate && endDate
        ? {
            startDate: new Date(startDate),
            endDate: new Date(endDate),
          }
        : undefined;

    // Fetch requested metrics
    const reportData: any = {
      generatedAt: new Date().toISOString(),
      dateRange,
    };

    if (metrics.includes('users')) {
      reportData.users = await analyticsService.getUserMetrics(dateRange);
    }

    if (metrics.includes('content')) {
      reportData.content = await analyticsService.getContentMetrics(dateRange);
    }

    if (metrics.includes('engagement')) {
      reportData.engagement = await analyticsService.getEngagementMetrics(dateRange);
    }

    if (metrics.includes('progress')) {
      reportData.progress = await analyticsService.getProgressMetrics(dateRange);
    }

    if (metrics.includes('srs')) {
      reportData.srs = await analyticsService.getSRSMetrics(dateRange);
    }

    // Return data in requested format
    if (format === 'json') {
      res.json({
        success: true,
        data: reportData,
      });
    } else if (format === 'csv') {
      // Convert to CSV format (simplified)
      const csv = convertToCSV(reportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=analytics-report.csv');
      res.send(csv);
    } else {
      res.json({
        success: true,
        data: reportData,
      });
    }
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate report',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Helper function to convert data to CSV
 */
function convertToCSV(data: any): string {
  const rows: string[] = [];

  // Add header
  rows.push('Metric,Value');

  // Add user metrics
  if (data.users) {
    rows.push(`Total Users,${data.users.totalUsers}`);
    rows.push(`New Users Today,${data.users.newUsersToday}`);
    rows.push(`Active Users Today,${data.users.activeUsersToday}`);
    rows.push(`Retention Rate,${data.users.userRetentionRate.toFixed(2)}%`);
  }

  // Add content metrics
  if (data.content) {
    rows.push(`Total Lessons,${data.content.totalLessons}`);
    rows.push(`Total Quizzes,${data.content.totalQuizzes}`);
    rows.push(`Total Exercises,${data.content.totalExercises}`);
    rows.push(`Total Flashcards,${data.content.totalFlashcards}`);
  }

  // Add engagement metrics
  if (data.engagement) {
    rows.push(`Total Study Time,${data.engagement.totalStudyTime} minutes`);
    rows.push(
      `Average Study Time Per User,${data.engagement.averageStudyTimePerUser.toFixed(2)} minutes`
    );
    rows.push(`Daily Active Sessions,${data.engagement.dailyActiveSessions}`);
  }

  return rows.join('\n');
}
