/**
 * Milestone System
 * Defines and tracks user milestones and achievements
 */

import type { Milestone, MilestoneCategory } from '../../types/progress.types';
import type { OverallProgress } from '../../types/progress.types';

// ============================================================================
// Milestone Definitions
// ============================================================================

export const MILESTONES: Omit<Milestone, 'current' | 'isCompleted' | 'completedAt'>[] = [
  // Lesson Milestones
  {
    id: 'first-lesson',
    title: 'First Step',
    description: 'Complete your first lesson',
    category: 'lessons',
    target: 1,
    icon: '📚',
    color: '#3B82F6',
    reward: {
      type: 'badge',
      value: 'beginner',
      description: 'Awarded for starting your learning journey',
    },
  },
  {
    id: 'lessons-5',
    title: 'Getting Started',
    description: 'Complete 5 lessons',
    category: 'lessons',
    target: 5,
    icon: '📖',
    color: '#3B82F6',
  },
  {
    id: 'lessons-10',
    title: 'Dedicated Learner',
    description: 'Complete 10 lessons',
    category: 'lessons',
    target: 10,
    icon: '🎓',
    color: '#3B82F6',
    reward: {
      type: 'badge',
      value: 'dedicated',
      description: 'Awarded for consistent learning',
    },
  },
  {
    id: 'lessons-25',
    title: 'Knowledge Seeker',
    description: 'Complete 25 lessons',
    category: 'lessons',
    target: 25,
    icon: '🌟',
    color: '#3B82F6',
  },
  {
    id: 'lessons-50',
    title: 'Master Student',
    description: 'Complete 50 lessons',
    category: 'lessons',
    target: 50,
    icon: '👑',
    color: '#3B82F6',
    reward: {
      type: 'badge',
      value: 'master',
      description: 'Awarded for mastering the curriculum',
    },
  },

  // Quiz Milestones
  {
    id: 'first-quiz',
    title: 'Test Taker',
    description: 'Pass your first quiz',
    category: 'quizzes',
    target: 1,
    icon: '✅',
    color: '#10B981',
    reward: {
      type: 'badge',
      value: 'test-taker',
      description: 'Awarded for passing your first quiz',
    },
  },
  {
    id: 'quizzes-5',
    title: 'Quiz Master',
    description: 'Pass 5 quizzes',
    category: 'quizzes',
    target: 5,
    icon: '🎯',
    color: '#10B981',
  },
  {
    id: 'quizzes-10',
    title: 'Ace Student',
    description: 'Pass 10 quizzes',
    category: 'quizzes',
    target: 10,
    icon: '💯',
    color: '#10B981',
    reward: {
      type: 'badge',
      value: 'ace',
      description: 'Awarded for quiz excellence',
    },
  },
  {
    id: 'perfect-quiz',
    title: 'Perfectionist',
    description: 'Score 100% on a quiz',
    category: 'score',
    target: 100,
    icon: '⭐',
    color: '#F59E0B',
    reward: {
      type: 'badge',
      value: 'perfect',
      description: 'Awarded for achieving perfection',
    },
  },

  // Exercise Milestones
  {
    id: 'first-exercise',
    title: 'Code Warrior',
    description: 'Complete your first exercise',
    category: 'exercises',
    target: 1,
    icon: '💻',
    color: '#8B5CF6',
  },
  {
    id: 'exercises-5',
    title: 'Problem Solver',
    description: 'Complete 5 exercises',
    category: 'exercises',
    target: 5,
    icon: '🧩',
    color: '#8B5CF6',
  },
  {
    id: 'exercises-10',
    title: 'Code Expert',
    description: 'Complete 10 exercises',
    category: 'exercises',
    target: 10,
    icon: '🚀',
    color: '#8B5CF6',
    reward: {
      type: 'badge',
      value: 'expert',
      description: 'Awarded for coding excellence',
    },
  },

  // Flashcard Milestones
  {
    id: 'cards-10',
    title: 'Memory Builder',
    description: 'Review 10 flashcards',
    category: 'flashcards',
    target: 10,
    icon: '🧠',
    color: '#EC4899',
  },
  {
    id: 'cards-50',
    title: 'Memory Master',
    description: 'Review 50 flashcards',
    category: 'flashcards',
    target: 50,
    icon: '🎴',
    color: '#EC4899',
  },
  {
    id: 'cards-100',
    title: 'Retention Expert',
    description: 'Review 100 flashcards',
    category: 'flashcards',
    target: 100,
    icon: '🏆',
    color: '#EC4899',
    reward: {
      type: 'badge',
      value: 'retention-expert',
      description: 'Awarded for exceptional memory retention',
    },
  },

  // Streak Milestones
  {
    id: 'streak-3',
    title: 'Consistent',
    description: 'Study for 3 days in a row',
    category: 'streak',
    target: 3,
    icon: '🔥',
    color: '#EF4444',
  },
  {
    id: 'streak-7',
    title: 'Dedicated',
    description: 'Study for 7 days in a row',
    category: 'streak',
    target: 7,
    icon: '🔥',
    color: '#EF4444',
    reward: {
      type: 'badge',
      value: 'dedicated-streak',
      description: 'Awarded for a week of consistent study',
    },
  },
  {
    id: 'streak-14',
    title: 'Unstoppable',
    description: 'Study for 14 days in a row',
    category: 'streak',
    target: 14,
    icon: '🔥',
    color: '#EF4444',
  },
  {
    id: 'streak-30',
    title: 'Legendary',
    description: 'Study for 30 days in a row',
    category: 'streak',
    target: 30,
    icon: '🔥',
    color: '#EF4444',
    reward: {
      type: 'badge',
      value: 'legendary',
      description: 'Awarded for an exceptional study streak',
    },
  },

  // Time Milestones
  {
    id: 'time-1h',
    title: 'Time Invested',
    description: 'Study for 1 hour total',
    category: 'time',
    target: 3600, // seconds
    icon: '⏱️',
    color: '#6366F1',
  },
  {
    id: 'time-5h',
    title: 'Committed',
    description: 'Study for 5 hours total',
    category: 'time',
    target: 18000,
    icon: '⏱️',
    color: '#6366F1',
  },
  {
    id: 'time-10h',
    title: 'Dedicated Scholar',
    description: 'Study for 10 hours total',
    category: 'time',
    target: 36000,
    icon: '⏱️',
    color: '#6366F1',
    reward: {
      type: 'badge',
      value: 'scholar',
      description: 'Awarded for significant time investment',
    },
  },
  {
    id: 'time-25h',
    title: 'Learning Enthusiast',
    description: 'Study for 25 hours total',
    category: 'time',
    target: 90000,
    icon: '⏱️',
    color: '#6366F1',
  },
  {
    id: 'time-50h',
    title: 'Master of Time',
    description: 'Study for 50 hours total',
    category: 'time',
    target: 180000,
    icon: '⏱️',
    color: '#6366F1',
    reward: {
      type: 'badge',
      value: 'time-master',
      description: 'Awarded for exceptional time dedication',
    },
  },
];

