# Environment Variables Configuration

## Frontend Environment Variables

### Development (.env.local)

```bash
# API Configuration
VITE_API_URL=http://localhost:3000
VITE_ENV=development

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_SENTRY=false

# Debug
VITE_DEBUG=true
```

### Staging (.env.staging)

```bash
# API Configuration
VITE_API_URL=https://api-staging.playwright-selenium-learning.com
VITE_ENV=staging

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_SENTRY=true

# Analytics
VITE_ANALYTICS_ID=GA-XXXXXXXXXX

# Sentry
VITE_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx

# Debug
VITE_DEBUG=false
```

### Production (.env.production)

```bash
# API Configuration
VITE_API_URL=https://api.playwright-selenium-learning.com
VITE_ENV=production

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_SENTRY=true

# Analytics
VITE_ANALYTICS_ID=GA-XXXXXXXXXX

# Sentry
VITE_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx

# Debug
VITE_DEBUG=false
```

## Backend Environment Variables

### Development (.env)

```bash
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://localhost:5432/playwright_learning_dev
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# Authentication
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=http://localhost:5173

# Email (Optional)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-pass
FROM_EMAIL=noreply@example.com

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=debug
```

### Staging (.env.staging)

```bash
# Server
PORT=3000
NODE_ENV=staging

# Database
DATABASE_URL=postgresql://user:pass@host:5432/playwright_learning_staging
DATABASE_POOL_MIN=5
DATABASE_POOL_MAX=20

# Authentication
JWT_SECRET=your-staging-secret-key
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=https://staging.playwright-selenium-learning.com

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
FROM_EMAIL=noreply@playwright-selenium-learning.com

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=/var/uploads

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info

# Sentry
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
```

### Production (.env.production)

```bash
# Server
PORT=3000
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:pass@host:5432/playwright_learning_prod
DATABASE_POOL_MIN=10
DATABASE_POOL_MAX=50

# Authentication
JWT_SECRET=your-production-secret-key-super-secure
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=https://playwright-selenium-learning.com

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
FROM_EMAIL=noreply@playwright-selenium-learning.com

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=/var/uploads

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=1000

# Logging
LOG_LEVEL=warn

# Sentry
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx

# Redis (for sessions/cache)
REDIS_URL=redis://user:pass@host:6379
```

## GitHub Secrets

Required secrets for GitHub Actions:

### Deployment Secrets

```bash
# Vercel
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id

# API URLs
STAGING_API_URL=https://api-staging.playwright-selenium-learning.com
PRODUCTION_API_URL=https://api.playwright-selenium-learning.com

# Database URLs (if needed)
STAGING_DATABASE_URL=postgresql://user:pass@host:5432/db_staging
PRODUCTION_DATABASE_URL=postgresql://user:pass@host:5432/db_prod
```

### Notification Secrets

```bash
# Slack
SLACK_WEBHOOK=https://hooks.slack.com/services/xxx/xxx/xxx

# Discord (Optional)
DISCORD_WEBHOOK=https://discord.com/api/webhooks/xxx/xxx
```

### Security Scanning Secrets

```bash
# Snyk
SNYK_TOKEN=your-snyk-token

# Codecov
CODECOV_TOKEN=your-codecov-token
```

## Playwright Configuration

### Environment Variables for Tests

```bash
# E2E Test Configuration
PLAYWRIGHT_BASE_URL=http://localhost:5173

# Test User Credentials
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=testpass123

# API Mock Server
MOCK_API_URL=http://localhost:3001

# Browser Configuration
PLAYWRIGHT_BROWSER=chromium
PLAYWRIGHT_HEADLESS=true

# Screenshot/Video
PLAYWRIGHT_SCREENSHOTS=on
PLAYWRIGHT_VIDEOS=on-first-retry
```

## Setting Environment Variables

### Local Development

1. Create `.env` file in project root:
   ```bash
   cp .env.example .env
   ```

2. Update with your values:
   ```bash
   nano .env
   ```

### GitHub Actions

1. Using GitHub CLI:
   ```bash
   gh secret set SECRET_NAME --body "secret-value"
   ```

2. Using GitHub UI:
   - Go to Settings > Secrets and variables > Actions
   - Click "New repository secret"
   - Add name and value

### Vercel Deployment

1. Using Vercel CLI:
   ```bash
   vercel env add VARIABLE_NAME
   ```

2. Using Vercel Dashboard:
   - Go to Project Settings > Environment Variables
   - Add variable for each environment

## Environment Variable Best Practices

### Security

1. **Never commit secrets to Git**
   - Use `.gitignore` for `.env` files
   - Use secret management tools

2. **Use different secrets per environment**
   - Development secrets != Production secrets
   - Rotate secrets regularly

3. **Minimize secret exposure**
   - Only share with necessary team members
   - Use secret scanning tools

### Naming Conventions

1. **Use UPPERCASE with underscores**
   ```bash
   GOOD: DATABASE_URL
   BAD: databaseUrl
   ```

2. **Prefix with app identifier**
   ```bash
   VITE_API_URL      # Frontend
   REACT_APP_API_URL # Create React App
   NEXT_PUBLIC_      # Next.js
   ```

3. **Group related variables**
   ```bash
   # Database group
   DATABASE_URL
   DATABASE_POOL_MIN
   DATABASE_POOL_MAX

   # Email group
   SMTP_HOST
   SMTP_PORT
   SMTP_USER
   ```

### Documentation

1. **Provide `.env.example` file**
   ```bash
   # Copy this to .env and update values
   DATABASE_URL=postgresql://localhost:5432/db
   JWT_SECRET=change-this-secret
   ```

2. **Document all variables**
   - Add comments in example file
   - Keep documentation up to date
   - Include default values

3. **List required vs optional**
   ```bash
   # Required
   DATABASE_URL=

   # Optional
   REDIS_URL=
   ```

## Troubleshooting

### Variable Not Loading

1. **Check file name**
   - Must be `.env` (with dot)
   - Check for typos

2. **Restart development server**
   ```bash
   npm run dev
   ```

3. **Check prefix for frontend**
   - Vite: `VITE_`
   - Create React App: `REACT_APP_`
   - Next.js: `NEXT_PUBLIC_`

### Wrong Value in Production

1. **Check environment-specific files**
   - `.env.production` overrides `.env`

2. **Verify deployment platform variables**
   - Check Vercel dashboard
   - Check environment settings

3. **Clear build cache**
   ```bash
   rm -rf .next
   rm -rf dist
   npm run build
   ```

### Security Issues

1. **Secret committed to Git**
   ```bash
   # Remove from Git history
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env" \
     --prune-empty --tag-name-filter cat -- --all

   # Rotate the exposed secret immediately
   ```

2. **Secret in logs**
   - Never log environment variables
   - Sanitize logs before outputting
   - Use log filtering

## References

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [12-Factor App Config](https://12factor.net/config)
