# Installation & Setup Instructions

## Quick Start

Follow these steps to integrate the Review Schedule & Calendar system into your Playwright & Selenium Learning Platform.

---

## Prerequisites

- Node.js 18+ installed
- MongoDB running
- Existing authentication system in place
- React 18+ frontend
- Express backend

---

## Installation Steps

### 1. Install Frontend Dependencies

```bash
cd frontend
npm install react-calendar @types/react-calendar
```

**Note**: Other dependencies (Recharts, date-fns, Zustand) should already be installed based on existing package.json.

### 2. Verify Backend Dependencies

The backend dependencies should already be present:
- mongoose
- express
- date-fns (if not, add it: `npm install date-fns`)

### 3. Import Backend Route in Server

Edit `/backend/src/server.ts` to add the schedule routes:

```typescript
import scheduleRoutes from './routes/schedule';

// ... existing code ...

// Add this line with your other routes
app.use('/api/schedule', scheduleRoutes);
```

### 4. Add Frontend Route

Edit your frontend routing configuration (typically in `App.tsx` or routes configuration):

```typescript
import { ReviewSchedule } from './pages/ReviewSchedule';

// Add to your routes:
<Route path="/schedule" element={<ReviewSchedule />} />
```

### 5. Add Navigation Link

Add a link to the schedule page in your navigation menu:

```typescript
<Link to="/schedule">
  <Calendar className="w-5 h-5" />
  Schedule
</Link>
```

---

## Database Setup

### Card Model

The Card model will be automatically created when you first import it. No manual database setup required.

However, for optimal performance, ensure MongoDB indexes are created:

```javascript
// This happens automatically via the model, but you can verify:
db.cards.getIndexes()

// Should show indexes on:
// - userId + state + dueDate
// - userId + category + state
// - userId + nextReviewDate
```

---

## Configuration

### Default Settings

The system comes with sensible defaults in `/frontend/src/types/schedule.types.ts`:

```typescript
export const DEFAULT_SCHEDULE_SETTINGS: ScheduleSettings = {
  maxNewCardsPerDay: 20,
  maxReviewsPerDay: 200,
  learningSteps: [1, 10, 60, 1440],
  graduatingInterval: 1,
  easyIntervalMultiplier: 1.3,
  maximumInterval: 36500,
  reviewOrder: 'due-date',
  newCardIntroductionRate: 20,
};
```

You can modify these defaults if needed.

### Environment Variables

No additional environment variables are required. The system uses your existing:
- MongoDB connection string
- JWT authentication
- API base URL

---

## Verification

### Test Frontend

1. Start the frontend dev server:
```bash
cd frontend
npm run dev
```

2. Navigate to `/schedule` in your browser

3. You should see the Review Schedule page with 5 tabs

### Test Backend

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Test the API endpoints (using curl or Postman):

```bash
# Get calendar data (requires auth token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/schedule/calendar?start=2024-01-01&end=2024-01-31"

# Get forecast
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/schedule/forecast?days=7"
```

---

## Troubleshooting

### "react-calendar not found"

```bash
cd frontend
npm install react-calendar @types/react-calendar
```

### "Cannot find module './models/Card'"

Make sure the Card model file exists at:
`/backend/src/models/Card.ts`

### "scheduleStore is not defined"

Import it in your component:
```typescript
import { useScheduleStore } from '../stores/scheduleStore';
```

### Calendar shows no data

1. Ensure you have cards in the database
2. Check that cards have `nextReviewDate` set
3. Verify authentication is working
4. Check browser console for errors

### API returns 401 Unauthorized

1. Verify JWT token is valid
2. Check authentication middleware is applied
3. Ensure token is in Authorization header

### TypeScript errors

Run type checking:
```bash
cd frontend
npm run type-check
```

Fix any type errors that appear.

---

## File Checklist

Verify all files are in place:

### Frontend Files
- [ ] `/frontend/src/types/schedule.types.ts`
- [ ] `/frontend/src/stores/scheduleStore.ts`
- [ ] `/frontend/src/lib/srs/retentionCalculator.ts`
- [ ] `/frontend/src/pages/ReviewSchedule.tsx`
- [ ] `/frontend/src/components/flashcards/ReviewCalendar.tsx`
- [ ] `/frontend/src/components/flashcards/ReviewForecast.tsx`
- [ ] `/frontend/src/components/flashcards/ReviewHeatmap.tsx`
- [ ] `/frontend/src/components/flashcards/RetentionGraph.tsx`
- [ ] `/frontend/src/components/flashcards/ScheduleSettings.tsx`
- [ ] `/frontend/src/components/flashcards/DailyBreakdown.tsx`
- [ ] `/frontend/src/components/flashcards/StudyTimeAnalytics.tsx`
- [ ] `/frontend/src/components/flashcards/ManualReschedule.tsx`

### Backend Files
- [ ] `/backend/src/models/Card.ts`
- [ ] `/backend/src/services/scheduleService.ts`
- [ ] `/backend/src/controllers/scheduleController.ts`
- [ ] `/backend/src/routes/schedule.ts`

### Documentation Files
- [ ] `/REVIEW_SCHEDULE_GUIDE.md`
- [ ] `/IMPLEMENTATION_SUMMARY.md`
- [ ] `/INSTALLATION.md` (this file)

---

## Integration with Existing Features

### With SRS Store

