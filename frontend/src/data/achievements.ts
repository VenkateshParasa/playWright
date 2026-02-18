export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'learning' | 'practice' | 'mastery' | 'social' | 'special';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  xpReward: number;
  condition: {
    type:
      | 'lessons_completed'
      | 'quizzes_passed'
      | 'exercises_completed'
      | 'flashcards_reviewed'
      | 'streak_days'
      | 'perfect_quizzes'
      | 'daily_challenges'
      | 'study_time'
      | 'mastery_cards'
      | 'code_quality'
      | 'speed_runner'
      | 'night_owl'
      | 'early_bird'
      | 'weekend_warrior'
      | 'level_reached'
      | 'total_xp';
    target: number;
    description: string;
  };
  unlockedAt?: Date;
  progress?: number;
}

export interface AchievementCategory {
  id: string;
  name: string;
  description: string;
  color: string;
}

export const achievementCategories: AchievementCategory[] = [
  {
    id: 'learning',
    name: 'Learning',
    description: 'Complete lessons and master new concepts',
    color: 'blue',
  },
  {
    id: 'practice',
    name: 'Practice',
    description: 'Practice with exercises and flashcards',
    color: 'green',
  },
  {
    id: 'mastery',
    name: 'Mastery',
    description: 'Achieve excellence in your learning',
    color: 'purple',
  },
  {
    id: 'social',
    name: 'Social',
    description: 'Engage with the community',
    color: 'pink',
  },
  {
    id: 'special',
    name: 'Special',
    description: 'Rare and special achievements',
    color: 'orange',
  },
];

