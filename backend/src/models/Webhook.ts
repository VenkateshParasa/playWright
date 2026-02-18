import mongoose, { Document, Schema } from 'mongoose';

export interface IWebhook extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  url: string;
  events: string[]; // Array of event types to subscribe to
  secret: string; // For HMAC signature
  isActive: boolean;
  description?: string;
  headers: Record<string, string>; // Custom headers to send with webhook
  retryPolicy: {
    maxAttempts: number;
    backoffMultiplier: number; // Exponential backoff
  };
  lastTriggeredAt?: Date;
  successCount: number;
  failureCount: number;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const WebhookSchema = new Schema<IWebhook>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    url: {
      type: String,
      required: true,
      validate: {
        validator: function (url: string) {
          return /^https?:\/\/.+/.test(url);
        },
        message: 'URL must be a valid HTTP/HTTPS endpoint',
      },
    },
    events: {
      type: [String],
      required: true,
      validate: {
        validator: function (events: string[]) {
          const validEvents = [
            'user.created',
            'user.updated',
            'lesson.completed',
            'quiz.passed',
            'quiz.failed',
            'exercise.completed',
            'achievement.unlocked',
            'review.completed',
            'progress.milestone',
            'subscription.changed',
          ];
          return events.every(event => validEvents.includes(event));
        },
        message: 'Invalid event type',
      },
    },
    secret: {
      type: String,
      required: true,
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    headers: {
      type: Schema.Types.Mixed,
      default: {},
    },
    retryPolicy: {
      type: {
        maxAttempts: {
          type: Number,
          default: 3,
          min: 1,
          max: 5,
        },
        backoffMultiplier: {
          type: Number,
          default: 2,
          min: 1,
          max: 10,
        },
      },
      default: {
        maxAttempts: 3,
        backoffMultiplier: 2,
      },
    },
    lastTriggeredAt: {
      type: Date,
    },
    successCount: {
      type: Number,
      default: 0,
    },
    failureCount: {
      type: Number,
      default: 0,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
WebhookSchema.index({ userId: 1, isActive: 1 });
WebhookSchema.index({ events: 1, isActive: 1 });

// Transform output
WebhookSchema.set('toJSON', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.secret; // Never expose the secret
    return ret;
  },
});

export const Webhook = mongoose.model<IWebhook>('Webhook', WebhookSchema);
