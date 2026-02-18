# Accessibility Testing Commands - Quick Reference

Quick reference for all accessibility-related commands and workflows.

---

## Installation

```bash
# Install all dependencies
cd frontend
npm install

# Install Playwright browsers
npx playwright install chromium firefox webkit

# Verify installation
npm run test:a11y -- --help
```

---

## Running Tests

### Accessibility Tests

```bash
# Run all accessibility tests
npm run test:a11y

# Run in headed mode (see browser)
npm run test:a11y:headed

# Run specific test file
npx playwright test tests/accessibility/accessibility.spec.ts

# Run specific test by name
npx playwright test -g "should have proper heading hierarchy"

# Run in debug mode
npx playwright test tests/accessibility/ --debug

# Run with specific browser
npx playwright test tests/accessibility/ --project=chromium
npx playwright test tests/accessibility/ --project=firefox
npx playwright test tests/accessibility/ --project=webkit

# Generate HTML report
npx playwright test tests/accessibility/
npx playwright show-report
```

### Lighthouse Audit

```bash
# Start dev server first
npm run dev

# In another terminal, run Lighthouse
npm run lighthouse

# Run Lighthouse CI
npm run lighthouse:ci

# Run with specific URL
npx lhci autorun --url=http://localhost:5173/dashboard
```

### Pa11y CI

```bash
# Start preview server first
npm run preview

# In another terminal, run Pa11y
npm run pa11y

# Run with specific URL
npx pa11y-ci http://localhost:4173/dashboard
```

### Axe-core CLI

```bash
# Install globally (if not already)
npm install -g @axe-core/cli

# Run axe on specific URL
axe http://localhost:5173

# Run with specific tags
axe http://localhost:5173 --tags wcag2a,wcag2aa

# Save results to file
axe http://localhost:5173 --save results.json
```

---

## Development Commands

### Linting (includes accessibility rules)

```bash
# Run ESLint (includes jsx-a11y plugin)
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Check specific file
npx eslint src/components/MyComponent.tsx
```

### Type Checking

```bash
# Run TypeScript type checking
npm run type-check
```

### Full Validation

```bash
# Run all checks (lint + type-check + tests)
npm run validate

# Include accessibility tests
npm run validate && npm run test:a11y
```

---

## Testing Workflows

### Before Committing

```bash
# Quick pre-commit check
npm run lint && npm run test:a11y

# Full check
npm run validate && npm run test:a11y

# With type checking
npm run type-check && npm run lint && npm run test:a11y
```

### During Development

```bash
# Watch mode for tests (if configured)
npm run test:watch

# Run specific test repeatedly
npx playwright test tests/accessibility/keyboard-navigation.spec.ts --headed

# Debug specific test
npx playwright test -g "keyboard navigation" --debug
```

### Before Pull Request

```bash
# Full validation suite
npm run validate
npm run test:a11y
npm run lighthouse  # Ensure dev server is running
npm run pa11y       # Ensure preview server is running
```

---

## CI/CD Commands

### Manual Trigger (GitHub Actions)

```bash
# Trigger workflow manually via gh CLI
gh workflow run accessibility.yml

# View workflow runs
gh run list --workflow=accessibility.yml

# View specific run
gh run view [RUN_ID]

# Download artifacts
gh run download [RUN_ID]
```

### Local CI Simulation

```bash
# Simulate CI environment
CI=true npm run test:a11y

# Build and test
npm run build
npm run preview &
sleep 5
npm run lighthouse
npm run pa11y
```

---

## Browser DevTools

### Chrome DevTools

```bash
# Accessibility pane
# 1. Open DevTools (F12)
# 2. Elements tab
# 3. Accessibility pane (right side)

# Lighthouse
# 1. Open DevTools (F12)
# 2. Lighthouse tab
# 3. Select "Accessibility"
# 4. Generate report

# Console commands
# Check for accessibility issues in console
# Warnings will show with [A11Y] prefix
```

### axe DevTools Extension

