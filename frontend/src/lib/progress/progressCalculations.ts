/**
 * Progress Calculation Utilities
 * Functions for calculating various progress metrics and statistics
 */

import type {
  ProgressStatistics,
  OverallProgress,
  ModuleProgressData,
  WeeklyProgress,
  DailyProgress,
  PerformanceMetrics,
  ProgressTrend,
} from '../../types/progress.types';
import type { LessonProgress, QuizAttempt, ExerciseProgress } from '../../types/store';

// ============================================================================
// Overall Progress Calculation
// ============================================================================

export const calculateOverallProgress = (
  lessons: Record<string, LessonProgress>,
  quizzes: Record<string, QuizAttempt[]>,
  exercises: Record<string, ExerciseProgress>,
  flashcardsReviewed: number = 0,
  totalFlashcards: number = 0
): OverallProgress => {
  const lessonValues = Object.values(lessons);
  const quizValues = Object.values(quizzes);
  const exerciseValues = Object.values(exercises);

  const lessonsCompleted = lessonValues.filter((l) => l.completed).length;
  const totalLessons = lessonValues.length;

  const quizzesPassed = quizValues.filter((attempts) =>
    attempts.some((a) => a.passed)
  ).length;
  const totalQuizzes = quizValues.length;

  const exercisesCompleted = exerciseValues.filter((e) => e.completed).length;
  const totalExercises = exerciseValues.length;

  const totalStudyTime = lessonValues.reduce((sum, l) => sum + l.timeSpent, 0) +
    exerciseValues.reduce((sum, e) => sum + e.timeSpent, 0);

  const totalSessions = lessonValues.filter((l) => l.lastAccessedAt).length;
  const averageSessionTime = totalSessions > 0 ? totalStudyTime / totalSessions : 0;

  // Calculate weighted percentage
  const weights = { lessons: 0.35, quizzes: 0.30, exercises: 0.25, flashcards: 0.10 };

  const lessonProgress = totalLessons > 0 ? (lessonsCompleted / totalLessons) * 100 : 0;
  const quizProgress = totalQuizzes > 0 ? (quizzesPassed / totalQuizzes) * 100 : 0;
  const exerciseProgress = totalExercises > 0 ? (exercisesCompleted / totalExercises) * 100 : 0;
  const flashcardProgress = totalFlashcards > 0 ? (flashcardsReviewed / totalFlashcards) * 100 : 0;

  const percentage = Math.round(
    lessonProgress * weights.lessons +
    quizProgress * weights.quizzes +
    exerciseProgress * weights.exercises +
    flashcardProgress * weights.flashcards
  );

  return {
    percentage,
    lessonsCompleted,
    totalLessons,
    quizzesPassed,
    totalQuizzes,
    exercisesCompleted,
    totalExercises,
    flashcardsReviewed,
    totalFlashcards,
    currentStreak: 0, // Will be set by store
    longestStreak: 0, // Will be set by store
    totalStudyTime,
    averageSessionTime,
    totalSessions,
    lastActivityDate: new Date().toISOString(),
  };
};

// ============================================================================
// Module Progress Calculation
// ============================================================================

export const calculateModuleProgress = (
  moduleId: string,
  moduleName: string,
  weekNumber: number,
  lessons: LessonProgress[],
  quizzes: QuizAttempt[][],
  exercises: ExerciseProgress[],
  prerequisites: string[] = []
): ModuleProgressData => {
  const lessonsCompleted = lessons.filter((l) => l.completed).length;
  const totalLessons = lessons.length;

  const quizzesPassed = quizzes.filter((attempts) =>
    attempts.some((a) => a.passed)
  ).length;
  const totalQuizzes = quizzes.length;

  const exercisesCompleted = exercises.filter((e) => e.completed).length;
  const totalExercises = exercises.length;

  const timeSpent = lessons.reduce((sum, l) => sum + l.timeSpent, 0) +
    exercises.reduce((sum, e) => sum + e.timeSpent, 0);

  const totalItems = totalLessons + totalQuizzes + totalExercises;
  const completedItems = lessonsCompleted + quizzesPassed + exercisesCompleted;
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const startedAt = lessons.find((l) => l.lastAccessedAt)?.lastAccessedAt;
  const completedAt = progress === 100 ? lessons
    .filter((l) => l.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0]
    ?.completedAt : undefined;

  return {
    moduleId,
    moduleName,
    weekNumber,
    progress,
    lessonsCompleted,
    totalLessons,
    quizzesPassed,
    totalQuizzes,
    exercisesCompleted,
    totalExercises,
    timeSpent,
    startedAt,
    completedAt,
    isLocked: false, // Will be calculated based on prerequisites
    prerequisites,
  };
};

