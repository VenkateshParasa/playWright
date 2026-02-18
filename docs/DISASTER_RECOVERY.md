# Disaster Recovery Guide

## Overview

This guide outlines disaster recovery (DR) procedures for the Playwright & Selenium Learning Platform, including backup strategies, failover procedures, and recovery processes.

## Recovery Objectives

### Recovery Time Objective (RTO)
**Target**: 1 hour maximum downtime

**Service-specific RTO**:
- Critical services (Auth, API Gateway): 15 minutes
- Core services (Content, User): 30 minutes
- Supporting services (Analytics, Notifications): 1 hour

### Recovery Point Objective (RPO)
**Target**: 5 minutes maximum data loss

**Data-specific RPO**:
- User data and authentication: 1 minute (continuous replication)
- Content and courses: 5 minutes (frequent backups)
- Analytics: 15 minutes (acceptable data loss)
- Logs and metrics: 1 hour (acceptable data loss)

## Backup Strategy

### 1. Database Backups

#### MongoDB

**Continuous Backup**:
```bash
# Automated backup every hour
0 * * * * /usr/local/bin/backup-restore.sh backup

# Full backup daily
0 2 * * * /usr/local/bin/backup-restore.sh backup --full
```

**Configuration**:
```javascript
// Backup with mongodump
mongodump --uri="mongodb://primary:27017/playwright_learning" \
          --archive="/backups/mongodb_$(date +%Y%m%d_%H%M%S).gz" \
          --gzip \
          --oplog  // Include oplog for point-in-time recovery
```

**Point-in-Time Recovery**:
```bash
# Restore to specific time
mongorestore --uri="mongodb://primary:27017" \
             --archive="/backups/mongodb_20240217_020000.gz" \
             --gzip \
             --oplogReplay \
             --oplogLimit="1708142400:0"  // Unix timestamp
```

#### Redis

**RDB Snapshots**:
```bash
# Configure Redis
save 900 1      # Save after 900 sec if 1 key changed
save 300 10     # Save after 300 sec if 10 keys changed
save 60 10000   # Save after 60 sec if 10000 keys changed

# Manual snapshot
redis-cli BGSAVE
```

**AOF (Append-Only File)**:
```bash
# Enable AOF
appendonly yes
appendfsync everysec  # fsync every second
```

### 2. File Storage Backups

#### S3 Versioning

```terraform
# Enable versioning
resource "aws_s3_bucket_versioning" "content" {
  bucket = aws_s3_bucket.content.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Cross-region replication
resource "aws_s3_bucket_replication_configuration" "replication" {
  bucket = aws_s3_bucket.content.id
  role   = aws_iam_role.replication.arn

  rule {
    id     = "replicate-all"
    status = "Enabled"

    destination {
      bucket        = aws_s3_bucket.backup.arn
      storage_class = "STANDARD_IA"
    }
  }
}
```

### 3. Configuration Backups

```bash
# Backup Kubernetes resources
kubectl get all -n playwright-learning -o yaml > k8s-backup.yaml
kubectl get configmap -n playwright-learning -o yaml > configmaps-backup.yaml
kubectl get secret -n playwright-learning -o yaml > secrets-backup.yaml

# Backup with encryption
kubectl get secret -n playwright-learning -o yaml | \
  gpg --encrypt --recipient admin@playwright-learning.com > secrets-backup.yaml.gpg
```

### 4. Automated Backup Script