export const achievements: Achievement[] = [
  // Learning Achievements
  {
    id: 'first_lesson',
    name: 'First Steps',
    description: 'Complete your first lesson',
    icon: '🎓',
    category: 'learning',
    tier: 'bronze',
    xpReward: 50,
    condition: {
      type: 'lessons_completed',
      target: 1,
      description: 'Complete 1 lesson',
    },
  },
  {
    id: 'novice_learner',
    name: 'Novice Learner',
    description: 'Complete 5 lessons',
    icon: '📚',
    category: 'learning',
    tier: 'bronze',
    xpReward: 100,
    condition: {
      type: 'lessons_completed',
      target: 5,
      description: 'Complete 5 lessons',
    },
  },
  {
    id: 'dedicated_student',
    name: 'Dedicated Student',
    description: 'Complete 15 lessons',
    icon: '🎯',
    category: 'learning',
    tier: 'silver',
    xpReward: 250,
    condition: {
      type: 'lessons_completed',
      target: 15,
      description: 'Complete 15 lessons',
    },
  },
  {
    id: 'knowledge_seeker',
    name: 'Knowledge Seeker',
    description: 'Complete 30 lessons',
    icon: '🔍',
    category: 'learning',
    tier: 'gold',
    xpReward: 500,
    condition: {
      type: 'lessons_completed',
      target: 30,
      description: 'Complete 30 lessons',
    },
  },
  {
    id: 'master_student',
    name: 'Master Student',
    description: 'Complete 60 lessons',
    icon: '👑',
    category: 'learning',
    tier: 'platinum',
    xpReward: 1000,
    condition: {
      type: 'lessons_completed',
      target: 60,
      description: 'Complete 60 lessons',
    },
  },

  // Quiz Achievements
  {
    id: 'quiz_taker',
    name: 'Quiz Taker',
    description: 'Pass your first quiz',
    icon: '✅',
    category: 'practice',
    tier: 'bronze',
    xpReward: 75,
    condition: {
      type: 'quizzes_passed',
      target: 1,
      description: 'Pass 1 quiz',
    },
  },
  {
    id: 'test_champion',
    name: 'Test Champion',
    description: 'Pass 10 quizzes',
    icon: '🏆',
    category: 'practice',
    tier: 'silver',
    xpReward: 200,
    condition: {
      type: 'quizzes_passed',
      target: 10,
      description: 'Pass 10 quizzes',
    },
  },
  {
    id: 'perfect_score',
    name: 'Perfect Score',
    description: 'Achieve 100% on any quiz',
    icon: '💯',
    category: 'mastery',
    tier: 'gold',
    xpReward: 300,
    condition: {
      type: 'perfect_quizzes',
      target: 1,
      description: 'Get 100% on 1 quiz',
    },
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Achieve 100% on 5 quizzes',
    icon: '⭐',
    category: 'mastery',
    tier: 'platinum',
    xpReward: 750,
    condition: {
      type: 'perfect_quizzes',
      target: 5,
      description: 'Get 100% on 5 quizzes',
    },
  },

  // Exercise Achievements
  {
    id: 'code_warrior',
    name: 'Code Warrior',
    description: 'Complete your first coding exercise',
    icon: '⚔️',
    category: 'practice',
    tier: 'bronze',
    xpReward: 100,
    condition: {
      type: 'exercises_completed',
      target: 1,
      description: 'Complete 1 coding exercise',
    },
  },
  {
    id: 'bug_squasher',
    name: 'Bug Squasher',
    description: 'Complete 10 coding exercises',
    icon: '🐛',
    category: 'practice',
    tier: 'silver',
    xpReward: 300,
    condition: {
      type: 'exercises_completed',
      target: 10,
      description: 'Complete 10 coding exercises',
    },
  },
  {
    id: 'code_ninja',
    name: 'Code Ninja',
    description: 'Complete 25 coding exercises',
    icon: '🥷',
    category: 'mastery',
    tier: 'gold',
    xpReward: 600,
    condition: {
      type: 'exercises_completed',
      target: 25,
      description: 'Complete 25 coding exercises',
    },
  },

  // Flashcard Achievements
  {
    id: 'memory_builder',
    name: 'Memory Builder',
    description: 'Review 25 flashcards',
    icon: '🧠',
    category: 'practice',
    tier: 'bronze',
    xpReward: 50,
    condition: {
      type: 'flashcards_reviewed',
      target: 25,
      description: 'Review 25 flashcards',
    },
  },
  {
    id: 'recall_master',
    name: 'Recall Master',
    description: 'Review 100 flashcards',
    icon: '🎴',
    category: 'practice',
    tier: 'silver',
    xpReward: 150,
    condition: {
      type: 'flashcards_reviewed',
      target: 100,
      description: 'Review 100 flashcards',
    },
  },
  {
    id: 'memory_champion',
    name: 'Memory Champion',
    description: 'Review 500 flashcards',
    icon: '🏅',
    category: 'mastery',
    tier: 'gold',
    xpReward: 400,
    condition: {
      type: 'flashcards_reviewed',
      target: 500,
      description: 'Review 500 flashcards',
    },
  },
  {
    id: 'mastery_mind',
    name: 'Mastery Mind',
    description: 'Master 50 flashcards (5/5 rating)',
    icon: '🧩',
    category: 'mastery',
    tier: 'platinum',
    xpReward: 800,
    condition: {
      type: 'mastery_cards',
      target: 50,
      description: 'Master 50 flashcards',
    },
  },

  // Streak Achievements
  {
    id: 'consistent',
    name: 'Consistent',
    description: 'Maintain a 3-day learning streak',
    icon: '🔥',
    category: 'practice',
    tier: 'bronze',
    xpReward: 100,
    condition: {
      type: 'streak_days',
      target: 3,
      description: 'Learn for 3 days in a row',
    },
  },
  {
    id: 'dedicated',
    name: 'Dedicated',
    description: 'Maintain a 7-day learning streak',
    icon: '🌟',
    category: 'practice',
    tier: 'silver',
    xpReward: 250,
    condition: {
      type: 'streak_days',
      target: 7,
      description: 'Learn for 7 days in a row',
    },
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: 'Maintain a 30-day learning streak',
    icon: '💪',
    category: 'mastery',
    tier: 'gold',
    xpReward: 750,
    condition: {
      type: 'streak_days',
      target: 30,
      description: 'Learn for 30 days in a row',
    },
  },
  {
    id: 'legendary_streak',
    name: 'Legendary Streak',
    description: 'Maintain a 100-day learning streak',
    icon: '🔱',
    category: 'mastery',
    tier: 'diamond',
    xpReward: 2000,
    condition: {
      type: 'streak_days',
      target: 100,
      description: 'Learn for 100 days in a row',
    },
  },

  // Daily Challenge Achievements
  {
    id: 'challenger',
    name: 'Challenger',
    description: 'Complete your first daily challenge',
    icon: '🎯',
    category: 'practice',
    tier: 'bronze',
    xpReward: 80,
    condition: {
      type: 'daily_challenges',
      target: 1,
      description: 'Complete 1 daily challenge',
    },
  },
  {
    id: 'daily_champion',
    name: 'Daily Champion',
    description: 'Complete 10 daily challenges',
    icon: '🏆',
    category: 'practice',
    tier: 'silver',
    xpReward: 300,
    condition: {
      type: 'daily_challenges',
      target: 10,
      description: 'Complete 10 daily challenges',
    },
  },

  // Time-based Achievements
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Complete a lesson between 10 PM and 2 AM',
    icon: '🦉',
    category: 'special',
    tier: 'silver',
    xpReward: 150,
    condition: {
      type: 'night_owl',
      target: 1,
      description: 'Study late at night',
    },
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete a lesson between 5 AM and 7 AM',
    icon: '🐦',
    category: 'special',
    tier: 'silver',
    xpReward: 150,
    condition: {
      type: 'early_bird',
      target: 1,
      description: 'Study early in the morning',
    },
  },
  {
    id: 'weekend_warrior',
    name: 'Weekend Warrior',
    description: 'Study on both Saturday and Sunday',
    icon: '⚡',
    category: 'special',
    tier: 'gold',
    xpReward: 200,
    condition: {
      type: 'weekend_warrior',
      target: 1,
      description: 'Study on weekends',
    },
  },

  // Speed Achievements
  {
    id: 'speed_runner',
    name: 'Speed Runner',
    description: 'Complete 5 lessons in one day',
    icon: '⚡',
    category: 'special',
    tier: 'gold',
    xpReward: 400,
    condition: {
      type: 'speed_runner',
      target: 5,
      description: 'Complete 5 lessons in a day',
    },
  },

  // Study Time Achievements
  {
    id: 'focused_learner',
    name: 'Focused Learner',
    description: 'Study for 10 hours total',
    icon: '⏰',
    category: 'practice',
    tier: 'silver',
    xpReward: 200,
    condition: {
      type: 'study_time',
      target: 600, // 10 hours in minutes
      description: 'Study for 10 total hours',
    },
  },
  {
    id: 'time_master',
    name: 'Time Master',
    description: 'Study for 50 hours total',
    icon: '⏳',
    category: 'mastery',
    tier: 'platinum',
    xpReward: 1000,
    condition: {
      type: 'study_time',
      target: 3000, // 50 hours in minutes
      description: 'Study for 50 total hours',
    },
  },

  // Level Achievements
  {
    id: 'level_10',
    name: 'Rising Star',
    description: 'Reach level 10',
    icon: '✨',
    category: 'mastery',
    tier: 'silver',
    xpReward: 300,
    condition: {
      type: 'level_reached',
      target: 10,
      description: 'Reach level 10',
    },
  },
  {
    id: 'level_25',
    name: 'Expert',
    description: 'Reach level 25',
    icon: '💎',
    category: 'mastery',
    tier: 'gold',
    xpReward: 750,
    condition: {
      type: 'level_reached',
      target: 25,
      description: 'Reach level 25',
    },
  },
  {
    id: 'level_50',
    name: 'Grandmaster',
    description: 'Reach level 50',
    icon: '👑',
    category: 'mastery',
    tier: 'diamond',
    xpReward: 2000,
    condition: {
      type: 'level_reached',
      target: 50,
      description: 'Reach level 50',
    },
  },
];

