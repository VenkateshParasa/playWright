#!/bin/bash

###############################################################################
# Local Development Setup Script
# Usage: ./setup-dev.sh
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

check_dependencies() {
    log_step "Checking dependencies..."

    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        log_info "Install from: https://nodejs.org/"
        exit 1
    fi
    log_info "Node.js version: $(node --version)"

    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi
    log_info "npm version: $(npm --version)"

    # Check Java (for Selenium)
    if ! command -v java &> /dev/null; then
        log_warn "Java is not installed (required for Selenium)"
        log_info "Install from: https://adoptium.net/"
    else
        log_info "Java version: $(java --version 2>&1 | head -n 1)"
    fi

    log_info "All required dependencies are installed"
}

setup_frontend() {
    log_step "Setting up frontend..."

    cd "$PROJECT_ROOT/frontend"

    log_info "Installing frontend dependencies..."
    npm install

    log_info "Installing Playwright browsers..."
    npx playwright install --with-deps

    log_info "Frontend setup complete"
}

setup_playwright_runner() {
    log_step "Setting up playwright-runner..."

    cd "$PROJECT_ROOT/playwright-runner"

    log_info "Installing playwright-runner dependencies..."
    npm install

    log_info "Playwright runner setup complete"
}

setup_backend() {
    log_step "Setting up backend..."

    if [ -d "$PROJECT_ROOT/backend" ]; then
        cd "$PROJECT_ROOT/backend"

        if [ -f "package.json" ]; then
            log_info "Installing backend dependencies..."
            npm install
        fi

        log_info "Backend setup complete"
    else
        log_warn "Backend directory not found, skipping..."
    fi
}

setup_selenium() {
    log_step "Setting up Selenium Java..."

    if [ -d "$PROJECT_ROOT/selenium-java" ]; then
        cd "$PROJECT_ROOT/selenium-java"

        if [ -f "pom.xml" ]; then
            log_info "Installing Selenium dependencies..."
            mvn clean install -DskipTests || log_warn "Maven build failed"
        fi

        log_info "Selenium setup complete"
    else
        log_warn "Selenium directory not found, skipping..."
    fi
}

create_env_files() {
    log_step "Creating environment files..."

    # Frontend .env
    if [ ! -f "$PROJECT_ROOT/frontend/.env" ]; then
        log_info "Creating frontend .env file..."
        cat > "$PROJECT_ROOT/frontend/.env" << EOF
VITE_API_URL=http://localhost:3000
VITE_ENV=development
EOF
        log_info "Created frontend/.env"
    else
        log_info "frontend/.env already exists"
    fi

    # Backend .env
    if [ -d "$PROJECT_ROOT/backend" ] && [ ! -f "$PROJECT_ROOT/backend/.env" ]; then
        log_info "Creating backend .env file..."
        cat > "$PROJECT_ROOT/backend/.env" << EOF
PORT=3000
DATABASE_URL=postgresql://localhost:5432/playwright_learning
JWT_SECRET=your-secret-key-change-this
NODE_ENV=development
EOF
        log_info "Created backend/.env"
    fi

    log_info "Environment files created"
}

setup_git_hooks() {
    log_step "Setting up Git hooks..."

    cd "$PROJECT_ROOT"

    # Create pre-commit hook
    mkdir -p .git/hooks

    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

echo "Running pre-commit checks..."

# Run linter
cd frontend
npm run lint || exit 1

# Run type check
npm run type-check || exit 1

echo "Pre-commit checks passed!"
EOF

    chmod +x .git/hooks/pre-commit

    log_info "Git hooks configured"
}

display_summary() {
    echo ""
    log_step "Setup Complete!"
    echo ""
    log_info "Your development environment is ready!"
    echo ""
    log_info "To start development:"
    echo "  Frontend:         cd frontend && npm run dev"
    echo "  Backend:          cd backend && npm run dev"
    echo "  Playwright Tests: cd playwright-runner && npm run test:ui"
    echo ""
    log_info "Useful commands:"
    echo "  Run all tests:    ./scripts/test.sh all"
    echo "  Run unit tests:   ./scripts/test.sh unit"
    echo "  Run e2e tests:    ./scripts/test.sh e2e"
    echo ""
    log_warn "Don't forget to:"
    echo "  1. Update .env files with your actual configuration"
    echo "  2. Set up your database"
    echo "  3. Run database migrations"
    echo ""
}

# Main setup flow
main() {
    log_info "Starting development environment setup..."
    echo ""

    check_dependencies
    setup_frontend
    setup_playwright_runner
    setup_backend
    setup_selenium
    create_env_files
    setup_git_hooks
    display_summary
}

# Run main function
main
