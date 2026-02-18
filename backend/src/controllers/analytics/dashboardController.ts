import { Request, Response } from 'express';
import { aggregationService } from '../../services/analytics/aggregationService';
import { analyticsService } from '../../services/analyticsService';

/**
 * Dashboard Controller
 * Handles all analytics dashboard requests
 */
export class DashboardController {
  /**
   * Get overall dashboard metrics
   */
  async getDashboardOverview(req: Request, res: Response) {
    try {
      const [userMetrics, contentMetrics, engagementMetrics, progressMetrics, srsMetrics] =
        await Promise.all([
          analyticsService.getUserMetrics(),
          analyticsService.getContentMetrics(),
          analyticsService.getEngagementMetrics(),
          analyticsService.getProgressMetrics(),
          analyticsService.getSRSMetrics(),
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
    } catch (error: any) {
      console.error('Error fetching dashboard overview:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard overview',
        error: error.message,
      });
    }
  }

  /**
   * Get real-time metrics
   */
  async getRealTimeMetrics(req: Request, res: Response) {
    try {
      const metrics = await aggregationService.getRealTimeMetrics();

      res.json({
        success: true,
        data: metrics,
      });
    } catch (error: any) {
      console.error('Error fetching real-time metrics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch real-time metrics',
        error: error.message,
      });
    }
  }

  /**
   * Get time-series data for charts
   */
  async getTimeSeriesData(req: Request, res: Response) {
    try {
      const { metric, granularity, startDate, endDate } = req.query;

      if (!metric || !granularity || !startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Missing required parameters: metric, granularity, startDate, endDate',
        });
      }

      const data = await aggregationService.getTimeSeriesData(
        metric as string,
        granularity as 'daily' | 'weekly' | 'monthly' | 'yearly',
        new Date(startDate as string),
        new Date(endDate as string)
      );

