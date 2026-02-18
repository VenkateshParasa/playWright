import { CustomReport, ICustomReport, IReportFilter } from '../../models/CustomReport';
import { User } from '../../models/User';
import { UserProgress } from '../../models/UserProgress';
import { Card } from '../../models/Card';
import mongoose from 'mongoose';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { Parser } from 'json2csv';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';

export interface ReportResult {
  data: any[];
  metadata: {
    reportName: string;
    generatedAt: Date;
    rowCount: number;
    executionTime: number;
    filters: IReportFilter[];
  };
}

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  includeCharts?: boolean;
  includeMetadata?: boolean;
}

export class ReportBuilderService {
  /**
   * Execute a custom report
   */
  async executeReport(reportId: string, userId: string): Promise<ReportResult> {
    const startTime = Date.now();

    const report = await CustomReport.findById(reportId);
    if (!report) {
      throw new Error('Report not found');
    }

    // Check permissions
    if (!this.canAccessReport(report, userId)) {
      throw new Error('Access denied');
    }

    // Build and execute query
    const data = await this.buildAndExecuteQuery(report);

    // Update report metadata
    const executionTime = Date.now() - startTime;
    report.lastGenerated = new Date();
    report.generationCount += 1;
    report.averageGenerationTime =
      (report.averageGenerationTime * (report.generationCount - 1) + executionTime) /
      report.generationCount;
    await report.save();

    return {
      data,
      metadata: {
        reportName: report.name,
        generatedAt: new Date(),
        rowCount: data.length,
        executionTime,
        filters: report.filters,
      },
    };
  }

  /**
   * Create a new custom report
   */
  async createReport(reportData: Partial<ICustomReport>, userId: string): Promise<ICustomReport> {
    const report = new CustomReport({
      ...reportData,
      createdBy: userId,
      generationCount: 0,
      averageGenerationTime: 0,
    });

    // Calculate next run time if scheduling is enabled
    if (report.schedule?.enabled) {
      report.schedule.nextRun = this.calculateNextRunTime(report.schedule);
    }

    await report.save();
    return report;
  }

  /**
   * Update an existing report
   */
  async updateReport(
    reportId: string,
    updates: Partial<ICustomReport>,
    userId: string
  ): Promise<ICustomReport> {
    const report = await CustomReport.findById(reportId);
    if (!report) {
      throw new Error('Report not found');
    }

    // Check permissions
    if (!this.canEditReport(report, userId)) {
      throw new Error('Access denied');
    }

    Object.assign(report, updates);

    // Recalculate next run time if schedule was updated
    if (updates.schedule?.enabled) {
      report.schedule!.nextRun = this.calculateNextRunTime(report.schedule!);
    }

    await report.save();
    return report;
  }

  /**
   * Delete a report
   */
  async deleteReport(reportId: string, userId: string): Promise<void> {
    const report = await CustomReport.findById(reportId);
    if (!report) {
      throw new Error('Report not found');
    }

    // Check permissions (only creator or admin can delete)
    if (report.createdBy.toString() !== userId) {
      const user = await User.findById(userId);
      if (user?.role !== 'admin') {
        throw new Error('Access denied');
      }
    }

    await CustomReport.findByIdAndDelete(reportId);
  }

  /**
   * Get all reports for a user
   */
  async getUserReports(userId: string): Promise<ICustomReport[]> {
    const reports = await CustomReport.find({
      $or: [
        { createdBy: userId },
        { isPublic: true },
        { 'sharedWith.userId': userId },
      ],
    })
      .sort({ updatedAt: -1 })
      .populate('createdBy', 'firstName lastName email');

    return reports;
  }

  /**
   * Get report templates
   */
  async getReportTemplates(): Promise<ICustomReport[]> {
    const templates = await CustomReport.find({ isTemplate: true })
      .sort({ name: 1 })
      .populate('createdBy', 'firstName lastName');

    return templates;
  }

  /**
   * Clone a report or template
   */
  async cloneReport(reportId: string, userId: string, name?: string): Promise<ICustomReport> {
    const originalReport = await CustomReport.findById(reportId);
    if (!originalReport) {
      throw new Error('Report not found');
    }

    const clonedData = originalReport.toObject();
    delete clonedData._id;
    delete clonedData.createdAt;
    delete clonedData.updatedAt;

    const clonedReport = new CustomReport({
      ...clonedData,
      name: name || `${originalReport.name} (Copy)`,
      createdBy: userId,
      isPublic: false,
      isTemplate: false,
      generationCount: 0,
      averageGenerationTime: 0,
      lastGenerated: undefined,
      sharedWith: [],
    });

    await clonedReport.save();
    return clonedReport;
  }

  /**
   * Share a report with other users
   */
  async shareReport(
    reportId: string,
    userIds: string[],
    permission: 'view' | 'edit',
    ownerId: string
  ): Promise<ICustomReport> {
    const report = await CustomReport.findById(reportId);
    if (!report) {
      throw new Error('Report not found');
    }

    if (report.createdBy.toString() !== ownerId) {
      throw new Error('Only the report owner can share it');
    }

    // Add new shares
    for (const userId of userIds) {
      const existingShare = report.sharedWith.find(
        (share) => share.userId.toString() === userId
      );

      if (!existingShare) {
        report.sharedWith.push({
          userId: new mongoose.Types.ObjectId(userId),
          permission,
        });
      }
    }

    await report.save();
    return report;
  }

