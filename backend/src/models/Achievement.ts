import mongoose, { Document, Schema } from 'mongoose';

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum';
export type AchievementCategory = 'learning' | 'srs' | 'speed' | 'quality' | 'consistency' | 'social' | 'special';

export interface IAchievement extends Document {
  _id: mongoose.Types.ObjectId;
  achievementId: string; // Unique identifier (e.g., 'first_lesson')
  name: string;
  description: string;
  category: AchievementCategory;
  tier: AchievementTier;
  xpReward: number;
  coinReward: number;
  icon: string;
  isSecret: boolean;
  isProgressive: boolean; // Multi-level achievement
  levels?: {
    level: number;
    name: string;
    description: string;
    requirement: number;
    xpReward: number;
    coinReward: number;
  }[];
  requirement: {
    type: string; // e.g., 'lessons_completed', 'quiz_score', 'streak_days'
    value: number;
    condition?: string; // Additional condition (e.g., 'score >= 90')
  };
  unlockCondition?: string; // Hidden condition for secret achievements
  createdAt: Date;
  updatedAt: Date;
}

const AchievementSchema = new Schema<IAchievement>(
  {
    achievementId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['learning', 'srs', 'speed', 'quality', 'consistency', 'social', 'special'],
      required: true,
      index: true,
    },
    tier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum'],
      required: true,
    },
    xpReward: {
      type: Number,
      required: true,
      default: 500,
    },
    coinReward: {
      type: Number,
      required: true,
      default: 100,
    },
    icon: {
      type: String,
      required: true,
    },
    isSecret: {
      type: Boolean,
      default: false,
    },
    isProgressive: {
      type: Boolean,
      default: false,
    },
    levels: [{
      level: Number,
      name: String,
      description: String,
      requirement: Number,
      xpReward: Number,
      coinReward: Number,
    }],
    requirement: {
      type: {
        type: String,
        required: true,
      },
      value: {
        type: Number,
        required: true,
      },
      condition: String,
    },
    unlockCondition: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

AchievementSchema.index({ category: 1, tier: 1 });
AchievementSchema.index({ isSecret: 1 });

AchievementSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Achievement = mongoose.model<IAchievement>('Achievement', AchievementSchema);
