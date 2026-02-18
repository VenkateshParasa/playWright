import { useAchievementsStore } from '../../stores/achievementsStore';
import { Achievement } from '../../data/achievements';

/**
 * Achievement Unlock Engine
 * Provides utilities to track and unlock achievements based on user activities
 */

export class AchievementEngine {
  private store = useAchievementsStore.getState();

  /**
   * Track a lesson completion
   */
  async trackLessonCompleted(data?: { lessonId: string; completedAt?: Date }) {
    await this.store.updateActivity('lesson_completed', data);
  }

  /**
   * Track a quiz completion
   */
  async trackQuizCompleted(data: { quizId: string; score: number; passed: boolean }) {
    await this.store.updateActivity('quiz_completed', data);
  }

  /**
   * Track an exercise completion
   */
  async trackExerciseCompleted(data?: { exerciseId: string; completedAt?: Date }) {
    await this.store.updateActivity('exercise_completed', data);
  }

  /**
   * Track flashcard reviews
   */
  async trackFlashcardReviewed(data: { count?: number; mastered?: boolean }) {
    await this.store.updateActivity('flashcard_reviewed', data);
  }

  /**
   * Track a study session
   */
  async trackStudySession(data: { duration: number; activitiesCount?: number }) {
    await this.store.updateActivity('study_session', data);
  }

  /**
   * Check if a specific achievement should be unlocked
   */
  checkAchievementProgress(achievement: Achievement, userStats: any): boolean {
    switch (achievement.condition.type) {
      case 'lessons_completed':
        return userStats.lessonsCompleted >= achievement.condition.target;

      case 'quizzes_passed':
        return userStats.quizzesPassed >= achievement.condition.target;

      case 'perfect_quizzes':
        return userStats.perfectQuizzes >= achievement.condition.target;

      case 'exercises_completed':
        return userStats.exercisesCompleted >= achievement.condition.target;

      case 'flashcards_reviewed':
        return userStats.flashcardsReviewed >= achievement.condition.target;

      case 'mastery_cards':
        return userStats.masteredFlashcards >= achievement.condition.target;

      case 'streak_days':
        return userStats.currentStreak >= achievement.condition.target;

      case 'study_time':
        return userStats.totalStudyTime >= achievement.condition.target;

      case 'level_reached':
        return userStats.currentLevel >= achievement.condition.target;

      case 'total_xp':
        return userStats.totalXP >= achievement.condition.target;

      default:
        return false;
    }
  }

  /**
   * Get progress percentage for an achievement
   */
  getAchievementProgress(achievement: Achievement, userStats: any): number {
    let current = 0;

    switch (achievement.condition.type) {
      case 'lessons_completed':
        current = userStats.lessonsCompleted;
        break;
      case 'quizzes_passed':
        current = userStats.quizzesPassed;
        break;
      case 'perfect_quizzes':
        current = userStats.perfectQuizzes;
        break;
      case 'exercises_completed':
        current = userStats.exercisesCompleted;
        break;
      case 'flashcards_reviewed':
        current = userStats.flashcardsReviewed;
        break;
      case 'mastery_cards':
        current = userStats.masteredFlashcards;
        break;
      case 'streak_days':
        current = userStats.currentStreak;
        break;
      case 'study_time':
        current = userStats.totalStudyTime;
        break;
      case 'level_reached':
        current = userStats.currentLevel;
        break;
      case 'total_xp':
        current = userStats.totalXP;
        break;
    }

    return Math.min((current / achievement.condition.target) * 100, 100);
  }

  /**
   * Award XP to the user
   */
  async awardXP(amount: number, reason: string) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/achievements/xp/award`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, reason }),
      });

      if (response.ok) {
        const result = await response.json();

        // Refresh user progress
        await this.store.fetchUserProgress();

        return result.data;
      }
    } catch (error) {
      console.error('Failed to award XP:', error);
      return null;
    }
  }

  /**
   * Check and refresh all achievement data
   */
  async refreshAchievements() {
    await Promise.all([
      this.store.fetchUserProgress(),
      this.store.fetchAchievements(),
      this.store.fetchUnseenAchievements(),
      this.store.fetchDailyChallenges(),
    ]);
  }
}

// Singleton instance
export const achievementEngine = new AchievementEngine();

// Hook for easier usage in components
export function useAchievementEngine() {
  return achievementEngine;
}

/**
 * Helper hook to track activities with achievement updates
 */
export function useActivityTracker() {
  const engine = useAchievementEngine();

  return {
    trackLessonCompleted: (data?: any) => engine.trackLessonCompleted(data),
    trackQuizCompleted: (data: any) => engine.trackQuizCompleted(data),
    trackExerciseCompleted: (data?: any) => engine.trackExerciseCompleted(data),
    trackFlashcardReviewed: (data: any) => engine.trackFlashcardReviewed(data),
    trackStudySession: (data: any) => engine.trackStudySession(data),
    awardXP: (amount: number, reason: string) => engine.awardXP(amount, reason),
    refreshAchievements: () => engine.refreshAchievements(),
  };
}
