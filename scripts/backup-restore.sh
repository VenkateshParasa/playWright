#!/bin/bash
# Backup and Restore Script for Playwright Learning Platform
# Handles database backups, S3 uploads, and disaster recovery

set -e

# Configuration
BACKUP_DIR="/var/backups/playwright-learning"
S3_BUCKET="${S3_BACKUP_BUCKET:-playwright-learning-backups}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# MongoDB Configuration
MONGODB_URI="${MONGODB_URI:-mongodb://localhost:27017}"
MONGODB_DATABASE="${MONGODB_DATABASE:-playwright_learning}"

# Redis Configuration
REDIS_HOST="${REDIS_HOST:-localhost}"
REDIS_PORT="${REDIS_PORT:-6379}"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Create backup directory
mkdir -p "$BACKUP_DIR"

backup_mongodb() {
    log_info "Starting MongoDB backup..."

    local backup_file="$BACKUP_DIR/mongodb_${TIMESTAMP}.gz"

    mongodump --uri="$MONGODB_URI" \
              --db="$MONGODB_DATABASE" \
              --archive="$backup_file" \
              --gzip

    if [ $? -eq 0 ]; then
        log_info "MongoDB backup completed: $backup_file"
        echo "$backup_file"
    else
        log_error "MongoDB backup failed"
        return 1
    fi
}

backup_redis() {
    log_info "Starting Redis backup..."

    local backup_file="$BACKUP_DIR/redis_${TIMESTAMP}.rdb"

    redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" --rdb "$backup_file"

    if [ $? -eq 0 ]; then
        log_info "Redis backup completed: $backup_file"
        echo "$backup_file"
    else
        log_error "Redis backup failed"
        return 1
    fi
}

backup_config() {
    log_info "Backing up configuration files..."

    local config_backup="$BACKUP_DIR/config_${TIMESTAMP}.tar.gz"

    tar -czf "$config_backup" \
        -C /etc/playwright-learning \
        config/ \
        secrets/ \
        || true

    if [ -f "$config_backup" ]; then
        log_info "Configuration backup completed: $config_backup"
        echo "$config_backup"
    else
        log_warn "Configuration backup skipped (no config directory found)"
        return 0
    fi
}

upload_to_s3() {
    local file="$1"

    if [ ! -f "$file" ]; then
        log_error "File not found: $file"
        return 1
    fi

    log_info "Uploading to S3: $file"

    aws s3 cp "$file" "s3://$S3_BUCKET/$(basename $file)" \
        --storage-class STANDARD_IA \
        --server-side-encryption AES256

    if [ $? -eq 0 ]; then
        log_info "Upload completed"
    else
        log_error "Upload failed"
        return 1
    fi
}

cleanup_old_backups() {
    log_info "Cleaning up old backups (older than $RETENTION_DAYS days)..."

    # Local cleanup
    find "$BACKUP_DIR" -type f -mtime +$RETENTION_DAYS -delete

    # S3 cleanup
    aws s3 ls "s3://$S3_BUCKET/" | while read -r line; do
        file=$(echo $line | awk '{print $4}')
        date=$(echo $line | awk '{print $1}')
        file_epoch=$(date -d "$date" +%s)
        current_epoch=$(date +%s)
        days_old=$(( ($current_epoch - $file_epoch) / 86400 ))

        if [ $days_old -gt $RETENTION_DAYS ]; then
            log_info "Deleting old backup: $file"
            aws s3 rm "s3://$S3_BUCKET/$file"
        fi
    done

    log_info "Cleanup completed"
}

