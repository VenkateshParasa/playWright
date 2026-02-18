import mongoose, { Document, Schema } from 'mongoose';

export interface IReferral extends Document {
  tenantId?: mongoose.Types.ObjectId;
  referrerId: mongoose.Types.ObjectId; // User who referred
  referredUserId?: mongoose.Types.ObjectId; // User who was referred (after signup)
  referredEmail: string;

  // Tracking
  referralCode: string;
  referralLink: string;

  // Status
  status: 'pending' | 'signed_up' | 'converted' | 'rewarded' | 'expired';
  signedUpAt?: Date;
  convertedAt?: Date; // When referred user made a purchase
  rewardedAt?: Date;
  expiresAt?: Date;

  // Rewards
  referrerReward?: {
    type: 'credit' | 'discount' | 'free_month' | 'cash' | 'custom';
    value: number;
    description?: string;
    applied: boolean;
    appliedAt?: Date;
  };
  referredReward?: {
    type: 'credit' | 'discount' | 'free_month' | 'cash' | 'custom';
    value: number;
    description?: string;
    applied: boolean;
    appliedAt?: Date;
  };

  // Conversion Details
  conversionValue?: number;
  orderId?: mongoose.Types.ObjectId;

  // Tracking
  clickCount: number;
  lastClickAt?: Date;
  ipAddresses: string[];
  userAgents: string[];

  createdAt: Date;
  updatedAt: Date;
}

const ReferralSchema = new Schema<IReferral>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      index: true,
    },
    referrerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    referredUserId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    referredEmail: { type: String, required: true, index: true },

    referralCode: { type: String, required: true, unique: true, index: true },
    referralLink: { type: String, required: true },

    status: {
      type: String,
      enum: ['pending', 'signed_up', 'converted', 'rewarded', 'expired'],
      default: 'pending',
      index: true,
    },
    signedUpAt: Date,
    convertedAt: Date,
    rewardedAt: Date,
    expiresAt: Date,

    referrerReward: {
      type: {
        type: String,
        enum: ['credit', 'discount', 'free_month', 'cash', 'custom'],
      },
      value: Number,
      description: String,
      applied: { type: Boolean, default: false },
      appliedAt: Date,
    },
    referredReward: {
      type: {
        type: String,
        enum: ['credit', 'discount', 'free_month', 'cash', 'custom'],
      },
      value: Number,
      description: String,
      applied: { type: Boolean, default: false },
      appliedAt: Date,
    },

    conversionValue: Number,
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },

    clickCount: { type: Number, default: 0 },
    lastClickAt: Date,
    ipAddresses: [String],
    userAgents: [String],
  },
  { timestamps: true }
);

// Indexes
ReferralSchema.index({ referralCode: 1 }, { unique: true });
ReferralSchema.index({ referrerId: 1, status: 1 });
ReferralSchema.index({ referredEmail: 1 });
ReferralSchema.index({ expiresAt: 1 });

export const Referral = mongoose.model<IReferral>('Referral', ReferralSchema);
