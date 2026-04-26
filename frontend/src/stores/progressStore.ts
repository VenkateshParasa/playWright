/**
 * Progress Store
 * Tracks user learning progress, lessons, quizzes, exercises, and study time
 * Enhanced with devtools and persistence
 */

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import type { ProgressStore, LessonProgress, QuizAttempt, ExerciseProgress, ModuleProgress } from '../types/store';

// ============================================================================
// Initial State
// ============================================================================

const initialState = {
  lessons: {},
  quizzes: {},
  exercises: {},
  modules: {},
  overallProgress: 0,
  currentStreak: 0,
  longestStreak: 0,
  totalStudyTime: 0,
  lastStudyDate: undefined,
  isLoading: false,
};

// ============================================================================
// Store Implementation
// ============================================================================

export const useProgressStore = create<ProgressStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // ====================================================================
        // Mark Lesson Complete
        // ====================================================================
        markLessonComplete: (lessonId: string) => {
          const currentLesson = get().lessons[lessonId] || {
            lessonId,
            completed: false,
            timeSpent: 0,
            bookmarked: false,
          };

          set(
            {
              lessons: {
                ...get().lessons,
                [lessonId]: {
                  ...currentLesson,
                  completed: true,
                  completedAt: new Date().toISOString(),
                },
              },
            },
            false,
            'progress/markLessonComplete'
          );

          // Recalculate overall progress
          get().calculateOverallProgress();
          get().updateStreak();
        },

        // ====================================================================
        // Update Lesson Time
        // ====================================================================
        updateLessonTime: (lessonId: string, timeSpent: number) => {
          const currentLesson = get().lessons[lessonId] || {
            lessonId,
            completed: false,
            timeSpent: 0,
            bookmarked: false,
          };

          set(
            {
              lessons: {
                ...get().lessons,
                [lessonId]: {
                  ...currentLesson,
                  timeSpent: currentLesson.timeSpent + timeSpent,
                  lastAccessedAt: new Date().toISOString(),
                },
              },
              totalStudyTime: get().totalStudyTime + timeSpent,
              lastStudyDate: new Date().toISOString(),
            },
            false,
            'progress/updateLessonTime'
          );
        },

        // ====================================================================
        // Toggle Bookmark
        // ====================================================================
        toggleBookmark: (lessonId: string) => {
          const currentLesson = get().lessons[lessonId] || {
            lessonId,
            completed: false,
            timeSpent: 0,
            bookmarked: false,
          };

          set(
            {
              lessons: {
                ...get().lessons,
                [lessonId]: {
                  ...currentLesson,
                  bookmarked: !currentLesson.bookmarked,
                },
              },
            },
            false,
            'progress/toggleBookmark'
          );
        },

        // ====================================================================
        // Add Quiz Attempt
        // ====================================================================
        addQuizAttempt: (quizId: string, attempt: Omit<QuizAttempt, 'quizId'>) => {
          const currentAttempts = get().quizzes[quizId] || [];

          set(
            {
              quizzes: {
                ...get().quizzes,
                [quizId]: [
                  ...currentAttempts,
                  {
                    quizId,
                    ...attempt,
                  },
                ],
              },
            },
            false,
            'progress/addQuizAttempt'
          );

          // Recalculate progress
          get().calculateOverallProgress();
          get().updateStreak();
        },

        // ====================================================================
        // Update Exercise Progress
        // ====================================================================
        updateExerciseProgress: (
          exerciseId: string,
          progress: Partial<ExerciseProgress>
        ) => {
          const currentProgress = get().exercises[exerciseId] || {
            exerciseId,
            completed: false,
            attempts: 0,
            bestScore: 0,
            timeSpent: 0,
          };

          set(
            {
              exercises: {
                ...get().exercises,
                [exerciseId]: {
                  ...currentProgress,
                  ...progress,
                },
              },
            },
            false,
            'progress/updateExerciseProgress'
          );

          // Recalculate progress if completed
          if (progress.completed && !currentProgress.completed) {
            get().calculateOverallProgress();
            get().updateStreak();
          }
        },

        // ====================================================================
        // Complete Exercise
        // ====================================================================
        completeExercise: (exerciseId: string, score: number, timeSpent: number) => {
          const currentProgress = get().exercises[exerciseId] || {
            exerciseId,
            completed: false,
            attempts: 0,
            bestScore: 0,
            timeSpent: 0,
          };

          // Increment attempts
          const attempts = currentProgress.attempts + 1;

          // Update best score if current is higher
          const bestScore = Math.max(currentProgress.bestScore, score);

          // Mark as completed if score is perfect (100) or all tests passed
          const completed = score === 100 || currentProgress.completed;

          set(
            {
              exercises: {
                ...get().exercises,
                [exerciseId]: {
                  ...currentProgress,
                  attempts,
                  bestScore,
                  completed,
                  completedAt: completed && !currentProgress.completed
                    ? new Date().toISOString()
                    : currentProgress.completedAt,
                  timeSpent: currentProgress.timeSpent + timeSpent,
                },
              },
              totalStudyTime: get().totalStudyTime + timeSpent,
              lastStudyDate: new Date().toISOString(),
            },
            false,
            'progress/completeExercise'
          );

          // Recalculate progress and update streak if newly completed
          if (completed && !currentProgress.completed) {
            get().calculateOverallProgress();
            get().updateStreak();
          }
        },

        // ====================================================================
        // Calculate Overall Progress
        // ====================================================================
        calculateOverallProgress: () => {
          const { lessons, quizzes, exercises } = get();

          // Calculate lessons progress
          const lessonValues = Object.values(lessons);
          const completedLessons = lessonValues.filter((l) => l.completed).length;
          const totalLessons = lessonValues.length || 1;

          // Calculate quizzes progress
          const quizValues = Object.values(quizzes);
          const passedQuizzes = quizValues.filter((attempts) =>
            attempts.some((a) => a.passed)
          ).length;
          const totalQuizzes = quizValues.length || 1;

          // Calculate exercises progress
          const exerciseValues = Object.values(exercises);
          const completedExercises = exerciseValues.filter((e) => e.completed).length;
          const totalExercises = exerciseValues.length || 1;

          // Weighted average (lessons: 40%, quizzes: 30%, exercises: 30%)
          const overallProgress = Math.round(
            (completedLessons / totalLessons) * 40 +
              (passedQuizzes / totalQuizzes) * 30 +
              (completedExercises / totalExercises) * 30
          );

          set(
            { overallProgress },
            false,
            'progress/calculateOverallProgress'
          );
        },

        // ====================================================================
        // Update Streak
        // ====================================================================
        updateStreak: () => {
          const today = new Date().toISOString().split('T')[0];
          const lastStudy = get().lastStudyDate?.split('T')[0];

          if (!lastStudy) {
            // First study session
            set(
              {
                currentStreak: 1,
                longestStreak: Math.max(1, get().longestStreak),
                lastStudyDate: new Date().toISOString(),
              },
              false,
              'progress/updateStreak'
            );
            return;
          }

          if (lastStudy === today) {
            // Already studied today
            return;
          }

          const lastDate = new Date(lastStudy);
          const todayDate = new Date(today);
          const daysDiff = Math.floor(
            (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (daysDiff === 1) {
            // Consecutive day
            const newStreak = get().currentStreak + 1;
            set(
              {
                currentStreak: newStreak,
                longestStreak: Math.max(newStreak, get().longestStreak),
                lastStudyDate: new Date().toISOString(),
              },
              false,
              'progress/updateStreak'
            );
          } else if (daysDiff > 1) {
            // Streak broken
            set(
              {
                currentStreak: 1,
                lastStudyDate: new Date().toISOString(),
              },
              false,
              'progress/updateStreak'
            );
          }
        },

        // ====================================================================
        // Sync Progress
        // ====================================================================
        syncProgress: async () => {
          set({ isLoading: true }, false, 'progress/sync/start');

          try {
            // TODO: Replace with actual API call
            const response = await fetch('/api/progress', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
              },
              body: JSON.stringify({
                lessons: get().lessons,
                quizzes: get().quizzes,
                exercises: get().exercises,
                overallProgress: get().overallProgress,
                currentStreak: get().currentStreak,
                totalStudyTime: get().totalStudyTime,
              }),
            });

            if (!response.ok) {
              throw new Error('Failed to sync progress');
            }

            set({ isLoading: false }, false, 'progress/sync/success');
          } catch (error) {
            console.error('Failed to sync progress:', error);
            set({ isLoading: false }, false, 'progress/sync/error');
          }
        },

        // ====================================================================
        // Reset Progress
        // ====================================================================
        resetProgress: () => {
          set(initialState, false, 'progress/reset');
        },
      }),
      {
        name: 'progress-storage',
        partialize: (state) => ({
          lessons: state.lessons,
          quizzes: state.quizzes,
          exercises: state.exercises,
          modules: state.modules,
          overallProgress: state.overallProgress,
          currentStreak: state.currentStreak,
          longestStreak: state.longestStreak,
          totalStudyTime: state.totalStudyTime,
          lastStudyDate: state.lastStudyDate,
        }),
      }
    ),
    {
      name: 'ProgressStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

// ============================================================================
// Selectors
// ============================================================================

export const selectLessonProgress = (lessonId: string) => (state: ProgressStore) =>
  state.lessons[lessonId];

export const selectQuizAttempts = (quizId: string) => (state: ProgressStore) =>
  state.quizzes[quizId] || [];

export const selectExerciseProgress = (exerciseId: string) => (state: ProgressStore) =>
  state.exercises[exerciseId];

export const selectOverallProgress = (state: ProgressStore) => state.overallProgress;
export const selectCurrentStreak = (state: ProgressStore) => state.currentStreak;
export const selectTotalStudyTime = (state: ProgressStore) => state.totalStudyTime;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Checks if a lesson is completed
 */
export const isLessonCompleted = (lessonId: string): boolean => {
  return useProgressStore.getState().lessons[lessonId]?.completed || false;
};

/**
 * Gets the best quiz score for a quiz
 */
export const getBestQuizScore = (quizId: string): number => {
  const attempts = useProgressStore.getState().quizzes[quizId] || [];
  if (attempts.length === 0) return 0;

  return Math.max(...attempts.map((a) => a.score));
};

/**
 * Checks if a quiz has been passed
 */
export const hasPassedQuiz = (quizId: string): boolean => {
  const attempts = useProgressStore.getState().quizzes[quizId] || [];
  return attempts.some((a) => a.passed);
};

/**
 * Gets total completed lessons count
 */
export const getTotalCompletedLessons = (): number => {
  const lessons = useProgressStore.getState().lessons;
  return Object.values(lessons).filter((l) => l.completed).length;
};

/**
 * Formats study time to human-readable format
 */
export const formatStudyTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};
