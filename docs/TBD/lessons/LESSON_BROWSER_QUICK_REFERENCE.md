# Lesson Browser - Quick Reference Guide

## Quick Start

### 1. Import the main page
```tsx
import Lessons from './pages/Lessons';

// In your router
<Route path="/lessons" element={<Lessons />} />
```

### 2. Use the store anywhere
```tsx
import { useLessonsStore } from './stores/lessonsStore';

function MyComponent() {
  const {
    filteredLessons,
    filters,
    stats,
    setFilters,
    markLessonComplete
  } = useLessonsStore();

  return <div>Total: {stats.totalLessons}</div>;
}
```

### 3. Use individual components
```tsx
import { LessonCard, ProgressBadge } from './components/lessons';

<LessonCard lesson={myLesson} />
<ProgressBadge status="completed" />
```

## Component API Reference

### LessonCard
```tsx
<LessonCard
  lesson={Lesson}           // Required: Lesson object
  onClick={() => void}      // Optional: Click handler
  className="..."           // Optional: Additional classes
/>
```

### CompactLessonCard
```tsx
<CompactLessonCard
  lesson={Lesson}
  onClick={() => void}
  className="..."
/>
```

### ProgressBadge
```tsx
<ProgressBadge
  status="completed" | "in-progress" | "locked" | "available"
  progress={number}         // Optional: 0-100
  size="sm" | "md" | "lg"  // Optional: Default md
  showLabel={boolean}       // Optional: Default true
  className="..."
/>
```

### ProgressIndicator
```tsx
<ProgressIndicator
  progress={number}         // Required: 0-100
  status={LessonStatus}     // Required
  showPercentage={boolean}  // Optional: Default true
  size="sm" | "md" | "lg"  // Optional: Default md
  className="..."
/>
```

### LessonSearch
```tsx
<LessonSearch
  onSearch={(query: string) => void}  // Required
  placeholder="..."                    // Optional
  debounceMs={number}                 // Optional: Default 300
  initialValue="..."                  // Optional
  className="..."
/>
```

### LessonFilters
```tsx
<LessonFilters
  filters={LessonFilters}              // Required
  onFilterChange={(filters) => void}   // Required
  totalResults={number}                // Required
  className="..."
/>
```

### ActiveFiltersBar
```tsx
<ActiveFiltersBar
  filters={LessonFilters}              // Required
  onFilterChange={(filters) => void}   // Required
  className="..."
/>
```

### LessonList
```tsx
<LessonList
  lessons={Lesson[]}                   // Required
  viewMode="grid" | "list" | "grouped" // Optional: Default grid
  onLessonClick={(lesson) => void}     // Optional
  className="..."
/>
```

## Store API Reference

### State
```tsx
{
  lessons: Lesson[];          // All lessons
  filters: LessonFilters;     // Current filters
  viewMode: ViewMode;         // Current view mode
  isLoading: boolean;         // Loading state
  error: string | null;       // Error message
  filteredLessons: Lesson[];  // Computed: Filtered lessons
  stats: LessonStats;         // Computed: Statistics
}
```

### Actions
```tsx
{
  setFilters: (filters: LessonFilters) => void;
  updateFilter: (key: keyof LessonFilters, value: any) => void;
  clearFilters: () => void;
  setViewMode: (mode: ViewMode) => void;
  setSearchQuery: (query: string) => void;
  fetchLessons: () => Promise<void>;
  updateLessonProgress: (lessonId: string, progress: number) => void;
  markLessonComplete: (lessonId: string) => void;
  startLesson: (lessonId: string) => void;
}
```

### Selectors
```tsx
import { selectFilteredLessons, selectStats, selectFilters } from './stores/lessonsStore';

const filteredLessons = useLessonsStore(selectFilteredLessons);
const stats = useLessonsStore(selectStats);
const filters = useLessonsStore(selectFilters);
```

## Type Reference

