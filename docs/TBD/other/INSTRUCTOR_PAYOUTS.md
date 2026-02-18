# Instructor Payouts Guide

## Overview

This guide covers the instructor payout system, including revenue sharing, payout schedules, payment methods, and tax compliance.

## Revenue Sharing Models

### Available Models

| Model | Instructor Share | Platform Share | Typical For |
|-------|-----------------|----------------|-------------|
| 70/30 | 70% | 30% | Standard instructors |
| 80/20 | 80% | 20% | Experienced instructors |
| 85/15 | 85% | 15% | Premium instructors |
| 90/10 | 90% | 10% | Enterprise partners |
| Custom | Variable | Variable | Negotiated contracts |

### Initializing Instructor Earnings

```typescript
import payoutService from './services/monetization/payoutService';

const earnings = await payoutService.initializeInstructorEarnings(
  instructorId,
  {
    revenueSharingModel: '70/30',
    payoutFrequency: 'monthly',
    minimumPayoutAmount: 100
  }
);
```

## Sale Processing

### Course Sale Flow

```typescript
// 1. Student purchases course ($99.99)
const transaction = {
  userId: studentId,
  courseId: courseId,
  total: 99.99
};

// 2. Process revenue share
await payoutService.processSale(
  transaction._id,
  courseId,
  instructorId,
  99.99
);

// 3. Calculate shares (70/30 model)
// Instructor: $69.99
// Platform: $30.00

// 4. Revenue goes to pending (30-day hold)
// Instructor's pending balance: +$69.99
```

### Revenue Share Lifecycle

```typescript
// Day 0: Sale occurs
const revenueShare = {
  status: 'pending',
  grossAmount: 99.99,
  instructorShare: 69.99,
  platformShare: 30.00,
  holdPeriod: 30,
  releaseDate: Date.now() + 30 days
};

// Day 30: Revenue released
// Status: 'pending' → 'released'
// Moved from pending to current balance

// Payout: Revenue paid out
// Status: 'released' → 'paid_out'
```

## Payout Schedules

### Frequency Options

```typescript
const payoutFrequencies = {
  weekly: 'Every Monday',
  biweekly: 'Every other Monday',
  monthly: 'First day of month',
  quarterly: 'First day of quarter'
};
```

### Minimum Payout Amount

```typescript
// Set minimum (default: $100)
const earnings = await InstructorEarnings.findOne({ instructorId });
earnings.minimumPayoutAmount = 100;
await earnings.save();

// If balance < minimum, payout waits until threshold met
```

### Automatic Payout Scheduling

```typescript
// Run daily cron job
cron.schedule('0 0 * * *', async () => {
  const scheduled = await payoutService.scheduleAutomaticPayouts();
  console.log(`Scheduled ${scheduled} payouts`);
});
```

### Manual Payout Request

```typescript
// Instructor requests payout
const payout = await payoutService.createPayout(
  instructorId,
  periodStart,
  periodEnd
);

// Payout creation checks:
// 1. Balance >= minimum amount
// 2. Revenue is released (past hold period)
// 3. Valid payment method configured
// 4. Approved tax form on file
```

## Payment Methods

### Supported Methods

#### 1. Stripe Connect

```typescript
const payoutMethod = {
  type: 'stripe_connect',
  details: {
    stripeAccountId: 'acct_xxx'
  },
  isDefault: true,
  isVerified: true
};
```

Setup:
```typescript
// Instructor connects Stripe account
const accountLink = await stripe.accountLinks.create({
  account: stripeAccountId,
  refresh_url: 'https://platform.com/connect/refresh',
  return_url: 'https://platform.com/connect/return',
  type: 'account_onboarding'
});

// Redirect instructor to accountLink.url
```

#### 2. PayPal

```typescript
const payoutMethod = {
  type: 'paypal',
  details: {
    paypalEmail: 'instructor@example.com'
  },
  isDefault: true,
  isVerified: true
};
```

#### 3. Bank Transfer

```typescript
const payoutMethod = {
  type: 'bank_transfer',
  details: {
    accountHolderName: 'John Doe',
    accountNumber: '****5678',
    routingNumber: '021000021',
    bankName: 'Chase Bank'
  },
  isDefault: true,
  isVerified: false // Requires verification
};
```

#### 4. Wire Transfer (International)

```typescript
const payoutMethod = {
  type: 'wire_transfer',
  details: {
    iban: 'GB29NWBK60161331926819',
    bicCode: 'NWBKGB2L',
    accountHolderName: 'Jane Smith',
    bankName: 'NatWest'
  },
  isDefault: true,
  isVerified: true
};
```

### Adding Payment Method

