# CI/CD Quick Reference

Quick commands and references for CI/CD operations.

## GitHub Actions Status

[![CI](https://github.com/your-org/playwright-selenium-learning/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/playwright-selenium-learning/actions/workflows/ci.yml)
[![Frontend](https://github.com/your-org/playwright-selenium-learning/actions/workflows/frontend.yml/badge.svg)](https://github.com/your-org/playwright-selenium-learning/actions/workflows/frontend.yml)
[![Playwright](https://github.com/your-org/playwright-selenium-learning/actions/workflows/playwright.yml/badge.svg)](https://github.com/your-org/playwright-selenium-learning/actions/workflows/playwright.yml)
[![Selenium](https://github.com/your-org/playwright-selenium-learning/actions/workflows/selenium.yml/badge.svg)](https://github.com/your-org/playwright-selenium-learning/actions/workflows/selenium.yml)
[![Security](https://github.com/your-org/playwright-selenium-learning/actions/workflows/security.yml/badge.svg)](https://github.com/your-org/playwright-selenium-learning/actions/workflows/security.yml)

## Quick Commands

### Local Testing

```bash
# Run all tests
./scripts/test.sh all

# Run specific test type
./scripts/test.sh unit
./scripts/test.sh integration
./scripts/test.sh e2e
./scripts/test.sh playwright

# Frontend specific
cd frontend
npm run test              # Unit tests (watch mode)
npm run test -- --run     # Unit tests (single run)
npm run test:ui          # Test UI
npm run test:e2e         # E2E tests
npm run lint             # Lint code
npm run type-check       # Type check

# Playwright runner
cd playwright-runner
npm test                 # Run all tests
npm run test:headed     # Headed mode
npm run test:debug      # Debug mode
npm run test:ui         # UI mode
```

### Deployment

```bash
# Deploy to staging
./scripts/deploy.sh staging

# Deploy to production
./scripts/deploy.sh production

# Rollback
./scripts/rollback.sh production

# Database migrations
./scripts/migrate.sh staging up
./scripts/migrate.sh production up
```

### Initial Setup

```bash
# Local development setup
./scripts/setup-dev.sh

# CI/CD setup (requires GitHub CLI)
./scripts/setup-cicd.sh
```

## Workflow Triggers

| Workflow | Trigger | Description |
|----------|---------|-------------|
| CI | Push/PR to main/develop | Lint, type-check, tests |
| Frontend | Push/PR (frontend/**) | Frontend tests and build |
| Playwright | Push/PR (playwright-runner/**) | Cross-browser tests |
| Selenium | Push/PR (selenium-java/**) | Java Selenium tests |
| Security | Daily at 1 AM UTC | Security scans |
| Deploy Staging | Push to develop | Auto-deploy to staging |
| Deploy Production | Push to main | Deploy to production |
| Preview | PR opened/updated | Deploy preview |

## Required Secrets

### Deployment
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `STAGING_API_URL`
- `PRODUCTION_API_URL`

### Database (Optional)
- `STAGING_DATABASE_URL`
- `PRODUCTION_DATABASE_URL`

### Notifications (Optional)
- `SLACK_WEBHOOK`

### Security (Optional)
- `SNYK_TOKEN`

## Test Coverage

| Type | Threshold | Current |
|------|-----------|---------|
| Statements | 80% | - |
| Branches | 80% | - |
| Functions | 80% | - |
| Lines | 80% | - |

## Environment URLs

| Environment | URL |
|-------------|-----|
| Development | http://localhost:5173 |
| Staging | https://staging.playwright-selenium-learning.com |
| Production | https://playwright-selenium-learning.com |

## Common Issues

### Tests failing in CI

```bash
# Check Node version matches
node --version

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Run tests locally
npm run test -- --run
```

### Deployment failed

```bash
# Check deployment logs
gh run list --workflow=deploy-production.yml
gh run view <run-id>

# Verify secrets
gh secret list

# Manual rollback
./scripts/rollback.sh production
```

### Coverage below threshold

```bash
# Check coverage report
npm run test -- --coverage
open coverage/index.html

# Find untested code
npm run test -- --coverage --reporter=verbose
```

## Monitoring

### View Workflow Runs

```bash
# List recent runs
gh run list

# View specific run
gh run view <run-id>

# Watch current run
gh run watch
```

### View Logs

```bash
# View workflow logs
gh run view <run-id> --log

# Download logs
gh run download <run-id>
```

### Cancel Workflow

```bash
# Cancel specific run
gh run cancel <run-id>

# Cancel all runs for a workflow
gh run list --workflow=ci.yml --status=in_progress --json databaseId --jq '.[].databaseId' | xargs -I {} gh run cancel {}
```

## Emergency Procedures

### Rollback Production

1. Identify last working deployment tag
   ```bash
   git tag --list 'deployment-*' --sort=-version:refname | head -5
   ```

2. Rollback to that version
   ```bash
   ./scripts/rollback.sh production <tag>
   ```

3. Verify rollback
   ```bash
   curl https://playwright-selenium-learning.com
   ```

### Stop Broken Deployment

1. Cancel workflow
   ```bash
   gh run cancel <run-id>
   ```

2. Rollback if already deployed
   ```bash
   ./scripts/rollback.sh production
   ```

### Fix Failing Tests

1. Run tests locally
   ```bash
   npm run test -- --reporter=verbose
   ```

2. Fix issues

3. Verify fix
   ```bash
   npm run test -- --run
   ```

4. Push fix
   ```bash
   git add .
   git commit -m "fix: resolve test failures"
   git push
   ```

## Performance Benchmarks

### Target Metrics

- **Build Time**: < 5 minutes
- **Test Time**: < 10 minutes
- **E2E Test Time**: < 15 minutes
- **Deployment Time**: < 3 minutes

### Current Metrics

Check workflow run times in GitHub Actions.

## Security Scan Schedule

| Scan Type | Frequency | Time |
|-----------|-----------|------|
| Full Security | Daily | 1 AM UTC |
| Dependency | On push | - |
| Code Analysis | On push/PR | - |
| Secret Detection | On push/PR | - |

## Useful Links

- [CI/CD Documentation](./CI_CD_SETUP.md)
- [Testing Guide](./TESTING_GUIDE.md)
- [GitHub Actions](https://github.com/your-org/playwright-selenium-learning/actions)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Codecov Reports](https://codecov.io/gh/your-org/playwright-selenium-learning)

## Support

- Create an issue: `gh issue create`
- Contact DevOps: devops@example.com
- Slack: #ci-cd-support
