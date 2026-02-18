# Monitoring Setup Guide

## Table of Contents

1. [Overview](#overview)
2. [Error Tracking (Sentry)](#error-tracking-sentry)
3. [Uptime Monitoring](#uptime-monitoring)
4. [Performance Monitoring](#performance-monitoring)
5. [Log Aggregation](#log-aggregation)
6. [Metrics & Dashboards](#metrics--dashboards)
7. [Alerting](#alerting)
8. [Status Page](#status-page)

## Overview

Comprehensive monitoring setup for the Playwright & Selenium Learning Platform covering errors, uptime, performance, and logs.

### Monitoring Stack

| Component | Service | Purpose |
|-----------|---------|---------|
| **Error Tracking** | Sentry | Application errors and exceptions |
| **Uptime Monitoring** | UptimeRobot / Pingdom | Service availability |
| **Performance** | Vercel Analytics, New Relic | Response times, Core Web Vitals |
| **Logs** | Railway/Render, CloudWatch | Application and system logs |
| **Metrics** | Prometheus + Grafana | Custom metrics and dashboards |
| **Status Page** | Statuspage.io | Public status communication |

## Error Tracking (Sentry)

### Setup

Already implemented in the codebase. Just configure:

#### 1. Create Sentry Project

1. Go to https://sentry.io
2. Click "Create Project"
3. Platform: **Node.js** (for backend)
4. Project name: `playwright-learning-backend`
5. Click "Create Project"
6. Copy DSN

Repeat for frontend:
- Platform: **React**
- Project name: `playwright-learning-frontend`

#### 2. Configure Environment Variables

Backend:
```bash
SENTRY_DSN=https://xxxxx@oxxxxx.ingest.sentry.io/xxxxx
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_DEBUG=false
```

Frontend (Vercel):
```bash
VITE_SENTRY_DSN=https://xxxxx@oxxxxx.ingest.sentry.io/xxxxx
VITE_SENTRY_ENVIRONMENT=production
VITE_SENTRY_TRACES_SAMPLE_RATE=0.1
```

#### 3. Verify Integration

```bash
# Backend - trigger test error
curl -X POST https://api.playwright-learning.com/api/test/error

# Frontend - open browser console and run:
throw new Error("Test Sentry Integration");

# Check Sentry dashboard for errors
```

### Configure Alerts

#### High Error Rate Alert

1. Go to Sentry > Alerts > Create Alert
2. **Alert Name**: "High Error Rate"
3. **Conditions**:
   - When error count is > 10
   - In 1 hour
   - For all errors
4. **Actions**:
   - Send email to: ops@playwright-learning.com
   - Send Slack notification to: #alerts
5. Save

#### Critical Error Alert

1. Create Alert
2. **Alert Name**: "Critical Error"
3. **Conditions**:
   - When error level is fatal
   - For any event
4. **Actions**:
   - Send email immediately
   - Send Slack notification
   - Create PagerDuty incident
5. Save

#### Performance Degradation Alert

1. Create Alert
2. **Alert Name**: "Slow Transaction"
3. **Conditions**:
   - When transaction duration is > 3000ms
   - For 50% of events
   - In 10 minutes
4. **Actions**:
   - Send Slack notification
5. Save

### Error Grouping Rules

Configure in Sentry > Settings > Error Grouping:

```javascript
// Group similar errors together
{
  "fingerprint": ["{{ default }}", "{{ error.type }}"]
}

// Ignore known issues
{
  "ignoreErrors": [
    "ResizeObserver loop limit exceeded",
    "Non-Error promise rejection captured",
    "Network request failed"
  ]
}
```

### Source Maps

For better error tracking with source maps:

#### Frontend (Vite)

Already configured in `vite.config.ts`:
```typescript
build: {
  sourcemap: true
}
```

Upload to Sentry:
```bash
# Install Sentry CLI
npm install -g @sentry/cli

# Configure
sentry-cli login

# Upload source maps
cd frontend
npm run build
sentry-cli releases files <release> upload-sourcemaps ./dist
```

#### Backend (TypeScript)

Enable source maps in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "sourceMap": true
  }
}
```

## Uptime Monitoring

### UptimeRobot Setup

#### 1. Create Account

Go to https://uptimerobot.com and create a free account (50 monitors).

#### 2. Add Monitors

**Frontend Monitor**:
- Monitor Type: **HTTPS**
- Friendly Name: `Playwright Learning - Frontend`
- URL: `https://playwright-learning.com`
- Monitoring Interval: **5 minutes**
- Monitor Timeout: **30 seconds**

**Backend API Monitor**:
- Monitor Type: **HTTPS**
- Friendly Name: `Playwright Learning - API`
- URL: `https://api.playwright-learning.com/health`
- Monitoring Interval: **5 minutes**
- Monitor Timeout: **30 seconds**
- Advanced:
  - HTTP Method: GET
  - Expected Status Code: 200

**Database Monitor** (via API):
- Monitor Type: **HTTPS**
- Friendly Name: `Playwright Learning - Database`
- URL: `https://api.playwright-learning.com/health/database`
- Monitoring Interval: **10 minutes**

#### 3. Configure Alerts

1. Go to My Settings > Alert Contacts
2. Add Email Alert:
   - Type: **Email**
   - Email: ops@playwright-learning.com
   - Name: Operations Team
3. Add Webhook Alert (Slack):
   - Type: **Webhook**
   - URL: `https://hooks.slack.com/services/...`
   - Name: Slack #alerts channel
   - Custom POST value:
   ```json
   {
     "text": "*monitorFriendlyName* is *alertTypeFriendlyName*",
     "attachments": [{
       "color": "danger",
       "fields": [{
         "title": "Monitor",
         "value": "*monitorURL*"
       }]
     }]
   }
   ```

#### 4. Create Status Page (Optional)

1. Go to Public Status Pages
2. Click "Add Public Status Page"
3. Select monitors to display
4. Customize:
   - Custom domain: status.playwright-learning.com
   - Logo and branding
5. Share URL with team

### Alternative: Pingdom

If using Pingdom instead:

1. Go to https://www.pingdom.com
2. Add Uptime Check:
   - Name: `Playwright Learning`
   - URL: `https://playwright-learning.com`
   - Check interval: 1 minute (paid plan)
   - Alert when down for: 2 minutes
3. Configure integrations:
   - Email
   - Slack
   - PagerDuty

## Performance Monitoring

### Vercel Analytics (Frontend)

Already enabled if deployed on Vercel.

#### View Analytics

1. Go to Vercel Dashboard
2. Select project
3. Click "Analytics" tab
4. View:
   - Page views
   - Top pages
   - Top referrers
   - Devices and browsers
   - Core Web Vitals (CWV)

#### Configure Alerts

1. Go to Settings > Notifications
2. Enable alerts for:
   - Build failures
   - Deployment errors
   - Budget overruns

### Web Vitals Monitoring

Frontend already includes web vitals reporting:

```typescript
// frontend/src/utils/performance.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to your analytics service
  if (window.gtag) {
    window.gtag('event', metric.name, {
      value: Math.round(metric.value),
      metric_id: metric.id,
      metric_value: metric.value,
      metric_delta: metric.delta,
    });
  }
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### Backend Performance Monitoring

#### New Relic (Optional)

1. Sign up at https://newrelic.com
2. Create application
3. Install agent:
```bash
cd backend
npm install newrelic
```

4. Add to start of `server.ts`:
```typescript
import 'newrelic';
```

5. Add environment variables:
```bash
NEW_RELIC_LICENSE_KEY=xxxxx
NEW_RELIC_APP_NAME=Playwright Learning Backend
NEW_RELIC_LOG_LEVEL=info
```

#### Custom Metrics Endpoint

Backend includes custom metrics endpoint:

```bash
# View metrics (Prometheus format)
curl https://api.playwright-learning.com/metrics

# Example output:
# http_requests_total{method="GET",route="/api/lessons",status="200"} 1234
# http_request_duration_ms{method="GET",route="/api/lessons"} 45.2
# db_queries_total{collection="lessons"} 567
```

## Log Aggregation

### Railway Logs

View logs in real-time:

```bash
# Via CLI
railway logs --environment production --tail

# Filter by level
railway logs --environment production | grep ERROR

# Save to file
railway logs --environment production > logs_$(date +%Y%m%d).log
```

### Render Logs

View in dashboard or via CLI:

```bash
render logs playwright-learning-backend --tail

# Filter
render logs playwright-learning-backend | grep ERROR
```

### CloudWatch Logs (If using AWS)

Set up log shipping:

```bash
# Install CloudWatch agent
npm install winston-cloudwatch

# Configure in backend
import winston from 'winston';
import CloudWatchTransport from 'winston-cloudwatch';

const logger = winston.createLogger({
  transports: [
    new CloudWatchTransport({
      logGroupName: '/aws/playwright-learning',
      logStreamName: 'backend',
      awsRegion: process.env.AWS_REGION,
      awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
      awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY,
    })
  ]
});
```

### Log Retention

Configure in platform settings:

- **Railway**: 30 days (default)
- **Render**: 7 days (free), 30 days (paid)
- **CloudWatch**: Custom (configure retention policy)

## Metrics & Dashboards

### Grafana Dashboard (Optional)

If you want custom dashboards:

#### 1. Set up Prometheus

```yaml
# docker-compose.yml
version: '3'
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

#### 2. Configure Prometheus

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'playwright-learning-backend'
    static_configs:
      - targets: ['api.playwright-learning.com:9090']
    metrics_path: '/metrics'
```

#### 3. Create Grafana Dashboard

1. Go to http://localhost:3000
2. Add Prometheus data source
3. Create dashboard:
   - **API Response Time**: Average response time by endpoint
   - **Error Rate**: Errors per minute
   - **Request Rate**: Requests per second
   - **Database Connections**: Active connections
   - **Cache Hit Rate**: Redis cache efficiency

### Platform Dashboards

#### Railway Dashboard

Built-in metrics:
- CPU usage
- Memory usage
- Network I/O
- Disk usage
- Request count
- Response times

Access: https://railway.app/project/[id]/metrics

#### Vercel Dashboard

Built-in analytics:
- Bandwidth usage
- Function invocations
- Build times
- Deployment frequency
- Error rates

## Alerting

### Alert Rules Configuration

Create `config/alerts.yaml`:

```yaml
alerts:
  # Critical - Immediate response required
  - name: service_down
    condition: uptime < 99%
    duration: 5m
    severity: critical
    channels:
      - email: ops@playwright-learning.com
      - slack: #alerts
      - pagerduty: true

  - name: high_error_rate
    condition: error_rate > 5%
    duration: 10m
    severity: critical
    channels:
      - email: ops@playwright-learning.com
      - slack: #alerts

  # Warning - Attention needed
  - name: slow_response_time
    condition: avg_response_time > 1000ms
    duration: 15m
    severity: warning
    channels:
      - slack: #alerts

  - name: high_cpu_usage
    condition: cpu > 80%
    duration: 10m
    severity: warning
    channels:
      - slack: #alerts

  - name: database_connections_high
    condition: db_connections > 80
    duration: 5m
    severity: warning
    channels:
      - slack: #alerts

  # Info - Good to know
  - name: deployment_success
    condition: deployment_status == success
    severity: info
    channels:
      - slack: #deployments

  - name: ssl_expiring_soon
    condition: ssl_days_remaining < 30
    severity: info
    channels:
      - email: ops@playwright-learning.com
```

### Slack Integration

#### 1. Create Slack Webhook

1. Go to https://api.slack.com/apps
2. Create New App
3. Add Incoming Webhook
4. Select channel: #alerts
5. Copy webhook URL

#### 2. Configure Alerts

Add webhook to all monitoring services:

**UptimeRobot**: My Settings > Alert Contacts > Add Webhook
**Sentry**: Settings > Integrations > Slack
**Railway**: Settings > Integrations > Slack
**Vercel**: Project Settings > Integrations > Slack

#### 3. Test Notification

```bash
# Test Slack webhook
curl -X POST https://hooks.slack.com/services/YOUR/WEBHOOK/URL \
  -H 'Content-Type: application/json' \
  -d '{
    "text": "Test notification from Playwright Learning Platform",
    "attachments": [{
      "color": "good",
      "text": "Monitoring system is active"
    }]
  }'
```

### Email Alerts

Configure email alerts for critical issues:

1. **Sentry**: Project Settings > Alerts > Add email
2. **UptimeRobot**: My Settings > Alert Contacts > Add email
3. **MongoDB Atlas**: Project Settings > Alerts > Add email

## Status Page

### Statuspage.io Setup

#### 1. Create Status Page

1. Go to https://www.atlassian.com/software/statuspage
2. Create account
3. Create new status page
4. Name: "Playwright Learning Platform"

#### 2. Add Components

- **Frontend Application**
  - Description: User-facing website
  - Status: Operational

- **Backend API**
  - Description: REST API services
  - Status: Operational

- **Database**
  - Description: MongoDB Atlas
  - Status: Operational

- **CDN**
  - Description: Static asset delivery
  - Status: Operational

#### 3. Configure Custom Domain

1. Settings > Custom Domain
2. Add: status.playwright-learning.com
3. Add CNAME record in DNS:
   ```
   status CNAME playwright-learning.statuspage.io
   ```

#### 4. Integrate Monitoring

Connect UptimeRobot to auto-update status:

1. In Statuspage: Settings > Integrations
2. Add UptimeRobot integration
3. Map UptimeRobot monitors to components
4. Enable auto-updates

#### 5. Configure Notifications

1. Settings > Notifications
2. Enable:
   - Email subscribers
   - Slack notifications
   - RSS feed
   - Webhook (optional)

### Alternative: Self-Hosted Status Page

Use Statusfy (open-source):

```bash
# Install
npm install -g statusfy

# Create project
statusfy init

# Configure
# Edit config.yml with your services

# Run
statusfy dev

# Build for production
statusfy build
statusfy start
```

## Monitoring Checklist

### Daily Checks

- [ ] Review error dashboard in Sentry
- [ ] Check uptime reports
- [ ] Review performance metrics
- [ ] Check for anomalies in logs

### Weekly Checks

- [ ] Review error trends
- [ ] Analyze performance trends
- [ ] Check database query performance
- [ ] Review alert false positives
- [ ] Update runbooks if needed

### Monthly Checks

- [ ] Review SSL certificate expiration
- [ ] Check monitoring coverage
- [ ] Review and update alert thresholds
- [ ] Audit log retention policies
- [ ] Test disaster recovery procedures

## Monitoring Queries

### Useful Log Queries

```bash
# Find errors in last hour
railway logs --environment production --since 1h | grep ERROR

# Count errors by type
railway logs --environment production | grep ERROR | sort | uniq -c

# Find slow queries
railway logs --environment production | grep "Query took" | awk '$4 > 1000'

# API endpoint statistics
railway logs --environment production | grep "GET /api" | awk '{print $7}' | sort | uniq -c

# Memory usage alerts
railway logs --environment production | grep "memory"
```

### Sentry Queries

```python
# In Sentry Discover
# Most common errors
event.type:error
is:unresolved
# Group by: error.type

# Slow transactions
transaction.duration:>3s
# Group by: transaction

# Errors by user
event.type:error
user.email:*
# Group by: user.email

# API endpoint errors
event.type:error
transaction:/api/*
# Group by: transaction
```

## Troubleshooting

### Monitoring Not Working

1. **Check credentials**:
   ```bash
   # Sentry
   echo $SENTRY_DSN

   # Verify DSN is valid
   curl -I "$SENTRY_DSN"
   ```

2. **Check network connectivity**:
   ```bash
   # From your server
   curl -v https://sentry.io
   ```

3. **Check logs for monitoring errors**:
   ```bash
   railway logs | grep -i sentry
   railway logs | grep -i error
   ```

### Alerts Not Firing

1. Check alert configuration
2. Verify contact methods
3. Test webhook/email manually
4. Check spam folder for emails
5. Verify Slack integration

### Missing Metrics

1. Check if metrics endpoint is accessible
2. Verify Prometheus scraping configuration
3. Check firewall rules
4. Review metric naming (Prometheus format)

---

**Last Updated**: 2024-02-17
**Next Review**: 2024-03-17
