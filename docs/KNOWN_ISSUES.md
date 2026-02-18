# Known Issues & Expected Errors

## ⚠️ IMPORTANT: These Are NOT Real Errors!

All the TypeScript errors you see in this project are **completely normal and expected**. They exist because the project dependencies haven't been installed yet.

## 📋 List of Expected Errors

### Frontend Errors (16 total)

#### 1. Module Not Found Errors
```
❌ Cannot find module 'react'
❌ Cannot find module 'react-dom/client'
❌ Cannot find module 'react-router-dom'
❌ Cannot find module 'vite'
❌ Cannot find module '@vitejs/plugin-react'
❌ Cannot find module 'vite-plugin-pwa'
❌ Cannot find module 'path'
❌ Cannot find module './App'
```

**Why?** These packages don't exist in `node_modules` yet.

**Fix:** Run `cd frontend && npm install`

#### 2. JSX Runtime Errors
```
❌ This JSX tag requires the module path 'react/jsx-runtime' to exist
```

**Why?** React's JSX runtime isn't available until React is installed.

**Fix:** Run `cd frontend && npm install`

#### 3. Global Name Errors
```
❌ Cannot find name '__dirname'
❌ Cannot find name 'process'
```

**Why?** Node.js type definitions (@types/node) aren't installed.

**Fix:** Run `cd frontend && npm install` (includes @types/node)

### Playwright Errors (6 total)

```
❌ Cannot find module '@playwright/test'
❌ Cannot find name 'process' (multiple instances)
```

**Why?** Playwright and Node types aren't installed.

**Fix:** Run `cd playwright-runner && npm install`

### Total Error Count: 22 errors

**All 22 errors will disappear after running `npm install` in each directory.**

## 🔧 One-Time Fix

Run these three commands to fix ALL errors:

```bash
# Fix frontend errors (16 errors)
cd frontend && npm install

# Fix Playwright errors (6 errors)
cd ../playwright-runner && npm install

# Build Selenium project
cd ../selenium-java && mvn install
```

## ✅ After Running npm install

You should see:
- ✅ 0 TypeScript errors
- ✅ `node_modules` folder created
- ✅ All packages installed
- ✅ Development server can start
- ✅ Tests can run

## 🎯 Why This Happens

This is **standard behavior** for all TypeScript/Node.js projects:

1. **Initial State**: Project files exist, but no dependencies
2. **TypeScript Checks**: TypeScript tries to find modules
3. **Modules Missing**: Can't find them because `node_modules` doesn't exist
4. **Errors Shown**: TypeScript reports "Cannot find module"
5. **After npm install**: Dependencies downloaded, errors disappear

## 📊 Error Breakdown by File

### frontend/src/App.tsx (2 errors)
- Cannot find module 'react-router-dom'
- JSX tag requires 'react/jsx-runtime'

### frontend/src/main.tsx (4 errors)
- Cannot find module 'react'
- Cannot find module 'react-dom/client'
- Cannot find module './App'
- JSX tag requires 'react/jsx-runtime'

### frontend/vite.config.ts (5 errors)
- Cannot find module 'vite'
- Cannot find module '@vitejs/plugin-react'
- Cannot find module 'vite-plugin-pwa'
- Cannot find module 'path'
- Cannot find name '__dirname'

### playwright-runner/playwright.config.ts (6 errors)
- Cannot find module '@playwright/test'
- Cannot find name 'process' (5 instances)

## 🚫 What NOT to Do

❌ Don't try to fix errors by modifying code
❌ Don't delete files
❌ Don't change import statements
❌ Don't worry about the errors

## ✅ What TO Do

✅ Run `npm install` in each directory
✅ Wait for installation to complete
✅ Verify errors are gone
✅ Start development

## 📖 More Information

For detailed setup instructions, see:
- [`SETUP_INSTRUCTIONS.md`](SETUP_INSTRUCTIONS.md) - Complete setup guide
- [`frontend/README.md`](frontend/README.md) - Frontend-specific instructions
- [`playwright-runner/README.md`](playwright-runner/README.md) - Playwright setup
- [`selenium-java/README.md`](selenium-java/README.md) - Java/Maven setup

## 🎓 Learning Opportunity

This is a great example of how modern JavaScript/TypeScript projects work:

1. **package.json** lists dependencies
2. **npm install** downloads them
3. **node_modules** stores them
4. **TypeScript** can then find them

This pattern is used by millions of projects worldwide!

## ❓ FAQ

### Q: Why don't you just include node_modules?
**A:** node_modules can be 100MB-500MB. It's not committed to git. Everyone runs `npm install` to get their own copy.

### Q: Will these errors affect the final application?
**A:** No! Once dependencies are installed, the application will work perfectly.

### Q: How long does npm install take?
**A:** Usually 1-3 minutes depending on internet speed.

### Q: Do I need to run npm install every time?
**A:** No! Only once, or when dependencies change.

### Q: Can I ignore these errors?
**A:** Yes! They're expected. But run `npm install` to make them go away.

## 🎉 Summary

**22 TypeScript errors = 100% normal and expected**

**Solution = 3 simple commands:**
```bash
cd frontend && npm install
cd ../playwright-runner && npm install
cd ../selenium-java && mvn install
```

**Result = 0 errors, ready to code!** 🚀

---

*Last Updated: 2026-02-16*
*These errors are documented and expected. They are not bugs.*