# Payment Gateway Integration Setup Guide

Complete setup guide for payment gateway integrations in the Playwright & Selenium Learning Platform.

## Overview

The platform supports multiple payment gateways for course purchases and subscriptions:
- **Stripe** (Global)
- **Razorpay** (India)
- **PayPal** (Global)
- **Square** (US, Canada, UK, Australia)

## Table of Contents

1. [Stripe Setup](#stripe-setup)
2. [Razorpay Setup](#razorpay-setup)
3. [PayPal Setup](#paypal-setup)
4. [Square Setup](#square-setup)
5. [Platform Configuration](#platform-configuration)
6. [Testing](#testing)
7. [Security](#security)
8. [Troubleshooting](#troubleshooting)

## Stripe Setup

### Prerequisites

- Stripe account ([signup](https://dashboard.stripe.com/register))
- Business verification completed
- Bank account connected

### Step 1: Get API Keys

1. Log in to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **API keys**
3. Note the following:
   - **Publishable key** (starts with `pk_`)
   - **Secret key** (starts with `sk_`)

**Test vs Live:**
- Test keys: `pk_test_...` and `sk_test_...`
- Live keys: `pk_live_...` and `sk_live_...`

### Step 2: Create Products

1. Go to **Products**
2. Click **Add product**
3. Create products for:
   - Individual courses
   - Course bundles
   - Subscription plans

**Example:**
```
Name: Playwright Fundamentals Course
Description: Complete guide to Playwright testing
Price: $99.00 USD
```

### Step 3: Create Prices

For subscriptions:
1. Select product
2. Click **Add price**
3. Configure:

```
Price: $29.99
Billing period: Monthly
Billing: Recurring
Trial period: 7 days
```

### Step 4: Configure Webhooks

1. **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://your-domain.com/api/webhooks/stripe`
4. Select events to listen to:

**Essential Events:**
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `charge.refunded`

5. Click **Add endpoint**
6. Note **Signing secret** (starts with `whsec_`)

### Step 5: Platform Configuration

```bash
# Environment Variables
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_API_VERSION=2023-10-16
```

### Stripe Features

#### One-Time Payments

```javascript
POST /api/payments/stripe/payment-intent
{
  "amount": 9900,  // $99.00 in cents
  "currency": "usd",
  "customerId": "cus_...",
  "description": "Playwright Fundamentals Course",
  "metadata": {
    "courseId": "course_123",
    "userId": "user_456"
  }
}
```

#### Subscriptions

```javascript
POST /api/payments/stripe/subscription
{
  "customerId": "cus_...",
  "priceId": "price_...",
  "trialPeriodDays": 7,
  "metadata": {
    "planType": "premium",
    "userId": "user_456"
  }
}
```

#### Invoices

```javascript
POST /api/payments/stripe/invoice
{
  "customerId": "cus_...",
  "items": [
    {
      "priceId": "price_...",
      "quantity": 1
    }
  ],
  "dueDate": "2024-03-31"
}
```

## Razorpay Setup

### Prerequisites

- Razorpay account ([signup](https://dashboard.razorpay.com/signup))
- KYC verification completed
- Indian bank account

### Step 1: Get API Keys

1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Navigate to **Settings** → **API Keys**
3. Click **Generate Key**
4. Note:
   - **Key ID** (starts with `rzp_`)
   - **Key Secret**

### Step 2: Create Payment Links

1. Go to **Payment Links**
2. Click **Create New**
3. Configure:

```
Purpose: Course Purchase
Amount: ₹7,499.00
Currency: INR
Customer notification: Email + SMS
```

### Step 3: Create Plans

For subscriptions:
1. Go to **Subscriptions** → **Plans**
2. Click **Create Plan**

```
Plan Name: Premium Monthly
Billing Cycle: Monthly
Amount: ₹2,499
Currency: INR
Trial Period: 7 days
```

### Step 4: Configure Webhooks

1. **Settings** → **Webhooks**
2. Add webhook URL: `https://your-domain.com/api/webhooks/razorpay`
3. Select events:
   - `payment.authorized`
   - `payment.captured`
   - `payment.failed`
   - `subscription.activated`
   - `subscription.charged`
   - `subscription.cancelled`
   - `refund.created`

4. Note **Webhook Secret**

### Step 5: Platform Configuration

```bash
# Environment Variables
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=your_secret
RAZORPAY_WEBHOOK_SECRET=whsec_...
```

### Razorpay Features

#### Create Order

```javascript
POST /api/payments/razorpay/order
{
  "amount": 749900,  // ₹7,499.00 in paise
  "currency": "INR",
  "receipt": "receipt_123",
  "notes": {
    "courseId": "course_123",
    "userId": "user_456"
  }
}
```

#### Create Subscription

```javascript
POST /api/payments/razorpay/subscription
{
  "planId": "plan_...",
  "customerId": "cust_...",
  "totalCount": 12,  // 12 months
  "quantity": 1
}
```

#### Payment Verification

```javascript
// Client-side collects payment details
// Server verifies signature
POST /api/payments/razorpay/verify
{
  "orderId": "order_...",
  "paymentId": "pay_...",
  "signature": "..."
}
```

## PayPal Setup

### Prerequisites

- PayPal Business account
- Email verified
- Bank account linked

### Step 1: Create App

1. Go to [PayPal Developer Portal](https://developer.paypal.com)
2. **Dashboard** → **My Apps & Credentials**
3. Click **Create App**

```
App Name: Playwright Learning Platform
App Type: Merchant
```

4. Note:
   - **Client ID**
   - **Secret**

### Step 2: Configure Webhooks

1. In app settings, scroll to **Webhooks**
2. Add webhook URL: `https://your-domain.com/api/webhooks/paypal`
3. Select events:
   - `PAYMENT.SALE.COMPLETED`
   - `PAYMENT.SALE.REFUNDED`
   - `BILLING.SUBSCRIPTION.CREATED`
   - `BILLING.SUBSCRIPTION.CANCELLED`

### Platform Configuration

```bash
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_secret
PAYPAL_MODE=live  # or 'sandbox' for testing
```

## Square Setup

### Prerequisites

- Square account
- Business verification completed

### Step 1: Create Application

1. Go to [Square Developer Portal](https://developer.squareup.com)
2. **Applications** → **New Application**

```
Application Name: Playwright Learning Platform
Description: E-learning platform integration
```

### Step 2: Get Credentials

1. Open application
2. Go to **Credentials**
3. Note:
   - **Application ID**
   - **Access Token**

### Step 3: Configure Webhooks

1. Go to **Webhooks**
2. Add endpoint: `https://your-domain.com/api/webhooks/square`
3. Subscribe to events:
   - `payment.created`
   - `payment.updated`
   - `refund.created`

### Platform Configuration

```bash
SQUARE_ACCESS_TOKEN=your_access_token
SQUARE_LOCATION_ID=your_location_id
SQUARE_ENVIRONMENT=production  # or 'sandbox'
```

## Platform Configuration

### Admin Panel Setup

1. Navigate to **Admin** → **Integrations** → **Payments**
2. Select payment gateway
3. Click **Configure**
4. Enter credentials
5. Click **Test Connection**
6. Enable gateway

### Payment Gateway Selection

Configure default and available gateways:

```json
{
  "paymentGateways": {
    "default": "stripe",
    "available": ["stripe", "razorpay", "paypal"],
    "currencyMapping": {
      "USD": ["stripe", "paypal"],
      "INR": ["razorpay", "stripe"],
      "EUR": ["stripe", "paypal"]
    }
  }
}
```

### Checkout Configuration

```json
{
  "checkout": {
    "allowGuest": false,
    "requiresBillingAddress": true,
    "acceptedPaymentMethods": ["card", "upi", "netbanking"],
    "enableSaveCard": true,
    "autoCapture": true
  }
}
```

## Payment Flow

### One-Time Purchase Flow

1. **User selects course** → View course page
2. **Click "Enroll Now"** → Redirect to checkout
3. **Select payment method** → Stripe/Razorpay/PayPal
4. **Enter payment details** → Card/UPI/etc.
5. **Process payment** → Gateway processes
6. **Webhook received** → Platform confirms payment
7. **Course access granted** → User enrolled

### Subscription Flow

1. **User selects plan** → Choose monthly/annual
2. **Click "Subscribe"** → Redirect to checkout
3. **Enter payment details** → Setup payment method
4. **Create subscription** → First charge processed
5. **Webhook received** → Platform activates subscription
6. **Recurring billing** → Automatic monthly charges
7. **Access maintained** → While subscription active

## Testing

### Test Mode

All gateways provide test environments:

**Stripe Test Cards:**
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Requires authentication: 4000 0025 0000 3155
```

**Razorpay Test Cards:**
```
Success: 4111 1111 1111 1111
Failure: 4111 1111 1111 1234
```

### Test Scenarios

1. **Successful Payment**
   - Process payment with test card
   - Verify course access granted
   - Check transaction in admin panel

2. **Failed Payment**
   - Use decline test card
   - Verify error handling
   - Check user receives notification

3. **Refund Processing**
   - Issue refund for test payment
   - Verify refund processed
   - Check course access revoked

4. **Subscription Creation**
   - Create test subscription
   - Verify recurring setup
   - Check subscription status

5. **Webhook Handling**
   - Trigger test webhook
   - Verify platform processes correctly
   - Check logs for errors

## Security

### PCI Compliance

**Never store:**
- Full credit card numbers
- CVV/CVC codes
- Card expiration dates

**Use:**
- Tokenization
- Hosted payment pages
- PCI-compliant payment gateways

### Best Practices

1. **Use HTTPS**: All payment pages must use SSL
2. **Validate Webhooks**: Always verify webhook signatures
3. **Sanitize Input**: Validate all user input
4. **Rate Limiting**: Prevent abuse
5. **Audit Logging**: Log all transactions
6. **Fraud Detection**: Implement fraud checks
7. **Secure Storage**: Encrypt sensitive data
8. **Regular Updates**: Keep dependencies updated

### Webhook Security

**Stripe Signature Verification:**
```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const sig = req.headers['stripe-signature'];

try {
  const event = stripe.webhooks.constructEvent(
    req.body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET
  );
  // Process event
} catch (err) {
  return res.status(400).send(`Webhook Error: ${err.message}`);
}
```

**Razorpay Signature Verification:**
```javascript
const crypto = require('crypto');
const expectedSignature = crypto
  .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
  .update(JSON.stringify(req.body))
  .digest('hex');

if (expectedSignature !== req.headers['x-razorpay-signature']) {
  return res.status(400).send('Invalid signature');
}
```

## Refund Policy

### Automated Refunds

Configure refund rules:

```json
{
  "refundPolicy": {
    "allowRefunds": true,
    "refundWindow": 30,  // days
    "autoApprove": {
      "enabled": true,
      "maxAmount": 100,  // USD
      "withinDays": 7
    }
  }
}
```

### Manual Refund Process

1. User requests refund
2. Admin reviews request
3. Admin approves/denies
4. If approved, refund processed via gateway
5. Course access revoked
6. User notified

## Reporting

### Transaction Reports

Available reports:
- Daily sales summary
- Monthly revenue report
- Subscription metrics
- Refund analysis
- Failed payment report

### Export Options

Export formats:
- CSV
- Excel
- PDF
- JSON

## Troubleshooting

### Common Issues

**Payment Declined:**
- Insufficient funds
- Invalid card details
- Card expired
- Blocked by fraud detection

**Webhook Not Received:**
- Verify endpoint URL
- Check firewall settings
- Review webhook logs
- Test with webhook simulator

**Subscription Not Created:**
- Check payment method valid
- Verify plan exists
- Review error logs
- Test with test mode

### Error Codes

**Stripe:**
- `card_declined`: Card was declined
- `insufficient_funds`: Not enough balance
- `invalid_expiry`: Card expired
- `rate_limit`: Too many requests

**Razorpay:**
- `BAD_REQUEST_ERROR`: Invalid parameters
- `GATEWAY_ERROR`: Payment gateway issue
- `SERVER_ERROR`: Internal server error

## Support Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Razorpay Documentation](https://razorpay.com/docs)
- [PayPal Documentation](https://developer.paypal.com/docs)
- [Square Documentation](https://developer.squareup.com/docs)
- Platform Support: support@example.com

## Appendix

### Currency Support

| Gateway | Currencies |
|---------|-----------|
| Stripe | 135+ currencies |
| Razorpay | INR, USD |
| PayPal | 25+ currencies |
| Square | USD, CAD, GBP, AUD, JPY |

### Fee Structure

| Gateway | Transaction Fee |
|---------|----------------|
| Stripe | 2.9% + $0.30 |
| Razorpay | 2% (India) |
| PayPal | 2.9% + $0.30 |
| Square | 2.6% + $0.10 |

### Settlement Time

| Gateway | Settlement |
|---------|-----------|
| Stripe | 2-7 business days |
| Razorpay | T+2 days |
| PayPal | 1-3 business days |
| Square | 1-2 business days |
