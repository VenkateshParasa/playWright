# Card Management System - Implementation Guide

This guide documents the Card Management System for the Playwright & Selenium Learning Platform.

## Overview

The Card Management System provides a comprehensive interface for browsing, editing, and managing flashcard decks and individual cards. It includes support for bulk operations, import/export, and detailed card statistics.

## Architecture

### Backend Components

1. **Models**
   - `/backend/src/models/Flashcard.ts` - Flashcard model with SRS data
   - `/backend/src/models/Deck.ts` - Deck model for organizing cards

2. **Controllers**
   - `/backend/src/controllers/cardController.ts` - Handles all card and deck operations

3. **Routes**
   - `/backend/src/routes/cards.ts` - API endpoints for card management

### Frontend Components

1. **Stores**
   - `/frontend/src/stores/cardManagementStore.ts` - Zustand store for card management state

2. **Pages**
   - `/frontend/src/pages/CardManagement.tsx` - Main card management page

3. **Components**
   - `CardBrowser.tsx` - Displays cards in grid or list view
   - `CardFilters.tsx` - Filter sidebar
   - `CardSearch.tsx` - Search functionality
   - `CardEditor.tsx` - Card creation and editing
   - `CardStats.tsx` - Individual card statistics
   - `BulkActions.tsx` - Bulk operations toolbar
   - `DeckBrowser.tsx` - Deck management
   - `CardImportExport.tsx` - Import/export functionality
   - `CardPreviewModal.tsx` - Card preview with flip animation

4. **Utilities**
   - `/frontend/src/lib/cards/importExport.ts` - Import/export utilities

## API Endpoints

### Cards

- `GET /api/cards` - List cards with filters and pagination
  - Query params: `page`, `limit`, `sortBy`, `sortOrder`, `search`, `deckId`, `category`, `tags[]`, `status[]`, `difficulty[]`, `dueOnly`

- `GET /api/cards/:id` - Get single card
- `POST /api/cards` - Create new card
- `PUT /api/cards/:id` - Update card
- `DELETE /api/cards/:id` - Delete card
- `POST /api/cards/bulk` - Bulk operations
  - Operations: `suspend`, `resume`, `reset`, `delete`, `changeCategory`, `changeDeck`
- `POST /api/cards/:id/suspend` - Suspend card
- `POST /api/cards/:id/reset` - Reset card progress
- `GET /api/cards/:id/stats` - Get card statistics
- `POST /api/cards/import` - Import cards
- `GET /api/cards/export` - Export cards (supports JSON and CSV)

### Decks

- `GET /api/decks` - List decks with stats
- `POST /api/decks` - Create deck
- `PUT /api/decks/:id` - Update deck
- `DELETE /api/decks/:id` - Delete deck
  - Query param: `moveCardsTo` (optional deck ID to move cards to)

## Card Statuses

The system uses five card statuses based on the SM-2 algorithm:

1. **New** - Never reviewed (repetitions = 0)
2. **Learning** - In initial learning phase (interval < 1 day)
3. **Review** - Regular review schedule (interval >= 1 day)
4. **Mastered** - High ease factor and long interval (interval >= 21 days, ease factor >= 2.5)
5. **Suspended** - Manually suspended, not shown in reviews

Status transitions happen automatically based on SRS algorithm results.

## Import/Export Formats

### JSON Format

```json
{
  "version": "1.0",
  "exportedAt": "2024-01-01T00:00:00.000Z",
  "count": 2,
  "cards": [
    {
      "front": "What is Playwright?",
      "back": "A modern end-to-end testing framework",
      "category": "Playwright Basics",
      "tags": ["testing", "automation"],
      "difficulty": "easy"
    }
  ]
}
```

### CSV Format

```csv
Front,Back,Category,Tags,Difficulty,Status
"What is Playwright?","A modern end-to-end testing framework","Playwright Basics","testing, automation","easy","new"
```

### Anki Format (Tab-separated)

```
What is Playwright?	A modern end-to-end testing framework	testing automation
```

## Features Implemented

### Card Browser
- Grid and list view modes
- Multi-select with Ctrl/Cmd+Click
- Quick actions (edit, suspend, delete)
- Sorting by multiple fields
- Pagination
- Status indicators with color coding
- Difficulty indicators
- Review statistics display

### Card Filters
- Filter by deck
- Filter by category
- Filter by tags (multi-select)
- Filter by status (new, learning, review, mastered, suspended)
- Filter by difficulty
- Filter by due date (overdue, due today, due this week)
- Show only due cards toggle
- Clear all filters button
- Active filter badges

### Card Editor
- Rich text editing for front and back
- Image upload support
- Category selection
- Tag management (add/remove tags)
- Difficulty override
- Related cards linking
- Draft mode
- Preview functionality
- Auto-save drafts to localStorage