// XP levels configuration
export interface LevelConfig {
  level: number;
  xpRequired: number;
  xpTotal: number; // Cumulative XP
  title: string;
  color: string;
}

export const levelConfigs: LevelConfig[] = Array.from({ length: 50 }, (_, i) => {
  const level = i + 1;
  // XP formula: level^2 * 100 (progressive difficulty)
  const xpRequired = level * level * 100;
  const xpTotal = Array.from({ length: level }, (_, j) => (j + 1) * (j + 1) * 100).reduce((a, b) => a + b, 0);

  let title = 'Novice';
  let color = 'gray';

  if (level >= 50) {
    title = 'Grandmaster';
    color = 'purple';
  } else if (level >= 40) {
    title = 'Legend';
    color = 'purple';
  } else if (level >= 30) {
    title = 'Master';
    color = 'gold';
  } else if (level >= 20) {
    title = 'Expert';
    color = 'gold';
  } else if (level >= 10) {
    title = 'Advanced';
    color = 'blue';
  } else if (level >= 5) {
    title = 'Intermediate';
    color = 'green';
  }

  return { level, xpRequired, xpTotal, title, color };
});

// Helper functions
export function getLevelFromXP(xp: number): number {
  for (let i = levelConfigs.length - 1; i >= 0; i--) {
    if (xp >= levelConfigs[i].xpTotal) {
      return levelConfigs[i].level;
    }
  }
  return 1;
}

