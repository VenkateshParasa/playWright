/**
 * Dashboard Component Showcase
 *
 * This file demonstrates all dashboard components with their props
 * and can be used as a reference for implementation.
 */

import WelcomeCard from '../components/dashboard/WelcomeCard';
import ProgressOverview from '../components/dashboard/ProgressOverview';
import StreakCounter from '../components/dashboard/StreakCounter';
import UpcomingReviews from '../components/dashboard/UpcomingReviews';
import RecentAchievements from '../components/dashboard/RecentAchievements';
import StudyTimeChart from '../components/dashboard/StudyTimeChart';
import QuickActions from '../components/dashboard/QuickActions';

// Example props for each component
const showcaseData = {
  // WelcomeCard example
  welcomeCard: {
    userName: "John Doe",
    learningTrack: "30-day" as const,
    currentDay: 5,
    isLoading: false,
  },

  // ProgressOverview example
  progressOverview: {
    overallProgress: 35,
    currentWeek: 1,
    totalWeeks: 4,
    lessonsCompleted: 7,
    totalLessons: 20,
    isLoading: false,
  },

  // StreakCounter example
  streakCounter: {
    currentStreak: 5,
    longestStreak: 12,
    isLoading: false,
  },

  // UpcomingReviews example
  upcomingReviews: {
    totalDueToday: 15,
    totalDueTomorrow: 8,
    upcomingReviews: [
      {
        id: '1',
        title: 'Playwright Selectors',
        dueTime: new Date(new Date().setHours(14, 0, 0)),
        category: 'Fundamentals',
      },
      {
        id: '2',
        title: 'Test Assertions',
        dueTime: new Date(new Date().setHours(15, 30, 0)),
        category: 'Best Practices',
      },
      {
        id: '3',
        title: 'Page Object Model',
        dueTime: new Date(new Date().setHours(17, 0, 0)),
        category: 'Design Patterns',
      },
    ],
    isLoading: false,
  },

  // RecentAchievements example
  recentAchievements: {
    achievements: [
      {
        id: '1',
        title: 'First Steps',
        description: 'Completed your first lesson',
        icon: 'star' as const,
        color: 'blue',
        earnedAt: new Date('2024-02-15'),
      },
      {
        id: '2',
        title: 'Quick Learner',
        description: 'Completed 5 lessons in one day',
        icon: 'zap' as const,
        color: 'gold',
        earnedAt: new Date('2024-02-14'),
      },
      {
        id: '3',
        title: 'Consistent',
        description: 'Maintained a 5-day learning streak',
        icon: 'award' as const,
        color: 'purple',
        earnedAt: new Date('2024-02-13'),
      },
    ],
    totalAchievements: 8,
    isLoading: false,
  },

  // StudyTimeChart example
  studyTimeChart: {
    data: [
      { day: 'Mon', minutes: 45, lessons: 2 },
      { day: 'Tue', minutes: 60, lessons: 3 },
      { day: 'Wed', minutes: 30, lessons: 1 },
      { day: 'Thu', minutes: 75, lessons: 4 },
      { day: 'Fri', minutes: 50, lessons: 2 },
      { day: 'Sat', minutes: 90, lessons: 5 },
      { day: 'Sun', minutes: 40, lessons: 2 },
    ],
    isLoading: false,
  },

  // QuickActions example
  quickActions: {
    nextLessonId: 'lesson-8',
    nextLessonTitle: 'Advanced Locators in Playwright',
    reviewsAvailable: 15,
    exercisesAvailable: 3,
    isLoading: false,
  },
};

/**
 * Component Usage Examples
 */

// 1. WelcomeCard
// Shows personalized greeting and learning track info
const WelcomeCardExample = () => (
  <WelcomeCard
    userName={showcaseData.welcomeCard.userName}
    learningTrack={showcaseData.welcomeCard.learningTrack}
    currentDay={showcaseData.welcomeCard.currentDay}
  />
);

// 2. ProgressOverview
// Displays overall progress and completion metrics
const ProgressOverviewExample = () => (
  <ProgressOverview
    overallProgress={showcaseData.progressOverview.overallProgress}
    currentWeek={showcaseData.progressOverview.currentWeek}
    totalWeeks={showcaseData.progressOverview.totalWeeks}
    lessonsCompleted={showcaseData.progressOverview.lessonsCompleted}
    totalLessons={showcaseData.progressOverview.totalLessons}
  />
);

