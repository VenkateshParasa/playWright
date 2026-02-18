# Monetization Guide

## Overview

The Playwright & Selenium Learning Platform monetization system provides comprehensive tools for revenue generation, including subscription management, course marketplace, pricing strategies, and instructor payouts.

## Table of Contents

1. [Course Marketplace](#course-marketplace)
2. [Subscription Management](#subscription-management)
3. [Pricing Strategies](#pricing-strategies)
4. [Coupon System](#coupon-system)
5. [Payment Processing](#payment-processing)
6. [Revenue Analytics](#revenue-analytics)

---

## Course Marketplace

### Instructor Revenue Sharing

The platform supports multiple revenue sharing models:

- **70/30 Split**: 70% to instructor, 30% to platform (default)
- **80/20 Split**: 80% to instructor, 20% to platform
- **85/15 Split**: 85% to instructor, 15% to platform
- **90/10 Split**: 90% to instructor, 10% to platform
- **Custom**: Negotiated rates for enterprise instructors

### Course Pricing Models

#### 1. One-Time Purchase
```typescript
const pricing = {
  pricingModel: 'one_time',
  basePrice: 99.99,
  currency: 'USD'
};
```

#### 2. Subscription-Based
```typescript
const pricing = {
  pricingModel: 'subscription',
  subscriptionOptions: {
    monthly: 29.99,
    quarterly: 79.99,
    yearly: 299.99
  }
};
```

#### 3. Freemium Model
```typescript
const pricing = {
  pricingModel: 'freemium',
  basePrice: 0, // Free tier
  tiers: [
    { name: 'basic', price: 29.99, features: [...] },
    { name: 'pro', price: 79.99, features: [...] }
  ]
};
```

### Tiered Pricing

Create multiple pricing tiers for different customer segments:

```typescript
const tiers = [
  {
    name: 'basic',
    price: 49.99,
    features: ['Basic content', 'Community access']
  },
  {
    name: 'pro',
    price: 99.99,
    features: ['All content', 'Live classes', '1-on-1 mentoring']
  },
  {
    name: 'enterprise',
    price: 299.99,
    features: ['Everything', 'Custom integrations', 'Dedicated support']
  }
];
```

### Bulk Licensing

Offer discounts for team purchases:

```typescript
const bulkPricing = [
  { minSeats: 5, maxSeats: 10, pricePerSeat: 45, discount: 10 },
  { minSeats: 11, maxSeats: 25, pricePerSeat: 40, discount: 20 },
  { minSeats: 26, pricePerSeat: 35, discount: 30 }
];
```

### Course Bundles

Create bundled offerings for increased value:

```typescript
import { CourseBundle } from './models/Pricing';

const bundle = new CourseBundle({
  title: 'Complete Testing Bootcamp',
  courses: [
    { courseId: course1._id, order: 1 },
    { courseId: course2._id, order: 2 },
    { courseId: course3._id, order: 3 }
  ],
  regularPrice: 297,
  bundlePrice: 197,
  bundleType: 'learning_path'
});
```

### Early Bird Pricing

Incentivize early purchases:

```typescript
await pricingService.setEarlyBirdPricing(courseId, {
  price: 49.99, // Regular price: $99.99
  validUntil: new Date('2025-12-31'),
  spotsAvailable: 100
});
```

---

## Subscription Management

### Subscription Tiers

The platform offers four subscription tiers:

#### Free Tier
- Access to free courses
- Community support
- Basic features

#### Basic Tier ($29/month)
- All courses
- Course certificates
- Email support
- 7-day free trial

#### Pro Tier ($79/month)
- Everything in Basic
- Live classes (10/month)
- Priority support
- 1-on-1 mentoring (2/month)
- 14-day free trial

#### Enterprise Tier ($299/month)
- Everything in Pro
- Unlimited live classes
- Dedicated account manager
- Custom integrations
- 30-day free trial

### Creating a Subscription

```typescript
import subscriptionService from './services/monetization/subscriptionService';

const subscription = await subscriptionService.createSubscription(
  userId,
  'pro',
  paymentMethodId
);
```

### Managing Subscriptions

#### Upgrade/Downgrade
```typescript
await subscriptionService.changeSubscriptionTier(
  subscriptionId,
  'enterprise',
  'create_prorations' // Handle proration
);
```

#### Cancel Subscription
```typescript
// Cancel at period end
await subscriptionService.cancelSubscription(
  subscriptionId,
  true, // cancelAtPeriodEnd
  'Customer request'
);
```

#### Pause Subscription
```typescript
// Pause for 30 days
const resumeDate = new Date();
resumeDate.setDate(resumeDate.getDate() + 30);

await subscriptionService.pauseSubscription(
  subscriptionId,
  resumeDate,
  'Customer requested pause'
);
```

### Trial Periods

Trials are configured per tier:

```typescript
const tier = {
  name: 'pro',
  trialDays: 14,
  price: 79,
  // ... other settings
};
```

### Grace Periods

Failed payments trigger a 7-day grace period:

```typescript
// Automatically handled by dunning system
subscription.gracePeriodEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
```

### Dunning Management

The system automatically retries failed payments with exponential backoff:

1. Immediate retry
2. After 2 days
3. After 4 days
4. After 7 days (final attempt)

```typescript
await subscriptionService.handleFailedPayment(subscriptionId);
```

---

## Pricing Strategies

### Dynamic Pricing

Adjust prices based on demand:

```typescript
const pricing = {
  dynamicPricingEnabled: true,
  dynamicPricingRules: {
    demandMultiplier: 0.2, // 20% increase at peak demand
    minPrice: 29.99,
    maxPrice: 149.99
  }
};
```

### Geographic Pricing (PPP)

Automatic purchasing power parity adjustments:

```typescript
await pricingService.generateGeographicPricing(courseId);

// Automatically applies country-specific pricing
// India: 25% of base price
// Brazil: 30% of base price
// US/UK/EU: 100% of base price
```

### Student Discounts

Offer verified student discounts:

```typescript
const studentDiscount = {
  percentage: 40,
  requiresVerification: true
};
```

### Seasonal Promotions

Create time-limited promotions:

```typescript
await pricingService.createSeasonalPromotion(courseId, {
  name: 'Black Friday Sale',
  startDate: new Date('2025-11-24'),
  endDate: new Date('2025-11-27'),
  discountPercentage: 50
});
```

### Flash Sales

Quick promotional campaigns:

```typescript
await couponService.createFlashSale({
  discountPercentage: 30,
  durationHours: 6,
  maxUsages: 100,
  applicableToCategories: ['Testing', 'Automation']
});
```

### Installment Plans

Offer payment plans:

```typescript
await pricingService.configureInstallmentPlan(courseId, {
  enabled: true,
  numberOfInstallments: 3,
  downPaymentPercentage: 30 // 30% down, rest in 3 payments
});
```

---

## Coupon System

### Creating Coupons

#### Percentage Discount
```typescript
const coupon = await couponService.createCoupon({
  code: 'SAVE20',
  name: '20% Off',
  type: 'percentage',
  value: 20,
  usageType: 'multi_use',
  maxUsages: 100,
  expirationDate: new Date('2025-12-31')
});
```

#### Fixed Amount Discount
```typescript
const coupon = await couponService.createCoupon({
  code: 'FIFTY',
  name: '$50 Off',
  type: 'fixed_amount',
  value: 50,
  usageType: 'single_use'
});
```

### Coupon Restrictions

Add restrictions to target specific users or products:

```typescript
const coupon = {
  code: 'NEWUSER20',
  restrictions: {
    minimumPurchaseAmount: 50,
    maximumDiscountAmount: 100,
    firstTimeUsersOnly: true,
    applicableToCategories: ['Testing'],
    userSegments: ['students'],
    geographicRestrictions: {
      countries: ['US', 'CA', 'GB']
    }
  }
};
```

### Automatic Coupons

Apply coupons automatically when conditions are met:

```typescript
const autoCoupon = {
  code: 'AUTO10',
  isAutomatic: true,
  automaticConditions: {
    minimumAmount: 100,
    courseCategories: ['Testing', 'Automation']
  }
};
```

### Referral Coupons

Generate referral discounts:

```typescript
const referralCoupon = await couponService.createReferralCoupon(
  referrerId,
  10, // Referrer gets $10
  20  // Referee gets 20% off
);
```

### Bulk Coupon Generation

Create multiple unique codes:

```typescript
const coupons = await couponService.createBulkCoupons({
  prefix: 'PROMO',
  count: 500,
  type: 'percentage',
  value: 15,
  usageType: 'single_use',
  expirationDate: new Date('2025-12-31')
});
```

### Coupon Stacking

Allow multiple coupons on a single purchase:

```typescript
const coupon = {
  code: 'STACK15',
  stackable: true, // Can be combined with other coupons
  // ...
};
```

---

## Payment Processing

### Supported Payment Methods

- Credit/Debit Cards (via Stripe)
- PayPal
- Apple Pay
- Google Pay
- Bank Transfer (for enterprise)

### Creating a Checkout Session

```typescript
import checkoutController from './controllers/monetization/checkoutController';

const session = await checkoutController.createCheckoutSession({
  courseId,
  couponCode: 'SAVE20',
  quantity: 1,
  paymentType: 'one_time'
});

// Redirect to Stripe checkout
window.location.href = session.url;
```

### Handling Successful Payments

```typescript
// Webhook endpoint
app.post('/api/monetization/webhook', async (req, res) => {
  const event = req.body;

  if (event.type === 'checkout.session.completed') {
    await checkoutController.handleCheckoutSuccess(event.data.object.id);
  }
});
```

### Invoice Generation

Invoices are automatically generated for all transactions:

```typescript
const transaction = await Transaction.findById(transactionId);
transaction.generateInvoiceNumber(); // INV-202501-ABC123
await transaction.save();
```

### Refund Management

Process refunds through Stripe:

```typescript
await checkoutController.processRefund(transactionId, {
  reason: 'Customer request',
  amount: 99.99 // Partial or full refund
});
```

### Tax Calculation

Automatic tax calculation by region:

```typescript
const taxDetails = {
  country: 'US',
  state: 'CA',
  taxType: 'sales_tax',
  rate: 0.095, // 9.5%
  amount: 9.45
};
```

---

## Revenue Analytics

### Key Metrics

The platform tracks essential revenue metrics:

- **MRR**: Monthly Recurring Revenue
- **ARR**: Annual Recurring Revenue
- **Growth Rate**: Month-over-month growth
- **Churn Rate**: Subscription cancellation rate
- **LTV**: Customer Lifetime Value
- **CAC**: Customer Acquisition Cost

### Fetching Analytics

```typescript
const analytics = await subscriptionService.getSubscriptionAnalytics('month');

console.log({
  activeSubscriptions: analytics.activeSubscriptions,
  newSubscriptions: analytics.newSubscriptions,
  canceledSubscriptions: analytics.canceledSubscriptions,
  churnRate: analytics.churnRate,
  revenue: analytics.revenue
});
```

### Revenue Forecasting

Use historical data to predict future revenue:

```typescript
// Based on current growth rate
const currentMRR = 125000;
const growthRate = 0.235; // 23.5%

const forecastedMRR = currentMRR * (1 + growthRate);
```

### Conversion Rate Optimization

Track coupon effectiveness:

```typescript
const couponAnalytics = await couponService.getCouponAnalytics(couponId);

console.log({
  totalUsages: couponAnalytics.totalUsages,
  totalRevenue: couponAnalytics.totalRevenue,
  conversionRate: couponAnalytics.conversionRate,
  averageDiscount: couponAnalytics.averageDiscountPerUse
});
```

---

## Best Practices

### 1. Pricing Strategy
- Test different price points
- Use psychological pricing ($99.99 vs $100)
- Offer annual plans with savings
- Implement geographic pricing for global reach

### 2. Subscription Management
- Provide clear upgrade/downgrade paths
- Offer pause options to reduce churn
- Implement effective dunning management
- Send renewal reminders

### 3. Coupon Usage
- Limit discount amounts to protect margins
- Set expiration dates on all coupons
- Track ROI on promotional campaigns
- Use first-time-user coupons for acquisition

### 4. Revenue Optimization
- Monitor churn closely and address causes
- Focus on LTV/CAC ratio (aim for 3:1 or better)
- Upsell existing customers to higher tiers
- Create bundle deals to increase AOV

### 5. Payment Processing
- Offer multiple payment methods
- Handle failed payments gracefully
- Provide clear refund policies
- Generate professional invoices

---

## API Reference

### Subscription Service

```typescript
subscriptionService.createSubscription(userId, tier, paymentMethodId)
subscriptionService.changeSubscriptionTier(subscriptionId, newTier, prorationBehavior)
subscriptionService.cancelSubscription(subscriptionId, cancelAtPeriodEnd, reason)
subscriptionService.pauseSubscription(subscriptionId, resumeDate, reason)
subscriptionService.resumeSubscription(subscriptionId)
subscriptionService.hasFeatureAccess(userId, featureName)
subscriptionService.getSubscriptionAnalytics(period)
```

### Pricing Service

```typescript
pricingService.createCoursePricing(courseId, pricingData)
pricingService.getEffectivePrice(courseId, context)
pricingService.getBulkPrice(pricing, quantity)
pricingService.generateGeographicPricing(courseId)
pricingService.createSeasonalPromotion(courseId, promotion)
pricingService.setEarlyBirdPricing(courseId, earlyBirdData)
```

### Coupon Service

```typescript
couponService.createCoupon(couponData)
couponService.validateCoupon(code, context)
couponService.applyCoupon(code, userId, transactionId, amount)
couponService.createReferralCoupon(referrerId, referrerBonus, refereeDiscount)
couponService.createFlashSale(config)
couponService.getCouponAnalytics(couponId)
```

### Payout Service

```typescript
payoutService.initializeInstructorEarnings(instructorId, config)
payoutService.processSale(transactionId, courseId, instructorId, grossAmount)
payoutService.createPayout(instructorId, periodStart, periodEnd)
payoutService.processPayout(payoutId)
payoutService.getEarningsSummary(instructorId)
```

---

## Support

For questions or issues with monetization features:
- Email: support@playwrightlearning.com
- Documentation: https://docs.playwrightlearning.com
- Community: https://community.playwrightlearning.com
