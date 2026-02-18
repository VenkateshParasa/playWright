#!/bin/bash

###############################################################################
# Security Audit Script
# Comprehensive security audit for Playwright & Selenium Learning Platform
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNING_CHECKS=0

# Report file
REPORT_FILE="security-audit-report-$(date +%Y%m%d-%H%M%S).md"

###############################################################################
# Helper Functions
###############################################################################

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
    ((PASSED_CHECKS++))
}

log_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
    ((WARNING_CHECKS++))
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
    ((FAILED_CHECKS++))
}

check_command() {
    if command -v "$1" &> /dev/null; then
        return 0
    else
        return 1
    fi
}

###############################################################################
# Initialize Report
###############################################################################

initialize_report() {
    cat > "$REPORT_FILE" << EOF
# Security Audit Report

**Date:** $(date)
**Platform:** Playwright & Selenium Learning Platform

---

## Executive Summary

This report contains findings from a comprehensive security audit.

EOF
}

###############################################################################
# Dependency Vulnerability Scanning
###############################################################################

scan_dependencies() {
    log_info "Scanning dependencies for vulnerabilities..."
    echo -e "\n## 1. Dependency Vulnerability Scan\n" >> "$REPORT_FILE"
    ((TOTAL_CHECKS++))

    # Backend dependencies
    if [ -d "backend" ]; then
        log_info "Scanning backend dependencies..."
        cd backend

        if npm audit --json > npm-audit.json 2>&1; then
            VULNERABILITIES=$(jq '.metadata.vulnerabilities.total' npm-audit.json 2>/dev/null || echo "0")

            if [ "$VULNERABILITIES" -eq 0 ]; then
                log_success "Backend: No vulnerabilities found"
                echo "- **Backend Dependencies:** ✓ No vulnerabilities" >> "../$REPORT_FILE"
            else
                log_warning "Backend: Found $VULNERABILITIES vulnerabilities"
                echo "- **Backend Dependencies:** ⚠ $VULNERABILITIES vulnerabilities found" >> "../$REPORT_FILE"
            fi
        else
            log_error "Backend: npm audit failed"
            echo "- **Backend Dependencies:** ✗ Audit failed" >> "../$REPORT_FILE"
        fi

        cd ..
    fi

    # Frontend dependencies
    if [ -d "frontend" ]; then
        log_info "Scanning frontend dependencies..."
        cd frontend

        if npm audit --json > npm-audit.json 2>&1; then
            VULNERABILITIES=$(jq '.metadata.vulnerabilities.total' npm-audit.json 2>/dev/null || echo "0")

            if [ "$VULNERABILITIES" -eq 0 ]; then
                log_success "Frontend: No vulnerabilities found"
                echo "- **Frontend Dependencies:** ✓ No vulnerabilities" >> "../$REPORT_FILE"
            else
                log_warning "Frontend: Found $VULNERABILITIES vulnerabilities"
                echo "- **Frontend Dependencies:** ⚠ $VULNERABILITIES vulnerabilities found" >> "../$REPORT_FILE"
            fi
        else
            log_error "Frontend: npm audit failed"
            echo "- **Frontend Dependencies:** ✗ Audit failed" >> "../$REPORT_FILE"
        fi

        cd ..
    fi
}

###############################################################################
# Secret Detection
###############################################################################

scan_secrets() {
    log_info "Scanning for exposed secrets..."
    echo -e "\n## 2. Secret Detection\n" >> "$REPORT_FILE"
    ((TOTAL_CHECKS++))

    # Check for .env files
    if find . -name ".env" -not -path "*/node_modules/*" | grep -q .; then
        log_error "Found .env files in repository"
        echo "- **Environment Files:** ✗ .env files found in repository" >> "$REPORT_FILE"
    else
        log_success "No .env files in repository"
        echo "- **Environment Files:** ✓ No .env files in repository" >> "$REPORT_FILE"
    fi

    # Check for hardcoded secrets
    SECRET_PATTERNS=(
        "password.*=.*['\"].*['\"]"
        "api[_-]key.*=.*['\"].*['\"]"
        "secret.*=.*['\"].*['\"]"
        "token.*=.*['\"].*['\"]"
    )

    FOUND_SECRETS=false
    for pattern in "${SECRET_PATTERNS[@]}"; do
        if grep -r "$pattern" --include="*.ts" --include="*.js" --exclude-dir=node_modules . 2>/dev/null | grep -v "process.env" | grep -q .; then
            FOUND_SECRETS=true
            break
        fi
    done

    if [ "$FOUND_SECRETS" = true ]; then
        log_error "Possible hardcoded secrets found"
        echo "- **Hardcoded Secrets:** ✗ Potential secrets found in code" >> "$REPORT_FILE"
    else
        log_success "No obvious hardcoded secrets"
        echo "- **Hardcoded Secrets:** ✓ No obvious secrets found" >> "$REPORT_FILE"
    fi
}

