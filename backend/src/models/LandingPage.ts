import mongoose, { Document, Schema } from 'mongoose';

export interface ILandingPageSEO {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  structuredData?: Record<string, any>;
}

export interface ILandingPageVariant {
  _id?: mongoose.Types.ObjectId;
  name: string;
  content: string; // GrapesJS JSON
  css: string;
  isActive: boolean;
  impressions: number;
  conversions: number;
  conversionRate: number;
  createdAt?: Date;
}

export interface IFormField {
  _id?: mongoose.Types.ObjectId;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'number';
  label: string;
  name: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // for select, radio
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
  order: number;
}

export interface ILandingPageForm {
  _id?: mongoose.Types.ObjectId;
  title: string;
  fields: IFormField[];
  submitButtonText: string;
  successMessage: string;
  redirectUrl?: string;
  sendToEmail?: string;
  integrations?: {
    crm?: string; // CRM integration ID
    emailList?: string; // Email list ID
    webhook?: string; // Webhook URL
  };
}

export interface ILandingPageAnalytics {
  date: Date;
  visitors: number;
  uniqueVisitors: number;
  pageViews: number;
  bounceRate: number;
  avgTimeOnPage: number;
  conversions: number;
  conversionRate: number;
  trafficSources: {
    source: string;
    visitors: number;
    conversions: number;
  }[];
}

export interface ILandingPage extends Document {
  tenantId?: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  description?: string;
  type: 'course' | 'promotional' | 'webinar' | 'event' | 'custom';

  // Template
  templateId?: mongoose.Types.ObjectId;
  isTemplate: boolean;
  templateCategory?: string;

  // Content (GrapesJS)
  content: string; // JSON structure
  css: string;
  html?: string; // Rendered HTML for preview

  // A/B Testing
  enableABTesting: boolean;
  variants: ILandingPageVariant[];
  activeVariantId?: mongoose.Types.ObjectId;

  // SEO
  seo: ILandingPageSEO;

  // Forms
  forms: ILandingPageForm[];

  // Domain & Publishing
  customDomain?: string;
  isPublished: boolean;
  publishedAt?: Date;
  scheduledPublishAt?: Date;

  // Analytics
  trackingEnabled: boolean;
  utmParameters?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
  googleAnalyticsId?: string;
  facebookPixelId?: string;

  // Conversion Tracking
  conversionGoals: {
    _id?: mongoose.Types.ObjectId;
    name: string;
    type: 'form_submit' | 'button_click' | 'page_view' | 'scroll_depth' | 'time_on_page';
    target?: string; // CSS selector or value
    value?: number; // monetary value
  }[];

  // Performance
  impressions: number;
  uniqueVisitors: number;
  conversions: number;
  conversionRate: number;

  // Analytics History
  analyticsHistory: ILandingPageAnalytics[];

  // Access Control
  requiresPassword?: boolean;
  password?: string;
  allowedEmails?: string[];

  // Mobile
  mobileOptimized: boolean;
  mobileContent?: string; // Separate mobile version
  mobileCss?: string;

  // Status
  status: 'draft' | 'review' | 'published' | 'archived';

