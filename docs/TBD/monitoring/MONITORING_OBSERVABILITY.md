# Monitoring & Observability Guide

## Overview

Comprehensive guide for monitoring, observability, and alerting for the Playwright & Selenium Learning Platform.

## Monitoring Stack

### Components
- **Prometheus**: Metrics collection and storage
- **Grafana**: Visualization and dashboards
- **Jaeger**: Distributed tracing
- **ELK Stack**: Log aggregation (optional)
- **Sentry**: Error tracking
- **PagerDuty**: Incident management

## Metrics Collection

### 1. Application Metrics

#### HTTP Metrics
```typescript
import { metricsRegistry } from './services/monitoring/metricsService';

// Automatically collected by middleware
app.use(metricsMiddleware);

// Manual metric tracking
metricsRegistry.incrementCounter('http_requests_total', 1, {
  method: 'GET',
  route: '/api/courses',
  status: '200',
});

metricsRegistry.observeHistogram('http_request_duration_seconds', 0.245, {
  method: 'GET',
  route: '/api/courses',
});
```

#### Business Metrics
```typescript
// Track business KPIs
Metrics.incrementCounter('course_enrollments_total', 1, {
  courseId: course.id,
  category: course.category,
});

Metrics.incrementCounter('quiz_completions_total', 1, {
  quizId: quiz.id,
  score: quiz.score,
});

Metrics.setGauge('active_users', activeUserCount);
Metrics.setGauge('revenue_today', totalRevenue);
```

#### Database Metrics
```typescript
// Wrap database queries with metrics
const result = await Metrics.trackDatabaseQuery(async () => {
  return await Course.find({ category: 'playwright' });
});

// Metrics automatically tracked:
// - database_queries_total (with status label)
// - database_query_duration_seconds
```

#### Cache Metrics
```typescript
// Track cache performance
const value = await cacheManager.get('course:123');

if (value) {
  Metrics.trackCacheAccess(true); // Hit
} else {
  Metrics.trackCacheAccess(false); // Miss
}

// Metrics tracked:
// - cache_hits_total
// - cache_misses_total
// - cache_hit_rate (calculated)
```

### 2. Infrastructure Metrics

#### Kubernetes Metrics
```yaml
# Prometheus scrapes these automatically
- kube-state-metrics: Pod/Node/Deployment status
- node-exporter: Node-level metrics
- cadvisor: Container metrics
```

#### Database Metrics
```yaml
# MongoDB metrics (via exporter)
- mongodb_connections: Current connections
- mongodb_opcounters: Operations per second
- mongodb_memory: Memory usage
- mongodb_network: Network traffic
- mongodb_locks: Lock statistics

# Redis metrics (via exporter)
- redis_connected_clients: Connected clients
- redis_used_memory: Memory usage
- redis_keyspace_hits: Cache hits
- redis_keyspace_misses: Cache misses
```

## Distributed Tracing

### 1. Instrumentation

```typescript
import { tracingMiddleware, Tracing } from './services/monitoring/tracingService';

// Enable tracing middleware
app.use(tracingMiddleware);

// Trace individual operations
async function getCourse(req: Request, res: Response) {
  const spanId = Tracing.startSpan(req, 'get-course');

  try {
    // Database query
    const course = await Tracing.trace(req, 'database-query', async () => {
      return await Course.findById(req.params.id);
    });

    // Cache operation
    await Tracing.trace(req, 'cache-write', async () => {
      await cacheManager.set(`course:${course.id}`, course);
    });

    Tracing.setTag(req, spanId, 'course.id', course.id);
    Tracing.setTag(req, spanId, 'course.category', course.category);

    Tracing.finishSpan(req, spanId, 'ok');

    res.json(course);
  } catch (error) {
    Tracing.setTag(req, spanId, 'error', true);
    Tracing.log(req, spanId, {
      event: 'error',
      message: error.message,
    });
    Tracing.finishSpan(req, spanId, 'error');

    throw error;
  }
}
```

### 2. Trace Context Propagation

