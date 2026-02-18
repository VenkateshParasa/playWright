# Deployment Runbook

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Pre-Deployment Checklist](#pre-deployment-checklist)
4. [Deployment Process](#deployment-process)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [Rollback Procedures](#rollback-procedures)
7. [Troubleshooting](#troubleshooting)
8. [Emergency Contacts](#emergency-contacts)

## Overview

This runbook provides step-by-step instructions for deploying the Playwright & Selenium Learning Platform to production and staging environments.

### Deployment Architecture

- **Frontend**: Vercel (CDN + Edge Functions)
- **Backend**: Railway.app / Render.com (Node.js)
- **Database**: MongoDB Atlas (Managed)
- **Cache**: Redis (Railway/Render Managed)
- **Storage**: AWS S3 / Cloudflare R2
- **Monitoring**: Sentry, UptimeRobot
- **CI/CD**: GitHub Actions

### Deployment Environments

| Environment | Frontend URL | Backend URL | Purpose |
|-------------|-------------|-------------|---------|
| **Production** | https://playwright-learning.com | https://api.playwright-learning.com | Live environment for end users |
| **Staging** | https://staging.playwright-learning.com | https://staging-api.playwright-learning.com | Pre-production testing |
| **Development** | http://localhost:5173 | http://localhost:5000 | Local development |

## Prerequisites

### Required Tools

```bash
# Node.js and npm
node --version  # v20.x or higher
npm --version   # v10.x or higher

# Git
git --version

# CLI Tools
npm install -g vercel
npm install -g @railway/cli
# OR
npm install -g render

# Optional but recommended
npm install -g pm2
```

### Access Requirements

- [ ] GitHub repository access (write permissions)
- [ ] Vercel account and project access
- [ ] Railway/Render account and project access
- [ ] MongoDB Atlas credentials (production cluster)
- [ ] AWS/R2 credentials for storage
- [ ] Sentry project access
- [ ] Environment variable access

### Environment Files

Ensure you have:
- `/config/production.env.example` - Template
- Actual `.env.production` files (never committed to git)

## Pre-Deployment Checklist

### Code Quality

- [ ] All tests passing (`npm run test`)
- [ ] Linting successful (`npm run lint`)
- [ ] Type checking passed (`npm run type-check`)
- [ ] No console.log statements in production code
- [ ] No TODO/FIXME comments in critical paths
- [ ] Code review completed and approved
- [ ] All dependencies up to date (no critical vulnerabilities)

### Version Control

- [ ] All changes committed to git
- [ ] Branch is up to date with main
- [ ] No uncommitted changes
- [ ] Tagged with version number (production only)
- [ ] CHANGELOG.md updated

### Configuration

- [ ] Environment variables verified
- [ ] Database connection strings updated
- [ ] API keys rotated (if needed)
- [ ] CORS settings configured
- [ ] Rate limiting configured
- [ ] Security headers configured

### Database

- [ ] Recent backup exists
- [ ] Migration scripts tested
- [ ] Database indexes optimized
- [ ] Connection pool size configured

### Monitoring

- [ ] Sentry DSN configured
- [ ] Analytics tracking ID set
- [ ] Error alerting enabled
- [ ] Uptime monitoring active
- [ ] Log aggregation configured

### Communication

- [ ] Team notified of deployment
- [ ] Stakeholders informed (production only)
- [ ] Maintenance window scheduled (if needed)
- [ ] Status page updated (if downtime expected)

## Deployment Process

### Option 1: Automated Deployment (Recommended)

#### Using GitHub Actions

```bash
# 1. Push to main branch (production)
git push origin main

# 2. Or create a release
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# GitHub Actions will automatically:
# - Run tests
# - Build applications
# - Deploy to production
# - Run smoke tests
# - Notify team
```

#### Using Deployment Script

```bash
# Production deployment (all services)
./scripts/deploy.sh production all

# Staging deployment
./scripts/deploy.sh staging all

# Deploy only frontend
./scripts/deploy.sh production frontend

# Deploy only backend
./scripts/deploy.sh production backend
```

### Option 2: Manual Deployment

#### Step 1: Backend Deployment (Railway)

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm ci --production

# Build TypeScript
npm run build

# Login to Railway
railway login

# Link to project (first time only)
railway link [project-id]

# Deploy to production
railway up --environment production

# Verify deployment
railway logs --environment production

# Check service status
railway status
```

#### Step 2: Backend Deployment (Alternative: Render)

```bash
# Render deploys automatically from GitHub
# Or use Render CLI:

# Install Render CLI
npm install -g render

# Deploy
render deploy --service playwright-learning-backend

# View logs
render logs playwright-learning-backend
```

#### Step 3: Frontend Deployment (Vercel)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm ci

# Build application
npm run build

# Login to Vercel
vercel login

# Link to project (first time only)
vercel link

# Deploy to production
vercel --prod

# Get deployment URL
vercel ls
```

### Step 4: Run Migrations (If Needed)

```bash
# SSH into backend server or run locally with production DB
cd backend

# Run migrations
npm run migrate:up

# Verify migration
npm run migrate:status
```

### Step 5: Clear Cache

```bash
# Clear Redis cache
redis-cli -h [redis-host] -a [password] FLUSHALL

# Or via API
curl -X POST https://api.playwright-learning.com/admin/cache/clear \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Clear CDN cache (Cloudflare)
curl -X POST "https://api.cloudflare.com/client/v4/zones/[zone-id]/purge_cache" \
  -H "Authorization: Bearer [api-token]" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

## Post-Deployment Verification

### Automated Health Checks

```bash
# Run comprehensive health check
./scripts/health-check.sh production

# Expected output:
# ✓ Frontend is responding (HTTP 200)
# ✓ API health check passed
# ✓ Database is connected
# ✓ Redis is connected
# ✓ SSL certificate is valid (89 days remaining)
# ✓ Frontend response time: 234ms
# ✓ API response time: 145ms
```

### Manual Verification

#### 1. Frontend Checks

```bash
# Check frontend is accessible
curl -I https://playwright-learning.com

# Verify critical pages load
curl https://playwright-learning.com/ | grep -q "<!DOCTYPE html"
curl https://playwright-learning.com/lessons
curl https://playwright-learning.com/dashboard
```

#### 2. Backend API Checks

```bash
# Health endpoint
curl https://api.playwright-learning.com/health

# API status
curl https://api.playwright-learning.com/api/status

# Test auth endpoint
curl https://api.playwright-learning.com/api/auth/health
```

#### 3. Database Checks

```bash
# Connect to MongoDB
mongosh "mongodb+srv://cluster0.xxxxx.mongodb.net/playwright-learning-prod"

# Verify collections
show collections

# Check record counts
db.users.countDocuments()
db.lessons.countDocuments()
db.progress.countDocuments()

# Test query performance
db.lessons.find({}).limit(10).explain("executionStats")
```

#### 4. Smoke Tests

```bash
# Run automated smoke tests
cd frontend
npm run test:e2e -- --grep @smoke

# Critical user flows:
# - User can load homepage
# - User can register
# - User can login
# - User can view lessons
# - User can take quiz
```

#### 5. Monitor Logs

```bash
# Backend logs (Railway)
railway logs --environment production --tail

# Backend logs (Render)
render logs playwright-learning-backend --tail

# Frontend logs (Vercel)
vercel logs --prod

# Check for errors
railway logs --environment production | grep -i error
```

#### 6. Monitoring Dashboards

- **Sentry**: Check for new errors
  - https://sentry.io/organizations/[org]/projects/playwright-learning/

- **Vercel Analytics**: Verify traffic
  - https://vercel.com/[team]/playwright-learning/analytics

- **Railway/Render**: Check metrics
  - CPU usage < 70%
  - Memory usage < 80%
  - Response time < 500ms

- **MongoDB Atlas**: Database health
  - https://cloud.mongodb.com/
  - Check connections, query performance

#### 7. Performance Checks

```bash
# Lighthouse audit
npx lighthouse https://playwright-learning.com --view

# Load testing (optional)
npx artillery quick --count 10 --num 50 https://api.playwright-learning.com/health
```

### Verification Checklist

- [ ] Frontend loads successfully
- [ ] Backend API responds
- [ ] Database connections working
- [ ] Authentication functional
- [ ] User registration works
- [ ] Lesson loading works
- [ ] Quiz functionality works
- [ ] No critical errors in Sentry
- [ ] Response times acceptable
- [ ] SSL certificate valid
- [ ] CDN serving assets
- [ ] Monitoring active
- [ ] Backups running

## Rollback Procedures

See [ROLLBACK_PROCEDURES.md](./ROLLBACK_PROCEDURES.md) for detailed rollback instructions.

### Quick Rollback

#### Rollback Frontend (Vercel)

```bash
cd frontend

# List recent deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]

# Or promote specific deployment
vercel promote [deployment-url] --prod
```

#### Rollback Backend (Railway)

```bash
# View deployment history
railway history

# Rollback to previous deployment
railway rollback [deployment-id]

# Or redeploy from specific commit
git checkout [previous-commit]
railway up --environment production
```

#### Rollback Backend (Render)

```bash
# Render UI: Select previous deployment and click "Rollback"
# Or redeploy from git:
git checkout [previous-commit]
git push origin main
```

#### Rollback Database

```bash
# Restore from backup
./scripts/rollback.sh --restore-db [backup-name]

# Or manually:
mongorestore --uri="mongodb+srv://..." --drop backups/[backup-name]/mongodb
```

## Troubleshooting

### Common Issues

#### 1. Frontend Not Loading

```bash
# Check Vercel deployment status
vercel ls

# Check DNS
nslookup playwright-learning.com

# Check SSL
openssl s_client -connect playwright-learning.com:443

# Clear CDN cache
# (see Clear Cache section above)

# Redeploy
vercel --prod
```

#### 2. Backend API Errors

```bash
# Check logs
railway logs --environment production | tail -100

# Check health endpoint
curl https://api.playwright-learning.com/health

# Check environment variables
railway variables --environment production

# Restart service
railway restart
```

#### 3. Database Connection Errors

```bash
# Test connection
mongosh "mongodb+srv://cluster0.xxxxx.mongodb.net/playwright-learning-prod"

# Check IP whitelist in MongoDB Atlas
# Add: 0.0.0.0/0 (for Railway/Render)

# Verify connection string
echo $MONGODB_URI

# Check connection pool
# Look for "too many connections" errors
```

#### 4. High Error Rate

```bash
# Check Sentry dashboard
# Identify error patterns

# Check logs for stack traces
railway logs --environment production | grep -A 10 "Error"

# Increase resources (if needed)
# Update Railway service settings

# Scale horizontally (if supported)
```

#### 5. Slow Response Times

```bash
# Check database indexes
mongo --eval "db.lessons.getIndexes()"

# Check query performance
# Enable slow query logging in MongoDB Atlas

# Check API response times
curl -w "@curl-format.txt" -o /dev/null -s https://api.playwright-learning.com/api/lessons

# Verify CDN cache hit rate

# Check backend CPU/memory usage
railway metrics
```

### Emergency Response

#### Critical Outage

1. **Assess Impact**
   ```bash
   ./scripts/health-check.sh production
   ```

2. **Check Status Page**
   - Update status page immediately
   - Communicate with users

3. **Quick Mitigation**
   ```bash
   # Rollback if recent deployment
   ./scripts/rollback.sh

   # Or enable maintenance mode
   railway variables set MAINTENANCE_MODE=true
   ```

4. **Investigate**
   - Check logs
   - Review metrics
   - Check external dependencies

5. **Fix and Redeploy**
   ```bash
   # Fix issue
   git commit -m "hotfix: [issue]"

   # Deploy
   ./scripts/deploy.sh production all
   ```

6. **Post-Mortem**
   - Document incident
   - Identify root cause
   - Implement preventive measures

## Emergency Contacts

### Team

| Role | Name | Contact |
|------|------|---------|
| **Lead DevOps** | [Name] | [Email/Phone/Slack] |
| **Backend Lead** | [Name] | [Email/Phone/Slack] |
| **Frontend Lead** | [Name] | [Email/Phone/Slack] |
| **On-Call Engineer** | [Rotation] | [Phone/PagerDuty] |

### External Services

| Service | Support Contact |
|---------|----------------|
| **Vercel** | https://vercel.com/support |
| **Railway** | https://railway.app/help |
| **MongoDB Atlas** | https://support.mongodb.com |
| **AWS** | AWS Support Console |
| **Sentry** | https://sentry.io/support |

### Escalation Path

1. On-call engineer (immediate)
2. Team lead (< 30 minutes)
3. Engineering manager (< 1 hour)
4. CTO (critical only)

---

## Appendix

### Deployment Timeline

Typical deployment takes **15-30 minutes**:

- Pre-deployment checks: 5 min
- Backend deployment: 5-10 min
- Frontend deployment: 3-5 min
- Verification: 5-10 min
- Documentation: 5 min

### Change Log Template

```markdown
## [1.0.0] - 2024-01-15

### Added
- New feature X
- New API endpoint Y

### Changed
- Updated dependency Z
- Improved performance of W

### Fixed
- Bug in authentication
- Memory leak in background job

### Deployment Notes
- Run migration: npm run migrate:up
- Clear Redis cache
- Update environment variable: NEW_FEATURE_ENABLED=true
```

### Useful Commands Reference

```bash
# Check deployment status
vercel ls
railway status

# View logs
vercel logs --prod
railway logs --tail

# Environment variables
railway variables list
vercel env ls

# Restart services
railway restart
render restart [service]

# Database
mongosh [connection-string]
redis-cli -h [host] -a [password]

# Health checks
./scripts/health-check.sh production
curl https://api.playwright-learning.com/health

# Backups
./scripts/backup.sh --encrypt --upload

# Rollback
./scripts/rollback.sh
```

---

**Last Updated**: 2024-02-17
**Document Version**: 1.0
**Next Review**: 2024-03-17
