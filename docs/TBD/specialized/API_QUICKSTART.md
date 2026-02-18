# API Quick Start Guide

Get started with the Playwright & Selenium Learning Platform API in minutes.

## Step 1: Get Your API Key

1. Sign up at https://app.playwright-learning.com
2. Navigate to **Developer Portal** in your account settings
3. Click "Create API Key"
4. Name your key and select scopes
5. Copy your API key (it will only be shown once!)

## Step 2: Make Your First Request

### Using cURL

```bash
curl -X GET "https://api.playwright-learning.com/v1/users/me" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Using JavaScript

```javascript
const response = await fetch('https://api.playwright-learning.com/v1/users/me', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});

const data = await response.json();
console.log(data);
```

### Using Python

```python
import requests

response = requests.get(
    'https://api.playwright-learning.com/v1/users/me',
    headers={'Authorization': 'Bearer YOUR_API_KEY'}
)

data = response.json()
print(data)
```

## Step 3: Use Our SDKs

### JavaScript/TypeScript

```bash
npm install @playwright-learning/api-sdk
```

```typescript
import { PlaywrightLearningSDK } from '@playwright-learning/api-sdk';

const sdk = new PlaywrightLearningSDK({
  apiKey: 'YOUR_API_KEY'
});

const user = await sdk.getCurrentUser();
console.log(user);
```

### Python

```bash
pip install playwright-learning-sdk
```

```python
from playwright_learning import PlaywrightLearningSDK

sdk = PlaywrightLearningSDK(api_key='YOUR_API_KEY')
user = sdk.get_current_user()
print(user)
```

### PHP

```bash
composer require playwright-learning/api-sdk
```

```php
<?php
use PlaywrightLearning\SDK\PlaywrightLearningSDK;

$sdk = new PlaywrightLearningSDK(apiKey: 'YOUR_API_KEY');
$user = $sdk->getCurrentUser();
print_r($user);
```

## Step 4: Set Up Webhooks

Create a webhook to receive real-time notifications:

```javascript
const webhook = await sdk.createWebhook({
  url: 'https://your-app.com/webhooks',
  events: ['lesson.completed', 'quiz.passed', 'achievement.unlocked']
});

console.log('Webhook created:', webhook.data.webhook.id);
console.log('Secret (save this!):', webhook.data.secret);
```

## Step 5: Verify Webhook Signatures

Always verify webhook signatures in your webhook handler:

```javascript
// Express.js example
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-webhook-signature'].replace('sha256=', '');
  const payload = JSON.stringify(req.body);

  if (PlaywrightLearningSDK.verifyWebhookSignature(payload, signature, WEBHOOK_SECRET)) {
    // Process webhook event
    const event = req.body;
    console.log('Event received:', event.event, event.data);
    res.status(200).send('OK');
  } else {
    res.status(401).send('Invalid signature');
  }
});
```

## Common Use Cases

### Track User Progress

```javascript
const progress = await sdk.getCurrentUser();
console.log(`Lessons completed: ${progress.data.lessonsCompleted}`);
```

### Create Webhooks for Notifications

```javascript
const webhook = await sdk.createWebhook({
  url: 'https://your-app.com/webhooks',
  events: ['lesson.completed', 'achievement.unlocked'],
  description: 'Production webhook'
});
```

### Monitor API Usage

```javascript
const apiKeys = await sdk.listApiKeys();
for (const key of apiKeys.data) {
  const usage = await sdk.getApiKeyUsage(key.id);
  console.log(`${key.name}: ${usage.data.usageCount}/${usage.data.rateLimit} requests`);
}
```

## Next Steps

- Read the [complete API documentation](/docs/API_REFERENCE.md)
- Explore the [webhook guide](/docs/WEBHOOK_GUIDE.md)
- Browse the [SDK documentation](/docs/SDK_DOCUMENTATION.md)
- Join our [developer community](https://community.playwright-learning.com)

## Need Help?

- Documentation: https://api.playwright-learning.com/docs
- Support: api@playwright-learning.com
- Status Page: https://status.playwright-learning.com
