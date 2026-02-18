# Logging Best Practices

## Overview

This document outlines best practices for logging in the Playwright & Selenium Learning Platform to ensure effective debugging, monitoring, and incident response.

## Table of Contents

1. [General Principles](#general-principles)
2. [Log Levels](#log-levels)
3. [Structured Logging](#structured-logging)
4. [Security Considerations](#security-considerations)
5. [Performance Impact](#performance-impact)
6. [Frontend Logging](#frontend-logging)
7. [Backend Logging](#backend-logging)
8. [Log Analysis](#log-analysis)
9. [Common Patterns](#common-patterns)
10. [Anti-Patterns](#anti-patterns)

---

## General Principles

### 1. Log with Purpose

Every log entry should have a clear purpose:
- **Debug**: Detailed information for debugging
- **Info**: General informational messages
- **Warn**: Warning messages for potential issues
- **Error**: Error messages for failures
- **Fatal**: Critical errors requiring immediate attention

### 2. Be Consistent

- Use consistent formatting across all logs
- Follow naming conventions for log messages
- Use standard field names in structured logs

### 3. Provide Context

Always include relevant context:
- User ID
- Request ID
- Session ID
- Timestamp
- Component/Service name

### 4. Think About the Reader

- Write clear, descriptive messages
- Include actionable information
- Anticipate debugging needs

## Log Levels

### DEBUG

**When to Use**:
- Detailed diagnostic information
- Variable values during execution
- Function entry/exit points
- Development and troubleshooting

**Examples**:

```typescript
// Frontend
debug('Fetching user data', { userId, endpoint: '/api/users' });

// Backend
debug('Database query executed', {
  query: 'SELECT * FROM users WHERE id = ?',
  params: [userId],
  duration: '45ms'
});
```

**Best Practices**:
- Use sparingly in production
- Include relevant variable values
- Disable in production for performance

### INFO

**When to Use**:
- Significant events in application flow
- Successful operations
- User actions
- State changes

**Examples**:

```typescript
// User actions
info('User logged in', { userId, ipAddress, timestamp });

// System events
info('Cache cleared', { cacheType: 'user-sessions', count: 150 });

// Background jobs
info('Scheduled job completed', {
  job: 'daily-report',
  duration: '2m 34s',
  status: 'success'
});
```

**Best Practices**:
- Log important milestones
- Keep messages concise
- Include metrics when relevant

### WARN

**When to Use**:
- Potentially harmful situations
- Deprecated feature usage
- Recoverable errors
- Performance degradation

**Examples**:

```typescript
// Performance warnings
warn('Slow database query detected', {
  query: 'users.find()',
  duration: 2500,
  threshold: 1000
});

// Deprecated features
warn('Deprecated API endpoint used', {
  endpoint: '/api/v1/old',
  userId,
  migration: '/api/v2/new'
});

// Resource warnings
warn('Cache miss rate high', {
  missRate: 75,
  threshold: 50,
  period: '5m'
});
```

**Best Practices**:
- Include why it's a warning
- Suggest remediation steps
- Monitor for patterns

### ERROR

**When to Use**:
- Operation failures
- Unhandled exceptions
- External service failures
- Data validation errors

**Examples**:

```typescript
// Operation failures
error('Failed to process payment', {
  userId,
  orderId,
  error: err.message,
  amount: payment.amount,
  provider: 'stripe'
});

// External service failures
error('External API call failed', {
  service: 'email-service',
  endpoint: '/send',
  statusCode: 503,
  retryAttempt: 3
});

// Data errors
error('Invalid data received', {
  source: 'user-input',
  field: 'email',
  value: '[REDACTED]',
  validation: 'invalid-format'
});
```

**Best Practices**:
- Always include error stack traces
- Log the full context
- Include retry information
- Don't log sensitive data

### FATAL

**When to Use**:
- Critical system failures
- Application crashes
- Data corruption
- Security breaches

**Examples**:

```typescript
// System failures
fatal('Database connection lost', {
  database: 'primary',
  lastSuccessfulConnection: timestamp,
  error: err.message
});

// Security issues
fatal('Unauthorized access attempt', {
  userId,
  resource: '/admin',
  ipAddress,
  attemptCount: 5
});
```

**Best Practices**:
- Trigger immediate alerts
- Include all diagnostic information
- Log before system exit

## Structured Logging

### Use Consistent Structure

```typescript
// Good: Structured logging
info('User login successful', {
  userId: user.id,
  email: user.email,
  ipAddress: req.ip,
  userAgent: req.get('user-agent'),
  timestamp: new Date().toISOString()
});

// Bad: Unstructured logging
info(`User ${user.email} logged in from ${req.ip}`);
```

### Standard Fields

Always include these standard fields:
- **timestamp**: ISO 8601 format
- **level**: Log level
- **message**: Human-readable message
- **userId**: User identifier (when available)
- **requestId**: Request tracking ID
- **service**: Service/component name

### Example Structure

```typescript
{
  "timestamp": "2024-02-17T10:30:00.000Z",
  "level": "info",
  "message": "User login successful",
  "userId": "user_123",
  "requestId": "req_abc456",
  "service": "auth-service",
  "metadata": {
    "email": "user@example.com",
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0..."
  }
}
```

## Security Considerations

### Sensitive Data

**Never Log**:
- Passwords
- API keys
- Tokens
- Credit card numbers
- SSN or personal identification numbers
- Full authentication credentials

```typescript
// Bad: Logging sensitive data
info('User authenticated', {
  email: user.email,
  password: user.password // NEVER DO THIS
});

// Good: Redacting sensitive data
info('User authenticated', {
  email: user.email,
  passwordHash: '[REDACTED]'
});
```

### Personal Information (PII)

Follow GDPR/CCPA guidelines:
- Minimize PII in logs
- Anonymize when possible
- Implement log retention policies
- Provide data deletion mechanisms

```typescript
// Better: Use user ID instead of email
info('Password reset requested', {
  userId: user.id,
  requestId: resetToken.id
});
```

### Sanitization

Use the built-in sanitization:

```typescript
import { sanitizeData } from './utils/sanitize';

const userInput = req.body;
info('User registration', sanitizeData(userInput));
```

## Performance Impact

### Minimize Overhead

```typescript
// Bad: Expensive operation in log call
debug('User data', JSON.parse(JSON.stringify(largeObject)));

// Good: Lazy evaluation
if (shouldLog(LogLevel.DEBUG)) {
  debug('User data', processLargeObject());
}
```

### Batch Logging

Frontend logs are automatically batched:

```typescript
// Logs are queued and sent in batches
trackEvent({ name: 'button_click', data: {...} });
trackEvent({ name: 'form_submit', data: {...} });
// Batched and sent together
```

### Sampling

Use sampling for high-volume logs:

```typescript
// Sample 10% of requests
if (Math.random() < 0.1) {
  debug('Request details', requestData);
}
```

## Frontend Logging

### Client-Side Best Practices

```typescript
import { info, error, warn } from './lib/logger';

// User actions
info('Button clicked', {
  button: 'submit-form',
  formData: sanitizedData
});

// Errors with context
try {
  await submitForm();
} catch (err) {
  error('Form submission failed', {
    error: err.message,
    formId: form.id,
    userId: user.id
  });
}

// Performance tracking
const timer = timer('api-call');
await fetchData();
timer.end({ endpoint: '/api/data' });
```

### Browser-Specific Considerations

```typescript
// Check if console is available
if (typeof console !== 'undefined') {
  console.log('Debug info');
}

// Use appropriate console methods
console.group('User Actions');
console.log('Action 1');
console.log('Action 2');
console.groupEnd();
```

## Backend Logging

### Request/Response Logging

```typescript
// Automatic via middleware
import { requestLogger } from './middleware/logger';
app.use(requestLogger);

// Manual logging for specific cases
info('External API called', {
  requestId: req.requestId,
  endpoint: '/api/external',
  method: 'POST',
  duration: responseTime
});
```

### Database Operations

```typescript
// Query logging
const timer = timer('db-query');
const results = await User.find({ active: true });
const duration = timer.end();

if (duration > 1000) {
  warn('Slow query detected', {
    query: 'User.find',
    duration,
    threshold: 1000
  });
}
```

### Error Handling

```typescript
import { logError } from './middleware/logger';

try {
  await processOrder(orderId);
} catch (err) {
  logError(err, {
    operation: 'processOrder',
    orderId,
    userId: req.user.id,
    requestId: req.requestId
  });

  // Send appropriate response
  res.status(500).json({
    error: 'Failed to process order',
    requestId: req.requestId
  });
}
```

## Log Analysis

### Useful Log Queries

#### Find All Errors for a User

```bash
# Using grep
grep "userId.*user_123" app.log | grep "ERROR"

# Using jq (for JSON logs)
cat app.log | jq 'select(.userId == "user_123" and .level == "ERROR")'
```

#### Find Slow Requests

```bash
# Find requests over 1 second
cat app.log | jq 'select(.duration > 1000)'
```

#### Count Errors by Type

```bash
cat app.log | jq 'select(.level == "ERROR") | .errorType' | sort | uniq -c
```

### Log Aggregation

Use tools like:
- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **Splunk**
- **Datadog**
- **CloudWatch** (AWS)

## Common Patterns

### Pattern 1: Request Tracking

```typescript
// Generate unique request ID
const requestId = generateId();

// Log request start
info('Request started', {
  requestId,
  method: req.method,
  url: req.url
});

try {
  // Process request
  const result = await processRequest();

  // Log success
  info('Request completed', {
    requestId,
    duration: Date.now() - startTime
  });
} catch (err) {
  // Log error
  error('Request failed', {
    requestId,
    error: err.message
  });
}
```

### Pattern 2: State Transitions

```typescript
info('Order state changed', {
  orderId,
  previousState: 'pending',
  newState: 'confirmed',
  userId,
  timestamp: new Date()
});
```

### Pattern 3: Performance Monitoring

```typescript
const mark1 = performance.now();
await heavyOperation();
const mark2 = performance.now();

if (mark2 - mark1 > threshold) {
  warn('Performance threshold exceeded', {
    operation: 'heavyOperation',
    duration: mark2 - mark1,
    threshold
  });
}
```

## Anti-Patterns

### ❌ Don't: Log Inside Loops

```typescript
// Bad
for (const user of users) {
  debug('Processing user', { userId: user.id });
  processUser(user);
}

// Good
info('Processing users batch', {
  count: users.length,
  batchId
});
processUsers(users);
info('Users batch processed', {
  count: users.length,
  batchId,
  duration
});
```

### ❌ Don't: Log Entire Objects

```typescript
// Bad
debug('Request received', req); // Too much data

// Good
debug('Request received', {
  method: req.method,
  url: req.url,
  query: req.query
});
```

### ❌ Don't: Use String Concatenation

```typescript
// Bad
info('User ' + user.id + ' logged in at ' + new Date());

// Good
info('User logged in', {
  userId: user.id,
  timestamp: new Date()
});
```

### ❌ Don't: Log Without Context

```typescript
// Bad
error('Failed'); // What failed?

// Good
error('User authentication failed', {
  userId,
  reason: 'invalid_password',
  attemptCount: 3
});
```

---

## Summary Checklist

- [ ] Use appropriate log levels
- [ ] Include relevant context
- [ ] Sanitize sensitive data
- [ ] Use structured logging
- [ ] Consider performance impact
- [ ] Include request IDs for tracing
- [ ] Log errors with stack traces
- [ ] Monitor log volume
- [ ] Set up log rotation
- [ ] Implement log aggregation
- [ ] Review logs regularly
- [ ] Create alerting rules

---

**Last Updated**: February 17, 2024
**Version**: 1.0.0
