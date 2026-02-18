#!/bin/bash

################################################################################
# Backup Script for Playwright & Selenium Learning Platform
#
# This script handles database and file backups with encryption and
# upload to cloud storage
#
# Usage: ./scripts/backup.sh [backup_dir] [options]
#   backup_dir: Directory to store backups (optional, default: ./backups)
#   options: --encrypt, --upload, --clean
#
# Examples:
#   ./scripts/backup.sh
#   ./scripts/backup.sh /path/to/backups --encrypt --upload
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${1:-${PROJECT_ROOT}/backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="backup_${TIMESTAMP}"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"

# Parse options
ENCRYPT=false
UPLOAD=false
CLEAN=false

for arg in "$@"; do
    case $arg in
        --encrypt) ENCRYPT=true ;;
        --upload) UPLOAD=true ;;
        --clean) CLEAN=true ;;
    esac
done

# Logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✓${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ✗${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠${NC} $1"
}

################################################################################
# Backup Functions
################################################################################

create_backup_directory() {
    log "Creating backup directory: $BACKUP_PATH"
    mkdir -p "$BACKUP_PATH"
    log_success "Backup directory created"
}

backup_database() {
    log "Backing up MongoDB database..."

    # Check if mongodump is available
    if ! command -v mongodump &> /dev/null; then
        log_warning "mongodump not found, skipping database backup"
        log_warning "Install MongoDB Database Tools from: https://www.mongodb.com/try/download/database-tools"
        return 0
    fi

    # Get MongoDB URI from environment
    source "${PROJECT_ROOT}/backend/.env.production" 2>/dev/null || {
        log_warning "Production env file not found, using default"
        MONGODB_URI="mongodb://localhost:27017/playwright-learning"
    }

    # Perform backup
    mongodump \
        --uri="$MONGODB_URI" \
        --out="${BACKUP_PATH}/mongodb" \
        --gzip \
        --quiet

    log_success "Database backup completed: ${BACKUP_PATH}/mongodb"
}

backup_files() {
    log "Backing up application files..."

    # Backup environment files
    if [[ -f "${PROJECT_ROOT}/.env.production" ]]; then
        cp "${PROJECT_ROOT}/.env.production" "${BACKUP_PATH}/"
    fi

    # Backup uploads directory if exists
    if [[ -d "${PROJECT_ROOT}/uploads" ]]; then
        cp -r "${PROJECT_ROOT}/uploads" "${BACKUP_PATH}/"
    fi

    # Backup configuration files
    mkdir -p "${BACKUP_PATH}/config"
    [[ -f "${PROJECT_ROOT}/vercel.json" ]] && cp "${PROJECT_ROOT}/vercel.json" "${BACKUP_PATH}/config/"
    [[ -f "${PROJECT_ROOT}/railway.toml" ]] && cp "${PROJECT_ROOT}/railway.toml" "${BACKUP_PATH}/config/"
    [[ -f "${PROJECT_ROOT}/render.yaml" ]] && cp "${PROJECT_ROOT}/render.yaml" "${BACKUP_PATH}/config/"

    log_success "File backup completed"
}

create_backup_archive() {
    log "Creating backup archive..."

    cd "$BACKUP_DIR"
    tar -czf "${BACKUP_NAME}.tar.gz" "$BACKUP_NAME"

    # Get archive size
    local size=$(du -h "${BACKUP_NAME}.tar.gz" | cut -f1)
    log_success "Backup archive created: ${BACKUP_NAME}.tar.gz (${size})"

    # Remove uncompressed backup
    rm -rf "$BACKUP_NAME"
}

encrypt_backup() {
    if [[ "$ENCRYPT" == "true" ]]; then
        log "Encrypting backup..."

        # Check if openssl is available
        if ! command -v openssl &> /dev/null; then
            log_error "openssl not found, cannot encrypt backup"
            return 1
        fi

        # Get encryption password from environment or prompt
        if [[ -z "${BACKUP_ENCRYPTION_KEY:-}" ]]; then
            log_warning "BACKUP_ENCRYPTION_KEY not set in environment"
            read -sp "Enter encryption password: " BACKUP_ENCRYPTION_KEY
            echo
        fi

        # Encrypt
        openssl enc -aes-256-cbc -salt \
            -in "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" \
            -out "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz.enc" \
            -k "$BACKUP_ENCRYPTION_KEY"

        # Remove unencrypted archive
        rm "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"

        log_success "Backup encrypted: ${BACKUP_NAME}.tar.gz.enc"
    fi
}

