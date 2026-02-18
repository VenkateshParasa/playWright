#!/bin/bash

###############################################################################
# Rollback Script
# Usage: ./rollback.sh [staging|production] [version]
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
VERSION=${2}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

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
        echo "Usage: ./rollback.sh [staging|production] [version]"
        exit 1
    fi
}

confirm_rollback() {
    log_warn "You are about to rollback $ENVIRONMENT environment"

    if [ -n "$VERSION" ]; then
        log_warn "Target version: $VERSION"
    else
        log_warn "Will rollback to previous deployment"
    fi

    read -p "Are you sure you want to continue? (yes/no): " CONFIRM

    if [ "$CONFIRM" != "yes" ]; then
        log_info "Rollback cancelled"
        exit 0
    fi
}

rollback_vercel() {
    log_info "Rolling back Vercel deployment..."

    cd "$PROJECT_ROOT/frontend"

    if [ -n "$VERSION" ]; then
        # Rollback to specific version
        npx vercel rollback "$VERSION" --yes
    else
        # Rollback to previous deployment
        npx vercel rollback --yes
    fi

    log_info "Vercel rollback completed"
}

verify_rollback() {
    log_info "Verifying rollback..."

    # Set base URL based on environment
    if [ "$ENVIRONMENT" = "production" ]; then
        BASE_URL="https://playwright-selenium-learning.com"
    else
        BASE_URL="https://staging.playwright-selenium-learning.com"
    fi

    # Check if site is accessible
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL")

    if [ "$HTTP_STATUS" -eq 200 ]; then
        log_info "Site is accessible (HTTP $HTTP_STATUS)"
    else
        log_error "Site returned HTTP $HTTP_STATUS"
        exit 1
    fi

    log_info "Rollback verified successfully"
}

notify_team() {
    log_info "Notifying team..."

    # Add notification logic here
    # Example: Send Slack notification
    # Example: Create GitHub issue

    log_info "Team notified"
}

# Main rollback flow
main() {
    log_info "Starting rollback for $ENVIRONMENT..."

    check_environment
    confirm_rollback
    rollback_vercel
    verify_rollback
    notify_team

    log_info "Rollback completed successfully!"

    if [ "$ENVIRONMENT" = "production" ]; then
        log_warn "Production has been rolled back. Please investigate the issue."
    fi
}

# Run main function
main
