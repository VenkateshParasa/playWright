# Progress Tracking System - Developer Guide

## Quick Start

### Using Progress Components

```tsx
import {
  ProgressOverview,
  ModuleProgress,
  ProgressChart,
  Statistics,
  Milestones,
  ProgressReportComponent,
} from '@/components/progress';

// In your component
<ProgressOverview progress={overallProgress} trend={progressTrend} />
<ModuleProgress modules={moduleData} />
<ProgressChart data={timeSeriesData} type="line" title="Activity" />
<Statistics daily={dailyData} weekly={weeklyData} performance={metrics} />
<Milestones milestones={milestoneList} onCelebrate={handleCelebrate} />
<ProgressReportComponent report={report} onGenerateReport={handleGenerate} />
```

### Using Progress Utilities

```tsx
import {
  calculateOverallProgress,
  calculateMilestones,
  exportToPDF,
} from '@/lib/progress';

// Calculate progress
const overall = calculateOverallProgress(lessons, quizzes, exercises);

// Calculate milestones
const milestones = calculateMilestones(overall);

// Export report
exportToPDF(report, { format: 'pdf', includeCharts: true });
```

### Using Progress Store

```tsx
import { useProgressStore } from '@/stores/progressStore';

function MyComponent() {
  const {
    lessons,
    quizzes,
    exercises,
    overallProgress,
    currentStreak,
    markLessonComplete,
    addQuizAttempt,
    syncProgress,
  } = useProgressStore();

  // Mark lesson complete
  markLessonComplete('lesson-1');

  // Add quiz attempt
  addQuizAttempt('quiz-1', {
    score: 85,
    maxScore: 100,
    passed: true,
    completedAt: new Date().toISOString(),
    timeSpent: 300,
    answers: {},
  });

  // Sync with backend
  await syncProgress();
}
```

## API Usage

### Frontend API Calls

```tsx
// Fetch progress statistics
const response = await fetch('/api/progress', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
const data = await response.json();

// Sync progress
await fetch('/api/progress/sync', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify(progressData),
});

// Generate report
await fetch('/api/progress/report/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    startDate: '2026-01-01',
    endDate: '2026-02-17',
    format: 'pdf',
  }),
});
```

### Backend Implementation

```typescript
// In your route handler
import * as progressController from './controllers/progressController';

router.get('/api/progress', authenticate, progressController.getProgressStatistics);
router.post('/api/progress/sync', authenticate, progressController.syncProgress);
```

## Component Props

### ProgressOverview

```typescript
interface ProgressOverviewProps {
  progress: OverallProgress;
  trend?: ProgressTrend;
  className?: string;
}
```

### ModuleProgress

```typescript
interface ModuleProgressProps {
  modules: ModuleProgressData[];
  className?: string;
}
```

### ProgressChart

```typescript
interface ProgressChartProps {
  data: TimeSeriesData[] | CategoryProgress[];
  type: 'line' | 'bar' | 'area' | 'pie';
  title: string;
  description?: string;
  className?: string;
}
```

### Statistics

```typescript
interface StatisticsProps {
  daily: DailyProgress[];
  weekly: WeeklyProgress[];
  performance: PerformanceMetrics;
  className?: string;
}
```

### Milestones

```typescript
interface MilestonesProps {
  milestones: Milestone[];
  onCelebrate?: (milestone: Milestone) => void;
  className?: string;
}
```

## Type Definitions

### Core Types

```typescript
// Overall progress
interface OverallProgress {
  percentage: number;
  lessonsCompleted: number;
  totalLessons: number;
  quizzesPassed: number;
  totalQuizzes: number;
  exercisesCompleted: number;
  totalExercises: number;
  flashcardsReviewed: number;
  totalFlashcards: number;
  currentStreak: number;
  longestStreak: number;
  totalStudyTime: number;
  averageSessionTime: number;
  totalSessions: number;
  lastActivityDate: string;
}

// Module progress
interface ModuleProgressData {
  moduleId: string;
  moduleName: string;
  weekNumber: number;
  progress: number;
  lessonsCompleted: number;
  totalLessons: number;
  quizzesPassed: number;
  totalQuizzes: number;
  exercisesCompleted: number;
  totalExercises: number;
  timeSpent: number;
  startedAt?: string;
  completedAt?: string;
  isLocked: boolean;
  prerequisites: string[];
}

// Milestone
interface Milestone {
  id: string;
  title: string;
  description: string;
  category: MilestoneCategory;
  target: number;
  current: number;
  isCompleted: boolean;
  completedAt?: string;
  icon: string;
  color: string;
  reward?: MilestoneReward;
}
```

