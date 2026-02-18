import mongoose, { Document, Schema } from 'mongoose';

export interface IApiKey extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  key: string; // Hashed API key
  keyPrefix: string; // First 8 characters for identification (e.g., "pk_live_")
  environment: 'development' | 'production';
  scopes: string[]; // Permissions like 'users:read', 'lessons:write', etc.
  rateLimit: number; // Requests per hour
  usageCount: number;
  lastUsedAt?: Date;
  expiresAt?: Date;
  isActive: boolean;
  ipWhitelist: string[]; // Optional IP restrictions
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const ApiKeySchema = new Schema<IApiKey>(
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
    key: {
      type: String,
      required: true,
      unique: true,
      select: false, // Don't include in queries by default
    },
    keyPrefix: {
      type: String,
      required: true,
      index: true,
    },
    environment: {
      type: String,
      enum: ['development', 'production'],
      default: 'development',
    },
    scopes: {
      type: [String],
      default: ['users:read', 'lessons:read'],
    },
    rateLimit: {
      type: Number,
      default: 1000, // requests per hour
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    lastUsedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    ipWhitelist: {
      type: [String],
      default: [],
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

// Indexes for performance
ApiKeySchema.index({ userId: 1, isActive: 1 });
ApiKeySchema.index({ keyPrefix: 1, isActive: 1 });
ApiKeySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Transform output
ApiKeySchema.set('toJSON', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.key; // Never expose the actual key
    return ret;
  },
});

export const ApiKey = mongoose.model<IApiKey>('ApiKey', ApiKeySchema);