```bash
# Install from Chrome Web Store
# 1. Search "axe DevTools"
# 2. Install extension
# 3. Click extension icon
# 4. Click "Scan ALL of my page"
```

---

## Screen Reader Testing

### NVDA (Windows)

```bash
# Start/Stop NVDA
# Insert + Q to quit
# Insert + N for NVDA menu

# Common commands
# Insert + Down Arrow = Say all
# Insert + T = Read title
# H = Next heading
# K = Next link
# F = Next form field
# B = Next button
```

### VoiceOver (macOS)

```bash
# Toggle VoiceOver
# Cmd + F5

# Common commands (VO = Ctrl + Option)
# VO + A = Start reading
# VO + Right Arrow = Next item
# VO + Space = Activate
# VO + U = Open rotor
```

### JAWS (Windows)

```bash
# Common commands
# Insert + Down Arrow = Say all
# Insert + F4 = Quit JAWS
# H = Next heading
# K = Next link
# F = Next form field
```

---

## Browser Testing

### Different Browsers

```bash
# Test in all browsers
npx playwright test tests/accessibility/ --project=chromium
npx playwright test tests/accessibility/ --project=firefox
npx playwright test tests/accessibility/ --project=webkit

# Run all browsers in parallel
npx playwright test tests/accessibility/
```

### Mobile Testing

```bash
# Test mobile viewport
npx playwright test tests/accessibility/ --project=mobile-chrome
npx playwright test tests/accessibility/ --project=mobile-safari

# Test specific viewport size
# Add to test:
await page.setViewportSize({ width: 375, height: 667 });
```

---

## Debugging Commands

### Playwright Inspector

```bash
# Debug mode with inspector
npx playwright test tests/accessibility/ --debug

# Step through test
# Inspector will open, use UI to control

# Headed mode (see browser)
npm run test:a11y:headed

# Slow motion
npx playwright test tests/accessibility/ --headed --slow-mo=1000
```

### Console Output

```bash
# Verbose output
DEBUG=pw:api npx playwright test tests/accessibility/

# Full trace
npx playwright test tests/accessibility/ --trace on

# Show browser console
npx playwright test tests/accessibility/ --headed
# Browser console will show in actual browser
```

### Generate Trace

```bash
# Record trace
npx playwright test tests/accessibility/ --trace on

# View trace
npx playwright show-trace trace.zip
```

---

## Report Generation

### Test Reports

```bash
# Generate HTML report (automatic after test run)
npx playwright test tests/accessibility/

# Open report
npx playwright show-report

# Generate JSON report
npx playwright test tests/accessibility/ --reporter=json

# Generate JUnit XML
npx playwright test tests/accessibility/ --reporter=junit
```

### Lighthouse Reports

```bash
# Generate and view Lighthouse report
npm run lighthouse

# Reports saved to .lighthouseci/ directory
open .lighthouseci/lhr-*.html
```

### Pa11y Reports

```bash
# Run with JSON output
npx pa11y-ci --json > pa11y-results.json

# Run with custom reporter
npx pa11y-ci --reporter csv > pa11y-results.csv
```

---

## Utility Commands

### Check Dependencies

```bash
# Check for outdated dependencies
npm outdated

# Update accessibility testing tools
npm update @axe-core/playwright @lhci/cli pa11y-ci

# Check Playwright version
npx playwright --version
```

### Clean and Reinstall

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Clear Playwright cache
npx playwright uninstall
npx playwright install
```

### Check Installation

```bash
# Verify all tools are installed
which axe
which pa11y-ci
npx playwright --version
npx lhci --version

# List installed Playwright browsers
npx playwright install --list
```

---

## Project-Specific Commands

### Component Testing

```bash
# Test specific component manually
# Import and use in isolation

# Example: Test AccessibleButton
npm run dev
# Navigate to component in browser
# Test with keyboard only
```

### Integration Testing

```bash
# Test full user flows
npx playwright test tests/accessibility/ -g "user flow"