###############################################################################
# Security Headers Check
###############################################################################

check_security_headers() {
    log_info "Checking security headers configuration..."
    echo -e "\n## 3. Security Headers\n" >> "$REPORT_FILE"
    ((TOTAL_CHECKS++))

    # Check for helmet
    if grep -r "helmet" backend/src/ 2>/dev/null | grep -q .; then
        log_success "Helmet security headers configured"
        echo "- **Helmet:** ✓ Configured" >> "$REPORT_FILE"
    else
        log_warning "Helmet not found in backend"
        echo "- **Helmet:** ⚠ Not configured" >> "$REPORT_FILE"
    fi

    # Check for CSP
    if grep -r "contentSecurityPolicy\|Content-Security-Policy" backend/src/ frontend/src/ 2>/dev/null | grep -q .; then
        log_success "Content Security Policy configured"
        echo "- **CSP:** ✓ Configured" >> "$REPORT_FILE"
    else
        log_warning "Content Security Policy not configured"
        echo "- **CSP:** ⚠ Not configured" >> "$REPORT_FILE"
    fi

    # Check for CORS
    if grep -r "cors" backend/src/ 2>/dev/null | grep -q .; then
        log_success "CORS configured"
        echo "- **CORS:** ✓ Configured" >> "$REPORT_FILE"
    else
        log_warning "CORS not configured"
        echo "- **CORS:** ⚠ Not configured" >> "$REPORT_FILE"
    fi
}

###############################################################################
# Authentication & Authorization Check
###############################################################################

check_auth() {
    log_info "Checking authentication and authorization..."
    echo -e "\n## 4. Authentication & Authorization\n" >> "$REPORT_FILE"
    ((TOTAL_CHECKS++))

    # Check for JWT implementation
    if [ -f "backend/src/utils/jwt.ts" ]; then
        log_success "JWT implementation found"
        echo "- **JWT:** ✓ Implemented" >> "$REPORT_FILE"
    else
        log_error "JWT implementation not found"
        echo "- **JWT:** ✗ Not implemented" >> "$REPORT_FILE"
    fi

    # Check for password hashing
    if grep -r "bcrypt\|argon2" backend/src/ 2>/dev/null | grep -q .; then
        log_success "Password hashing implemented"
        echo "- **Password Hashing:** ✓ Implemented" >> "$REPORT_FILE"
    else
        log_error "Password hashing not found"
        echo "- **Password Hashing:** ✗ Not implemented" >> "$REPORT_FILE"
    fi

    # Check for authentication middleware
    if [ -f "backend/src/middleware/auth.ts" ]; then
        log_success "Authentication middleware found"
        echo "- **Auth Middleware:** ✓ Implemented" >> "$REPORT_FILE"
    else
        log_error "Authentication middleware not found"
        echo "- **Auth Middleware:** ✗ Not implemented" >> "$REPORT_FILE"
    fi
}

###############################################################################
# Input Validation Check
###############################################################################

check_input_validation() {
    log_info "Checking input validation..."
    echo -e "\n## 5. Input Validation\n" >> "$REPORT_FILE"
    ((TOTAL_CHECKS++))

    # Check for express-validator
    if grep -r "express-validator" backend/package.json 2>/dev/null | grep -q .; then
        log_success "express-validator found"
        echo "- **Input Validation Library:** ✓ express-validator installed" >> "$REPORT_FILE"
    else
        log_warning "express-validator not found"
        echo "- **Input Validation Library:** ⚠ Not installed" >> "$REPORT_FILE"
    fi

    # Check for validation middleware
    if [ -f "backend/src/middleware/validation.ts" ] || [ -f "backend/src/utils/validation.ts" ]; then
        log_success "Validation implementation found"
        echo "- **Validation Implementation:** ✓ Found" >> "$REPORT_FILE"
    else
        log_warning "Validation implementation not found"
        echo "- **Validation Implementation:** ⚠ Not found" >> "$REPORT_FILE"
    fi

    # Check for sanitization
    if grep -r "sanitize" backend/src/ 2>/dev/null | grep -q .; then
        log_success "Input sanitization implemented"
        echo "- **Input Sanitization:** ✓ Implemented" >> "$REPORT_FILE"
    else
        log_warning "Input sanitization not found"
        echo "- **Input Sanitization:** ⚠ Not implemented" >> "$REPORT_FILE"
    fi
}

