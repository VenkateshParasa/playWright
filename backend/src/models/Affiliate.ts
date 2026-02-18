import mongoose, { Document, Schema } from 'mongoose';

export interface IAffiliateCommission {
  _id?: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  courseId?: mongoose.Types.ObjectId;
  amount: number;
  commissionRate: number;
  commissionAmount: number;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  paidAt?: Date;
  paymentMethod?: string;
  paymentReference?: string;
  rejectedReason?: string;
  createdAt?: Date;
}

export interface IAffiliateClick {
  _id?: mongoose.Types.ObjectId;
  ip: string;
  userAgent: string;
  referer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  country?: string;
  city?: string;
  device?: 'desktop' | 'mobile' | 'tablet';
  converted: boolean;
  conversionValue?: number;
  timestamp: Date;
}

export interface IAffiliateLink {
  _id?: mongoose.Types.ObjectId;
  name: string;
  url: string;
  trackingCode: string;
  courseId?: mongoose.Types.ObjectId;
  clicks: number;
  conversions: number;
  revenue: number;
  isActive: boolean;
  createdAt?: Date;
}

export interface IAffiliateTier {
  level: number;
  name: string;
  minSales: number;
  commissionRate: number;
  bonuses?: {
    type: 'fixed' | 'percentage';
    value: number;
    condition?: string;
  }[];
}

export interface IAffiliatePayment {
  _id?: mongoose.Types.ObjectId;
  amount: number;
  method: 'paypal' | 'bank_transfer' | 'stripe' | 'check';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  transactionId?: string;
  paypalEmail?: string;
  bankDetails?: {
    accountName?: string;
    accountNumber?: string;
    routingNumber?: string;
    bankName?: string;
    swiftCode?: string;
  };
  processedAt?: Date;
  completedAt?: Date;
  failedReason?: string;
  notes?: string;
  commissionIds: mongoose.Types.ObjectId[];
  createdAt?: Date;
}

export interface IAffiliate extends Document {
  tenantId?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;

  // Basic Info
  companyName?: string;
  website?: string;
  bio?: string;

  // Status
  status: 'pending' | 'active' | 'suspended' | 'rejected';
  approvedAt?: Date;
  approvedBy?: mongoose.Types.ObjectId;
  rejectedAt?: Date;
  rejectedReason?: string;
  suspendedAt?: Date;
  suspendedReason?: string;

  // Unique Tracking
  affiliateCode: string; // Unique identifier
  affiliateUrl: string; // Base affiliate URL
  cookieDuration: number; // days (default 30)

  // Commission Structure
  commissionType: 'percentage' | 'fixed' | 'tiered';
  commissionRate: number; // percentage or fixed amount
  tier?: IAffiliateTier;

  // Multi-tier / MLM
  parentAffiliateId?: mongoose.Types.ObjectId;
  childAffiliates: mongoose.Types.ObjectId[];
  multiTierEnabled: boolean;
  tierCommissions?: {
    level: number;
    rate: number;
  }[];

  // Performance
  totalClicks: number;
  totalConversions: number;
  conversionRate: number;
  totalRevenue: number;
  totalCommissionEarned: number;
  totalCommissionPaid: number;
  pendingCommission: number;

  // Links
  links: IAffiliateLink[];

  // Clicks History
  clicks: IAffiliateClick[];

  // Commissions
  commissions: IAffiliateCommission[];

  // Payments
  payments: IAffiliatePayment[];
  paymentMethod: 'paypal' | 'bank_transfer' | 'stripe' | 'check';
  paymentDetails: {
    paypalEmail?: string;
    bankDetails?: {
      accountName?: string;
      accountNumber?: string;
      routingNumber?: string;
      bankName?: string;
      swiftCode?: string;
    };
    stripeAccountId?: string;
  };
  minimumPayout: number; // Minimum amount for payout
  paymentSchedule: 'weekly' | 'bi-weekly' | 'monthly' | 'manual';
  lastPayoutDate?: Date;

  // Marketing Materials
  allowedMaterials: {
    banners: boolean;
    emailTemplates: boolean;
    socialMedia: boolean;
    landingPages: boolean;
  };
  customBanners?: {
    _id?: mongoose.Types.ObjectId;
    name: string;
    imageUrl: string;
    size: string;
    clicks: number;
  }[];