```typescript
await payoutService.addPayoutMethod(instructorId, {
  type: 'stripe_connect',
  details: { stripeAccountId: 'acct_xxx' },
  isDefault: true
});
```

## Tax Compliance

### Required Tax Forms

#### W-9 (US Persons)
- Required for US citizens and residents
- Provides Tax ID (SSN or EIN)
- Required before first payout

#### W-8BEN (Foreign Individuals)
- Required for non-US individuals
- Subject to 30% withholding (or treaty rate)

#### W-8BEN-E (Foreign Entities)
- Required for non-US businesses
- Subject to 30% withholding (or treaty rate)

### Submitting Tax Forms

```typescript
await payoutService.submitTaxForm(instructorId, {
  type: 'W9',
  fileUrl: 's3://bucket/forms/w9-instructor123.pdf'
});

// Tax form workflow:
// 1. Status: 'not_submitted'
// 2. Instructor uploads → 'pending'
// 3. Admin reviews → 'approved' or 'rejected'
// 4. If approved, payouts can proceed
```

### Tax Withholding

```typescript
// For non-US instructors without treaty
const payout = {
  totalAmount: 100,
  taxWithheld: 30, // 30% withholding
  netPayout: 70
};

// With tax treaty (e.g., UK - 0%)
const payout = {
  totalAmount: 100,
  taxWithheld: 0,
  netPayout: 100
};
```

### Annual Tax Reporting

```typescript
// Generate 1099-NEC for US instructors earning >$600
const year = 2024;
const earnings = await InstructorEarnings.findOne({ instructorId });

if (earnings.lifetimeEarnings >= 600) {
  // Generate and send 1099-NEC
  const form1099 = {
    year,
    instructorId,
    totalEarnings: earnings.lifetimeEarnings,
    taxWithheld: 0
  };
}
```

## Payout Processing

### Creating a Payout

```typescript
const payout = await payoutService.createPayout(
  instructorId,
  new Date('2025-01-01'),
  new Date('2025-01-31')
);

// Payout includes:
// - All released revenue shares in period
// - Line items for each transaction
// - Total amount
// - Payment method details
// - Tax information
```

### Payout Statuses

```typescript
const statuses = {
  pending: 'Created, awaiting processing',
  scheduled: 'Scheduled for specific date',
  processing: 'Being sent to payment provider',
  paid: 'Successfully paid',
  failed: 'Payment failed',
  canceled: 'Canceled before processing'
};
```

### Processing Flow

```typescript
// 1. Create payout
const payout = await payoutService.createPayout(...);
// Status: 'pending'

// 2. Process payout
await payoutService.processPayout(payout._id);
// Status: 'processing'

// 3. Send to payment provider (Stripe Connect example)
const transfer = await stripe.transfers.create({
  amount: Math.round(payout.totalAmount * 100),
  currency: 'usd',
  destination: stripeAccountId
});

// 4. Mark as paid
// Status: 'paid'

// 5. Update revenue shares
// All included revenue shares: status → 'paid_out'

// 6. Update instructor earnings
// Current balance: reduced by payout amount
// Last payout date: updated
// Last payout amount: updated
```

### Failed Payout Handling

```typescript
try {
  await payoutService.processPayout(payoutId);
} catch (error) {
  // Payout status: 'failed'
  // Failure reason: stored

  // Common failure reasons:
  // - Insufficient funds in platform account
  // - Invalid payment method
  // - Bank rejected transfer
  // - Stripe account restricted

  // Notify instructor of failure
  // Allow retry after fixing issue
}
```

## Earnings Dashboard

### Summary Data

```typescript
const summary = await payoutService.getEarningsSummary(instructorId);

console.log({
  // Available for immediate payout
  currentBalance: summary.currentBalance,

  // Still in hold period
  pendingBalance: summary.pendingBalance,

  // All-time earnings
  lifetimeEarnings: summary.lifetimeEarnings,

  // Revenue split
  instructorPercentage: summary.instructorPercentage,

  // Sales stats
  totalSales: summary.totalSales,
  totalTransactions: summary.totalTransactions,
  averageTransactionValue: summary.averageTransactionValue,

  // Payout info
  lastPayoutDate: summary.lastPayoutDate,
  lastPayoutAmount: summary.lastPayoutAmount,
  nextPayoutDate: summary.nextPayoutDate,

  // Course breakdown
  courseEarnings: summary.courseEarnings.map(ce => ({
    courseName: ce.courseName,
    totalEarnings: ce.totalEarnings,
    salesCount: ce.salesCount
  }))
});
```

### Course Performance

