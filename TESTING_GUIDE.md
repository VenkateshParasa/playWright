# Testing Guide - Lesson Loading Issue

## Current Status

### What's Working ✅
- Backend server is running on port 3001
- All 60 lesson files exist (30 Playwright + 30 Selenium)
- Lesson files have correct ID format:
  - Playwright: `pw-beginner-001`, `pw-intermediate-001`, etc.
  - Selenium: `sel-beginner-001`, `sel-intermediate-001`, etc.
- Backend serves lessons correctly via HTTP

### What's Being Fixed 🔧
- Frontend lesson loading was showing "lesson-NaN.json" error
- Added improved error handling and debugging logs to identify the issue

## How to Test

### 1. Start Both Servers

```bash
# Terminal 1 - Backend (if not already running)
cd backend
npm start

# Terminal 2 - Frontend (if not already running)
cd frontend
npm run dev
```

### 2. Open the Application

1. Open your browser to `http://localhost:5173`
2. Navigate to the "Lessons" page
3. Open the browser's Developer Console (F12 or Cmd+Option+I)

### 3. Test Lesson Loading

1. Click on any lesson card (e.g., "Introduction to Playwright")
2. Check the browser console for debug logs:
   ```
   [fetchLessonById] Received lesson ID: pw-beginner-001
   [fetchLessonById] Split parts: ["pw", "beginner", "001"]
   [fetchLessonById] Parsed: {track: "playwright", category: "beginner", lessonNumber: 1}
   ```

### 4. What to Look For

#### If Successful ✅
- Lesson content loads and displays properly
- Console shows the debug logs with correct parsing
- No 404 errors in the Network tab

#### If Still Failing ❌
- Check the console for error messages
- Look for the exact lesson ID being passed
- Check the Network tab for the actual URL being requested
- Note any error messages about invalid format or NaN

## Expected Behavior

When you click on a lesson:
1. URL changes to `/lessons/pw-beginner-001` (or similar)
2. Frontend calls `fetchLessonById("pw-beginner-001")`
3. Function parses ID into: track="playwright", category="beginner", number=1
4. Fetches from: `http://localhost:3001/data/lessons/playwright/beginner/lesson-001.json`
5. Lesson content displays

## Debugging Information

### API Endpoints
- Lesson Index: `http://localhost:3001/data/lessons/index.json`
- Playwright Beginner 1: `http://localhost:3001/data/lessons/playwright/beginner/lesson-001.json`
- Selenium Beginner 1: `http://localhost:3001/data/lessons/selenium/beginner/lesson-001.json`

### Test API Directly
```bash
# Test if backend is serving lessons
curl http://localhost:3001/data/lessons/playwright/beginner/lesson-001.json

# Should return JSON with id: "pw-beginner-001"
```

### Console Logs Added
The following debug logs have been added to `frontend/src/lib/api/lessons.ts`:
- `[fetchLessonById] Received lesson ID:` - Shows the ID passed to the function
- `[fetchLessonById] Split parts:` - Shows how the ID was split
- `[fetchLessonById] Parsed:` - Shows the parsed track, category, and lesson number

## Common Issues and Solutions

### Issue: "lesson-NaN.json" Error
**Cause**: Lesson number parsing failed (parseInt returned NaN)
**Solution**: Check the console logs to see what ID was received and how it was parsed

### Issue: "Lesson ID is required"
**Cause**: No lesson ID in the URL or ID is undefined
**Solution**: Check that the link from Lessons page includes the lesson ID

### Issue: 404 Not Found
**Cause**: Backend not running or incorrect URL
**Solution**: Verify backend is running on port 3001 and serving the correct path

### Issue: CORS Error
**Cause**: Backend CORS not configured for frontend port
**Solution**: Backend should allow requests from `http://localhost:5173`

## Next Steps

After testing:
1. Report what you see in the browser console
2. Share any error messages
3. Check the Network tab for failed requests
4. Verify the lesson content loads or note the specific error

## Files Modified

- `frontend/src/lib/api/lessons.ts` - Added error handling and debug logs
- `backend/server.js` - Configured to serve lesson data

## Lesson File Structure

```
backend/data/lessons/
├── index.json
├── playwright/
│   ├── beginner/
│   │   ├── lesson-001.json (id: "pw-beginner-001")
│   │   ├── lesson-002.json (id: "pw-beginner-002")
│   │   └── ... (up to lesson-010.json)
│   ├── intermediate/
│   │   └── ... (lesson-001.json to lesson-010.json)
│   └── advanced/
│       └── ... (lesson-001.json to lesson-010.json)
└── selenium/
    ├── beginner/
    │   ├── lesson-001.json (id: "sel-beginner-001")
    │   └── ... (up to lesson-010.json)
    ├── intermediate/
    │   └── ... (lesson-001.json to lesson-010.json)
    └── advanced/
        └── ... (lesson-001.json to lesson-010.json)
```

Total: 60 lessons (30 Playwright + 30 Selenium)