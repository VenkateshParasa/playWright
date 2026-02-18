import { Affiliate, IAffiliate, IAffiliateClick, IAffiliateCommission } from '../../models/Affiliate';
import mongoose from 'mongoose';
import { nanoid } from 'nanoid';
import crypto from 'crypto';

export class AffiliateService {
  /**
   * Create affiliate application
   */
  async createAffiliateApplication(data: {
    tenantId?: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    companyName?: string;
    website?: string;
    bio?: string;
  }): Promise<IAffiliate> {
    // Check if user already has an affiliate account
    const existing = await Affiliate.findOne({
      userId: data.userId,
      tenantId: data.tenantId,
    });

    if (existing) {
      throw new Error('User already has an affiliate account');
    }

    // Generate unique affiliate code
    const affiliateCode = await this.generateUniqueAffiliateCode();
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

    const affiliate = new Affiliate({
      ...data,
      affiliateCode,
      affiliateUrl: `${baseUrl}/ref/${affiliateCode}`,
      commissionType: 'percentage',
      commissionRate: 20, // Default 20%
      status: 'pending',
    });

    return await affiliate.save();
  }

  /**
   * Generate unique affiliate code
   */
  private async generateUniqueAffiliateCode(): Promise<string> {
    let code: string;
    let exists = true;

    while (exists) {
      code = nanoid(8).toUpperCase();
      const existing = await Affiliate.findOne({ affiliateCode: code });
      exists = !!existing;
    }

    return code!;
  }

  /**
   * Get affiliate by ID
   */
  async getAffiliateById(id: string | mongoose.Types.ObjectId): Promise<IAffiliate | null> {
    return await Affiliate.findById(id)
      .populate('userId', 'firstName lastName email avatar')
      .populate('parentAffiliateId', 'affiliateCode userId');
  }

  /**
   * Get affiliate by user ID
   */
  async getAffiliateByUserId(
    userId: string | mongoose.Types.ObjectId,
    tenantId?: mongoose.Types.ObjectId
  ): Promise<IAffiliate | null> {
    const query: any = { userId };
    if (tenantId) query.tenantId = tenantId;

    return await Affiliate.findOne(query)
      .populate('userId', 'firstName lastName email avatar');
  }

  /**
   * Get affiliate by code
   */
  async getAffiliateByCode(code: string): Promise<IAffiliate | null> {
    return await Affiliate.findOne({ affiliateCode: code })
      .populate('userId', 'firstName lastName email avatar');
  }

  /**
   * Get all affiliates
   */
  async getAffiliates(filters: {
    tenantId?: mongoose.Types.ObjectId;
    status?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ affiliates: IAffiliate[]; total: number }> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', ...queryFilters } = filters;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (queryFilters.tenantId) query.tenantId = queryFilters.tenantId;
    if (queryFilters.status) query.status = queryFilters.status;

    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const affiliates = await Affiliate.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate('userId', 'firstName lastName email avatar');

    const total = await Affiliate.countDocuments(query);

    return { affiliates, total };
  }

  /**
   * Approve affiliate
   */
  async approveAffiliate(
    id: string | mongoose.Types.ObjectId,
    approvedBy: mongoose.Types.ObjectId
  ): Promise<IAffiliate | null> {
    const affiliate = await Affiliate.findById(id);
    if (!affiliate) {
      throw new Error('Affiliate not found');
    }

    affiliate.status = 'active';
    affiliate.approvedAt = new Date();
    affiliate.approvedBy = approvedBy;

    return await affiliate.save();
  }

  /**
   * Reject affiliate
   */
  async rejectAffiliate(
    id: string | mongoose.Types.ObjectId,
    reason: string
  ): Promise<IAffiliate | null> {
    const affiliate = await Affiliate.findById(id);
    if (!affiliate) {
      throw new Error('Affiliate not found');
    }

    affiliate.status = 'rejected';
    affiliate.rejectedAt = new Date();
    affiliate.rejectedReason = reason;

    return await affiliate.save();
  }

  /**
   * Suspend affiliate
   */
  async suspendAffiliate(
    id: string | mongoose.Types.ObjectId,
    reason: string
  ): Promise<IAffiliate | null> {
    const affiliate = await Affiliate.findById(id);
    if (!affiliate) {
      throw new Error('Affiliate not found');
    }

    affiliate.status = 'suspended';
    affiliate.suspendedAt = new Date();
    affiliate.suspendedReason = reason;

    return await affiliate.save();
  }

  /**
   * Reactivate affiliate
   */
  async reactivateAffiliate(id: string | mongoose.Types.ObjectId): Promise<IAffiliate | null> {
    const affiliate = await Affiliate.findById(id);
    if (!affiliate) {
      throw new Error('Affiliate not found');
    }

    affiliate.status = 'active';
    affiliate.suspendedAt = undefined;
    affiliate.suspendedReason = undefined;

    return await affiliate.save();
  }

