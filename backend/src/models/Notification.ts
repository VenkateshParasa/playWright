import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  sender?: mongoose.Types.ObjectId;
  type: 'reply' | 'mention' | 'group_invite' | 'buddy_request' | 'group_message' | 'achievement' | 'leaderboard' | 'best_answer' | 'upvote' | 'follow';
  title: string;
  message: string;
  link?: string;
  reference?: {
    model: string;
    id: mongoose.Types.ObjectId;
  };
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    type: {
      type: String,
      enum: [
        'reply',
        'mention',
        'group_invite',
        'buddy_request',
        'group_message',
        'achievement',
        'leaderboard',
        'best_answer',
        'upvote',
        'follow',
      ],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    link: String,
    reference: {
      model: String,
      id: Schema.Types.ObjectId,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ recipient: 1, type: 1, createdAt: -1 });

// Methods
NotificationSchema.methods.markAsRead = async function() {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    await this.save();
  }
};

export default mongoose.model<INotification>('Notification', NotificationSchema);
