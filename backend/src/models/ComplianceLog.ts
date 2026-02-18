import mongoose, { Document, Schema } from 'mongoose';

export interface IComplianceLog extends Document {
  eventType: 'data_access' | 'data_export' | 'data_deletion' | 'consent_change' |
             'audit_log' | 'security_event' | 'compliance_check' | 'policy_update';
  userId?: mongoose.Types.ObjectId;
  category: 'gdpr' | 'ccpa' | 'coppa' | 'ferpa' | 'soc2' | 'iso27001' | 'pci_dss' | 'general';
  action: string;
  details: {
    description: string;
    ipAddress?: string;
    userAgent?: string;
    location?: string;
    dataType?: string;
    dataVolume?: number;
    requestId?: string;
    [key: string]: any;
  };
  metadata: {
    compliance_standard?: string[];
    risk_level?: 'low' | 'medium' | 'high' | 'critical';
    automated?: boolean;
    reviewed?: boolean;
    reviewer?: mongoose.Types.ObjectId;
    reviewDate?: Date;
    notes?: string;
  };
  timestamp: Date;
  immutable: boolean; // Once created, cannot be modified
  hash?: string; // Hash of the log entry for integrity verification
  previousHash?: string; // Hash of previous log entry (blockchain-like)
}

const ComplianceLogSchema = new Schema<IComplianceLog>({
  eventType: {
    type: String,
    enum: ['data_access', 'data_export', 'data_deletion', 'consent_change',
           'audit_log', 'security_event', 'compliance_check', 'policy_update'],
    required: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  category: {
    type: String,
    enum: ['gdpr', 'ccpa', 'coppa', 'ferpa', 'soc2', 'iso27001', 'pci_dss', 'general'],
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true
  },
  details: {
    description: { type: String, required: true },
    ipAddress: String,
    userAgent: String,
    location: String,
    dataType: String,
    dataVolume: Number,
    requestId: String
  },
  metadata: {
    compliance_standard: [String],
    risk_level: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    automated: { type: Boolean, default: true },
    reviewed: { type: Boolean, default: false },
    reviewer: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewDate: Date,
    notes: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
    index: true
  },
  immutable: {
    type: Boolean,
    default: true
  },
  hash: String,
  previousHash: String
}, {
  timestamps: false, // Using custom timestamp field
  collection: 'compliance_logs'
});

// Indexes for efficient querying
ComplianceLogSchema.index({ timestamp: -1 });
ComplianceLogSchema.index({ category: 1, timestamp: -1 });
ComplianceLogSchema.index({ eventType: 1, timestamp: -1 });
ComplianceLogSchema.index({ userId: 1, timestamp: -1 });
ComplianceLogSchema.index({ 'metadata.risk_level': 1, timestamp: -1 });

// Prevent modifications to logs
ComplianceLogSchema.pre('save', function(next) {
  if (!this.isNew && this.immutable) {
    return next(new Error('Compliance logs are immutable'));
  }
  next();
});

// Generate hash for log entry
ComplianceLogSchema.methods.generateHash = function() {
  const crypto = require('crypto');
  const data = JSON.stringify({
    eventType: this.eventType,
    userId: this.userId,
    category: this.category,
    action: this.action,
    details: this.details,
    timestamp: this.timestamp
  });
  return crypto.createHash('sha256').update(data).digest('hex');
};

export const ComplianceLog = mongoose.model<IComplianceLog>('ComplianceLog', ComplianceLogSchema);
