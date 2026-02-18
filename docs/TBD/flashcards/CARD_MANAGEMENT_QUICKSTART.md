# Card Management System - Quick Start Guide

## Overview

This guide will help you integrate and test the Card Management System.

## Step 1: Backend Integration

### 1.1 Update server.ts

Add the card routes to your Express server:

```typescript
// backend/src/server.ts or index.ts
import cardRoutes from './routes/cards';

// After other route imports
app.use('/api', cardRoutes);
```

### 1.2 Verify Database Connection

Ensure MongoDB connection is established before using card routes:

```typescript
// The Flashcard and Deck models will automatically create indexes
import { Flashcard } from './models/Flashcard';
import { Deck } from './models/Deck';
```

### 1.3 Test Backend API

Start your backend server and test the endpoints:

```bash
cd backend
npm run dev

# Test endpoints with curl or Postman:
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/cards
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/decks
```

## Step 2: Frontend Integration

### 2.1 Update App.tsx

Add the Card Management route:

```typescript
// frontend/src/App.tsx
import CardManagement from './pages/CardManagement';

// Inside your Routes component:
<Route path="/cards" element={
  <ProtectedRoute>
    <CardManagement />
  </ProtectedRoute>
} />
```

### 2.2 Update Navigation

Add a link in your sidebar/navigation:

```typescript
// frontend/src/components/layout/Sidebar.tsx
<NavLink to="/cards">
  <svg>...</svg>
  Card Management
</NavLink>
```

### 2.3 Start Frontend

```bash
cd frontend
npm run dev
```

## Step 3: Create Test Data

### 3.1 Using the UI

1. Navigate to `/cards`
2. Click "New Card"
3. Fill in the form:
   - Front: "What is Playwright?"
   - Back: "A modern end-to-end testing framework for web applications"
   - Category: "Playwright Basics"
   - Tags: "testing", "automation"
   - Difficulty: "Easy"
4. Click "Save Card"

### 3.2 Using Import

1. Create a test file `test-cards.json`:

```json
{
  "version": "1.0",
  "cards": [
    {
      "front": "What is a locator in Playwright?",
      "back": "A locator represents a way to find element(s) on the page",
      "category": "Playwright Basics",
      "tags": ["locators", "selectors"],
      "difficulty": "easy"
    },
    {
      "front": "How do you wait for an element in Playwright?",
      "back": "Use await page.waitForSelector('selector') or locator.waitFor()",
      "category": "Playwright Advanced",
      "tags": ["async", "waiting"],
      "difficulty": "medium"
    }
  ]
}
```

2. In the UI:
   - Click "Import/Export"
   - Select "Import"
   - Choose your `test-cards.json` file
   - Click "Import"

### 3.3 Using CSV Import

Create `test-cards.csv`:

```csv
Front,Back,Category,Tags,Difficulty
"What is a fixture in Playwright?","A fixture is a reusable piece of test setup and teardown logic","Playwright Testing","fixtures, testing","medium"
"What is Page Object Model?","A design pattern for organizing test code by creating classes for each page","Testing Best Practices","pom, patterns","medium"
```

## Step 4: Test Features

### 4.1 Card Browser
- ✅ View cards in grid mode
- ✅ Switch to list mode
- ✅ Select multiple cards (Ctrl/Cmd + Click)
- ✅ Sort by different fields
- ✅ Navigate pagination

### 4.2 Filters
- ✅ Filter by status
- ✅ Filter by difficulty
- ✅ Filter by category
- ✅ Filter by tags
- ✅ Clear all filters

### 4.3 Search
- ✅ Search for "Playwright"
- ✅ Clear search
- ✅ See debounced results

### 4.4 Card Editor
- ✅ Create a new card
- ✅ Edit an existing card
- ✅ Add tags
- ✅ Set difficulty
- ✅ Assign to deck

### 4.5 Bulk Operations
- ✅ Select 5 cards
- ✅ Suspend them
- ✅ Resume them
- ✅ Change category
- ✅ Move to deck
- ✅ Export selected

### 4.6 Deck Management
- ✅ Create a deck "Playwright Essentials"
- ✅ Move cards to the deck
- ✅ View deck statistics
- ✅ Filter by deck

