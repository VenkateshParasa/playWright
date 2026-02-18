# Affiliate Program Setup Guide

## Quick Start

Get your affiliate program up and running in 30 minutes.

### Step 1: Configure Settings

```typescript
// backend/config/affiliate.ts
export const affiliateConfig = {
  // Commission Structure
  defaultCommissionRate: 20, // percentage
  commissionType: 'percentage', // or 'fixed'

  // Cookie Settings
  cookieDuration: 30, // days

  // Payment Settings
  minimumPayout: 50, // dollars
  paymentSchedule: 'monthly', // or 'bi-weekly', 'weekly'
  paymentMethods: ['paypal', 'bank_transfer', 'stripe'],

  // Approval Settings
  autoApprove: false,
  requireWebsite: true,

  // Multi-tier Settings
  multiTierEnabled: false,
  tierCommissions: [
    { level: 1, rate: 20 },
    { level: 2, rate: 10 },
  ],
};
```

### Step 2: Enable Affiliate Features

```typescript
// In your platform settings
{
  "features": {
    "affiliateProgram": true,
    "referralProgram": true
  }
}
```

### Step 3: Create Affiliate Landing Page

Navigate to Marketing > Landing Pages > Create New

Use the "Affiliate Program" template which includes:
- Program benefits
- Commission structure
- Success stories
- Application form

### Step 4: Set Up Payment Methods

#### PayPal Integration

```bash
# Add to .env
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_MODE=sandbox # or 'live'
```

#### Stripe Integration

```bash
# Add to .env
STRIPE_SECRET_KEY=your_secret_key
STRIPE_PUBLISHABLE_KEY=your_publishable_key
```

### Step 5: Configure Email Templates

Create email templates for:
1. Application received
2. Application approved
3. Application rejected
4. New sale notification
5. Payment processed

### Step 6: Create Marketing Materials

Provide affiliates with:
- Banner images (various sizes)
- Email templates
- Social media posts
- Product descriptions
- Brand guidelines

## Affiliate Application Workflow

### 1. User Applies

```typescript
// Frontend: AffiliateSignup.tsx
const handleSubmit = async () => {
  const response = await fetch('/api/marketing/affiliates/apply', {
    method: 'POST',
    body: JSON.stringify({
      companyName: 'Digital Agency',
      website: 'https://agency.com',
      bio: 'Marketing agency specializing in tech education...',
      paymentMethod: 'paypal',
      paypalEmail: 'payments@agency.com',
    }),
  });
};
```

### 2. Admin Reviews

Access: Admin Dashboard > Marketing > Affiliates > Pending

Review criteria:
- Website quality and relevance
- Traffic volume
- Audience alignment
- Previous experience
- Social media presence

### 3. Approve or Reject

**Approve:**
```typescript
// API Call
POST /api/marketing/affiliates/{id}/approve

// Affiliate receives:
// 1. Approval email
// 2. Unique affiliate code
// 3. Tracking links
// 4. Marketing materials access
```

**Reject:**
```typescript
// API Call
POST /api/marketing/affiliates/{id}/reject
{
  "reason": "Website content not aligned with our brand"
}
```

## Managing Affiliates

### Dashboard Overview

Track key metrics:
- Total affiliates (active/pending/suspended)
- Total clicks generated
- Total conversions
- Total revenue
- Commission owed
- Top performers

### Affiliate Actions

**View Details**
- Performance metrics
- Payment history
- Link performance
- Traffic sources

**Edit Commission Rate**
```typescript
// Update individual affiliate rate
PATCH /api/marketing/affiliates/{id}
{
  "commissionRate": 25
}
```

**Suspend Affiliate**
```typescript
POST /api/marketing/affiliates/{id}/suspend
{
  "reason": "Violated terms - spam activities detected"
}
```

**Reactivate Affiliate**
```typescript
POST /api/marketing/affiliates/{id}/reactivate
```

## Commission Management

### Commission Lifecycle

1. **Sale Made**
   - Tracked via cookie/referral parameter
   - Commission created with status: `pending`

2. **Holding Period** (30 days)
   - Wait for refund window
   - Verify sale validity

3. **Admin Approval**
   - Review commission
   - Approve or reject
   - Status changes to: `approved`

