import { Request, Response } from 'express';
import Stripe from 'stripe';
import Transaction from '../../models/Transaction';
import Course from '../../models/Course';
import { CourseBundle } from '../../models/Pricing';
import couponService from '../../services/monetization/couponService';
import pricingService from '../../services/monetization/pricingService';
import payoutService from '../../services/monetization/payoutService';
import mongoose from 'mongoose';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia'
});

export class CheckoutController {
  /**
   * Create checkout session for course purchase
   */
  async createCheckoutSession(req: Request, res: Response): Promise<void> {
    try {
      const {
        courseId,
        bundleId,
        couponCode,
        quantity = 1,
        paymentType = 'one_time' // one_time, subscription, installment
      } = req.body;

      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      let itemName: string;
      let itemPrice: number;
      let itemType: 'course' | 'bundle';
      let itemId: mongoose.Types.ObjectId;

      // Get item details
      if (courseId) {
        const course = await Course.findById(courseId);
        if (!course) {
          res.status(404).json({ error: 'Course not found' });
          return;
        }

        itemName = course.title;
        itemPrice = course.price;
        itemType = 'course';
        itemId = course._id;

        // Get effective pricing
        const pricing = await pricingService.getEffectivePrice(
          new mongoose.Types.ObjectId(courseId),
          {
            userId: new mongoose.Types.ObjectId(userId),
            quantity,
            countryCode: req.body.countryCode
          }
        );

        itemPrice = pricing.effectivePrice;
      } else if (bundleId) {
        const bundle = await CourseBundle.findById(bundleId);
        if (!bundle) {
          res.status(404).json({ error: 'Bundle not found' });
          return;
        }

        itemName = bundle.title;
        itemPrice = bundle.bundlePrice;
        itemType = 'bundle';
        itemId = bundle._id;
      } else {
        res.status(400).json({ error: 'Either courseId or bundleId is required' });
        return;
      }

      let subtotal = itemPrice * quantity;
      let discount = 0;
      let couponData: any = null;

      // Apply coupon if provided
      if (couponCode) {
        const validation = await couponService.validateCoupon(couponCode, {
          userId: new mongoose.Types.ObjectId(userId),
          courseId: itemType === 'course' ? itemId : undefined,
          bundleId: itemType === 'bundle' ? itemId : undefined,
          amount: subtotal
        });

        if (validation.valid && validation.discountAmount) {
          discount = validation.discountAmount;
          couponData = validation.coupon;
        }
      }

      const total = subtotal - discount;

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: itemName,
                description: `${itemType === 'course' ? 'Course' : 'Bundle'}: ${itemName}`
              },
              unit_amount: Math.round(total * 100) // Convert to cents
            },
            quantity
          }
        ],
        mode: paymentType === 'subscription' ? 'subscription' : 'payment',
        success_url: `${process.env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/checkout/cancel`,
        metadata: {
          userId,
          itemType,
          itemId: itemId.toString(),
          couponCode: couponCode || '',
          quantity: quantity.toString()
        }
      });

      res.json({
        success: true,
        sessionId: session.id,
        url: session.url,
        summary: {
          itemName,
          quantity,
          subtotal,
          discount,
          total,
          currency: 'USD',
          couponApplied: !!couponCode
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
   * Handle successful checkout
   */
  async handleCheckoutSuccess(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;

      // Retrieve checkout session
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status !== 'paid') {
        res.status(400).json({
          success: false,
          error: 'Payment not completed'
        });
        return;
      }

      const metadata = session.metadata!;
      const userId = new mongoose.Types.ObjectId(metadata.userId);
      const itemId = new mongoose.Types.ObjectId(metadata.itemId);
      const itemType = metadata.itemType as 'course' | 'bundle';

      // Create transaction record
      const transaction = new Transaction({
        userId,
        customerEmail: session.customer_details?.email,
        transactionId: `TXN-${Date.now()}`,
        type: 'purchase',
        status: 'completed',
        provider: 'stripe',
        providerTransactionId: session.payment_intent as string,
        lineItems: [
          {
            description: itemType === 'course' ? 'Course Purchase' : 'Bundle Purchase',
            courseId: itemType === 'course' ? itemId : undefined,
            bundleId: itemType === 'bundle' ? itemId : undefined,
            quantity: parseInt(metadata.quantity),
            unitPrice: session.amount_total! / 100,
            discount: 0,
            tax: 0,
            total: session.amount_total! / 100
          }
        ],
        subtotal: session.amount_total! / 100,
        total: session.amount_total! / 100,
        currency: session.currency!.toUpperCase(),
        paidAt: new Date()
      });

      transaction.generateInvoiceNumber();
      await transaction.save();

      // Apply coupon if used
      if (metadata.couponCode) {
        await couponService.applyCoupon(
          metadata.couponCode,
          userId,
          transaction._id,
          session.amount_total! / 100
        );
      }

      // Process revenue sharing if it's a course
      if (itemType === 'course') {
        const course = await Course.findById(itemId);
        if (course && course.instructors.length > 0) {
          await payoutService.processSale(
            transaction._id,
            itemId,
            course.instructors[0],
            session.amount_total! / 100
          );
        }
      }

      res.json({
        success: true,
        transaction,
        message: 'Purchase completed successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get checkout summary
   */
  async getCheckoutSummary(req: Request, res: Response): Promise<void> {
    try {
      const { courseId, bundleId, couponCode, quantity = 1 } = req.query;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      let itemName: string;
      let itemPrice: number;
      let itemType: 'course' | 'bundle';
      let itemId: mongoose.Types.ObjectId;

      if (courseId) {
        const course = await Course.findById(courseId);
        if (!course) {
          res.status(404).json({ error: 'Course not found' });
          return;
        }

        itemName = course.title;
        itemPrice = course.price;
        itemType = 'course';
        itemId = course._id;

        // Get effective pricing
        const pricing = await pricingService.getEffectivePrice(
          new mongoose.Types.ObjectId(courseId as string),
          {
            userId: new mongoose.Types.ObjectId(userId),
            quantity: parseInt(quantity as string)
          }
        );

        itemPrice = pricing.effectivePrice;
      } else if (bundleId) {
        const bundle = await CourseBundle.findById(bundleId);
        if (!bundle) {
          res.status(404).json({ error: 'Bundle not found' });
          return;
        }

        itemName = bundle.title;
        itemPrice = bundle.bundlePrice;
        itemType = 'bundle';
        itemId = bundle._id;
      } else {
        res.status(400).json({ error: 'Either courseId or bundleId is required' });
        return;
      }

      const qty = parseInt(quantity as string);
      let subtotal = itemPrice * qty;
      let discount = 0;
      let couponInfo: any = null;

      // Validate coupon if provided
      if (couponCode) {
        const validation = await couponService.validateCoupon(couponCode as string, {
          userId: new mongoose.Types.ObjectId(userId),
          courseId: itemType === 'course' ? itemId : undefined,
          bundleId: itemType === 'bundle' ? itemId : undefined,
          amount: subtotal
        });

        if (validation.valid && validation.discountAmount) {
          discount = validation.discountAmount;
          couponInfo = {
            code: validation.coupon?.code,
            type: validation.coupon?.type,
            value: validation.coupon?.value,
            discountAmount: validation.discountAmount
          };
        }
      }

      const tax = subtotal * 0.1; // 10% tax (simplified)
      const total = subtotal - discount + tax;

      res.json({
        success: true,
        summary: {
          itemName,
          itemType,
          quantity: qty,
          unitPrice: itemPrice,
          subtotal,
          discount,
          tax,
          total,
          currency: 'USD',
          coupon: couponInfo
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
   * Process refund
   */
  async processRefund(req: Request, res: Response): Promise<void> {
    try {
      const { transactionId } = req.params;
      const { reason, amount } = req.body;

      const transaction = await Transaction.findById(transactionId);
      if (!transaction) {
        res.status(404).json({ error: 'Transaction not found' });
        return;
      }

      if (transaction.status === 'refunded') {
        res.status(400).json({ error: 'Transaction already refunded' });
        return;
      }

      // Process Stripe refund
      const refund = await stripe.refunds.create({
        payment_intent: transaction.providerTransactionId!,
        amount: amount ? Math.round(amount * 100) : undefined,
        reason: 'requested_by_customer'
      });

      // Update transaction
      await transaction.addRefund({
        refundId: refund.id,
        amount: refund.amount / 100,
        reason: reason || 'Customer request',
        status: 'succeeded',
        processedAt: new Date()
      });

      res.json({
        success: true,
        refund: {
          refundId: refund.id,
          amount: refund.amount / 100,
          status: refund.status
        },
        message: 'Refund processed successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { page = 1, limit = 10, status, type } = req.query;

      const query: any = { userId: new mongoose.Types.ObjectId(userId) };
      if (status) query.status = status;
      if (type) query.type = type;

      const transactions = await Transaction.find(query)
        .sort({ createdAt: -1 })
        .skip((parseInt(page as string) - 1) * parseInt(limit as string))
        .limit(parseInt(limit as string));

      const total = await Transaction.countDocuments(query);

      res.json({
        success: true,
        transactions,
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
   * Download invoice
   */
  async downloadInvoice(req: Request, res: Response): Promise<void> {
    try {
      const { transactionId } = req.params;

      const transaction = await Transaction.findById(transactionId);
      if (!transaction) {
        res.status(404).json({ error: 'Transaction not found' });
        return;
      }

      // Generate invoice PDF (simplified - would use a PDF library in production)
      const invoiceData = {
        invoiceNumber: transaction.invoiceNumber,
        date: transaction.createdAt,
        customer: {
          email: transaction.customerEmail
        },
        items: transaction.lineItems,
        subtotal: transaction.subtotal,
        discount: transaction.discount,
        tax: transaction.tax,
        total: transaction.total,
        currency: transaction.currency
      };

      res.json({
        success: true,
        invoice: invoiceData,
        message: 'Invoice data retrieved successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

export default new CheckoutController();
