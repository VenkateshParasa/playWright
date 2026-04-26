import { useState, useEffect, useMemo } from 'react';
import WelcomeCard from '../components/dashboard/WelcomeCard';
import ProgressOverview from '../components/dashboard/ProgressOverview';
import StreakCounter from '../components/dashboard/StreakCounter';
import UpcomingReviews from '../components/dashboard/UpcomingReviews';
import RecentAchievements from '../components/dashboard/RecentAchievements';
import StudyTimeChart from '../components/dashboard/StudyTimeChart';
import QuickActions from '../components/dashboard/QuickActions';
import { DashboardSkeleton } from '../components/dashboard/SkeletonLoaders';
import { useProgressStore, getTotalCompletedLessons } from '../stores/progressStore';
import { useAuthStore } from '../stores/authStore';
import { useLessonsStore } from '../stores/lessonsStore';
import { useAchievementsStore } from '../stores/achievementsStore';
import { useSRSStore, getTotalCardsCount } from '../stores/srsStore';
import { useExerciseStore } from '../stores/exerciseStore';

// Fallback mock data for when stores are empty
const fallbackMockData = {
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
    nextLessonId: 'pw-beginner-008',
    nextLessonTitle: 'Advanced Locators in Playwright',
    reviewsAvailable: 15,
    exercisesAvailable: 3,
  },
};

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  
  // Get data from stores
  const { user } = useAuthStore();
  const {
    lessons: progressLessons,
    currentStreak,
    longestStreak,
    totalStudyTime,
    overallProgress
  } = useProgressStore();
  
  const { lessons, stats } = useLessonsStore();
  const { achievements } = useAchievementsStore();
  const {
    reviewedToday,
    dueCards,
    cards,
    reviews
  } = useSRSStore();
  const { progress: exerciseProgress, exercises: allExercises, loadExercises } = useExerciseStore();

  // Load exercises on mount if not already loaded
  useEffect(() => {
    if (allExercises.length === 0) {
      loadExercises();
    }
  }, [allExercises.length, loadExercises]);

  // Calculate real dashboard data
  const dashboardData = useMemo(() => {
    const completedLessons = getTotalCompletedLessons();
    const totalLessons = lessons.length || 20;
    const currentWeek = Math.ceil(completedLessons / 5) || 1;
    const totalWeeks = Math.ceil(totalLessons / 5) || 4;
    
    // Calculate flashcard stats
    const totalCards = getTotalCardsCount();
    const dueTodayCount = dueCards.length;
    
    // Calculate due tomorrow (cards with nextReview date of tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    const dueTomorrowCount = Object.entries(reviews).filter(([_, review]) => {
      return review.nextReviewDate?.split('T')[0] === tomorrowStr;
    }).length;
    
    // Get upcoming reviews (next 3 due cards)
    const upcomingReviewsList = dueCards.slice(0, 3).map(cardId => {
      const card = cards[cardId];
      const review = reviews[cardId];
      return {
        id: cardId,
        title: card?.front || 'Flashcard',
        dueTime: review?.nextReviewDate ? new Date(review.nextReviewDate) : new Date(),
        category: card?.tags?.[0] || 'General',
      };
    });

    // Calculate study time for last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      // Get lessons completed on this day
      const dayLessons = Object.values(progressLessons).filter(lesson => {
        if (!lesson.completedAt) return false;
        const completedDate = new Date(lesson.completedAt);
        return completedDate.toDateString() === date.toDateString();
      });

      return {
        day: dayName,
        minutes: dayLessons.reduce((sum, l) => sum + (l.timeSpent / 60), 0),
        lessons: dayLessons.length,
      };
    });

    // Get next lesson
    const nextLesson = lessons.find(l => l.status === 'available' || l.status === 'in-progress');

    // Calculate exercise statistics using real data from store
    const totalExercises = allExercises.length;
    const completedExercises = Object.values(exerciseProgress).filter(p => p.completed).length;
    const exercisesAvailableCount = totalExercises - completedExercises;

    // Get recent achievements (last 3 unlocked)
    const recentAchievements = achievements
      .filter(a => a.unlocked)
      .sort((a, b) => {
        // Sort by unlock date if available, otherwise by id
        return 0; // Keep original order for now
      })
      .slice(0, 3)
      .map(a => ({
        id: a.id,
        title: a.name, // Achievement type uses 'name' not 'title'
        description: a.description,
        icon: (a.icon.includes('⚡') ? 'zap' : a.icon.includes('⭐') || a.icon.includes('🌟') ? 'star' : 'award') as 'star' | 'zap' | 'award',
        color: a.category,
        earnedAt: a.unlockedAt || new Date(),
      }));

    return {
      user: {
        name: user?.fullName || user?.firstName || 'User',
        learningTrack: '30-day' as const,
        currentDay: completedLessons + 1,
      },
      progress: {
        overallProgress: overallProgress || Math.round((completedLessons / totalLessons) * 100),
        currentWeek,
        totalWeeks,
        lessonsCompleted: completedLessons,
        totalLessons,
      },
      streak: {
        currentStreak: currentStreak || 0,
        longestStreak: longestStreak || 0,
      },
      reviews: {
        totalDueToday: dueTodayCount,
        totalDueTomorrow: dueTomorrowCount,
        upcomingReviews: upcomingReviewsList,
      },
      achievements: recentAchievements.length > 0 ? recentAchievements : fallbackMockData.achievements,
      totalAchievements: achievements.length || 0,
      studyTime: last7Days,
      quickActions: {
        nextLessonId: nextLesson?.id || 'pw-beginner-001',
        nextLessonTitle: nextLesson?.title || 'Start Your First Lesson',
        reviewsAvailable: dueTodayCount,
        exercisesAvailable: exercisesAvailableCount, // Real exercise data from store
      },
    };
  }, [user, progressLessons, currentStreak, longestStreak, overallProgress, lessons, achievements, reviewedToday, dueCards, cards, reviews, exerciseProgress, allExercises]);

  useEffect(() => {
    // Simulate initial load
    const loadDashboard = async () => {
      setIsLoading(true);
      // Small delay for smooth transition
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsLoading(false);
    };

    loadDashboard();
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
