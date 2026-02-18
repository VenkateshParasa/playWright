import mongoose, { Schema, Document } from 'mongoose';

export interface IThread extends Document {
  title: string;
  content: string;
  author: mongoose.Types.ObjectId;
  category: 'general' | 'help' | 'show-and-tell' | 'announcements';
  tags: string[];
  upvotes: mongoose.Types.ObjectId[];
  downvotes: mongoose.Types.ObjectId[];
  views: number;
  replyCount: number;
  isPinned: boolean;
  isLocked: boolean;
  bestAnswer?: mongoose.Types.ObjectId;
  bookmarkedBy: mongoose.Types.ObjectId[];
  isFlagged: boolean;
  flagReason?: string;
  flaggedBy?: mongoose.Types.ObjectId[];
  isDeleted: boolean;
  deletedAt?: Date;
  lastActivityAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ThreadSchema = new Schema<IThread>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
      index: 'text',
    },
    content: {
      type: String,
      required: true,
      maxlength: 10000,
      index: 'text',
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['general', 'help', 'show-and-tell', 'announcements'],
      required: true,
      index: true,
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
    upvotes: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    downvotes: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    views: {
      type: Number,
      default: 0,
    },
    replyCount: {
      type: Number,
      default: 0,
    },
    isPinned: {
      type: Boolean,
      default: false,
      index: true,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    bestAnswer: {
      type: Schema.Types.ObjectId,
      ref: 'Reply',
    },
    bookmarkedBy: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    isFlagged: {
      type: Boolean,
      default: false,
      index: true,
    },
    flagReason: String,
    flaggedBy: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: Date,
    lastActivityAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
ThreadSchema.index({ category: 1, lastActivityAt: -1 });
ThreadSchema.index({ category: 1, upvotes: -1 });
ThreadSchema.index({ author: 1, createdAt: -1 });
ThreadSchema.index({ tags: 1 });

// Virtual for vote score
ThreadSchema.virtual('voteScore').get(function() {
  return this.upvotes.length - this.downvotes.length;
});

// Methods
ThreadSchema.methods.incrementViews = async function() {
  this.views += 1;
  await this.save();
};

ThreadSchema.methods.updateLastActivity = async function() {
  this.lastActivityAt = new Date();
  await this.save();
};

export default mongoose.model<IThread>('Thread', ThreadSchema);