      res.json({
        success: true,
        data,
      });
    } catch (error: any) {
      console.error('Error fetching time-series data:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch time-series data',
        error: error.message,
      });
    }
  }

  /**
   * Get user engagement metrics (DAU, MAU, retention)
   */
  async getUserEngagement(req: Request, res: Response) {
    try {
      const metrics = await aggregationService.getUserEngagementMetrics();

      res.json({
        success: true,
        data: metrics,
      });
    } catch (error: any) {
      console.error('Error fetching user engagement metrics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user engagement metrics',
        error: error.message,
      });
    }
  }

  /**
   * Get learning outcomes analytics
   */
  async getLearningOutcomes(req: Request, res: Response) {
    try {
      const metrics = await aggregationService.getLearningOutcomesAnalytics();

      res.json({
        success: true,
        data: metrics,
      });
    } catch (error: any) {
      console.error('Error fetching learning outcomes:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch learning outcomes',
        error: error.message,
      });
    }
  }

  /**
   * Get content performance metrics
   */
  async getContentPerformance(req: Request, res: Response) {
    try {
      const metrics = await aggregationService.getContentPerformance();

      res.json({
        success: true,
        data: metrics,
      });
    } catch (error: any) {
      console.error('Error fetching content performance:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch content performance',
        error: error.message,
      });
    }
  }

  /**
   * Get cohort analysis
   */
  async getCohortAnalysis(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Missing required parameters: startDate, endDate',
        });
      }

      const cohorts = await aggregationService.getCohortAnalysis(
        new Date(startDate as string),
        new Date(endDate as string)
      );

      res.json({
        success: true,
        data: cohorts,
      });
    } catch (error: any) {
      console.error('Error fetching cohort analysis:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch cohort analysis',
        error: error.message,
      });
    }
  }

  /**
   * Get funnel analysis
   */
  async getFunnelAnalysis(req: Request, res: Response) {
    try {
      const funnel = await aggregationService.getFunnelAnalysis();

      res.json({
        success: true,
        data: funnel,
      });
    } catch (error: any) {
      console.error('Error fetching funnel analysis:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch funnel analysis',
        error: error.message,
      });
    }
  }

  /**
   * Get A/B test results
   */
  async getABTestResults(req: Request, res: Response) {
    try {
      const { testName } = req.params;

      if (!testName) {
        return res.status(400).json({
          success: false,
          message: 'Test name is required',
        });
      }

      const results = await aggregationService.getABTestResults(testName);

      res.json({
        success: true,
        data: results,
      });
    } catch (error: any) {
      console.error('Error fetching A/B test results:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch A/B test results',
        error: error.message,
      });
    }
  }

  /**
   * Get predictive analytics - Churn prediction
   */
  async getChurnPrediction(req: Request, res: Response) {
    try {
      const predictions = await aggregationService.predictChurn();

      res.json({
        success: true,
        data: predictions,
      });
    } catch (error: any) {
      console.error('Error fetching churn prediction:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch churn prediction',
        error: error.message,
      });
    }
  }

  /**
   * Get predictive analytics - Completion probability
   */
  async getCompletionPrediction(req: Request, res: Response) {
    try {
      const predictions = await aggregationService.predictCompletion();

      res.json({
        success: true,
        data: predictions,
      });
    } catch (error: any) {
      console.error('Error fetching completion prediction:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch completion prediction',
        error: error.message,
      });
    }
  }

  /**
   * Get admin analytics - System metrics
   */
  async getSystemMetrics(req: Request, res: Response) {
    try {
      // Check if user is admin
      const user = (req as any).user;
      if (user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin privileges required.',
        });
      }

      const metrics = await aggregationService.getSystemMetrics();

      res.json({
        success: true,
        data: metrics,
      });
    } catch (error: any) {
      console.error('Error fetching system metrics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch system metrics',
        error: error.message,
      });
    }
  }

  /**
   * Get user activity logs
   */
  async getUserActivityLogs(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      if (user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin privileges required.',
        });
      }

      const { page = 1, limit = 50, userId, action, startDate, endDate } = req.query;

      // Mock implementation - would query AuditLog model
      const logs = {
        total: 245,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        data: [
          {
            id: '1',
            userId: '123',
            userName: 'John Doe',
            action: 'lesson_completed',
            resourceType: 'lesson',
            resourceId: 'lesson-5',
            timestamp: new Date(),
            ipAddress: '192.168.1.1',
            userAgent: 'Mozilla/5.0...',
          },
        ],
      };

      res.json({
        success: true,
        data: logs,
      });
    } catch (error: any) {
      console.error('Error fetching user activity logs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user activity logs',
        error: error.message,
      });
    }
  }

  /**
   * Get API usage statistics
   */
  async getAPIUsageStats(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      if (user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin privileges required.',
        });
      }

      // Mock implementation - would integrate with API monitoring service
      const stats = {
        totalRequests: 125478,
        requestsToday: 3456,
        averageResponseTime: 145,
        errorRate: 0.2,
        topEndpoints: [
          { endpoint: '/api/lessons', requests: 12456, avgResponseTime: 120 },
          { endpoint: '/api/progress', requests: 9876, avgResponseTime: 95 },
          { endpoint: '/api/quizzes', requests: 8765, avgResponseTime: 180 },
        ],
        statusCodes: {
          '200': 98234,
          '201': 5678,
          '400': 234,
          '401': 156,
          '404': 89,
          '500': 12,
        },
      };

      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error('Error fetching API usage stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch API usage stats',
        error: error.message,
      });
    }
  }

  /**
   * Get error rate monitoring
   */
  async getErrorRates(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      if (user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin privileges required.',
        });
      }

      const { granularity = 'hourly', hours = 24 } = req.query;

      // Mock implementation
      const errorRates = [];
      for (let i = parseInt(hours as string) - 1; i >= 0; i--) {
        const date = new Date();
        date.setHours(date.getHours() - i);
        errorRates.push({
          timestamp: date.toISOString(),
          errorCount: Math.floor(Math.random() * 10),
          totalRequests: Math.floor(Math.random() * 1000) + 500,
          errorRate: (Math.random() * 2).toFixed(2),
        });
      }

      res.json({
        success: true,
        data: errorRates,
      });
    } catch (error: any) {
      console.error('Error fetching error rates:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch error rates',
        error: error.message,
      });
    }
  }

  /**
   * Get resource utilization metrics
   */
  async getResourceUtilization(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      if (user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin privileges required.',
        });
      }

      // Mock implementation - would integrate with server monitoring
      const utilization = {
        cpu: {
          current: 45.2,
          average: 38.7,
          max: 89.3,
          trend: 'stable',
        },
        memory: {
          current: 62.1,
          average: 58.4,
          max: 78.9,
          trend: 'increasing',
        },
        disk: {
          current: 38.5,
          available: 61.5,
          total: '100GB',
          used: '38.5GB',
        },
        network: {
          inbound: '2.3 MB/s',
          outbound: '1.8 MB/s',
        },
      };

      res.json({
        success: true,
        data: utilization,
      });
    } catch (error: any) {
      console.error('Error fetching resource utilization:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch resource utilization',
        error: error.message,
      });
    }
  }
}

export const dashboardController = new DashboardController();
