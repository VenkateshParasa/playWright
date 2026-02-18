import mongoose, { Document, Schema } from 'mongoose';

export interface IEmailTemplate {
  _id?: mongoose.Types.ObjectId;
  name: string;
  subject: string;
  preheader?: string;
  htmlContent: string;
  textContent?: string;
  thumbnail?: string;
  category?: string;
  variables?: string[]; // Available merge tags
}

export interface IEmailSegment {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
  logic?: 'AND' | 'OR';
}

export interface IEmailRecipient {
  userId?: mongoose.Types.ObjectId;
  email: string;
  firstName?: string;
  lastName?: string;
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'unsubscribed' | 'failed';
  sentAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  bouncedAt?: Date;
  unsubscribedAt?: Date;
  failedReason?: string;
  metadata?: Record<string, any>;
}

export interface IEmailVariant {
  _id?: mongoose.Types.ObjectId;
  name: string;
  subject: string;
  preheader?: string;
  htmlContent: string;
  textContent?: string;
  percentage: number; // Traffic split percentage
  sent: number;
  opened: number;
  clicked: number;
  unsubscribed: number;
  bounced: number;
  openRate: number;
  clickRate: number;
}

export interface IEmailCampaignAnalytics {
  date: Date;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  revenue: number;
}

export interface IEmailCampaign extends Document {
  tenantId?: mongoose.Types.ObjectId;
  name: string;
  type: 'regular' | 'drip' | 'triggered' | 'automated' | 'transactional';
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';

  // Content
  subject: string;
  preheader?: string;
  fromName: string;
  fromEmail: string;
  replyToEmail?: string;
  htmlContent: string;
  textContent?: string;
  templateId?: mongoose.Types.ObjectId;

  // Personalization
  personalizationTokens: {
    [key: string]: string;
  };

  // A/B Testing
  enableABTesting: boolean;
  variants: IEmailVariant[];
  abTestWinner?: mongoose.Types.ObjectId; // Variant ID
  abTestDuration?: number; // hours

  // Recipients
  recipients: IEmailRecipient[];
  totalRecipients: number;

  // Segmentation
  segmentType: 'all' | 'segment' | 'list' | 'individual';
  segments: IEmailSegment[];
  listIds?: mongoose.Types.ObjectId[]; // Email list IDs
  excludeSegments?: IEmailSegment[];

  // Scheduling
  sendAt?: Date;
  timezone?: string;
  sendNow: boolean;

  // Drip Campaign Settings
  dripSettings?: {
    triggerType: 'signup' | 'purchase' | 'course_enrollment' | 'course_completion' | 'inactivity' | 'custom';
    triggerDelay: number; // minutes
    frequencyCap?: {
      maxEmails: number;
      period: 'day' | 'week' | 'month';
    };
    stopConditions?: {
      type: 'user_action' | 'time_limit' | 'goal_reached';
      value?: any;
    }[];
  };

  // Triggered Email Settings
  triggerSettings?: {
    event: 'welcome' | 'abandoned_cart' | 'course_completion' | 'lesson_completion' | 'quiz_passed' | 'achievement_unlocked' | 'custom';
    delay?: number; // minutes
    conditions?: {
      field: string;
      operator: string;
      value: any;
    }[];
  };

  // Tracking
  trackOpens: boolean;
  trackClicks: boolean;
  trackConversions: boolean;
  utmParameters?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };

  // Analytics
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  failed: number;
  openRate: number;
  clickRate: number;
  unsubscribeRate: number;
  bounceRate: number;
  conversionRate: number;

  // Links
  trackedLinks: {
    url: string;
    clicks: number;
    uniqueClicks: number;
  }[];

  // Revenue
  revenue: number;
  conversions: number;

  // Analytics History
  analyticsHistory: IEmailCampaignAnalytics[];

  // Integration
  integrationProvider?: 'sendgrid' | 'mailchimp' | 'mailgun' | 'ses' | 'smtp';
  integrationId?: string;

  // Testing
  testEmails?: string[];
  lastTestSentAt?: Date;

  createdBy: mongoose.Types.ObjectId;
  lastModifiedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EmailSegmentSchema = new Schema<IEmailSegment>({
  field: { type: String, required: true },
  operator: {
    type: String,
    enum: ['equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than', 'in', 'not_in'],
    required: true,
  },
  value: Schema.Types.Mixed,
  logic: {
    type: String,
    enum: ['AND', 'OR'],
    default: 'AND',
  },
});

const EmailRecipientSchema = new Schema<IEmailRecipient>({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  email: { type: String, required: true },
  firstName: String,
  lastName: String,
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'unsubscribed', 'failed'],
    default: 'pending',
  },
  sentAt: Date,
  openedAt: Date,
  clickedAt: Date,
  bouncedAt: Date,
  unsubscribedAt: Date,
  failedReason: String,
  metadata: Schema.Types.Mixed,
});

const EmailVariantSchema = new Schema<IEmailVariant>({
  name: { type: String, required: true },
  subject: { type: String, required: true },
  preheader: String,
  htmlContent: { type: String, required: true },
  textContent: String,
  percentage: { type: Number, default: 50 },
  sent: { type: Number, default: 0 },
  opened: { type: Number, default: 0 },
  clicked: { type: Number, default: 0 },
  unsubscribed: { type: Number, default: 0 },
  bounced: { type: Number, default: 0 },
  openRate: { type: Number, default: 0 },
  clickRate: { type: Number, default: 0 },
});