4. **Payment Processing**
   - Add to next payout batch
   - Status changes to: `paid`

### Bulk Approval

```typescript
// Approve all pending commissions older than 30 days
POST /api/marketing/affiliates/commissions/bulk-approve
{
  "olderThan": 30 // days
}
```

### Commission Reports

Generate reports for:
- Date range
- Specific affiliate
- Product/course
- Status (pending/approved/paid)

Export to CSV for accounting.

## Payment Processing

### Manual Payout

1. Go to: Affiliates > Payouts
2. Select affiliates with balance > minimum
3. Review total amount
4. Process payment via selected method
5. Record transaction ID
6. Update commission status to `paid`

### Automated Payout

```typescript
// Schedule job to run on 1st and 15th
import { scheduleJob } from 'node-schedule';

scheduleJob('0 0 1,15 * *', async () => {
  const affiliates = await getAffiliatesReadyForPayout();

  for (const affiliate of affiliates) {
    if (affiliate.pendingCommission >= affiliate.minimumPayout) {
      await processPayment(affiliate);
    }
  }
});
```

### Payment Methods

**PayPal**
```typescript
import paypal from '@paypal/checkout-server-sdk';

async function sendPayPalPayout(email: string, amount: number) {
  const request = new paypal.orders.OrdersCreateRequest();
  // ... PayPal API implementation
}
```

**Stripe Connect**
```typescript
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function sendStripePayout(accountId: string, amount: number) {
  await stripe.transfers.create({
    amount: amount * 100,
    currency: 'usd',
    destination: accountId,
  });
}
```

**Bank Transfer**
- Export CSV with payment details
- Process through your bank
- Upload confirmation
- Update statuses

## Tracking & Attribution

### How Tracking Works

1. **Affiliate shares link:**
   ```
   https://platform.com/ref/AFF12345
   ```

2. **User clicks link:**
   - Cookie set for 30 days
   - Click recorded in database
   - User redirected to target page

3. **User makes purchase:**
   - Cookie checked
   - Affiliate attributed
   - Commission created

### Tracking Code Example

```typescript
// Affiliate link tracking
router.get('/ref/:code', async (req, res) => {
  const { code } = req.params;

  // Track click
  const result = await affiliateService.trackClick(code, {
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    referer: req.headers.referer,
    utmSource: req.query.utm_source,
    utmMedium: req.query.utm_medium,
  });

  if (result) {
    // Set attribution cookie
    res.cookie('affiliate_ref', result.trackingToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });
  }

  // Redirect to homepage or target URL
  res.redirect('/');
});
```

### Attribution in Checkout

```typescript
// When order is created
async function createOrder(orderData: any) {
  const affiliateRef = req.cookies.affiliate_ref;

  if (affiliateRef) {
    // Decode affiliate from cookie
    const affiliateCode = decodeAffiliateToken(affiliateRef);

    // Track conversion
    await affiliateService.trackConversion(affiliateCode, {
      orderId: order.id,
      amount: order.total,
    });
  }
}
```

## Fraud Prevention

### Red Flags

1. **Suspicious Patterns**
   - Multiple conversions same IP
   - High conversion rate (>50%)
   - Short time between click and purchase
   - Same payment method on multiple orders

2. **Click Fraud**
   - Bot traffic detection
   - Unusual click patterns
   - Click-to-conversion ratio too high

3. **Abuse Indicators**
   - Self-referrals
   - Cookie stuffing
   - Incentivized clicks

### Prevention Measures

```typescript
// Implement fraud checks
async function validateConversion(conversion: any) {
  const checks = {
    // Check IP address
    sameIP: await checkIfSameIP(conversion.clickIP, conversion.purchaseIP),

    // Check time between click and purchase
    timeDelay: getTimeDifference(conversion.clickTime, conversion.purchaseTime),

    // Check conversion rate
    conversionRate: await getAffiliateConversionRate(conversion.affiliateId),

    // Check for duplicate orders
    duplicate: await checkDuplicateOrder(conversion.email, conversion.affiliateId),
  };

  // Flag for manual review if suspicious
  if (checks.sameIP && checks.timeDelay < 60) { // 60 seconds
    return { valid: false, reason: 'Suspicious timing and IP match' };
  }

  if (checks.conversionRate > 50) {
    return { valid: false, reason: 'Unusually high conversion rate' };
  }

  return { valid: true };
}
```

