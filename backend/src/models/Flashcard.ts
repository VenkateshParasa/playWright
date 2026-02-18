import mongoose, { Document, Schema } from 'mongoose';

// Card statuses
export enum CardStatus {
  NEW = 'new',
  LEARNING = 'learning',
  REVIEW = 'review',
  MASTERED = 'mastered',
  SUSPENDED = 'suspended',
}

// Review record interface
export interface IReviewRecord {
  date: Date;
  quality: number; // 0-5
  timeSpent: number; // seconds
  easeFactor: number;
  interval: number;
}

// Related card interface
export interface IRelatedCard {
  cardId: mongoose.Types.ObjectId;
  relationType: 'prerequisite' | 'related' | 'opposite' | 'example';
}

// Flashcard interface
export interface IFlashcard extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  deckId?: mongoose.Types.ObjectId;

  // Content
  front: string;
  back: string;
  frontImages?: string[];
  backImages?: string[];

  // Metadata
  category: string;
  tags: string[];
  difficulty?: 'easy' | 'medium' | 'hard';

  // SRS data
  status: CardStatus;
  easeFactor: number;
  interval: number; // days
  repetitions: number;
  nextReviewDate: Date;
  lastReviewedAt?: Date;

  // Statistics
  totalReviews: number;
  correctReviews: number;
  incorrectReviews: number;
  totalTimeSpent: number; // seconds
  averageTimeSpent: number; // seconds
  reviewHistory: IReviewRecord[];

  // Relationships
  relatedCards: IRelatedCard[];

  // Flags
  isSuspended: boolean;
  isNew: boolean;

  // Draft mode
  isDraft: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const ReviewRecordSchema = new Schema<IReviewRecord>(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    quality: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    timeSpent: {
      type: Number,
      required: true,
      default: 0,
    },
    easeFactor: {
      type: Number,
      required: true,
    },
    interval: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const RelatedCardSchema = new Schema<IRelatedCard>(
  {
    cardId: {
      type: Schema.Types.ObjectId,
      ref: 'Flashcard',
      required: true,
    },
    relationType: {
      type: String,
      enum: ['prerequisite', 'related', 'opposite', 'example'],
      required: true,
    },
  },
  { _id: false }
);

const FlashcardSchema = new Schema<IFlashcard>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    deckId: {
      type: Schema.Types.ObjectId,
      ref: 'Deck',
      index: true,
    },
    front: {
      type: String,
      required: true,
      trim: true,
    },
    back: {
      type: String,
      required: true,
      trim: true,
    },
    frontImages: {
      type: [String],
      default: [],
    },
    backImages: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
    },
    status: {
      type: String,
      enum: Object.values(CardStatus),
      default: CardStatus.NEW,
      index: true,
    },
    easeFactor: {
      type: Number,
      default: 2.5,
    },
    interval: {
      type: Number,
      default: 0,
    },
    repetitions: {
      type: Number,
      default: 0,
    },
    nextReviewDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    lastReviewedAt: {
      type: Date,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    correctReviews: {
      type: Number,
      default: 0,
    },
    incorrectReviews: {
      type: Number,
      default: 0,
    },
    totalTimeSpent: {
      type: Number,
      default: 0,
    },
    averageTimeSpent: {
      type: Number,
      default: 0,
    },
    reviewHistory: {
      type: [ReviewRecordSchema],
      default: [],
    },
    relatedCards: {
      type: [RelatedCardSchema],
      default: [],
    },
    isSuspended: {
      type: Boolean,
      default: false,
      index: true,
    },
    isNew: {
      type: Boolean,
      default: true,
    },
    isDraft: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
FlashcardSchema.index({ userId: 1, status: 1 });
FlashcardSchema.index({ userId: 1, nextReviewDate: 1 });
FlashcardSchema.index({ userId: 1, category: 1 });
FlashcardSchema.index({ userId: 1, tags: 1 });
FlashcardSchema.index({ userId: 1, deckId: 1 });
FlashcardSchema.index({ front: 'text', back: 'text' }); // Text search

// Virtual for success rate
FlashcardSchema.virtual('successRate').get(function () {
  if (this.totalReviews === 0) return 0;
  return (this.correctReviews / this.totalReviews) * 100;
});

// Method to update status based on interval
FlashcardSchema.methods.updateStatus = function () {
  if (this.isSuspended) {
    this.status = CardStatus.SUSPENDED;
  } else if (this.isNew || this.repetitions === 0) {
    this.status = CardStatus.NEW;
  } else if (this.interval < 1) {
    this.status = CardStatus.LEARNING;
  } else if (this.interval >= 21 && this.easeFactor >= 2.5) {
    this.status = CardStatus.MASTERED;
  } else {
    this.status = CardStatus.REVIEW;
  }
};

// Method to reset card progress
FlashcardSchema.methods.resetProgress = function () {
  this.easeFactor = 2.5;
  this.interval = 0;
  this.repetitions = 0;
  this.nextReviewDate = new Date();
  this.status = CardStatus.NEW;
  this.isNew = true;
  this.totalReviews = 0;
  this.correctReviews = 0;
  this.incorrectReviews = 0;
  this.totalTimeSpent = 0;
  this.averageTimeSpent = 0;
  this.reviewHistory = [];
};

// Transform output
FlashcardSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Flashcard = mongoose.model<IFlashcard>('Flashcard', FlashcardSchema);
