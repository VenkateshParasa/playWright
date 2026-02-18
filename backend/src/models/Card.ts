/**
 * Card Model for SRS System
 * MongoDB schema for flashcards with review history
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface ICard extends Document {
  userId: mongoose.Types.ObjectId;
  front: string;
  back: string;
  category: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';

  // SRS Algorithm fields
  state: 'new' | 'learning' | 'review' | 'relearning' | 'suspended';
  dueDate: Date;
  nextReviewDate: Date;
  interval: number; // in days
  easinessFactor: number;
  repetitions: number;

  // Review statistics
  totalReviews: number;
  correctReviews: number;
  lastReviewed: Date | null;
  successRate: number;

  // Review history
  reviewHistory: Array<{
    quality: number; // 0-5
    timestamp: Date;
    timeSpent: number; // in milliseconds
    interval: number; // interval at the time of review
  }>;

  // Manual reschedule audit
  rescheduleHistory: Array<{
    oldDueDate: Date;
    newDueDate: Date;
    reason: string;
    timestamp: Date;
  }>;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  isActive: boolean;
}

const CardSchema = new Schema<ICard>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
    category: {
      type: String,
      required: true,
      trim: true,
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
      default: 'medium',
    },

    // SRS fields
    state: {
      type: String,
      enum: ['new', 'learning', 'review', 'relearning', 'suspended'],
      default: 'new',
      index: true,
    },
    dueDate: {
      type: Date,
      required: true,
      index: true,
    },
    nextReviewDate: {
      type: Date,
      required: true,
      index: true,
    },
    interval: {
      type: Number,
      default: 0,
    },
    easinessFactor: {
      type: Number,
      default: 2.5,
      min: 1.3,
      max: 5.0,
    },
    repetitions: {
      type: Number,
      default: 0,
    },

    // Statistics
    totalReviews: {
      type: Number,
      default: 0,
    },
    correctReviews: {
      type: Number,
      default: 0,
    },
    lastReviewed: {
      type: Date,
      default: null,
    },
    successRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // Review history
    reviewHistory: [
      {
        quality: {
          type: Number,
          required: true,
          min: 0,
          max: 5,
        },
        timestamp: {
          type: Date,
          required: true,
        },
        timeSpent: {
          type: Number,
          required: true,
        },
        interval: {
          type: Number,
          required: true,
        },
      },
    ],

    // Reschedule audit
    rescheduleHistory: [
      {
        oldDueDate: {
          type: Date,
          required: true,
        },
        newDueDate: {
          type: Date,
          required: true,
        },
        reason: {
          type: String,
          default: '',
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Metadata
    createdBy: {
      type: String,
      default: 'system',
    },
    updatedBy: {
      type: String,
      default: 'system',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
CardSchema.index({ userId: 1, state: 1, dueDate: 1 });
CardSchema.index({ userId: 1, category: 1, state: 1 });
CardSchema.index({ userId: 1, nextReviewDate: 1 });
CardSchema.index({ userId: 1, isActive: 1, dueDate: 1 });

// Virtual for checking if card is due
CardSchema.virtual('isDue').get(function() {
  return this.nextReviewDate <= new Date();
});

// Virtual for checking if card is overdue
CardSchema.virtual('isOverdue').get(function() {
  const daysDiff = Math.floor(
    (new Date().getTime() - this.nextReviewDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  return daysDiff > 0;
});

// Method to update success rate
CardSchema.methods.updateSuccessRate = function() {
  if (this.totalReviews > 0) {
    this.successRate = (this.correctReviews / this.totalReviews) * 100;
  } else {
    this.successRate = 0;
  }
};

// Method to record a review
CardSchema.methods.recordReview = function(
  quality: number,
  timeSpent: number,
  newDueDate: Date,
  newInterval: number,
  newEaseFactor: number,
  newRepetitions: number,
  newState: string
) {
  // Add to review history
  this.reviewHistory.push({
    quality,
    timestamp: new Date(),
    timeSpent,
    interval: this.interval,
  });

  // Update statistics
  this.totalReviews += 1;
  if (quality >= 3) {
    this.correctReviews += 1;
  }
  this.updateSuccessRate();

  // Update SRS fields
  this.lastReviewed = new Date();
  this.dueDate = newDueDate;
  this.nextReviewDate = newDueDate;
  this.interval = newInterval;
  this.easinessFactor = newEaseFactor;
  this.repetitions = newRepetitions;
  this.state = newState;
  this.updatedBy = 'srs-algorithm';
};

// Method to manually reschedule
CardSchema.methods.manualReschedule = function(newDueDate: Date, reason: string) {
  this.rescheduleHistory.push({
    oldDueDate: this.dueDate,
    newDueDate,
    reason: reason || 'Manual reschedule',
    timestamp: new Date(),
  });

  this.dueDate = newDueDate;
  this.nextReviewDate = newDueDate;
  this.updatedBy = 'manual-reschedule';
};

// Static method to get cards due in date range
CardSchema.statics.getCardsDueInRange = function(
  userId: mongoose.Types.ObjectId,
  startDate: Date,
  endDate: Date
) {
  return this.find({
    userId,
    isActive: true,
    nextReviewDate: {
      $gte: startDate,
      $lte: endDate,
    },
  }).sort({ nextReviewDate: 1 });
};

// Static method to get cards due today
CardSchema.statics.getCardsDueToday = function(userId: mongoose.Types.ObjectId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return this.find({
    userId,
    isActive: true,
    nextReviewDate: {
      $gte: today,
      $lt: tomorrow,
    },
  }).sort({ nextReviewDate: 1 });
};

// Static method to get review statistics
CardSchema.statics.getReviewStats = function(userId: mongoose.Types.ObjectId) {
  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        isActive: true,
      },
    },
    {
      $group: {
        _id: '$state',
        count: { $sum: 1 },
        avgSuccessRate: { $avg: '$successRate' },
        avgEaseFactor: { $avg: '$easinessFactor' },
      },
    },
  ]);
};

export const Card = mongoose.model<ICard>('Card', CardSchema);
