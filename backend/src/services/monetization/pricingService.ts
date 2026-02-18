import { CoursePricing, CourseBundle, ICoursePricing } from '../../models/Pricing';
import Course from '../../models/Course';
import mongoose from 'mongoose';

// Geographic pricing data (Purchasing Power Parity)
const PPP_MULTIPLIERS: Record<string, { country: string; multiplier: number }> = {
  IN: { country: 'India', multiplier: 0.25 },
  BR: { country: 'Brazil', multiplier: 0.30 },
  MX: { country: 'Mexico', multiplier: 0.35 },
  AR: { country: 'Argentina', multiplier: 0.28 },
  CO: { country: 'Colombia', multiplier: 0.32 },
  PH: { country: 'Philippines', multiplier: 0.27 },
  ID: { country: 'Indonesia', multiplier: 0.26 },
  VN: { country: 'Vietnam', multiplier: 0.24 },
  TH: { country: 'Thailand', multiplier: 0.33 },
  PL: { country: 'Poland', multiplier: 0.45 },
  RO: { country: 'Romania', multiplier: 0.40 },
  TR: { country: 'Turkey', multiplier: 0.35 },
  EG: { country: 'Egypt', multiplier: 0.22 },
  NG: { country: 'Nigeria', multiplier: 0.20 },
  ZA: { country: 'South Africa', multiplier: 0.38 },
  RU: { country: 'Russia', multiplier: 0.36 },
  UA: { country: 'Ukraine', multiplier: 0.30 },
  PK: { country: 'Pakistan', multiplier: 0.23 },
  BD: { country: 'Bangladesh', multiplier: 0.21 },
  US: { country: 'United States', multiplier: 1.0 },
  GB: { country: 'United Kingdom', multiplier: 0.95 },
  CA: { country: 'Canada', multiplier: 0.90 },
  AU: { country: 'Australia', multiplier: 0.92 },
  DE: { country: 'Germany', multiplier: 0.88 },
  FR: { country: 'France', multiplier: 0.87 },
  JP: { country: 'Japan', multiplier: 0.85 },
  CN: { country: 'China', multiplier: 0.42 }
};

export class PricingService {
  /**
   * Create pricing for a course
   */
  async createCoursePricing(
    courseId: mongoose.Types.ObjectId,
    pricingData: Partial<ICoursePricing>
  ): Promise<ICoursePricing> {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // Check if pricing already exists
    const existingPricing = await CoursePricing.findOne({ courseId });
    if (existingPricing) {
      throw new Error('Pricing already exists for this course');
    }

    const pricing = new CoursePricing({
      courseId,
      ...pricingData
    });

    await pricing.save();

    // Update course price
    course.price = pricingData.basePrice || 0;
    await course.save();

    return pricing;
  }

  /**
   * Update course pricing
   */
  async updateCoursePricing(
    courseId: mongoose.Types.ObjectId,
    updates: Partial<ICoursePricing>
  ): Promise<ICoursePricing | null> {
    const pricing = await CoursePricing.findOneAndUpdate(
      { courseId },
      { $set: updates },
      { new: true }
    );

    if (pricing && updates.basePrice !== undefined) {
      await Course.findByIdAndUpdate(courseId, { price: updates.basePrice });
    }

    return pricing;
  }

