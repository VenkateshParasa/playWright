import { Request, Response } from 'express';
import subscriptionService from '../../services/monetization/subscriptionService';
import { Subscription, SubscriptionHistory } from '../../models/Subscription';
import mongoose from 'mongoose';

export class SubscriptionController {
  /**
   * Create new subscription
   */
  async createSubscription(req: Request, res: Response): Promise<void> {
    try {
      const { tier, paymentMethodId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const subscription = await subscriptionService.createSubscription(
        new mongoose.Types.ObjectId(userId),
        tier,
        paymentMethodId
      );

      res.status(201).json({
        success: true,
        subscription
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get current user's subscription
   */
  async getCurrentSubscription(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const subscription = await Subscription.findOne({
        userId: new mongoose.Types.ObjectId(userId),
        status: { $in: ['active', 'trialing', 'past_due'] }
      });

      if (!subscription) {
        res.status(404).json({
          success: false,
          message: 'No active subscription found'
        });
        return;
      }

      res.json({
        success: true,
        subscription
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Upgrade or downgrade subscription
   */
  async changeTier(req: Request, res: Response): Promise<void> {
    try {
      const { subscriptionId } = req.params;
      const { newTier, prorationBehavior } = req.body;

      const subscription = await subscriptionService.changeSubscriptionTier(
        new mongoose.Types.ObjectId(subscriptionId),
        newTier,
        prorationBehavior
      );

      res.json({
        success: true,
        subscription,
        message: 'Subscription tier updated successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(req: Request, res: Response): Promise<void> {
    try {
      const { subscriptionId } = req.params;
      const { cancelAtPeriodEnd = true, reason } = req.body;

      const subscription = await subscriptionService.cancelSubscription(
        new mongoose.Types.ObjectId(subscriptionId),
        cancelAtPeriodEnd,
        reason
      );

      res.json({
        success: true,
        subscription,
        message: cancelAtPeriodEnd
          ? 'Subscription will be canceled at the end of the current period'
          : 'Subscription canceled immediately'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Pause subscription
   */
  async pauseSubscription(req: Request, res: Response): Promise<void> {
    try {
      const { subscriptionId } = req.params;
      const { resumeDate, reason } = req.body;

      const subscription = await subscriptionService.pauseSubscription(
        new mongoose.Types.ObjectId(subscriptionId),
        resumeDate ? new Date(resumeDate) : undefined,
        reason
      );

      res.json({
        success: true,
        subscription,
        message: 'Subscription paused successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Resume paused subscription
   */
  async resumeSubscription(req: Request, res: Response): Promise<void> {
    try {
      const { subscriptionId } = req.params;

      const subscription = await subscriptionService.resumeSubscription(
        new mongoose.Types.ObjectId(subscriptionId)
      );

      res.json({
        success: true,
        subscription,
        message: 'Subscription resumed successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get subscription usage
   */
  async getUsage(req: Request, res: Response): Promise<void> {
    try {
      const { subscriptionId } = req.params;

      const usage = await subscriptionService.getSubscriptionUsage(
        new mongoose.Types.ObjectId(subscriptionId)
      );

      res.json({
        success: true,
        usage
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Check feature access
   */
  async checkFeatureAccess(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { feature } = req.params;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const hasAccess = await subscriptionService.hasFeatureAccess(
        new mongoose.Types.ObjectId(userId),
        feature
      );

      res.json({
        success: true,
        feature,
        hasAccess
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get subscription history
   */
  async getHistory(req: Request, res: Response): Promise<void> {
    try {
      const { subscriptionId } = req.params;

      const history = await SubscriptionHistory.find({
        subscriptionId: new mongoose.Types.ObjectId(subscriptionId)
      })
        .sort({ createdAt: -1 })
        .limit(50);

      res.json({
        success: true,
        history
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get subscription analytics (admin only)
   */
  async getAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { period = 'month' } = req.query;

      const analytics = await subscriptionService.getSubscriptionAnalytics(
        period as 'day' | 'week' | 'month' | 'year'
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
   * Webhook handler for Stripe events
   */
  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const event = req.body;

      switch (event.type) {
        case 'customer.subscription.updated':
          // Handle subscription updates
          break;
        case 'customer.subscription.deleted':
          // Handle subscription cancellation
          break;
        case 'invoice.payment_succeeded':
          // Handle successful payment
          const invoice = event.data.object;
          const subscriptionId = invoice.subscription;
          // Update subscription
          break;
        case 'invoice.payment_failed':
          // Handle failed payment
          const failedInvoice = event.data.object;
          const failedSubscriptionId = failedInvoice.subscription;
          // Handle dunning
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

export default new SubscriptionController();
