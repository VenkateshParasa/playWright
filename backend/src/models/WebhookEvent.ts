import mongoose, { Document, Schema } from 'mongoose';

export interface IWebhookEvent extends Document {
  _id: mongoose.Types.ObjectId;
  webhookId: mongoose.Types.ObjectId;
  eventType: string;
  payload: Record<string, any>;
  status: 'pending' | 'success' | 'failed' | 'retrying';
  attempts: number;
  maxAttempts: number;
  lastAttemptAt?: Date;
  nextRetryAt?: Date;
  responseStatus?: number;
  responseBody?: string;
  errorMessage?: string;
  deliveryDuration?: number; // milliseconds
  signature: string;
  createdAt: Date;
  updatedAt: Date;
}

const WebhookEventSchema = new Schema<IWebhookEvent>(
  {
    webhookId: {
      type: Schema.Types.ObjectId,
      ref: 'Webhook',
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      index: true,
    },
    payload: {
      type: Schema.Types.Mixed,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'retrying'],
      default: 'pending',
      index: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 3,
    },
    lastAttemptAt: {
      type: Date,
    },
    nextRetryAt: {
      type: Date,
      index: true,
    },
    responseStatus: {
      type: Number,
    },
    responseBody: {
      type: String,
    },
    errorMessage: {
      type: String,
    },
    deliveryDuration: {
      type: Number,
    },
    signature: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for querying and cleanup
WebhookEventSchema.index({ webhookId: 1, status: 1 });
WebhookEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days
WebhookEventSchema.index({ nextRetryAt: 1, status: 1 });

// Transform output
WebhookEventSchema.set('toJSON', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const WebhookEvent = mongoose.model<IWebhookEvent>('WebhookEvent', WebhookEventSchema);
