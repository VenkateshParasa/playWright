import mongoose, { Document, Schema } from 'mongoose';

export interface IStreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date;
}

export interface IUnlockedAchievement {
  achievementId: string;
  unlockedAt: Date;
  notificationSeen: boolean;
}

export interface IDailyChallengeProgress {
  date: string; // YYYY-MM-DD format
  challenges: {
    challengeId: string;
    completed: boolean;
    progress: number;
    target: number;
  }[];
  allCompleted: boolean;
}

export interface IUserProgress extends Document {
  userId: mongoose.Types.ObjectId;

  // XP and Level System
  totalXP: number;
  currentLevel: number;

  // Achievement System
  unlockedAchievements: IUnlockedAchievement[];
  achievementProgress: Map<string, number>;

  // Streak System
  streak: IStreakData;

  // Daily Challenge System
  dailyChallenges: IDailyChallengeProgress[];

  // Learning Stats
  lessonsCompleted: number;
  quizzesCompleted: number;
  quizzesPassed: number;
  perfectQuizzes: number;
  exercisesCompleted: number;
  flashcardsReviewed: number;
  masteredFlashcards: number;

  // Study Time (in minutes)
  totalStudyTime: number;

  // Special achievements tracking
  nightOwlCount: number;
  earlyBirdCount: number;
  weekendWarriorCount: number;
  speedRunnerCount: number;

  // Activity tracking
  lastActivityAt: Date;
  studySessions: {
    date: Date;
    duration: number; // minutes
    activitiesCount: number;
  }[];

  createdAt: Date;
  updatedAt: Date;
}

const UserProgressSchema = new Schema<IUserProgress>(
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
      min: 0,
    },
    currentLevel: {
      type: Number,
      default: 1,
      min: 1,
    },
    unlockedAchievements: [
      {
        achievementId: {
          type: String,
          required: true,
        },
        unlockedAt: {
          type: Date,
          default: Date.now,
        },
        notificationSeen: {
          type: Boolean,
          default: false,
        },
      },
    ],
    achievementProgress: {
      type: Map,
      of: Number,
      default: {},
    },
    streak: {
      currentStreak: {
        type: Number,
        default: 0,
      },
      longestStreak: {
        type: Number,
        default: 0,
      },
      lastActivityDate: {
        type: Date,
        default: null,
      },
    },
    dailyChallenges: [
      {
        date: {
          type: String,
          required: true,
        },
        challenges: [
          {
            challengeId: String,
            completed: {
              type: Boolean,
              default: false,
            },
            progress: {
              type: Number,
              default: 0,
            },
            target: Number,
          },
        ],
        allCompleted: {
          type: Boolean,
          default: false,
        },
      },
    ],
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
    nightOwlCount: {
      type: Number,
      default: 0,
    },
    earlyBirdCount: {
      type: Number,
      default: 0,
    },
    weekendWarriorCount: {
      type: Number,
      default: 0,
    },
    speedRunnerCount: {
      type: Number,
      default: 0,
    },
    lastActivityAt: {
      type: Date,
      default: null,
    },
    studySessions: [
      {
        date: {
          type: Date,
          required: true,
        },
        duration: {
          type: Number,
          required: true,
        },
        activitiesCount: {
          type: Number,
          default: 1,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for leaderboard queries
UserProgressSchema.index({ totalXP: -1 });
UserProgressSchema.index({ currentLevel: -1 });

// Transform output
UserProgressSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const UserProgress = mongoose.model<IUserProgress>('UserProgress', UserProgressSchema);
