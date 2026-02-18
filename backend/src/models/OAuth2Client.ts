import mongoose, { Document, Schema } from 'mongoose';

export interface IOAuth2Client extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  clientId: string;
  clientSecret: string; // Hashed
  name: string;
  description?: string;
  redirectUris: string[];
  allowedScopes: string[];
  grantTypes: ('authorization_code' | 'refresh_token' | 'client_credentials')[];
  isPublic: boolean; // Public clients (like SPAs) don't need client_secret
  logoUrl?: string;
  websiteUrl?: string;
  privacyPolicyUrl?: string;
  termsOfServiceUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OAuth2ClientSchema = new Schema<IOAuth2Client>(
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
      unique: true,
      index: true,
    },
    clientSecret: {
      type: String,
      required: true,
      select: false,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    redirectUris: {
      type: [String],
      required: true,
      validate: {
        validator: function (uris: string[]) {
          return uris.length > 0;
        },
        message: 'At least one redirect URI is required',
      },
    },
    allowedScopes: {
      type: [String],
      default: ['users:read', 'lessons:read'],
    },
    grantTypes: {
      type: [String],
      enum: ['authorization_code', 'refresh_token', 'client_credentials'],
      default: ['authorization_code', 'refresh_token'],
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    logoUrl: {
      type: String,
    },
    websiteUrl: {
      type: String,
    },
    privacyPolicyUrl: {
      type: String,
    },
    termsOfServiceUrl: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Transform output
OAuth2ClientSchema.set('toJSON', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.clientSecret;
    return ret;
  },
});

export const OAuth2Client = mongoose.model<IOAuth2Client>('OAuth2Client', OAuth2ClientSchema);
