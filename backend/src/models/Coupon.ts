import mongoose, { Schema, Document } from 'mongoose';

export interface ICouponRestrictions {
  minimumPurchaseAmount?: number;
  maximumDiscountAmount?: number;
  firstTimeUsersOnly?: boolean;
  applicableToTiers?: string[];
  applicableToCourses?: mongoose.Types.ObjectId[];
  applicableToBundles?: mongoose.Types.ObjectId[];
  applicableToCategories?: string[];
  excludedCourses?: mongoose.Types.ObjectId[];
  userSegments?: string[]; // 'students', 'instructors', 'new_users', 'churned_users'
  geographicRestrictions?: {
    countries?: string[];
    excludedCountries?: string[];
  };
}

export interface ICouponUsage {
  userId: mongoose.Types.ObjectId;
  transactionId: mongoose.Types.ObjectId;
  discountAmount: number;
  usedAt: Date;
}

export interface ICoupon extends Document {
  code: string;
  name: string;
  description?: string;

  // Discount type
  type: 'percentage' | 'fixed_amount' | 'free_trial' | 'buy_one_get_one';
  value: number; // percentage (0-100) or fixed amount

  // Usage limits
  usageType: 'single_use' | 'multi_use' | 'unlimited';
  maxUsages?: number;
  maxUsagesPerUser?: number;
  currentUsages: number;
  usageHistory: ICouponUsage[];

  // Validity
  isActive: boolean;
  startDate?: Date;
  expirationDate?: Date;

  // Restrictions
  restrictions: ICouponRestrictions;

  // Automatic application
  isAutomatic: boolean; // Auto-apply if conditions met
  automaticConditions?: {
    minimumAmount?: number;
    courseCategories?: string[];
    userSegments?: string[];
  };

  // Referral
  isReferralCoupon: boolean;
  referrerId?: mongoose.Types.ObjectId;
  referralBonus?: number; // Amount/percentage to give to referrer

  // Stacking
  stackable: boolean; // Can be combined with other coupons

  // Analytics
  totalRevenue: number;
  totalDiscountGiven: number;
  conversionRate: number;

  // Metadata
  campaign?: string;
  createdBy: mongoose.Types.ObjectId;
  metadata?: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
}

const CouponRestrictionsSchema = new Schema<ICouponRestrictions>({
  minimumPurchaseAmount: { type: Number },
  maximumDiscountAmount: { type: Number },
  firstTimeUsersOnly: { type: Boolean, default: false },
  applicableToTiers: [{ type: String }],
  applicableToCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
  applicableToBundles: [{ type: Schema.Types.ObjectId, ref: 'CourseBundle' }],
  applicableToCategories: [{ type: String }],
  excludedCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
  userSegments: [{ type: String }],
  geographicRestrictions: {
    countries: [{ type: String }],
    excludedCountries: [{ type: String }]
  }
}, { _id: false });

const CouponUsageSchema = new Schema<ICouponUsage>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  transactionId: { type: Schema.Types.ObjectId, ref: 'Transaction', required: true },
  discountAmount: { type: Number, required: true },
  usedAt: { type: Date, default: Date.now }
}, { _id: false });

const CouponSchema = new Schema<ICoupon>({
  code: { type: String, required: true, unique: true, uppercase: true },
  name: { type: String, required: true },
  description: { type: String },

  type: {
    type: String,
    enum: ['percentage', 'fixed_amount', 'free_trial', 'buy_one_get_one'],
    required: true
  },
  value: { type: Number, required: true },

  usageType: {
    type: String,
    enum: ['single_use', 'multi_use', 'unlimited'],
    default: 'multi_use'
  },
  maxUsages: { type: Number },
  maxUsagesPerUser: { type: Number, default: 1 },
  currentUsages: { type: Number, default: 0 },
  usageHistory: [CouponUsageSchema],

  isActive: { type: Boolean, default: true },
  startDate: { type: Date },
  expirationDate: { type: Date },

  restrictions: { type: CouponRestrictionsSchema, default: {} },

  isAutomatic: { type: Boolean, default: false },
  automaticConditions: {
    minimumAmount: { type: Number },
    courseCategories: [{ type: String }],
    userSegments: [{ type: String }]
  },

  isReferralCoupon: { type: Boolean, default: false },
  referrerId: { type: Schema.Types.ObjectId, ref: 'User' },
  referralBonus: { type: Number },

  stackable: { type: Boolean, default: false },

  totalRevenue: { type: Number, default: 0 },
  totalDiscountGiven: { type: Number, default: 0 },
  conversionRate: { type: Number, default: 0 },

  campaign: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  metadata: { type: Schema.Types.Mixed }
}, { timestamps: true });