const EmailCampaignAnalyticsSchema = new Schema<IEmailCampaignAnalytics>({
  date: { type: Date, required: true },
  sent: { type: Number, default: 0 },
  delivered: { type: Number, default: 0 },
  opened: { type: Number, default: 0 },
  clicked: { type: Number, default: 0 },
  bounced: { type: Number, default: 0 },
  unsubscribed: { type: Number, default: 0 },
  openRate: { type: Number, default: 0 },
  clickRate: { type: Number, default: 0 },
  conversionRate: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 },
});

const EmailCampaignSchema = new Schema<IEmailCampaign>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      index: true,
    },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['regular', 'drip', 'triggered', 'automated', 'transactional'],
      default: 'regular',
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled'],
      default: 'draft',
    },

    subject: { type: String, required: true },
    preheader: String,
    fromName: { type: String, required: true },
    fromEmail: { type: String, required: true },
    replyToEmail: String,
    htmlContent: { type: String, required: true },
    textContent: String,
    templateId: { type: Schema.Types.ObjectId, ref: 'EmailTemplate' },

    personalizationTokens: {
      type: Map,
      of: String,
      default: {},
    },

    enableABTesting: { type: Boolean, default: false },
    variants: [EmailVariantSchema],
    abTestWinner: Schema.Types.ObjectId,
    abTestDuration: Number,

    recipients: [EmailRecipientSchema],
    totalRecipients: { type: Number, default: 0 },

    segmentType: {
      type: String,
      enum: ['all', 'segment', 'list', 'individual'],
      default: 'all',
    },
    segments: [EmailSegmentSchema],
    listIds: [{ type: Schema.Types.ObjectId, ref: 'EmailList' }],
    excludeSegments: [EmailSegmentSchema],

    sendAt: Date,
    timezone: { type: String, default: 'UTC' },
    sendNow: { type: Boolean, default: false },

    dripSettings: {
      triggerType: {
        type: String,
        enum: ['signup', 'purchase', 'course_enrollment', 'course_completion', 'inactivity', 'custom'],
      },
      triggerDelay: Number,
      frequencyCap: {
        maxEmails: Number,
        period: {
          type: String,
          enum: ['day', 'week', 'month'],
        },
      },
      stopConditions: [
        {
          type: {
            type: String,
            enum: ['user_action', 'time_limit', 'goal_reached'],
          },
          value: Schema.Types.Mixed,
        },
      ],
    },

    triggerSettings: {
      event: {
        type: String,
        enum: ['welcome', 'abandoned_cart', 'course_completion', 'lesson_completion', 'quiz_passed', 'achievement_unlocked', 'custom'],
      },
      delay: Number,
      conditions: [
        {
          field: String,
          operator: String,
          value: Schema.Types.Mixed,
        },
      ],
    },

    trackOpens: { type: Boolean, default: true },
    trackClicks: { type: Boolean, default: true },
    trackConversions: { type: Boolean, default: true },
    utmParameters: {
      source: String,
      medium: String,
      campaign: String,
      term: String,
      content: String,
    },

    sent: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    opened: { type: Number, default: 0 },
    clicked: { type: Number, default: 0 },
    bounced: { type: Number, default: 0 },
    unsubscribed: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    openRate: { type: Number, default: 0 },
    clickRate: { type: Number, default: 0 },
    unsubscribeRate: { type: Number, default: 0 },
    bounceRate: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },

    trackedLinks: [
      {
        url: String,
        clicks: { type: Number, default: 0 },
        uniqueClicks: { type: Number, default: 0 },
      },
    ],

    revenue: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },

    analyticsHistory: [EmailCampaignAnalyticsSchema],

    integrationProvider: {
      type: String,
      enum: ['sendgrid', 'mailchimp', 'mailgun', 'ses', 'smtp'],
    },
    integrationId: String,

    testEmails: [String],
    lastTestSentAt: Date,

    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    lastModifiedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Indexes
EmailCampaignSchema.index({ tenantId: 1, status: 1 });
EmailCampaignSchema.index({ type: 1 });
EmailCampaignSchema.index({ sendAt: 1 });
EmailCampaignSchema.index({ 'recipients.email': 1 });
EmailCampaignSchema.index({ 'recipients.status': 1 });

// Methods
EmailCampaignSchema.methods.updateAnalytics = function () {
  if (this.sent > 0) {
    this.openRate = (this.opened / this.sent) * 100;
    this.clickRate = (this.clicked / this.sent) * 100;
    this.unsubscribeRate = (this.unsubscribed / this.sent) * 100;
    this.bounceRate = (this.bounced / this.sent) * 100;

    if (this.delivered > 0) {
      this.conversionRate = (this.conversions / this.delivered) * 100;
    }
  }

  return this.save();
};

EmailCampaignSchema.methods.trackOpen = function (recipientEmail: string) {
  const recipient = this.recipients.find((r: IEmailRecipient) => r.email === recipientEmail);
  if (recipient && !recipient.openedAt) {
    recipient.openedAt = new Date();
    recipient.status = 'opened';
    this.opened += 1;
  }
  return this.updateAnalytics();
};

EmailCampaignSchema.methods.trackClick = function (recipientEmail: string, url: string) {
  const recipient = this.recipients.find((r: IEmailRecipient) => r.email === recipientEmail);
  if (recipient && !recipient.clickedAt) {
    recipient.clickedAt = new Date();
    recipient.status = 'clicked';
    this.clicked += 1;
  }

  const link = this.trackedLinks.find(l => l.url === url);
  if (link) {
    link.clicks += 1;
  } else {
    this.trackedLinks.push({ url, clicks: 1, uniqueClicks: 1 });
  }

  return this.updateAnalytics();
};

export const EmailCampaign = mongoose.model<IEmailCampaign>('EmailCampaign', EmailCampaignSchema);
