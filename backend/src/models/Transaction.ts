import mongoose, { Schema, Document } from 'mongoose';

export interface ILineItem {
  description: string;
  courseId?: mongoose.Types.ObjectId;
  bundleId?: mongoose.Types.ObjectId;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
  metadata?: Record<string, any>;
}

export interface IRefund {
  refundId: string; // Stripe refund ID
  amount: number;
  reason: string;
  status: 'pending' | 'succeeded' | 'failed' | 'canceled';
  processedAt?: Date;
  metadata?: Record<string, any>;
}

export interface ITax {
  country: string;
  state?: string;
  taxType: 'VAT' | 'GST' | 'sales_tax' | 'none';
  rate: number;
  amount: number;
  taxId?: string; // Customer's tax ID
}

export interface ITransaction extends Document {
  // Customer details
  userId: mongoose.Types.ObjectId;
  customerEmail: string;

  // Transaction details
  transactionId: string; // Unique transaction ID
  type: 'purchase' | 'subscription' | 'refund' | 'payout' | 'installment';
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'partially_refunded' | 'disputed';

  // Payment provider
  provider: 'stripe' | 'paypal' | 'apple_pay' | 'google_pay' | 'bank_transfer';
  providerTransactionId?: string; // Stripe charge ID, PayPal transaction ID, etc.
  paymentMethodType?: string; // card, bank_account, etc.
  paymentMethodLast4?: string;

  // Line items
  lineItems: ILineItem[];

  // Amounts
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;

  // Discounts & Coupons
  couponId?: mongoose.Types.ObjectId;
  couponCode?: string;
  discountAmount: number;
  discountPercentage?: number;

  // Tax details
  taxDetails?: ITax;

  // Subscription related
  subscriptionId?: mongoose.Types.ObjectId;
  subscriptionPeriodStart?: Date;
  subscriptionPeriodEnd?: Date;

  // Installment plan
  installmentPlan?: {
    planId: mongoose.Types.ObjectId;
    installmentNumber: number;
    totalInstallments: number;
    remainingAmount: number;
  };

  // Refunds
  refunds: IRefund[];
  refundedAmount: number;

  // Revenue sharing
  revenueSharing?: {
    instructorShare: number;
    platformShare: number;
    instructorId: mongoose.Types.ObjectId;
    payoutStatus: 'pending' | 'scheduled' | 'paid' | 'failed';
    payoutId?: mongoose.Types.ObjectId;
  };

  // Invoice
  invoiceNumber?: string;
  invoiceUrl?: string;
  invoicePdfUrl?: string;

  // Billing address
  billingAddress?: {
    name: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state?: string;
    country: string;
    postalCode: string;
  };

  // Metadata
  description?: string;
  metadata?: Record<string, any>;
  notes?: string;

  // Timestamps
  paidAt?: Date;
  refundedAt?: Date;
  failedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITransactionAnalytics {
  period: string; // '2024-01', '2024-Q1', '2024', etc.
  totalRevenue: number;
  totalTransactions: number;
  averageOrderValue: number;
  refundRate: number;
  currency: string;
  breakdown: {
    byType: Record<string, number>;
    byProvider: Record<string, number>;
    byStatus: Record<string, number>;
  };
}

const LineItemSchema = new Schema<ILineItem>({
  description: { type: String, required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
  bundleId: { type: Schema.Types.ObjectId, ref: 'CourseBundle' },
  quantity: { type: Number, required: true, default: 1 },
  unitPrice: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
  metadata: { type: Schema.Types.Mixed }
}, { _id: false });

const RefundSchema = new Schema<IRefund>({
  refundId: { type: String, required: true },
  amount: { type: Number, required: true },
  reason: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'succeeded', 'failed', 'canceled'],
    default: 'pending'
  },
  processedAt: { type: Date },
  metadata: { type: Schema.Types.Mixed }
}, { _id: false, timestamps: true });

