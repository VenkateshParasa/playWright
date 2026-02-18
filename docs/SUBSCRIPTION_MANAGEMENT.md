# Subscription Management Guide

## Overview

This guide covers the comprehensive subscription management system for the Playwright & Selenium Learning Platform, including tier management, lifecycle handling, and analytics.

## Subscription Tiers

### Tier Structure

| Tier | Price (Monthly) | Price (Yearly) | Features |
|------|----------------|----------------|----------|
| Free | $0 | $0 | Free courses, community support |
| Basic | $29 | $290 (17% off) | All courses, certificates, email support |
| Pro | $79 | $790 (17% off) | + Live classes, priority support, mentoring |
| Enterprise | $299 | $2,990 (17% off) | + Unlimited access, dedicated support, custom integrations |

### Creating Subscription Tiers

```typescript
import { SubscriptionTier } from './models/Subscription';

const proTier = new SubscriptionTier({
  name: 'pro',
  displayName: 'Pro',
  description: 'Best for professionals',
  price: 79,
  billingPeriod: 'monthly',
  features: [
    { name: 'all_courses', enabled: true, limit: -1 },
    { name: 'live_classes', enabled: true, limit: 10 },
    { name: 'mentoring_sessions', enabled: true, limit: 2 },
    { name: 'priority_support', enabled: true }
  ],
  maxCourses: -1, // unlimited
  maxStudents: -1,
  storageLimit: 50, // GB
  supportLevel: 'priority',
  trialDays: 14,
  stripePriceId: 'price_xxx',
  order: 2
});

await proTier.save();
```

## Subscription Lifecycle

### 1. Creation

```typescript
// User signs up for Pro tier
const subscription = await subscriptionService.createSubscription(
  userId,
  'pro',
  paymentMethodId
);

// Status: 'trialing' (if trial period) or 'active'
```

### 2. Trial Period

```typescript
// Check if in trial
if (subscription.isInTrial()) {
  const daysRemaining = Math.ceil(
    (subscription.trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  console.log(`${daysRemaining} days left in trial`);
}
```

### 3. Active Subscription

```typescript
// Check active status
if (subscription.isActive()) {
  // Grant access to Pro features
}

// Check days until renewal
const daysUntilRenewal = subscription.daysUntilRenewal();
```

### 4. Upgrade/Downgrade

```typescript
// Upgrade from Basic to Pro
await subscriptionService.changeSubscriptionTier(
  subscriptionId,
  'pro',
  'create_prorations' // Prorate the difference
);

// Downgrade from Pro to Basic
await subscriptionService.changeSubscriptionTier(
  subscriptionId,
  'basic',
  'none' // Apply at next billing cycle
);
```

### 5. Pause Subscription

```typescript
// Pause for 60 days
const resumeDate = new Date();
resumeDate.setDate(resumeDate.getDate() + 60);

await subscriptionService.pauseSubscription(
  subscriptionId,
  resumeDate,
  'Customer traveling'
);

// Resume immediately
await subscriptionService.resumeSubscription(subscriptionId);
```

### 6. Cancellation

```typescript
// Cancel at period end (recommended)
await subscriptionService.cancelSubscription(
  subscriptionId,
  true, // cancelAtPeriodEnd
  'Found alternative solution'
);

// Immediate cancellation
await subscriptionService.cancelSubscription(
  subscriptionId,
  false,
  'Customer request for immediate cancellation'
);
```

## Feature Gating

### Checking Feature Access

```typescript
// Check if user has access to specific feature
const hasLiveClasses = await subscriptionService.hasFeatureAccess(
  userId,
  'live_classes'
);

if (hasLiveClasses) {
  // Show live classes
} else {
  // Show upgrade prompt
}
```

### Usage Tracking