// Indexes
CouponSchema.index({ code: 1 }, { unique: true });
CouponSchema.index({ isActive: 1, expirationDate: 1 });
CouponSchema.index({ type: 1 });
CouponSchema.index({ createdBy: 1 });
CouponSchema.index({ campaign: 1 });
CouponSchema.index({ isReferralCoupon: 1, referrerId: 1 });

// Virtual for isExpired
CouponSchema.virtual('isExpired').get(function() {
  if (!this.expirationDate) return false;
  return new Date() > this.expirationDate;
});

// Virtual for isValid
CouponSchema.virtual('isValid').get(function() {
  if (!this.isActive) return false;
  if (this.isExpired) return false;
  if (this.startDate && new Date() < this.startDate) return false;
  if (this.usageType !== 'unlimited' && this.maxUsages && this.currentUsages >= this.maxUsages) {
    return false;
  }
  return true;
});

// Virtual for remainingUsages
CouponSchema.virtual('remainingUsages').get(function() {
  if (this.usageType === 'unlimited') return -1;
  if (!this.maxUsages) return -1;
  return Math.max(0, this.maxUsages - this.currentUsages);
});

// Methods
CouponSchema.methods.canBeUsedBy = function(userId: mongoose.Types.ObjectId): boolean {
  if (!this.isValid) return false;

  if (this.maxUsagesPerUser) {
    const userUsages = this.usageHistory.filter(
      usage => usage.userId.toString() === userId.toString()
    ).length;

    if (userUsages >= this.maxUsagesPerUser) return false;
  }

  return true;
};

CouponSchema.methods.recordUsage = function(
  userId: mongoose.Types.ObjectId,
  transactionId: mongoose.Types.ObjectId,
  discountAmount: number
) {
  this.usageHistory.push({
    userId,
    transactionId,
    discountAmount,
    usedAt: new Date()
  });

  this.currentUsages += 1;
  this.totalDiscountGiven += discountAmount;

  return this.save();
};

CouponSchema.methods.calculateDiscount = function(amount: number): number {
  let discount = 0;

  if (this.type === 'percentage') {
    discount = (amount * this.value) / 100;
  } else if (this.type === 'fixed_amount') {
    discount = this.value;
  }

  // Apply maximum discount cap if set
  if (this.restrictions.maximumDiscountAmount) {
    discount = Math.min(discount, this.restrictions.maximumDiscountAmount);
  }

  // Discount cannot exceed the purchase amount
  discount = Math.min(discount, amount);

  return Math.round(discount * 100) / 100;
};

CouponSchema.methods.isApplicableToCourse = function(courseId: mongoose.Types.ObjectId): boolean {
  const restrictions = this.restrictions;

  // Check if course is explicitly excluded
  if (restrictions.excludedCourses && restrictions.excludedCourses.length > 0) {
    const isExcluded = restrictions.excludedCourses.some(
      id => id.toString() === courseId.toString()
    );
    if (isExcluded) return false;
  }

  // Check if course is in applicable courses
  if (restrictions.applicableToCourses && restrictions.applicableToCourses.length > 0) {
    return restrictions.applicableToCourses.some(
      id => id.toString() === courseId.toString()
    );
  }

  return true;
};

export default mongoose.model<ICoupon>('Coupon', CouponSchema);
