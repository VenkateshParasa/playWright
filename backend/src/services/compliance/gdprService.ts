import { ComplianceLog } from '../../models/ComplianceLog';
import mongoose from 'mongoose';
import * as crypto from 'crypto';

export interface GDPRConsent {
  userId: mongoose.Types.ObjectId;
  consentType: 'necessary' | 'analytics' | 'marketing' | 'personalization';
  granted: boolean;
  version: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface DataExportRequest {
  userId: mongoose.Types.ObjectId;
  requestId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: Date;
  completedAt?: Date;
  downloadUrl?: string;
  expiresAt?: Date;
  format: 'json' | 'csv' | 'xml';
}

export interface DataDeletionRequest {
  userId: mongoose.Types.ObjectId;
  requestId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: Date;
  completedAt?: Date;
  deletionType: 'full' | 'partial';
  retentionReason?: string;
  confirmedByUser: boolean;
  confirmationToken?: string;
}

export interface PrivacyPolicy {
  version: string;
  effectiveDate: Date;
  content: string;
  language: string;
  changelog?: string;
}

export interface DataProcessingRecord {
  id: string;
  activity: string;
  dataTypes: string[];
  legalBasis: 'consent' | 'contract' | 'legal_obligation' | 'vital_interests' |
               'public_task' | 'legitimate_interests';
  purposes: string[];
  recipients: string[];
  transfers?: {
    country: string;
    safeguards: string;
  }[];
  retentionPeriod: string;
  technicalMeasures: string[];
  organizationalMeasures: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * GDPR Compliance Service
 * Implements GDPR requirements including:
 * - Right to access (Art. 15)
 * - Right to rectification (Art. 16)
 * - Right to erasure (Art. 17)
 * - Right to data portability (Art. 20)
 * - Consent management (Art. 7)
 * - Data breach notification (Art. 33-34)
 */
export class GDPRService {
  private consents: Map<string, GDPRConsent[]> = new Map();
  private exportRequests: Map<string, DataExportRequest> = new Map();
  private deletionRequests: Map<string, DataDeletionRequest> = new Map();
  private privacyPolicies: Map<string, PrivacyPolicy> = new Map();
  private processingRecords: Map<string, DataProcessingRecord> = new Map();

  /**
   * Log a compliance event
   */
  private async logEvent(
    eventType: any,
    userId: mongoose.Types.ObjectId | undefined,
    action: string,
    details: any,
    riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
  ): Promise<void> {
    const log = new ComplianceLog({
      eventType,
      userId,
      category: 'gdpr',
      action,
      details: {
        description: action,
        ...details
      },
      metadata: {
        compliance_standard: ['GDPR'],
        risk_level: riskLevel,
        automated: true
      },
      timestamp: new Date()
    });

    const savedLog = await log.save();
    savedLog.hash = savedLog.generateHash();
    await savedLog.save();
  }

  /**
   * Record user consent
   */
  async recordConsent(
    userId: mongoose.Types.ObjectId,
    consentType: GDPRConsent['consentType'],
    granted: boolean,
    version: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const consent: GDPRConsent = {
      userId,
      consentType,
      granted,
      version,
      timestamp: new Date(),
      ipAddress,
      userAgent
    };

    const key = userId.toString();
    const userConsents = this.consents.get(key) || [];
    userConsents.push(consent);
    this.consents.set(key, userConsents);

    await this.logEvent(
      'consent_change',
      userId,
      `User ${granted ? 'granted' : 'revoked'} ${consentType} consent`,
      {
        consentType,
        granted,
        version,
        ipAddress,
        userAgent
      }
    );
  }

  /**
   * Get user consents
   */
  getUserConsents(userId: mongoose.Types.ObjectId): GDPRConsent[] {
    return this.consents.get(userId.toString()) || [];
  }

  /**
   * Check if user has granted consent
   */
  hasConsent(
    userId: mongoose.Types.ObjectId,
    consentType: GDPRConsent['consentType']
  ): boolean {
    const userConsents = this.getUserConsents(userId);
    const latestConsent = userConsents
      .filter(c => c.consentType === consentType)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

    return latestConsent?.granted || false;
  }

