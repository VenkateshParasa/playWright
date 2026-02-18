#!/bin/bash

################################################################################
# Health Check Script for Playwright & Selenium Learning Platform
#
# This script performs comprehensive health checks on all services
#
# Usage: ./scripts/health-check.sh [environment]
#   environment: staging|production (default: production)
#
# Examples:
#   ./scripts/health-check.sh production
#   ./scripts/health-check.sh staging
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
ENVIRONMENT="${1:-production}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Set URLs based on environment
if [[ "$ENVIRONMENT" == "production" ]]; then
    FRONTEND_URL="https://playwright-learning.com"
    BACKEND_URL="https://api.playwright-learning.com"
else
    FRONTEND_URL="https://staging.playwright-learning.com"
    BACKEND_URL="https://staging-api.playwright-learning.com"
fi

# Health check settings
TIMEOUT=10
RETRIES=3
RETRY_DELAY=5

# Counters
PASSED=0
FAILED=0
WARNINGS=0

################################################################################
# Logging Functions
################################################################################

log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] ✓${NC} $1"
    ((PASSED++))
}

log_error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] ✗${NC} $1"
    ((FAILED++))
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] ⚠${NC} $1"
    ((WARNINGS++))
}

################################################################################
# Health Check Functions
################################################################################

check_http_endpoint() {
    local name=$1
    local url=$2
    local expected_code=${3:-200}

    log "Checking $name: $url"

    local response_code
    local retry=0

    while [[ $retry -lt $RETRIES ]]; do
        response_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$url" 2>/dev/null || echo "000")

        if [[ "$response_code" == "$expected_code" ]]; then
            log_success "$name is responding (HTTP $response_code)"
            return 0
        fi

        retry=$((retry + 1))
        if [[ $retry -lt $RETRIES ]]; then
            log_warning "$name check failed (HTTP $response_code), retrying in ${RETRY_DELAY}s... ($retry/$RETRIES)"
            sleep $RETRY_DELAY
        fi
    done

    log_error "$name is not responding correctly (HTTP $response_code, expected $expected_code)"
    return 1
}

check_api_health() {
    log "Checking API health endpoint..."

    local health_response
    health_response=$(curl -s --max-time $TIMEOUT "${BACKEND_URL}/health" 2>/dev/null || echo '{}')

    if echo "$health_response" | grep -q "ok\|healthy\|up"; then
        log_success "API health check passed"

        # Parse health details if JSON
        if command -v jq &> /dev/null; then
            local status=$(echo "$health_response" | jq -r '.status // empty' 2>/dev/null)
            local db_status=$(echo "$health_response" | jq -r '.database // empty' 2>/dev/null)
            local redis_status=$(echo "$health_response" | jq -r '.redis // empty' 2>/dev/null)

            [[ -n "$status" ]] && log "  Status: $status"
            [[ -n "$db_status" ]] && log "  Database: $db_status"
            [[ -n "$redis_status" ]] && log "  Redis: $redis_status"
        fi
        return 0
    else
        log_error "API health check failed"
        return 1
    fi
}

check_database() {
    log "Checking database connectivity..."

    local db_health
    db_health=$(curl -s --max-time $TIMEOUT "${BACKEND_URL}/health/database" 2>/dev/null || echo '{"status":"error"}')

    if echo "$db_health" | grep -q "connected\|ok\|healthy"; then
        log_success "Database is connected"
        return 0
    else
        log_error "Database connection failed"
        return 1
    fi
}

check_redis() {
    log "Checking Redis connectivity..."

    local redis_health
    redis_health=$(curl -s --max-time $TIMEOUT "${BACKEND_URL}/health/redis" 2>/dev/null || echo '{"status":"error"}')

    if echo "$redis_health" | grep -q "connected\|ok\|healthy"; then
        log_success "Redis is connected"
        return 0
    else
        log_warning "Redis connection failed (non-critical)"
        return 1
    fi
}

check_frontend() {
    log "Checking frontend..."

    if check_http_endpoint "Frontend" "$FRONTEND_URL"; then
        # Check if critical assets are loading
        local assets_check
        assets_check=$(curl -s --max-time $TIMEOUT "${FRONTEND_URL}/assets/" 2>/dev/null || echo "")

        if [[ -n "$assets_check" ]]; then
            log_success "Frontend assets are accessible"
        else
            log_warning "Frontend assets check inconclusive"
        fi
        return 0
    else
        return 1
    fi
}

check_api_endpoints() {
    log "Checking critical API endpoints..."

    # Auth endpoint
    local auth_check
    auth_check=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "${BACKEND_URL}/api/auth/health" 2>/dev/null || echo "000")

    if [[ "$auth_check" == "200" || "$auth_check" == "401" ]]; then
        log_success "Auth API is responding"
    else
        log_error "Auth API is not responding"
    fi

    # Lessons endpoint
    local lessons_check
    lessons_check=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "${BACKEND_URL}/api/lessons" 2>/dev/null || echo "000")

    if [[ "$lessons_check" == "200" || "$lessons_check" == "401" ]]; then
        log_success "Lessons API is responding"
    else
        log_error "Lessons API is not responding"
    fi
}