## Utility Functions

### Progress Calculations

```typescript
// Calculate overall progress
calculateOverallProgress(
  lessons: Record<string, LessonProgress>,
  quizzes: Record<string, QuizAttempt[]>,
  exercises: Record<string, ExerciseProgress>,
  flashcardsReviewed?: number,
  totalFlashcards?: number
): OverallProgress

// Calculate module progress
calculateModuleProgress(
  moduleId: string,
  moduleName: string,
  weekNumber: number,
  lessons: LessonProgress[],
  quizzes: QuizAttempt[][],
  exercises: ExerciseProgress[],
  prerequisites?: string[]
): ModuleProgressData

// Format study time
formatStudyTime(seconds: number): string // Returns "2h 30m"
formatDetailedStudyTime(seconds: number): string // Returns "2 hours 30 minutes"
```

### Milestone Functions

```typescript
// Calculate all milestones
calculateMilestones(progress: OverallProgress): Milestone[]

// Get milestone progress percentage
getMilestoneProgress(milestone: Milestone): number

// Get celebration message
getCelebrationMessage(milestone: Milestone): string

// Get motivation text
getMilestoneMotivation(milestone: Milestone): string
```

### Export Functions

```typescript
// Export to CSV
exportToCSV(data: ProgressStatistics, filename?: string): void

// Export to JSON
exportToJSON(data: ProgressStatistics, filename?: string): void

// Export to PDF
exportToPDF(report: ProgressReport, options: ProgressExportOptions): void

// Generate report
generateProgressReport(
  statistics: ProgressStatistics,
  user: { name: string; email: string; learningTrack: '30-day' | '60-day' },
  periodStart: string,
  periodEnd: string
): ProgressReport
```

## Customization

### Custom Milestones

```typescript
// Add to milestones.ts
const customMilestone: Omit<Milestone, 'current' | 'isCompleted' | 'completedAt'> = {
  id: 'custom-1',
  title: 'Speed Learner',
  description: 'Complete 10 lessons in one day',
  category: 'lessons',
  target: 10,
  icon: '⚡',
  color: '#FFEB3B',
  reward: {
    type: 'badge',
    value: 'speed-learner',
    description: 'Awarded for rapid learning',
  },
};
```

### Custom Chart

```tsx
<ProgressChart
  data={customData}
  type="line"
  title="Custom Metric"
  description="Track custom learning metric"
/>
```

### Custom Export Format

```typescript
// Extend exportUtils.ts
export const exportToXML = (data: ProgressStatistics, filename: string) => {
  // Implementation
};
```

## Best Practices

1. **Always use TypeScript types** for type safety
2. **Calculate progress on-demand** rather than storing calculated values
3. **Use Zustand store** for progress state management
4. **Sync regularly** but not on every action (use debouncing)
5. **Handle errors gracefully** with toast notifications
6. **Show loading states** during calculations
7. **Optimize for performance** with memoization
8. **Make components responsive** with Tailwind breakpoints
9. **Add animations** with Framer Motion for better UX
10. **Test thoroughly** with various data scenarios

## Troubleshooting

### Progress not updating
- Check if store is properly initialized
- Verify sync function is being called
- Check browser console for errors
- Ensure backend API is responding

### Charts not rendering
- Verify data format matches chart type
- Check if Recharts is properly imported
- Ensure data is not empty
- Verify parent container has height

### Export not working
- Check if user has necessary permissions
- Verify data is complete
- Test with smaller datasets first
- Check browser download settings

### Milestones not calculating
- Verify progress data is correct
- Check milestone target values
- Ensure current values are updating
- Test milestone calculation function independently

## Performance Tips

1. Use `React.memo()` for expensive components
2. Implement virtual scrolling for large lists
3. Debounce sync operations
4. Lazy load chart libraries
5. Cache calculated values when appropriate
6. Use Web Workers for heavy calculations
7. Optimize images and assets
8. Implement pagination for large datasets

## Security Considerations

1. Always authenticate API requests
2. Validate user input on backend
3. Sanitize exported data
4. Use CSRF protection
5. Implement rate limiting
6. Validate date ranges
7. Check user permissions
8. Prevent XSS in reports

## Support

For issues or questions:
1. Check this guide first
2. Review the implementation summary
3. Check TypeScript type definitions
4. Look at component examples
5. Contact the development team

---

**Last Updated**: February 17, 2026
**Version**: 1.0.0
