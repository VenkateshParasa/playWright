import mongoose, { Schema, Document } from 'mongoose';

export interface IBundleCourse {
  courseId: mongoose.Types.ObjectId;
  order: number;
  isRequired: boolean;
}

export interface ICourseBundle extends Document {
  title: string;
  slug: string;
  description: string;
  thumbnail?: string;

  // Courses in bundle
  courses: IBundleCourse[];
  totalCourses: number;

  // Pricing
  regularPrice: number;
  bundlePrice: number;
  savings: number;
  savingsPercentage: number;
  currency: string;

  // Availability
  isActive: boolean;
  isPublished: boolean;
  availableFrom?: Date;
  availableUntil?: Date;

  // Bundle type
  bundleType: 'learning_path' | 'certification' | 'skill_bundle' | 'promotional';

  // Limits
  maxEnrollments?: number;
  currentEnrollments: number;

  // Metadata
  category: string;
  tags: string[];
  level: 'beginner' | 'intermediate' | 'advanced' | 'mixed';

  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICoursePricing extends Document {
  courseId: mongoose.Types.ObjectId;

  // Pricing models
  pricingModel: 'one_time' | 'subscription' | 'free' | 'freemium';

  // Base pricing
  basePrice: number;
  currency: string;

  // Tiered pricing
  tiers: {
    name: string; // 'basic', 'pro', 'enterprise'
    price: number;
    features: string[];
    isPopular?: boolean;
  }[];

  // Bulk/team licenses
  bulkPricing: {
    minSeats: number;
    maxSeats?: number;
    pricePerSeat: number;
    discount: number;
  }[];

  // Early bird pricing
  earlyBirdPricing?: {
    price: number;
    validUntil: Date;
    spotsAvailable?: number;
    spotsUsed: number;
  };

  // Subscription pricing
  subscriptionOptions?: {
    monthly: number;
    quarterly: number;
    yearly: number;
  };

  // Lifetime access
  lifetimeAccessPrice?: number;

  // Geographic pricing (PPP)
  geographicPricing: {
    country: string;
    countryCode: string;
    price: number;
    discount: number;
  }[];

  // Student discount
  studentDiscount?: {
    percentage: number;
    requiresVerification: boolean;
  };

  // Seasonal promotions
  seasonalPromotions: {
    name: string;
    startDate: Date;
    endDate: Date;
    discountPercentage: number;
    isActive: boolean;
  }[];

  // Installment plan
  installmentPlan?: {
    enabled: boolean;
    numberOfInstallments: number;
    downPayment: number;
    installmentAmount: number;
  };

  // Dynamic pricing
  dynamicPricingEnabled: boolean;
  dynamicPricingRules?: {
    demandMultiplier: number; // Adjust price based on demand
    minPrice: number;
    maxPrice: number;
  };

  createdAt: Date;
  updatedAt: Date;
}

export interface IInstallmentPlan extends Document {
  userId: mongoose.Types.ObjectId;
  courseId?: mongoose.Types.ObjectId;
  bundleId?: mongoose.Types.ObjectId;

  totalAmount: number;
  downPayment: number;
  numberOfInstallments: number;
  installmentAmount: number;
  currency: string;

  status: 'active' | 'completed' | 'defaulted' | 'canceled';

  installments: {
    installmentNumber: number;
    amount: number;
    dueDate: Date;
    paidDate?: Date;
    status: 'pending' | 'paid' | 'overdue' | 'failed';
    transactionId?: mongoose.Types.ObjectId;
    attempts: number;
  }[];

  stripeSubscriptionId?: string;

  createdAt: Date;
  updatedAt: Date;
}

const BundleCourseSchema = new Schema<IBundleCourse>({
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  order: { type: Number, required: true },
  isRequired: { type: Boolean, default: true }
}, { _id: false });

const CourseBundleSchema = new Schema<ICourseBundle>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  thumbnail: String,

  courses: [BundleCourseSchema],
  totalCourses: { type: Number, default: 0 },

