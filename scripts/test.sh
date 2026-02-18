#!/bin/bash

###############################################################################
# Test Runner Script
# Usage: ./test.sh [unit|integration|e2e|all]
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
TEST_TYPE=${1:-all}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
PLAYWRIGHT_DIR="$PROJECT_ROOT/playwright-runner"

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

run_unit_tests() {
    log_info "Running unit tests..."

    cd "$FRONTEND_DIR"
    npm run test -- --run --coverage

    log_info "Unit tests completed"
}

run_integration_tests() {
    log_info "Running integration tests..."

    cd "$FRONTEND_DIR"
    npm run test -- --run tests/integration

    log_info "Integration tests completed"
}

run_e2e_tests() {
    log_info "Running E2E tests..."

    cd "$FRONTEND_DIR"
    npx playwright install --with-deps
    npm run test:e2e

    log_info "E2E tests completed"
}

run_playwright_tests() {
    log_info "Running Playwright runner tests..."

    cd "$PLAYWRIGHT_DIR"
    npx playwright install --with-deps
    npm run test

    log_info "Playwright runner tests completed"
}

check_coverage() {
    log_info "Checking coverage threshold..."

    cd "$FRONTEND_DIR"

    if [ -f "coverage/coverage-summary.json" ]; then
        COVERAGE=$(node -e "
            const coverage = require('./coverage/coverage-summary.json');
            const total = coverage.total;
            const avg = (total.lines.pct + total.statements.pct + total.functions.pct + total.branches.pct) / 4;
            console.log(avg.toFixed(2));
        ")

        log_info "Coverage: $COVERAGE%"

        if (( $(echo "$COVERAGE < 80" | bc -l) )); then
            log_error "Coverage is below 80% threshold"
            exit 1
        fi

        log_info "Coverage meets threshold"
    else
        log_warn "Coverage report not found"
    fi
}

# Main test flow
main() {
    log_info "Starting test suite: $TEST_TYPE"

    case $TEST_TYPE in
        unit)
            run_unit_tests
            check_coverage
            ;;
        integration)
            run_integration_tests
            ;;
        e2e)
            run_e2e_tests
            ;;
        playwright)
            run_playwright_tests
            ;;
        all)
            run_unit_tests
            check_coverage
            run_integration_tests
            run_e2e_tests
            run_playwright_tests
            ;;
        *)
            log_error "Invalid test type: $TEST_TYPE"
            echo "Usage: ./test.sh [unit|integration|e2e|playwright|all]"
            exit 1
            ;;
    esac

    log_info "All tests completed successfully!"
}

# Run main function
main
