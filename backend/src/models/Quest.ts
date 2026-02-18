import mongoose, { Document, Schema } from 'mongoose';

export type QuestType = 'daily' | 'weekly' | 'story' | 'tutorial' | 'seasonal';
export type QuestStatus = 'available' | 'active' | 'completed' | 'expired';
export type QuestDifficulty = 'easy' | 'medium' | 'hard' | 'epic';

export interface IQuest extends Document {
  _id: mongoose.Types.ObjectId;
  questId: string;
  name: string;
  description: string;
  type: QuestType;
  difficulty: QuestDifficulty;
  category: string; // 'learning', 'social', 'practice'
  requirements: {
    type: string; // e.g., 'complete_lessons', 'review_cards', 'help_users'
    value: number;
    description: string;
  }[];
  rewards: {
    xp: number;
    coins: number;
    items?: string[]; // Reward shop item IDs
  };
  expiresAt?: Date;
  startDate?: Date;
  endDate?: Date;
  prerequisiteQuests?: string[]; // Quest chain
  icon: string;
  isRepeatable: boolean;
  cooldownDays?: number; // For repeatable quests
  createdAt: Date;
  updatedAt: Date;
}

const QuestSchema = new Schema<IQuest>(
  {
    questId: {
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
    type: {
      type: String,
      enum: ['daily', 'weekly', 'story', 'tutorial', 'seasonal'],
      required: true,
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'epic'],
      required: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    requirements: [{
      type: {
        type: String,
        required: true,
      },
      value: {
        type: Number,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
    }],
    rewards: {
      xp: {
        type: Number,
        required: true,
      },
      coins: {
        type: Number,
        required: true,
      },
      items: [{
        type: String,
      }],
    },
    expiresAt: {
      type: Date,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    prerequisiteQuests: [{
      type: String,
    }],
    icon: {
      type: String,
      required: true,
    },
    isRepeatable: {
      type: Boolean,
      default: false,
    },
    cooldownDays: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

QuestSchema.index({ type: 1, startDate: 1, endDate: 1 });

QuestSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Quest = mongoose.model<IQuest>('Quest', QuestSchema);