// ============================================================================
// Milestone Tracking Functions
// ============================================================================

export const calculateMilestones = (progress: OverallProgress): Milestone[] => {
  return MILESTONES.map((milestone) => {
    let current = 0;

    switch (milestone.category) {
      case 'lessons':
        current = progress.lessonsCompleted;
        break;
      case 'quizzes':
        current = progress.quizzesPassed;
        break;
      case 'exercises':
        current = progress.exercisesCompleted;
        break;
      case 'flashcards':
        current = progress.flashcardsReviewed;
        break;
      case 'streak':
        current = progress.currentStreak;
        break;
      case 'time':
        current = progress.totalStudyTime;
        break;
      case 'score':
        current = 0; // Will be calculated from quiz attempts
        break;
    }

    const isCompleted = current >= milestone.target;

    return {
      ...milestone,
      current,
      isCompleted,
      completedAt: isCompleted ? new Date().toISOString() : undefined,
    };
  });
};

export const getNewlyCompletedMilestones = (
  previousMilestones: Milestone[],
  currentMilestones: Milestone[]
): Milestone[] => {
  const newlyCompleted: Milestone[] = [];

  currentMilestones.forEach((current) => {
    const previous = previousMilestones.find((m) => m.id === current.id);

    if (current.isCompleted && (!previous || !previous.isCompleted)) {
      newlyCompleted.push(current);
    }
  });

  return newlyCompleted;
};

