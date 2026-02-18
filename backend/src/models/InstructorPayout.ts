import mongoose, { Schema, Document } from 'mongoose';

export interface IPayoutMethod {
  type: 'bank_transfer' | 'paypal' | 'stripe_connect' | 'wire_transfer';
  details: {
    // Bank transfer
    accountHolderName?: string;
    accountNumber?: string;
    routingNumber?: string;
    bankName?: string;
    swiftCode?: string;

    // PayPal
    paypalEmail?: string;

    // Stripe Connect
    stripeAccountId?: string;

    // Wire transfer
    iban?: string;
    bicCode?: string;
  };
  isDefault: boolean;
  isVerified: boolean;
  verifiedAt?: Date;
}

export interface ITaxForm {
  type: 'W9' | 'W8BEN' | 'W8BEN_E' | 'other';
  status: 'not_submitted' | 'pending' | 'approved' | 'rejected';
  fileUrl?: string;
  submittedAt?: Date;
  reviewedAt?: Date;
  rejectionReason?: string;
  expiresAt?: Date;
}

export interface IPayoutLineItem {
  transactionId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  courseName: string;
  saleDate: Date;
  grossAmount: number;
  platformFee: number;
  netAmount: number;
  currency: string;
}

export interface IInstructorPayout extends Document {
  instructorId: mongoose.Types.ObjectId;

  // Payout details
  payoutId: string; // Unique payout ID
  status: 'pending' | 'scheduled' | 'processing' | 'paid' | 'failed' | 'canceled';

  // Payment method
  payoutMethod: IPayoutMethod;

  // Amounts
  totalAmount: number;
  currency: string;
  lineItems: IPayoutLineItem[];

  // Period
  periodStart: Date;
  periodEnd: Date;

  // Processing
  scheduledDate?: Date;
  processedDate?: Date;
  paidDate?: Date;
  failureReason?: string;

  // Provider details
  providerPayoutId?: string; // Stripe transfer ID, PayPal payout ID, etc.
  providerStatus?: string;

  // Tax information
  taxForm: ITaxForm;
  taxWithheld: number;

  // Invoice
  invoiceNumber?: string;
  invoiceUrl?: string;

  // Metadata
  notes?: string;
  metadata?: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
}

export interface IInstructorEarnings extends Document {
  instructorId: mongoose.Types.ObjectId;

  // Revenue sharing settings
  revenueSharingModel: '70/30' | '80/20' | '85/15' | '90/10' | 'custom';
  instructorPercentage: number; // e.g., 70, 80, 85, 90
  platformPercentage: number; // e.g., 30, 20, 15, 10

  // Payout schedule
  payoutFrequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
  minimumPayoutAmount: number;
  payoutDay?: number; // Day of month/week for automatic payouts

  // Current earnings
  currentBalance: number;
  pendingBalance: number; // Not yet released (refund period, etc.)
  lifetimeEarnings: number;

  // Historical data
  lastPayoutDate?: Date;
  lastPayoutAmount?: number;
  nextPayoutDate?: Date;

  // Statistics
  totalSales: number;
  totalRefunds: number;
  totalTransactions: number;
  averageTransactionValue: number;

  // Course performance
  courseEarnings: {
    courseId: mongoose.Types.ObjectId;
    courseName: string;
    totalEarnings: number;
    salesCount: number;
    lastSaleDate?: Date;
  }[];

  // Payment methods
  payoutMethods: IPayoutMethod[];

  // Tax information
  taxForms: ITaxForm[];
  taxCountry: string;
  taxId?: string;
  vatNumber?: string;

  // Promotional pricing approvals
  canSetPromotionalPricing: boolean;
  promotionalPricingLimit?: number; // Minimum price instructor can set

  createdAt: Date;
  updatedAt: Date;
}

export interface IRevenueShare extends Document {
  transactionId: mongoose.Types.ObjectId;
  instructorId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;

  grossAmount: number;
  instructorShare: number;
  platformShare: number;
  instructorPercentage: number;

  status: 'pending' | 'released' | 'paid_out' | 'refunded';

  releasedAt?: Date; // When funds are available for payout
  paidOutAt?: Date;
  payoutId?: mongoose.Types.ObjectId;

  holdPeriod: number; // Days to hold before release (typically 30 days)
  releaseDate: Date;

  currency: string;

  createdAt: Date;
  updatedAt: Date;
}

const PayoutMethodSchema = new Schema<IPayoutMethod>({
  type: {
    type: String,
    enum: ['bank_transfer', 'paypal', 'stripe_connect', 'wire_transfer'],
    required: true
  },
  details: {
    accountHolderName: String,
    accountNumber: String,
    routingNumber: String,
    bankName: String,
    swiftCode: String,
    paypalEmail: String,
    stripeAccountId: String,
    iban: String,
    bicCode: String
  },
  isDefault: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  verifiedAt: Date
}, { _id: false });

const TaxFormSchema = new Schema<ITaxForm>({
  type: {
    type: String,
    enum: ['W9', 'W8BEN', 'W8BEN_E', 'other'],
    required: true
  },
  status: {
    type: String,
    enum: ['not_submitted', 'pending', 'approved', 'rejected'],
    default: 'not_submitted'
  },
  fileUrl: String,
  submittedAt: Date,
  reviewedAt: Date,
  rejectionReason: String,
  expiresAt: Date
}, { _id: false });