upload_to_cloud() {
    if [[ "$UPLOAD" == "true" ]]; then
        log "Uploading backup to cloud storage..."

        local backup_file
        if [[ "$ENCRYPT" == "true" ]]; then
            backup_file="${BACKUP_DIR}/${BACKUP_NAME}.tar.gz.enc"
        else
            backup_file="${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
        fi

        # AWS S3
        if command -v aws &> /dev/null && [[ -n "${AWS_S3_BUCKET:-}" ]]; then
            log "Uploading to AWS S3..."
            aws s3 cp "$backup_file" "s3://${BACKUP_S3_BUCKET:-$AWS_S3_BUCKET}/backups/"
            log_success "Uploaded to S3"
        fi

        # Cloudflare R2 (using rclone)
        if command -v rclone &> /dev/null && [[ -n "${R2_BUCKET:-}" ]]; then
            log "Uploading to Cloudflare R2..."
            rclone copy "$backup_file" "r2:${R2_BUCKET}/backups/"
            log_success "Uploaded to R2"
        fi

        # If no cloud provider is configured
        if ! command -v aws &> /dev/null && ! command -v rclone &> /dev/null; then
            log_warning "No cloud storage configured, skipping upload"
        fi
    fi
}

cleanup_old_backups() {
    if [[ "$CLEAN" == "true" ]]; then
        log "Cleaning up old backups..."

        # Keep only last 30 days of backups
        local retention_days="${BACKUP_RETENTION_DAYS:-30}"

        find "$BACKUP_DIR" -name "backup_*.tar.gz*" -mtime "+${retention_days}" -delete

        local deleted=$(find "$BACKUP_DIR" -name "backup_*.tar.gz*" -mtime "+${retention_days}" | wc -l)
        log_success "Cleaned up old backups (kept last ${retention_days} days)"
    fi
}

create_backup_manifest() {
    log "Creating backup manifest..."

    local manifest_file="${BACKUP_DIR}/${BACKUP_NAME}_manifest.json"

    cat > "$manifest_file" <<EOF
{
  "backup_name": "${BACKUP_NAME}",
  "timestamp": "$(date -Iseconds)",
  "environment": "${NODE_ENV:-production}",
  "encrypted": ${ENCRYPT},
  "uploaded": ${UPLOAD},
  "mongodb_version": "$(mongod --version 2>/dev/null | head -n1 || echo 'unknown')",
  "node_version": "$(node --version)",
  "git_commit": "$(cd "$PROJECT_ROOT" && git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "git_branch": "$(cd "$PROJECT_ROOT" && git branch --show-current 2>/dev/null || echo 'unknown')"
}
EOF

    log_success "Backup manifest created"
}

verify_backup() {
    log "Verifying backup integrity..."

    local backup_file
    if [[ "$ENCRYPT" == "true" ]]; then
        backup_file="${BACKUP_DIR}/${BACKUP_NAME}.tar.gz.enc"
    else
        backup_file="${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
    fi

    # Check if backup file exists
    if [[ ! -f "$backup_file" ]]; then
        log_error "Backup file not found: $backup_file"
        return 1
    fi

    # Check if backup file is not empty
    local size=$(stat -f%z "$backup_file" 2>/dev/null || stat -c%s "$backup_file" 2>/dev/null)
    if [[ $size -eq 0 ]]; then
        log_error "Backup file is empty"
        return 1
    fi

    # Verify archive integrity (if not encrypted)
    if [[ "$ENCRYPT" == "false" ]]; then
        if tar -tzf "$backup_file" &> /dev/null; then
            log_success "Backup integrity verified"
        else
            log_error "Backup archive is corrupted"
            return 1
        fi
    else
        log_success "Backup file exists (encrypted, skipping integrity check)"
    fi
}

################################################################################
# Main
################################################################################

main() {
    log "====================================================================="
    log "Starting backup process"
    log "====================================================================="
    log "Timestamp: $(date)"
    log "Backup directory: $BACKUP_PATH"
    log "Encryption: $ENCRYPT"
    log "Upload: $UPLOAD"
    log ""

    # Create backup
    create_backup_directory
    backup_database
    backup_files
    create_backup_manifest
    create_backup_archive

    # Post-processing
    encrypt_backup
    verify_backup
    upload_to_cloud
    cleanup_old_backups

    log ""
    log "====================================================================="
    log_success "Backup completed successfully!"
    log "====================================================================="
    log "Backup location: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz$([ "$ENCRYPT" == "true" ] && echo '.enc')"
    log ""
}

# Run main
main
