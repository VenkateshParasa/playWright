import mongoose, { Document, Schema } from 'mongoose';

export type RewardType = 'avatar' | 'frame' | 'badge' | 'title' | 'theme' | 'emoji' | 'booster' | 'skip';
export type RewardRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface IReward extends Document {
  _id: mongoose.Types.ObjectId;
  rewardId: string;
  name: string;
  description: string;
  type: RewardType;
  rarity: RewardRarity;
  cost: number; // In coins
  icon: string;
  preview?: string; // Preview image/URL
  isLimited: boolean;
  stock?: number; // For limited items
  availableFrom?: Date;
  availableUntil?: Date;
  requirementLevel?: number;
  requirementAchievements?: string[]; // Achievement IDs needed to unlock
  metadata?: {
    avatarUrl?: string;
    frameUrl?: string;
    themeColors?: Record<string, string>;
    boosterMultiplier?: number;
    boosterDuration?: number; // In hours
    skipCount?: number;
    titleText?: string;
    titleColor?: string;
    emojiPack?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const RewardSchema = new Schema<IReward>(
  {
    rewardId: {
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
      enum: ['avatar', 'frame', 'badge', 'title', 'theme', 'emoji', 'booster', 'skip'],
      required: true,
      index: true,
    },
    rarity: {
      type: String,
      enum: ['common', 'rare', 'epic', 'legendary'],
      required: true,
      index: true,
    },
    cost: {
      type: Number,
      required: true,
      min: 0,
    },
    icon: {
      type: String,
      required: true,
    },
    preview: String,
    isLimited: {
      type: Boolean,
      default: false,
    },
    stock: Number,
    availableFrom: Date,
    availableUntil: Date,
    requirementLevel: Number,
    requirementAchievements: [String],
    metadata: {
      avatarUrl: String,
      frameUrl: String,
      themeColors: Schema.Types.Mixed,
      boosterMultiplier: Number,
      boosterDuration: Number,
      skipCount: Number,
      titleText: String,
      titleColor: String,
      emojiPack: [String],
    },
  },
  {
    timestamps: true,
  }
);

RewardSchema.index({ type: 1, rarity: 1 });
RewardSchema.index({ isLimited: 1, availableFrom: 1, availableUntil: 1 });

RewardSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Reward = mongoose.model<IReward>('Reward', RewardSchema);
