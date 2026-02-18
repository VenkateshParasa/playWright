// Dashboard Types
export interface User {
  name: string;
  learningTrack: '30-day' | '60-day';
  currentDay: number;
}

export interface Progress {
  overallProgress: number;
  currentWeek: number;
  totalWeeks: number;
  lessonsCompleted: number;
  totalLessons: number;
}

export interface Streak {
  currentStreak: number;
  longestStreak: number;
}

export interface Review {
  id: string;
  title: string;
  dueTime: Date;
  category: string;
}

export interface Reviews {
  totalDueToday: number;
  totalDueTomorrow: number;
  upcomingReviews: Review[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: 'award' | 'trophy' | 'star' | 'zap';
  color: string;
  earnedAt: Date;
}

export interface StudyData {
  day: string;
  minutes: number;
  lessons: number;
}

export interface QuickActionsData {
  nextLessonId?: string;
  nextLessonTitle?: string;
  reviewsAvailable: number;
  exercisesAvailable: number;
}

export interface DashboardData {
  user: User;
  progress: Progress;
  streak: Streak;
  reviews: Reviews;
  achievements: Achievement[];
  totalAchievements: number;
  studyTime: StudyData[];
  quickActions: QuickActionsData;
}
