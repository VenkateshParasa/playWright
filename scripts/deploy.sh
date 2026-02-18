#!/bin/bash

################################################################################
# Production Deployment Script
#
# This script handles the complete deployment process for the
# Playwright & Selenium Learning Platform
#
# Usage: ./scripts/deploy.sh [environment] [service]
#   environment: staging|production (default: production)
#   service: frontend|backend|all (default: all)
#
# Examples:
#   ./scripts/deploy.sh production all
#   ./scripts/deploy.sh staging frontend
################################################################################

set -e  # Exit on error
set -u  # Exit on undefined variable
set -o pipefail  # Exit on pipe failure

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENVIRONMENT="${1:-production}"
SERVICE="${2:-all}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="${PROJECT_ROOT}/logs/deploy_${TIMESTAMP}.log"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

# Deployment settings
DEPLOY_TIMEOUT=600  # 10 minutes
HEALTH_CHECK_RETRIES=30
HEALTH_CHECK_INTERVAL=10

################################################################################
# Logging Functions
################################################################################

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✓${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ✗${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠${NC} $1" | tee -a "$LOG_FILE"
}

log_info() {
    log "$1"
}

log_warn() {
    log_warning "$1"
}

check_environment() {
    if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "production" ]; then
        log_error "Invalid environment: $ENVIRONMENT"
        echo "Usage: ./deploy.sh [staging|production]"
        exit 1
    fi
}

check_dependencies() {
    log_info "Checking dependencies..."

    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi

    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi

    log_info "All dependencies are installed"
}

run_tests() {
    log_info "Running tests..."

    cd "$FRONTEND_DIR"

    # Run linter
    log_info "Running linter..."
    npm run lint

    # Run type check
    log_info "Running type check..."
    npm run type-check

    # Run unit tests
    log_info "Running unit tests..."
    npm run test -- --run

    log_info "All tests passed"
}

build_project() {
    log_info "Building project for $ENVIRONMENT..."

    cd "$FRONTEND_DIR"

    # Set environment variables
    if [ "$ENVIRONMENT" = "production" ]; then
        export VITE_ENV=production
        export VITE_API_URL="${PRODUCTION_API_URL:-https://api.playwright-selenium-learning.com}"
    else
        export VITE_ENV=staging
        export VITE_API_URL="${STAGING_API_URL:-https://api-staging.playwright-selenium-learning.com}"
    fi

    # Build
    npm run build

    log_info "Build completed successfully"
}

deploy_to_vercel() {
    log_info "Deploying to Vercel ($ENVIRONMENT)..."

    cd "$FRONTEND_DIR"

    if [ "$ENVIRONMENT" = "production" ]; then
        npx vercel --prod --yes
    else
        npx vercel --yes
    fi

    log_info "Deployment completed successfully"
}

run_smoke_tests() {
    log_info "Running smoke tests..."

    cd "$FRONTEND_DIR"

    # Install Playwright browsers if not already installed
    npx playwright install chromium --with-deps

    # Set base URL based on environment
    if [ "$ENVIRONMENT" = "production" ]; then
        export PLAYWRIGHT_BASE_URL="https://playwright-selenium-learning.com"
    else
        export PLAYWRIGHT_BASE_URL="https://staging.playwright-selenium-learning.com"
    fi

    # Run smoke tests
    npm run test:e2e -- --grep @smoke

    log_info "Smoke tests passed"
}

create_deployment_tag() {
    if [ "$ENVIRONMENT" = "production" ]; then
        log_info "Creating deployment tag..."

        cd "$PROJECT_ROOT"

        TAG="deployment-$(date +%Y%m%d-%H%M%S)"
        git tag -a "$TAG" -m "Production deployment $TAG"
        git push origin "$TAG"

        log_info "Created tag: $TAG"
    fi
}

rollback() {
    log_error "Deployment failed. Initiating rollback..."

    cd "$FRONTEND_DIR"

    # Rollback using Vercel CLI
    npx vercel rollback

    log_info "Rollback completed"
}

# Main deployment flow
main() {
    log_info "Starting deployment to $ENVIRONMENT..."

    check_environment
    check_dependencies

    # Install dependencies
    log_info "Installing dependencies..."
    cd "$FRONTEND_DIR"
    npm ci

    # Run tests
    run_tests

    # Build project
    build_project

    # Deploy
    deploy_to_vercel

    # Run smoke tests (skip for staging to speed up deployment)
    if [ "$ENVIRONMENT" = "production" ]; then
        run_smoke_tests || {
            rollback
            exit 1
        }
    fi

    # Create deployment tag for production
    create_deployment_tag

    log_info "Deployment to $ENVIRONMENT completed successfully!"

    if [ "$ENVIRONMENT" = "production" ]; then
        log_info "Production URL: https://playwright-selenium-learning.com"
    else
        log_info "Staging URL: https://staging.playwright-selenium-learning.com"
    fi
}

# Trap errors and rollback
trap 'rollback' ERR

# Run main function
main
