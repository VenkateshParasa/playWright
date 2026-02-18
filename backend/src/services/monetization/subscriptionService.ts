import Stripe from 'stripe';
import {
  Subscription,
  SubscriptionTier,
  SubscriptionHistory,
  ISubscription
} from '../../models/Subscription';
import Transaction from '../../models/Transaction';
import mongoose from 'mongoose';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia'
});

export class SubscriptionService {
  /**
   * Create a new subscription
   */
  async createSubscription(
    userId: mongoose.Types.ObjectId,
    tier: string,
    paymentMethodId?: string
  ): Promise<ISubscription> {
    // Get subscription tier details
    const tierDetails = await SubscriptionTier.findOne({ name: tier });
    if (!tierDetails) {
      throw new Error('Subscription tier not found');
    }

    // Check for existing subscription
    const existingSubscription = await Subscription.findOne({
      userId,
      status: { $in: ['active', 'trialing'] }
    });

    if (existingSubscription) {
      throw new Error('User already has an active subscription');
    }

    let stripeCustomerId: string | undefined;
    let stripeSubscriptionId: string | undefined;

    // Create Stripe customer and subscription if payment method provided
    if (paymentMethodId && tierDetails.price > 0) {
      const customer = await stripe.customers.create({
        metadata: { userId: userId.toString() }
      });

      stripeCustomerId = customer.id;

      // Attach payment method
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: stripeCustomerId
      });