  /**
   * Get effective price for a course based on context
   */
  async getEffectivePrice(
    courseId: mongoose.Types.ObjectId,
    context: {
      userId?: mongoose.Types.ObjectId;
      countryCode?: string;
      isStudent?: boolean;
      quantity?: number;
    }
  ): Promise<{
    originalPrice: number;
    effectivePrice: number;
    discount: number;
    discountPercentage: number;
    appliedDiscounts: string[];
    currency: string;
  }> {
    const pricing = await CoursePricing.findOne({ courseId });
    if (!pricing) {
      throw new Error('Pricing not found for this course');
    }

    let effectivePrice = pricing.basePrice;
    const appliedDiscounts: string[] = [];
    let totalDiscount = 0;

    // 1. Check for early bird pricing
    if (pricing.earlyBirdPricing && pricing.earlyBirdPricing.validUntil > new Date()) {
      if (
        !pricing.earlyBirdPricing.spotsAvailable ||
        pricing.earlyBirdPricing.spotsUsed < pricing.earlyBirdPricing.spotsAvailable
      ) {
        const discount = pricing.basePrice - pricing.earlyBirdPricing.price;
        if (discount > totalDiscount) {
          effectivePrice = pricing.earlyBirdPricing.price;
          totalDiscount = discount;
          appliedDiscounts.push('Early Bird Discount');
        }
      }
    }

    // 2. Check for seasonal promotions
    for (const promo of pricing.seasonalPromotions) {
      if (
        promo.isActive &&
        promo.startDate <= new Date() &&
        promo.endDate >= new Date()
      ) {
        const promoDiscount = (pricing.basePrice * promo.discountPercentage) / 100;
        if (promoDiscount > totalDiscount) {
          effectivePrice = pricing.basePrice - promoDiscount;
          totalDiscount = promoDiscount;
          appliedDiscounts.length = 0;
          appliedDiscounts.push(`${promo.name} (${promo.discountPercentage}% off)`);
        }
      }
    }

    // 3. Check for geographic pricing (PPP)
    if (context.countryCode && pricing.geographicPricing.length > 0) {
      const geoPricing = pricing.geographicPricing.find(
        gp => gp.countryCode === context.countryCode
      );
      if (geoPricing) {
        effectivePrice = geoPricing.price;
        totalDiscount = pricing.basePrice - geoPricing.price;
        appliedDiscounts.push(`Geographic Pricing (${geoPricing.country})`);
      } else if (PPP_MULTIPLIERS[context.countryCode]) {
        const pppData = PPP_MULTIPLIERS[context.countryCode];
        const pppPrice = Math.round(pricing.basePrice * pppData.multiplier * 100) / 100;
        effectivePrice = pppPrice;
        totalDiscount = pricing.basePrice - pppPrice;
        appliedDiscounts.push(`Geographic Pricing (${pppData.country})`);
      }
    }

    // 4. Check for student discount
    if (context.isStudent && pricing.studentDiscount) {
      const studentDiscount = (pricing.basePrice * pricing.studentDiscount.percentage) / 100;
      effectivePrice = effectivePrice - studentDiscount;
      totalDiscount += studentDiscount;
      appliedDiscounts.push(`Student Discount (${pricing.studentDiscount.percentage}% off)`);
    }

    // 5. Check for bulk pricing
    if (context.quantity && context.quantity > 1) {
      const bulkPrice = this.getBulkPrice(pricing, context.quantity);
      if (bulkPrice.totalPrice < effectivePrice * context.quantity) {
        effectivePrice = bulkPrice.pricePerSeat;
        totalDiscount = (pricing.basePrice - effectivePrice) * context.quantity;
        appliedDiscounts.push(`Bulk Discount (${bulkPrice.discount}% off for ${context.quantity} seats)`);
      }
    }

    // 6. Apply dynamic pricing if enabled
    if (pricing.dynamicPricingEnabled && pricing.dynamicPricingRules) {
      const dynamicPrice = await this.calculateDynamicPrice(courseId, pricing);
      if (dynamicPrice !== effectivePrice) {
        effectivePrice = dynamicPrice;
        appliedDiscounts.push('Dynamic Pricing');
      }
    }

    const discountPercentage = pricing.basePrice > 0
      ? Math.round((totalDiscount / pricing.basePrice) * 100)
      : 0;

    return {
      originalPrice: pricing.basePrice,
      effectivePrice: Math.max(0, effectivePrice),
      discount: totalDiscount,
      discountPercentage,
      appliedDiscounts,
      currency: pricing.currency
    };
  }

