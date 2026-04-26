/**
 * Dashboard Component Showcase
 *
 * This file demonstrates all dashboard components with their props
 * and can be used as a reference for implementation.
 */

import { useMemo } from 'react';
import WelcomeCard from '../components/dashboard/WelcomeCard';
import ProgressOverview from '../components/dashboard/ProgressOverview';
import StreakCounter from '../components/dashboard/StreakCounter';
import UpcomingReviews from '../components/dashboard/UpcomingReviews';
import RecentAchievements from '../components/dashboard/RecentAchievements';
import StudyTimeChart from '../components/dashboard/StudyTimeChart';
import QuickActions from '../components/dashboard/QuickActions';
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
import { useProgressStore, getTotalCompletedLessons } from '../stores/progressStore';
import { useAuthStore } from '../stores/authStore';
import { useLessonsStore } from '../stores/lessonsStore';
import { useAchievementsStore } from '../stores/achievementsStore';
import { useSRSStore } from '../stores/srsStore';
import { useExerciseStore } from '../stores/exerciseStore';

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
    nextLessonId: 'pw-beginner-008',
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
 * Full Dashboard Layout Example — uses real store data
 */
const DashboardLayoutExample = () => {
  const { user } = useAuthStore();
  const { lessons: progressLessons, currentStreak, longestStreak, overallProgress } = useProgressStore();
  const { lessons } = useLessonsStore();
  const { achievements } = useAchievementsStore();
  const { dueCards, cards, reviews } = useSRSStore();
  const { progress: exerciseProgress, exercises: allExercises } = useExerciseStore();

  const data = useMemo(() => {
    const completedLessons = getTotalCompletedLessons();
    const totalLessons = lessons.length || 20;
    const currentWeek = Math.ceil(completedLessons / 5) || 1;
    const totalWeeks = Math.ceil(totalLessons / 5) || 4;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const dueTomorrowCount = Object.entries(reviews).filter(([_, r]: any) =>
      r.nextReviewDate?.split('T')[0] === tomorrowStr
    ).length;

    const upcomingReviewsList = dueCards.slice(0, 3).map((cardId: string) => {
      const card = cards[cardId] as any;
      const review = reviews[cardId] as any;
      return {
        id: cardId,
        title: card?.front || 'Flashcard',
        dueTime: review?.nextReviewDate ? new Date(review.nextReviewDate) : new Date(),
        category: card?.tags?.[0] || 'General',
      };
    });

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dayLessons = Object.values(progressLessons).filter((lesson: any) => {
        if (!lesson.completedAt) return false;
        return new Date(lesson.completedAt).toDateString() === date.toDateString();
      }) as any[];
      return {
        day: dayName,
        minutes: dayLessons.reduce((sum: number, l: any) => sum + (l.timeSpent / 60), 0),
        lessons: dayLessons.length,
      };
    });

    const nextLesson = lessons.find((l: any) => l.status === 'available' || l.status === 'in-progress');
    const completedExercises = Object.values(exerciseProgress).filter((p: any) => p.completed).length;

    const recentAchievements = achievements
      .filter((a: any) => a.unlocked)
      .slice(0, 3)
      .map((a: any) => ({
        id: a.id,
        title: a.name,
        description: a.description,
        icon: (a.icon?.includes('⚡') ? 'zap' : a.icon?.includes('⭐') || a.icon?.includes('🌟') ? 'star' : 'award') as 'star' | 'zap' | 'award',
        color: a.category || 'blue',
        earnedAt: a.unlockedAt || new Date(),
      }));

    const fallbackAchievements = showcaseData.recentAchievements.achievements;

    return {
      user: { name: user?.fullName || user?.firstName || 'User', learningTrack: '30-day' as const, currentDay: completedLessons + 1 },
      progress: { overallProgress: overallProgress || Math.round((completedLessons / totalLessons) * 100), currentWeek, totalWeeks, lessonsCompleted: completedLessons, totalLessons },
      streak: { currentStreak: currentStreak || 0, longestStreak: longestStreak || 0 },
      reviews: { totalDueToday: dueCards.length, totalDueTomorrow: dueTomorrowCount, upcomingReviews: upcomingReviewsList },
      achievements: recentAchievements.length > 0 ? recentAchievements : fallbackAchievements,
      totalAchievements: achievements.length || 0,
      studyTime: last7Days,
      quickActions: {
        nextLessonId: nextLesson?.id || 'pw-beginner-001',
        nextLessonTitle: nextLesson?.title || 'Start Your First Lesson',
        reviewsAvailable: dueCards.length,
        exercisesAvailable: allExercises.length - completedExercises,
      },
    };
  }, [user, progressLessons, currentStreak, longestStreak, overallProgress, lessons, achievements, dueCards, cards, reviews, exerciseProgress, allExercises]);

  return (
    <div className="space-y-6">
      <WelcomeCard userName={data.user.name} learningTrack={data.user.learningTrack} currentDay={data.user.currentDay} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ProgressOverview {...data.progress} />
        <StreakCounter {...data.streak} />
        <QuickActions {...data.quickActions} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StudyTimeChart data={data.studyTime} />
        <UpcomingReviews {...data.reviews} />
      </div>
      <RecentAchievements achievements={data.achievements} totalAchievements={data.totalAchievements} />
    </div>
  );
};

/**
 * Loading States Example
 */
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
