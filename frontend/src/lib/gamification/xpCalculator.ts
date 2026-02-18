// XP values matching backend
export const XP_VALUES = {
  LESSON_COMPLETED: 100,
  QUIZ_PASSED: 150,
  QUIZ_PERFECT: 250,
  EXERCISE_COMPLETED: 200,
  FLASHCARD_REVIEWED: 10,
  FLASHCARD_MASTERED: 50,
  DAILY_LOGIN: 25,
  STREAK_DAY: 50,
  HELP_USER: 50,
  FORUM_POST: 30,
};

export const COIN_VALUES = {
  LESSON_COMPLETED: 20,
  QUIZ_PASSED: 30,
  QUIZ_PERFECT: 50,
  EXERCISE_COMPLETED: 40,
  DAILY_LOGIN: 10,
  STREAK_DAY: 15,
  HELP_USER: 25,
};

/**
 * Calculate XP required for a given level
 */
export function calculateXPForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}

/**
 * Calculate current level based on total XP
 */
export function calculateLevel(totalXP: number): { level: number; xpToNextLevel: number; xpInCurrentLevel: number; xpForCurrentLevel: number } {
  let level = 1;
  let xpRequired = 0;
  let xpForCurrentLevel = calculateXPForLevel(level);

  while (totalXP >= xpRequired + xpForCurrentLevel) {
    xpRequired += xpForCurrentLevel;
    level++;
    xpForCurrentLevel = calculateXPForLevel(level);
  }

  const xpToNextLevel = xpRequired + xpForCurrentLevel - totalXP;
  const xpInCurrentLevel = totalXP - xpRequired;

  return { level, xpToNextLevel, xpInCurrentLevel, xpForCurrentLevel };
}

/**
 * Calculate progress percentage in current level
 */
export function getLevelProgress(totalXP: number): number {
  const { xpInCurrentLevel, xpForCurrentLevel } = calculateLevel(totalXP);
  return Math.floor((xpInCurrentLevel / xpForCurrentLevel) * 100);
}

/**
 * Get XP for activity type
 */
export function getXPForActivity(activityType: string, data?: any): number {
  switch (activityType) {
    case 'lesson_completed':
      return XP_VALUES.LESSON_COMPLETED;
    case 'quiz_completed':
      if (data?.score === 100) return XP_VALUES.QUIZ_PERFECT;
      if (data?.passed) return XP_VALUES.QUIZ_PASSED;
      return 0;
    case 'exercise_completed':
      return XP_VALUES.EXERCISE_COMPLETED;
    case 'flashcard_reviewed':
      return XP_VALUES.FLASHCARD_REVIEWED * (data?.count || 1);
    case 'flashcard_mastered':
      return XP_VALUES.FLASHCARD_MASTERED;
    case 'help_user':
      return XP_VALUES.HELP_USER;
    case 'forum_post':
      return XP_VALUES.FORUM_POST;
    case 'daily_login':
      return XP_VALUES.DAILY_LOGIN;
    case 'streak_day':
      return XP_VALUES.STREAK_DAY;
    default:
      return 0;
  }
}

/**
 * Get coins for activity type
 */
export function getCoinsForActivity(activityType: string, data?: any): number {
  switch (activityType) {
    case 'lesson_completed':
      return COIN_VALUES.LESSON_COMPLETED;
    case 'quiz_completed':
      if (data?.score === 100) return COIN_VALUES.QUIZ_PERFECT;
      if (data?.passed) return COIN_VALUES.QUIZ_PASSED;
      return 0;
    case 'exercise_completed':
      return COIN_VALUES.EXERCISE_COMPLETED;
    case 'help_user':
      return COIN_VALUES.HELP_USER;
    case 'daily_login':
      return COIN_VALUES.DAILY_LOGIN;
    case 'streak_day':
      return COIN_VALUES.STREAK_DAY;
    default:
      return 0;
  }
}

/**
 * Format XP with thousands separator
 */
export function formatXP(xp: number): string {
  return xp.toLocaleString();
}

/**
 * Format coins with icon
 */
export function formatCoins(coins: number): string {
  return `${coins.toLocaleString()} 🪙`;
}

/**
 * Get level title
 */
export function getLevelTitle(level: number): string {
  if (level < 5) return 'Beginner';
  if (level < 10) return 'Novice';
  if (level < 20) return 'Apprentice';
  if (level < 30) return 'Practitioner';
  if (level < 40) return 'Expert';
  if (level < 50) return 'Master';
  if (level < 75) return 'Grandmaster';
  if (level < 100) return 'Legend';
  return 'Mythic';
}

/**
 * Get tier color
 */
export function getTierColor(tier: string): string {
  switch (tier) {
    case 'bronze':
      return '#CD7F32';
    case 'silver':
      return '#C0C0C0';
    case 'gold':
      return '#FFD700';
    case 'platinum':
      return '#E5E4E2';
    default:
      return '#9CA3AF';
  }
}

/**
 * Get rarity color
 */
export function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'common':
      return '#9CA3AF';
    case 'rare':
      return '#3B82F6';
    case 'epic':
      return '#8B5CF6';
    case 'legendary':
      return '#F59E0B';
    default:
      return '#9CA3AF';
  }
}

/**
 * Calculate daily XP progress
 */
export function getDailyXPProgress(dailyXPEarned: number, dailyXPGoal: number): number {
  return Math.min(100, Math.floor((dailyXPEarned / dailyXPGoal) * 100));
}
