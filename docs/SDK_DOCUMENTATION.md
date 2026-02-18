# SDK Documentation

Official SDKs for the Playwright & Selenium Learning Platform API.

## Available SDKs

- [JavaScript/TypeScript](#javascripttypescript)
- [Python](#python)
- [PHP](#php)

---

## JavaScript/TypeScript

### Installation

```bash
npm install @playwright-learning/api-sdk
# or
yarn add @playwright-learning/api-sdk
```

### Quick Start

```typescript
import { PlaywrightLearningSDK } from '@playwright-learning/api-sdk';

const sdk = new PlaywrightLearningSDK({
  apiKey: 'YOUR_API_KEY',
  baseURL: 'https://api.playwright-learning.com/v1', // optional
  timeout: 30000, // optional, default: 30s
  maxRetries: 3, // optional, default: 3
});
```

### User Operations

```typescript
// Get current user
const user = await sdk.getCurrentUser();
console.log(user.data);

// Update current user
const updated = await sdk.updateCurrentUser({
  firstName: 'Jane',
  lastName: 'Doe',
  settings: {
    theme: 'dark',
    language: 'en'
  }
});

// Get user by ID
const otherUser = await sdk.getUserById('user_123');
```

### API Key Management

```typescript
// Create API key
const { data } = await sdk.createApiKey({
  name: 'Production Key',
  environment: 'production',
  scopes: ['users:read', 'lessons:read'],
  rateLimit: 5000
});
console.log('New API key:', data.key); // Save this!

// List API keys
const keys = await sdk.listApiKeys();

// Get API key usage
const usage = await sdk.getApiKeyUsage('key_123');
console.log(`Usage: ${usage.data.usageCount}/${usage.data.rateLimit}`);

// Rotate API key
const rotated = await sdk.rotateApiKey('key_123');
console.log('New key:', rotated.data.key);

// Revoke API key
await sdk.revokeApiKey('key_123');
```

### Webhook Management

```typescript
// Create webhook
const webhook = await sdk.createWebhook({
  url: 'https://your-app.com/webhooks',
  events: ['lesson.completed', 'quiz.passed'],
  description: 'Production webhook'
});
console.log('Secret:', webhook.data.secret); // Save this!

// List webhooks
const webhooks = await sdk.listWebhooks();

// Test webhook
const testResult = await sdk.testWebhook('webhook_123');

// Get webhook events
const events = await sdk.listWebhookEvents('webhook_123', {
  status: 'failed',
  page: 1,
  limit: 50
});

// Get webhook stats
const stats = await sdk.getWebhookStats('webhook_123');
console.log(`Success rate: ${stats.data.successRate}%`);
```

### Webhook Signature Verification

```typescript
// Express.js example
import express from 'express';
import { PlaywrightLearningSDK } from '@playwright-learning/api-sdk';

app.post('/webhook', express.json(), (req, res) => {
  const signature = req.headers['x-webhook-signature'].replace('sha256=', '');
  const payload = JSON.stringify(req.body);

  if (PlaywrightLearningSDK.verifyWebhookSignature(payload, signature, WEBHOOK_SECRET)) {
    // Process webhook
    res.status(200).send('OK');
  } else {
    res.status(401).send('Invalid signature');
  }
});
```

### Error Handling

```typescript
try {
  const user = await sdk.getCurrentUser();
} catch (error) {
  console.error('API error:', error.message);
  // Error contains the API error message
}
```

---

## Python

### Installation

```bash
pip install playwright-learning-sdk
```

### Quick Start

```python
from playwright_learning import PlaywrightLearningSDK

sdk = PlaywrightLearningSDK(
    api_key='YOUR_API_KEY',
    base_url='https://api.playwright-learning.com/v1',  # optional
    timeout=30,  # optional, default: 30s
    max_retries=3  # optional, default: 3
)
```

### User Operations

```python
# Get current user
user = sdk.get_current_user()
print(user['data'])

# Update current user
updated = sdk.update_current_user(
    first_name='Jane',
    last_name='Doe',
    settings={'theme': 'dark'}
)

# Get user by ID
other_user = sdk.get_user_by_id('user_123')
```

### API Key Management

```python
# Create API key
result = sdk.create_api_key(
    name='Production Key',
    environment='production',
    scopes=['users:read', 'lessons:read'],
    rate_limit=5000
)
print(f"New API key: {result['data']['key']}")

# List API keys
keys = sdk.list_api_keys()

# Get API key usage
usage = sdk.get_api_key_usage('key_123')
print(f"Usage: {usage['data']['usageCount']}/{usage['data']['rateLimit']}")

# Rotate API key
rotated = sdk.rotate_api_key('key_123')

# Revoke API key
sdk.revoke_api_key('key_123')
```

### Webhook Management

```python
# Create webhook
webhook = sdk.create_webhook(
    url='https://your-app.com/webhooks',
    events=['lesson.completed', 'quiz.passed'],
    description='Production webhook'
)
print(f"Secret: {webhook['data']['secret']}")

# List webhooks
webhooks = sdk.list_webhooks()

# Test webhook
test_result = sdk.test_webhook('webhook_123')

# Get webhook events
events = sdk.list_webhook_events(
    'webhook_123',
    status='failed',
    page=1,
    limit=50
)

# Get webhook stats
stats = sdk.get_webhook_stats('webhook_123')
print(f"Success rate: {stats['data']['successRate']}%")
```

### Webhook Signature Verification

```python
from flask import Flask, request
from playwright_learning import PlaywrightLearningSDK
import json

app = Flask(__name__)

@app.route('/webhook', methods=['POST'])
def webhook():
    signature = request.headers.get('X-Webhook-Signature').replace('sha256=', '')
    payload = json.dumps(request.json, separators=(',', ':'))

    if PlaywrightLearningSDK.verify_webhook_signature(payload, signature, WEBHOOK_SECRET):
        # Process webhook
        return 'OK', 200
    else:
        return 'Invalid signature', 401
```

### Error Handling

```python
try:
    user = sdk.get_current_user()
except Exception as e:
    print(f"API error: {str(e)}")
```

---

## PHP

### Installation

```bash
composer require playwright-learning/api-sdk
```

### Quick Start

```php
<?php
use PlaywrightLearning\SDK\PlaywrightLearningSDK;

$sdk = new PlaywrightLearningSDK(
    apiKey: 'YOUR_API_KEY',
    baseUrl: 'https://api.playwright-learning.com/v1', // optional
    timeout: 30, // optional, default: 30s
    maxRetries: 3 // optional, default: 3
);
```

### User Operations

```php
// Get current user
$user = $sdk->getCurrentUser();
print_r($user['data']);

// Update current user
$updated = $sdk->updateCurrentUser([
    'firstName' => 'Jane',
    'lastName' => 'Doe',
    'settings' => ['theme' => 'dark']
]);

// Get user by ID
$otherUser = $sdk->getUserById('user_123');
```

### API Key Management

```php
// Create API key
$result = $sdk->createApiKey([
    'name' => 'Production Key',
    'environment' => 'production',
    'scopes' => ['users:read', 'lessons:read'],
    'rateLimit' => 5000
]);
echo "New API key: {$result['data']['key']}\n";

// List API keys
$keys = $sdk->listApiKeys();

// Get API key usage
$usage = $sdk->getApiKeyUsage('key_123');
echo "Usage: {$usage['data']['usageCount']}/{$usage['data']['rateLimit']}\n";

// Rotate API key
$rotated = $sdk->rotateApiKey('key_123');

// Revoke API key
$sdk->revokeApiKey('key_123');
```

### Webhook Management

```php
// Create webhook
$webhook = $sdk->createWebhook([
    'url' => 'https://your-app.com/webhooks',
    'events' => ['lesson.completed', 'quiz.passed'],
    'description' => 'Production webhook'
]);
echo "Secret: {$webhook['data']['secret']}\n";

// List webhooks
$webhooks = $sdk->listWebhooks();

// Test webhook
$testResult = $sdk->testWebhook('webhook_123');

// Get webhook events
$events = $sdk->listWebhookEvents(
    'webhook_123',
    status: 'failed',
    page: 1,
    limit: 50
);

// Get webhook stats
$stats = $sdk->getWebhookStats('webhook_123');
echo "Success rate: {$stats['data']['successRate']}%\n";
```

### Webhook Signature Verification

```php
<?php
// Laravel example
Route::post('/webhook', function (Request $request) {
    $signature = str_replace('sha256=', '', $request->header('X-Webhook-Signature'));
    $payload = json_encode($request->json()->all());

    if (PlaywrightLearningSDK::verifyWebhookSignature($payload, $signature, env('WEBHOOK_SECRET'))) {
        // Process webhook
        return response('OK', 200);
    } else {
        return response('Invalid signature', 401);
    }
});
```

### Error Handling

```php
try {
    $user = $sdk->getCurrentUser();
} catch (Exception $e) {
    echo "API error: {$e->getMessage()}\n";
}
```

---

## Common Patterns

### Pagination

All SDKs support pagination for list endpoints:

```javascript
// JavaScript
const events = await sdk.listWebhookEvents('webhook_123', {
  page: 2,
  limit: 100
});
```

```python
# Python
events = sdk.list_webhook_events('webhook_123', page=2, limit=100)
```

```php
// PHP
$events = $sdk->listWebhookEvents('webhook_123', page: 2, limit: 100);
```

### Error Handling

All SDKs throw exceptions on API errors:

```javascript
// JavaScript
try {
  await sdk.createApiKey({ /* ... */ });
} catch (error) {
  console.error('API Error:', error.message);
}
```

```python
# Python
try:
    sdk.create_api_key(...)
except Exception as e:
    print(f'API Error: {str(e)}')
```

```php
// PHP
try {
    $sdk->createApiKey([...]);
} catch (Exception $e) {
    echo "API Error: {$e->getMessage()}\n";
}
```

### Retries

All SDKs automatically retry failed requests with exponential backoff:

- Retry 1: After 1 second
- Retry 2: After 2 seconds
- Retry 3: After 3 seconds

Configure max retries:

```javascript
const sdk = new PlaywrightLearningSDK({
  apiKey: 'YOUR_KEY',
  maxRetries: 5 // default: 3
});
```

---

## Examples

### Complete Integration Example

```javascript
// JavaScript/TypeScript
import { PlaywrightLearningSDK } from '@playwright-learning/api-sdk';
import express from 'express';

const sdk = new PlaywrightLearningSDK({
  apiKey: process.env.API_KEY
});

const app = express();

// Setup webhook
async function setupWebhook() {
  const webhook = await sdk.createWebhook({
    url: 'https://myapp.com/webhooks',
    events: ['lesson.completed', 'achievement.unlocked']
  });

  console.log('Webhook created:', webhook.data.webhook.id);
  // Store webhook.data.secret in environment
}

// Handle webhook events
app.post('/webhooks', express.json(), (req, res) => {
  const signature = req.headers['x-webhook-signature'].replace('sha256=', '');
  const payload = JSON.stringify(req.body);

  if (!PlaywrightLearningSDK.verifyWebhookSignature(
    payload,
    signature,
    process.env.WEBHOOK_SECRET
  )) {
    return res.status(401).send('Invalid signature');
  }

  const { event, data } = req.body;

  switch (event) {
    case 'lesson.completed':
      console.log(`User ${data.userId} completed lesson ${data.lessonId}`);
      break;
    case 'achievement.unlocked':
      console.log(`User ${data.userId} unlocked ${data.achievementId}`);
      break;
  }

  res.status(200).send('OK');
});

// Monitor API usage
async function monitorUsage() {
  const keys = await sdk.listApiKeys();

  for (const key of keys.data) {
    const usage = await sdk.getApiKeyUsage(key.id);
    const percentUsed = (usage.data.usageCount / usage.data.rateLimit) * 100;

    if (percentUsed > 80) {
      console.warn(`API key ${key.name} at ${percentUsed}% usage`);
    }
  }
}

// Run setup
setupWebhook();
setInterval(monitorUsage, 60 * 60 * 1000); // Every hour

app.listen(3000);
```

---

## Support

- Documentation: https://api.playwright-learning.com/docs
- GitHub Issues: https://github.com/playwright-learning/api-sdks
- Email: api@playwright-learning.com
