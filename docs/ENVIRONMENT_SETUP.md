# Environment Setup Guide

## Table of Contents

1. [Overview](#overview)
2. [Environment Types](#environment-types)
3. [Frontend Configuration](#frontend-configuration)
4. [Backend Configuration](#backend-configuration)
5. [Database Setup](#database-setup)
6. [External Services](#external-services)
7. [Security Configuration](#security-configuration)
8. [Verification](#verification)

## Overview

This guide covers environment configuration for all deployment environments of the Playwright & Selenium Learning Platform.

### Configuration Files

```
project/
├── config/
│   └── production.env.example    # Production template
├── backend/
│   ├── .env.development          # Local development
│   ├── .env.staging              # Staging (git-ignored)
│   └── .env.production           # Production (git-ignored)
└── frontend/
    ├── .env.development
    ├── .env.staging              # Git-ignored
    └── .env.production           # Git-ignored
```

## Environment Types

### Development

**Purpose**: Local development
**Database**: Local MongoDB or Atlas free tier
**Debugging**: Enabled
**Logging**: Verbose

### Staging

**Purpose**: Pre-production testing
**Database**: Staging cluster (separate from production)
**Debugging**: Limited
**Logging**: Info level

### Production

**Purpose**: Live user environment
**Database**: Production cluster with backups
**Debugging**: Disabled
**Logging**: Error and warning only

## Frontend Configuration

### Vercel Environment Variables

Set these in the Vercel dashboard or via CLI:

```bash
# Login to Vercel
vercel login

# Navigate to frontend directory
cd frontend

# Add environment variables
vercel env add VITE_API_BASE_URL production
# Enter: https://api.playwright-learning.com

vercel env add VITE_ENABLE_ANALYTICS production
# Enter: true

vercel env add VITE_SENTRY_DSN production
# Enter: https://...@sentry.io/...

vercel env add VITE_GA_TRACKING_ID production
# Enter: G-XXXXXXXXXX
```

### Complete Frontend Environment Variables

Create `frontend/.env.production`:

```bash
# API Configuration
VITE_API_BASE_URL=https://api.playwright-learning.com
VITE_API_TIMEOUT=30000

# App Configuration
VITE_APP_NAME=Playwright & Selenium Learning Platform
VITE_APP_VERSION=1.0.0
VITE_ENV=production

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_SENTRY=true
VITE_ENABLE_PWA=true
VITE_ENABLE_OFFLINE_MODE=true

# Analytics
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Error Tracking
VITE_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
VITE_SENTRY_ENVIRONMENT=production
VITE_SENTRY_TRACES_SAMPLE_RATE=0.1

# Debug Mode (disable in production)
VITE_DEBUG=false

# CDN
VITE_CDN_URL=https://cdn.playwright-learning.com

# WebSocket
VITE_WS_URL=wss://api.playwright-learning.com
```

### Setting Variables in Vercel Dashboard

1. Go to https://vercel.com/[your-team]/playwright-learning
2. Click "Settings" tab
3. Click "Environment Variables" in sidebar
4. Add each variable:
   - **Key**: Variable name (e.g., `VITE_API_BASE_URL`)
   - **Value**: Variable value
   - **Environment**: Select "Production" and/or "Preview"
5. Click "Save"

## Backend Configuration

### Railway Environment Variables

Set these in Railway dashboard or via CLI:

```bash
# Login to Railway
railway login

# Link to project
railway link [project-id]

# Set environment
railway environment production

# Add variables
railway variables set NODE_ENV=production
railway variables set PORT=5000
railway variables set MONGODB_URI="mongodb+srv://..."
railway variables set JWT_SECRET="[strong-random-string]"
railway variables set REFRESH_TOKEN_SECRET="[another-strong-string]"
railway variables set CLIENT_URL="https://playwright-learning.com"

# Add email service variables
railway variables set SENDGRID_API_KEY="SG...."
railway variables set SENDGRID_FROM_EMAIL="noreply@playwright-learning.com"

# Add AWS credentials
railway variables set AWS_ACCESS_KEY_ID="AKIA..."
railway variables set AWS_SECRET_ACCESS_KEY="..."
railway variables set AWS_S3_BUCKET="playwright-learning-prod"

# Add Sentry
railway variables set SENTRY_DSN="https://...@sentry.io/..."

# View all variables
railway variables list
```

### Complete Backend Environment Variables

Create `backend/.env.production`:

```bash
# Server Configuration
NODE_ENV=production
PORT=5000
API_VERSION=v1

# URLs
BACKEND_URL=https://api.playwright-learning.com
FRONTEND_URL=https://playwright-learning.com
CLIENT_URL=https://playwright-learning.com

# Database
MONGODB_URI=mongodb+srv://prod_user:STRONG_PASSWORD@cluster0.xxxxx.mongodb.net/playwright-learning-prod?retryWrites=true&w=majority
MONGODB_MAX_POOL_SIZE=100

# JWT & Auth
JWT_SECRET=CHANGE_ME_STRONG_RANDOM_STRING_MIN_256_BITS
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=CHANGE_ME_DIFFERENT_STRONG_STRING
REFRESH_TOKEN_EXPIRES_IN=7d

# CORS
ALLOWED_ORIGINS=https://playwright-learning.com,https://www.playwright-learning.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email (SendGrid)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@playwright-learning.com
SENDGRID_FROM_NAME=Playwright Learning Platform

# Storage (AWS S3)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_S3_BUCKET=playwright-learning-prod

# Cache (Redis)
REDIS_URL=redis://default:password@redis-xxxx.railway.internal:6379

# Monitoring (Sentry)
SENTRY_DSN=https://xxxxxxxxxxxxxxxx@oxxxxxx.ingest.sentry.io/xxxxxxx
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1

# Feature Flags
ENABLE_ANALYTICS=true
ENABLE_SENTRY=true
ENABLE_TWO_FACTOR_AUTH=true

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
```

### Render Environment Variables

If using Render instead of Railway:

1. Go to https://dashboard.render.com
2. Select your service
3. Go to "Environment" tab
4. Add environment variables (same as above)
5. Click "Save Changes"

Or use `render.yaml` (already created) which Render will read automatically.

## Database Setup

### MongoDB Atlas Production Cluster

#### Step 1: Create Cluster

1. Go to https://cloud.mongodb.com
2. Click "Build a Cluster"
3. Choose provider: **AWS** (or your preferred cloud)
4. Region: **us-east-1** (same region as backend)
5. Cluster Tier: **M10** or higher (for production)
6. Cluster Name: **playwright-learning-prod**
7. Click "Create Cluster"

#### Step 2: Configure Security

1. **Database Access**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Username: `prod_user`
   - Password: Generate strong password
   - Database User Privileges: "Read and write to any database"
   - Add temporary user restriction (optional)

2. **Network Access**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Add: `0.0.0.0/0` (Railway/Render)
   - Or add specific Railway/Render IPs
   - Description: "Railway Backend"

#### Step 3: Get Connection String

1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Driver: **Node.js**
4. Copy connection string:
   ```
   mongodb+srv://prod_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with actual password
6. Add database name: `/playwright-learning-prod`

#### Step 4: Configure Backups

1. Go to cluster settings
2. Enable "Continuous Backup"
3. Retention: **30 days**
4. Point-in-time restore: **Enabled**
5. Snapshot schedule: **Daily at 02:00 UTC**

#### Step 5: Set up Monitoring

1. Enable alerts for:
   - High connection count (> 80)
   - Low disk space (< 20%)
   - Replication lag (> 10s)
   - Query performance issues
2. Add alert email: ops@playwright-learning.com

### Database Indexes

Create indexes for optimal performance:

```javascript
// Connect to production database
use playwright-learning-prod

// Users collection
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ username: 1 }, { unique: true })
db.users.createIndex({ createdAt: -1 })

// Lessons collection
db.lessons.createIndex({ category: 1, difficulty: 1 })
db.lessons.createIndex({ status: 1 })
db.lessons.createIndex({ title: "text", description: "text" })

// Progress collection
db.progress.createIndex({ userId: 1, lessonId: 1 }, { unique: true })
db.progress.createIndex({ userId: 1, completedAt: -1 })

// Quiz results
db.quizResults.createIndex({ userId: 1, quizId: 1, createdAt: -1 })

// Flashcards
db.flashcards.createIndex({ userId: 1, nextReview: 1 })

// Sessions
db.sessions.createIndex({ token: 1 }, { unique: true })
db.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
```

## External Services

### Email Service (SendGrid)

#### Setup

1. Go to https://sendgrid.com
2. Create account or login
3. Navigate to "Settings" > "API Keys"
4. Click "Create API Key"
5. Name: "Playwright Learning Production"
6. Permissions: "Full Access" (or restricted)
7. Copy API key (starts with `SG.`)
8. Add to environment: `SENDGRID_API_KEY`

#### Configure Sender

1. Go to "Settings" > "Sender Authentication"
2. Verify domain: `playwright-learning.com`
3. Add DNS records (SPF, DKIM)
4. Set FROM email: `noreply@playwright-learning.com`

#### Email Templates

Create transactional email templates:

1. **Welcome Email** (ID: `d-xxxxxx`)
2. **Email Verification** (ID: `d-xxxxxx`)
3. **Password Reset** (ID: `d-xxxxxx`)
4. **Weekly Digest** (ID: `d-xxxxxx`)

Add template IDs to environment variables.

### Cloud Storage (AWS S3)

#### Setup

1. Go to AWS Console > S3
2. Create bucket: `playwright-learning-prod`
3. Region: `us-east-1`
4. Block public access: **Off** (for public assets)
5. Versioning: **Enabled**
6. Enable server-side encryption

#### IAM User

1. Go to IAM > Users
2. Create user: `playwright-learning-prod`
3. Attach policy: `AmazonS3FullAccess` (or custom restrictive policy)
4. Create access key
5. Save Access Key ID and Secret Access Key

#### Bucket Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::playwright-learning-prod/public/*"
    }
  ]
}
```

#### CloudFront CDN (Optional)

1. Create CloudFront distribution
2. Origin: S3 bucket
3. Enable HTTPS only
4. Add custom domain: `cdn.playwright-learning.com`
5. Add SSL certificate (AWS Certificate Manager)

### Error Tracking (Sentry)

#### Setup

1. Go to https://sentry.io
2. Create project: "playwright-learning"
3. Platform: **Node.js** (backend) and **React** (frontend)
4. Copy DSN
5. Add to environment variables

#### Configure

```javascript
// Already implemented in backend/src/server.ts
// and frontend/src/main.tsx

// Just add DSN to environment:
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
```

#### Set up Alerts

1. Go to Project Settings > Alerts
2. Create alert rule:
   - **Name**: "High Error Rate"
   - **Condition**: Error count > 10 in 1 hour
   - **Action**: Email ops@playwright-learning.com
3. Create alert rule:
   - **Name**: "Critical Error"
   - **Condition**: Error level = fatal
   - **Action**: Slack notification

### Monitoring (UptimeRobot)

#### Setup

1. Go to https://uptimerobot.com
2. Add Monitor:
   - **Type**: HTTPS
   - **Name**: "Playwright Learning Frontend"
   - **URL**: https://playwright-learning.com
   - **Interval**: 5 minutes
3. Add Monitor:
   - **Type**: HTTPS
   - **Name**: "Playwright Learning API"
   - **URL**: https://api.playwright-learning.com/health
   - **Interval**: 5 minutes
4. Configure alerts:
   - Email: ops@playwright-learning.com
   - Webhook: Slack webhook URL

## Security Configuration

### SSL/TLS Certificates

#### Vercel (Frontend)

- Automatic SSL via Let's Encrypt
- No configuration needed
- Auto-renewal enabled

#### Railway (Backend)

- Automatic SSL for `*.up.railway.app`
- For custom domain:
  1. Add custom domain in Railway dashboard
  2. Add DNS CNAME record
  3. SSL auto-provisioned

### Security Headers

Already configured in:
- `vercel.json` for frontend
- `nginx.conf` if using Nginx
- Backend middleware (`helmet`)

### CORS Configuration

In backend `.env.production`:

```bash
CLIENT_URL=https://playwright-learning.com
ALLOWED_ORIGINS=https://playwright-learning.com,https://www.playwright-learning.com
CORS_CREDENTIALS=true
```

### Rate Limiting

Configured in backend:
- Global: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 15 minutes
- API endpoints: 60 requests per minute

Adjust in environment variables:

```bash
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=5
```

### Secret Management

#### Generate Strong Secrets

```bash
# Generate JWT secret (256-bit)
openssl rand -base64 64

# Generate another for refresh token
openssl rand -base64 64

# Generate session secret
openssl rand -base64 32
```

Add to environment variables (never commit):

```bash
JWT_SECRET=[generated-secret-1]
REFRESH_TOKEN_SECRET=[generated-secret-2]
SESSION_SECRET=[generated-secret-3]
```

#### Secret Rotation

1. Generate new secrets
2. Add as `NEW_JWT_SECRET`
3. Update code to accept both old and new
4. Deploy
5. After 24 hours, remove old secret
6. Rename `NEW_JWT_SECRET` to `JWT_SECRET`

## Verification

### Frontend Verification

```bash
# Build locally with production env
cd frontend
cp .env.production .env
npm run build

# Preview build
npm run preview

# Check environment variables are loaded
# Open browser console:
# window.__ENV__ (if exposed)

# Or check network requests
# Should call https://api.playwright-learning.com
```

### Backend Verification

```bash
# Test locally with production env (CAREFUL!)
cd backend
cp .env.production .env
npm run build
npm start

# Check environment variables
node -e "require('dotenv').config(); console.log(process.env.NODE_ENV)"

# Test API
curl http://localhost:5000/health
```

### Database Connection Test

```bash
# Test MongoDB connection
mongosh "mongodb+srv://prod_user:password@cluster0.xxxxx.mongodb.net/playwright-learning-prod"

# Run test query
db.users.countDocuments()

# Check indexes
db.users.getIndexes()
```

### End-to-End Verification

```bash
# After deployment, run health check
./scripts/health-check.sh production

# Run smoke tests
cd frontend
npm run test:e2e -- --grep @smoke
```

## Troubleshooting

### Environment Variables Not Loading

```bash
# Vercel
vercel env ls
vercel env pull .env.local

# Railway
railway variables list
railway run printenv

# Check in application
# Add console.log in your entry file
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET')
```

### Database Connection Issues

1. Check IP whitelist in MongoDB Atlas
2. Verify connection string format
3. Check username/password
4. Test connection with mongosh
5. Check network connectivity from Railway/Render

### CORS Errors

1. Verify `ALLOWED_ORIGINS` includes frontend URL
2. Check `CORS_CREDENTIALS=true`
3. Verify frontend sends credentials
4. Check browser console for specific error

---

**Last Updated**: 2024-02-17
**Next Review**: 2024-03-17