export function getXPForNextLevel(currentXP: number): { current: number; required: number; level: number } {
  const currentLevel = getLevelFromXP(currentXP);
  const nextLevelConfig = levelConfigs[currentLevel]; // Next level is currentLevel + 1

  if (!nextLevelConfig) {
    return { current: currentXP, required: currentXP, level: currentLevel };
  }

  const currentLevelXP = currentLevel > 1 ? levelConfigs[currentLevel - 2].xpTotal : 0;
  const xpInCurrentLevel = currentXP - currentLevelXP;

  return {
    current: xpInCurrentLevel,
    required: nextLevelConfig.xpRequired,
    level: currentLevel,
  };
}

export function getLevelConfig(level: number): LevelConfig | undefined {
  return levelConfigs[level - 1];
}

// Daily challenges configuration
export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  type: 'lesson' | 'quiz' | 'flashcards' | 'exercise';
  target: number;
  current?: number;
}

export function generateDailyChallenges(date: Date = new Date()): DailyChallenge[] {
  const seed = date.getDate() + date.getMonth() * 31 + date.getFullYear() * 365;
  const random = (min: number, max: number) => {
    const x = Math.sin(seed) * 10000;
    return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min;
  };

  const challenges: DailyChallenge[] = [
    {
      id: 'daily_lesson',
      title: 'Complete a Lesson',
      description: 'Complete 1 lesson today',
      icon: '📚',
      xpReward: 50,
      type: 'lesson',
      target: 1,
    },
    {
      id: 'daily_quiz',
      title: 'Pass a Quiz',
      description: 'Pass 1 quiz with at least 70%',
      icon: '✅',
      xpReward: 75,
      type: 'quiz',
      target: 1,
    },
    {
      id: 'daily_flashcards',
      title: 'Review Flashcards',
      description: `Review ${random(10, 20)} flashcards`,
      icon: '🎴',
      xpReward: 40,
      type: 'flashcards',
      target: random(10, 20),
    },
  ];

  return challenges;
}

// Tier colors and styles
export const tierConfig = {
  bronze: {
    color: '#CD7F32',
    gradient: 'from-amber-700 to-amber-900',
    textColor: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
  },
  silver: {
    color: '#C0C0C0',
    gradient: 'from-gray-400 to-gray-600',
    textColor: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-300',
  },
  gold: {
    color: '#FFD700',
    gradient: 'from-yellow-400 to-yellow-600',
    textColor: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-300',
  },
  platinum: {
    color: '#E5E4E2',
    gradient: 'from-purple-400 to-purple-600',
    textColor: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
  },
  diamond: {
    color: '#B9F2FF',
    gradient: 'from-cyan-400 to-blue-600',
    textColor: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-300',
  },
};