### 4.7 Import/Export
- ✅ Export all cards as JSON
- ✅ Export all cards as CSV
- ✅ Import from JSON
- ✅ Import from CSV
- ✅ Check duplicate detection

### 4.8 Card Statistics
- ✅ View card statistics
- ✅ Check review history
- ✅ See success rate
- ✅ View ease factor

## Step 5: Troubleshooting

### Issue: Cards not loading

**Solution:**
1. Check backend is running
2. Check MongoDB connection
3. Verify authentication token
4. Check browser console for errors

### Issue: Import failing

**Solution:**
1. Verify file format (JSON/CSV)
2. Check required fields (front, back, category)
3. Validate JSON syntax
4. Check CSV delimiter (comma)

### Issue: Search not working

**Solution:**
1. Wait for debounce (300ms)
2. Check text index is created in MongoDB
3. Verify search query in network tab

### Issue: Filters not applying

**Solution:**
1. Check filter state in Redux DevTools
2. Verify API request parameters
3. Clear browser cache
4. Reload the page

## Step 6: API Examples

### Create a Card

```bash
curl -X POST http://localhost:5000/api/cards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "front": "What is CI/CD?",
    "back": "Continuous Integration and Continuous Deployment",
    "category": "DevOps",
    "tags": ["cicd", "automation"],
    "difficulty": "medium"
  }'
```

### List Cards

```bash
curl "http://localhost:5000/api/cards?page=1&limit=50&sortBy=createdAt&sortOrder=desc" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Bulk Suspend

```bash
curl -X POST http://localhost:5000/api/cards/bulk \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "operation": "suspend",
    "cardIds": ["card-id-1", "card-id-2"]
  }'
```

### Export Cards

```bash
curl "http://localhost:5000/api/cards/export?format=json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o exported-cards.json
```

### Import Cards

```bash
curl -X POST http://localhost:5000/api/cards/import \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d @cards-to-import.json
```

## Step 7: Performance Optimization

### 7.1 Database Indexes

The following indexes are automatically created:

- `{ userId: 1, status: 1 }`
- `{ userId: 1, nextReviewDate: 1 }`
- `{ userId: 1, category: 1 }`
- `{ userId: 1, tags: 1 }`
- `{ userId: 1, deckId: 1 }`
- Text index on `front` and `back`

### 7.2 Frontend Optimizations

- Pagination limits to 50 cards per page
- Debounced search (300ms)
- View preferences cached in localStorage
- Lazy-loaded modals

### 7.3 Monitoring

Use Redux DevTools to monitor:
- State changes
- API calls
- Performance metrics

## Step 8: Production Checklist

Before deploying to production:

- [ ] Test all CRUD operations
- [ ] Test bulk operations
- [ ] Test import/export with large files (1000+ cards)
- [ ] Test search with special characters
- [ ] Test filters with various combinations
- [ ] Verify pagination with 1000+ cards
- [ ] Test on mobile devices
- [ ] Test on different browsers
- [ ] Check accessibility with screen reader
- [ ] Verify error handling
- [ ] Test authentication/authorization
- [ ] Check MongoDB indexes are created
- [ ] Monitor memory usage
- [ ] Test concurrent users
- [ ] Backup database
- [ ] Set up monitoring/logging

## Additional Resources

- **Full Documentation**: `CARD_MANAGEMENT_GUIDE.md`
- **Implementation Summary**: `CARD_MANAGEMENT_IMPLEMENTATION_SUMMARY.md`
- **Feature Specification**: `FEATURES_IMPLEMENTATION.md` (Section 3.3)

## Support

For issues or questions:
1. Check the documentation
2. Review code comments
3. Check browser console
4. Review network requests
5. Contact the development team

## Next Features to Implement

Consider adding these enhancements:
1. Virtual scrolling for very large card lists
2. Advanced search with operators
3. Card templates
4. Collaborative editing
5. Version history
6. Audio/video attachments
7. AI-powered card generation
8. Spaced repetition calendar view
9. Advanced analytics dashboard
10. Mobile app (React Native)

---

**Congratulations!** Your Card Management System is now ready to use. Happy learning!