The schedule system integrates with your existing SRS store. Ensure compatibility:

```typescript
// In scheduleStore.ts, it calls the existing API:
const response = await fetch('/api/flashcards', {
  headers: {
    Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
  },
});
```

### With Auth System

The schedule routes require authentication. They use your existing `authenticateToken` middleware:

```typescript
import { authenticateToken } from '../middleware/auth';

router.use(authenticateToken);
```

### With Card Review

When users complete reviews, ensure the Card model is updated:

```typescript
// After reviewing a card:
card.recordReview(quality, timeSpent, newDueDate, ...);
await card.save();
```

---

## Performance Optimization

### Frontend Caching

The schedule store persists data to localStorage:

```typescript
// Data is automatically cached
// Clear cache if needed:
localStorage.removeItem('schedule-storage');
```

### Backend Query Optimization

Indexes are created automatically. Monitor query performance:

```javascript
// In MongoDB
db.setProfilingLevel(2) // Log all queries
db.system.profile.find().limit(10).sort({ts: -1})
```

### Lazy Loading

Components are already optimized for lazy loading. If needed, add more:

```typescript
const ReviewSchedule = lazy(() => import('./pages/ReviewSchedule'));
```

---

## Production Deployment

### Build Frontend

```bash
cd frontend
npm run build
```

The schedule components will be included in the production build.

### Environment Considerations

1. **API URL**: Ensure production API URL is configured
2. **MongoDB**: Use production database connection
3. **Authentication**: JWT secret should be secure
4. **CORS**: Configure CORS for production domain

### CDN Assets

If using a CDN, ensure all chart assets are properly loaded:
- Recharts library
- react-calendar CSS
- Custom fonts

---

## Testing

### Manual Testing

1. **Calendar**
   - [ ] Click different months
   - [ ] Select a day
   - [ ] Verify counts match data

2. **Forecast**
   - [ ] Change forecast range
   - [ ] Export CSV
   - [ ] Check calculations

3. **Heatmap**
   - [ ] Change year
   - [ ] Verify activity colors
   - [ ] Check streak calculation

4. **Retention**
   - [ ] View retention curve
   - [ ] Check recommendations
   - [ ] Export data

5. **Settings**
   - [ ] Modify settings
   - [ ] Save changes
   - [ ] Verify persistence

### Automated Testing

Create tests for critical functionality:

```typescript
// Example test
describe('ReviewCalendar', () => {
  it('renders calendar with correct month', () => {
    render(<ReviewCalendar />);
    expect(screen.getByText(/January 2024/i)).toBeInTheDocument();
  });

  it('shows due cards on day click', async () => {
    render(<ReviewCalendar />);
    fireEvent.click(screen.getByText('15'));
    await waitFor(() => {
      expect(screen.getByText(/cards due/i)).toBeInTheDocument();
    });
  });
});
```

---

## Monitoring

### Track Usage

Monitor these metrics:
- API response times
- Database query performance
- User engagement with schedule features
- Error rates

### Logging

Add logging for important operations:

```typescript
// In scheduleController.ts
console.log(`User ${userId} accessed calendar for ${start} to ${end}`);
```

---

## Support

### Getting Help

If you encounter issues:

1. Check the REVIEW_SCHEDULE_GUIDE.md for user-facing issues
2. Review IMPLEMENTATION_SUMMARY.md for technical details
3. Check browser console for frontend errors
4. Check server logs for backend errors
5. Verify all files are in correct locations

### Common Issues

**Issue**: Components not rendering
**Solution**: Check import paths and ensure all dependencies installed

**Issue**: API calls failing
**Solution**: Verify authentication token and API endpoint URLs

**Issue**: Performance problems
**Solution**: Check database indexes and implement caching

---

## Next Steps

After installation:

1. ✅ Verify all components render correctly
2. ✅ Test all API endpoints
3. ✅ Create some test data (cards) if needed
4. ✅ Review the user guide (REVIEW_SCHEDULE_GUIDE.md)
5. ✅ Customize settings for your use case
6. ✅ Add navigation links in appropriate places
7. ✅ Train users on new features

---

## Rollback Plan

If you need to remove the schedule system:

### Frontend
1. Remove the route from routing configuration
2. Remove navigation links
3. Delete all schedule-related files
4. Uninstall react-calendar: `npm uninstall react-calendar @types/react-calendar`

### Backend
1. Remove schedule route from server.ts
2. Delete schedule controller, service, and routes
3. Optionally remove Card model if not needed

### Database
No schema changes required. Cards can remain in database.

---

## Success Criteria

You've successfully installed when:

- ✅ /schedule page loads without errors
- ✅ Calendar displays current month
- ✅ Forecast shows data (or empty state)
- ✅ Settings can be saved
- ✅ All tabs are accessible
- ✅ API endpoints respond correctly
- ✅ No console errors
- ✅ Mobile view is responsive

---

## Additional Resources

- **User Guide**: REVIEW_SCHEDULE_GUIDE.md
- **Technical Details**: IMPLEMENTATION_SUMMARY.md
- **API Documentation**: See controllers and routes files
- **Type Definitions**: schedule.types.ts

---

**Installation Date**: _____________
**Installed By**: _____________
**Version**: 1.0.0
**Status**: ⬜ Not Started | ⬜ In Progress | ⬜ Complete

---

Good luck with your installation! The Review Schedule & Calendar system will be a valuable addition to your learning platform.