  /**
   * Calculate bulk pricing
   */
  getBulkPrice(
    pricing: ICoursePricing,
    quantity: number
  ): { pricePerSeat: number; totalPrice: number; discount: number } {
    if (!pricing.bulkPricing || pricing.bulkPricing.length === 0) {
      return {
        pricePerSeat: pricing.basePrice,
        totalPrice: pricing.basePrice * quantity,
        discount: 0
      };
    }

    // Find applicable bulk pricing tier
    const applicableTier = pricing.bulkPricing
      .filter(bp => quantity >= bp.minSeats && (!bp.maxSeats || quantity <= bp.maxSeats))
      .sort((a, b) => b.discount - a.discount)[0];

    if (!applicableTier) {
      return {
        pricePerSeat: pricing.basePrice,
        totalPrice: pricing.basePrice * quantity,
        discount: 0
      };
    }

    return {
      pricePerSeat: applicableTier.pricePerSeat,
      totalPrice: applicableTier.pricePerSeat * quantity,
      discount: applicableTier.discount
    };
  }

  /**
   * Calculate dynamic pricing based on demand
   */
  async calculateDynamicPrice(
    courseId: mongoose.Types.ObjectId,
    pricing: ICoursePricing
  ): Promise<number> {
    if (!pricing.dynamicPricingRules) {
      return pricing.basePrice;
    }

    // Get course popularity metrics
    const course = await Course.findById(courseId);
    if (!course) {
      return pricing.basePrice;
    }

    // Calculate demand score (0-1)
    const demandScore = Math.min(
      1,
      course.enrollmentCount / Math.max(1, course.enrollmentCount + 1000)
    );

    // Apply demand multiplier
    let dynamicPrice = pricing.basePrice * (1 + demandScore * pricing.dynamicPricingRules.demandMultiplier);

    // Ensure within min/max bounds
    dynamicPrice = Math.max(
      pricing.dynamicPricingRules.minPrice,
      Math.min(pricing.dynamicPricingRules.maxPrice, dynamicPrice)
    );

    return Math.round(dynamicPrice * 100) / 100;
  }

  /**
   * Generate geographic pricing for all countries
   */
  async generateGeographicPricing(courseId: mongoose.Types.ObjectId): Promise<void> {
    const pricing = await CoursePricing.findOne({ courseId });
    if (!pricing) {
      throw new Error('Pricing not found');
    }

    const geographicPricing = Object.entries(PPP_MULTIPLIERS).map(([code, data]) => ({
      country: data.country,
      countryCode: code,
      price: Math.round(pricing.basePrice * data.multiplier * 100) / 100,
      discount: Math.round((1 - data.multiplier) * 100)
    }));

    pricing.geographicPricing = geographicPricing;
    await pricing.save();
  }

  /**
   * Create seasonal promotion
   */
  async createSeasonalPromotion(
    courseId: mongoose.Types.ObjectId,
    promotion: {
      name: string;
      startDate: Date;
      endDate: Date;
      discountPercentage: number;
    }
  ): Promise<ICoursePricing | null> {
    return await CoursePricing.findOneAndUpdate(
      { courseId },
      {
        $push: {
          seasonalPromotions: {
            ...promotion,
            isActive: true
          }
        }
      },
      { new: true }
    );
  }

  /**
   * Set early bird pricing
   */
  async setEarlyBirdPricing(
    courseId: mongoose.Types.ObjectId,
    earlyBirdData: {
      price: number;
      validUntil: Date;
      spotsAvailable?: number;
    }
  ): Promise<ICoursePricing | null> {
    return await CoursePricing.findOneAndUpdate(
      { courseId },
      {
        $set: {
          earlyBirdPricing: {
            ...earlyBirdData,
            spotsUsed: 0
          }
        }
      },
      { new: true }
    );
  }

  /**
   * Configure installment plan
   */
  async configureInstallmentPlan(
    courseId: mongoose.Types.ObjectId,
    plan: {
      enabled: boolean;
      numberOfInstallments: number;
      downPaymentPercentage: number;
    }
  ): Promise<ICoursePricing | null> {
    const pricing = await CoursePricing.findOne({ courseId });
    if (!pricing) {
      throw new Error('Pricing not found');
    }

    const downPayment = (pricing.basePrice * plan.downPaymentPercentage) / 100;
    const remainingAmount = pricing.basePrice - downPayment;
    const installmentAmount = remainingAmount / plan.numberOfInstallments;

    return await CoursePricing.findOneAndUpdate(
      { courseId },
      {
        $set: {
          installmentPlan: {
            enabled: plan.enabled,
            numberOfInstallments: plan.numberOfInstallments,
            downPayment: Math.round(downPayment * 100) / 100,
            installmentAmount: Math.round(installmentAmount * 100) / 100
          }
        }
      },
      { new: true }
    );
  }

