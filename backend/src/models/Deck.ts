import mongoose, { Document, Schema } from 'mongoose';

export interface IDeckStats {
  totalCards: number;
  newCards: number;
  learningCards: number;
  reviewCards: number;
  masteredCards: number;
  suspendedCards: number;
  dueCards: number;
}

export interface IDeck extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isDefault: boolean;
  isShared: boolean;
  sharedWith: mongoose.Types.ObjectId[];
  stats?: IDeckStats;
  createdAt: Date;
  updatedAt: Date;
}

const DeckSchema = new Schema<IDeck>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      default: '#3B82F6',
    },
    icon: {
      type: String,
      default: '📚',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isShared: {
      type: Boolean,
      default: false,
    },
    sharedWith: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
DeckSchema.index({ userId: 1, name: 1 });

// Transform output
DeckSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Deck = mongoose.model<IDeck>('Deck', DeckSchema);