# Test specific pages
npx playwright test -g "Dashboard page"
npx playwright test -g "Settings page"
```

---

## Performance Testing with Accessibility

```bash
# Lighthouse with performance + accessibility
npx lhci autorun

# Bundle size analysis (can affect load time for screen readers)
npm run build:analyze

# Check performance
npm run perf:monitor
```

---

## Helpful Aliases (Add to .bashrc or .zshrc)

```bash
# Accessibility testing aliases
alias a11y="npm run test:a11y"
alias a11y:debug="npx playwright test tests/accessibility/ --debug"
alias a11y:headed="npm run test:a11y:headed"
alias a11y:lint="npm run lint"
alias a11y:full="npm run validate && npm run test:a11y"

# Screen reader shortcuts
alias nvda="start nvda"  # Windows
alias vo="osascript -e 'tell application \"System Events\" to key code 96 using {command down, option down}'"  # macOS

# Browser shortcuts
alias chrome:a11y="open -a 'Google Chrome' --args --force-prefers-reduced-motion"
alias firefox:a11y="open -a Firefox --args -private"
```

---

## Git Hooks (Pre-commit)

Add to `.git/hooks/pre-commit`:

```bash
#!/bin/sh

# Run accessibility tests before commit
npm run test:a11y

# Exit with error code if tests fail
if [ $? -ne 0 ]; then
  echo "Accessibility tests failed. Commit aborted."
  exit 1
fi

# Run linting
npm run lint

if [ $? -ne 0 ]; then
  echo "Linting failed. Commit aborted."
  exit 1
fi

exit 0
```

Make it executable:
```bash
chmod +x .git/hooks/pre-commit
```

---

## Environment Variables

```bash
# Set headless mode
HEADLESS=false npm run test:a11y

# Set specific browser
BROWSER=firefox npm run test:a11y

# CI mode
CI=true npm run test:a11y

# Debug mode
DEBUG=pw:api npm run test:a11y
```

---

## Keyboard Shortcuts (In Browser)

```
F12                 Open DevTools
Cmd/Ctrl + Shift + I  Open DevTools
Cmd/Ctrl + +        Zoom in
Cmd/Ctrl + -        Zoom out
Cmd/Ctrl + 0        Reset zoom
Tab                 Next focusable element
Shift + Tab         Previous focusable element
?                   Show keyboard shortcuts (in app)
```

---

## Quick Troubleshooting

```bash
# Tests not finding elements?
npx playwright test tests/accessibility/ --headed --slow-mo=1000

# Browser not launching?
npx playwright install chromium --force

# Port already in use?
lsof -ti:5173 | xargs kill  # Kill process on port 5173

# Can't find test files?
npx playwright test --list

# Dependencies issue?
rm -rf node_modules package-lock.json && npm install
```

---

## Documentation Quick Links

```bash
# Open documentation (macOS)
open docs/A11Y_IMPLEMENTATION.md
open docs/ACCESSIBILITY_GUIDE.md
open docs/KEYBOARD_SHORTCUTS.md

# Or view in terminal
cat docs/A11Y_QUICK_REFERENCE.md
less docs/A11Y_IMPLEMENTATION.md
```

---

## Continuous Monitoring

```bash
# Set up cron job for weekly tests (Linux/macOS)
# Edit crontab
crontab -e

# Add line (run every Monday at 9 AM)
0 9 * * 1 cd /path/to/project && npm run test:a11y

# Set up scheduled task (Windows)
# Use Task Scheduler to run npm run test:a11y weekly
```

---

## Summary Commands

```bash
# Daily development
npm run lint && npm run test:a11y

# Before PR
npm run validate && npm run test:a11y && npm run lighthouse

# Full audit
npm run test:a11y && npm run lighthouse && npm run pa11y

# Quick check
npm run test:a11y -- -g "keyboard navigation"

# Debug failing test
npx playwright test -g "failing test name" --debug
```

---

**Keep this file handy for quick command reference!**

**Tip:** Star ⭐ the most useful commands in your terminal history:
```bash
# Save to favorites (bash)
alias a11y-test='npm run test:a11y'
```
