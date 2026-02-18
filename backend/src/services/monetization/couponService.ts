import Coupon, { ICoupon } from '../../models/Coupon';
import Transaction from '../../models/Transaction';
import mongoose from 'mongoose';

export class CouponService {
  /**
   * Create a new coupon
   */
  async createCoupon(couponData: Partial<ICoupon>): Promise<ICoupon> {
    // Check if code already exists
    if (couponData.code) {
      const existing = await Coupon.findOne({ code: couponData.code.toUpperCase() });
      if (existing) {
        throw new Error('Coupon code already exists');
      }
    }

    const coupon = new Coupon({
      ...couponData,
      code: couponData.code?.toUpperCase()
    });

    await coupon.save();
    return coupon;
  }

  /**
   * Validate and apply coupon
   */
  async validateCoupon(
    code: string,
    context: {
      userId: mongoose.Types.ObjectId;
      courseId?: mongoose.Types.ObjectId;
      bundleId?: mongoose.Types.ObjectId;
      amount: number;
      category?: string;
      userSegment?: string;
      countryCode?: string;
      isFirstPurchase?: boolean;
    }
  ): Promise<{
    valid: boolean;
    coupon?: ICoupon;
    discountAmount?: number;
    message?: string;
  }> {
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return { valid: false, message: 'Coupon not found' };
    }

    // Check if coupon is valid
    if (!coupon.isValid) {
      return { valid: false, message: 'Coupon is not valid or has expired' };
    }

    // Check if user can use the coupon
    if (!coupon.canBeUsedBy(context.userId)) {
      return { valid: false, message: 'You have already used this coupon' };
    }

    // Check minimum purchase amount
    if (
      coupon.restrictions.minimumPurchaseAmount &&
      context.amount < coupon.restrictions.minimumPurchaseAmount
    ) {
      return {
        valid: false,
        message: `Minimum purchase amount is ${coupon.restrictions.minimumPurchaseAmount}`
      };
    }

    // Check first-time users only
    if (coupon.restrictions.firstTimeUsersOnly && !context.isFirstPurchase) {
      return { valid: false, message: 'This coupon is only valid for first-time users' };
    }

    // Check tier restrictions
    if (
      coupon.restrictions.applicableToTiers &&
      coupon.restrictions.applicableToTiers.length > 0
    ) {
      // This would need subscription tier info
    }

    // Check course restrictions
    if (context.courseId) {
      if (!coupon.isApplicableToCourse(context.courseId)) {
        return { valid: false, message: 'Coupon is not applicable to this course' };
      }
    }

    // Check category restrictions
    if (
      coupon.restrictions.applicableToCategories &&
      coupon.restrictions.applicableToCategories.length > 0
    ) {
      if (!context.category || !coupon.restrictions.applicableToCategories.includes(context.category)) {
        return { valid: false, message: 'Coupon is not applicable to this category' };
      }
    }

    // Check user segment restrictions
    if (
      coupon.restrictions.userSegments &&
      coupon.restrictions.userSegments.length > 0
    ) {
      if (!context.userSegment || !coupon.restrictions.userSegments.includes(context.userSegment)) {
        return { valid: false, message: 'Coupon is not applicable to your user type' };
      }
    }

    // Check geographic restrictions
    if (coupon.restrictions.geographicRestrictions) {
      const { countries, excludedCountries } = coupon.restrictions.geographicRestrictions;

      if (countries && countries.length > 0 && context.countryCode) {
        if (!countries.includes(context.countryCode)) {
          return { valid: false, message: 'Coupon is not available in your country' };
        }
      }

      if (excludedCountries && excludedCountries.length > 0 && context.countryCode) {
        if (excludedCountries.includes(context.countryCode)) {
          return { valid: false, message: 'Coupon is not available in your country' };
        }
      }
    }

    // Calculate discount
    const discountAmount = coupon.calculateDiscount(context.amount);

