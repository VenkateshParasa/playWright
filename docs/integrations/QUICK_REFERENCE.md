# Enterprise Integrations Quick Reference

## Quick Setup Guide

### 1. Install Dependencies

```bash
npm install jsforce @hubspot/api-client axios stripe bullmq ioredis @microsoft/microsoft-graph-client googleapis
```

### 2. Configure Environment

```bash
cp .env.example .env
# Add your credentials to .env
```

### 3. Start Redis (Required for Sync Service)

```bash
# Using Docker
docker run -d -p 6379:6379 redis:latest

# Or install locally
brew install redis
redis-server
```

### 4. Start Application

```bash
npm run dev
```

## Common Tasks

### Configure Integration

**Admin Panel:**
1. Go to `/admin/integrations`
2. Select integration
3. Click "Configure"
4. Enter credentials
5. Test connection
6. Enable

**API:**
```bash
curl -X POST https://your-domain.com/api/integrations/salesforce/configure \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "clientId": "...",
    "clientSecret": "...",
    "username": "...",
    "password": "...",
    "securityToken": "..."
  }'
```

### Trigger Sync

```bash
curl -X POST https://your-domain.com/api/integrations/workday/sync \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "action": "sync_users",
    "limit": 100
  }'
```

### Check Sync Status

```bash
curl https://your-domain.com/api/integrations/jobs/JOB_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Integration Endpoints

### Salesforce
- **Auth URL**: https://login.salesforce.com
- **API Version**: v58.0
- **Docs**: https://developer.salesforce.com

### HubSpot
- **API URL**: https://api.hubapi.com
- **Docs**: https://developers.hubspot.com

### Workday
- **Base URL**: https://wd2-impl-services1.workday.com/ccx/service/[tenant]
- **API Version**: v38.0
- **Docs**: https://community.workday.com

### Microsoft 365
- **Auth**: https://login.microsoftonline.com
- **Graph API**: https://graph.microsoft.com/v1.0
- **Docs**: https://docs.microsoft.com/graph

### Google Workspace
- **OAuth**: https://accounts.google.com/o/oauth2/auth
- **APIs**: https://www.googleapis.com
- **Docs**: https://developers.google.com/workspace

### Stripe
- **API**: https://api.stripe.com/v1
- **Docs**: https://stripe.com/docs/api

### Razorpay
- **API**: https://api.razorpay.com/v1
- **Docs**: https://razorpay.com/docs/api

## Quick Troubleshooting

### Authentication Failed
```bash
# Check credentials
echo $SALESFORCE_USERNAME
echo $SALESFORCE_CLIENT_ID

# Test connection
curl -X POST /api/integrations/salesforce/test
```

### Sync Not Working
```bash
# Check queue status
curl /api/integrations/queue/metrics

# Check Redis connection
redis-cli ping

# View logs
tail -f logs/integrations.log
```

### Webhook Not Received
```bash
# Test webhook endpoint
curl -X POST https://your-domain.com/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: test" \
  -d '{"type": "test"}'
```

## Environment Variables Template

```bash
# Redis (Required)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Salesforce
SALESFORCE_LOGIN_URL=https://login.salesforce.com
SALESFORCE_CLIENT_ID=
SALESFORCE_CLIENT_SECRET=
SALESFORCE_USERNAME=
SALESFORCE_PASSWORD=
SALESFORCE_SECURITY_TOKEN=

# HubSpot
HUBSPOT_API_KEY=
HUBSPOT_CLIENT_ID=
HUBSPOT_CLIENT_SECRET=

# Zoho
ZOHO_CLIENT_ID=
ZOHO_CLIENT_SECRET=
ZOHO_ACCOUNTS_URL=https://accounts.zoho.com
ZOHO_API_DOMAIN=https://www.zohoapis.com

# Workday
WORKDAY_TENANT_NAME=
WORKDAY_USERNAME=
WORKDAY_PASSWORD=
WORKDAY_API_VERSION=v38.0

# SAP SuccessFactors
SAP_API_URL=
SAP_COMPANY_ID=
SAP_USERNAME=
SAP_PASSWORD=

# Microsoft 365
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
MICROSOFT_TENANT_ID=
MICROSOFT_REDIRECT_URI=