  /**
   * Export report data
   */
  async exportReport(
    reportId: string,
    userId: string,
    options: ExportOptions
  ): Promise<string> {
    const result = await this.executeReport(reportId, userId);

    switch (options.format) {
      case 'csv':
        return await this.exportToCSV(result, options);
      case 'excel':
        return await this.exportToExcel(result, options);
      case 'pdf':
        return await this.exportToPDF(result, options);
      default:
        throw new Error('Unsupported export format');
    }
  }

  /**
   * Schedule report generation and email delivery
   */
  async scheduleReport(reportId: string, userId: string): Promise<void> {
    const report = await CustomReport.findById(reportId);
    if (!report || !report.schedule?.enabled) {
      throw new Error('Report scheduling not configured');
    }

    // In production, this would integrate with a job scheduler like Bull or Agenda
    console.log(`Scheduling report ${reportId} for next run at ${report.schedule.nextRun}`);
  }

  /**
   * Process scheduled reports (called by cron job)
   */
  async processScheduledReports(): Promise<void> {
    const now = new Date();

    const dueReports = await CustomReport.find({
      'schedule.enabled': true,
      'schedule.nextRun': { $lte: now },
    });

    for (const report of dueReports) {
      try {
        // Generate report
        const result = await this.executeReport(
          report._id.toString(),
          report.createdBy.toString()
        );

        // Export report
        const filePath = await this.exportReport(report._id.toString(), report.createdBy.toString(), {
          format: report.schedule!.format,
          includeMetadata: true,
        });

        // Send email
        await this.sendReportEmail(report, filePath);

        // Update schedule
        report.schedule!.lastRun = now;
        report.schedule!.nextRun = this.calculateNextRunTime(report.schedule!);
        await report.save();

        // Clean up file
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error(`Error processing scheduled report ${report._id}:`, error);
      }
    }
  }

  // Private helper methods

  private async buildAndExecuteQuery(report: ICustomReport): Promise<any[]> {
    let model: any;

    switch (report.dataSource) {
      case 'users':
        model = User;
        break;
      case 'progress':
        model = UserProgress;
        break;
      case 'flashcards':
        model = Card;
        break;
      default:
        throw new Error('Unsupported data source');
    }

    // Build query
    const query: any = {};

    // Apply date range filter
    if (report.dateRange) {
      if (report.dateRange.type === 'fixed') {
        query.createdAt = {
          $gte: report.dateRange.startDate,
          $lte: report.dateRange.endDate,
        };
      } else if (report.dateRange.type === 'relative') {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - (report.dateRange.relativeDays || 30));
        query.createdAt = { $gte: startDate };
      }
    }

    // Apply custom filters
    for (const filter of report.filters) {
      switch (filter.operator) {
        case 'eq':
          query[filter.field] = filter.value;
          break;
        case 'ne':
          query[filter.field] = { $ne: filter.value };
          break;
        case 'gt':
          query[filter.field] = { $gt: filter.value };
          break;
        case 'gte':
          query[filter.field] = { $gte: filter.value };
          break;
        case 'lt':
          query[filter.field] = { $lt: filter.value };
          break;
        case 'lte':
          query[filter.field] = { $lte: filter.value };
          break;
        case 'in':
          query[filter.field] = { $in: filter.value };
          break;
        case 'contains':
          query[filter.field] = { $regex: filter.value, $options: 'i' };
          break;
      }
    }

    // Build aggregation pipeline if metrics are specified
    if (report.metrics.length > 0) {
      return await this.executeAggregation(model, query, report);
    }

