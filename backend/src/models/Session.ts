import mongoose, { Document, Schema } from 'mongoose';

export interface ISession extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  token: string;
  refreshToken?: string;
  ipAddress: string;
  userAgent: string;
  deviceInfo?: {
    type: 'desktop' | 'mobile' | 'tablet';
    os?: string;
    browser?: string;
  };
  geoLocation?: {
    country?: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
  status: 'active' | 'expired' | 'revoked';
  expiresAt: Date;
  lastActivityAt: Date;
  createdAt: Date;
  revokedAt?: Date;
  revokedBy?: mongoose.Types.ObjectId;
  revokedReason?: string;
}

const SessionSchema = new Schema<ISession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    refreshToken: {
      type: String,
      index: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    deviceInfo: {
      type: {
        type: String,
        enum: ['desktop', 'mobile', 'tablet'],
      },
      os: String,
      browser: String,
    },
    geoLocation: {
      country: String,
      region: String,
      city: String,
      latitude: Number,
      longitude: Number,
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'revoked'],
      default: 'active',
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
    revokedAt: Date,
    revokedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    revokedReason: String,
  },
  {
    timestamps: true,
  }
);

// Compound indexes
SessionSchema.index({ userId: 1, status: 1 });
SessionSchema.index({ tenantId: 1, status: 1 });
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Method to check if session is valid
SessionSchema.methods.isValid = function (): boolean {
  if (this.status !== 'active') return false;
  if (this.expiresAt < new Date()) {
    this.status = 'expired';
    return false;
  }
  return true;
};

// Method to revoke session
SessionSchema.methods.revoke = function (revokedBy?: mongoose.Types.ObjectId, reason?: string): void {
  this.status = 'revoked';
  this.revokedAt = new Date();
  if (revokedBy) this.revokedBy = revokedBy;
  if (reason) this.revokedReason = reason;
};

// Transform output
SessionSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.token; // Don't expose token
    delete ret.refreshToken; // Don't expose refresh token
    return ret;
  },
});

export const Session = mongoose.model<ISession>('Session', SessionSchema);
