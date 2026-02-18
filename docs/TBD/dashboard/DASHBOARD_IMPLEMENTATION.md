# Dashboard Implementation

This document describes the Dashboard implementation for the Playwright & Selenium Learning Platform, based on section 2.1 of FEATURES_IMPLEMENTATION.md.

## Overview

The Dashboard provides a comprehensive overview of the user's learning journey, including progress tracking, upcoming reviews, achievements, and quick actions.

## Components

### 1. WelcomeCard
**Location:** `/frontend/src/components/dashboard/WelcomeCard.tsx`

Displays a personalized greeting with:
- Time-based greeting (Good morning/afternoon/evening)
- User name
- Current learning track (30-day or 60-day)
- Current day indicator
- Gradient background with blue theme

**Props:**
```typescript
{
  userName: string;
  learningTrack: '30-day' | '60-day';
  currentDay: number;
  isLoading?: boolean;
}
```

### 2. ProgressOverview
**Location:** `/frontend/src/components/dashboard/ProgressOverview.tsx`

Shows overall learning progress with:
- Overall progress percentage with animated progress bar
- Current week indicator out of total weeks
- Lessons completed counter with percentage
- Visual indicators using icons and color-coded sections

**Props:**
```typescript
{
  overallProgress: number;
  currentWeek: number;
  totalWeeks: number;
  lessonsCompleted: number;
  totalLessons: number;
  isLoading?: boolean;
}
```

### 3. StreakCounter
**Location:** `/frontend/src/components/dashboard/StreakCounter.tsx`

Tracks daily learning streaks with:
- Current streak with fire icon
- Longest streak record
- Dynamic color coding (7+ days gets special highlighting)
- Motivational messages based on streak length
- Visual flame icon that changes color with streak

**Props:**
```typescript
{
  currentStreak: number;
  longestStreak: number;
  isLoading?: boolean;
}
```

### 4. UpcomingReviews
**Location:** `/frontend/src/components/dashboard/UpcomingReviews.tsx`

Displays upcoming SRS (Spaced Repetition System) reviews:
- Due today count (urgent, highlighted in purple)
- Due tomorrow count
- Next 3 upcoming reviews with time and category
- Empty state when no reviews are due
- Review counter if more reviews exist

**Props:**
```typescript
{
  totalDueToday: number;
  totalDueTomorrow: number;
  upcomingReviews: Review[];
  isLoading?: boolean;
}
```

### 5. RecentAchievements
**Location:** `/frontend/src/components/dashboard/RecentAchievements.tsx`

Shows recently earned achievements:
- Up to 3 recent achievement badges
- Total achievement count
- Custom icons (award, trophy, star, zap)
- Color-coded badges (gold, silver, bronze, blue, purple, green)
- Earned date for each achievement
- View all button when more than 3 exist

**Props:**
```typescript
{
  achievements: Achievement[];
  totalAchievements: number;
  isLoading?: boolean;
}
```

### 6. StudyTimeChart
**Location:** `/frontend/src/components/dashboard/StudyTimeChart.tsx`

Visualizes study time over the last 7 days using Recharts:
- Bar chart showing minutes studied per day
- Stats summary: total time, daily average, total lessons
- Custom tooltip with detailed information
- Responsive design
- Motivational message for consistent learners (30+ min average)

**Props:**
```typescript
{
  data: StudyData[];
  isLoading?: boolean;
}
```

**Dependencies:**
- recharts (for chart rendering)

### 7. QuickActions
**Location:** `/frontend/src/components/dashboard/QuickActions.tsx`

Provides quick navigation to key learning activities:
- Continue Learning (next lesson)
- Review Flashcards (with count badge)
- Practice Exercises (with count badge)
- Additional quick links (View Progress, Browse Lessons)
- Color-coded action cards with hover effects
- Navigation integration with React Router

**Props:**
```typescript
{
  nextLessonId?: string;
  nextLessonTitle?: string;
  reviewsAvailable: number;
  exercisesAvailable: number;
  isLoading?: boolean;
}
```

### 8. SkeletonLoaders
**Location:** `/frontend/src/components/dashboard/SkeletonLoaders.tsx`

Provides loading states for all dashboard components:
- Individual skeleton loaders for each component
- `DashboardSkeleton` for full page loading
- Animated pulse effect
- Matches component structure for seamless loading experience

## Layout

The Dashboard uses a responsive grid layout:

### Desktop (lg screens)
```
┌─────────────────────────────────────────────┐
│           WelcomeCard (Full Width)          │
├───────────────┬───────────────┬─────────────┤
│   Progress    │    Streak     │    Quick    │
│   Overview    │   Counter     │   Actions   │
├───────────────┴───────────────┴─────────────┤
│    StudyTimeChart     │   UpcomingReviews   │
├───────────────────────┴─────────────────────┤
│       RecentAchievements (Full Width)       │
└─────────────────────────────────────────────┘
```

### Tablet (md screens)
- Top row: 2 columns
- Charts: 2 columns
- Achievements: Full width

### Mobile (sm screens)
- All components stack vertically (1 column)

## Data Flow

### Mock Data
The Dashboard currently uses mock data defined in `Dashboard.tsx`. This includes:
- User information
- Progress metrics
- Streak data
- Upcoming reviews
- Achievements
- Study time history
- Quick action data

### Future Implementation
Replace mock data with API calls:
```typescript
const response = await fetch('/api/dashboard');
const data = await response.json();
setDashboardData(data);
```

## Features Implemented

✅ All features from section 2.1 of FEATURES_IMPLEMENTATION.md:
- Welcome message with user name
- Current learning track display (30-day/60-day)
- Overall progress percentage
- Current day/week indicator
- Next lesson preview (in QuickActions)
- Upcoming SRS reviews count
- Recent achievements/badges
- Daily streak counter
- Study time statistics
- Quick action buttons (Continue Learning, Review Cards)

## Technical Stack

- **React 18**: Component library
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling and responsive design
- **Recharts**: Chart visualization
- **Lucide React**: Icon library
- **date-fns**: Date formatting
- **React Router**: Navigation

## Responsive Design

The Dashboard is fully responsive with breakpoints:
- **Mobile**: < 768px (1 column)
- **Tablet**: 768px - 1024px (2 columns)
- **Desktop**: > 1024px (3 columns for main grid)

All components use Tailwind's responsive utilities:
- `sm:` - Small screens (640px+)
- `md:` - Medium screens (768px+)
- `lg:` - Large screens (1024px+)
- `xl:` - Extra large screens (1280px+)

## Accessibility

- Semantic HTML structure
- ARIA labels where appropriate
- Color contrast ratios meet WCAG AA standards
- Keyboard navigation support
- Screen reader friendly

## Performance

- Lazy loading with skeleton states
- Optimized re-renders with proper prop passing
- Responsive images and icons
- Efficient chart rendering with Recharts
- CSS animations using Tailwind's built-in utilities

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live data
2. **Customization**: Allow users to rearrange dashboard widgets
3. **More Charts**: Add progress over time, quiz scores, etc.
4. **Filters**: Date range selectors for study time chart
5. **Export**: Download progress reports as PDF
6. **Notifications**: In-app notifications for upcoming reviews
7. **Dark Mode**: Theme switching capability
8. **Animation**: Enhanced transitions and micro-interactions

## File Structure

```
frontend/src/
├── components/dashboard/
│   ├── index.ts                    # Barrel export
│   ├── WelcomeCard.tsx
│   ├── ProgressOverview.tsx
│   ├── StreakCounter.tsx
│   ├── UpcomingReviews.tsx
│   ├── RecentAchievements.tsx
│   ├── StudyTimeChart.tsx
│   ├── QuickActions.tsx
│   └── SkeletonLoaders.tsx
├── pages/
│   └── Dashboard.tsx               # Main dashboard page
└── types/
    └── dashboard.ts                # TypeScript type definitions
```

## Usage Example

```tsx
import Dashboard from './pages/Dashboard';

// In your router configuration
<Route path="/" element={<Dashboard />} />
```

## Testing

To test the Dashboard:

1. **Development Server**:
   ```bash
   cd frontend
   npm run dev
   ```

2. **Type Check**:
   ```bash
   npm run type-check
   ```

3. **Navigate to**:
   ```
   http://localhost:5173/
   ```

## API Integration Notes

When integrating with a backend API, the expected data structure should match the types defined in `/frontend/src/types/dashboard.ts`.

Example API endpoint structure:
```
GET /api/dashboard
Response: DashboardData
```

## Styling Customization

The Dashboard uses Tailwind CSS utility classes. To customize:

1. **Colors**: Modify Tailwind config in `tailwind.config.js`
2. **Spacing**: Adjust gap and padding values in component files
3. **Typography**: Change font sizes and weights using Tailwind classes
4. **Animations**: Customize transition and animation classes

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari, Chrome Android

## License

Part of the Playwright & Selenium Learning Platform project.