    return {
      valid: true,
      coupon,
      discountAmount,
      message: 'Coupon applied successfully'
    };
  }

  /**
   * Apply coupon to transaction
   */
  async applyCoupon(
    code: string,
    userId: mongoose.Types.ObjectId,
    transactionId: mongoose.Types.ObjectId,
    amount: number
  ): Promise<{ discountAmount: number; coupon: ICoupon }> {
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon || !coupon.isValid) {
      throw new Error('Invalid coupon');
    }

    if (!coupon.canBeUsedBy(userId)) {
      throw new Error('Coupon already used by this user');
    }

    const discountAmount = coupon.calculateDiscount(amount);

    // Record usage
    await coupon.recordUsage(userId, transactionId, discountAmount);

    // Update revenue tracking
    await Transaction.findByIdAndUpdate(transactionId, {
      $inc: { 'coupon.totalRevenue': amount }
    });

    return { discountAmount, coupon };
  }

  /**
   * Generate unique coupon code
   */
  generateCouponCode(prefix: string = '', length: number = 8): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = prefix.toUpperCase();

    for (let i = 0; i < length; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return code;
  }

  /**
   * Create referral coupon
   */
  async createReferralCoupon(
    referrerId: mongoose.Types.ObjectId,
    referrerBonus: number = 10,
    refereeDiscount: number = 20
  ): Promise<ICoupon> {
    const code = this.generateCouponCode('REF', 8);

    return await this.createCoupon({
      code,
      name: `Referral Discount - ${code}`,
      description: 'Get discount when referred by a friend',
      type: 'percentage',
      value: refereeDiscount,
      usageType: 'multi_use',
      maxUsages: 100,
      maxUsagesPerUser: 1,
      isActive: true,
      isReferralCoupon: true,
      referrerId,
      referralBonus,
      restrictions: {
        firstTimeUsersOnly: true
      },
      createdBy: referrerId
    } as any);
  }

  /**
   * Create bulk coupons
   */
  async createBulkCoupons(
    config: {
      prefix: string;
      count: number;
      type: 'percentage' | 'fixed_amount';
      value: number;
      usageType: 'single_use' | 'multi_use';
      expirationDate?: Date;
      restrictions?: any;
      createdBy: mongoose.Types.ObjectId;
    }
  ): Promise<ICoupon[]> {
    const coupons: ICoupon[] = [];

    for (let i = 0; i < config.count; i++) {
      const code = this.generateCouponCode(config.prefix, 8);

      const coupon = await this.createCoupon({
        code,
        name: `Bulk Coupon - ${code}`,
        type: config.type,
        value: config.value,
        usageType: config.usageType,
        maxUsagesPerUser: 1,
        isActive: true,
        expirationDate: config.expirationDate,
        restrictions: config.restrictions || {},
        createdBy: config.createdBy
      } as any);

      coupons.push(coupon);
    }

    return coupons;
  }

  /**
   * Get automatic coupons for user
   */
  async getAutomaticCoupons(
    context: {
      userId: mongoose.Types.ObjectId;
      amount: number;
      courseCategories?: string[];
      userSegment?: string;
    }
  ): Promise<ICoupon[]> {
    const coupons = await Coupon.find({
      isActive: true,
      isAutomatic: true,
      $or: [
        { expirationDate: { $exists: false } },
        { expirationDate: { $gte: new Date() } }
      ]
    });

    const applicableCoupons: ICoupon[] = [];

    for (const coupon of coupons) {
      // Check automatic conditions
      if (coupon.automaticConditions) {
        const conditions = coupon.automaticConditions;

        // Check minimum amount
        if (conditions.minimumAmount && context.amount < conditions.minimumAmount) {
          continue;
        }

        // Check categories
        if (
          conditions.courseCategories &&
          conditions.courseCategories.length > 0 &&
          context.courseCategories
        ) {
          const hasMatchingCategory = conditions.courseCategories.some(cat =>
            context.courseCategories!.includes(cat)
          );
          if (!hasMatchingCategory) continue;
        }

        // Check user segment
        if (
          conditions.userSegments &&
          conditions.userSegments.length > 0 &&
          context.userSegment
        ) {
          if (!conditions.userSegments.includes(context.userSegment)) {
            continue;
          }
        }
      }

      // Check if user can use the coupon
      if (coupon.canBeUsedBy(context.userId)) {
        applicableCoupons.push(coupon);
      }
    }

    // Sort by discount value (highest first)
    return applicableCoupons.sort((a, b) => {
      const discountA = a.calculateDiscount(context.amount);
      const discountB = b.calculateDiscount(context.amount);
      return discountB - discountA;
    });
  }

  /**
   * Deactivate expired coupons
   */
  async deactivateExpiredCoupons(): Promise<number> {
    const result = await Coupon.updateMany(
      {
        isActive: true,
        expirationDate: { $lt: new Date() }
      },
      {
        $set: { isActive: false }
      }
    );

    return result.modifiedCount;
  }

  /**
   * Get coupon analytics
   */
  async getCouponAnalytics(couponId: mongoose.Types.ObjectId) {
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      throw new Error('Coupon not found');
    }

    const usageByDate = coupon.usageHistory.reduce((acc, usage) => {
      const date = usage.usedAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { count: 0, revenue: 0, discount: 0 };
      }
      acc[date].count++;
      acc[date].discount += usage.discountAmount;
      return acc;
    }, {} as Record<string, { count: number; revenue: number; discount: number }>);

    return {
      code: coupon.code,
      totalUsages: coupon.currentUsages,
      remainingUsages: coupon.remainingUsages,
      totalRevenue: coupon.totalRevenue,
      totalDiscountGiven: coupon.totalDiscountGiven,
      conversionRate: coupon.conversionRate,
      averageDiscountPerUse: coupon.currentUsages > 0
        ? coupon.totalDiscountGiven / coupon.currentUsages
        : 0,
      usageByDate,
      isActive: coupon.isActive,
      isExpired: coupon.isExpired
    };
  }

  /**
   * Stack multiple coupons
   */
  async stackCoupons(
    codes: string[],
    userId: mongoose.Types.ObjectId,
    amount: number
  ): Promise<{
    valid: boolean;
    totalDiscount: number;
    appliedCoupons: { code: string; discount: number }[];
    message?: string;
  }> {
    const appliedCoupons: { code: string; discount: number }[] = [];
    let totalDiscount = 0;
    let remainingAmount = amount;

    for (const code of codes) {
      const coupon = await Coupon.findOne({ code: code.toUpperCase() });

      if (!coupon || !coupon.isValid) {
        continue;
      }

      // Check if coupon is stackable
      if (!coupon.stackable && appliedCoupons.length > 0) {
        return {
          valid: false,
          totalDiscount: 0,
          appliedCoupons: [],
          message: `Coupon ${code} cannot be combined with other coupons`
        };
      }

      if (!coupon.canBeUsedBy(userId)) {
        continue;
      }

      const discount = coupon.calculateDiscount(remainingAmount);
      totalDiscount += discount;
      remainingAmount -= discount;

      appliedCoupons.push({
        code: coupon.code,
        discount
      });
    }

    if (appliedCoupons.length === 0) {
      return {
        valid: false,
        totalDiscount: 0,
        appliedCoupons: [],
        message: 'No valid coupons found'
      };
    }

    return {
      valid: true,
      totalDiscount,
      appliedCoupons,
      message: `${appliedCoupons.length} coupon(s) applied successfully`
    };
  }

  /**
   * Create flash sale coupon
   */
  async createFlashSale(
    config: {
      discountPercentage: number;
      durationHours: number;
      maxUsages: number;
      applicableToCategories?: string[];
      createdBy: mongoose.Types.ObjectId;
    }
  ): Promise<ICoupon> {
    const code = this.generateCouponCode('FLASH', 6);
    const startDate = new Date();
    const expirationDate = new Date(startDate.getTime() + config.durationHours * 60 * 60 * 1000);

    return await this.createCoupon({
      code,
      name: `Flash Sale - ${config.discountPercentage}% OFF`,
      description: `Limited time flash sale! ${config.discountPercentage}% off`,
      type: 'percentage',
      value: config.discountPercentage,
      usageType: 'multi_use',
      maxUsages: config.maxUsages,
      maxUsagesPerUser: 1,
      isActive: true,
      startDate,
      expirationDate,
      restrictions: {
        applicableToCategories: config.applicableToCategories || []
      },
      campaign: 'flash_sale',
      createdBy: config.createdBy
    } as any);
  }

  /**
   * Update coupon statistics
   */
  async updateCouponStatistics(couponId: mongoose.Types.ObjectId): Promise<void> {
    const coupon = await Coupon.findById(couponId);
    if (!coupon) return;

    // Calculate conversion rate
    const transactions = await Transaction.find({
      couponId,
      status: 'completed'
    });

    const totalViews = coupon.currentUsages + 100; // Placeholder for actual view tracking
    coupon.conversionRate = totalViews > 0 ? (transactions.length / totalViews) * 100 : 0;

    // Update total revenue
    coupon.totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0);

    await coupon.save();
  }
}

export default new CouponService();