// ============================================================================
// Time-Based Progress Calculations
// ============================================================================

export const calculateWeeklyProgress = (
  lessons: Record<string, LessonProgress>,
  quizzes: Record<string, QuizAttempt[]>,
  exercises: Record<string, ExerciseProgress>,
  weekNumber: number
): WeeklyProgress => {
  const now = new Date();
  const weekStart = new Date(now.getFullYear(), 0, 1 + (weekNumber - 1) * 7);
  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

  const weekStartStr = weekStart.toISOString().split('T')[0];
  const weekEndStr = weekEnd.toISOString().split('T')[0];

  const isInWeek = (date?: string) => {
    if (!date) return false;
    const d = new Date(date);
    return d >= weekStart && d < weekEnd;
  };

  const lessonsCompleted = Object.values(lessons).filter((l) =>
    l.completed && isInWeek(l.completedAt)
  ).length;

  const quizzesPassed = Object.values(quizzes).filter((attempts) =>
    attempts.some((a) => a.passed && isInWeek(a.completedAt))
  ).length;

  const exercisesCompleted = Object.values(exercises).filter((e) =>
    e.completed && isInWeek(e.completedAt)
  ).length;

  const studyTime = Object.values(lessons)
    .filter((l) => isInWeek(l.lastAccessedAt))
    .reduce((sum, l) => sum + l.timeSpent, 0) +
    Object.values(exercises)
      .filter((e) => isInWeek(e.completedAt))
      .reduce((sum, e) => sum + e.timeSpent, 0);

  const sessions = Object.values(lessons).filter((l) => isInWeek(l.lastAccessedAt)).length;

  const quizScores = Object.values(quizzes)
    .flatMap((attempts) => attempts.filter((a) => isInWeek(a.completedAt)))
    .map((a) => (a.score / a.maxScore) * 100);

  const averageScore = quizScores.length > 0
    ? quizScores.reduce((sum, score) => sum + score, 0) / quizScores.length
    : 0;

  return {
    weekNumber,
    startDate: weekStartStr,
    endDate: weekEndStr,
    lessonsCompleted,
    quizzesPassed,
    exercisesCompleted,
    studyTime,
    sessions,
    averageScore,
  };
};

export const calculateDailyProgress = (
  lessons: Record<string, LessonProgress>,
  quizzes: Record<string, QuizAttempt[]>,
  exercises: Record<string, ExerciseProgress>,
  flashcardsReviewed: number,
  date: string
): DailyProgress => {
  const targetDate = date.split('T')[0];

  const isOnDate = (dateStr?: string) => {
    if (!dateStr) return false;
    return dateStr.split('T')[0] === targetDate;
  };

  const lessonsCompleted = Object.values(lessons).filter((l) =>
    l.completed && isOnDate(l.completedAt)
  ).length;

  const quizzesPassed = Object.values(quizzes).filter((attempts) =>
    attempts.some((a) => a.passed && isOnDate(a.completedAt))
  ).length;

  const exercisesCompleted = Object.values(exercises).filter((e) =>
    e.completed && isOnDate(e.completedAt)
  ).length;

  const studyTime = Object.values(lessons)
    .filter((l) => isOnDate(l.lastAccessedAt))
    .reduce((sum, l) => sum + l.timeSpent, 0) +
    Object.values(exercises)
      .filter((e) => isOnDate(e.completedAt))
      .reduce((sum, e) => sum + e.timeSpent, 0);

  const sessions = Object.values(lessons).filter((l) => isOnDate(l.lastAccessedAt)).length;

  return {
    date,
    lessonsCompleted,
    quizzesPassed,
    exercisesCompleted,
    flashcardsReviewed,
    studyTime,
    sessions,
  };
};

// ============================================================================
// Performance Metrics
// ============================================================================