###############################################################################
# Rate Limiting Check
###############################################################################

check_rate_limiting() {
    log_info "Checking rate limiting..."
    echo -e "\n## 6. Rate Limiting\n" >> "$REPORT_FILE"
    ((TOTAL_CHECKS++))

    if grep -r "express-rate-limit\|rate.*limit" backend/src/ 2>/dev/null | grep -q .; then
        log_success "Rate limiting implemented"
        echo "- **Rate Limiting:** ✓ Implemented" >> "$REPORT_FILE"
    else
        log_warning "Rate limiting not found"
        echo "- **Rate Limiting:** ⚠ Not implemented" >> "$REPORT_FILE"
    fi
}

###############################################################################
# CSRF Protection Check
###############################################################################

check_csrf() {
    log_info "Checking CSRF protection..."
    echo -e "\n## 7. CSRF Protection\n" >> "$REPORT_FILE"
    ((TOTAL_CHECKS++))

    if [ -f "backend/src/middleware/csrf.ts" ] || grep -r "csrf" backend/src/ 2>/dev/null | grep -q .; then
        log_success "CSRF protection implemented"
        echo "- **CSRF Protection:** ✓ Implemented" >> "$REPORT_FILE"
    else
        log_warning "CSRF protection not found"
        echo "- **CSRF Protection:** ⚠ Not implemented" >> "$REPORT_FILE"
    fi
}

###############################################################################
# Database Security Check
###############################################################################

check_database_security() {
    log_info "Checking database security..."
    echo -e "\n## 8. Database Security\n" >> "$REPORT_FILE"
    ((TOTAL_CHECKS++))

    # Check for parameterized queries (Mongoose usage)
    if grep -r "mongoose" backend/package.json 2>/dev/null | grep -q .; then
        log_success "Mongoose ORM used (parameterized queries)"
        echo "- **Parameterized Queries:** ✓ Using Mongoose ORM" >> "$REPORT_FILE"
    else
        log_warning "ORM not found - ensure parameterized queries"
        echo "- **Parameterized Queries:** ⚠ ORM not detected" >> "$REPORT_FILE"
    fi

    # Check for encryption
    if [ -f "backend/src/utils/encryption.ts" ]; then
        log_success "Encryption utilities found"
        echo "- **Data Encryption:** ✓ Encryption utilities implemented" >> "$REPORT_FILE"
    else
        log_warning "Encryption utilities not found"
        echo "- **Data Encryption:** ⚠ Not implemented" >> "$REPORT_FILE"
    fi
}

###############################################################################
# Logging & Monitoring Check
###############################################################################

check_logging() {
    log_info "Checking logging and monitoring..."
    echo -e "\n## 9. Logging & Monitoring\n" >> "$REPORT_FILE"
    ((TOTAL_CHECKS++))

    if grep -r "morgan\|winston\|pino" backend/package.json 2>/dev/null | grep -q .; then
        log_success "Logging library found"
        echo "- **Logging:** ✓ Logging library configured" >> "$REPORT_FILE"
    else
        log_warning "Logging library not found"
        echo "- **Logging:** ⚠ Not configured" >> "$REPORT_FILE"
    fi

    if [ -f "backend/src/middleware/logger.ts" ]; then
        log_success "Logger middleware found"
        echo "- **Logger Middleware:** ✓ Implemented" >> "$REPORT_FILE"
    else
        log_warning "Logger middleware not found"
        echo "- **Logger Middleware:** ⚠ Not implemented" >> "$REPORT_FILE"
    fi
}

###############################################################################
# Error Handling Check
###############################################################################

check_error_handling() {
    log_info "Checking error handling..."
    echo -e "\n## 10. Error Handling\n" >> "$REPORT_FILE"
    ((TOTAL_CHECKS++))

    if [ -f "backend/src/middleware/errorHandler.ts" ]; then
        log_success "Error handler middleware found"
        echo "- **Error Handler:** ✓ Implemented" >> "$REPORT_FILE"
    else
        log_warning "Error handler middleware not found"
        echo "- **Error Handler:** ⚠ Not implemented" >> "$REPORT_FILE"
    fi
}

###############################################################################
# HTTPS Check
###############################################################################

check_https() {
    log_info "Checking HTTPS configuration..."
    echo -e "\n## 11. HTTPS Configuration\n" >> "$REPORT_FILE"
    ((TOTAL_CHECKS++))

    if grep -r "https\|ssl\|tls" backend/src/ 2>/dev/null | grep -i "redirect\|enforce" | grep -q .; then
        log_success "HTTPS enforcement found"
        echo "- **HTTPS Enforcement:** ✓ Configured" >> "$REPORT_FILE"
    else
        log_warning "HTTPS enforcement not detected"
        echo "- **HTTPS Enforcement:** ⚠ Not configured (ensure reverse proxy handles this)" >> "$REPORT_FILE"
    fi
}