### Manual Review Process

1. Flag suspicious conversions
2. Admin reviews details
3. Contact affiliate if needed
4. Approve or reject commission
5. Document decision
6. Take action if fraud confirmed

## Marketing Materials

### Creating Asset Library

Structure:
```
/marketing-materials
  /banners
    - 728x90.png
    - 300x250.png
    - 160x600.png
  /social
    - facebook-post.png
    - instagram-story.png
    - twitter-card.png
  /email
    - template-1.html
    - template-2.html
  /guidelines
    - brand-guide.pdf
    - dos-and-donts.pdf
```

### Providing Templates

**Email Template Example:**
```html
<!DOCTYPE html>
<html>
<head>
  <title>Learn Playwright</title>
</head>
<body>
  <h1>Master Playwright in 30 Days</h1>
  <p>Hi {{firstName}},</p>
  <p>Ready to become a Playwright expert?</p>
  <a href="{{affiliateLink}}">Start Learning Now</a>
</body>
</html>
```

### Banner Generator

Allow affiliates to customize:
- Size
- Color scheme
- Call-to-action text
- Target course

Auto-generate with affiliate code embedded.

## Reporting & Analytics

### Affiliate Dashboard Metrics

**Overview:**
- Total earnings (all time)
- Pending commission
- Last 30 days performance
- Conversion rate trend

**Performance:**
- Clicks by day/week/month
- Conversions by day/week/month
- Revenue by day/week/month
- Top performing links

**Traffic Sources:**
- Direct
- Social media
- Email
- Blog posts
- Other

### Admin Reports

**Performance Report:**
```typescript
GET /api/marketing/affiliates/reports/performance
?startDate=2024-01-01
&endDate=2024-01-31
&affiliateId=optional

Response:
{
  "totalClicks": 5000,
  "totalConversions": 250,
  "totalRevenue": 37500,
  "totalCommission": 7500,
  "averageConversionRate": 5.0,
  "topAffiliates": [...]
}
```

**Payout Report:**
```typescript
GET /api/marketing/affiliates/reports/payouts
?month=2024-01

Response:
{
  "totalPaid": 15000,
  "numberOfPayouts": 45,
  "averagePayoutAmount": 333.33,
  "byMethod": {
    "paypal": 12000,
    "bank_transfer": 3000
  }
}
```

## Leaderboard

### Configuration

```typescript
// Display top affiliates publicly
{
  "showLeaderboard": true,
  "leaderboardMetric": "revenue", // or "conversions", "clicks"
  "leaderboardPeriod": "monthly", // or "all-time", "quarterly"
  "showTopN": 10
}
```

### Gamification

Add badges and achievements:
- First Sale
- 10 Sales Milestone
- $1K Earned
- Top Performer of Month
- Consistent Performer (3 months)

## Best Practices

### 1. Recruitment
- Target niche influencers
- Look for engaged audiences
- Prioritize quality over quantity
- Check content alignment

### 2. Communication
- Monthly newsletter
- Performance tips
- New product updates
- Success stories

### 3. Support
- Dedicated affiliate manager
- Quick response to questions
- Regular check-ins with top performers
- Provide optimization advice

### 4. Incentives
- Bonus for first 5 sales
- Increased rate for top performers
- Contests and competitions
- Exclusive early access

### 5. Compliance
- Clear terms and conditions
- Regular policy updates
- Monitor for violations
- Document all actions

## Troubleshooting

### Common Issues

**Tracking not working:**
- Check cookie settings
- Verify affiliate code
- Test with different browsers
- Check for ad blockers

**Low conversion rate:**
- Review traffic quality
- Check landing page performance
- Analyze user behavior
- Optimize affiliate materials

**Payment issues:**
- Verify payment details
- Check account status
- Review transaction logs
- Contact payment provider

## Support

For affiliate program support:
- Email: affiliates@platform.com
- Documentation: docs.platform.com/affiliates
- Partner Portal: partners.platform.com
