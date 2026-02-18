import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  _id: mongoose.Types.ObjectId;
  tenantId?: mongoose.Types.ObjectId; // null for super admin actions
  userId: mongoose.Types.ObjectId;
  userEmail: string;
  userRole: string;
  action: string;
  category: 'auth' | 'user' | 'tenant' | 'security' | 'data' | 'admin' | 'system';
  severity: 'info' | 'warning' | 'error' | 'critical';
  resource: string;
  resourceId?: string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  geoLocation?: {
    country?: string;
    city?: string;
  };
  status: 'success' | 'failure';
  errorMessage?: string;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    userRole: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['auth', 'user', 'tenant', 'security', 'data', 'admin', 'system'],
      index: true,
    },
    severity: {
      type: String,
      required: true,
      enum: ['info', 'warning', 'error', 'critical'],
      default: 'info',
      index: true,
    },
    resource: {
      type: String,
      required: true,
      index: true,
    },
    resourceId: {
      type: String,
      index: true,
    },
    changes: [
      {
        field: String,
        oldValue: Schema.Types.Mixed,
        newValue: Schema.Types.Mixed,
      },
    ],
    metadata: {
      type: Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
      index: true,
    },
    userAgent: {
      type: String,
    },
    geoLocation: {
      country: String,
      city: String,
    },
    status: {
      type: String,
      enum: ['success', 'failure'],
      default: 'success',
      index: true,
    },
    errorMessage: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
AuditLogSchema.index({ tenantId: 1, timestamp: -1 });
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ resourceId: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ category: 1, severity: 1, timestamp: -1 });
AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ ipAddress: 1, timestamp: -1 });

// Transform output
AuditLogSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