// 3. StreakCounter
// Shows learning streak with motivational elements
const StreakCounterExample = () => (
  <StreakCounter
    currentStreak={showcaseData.streakCounter.currentStreak}
    longestStreak={showcaseData.streakCounter.longestStreak}
  />
);

// 4. UpcomingReviews
// Lists upcoming SRS reviews
const UpcomingReviewsExample = () => (
  <UpcomingReviews
    totalDueToday={showcaseData.upcomingReviews.totalDueToday}
    totalDueTomorrow={showcaseData.upcomingReviews.totalDueTomorrow}
    upcomingReviews={showcaseData.upcomingReviews.upcomingReviews}
  />
);

// 5. RecentAchievements
// Displays recently earned achievement badges
const RecentAchievementsExample = () => (
  <RecentAchievements
    achievements={showcaseData.recentAchievements.achievements}
    totalAchievements={showcaseData.recentAchievements.totalAchievements}
  />
);

// 6. StudyTimeChart
// Visualizes study time over the last 7 days
const StudyTimeChartExample = () => (
  <StudyTimeChart data={showcaseData.studyTimeChart.data} />
);

// 7. QuickActions
// Provides quick navigation to key features
const QuickActionsExample = () => (
  <QuickActions
    nextLessonId={showcaseData.quickActions.nextLessonId}
    nextLessonTitle={showcaseData.quickActions.nextLessonTitle}
    reviewsAvailable={showcaseData.quickActions.reviewsAvailable}
    exercisesAvailable={showcaseData.quickActions.exercisesAvailable}
  />
);

/**
 * Full Dashboard Layout Example
 */
const DashboardLayoutExample = () => (
  <div className="space-y-6">
    {/* Welcome Section - Full Width */}
    <WelcomeCard {...showcaseData.welcomeCard} />

    {/* Main Grid - 3 columns on large screens */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ProgressOverview {...showcaseData.progressOverview} />
      <StreakCounter {...showcaseData.streakCounter} />
      <QuickActions {...showcaseData.quickActions} />
    </div>

    {/* Charts and Reviews - 2 columns on large screens */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <StudyTimeChart {...showcaseData.studyTimeChart} />
      <UpcomingReviews {...showcaseData.upcomingReviews} />
    </div>

    {/* Recent Achievements - Full Width */}
    <RecentAchievements {...showcaseData.recentAchievements} />
  </div>
);

/**
 * Loading States Example
 */
import {
  WelcomeCardSkeleton,
  ProgressOverviewSkeleton,
  StreakCounterSkeleton,
  UpcomingReviewsSkeleton,
  RecentAchievementsSkeleton,
  StudyTimeChartSkeleton,
  QuickActionsSkeleton,
  DashboardSkeleton,
} from '../components/dashboard/SkeletonLoaders';

const LoadingStatesExample = () => (
  <div className="space-y-6">
    {/* Individual loading states */}
    <WelcomeCardSkeleton />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ProgressOverviewSkeleton />
      <StreakCounterSkeleton />
      <QuickActionsSkeleton />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <StudyTimeChartSkeleton />
      <UpcomingReviewsSkeleton />
    </div>
    <RecentAchievementsSkeleton />

    {/* Or use the full dashboard skeleton */}
    {/* <DashboardSkeleton /> */}
  </div>
);

/**
 * API Integration Example
 */
const fetchDashboardData = async () => {
  try {
    // Replace with your actual API endpoint
    const response = await fetch('/api/dashboard');

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard data');
    }

    const data = await response.json();

    // Expected data structure matches DashboardData type
    return {
      user: data.user,
      progress: data.progress,
      streak: data.streak,
      reviews: data.reviews,
      achievements: data.achievements,
      totalAchievements: data.totalAchievements,
      studyTime: data.studyTime,
      quickActions: data.quickActions,
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

/**
 * Error Handling Example
 */
const DashboardWithErrorHandling = () => {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const dashboardData = await fetchDashboardData();
        setData(dashboardData);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data available</div>;

  return (
    <div className="space-y-6">
      <WelcomeCard {...data.user} />
      {/* ... rest of the dashboard components */}
    </div>
  );
};

export {
  showcaseData,
  WelcomeCardExample,
  ProgressOverviewExample,
  StreakCounterExample,
  UpcomingReviewsExample,
  RecentAchievementsExample,
  StudyTimeChartExample,
  QuickActionsExample,
  DashboardLayoutExample,
  LoadingStatesExample,
  fetchDashboardData,
  DashboardWithErrorHandling,
};