```typescript
// Top earning courses
const topCourses = earnings.courseEarnings
  .sort((a, b) => b.totalEarnings - a.totalEarnings)
  .slice(0, 5);

// Courses needing attention
const underperforming = earnings.courseEarnings
  .filter(ce => ce.salesCount < 10)
  .sort((a, b) => a.salesCount - b.salesCount);
```

## Promotional Pricing

### Instructor Control

```typescript
// Check if instructor can set promotional pricing
const earnings = await InstructorEarnings.findOne({ instructorId });

if (earnings.canSetPromotionalPricing) {
  // Instructor can create coupons/promotions
  // Subject to minimum price limit

  const minPrice = earnings.promotionalPricingLimit || 9.99;

  // Coupon must not reduce price below minimum
  if (discountedPrice >= minPrice) {
    // Allow coupon
  }
}
```

### Approval Workflow

```typescript
// Large discounts require approval
const promotion = {
  courseId,
  originalPrice: 99.99,
  promotionalPrice: 19.99, // 80% off
  requiresApproval: true
};

// Admin reviews and approves
if (promotion.requiresApproval) {
  // Send to admin dashboard
  // Notify instructor when approved/rejected
}
```

## Analytics & Reporting

### Revenue Trends

```typescript
// Monthly revenue
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const revenueData = await Promise.all(
  months.map(async (month) => {
    const revenue = await RevenueShare.aggregate([
      {
        $match: {
          instructorId,
          createdAt: { $gte: startOfMonth, $lt: endOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$instructorShare' }
        }
      }
    ]);
    return { month, revenue: revenue[0]?.total || 0 };
  })
);
```

### Payout History

```typescript
// Recent payouts
const recentPayouts = await InstructorPayout.find({ instructorId })
  .sort({ createdAt: -1 })
  .limit(10);

// Year-to-date payouts
const ytdPayouts = await InstructorPayout.aggregate([
  {
    $match: {
      instructorId,
      paidDate: { $gte: startOfYear }
    }
  },
  {
    $group: {
      _id: null,
      total: { $sum: '$totalAmount' },
      count: { $sum: 1 }
    }
  }
]);
```

## Best Practices

### 1. Revenue Sharing
- Clearly communicate split percentages
- Document all changes to revenue share
- Provide earnings transparency
- Show estimated earnings before sale

### 2. Payout Timing
- Maintain consistent payout schedule
- Communicate payout dates clearly
- Send payout reminders
- Notify of any delays immediately

### 3. Payment Methods
- Support multiple payment options
- Verify payment methods before use
- Update instructors on new options
- Handle payment failures gracefully

### 4. Tax Compliance
- Collect tax forms before first payout
- Send annual tax reminders
- Provide tax documentation
- Keep records for 7 years

### 5. Instructor Communication
- Send payout confirmation emails
- Provide detailed payout breakdowns
- Include invoice/receipt
- Offer support for questions

## Troubleshooting

### Payout Not Creating

```typescript
// Check eligibility
const earnings = await InstructorEarnings.findOne({ instructorId });

console.log({
  currentBalance: earnings.currentBalance,
  minimumPayout: earnings.minimumPayoutAmount,
  eligible: earnings.currentBalance >= earnings.minimumPayoutAmount
});

// Check payment method
const hasPaymentMethod = earnings.payoutMethods.some(pm => pm.isDefault);

// Check tax form
const hasTaxForm = earnings.taxForms.some(tf => tf.status === 'approved');
```

### Payout Failed

```typescript
// Check payout status
const payout = await InstructorPayout.findById(payoutId);
console.log({
  status: payout.status,
  failureReason: payout.failureReason,
  providerStatus: payout.providerStatus
});

// Retry payout
if (payout.status === 'failed') {
  payout.status = 'pending';
  payout.failureReason = null;
  await payout.save();

  await payoutService.processPayout(payoutId);
}
```

### Revenue Not Releasing

```typescript
// Check revenue share status
const pendingShares = await RevenueShare.find({
  instructorId,
  status: 'pending',
  releaseDate: { $lt: new Date() }
});

// Manually release if needed
for (const share of pendingShares) {
  share.status = 'released';
  share.releasedAt = new Date();
  await share.save();

  await InstructorEarnings.findOneAndUpdate(
    { instructorId: share.instructorId },
    {
      $inc: {
        pendingBalance: -share.instructorShare,
        currentBalance: share.instructorShare
      }
    }
  );
}
```

## API Reference

See [MONETIZATION_GUIDE.md](./MONETIZATION_GUIDE.md#api-reference) for complete API documentation.

## Support

For payout-related support:
- Email: payouts@playwrightlearning.com
- Instructor Portal: https://instructors.playwrightlearning.com
- Tax Questions: tax@playwrightlearning.com