  createdBy: mongoose.Types.ObjectId;
  lastModifiedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FormFieldSchema = new Schema<IFormField>({
  type: {
    type: String,
    enum: ['text', 'email', 'tel', 'textarea', 'select', 'checkbox', 'radio', 'number'],
    required: true,
  },
  label: { type: String, required: true },
  name: { type: String, required: true },
  placeholder: String,
  required: { type: Boolean, default: false },
  options: [String],
  validation: {
    pattern: String,
    minLength: Number,
    maxLength: Number,
    min: Number,
    max: Number,
  },
  order: { type: Number, required: true },
});

const LandingPageFormSchema = new Schema<ILandingPageForm>({
  title: { type: String, required: true },
  fields: [FormFieldSchema],
  submitButtonText: { type: String, default: 'Submit' },
  successMessage: { type: String, default: 'Thank you for your submission!' },
  redirectUrl: String,
  sendToEmail: String,
  integrations: {
    crm: String,
    emailList: String,
    webhook: String,
  },
});

const LandingPageVariantSchema = new Schema<ILandingPageVariant>(
  {
    name: { type: String, required: true },
    content: { type: String, required: true },
    css: { type: String, default: '' },
    isActive: { type: Boolean, default: false },
    impressions: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const LandingPageAnalyticsSchema = new Schema<ILandingPageAnalytics>({
  date: { type: Date, required: true },
  visitors: { type: Number, default: 0 },
  uniqueVisitors: { type: Number, default: 0 },
  pageViews: { type: Number, default: 0 },
  bounceRate: { type: Number, default: 0 },
  avgTimeOnPage: { type: Number, default: 0 },
  conversions: { type: Number, default: 0 },
  conversionRate: { type: Number, default: 0 },
  trafficSources: [
    {
      source: String,
      visitors: Number,
      conversions: Number,
    },
  ],
});

const LandingPageSchema = new Schema<ILandingPage>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      index: true,
    },
    title: { type: String, required: true },
    slug: { type: String, required: true, index: true },
    description: String,
    type: {
      type: String,
      enum: ['course', 'promotional', 'webinar', 'event', 'custom'],
      default: 'custom',
    },

    templateId: { type: Schema.Types.ObjectId, ref: 'LandingPage' },
    isTemplate: { type: Boolean, default: false },
    templateCategory: String,

    content: { type: String, required: true },
    css: { type: String, default: '' },
    html: String,

    enableABTesting: { type: Boolean, default: false },
    variants: [LandingPageVariantSchema],
    activeVariantId: Schema.Types.ObjectId,

    seo: {
      title: { type: String, required: true },
      description: { type: String, required: true },
      keywords: [String],
      ogImage: String,
      ogTitle: String,
      ogDescription: String,
      canonicalUrl: String,
      noIndex: { type: Boolean, default: false },
      structuredData: Schema.Types.Mixed,
    },

    forms: [LandingPageFormSchema],

    customDomain: String,
    isPublished: { type: Boolean, default: false },
    publishedAt: Date,
    scheduledPublishAt: Date,

    trackingEnabled: { type: Boolean, default: true },
    utmParameters: {
      source: String,
      medium: String,
      campaign: String,
      term: String,
      content: String,
    },
    googleAnalyticsId: String,
    facebookPixelId: String,

    conversionGoals: [
      {
        name: { type: String, required: true },
        type: {
          type: String,
          enum: ['form_submit', 'button_click', 'page_view', 'scroll_depth', 'time_on_page'],
          required: true,
        },
        target: String,
        value: Number,
      },
    ],

    impressions: { type: Number, default: 0 },
    uniqueVisitors: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },

    analyticsHistory: [LandingPageAnalyticsSchema],

    requiresPassword: { type: Boolean, default: false },
    password: { type: String, select: false },
    allowedEmails: [String],

    mobileOptimized: { type: Boolean, default: true },
    mobileContent: String,
    mobileCss: String,

    status: {
      type: String,
      enum: ['draft', 'review', 'published', 'archived'],
      default: 'draft',
    },

    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    lastModifiedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Indexes
LandingPageSchema.index({ slug: 1, tenantId: 1 }, { unique: true });
LandingPageSchema.index({ type: 1, isPublished: 1 });
LandingPageSchema.index({ isTemplate: 1, templateCategory: 1 });
LandingPageSchema.index({ status: 1 });
LandingPageSchema.index({ customDomain: 1 });

// Methods
LandingPageSchema.methods.updateAnalytics = function (data: Partial<ILandingPageAnalytics>) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existingAnalytics = this.analyticsHistory.find(
    (a: ILandingPageAnalytics) => a.date.getTime() === today.getTime()
  );

  if (existingAnalytics) {
    Object.assign(existingAnalytics, data);
  } else {
    this.analyticsHistory.push({
      date: today,
      visitors: data.visitors || 0,
      uniqueVisitors: data.uniqueVisitors || 0,
      pageViews: data.pageViews || 0,
      bounceRate: data.bounceRate || 0,
      avgTimeOnPage: data.avgTimeOnPage || 0,
      conversions: data.conversions || 0,
      conversionRate: data.conversionRate || 0,
      trafficSources: data.trafficSources || [],
    });
  }

  return this.save();
};

LandingPageSchema.methods.trackConversion = function () {
  this.conversions += 1;
  if (this.impressions > 0) {
    this.conversionRate = (this.conversions / this.impressions) * 100;
  }
  return this.save();
};

export const LandingPage = mongoose.model<ILandingPage>('LandingPage', LandingPageSchema);
