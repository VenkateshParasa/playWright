# Webhook Implementation Guide

This guide will help you set up and manage webhooks for real-time event notifications from the Playwright & Selenium Learning Platform.

## Overview

Webhooks allow your application to receive real-time notifications when events occur on our platform. Instead of polling our API, we'll send HTTP POST requests to your specified URL.

## Available Events

| Event | Description | Payload Example |
|-------|-------------|-----------------|
| `user.created` | New user registers | `{userId, email, createdAt}` |
| `user.updated` | User profile updated | `{userId, changes}` |
| `lesson.completed` | User completes a lesson | `{userId, lessonId, completedAt}` |
| `quiz.passed` | User passes a quiz | `{userId, quizId, score}` |
| `quiz.failed` | User fails a quiz | `{userId, quizId, score}` |
| `exercise.completed` | User completes an exercise | `{userId, exerciseId}` |
| `achievement.unlocked` | User unlocks achievement | `{userId, achievementId}` |
| `review.completed` | Flashcard review completed | `{userId, cardId, quality}` |
| `progress.milestone` | User reaches milestone | `{userId, milestone, value}` |
| `subscription.changed` | Subscription status changes | `{userId, status, plan}` |

## Setup Steps

### 1. Create a Webhook Endpoint

Create an endpoint in your application to receive webhook events:

```javascript
// Express.js example
app.post('/webhooks/playwright-learning', express.json(), async (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const event = req.body;

  // Verify signature (see below)
  if (!verifySignature(req.body, signature, WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }

  // Process event
  try {
    await handleWebhookEvent(event);
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).send('Processing error');
  }
});
```

### 2. Register Your Webhook

Use the API to register your webhook URL:

```bash
curl -X POST "https://api.playwright-learning.com/v1/webhooks" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-app.com/webhooks/playwright-learning",
    "events": ["lesson.completed", "quiz.passed", "achievement.unlocked"],
    "description": "Production webhook"
  }'
```

Response:

```json
{
  "success": true,
  "data": {
    "webhook": {
      "id": "webhook_abc123",
      "url": "https://your-app.com/webhooks/playwright-learning",
      "events": ["lesson.completed", "quiz.passed", "achievement.unlocked"],
      "isActive": true
    },
    "secret": "whsec_xyz789abc..."
  }
}
```

**IMPORTANT**: Save the `secret` value securely. You'll need it to verify webhook signatures.

### 3. Verify Webhook Signatures

Always verify that webhooks are from our platform:

#### Node.js

```javascript
const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const payloadString = JSON.stringify(payload);
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payloadString)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature.replace('sha256=', '')),
    Buffer.from(expectedSignature)
  );
}
```

#### Python

```python
import hmac
import hashlib
import json

def verify_signature(payload: dict, signature: str, secret: str) -> bool:
    payload_string = json.dumps(payload, separators=(',', ':'))
    expected_signature = hmac.new(
        secret.encode('utf-8'),
        payload_string.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(
        signature.replace('sha256=', ''),
        expected_signature
    )
```

#### PHP

```php
function verifySignature($payload, $signature, $secret) {
    $payloadString = json_encode($payload, JSON_UNESCAPED_SLASHES);
    $expectedSignature = hash_hmac('sha256', $payloadString, $secret);

    return hash_equals(
        str_replace('sha256=', '', $signature),
        $expectedSignature
    );
}
```

### 4. Handle Webhook Events

Process different event types:

```javascript
async function handleWebhookEvent(event) {
  const { event: eventType, data, timestamp } = event;

  switch (eventType) {
    case 'lesson.completed':
      await handleLessonCompleted(data);
      break;

    case 'quiz.passed':
      await handleQuizPassed(data);
      break;

    case 'achievement.unlocked':
      await handleAchievementUnlocked(data);
      break;

    default:
      console.log('Unhandled event type:', eventType);
  }
}

async function handleLessonCompleted(data) {
  const { userId, lessonId, lessonTitle } = data;

  // Send congratulations email
  await sendEmail({
    to: userId,
    subject: 'Lesson Completed!',
    body: `Congratulations on completing "${lessonTitle}"!`
  });

  // Update internal systems
  await updateUserProgress(userId, { lessonsCompleted: 1 });
}

async function handleAchievementUnlocked(data) {
  const { userId, achievementId, achievementTitle } = data;

  // Post to Slack
  await slackNotify({
    channel: '#achievements',
    text: `🏆 User ${userId} unlocked: ${achievementTitle}!`
  });
}
```

## Webhook Payload Format

All webhooks follow this format:

```json
{
  "event": "lesson.completed",
  "timestamp": "2024-02-17T10:00:00Z",
  "data": {
    "userId": "user_123",
    "lessonId": "lesson_456",
    "lessonTitle": "Introduction to Playwright",
    "completedAt": "2024-02-17T10:00:00Z",
    "timeSpent": 1800
  },
  "signature": "sha256=abc123..."
}
```

## Retry Logic

If your endpoint fails (non-2xx response), we'll retry:

- **Retry 1**: After 1 minute
- **Retry 2**: After 5 minutes
- **Retry 3**: After 15 minutes

Configure retry policy when creating the webhook:

```json
{
  "url": "https://your-app.com/webhooks",
  "events": ["lesson.completed"],
  "retryPolicy": {
    "maxAttempts": 3,
    "backoffMultiplier": 2
  }
}
```

## Testing Webhooks

### Test Webhook Delivery

Send a test event to verify your endpoint works:

```bash
curl -X POST "https://api.playwright-learning.com/v1/webhooks/webhook_abc123/test" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### View Webhook Logs

Check delivery logs and failures:

```bash
curl -X GET "https://api.playwright-learning.com/v1/webhooks/webhook_abc123/events?status=failed" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Local Testing with ngrok

For local development, use ngrok:

```bash
# Start ngrok
ngrok http 3000

# Use the ngrok URL for your webhook
# Example: https://abc123.ngrok.io/webhooks
```

## Best Practices

### 1. Respond Quickly

Respond with `200 OK` as quickly as possible. Process events asynchronously:

```javascript
app.post('/webhook', async (req, res) => {
  // Verify signature
  if (!verifySignature(req.body, req.headers['x-webhook-signature'], SECRET)) {
    return res.status(401).send('Invalid signature');
  }

  // Respond immediately
  res.status(200).send('OK');

  // Process asynchronously
  processWebhookAsync(req.body).catch(console.error);
});
```

### 2. Handle Idempotency

Events may be delivered more than once. Use the event timestamp or a unique ID to detect duplicates:

```javascript
const processedEvents = new Set();

async function handleWebhookEvent(event) {
  const eventId = `${event.event}-${event.data.userId}-${event.timestamp}`;

  if (processedEvents.has(eventId)) {
    console.log('Duplicate event, skipping');
    return;
  }

  processedEvents.add(eventId);
  // Process event...
}
```

### 3. Monitor Webhook Health

Set up alerts for webhook failures:

```javascript
async function checkWebhookHealth() {
  const stats = await sdk.getWebhookStats('webhook_abc123');

  if (stats.data.successRate < 95) {
    await alertTeam({
      severity: 'warning',
      message: `Webhook success rate is ${stats.data.successRate}%`
    });
  }
}

// Run hourly
setInterval(checkWebhookHealth, 60 * 60 * 1000);
```

### 4. Secure Your Endpoint

- Always verify signatures
- Use HTTPS only
- Rate limit webhook requests
- Log all webhook attempts
- Monitor for suspicious activity

### 5. Handle Failures Gracefully

```javascript
async function processWebhookAsync(event) {
  try {
    await handleWebhookEvent(event);
  } catch (error) {
    console.error('Webhook processing failed:', error);

    // Log to error tracking service
    await logError(error, { event });

    // Store in retry queue
    await addToRetryQueue(event);
  }
}
```

## Managing Webhooks

### List All Webhooks

```bash
curl -X GET "https://api.playwright-learning.com/v1/webhooks" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Update Webhook

```bash
curl -X PATCH "https://api.playwright-learning.com/v1/webhooks/webhook_abc123" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "events": ["lesson.completed", "quiz.passed", "quiz.failed"],
    "isActive": true
  }'
```

### Delete Webhook

```bash
curl -X DELETE "https://api.playwright-learning.com/v1/webhooks/webhook_abc123" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Pause/Resume Webhook

```bash
# Pause
curl -X PATCH "https://api.playwright-learning.com/v1/webhooks/webhook_abc123" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"isActive": false}'

# Resume
curl -X PATCH "https://api.playwright-learning.com/v1/webhooks/webhook_abc123" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"isActive": true}'
```

## Troubleshooting

### Webhook Not Receiving Events

1. Check webhook is active: `GET /webhooks/webhook_id`
2. Verify events are subscribed: Check `events` array
3. Test endpoint: `POST /webhooks/webhook_id/test`
4. Check logs: `GET /webhooks/webhook_id/events`

### Signature Verification Failing

1. Ensure you're using the correct secret
2. Verify payload is being serialized correctly
3. Check for extra whitespace or encoding issues
4. Use the exact payload body (don't parse then re-serialize)

### High Failure Rate

1. Check endpoint response time (should be < 5 seconds)
2. Verify endpoint is accessible from our servers
3. Check for rate limiting on your end
4. Review error logs: `GET /webhooks/webhook_id/events?status=failed`

## Example Integration

Complete example with Express.js:

```javascript
const express = require('express');
const crypto = require('crypto');
const { PlaywrightLearningSDK } = require('@playwright-learning/api-sdk');

const app = express();
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

// Webhook endpoint
app.post('/webhooks/playwright-learning',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const signature = req.headers['x-webhook-signature'];
    const payload = req.body.toString();

    // Verify signature
    if (!PlaywrightLearningSDK.verifyWebhookSignature(payload, signature, WEBHOOK_SECRET)) {
      console.error('Invalid webhook signature');
      return res.status(401).send('Unauthorized');
    }

    // Parse event
    const event = JSON.parse(payload);
    console.log('Received event:', event.event);

    // Respond immediately
    res.status(200).send('OK');

    // Process asynchronously
    processEvent(event).catch(err => {
      console.error('Event processing failed:', err);
    });
  }
);

async function processEvent(event) {
  switch (event.event) {
    case 'lesson.completed':
      await onLessonCompleted(event.data);
      break;
    case 'achievement.unlocked':
      await onAchievementUnlocked(event.data);
      break;
    default:
      console.log('Unhandled event:', event.event);
  }
}

async function onLessonCompleted(data) {
  console.log(`User ${data.userId} completed lesson ${data.lessonId}`);
  // Your business logic here
}

async function onAchievementUnlocked(data) {
  console.log(`User ${data.userId} unlocked ${data.achievementId}`);
  // Your business logic here
}

app.listen(3000, () => {
  console.log('Webhook server running on port 3000');
});
```

## Need Help?

- Email: api@playwright-learning.com
- Developer Forum: https://community.playwright-learning.com
- Status Page: https://status.playwright-learning.com
