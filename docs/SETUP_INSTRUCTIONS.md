# Setup Instructions

This document explains how to set up the project and resolve TypeScript errors.

## Current Status

The project structure has been created with placeholder files. TypeScript errors are expected because dependencies haven't been installed yet.

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **Java JDK** 17+ ([Download](https://adoptium.net/))
- **Maven** 3.9+ ([Download](https://maven.apache.org/download.cgi))
- **Git** ([Download](https://git-scm.com/downloads))

## Step-by-Step Setup

### 1. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (this will resolve TypeScript errors)
npm install

# Start development server
npm run dev

# In a new terminal, run tests
npm run test
```

**Expected Result**: 
- All TypeScript errors will be resolved after `npm install`
- Development server will start at http://localhost:3000
- Hot reload will be enabled

### 2. Playwright Runner Setup

```bash
# Navigate to playwright-runner directory
cd playwright-runner

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install --with-deps

# Run example tests
npm test

# Run tests in UI mode
npm run test:ui
```

**Expected Result**:
- Playwright will be installed with all browsers
- Example tests will run (may fail until frontend is running)

### 3. Selenium Java Setup

```bash
# Navigate to selenium-java directory
cd selenium-java

# Clean and install dependencies
mvn clean install

# Run tests
mvn test

# Skip tests during build
mvn clean install -DskipTests
```

**Expected Result**:
- Maven will download all dependencies
- Project will compile successfully
- Tests will run (may fail until frontend is running)

### 4. Backend Setup (Optional)

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
nano .env

# Start development server
npm run dev
```

## Understanding TypeScript Errors

### Why Are There Errors?

The TypeScript errors you see are **expected** and **normal** at this stage because:

1. **Dependencies Not Installed**: Packages like `react`, `@playwright/test`, etc. haven't been installed yet
2. **Type Definitions Missing**: TypeScript type definitions (@types/*) are not available
3. **Module Resolution**: TypeScript can't find modules that don't exist in node_modules

### What Errors Are Expected?

```
❌ Cannot find module 'react'
❌ Cannot find module '@playwright/test'
❌ Cannot find module 'vite'
❌ Cannot find name 'process'
❌ This JSX tag requires the module path 'react/jsx-runtime'
```

### How to Fix?

Simply run `npm install` in each directory:

```bash
# Fix frontend errors
cd frontend && npm install

# Fix playwright errors
cd playwright-runner && npm install

# Fix backend errors (if using)
cd backend && npm install
```

## Verification Steps

### 1. Verify Frontend

```bash
cd frontend

# Check if dependencies are installed
ls node_modules | wc -l  # Should show 100+ packages

# Check TypeScript compilation
npm run type-check  # Should pass with no errors

# Check if dev server starts
npm run dev  # Should start on port 3000
```

### 2. Verify Playwright

```bash
cd playwright-runner

# Check Playwright installation
npx playwright --version  # Should show version

# List installed browsers
npx playwright install --dry-run

# Run a simple test
npx playwright test tests/examples/01-basic-navigation.spec.ts
```

### 3. Verify Selenium

```bash
cd selenium-java

# Check Maven installation
mvn --version

# Compile project
mvn compile

# Run specific test
mvn test -Dtest=LoginTests
```

## Common Issues and Solutions

### Issue 1: "npm: command not found"

**Solution**: Install Node.js from https://nodejs.org/

### Issue 2: "mvn: command not found"

**Solution**: Install Maven and add to PATH
```bash
# macOS
brew install maven

# Linux
sudo apt-get install maven

# Windows
# Download from https://maven.apache.org/download.cgi
```

### Issue 3: Port 3000 already in use

**Solution**: Kill the process or use a different port
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in vite.config.ts
server: {
  port: 3001
}
```

### Issue 4: Playwright browsers not installing

**Solution**: Install system dependencies
```bash
# Ubuntu/Debian
npx playwright install-deps

# macOS
# Usually works without additional deps

# Windows
# Run as Administrator
```

### Issue 5: Java version mismatch

**Solution**: Use Java 17+
```bash
# Check Java version
java -version

# Set JAVA_HOME (macOS/Linux)
export JAVA_HOME=$(/usr/libexec/java_home -v 17)

# Set JAVA_HOME (Windows)
setx JAVA_HOME "C:\Program Files\Java\jdk-17"
```

## Development Workflow

### 1. Start Frontend Development

```bash
# Terminal 1: Start frontend
cd frontend
npm run dev

# Terminal 2: Run tests in watch mode
cd frontend
npm run test

# Terminal 3: Run Playwright tests
cd playwright-runner
npm run test:ui
```

### 2. Make Changes

1. Edit files in `frontend/src/`
2. Changes will hot-reload automatically
3. Tests will re-run automatically (if in watch mode)

### 3. Run Full Test Suite

```bash
# Run all frontend tests
cd frontend
npm run test
npm run test:e2e

# Run Playwright tests
cd playwright-runner
npm test

# Run Selenium tests
cd selenium-java
mvn test
```

## IDE Setup

### VS Code (Recommended)

Install these extensions:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-playwright.playwright",
    "vscjava.vscode-java-pack",
    "bradlc.vscode-tailwindcss"
  ]
}
```

Save this in `.vscode/extensions.json`

### IntelliJ IDEA (For Java)

1. Open `selenium-java` folder
2. Import as Maven project
3. Enable annotation processing
4. Install TestNG plugin

## Next Steps

After setup is complete:

1. ✅ All TypeScript errors should be resolved
2. ✅ Development servers should start without errors
3. ✅ Tests should run (may fail until you implement features)
4. 📖 Read [`FEATURES_IMPLEMENTATION.md`](FEATURES_IMPLEMENTATION.md) for feature checklist
5. 🚀 Start implementing Phase 1 features

## Getting Help

If you encounter issues:

1. Check this document for common solutions
2. Review error messages carefully
3. Search for the error online
4. Check project documentation in `/docs`
5. Open an issue on GitHub

## Summary

**The TypeScript errors are normal and expected before running `npm install`.** They will be automatically resolved once dependencies are installed. This is standard for any TypeScript/Node.js project.

To fix all errors:
```bash
cd frontend && npm install
cd ../playwright-runner && npm install
cd ../selenium-java && mvn install
```

That's it! Happy coding! 🎉