  /**
   * Create affiliate link
   */
  async createAffiliateLink(
    affiliateId: string | mongoose.Types.ObjectId,
    linkData: {
      name: string;
      url: string;
      courseId?: mongoose.Types.ObjectId;
    }
  ): Promise<IAffiliate | null> {
    const affiliate = await Affiliate.findById(affiliateId);
    if (!affiliate) {
      throw new Error('Affiliate not found');
    }

    if (affiliate.status !== 'active') {
      throw new Error('Affiliate account must be active to create links');
    }

    // Generate unique tracking code
    const trackingCode = `${affiliate.affiliateCode}-${nanoid(6)}`.toUpperCase();

    affiliate.links.push({
      name: linkData.name,
      url: linkData.url,
      trackingCode,
      courseId: linkData.courseId,
      clicks: 0,
      conversions: 0,
      revenue: 0,
      isActive: true,
    });

    return await affiliate.save();
  }

  /**
   * Track affiliate click
   */
  async trackClick(
    affiliateCode: string,
    clickData: {
      ip: string;
      userAgent: string;
      referer?: string;
      utmSource?: string;
      utmMedium?: string;
      utmCampaign?: string;
      country?: string;
      city?: string;
      device?: 'desktop' | 'mobile' | 'tablet';
    }
  ): Promise<{ affiliateId: string; trackingToken: string } | null> {
    const affiliate = await Affiliate.findOne({ affiliateCode });
    if (!affiliate || affiliate.status !== 'active') {
      return null;
    }

    // Track click
    await affiliate.trackClick(clickData);

    // Generate tracking token (used for attribution)
    const trackingToken = this.generateTrackingToken(affiliate._id.toString(), clickData.ip);

    return {
      affiliateId: affiliate._id.toString(),
      trackingToken,
    };
  }