const TaxSchema = new Schema<ITax>({
  country: { type: String, required: true },
  state: { type: String },
  taxType: {
    type: String,
    enum: ['VAT', 'GST', 'sales_tax', 'none'],
    default: 'none'
  },
  rate: { type: Number, required: true },
  amount: { type: Number, required: true },
  taxId: { type: String }
}, { _id: false });

const TransactionSchema = new Schema<ITransaction>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  customerEmail: { type: String, required: true },

  transactionId: { type: String, required: true, unique: true },
  type: {
    type: String,
    enum: ['purchase', 'subscription', 'refund', 'payout', 'installment'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'partially_refunded', 'disputed'],
    default: 'pending',
    required: true
  },

  provider: {
    type: String,
    enum: ['stripe', 'paypal', 'apple_pay', 'google_pay', 'bank_transfer'],
    required: true
  },
  providerTransactionId: { type: String },
  paymentMethodType: { type: String },
  paymentMethodLast4: { type: String },

  lineItems: [LineItemSchema],

  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
  currency: { type: String, default: 'USD' },

  couponId: { type: Schema.Types.ObjectId, ref: 'Coupon' },
  couponCode: { type: String },
  discountAmount: { type: Number, default: 0 },
  discountPercentage: { type: Number },

  taxDetails: TaxSchema,

  subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription' },
  subscriptionPeriodStart: { type: Date },
  subscriptionPeriodEnd: { type: Date },

  installmentPlan: {
    planId: { type: Schema.Types.ObjectId, ref: 'InstallmentPlan' },
    installmentNumber: { type: Number },
    totalInstallments: { type: Number },
    remainingAmount: { type: Number }
  },

  refunds: [RefundSchema],
  refundedAmount: { type: Number, default: 0 },

  revenueSharing: {
    instructorShare: { type: Number },
    platformShare: { type: Number },
    instructorId: { type: Schema.Types.ObjectId, ref: 'User' },
    payoutStatus: {
      type: String,
      enum: ['pending', 'scheduled', 'paid', 'failed']
    },
    payoutId: { type: Schema.Types.ObjectId, ref: 'InstructorPayout' }
  },

  invoiceNumber: { type: String, unique: true, sparse: true },
  invoiceUrl: { type: String },
  invoicePdfUrl: { type: String },

  billingAddress: {
    name: { type: String },
    addressLine1: { type: String },
    addressLine2: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    postalCode: { type: String }
  },

  description: { type: String },
  metadata: { type: Schema.Types.Mixed },
  notes: { type: String },

  paidAt: { type: Date },
  refundedAt: { type: Date },
  failedAt: { type: Date }
}, { timestamps: true });

// Indexes
TransactionSchema.index({ userId: 1, createdAt: -1 });
TransactionSchema.index({ transactionId: 1 }, { unique: true });
TransactionSchema.index({ providerTransactionId: 1 });
TransactionSchema.index({ type: 1, status: 1 });
TransactionSchema.index({ subscriptionId: 1 });
TransactionSchema.index({ 'revenueSharing.instructorId': 1, 'revenueSharing.payoutStatus': 1 });
TransactionSchema.index({ createdAt: -1 });
TransactionSchema.index({ invoiceNumber: 1 });
TransactionSchema.index({ couponCode: 1 });

// Virtual for isRefunded
TransactionSchema.virtual('isRefunded').get(function() {
  return this.status === 'refunded' || this.status === 'partially_refunded';
});

// Methods
TransactionSchema.methods.addRefund = function(refund: IRefund) {
  this.refunds.push(refund);
  this.refundedAmount += refund.amount;

  if (this.refundedAmount >= this.total) {
    this.status = 'refunded';
  } else if (this.refundedAmount > 0) {
    this.status = 'partially_refunded';
  }

  if (refund.status === 'succeeded') {
    this.refundedAt = new Date();
  }

  return this.save();
};

TransactionSchema.methods.generateInvoiceNumber = function(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  this.invoiceNumber = `INV-${year}${month}-${random}`;
  return this.invoiceNumber;
};

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