    // Simple query
    return await model.find(query).lean().limit(1000);
  }

  private async executeAggregation(model: any, query: any, report: ICustomReport): Promise<any[]> {
    const pipeline: any[] = [{ $match: query }];

    // Group by dimensions
    if (report.dimensions.length > 0) {
      const groupStage: any = {
        _id: {},
      };

      for (const dimension of report.dimensions) {
        groupStage._id[dimension.alias || dimension.field] = `$${dimension.field}`;
      }

      // Add metric aggregations
      for (const metric of report.metrics) {
        const fieldName = metric.alias || metric.field;

        switch (metric.aggregation) {
          case 'count':
            groupStage[fieldName] = { $sum: 1 };
            break;
          case 'sum':
            groupStage[fieldName] = { $sum: `$${metric.field}` };
            break;
          case 'avg':
            groupStage[fieldName] = { $avg: `$${metric.field}` };
            break;
          case 'min':
            groupStage[fieldName] = { $min: `$${metric.field}` };
            break;
          case 'max':
            groupStage[fieldName] = { $max: `$${metric.field}` };
            break;
        }
      }

      pipeline.push({ $group: groupStage });

      // Project to flatten _id
      const projectStage: any = {};
      for (const dimension of report.dimensions) {
        const fieldName = dimension.alias || dimension.field;
        projectStage[fieldName] = `$_id.${fieldName}`;
      }
      for (const metric of report.metrics) {
        const fieldName = metric.alias || metric.field;
        projectStage[fieldName] = 1;
      }

      pipeline.push({ $project: projectStage });
    }

    pipeline.push({ $limit: 1000 });

    return await model.aggregate(pipeline);
  }

  private canAccessReport(report: ICustomReport, userId: string): boolean {
    if (report.createdBy.toString() === userId) return true;
    if (report.isPublic) return true;
    if (report.sharedWith.some((share) => share.userId.toString() === userId)) return true;
    return false;
  }

  private canEditReport(report: ICustomReport, userId: string): boolean {
    if (report.createdBy.toString() === userId) return true;
    const share = report.sharedWith.find((s) => s.userId.toString() === userId);
    return share?.permission === 'edit';
  }

  private calculateNextRunTime(schedule: any): Date {
    const now = new Date();
    const nextRun = new Date(now);

    const [hours, minutes] = schedule.time.split(':').map(Number);

    nextRun.setHours(hours, minutes, 0, 0);

    switch (schedule.frequency) {
      case 'daily':
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 1);
        }
        break;
      case 'weekly':
        nextRun.setDate(
          nextRun.getDate() + ((7 + schedule.dayOfWeek - nextRun.getDay()) % 7 || 7)
        );
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 7);
        }
        break;
      case 'monthly':
        nextRun.setDate(schedule.dayOfMonth);
        if (nextRun <= now) {
          nextRun.setMonth(nextRun.getMonth() + 1);
        }
        break;
    }

    return nextRun;
  }

  private async exportToCSV(result: ReportResult, options: ExportOptions): Promise<string> {
    const fields = result.data.length > 0 ? Object.keys(result.data[0]) : [];
    const parser = new Parser({ fields });
    const csv = parser.parse(result.data);

    const fileName = `report-${Date.now()}.csv`;
    const filePath = path.join('/tmp', fileName);
    fs.writeFileSync(filePath, csv);

    return filePath;
  }

  private async exportToExcel(result: ReportResult, options: ExportOptions): Promise<string> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Report Data');

    // Add headers
    if (result.data.length > 0) {
      const headers = Object.keys(result.data[0]);
      worksheet.addRow(headers);

      // Style header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      };

      // Add data rows
      result.data.forEach((row) => {
        worksheet.addRow(Object.values(row));
      });

      // Auto-fit columns
      worksheet.columns.forEach((column) => {
        column.width = 15;
      });
    }

    // Add metadata sheet if requested
    if (options.includeMetadata) {
      const metaSheet = workbook.addWorksheet('Metadata');
      metaSheet.addRow(['Report Name', result.metadata.reportName]);
      metaSheet.addRow(['Generated At', result.metadata.generatedAt.toISOString()]);
      metaSheet.addRow(['Row Count', result.metadata.rowCount]);
      metaSheet.addRow(['Execution Time (ms)', result.metadata.executionTime]);
    }

    const fileName = `report-${Date.now()}.xlsx`;
    const filePath = path.join('/tmp', fileName);
    await workbook.xlsx.writeFile(filePath);

    return filePath;
  }

  private async exportToPDF(result: ReportResult, options: ExportOptions): Promise<string> {
    const fileName = `report-${Date.now()}.pdf`;
    const filePath = path.join('/tmp', fileName);

    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Add title
    doc.fontSize(20).text(result.metadata.reportName, { align: 'center' });
    doc.moveDown();

    // Add metadata
    if (options.includeMetadata) {
      doc.fontSize(10);
      doc.text(`Generated: ${result.metadata.generatedAt.toLocaleString()}`);
      doc.text(`Rows: ${result.metadata.rowCount}`);
      doc.text(`Execution Time: ${result.metadata.executionTime}ms`);
      doc.moveDown();
    }

    // Add table
    if (result.data.length > 0) {
      const headers = Object.keys(result.data[0]);
      doc.fontSize(12).text(headers.join(' | '));
      doc.moveDown(0.5);

      result.data.slice(0, 50).forEach((row) => {
        doc.fontSize(10).text(Object.values(row).join(' | '));
      });

      if (result.data.length > 50) {
        doc.text(`... and ${result.data.length - 50} more rows`);
      }
    }

    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);
    });
  }

  private async sendReportEmail(report: ICustomReport, filePath: string): Promise<void> {
    // Mock email service (would use nodemailer in production)
    console.log(`Sending report ${report.name} to ${report.schedule?.recipients.join(', ')}`);

    // Example nodemailer configuration:
    /*
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: report.schedule?.recipients.join(', '),
      subject: `Scheduled Report: ${report.name}`,
      text: `Your scheduled report "${report.name}" is attached.`,
      attachments: [
        {
          filename: path.basename(filePath),
          path: filePath,
        },
      ],
    });
    */
  }
}

export const reportBuilderService = new ReportBuilderService();