  /**
   * Get pricing comparison (original vs discounted)
   */
  async getPricingComparison(courseId: mongoose.Types.ObjectId) {
    const pricing = await CoursePricing.findOne({ courseId });
    if (!pricing) {
      throw new Error('Pricing not found');
    }

    const comparisons = [];

    // Early bird vs regular
    if (pricing.earlyBirdPricing && pricing.earlyBirdPricing.validUntil > new Date()) {
      comparisons.push({
        type: 'Early Bird',
        originalPrice: pricing.basePrice,
        discountedPrice: pricing.earlyBirdPricing.price,
        savings: pricing.basePrice - pricing.earlyBirdPricing.price,
        savingsPercentage: Math.round(
          ((pricing.basePrice - pricing.earlyBirdPricing.price) / pricing.basePrice) * 100
        ),
        validUntil: pricing.earlyBirdPricing.validUntil
      });
    }

    // Active seasonal promotions
    for (const promo of pricing.seasonalPromotions) {
      if (promo.isActive && promo.startDate <= new Date() && promo.endDate >= new Date()) {
        const discountedPrice = pricing.basePrice * (1 - promo.discountPercentage / 100);
        comparisons.push({
          type: promo.name,
          originalPrice: pricing.basePrice,
          discountedPrice,
          savings: pricing.basePrice - discountedPrice,
          savingsPercentage: promo.discountPercentage,
          validUntil: promo.endDate
        });
      }
    }

    return comparisons;
  }

  /**
   * Calculate bundle savings
   */
  async calculateBundleSavings(bundleId: mongoose.Types.ObjectId) {
    const bundle = await CourseBundle.findById(bundleId).populate('courses.courseId');
    if (!bundle) {
      throw new Error('Bundle not found');
    }

    let totalRegularPrice = 0;

    for (const bundleCourse of bundle.courses) {
      const course = await Course.findById(bundleCourse.courseId);
      if (course) {
        totalRegularPrice += course.price;
      }
    }

    const savings = totalRegularPrice - bundle.bundlePrice;
    const savingsPercentage = Math.round((savings / totalRegularPrice) * 100);

    return {
      regularPrice: totalRegularPrice,
      bundlePrice: bundle.bundlePrice,
      savings,
      savingsPercentage,
      coursesIncluded: bundle.courses.length
    };
  }

  /**
   * Get recommended pricing based on course data
   */
  async getRecommendedPricing(courseId: mongoose.Types.ObjectId) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // Find similar courses in the same category
    const similarCourses = await Course.find({
      category: course.category,
      level: course.level,
      isPublished: true,
      _id: { $ne: courseId }
    }).limit(10);

    if (similarCourses.length === 0) {
      return {
        recommendedPrice: 49.99,
        reasoning: 'Default pricing (no similar courses found)',
        priceRange: { min: 29.99, max: 99.99 }
      };
    }

    // Calculate average price
    const avgPrice = similarCourses.reduce((sum, c) => sum + c.price, 0) / similarCourses.length;

    // Adjust based on course characteristics
    let adjustmentFactor = 1.0;

    // Quality indicators
    if (course.averageRating >= 4.5) adjustmentFactor *= 1.1;
    if (course.enrollmentCount > 1000) adjustmentFactor *= 1.05;
    if (course.estimatedDuration > 1200) adjustmentFactor *= 1.08; // Longer courses

    const recommendedPrice = Math.round(avgPrice * adjustmentFactor * 100) / 100;

    return {
      recommendedPrice,
      reasoning: `Based on ${similarCourses.length} similar courses in ${course.category}`,
      priceRange: {
        min: Math.round(recommendedPrice * 0.7 * 100) / 100,
        max: Math.round(recommendedPrice * 1.5 * 100) / 100
      },
      marketAverage: Math.round(avgPrice * 100) / 100
    };
  }
}

export default new PricingService();