###############################################################################
# File Upload Security Check
###############################################################################

check_file_upload() {
    log_info "Checking file upload security..."
    echo -e "\n## 12. File Upload Security\n" >> "$REPORT_FILE"
    ((TOTAL_CHECKS++))

    if grep -r "multer\|formidable" backend/package.json 2>/dev/null | grep -q .; then
        log_success "File upload library found"
        echo "- **File Upload Library:** ✓ Configured" >> "$REPORT_FILE"

        # Check for file validation
        if grep -r "mimetype\|fileFilter" backend/src/ 2>/dev/null | grep -q .; then
            log_success "File validation found"
            echo "- **File Validation:** ✓ Implemented" >> "$REPORT_FILE"
        else
            log_warning "File validation not found"
            echo "- **File Validation:** ⚠ Not implemented" >> "$REPORT_FILE"
        fi
    else
        log_info "File upload not implemented (may not be needed)"
        echo "- **File Upload:** ℹ Not implemented" >> "$REPORT_FILE"
    fi
}

###############################################################################
# Security Documentation Check
###############################################################################

check_documentation() {
    log_info "Checking security documentation..."
    echo -e "\n## 13. Security Documentation\n" >> "$REPORT_FILE"
    ((TOTAL_CHECKS++))

    DOC_FILES=(
        "SECURITY.md"
        "docs/SECURITY.md"
        "docs/SECURITY_BEST_PRACTICES.md"
        "docs/INCIDENT_RESPONSE_PLAN.md"
    )

    DOCS_FOUND=0
    for doc in "${DOC_FILES[@]}"; do
        if [ -f "$doc" ]; then
            ((DOCS_FOUND++))
        fi
    done

    if [ $DOCS_FOUND -gt 0 ]; then
        log_success "Found $DOCS_FOUND security documentation files"
        echo "- **Security Documentation:** ✓ $DOCS_FOUND files found" >> "$REPORT_FILE"
    else
        log_warning "No security documentation found"
        echo "- **Security Documentation:** ⚠ Not found" >> "$REPORT_FILE"
    fi
}

###############################################################################
# Generate Summary
###############################################################################

generate_summary() {
    echo -e "\n---\n" >> "$REPORT_FILE"
    echo "## Summary\n" >> "$REPORT_FILE"
    echo "- **Total Checks:** $TOTAL_CHECKS" >> "$REPORT_FILE"
    echo "- **Passed:** $PASSED_CHECKS (✓)" >> "$REPORT_FILE"
    echo "- **Warnings:** $WARNING_CHECKS (⚠)" >> "$REPORT_FILE"
    echo "- **Failed:** $FAILED_CHECKS (✗)" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"

    PERCENTAGE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))
    echo "- **Security Score:** $PERCENTAGE%" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"

    if [ $PERCENTAGE -ge 90 ]; then
        echo "**Status:** 🎉 Excellent" >> "$REPORT_FILE"
    elif [ $PERCENTAGE -ge 70 ]; then
        echo "**Status:** ✅ Good" >> "$REPORT_FILE"
    elif [ $PERCENTAGE -ge 50 ]; then
        echo "**Status:** ⚠️ Needs Improvement" >> "$REPORT_FILE"
    else
        echo "**Status:** ❌ Critical Issues" >> "$REPORT_FILE"
    fi
}

###############################################################################
# Main Execution
###############################################################################

main() {
    echo "======================================================================"
    echo "  Security Audit - Playwright & Selenium Learning Platform"
    echo "======================================================================"
    echo ""

    initialize_report

    scan_dependencies
    scan_secrets
    check_security_headers
    check_auth
    check_input_validation
    check_rate_limiting
    check_csrf
    check_database_security
    check_logging
    check_error_handling
    check_https
    check_file_upload
    check_documentation

    generate_summary

    echo ""
    echo "======================================================================"
    echo "  Audit Complete"
    echo "======================================================================"
    echo ""
    echo "Total Checks: $TOTAL_CHECKS"
    echo -e "${GREEN}Passed: $PASSED_CHECKS${NC}"
    echo -e "${YELLOW}Warnings: $WARNING_CHECKS${NC}"
    echo -e "${RED}Failed: $FAILED_CHECKS${NC}"
    echo ""
    echo "Report saved to: $REPORT_FILE"
    echo ""
}

# Check for required tools
if ! check_command "jq"; then
    log_warning "jq not installed. Some features will be limited."
fi

main