```typescript
// Propagate trace context across services
async function callAnotherService(req: Request, endpoint: string) {
  const context = (req as any).tracingContext;

  const response = await fetch(`http://service/${endpoint}`, {
    headers: {
      'X-Trace-Id': context.traceId,
      'X-Span-Id': context.currentSpanId,
    },
  });

  return response.json();
}
```

## Dashboards

### 1. Overview Dashboard

```json
{
  "dashboard": {
    "title": "Platform Overview",
    "panels": [
      {
        "title": "Request Rate",
        "targets": [{
          "expr": "sum(rate(http_requests_total[5m])) by (service)"
        }]
      },
      {
        "title": "Response Time (p95)",
        "targets": [{
          "expr": "histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, service))"
        }]
      },
      {
        "title": "Error Rate",
        "targets": [{
          "expr": "sum(rate(http_requests_total{status=~\"5..\"}[5m])) by (service) / sum(rate(http_requests_total[5m])) by (service) * 100"
        }]
      }
    ]
  }
}
```

### 2. Service-Specific Dashboards

**Auth Service Dashboard**:
- Login attempts per minute
- Authentication success rate
- Token generation rate
- Session duration
- Failed login attempts

**Content Service Dashboard**:
- Course views
- Content uploads
- Search queries
- Popular courses
- Storage usage

**Analytics Service Dashboard**:
- Events processed per second
- Analytics query latency
- Data pipeline health
- Report generation time

### 3. Infrastructure Dashboard

**Kubernetes Dashboard**:
- Pod status and health
- Node resource utilization
- Deployment rollout status
- HPA scaling events
- PVC usage

**Database Dashboard**:
- Query performance
- Connection pool usage
- Replication lag
- Disk I/O
- Cache hit ratio

## Alerting

### 1. Alert Rules

```yaml
# prometheus-alerts.yml
groups:
- name: critical_alerts
  interval: 30s
  rules:
  - alert: ServiceDown
    expr: up{job=~".*-service"} == 0
    for: 2m
    labels:
      severity: critical
      team: platform
    annotations:
      summary: "Service {{ $labels.job }} is down"
      description: "{{ $labels.job }} has been down for more than 2 minutes"
      runbook_url: "https://runbooks.playwright-learning.com/service-down"

  - alert: HighErrorRate
    expr: sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) > 0.01
    for: 5m
    labels:
      severity: critical
      team: platform
    annotations:
      summary: "High error rate detected"
      description: "Error rate is {{ $value | humanizePercentage }}"

  - alert: HighResponseTime
    expr: histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le)) > 1
    for: 10m
    labels:
      severity: warning
      team: platform
    annotations:
      summary: "High response time"
      description: "p95 response time is {{ $value }}s"

  - alert: DatabaseReplicationLag
    expr: mongodb_replset_member_replication_lag > 60
    for: 5m
    labels:
      severity: critical
      team: database
    annotations:
      summary: "MongoDB replication lag is high"
      description: "Replication lag is {{ $value }}s"

  - alert: HighMemoryUsage
    expr: container_memory_usage_bytes / container_spec_memory_limit_bytes > 0.9
    for: 5m
    labels:
      severity: warning
      team: platform
    annotations:
      summary: "High memory usage in {{ $labels.pod }}"
      description: "Memory usage is {{ $value | humanizePercentage }}"

  - alert: HighCPUUsage
    expr: rate(container_cpu_usage_seconds_total[5m]) > 0.8
    for: 10m
    labels:
      severity: warning
      team: platform
    annotations:
      summary: "High CPU usage in {{ $labels.pod }}"
      description: "CPU usage is {{ $value | humanizePercentage }}"

  - alert: PodCrashLooping
    expr: rate(kube_pod_container_status_restarts_total[15m]) > 0
    for: 5m
    labels:
      severity: critical
      team: platform
    annotations:
      summary: "Pod {{ $labels.pod }} is crash looping"
      description: "Pod has restarted {{ $value }} times"

  - alert: LowCacheHitRate
    expr: sum(rate(cache_hits_total[5m])) / (sum(rate(cache_hits_total[5m])) + sum(rate(cache_misses_total[5m]))) < 0.7
    for: 15m
    labels:
      severity: warning
      team: platform
    annotations:
      summary: "Low cache hit rate"
      description: "Cache hit rate is {{ $value | humanizePercentage }}"

  - alert: BackupFailed
    expr: time() - last_backup_timestamp > 3600
    for: 5m
    labels:
      severity: critical
      team: database
    annotations:
      summary: "Backup has not run in over 1 hour"
      description: "Last successful backup was {{ $value | humanizeDuration }} ago"
```

### 2. Alert Routing

```yaml
# alertmanager.yml
global:
  resolve_timeout: 5m
  slack_api_url: 'https://hooks.slack.com/services/XXX'
  pagerduty_url: 'https://events.pagerduty.com/v2/enqueue'

route:
  receiver: 'default'
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h

  routes:
  - match:
      severity: critical
    receiver: pagerduty-critical
    continue: true

  - match:
      severity: warning
    receiver: slack-warnings

  - match:
      team: database
    receiver: database-team

receivers:
- name: 'default'
  slack_configs:
  - channel: '#alerts'
    title: 'Alert: {{ .GroupLabels.alertname }}'
    text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'

- name: 'pagerduty-critical'
  pagerduty_configs:
  - service_key: 'YOUR_PAGERDUTY_KEY'
    description: '{{ .GroupLabels.alertname }}'

- name: 'slack-warnings'
  slack_configs:
  - channel: '#warnings'
    title: 'Warning: {{ .GroupLabels.alertname }}'