```bash
#!/bin/bash
# /usr/local/bin/backup-restore.sh

# Full backup procedure
full_backup() {
  echo "Starting full backup..."

  # MongoDB backup
  mongodump --uri="$MONGODB_URI" \
            --archive="$BACKUP_DIR/mongodb_${TIMESTAMP}.gz" \
            --gzip \
            --oplog

  # Redis backup
  redis-cli -h $REDIS_HOST BGSAVE
  sleep 10
  cp /var/lib/redis/dump.rdb "$BACKUP_DIR/redis_${TIMESTAMP}.rdb"

  # Configuration backup
  tar -czf "$BACKUP_DIR/config_${TIMESTAMP}.tar.gz" \
      /etc/playwright-learning/

  # Upload to S3
  aws s3 sync "$BACKUP_DIR" "s3://$S3_BACKUP_BUCKET/" \
      --storage-class GLACIER_IR

  # Verify backups
  verify_backups

  echo "Backup completed"
}
```

## Multi-Region Deployment

### Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   US-EAST-1     │         │   US-WEST-2     │         │   EU-WEST-1     │
│   (Primary)     │◄───────►│  (Secondary)    │◄───────►│   (Tertiary)    │
│                 │         │                 │         │                 │
│  ┌───────────┐  │         │  ┌───────────┐  │         │  ┌───────────┐  │
│  │    EKS    │  │         │  │    EKS    │  │         │  │    EKS    │  │
│  └───────────┘  │         │  └───────────┘  │         │  └───────────┘  │
│                 │         │                 │         │                 │
│  ┌───────────┐  │         │  ┌───────────┐  │         │  ┌───────────┐  │
│  │  MongoDB  │──┼────────►│  │  MongoDB  │──┼────────►│  │  MongoDB  │  │
│  │ (Primary) │  │         │  │ (Replica) │  │         │  │ (Replica) │  │
│  └───────────┘  │         │  └───────────┘  │         │  └───────────┘  │
│                 │         │                 │         │                 │
│  ┌───────────┐  │         │  ┌───────────┐  │         │  ┌───────────┐  │
│  │    S3     │──┼────────►│  │    S3     │──┼────────►│  │    S3     │  │
│  │(Versioned)│  │         │  │ (Replica) │  │         │  │ (Replica) │  │
│  └───────────┘  │         │  └───────────┘  │         │  └───────────┘  │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

### DNS Failover

```terraform
# Route53 health checks
resource "aws_route53_health_check" "primary" {
  fqdn              = "api.playwright-learning.com"
  port              = 443
  type              = "HTTPS"
  resource_path     = "/health"
  failure_threshold = "3"
  request_interval  = "30"
}

# Failover routing
resource "aws_route53_record" "api" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "api.playwright-learning.com"
  type    = "A"

  failover_routing_policy {
    type = "PRIMARY"
  }

  set_identifier = "primary"
  health_check_id = aws_route53_health_check.primary.id

  alias {
    name                   = aws_lb.primary.dns_name
    zone_id                = aws_lb.primary.zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "api_secondary" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "api.playwright-learning.com"
  type    = "A"

  failover_routing_policy {
    type = "SECONDARY"
  }

  set_identifier = "secondary"

  alias {
    name                   = aws_lb.secondary.dns_name
    zone_id                = aws_lb.secondary.zone_id
    evaluate_target_health = true
  }
}
```

## Disaster Scenarios & Recovery

### Scenario 1: Service Failure

**Detection**:
- Health check failures
- Prometheus alerts
- User reports

**Recovery**:
```bash
# 1. Identify failing service
kubectl get pods -n playwright-learning | grep -v Running

# 2. Check logs
kubectl logs POD_NAME -n playwright-learning --tail=100

# 3. Restart pod
kubectl delete pod POD_NAME -n playwright-learning

# 4. If deployment issue, rollback
kubectl rollout undo deployment/SERVICE_NAME -n playwright-learning

# 5. Verify recovery
kubectl get pods -n playwright-learning
curl https://api.playwright-learning.com/health
```

### Scenario 2: Database Failure

**Detection**:
- MongoDB replica set status
- Connection errors
- Data corruption alerts