check_ssl_certificate() {
    log "Checking SSL certificate..."

    local domain
    if [[ "$ENVIRONMENT" == "production" ]]; then
        domain="playwright-learning.com"
    else
        domain="staging.playwright-learning.com"
    fi

    # Check certificate expiration
    if command -v openssl &> /dev/null; then
        local expiry_date
        expiry_date=$(echo | openssl s_client -servername "$domain" -connect "${domain}:443" 2>/dev/null | \
                     openssl x509 -noout -dates 2>/dev/null | grep "notAfter" | cut -d= -f2)

        if [[ -n "$expiry_date" ]]; then
            local expiry_epoch=$(date -j -f "%b %d %T %Y %Z" "$expiry_date" "+%s" 2>/dev/null || date -d "$expiry_date" "+%s" 2>/dev/null)
            local now_epoch=$(date "+%s")
            local days_remaining=$(( (expiry_epoch - now_epoch) / 86400 ))

            if [[ $days_remaining -gt 30 ]]; then
                log_success "SSL certificate is valid ($days_remaining days remaining)"
            elif [[ $days_remaining -gt 7 ]]; then
                log_warning "SSL certificate expires in $days_remaining days"
            else
                log_error "SSL certificate expires in $days_remaining days - URGENT"
            fi
        else
            log_warning "Could not verify SSL certificate expiration"
        fi
    else
        log_warning "openssl not found, skipping SSL check"
    fi
}

check_response_time() {
    log "Checking response times..."

    # Check frontend response time
    local frontend_time
    frontend_time=$(curl -o /dev/null -s -w "%{time_total}" --max-time $TIMEOUT "$FRONTEND_URL" 2>/dev/null || echo "0")
    local frontend_ms=$(echo "$frontend_time * 1000" | bc)

    if (( $(echo "$frontend_time < 2.0" | bc -l) )); then
        log_success "Frontend response time: ${frontend_ms%.*}ms"
    elif (( $(echo "$frontend_time < 5.0" | bc -l) )); then
        log_warning "Frontend response time: ${frontend_ms%.*}ms (slow)"
    else
        log_error "Frontend response time: ${frontend_ms%.*}ms (very slow)"
    fi

    # Check API response time
    local api_time
    api_time=$(curl -o /dev/null -s -w "%{time_total}" --max-time $TIMEOUT "${BACKEND_URL}/health" 2>/dev/null || echo "0")
    local api_ms=$(echo "$api_time * 1000" | bc)

    if (( $(echo "$api_time < 1.0" | bc -l) )); then
        log_success "API response time: ${api_ms%.*}ms"
    elif (( $(echo "$api_time < 3.0" | bc -l) )); then
        log_warning "API response time: ${api_ms%.*}ms (slow)"
    else
        log_error "API response time: ${api_ms%.*}ms (very slow)"
    fi
}

check_cdn() {
    log "Checking CDN..."

    local cdn_url="${CDN_URL:-https://cdn.playwright-learning.com}"
    local cdn_check
    cdn_check=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$cdn_url" 2>/dev/null || echo "000")

    if [[ "$cdn_check" == "200" || "$cdn_check" == "403" || "$cdn_check" == "404" ]]; then
        log_success "CDN is responding"
    else
        log_warning "CDN check inconclusive (HTTP $cdn_check)"
    fi
}

check_uptime() {
    log "Checking service uptime..."

    # This would typically query your monitoring service API
    # For now, we'll check the health endpoint's uptime field
    local uptime_response
    uptime_response=$(curl -s --max-time $TIMEOUT "${BACKEND_URL}/health" 2>/dev/null || echo '{}')

    if command -v jq &> /dev/null; then
        local uptime=$(echo "$uptime_response" | jq -r '.uptime // empty' 2>/dev/null)
        if [[ -n "$uptime" ]]; then
            log_success "API uptime: ${uptime}s"
        fi
    fi
}

################################################################################
# Main
################################################################################

main() {
    log "====================================================================="
    log "Health Check for ${ENVIRONMENT} Environment"
    log "====================================================================="
    log "Time: $(date)"
    log "Frontend URL: $FRONTEND_URL"
    log "Backend URL: $BACKEND_URL"
    log ""

    # Run all health checks
    check_frontend
    check_http_endpoint "API" "$BACKEND_URL"
    check_api_health
    check_database
    check_redis || true  # Redis is optional
    check_api_endpoints
    check_ssl_certificate
    check_response_time
    check_cdn || true  # CDN is optional
    check_uptime

    log ""
    log "====================================================================="
    log "Health Check Summary"
    log "====================================================================="
    log_success "Passed: $PASSED"
    log_warning "Warnings: $WARNINGS"
    log_error "Failed: $FAILED"
    log ""

    # Exit code based on failures
    if [[ $FAILED -gt 0 ]]; then
        log_error "Health check FAILED - $FAILED critical issues found"
        exit 1
    elif [[ $WARNINGS -gt 0 ]]; then
        log_warning "Health check PASSED with warnings - $WARNINGS issues found"
        exit 0
    else
        log_success "Health check PASSED - All systems operational"
        exit 0
    fi
}

# Run main
main
