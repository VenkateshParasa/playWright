import { useState, useEffect } from 'react';
import WelcomeCard from '../components/dashboard/WelcomeCard';
import ProgressOverview from '../components/dashboard/ProgressOverview';
import StreakCounter from '../components/dashboard/StreakCounter';
import UpcomingReviews from '../components/dashboard/UpcomingReviews';
import RecentAchievements from '../components/dashboard/RecentAchievements';
import StudyTimeChart from '../components/dashboard/StudyTimeChart';
import QuickActions from '../components/dashboard/QuickActions';
import { DashboardSkeleton } from '../components/dashboard/SkeletonLoaders';

// Mock data - Replace with API calls in production
const mockDashboardData = {
  user: {
    name: 'John Doe',
    learningTrack: '30-day' as const,
    currentDay: 5,
  },
  progress: {
    overallProgress: 35,
    currentWeek: 1,
    totalWeeks: 4,
    lessonsCompleted: 7,
    totalLessons: 20,
  },
  streak: {
    currentStreak: 5,
    longestStreak: 12,
  },
  reviews: {
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
  },
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
  studyTime: [
    { day: 'Mon', minutes: 45, lessons: 2 },
    { day: 'Tue', minutes: 60, lessons: 3 },
    { day: 'Wed', minutes: 30, lessons: 1 },
    { day: 'Thu', minutes: 75, lessons: 4 },
    { day: 'Fri', minutes: 50, lessons: 2 },
    { day: 'Sat', minutes: 90, lessons: 5 },
    { day: 'Sun', minutes: 40, lessons: 2 },
  ],
  quickActions: {
    nextLessonId: 'lesson-8',
    nextLessonTitle: 'Advanced Locators in Playwright',
    reviewsAvailable: 15,
    exercisesAvailable: 3,
  },
};

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(mockDashboardData);

  useEffect(() => {
    // Simulate API call
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/dashboard');
        // const data = await response.json();
        // setDashboardData(data);

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setDashboardData(mockDashboardData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <WelcomeCard
        userName={dashboardData.user.name}
        learningTrack={dashboardData.user.learningTrack}
        currentDay={dashboardData.user.currentDay}
      />

      {/* Main Grid - 3 columns on large screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Progress Overview */}
        <ProgressOverview
          overallProgress={dashboardData.progress.overallProgress}
          currentWeek={dashboardData.progress.currentWeek}
          totalWeeks={dashboardData.progress.totalWeeks}
          lessonsCompleted={dashboardData.progress.lessonsCompleted}
          totalLessons={dashboardData.progress.totalLessons}
        />

        {/* Streak Counter */}
        <StreakCounter
          currentStreak={dashboardData.streak.currentStreak}
          longestStreak={dashboardData.streak.longestStreak}
        />

        {/* Quick Actions */}
        <QuickActions
          nextLessonId={dashboardData.quickActions.nextLessonId}
          nextLessonTitle={dashboardData.quickActions.nextLessonTitle}
          reviewsAvailable={dashboardData.quickActions.reviewsAvailable}
          exercisesAvailable={dashboardData.quickActions.exercisesAvailable}
        />
      </div>

      {/* Charts and Reviews - 2 columns on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Study Time Chart */}
        <StudyTimeChart data={dashboardData.studyTime} />

        {/* Upcoming Reviews */}
        <UpcomingReviews
          totalDueToday={dashboardData.reviews.totalDueToday}
          totalDueTomorrow={dashboardData.reviews.totalDueTomorrow}
          upcomingReviews={dashboardData.reviews.upcomingReviews}
        />
      </div>

      {/* Recent Achievements - Full width */}
      <RecentAchievements
        achievements={dashboardData.achievements}
        totalAchievements={dashboardData.totalAchievements}
      />
    </div>
  );
}
