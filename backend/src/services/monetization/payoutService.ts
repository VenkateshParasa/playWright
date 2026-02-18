import {
  InstructorPayout,
  InstructorEarnings,
  RevenueShare,
  IInstructorPayout,
  IInstructorEarnings
} from '../../models/InstructorPayout';
import Transaction from '../../models/Transaction';
import Course from '../../models/Course';
import Stripe from 'stripe';
import mongoose from 'mongoose';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia'
});

export class PayoutService {
  /**
   * Initialize instructor earnings account
   */
  async initializeInstructorEarnings(
    instructorId: mongoose.Types.ObjectId,
    config?: {
      revenueSharingModel?: '70/30' | '80/20' | '85/15' | '90/10' | 'custom';
      instructorPercentage?: number;
      payoutFrequency?: 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
      minimumPayoutAmount?: number;
    }
  ): Promise<IInstructorEarnings> {
    // Check if earnings account already exists
    const existing = await InstructorEarnings.findOne({ instructorId });
    if (existing) {
      return existing;
    }

    const model = config?.revenueSharingModel || '70/30';
    let instructorPercentage = config?.instructorPercentage;
    let platformPercentage: number;

    // Parse revenue sharing model
    if (!instructorPercentage) {
      switch (model) {
        case '70/30':
          instructorPercentage = 70;
          platformPercentage = 30;
          break;
        case '80/20':
          instructorPercentage = 80;
          platformPercentage = 20;
          break;
        case '85/15':
          instructorPercentage = 85;
          platformPercentage = 15;
          break;
        case '90/10':
          instructorPercentage = 90;
          platformPercentage = 10;
          break;
        default:
          instructorPercentage = 70;
          platformPercentage = 30;
      }
    } else {
      platformPercentage = 100 - instructorPercentage;
    }

    const earnings = new InstructorEarnings({
      instructorId,
      revenueSharingModel: model,
      instructorPercentage,
      platformPercentage,
      payoutFrequency: config?.payoutFrequency || 'monthly',
      minimumPayoutAmount: config?.minimumPayoutAmount || 100
    });

    await earnings.save();
    return earnings;
  }

  /**
   * Process course sale and create revenue share
   */
  async processSale(
    transactionId: mongoose.Types.ObjectId,
    courseId: mongoose.Types.ObjectId,
    instructorId: mongoose.Types.ObjectId,
    grossAmount: number
  ): Promise<void> {
    // Get or create earnings account
    let earnings = await InstructorEarnings.findOne({ instructorId });
    if (!earnings) {
      earnings = await this.initializeInstructorEarnings(instructorId);
    }

    // Calculate shares
    const instructorShare = (grossAmount * earnings.instructorPercentage) / 100;
    const platformShare = grossAmount - instructorShare;

    // Create revenue share record
    const releaseDate = new Date();
    releaseDate.setDate(releaseDate.getDate() + 30); // 30-day hold period

    const revenueShare = new RevenueShare({
      transactionId,
      instructorId,
      courseId,
      grossAmount,
      instructorShare,
      platformShare,
      instructorPercentage: earnings.instructorPercentage,
      status: 'pending',
      holdPeriod: 30,
      releaseDate
    });

    await revenueShare.save();

    // Update transaction with revenue sharing info
    await Transaction.findByIdAndUpdate(transactionId, {
      revenueSharing: {
        instructorShare,
        platformShare,
        instructorId,
        payoutStatus: 'pending'
      }
    });

    // Update earnings (add to pending balance)
    const course = await Course.findById(courseId);
    earnings.pendingBalance += instructorShare;
    await earnings.addEarning(courseId, course?.title || 'Unknown Course', instructorShare);
  }

  /**
   * Release pending earnings (after hold period)
   */
  async releasePendingEarnings(): Promise<number> {
    const now = new Date();

    // Find revenue shares ready to be released
    const readyToRelease = await RevenueShare.find({
      status: 'pending',
      releaseDate: { $lte: now }
    });

    let releasedCount = 0;

    for (const share of readyToRelease) {
      // Update revenue share status
      share.status = 'released';
      share.releasedAt = new Date();
      await share.save();

      // Move from pending to current balance
      await InstructorEarnings.findOneAndUpdate(
        { instructorId: share.instructorId },
        {
          $inc: {
            pendingBalance: -share.instructorShare,
            currentBalance: share.instructorShare
          }
        }
      );

      releasedCount++;
    }

    return releasedCount;
  }

