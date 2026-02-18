import express from 'express';
import subscriptionController from '../controllers/monetization/subscriptionController';
import checkoutController from '../controllers/monetization/checkoutController';
import couponController from '../controllers/monetization/couponController';

const router = express.Router();

// Subscription routes
router.post('/subscriptions', subscriptionController.createSubscription);
router.get('/subscriptions/current', subscriptionController.getCurrentSubscription);
router.put('/subscriptions/:subscriptionId/tier', subscriptionController.changeTier);
router.post('/subscriptions/:subscriptionId/cancel', subscriptionController.cancelSubscription);
router.post('/subscriptions/:subscriptionId/pause', subscriptionController.pauseSubscription);
router.post('/subscriptions/:subscriptionId/resume', subscriptionController.resumeSubscription);
router.get('/subscriptions/:subscriptionId/usage', subscriptionController.getUsage);
router.get('/subscriptions/feature/:feature', subscriptionController.checkFeatureAccess);
router.get('/subscriptions/:subscriptionId/history', subscriptionController.getHistory);
router.get('/subscriptions/analytics', subscriptionController.getAnalytics);
router.post('/subscriptions/webhook', subscriptionController.handleWebhook);

// Checkout routes
router.post('/checkout/create-session', checkoutController.createCheckoutSession);
router.get('/checkout/summary', checkoutController.getCheckoutSummary);
router.get('/checkout/success/:sessionId', checkoutController.handleCheckoutSuccess);
router.post('/checkout/refund/:transactionId', checkoutController.processRefund);
router.get('/checkout/transactions', checkoutController.getTransactionHistory);
router.get('/checkout/invoice/:transactionId', checkoutController.downloadInvoice);

// Coupon routes
router.post('/coupons', couponController.createCoupon);
router.get('/coupons', couponController.getAllCoupons);
router.get('/coupons/:id', couponController.getCouponById);
router.put('/coupons/:id', couponController.updateCoupon);
router.delete('/coupons/:id', couponController.deleteCoupon);
router.post('/coupons/validate/:code', couponController.validateCoupon);
router.post('/coupons/referral', couponController.createReferralCoupon);
router.post('/coupons/bulk', couponController.createBulkCoupons);
router.post('/coupons/flash-sale', couponController.createFlashSale);
router.get('/coupons/automatic', couponController.getAutomaticCoupons);
router.get('/coupons/:id/analytics', couponController.getCouponAnalytics);
router.post('/coupons/deactivate-expired', couponController.deactivateExpired);

export default router;