const PayoutLineItemSchema = new Schema<IPayoutLineItem>({
  transactionId: { type: Schema.Types.ObjectId, ref: 'Transaction', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  courseName: { type: String, required: true },
  saleDate: { type: Date, required: true },
  grossAmount: { type: Number, required: true },
  platformFee: { type: Number, required: true },
  netAmount: { type: Number, required: true },
  currency: { type: String, default: 'USD' }
}, { _id: false });

const InstructorPayoutSchema = new Schema<IInstructorPayout>({
  instructorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

  payoutId: { type: String, required: true, unique: true },
  status: {
    type: String,
    enum: ['pending', 'scheduled', 'processing', 'paid', 'failed', 'canceled'],
    default: 'pending'
  },

  payoutMethod: { type: PayoutMethodSchema, required: true },

  totalAmount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  lineItems: [PayoutLineItemSchema],

  periodStart: { type: Date, required: true },
  periodEnd: { type: Date, required: true },

  scheduledDate: Date,
  processedDate: Date,
  paidDate: Date,
  failureReason: String,

  providerPayoutId: String,
  providerStatus: String,

  taxForm: TaxFormSchema,
  taxWithheld: { type: Number, default: 0 },

  invoiceNumber: { type: String, unique: true, sparse: true },
  invoiceUrl: String,

  notes: String,
  metadata: Schema.Types.Mixed
}, { timestamps: true });

const InstructorEarningsSchema = new Schema<IInstructorEarnings>({
  instructorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

  revenueSharingModel: {
    type: String,
    enum: ['70/30', '80/20', '85/15', '90/10', 'custom'],
    default: '70/30'
  },
  instructorPercentage: { type: Number, default: 70 },
  platformPercentage: { type: Number, default: 30 },

  payoutFrequency: {
    type: String,
    enum: ['weekly', 'biweekly', 'monthly', 'quarterly'],
    default: 'monthly'
  },
  minimumPayoutAmount: { type: Number, default: 100 },
  payoutDay: Number,

  currentBalance: { type: Number, default: 0 },
  pendingBalance: { type: Number, default: 0 },
  lifetimeEarnings: { type: Number, default: 0 },

  lastPayoutDate: Date,
  lastPayoutAmount: Number,
  nextPayoutDate: Date,

  totalSales: { type: Number, default: 0 },
  totalRefunds: { type: Number, default: 0 },
  totalTransactions: { type: Number, default: 0 },
  averageTransactionValue: { type: Number, default: 0 },

  courseEarnings: [{
    courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
    courseName: String,
    totalEarnings: { type: Number, default: 0 },
    salesCount: { type: Number, default: 0 },
    lastSaleDate: Date
  }],

  payoutMethods: [PayoutMethodSchema],

  taxForms: [TaxFormSchema],
  taxCountry: { type: String, default: 'US' },
  taxId: String,
  vatNumber: String,

  canSetPromotionalPricing: { type: Boolean, default: true },
  promotionalPricingLimit: Number
}, { timestamps: true });

const RevenueShareSchema = new Schema<IRevenueShare>({
  transactionId: { type: Schema.Types.ObjectId, ref: 'Transaction', required: true },
  instructorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },

  grossAmount: { type: Number, required: true },
  instructorShare: { type: Number, required: true },
  platformShare: { type: Number, required: true },
  instructorPercentage: { type: Number, required: true },

  status: {
    type: String,
    enum: ['pending', 'released', 'paid_out', 'refunded'],
    default: 'pending'
  },

  releasedAt: Date,
  paidOutAt: Date,
  payoutId: { type: Schema.Types.ObjectId, ref: 'InstructorPayout' },

  holdPeriod: { type: Number, default: 30 },
  releaseDate: { type: Date, required: true },

  currency: { type: String, default: 'USD' }
}, { timestamps: true });

// Indexes
InstructorPayoutSchema.index({ instructorId: 1, status: 1 });
InstructorPayoutSchema.index({ payoutId: 1 }, { unique: true });
InstructorPayoutSchema.index({ periodStart: 1, periodEnd: 1 });
InstructorPayoutSchema.index({ scheduledDate: 1 });

InstructorEarningsSchema.index({ instructorId: 1 }, { unique: true });
InstructorEarningsSchema.index({ nextPayoutDate: 1 });

RevenueShareSchema.index({ instructorId: 1, status: 1 });
RevenueShareSchema.index({ transactionId: 1 });
RevenueShareSchema.index({ releaseDate: 1, status: 1 });
RevenueShareSchema.index({ payoutId: 1 });

// Methods
InstructorPayoutSchema.methods.generatePayoutId = function(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  this.payoutId = `PAYOUT-${year}${month}-${random}`;
  return this.payoutId;
};

InstructorEarningsSchema.methods.addEarning = function(
  courseId: mongoose.Types.ObjectId,
  courseName: string,
  amount: number
) {
  const courseEarning = this.courseEarnings.find(
    ce => ce.courseId.toString() === courseId.toString()
  );

  if (courseEarning) {
    courseEarning.totalEarnings += amount;
    courseEarning.salesCount += 1;
    courseEarning.lastSaleDate = new Date();
  } else {
    this.courseEarnings.push({
      courseId,
      courseName,
      totalEarnings: amount,
      salesCount: 1,
      lastSaleDate: new Date()
    });
  }

  this.currentBalance += amount;
  this.lifetimeEarnings += amount;
  this.totalSales += amount;
  this.totalTransactions += 1;
  this.averageTransactionValue = this.totalSales / this.totalTransactions;

  return this.save();
};

export const InstructorPayout = mongoose.model<IInstructorPayout>('InstructorPayout', InstructorPayoutSchema);
export const InstructorEarnings = mongoose.model<IInstructorEarnings>('InstructorEarnings', InstructorEarningsSchema);
export const RevenueShare = mongoose.model<IRevenueShare>('RevenueShare', RevenueShareSchema);

export default InstructorPayout;