restore_mongodb() {
    local backup_file="$1"

    if [ -z "$backup_file" ]; then
        log_error "No backup file specified"
        return 1
    fi

    log_warn "Restoring MongoDB from: $backup_file"
    log_warn "This will overwrite the existing database!"
    read -p "Are you sure? (yes/no): " confirm

    if [ "$confirm" != "yes" ]; then
        log_info "Restore cancelled"
        return 0
    fi

    # Download from S3 if needed
    if [[ "$backup_file" == s3://* ]]; then
        local local_file="$BACKUP_DIR/restore_$(basename $backup_file)"
        aws s3 cp "$backup_file" "$local_file"
        backup_file="$local_file"
    fi

    mongorestore --uri="$MONGODB_URI" \
                 --archive="$backup_file" \
                 --gzip \
                 --drop

    if [ $? -eq 0 ]; then
        log_info "MongoDB restore completed"
    else
        log_error "MongoDB restore failed"
        return 1
    fi
}

restore_redis() {
    local backup_file="$1"

    if [ -z "$backup_file" ]; then
        log_error "No backup file specified"
        return 1
    fi

    log_warn "Restoring Redis from: $backup_file"

    # Download from S3 if needed
    if [[ "$backup_file" == s3://* ]]; then
        local local_file="$BACKUP_DIR/restore_$(basename $backup_file)"
        aws s3 cp "$backup_file" "$local_file"
        backup_file="$local_file"
    fi

    # Stop Redis, replace dump, restart
    redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" SHUTDOWN NOSAVE
    sleep 2
    cp "$backup_file" /var/lib/redis/dump.rdb
    systemctl start redis

    if [ $? -eq 0 ]; then
        log_info "Redis restore completed"
    else
        log_error "Redis restore failed"
        return 1
    fi
}

list_backups() {
    log_info "Available backups:"
    echo ""
    echo "Local backups:"
    ls -lh "$BACKUP_DIR"
    echo ""
    echo "S3 backups:"
    aws s3 ls "s3://$S3_BUCKET/"
}

verify_backup() {
    local backup_file="$1"

    log_info "Verifying backup: $backup_file"

    if [[ "$backup_file" == *.gz ]]; then
        gunzip -t "$backup_file"
        if [ $? -eq 0 ]; then
            log_info "Backup verification passed"
        else
            log_error "Backup verification failed"
            return 1
        fi
    fi
}

full_backup() {
    log_info "Starting full backup..."

    # Backup MongoDB
    mongodb_backup=$(backup_mongodb)
    if [ $? -eq 0 ]; then
        upload_to_s3 "$mongodb_backup"
        verify_backup "$mongodb_backup"
    fi

    # Backup Redis
    redis_backup=$(backup_redis)
    if [ $? -eq 0 ]; then
        upload_to_s3 "$redis_backup"
    fi

    # Backup configuration
    config_backup=$(backup_config)
    if [ $? -eq 0 ] && [ -n "$config_backup" ]; then
        upload_to_s3 "$config_backup"
    fi

    # Cleanup old backups
    cleanup_old_backups

    log_info "Full backup completed successfully"
}

# Test restore (dry run)
test_restore() {
    log_info "Testing restore procedure (dry run)..."

    # Find latest backup
    latest_backup=$(ls -t "$BACKUP_DIR"/mongodb_*.gz | head -1)

    if [ -z "$latest_backup" ]; then
        log_error "No backups found for testing"
        return 1
    fi

    log_info "Would restore from: $latest_backup"
    verify_backup "$latest_backup"

    log_info "Restore test completed"
}

# Main function
case "${1}" in
    backup)
        full_backup
        ;;
    restore-mongodb)
        restore_mongodb "$2"
        ;;
    restore-redis)
        restore_redis "$2"
        ;;
    list)
        list_backups
        ;;
    verify)
        verify_backup "$2"
        ;;
    test)
        test_restore
        ;;
    cleanup)
        cleanup_old_backups
        ;;
    *)
        echo "Usage: $0 {backup|restore-mongodb|restore-redis|list|verify|test|cleanup}"
        echo ""
        echo "  backup              - Perform full backup"
        echo "  restore-mongodb FILE - Restore MongoDB from backup file"
        echo "  restore-redis FILE   - Restore Redis from backup file"
        echo "  list                - List available backups"
        echo "  verify FILE         - Verify backup integrity"
        echo "  test                - Test restore procedure (dry run)"
        echo "  cleanup             - Remove old backups"
        exit 1
        ;;
esac