```typescript
// Track usage
const usage = await subscriptionService.getSubscriptionUsage(subscriptionId);

console.log({
  coursesAccessed: usage.coursesAccessed,
  coursesLimit: usage.coursesLimit,
  storageUsed: usage.storageUsed,
  storageLimit: usage.storageLimit
});

// Check if user is approaching limits
if (usage.storageUsed >= usage.storageLimit * 0.9) {
  // Send warning email
}
```

## Payment Failure Handling (Dunning)

### Automatic Retry Schedule

```typescript
// Day 0: Payment fails
await subscriptionService.handleFailedPayment(subscriptionId);
// Status: 'past_due'
// Grace period: 7 days

// Day 1: First retry
// Day 2: Second retry
// Day 4: Third retry
// Day 7: Fourth retry (final)

// After 4 failed attempts:
// Status: 'canceled'
```

### Grace Period

```typescript
// Check if in grace period
if (subscription.status === 'past_due') {
  const daysRemaining = Math.ceil(
    (subscription.gracePeriodEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  // Display warning to user
  console.log(`Update payment method - ${daysRemaining} days remaining`);
}
```

### Successful Payment Recovery

```typescript
// Called automatically when payment succeeds
await subscriptionService.handleSuccessfulPayment(
  subscriptionId,
  transactionId
);

// Status: 'active'
// Failed payment attempts: reset to 0
// Grace period: removed
```

## Proration

### Upgrade Proration

```typescript
// User upgrades from Basic ($29) to Pro ($79) mid-cycle
// Days remaining in cycle: 15 days
// Daily rate Basic: $29 / 30 = $0.97
// Daily rate Pro: $79 / 30 = $2.63
// Credit for unused Basic: 15 * $0.97 = $14.55
// Charge for Pro: 15 * $2.63 = $39.45
// Immediate charge: $39.45 - $14.55 = $24.90

await subscriptionService.changeSubscriptionTier(
  subscriptionId,
  'pro',
  'create_prorations' // Handles the above calculation
);
```

### Downgrade Proration

```typescript
// User downgrades from Pro ($79) to Basic ($29)
// Apply change at next billing cycle (recommended)

await subscriptionService.changeSubscriptionTier(
  subscriptionId,
  'basic',
  'none' // No immediate charge, applies at renewal
);

// Alternative: Immediate downgrade with proration
await subscriptionService.changeSubscriptionTier(
  subscriptionId,
  'basic',
  'always_invoice' // Creates credit note for difference
);
```

## Churn Prevention

### 1. Pause Subscription Feature

```typescript
// Allow users to pause instead of canceling
// Reduces churn by 15-20%

const pauseOptions = [
  { duration: '30 days', label: '1 month' },
  { duration: '60 days', label: '2 months' },
  { duration: '90 days', label: '3 months' }
];
```

### 2. Retention Offers

```typescript
// When user attempts to cancel, offer discount
const retentionOffer = {
  discountPercentage: 25,
  durationMonths: 3,
  message: "Stay with us! Get 25% off for 3 months"
};
```

### 3. Exit Surveys

```typescript
const cancelReasons = [
  'Too expensive',
  'Not using enough',
  'Found alternative',
  'Technical issues',
  'Other'
];

// Track cancellation reasons for improvement
```

### 4. Win-Back Campaigns

```typescript
// Email canceled users after 30 days
const winBackOffer = {
  discountPercentage: 50,
  trialDays: 14,
  message: "We miss you! Come back with 50% off"
};
```

## Subscription Analytics

### Key Metrics

```typescript
const analytics = await subscriptionService.getSubscriptionAnalytics('month');

console.log({
  // Active subscriptions
  activeSubscriptions: analytics.activeSubscriptions,

  // New subscriptions this period
  newSubscriptions: analytics.newSubscriptions,

  // Canceled this period
  canceledSubscriptions: analytics.canceledSubscriptions,

  // Churn rate (canceled / active)
  churnRate: analytics.churnRate + '%',

  // Revenue
  revenue: '$' + analytics.revenue.toFixed(2),

  // Transaction count
  transactionCount: analytics.transactionCount
});
```

### Monthly Recurring Revenue (MRR)

