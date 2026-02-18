# Rollback Procedures

## Table of Contents

1. [Overview](#overview)
2. [When to Rollback](#when-to-rollback)
3. [Rollback Methods](#rollback-methods)
4. [Frontend Rollback](#frontend-rollback)
5. [Backend Rollback](#backend-rollback)
6. [Database Rollback](#database-rollback)
7. [Configuration Rollback](#configuration-rollback)
8. [Verification](#verification)
9. [Post-Rollback](#post-rollback)

## Overview

This document provides step-by-step procedures for rolling back deployments when issues are detected in production.

### Rollback Decision Matrix

| Severity | Symptoms | Action | Timeline |
|----------|----------|--------|----------|
| **Critical** | Service down, data loss, security breach | Immediate rollback | < 5 minutes |
| **High** | Major feature broken, high error rate (>5%) | Rollback within 15 min | < 15 minutes |
| **Medium** | Minor feature broken, elevated errors (1-5%) | Attempt fix or rollback | < 30 minutes |
| **Low** | UI issue, non-critical bug | Fix forward | Next deployment |

### Rollback Principles

1. **Safety First**: Rolling back is safer than fixing forward in production
2. **Document Everything**: Record what, when, why, and how
3. **Communicate**: Keep team and stakeholders informed
4. **Verify**: Always verify rollback success
5. **Learn**: Conduct post-mortem to prevent recurrence

## When to Rollback

### Critical Situations (Immediate Rollback)

- Service is completely down
- Database corruption detected
- Security vulnerability exposed
- Data loss occurring
- Critical business function broken
- Error rate > 10%
- Response time degradation > 300%

### High Priority (Rollback within 15 min)

- Major feature completely broken
- Authentication/authorization issues
- Payment processing failures
- Error rate between 5-10%
- Response time degradation > 200%

### Consider Alternative (Fix Forward)

- Minor UI issues
- Non-critical feature bugs
- Error rate < 1%
- Issues with workaround available
- Issues only affecting small user segment

## Rollback Methods

### Method 1: Automated Rollback Script (Recommended)

```bash
# Use the rollback script
./scripts/rollback.sh

# Options:
# --frontend     Rollback frontend only
# --backend      Rollback backend only
# --database     Rollback database only
# --commit SHA   Rollback to specific commit
```

### Method 2: Platform-Specific Rollback

Platform tools provide quick rollback capabilities.

### Method 3: Git Revert + Redeploy

Traditional approach using git revert.

## Frontend Rollback

### Using Vercel (Recommended)

#### Option A: Vercel Dashboard

1. Go to https://vercel.com/[team]/playwright-learning
2. Click "Deployments" tab
3. Find the previous working deployment
4. Click the three dots menu (⋯)
5. Click "Promote to Production"
6. Confirm promotion

**Time**: ~2 minutes

#### Option B: Vercel CLI

```bash
cd frontend

# List recent deployments
vercel ls

# Output example:
# playwright-learning-abc123.vercel.app (Production)  2m ago
# playwright-learning-def456.vercel.app               1h ago  ← Working version
# playwright-learning-ghi789.vercel.app               2h ago

# Rollback to previous deployment
vercel promote playwright-learning-def456.vercel.app --prod

# Or rollback using built-in command
vercel rollback
```

**Time**: ~1 minute

### Manual Rollback (Git Revert)

```bash
cd frontend

# Identify the bad commit
git log --oneline -10

# Option 1: Revert specific commit (keeps history)
git revert <bad-commit-sha>
git push origin main

# Option 2: Reset to previous commit (rewrites history - careful!)
git reset --hard <good-commit-sha>
git push --force origin main

# Trigger redeployment
vercel --prod
```

**Time**: ~5 minutes

### Verification

```bash
# Check deployment status
vercel ls

# Test frontend
curl -I https://playwright-learning.com

# Check for errors
curl https://playwright-learning.com/ | grep -i error

# Verify in browser
open https://playwright-learning.com
```

## Backend Rollback

### Using Railway

#### Option A: Railway Dashboard

1. Go to https://railway.app/project/[id]
2. Select backend service
3. Click "Deployments" tab
4. Click on previous working deployment
5. Click "Redeploy"
6. Confirm

**Time**: ~3 minutes

#### Option B: Railway CLI

```bash
cd backend

# View deployment history
railway history

# Output:
# ID: abc123  Status: Success  Time: 2m ago   ← Current (broken)
# ID: def456  Status: Success  Time: 1h ago   ← Working version
# ID: ghi789  Status: Success  Time: 2h ago

# Rollback to previous deployment
railway rollback def456

# Or redeploy from specific commit
git checkout <good-commit-sha>
railway up --environment production
```

**Time**: ~2 minutes

### Using Render

#### Option A: Render Dashboard

1. Go to https://dashboard.render.com
2. Select playwright-learning-backend service
3. Go to "Events" tab
4. Find previous successful deployment
5. Click "Rollback to this deploy"
6. Confirm

**Time**: ~3 minutes

#### Option B: Git Revert

```bash
cd backend

# Render deploys from git, so revert the commit
git revert <bad-commit-sha>
git push origin main

# Render will automatically redeploy
```

**Time**: ~5 minutes

### Rollback Script

Create `scripts/rollback.sh`:

```bash
#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Parse options
COMPONENT="${1:-all}"
TARGET="${2:-previous}"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

rollback_frontend() {
    log "Rolling back frontend..."
    cd "$PROJECT_ROOT/frontend"

    if [ "$TARGET" == "previous" ]; then
        vercel rollback
    else
        vercel promote "$TARGET" --prod
    fi

    log "Frontend rollback complete"
}

rollback_backend() {
    log "Rolling back backend..."
    cd "$PROJECT_ROOT/backend"

    if [ "$TARGET" == "previous" ]; then
        railway rollback
    else
        railway rollback "$TARGET"
    fi

    log "Backend rollback complete"
}

# Execute rollback
case $COMPONENT in
    frontend)
        rollback_frontend
        ;;
    backend)
        rollback_backend
        ;;
    all)
        rollback_backend
        rollback_frontend
        ;;
    *)
        echo "Usage: ./rollback.sh [frontend|backend|all] [deployment-id]"
        exit 1
        ;;
esac

log "Rollback complete. Running verification..."

# Run health checks
"$SCRIPT_DIR/health-check.sh" production

log "Verification complete"
```

### Verification

```bash
# Check service status
railway status

# Check health endpoint
curl https://api.playwright-learning.com/health

# Check logs for errors
railway logs --environment production --tail | grep ERROR

# Monitor error rate in Sentry
open https://sentry.io/organizations/[org]/projects/playwright-learning/
```

## Database Rollback

### WARNING

Database rollbacks are risky and should be last resort. Consider:
1. Can the issue be fixed without DB rollback?
2. Is data loss acceptable?
3. How much data will be lost?
4. Are there any pending transactions?

### Option 1: Point-in-Time Restore (MongoDB Atlas)

**Best for**: Data corruption, accidental deletion

```bash
# Step 1: Stop application writes
railway variables set DATABASE_READONLY=true
railway restart

# Step 2: MongoDB Atlas UI
# 1. Go to cluster → Backup
# 2. Click "Restore Data"
# 3. Select "Point in Time"
# 4. Choose time before incident
# 5. Restore to NEW cluster (safer)

# Step 3: Update connection string
railway variables set MONGODB_URI="new-cluster-uri"
railway restart

# Step 4: Verify
curl https://api.playwright-learning.com/health/database

# Step 5: Re-enable writes
railway variables set DATABASE_READONLY=false
railway restart
```

**Data Loss**: Minutes (up to last oplog entry)
**Time**: 30-60 minutes

### Option 2: Restore from Backup

**Best for**: Complete database failure

```bash
# Step 1: Download backup
aws s3 cp s3://playwright-learning-backups/daily/backup_latest.tar.gz ./

# Step 2: Extract
tar -xzf backup_latest.tar.gz

# Step 3: Stop application
railway down

# Step 4: Restore
mongorestore \
  --uri="$MONGODB_URI" \
  --dir=./mongodb/playwright-learning-prod \
  --drop \
  --gzip

# Step 5: Verify
mongosh "$MONGODB_URI" --eval "db.users.countDocuments()"

# Step 6: Restart application
railway up
```

**Data Loss**: Up to 24 hours (last backup)
**Time**: 20-30 minutes

### Option 3: Restore Single Collection

**Best for**: Issue in specific collection

```bash
# Restore only affected collection
mongorestore \
  --uri="$MONGODB_URI" \
  --dir=./mongodb/playwright-learning-prod \
  --nsInclude="playwright-learning-prod.users" \
  --drop \
  --gzip

# Verify
mongosh "$MONGODB_URI" --eval "db.users.countDocuments()"
```

**Data Loss**: Up to 24 hours for that collection
**Time**: 5-10 minutes

### Verification

```bash
# Check database health
curl https://api.playwright-learning.com/health/database

# Verify record counts
mongosh "$MONGODB_URI" --eval "
  db.users.countDocuments()
  db.lessons.countDocuments()
  db.progress.countDocuments()
"

# Check for data integrity issues
mongosh "$MONGODB_URI" --eval "
  db.users.find({ email: null }).count()
  db.progress.find({ userId: null }).count()
"

# Test critical operations
curl -X POST https://api.playwright-learning.com/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"test123"}'
```

## Configuration Rollback

### Environment Variables

#### Railway

```bash
# View variable history
railway variables list --history

# Restore previous value
railway variables set VARIABLE_NAME="previous-value"

# Restart to apply
railway restart
```

#### Vercel

```bash
# View environment variables
vercel env ls

# Remove incorrect variable
vercel env rm VARIABLE_NAME production

# Add correct value
vercel env add VARIABLE_NAME production
# Enter: correct-value

# Redeploy
vercel --prod
```

### Configuration Files

```bash
# Restore from backup
aws s3 cp s3://playwright-learning-backups/config/config_backup_DATE.tar.gz ./

# Extract
tar -xzf config_backup_DATE.tar.gz

# Review changes
diff vercel.json /path/to/backup/vercel.json

# Deploy restored configuration
vercel --prod
railway up
```

## Verification

### Automated Verification

```bash
# Run comprehensive health check
./scripts/health-check.sh production

# Expected output:
# ✓ Frontend is responding (HTTP 200)
# ✓ API health check passed
# ✓ Database is connected
# All checks passed
```

### Manual Verification Checklist

- [ ] Frontend loads successfully
- [ ] Backend API responds to health check
- [ ] Database connections working
- [ ] User authentication works
- [ ] Critical features functional
  - [ ] Lesson viewing
  - [ ] Quiz taking
  - [ ] Progress tracking
  - [ ] User registration
- [ ] No new errors in Sentry
- [ ] Response times normal
- [ ] Error rate < 1%

### Monitoring

```bash
# Watch error rate
watch -n 5 'curl -s https://api.playwright-learning.com/metrics | grep error_rate'

# Monitor logs
railway logs --environment production --tail

# Check Sentry
open https://sentry.io/organizations/[org]/projects/playwright-learning/

# Check uptime
open https://uptimerobot.com/dashboard
```

## Post-Rollback

### Immediate Actions

1. **Update Status Page**
   - Mark incident as resolved
   - Explain what happened (brief)
   - Estimate for fix

2. **Notify Team**
   ```bash
   # Send Slack notification
   curl -X POST $SLACK_WEBHOOK \
     -H 'Content-Type: application/json' \
     -d '{
       "text": "Production rollback completed",
       "attachments": [{
         "color": "warning",
         "fields": [
           {"title": "Component", "value": "Backend", "short": true},
           {"title": "Reason", "value": "High error rate", "short": true},
           {"title": "Status", "value": "Resolved", "short": true}
         ]
       }]
     }'
   ```

3. **Document Incident**
   - What failed
   - When detected
   - Rollback steps taken
   - Data loss (if any)
   - Root cause (initial assessment)

### Within 24 Hours

1. **Root Cause Analysis**
   - Investigate what went wrong
   - Review logs and metrics
   - Identify contributing factors

2. **Create Fix**
   - Develop proper fix
   - Add tests to prevent regression
   - Code review

3. **Post-Mortem Document**
   ```markdown
   # Incident Post-Mortem: [Date]

   ## Summary
   Brief description of what happened

   ## Timeline
   - 14:30 - Deployment to production
   - 14:35 - Error rate spike detected
   - 14:37 - Decision to rollback
   - 14:40 - Rollback completed
   - 14:45 - Service restored

   ## Impact
   - Duration: 15 minutes
   - Affected users: ~100 (estimated)
   - Data loss: None

   ## Root Cause
   Detailed explanation

   ## Resolution
   How it was resolved

   ## Action Items
   - [ ] Add integration test for X
   - [ ] Improve monitoring for Y
   - [ ] Update deployment checklist

   ## Lessons Learned
   What we learned from this incident
   ```

### Within 1 Week

1. **Implement Preventive Measures**
   - Add tests
   - Improve monitoring
   - Update processes

2. **Update Documentation**
   - Update runbooks
   - Document new procedures
   - Share learnings with team

3. **Deploy Fix**
   - After thorough testing
   - With extra monitoring
   - During low-traffic period

## Rollback Decision Tree

```
Is production impacted?
├─ Yes → Is it critical?
│  ├─ Yes → ROLLBACK IMMEDIATELY
│  └─ No → Can it be fixed in < 15 min?
│     ├─ Yes → Attempt fix
│     └─ No → ROLLBACK
└─ No → Fix forward in next deployment
```

## Emergency Rollback Commands

Keep these handy for quick access:

```bash
# Frontend rollback
vercel rollback

# Backend rollback
railway rollback

# Database restore (point-in-time)
# Via MongoDB Atlas UI → Restore Data → Point in Time

# Complete rollback (all services)
./scripts/rollback.sh all

# Health check
./scripts/health-check.sh production
```

## Contact Information

### Escalation

1. **On-Call Engineer**: [Phone/Slack]
2. **Team Lead**: [Phone/Email]
3. **Database Admin**: [Phone/Email]
4. **Engineering Manager**: [Phone/Email]

### Support

- **Vercel Support**: https://vercel.com/support
- **Railway Support**: https://railway.app/help
- **MongoDB Atlas Support**: https://support.mongodb.com

---

## Appendix: Rollback Scenarios

### Scenario 1: High Error Rate After Deployment

**Symptoms**: Error rate jumped to 8% after deployment

**Decision**: High priority → Rollback within 15 minutes

**Actions**:
1. Confirm issue is deployment-related
2. Execute backend rollback: `railway rollback`
3. Verify error rate drops
4. Investigate root cause offline
5. Fix and redeploy with proper testing

### Scenario 2: Database Migration Failure

**Symptoms**: Migration script failed halfway, data inconsistent

**Decision**: Critical → Immediate rollback

**Actions**:
1. Stop application immediately
2. Restore database from pre-migration backup
3. Fix migration script
4. Test migration on staging
5. Re-run migration during maintenance window

### Scenario 3: Frontend Performance Degradation

**Symptoms**: Page load time increased 3x

**Decision**: High priority → Rollback or attempt fix

**Actions**:
1. Check if issue is code-related or infrastructure
2. If code: `vercel rollback`
3. If infrastructure: Check Vercel status page
4. Investigate cause (bundle size, render blocking, etc.)
5. Optimize and redeploy

---

**Last Updated**: 2024-02-17
**Document Version**: 1.0
**Next Review**: 2024-03-17
