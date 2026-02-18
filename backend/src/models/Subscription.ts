import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscriptionFeature {
  name: string;
  enabled: boolean;
  limit?: number; // -1 for unlimited
  description?: string;
}

export interface ISubscriptionTier {
  name: string;
  displayName: string;
  description: string;
  price: number;
  currency: string;
  billingPeriod: 'monthly' | 'quarterly' | 'yearly' | 'lifetime';
  features: ISubscriptionFeature[];
  maxCourses: number; // -1 for unlimited
  maxStudents: number; // -1 for unlimited
  storageLimit: number; // in GB, -1 for unlimited
  supportLevel: 'community' | 'email' | 'priority' | 'dedicated';
  isActive: boolean;
  trialDays?: number;
  stripePriceId?: string;
  order: number;
}

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId;
  tier: 'free' | 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'paused' | 'incomplete';

  // Billing details
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;

  // Payment details
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  cancelReason?: string;

  // Trial
  trialStart?: Date;
  trialEnd?: Date;

  // Pause subscription
  pausedAt?: Date;
  pauseReason?: string;
  pauseCollection?: {
    behavior: 'keep_as_draft' | 'mark_uncollectible' | 'void';
    resumesAt?: Date;
  };

  // Pricing
  amount: number;
  currency: string;
  billingPeriod: 'monthly' | 'quarterly' | 'yearly' | 'lifetime';

  // Proration
  prorationBehavior: 'create_prorations' | 'none' | 'always_invoice';

  // Grace period for failed payments
  gracePeriodEndsAt?: Date;

  // Dunning management
  failedPaymentAttempts: number;
  lastPaymentAttempt?: Date;
  nextRetryDate?: Date;

  // Discounts
  couponId?: mongoose.Types.ObjectId;
  discountAmount?: number;
  discountPercentage?: number;
  discountEndsAt?: Date;

  // Usage tracking
  usage: {
    coursesAccessed: number;
    storageUsed: number; // in GB
    apiCallsThisMonth: number;
  };

  // Metadata
  metadata?: Record<string, any>;
  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface ISubscriptionHistory extends Document {
  subscriptionId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  action: 'created' | 'upgraded' | 'downgraded' | 'canceled' | 'renewed' | 'paused' | 'resumed' | 'trial_started' | 'trial_ended';
  fromTier?: string;
  toTier?: string;
  reason?: string;
  prorationAmount?: number;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const SubscriptionFeatureSchema = new Schema<ISubscriptionFeature>({
  name: { type: String, required: true },
  enabled: { type: Boolean, default: true },
  limit: { type: Number, default: -1 },
  description: { type: String }
}, { _id: false });

const SubscriptionTierSchema = new Schema<ISubscriptionTier>({
  name: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  billingPeriod: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly', 'lifetime'],
    required: true
  },
  features: [SubscriptionFeatureSchema],
  maxCourses: { type: Number, default: -1 },
  maxStudents: { type: Number, default: -1 },
  storageLimit: { type: Number, default: -1 },
  supportLevel: {
    type: String,
    enum: ['community', 'email', 'priority', 'dedicated'],
    default: 'community'
  },
  isActive: { type: Boolean, default: true },
  trialDays: { type: Number, default: 0 },
  stripePriceId: { type: String },
  order: { type: Number, required: true }
}, { timestamps: true });

const SubscriptionSchema = new Schema<ISubscription>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tier: {
    type: String,
    enum: ['free', 'basic', 'pro', 'enterprise'],
    default: 'free',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'canceled', 'past_due', 'trialing', 'paused', 'incomplete'],
    default: 'active',
    required: true
  },

  stripeCustomerId: { type: String, sparse: true },
  stripeSubscriptionId: { type: String, sparse: true },
  stripePriceId: { type: String },

  currentPeriodStart: { type: Date, required: true },
  currentPeriodEnd: { type: Date, required: true },
  cancelAtPeriodEnd: { type: Boolean, default: false },
  canceledAt: { type: Date },
  cancelReason: { type: String },

  trialStart: { type: Date },
  trialEnd: { type: Date },

  pausedAt: { type: Date },
  pauseReason: { type: String },
  pauseCollection: {
    behavior: {
      type: String,
      enum: ['keep_as_draft', 'mark_uncollectible', 'void']
    },
    resumesAt: { type: Date }
  },

  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  billingPeriod: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly', 'lifetime'],
    required: true
  },

  prorationBehavior: {
    type: String,
    enum: ['create_prorations', 'none', 'always_invoice'],
    default: 'create_prorations'
  },

  gracePeriodEndsAt: { type: Date },
  failedPaymentAttempts: { type: Number, default: 0 },
  lastPaymentAttempt: { type: Date },
  nextRetryDate: { type: Date },

  couponId: { type: Schema.Types.ObjectId, ref: 'Coupon' },
  discountAmount: { type: Number },
  discountPercentage: { type: Number },
  discountEndsAt: { type: Date },

  usage: {
    coursesAccessed: { type: Number, default: 0 },
    storageUsed: { type: Number, default: 0 },
    apiCallsThisMonth: { type: Number, default: 0 }
  },

  metadata: { type: Schema.Types.Mixed },
  notes: { type: String }
}, { timestamps: true });

const SubscriptionHistorySchema = new Schema<ISubscriptionHistory>({
  subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  action: {
    type: String,
    enum: ['created', 'upgraded', 'downgraded', 'canceled', 'renewed', 'paused', 'resumed', 'trial_started', 'trial_ended'],
    required: true
  },
  fromTier: { type: String },
  toTier: { type: String },
  reason: { type: String },
  prorationAmount: { type: Number },
  metadata: { type: Schema.Types.Mixed }
}, { timestamps: true });

// Indexes
SubscriptionSchema.index({ userId: 1, status: 1 });
SubscriptionSchema.index({ stripeCustomerId: 1 });
SubscriptionSchema.index({ stripeSubscriptionId: 1 });
SubscriptionSchema.index({ tier: 1 });
SubscriptionSchema.index({ currentPeriodEnd: 1 });
SubscriptionSchema.index({ gracePeriodEndsAt: 1 });

SubscriptionHistorySchema.index({ subscriptionId: 1, createdAt: -1 });
SubscriptionHistorySchema.index({ userId: 1, createdAt: -1 });

// Methods
SubscriptionSchema.methods.isActive = function(): boolean {
  return this.status === 'active' || this.status === 'trialing';
};

SubscriptionSchema.methods.isInTrial = function(): boolean {
  if (!this.trialEnd) return false;
  return this.status === 'trialing' && new Date() < this.trialEnd;
};

SubscriptionSchema.methods.daysUntilRenewal = function(): number {
  const now = new Date();
  const diff = this.currentPeriodEnd.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const Subscription = mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
export const SubscriptionTier = mongoose.model<ISubscriptionTier>('SubscriptionTier', SubscriptionTierSchema);
export const SubscriptionHistory = mongoose.model<ISubscriptionHistory>('SubscriptionHistory', SubscriptionHistorySchema);

export default Subscription;
