# Playwright Runner - Test Examples & Exercises

## ⚠️ TypeScript Errors Are Expected

If you see errors like:
- ❌ "Cannot find module '@playwright/test'"
- ❌ "Cannot find name 'process'"

**This is normal!** Run `npm install` to fix them.

## 🔧 Quick Fix

```bash
npm install
npx playwright install --with-deps
```

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Install Playwright browsers
npx playwright install --with-deps

# 3. Run tests
npm test

# 4. Run tests in UI mode
npm run test:ui

# 5. Run tests in headed mode
npm run test:headed
```

## 📋 Available Scripts

```bash
npm test              # Run all tests
npm run test:headed   # Run with browser visible
npm run test:debug    # Debug mode
npm run test:ui       # Interactive UI mode
npm run report        # Show HTML report
npm run codegen       # Generate test code
```

## 📚 Test Structure

```
tests/
├── examples/         # Learning examples (01-10)
├── exercises/        # Practice exercises
└── capstone/         # Final project tests
```

## 🎓 Learning Path

1. **Examples** (tests/examples/) - Study these first
   - 01-basic-navigation.spec.ts
   - 02-selectors.spec.ts
   - 03-interactions.spec.ts
   - 04-assertions.spec.ts
   - 05-waits.spec.ts
   - 06-page-objects.spec.ts
   - 07-fixtures.spec.ts
   - 08-network-mocking.spec.ts
   - 09-authentication.spec.ts
   - 10-file-handling.spec.ts

2. **Exercises** (tests/exercises/) - Practice here
   - Complete exercises after studying examples
   - Solutions provided after completion

3. **Capstone** (tests/capstone/) - Final project
   - Build complete test suite
   - Apply all learned concepts

## 🔍 Why Errors Exist

TypeScript can't find `@playwright/test` because `node_modules` doesn't exist yet. After `npm install`, all errors will be resolved.

## 📖 Documentation

- [Playwright Docs](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)

---

**Run `npm install` to fix all TypeScript errors!** 🎉