### Card Statistics
- Total reviews count
- Correct/incorrect ratio
- Success rate percentage
- Current ease factor
- Current interval
- Last review date
- Next review date
- Total time spent reviewing
- Average time per review
- Review history timeline
- Ease factor graph over time

### Bulk Operations
- Select all/none
- Suspend selected cards
- Resume selected cards
- Reset progress for selected cards
- Delete selected cards
- Change category for selected cards
- Move cards to different deck
- Export selected cards
- Progress indicator for operations
- Confirmation dialogs for destructive actions

### Deck Management
- Create new decks
- Edit deck (name, description, color, icon)
- Delete deck with option to move cards
- View deck statistics
- Share deck (future feature)
- Default deck support

### Import/Export
- Import from JSON, CSV, Anki formats
- Export to JSON, CSV, Anki formats
- File upload with drag-and-drop
- Format auto-detection
- Field mapping for CSV import
- Preview imported cards before saving
- Duplicate detection with handling options (skip, replace, keep both)
- Validation with error reporting
- Batch import with progress indicator

### Search
- Full-text search in card content (front/back)
- Search in tags and categories
- Debounced search (300ms)
- Search suggestions
- Clear search button
- Search results highlighting

## Keyboard Shortcuts

- `Ctrl/Cmd + K` - Focus search
- `E` - Edit selected card
- `D` - Delete selected card
- `S` - Suspend selected card
- `R` - Reset selected card progress
- `Ctrl/Cmd + A` - Select all cards
- `Escape` - Deselect all / Close modals
- `Space` - Preview selected card (if single)

## State Management

The card management store (`cardManagementStore.ts`) manages:

- **Cards data**: List of cards with pagination
- **Selection state**: Set of selected card IDs
- **Filters**: Active filters for cards
- **Search query**: Current search term
- **View settings**: Grid/list mode, sort order
- **Decks data**: List of decks with statistics
- **UI state**: Loading, errors, progress

All state changes are tracked in Redux DevTools for debugging.

## Optimizations

1. **Pagination**: Cards are loaded in pages of 50 to avoid loading large datasets
2. **Virtual scrolling**: Not yet implemented (future enhancement)
3. **Debounced search**: 300ms debounce to avoid excessive API calls
4. **Optimistic updates**: UI updates immediately for better UX
5. **Caching**: Filters and view settings persisted to localStorage
6. **Lazy loading**: Components are code-split for faster initial load

## Error Handling

All API calls include comprehensive error handling:
- Network errors
- Validation errors
- Authorization errors
- Server errors

Errors are displayed to the user with clear messages and recovery options.

## Accessibility

- All interactive elements are keyboard accessible
- Proper ARIA labels on buttons and inputs
- Focus management in modals
- Screen reader friendly
- Sufficient color contrast
- Visual focus indicators

## Testing

To test the Card Management System:

1. **Backend Tests**: (To be implemented)
   ```bash
   cd backend
   npm test
   ```

2. **Frontend Tests**: (To be implemented)
   ```bash
   cd frontend
   npm test
   ```

3. **E2E Tests**: (To be implemented)
   ```bash
   npm run test:e2e
   ```

## Usage Examples

### Creating a Card

```typescript
const card = await createCard({
  front: 'What is Playwright?',
  back: 'A modern end-to-end testing framework',
  category: 'Playwright Basics',
  tags: ['testing', 'automation'],
  difficulty: 'easy',
  deckId: 'deck-123',
});
```

### Bulk Suspend Cards

```typescript
await bulkSuspend(['card-1', 'card-2', 'card-3']);
```

### Import Cards from JSON

```typescript
const cards = parseJSON(jsonString);
const result = await importCards(cards, 'deck-123', 'skip');
```

### Export Cards to CSV

```typescript
exportCardsToCSV(selectedCards, 'my-flashcards.csv');
```

## Future Enhancements

1. Virtual scrolling for large card lists
2. Advanced search with operators (AND, OR, NOT)
3. Card templates for quick creation
4. Collaborative editing with real-time sync
5. Version history for cards
6. Undo/redo for all operations
7. Card attachments (audio, video)
8. Card relationships graph visualization
9. Advanced statistics and analytics
10. AI-powered card generation

## Troubleshooting

### Cards not loading
- Check network connection
- Verify authentication token is valid
- Check browser console for errors
- Clear localStorage and refresh

### Import failing
- Verify file format is correct
- Check for missing required fields
- Validate JSON/CSV structure
- Check file size limits

### Slow performance
- Reduce cards per page limit
- Clear filters
- Disable real-time updates
- Check for memory leaks in DevTools

## Support

For issues or questions:
1. Check this documentation
2. Review the code comments
3. Check browser console for errors
4. Contact the development team

## License

This implementation is part of the Playwright & Selenium Learning Platform project.
