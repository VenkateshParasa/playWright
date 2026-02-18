import mongoose, { Schema, Document } from 'mongoose';

export interface IReply extends Document {
  thread: mongoose.Types.ObjectId;
  content: string;
  author: mongoose.Types.ObjectId;
  parentReply?: mongoose.Types.ObjectId;
  upvotes: mongoose.Types.ObjectId[];
  downvotes: mongoose.Types.ObjectId[];
  isBestAnswer: boolean;
  mentions: mongoose.Types.ObjectId[];
  attachments: {
    name: string;
    url: string;
    size: number;
    type: string;
  }[];
  isEdited: boolean;
  editedAt?: Date;
  isFlagged: boolean;
  flagReason?: string;
  flaggedBy?: mongoose.Types.ObjectId[];
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReplySchema = new Schema<IReply>(
  {
    thread: {
      type: Schema.Types.ObjectId,
      ref: 'Thread',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    parentReply: {
      type: Schema.Types.ObjectId,
      ref: 'Reply',
    },
    upvotes: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    downvotes: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    isBestAnswer: {
      type: Boolean,
      default: false,
    },
    mentions: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    attachments: [{
      name: String,
      url: String,
      size: Number,
      type: String,
    }],
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: Date,
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
  },
  {
    timestamps: true,
  }
);

// Indexes
ReplySchema.index({ thread: 1, createdAt: 1 });
ReplySchema.index({ author: 1, createdAt: -1 });
ReplySchema.index({ parentReply: 1 });

// Virtual for vote score
ReplySchema.virtual('voteScore').get(function() {
  return this.upvotes.length - this.downvotes.length;
});

export default mongoose.model<IReply>('Reply', ReplySchema);