export const calculatePerformanceMetrics = (
  quizzes: Record<string, QuizAttempt[]>,
  exercises: Record<string, ExerciseProgress>,
  flashcardRetention: number
): PerformanceMetrics => {
  // Calculate average quiz scores
  const allQuizAttempts = Object.values(quizzes).flat();
  const quizScores = allQuizAttempts.map((a) => (a.score / a.maxScore) * 100);
  const averageQuizScore = quizScores.length > 0
    ? quizScores.reduce((sum, score) => sum + score, 0) / quizScores.length
    : 0;

  // Calculate quiz score trend
  const recentQuizzes = allQuizAttempts
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, 5);
  const olderQuizzes = allQuizAttempts
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(5, 10);

  const recentAvg = recentQuizzes.length > 0
    ? recentQuizzes.reduce((sum, a) => sum + (a.score / a.maxScore) * 100, 0) / recentQuizzes.length
    : 0;
  const olderAvg = olderQuizzes.length > 0
    ? olderQuizzes.reduce((sum, a) => sum + (a.score / a.maxScore) * 100, 0) / olderQuizzes.length
    : 0;

  const quizScoreTrend = recentAvg > olderAvg + 5 ? 'improving'
    : recentAvg < olderAvg - 5 ? 'declining'
    : 'stable';

  // Calculate average exercise scores
  const exerciseScores = Object.values(exercises)
    .filter((e) => e.bestScore > 0)
    .map((e) => e.bestScore);
  const averageExerciseScore = exerciseScores.length > 0
    ? exerciseScores.reduce((sum, score) => sum + score, 0) / exerciseScores.length
    : 0;

  // Calculate exercise score trend (similar to quiz trend)
  const exerciseScoreTrend: 'improving' | 'declining' | 'stable' = 'stable';

  // Calculate completion rate
  const totalExercises = Object.values(exercises).length;
  const completedExercises = Object.values(exercises).filter((e) => e.completed).length;
  const completionRate = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

  // Calculate consistency score (based on daily activity)
  const consistencyScore = 75; // Placeholder - will be calculated based on streak and activity

  return {
    averageQuizScore: Math.round(averageQuizScore),
    quizScoreTrend,
    averageExerciseScore: Math.round(averageExerciseScore),
    exerciseScoreTrend,
    flashcardRetention: Math.round(flashcardRetention),
    completionRate: Math.round(completionRate),
    consistencyScore: Math.round(consistencyScore),
  };
};

// ============================================================================
// Trend Analysis
// ============================================================================

export const calculateProgressTrend = (
  currentValue: number,
  previousValue: number,
  comparisonPeriod: string
): ProgressTrend => {
  const difference = currentValue - previousValue;
  const percentage = previousValue > 0 ? (difference / previousValue) * 100 : 0;

  let direction: 'up' | 'down' | 'stable';
  if (Math.abs(percentage) < 5) {
    direction = 'stable';
  } else if (percentage > 0) {
    direction = 'up';
  } else {
    direction = 'down';
  }

  return {
    direction,
    percentage: Math.abs(Math.round(percentage)),
    comparisonPeriod,
  };
};

// ============================================================================
// Time Formatting Utilities
// ============================================================================

export const formatStudyTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export const formatDetailedStudyTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  if (minutes > 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  return `${secs} second${secs !== 1 ? 's' : ''}`;
};

// ============================================================================
// Date Range Utilities
// ============================================================================

export const getDateRange = (range: 'day' | 'week' | 'month' | 'all'): { start: Date; end: Date } => {
  const end = new Date();
  let start = new Date();

  switch (range) {
    case 'day':
      start.setHours(0, 0, 0, 0);
      break;
    case 'week':
      start.setDate(end.getDate() - 7);
      break;
    case 'month':
      start.setMonth(end.getMonth() - 1);
      break;
    case 'all':
      start = new Date(0); // Unix epoch
      break;
  }

  return { start, end };
};

export const generateDateLabels = (startDate: Date, endDate: Date, interval: 'day' | 'week'): string[] => {
  const labels: string[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    labels.push(current.toISOString().split('T')[0]);

    if (interval === 'day') {
      current.setDate(current.getDate() + 1);
    } else {
      current.setDate(current.getDate() + 7);
    }
  }

  return labels;
};

// ============================================================================
// Percentage Calculations
// ============================================================================

export const calculatePercentage = (completed: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

export const calculateWeightedPercentage = (
  values: Array<{ value: number; weight: number }>
): number => {
  const totalWeight = values.reduce((sum, v) => sum + v.weight, 0);
  if (totalWeight === 0) return 0;

  const weightedSum = values.reduce((sum, v) => sum + v.value * v.weight, 0);
  return Math.round(weightedSum / totalWeight);
};