  /**
   * Create payout for instructor
   */
  async createPayout(
    instructorId: mongoose.Types.ObjectId,
    periodStart: Date,
    periodEnd: Date
  ): Promise<IInstructorPayout | null> {
    const earnings = await InstructorEarnings.findOne({ instructorId });
    if (!earnings) {
      throw new Error('Instructor earnings not found');
    }

    // Check if minimum payout amount is met
    if (earnings.currentBalance < earnings.minimumPayoutAmount) {
      return null;
    }

    // Get default payout method
    const payoutMethod = earnings.payoutMethods.find(pm => pm.isDefault);
    if (!payoutMethod) {
      throw new Error('No default payout method configured');
    }

    // Check tax form status
    const taxForm = earnings.taxForms.find(tf => tf.status === 'approved');
    if (!taxForm) {
      throw new Error('No approved tax form found');
    }

    // Get released revenue shares for the period
    const revenueShares = await RevenueShare.find({
      instructorId,
      status: 'released',
      releasedAt: { $gte: periodStart, $lte: periodEnd },
      $or: [{ payoutId: { $exists: false } }, { payoutId: null }]
    }).populate('courseId');

    if (revenueShares.length === 0) {
      return null;
    }

    // Create line items
    const lineItems = revenueShares.map(share => ({
      transactionId: share.transactionId,
      courseId: share.courseId._id,
      courseName: (share.courseId as any).title,
      saleDate: share.createdAt,
      grossAmount: share.grossAmount,
      platformFee: share.platformShare,
      netAmount: share.instructorShare,
      currency: 'USD'
    }));

    const totalAmount = revenueShares.reduce((sum, share) => sum + share.instructorShare, 0);

    // Create payout
    const payout = new InstructorPayout({
      instructorId,
      status: 'pending',
      payoutMethod,
      totalAmount,
      lineItems,
      periodStart,
      periodEnd,
      taxForm
    });

    payout.generatePayoutId();
    await payout.save();

    // Update revenue shares with payout ID
    await RevenueShare.updateMany(
      { _id: { $in: revenueShares.map(rs => rs._id) } },
      { $set: { payoutId: payout._id } }
    );

    // Update earnings
    earnings.currentBalance -= totalAmount;
    earnings.lastPayoutDate = new Date();
    earnings.lastPayoutAmount = totalAmount;
    await earnings.save();

    return payout;
  }

  /**
   * Process payout (send money)
   */
  async processPayout(payoutId: mongoose.Types.ObjectId): Promise<IInstructorPayout> {
    const payout = await InstructorPayout.findById(payoutId);
    if (!payout) {
      throw new Error('Payout not found');
    }

    if (payout.status !== 'pending' && payout.status !== 'scheduled') {
      throw new Error('Payout is not in a processable state');
    }

    payout.status = 'processing';
    await payout.save();

    try {
      // Process payout based on method type
      switch (payout.payoutMethod.type) {
        case 'stripe_connect':
          await this.processStripeConnectPayout(payout);
          break;
        case 'paypal':
          await this.processPayPalPayout(payout);
          break;
        case 'bank_transfer':
          await this.processBankTransferPayout(payout);
          break;
        default:
          throw new Error('Unsupported payout method');
      }

      payout.status = 'paid';
      payout.paidDate = new Date();
      payout.processedDate = new Date();
      await payout.save();

      // Update revenue shares
      await RevenueShare.updateMany(
        { payoutId: payout._id },
        { $set: { status: 'paid_out', paidOutAt: new Date() } }
      );

      // Update transactions
      await Transaction.updateMany(
        { 'revenueSharing.payoutId': payout._id },
        { $set: { 'revenueSharing.payoutStatus': 'paid' } }
      );

      return payout;
    } catch (error: any) {
      payout.status = 'failed';
      payout.failureReason = error.message;
      await payout.save();
      throw error;
    }
  }

  /**
   * Process Stripe Connect payout
   */
  private async processStripeConnectPayout(payout: IInstructorPayout): Promise<void> {
    const stripeAccountId = payout.payoutMethod.details.stripeAccountId;
    if (!stripeAccountId) {
      throw new Error('Stripe account ID not found');
    }

    // Create transfer
    const transfer = await stripe.transfers.create({
      amount: Math.round(payout.totalAmount * 100), // Convert to cents
      currency: payout.currency.toLowerCase(),
      destination: stripeAccountId,
      description: `Payout ${payout.payoutId} for period ${payout.periodStart.toISOString().split('T')[0]} to ${payout.periodEnd.toISOString().split('T')[0]}`
    });

    payout.providerPayoutId = transfer.id;
    payout.providerStatus = transfer.status;
  }

  /**
   * Process PayPal payout
   */
  private async processPayPalPayout(payout: IInstructorPayout): Promise<void> {
    // PayPal integration would go here
    // This is a placeholder
    console.log('Processing PayPal payout:', payout.payoutId);
    payout.providerPayoutId = `PAYPAL-${Date.now()}`;
    payout.providerStatus = 'SUCCESS';
  }

  /**
   * Process bank transfer payout
   */
  private async processBankTransferPayout(payout: IInstructorPayout): Promise<void> {
    // Bank transfer integration would go here
    // This is a placeholder
    console.log('Processing bank transfer payout:', payout.payoutId);
    payout.providerPayoutId = `BANK-${Date.now()}`;
    payout.providerStatus = 'PENDING';
  }