  /**
   * Generate tracking token for cookie
   */
  private generateTrackingToken(affiliateId: string, ip: string): string {
    const data = `${affiliateId}:${ip}:${Date.now()}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Track conversion
   */
  async trackConversion(
    affiliateCode: string,
    conversionData: {
      orderId: mongoose.Types.ObjectId;
      amount: number;
      courseId?: mongoose.Types.ObjectId;
    }
  ): Promise<IAffiliate | null> {
    const affiliate = await Affiliate.findOne({ affiliateCode });
    if (!affiliate || affiliate.status !== 'active') {
      return null;
    }

    await affiliate.trackConversion(
      conversionData.orderId,
      conversionData.amount,
      conversionData.courseId
    );

    // If multi-tier is enabled, track commission for parent affiliates
    if (affiliate.multiTierEnabled && affiliate.parentAffiliateId) {
      await this.trackMultiTierCommission(affiliate, conversionData.orderId, conversionData.amount);
    }

    return affiliate;
  }

  /**
   * Track multi-tier commission
   */
  private async trackMultiTierCommission(
    affiliate: IAffiliate,
    orderId: mongoose.Types.ObjectId,
    amount: number
  ): Promise<void> {
    let currentParentId = affiliate.parentAffiliateId;
    let level = 1;

    while (currentParentId && level <= (affiliate.tierCommissions?.length || 0)) {
      const parentAffiliate = await Affiliate.findById(currentParentId);
      if (!parentAffiliate || parentAffiliate.status !== 'active') break;

      const tierCommission = affiliate.tierCommissions?.find(tc => tc.level === level);
      if (tierCommission) {
        const commissionAmount = (amount * tierCommission.rate) / 100;

        parentAffiliate.commissions.push({
          orderId,
          amount,
          commissionRate: tierCommission.rate,
          commissionAmount,
          status: 'pending',
        });

        parentAffiliate.totalCommissionEarned += commissionAmount;
        parentAffiliate.pendingCommission += commissionAmount;

        await parentAffiliate.save();
      }

      currentParentId = parentAffiliate.parentAffiliateId;
      level++;
    }
  }

  /**
   * Approve commission
   */
  async approveCommission(
    affiliateId: string | mongoose.Types.ObjectId,
    commissionId: string | mongoose.Types.ObjectId
  ): Promise<IAffiliate | null> {
    const affiliate = await Affiliate.findById(affiliateId);
    if (!affiliate) {
      throw new Error('Affiliate not found');
    }

    const commission = affiliate.commissions.find(
      (c: IAffiliateCommission) => c._id?.toString() === commissionId.toString()
    );

    if (!commission) {
      throw new Error('Commission not found');
    }

    commission.status = 'approved';
    return await affiliate.save();
  }

  /**
   * Process payout
   */
  async processPayout(
    affiliateId: string | mongoose.Types.ObjectId,
    payoutData: {
      amount: number;
      method: 'paypal' | 'bank_transfer' | 'stripe' | 'check';
      commissionIds: mongoose.Types.ObjectId[];
    }
  ): Promise<IAffiliate | null> {
    const affiliate = await Affiliate.findById(affiliateId);
    if (!affiliate) {
      throw new Error('Affiliate not found');
    }

    if (payoutData.amount < affiliate.minimumPayout) {
      throw new Error(`Minimum payout amount is ${affiliate.minimumPayout}`);
    }

    // Create payment record
    await affiliate.processPayment(payoutData);

    // Update commissions to paid status
    for (const commissionId of payoutData.commissionIds) {
      const commission = affiliate.commissions.find(
        (c: IAffiliateCommission) => c._id?.toString() === commissionId.toString()
      );
      if (commission) {
        commission.status = 'paid';
        commission.paidAt = new Date();
        commission.paymentMethod = payoutData.method;
      }
    }

    // Update totals
    affiliate.totalCommissionPaid += payoutData.amount;
    affiliate.pendingCommission -= payoutData.amount;

    return await affiliate.save();
  }

  /**
   * Get affiliate dashboard stats
   */
  async getDashboardStats(affiliateId: string | mongoose.Types.ObjectId): Promise<any> {
    const affiliate = await Affiliate.findById(affiliateId);
    if (!affiliate) {
      throw new Error('Affiliate not found');
    }

    const today = new Date();
    const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Calculate recent stats
    const recentClicks = affiliate.clicks.filter((c: IAffiliateClick) => c.timestamp >= last30Days);
    const recentConversions = affiliate.commissions.filter(
      (c: IAffiliateCommission) => c.createdAt && c.createdAt >= last30Days
    );

    return {
      overall: {
        totalClicks: affiliate.totalClicks,
        totalConversions: affiliate.totalConversions,
        conversionRate: affiliate.conversionRate,
        totalRevenue: affiliate.totalRevenue,
        totalCommissionEarned: affiliate.totalCommissionEarned,
        totalCommissionPaid: affiliate.totalCommissionPaid,
        pendingCommission: affiliate.pendingCommission,
      },
      recent: {
        clicks30Days: recentClicks.length,
        clicks7Days: recentClicks.filter((c: IAffiliateClick) => c.timestamp >= last7Days).length,
        conversions30Days: recentConversions.length,
        conversions7Days: recentConversions.filter(
          (c: IAffiliateCommission) => c.createdAt && c.createdAt >= last7Days
        ).length,
      },
      links: affiliate.links.map((l: any) => ({
        id: l._id,
        name: l.name,
        url: l.url,
        trackingCode: l.trackingCode,
        clicks: l.clicks,
        conversions: l.conversions,
        revenue: l.revenue,
        isActive: l.isActive,
      })),
      recentCommissions: affiliate.commissions
        .sort((a: IAffiliateCommission, b: IAffiliateCommission) => {
          const aDate = a.createdAt?.getTime() || 0;
          const bDate = b.createdAt?.getTime() || 0;
          return bDate - aDate;
        })
        .slice(0, 10)
        .map((c: IAffiliateCommission) => ({
          id: c._id,
          orderId: c.orderId,
          amount: c.amount,
          commissionAmount: c.commissionAmount,
          status: c.status,
          createdAt: c.createdAt,
        })),
      monthlyStats: affiliate.monthlyStats,
    };
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(
    tenantId: mongoose.Types.ObjectId | undefined,
    limit: number = 10
  ): Promise<IAffiliate[]> {
    const query: any = { status: 'active' };
    if (tenantId) query.tenantId = tenantId;

    return await Affiliate.find(query)
      .sort({ totalRevenue: -1 })
      .limit(limit)
      .populate('userId', 'firstName lastName avatar');
  }

  /**
   * Update affiliate settings
   */
  async updateSettings(
    affiliateId: string | mongoose.Types.ObjectId,
    settings: {
      paymentMethod?: 'paypal' | 'bank_transfer' | 'stripe' | 'check';
      paymentDetails?: any;
      notifications?: any;
    }
  ): Promise<IAffiliate | null> {
    const affiliate = await Affiliate.findById(affiliateId);
    if (!affiliate) {
      throw new Error('Affiliate not found');
    }

    if (settings.paymentMethod) {
      affiliate.paymentMethod = settings.paymentMethod;
    }

    if (settings.paymentDetails) {
      Object.assign(affiliate.paymentDetails, settings.paymentDetails);
    }

    if (settings.notifications) {
      Object.assign(affiliate.notifications, settings.notifications);
    }

    return await affiliate.save();
  }
}

export const affiliateService = new AffiliateService();
