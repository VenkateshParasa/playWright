import mongoose, { Document, Schema } from 'mongoose';

export interface IOAuth2Token extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  clientId: string;
  accessToken: string; // Hashed
  refreshToken?: string; // Hashed
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt?: Date;
  scopes: string[];
  isRevoked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OAuth2TokenSchema = new Schema<IOAuth2Token>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    clientId: {
      type: String,
      required: true,
      index: true,
    },
    accessToken: {
      type: String,
      required: true,
      unique: true,
      select: false,
    },
    refreshToken: {
      type: String,
      unique: true,
      sparse: true,
      select: false,
    },
    accessTokenExpiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    refreshTokenExpiresAt: {
      type: Date,
      index: true,
    },
    scopes: {
      type: [String],
      required: true,
    },
    isRevoked: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
OAuth2TokenSchema.index({ userId: 1, clientId: 1 });
OAuth2TokenSchema.index({ accessTokenExpiresAt: 1 }, { expireAfterSeconds: 0 });

// Transform output
OAuth2TokenSchema.set('toJSON', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.accessToken;
    delete ret.refreshToken;
    return ret;
  },
});

export const OAuth2Token = mongoose.model<IOAuth2Token>('OAuth2Token', OAuth2TokenSchema);