  /**
   * Right to Access (Art. 15) - Export user data
   */
  async requestDataExport(
    userId: mongoose.Types.ObjectId,
    format: 'json' | 'csv' | 'xml' = 'json'
  ): Promise<DataExportRequest> {
    const requestId = this.generateRequestId();

    const request: DataExportRequest = {
      userId,
      requestId,
      status: 'pending',
      requestedAt: new Date(),
      format
    };

    this.exportRequests.set(requestId, request);

    await this.logEvent(
      'data_export',
      userId,
      'User requested data export',
      {
        requestId,
        format
      },
      'medium'
    );

    // Process export asynchronously
    this.processDataExport(requestId).catch(console.error);

    return request;
  }

  /**
   * Process data export request
   */
  private async processDataExport(requestId: string): Promise<void> {
    const request = this.exportRequests.get(requestId);
    if (!request) return;

    try {
      request.status = 'processing';
      this.exportRequests.set(requestId, request);

      // Collect all user data from various sources
      const userData = await this.collectUserData(request.userId);

      // Generate export file
      const exportData = this.formatExportData(userData, request.format);

      // In production, upload to secure storage (S3, etc.)
      const downloadUrl = `/api/compliance/export/${requestId}/download`;

      request.status = 'completed';
      request.completedAt = new Date();
      request.downloadUrl = downloadUrl;
      request.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      this.exportRequests.set(requestId, request);

      await this.logEvent(
        'data_export',
        request.userId,
        'Data export completed',
        {
          requestId,
          format: request.format,
          dataSize: JSON.stringify(exportData).length
        }
      );
    } catch (error) {
      request.status = 'failed';
      this.exportRequests.set(requestId, request);

      await this.logEvent(
        'data_export',
        request.userId,
        'Data export failed',
        {
          requestId,
          error: error.message
        },
        'high'
      );
    }
  }

  /**
   * Collect all user data for export
   */
  private async collectUserData(userId: mongoose.Types.ObjectId): Promise<any> {
    // In production, collect data from all relevant collections
    // This is a simplified example
    return {
      userId: userId.toString(),
      exportDate: new Date().toISOString(),
      personalData: {
        // User profile, settings, etc.
      },
      activityData: {
        // Progress, achievements, etc.
      },
      communicationData: {
        // Messages, comments, etc.
      },
      consents: this.getUserConsents(userId),
      complianceLogs: await ComplianceLog.find({ userId }).lean()
    };
  }

  /**
   * Format export data
   */
  private formatExportData(data: any, format: 'json' | 'csv' | 'xml'): string {
    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'csv':
        return this.convertToCSV(data);
      case 'xml':
        return this.convertToXML(data);
      default:
        return JSON.stringify(data, null, 2);
    }
  }

  /**
   * Right to Erasure (Art. 17) - Delete user data
   */
  async requestDataDeletion(
    userId: mongoose.Types.ObjectId,
    deletionType: 'full' | 'partial' = 'full',
    confirmationToken?: string
  ): Promise<DataDeletionRequest> {
    const requestId = this.generateRequestId();

    const request: DataDeletionRequest = {
      userId,
      requestId,
      status: 'pending',
      requestedAt: new Date(),
      deletionType,
      confirmedByUser: !!confirmationToken,
      confirmationToken: confirmationToken || this.generateConfirmationToken()
    };

    this.deletionRequests.set(requestId, request);

    await this.logEvent(
      'data_deletion',
      userId,
      'User requested data deletion',
      {
        requestId,
        deletionType,
        confirmed: request.confirmedByUser
      },
      'critical'
    );

    if (request.confirmedByUser) {
      // Process deletion immediately if confirmed
      this.processDataDeletion(requestId).catch(console.error);
    }

    return request;
  }

  /**
   * Confirm data deletion request
   */
  async confirmDataDeletion(
    requestId: string,
    confirmationToken: string
  ): Promise<boolean> {
    const request = this.deletionRequests.get(requestId);
    if (!request) {
      throw new Error('Deletion request not found');
    }

    if (request.confirmationToken !== confirmationToken) {
      await this.logEvent(
        'data_deletion',
        request.userId,
        'Invalid confirmation token',
        { requestId },
        'high'
      );
      return false;
    }

    request.confirmedByUser = true;
    this.deletionRequests.set(requestId, request);

    await this.logEvent(
      'data_deletion',
      request.userId,
      'Data deletion confirmed',
      { requestId }
    );

    // Process deletion
    this.processDataDeletion(requestId).catch(console.error);

    return true;
  }

