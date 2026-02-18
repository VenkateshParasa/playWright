import { Request, Response } from 'express';
import couponService from '../../services/monetization/couponService';
import Coupon from '../../models/Coupon';
import mongoose from 'mongoose';

export class CouponController {
  /**
   * Create a new coupon
   */
  async createCoupon(req: Request, res: Response): Promise<void> {
    try {
      const createdBy = req.user?.id;
      if (!createdBy) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const coupon = await couponService.createCoupon({
        ...req.body,
        createdBy: new mongoose.Types.ObjectId(createdBy)
      });

      res.status(201).json({
        success: true,
        coupon
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Validate coupon code
   */
  async validateCoupon(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const validation = await couponService.validateCoupon(code, {
        userId: new mongoose.Types.ObjectId(userId),
        amount: req.body.amount,
        courseId: req.body.courseId ? new mongoose.Types.ObjectId(req.body.courseId) : undefined,
        bundleId: req.body.bundleId ? new mongoose.Types.ObjectId(req.body.bundleId) : undefined,
        category: req.body.category,
        userSegment: req.body.userSegment,
        countryCode: req.body.countryCode,
        isFirstPurchase: req.body.isFirstPurchase
      });

      res.json({
        success: validation.valid,
        ...validation
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get all coupons (admin only)
   */
  async getAllCoupons(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 20, isActive, type } = req.query;

      const query: any = {};
      if (isActive !== undefined) query.isActive = isActive === 'true';
      if (type) query.type = type;

      const coupons = await Coupon.find(query)
        .sort({ createdAt: -1 })
        .skip((parseInt(page as string) - 1) * parseInt(limit as string))
        .limit(parseInt(limit as string));

      const total = await Coupon.countDocuments(query);

      res.json({
        success: true,
        coupons,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get coupon by ID
   */
  async getCouponById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const coupon = await Coupon.findById(id);
      if (!coupon) {
        res.status(404).json({ error: 'Coupon not found' });
        return;
      }

      res.json({
        success: true,
        coupon
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Update coupon
   */
  async updateCoupon(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const coupon = await Coupon.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true, runValidators: true }
      );

      if (!coupon) {
        res.status(404).json({ error: 'Coupon not found' });
        return;
      }

      res.json({
        success: true,
        coupon
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Delete coupon
   */
  async deleteCoupon(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const coupon = await Coupon.findByIdAndDelete(id);
      if (!coupon) {
        res.status(404).json({ error: 'Coupon not found' });
        return;
      }

      res.json({
        success: true,
        message: 'Coupon deleted successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Create referral coupon
   */
  async createReferralCoupon(req: Request, res: Response): Promise<void> {
    try {
      const referrerId = req.user?.id;
      if (!referrerId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { referrerBonus = 10, refereeDiscount = 20 } = req.body;

      const coupon = await couponService.createReferralCoupon(
        new mongoose.Types.ObjectId(referrerId),
        referrerBonus,
        refereeDiscount
      );

      res.status(201).json({
        success: true,
        coupon
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Create bulk coupons
   */
  async createBulkCoupons(req: Request, res: Response): Promise<void> {
    try {
      const createdBy = req.user?.id;
      if (!createdBy) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const coupons = await couponService.createBulkCoupons({
        ...req.body,
        createdBy: new mongoose.Types.ObjectId(createdBy)
      });

      res.status(201).json({
        success: true,
        count: coupons.length,
        coupons: coupons.map(c => ({
          code: c.code,
          value: c.value,
          type: c.type
        }))
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Create flash sale
   */
  async createFlashSale(req: Request, res: Response): Promise<void> {
    try {
      const createdBy = req.user?.id;
      if (!createdBy) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const coupon = await couponService.createFlashSale({
        ...req.body,
        createdBy: new mongoose.Types.ObjectId(createdBy)
      });

      res.status(201).json({
        success: true,
        coupon,
        message: `Flash sale created! Code: ${coupon.code}`
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get automatic coupons for user
   */
  async getAutomaticCoupons(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const coupons = await couponService.getAutomaticCoupons({
        userId: new mongoose.Types.ObjectId(userId),
        amount: parseFloat(req.query.amount as string) || 0,
        courseCategories: req.query.categories ? (req.query.categories as string).split(',') : undefined,
        userSegment: req.query.userSegment as string
      });

      res.json({
        success: true,
        coupons: coupons.map(c => ({
          code: c.code,
          name: c.name,
          description: c.description,
          type: c.type,
          value: c.value,
          discountAmount: c.calculateDiscount(parseFloat(req.query.amount as string) || 0)
        }))
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get coupon analytics
   */
  async getCouponAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const analytics = await couponService.getCouponAnalytics(
        new mongoose.Types.ObjectId(id)
      );

      res.json({
        success: true,
        analytics
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Deactivate expired coupons (cron job endpoint)
   */
  async deactivateExpired(req: Request, res: Response): Promise<void> {
    try {
      const count = await couponService.deactivateExpiredCoupons();

      res.json({
        success: true,
        message: `Deactivated ${count} expired coupons`
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

export default new CouponController();