  regularPrice: { type: Number, required: true },
  bundlePrice: { type: Number, required: true },
  savings: { type: Number, default: 0 },
  savingsPercentage: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },

  isActive: { type: Boolean, default: true },
  isPublished: { type: Boolean, default: false },
  availableFrom: Date,
  availableUntil: Date,

  bundleType: {
    type: String,
    enum: ['learning_path', 'certification', 'skill_bundle', 'promotional'],
    default: 'learning_path'
  },

  maxEnrollments: Number,
  currentEnrollments: { type: Number, default: 0 },

  category: { type: String, required: true },
  tags: [String],
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'mixed'],
    default: 'mixed'
  },

  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const CoursePricingSchema = new Schema<ICoursePricing>({
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, unique: true },

  pricingModel: {
    type: String,
    enum: ['one_time', 'subscription', 'free', 'freemium'],
    default: 'one_time'
  },

  basePrice: { type: Number, required: true },
  currency: { type: String, default: 'USD' },

  tiers: [{
    name: String,
    price: Number,
    features: [String],
    isPopular: { type: Boolean, default: false }
  }],

  bulkPricing: [{
    minSeats: { type: Number, required: true },
    maxSeats: Number,
    pricePerSeat: { type: Number, required: true },
    discount: { type: Number, default: 0 }
  }],

  earlyBirdPricing: {
    price: Number,
    validUntil: Date,
    spotsAvailable: Number,
    spotsUsed: { type: Number, default: 0 }
  },

  subscriptionOptions: {
    monthly: Number,
    quarterly: Number,
    yearly: Number
  },

  lifetimeAccessPrice: Number,

  geographicPricing: [{
    country: String,
    countryCode: String,
    price: Number,
    discount: Number
  }],

  studentDiscount: {
    percentage: Number,
    requiresVerification: { type: Boolean, default: true }
  },

  seasonalPromotions: [{
    name: String,
    startDate: Date,
    endDate: Date,
    discountPercentage: Number,
    isActive: { type: Boolean, default: true }
  }],

  installmentPlan: {
    enabled: { type: Boolean, default: false },
    numberOfInstallments: Number,
    downPayment: Number,
    installmentAmount: Number
  },

  dynamicPricingEnabled: { type: Boolean, default: false },
  dynamicPricingRules: {
    demandMultiplier: Number,
    minPrice: Number,
    maxPrice: Number
  }
}, { timestamps: true });

const InstallmentPlanSchema = new Schema<IInstallmentPlan>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
  bundleId: { type: Schema.Types.ObjectId, ref: 'CourseBundle' },

  totalAmount: { type: Number, required: true },
  downPayment: { type: Number, required: true },
  numberOfInstallments: { type: Number, required: true },
  installmentAmount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },

  status: {
    type: String,
    enum: ['active', 'completed', 'defaulted', 'canceled'],
    default: 'active'
  },

  installments: [{
    installmentNumber: Number,
    amount: Number,
    dueDate: Date,
    paidDate: Date,
    status: {
      type: String,
      enum: ['pending', 'paid', 'overdue', 'failed'],
      default: 'pending'
    },
    transactionId: { type: Schema.Types.ObjectId, ref: 'Transaction' },
    attempts: { type: Number, default: 0 }
  }],

  stripeSubscriptionId: String
}, { timestamps: true });

// Indexes
CourseBundleSchema.index({ slug: 1 }, { unique: true });
CourseBundleSchema.index({ isPublished: 1, isActive: 1 });
CourseBundleSchema.index({ category: 1 });
CourseBundleSchema.index({ bundleType: 1 });

CoursePricingSchema.index({ courseId: 1 }, { unique: true });
CoursePricingSchema.index({ pricingModel: 1 });

InstallmentPlanSchema.index({ userId: 1, status: 1 });
InstallmentPlanSchema.index({ 'installments.dueDate': 1, 'installments.status': 1 });
InstallmentPlanSchema.index({ stripeSubscriptionId: 1 });

// Pre-save hook to calculate savings
CourseBundleSchema.pre('save', function(next) {
  if (this.regularPrice && this.bundlePrice) {
    this.savings = this.regularPrice - this.bundlePrice;
    this.savingsPercentage = Math.round((this.savings / this.regularPrice) * 100);
  }
  this.totalCourses = this.courses.length;
  next();
});

// Methods
InstallmentPlanSchema.methods.getNextPendingInstallment = function() {
  return this.installments.find(
    inst => inst.status === 'pending' || inst.status === 'overdue'
  );
};

InstallmentPlanSchema.methods.markInstallmentPaid = function(
  installmentNumber: number,
  transactionId: mongoose.Types.ObjectId
) {
  const installment = this.installments.find(
    inst => inst.installmentNumber === installmentNumber
  );

  if (installment) {
    installment.status = 'paid';
    installment.paidDate = new Date();
    installment.transactionId = transactionId;
  }

  // Check if all installments are paid
  const allPaid = this.installments.every(inst => inst.status === 'paid');
  if (allPaid) {
    this.status = 'completed';
  }

  return this.save();
};

export const CourseBundle = mongoose.model<ICourseBundle>('CourseBundle', CourseBundleSchema);
export const CoursePricing = mongoose.model<ICoursePricing>('CoursePricing', CoursePricingSchema);
export const InstallmentPlan = mongoose.model<IInstallmentPlan>('InstallmentPlan', InstallmentPlanSchema);

export { CourseBundleSchema, CoursePricingSchema, InstallmentPlanSchema };