# Google Workspace
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

# Stripe
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
```

## Code Examples

### Using Salesforce Client

```typescript
import { SalesforceClient } from './integrations/salesforce';

const client = new SalesforceClient({
  loginUrl: process.env.SALESFORCE_LOGIN_URL,
  clientId: process.env.SALESFORCE_CLIENT_ID,
  clientSecret: process.env.SALESFORCE_CLIENT_SECRET,
  redirectUri: process.env.SALESFORCE_REDIRECT_URI,
});

// Authenticate
await client.authenticate(
  process.env.SALESFORCE_USERNAME,
  process.env.SALESFORCE_PASSWORD,
  process.env.SALESFORCE_SECURITY_TOKEN
);

// Create lead
const leadId = await client.createLead({
  FirstName: 'John',
  LastName: 'Doe',
  Email: 'john@example.com',
  Company: 'Example Corp',
  Status: 'Open - Not Contacted',
  LeadSource: 'Website',
});

console.log('Lead created:', leadId);
```

### Using Stripe Client

```typescript
import { StripeClient } from './integrations/payments';

const client = new StripeClient({
  apiKey: process.env.STRIPE_SECRET_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
});

// Create customer
const customerId = await client.createCustomer({
  email: 'customer@example.com',
  name: 'John Doe',
});

// Create subscription
const subscriptionId = await client.createSubscription({
  customerId,
  priceId: 'price_...',
  trialPeriodDays: 7,
});

console.log('Subscription created:', subscriptionId);
```

### Using Sync Service

```typescript
import { SyncService } from './services/sync/syncService';

const syncService = new SyncService({
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
  },
  concurrency: 5,
  retryAttempts: 3,
});

// Add sync job
const jobId = await syncService.addSyncJob({
  id: `workday-sync-${Date.now()}`,
  type: 'workday',
  action: 'sync_users',
  data: { limit: 100, offset: 0 },
});

// Listen for completion
syncService.on('job_completed', (result) => {
  console.log('Job completed:', result);
});
```

## API Response Examples

### List Integrations
```json
{
  "success": true,
  "data": [
    {
      "id": "salesforce",
      "name": "Salesforce",
      "enabled": true,
      "configured": true,
      "type": "crm"
    }
  ]
}
```

### Sync Job Status
```json
{
  "success": true,
  "data": {
    "id": "workday-sync-123",
    "state": "completed",
    "progress": 100,
    "returnValue": {
      "recordsProcessed": 100,
      "recordsFailed": 0,
      "errors": []
    }
  }
}
```

### Queue Metrics
```json
{
  "success": true,
  "data": {
    "waiting": 5,
    "active": 2,
    "completed": 1234,
    "failed": 12,
    "total": 1253
  }
}
```

## Admin Panel Navigation

```
/admin/integrations                    # Main integrations page
/admin/integrations/salesforce         # Salesforce details
/admin/integrations/salesforce/config  # Configuration
/admin/integrations/salesforce/logs    # Integration logs
/admin/integrations/jobs               # All sync jobs
/admin/integrations/jobs/:id           # Job details
```

## Testing Checklist

- [ ] Configure integration
- [ ] Test connection
- [ ] Enable integration
- [ ] Trigger manual sync
- [ ] Verify data synced
- [ ] Check logs for errors
- [ ] Test webhook (if applicable)
- [ ] Monitor queue metrics
- [ ] Test error scenarios
- [ ] Verify retry logic

## Support Contacts

- **Technical Issues**: support@example.com
- **Integration Setup**: integrations@example.com
- **Documentation**: https://docs.example.com/integrations
- **Status Page**: https://status.example.com

## Additional Resources

- [Main Documentation](../docs/ENTERPRISE_INTEGRATIONS.md)
- [Salesforce Setup](../docs/integrations/SALESFORCE_SETUP.md)
- [Workday Setup](../docs/integrations/WORKDAY_SETUP.md)
- [Microsoft 365 Setup](../docs/integrations/MICROSOFT365_SETUP.md)
- [Payment Gateways](../docs/integrations/PAYMENT_GATEWAY_SETUP.md)
- [Implementation Summary](../ENTERPRISE_INTEGRATIONS_SUMMARY.md)
