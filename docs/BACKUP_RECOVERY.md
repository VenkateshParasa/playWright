# Backup and Recovery Procedures

## Table of Contents

1. [Overview](#overview)
2. [Backup Strategy](#backup-strategy)
3. [Automated Backups](#automated-backups)
4. [Manual Backup](#manual-backup)
5. [Backup Verification](#backup-verification)
6. [Recovery Procedures](#recovery-procedures)
7. [Disaster Recovery](#disaster-recovery)
8. [Testing](#testing)

## Overview

This document outlines backup and recovery procedures for the Playwright & Selenium Learning Platform to ensure data durability and business continuity.

### Backup Scope

| Component | Backup Frequency | Retention | Recovery Time Objective (RTO) | Recovery Point Objective (RPO) |
|-----------|-----------------|-----------|-------------------------------|--------------------------------|
| **MongoDB Database** | Daily + Continuous | 30 days | 1 hour | 5 minutes |
| **User Uploads** | Daily | 90 days | 4 hours | 24 hours |
| **Configuration** | On change | 90 days | 30 minutes | 1 hour |
| **Application Code** | Per commit | Indefinite | 15 minutes | Real-time |

### Backup Locations

- **Primary**: MongoDB Atlas (automated)
- **Secondary**: AWS S3 (manual exports)
- **Tertiary**: Cloudflare R2 (disaster recovery)

## Backup Strategy

### Database Backups

#### MongoDB Atlas Continuous Backup

**Automatic** backups configured at the cluster level:

- **Snapshot Schedule**: Every 6 hours
- **Retention**: 30 days
- **Point-in-Time Restore**: Available (continuous oplog)
- **Location**: Same region as cluster + Cross-region replica

#### Export Backups

**Manual** exports to S3 for additional safety:

- **Frequency**: Daily at 02:00 UTC
- **Format**: BSON (compressed with gzip)
- **Encryption**: AES-256 encryption at rest
- **Retention**: 30 days (automatic deletion)

### File Backups

#### User Uploads

- **Storage**: AWS S3 with versioning
- **Backup**: S3 replication to another region
- **Retention**: 90 days of versions

#### Application Files

- **Configuration files**: Backed up to S3 on change
- **Environment files**: Encrypted and stored in 1Password/Vault
- **Code**: Git repository (GitHub)

## Automated Backups

### MongoDB Atlas Automated Backups

Already enabled when you set up the production cluster. To verify:

1. Go to MongoDB Atlas
2. Select cluster
3. Click "Backup" tab
4. Verify:
   - Continuous Backup: **Enabled**
   - Snapshot Schedule: **Every 6 hours**
   - Retention: **30 days**

#### Snapshot Schedule

```
00:00 UTC - Snapshot 1
06:00 UTC - Snapshot 2
12:00 UTC - Snapshot 3
18:00 UTC - Snapshot 4
```

### Automated Export Backups

Set up via cron job or GitHub Actions.

#### Using GitHub Actions

Already configured in `.github/workflows/backup.yml`:

```yaml
name: Database Backup

on:
  schedule:
    # Run daily at 02:00 UTC
    - cron: '0 2 * * *'
  workflow_dispatch: # Manual trigger

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install MongoDB Tools
        run: |
          wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
          echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
          sudo apt-get update
          sudo apt-get install -y mongodb-database-tools

      - name: Backup Database
        env:
          MONGODB_URI: ${{ secrets.MONGODB_URI }}
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        run: |
          ./scripts/backup.sh --encrypt --upload --clean

      - name: Notify on Failure
        if: failure()
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
            -H 'Content-Type: application/json' \
            -d '{"text":"Backup failed! Check GitHub Actions."}'
```

#### Using Cron Job (Server-based)

If running on a dedicated server:

```bash
# Edit crontab
crontab -e

# Add backup job
0 2 * * * /path/to/scripts/backup.sh --encrypt --upload --clean >> /var/log/backup.log 2>&1

# Verify cron job
crontab -l
```

### Railway/Render Scheduled Jobs

If using Render:

Already configured in `render.yaml`:

```yaml
- type: cron
  name: database-backup
  schedule: "0 2 * * *"
  buildCommand: npm install
  startCommand: node scripts/backup.js
  envVars:
    - key: NODE_ENV
      value: production
    - key: MONGODB_URI
      sync: false
```

## Manual Backup

### When to Run Manual Backups

- Before major deployments
- Before database migrations
- Before bulk data operations
- Before schema changes
- On-demand for compliance

### Database Manual Backup

#### Using Backup Script

```bash
# Navigate to project root
cd /path/to/project

# Run backup script
./scripts/backup.sh

# With encryption and upload
./scripts/backup.sh --encrypt --upload

# Specify custom backup directory
./scripts/backup.sh /custom/backup/path --encrypt --upload
```

#### Using mongodump Directly

```bash
# Set variables
MONGODB_URI="mongodb+srv://prod_user:password@cluster0.xxxxx.mongodb.net/playwright-learning-prod"
BACKUP_DIR="./backups/manual_$(date +%Y%m%d_%H%M%S)"

# Create backup
mongodump \
  --uri="$MONGODB_URI" \
  --out="$BACKUP_DIR" \
  --gzip

# Verify backup
ls -lh "$BACKUP_DIR"

# Create archive
tar -czf "$BACKUP_DIR.tar.gz" "$BACKUP_DIR"

# Upload to S3
aws s3 cp "$BACKUP_DIR.tar.gz" s3://playwright-learning-backups/manual/

echo "Backup completed: $BACKUP_DIR.tar.gz"
```

#### Using MongoDB Atlas UI

1. Go to MongoDB Atlas
2. Select cluster
3. Click "Backup" tab
4. Click "Take Snapshot Now"
5. Add description: "Pre-deployment backup"
6. Click "Take Snapshot"

### File Backup

```bash
# Backup uploads directory
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz /path/to/uploads

# Upload to S3
aws s3 cp uploads_backup_$(date +%Y%m%d).tar.gz s3://playwright-learning-backups/files/

# Backup configuration
tar -czf config_backup_$(date +%Y%m%d).tar.gz \
  vercel.json \
  railway.toml \
  render.yaml \
  nginx.conf

# Upload
aws s3 cp config_backup_$(date +%Y%m%d).tar.gz s3://playwright-learning-backups/config/
```

## Backup Verification

### Automated Verification

The backup script includes verification:

```bash
# Run backup with verification
./scripts/backup.sh --verify

# The script will:
# 1. Create backup
# 2. Verify archive integrity
# 3. Test restoration (to temp database)
# 4. Report results
```

### Manual Verification

#### Verify Archive Integrity

```bash
# Check if archive is valid
tar -tzf backup_20240217_020000.tar.gz > /dev/null

if [ $? -eq 0 ]; then
  echo "Archive is valid"
else
  echo "Archive is corrupted"
fi

# Check archive contents
tar -tzf backup_20240217_020000.tar.gz | head -20
```

#### Verify Database Backup

```bash
# Extract backup
tar -xzf backup_20240217_020000.tar.gz

# Check collections
ls -lh backup_20240217_020000/mongodb/playwright-learning-prod/

# Count documents in backup
mongorestore \
  --uri="mongodb://localhost:27017/test-restore" \
  --dir=backup_20240217_020000/mongodb \
  --drop \
  --quiet

# Verify counts match production
mongo test-restore --eval "db.users.countDocuments()"
mongo test-restore --eval "db.lessons.countDocuments()"
```

### Backup Testing Schedule

| Test Type | Frequency | Purpose |
|-----------|-----------|---------|
| **Integrity Check** | Daily | Verify archive is not corrupted |
| **Metadata Verification** | Weekly | Verify backup manifest |
| **Partial Restore** | Monthly | Test restoring single collection |
| **Full Restore** | Quarterly | Test complete disaster recovery |

## Recovery Procedures

### Database Recovery

#### Scenario 1: Restore Entire Database

**Use Case**: Data corruption, accidental deletion, ransomware

```bash
# Step 1: Stop application (prevent new writes)
railway down
# OR
vercel env rm DATABASE_WRITE_ENABLED production

# Step 2: Identify backup to restore
aws s3 ls s3://playwright-learning-backups/daily/
# Choose: backup_20240217_020000.tar.gz

# Step 3: Download backup
aws s3 cp s3://playwright-learning-backups/daily/backup_20240217_020000.tar.gz ./

# Step 4: Extract
tar -xzf backup_20240217_020000.tar.gz

# Step 5: Restore
mongorestore \
  --uri="mongodb+srv://prod_user:password@cluster0.xxxxx.mongodb.net/playwright-learning-prod" \
  --dir=backup_20240217_020000/mongodb/playwright-learning-prod \
  --drop \
  --gzip

# Step 6: Verify
mongosh "mongodb+srv://..." --eval "db.users.countDocuments()"

# Step 7: Restart application
railway up
```

#### Scenario 2: Restore Single Collection

**Use Case**: Specific collection corrupted, need to rollback changes to one collection

```bash
# Restore only users collection
mongorestore \
  --uri="mongodb+srv://prod_user:password@cluster0.xxxxx.mongodb.net/playwright-learning-prod" \
  --dir=backup_20240217_020000/mongodb/playwright-learning-prod \
  --nsInclude="playwright-learning-prod.users" \
  --drop \
  --gzip

# Verify
mongosh "mongodb+srv://..." --eval "db.users.countDocuments()"
```

#### Scenario 3: Point-in-Time Restore (MongoDB Atlas)

**Use Case**: Restore to specific point before incident

1. Go to MongoDB Atlas
2. Select cluster
3. Click "Backup" tab
4. Click "Restore Data"
5. Select restore method: **Point in Time**
6. Choose date and time (e.g., 2024-02-17 10:30:00)
7. Choose restore target:
   - **Option A**: Restore to a new cluster (safer)
   - **Option B**: Restore to existing cluster (risky)
8. Click "Restore"

**Recommended**: Restore to new cluster, verify, then swap connection strings.

```bash
# After restore to new cluster
# Update connection string
railway variables set MONGODB_URI="mongodb+srv://...NEW_CLUSTER..."

# Deploy
railway up

# Verify application works
curl https://api.playwright-learning.com/health

# If successful, delete old cluster after 48 hours
```

### File Recovery

#### Restore User Uploads

```bash
# Download backup
aws s3 cp s3://playwright-learning-backups/files/uploads_backup_20240217.tar.gz ./

# Extract
tar -xzf uploads_backup_20240217.tar.gz

# Upload to production S3
aws s3 sync ./uploads s3://playwright-learning-prod/uploads/

# Or if using local storage
rsync -avz ./uploads/ /path/to/production/uploads/
```

#### Restore Configuration

```bash
# Download config backup
aws s3 cp s3://playwright-learning-backups/config/config_backup_20240217.tar.gz ./

# Extract
tar -xzf config_backup_20240217.tar.gz

# Review files
ls -lh

# Deploy updated configuration
vercel --prod
railway up
```

## Disaster Recovery

### Complete System Failure

**Scenario**: Total loss of production environment (cloud provider outage, account compromise, etc.)

#### Recovery Steps

**Phase 1: Assessment (0-15 minutes)**

1. Confirm incident scope
2. Activate incident response team
3. Update status page
4. Notify stakeholders

**Phase 2: Infrastructure Setup (15-60 minutes)**

```bash
# 1. Create new Railway/Render project
railway init

# 2. Create new Vercel project
cd frontend
vercel link

# 3. Create new MongoDB Atlas cluster
# Via Atlas UI - takes 7-10 minutes

# 4. Create new Redis instance
# Via Railway/Render dashboard
```

**Phase 3: Data Restoration (60-120 minutes)**

```bash
# 1. Download latest backup
aws s3 cp s3://playwright-learning-backups/daily/latest.tar.gz ./

# 2. Extract
tar -xzf latest.tar.gz

# 3. Restore database to new cluster
mongorestore \
  --uri="mongodb+srv://NEW_CLUSTER_URI" \
  --dir=./mongodb \
  --gzip

# 4. Restore files to new S3 bucket
aws s3 sync ./uploads s3://new-bucket-name/uploads/
```

**Phase 4: Configuration (120-150 minutes)**

```bash
# 1. Configure environment variables
railway variables set NODE_ENV=production
railway variables set MONGODB_URI="NEW_URI"
# ... (all other variables)

# 2. Deploy backend
cd backend
git push railway main

# 3. Deploy frontend
cd frontend
vercel --prod

# 4. Update DNS (if needed)
# Point domain to new deployments
```

**Phase 5: Verification (150-180 minutes)**

```bash
# 1. Run health checks
./scripts/health-check.sh production

# 2. Verify critical functions
# - User can login
# - Lessons load
# - Quizzes work

# 3. Monitor for errors
railway logs --tail

# 4. Update status page
```

### Data Center Failure

MongoDB Atlas automatically handles this with:
- Multi-region replica sets
- Automatic failover
- Zero-downtime

Railway/Render/Vercel also have automatic failover.

No action required unless all regions fail (extremely rare).

## Testing

### Quarterly Disaster Recovery Drill

**Schedule**: Last Saturday of each quarter

#### Drill Procedure

1. **Preparation** (1 week before):
   - Schedule drill
   - Notify team
   - Prepare test environment
   - Document starting state

2. **Execution** (4 hours):
   ```bash
   # Step 1: Create test environment
   railway init --name playwright-learning-dr-test

   # Step 2: Get latest backup
   ./scripts/backup.sh

   # Step 3: Restore to test environment
   mongorestore --uri="TEST_URI" --dir=./backups/latest/mongodb

   # Step 4: Deploy application
   railway up --environment test

   # Step 5: Verify
   ./scripts/health-check.sh test
   ```

3. **Validation**:
   - Time each step
   - Document issues
   - Verify RTO/RPO met
   - Test critical workflows

4. **Documentation**:
   - Update runbooks
   - Record lessons learned
   - Update recovery procedures
   - Share report with team

### Monthly Backup Verification

```bash
# Automated monthly test
# Add to crontab or GitHub Actions

#!/bin/bash
# scripts/verify-backup.sh

BACKUP_FILE=$(aws s3 ls s3://playwright-learning-backups/daily/ | sort | tail -n 1 | awk '{print $4}')

echo "Testing backup: $BACKUP_FILE"

# Download
aws s3 cp "s3://playwright-learning-backups/daily/$BACKUP_FILE" ./

# Verify integrity
tar -tzf "$BACKUP_FILE" > /dev/null || exit 1

# Extract
tar -xzf "$BACKUP_FILE"

# Restore to test database
mongorestore \
  --uri="mongodb://localhost:27017/backup-test" \
  --dir=./mongodb \
  --drop \
  --quiet || exit 1

# Verify counts
USERS=$(mongo backup-test --quiet --eval "db.users.countDocuments()")
LESSONS=$(mongo backup-test --quiet --eval "db.lessons.countDocuments()")

if [ "$USERS" -gt 0 ] && [ "$LESSONS" -gt 0 ]; then
  echo "Backup verification successful"
  echo "Users: $USERS, Lessons: $LESSONS"
  exit 0
else
  echo "Backup verification failed"
  exit 1
fi
```

## Backup Retention Policy

### Retention Schedule

| Backup Type | Retention Period | Storage Tier |
|-------------|-----------------|--------------|
| **Daily** | 30 days | Standard |
| **Weekly** | 90 days | Standard |
| **Monthly** | 1 year | Infrequent Access |
| **Yearly** | 7 years | Glacier |

### Automatic Cleanup

```bash
# S3 lifecycle policy
aws s3api put-bucket-lifecycle-configuration \
  --bucket playwright-learning-backups \
  --lifecycle-configuration file://lifecycle.json
```

`lifecycle.json`:
```json
{
  "Rules": [
    {
      "Id": "Delete old daily backups",
      "Status": "Enabled",
      "Prefix": "daily/",
      "Expiration": {
        "Days": 30
      }
    },
    {
      "Id": "Move monthly to IA",
      "Status": "Enabled",
      "Prefix": "monthly/",
      "Transitions": [
        {
          "Days": 90,
          "StorageClass": "STANDARD_IA"
        },
        {
          "Days": 365,
          "StorageClass": "GLACIER"
        }
      ]
    }
  ]
}
```

## Emergency Contacts

### Escalation Path

1. **On-Call Engineer**: [Phone/Slack]
2. **Database Admin**: [Phone/Email]
3. **Cloud Provider Support**: [Support portal]
4. **Management**: [Contact info]

### Vendor Support

- **MongoDB Atlas**: https://support.mongodb.com
- **AWS**: AWS Support Console
- **Railway**: https://railway.app/help
- **Vercel**: https://vercel.com/support

---

**Last Updated**: 2024-02-17
**Next Drill**: 2024-03-30
**Document Version**: 1.0
