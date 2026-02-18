#!/bin/bash

###############################################################################
# Setup CI/CD Script
# This script sets up the necessary secrets and configurations for CI/CD
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if gh CLI is installed
check_gh_cli() {
    if ! command -v gh &> /dev/null; then
        log_error "GitHub CLI (gh) is not installed"
        log_info "Install it from: https://cli.github.com/"
        exit 1
    fi

    # Check if authenticated
    if ! gh auth status &> /dev/null; then
        log_error "Not authenticated with GitHub CLI"
        log_info "Run: gh auth login"
        exit 1
    fi

    log_info "GitHub CLI is installed and authenticated"
}

# Setup GitHub Actions secrets
setup_secrets() {
    log_step "Setting up GitHub Actions secrets..."

    echo ""
    log_info "Please provide the following secrets:"
    echo ""

    # Vercel secrets
    log_warn "Vercel Configuration"
    read -p "Enter VERCEL_TOKEN: " VERCEL_TOKEN
    read -p "Enter VERCEL_ORG_ID: " VERCEL_ORG_ID
    read -p "Enter VERCEL_PROJECT_ID: " VERCEL_PROJECT_ID

    gh secret set VERCEL_TOKEN --body "$VERCEL_TOKEN"
    gh secret set VERCEL_ORG_ID --body "$VERCEL_ORG_ID"
    gh secret set VERCEL_PROJECT_ID --body "$VERCEL_PROJECT_ID"

    # API URLs
    log_warn "API Configuration"
    read -p "Enter STAGING_API_URL (default: https://api-staging.example.com): " STAGING_API_URL
    STAGING_API_URL=${STAGING_API_URL:-https://api-staging.example.com}
    read -p "Enter PRODUCTION_API_URL (default: https://api.example.com): " PRODUCTION_API_URL
    PRODUCTION_API_URL=${PRODUCTION_API_URL:-https://api.example.com}

    gh secret set STAGING_API_URL --body "$STAGING_API_URL"
    gh secret set PRODUCTION_API_URL --body "$PRODUCTION_API_URL"

    # Database URLs (optional)
    log_warn "Database Configuration (optional, press Enter to skip)"
    read -p "Enter STAGING_DATABASE_URL: " STAGING_DATABASE_URL
    read -p "Enter PRODUCTION_DATABASE_URL: " PRODUCTION_DATABASE_URL

    if [ -n "$STAGING_DATABASE_URL" ]; then
        gh secret set STAGING_DATABASE_URL --body "$STAGING_DATABASE_URL"
    fi

    if [ -n "$PRODUCTION_DATABASE_URL" ]; then
        gh secret set PRODUCTION_DATABASE_URL --body "$PRODUCTION_DATABASE_URL"
    fi

    # Slack webhook (optional)
    log_warn "Notification Configuration (optional, press Enter to skip)"
    read -p "Enter SLACK_WEBHOOK: " SLACK_WEBHOOK

    if [ -n "$SLACK_WEBHOOK" ]; then
        gh secret set SLACK_WEBHOOK --body "$SLACK_WEBHOOK"
    fi

    # Snyk token (optional)
    log_warn "Security Scanning (optional, press Enter to skip)"
    read -p "Enter SNYK_TOKEN: " SNYK_TOKEN

    if [ -n "$SNYK_TOKEN" ]; then
        gh secret set SNYK_TOKEN --body "$SNYK_TOKEN"
    fi

    log_info "Secrets configured successfully!"
}

# Setup environments
setup_environments() {
    log_step "Setting up GitHub Environments..."

    # Create staging environment
    log_info "Creating staging environment..."
    gh api -X PUT "/repos/:owner/:repo/environments/staging" \
        --field wait_timer=0 \
        --field prevent_self_review=false || log_warn "Failed to create staging environment (may already exist)"

    # Create production environment with protection rules
    log_info "Creating production environment..."
    gh api -X PUT "/repos/:owner/:repo/environments/production" \
        --field wait_timer=0 \
        --field prevent_self_review=true || log_warn "Failed to create production environment (may already exist)"

    # Add required reviewers for production
    read -p "Enter GitHub usernames for production reviewers (comma-separated): " REVIEWERS

    if [ -n "$REVIEWERS" ]; then
        IFS=',' read -ra REVIEWERS_ARRAY <<< "$REVIEWERS"
        REVIEWERS_JSON=$(printf ',{"type":"User","id":null}' "${REVIEWERS_ARRAY[@]}")
        REVIEWERS_JSON="[${REVIEWERS_JSON:1}]"

        gh api -X PUT "/repos/:owner/:repo/environments/production/deployment-branch-policies" \
            --field required_reviewers="$REVIEWERS_JSON" || log_warn "Failed to set reviewers"
    fi

    log_info "Environments configured successfully!"
}

# Enable GitHub Actions
enable_actions() {
    log_step "Enabling GitHub Actions..."

    gh api -X PUT "/repos/:owner/:repo/actions/permissions" \
        --field enabled=true \
        --field allowed_actions=all || log_warn "Failed to enable Actions"

    log_info "GitHub Actions enabled!"
}

# Setup branch protection
setup_branch_protection() {
    log_step "Setting up branch protection rules..."

    # Main branch protection
    log_info "Protecting main branch..."
    gh api -X PUT "/repos/:owner/:repo/branches/main/protection" \
        --field required_status_checks='{"strict":true,"contexts":["test","lint","type-check"]}' \
        --field enforce_admins=true \
        --field required_pull_request_reviews='{"required_approving_review_count":1}' \
        --field restrictions=null || log_warn "Failed to protect main branch"

    # Develop branch protection
    log_info "Protecting develop branch..."
    gh api -X PUT "/repos/:owner/:repo/branches/develop/protection" \
        --field required_status_checks='{"strict":true,"contexts":["test","lint","type-check"]}' \
        --field enforce_admins=false \
        --field required_pull_request_reviews='{"required_approving_review_count":1}' \
        --field restrictions=null || log_warn "Failed to protect develop branch"

    log_info "Branch protection rules configured!"
}

# Display summary
display_summary() {
    echo ""
    log_step "Setup Complete!"
    echo ""
    log_info "CI/CD is now configured with:"
    echo "  ✓ GitHub Actions secrets"
    echo "  ✓ Staging and Production environments"
    echo "  ✓ Branch protection rules"
    echo "  ✓ Automated testing workflows"
    echo "  ✓ Deployment pipelines"
    echo ""
    log_info "Next steps:"
    echo "  1. Push your code to trigger CI workflows"
    echo "  2. Create a pull request to test PR preview deployments"
    echo "  3. Merge to develop to deploy to staging"
    echo "  4. Merge to main to deploy to production"
    echo ""
    log_warn "Remember to update the domain names in the workflow files!"
    echo ""
}

# Main setup flow
main() {
    log_info "Starting CI/CD setup..."
    echo ""

    check_gh_cli
    setup_secrets
    setup_environments
    enable_actions
    setup_branch_protection
    display_summary
}

# Run main function
main
