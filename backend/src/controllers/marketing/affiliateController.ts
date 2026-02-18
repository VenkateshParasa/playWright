import { Request, Response } from 'express';
import { affiliateService } from '../../services/marketing/affiliateService';
import mongoose from 'mongoose';

export class AffiliateController {
  /**
   * Create affiliate application
   */
  async applyAsAffiliate(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { companyName, website, bio } = req.body;

      const affiliate = await affiliateService.createAffiliateApplication({
        tenantId: req.user?.tenantId,
        userId: new mongoose.Types.ObjectId(userId),
        companyName,
        website,
        bio,
      });

      res.status(201).json(affiliate);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to create affiliate application',
      });
    }
  }

  /**
   * Get all affiliates (admin)
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { status, page, limit, sortBy, sortOrder } = req.query;

      const result = await affiliateService.getAffiliates({
        tenantId: req.user?.tenantId,
        status: status as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
      });

      res.json(result);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to fetch affiliates',
      });
    }
  }

  /**
   * Get affiliate by ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const affiliate = await affiliateService.getAffiliateById(id);

      if (!affiliate) {
        res.status(404).json({ error: 'Affiliate not found' });
        return;
      }

      res.json(affiliate);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to fetch affiliate',
      });
    }
  }

  /**
   * Get current user's affiliate account
   */
  async getMyAffiliate(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const affiliate = await affiliateService.getAffiliateByUserId(userId, req.user?.tenantId);

      if (!affiliate) {
        res.status(404).json({ error: 'Affiliate account not found' });
        return;
      }

      res.json(affiliate);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to fetch affiliate',
      });
    }
  }

  /**
   * Approve affiliate (admin)
   */
  async approve(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const affiliate = await affiliateService.approveAffiliate(
        id,
        new mongoose.Types.ObjectId(userId)
      );

      if (!affiliate) {
        res.status(404).json({ error: 'Affiliate not found' });
        return;
      }

      res.json(affiliate);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to approve affiliate',
      });
    }
  }

  /**
   * Reject affiliate (admin)
   */
  async reject(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!reason) {
        res.status(400).json({ error: 'Rejection reason is required' });
        return;
      }

      const affiliate = await affiliateService.rejectAffiliate(id, reason);

      if (!affiliate) {
        res.status(404).json({ error: 'Affiliate not found' });
        return;
      }

      res.json(affiliate);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to reject affiliate',
      });
    }
  }

  /**
   * Suspend affiliate (admin)
   */
  async suspend(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!reason) {
        res.status(400).json({ error: 'Suspension reason is required' });
        return;
      }

      const affiliate = await affiliateService.suspendAffiliate(id, reason);

      if (!affiliate) {
        res.status(404).json({ error: 'Affiliate not found' });
        return;
      }

      res.json(affiliate);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to suspend affiliate',
      });
    }
  }

  /**
   * Reactivate affiliate (admin)
   */
  async reactivate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const affiliate = await affiliateService.reactivateAffiliate(id);

      if (!affiliate) {
        res.status(404).json({ error: 'Affiliate not found' });
        return;
      }

      res.json(affiliate);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to reactivate affiliate',
      });
    }
  }

  /**
   * Create affiliate link
   */
  async createLink(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, url, courseId } = req.body;

      if (!name || !url) {
        res.status(400).json({ error: 'name and url are required' });
        return;
      }

      const affiliate = await affiliateService.createAffiliateLink(id, {
        name,
        url,
        courseId: courseId ? new mongoose.Types.ObjectId(courseId) : undefined,
      });

      if (!affiliate) {
        res.status(404).json({ error: 'Affiliate not found' });
        return;
      }

      res.json(affiliate);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to create affiliate link',
      });
    }
  }

  /**
   * Track affiliate click (public endpoint)
   */
  async trackClick(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.params;

      const result = await affiliateService.trackClick(code, {
        ip: req.ip || '',
        userAgent: req.headers['user-agent'] || '',
        referer: req.headers.referer,
        utmSource: req.query.utm_source as string,
        utmMedium: req.query.utm_medium as string,
        utmCampaign: req.query.utm_campaign as string,
      });

      if (!result) {
        res.status(404).json({ error: 'Affiliate code not found or inactive' });
        return;
      }

      // Set cookie for attribution (30 days default)
      res.cookie('affiliate_tracking', result.trackingToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });

      res.json({ success: true, affiliateId: result.affiliateId });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to track click',
      });
    }
  }

  /**
   * Track conversion (internal endpoint)
   */
  async trackConversion(req: Request, res: Response): Promise<void> {
    try {
      const { code, orderId, amount, courseId } = req.body;

      if (!code || !orderId || !amount) {
        res.status(400).json({ error: 'code, orderId, and amount are required' });
        return;
      }

      const affiliate = await affiliateService.trackConversion(code, {
        orderId: new mongoose.Types.ObjectId(orderId),
        amount,
        courseId: courseId ? new mongoose.Types.ObjectId(courseId) : undefined,
      });

      if (!affiliate) {
        res.status(404).json({ error: 'Affiliate not found or inactive' });
        return;
      }

      res.json({ success: true, affiliate });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to track conversion',
      });
    }
  }

  /**
   * Get dashboard stats
   */
  async getDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const stats = await affiliateService.getDashboardStats(id);

      res.json(stats);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to fetch dashboard stats',
      });
    }
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(req: Request, res: Response): Promise<void> {
    try {
      const { limit } = req.query;

      const leaderboard = await affiliateService.getLeaderboard(
        req.user?.tenantId,
        limit ? parseInt(limit as string) : 10
      );

      res.json(leaderboard);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to fetch leaderboard',
      });
    }
  }

  /**
   * Update settings
   */
  async updateSettings(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { paymentMethod, paymentDetails, notifications } = req.body;

      const affiliate = await affiliateService.updateSettings(id, {
        paymentMethod,
        paymentDetails,
        notifications,
      });

      if (!affiliate) {
        res.status(404).json({ error: 'Affiliate not found' });
        return;
      }

      res.json(affiliate);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to update settings',
      });
    }
  }

  /**
   * Approve commission (admin)
   */
  async approveCommission(req: Request, res: Response): Promise<void> {
    try {
      const { id, commissionId } = req.params;

      const affiliate = await affiliateService.approveCommission(id, commissionId);

      if (!affiliate) {
        res.status(404).json({ error: 'Affiliate or commission not found' });
        return;
      }

      res.json(affiliate);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to approve commission',
      });
    }
  }

  /**
   * Process payout (admin)
   */
  async processPayout(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { amount, method, commissionIds } = req.body;

      if (!amount || !method || !commissionIds) {
        res.status(400).json({ error: 'amount, method, and commissionIds are required' });
        return;
      }

      const affiliate = await affiliateService.processPayout(id, {
        amount,
        method,
        commissionIds: commissionIds.map((id: string) => new mongoose.Types.ObjectId(id)),
      });

      if (!affiliate) {
        res.status(404).json({ error: 'Affiliate not found' });
        return;
      }

      res.json(affiliate);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to process payout',
      });
    }
  }
}

export const affiliateController = new AffiliateController();
