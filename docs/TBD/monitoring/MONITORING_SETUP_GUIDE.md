# Monitoring & Logging System - Setup Guide

## Overview

This guide provides comprehensive instructions for setting up and configuring the monitoring and logging infrastructure for the Playwright & Selenium Learning Platform.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Package Installation](#package-installation)
3. [Environment Configuration](#environment-configuration)
4. [Sentry Setup](#sentry-setup)
5. [Analytics Configuration](#analytics-configuration)
6. [Performance Monitoring](#performance-monitoring)
7. [Backend Logging](#backend-logging)
8. [Health Checks](#health-checks)
9. [Alert Configuration](#alert-configuration)
10. [Dashboard Access](#dashboard-access)
11. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Node.js 18+ and npm
- MongoDB database
- Active Sentry account (for error tracking)
- Email service (optional - for alerts)
- Slack workspace (optional - for alerts)

## Package Installation

### Frontend Packages

```bash
cd frontend
npm install @sentry/react web-vitals uuid
```

### Backend Packages

```bash
cd backend
npm install uuid @types/uuid
```

## Environment Configuration

### Frontend Environment Variables

Create or update `frontend/.env`:

```env
# Sentry Configuration
VITE_SENTRY_DSN=your_sentry_dsn_here
VITE_ENVIRONMENT=development
VITE_APP_VERSION=1.0.0
VITE_DISABLE_SENTRY=false

# Analytics Configuration
VITE_ANALYTICS_ENABLED=true
VITE_ANALYTICS_PROVIDER=custom
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_PLAUSIBLE_DOMAIN=yourdomain.com
VITE_ANALYTICS_API_URL=/api/analytics

# Performance Monitoring
VITE_PERFORMANCE_MONITORING=true
VITE_PERFORMANCE_API_URL=/api/performance
VITE_PERFORMANCE_SAMPLE_RATE=1.0

# Frontend Logging
VITE_LOG_LEVEL=INFO
VITE_REMOTE_LOGGING=true
VITE_LOG_API_URL=/api/logs
```

### Backend Environment Variables

Create or update `backend/.env`:

```env
# Logging Configuration
LOG_LEVEL=info
LOG_TO_FILE=true
LOG_FILE_PATH=./logs/app.log
LOG_REQUEST_BODY=true
LOG_RESPONSE_BODY=false

# Alert Configuration
SLACK_WEBHOOK_URL=your_slack_webhook_url
EMAIL_ALERTS_ENABLED=true
EMAIL_FROM=alerts@yourplatform.com
EMAIL_TO=team@yourplatform.com

# Monitoring
HEALTH_CHECK_INTERVAL=30000
METRICS_RETENTION_HOURS=24
```

## Sentry Setup

### 1. Create Sentry Account

1. Go to [sentry.io](https://sentry.io)
2. Create an account or sign in
3. Create a new project for your platform
4. Copy the DSN from project settings

### 2. Configure Sentry in Frontend

Update `frontend/src/main.tsx`:

```typescript
import { initSentry } from './lib/sentry';
import { initPerformanceMonitoring } from './lib/performance';
import { initAnalytics } from './lib/analytics';
import { initLogger } from './lib/logger';

// Initialize monitoring systems
initSentry();
initPerformanceMonitoring();
initAnalytics();
initLogger();

// Rest of your app initialization
```

### 3. Wrap App with Error Boundary

```typescript
import ErrorBoundary from './components/ErrorBoundary';

root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
```

### 4. Source Maps Configuration

Update `vite.config.ts`:

```typescript
export default defineConfig({
  build: {
    sourcemap: true, // Enable source maps for production debugging
  },
  plugins: [
    react(),
    // Add Sentry plugin for automatic source map upload
    sentryVitePlugin({
      org: 'your-org',
      project: 'your-project',
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
});
```

## Analytics Configuration

### Option 1: Google Analytics

1. Create a GA4 property
2. Copy the Measurement ID (G-XXXXXXXXXX)
3. Set `VITE_ANALYTICS_PROVIDER=google`
4. Set `VITE_GA_MEASUREMENT_ID` in .env

### Option 2: Plausible Analytics

1. Sign up at [plausible.io](https://plausible.io)
2. Add your domain
3. Set `VITE_ANALYTICS_PROVIDER=plausible`
4. Set `VITE_PLAUSIBLE_DOMAIN` in .env

### Option 3: Custom Backend

1. Set `VITE_ANALYTICS_PROVIDER=custom`
2. Implement `/api/analytics` endpoints in backend

### Cookie Consent Integration

```typescript
import { setCookieConsent } from './lib/analytics';

// When user accepts cookies
setCookieConsent(true);

// Track page view
trackPageView({
  path: window.location.pathname,
  title: document.title,
});
```

## Performance Monitoring

### Web Vitals Tracking

The system automatically tracks:
- **CLS** (Cumulative Layout Shift)
- **FID** (First Input Delay)
- **LCP** (Largest Contentful Paint)
- **FCP** (First Contentful Paint)
- **TTFB** (Time to First Byte)

### Custom Performance Marks

```typescript
import { mark, measure } from './lib/performance';

// Mark start of operation
mark('data-fetch-start');

// Perform operation
await fetchData();

// Mark end and measure
mark('data-fetch-end');
const duration = measure('data-fetch', 'data-fetch-start', 'data-fetch-end');
```

### Component Performance Tracking

```typescript
import { withPerformanceTracking } from './lib/performance';

const MyComponent = () => {
  // Component code
};

export default withPerformanceTracking(MyComponent, 'MyComponent');
```

## Backend Logging

### Request Logging Middleware

Update `backend/src/server.ts`:

```typescript
import { requestLogger } from './middleware/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Add request logger early in middleware chain
app.use(requestLogger);

// Your routes
app.use('/api', routes);

// Error handlers at the end
app.use(notFoundHandler);
app.use(errorHandler);
```

### Using the Logger

```typescript
import { info, error, warn, debug, createLogger } from './middleware/logger';

// Simple logging
info('User logged in', { userId: user.id });

// Create logger with context
const logger = createLogger({ service: 'auth' });
logger.info('Password reset requested', { userId: user.id });

// Error logging
try {
  // operation
} catch (err) {
  error('Operation failed', { error: err, userId: user.id });
}
```

## Health Checks

### Configure Health Check Routes

Update `backend/src/server.ts`:

```typescript
import healthRoutes from './routes/health';

app.use('/api/health', healthRoutes);
```

### Available Endpoints

- **GET /api/health** - Basic health check
- **GET /api/health/detailed** - Detailed system status
- **GET /api/health/alerts** - Active alerts
- **GET /api/health/metrics** - Prometheus metrics

### Example Response

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

## Alert Configuration

### Email Alerts

1. Configure email service in `backend/src/services/alertManager.ts`
2. Set up nodemailer transport:

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
```

### Slack Alerts

1. Create a Slack incoming webhook:
   - Go to your Slack workspace
   - Navigate to Apps → Incoming Webhooks
   - Create a new webhook
   - Copy the webhook URL

2. Set environment variable:
   ```env
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
   ```

### Alert Thresholds

Default thresholds (can be customized):

```typescript
// Memory usage
WARNING: 80%
CRITICAL: 90%

// CPU usage
WARNING: 80%
CRITICAL: 90%

// Error rate
WARNING: 5%
CRITICAL: 10%

// Response time (p95)
WARNING: 1000ms
CRITICAL: 2000ms
```

## Dashboard Access

### Admin Monitoring Dashboard

Access the monitoring dashboard at:
```
http://localhost:3000/admin/monitoring
```

Features:
- Real-time system status
- Error rate graphs
- Response time graphs
- Active users count
- Recent errors list

### Performance Dashboard

Access at:
```
http://localhost:3000/admin/performance
```

Features:
- Web Vitals summary
- Page load time distribution
- API response times
- Performance score over time

### Error Dashboard

Access at:
```
http://localhost:3000/admin/errors
```

Features:
- Recent errors list
- Error frequency charts
- Error stack traces
- Link to Sentry

## Troubleshooting

### Sentry Not Capturing Errors

**Issue**: Errors not appearing in Sentry

**Solutions**:
1. Check DSN is correctly set in `.env`
2. Verify `VITE_DISABLE_SENTRY=false`
3. Check network tab for requests to sentry.io
4. Ensure error boundary is wrapping your app

### High Memory Usage

**Issue**: Application using too much memory

**Solutions**:
1. Check for memory leaks in Chrome DevTools
2. Review metrics collector - may be storing too much data
3. Reduce `PERFORMANCE_SAMPLE_RATE`
4. Clear old log files

### Logs Not Being Written

**Issue**: No logs in log files

**Solutions**:
1. Check `LOG_TO_FILE=true` is set
2. Verify log directory exists and is writable
3. Check disk space
4. Review LOG_LEVEL setting

### Analytics Not Tracking

**Issue**: Events not being recorded

**Solutions**:
1. Check Do Not Track browser setting
2. Verify cookie consent has been granted
3. Check browser console for errors
4. Verify analytics provider is correctly configured

### Health Check Failing

**Issue**: /api/health returns 503

**Solutions**:
1. Check database connection
2. Review system resources (CPU, memory)
3. Check error logs
4. Verify all dependencies are healthy

## Next Steps

1. Review [LOGGING_BEST_PRACTICES.md](./LOGGING_BEST_PRACTICES.md)
2. Set up alert runbook: [ALERTING_RUNBOOK.md](./ALERTING_RUNBOOK.md)
3. Configure monitoring dashboard
4. Set up regular health check monitoring
5. Create incident response procedures

## Support

For issues or questions:
- Check the troubleshooting section
- Review error logs
- Contact the development team
- Open a GitHub issue

---

**Last Updated**: February 17, 2024
**Version**: 1.0.0
