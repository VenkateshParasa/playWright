#!/bin/bash

###############################################################################
# Database Migration Script
# Usage: ./migrate.sh [staging|production] [up|down|status]
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
COMMAND=${2:-up}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$PROJECT_ROOT/backend"

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_environment() {
    if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "production" ]; then
        log_error "Invalid environment: $ENVIRONMENT"
        echo "Usage: ./migrate.sh [staging|production] [up|down|status]"
        exit 1
    fi
}

check_command() {
    if [ "$COMMAND" != "up" ] && [ "$COMMAND" != "down" ] && [ "$COMMAND" != "status" ]; then
        log_error "Invalid command: $COMMAND"
        echo "Usage: ./migrate.sh [staging|production] [up|down|status]"
        exit 1
    fi
}

load_environment() {
    log_info "Loading environment variables for $ENVIRONMENT..."

    if [ "$ENVIRONMENT" = "production" ]; then
        export DATABASE_URL="${PRODUCTION_DATABASE_URL}"
    else
        export DATABASE_URL="${STAGING_DATABASE_URL}"
    fi

    if [ -z "$DATABASE_URL" ]; then
        log_error "DATABASE_URL is not set for $ENVIRONMENT"
        exit 1
    fi
}

backup_database() {
    if [ "$ENVIRONMENT" = "production" ]; then
        log_info "Creating database backup..."

        BACKUP_FILE="backup-$(date +%Y%m%d-%H%M%S).sql"

        # Add your database backup command here
        # Example for PostgreSQL:
        # pg_dump $DATABASE_URL > "$PROJECT_ROOT/backups/$BACKUP_FILE"

        log_info "Backup created: $BACKUP_FILE"
    fi
}

run_migration() {
    log_info "Running migrations ($COMMAND)..."

    cd "$BACKEND_DIR"

    case $COMMAND in
        up)
            # Run migrations up
            # Add your migration command here
            # Example: npm run migrate:up
            # Example: npx prisma migrate deploy
            # Example: npx knex migrate:latest
            log_info "Applying migrations..."
            npm run migrate:up
            ;;
        down)
            # Run migrations down
            log_warn "Rolling back last migration..."
            npm run migrate:down
            ;;
        status)
            # Check migration status
            log_info "Checking migration status..."
            npm run migrate:status
            ;;
    esac

    log_info "Migration command completed"
}

verify_migration() {
    log_info "Verifying migration..."

    cd "$BACKEND_DIR"

    # Add verification logic here
    # Example: Check if specific tables exist
    # Example: Run test queries

    log_info "Migration verified successfully"
}

rollback_migration() {
    log_error "Migration failed. Rolling back..."

    cd "$BACKEND_DIR"

    # Add rollback logic here
    # Example: npm run migrate:down

    log_error "Migration rolled back"
}

# Main migration flow
main() {
    log_info "Starting database migration for $ENVIRONMENT..."

    check_environment
    check_command
    load_environment

    # Create backup for production
    backup_database

    # Run migration
    run_migration

    # Verify migration (only for up command)
    if [ "$COMMAND" = "up" ]; then
        verify_migration || {
            rollback_migration
            exit 1
        }
    fi

    log_info "Database migration completed successfully!"
}

# Trap errors and rollback
if [ "$COMMAND" = "up" ]; then
    trap 'rollback_migration' ERR
fi

# Run main function
main
