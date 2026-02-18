import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  tenantId?: mongoose.Types.ObjectId; // null for super admins
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: 'student' | 'instructor' | 'admin' | 'tenant_admin' | 'super_admin';
  tenantRole?: 'owner' | 'admin' | 'member'; // role within tenant
  status: 'active' | 'suspended' | 'deleted';
  suspendedAt?: Date;
  suspendedBy?: mongoose.Types.ObjectId;
  suspendedReason?: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  passwordHistory?: string[]; // hashed passwords
  mfaEnabled?: boolean;
  mfaSecret?: string;
  mfaBackupCodes?: string[];
  lastPasswordChange?: Date;
  failedLoginAttempts?: number;
  lockedUntil?: Date;
  lastLogin?: Date;
  ssoProvider?: string; // 'saml', 'oauth2', 'ldap'
  ssoId?: string; // external SSO identifier
  settings?: {
    theme?: 'light' | 'dark' | 'auto';
    language?: 'en' | 'es' | 'fr' | 'de';
    notifications?: {
      srsReviewsDue?: boolean;
      newLessonAvailable?: boolean;
      quizDeadline?: boolean;
      achievementUnlocked?: boolean;
      feedbackReceived?: boolean;
      emailNotifications?: boolean;
      pushNotifications?: boolean;
      sound?: boolean;
    };
    study?: {
      dailyReviewLimit?: number;
      studyReminders?: boolean;
      reminderTime?: string;
      autoPlayVideos?: boolean;
      showHints?: boolean;
      keyboardShortcuts?: boolean;
    };
    privacy?: {
      showProfile?: boolean;
      shareProgress?: boolean;
      allowAnalytics?: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      select: false, // Don't include password by default in queries
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ['student', 'instructor', 'admin', 'tenant_admin', 'super_admin'],
      default: 'student',
      index: true,
    },
    tenantRole: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      default: 'member',
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'deleted'],
      default: 'active',
      index: true,
    },
    suspendedAt: {
      type: Date,
    },
    suspendedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    suspendedReason: {
      type: String,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    passwordHistory: {
      type: [String],
      select: false,
      default: [],
    },
    mfaEnabled: {
      type: Boolean,
      default: false,
    },
    mfaSecret: {
      type: String,
      select: false,
    },
    mfaBackupCodes: {
      type: [String],
      select: false,
    },
    lastPasswordChange: {
      type: Date,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockedUntil: {
      type: Date,
    },
    lastLogin: {
      type: Date,
    },
    ssoProvider: {
      type: String,
    },
    ssoId: {
      type: String,
      index: true,
    },
    settings: {
      type: {
        theme: {
          type: String,
          enum: ['light', 'dark', 'auto'],
          default: 'light',
        },
        language: {
          type: String,
          enum: ['en', 'es', 'fr', 'de'],
          default: 'en',
        },
        notifications: {
          srsReviewsDue: { type: Boolean, default: true },
          newLessonAvailable: { type: Boolean, default: true },
          quizDeadline: { type: Boolean, default: true },
          achievementUnlocked: { type: Boolean, default: true },
          feedbackReceived: { type: Boolean, default: true },
          emailNotifications: { type: Boolean, default: true },
          pushNotifications: { type: Boolean, default: false },
          sound: { type: Boolean, default: true },
        },
        study: {
          dailyReviewLimit: { type: Number, default: 50 },
          studyReminders: { type: Boolean, default: true },
          reminderTime: { type: String, default: '09:00' },
          autoPlayVideos: { type: Boolean, default: false },
          showHints: { type: Boolean, default: true },
          keyboardShortcuts: { type: Boolean, default: true },
        },
        privacy: {
          showProfile: { type: Boolean, default: true },
          shareProgress: { type: Boolean, default: true },
          allowAnalytics: { type: Boolean, default: true },
        },
      },
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for email and tenant lookup
UserSchema.index({ email: 1, tenantId: 1 }, { unique: true });
UserSchema.index({ tenantId: 1, role: 1 });
UserSchema.index({ ssoId: 1, ssoProvider: 1 });

// Virtual for full name
UserSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Transform output
UserSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    delete ret.emailVerificationToken;
    delete ret.passwordResetToken;
    delete ret.passwordResetExpires;
    return ret;
  },
});

export const User = mongoose.model<IUser>('User', UserSchema);
