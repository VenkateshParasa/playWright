# Monitoring & Logging - Quick Reference

Quick reference guide for using the monitoring and logging system.

## Table of Contents

1. [Frontend Usage](#frontend-usage)
2. [Backend Usage](#backend-usage)
3. [Common Patterns](#common-patterns)
4. [Environment Variables](#environment-variables)
5. [API Endpoints](#api-endpoints)

---

## Frontend Usage

### Error Tracking

```typescript
import { captureException, captureMessage, addBreadcrumb } from '@/lib/sentry';

// Capture exception
try {
  await riskyOperation();
} catch (error) {
  captureException(error, { context: 'additional-info' });
}

// Capture message
captureMessage('Something important happened', 'info');

// Add breadcrumb
addBreadcrumb('User clicked button', 'user', 'info', { buttonId: 'submit' });
```

### Analytics

```typescript
import { trackPageView, trackEvent, trackUserAction } from '@/lib/analytics';

// Track page view
trackPageView({
  path: window.location.pathname,
  title: document.title,
});

// Track event
trackEvent({
  name: 'form_submit',
  properties: { formId: 'contact-form' },
});

// Track user action
trackUserAction('click', 'submit-button', { page: 'checkout' });
```

### Performance Monitoring

```typescript
import { mark, measure, trackAPICall } from '@/lib/performance';

// Custom timing
mark('operation-start');
await performOperation();
mark('operation-end');
measure('operation', 'operation-start', 'operation-end');

// Track API call
const start = Date.now();
const response = await fetch('/api/data');
trackAPICall('/api/data', 'GET', Date.now() - start, response.status);
```

### Logging

```typescript
import { info, error, warn, debug } from '@/lib/logger';

// Log info
info('User action completed', { userId, action: 'purchase' });

// Log error
error('Payment failed', { orderId, error: err.message });

// Log with timer
import { timer } from '@/lib/logger';
const t = timer('data-processing');
await processData();
t.end();
```

---

## Backend Usage

### Logging

```typescript
import { info, error, warn, debug, logError } from './middleware/logger';

// Simple logging
info('User registered', { userId: user.id });

// Error logging with stack trace
try {
  await saveToDatabase(data);
} catch (err) {
  logError(err, { operation: 'save', data });
}

// Create contextual logger
import { createLogger } from './middleware/logger';
const logger = createLogger({ service: 'payment' });
logger.info('Processing payment', { orderId });
```

### Error Handling

```typescript
import { asyncHandler, ValidationError, NotFoundError } from './middleware/errorHandler';

// Wrap async routes
router.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  res.json({ success: true, data: user });
}));

// Throw specific errors
if (!req.body.email) {
  throw new ValidationError('Email is required');
}
```

### Metrics

```typescript
import { recordRequest } from '../utils/metricsCollector';

// Record request (done automatically by middleware)
recordRequest('/api/users', responseTime, statusCode);

// Get metrics
import { getRequestStats, getEndpointStats } from '../utils/metricsCollector';
const stats = getRequestStats();
const endpoints = getEndpointStats();
```

### Alerts

```typescript
import { sendAlert, sendAlertWithCooldown } from '../services/alertManager';

// Send immediate alert
await sendAlert({
  severity: 'critical',
  title: 'Database connection lost',
  message: 'Unable to connect to primary database',
  metadata: { host: dbHost, error: err.message },
});

// Send alert with cooldown
await sendAlertWithCooldown(
  'high-memory-usage',
  {
    severity: 'warning',
    title: 'High memory usage',
    message: `Memory usage at ${memoryUsage}%`,
  },
  30 // 30 minute cooldown
);
```

---

## Common Patterns

### Pattern 1: Track User Journey

```typescript
// Frontend
import { trackPageView, trackEvent } from '@/lib/analytics';
import { addBreadcrumb } from '@/lib/sentry';

// Page view
trackPageView({ path: '/checkout', title: 'Checkout' });
addBreadcrumb('Navigated to checkout', 'navigation', 'info');

// Form submission
trackEvent({ name: 'checkout_started', properties: { items: 3 } });

// Error
try {
  await submitOrder();
  trackEvent({ name: 'order_completed' });
} catch (err) {
  captureException(err);
  trackEvent({ name: 'order_failed', properties: { error: err.message } });
}
```

### Pattern 2: Performance Tracking

```typescript
// Frontend component
import { withPerformanceTracking } from '@/lib/performance';

const HeavyComponent = () => {
  // Component code
};

export default withPerformanceTracking(HeavyComponent);

// Backend route
import { timer } from './middleware/logger';

router.get('/api/data', async (req, res) => {
  const t = timer('fetch-data');
  const data = await fetchData();
  const duration = t.end();

  if (duration > 1000) {
    warn('Slow query detected', { duration, endpoint: '/api/data' });
  }

  res.json({ data });
});
```

### Pattern 3: Error Handling with Context

```typescript
// Backend
import { logError, createLogger } from './middleware/logger';
import { AppError } from './middleware/errorHandler';

const logger = createLogger({ service: 'orders' });

async function processOrder(orderId) {
  const context = { orderId, userId: req.user.id };

  try {
    logger.info('Processing order', context);

    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    await processPayment(order);
    logger.info('Order processed successfully', context);

    return order;
  } catch (err) {
    logError(err, context);
    throw err;
  }
}
```

### Pattern 4: Monitoring Critical Operations

```typescript
// Backend
import { info, error } from './middleware/logger';
import { sendAlert } from '../services/alertManager';

async function criticalOperation() {
  info('Starting critical operation', { operation: 'data-migration' });

  try {
    const result = await performMigration();

    info('Critical operation completed', {
      operation: 'data-migration',
      recordsProcessed: result.count,
      duration: result.duration,
    });

    return result;
  } catch (err) {
    error('Critical operation failed', {
      operation: 'data-migration',
      error: err.message,
      stack: err.stack,
    });

    // Send immediate alert
    await sendAlert({
      severity: 'critical',
      title: 'Data migration failed',
      message: err.message,
      metadata: { operation: 'data-migration' },
    });

    throw err;
  }
}
```

---

## Environment Variables

### Frontend (.env)

```env
# Sentry
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
VITE_ENVIRONMENT=production
VITE_APP_VERSION=1.0.0

# Analytics
VITE_ANALYTICS_ENABLED=true
VITE_ANALYTICS_PROVIDER=custom
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Performance
VITE_PERFORMANCE_MONITORING=true
VITE_PERFORMANCE_SAMPLE_RATE=1.0

# Logging
VITE_LOG_LEVEL=INFO
VITE_REMOTE_LOGGING=true
```

### Backend (.env)

```env
# Logging
LOG_LEVEL=info
LOG_TO_FILE=true
LOG_FILE_PATH=./logs/app.log

# Alerts
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx
EMAIL_FROM=alerts@platform.com
EMAIL_TO=team@platform.com

# Monitoring
HEALTH_CHECK_INTERVAL=30000
```

---

## API Endpoints

### Health Checks

```bash
# Basic health check
GET /api/health

# Detailed health check
GET /api/health/detailed

# Current alerts
GET /api/health/alerts

# Prometheus metrics
GET /api/health/metrics
```

### Example Responses

**Basic Health**:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-02-17T10:00:00.000Z",
    "uptime": 3600,
    "version": "1.0.0",
    "environment": "production"
  }
}
```

**Detailed Health**:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "database": {
      "status": "connected",
      "responseTime": 15
    },
    "memory": {
      "used": 536870912,
      "total": 2147483648,
      "percentage": 25
    },
    "cpu": {
      "usage": 45,
      "cores": 4
    },
    "requests": {
      "total": 10000,
      "perMinute": 150,
      "p95": 250
    },
    "errors": {
      "total": 5,
      "rate": 0.05
    }
  }
}
```

---

## Quick Commands

```bash
# Install dependencies
cd frontend && npm install @sentry/react web-vitals
cd backend && npm install uuid

# Start services
npm run dev

# Check health
curl http://localhost:3000/api/health

# View logs
tail -f backend/logs/app.log

# Test error tracking
curl -X POST http://localhost:3000/api/test-error
```

---

## Troubleshooting

### Issue: Logs not appearing

```typescript
// Check log level
import { debug } from './lib/logger';
debug('This will only show if LOG_LEVEL=debug');

// Force log level
process.env.LOG_LEVEL = 'debug';
```

### Issue: Sentry not capturing errors

```typescript
// Verify Sentry is initialized
import { captureMessage } from '@/lib/sentry';
captureMessage('Test message', 'info');

// Check DSN is set
console.log(import.meta.env.VITE_SENTRY_DSN);
```

### Issue: Analytics not tracking

```typescript
// Check if enabled
import { setCookieConsent } from '@/lib/analytics';
setCookieConsent(true);

// Verify events
trackEvent({ name: 'test_event' });
```

---

**Last Updated**: February 17, 2024
**Version**: 1.0.0