export const getActiveMilestones = (milestones: Milestone[]): Milestone[] => {
  return milestones.filter((m) => !m.isCompleted && m.current > 0);
};

export const getCompletedMilestones = (milestones: Milestone[]): Milestone[] => {
  return milestones.filter((m) => m.isCompleted);
};

export const getMilestoneProgress = (milestone: Milestone): number => {
  return Math.min(Math.round((milestone.current / milestone.target) * 100), 100);
};

export const getNextMilestone = (milestones: Milestone[], category?: MilestoneCategory): Milestone | null => {
  const filtered = category
    ? milestones.filter((m) => m.category === category && !m.isCompleted)
    : milestones.filter((m) => !m.isCompleted);

  if (filtered.length === 0) return null;

  // Sort by how close we are to completion
  return filtered.sort((a, b) => {
    const progressA = a.current / a.target;
    const progressB = b.current / b.target;
    return progressB - progressA;
  })[0];
};

// ============================================================================
// Milestone Categories
// ============================================================================

export const MILESTONE_CATEGORIES: Record<MilestoneCategory, { label: string; icon: string; color: string }> = {
  lessons: { label: 'Lessons', icon: '📚', color: '#3B82F6' },
  quizzes: { label: 'Quizzes', icon: '✅', color: '#10B981' },
  exercises: { label: 'Exercises', icon: '💻', color: '#8B5CF6' },
  flashcards: { label: 'Flashcards', icon: '🧠', color: '#EC4899' },
  streak: { label: 'Streak', icon: '🔥', color: '#EF4444' },
  time: { label: 'Study Time', icon: '⏱️', color: '#6366F1' },
  score: { label: 'Scores', icon: '⭐', color: '#F59E0B' },
};

// ============================================================================
// Celebration Messages
// ============================================================================

export const getCelebrationMessage = (milestone: Milestone): string => {
  const messages = [
    `Congratulations! You've achieved the "${milestone.title}" milestone!`,
    `Amazing work! "${milestone.title}" milestone unlocked!`,
    `Well done! You've reached the "${milestone.title}" milestone!`,
    `Fantastic! "${milestone.title}" milestone completed!`,
    `Outstanding! You've earned the "${milestone.title}" milestone!`,
  ];

  return messages[Math.floor(Math.random() * messages.length)];
};

export const getMilestoneMotivation = (milestone: Milestone): string => {
  const progressPercent = Math.round((milestone.current / milestone.target) * 100);

  if (progressPercent === 0) {
    return `Start now to work towards the "${milestone.title}" milestone!`;
  } else if (progressPercent < 25) {
    return `Keep going! You're making progress towards "${milestone.title}"!`;
  } else if (progressPercent < 50) {
    return `Great progress! You're ${progressPercent}% of the way to "${milestone.title}"!`;
  } else if (progressPercent < 75) {
    return `You're over halfway there! "${milestone.title}" is within reach!`;
  } else if (progressPercent < 100) {
    return `Almost there! Just ${milestone.target - milestone.current} more to achieve "${milestone.title}"!`;
  } else {
    return `Achievement unlocked: "${milestone.title}"! 🎉`;
  }
};