  /**
   * Process data deletion request
   */
  private async processDataDeletion(requestId: string): Promise<void> {
    const request = this.deletionRequests.get(requestId);
    if (!request || !request.confirmedByUser) return;

    try {
      request.status = 'processing';
      this.deletionRequests.set(requestId, request);

      if (request.deletionType === 'full') {
        await this.deleteAllUserData(request.userId);
      } else {
        await this.deletePartialUserData(request.userId);
      }

      request.status = 'completed';
      request.completedAt = new Date();
      this.deletionRequests.set(requestId, request);

      await this.logEvent(
        'data_deletion',
        request.userId,
        'Data deletion completed',
        {
          requestId,
          deletionType: request.deletionType
        }
      );
    } catch (error) {
      request.status = 'failed';
      this.deletionRequests.set(requestId, request);

      await this.logEvent(
        'data_deletion',
        request.userId,
        'Data deletion failed',
        {
          requestId,
          error: error.message
        },
        'critical'
      );
    }
  }

  /**
   * Delete all user data (with legal retention exceptions)
   */
  private async deleteAllUserData(userId: mongoose.Types.ObjectId): Promise<void> {
    // In production, delete from all relevant collections
    // Except data that must be retained for legal reasons

    // Keep compliance logs (legal requirement)
    // Keep financial records (legal requirement)
    // Delete everything else
  }

  /**
   * Delete partial user data (anonymization)
   */
  private async deletePartialUserData(userId: mongoose.Types.ObjectId): Promise<void> {
    // Anonymize personal data while keeping aggregated/anonymized records
  }

  /**
   * Manage privacy policy versions
   */
  async createPrivacyPolicy(
    version: string,
    content: string,
    language: string = 'en',
    changelog?: string
  ): Promise<PrivacyPolicy> {
    const policy: PrivacyPolicy = {
      version,
      effectiveDate: new Date(),
      content,
      language,
      changelog
    };

    this.privacyPolicies.set(`${version}-${language}`, policy);

    await this.logEvent(
      'policy_update',
      undefined,
      'Privacy policy updated',
      {
        version,
        language
      }
    );

    return policy;
  }

  /**
   * Get current privacy policy
   */
  getCurrentPrivacyPolicy(language: string = 'en'): PrivacyPolicy | undefined {
    const policies = Array.from(this.privacyPolicies.values())
      .filter(p => p.language === language)
      .sort((a, b) => b.effectiveDate.getTime() - a.effectiveDate.getTime());

    return policies[0];
  }

  /**
   * Record data processing activity (Art. 30)
   */
  async recordProcessingActivity(
    record: Omit<DataProcessingRecord, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<DataProcessingRecord> {
    const id = this.generateRequestId();
    const processingRecord: DataProcessingRecord = {
      ...record,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.processingRecords.set(id, processingRecord);

    await this.logEvent(
      'audit_log',
      undefined,
      'Data processing activity recorded',
      {
        recordId: id,
        activity: record.activity
      }
    );

    return processingRecord;
  }

  /**
   * Get all processing records
   */
  getProcessingRecords(): DataProcessingRecord[] {
    return Array.from(this.processingRecords.values());
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(
    startDate: Date,
    endDate: Date
  ): Promise<{
    period: { start: Date; end: Date };
    statistics: {
      totalEvents: number;
      consentChanges: number;
      dataExports: number;
      dataDeletions: number;
      highRiskEvents: number;
    };
    events: any[];
  }> {
    const logs = await ComplianceLog.find({
      category: 'gdpr',
      timestamp: { $gte: startDate, $lte: endDate }
    }).lean();

    const statistics = {
      totalEvents: logs.length,
      consentChanges: logs.filter(l => l.eventType === 'consent_change').length,
      dataExports: logs.filter(l => l.eventType === 'data_export').length,
      dataDeletions: logs.filter(l => l.eventType === 'data_deletion').length,
      highRiskEvents: logs.filter(l =>
        ['high', 'critical'].includes(l.metadata.risk_level || '')
      ).length
    };

    return {
      period: { start: startDate, end: endDate },
      statistics,
      events: logs
    };
  }

  // Helper methods

  private generateRequestId(): string {
    return `REQ-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  }

  private generateConfirmationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private convertToCSV(data: any): string {
    // Simplified CSV conversion
    // In production, use a proper CSV library
    return JSON.stringify(data);
  }

  private convertToXML(data: any): string {
    // Simplified XML conversion
    // In production, use a proper XML library
    return `<?xml version="1.0" encoding="UTF-8"?>\n<data>${JSON.stringify(data)}</data>`;
  }
}

export const gdprService = new GDPRService();