**Recovery**:
```bash
# 1. Check replica set status
kubectl exec -it mongodb-0 -n playwright-learning -- \
  mongosh --eval "rs.status()"

# 2. If primary failed, force election
kubectl exec -it mongodb-1 -n playwright-learning -- \
  mongosh --eval "rs.stepDown()"

# 3. If data corruption, restore from backup
mongorestore --uri="mongodb://primary:27017" \
             --archive="/backups/mongodb_LATEST.gz" \
             --gzip \
             --drop

# 4. Verify data integrity
mongosh --eval "db.users.count()"
mongosh --eval "db.stats()"
```

### Scenario 3: Region Failure

**Detection**:
- AWS health dashboard
- Multi-region health checks
- DNS failover triggers

**Recovery**:
```bash
# 1. DNS automatically fails over to secondary region

# 2. Verify secondary region health
kubectl get pods -n playwright-learning --context=us-west-2

# 3. Promote secondary database to primary
kubectl exec -it mongodb-0 -n playwright-learning --context=us-west-2 -- \
  mongosh --eval "rs.reconfig({...})"

# 4. Update application configuration
kubectl set env deployment/api-gateway \
  MONGODB_URI=mongodb://us-west-2-primary:27017 \
  -n playwright-learning

# 5. Monitor metrics in Grafana
```

### Scenario 4: Data Corruption

**Detection**:
- Data validation failures
- User reports
- Checksum mismatches

**Recovery**:
```bash
# 1. Stop application writes
kubectl scale deployment api-gateway --replicas=0 -n playwright-learning

# 2. Assess corruption extent
mongosh --eval "db.users.find({}).forEach(function(doc) {
  if (!doc.email) print(doc._id);
})"

# 3. Restore from backup
mongorestore --uri="mongodb://primary:27017" \
             --archive="/backups/mongodb_20240217_020000.gz" \
             --gzip \
             --oplogReplay

# 4. Replay transaction log (if available)
# Apply changes from oplog between backup and corruption

# 5. Verify data
# Run data validation scripts

# 6. Resume operations
kubectl scale deployment api-gateway --replicas=3 -n playwright-learning
```

### Scenario 5: Complete Data Center Loss

**Recovery**:
```bash
# 1. Activate DR site
terraform apply -target=module.dr_site -var="activate_dr=true"

# 2. Update DNS to point to DR site
aws route53 change-resource-record-sets \
  --hosted-zone-id ZONE_ID \
  --change-batch file://dns-failover.json

# 3. Restore databases in DR site
./scripts/backup-restore.sh restore-mongodb s3://backups/mongodb_LATEST.gz
./scripts/backup-restore.sh restore-redis s3://backups/redis_LATEST.rdb

# 4. Deploy application to DR cluster
./scripts/deploy-kubernetes.sh deploy --context=dr-site

# 5. Verify all services
kubectl get all -n playwright-learning --context=dr-site
curl https://api.playwright-learning.com/health

# 6. Monitor and communicate status
```

## Testing Recovery Procedures

### Monthly DR Drill

```bash
#!/bin/bash
# Monthly disaster recovery drill

echo "=== DR DRILL START ==="

# 1. Backup current state
./scripts/backup-restore.sh backup

# 2. Simulate region failure
kubectl delete namespace playwright-learning --context=primary

# 3. Failover to secondary
./scripts/dr-failover.sh --to=secondary

# 4. Verify services
./scripts/verify-deployment.sh --region=secondary

# 5. Restore primary region
./scripts/deploy-kubernetes.sh deploy --context=primary

# 6. Failback to primary
./scripts/dr-failover.sh --to=primary

# 7. Document results
./scripts/dr-report.sh

echo "=== DR DRILL COMPLETE ==="
```

### Backup Verification