  // Restrictions
  allowedCourses?: mongoose.Types.ObjectId[]; // If empty, all courses allowed
  restrictedRegions?: string[];
  maxLinksAllowed?: number;

  // Referral Leaderboard
  rank?: number;
  badges?: string[];
  achievements?: {
    name: string;
    description: string;
    earnedAt: Date;
  }[];

  // Compliance
  agreedToTerms: boolean;
  agreedToTermsAt?: Date;
  taxForm?: string; // URL to uploaded tax form
  taxId?: string;

  // Notifications
  notifications: {
    newSale: boolean;
    paymentReceived: boolean;
    weeklyReport: boolean;
    monthlyReport: boolean;
  };

  // Analytics
  monthlyStats: {
    month: Date;
    clicks: number;
    conversions: number;
    revenue: number;
    commission: number;
  }[];

  // Notes (internal)
  internalNotes?: string;

  createdAt: Date;
  updatedAt: Date;
}

const AffiliateClickSchema = new Schema<IAffiliateClick>({
  ip: { type: String, required: true },
  userAgent: { type: String, required: true },
  referer: String,
  utmSource: String,
  utmMedium: String,
  utmCampaign: String,
  country: String,
  city: String,
  device: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet'],
  },
  converted: { type: Boolean, default: false },
  conversionValue: Number,
  timestamp: { type: Date, default: Date.now },
});

const AffiliateLinkSchema = new Schema<IAffiliateLink>(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    trackingCode: { type: String, required: true, unique: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
    clicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const AffiliateCommissionSchema = new Schema<IAffiliateCommission>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
    amount: { type: Number, required: true },
    commissionRate: { type: Number, required: true },
    commissionAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'paid', 'rejected'],
      default: 'pending',
    },
    paidAt: Date,
    paymentMethod: String,
    paymentReference: String,
    rejectedReason: String,
  },
  { timestamps: true }
);

const AffiliatePaymentSchema = new Schema<IAffiliatePayment>(
  {
    amount: { type: Number, required: true },
    method: {
      type: String,
      enum: ['paypal', 'bank_transfer', 'stripe', 'check'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    transactionId: String,
    paypalEmail: String,
    bankDetails: {
      accountName: String,
      accountNumber: String,
      routingNumber: String,
      bankName: String,
      swiftCode: String,
    },
    processedAt: Date,
    completedAt: Date,
    failedReason: String,
    notes: String,
    commissionIds: [{ type: Schema.Types.ObjectId, ref: 'Commission' }],
  },
  { timestamps: true }
);

const AffiliateTierSchema = new Schema<IAffiliateTier>({
  level: { type: Number, required: true },
  name: { type: String, required: true },
  minSales: { type: Number, required: true },
  commissionRate: { type: Number, required: true },
  bonuses: [
    {
      type: {
        type: String,
        enum: ['fixed', 'percentage'],
      },
      value: Number,
      condition: String,
    },
  ],
});

const AffiliateSchema = new Schema<IAffiliate>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      index: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    companyName: String,
    website: String,
    bio: String,

    status: {
      type: String,
      enum: ['pending', 'active', 'suspended', 'rejected'],
      default: 'pending',
      index: true,
    },
    approvedAt: Date,
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    rejectedAt: Date,
    rejectedReason: String,
    suspendedAt: Date,
    suspendedReason: String,

    affiliateCode: { type: String, required: true, unique: true, index: true },
    affiliateUrl: { type: String, required: true },
    cookieDuration: { type: Number, default: 30 },

    commissionType: {
      type: String,
      enum: ['percentage', 'fixed', 'tiered'],
      default: 'percentage',
    },
    commissionRate: { type: Number, required: true },
    tier: AffiliateTierSchema,

    parentAffiliateId: { type: Schema.Types.ObjectId, ref: 'Affiliate' },
    childAffiliates: [{ type: Schema.Types.ObjectId, ref: 'Affiliate' }],
    multiTierEnabled: { type: Boolean, default: false },
    tierCommissions: [
      {
        level: Number,
        rate: Number,
      },
    ],

    totalClicks: { type: Number, default: 0 },
    totalConversions: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    totalCommissionEarned: { type: Number, default: 0 },
    totalCommissionPaid: { type: Number, default: 0 },
    pendingCommission: { type: Number, default: 0 },

    links: [AffiliateLinkSchema],
    clicks: [AffiliateClickSchema],
    commissions: [AffiliateCommissionSchema],
    payments: [AffiliatePaymentSchema],

    paymentMethod: {
      type: String,
      enum: ['paypal', 'bank_transfer', 'stripe', 'check'],
      default: 'paypal',
    },
    paymentDetails: {
      paypalEmail: String,
      bankDetails: {
        accountName: String,
        accountNumber: String,
        routingNumber: String,
        bankName: String,
        swiftCode: String,
      },
      stripeAccountId: String,
    },
    minimumPayout: { type: Number, default: 50 },
    paymentSchedule: {
      type: String,
      enum: ['weekly', 'bi-weekly', 'monthly', 'manual'],
      default: 'monthly',
    },
    lastPayoutDate: Date,

    allowedMaterials: {
      banners: { type: Boolean, default: true },
      emailTemplates: { type: Boolean, default: true },
      socialMedia: { type: Boolean, default: true },
      landingPages: { type: Boolean, default: true },
    },
    customBanners: [
      {
        name: String,
        imageUrl: String,
        size: String,
        clicks: { type: Number, default: 0 },
      },
    ],

    allowedCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    restrictedRegions: [String],
    maxLinksAllowed: Number,

    rank: Number,
    badges: [String],
    achievements: [
      {
        name: String,
        description: String,
        earnedAt: Date,
      },
    ],

    agreedToTerms: { type: Boolean, default: false },
    agreedToTermsAt: Date,
    taxForm: String,
    taxId: String,

    notifications: {
      newSale: { type: Boolean, default: true },
      paymentReceived: { type: Boolean, default: true },
      weeklyReport: { type: Boolean, default: true },
      monthlyReport: { type: Boolean, default: false },
    },

    monthlyStats: [
      {
        month: Date,
        clicks: Number,
        conversions: Number,
        revenue: Number,
        commission: Number,
      },
    ],

    internalNotes: String,
  },
  { timestamps: true }
);