      // Set as default payment method
      await stripe.customers.update(stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId
        }
      });

      // Create Stripe subscription
      const stripeSubscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{ price: tierDetails.stripePriceId }],
        trial_period_days: tierDetails.trialDays || undefined,
        metadata: { userId: userId.toString() }
      });

      stripeSubscriptionId = stripeSubscription.id;
    }

    // Calculate period dates
    const now = new Date();
    const periodEnd = this.calculatePeriodEnd(now, tierDetails.billingPeriod);

    // Create subscription
    const subscription = new Subscription({
      userId,
      tier,
      status: tierDetails.trialDays ? 'trialing' : 'active',
      stripeCustomerId,
      stripeSubscriptionId,
      stripePriceId: tierDetails.stripePriceId,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      amount: tierDetails.price,
      currency: tierDetails.currency,
      billingPeriod: tierDetails.billingPeriod,
      trialStart: tierDetails.trialDays ? now : undefined,
      trialEnd: tierDetails.trialDays
        ? new Date(now.getTime() + tierDetails.trialDays * 24 * 60 * 60 * 1000)
        : undefined
    });

    await subscription.save();

    // Record history
    await this.recordHistory(subscription._id, userId, 'created', undefined, tier);

    return subscription;
  }

  /**
   * Upgrade or downgrade subscription
   */
  async changeSubscriptionTier(
    subscriptionId: mongoose.Types.ObjectId,
    newTier: string,
    prorationBehavior: 'create_prorations' | 'none' | 'always_invoice' = 'create_prorations'
  ): Promise<ISubscription> {
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const oldTier = subscription.tier;

    // Get new tier details
    const tierDetails = await SubscriptionTier.findOne({ name: newTier });
    if (!tierDetails) {
      throw new Error('Subscription tier not found');
    }

    // Update Stripe subscription if exists
    if (subscription.stripeSubscriptionId) {
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        items: [{
          id: (await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId)).items.data[0].id,
          price: tierDetails.stripePriceId
        }],
        proration_behavior: prorationBehavior
      });
    }

    // Update subscription
    subscription.tier = newTier as any;
    subscription.amount = tierDetails.price;
    subscription.billingPeriod = tierDetails.billingPeriod;
    subscription.stripePriceId = tierDetails.stripePriceId;
    subscription.prorationBehavior = prorationBehavior;

    await subscription.save();

    // Record history
    const action = this.compareTiers(oldTier, newTier);
    await this.recordHistory(subscriptionId, subscription.userId, action, oldTier, newTier);

    return subscription;
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    subscriptionId: mongoose.Types.ObjectId,
    cancelAtPeriodEnd: boolean = true,
    reason?: string
  ): Promise<ISubscription> {
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Cancel Stripe subscription
    if (subscription.stripeSubscriptionId) {
      if (cancelAtPeriodEnd) {
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
          cancel_at_period_end: true
        });
      } else {
        await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
      }
    }

    subscription.cancelAtPeriodEnd = cancelAtPeriodEnd;
    subscription.canceledAt = new Date();
    subscription.cancelReason = reason;

    if (!cancelAtPeriodEnd) {
      subscription.status = 'canceled';
    }

    await subscription.save();

    // Record history
    await this.recordHistory(subscriptionId, subscription.userId, 'canceled', subscription.tier, undefined, reason);

    return subscription;
  }

  /**
   * Pause subscription
   */
  async pauseSubscription(
    subscriptionId: mongoose.Types.ObjectId,
    resumeDate?: Date,
    reason?: string
  ): Promise<ISubscription> {
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Pause Stripe subscription
    if (subscription.stripeSubscriptionId) {
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        pause_collection: {
          behavior: 'mark_uncollectible',
          resumes_at: resumeDate ? Math.floor(resumeDate.getTime() / 1000) : undefined
        }
      });
    }

    subscription.status = 'paused';
    subscription.pausedAt = new Date();
    subscription.pauseReason = reason;

    if (resumeDate) {
      subscription.pauseCollection = {
        behavior: 'mark_uncollectible',
        resumesAt: resumeDate
      };
    }

    await subscription.save();

    // Record history
    await this.recordHistory(subscriptionId, subscription.userId, 'paused', undefined, undefined, reason);

    return subscription;
  }

  /**
   * Resume paused subscription
   */
  async resumeSubscription(subscriptionId: mongoose.Types.ObjectId): Promise<ISubscription> {
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    if (subscription.status !== 'paused') {
      throw new Error('Subscription is not paused');
    }

    // Resume Stripe subscription
    if (subscription.stripeSubscriptionId) {
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        pause_collection: null as any
      });
    }

    subscription.status = 'active';
    subscription.pausedAt = undefined;
    subscription.pauseReason = undefined;
    subscription.pauseCollection = undefined;

    await subscription.save();

    // Record history
    await this.recordHistory(subscriptionId, subscription.userId, 'resumed');

    return subscription;
  }

  /**
   * Handle failed payment
   */
  async handleFailedPayment(subscriptionId: mongoose.Types.ObjectId): Promise<void> {
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    subscription.status = 'past_due';
    subscription.failedPaymentAttempts += 1;
    subscription.lastPaymentAttempt = new Date();

    // Set grace period (7 days)
    if (!subscription.gracePeriodEndsAt) {
      subscription.gracePeriodEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    // Calculate next retry date (exponential backoff)
    const retryDays = Math.min(Math.pow(2, subscription.failedPaymentAttempts - 1), 7);
    subscription.nextRetryDate = new Date(Date.now() + retryDays * 24 * 60 * 60 * 1000);

    await subscription.save();

    // If too many failures, cancel subscription
    if (subscription.failedPaymentAttempts >= 4) {
      await this.cancelSubscription(subscriptionId, false, 'Payment failures exceeded limit');
    }
  }

  /**
   * Handle successful payment
   */
  async handleSuccessfulPayment(
    subscriptionId: mongoose.Types.ObjectId,
    transactionId: mongoose.Types.ObjectId
  ): Promise<void> {
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Reset failure tracking
    subscription.status = 'active';
    subscription.failedPaymentAttempts = 0;
    subscription.gracePeriodEndsAt = undefined;
    subscription.nextRetryDate = undefined;

    // Update period dates
    subscription.currentPeriodStart = subscription.currentPeriodEnd;
    subscription.currentPeriodEnd = this.calculatePeriodEnd(
      subscription.currentPeriodEnd,
      subscription.billingPeriod
    );

    await subscription.save();

    // Record history
    await this.recordHistory(subscriptionId, subscription.userId, 'renewed');
  }

  /**
   * Get subscription usage
   */
  async getSubscriptionUsage(subscriptionId: mongoose.Types.ObjectId) {
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const tier = await SubscriptionTier.findOne({ name: subscription.tier });
    if (!tier) {
      throw new Error('Subscription tier not found');
    }

    return {
      coursesAccessed: subscription.usage.coursesAccessed,
      coursesLimit: tier.maxCourses,
      storageUsed: subscription.usage.storageUsed,
      storageLimit: tier.storageLimit,
      apiCallsThisMonth: subscription.usage.apiCallsThisMonth
    };
  }

  /**
   * Check feature access
   */
  async hasFeatureAccess(
    userId: mongoose.Types.ObjectId,
    featureName: string
  ): Promise<boolean> {
    const subscription = await Subscription.findOne({
      userId,
      status: { $in: ['active', 'trialing'] }
    });

    if (!subscription) return false;

    const tier = await SubscriptionTier.findOne({ name: subscription.tier });
    if (!tier) return false;

    const feature = tier.features.find(f => f.name === featureName);
    return feature ? feature.enabled : false;
  }

  /**
   * Get subscription analytics
   */
  async getSubscriptionAnalytics(period: 'day' | 'week' | 'month' | 'year' = 'month') {
    const startDate = this.getStartDateForPeriod(period);

    const [activeSubscriptions, newSubscriptions, canceledSubscriptions, revenue] = await Promise.all([
      Subscription.countDocuments({ status: { $in: ['active', 'trialing'] } }),
      Subscription.countDocuments({ createdAt: { $gte: startDate } }),
      Subscription.countDocuments({
        canceledAt: { $gte: startDate },
        status: 'canceled'
      }),
      Transaction.aggregate([
        {
          $match: {
            type: 'subscription',
            status: 'completed',
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$total' },
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const churnRate = activeSubscriptions > 0
      ? (canceledSubscriptions / activeSubscriptions) * 100
      : 0;

    return {
      activeSubscriptions,
      newSubscriptions,
      canceledSubscriptions,
      churnRate: Math.round(churnRate * 100) / 100,
      revenue: revenue[0]?.total || 0,
      transactionCount: revenue[0]?.count || 0,
      period
    };
  }

  // Helper methods

  private calculatePeriodEnd(startDate: Date, billingPeriod: string): Date {
    const end = new Date(startDate);

    switch (billingPeriod) {
      case 'monthly':
        end.setMonth(end.getMonth() + 1);
        break;
      case 'quarterly':
        end.setMonth(end.getMonth() + 3);
        break;
      case 'yearly':
        end.setFullYear(end.getFullYear() + 1);
        break;
      case 'lifetime':
        end.setFullYear(end.getFullYear() + 100);
        break;
    }

    return end;
  }

  private compareTiers(oldTier: string, newTier: string): 'upgraded' | 'downgraded' {
    const tierRanking = { free: 0, basic: 1, pro: 2, enterprise: 3 };
    const oldRank = tierRanking[oldTier as keyof typeof tierRanking] || 0;
    const newRank = tierRanking[newTier as keyof typeof tierRanking] || 0;
    return newRank > oldRank ? 'upgraded' : 'downgraded';
  }

  private async recordHistory(
    subscriptionId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    action: string,
    fromTier?: string,
    toTier?: string,
    reason?: string
  ): Promise<void> {
    await SubscriptionHistory.create({
      subscriptionId,
      userId,
      action,
      fromTier,
      toTier,
      reason
    });
  }

  private getStartDateForPeriod(period: 'day' | 'week' | 'month' | 'year'): Date {
    const now = new Date();
    const startDate = new Date(now);

    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return startDate;
  }
}

export default new SubscriptionService();
