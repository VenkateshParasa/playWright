# Quick Start Guide - Global Search

Get the Global Search feature running in 5 minutes!

## Step 1: Install Dependencies

```bash
cd frontend
npm install fuse.js
```

## Step 2: Verify Files

Ensure all these files exist:

```
✓ frontend/src/components/search/GlobalSearch.tsx
✓ frontend/src/components/search/SearchBar.tsx
✓ frontend/src/components/search/SearchResults.tsx
✓ frontend/src/components/search/SearchFilters.tsx
✓ frontend/src/components/search/SearchSuggestions.tsx
✓ frontend/src/stores/searchStore.ts
✓ frontend/src/lib/search/searchIndex.ts
✓ frontend/src/lib/search/searchAlgorithm.ts
✓ frontend/src/types/search.types.ts
✓ backend/src/routes/search.ts
✓ backend/src/controllers/searchController.ts
```

## Step 3: Start Development Servers

### Terminal 1 - Frontend
```bash
cd frontend
npm run dev
```

### Terminal 2 - Backend
```bash
cd backend
npm run dev
```

## Step 4: Test the Feature

### Method 1: Keyboard Shortcut
1. Open your browser to `http://localhost:5173`
2. Press `Cmd + K` (Mac) or `Ctrl + K` (Windows/Linux)
3. Type "playwright" in the search box
4. See results appear instantly!

### Method 2: Click Button
1. Click the search icon in the header (magnifying glass)
2. Type your search query
3. Use filters to narrow results
4. Click on a result to navigate

## Step 5: Try Advanced Features

### Keyboard Navigation
```
Arrow Down → Navigate to next result
Arrow Up   → Navigate to previous result
Enter      → Open selected result
Escape     → Close search modal
```

### Apply Filters
1. Open search modal
2. Click "Filters" at the bottom
3. Select content type, difficulty, or track
4. See filtered results instantly

### View Recent Searches
1. Open search modal
2. Without typing anything
3. See your recent searches listed
4. Click any recent search to repeat it

## Common Issues & Solutions

### Issue: Search modal doesn't open
**Solution:** Check browser console for errors. Ensure Fuse.js is installed.

### Issue: No results found
**Solution:**
1. Check if mock data is loaded: Open console and type:
   ```javascript
   import { getSearchIndex } from './lib/search';
   getSearchIndex().getAllItems().length
   ```
2. Should return > 0

### Issue: Keyboard shortcut not working
**Solution:**
- Make sure no other modal is open
- Try clicking on the page first to ensure focus
- Check if another extension is using the same shortcut

### Issue: Slow search
**Solution:**
- First search may be slow (building index)
- Subsequent searches should be <50ms
- Check browser DevTools Performance tab

## Verification Checklist

After setup, verify these work:

- [ ] Press Cmd/Ctrl + K opens modal
- [ ] Typing shows results immediately
- [ ] Results have colored badges (type, difficulty)
- [ ] Clicking result navigates to page
- [ ] Filters work correctly
- [ ] Recent searches appear
- [ ] Keyboard navigation works
- [ ] Escape closes modal
- [ ] Search button in header works
- [ ] Mobile responsive

## Quick Configuration

### Change Debounce Delay
Edit `frontend/src/components/search/SearchBar.tsx`:
```typescript
const debouncedSearch = useCallback(
  debounce((searchQuery: string) => {
    // ...
  }, 300), // Change this number (milliseconds)
  // ...
);
```

### Change Result Limit
Edit `frontend/src/lib/search/searchIndex.ts`:
```typescript
search(query: string, limit: number = 20) { // Change default
  // ...
}
```

### Adjust Fuzzy Match Sensitivity
Edit `frontend/src/lib/search/searchAlgorithm.ts`:
```typescript
export const DEFAULT_SEARCH_OPTIONS = {
  threshold: 0.4, // 0.0 = exact match, 1.0 = match anything
  // ...
};
```

## Development Tips

### Debug Search Index
```typescript
import { getSearchIndex } from '@/lib/search';

const index = getSearchIndex();
console.log('Total items:', index.getAllItems().length);
console.log('Categories:', index.getCategories());
console.log('Tags:', index.getTags());
```

### Debug Search Results
```typescript
import { useSearchStore } from '@/stores/searchStore';

const { results, query, filters } = useSearchStore();
console.log('Query:', query);
console.log('Filters:', filters);
console.log('Results:', results);
```

### Monitor Performance
```typescript
console.time('search');
await performSearch('test query');
console.timeEnd('search');
```

## Next Steps

1. **Read full documentation:** `frontend/src/components/search/README.md`
2. **Explore examples:** `frontend/src/examples/SearchExamples.tsx`
3. **Customize styling:** Edit Tailwind classes in components
4. **Add content types:** Follow guide in README.md
5. **Set up analytics backend:** Implement in `searchController.ts`

## Getting Help

- Check the comprehensive README: `frontend/src/components/search/README.md`
- Review implementation summary: `SEARCH_IMPLEMENTATION_SUMMARY.md`
- Inspect browser console for errors
- Check React DevTools for component state

---

**You're all set!** The search feature should now be fully functional. Press Cmd/Ctrl + K and start searching! 🎉