### Lesson
```tsx
interface Lesson {
  id: string;
  title: string;
  description: string;
  track: '30-day' | '60-day' | 'both';
  week: number;
  module: number;
  order: number;
  status: 'completed' | 'in-progress' | 'locked' | 'available';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number;  // minutes
  completedAt?: Date;
  startedAt?: Date;
  progress: number;           // 0-100
  tags: LessonTag[];
  prerequisites: Prerequisite[];
  topics: string[];
  learningObjectives: string[];
  thumbnail?: string;
}
```

### LessonFilters
```tsx
interface LessonFilters {
  track: LessonTrack | 'all';
  difficulty: DifficultyLevel | 'all';
  status: LessonStatus | 'all';
  week: number | 'all';
  tags: string[];
  searchQuery: string;
  sortBy: 'order' | 'difficulty' | 'duration' | 'title';
  sortOrder: 'asc' | 'desc';
}
```

### LessonStats
```tsx
interface LessonStats {
  totalLessons: number;
  completedLessons: number;
  inProgressLessons: number;
  lockedLessons: number;
  averageProgress: number;
  totalTimeSpent: number;
}
```

## Common Use Cases

### Filter by track
```tsx
const { updateFilter } = useLessonsStore();
updateFilter('track', '30-day');
```

### Search lessons
```tsx
const { setSearchQuery } = useLessonsStore();
setSearchQuery('playwright');
```

### Mark lesson complete
```tsx
const { markLessonComplete } = useLessonsStore();
markLessonComplete('lesson-1');
```

### Get specific lesson
```tsx
import { getLessonById } from './data/mockLessons';
const lesson = getLessonById('lesson-1');
```

### Filter by multiple criteria
```tsx
const { setFilters } = useLessonsStore();
setFilters({
  track: '30-day',
  difficulty: 'beginner',
  status: 'available',
  week: 1,
  tags: ['fundamentals'],
  searchQuery: '',
  sortBy: 'order',
  sortOrder: 'asc',
});
```

### Update lesson progress
```tsx
const { updateLessonProgress } = useLessonsStore();
updateLessonProgress('lesson-3', 75);  // 75% complete
```

## Keyboard Shortcuts

- `Cmd/Ctrl + K` - Focus search bar
- `Escape` - Clear search (when focused)

## Styling

All components use Tailwind CSS with consistent color schemes:
- Blue: Primary actions, available lessons
- Green: Completed state
- Yellow: In-progress state
- Purple: Alternative highlighting
- Gray: Locked/disabled state
- Red: Errors

## Performance Tips

1. Virtual scrolling activates automatically at 50+ lessons
2. Search is debounced (300ms) to reduce re-renders
3. Filter state persists in localStorage
4. Use selectors for optimal re-render performance
5. Skeleton loaders prevent layout shift

## Troubleshooting

### Filters not persisting
Check localStorage is enabled and not full:
```tsx
localStorage.getItem('lessons-storage');
```

### Virtual scrolling not working
Ensure you have 50+ lessons in the list

### Search not working
Verify debounce delay is appropriate for your use case:
```tsx
<LessonSearch debounceMs={500} />  // Increase delay
```

### Components not updating
Make sure you're using the store correctly:
```tsx
// ✅ Correct
const filteredLessons = useLessonsStore(selectFilteredLessons);

// ❌ Incorrect
const filteredLessons = useLessonsStore.getState().filteredLessons;
```

## Migration from Mock to API

Replace fetchLessons in store:
```tsx
fetchLessons: async () => {
  set({ isLoading: true, error: null });
  try {
    const response = await fetch('/api/lessons');
    const data = await response.json();
    set({ lessons: data, isLoading: false });
  } catch (error) {
    set({ error: 'Failed to fetch lessons', isLoading: false });
  }
}
```

## Testing

Example test for LessonCard:
```tsx
import { render, screen } from '@testing-library/react';
import { LessonCard } from './components/lessons';
import { mockLessons } from './data/mockLessons';

test('renders lesson card', () => {
  render(<LessonCard lesson={mockLessons[0]} />);
  expect(screen.getByText(mockLessons[0].title)).toBeInTheDocument();
});
```
