import mongoose, { Document, Schema } from 'mongoose';

export interface IUserGamification extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;

  // XP and Leveling
  totalXP: number;
  currentLevel: number;
  xpToNextLevel: number;
  prestigeLevel: number;

  // Coins/Currency
  coins: number;
  totalCoinsEarned: number;
  totalCoinsSpent: number;

  // Streaks
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date;
  streakFreezes: number; // Available freeze days

  // Activity Stats
  lessonsCompleted: number;
  quizzesCompleted: number;
  quizzesPassed: number;
  perfectQuizzes: number;
  exercisesCompleted: number;
  flashcardsReviewed: number;
  masteredFlashcards: number;
  totalStudyTime: number; // In minutes
  helpfulAnswers: number;
  forumPosts: number;

  // XP Breakdown
  xpBreakdown: {
    lessons: number;
    quizzes: number;
    exercises: number;
    flashcards: number;
    social: number;
    streaks: number;
    achievements: number;
    other: number;
  };

  // Achievements
  unlockedAchievements: {
    achievementId: string;
    unlockedAt: Date;
    seen: boolean;
    currentLevel?: number; // For progressive achievements
  }[];
  achievementProgress: {
    achievementId: string;
    progress: number;
    target: number;
  }[];

  // Quests
  activeQuests: {
    questId: string;
    startedAt: Date;
    progress: {
      requirementIndex: number;
      currentValue: number;
      targetValue: number;
    }[];
  }[];
  completedQuests: {
    questId: string;
    completedAt: Date;
  }[];

  // Competitions
  activeCompetitions: {
    competitionId: string;
    joinedAt: Date;
    currentScore: number;
    currentRank?: number;
  }[];
  competitionHistory: {
    competitionId: string;
    finalScore: number;
    finalRank: number;
    completedAt: Date;
    prizeWon?: {
      xp: number;
      coins: number;
      items: string[];
    };
  }[];

  // Inventory (Purchased/Earned Rewards)
  inventory: {
    rewardId: string;
    acquiredAt: Date;
    source: 'purchase' | 'quest' | 'achievement' | 'competition';
    isEquipped: boolean;
  }[];

  // Equipped Items
  equippedItems: {
    avatar?: string;
    frame?: string;
    badge?: string;
    title?: string;
    theme?: string;
  };

  // Active Boosters
  activeBoosters: {
    rewardId: string;
    multiplier: number;
    expiresAt: Date;
    activatedAt: Date;
  }[];

  // Badges and Titles
  badges: {
    badgeId: string;
    earnedAt: Date;
    source: string;
  }[];
  titles: {
    titleId: string;
    text: string;
    color?: string;
    earnedAt: Date;
  }[];

  // Daily Stats
  dailyXPGoal: number;
  dailyXPEarned: number;
  lastDailyReset: Date;
  loginStreak: number;
  lastLoginDate: Date;

  // Leaderboard Stats
  globalRank?: number;
  weeklyRank?: number;
  monthlyRank?: number;
  rankChange?: number; // +/- from previous period

  // Preferences
  showOnLeaderboard: boolean;
  shareAchievements: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const UserGamificationSchema = new Schema<IUserGamification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    totalXP: {
      type: Number,
      default: 0,
      index: true,
    },
    currentLevel: {
      type: Number,
      default: 1,
      index: true,
    },
    xpToNextLevel: {
      type: Number,
      default: 100,
    },
    prestigeLevel: {
      type: Number,
      default: 0,
    },
    coins: {
      type: Number,
      default: 0,
    },
    totalCoinsEarned: {
      type: Number,
      default: 0,
    },
    totalCoinsSpent: {
      type: Number,
      default: 0,
    },
    currentStreak: {
      type: Number,
      default: 0,
      index: true,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    lastActivityDate: {
      type: Date,
      default: Date.now,
    },
    streakFreezes: {
      type: Number,
      default: 0,
    },
    lessonsCompleted: {
      type: Number,
      default: 0,
    },
    quizzesCompleted: {
      type: Number,
      default: 0,
    },
    quizzesPassed: {
      type: Number,
      default: 0,
    },
    perfectQuizzes: {
      type: Number,
      default: 0,
    },
    exercisesCompleted: {
      type: Number,
      default: 0,
    },
    flashcardsReviewed: {
      type: Number,
      default: 0,
    },
    masteredFlashcards: {
      type: Number,
      default: 0,
    },
    totalStudyTime: {
      type: Number,
      default: 0,
    },
    helpfulAnswers: {
      type: Number,
      default: 0,
    },
    forumPosts: {
      type: Number,
      default: 0,
    },
    xpBreakdown: {
      lessons: { type: Number, default: 0 },
      quizzes: { type: Number, default: 0 },
      exercises: { type: Number, default: 0 },
      flashcards: { type: Number, default: 0 },
      social: { type: Number, default: 0 },
      streaks: { type: Number, default: 0 },
      achievements: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },
    unlockedAchievements: [{
      achievementId: {
        type: String,
        required: true,
      },
      unlockedAt: {
        type: Date,
        default: Date.now,
      },
      seen: {
        type: Boolean,
        default: false,
      },
      currentLevel: Number,
    }],
    achievementProgress: [{
      achievementId: {
        type: String,
        required: true,
      },
      progress: {
        type: Number,
        default: 0,
      },
      target: {
        type: Number,
        required: true,
      },
    }],
    activeQuests: [{
      questId: {
        type: String,
        required: true,
      },
      startedAt: {
        type: Date,
        default: Date.now,
      },
      progress: [{
        requirementIndex: Number,
        currentValue: Number,
        targetValue: Number,
      }],
    }],
    completedQuests: [{
      questId: String,
      completedAt: Date,
    }],
    activeCompetitions: [{
      competitionId: String,
      joinedAt: Date,
      currentScore: { type: Number, default: 0 },
      currentRank: Number,
    }],
    competitionHistory: [{
      competitionId: String,
      finalScore: Number,
      finalRank: Number,
      completedAt: Date,
      prizeWon: {
        xp: Number,
        coins: Number,
        items: [String],
      },
    }],
    inventory: [{
      rewardId: {
        type: String,
        required: true,
      },
      acquiredAt: {
        type: Date,
        default: Date.now,
      },
      source: {
        type: String,
        enum: ['purchase', 'quest', 'achievement', 'competition'],
        required: true,
      },
      isEquipped: {
        type: Boolean,
        default: false,
      },
    }],
    equippedItems: {
      avatar: String,
      frame: String,
      badge: String,
      title: String,
      theme: String,
    },
    activeBoosters: [{
      rewardId: String,
      multiplier: Number,
      expiresAt: Date,
      activatedAt: Date,
    }],
    badges: [{
      badgeId: String,
      earnedAt: Date,
      source: String,
    }],
    titles: [{
      titleId: String,
      text: String,
      color: String,
      earnedAt: Date,
    }],
    dailyXPGoal: {
      type: Number,
      default: 500,
    },
    dailyXPEarned: {
      type: Number,
      default: 0,
    },
    lastDailyReset: {
      type: Date,
      default: Date.now,
    },
    loginStreak: {
      type: Number,
      default: 0,
    },
    lastLoginDate: {
      type: Date,
      default: Date.now,
    },
    globalRank: Number,
    weeklyRank: Number,
    monthlyRank: Number,
    rankChange: Number,
    showOnLeaderboard: {
      type: Boolean,
      default: true,
    },
    shareAchievements: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for leaderboard queries
UserGamificationSchema.index({ totalXP: -1 });
UserGamificationSchema.index({ currentLevel: -1 });
UserGamificationSchema.index({ currentStreak: -1 });
UserGamificationSchema.index({ showOnLeaderboard: 1, totalXP: -1 });

UserGamificationSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const UserGamification = mongoose.model<IUserGamification>('UserGamification', UserGamificationSchema);
