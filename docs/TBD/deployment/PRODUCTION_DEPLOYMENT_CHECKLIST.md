# Production Deployment - Quick Start Checklist

This checklist guides you through deploying the Playwright & Selenium Learning Platform to production for the first time.

**Estimated Time**: 6-8 hours
**Prerequisites**: Admin access to all platforms

---

## Phase 1: Platform Setup (2-3 hours)

### 1.1 MongoDB Atlas

- [ ] **Create Account** → https://www.mongodb.com/cloud/atlas/register
- [ ] **Create Cluster**
  - Cluster Tier: M10 or higher
  - Region: us-east-1 (or your preferred region)
  - Cluster Name: `playwright-learning-prod`
- [ ] **Configure Security**
  - Database Access: Create user `prod_user` with strong password
  - Network Access: Add `0.0.0.0/0` (for Railway/Render) or specific IPs
- [ ] **Enable Backups**
  - Enable Continuous Backup
  - Retention: 30 days
  - Point-in-time restore: Enabled
- [ ] **Get Connection String**
  - Format: `mongodb+srv://prod_user:PASSWORD@cluster0.xxxxx.mongodb.net/playwright-learning-prod`
  - Save securely (you'll need it for environment variables)

### 1.2 Vercel (Frontend)

- [ ] **Create Account** → https://vercel.com/signup
- [ ] **Import Project**
  - Connect GitHub repository
  - Root Directory: `frontend`
  - Framework Preset: Vite
  - Build Command: `npm run build`
  - Output Directory: `dist`
- [ ] **Add Custom Domain**
  - Domain: `playwright-learning.com`
  - Add DNS records (provided by Vercel)
- [ ] **Configure Environment Variables** (see section 2.1)

### 1.3 Railway (Backend) - Option A

- [ ] **Create Account** → https://railway.app
- [ ] **Create Project**
  - New Project → Deploy from GitHub repo
  - Select repository
  - Select `backend` directory
- [ ] **Configure Service**
  - Build Command: `npm install && npm run build`
  - Start Command: `node dist/server.js`
  - Health Check Path: `/health`
- [ ] **Add Redis**
  - Add Plugin → Redis
  - Note the Redis URL (auto-added to env vars)
- [ ] **Configure Environment Variables** (see section 2.2)
- [ ] **Generate Domain**
  - Settings → Generate Domain
  - Note: `xyz.up.railway.app`

### 1.4 Render (Backend) - Option B

- [ ] **Create Account** → https://render.com/register
- [ ] **Create Web Service**
  - New Web Service → Connect repository
  - Root Directory: `backend`
  - Build Command: `npm install && npm run build`
  - Start Command: `node dist/server.js`
- [ ] **Add Redis**
  - New → Redis
  - Copy connection string
- [ ] **Configure Environment Variables** (see section 2.2)
- [ ] **Add Custom Domain** (optional)
  - `api.playwright-learning.com`

### 1.5 External Services

- [ ] **SendGrid (Email)**
  - Create account: https://sendgrid.com/pricing/
  - Settings → API Keys → Create API Key
  - Full Access or Mail Send permissions
  - Copy API key (starts with `SG.`)
  - Verify domain: `playwright-learning.com`

- [ ] **AWS S3 (Storage)**
  - Create S3 bucket: `playwright-learning-prod`
  - Region: us-east-1
  - Create IAM user with S3 access
  - Generate access key ID and secret key

- [ ] **Sentry (Error Tracking)**
  - Create account: https://sentry.io/signup/
  - Create project: "playwright-learning"
  - Platform: Node.js (backend) and React (frontend)
  - Copy DSN from Settings → Client Keys

- [ ] **UptimeRobot (Monitoring)**
  - Create account: https://uptimerobot.com/signUp
  - Add monitors (after deployment)

---

## Phase 2: Environment Variables (1-2 hours)

### 2.1 Frontend (Vercel)

Go to Vercel Dashboard → Project Settings → Environment Variables

Add the following (Production environment):

```bash
# Required
VITE_API_BASE_URL=https://xyz.up.railway.app  # Or your backend URL
VITE_APP_NAME=Playwright & Selenium Learning Platform
VITE_APP_VERSION=1.0.0
VITE_ENV=production

# Monitoring (if configured)
VITE_ENABLE_SENTRY=true
VITE_SENTRY_DSN=https://...@sentry.io/...  # From Sentry setup
VITE_ENABLE_ANALYTICS=true
VITE_GA_TRACKING_ID=G-XXXXXXXXXX  # If using Google Analytics

# Optional
VITE_DEBUG=false
```

### 2.2 Backend (Railway/Render)

**Critical Variables** (must be set):

```bash
# Core
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://prod_user:PASSWORD@cluster0.xxxxx.mongodb.net/playwright-learning-prod

# Authentication (GENERATE STRONG SECRETS!)
JWT_SECRET=[use: openssl rand -base64 64]
REFRESH_TOKEN_SECRET=[use: openssl rand -base64 64]
SESSION_SECRET=[use: openssl rand -base64 32]

# CORS
CLIENT_URL=https://playwright-learning.com
ALLOWED_ORIGINS=https://playwright-learning.com,https://www.playwright-learning.com

# Email (SendGrid)
SENDGRID_API_KEY=SG.xxxxx  # From SendGrid setup
SENDGRID_FROM_EMAIL=noreply@playwright-learning.com

# Storage (AWS S3)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAXXXXX  # From AWS IAM user
AWS_SECRET_ACCESS_KEY=xxxxx  # From AWS IAM user
AWS_S3_BUCKET=playwright-learning-prod

# Cache (Redis)
REDIS_URL=redis://default:password@...  # Auto-added by Railway/Render

# Monitoring
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx  # From Sentry setup
SENTRY_ENVIRONMENT=production
```

**Generate Secrets**:
```bash
# Generate JWT secret
openssl rand -base64 64

# Generate refresh token secret
openssl rand -base64 64

# Generate session secret
openssl rand -base64 32
```

**Optional Variables** (recommended):
- Rate limiting settings
- Backup configuration
- Feature flags
- Analytics settings

(See `/config/production.env.example` for complete list)

---

## Phase 3: DNS Configuration (30 minutes)

### 3.1 Frontend Domain

Add these DNS records for `playwright-learning.com`:

**For Vercel**:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com

Type: A
Name: @
Value: 76.76.21.21  # Vercel IP
```

Or follow Vercel's specific instructions in your dashboard.

### 3.2 Backend API Domain (Optional)

For `api.playwright-learning.com`:

**For Railway**:
```
Type: CNAME
Name: api
Value: xyz.up.railway.app
```

**For Render**:
```
Type: CNAME
Name: api
Value: xyz.onrender.com
```

### 3.3 Verify DNS Propagation

```bash
# Check DNS
nslookup playwright-learning.com
nslookup api.playwright-learning.com

# Or use online tool
# https://dnschecker.org/
```

**Note**: DNS propagation can take up to 48 hours, but usually completes in 1-2 hours.

---

## Phase 4: Initial Testing (1 hour)

### 4.1 Backend Health Check

```bash
# Wait for deployment to complete (5-10 minutes)

# Test health endpoint
curl https://xyz.up.railway.app/health

# Expected response:
# {"status":"ok","timestamp":"...","uptime":...}

# Test database connection
curl https://xyz.up.railway.app/health/database

# Expected response:
# {"status":"connected"}
```

### 4.2 Frontend Health Check

```bash
# Visit in browser
open https://playwright-learning.vercel.app

# Or curl
curl -I https://playwright-learning.vercel.app

# Expected: HTTP 200 OK
```

### 4.3 End-to-End Test

1. **Open frontend** in browser
2. **Register** a new account
3. **Login** with registered account
4. **Browse** lessons
5. **Take** a quiz
6. **Check** progress tracking

If all steps work, basic functionality is operational!

---

## Phase 5: Monitoring Setup (30 minutes)

### 5.1 Sentry

- [ ] **Verify Integration**
  - Trigger a test error
  - Check Sentry dashboard for error

- [ ] **Configure Alerts**
  - Sentry → Alerts → Create Alert
  - High error rate: >10 errors/hour → Email
  - Critical error: level=fatal → Email + Slack

### 5.2 UptimeRobot

- [ ] **Add Frontend Monitor**
  - Type: HTTPS
  - URL: https://playwright-learning.com
  - Interval: 5 minutes
  - Alert: Email

- [ ] **Add Backend Monitor**
  - Type: HTTPS
  - URL: https://api.playwright-learning.com/health (or Railway URL)
  - Interval: 5 minutes
  - Alert: Email

- [ ] **Test Alerts**
  - Verify email notifications are received

### 5.3 Log Access

**Backend Logs**:
```bash
# Railway
railway login
railway logs --environment production --tail

# Render
render logs playwright-learning-backend --tail
```

**Frontend Logs**:
```bash
# Vercel
vercel login
vercel logs --prod
```

---

## Phase 6: Backup Configuration (30 minutes)

### 6.1 MongoDB Atlas Backups

Already enabled if you followed Phase 1. Verify:
- [ ] Go to Cluster → Backup tab
- [ ] Verify "Continuous Backup" is ON
- [ ] Verify retention is 30 days

### 6.2 Manual Backup Setup

**Option A: GitHub Actions** (Automated, recommended)

Already configured in `.github/workflows/backup.yml`

Add these secrets to GitHub:
- `MONGODB_URI`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `SLACK_WEBHOOK` (optional)

**Option B: Server Cron** (Manual)

```bash
# On your server, add to crontab:
0 2 * * * /path/to/scripts/backup.sh --encrypt --upload --clean
```

### 6.3 Test Backup

```bash
# Run manual backup
./scripts/backup.sh

# Verify backup created
ls -lh backups/

# Verify integrity
tar -tzf backups/backup_*.tar.gz
```

---

## Phase 7: Security Verification (30 minutes)

### 7.1 Security Checklist

Review and complete: `/docs/SECURITY_CHECKLIST.md`

**Critical items**:
- [ ] All secrets are strong and unique
- [ ] No secrets in git history
- [ ] HTTPS enforced
- [ ] Security headers configured (auto via Helmet.js and Vercel)
- [ ] Rate limiting active
- [ ] Database access restricted
- [ ] Admin accounts have MFA

### 7.2 Run Security Scan

```bash
# Dependency scan
cd backend && npm audit
cd frontend && npm audit

# Fix critical vulnerabilities
npm audit fix
```

### 7.3 SSL Verification

```bash
# Check SSL certificate
echo | openssl s_client -servername playwright-learning.com -connect playwright-learning.com:443 2>/dev/null | openssl x509 -noout -dates

# Or use online tool
# https://www.ssllabs.com/ssltest/analyze.html?d=playwright-learning.com
```

---

## Phase 8: First Production Deployment (1 hour)

### 8.1 Pre-Deployment

- [ ] **Review changes** since last deploy
- [ ] **Run tests locally**
  ```bash
  cd frontend && npm run validate
  cd backend && npm test
  ```
- [ ] **Create backup**
  ```bash
  ./scripts/backup.sh --encrypt
  ```
- [ ] **Notify team** (if applicable)

### 8.2 Deploy

**Option A: Automated (Recommended)**

```bash
# Merge to main branch (triggers GitHub Actions)
git checkout main
git merge develop
git push origin main

# Monitor deployment
# https://github.com/[user]/[repo]/actions
```

**Option B: Manual**

```bash
# Frontend (Vercel)
cd frontend
vercel --prod

# Backend (Railway)
cd backend
railway up --environment production
```

### 8.3 Post-Deployment Verification

```bash
# Run health check
./scripts/health-check.sh production

# Expected output:
# ✓ Frontend is responding (HTTP 200)
# ✓ API health check passed
# ✓ Database is connected
# ✓ All checks passed
```

### 8.4 Manual Testing

Test critical user flows:
1. User registration
2. User login
3. Browse lessons
4. Take quiz
5. View progress
6. User logout

### 8.5 Monitor

Watch for 1 hour:
- Sentry for errors
- UptimeRobot for downtime
- Logs for warnings

```bash
# Watch logs
railway logs --tail  # Backend
vercel logs --prod   # Frontend
```

---

## Phase 9: Documentation & Handoff (30 minutes)

### 9.1 Document Deployment

Create deployment log:

```markdown
# Deployment Log - [Date]

**Deployed by**: [Name]
**Commit**: [Git SHA]
**Duration**: [Time]

## Changes
- [List of changes]

## Issues Encountered
- [Any issues and how resolved]

## Verification
- [x] Health checks passed
- [x] Critical flows tested
- [x] No errors in Sentry
- [x] Monitoring active

## Notes
- [Any important notes]
```

### 9.2 Update Team

Send summary to team:
- Deployment completed successfully
- Production URLs
- Monitoring dashboard links
- On-call schedule
- Known issues (if any)

### 9.3 Update Status Page

If you have a status page:
- Update to "All Systems Operational"
- Post announcement (if first deploy)

---

## Phase 10: Post-Launch Monitoring (First 48 Hours)

### Day 1-2 Monitoring

- [ ] **Check Sentry** every 2-4 hours
- [ ] **Review logs** for warnings
- [ ] **Monitor performance** (response times)
- [ ] **Check uptime** (UptimeRobot)
- [ ] **Verify backups** running
- [ ] **User feedback** monitoring
- [ ] **Quick response** to issues

### Set Up Alerts

Ensure you receive:
- [ ] Error rate alerts (Sentry)
- [ ] Downtime alerts (UptimeRobot)
- [ ] Performance degradation alerts
- [ ] Deployment notifications (GitHub Actions)

---

## Troubleshooting

### Frontend not loading

1. Check Vercel deployment status
2. Verify DNS configuration
3. Check browser console for errors
4. Verify API URL in environment variables

### Backend errors

1. Check Railway/Render logs
2. Verify environment variables set correctly
3. Test database connection
4. Check Redis connection

### Database connection issues

1. Verify MongoDB URI is correct
2. Check IP whitelist in MongoDB Atlas
3. Test connection with mongosh
4. Verify database user permissions

### Cannot deploy

1. Verify all environment variables set
2. Check build logs for errors
3. Ensure all secrets are configured
4. Verify platform access/permissions

---

## Rollback Plan

If critical issues occur:

```bash
# Quick rollback
./scripts/rollback.sh all

# Or platform-specific
vercel rollback              # Frontend
railway rollback [id]        # Backend
```

See `/docs/ROLLBACK_PROCEDURES.md` for details.

---

## Success Criteria

You've successfully deployed to production when:

- [x] All platforms configured
- [x] Environment variables set
- [x] DNS configured and propagated
- [x] SSL certificates active
- [x] Health checks passing
- [x] Monitoring active and alerting
- [x] Backups configured and tested
- [x] Critical user flows working
- [x] No errors in Sentry
- [x] Team trained on procedures

---

## Next Steps

After successful deployment:

1. **Week 1**: Close monitoring, address any issues
2. **Week 2**: Performance optimization based on real usage
3. **Month 1**: Security audit, update documentation
4. **Quarterly**: Disaster recovery drill, review processes

---

## Resources

- **Full Documentation**: `/docs/DEPLOYMENT_RUNBOOK.md`
- **Environment Setup**: `/docs/ENVIRONMENT_SETUP.md`
- **Monitoring Guide**: `/docs/MONITORING_SETUP.md`
- **Security Checklist**: `/docs/SECURITY_CHECKLIST.md`
- **Rollback Procedures**: `/docs/ROLLBACK_PROCEDURES.md`
- **Incident Response**: `/docs/INCIDENT_RESPONSE.md`

---

## Support

If you need help:
- Review documentation in `/docs/`
- Check platform status pages
- Contact platform support
- Escalate to team lead if critical

**Emergency Contact**: ops@playwright-learning.com

---

**Checklist Version**: 1.0
**Last Updated**: February 17, 2024
**Estimated Completion Time**: 6-8 hours
