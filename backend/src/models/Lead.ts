import mongoose, { Document, Schema } from 'mongoose';

export interface ILeadCustomField {
  key: string;
  value: any;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select';
}

export interface ILeadActivity {
  _id?: mongoose.Types.ObjectId;
  type: 'page_view' | 'email_open' | 'email_click' | 'form_submit' | 'download' | 'call' | 'meeting' | 'note' | 'status_change';
  description: string;
  metadata?: Record<string, any>;
  performedBy?: mongoose.Types.ObjectId;
  timestamp: Date;
}

export interface ILeadScore {
  score: number;
  factors: {
    name: string;
    points: number;
    reason: string;
  }[];
  lastUpdated: Date;
}

export interface ILead extends Document {
  tenantId?: mongoose.Types.ObjectId;

  // Basic Info
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  website?: string;

  // Contact Details
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };

  // Source
  source: 'organic' | 'paid' | 'referral' | 'social' | 'email' | 'direct' | 'affiliate' | 'event' | 'import' | 'manual';
  sourceDetails?: string;
  landingPageId?: mongoose.Types.ObjectId;
  campaignId?: mongoose.Types.ObjectId;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;

  // Status & Qualification
  status: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted' | 'lost';
  qualificationStatus: 'cold' | 'warm' | 'hot';

  // Lead Score
  leadScore: ILeadScore;

  // Assignment
  assignedTo?: mongoose.Types.ObjectId;
  assignedAt?: Date;

  // Interests
  interestedCourses: mongoose.Types.ObjectId[];
  interests: string[];
  tags: string[];

  // Engagement
  activities: ILeadActivity[];
  lastActivityAt?: Date;
  firstContactAt?: Date;
  lastContactAt?: Date;
  emailOpens: number;
  emailClicks: number;
  pageViews: number;

  // Conversion
  convertedToUserId?: mongoose.Types.ObjectId;
  convertedAt?: Date;
  conversionValue?: number;

  // Custom Fields
  customFields: ILeadCustomField[];

  // Notes
  notes?: string;
  internalNotes?: string;

  // Nurturing
  nurturingWorkflowId?: mongoose.Types.ObjectId;
  nurturingStage?: string;
  nextFollowUpAt?: Date;

  // CRM Integration
  crmId?: string;
  crmType?: 'salesforce' | 'hubspot' | 'pipedrive' | 'zoho';
  lastSyncAt?: Date;

  // Do Not Contact
  doNotEmail?: boolean;
  doNotCall?: boolean;
  unsubscribed?: boolean;
  unsubscribedAt?: Date;

  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LeadActivitySchema = new Schema<ILeadActivity>({
  type: {
    type: String,
    enum: ['page_view', 'email_open', 'email_click', 'form_submit', 'download', 'call', 'meeting', 'note', 'status_change'],
    required: true,
  },
  description: { type: String, required: true },
  metadata: Schema.Types.Mixed,
  performedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now },
});

const LeadScoreSchema = new Schema<ILeadScore>({
  score: { type: Number, default: 0 },
  factors: [
    {
      name: String,
      points: Number,
      reason: String,
    },
  ],
  lastUpdated: { type: Date, default: Date.now },
});

const LeadSchema = new Schema<ILead>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      index: true,
    },

    email: { type: String, required: true, index: true, lowercase: true },
    firstName: String,
    lastName: String,
    phone: String,
    company: String,
    jobTitle: String,
    website: String,

    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },

    source: {
      type: String,
      enum: ['organic', 'paid', 'referral', 'social', 'email', 'direct', 'affiliate', 'event', 'import', 'manual'],
      required: true,
      index: true,
    },
    sourceDetails: String,
    landingPageId: { type: Schema.Types.ObjectId, ref: 'LandingPage' },
    campaignId: { type: Schema.Types.ObjectId, ref: 'EmailCampaign' },
    utmSource: String,
    utmMedium: String,
    utmCampaign: String,
    utmTerm: String,
    utmContent: String,

    status: {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'unqualified', 'converted', 'lost'],
      default: 'new',
      index: true,
    },
    qualificationStatus: {
      type: String,
      enum: ['cold', 'warm', 'hot'],
      default: 'cold',
      index: true,
    },

    leadScore: { type: LeadScoreSchema, default: () => ({ score: 0, factors: [], lastUpdated: new Date() }) },

    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    assignedAt: Date,

    interestedCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    interests: [String],
    tags: [String],

    activities: [LeadActivitySchema],
    lastActivityAt: Date,
    firstContactAt: Date,
    lastContactAt: Date,
    emailOpens: { type: Number, default: 0 },
    emailClicks: { type: Number, default: 0 },
    pageViews: { type: Number, default: 0 },

    convertedToUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    convertedAt: Date,
    conversionValue: Number,

    customFields: [
      {
        key: String,
        value: Schema.Types.Mixed,
        type: {
          type: String,
          enum: ['text', 'number', 'date', 'boolean', 'select'],
        },
      },
    ],

    notes: String,
    internalNotes: String,

    nurturingWorkflowId: { type: Schema.Types.ObjectId, ref: 'NurturingWorkflow' },
    nurturingStage: String,
    nextFollowUpAt: Date,

    crmId: String,
    crmType: {
      type: String,
      enum: ['salesforce', 'hubspot', 'pipedrive', 'zoho'],
    },
    lastSyncAt: Date,

    doNotEmail: { type: Boolean, default: false },
    doNotCall: { type: Boolean, default: false },
    unsubscribed: { type: Boolean, default: false },
    unsubscribedAt: Date,

    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Indexes
LeadSchema.index({ email: 1, tenantId: 1 }, { unique: true });
LeadSchema.index({ status: 1, qualificationStatus: 1 });
LeadSchema.index({ 'leadScore.score': -1 });
LeadSchema.index({ assignedTo: 1, status: 1 });
LeadSchema.index({ source: 1 });
LeadSchema.index({ tags: 1 });
LeadSchema.index({ lastActivityAt: -1 });
LeadSchema.index({ nextFollowUpAt: 1 });

// Methods
LeadSchema.methods.addActivity = function (activity: Partial<ILeadActivity>) {
  this.activities.push({
    type: activity.type || 'note',
    description: activity.description || '',
    metadata: activity.metadata,
    performedBy: activity.performedBy,
    timestamp: new Date(),
  });
  this.lastActivityAt = new Date();
  return this.save();
};

LeadSchema.methods.updateScore = function (factor: { name: string; points: number; reason: string }) {
  this.leadScore.score += factor.points;
  this.leadScore.factors.push(factor);
  this.leadScore.lastUpdated = new Date();

  // Update qualification status based on score
  if (this.leadScore.score >= 80) {
    this.qualificationStatus = 'hot';
  } else if (this.leadScore.score >= 50) {
    this.qualificationStatus = 'warm';
  } else {
    this.qualificationStatus = 'cold';
  }

  return this.save();
};

LeadSchema.methods.convert = function (userId: mongoose.Types.ObjectId, value?: number) {
  this.status = 'converted';
  this.convertedToUserId = userId;
  this.convertedAt = new Date();
  if (value) {
    this.conversionValue = value;
  }
  return this.save();
};

export const Lead = mongoose.model<ILead>('Lead', LeadSchema);
