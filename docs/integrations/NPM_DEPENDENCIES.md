# Enterprise Integrations - NPM Dependencies

## Required Packages

Add these dependencies to your `package.json`:

```json
{
  "dependencies": {
    "@hubspot/api-client": "^10.2.0",
    "@microsoft/microsoft-graph-client": "^3.0.7",
    "axios": "^1.6.5",
    "bullmq": "^5.1.8",
    "googleapis": "^131.0.0",
    "ioredis": "^5.3.2",
    "jsforce": "^2.0.0-beta.29",
    "stripe": "^14.14.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.0"
  }
}
```

## Installation Commands

### Install All Integration Dependencies

```bash
npm install @hubspot/api-client @microsoft/microsoft-graph-client axios bullmq googleapis ioredis jsforce stripe
```

### Individual Package Installation

#### CRM Integrations
```bash
# Salesforce
npm install jsforce

# HubSpot
npm install @hubspot/api-client

# Zoho (uses axios)
npm install axios
```

#### HR/LMS Integrations
```bash
# Workday (uses axios)
npm install axios

# SAP SuccessFactors (uses axios)
npm install axios
```

#### Microsoft 365
```bash
npm install @microsoft/microsoft-graph-client
```

#### Google Workspace
```bash
npm install googleapis
```

#### Payment Gateways
```bash
# Stripe
npm install stripe

# Razorpay (uses axios + crypto - built-in)
npm install axios
```

#### Sync Service
```bash
# BullMQ for job queue
npm install bullmq

# Redis client
npm install ioredis
```

## Package Descriptions

### @hubspot/api-client
- **Version**: ^10.2.0
- **Purpose**: Official HubSpot API client
- **Features**: CRM, Marketing, Sales Hub APIs
- **Docs**: https://www.npmjs.com/package/@hubspot/api-client

### @microsoft/microsoft-graph-client
- **Version**: ^3.0.7
- **Purpose**: Microsoft Graph API client
- **Features**: Azure AD, Teams, SharePoint, OneDrive, Outlook
- **Docs**: https://www.npmjs.com/package/@microsoft/microsoft-graph-client

### axios
- **Version**: ^1.6.5
- **Purpose**: HTTP client for API calls
- **Used by**: Zoho, Workday, SAP, Razorpay, general HTTP requests
- **Docs**: https://axios-http.com/

### bullmq
- **Version**: ^5.1.8
- **Purpose**: Redis-based job queue
- **Features**: Job scheduling, retry logic, concurrency control
- **Docs**: https://docs.bullmq.io/

### googleapis
- **Version**: ^131.0.0
- **Purpose**: Google APIs Node.js client
- **Features**: Classroom, Drive, Calendar, Gmail, Meet
- **Docs**: https://www.npmjs.com/package/googleapis

### ioredis
- **Version**: ^5.3.2
- **Purpose**: Redis client for Node.js
- **Features**: BullMQ backend, caching
- **Docs**: https://github.com/redis/ioredis

### jsforce
- **Version**: ^2.0.0-beta.29
- **Purpose**: Salesforce API client
- **Features**: SOAP/REST APIs, OAuth, SOQL
- **Docs**: https://jsforce.github.io/

### stripe
- **Version**: ^14.14.0
- **Purpose**: Stripe payment processing
- **Features**: Payments, subscriptions, invoicing
- **Docs**: https://www.npmjs.com/package/stripe

## Type Definitions

Most packages include TypeScript definitions. For packages without built-in types:

```bash
npm install --save-dev @types/node
```

## Peer Dependencies

Some packages may require peer dependencies:

```bash
# If needed by Microsoft Graph Client
npm install @azure/identity

# If needed for advanced features
npm install dotenv
```

## Version Compatibility

### Node.js
- **Minimum**: Node.js 18.x
- **Recommended**: Node.js 20.x LTS
- **Tested**: Node.js 20.11.0

### Redis
- **Minimum**: Redis 6.0
- **Recommended**: Redis 7.x
- **Used by**: BullMQ job queue

### TypeScript
- **Minimum**: TypeScript 5.0
- **Recommended**: TypeScript 5.3+

## Development Dependencies

For development and testing:

```json
{
  "devDependencies": {
    "@types/jest": "^29.5.11",
    "@types/node": "^20.11.0",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.1",
    "ts-node": "^10.9.2",
    "typescript": "^5.3.3"
  }
}
```

## Optional Dependencies

For enhanced features:

```bash
# For better logging
npm install winston

# For monitoring
npm install @sentry/node

# For rate limiting
npm install express-rate-limit

# For validation
npm install joi zod
```

## Package Size Considerations

Total size of integration dependencies: ~50 MB

Individual package sizes:
- googleapis: ~15 MB (largest)
- @microsoft/microsoft-graph-client: ~8 MB
- stripe: ~5 MB
- jsforce: ~4 MB
- @hubspot/api-client: ~3 MB
- bullmq: ~2 MB
- ioredis: ~2 MB
- axios: ~500 KB

## Security Considerations

### Keep Packages Updated

```bash
# Check for updates
npm outdated

# Update packages
npm update

# Audit for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

### Recommended Security Tools

```bash
# Snyk for vulnerability scanning
npm install -g snyk
snyk test

# npm-check for dependency updates
npm install -g npm-check
npm-check
```

## Production Optimization

### Bundle Size Optimization

```json
{
  "scripts": {
    "build": "tsc",
    "bundle": "webpack --mode production"
  }
}
```

### Tree Shaking

Import only what you need:

```typescript
// Good - imports specific functions
import { Client } from '@microsoft/microsoft-graph-client';

// Avoid - imports entire module
import * as MicrosoftGraph from '@microsoft/microsoft-graph-client';
```

## Docker Considerations

When using Docker, optimize your Dockerfile:

```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
CMD ["node", "dist/server.js"]
```

## Common Installation Issues

### Issue: jsforce installation fails

**Solution:**
```bash
# Use specific version
npm install jsforce@2.0.0-beta.29

# Or use legacy peer deps
npm install --legacy-peer-deps
```

### Issue: Redis connection fails

**Solution:**
```bash
# Start Redis first
docker run -d -p 6379:6379 redis:latest

# Or use Redis Cloud (free tier)
# Update REDIS_HOST and REDIS_PASSWORD in .env
```

### Issue: Google APIs authorization fails

**Solution:**
```bash
# Ensure redirect URI matches exactly
# Check OAuth consent screen configuration
# Verify scopes are enabled
```

## Continuous Integration

For CI/CD pipelines:

```yaml
# .github/workflows/test.yml
- name: Install dependencies
  run: npm ci

- name: Start Redis
  run: docker run -d -p 6379:6379 redis:latest

- name: Run integration tests
  run: npm run test:integration
  env:
    REDIS_HOST: localhost
    REDIS_PORT: 6379
```

## Alternative Package Managers

### Using Yarn

```bash
yarn add @hubspot/api-client @microsoft/microsoft-graph-client axios bullmq googleapis ioredis jsforce stripe
```

### Using pnpm

```bash
pnpm add @hubspot/api-client @microsoft/microsoft-graph-client axios bullmq googleapis ioredis jsforce stripe
```

## License Information

All packages use permissive licenses:
- MIT: Most packages
- Apache 2.0: googleapis, @microsoft/microsoft-graph-client
- ISC: Some packages

Check individual package licenses:
```bash
npm list --depth=0 --json | jq '.dependencies[].license'
```

## Support

For package-specific issues:
- Check package documentation
- Search GitHub issues
- Contact package maintainers

For integration issues:
- Email: support@example.com
- Documentation: https://docs.example.com