```typescript
// Calculate MRR
const subscriptions = await Subscription.find({ status: 'active' });

let mrr = 0;
for (const sub of subscriptions) {
  if (sub.billingPeriod === 'monthly') {
    mrr += sub.amount;
  } else if (sub.billingPeriod === 'yearly') {
    mrr += sub.amount / 12;
  }
}

console.log(`MRR: $${mrr.toFixed(2)}`);
```

### Annual Recurring Revenue (ARR)

```typescript
const arr = mrr * 12;
console.log(`ARR: $${arr.toFixed(2)}`);
```

### Churn Rate

```typescript
// Monthly churn rate
const startOfMonth = new Date(Date.now());
startOfMonth.setDate(1);

const activeAtStart = await Subscription.countDocuments({
  status: 'active',
  createdAt: { $lt: startOfMonth }
});

const canceledThisMonth = await Subscription.countDocuments({
  status: 'canceled',
  canceledAt: { $gte: startOfMonth }
});

const churnRate = (canceledThisMonth / activeAtStart) * 100;
console.log(`Churn Rate: ${churnRate.toFixed(2)}%`);
```

## Stripe Integration

### Setting Up Webhooks

```typescript
// Configure webhook endpoint
app.post('/api/monetization/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'customer.subscription.created':
      // New subscription
      break;
    case 'customer.subscription.updated':
      // Subscription changed
      break;
    case 'customer.subscription.deleted':
      // Subscription canceled
      break;
    case 'invoice.payment_succeeded':
      // Payment successful
      await subscriptionService.handleSuccessfulPayment(
        subscriptionId,
        transactionId
      );
      break;
    case 'invoice.payment_failed':
      // Payment failed
      await subscriptionService.handleFailedPayment(subscriptionId);
      break;
  }

  res.json({ received: true });
});
```

## Best Practices

### 1. Trial Management
- Start with 7-14 day trials for Basic/Pro
- Offer 30-day trials for Enterprise
- Send trial expiration reminders at 3 days and 1 day
- Make trial conversion easy with one-click upgrade

### 2. Billing Communication
- Send invoice receipts immediately
- Send renewal reminders 7 days before
- Notify of failed payments within 24 hours
- Provide clear billing history

### 3. Subscription Changes
- Allow instant upgrades
- Apply downgrades at next billing cycle
- Show clear pricing differences
- Explain proration clearly

### 4. Churn Reduction
- Offer pause instead of cancel
- Provide retention discounts
- Collect cancellation feedback
- Run win-back campaigns

### 5. Feature Gating
- Check permissions server-side
- Cache feature access for performance
- Provide clear upgrade prompts
- Show feature value before gating

## Troubleshooting

### Subscription Not Creating
```typescript
// Check Stripe configuration
console.log(process.env.STRIPE_SECRET_KEY);

// Verify payment method
const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

// Check for existing subscription
const existing = await Subscription.findOne({
  userId,
  status: { $in: ['active', 'trialing'] }
});
```

### Failed Payment Not Retrying
```typescript
// Check subscription status
const sub = await Subscription.findById(subscriptionId);
console.log({
  status: sub.status,
  failedAttempts: sub.failedPaymentAttempts,
  nextRetry: sub.nextRetryDate
});

// Manually trigger retry
await subscriptionService.handleFailedPayment(subscriptionId);
```

### Proration Issues
```typescript
// Verify proration behavior
console.log(subscription.prorationBehavior);

// Check Stripe subscription
const stripeSub = await stripe.subscriptions.retrieve(
  subscription.stripeSubscriptionId
);
console.log(stripeSub.proration_behavior);
```

## API Reference

See [MONETIZATION_GUIDE.md](./MONETIZATION_GUIDE.md#api-reference) for complete API documentation.

## Support

For subscription-related support:
- Email: billing@playwrightlearning.com
- Documentation: https://docs.playwrightlearning.com/subscriptions
- Status Page: https://status.playwrightlearning.com
