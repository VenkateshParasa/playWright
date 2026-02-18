import { Request, Response } from 'express';
import { reportBuilderService } from '../../services/analytics/reportBuilder';
import { ICustomReport } from '../../models/CustomReport';

/**
 * Report Controller
 * Handles custom report creation, execution, and export
 */
export class ReportController {
  /**
   * Get all reports for the current user
   */
  async getUserReports(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const reports = await reportBuilderService.getUserReports(userId);

      res.json({
        success: true,
        data: reports,
      });
    } catch (error: any) {
      console.error('Error fetching user reports:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user reports',
        error: error.message,
      });
    }
  }

  /**
   * Get a specific report by ID
   */
  async getReportById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;

      const reports = await reportBuilderService.getUserReports(userId);
      const report = reports.find((r) => r._id.toString() === id);

      if (!report) {
        return res.status(404).json({
          success: false,
          message: 'Report not found',
        });
      }

      res.json({
        success: true,
        data: report,
      });
    } catch (error: any) {
      console.error('Error fetching report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch report',
        error: error.message,
      });
    }
  }

  /**
   * Create a new custom report
   */
  async createReport(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const reportData: Partial<ICustomReport> = req.body;

      // Validate required fields
      if (!reportData.name || !reportData.dataSource || !reportData.category) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: name, dataSource, category',
        });
      }

      const report = await reportBuilderService.createReport(reportData, userId);

      res.status(201).json({
        success: true,
        data: report,
        message: 'Report created successfully',
      });
    } catch (error: any) {
      console.error('Error creating report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create report',
        error: error.message,
      });
    }
  }

  /**
   * Update an existing report
   */
  async updateReport(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      const updates: Partial<ICustomReport> = req.body;

      const report = await reportBuilderService.updateReport(id, updates, userId);

      res.json({
        success: true,
        data: report,
        message: 'Report updated successfully',
      });
    } catch (error: any) {
      console.error('Error updating report:', error);
      const statusCode = error.message === 'Access denied' ? 403 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to update report',
      });
    }
  }

  /**
   * Delete a report
   */
  async deleteReport(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;

      await reportBuilderService.deleteReport(id, userId);

      res.json({
        success: true,
        message: 'Report deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting report:', error);
      const statusCode = error.message === 'Access denied' ? 403 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to delete report',
      });
    }
  }

  /**
   * Execute a report and get results
   */
  async executeReport(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;

      const result = await reportBuilderService.executeReport(id, userId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('Error executing report:', error);
      const statusCode = error.message === 'Access denied' ? 403 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to execute report',
      });
    }
  }

  /**
   * Export report data
   */
  async exportReport(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      const { format = 'csv', includeCharts = false, includeMetadata = true } = req.query;

      if (!['csv', 'excel', 'pdf'].includes(format as string)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid format. Supported formats: csv, excel, pdf',
        });
      }

      const filePath = await reportBuilderService.exportReport(id, userId, {
        format: format as 'csv' | 'excel' | 'pdf',
        includeCharts: includeCharts === 'true',
        includeMetadata: includeMetadata === 'true',
      });

      // Set appropriate headers for file download
      const fileName = `report-${id}-${Date.now()}.${format}`;
      res.download(filePath, fileName, (err) => {
        if (err) {
          console.error('Error downloading file:', err);
        }
        // Clean up file after download
        const fs = require('fs');
        fs.unlinkSync(filePath);
      });
    } catch (error: any) {
      console.error('Error exporting report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export report',
        error: error.message,
      });
    }
  }

  /**
   * Clone a report
   */
  async cloneReport(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      const { name } = req.body;

      const clonedReport = await reportBuilderService.cloneReport(id, userId, name);

      res.status(201).json({
        success: true,
        data: clonedReport,
        message: 'Report cloned successfully',
      });
    } catch (error: any) {
      console.error('Error cloning report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clone report',
        error: error.message,
      });
    }
  }

  /**
   * Share a report with other users
   */
  async shareReport(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      const { userIds, permission = 'view' } = req.body;

      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'userIds must be a non-empty array',
        });
      }

      if (!['view', 'edit'].includes(permission)) {
        return res.status(400).json({
          success: false,
          message: 'Permission must be either "view" or "edit"',
        });
      }

      const report = await reportBuilderService.shareReport(id, userIds, permission, userId);

      res.json({
        success: true,
        data: report,
        message: 'Report shared successfully',
      });
    } catch (error: any) {
      console.error('Error sharing report:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to share report',
      });
    }
  }

  /**
   * Get report templates
   */
  async getReportTemplates(req: Request, res: Response) {
    try {
      const templates = await reportBuilderService.getReportTemplates();

      res.json({
        success: true,
        data: templates,
      });
    } catch (error: any) {
      console.error('Error fetching report templates:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch report templates',
        error: error.message,
      });
    }
  }

  /**
   * Schedule a report
   */
  async scheduleReport(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;

      await reportBuilderService.scheduleReport(id, userId);

      res.json({
        success: true,
        message: 'Report scheduled successfully',
      });
    } catch (error: any) {
      console.error('Error scheduling report:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to schedule report',
      });
    }
  }

  /**
   * Get available data sources and fields
   */
  async getDataSourceSchema(req: Request, res: Response) {
    try {
      const { dataSource } = req.params;

      const schemas: Record<string, any> = {
        users: {
          fields: [
            { name: 'email', type: 'string', filterable: true, aggregatable: false },
            { name: 'firstName', type: 'string', filterable: true, aggregatable: false },
            { name: 'lastName', type: 'string', filterable: true, aggregatable: false },
            { name: 'role', type: 'string', filterable: true, aggregatable: false },
            { name: 'status', type: 'string', filterable: true, aggregatable: false },
            { name: 'isEmailVerified', type: 'boolean', filterable: true, aggregatable: false },
            { name: 'createdAt', type: 'date', filterable: true, aggregatable: false },
            { name: 'lastLogin', type: 'date', filterable: true, aggregatable: false },
          ],
          metrics: [
            { name: 'count', aggregation: 'count' },
            { name: 'distinct', aggregation: 'distinct' },
          ],
        },
        progress: {
          fields: [
            { name: 'totalXP', type: 'number', filterable: true, aggregatable: true },
            { name: 'currentLevel', type: 'number', filterable: true, aggregatable: true },
            { name: 'lessonsCompleted', type: 'number', filterable: true, aggregatable: true },
            { name: 'quizzesCompleted', type: 'number', filterable: true, aggregatable: true },
            { name: 'quizzesPassed', type: 'number', filterable: true, aggregatable: true },
            { name: 'totalStudyTime', type: 'number', filterable: true, aggregatable: true },
            { name: 'streak.currentStreak', type: 'number', filterable: true, aggregatable: true },
            { name: 'createdAt', type: 'date', filterable: true, aggregatable: false },
          ],
          metrics: [
            { name: 'count', aggregation: 'count' },
            { name: 'sum', aggregation: 'sum' },
            { name: 'avg', aggregation: 'avg' },
            { name: 'min', aggregation: 'min' },
            { name: 'max', aggregation: 'max' },
          ],
        },
        flashcards: {
          fields: [
            { name: 'deck', type: 'string', filterable: true, aggregatable: false },
            { name: 'difficulty', type: 'string', filterable: true, aggregatable: false },
            { name: 'interval', type: 'number', filterable: true, aggregatable: true },
            { name: 'repetitions', type: 'number', filterable: true, aggregatable: true },
            { name: 'easeFactor', type: 'number', filterable: true, aggregatable: true },
            { name: 'createdAt', type: 'date', filterable: true, aggregatable: false },
            { name: 'nextReviewDate', type: 'date', filterable: true, aggregatable: false },
          ],
          metrics: [
            { name: 'count', aggregation: 'count' },
            { name: 'avg', aggregation: 'avg' },
          ],
        },
      };

      const schema = schemas[dataSource];
      if (!schema) {
        return res.status(404).json({
          success: false,
          message: 'Data source not found',
        });
      }

      res.json({
        success: true,
        data: schema,
      });
    } catch (error: any) {
      console.error('Error fetching data source schema:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch data source schema',
        error: error.message,
      });
    }
  }

  /**
   * Get report statistics (for admin)
   */
  async getReportStatistics(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      if (user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin privileges required.',
        });
      }

      // Mock statistics - would query actual data in production
      const stats = {
        totalReports: 156,
        publicReports: 42,
        templateReports: 18,
        scheduledReports: 23,
        reportsGeneratedToday: 89,
        averageExecutionTime: 234, // milliseconds
        mostUsedDataSource: 'progress',
        topReportCreators: [
          { userId: '123', userName: 'Admin User', reportCount: 23 },
          { userId: '456', userName: 'Analytics Manager', reportCount: 18 },
        ],
      };

      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error('Error fetching report statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch report statistics',
        error: error.message,
      });
    }
  }
}

export const reportController = new ReportController();