  /**
   * Schedule automatic payouts
   */
  async scheduleAutomaticPayouts(): Promise<number> {
    const instructorEarnings = await InstructorEarnings.find({
      currentBalance: { $gte: 0 },
      nextPayoutDate: { $lte: new Date() }
    });

    let scheduledCount = 0;

    for (const earnings of instructorEarnings) {
      if (earnings.currentBalance < earnings.minimumPayoutAmount) {
        // Update next payout date
        earnings.nextPayoutDate = this.calculateNextPayoutDate(
          new Date(),
          earnings.payoutFrequency
        );
        await earnings.save();
        continue;
      }

      const periodEnd = new Date();
      const periodStart = this.calculatePeriodStart(periodEnd, earnings.payoutFrequency);

      try {
        const payout = await this.createPayout(earnings.instructorId, periodStart, periodEnd);

        if (payout) {
          payout.status = 'scheduled';
          payout.scheduledDate = new Date();
          await payout.save();
          scheduledCount++;
        }

        // Update next payout date
        earnings.nextPayoutDate = this.calculateNextPayoutDate(
          periodEnd,
          earnings.payoutFrequency
        );
        await earnings.save();
      } catch (error) {
        console.error(`Failed to schedule payout for instructor ${earnings.instructorId}:`, error);
      }
    }

    return scheduledCount;
  }

  /**
   * Add payout method for instructor
   */
  async addPayoutMethod(
    instructorId: mongoose.Types.ObjectId,
    payoutMethod: any
  ): Promise<IInstructorEarnings | null> {
    const earnings = await InstructorEarnings.findOne({ instructorId });
    if (!earnings) {
      throw new Error('Instructor earnings not found');
    }

    // If this is the first payout method, make it default
    if (earnings.payoutMethods.length === 0) {
      payoutMethod.isDefault = true;
    }

    earnings.payoutMethods.push(payoutMethod);
    await earnings.save();

    return earnings;
  }

  /**
   * Submit tax form
   */
  async submitTaxForm(
    instructorId: mongoose.Types.ObjectId,
    taxForm: {
      type: 'W9' | 'W8BEN' | 'W8BEN_E' | 'other';
      fileUrl: string;
    }
  ): Promise<IInstructorEarnings | null> {
    const earnings = await InstructorEarnings.findOne({ instructorId });
    if (!earnings) {
      throw new Error('Instructor earnings not found');
    }

    earnings.taxForms.push({
      type: taxForm.type,
      status: 'pending',
      fileUrl: taxForm.fileUrl,
      submittedAt: new Date()
    });

    await earnings.save();
    return earnings;
  }

  /**
   * Get instructor earnings summary
   */
  async getEarningsSummary(instructorId: mongoose.Types.ObjectId) {
    const earnings = await InstructorEarnings.findOne({ instructorId });
    if (!earnings) {
      return null;
    }

    // Get pending revenue shares
    const pendingShares = await RevenueShare.find({
      instructorId,
      status: 'pending'
    });

    // Get recent payouts
    const recentPayouts = await InstructorPayout.find({
      instructorId,
      status: { $in: ['paid', 'processing', 'scheduled'] }
    })
      .sort({ createdAt: -1 })
      .limit(10);

    return {
      currentBalance: earnings.currentBalance,
      pendingBalance: earnings.pendingBalance,
      lifetimeEarnings: earnings.lifetimeEarnings,
      revenueSharingModel: earnings.revenueSharingModel,
      instructorPercentage: earnings.instructorPercentage,
      totalSales: earnings.totalSales,
      totalTransactions: earnings.totalTransactions,
      averageTransactionValue: earnings.averageTransactionValue,
      lastPayoutDate: earnings.lastPayoutDate,
      lastPayoutAmount: earnings.lastPayoutAmount,
      nextPayoutDate: earnings.nextPayoutDate,
      minimumPayoutAmount: earnings.minimumPayoutAmount,
      pendingShares: pendingShares.length,
      recentPayouts,
      courseEarnings: earnings.courseEarnings.sort((a, b) => b.totalEarnings - a.totalEarnings)
    };
  }

  // Helper methods

  private calculateNextPayoutDate(currentDate: Date, frequency: string): Date {
    const nextDate = new Date(currentDate);

    switch (frequency) {
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'biweekly':
        nextDate.setDate(nextDate.getDate() + 14);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
    }

    return nextDate;
  }

  private calculatePeriodStart(periodEnd: Date, frequency: string): Date {
    const periodStart = new Date(periodEnd);

    switch (frequency) {
      case 'weekly':
        periodStart.setDate(periodStart.getDate() - 7);
        break;
      case 'biweekly':
        periodStart.setDate(periodStart.getDate() - 14);
        break;
      case 'monthly':
        periodStart.setMonth(periodStart.getMonth() - 1);
        break;
      case 'quarterly':
        periodStart.setMonth(periodStart.getMonth() - 3);
        break;
    }

    return periodStart;
  }
}

export default new PayoutService();