- name: 'database-team'
  email_configs:
  - to: 'database-team@playwright-learning.com'
    from: 'alerts@playwright-learning.com'
  slack_configs:
  - channel: '#database-alerts'
```

### 3. On-Call Management

```typescript
// Integrate with PagerDuty
import { PagerDuty } from 'pagerduty-client';

const pagerduty = new PagerDuty({
  token: process.env.PAGERDUTY_TOKEN,
});

async function triggerIncident(alert: Alert) {
  await pagerduty.incidents.create({
    incident: {
      type: 'incident',
      title: alert.title,
      service: {
        id: process.env.PAGERDUTY_SERVICE_ID,
        type: 'service_reference',
      },
      body: {
        type: 'incident_body',
        details: alert.description,
      },
      urgency: alert.severity === 'critical' ? 'high' : 'low',
    },
  });
}
```

## Log Aggregation

### 1. Structured Logging

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'api-gateway',
    environment: process.env.NODE_ENV,
  },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Log with context
logger.info('User logged in', {
  userId: user.id,
  ip: req.ip,
  userAgent: req.get('user-agent'),
  traceId: req.headers['x-trace-id'],
});

logger.error('Database query failed', {
  error: error.message,
  stack: error.stack,
  query: query.toString(),
  traceId: req.headers['x-trace-id'],
});
```

### 2. Log Queries

```javascript
// Kibana query examples

// Find errors in last 1 hour
level: "error" AND @timestamp >= now-1h

// Find slow queries
service: "database" AND duration > 1000

// Find failed logins
event: "login_failed" AND @timestamp >= now-1d

// Trace specific request
traceId: "abc123"

// Find errors by user
userId: "user123" AND level: "error"
```

## SLO/SLI Tracking

### 1. Service Level Indicators (SLIs)

```yaml
# SLI definitions
- name: availability
  description: "Percentage of successful requests"
  query: "sum(rate(http_requests_total{status!~\"5..\"}[5m])) / sum(rate(http_requests_total[5m]))"
  target: 0.999 # 99.9%

- name: latency
  description: "p95 response time"
  query: "histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))"
  target: 0.5 # 500ms

- name: error_rate
  description: "Percentage of failed requests"
  query: "sum(rate(http_requests_total{status=~\"5..\"}[5m])) / sum(rate(http_requests_total[5m]))"
  target: 0.001 # 0.1%
```

### 2. Error Budget

```typescript
// Calculate error budget
const SLO_TARGET = 0.999; // 99.9%
const DAYS_IN_MONTH = 30;
const MINUTES_IN_DAY = 1440;

const allowedDowntimeMinutes = DAYS_IN_MONTH * MINUTES_IN_DAY * (1 - SLO_TARGET);
console.log(`Error budget: ${allowedDowntimeMinutes} minutes/month`); // 43.2 minutes

// Track error budget consumption
async function calculateErrorBudget() {
  const totalRequests = await getTotalRequests();
  const failedRequests = await getFailedRequests();

  const actualAvailability = 1 - (failedRequests / totalRequests);
  const errorBudgetRemaining = (actualAvailability - SLO_TARGET) / (1 - SLO_TARGET);

  return {
    totalRequests,
    failedRequests,
    actualAvailability,
    errorBudgetRemaining: errorBudgetRemaining * 100, // As percentage
  };
}
```

## Best Practices

### 1. Metric Naming
- Use consistent naming: `<namespace>_<subsystem>_<metric>_<unit>`
- Example: `http_request_duration_seconds`
- Include units in metric names

### 2. Label Usage
- Keep cardinality low (< 10 values per label)
- Don't use user IDs or email as labels
- Use meaningful label names

### 3. Dashboard Design
- Group related metrics
- Use appropriate visualization types
- Set meaningful time ranges
- Add threshold lines
- Include descriptions

### 4. Alert Design
- Alert on symptoms, not causes
- Avoid alert fatigue
- Include runbook links
- Set appropriate thresholds
- Use warning and critical levels

### 5. Logging
- Use structured logging
- Include trace IDs
- Log at appropriate levels
- Don't log sensitive data
- Include context

## Monitoring Checklist

- [ ] Prometheus installed and scraping
- [ ] Grafana dashboards configured
- [ ] Jaeger tracing enabled
- [ ] Alert rules defined
- [ ] AlertManager configured
- [ ] PagerDuty integration
- [ ] Log aggregation setup
- [ ] SLO/SLI defined
- [ ] Error budget tracking
- [ ] Runbooks documented
- [ ] On-call rotation configured
- [ ] Regular review process

## Support Resources

- **Grafana Dashboards**: http://grafana.playwright-learning.com
- **Prometheus**: http://prometheus.playwright-learning.com
- **Jaeger UI**: http://jaeger.playwright-learning.com
- **Runbooks**: https://runbooks.playwright-learning.com
- **PagerDuty**: https://playwright-learning.pagerduty.com