// Indexes
AffiliateSchema.index({ affiliateCode: 1 }, { unique: true });
AffiliateSchema.index({ userId: 1, tenantId: 1 });
AffiliateSchema.index({ status: 1 });
AffiliateSchema.index({ totalRevenue: -1 });
AffiliateSchema.index({ 'links.trackingCode': 1 });

// Methods
AffiliateSchema.methods.trackClick = function (clickData: Partial<IAffiliateClick>) {
  this.clicks.push({
    ip: clickData.ip || '',
    userAgent: clickData.userAgent || '',
    referer: clickData.referer,
    utmSource: clickData.utmSource,
    utmMedium: clickData.utmMedium,
    utmCampaign: clickData.utmCampaign,
    country: clickData.country,
    city: clickData.city,
    device: clickData.device,
    converted: false,
    timestamp: new Date(),
  });

  this.totalClicks += 1;

  return this.save();
};

AffiliateSchema.methods.trackConversion = function (orderId: mongoose.Types.ObjectId, amount: number, courseId?: mongoose.Types.ObjectId) {
  const commissionAmount = this.commissionType === 'percentage'
    ? (amount * this.commissionRate) / 100
    : this.commissionRate;

  this.commissions.push({
    orderId,
    courseId,
    amount,
    commissionRate: this.commissionRate,
    commissionAmount,
    status: 'pending',
  });

  this.totalConversions += 1;
  this.totalRevenue += amount;
  this.totalCommissionEarned += commissionAmount;
  this.pendingCommission += commissionAmount;
  this.conversionRate = (this.totalConversions / this.totalClicks) * 100;

  return this.save();
};

AffiliateSchema.methods.processPayment = function (paymentData: Partial<IAffiliatePayment>) {
  const payment: IAffiliatePayment = {
    amount: paymentData.amount || 0,
    method: paymentData.method || this.paymentMethod,
    status: 'pending',
    commissionIds: paymentData.commissionIds || [],
    createdAt: new Date(),
  };

  this.payments.push(payment);
  this.lastPayoutDate = new Date();

  return this.save();
};

export const Affiliate = mongoose.model<IAffiliate>('Affiliate', AffiliateSchema);