```bash
#!/bin/bash
# Verify backup integrity

# 1. Download recent backup
aws s3 cp s3://backups/mongodb_LATEST.gz /tmp/

# 2. Verify file integrity
gunzip -t /tmp/mongodb_LATEST.gz

# 3. Restore to test environment
mongorestore --uri="mongodb://test-db:27017" \
             --archive="/tmp/mongodb_LATEST.gz" \
             --gzip

# 4. Run data validation
node scripts/validate-data.js --env=test

# 5. Check record counts
mongosh test-db --eval "db.users.count()"

# 6. Cleanup
rm /tmp/mongodb_LATEST.gz
```

## Incident Response

### 1. Detection & Alert

```yaml
# Prometheus alert
- alert: ServiceDown
  expr: up{job="api-gateway"} == 0
  for: 2m
  labels:
    severity: critical
  annotations:
    summary: "Service {{ $labels.job }} is down"
    runbook: "https://docs.playwright-learning.com/runbooks/service-down"
```

### 2. Incident Response Team

**Roles**:
- **Incident Commander**: Coordinates response
- **Operations Lead**: Executes recovery procedures
- **Communications Lead**: Updates stakeholders
- **Technical Leads**: Service-specific experts

### 3. Communication Plan

```typescript
// Automated status page update
async function updateStatus(incident: Incident) {
  await statuspage.createIncident({
    name: incident.title,
    status: 'investigating',
    body: incident.description,
    components: incident.affectedComponents,
  });

  // Notify stakeholders
  await notifyStakeholders({
    email: true,
    sms: true,
    slack: true,
    twitter: true,
  });
}
```

### 4. Post-Incident Review

```markdown
# Post-Incident Report Template

## Incident Summary
- **Date**: 2024-02-17
- **Duration**: 45 minutes
- **Severity**: High
- **Impact**: 15% of users affected

## Timeline
- 14:00 - Alert triggered
- 14:05 - Incident commander assigned
- 14:10 - Root cause identified
- 14:30 - Fix deployed
- 14:45 - Service restored

## Root Cause
[Detailed explanation]

## Resolution
[Steps taken to resolve]

## Lessons Learned
- What went well
- What could be improved
- Action items

## Follow-up Actions
- [ ] Update runbook
- [ ] Add monitoring
- [ ] Fix underlying issue
- [ ] Review similar systems
```

## Monitoring & Alerts

### Critical Alerts

```yaml
# High priority alerts
- Database replication lag > 60s
- Service uptime < 99.9%
- Error rate > 1%
- Response time p99 > 5s
- Disk usage > 85%
- Memory usage > 90%
- Backup failure
```

### Dashboard

```grafana
// DR Dashboard panels
- Service health across regions
- Database replication status
- Backup success/failure
- RTO/RPO metrics
- Failover readiness
- Cross-region latency
```

## Compliance & Documentation

### Required Documentation

1. **DR Plan** - This document
2. **Runbooks** - Step-by-step procedures
3. **Contact List** - On-call rotation
4. **Architecture Diagrams** - System layout
5. **Backup Schedules** - Automated jobs
6. **Test Results** - DR drill reports

### Compliance Requirements

- **SOC 2**: Regular backups, tested recovery
- **GDPR**: Data recovery within 72 hours
- **HIPAA**: Encrypted backups, access logs
- **PCI DSS**: Backup retention, security

## Checklist

### Daily
- [ ] Verify automated backups completed
- [ ] Check database replication status
- [ ] Review monitoring dashboards

### Weekly
- [ ] Test backup restoration
- [ ] Review DR metrics
- [ ] Update on-call schedule

### Monthly
- [ ] Conduct DR drill
- [ ] Review and update DR plan
- [ ] Audit backup retention
- [ ] Test cross-region failover

### Quarterly
- [ ] Full-scale DR exercise
- [ ] Update contact information
- [ ] Review RTO/RPO metrics
- [ ] Compliance audit

## Support Contacts

- **AWS Support**: Premium support, 24/7
- **MongoDB Support**: Enterprise support
- **Kubernetes Support**: Red Hat support
- **On-call Engineering**: PagerDuty
- **Security Team**: security@playwright-learning.com
