import mongoose, { Document, Schema } from 'mongoose';

export interface ITenantBranding {
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  favicon?: string;
  customCss?: string;
  loginPageTitle?: string;
  loginPageSubtitle?: string;
}

export interface ITenantQuotas {
  maxUsers: number;
  maxStorage: number; // in MB
  maxApiCallsPerHour: number;
  maxConcurrentSessions: number;
  features: string[]; // enabled features
}

export interface ITenantSsoConfig {
  enabled: boolean;
  provider?: 'saml' | 'oauth2' | 'ldap';
  saml?: {
    entryPoint: string;
    issuer: string;
    cert: string;
    callbackUrl: string;
  };
  oauth2?: {
    provider: 'google' | 'microsoft' | 'okta' | 'custom';
    clientId: string;
    clientSecret: string;
    authorizationUrl: string;
    tokenUrl: string;
    userInfoUrl: string;
    callbackUrl: string;
    scopes: string[];
  };
  ldap?: {
    url: string;
    bindDn: string;
    bindCredentials: string;
    searchBase: string;
    searchFilter: string;
    usernameField: string;
    emailField: string;
  };
}

export interface ITenantSettings {
  passwordPolicy?: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    expirationDays?: number;
    preventReuse?: number; // number of previous passwords to check
  };
  sessionPolicy?: {
    maxConcurrentSessions: number;
    sessionTimeoutMinutes: number;
    requireMfa?: boolean;
  };
  ipWhitelist?: string[]; // array of CIDR ranges
  allowedDomains?: string[]; // email domains allowed to register
  customFields?: Record<string, any>;
}

export interface ITenant extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string; // unique tenant identifier in URLs
  domain?: string; // custom domain
  status: 'active' | 'suspended' | 'trial' | 'deleted';
  plan: 'free' | 'starter' | 'professional' | 'enterprise';
  branding: ITenantBranding;
  quotas: ITenantQuotas;
  ssoConfig: ITenantSsoConfig;
  settings: ITenantSettings;
  ownerId: mongoose.Types.ObjectId; // primary tenant admin
  admins: mongoose.Types.ObjectId[]; // additional tenant admins
  billing?: {
    stripeCustomerId?: string;
    subscriptionId?: string;
    subscriptionStatus?: string;
    currentPeriodEnd?: Date;
  };
  usage?: {
    users: number;
    storage: number; // in MB
    apiCallsThisHour: number;
    lastApiCallReset: Date;
  };
  trialEndsAt?: Date;
  suspendedAt?: Date;
  suspendedBy?: mongoose.Types.ObjectId;
  suspendedReason?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const TenantSchema = new Schema<ITenant>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: /^[a-z0-9-]+$/,
    },
    domain: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'trial', 'deleted'],
      default: 'trial',
      index: true,
    },
    plan: {
      type: String,
      enum: ['free', 'starter', 'professional', 'enterprise'],
      default: 'free',
      index: true,
    },
    branding: {
      logo: String,
      primaryColor: { type: String, default: '#3b82f6' },
      secondaryColor: { type: String, default: '#8b5cf6' },
      favicon: String,
      customCss: String,
      loginPageTitle: String,
      loginPageSubtitle: String,
    },
    quotas: {
      maxUsers: { type: Number, default: 10 },
      maxStorage: { type: Number, default: 1024 }, // 1GB default
      maxApiCallsPerHour: { type: Number, default: 1000 },
      maxConcurrentSessions: { type: Number, default: 5 },
      features: {
        type: [String],
        default: ['basic-lessons', 'flashcards', 'quizzes'],
      },
    },
    ssoConfig: {
      enabled: { type: Boolean, default: false },
      provider: {
        type: String,
        enum: ['saml', 'oauth2', 'ldap'],
      },
      saml: {
        entryPoint: String,
        issuer: String,
        cert: String,
        callbackUrl: String,
      },
      oauth2: {
        provider: {
          type: String,
          enum: ['google', 'microsoft', 'okta', 'custom'],
        },
        clientId: String,
        clientSecret: String,
        authorizationUrl: String,
        tokenUrl: String,
        userInfoUrl: String,
        callbackUrl: String,
        scopes: [String],
      },
      ldap: {
        url: String,
        bindDn: String,
        bindCredentials: String,
        searchBase: String,
        searchFilter: String,
        usernameField: { type: String, default: 'uid' },
        emailField: { type: String, default: 'mail' },
      },
    },
    settings: {
      passwordPolicy: {
        minLength: { type: Number, default: 8 },
        requireUppercase: { type: Boolean, default: true },
        requireLowercase: { type: Boolean, default: true },
        requireNumbers: { type: Boolean, default: true },
        requireSpecialChars: { type: Boolean, default: false },
        expirationDays: Number,
        preventReuse: Number,
      },
      sessionPolicy: {
        maxConcurrentSessions: { type: Number, default: 3 },
        sessionTimeoutMinutes: { type: Number, default: 480 }, // 8 hours
        requireMfa: { type: Boolean, default: false },
      },
      ipWhitelist: [String],
      allowedDomains: [String],
      customFields: Schema.Types.Mixed,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    admins: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    billing: {
      stripeCustomerId: String,
      subscriptionId: String,
      subscriptionStatus: String,
      currentPeriodEnd: Date,
    },
    usage: {
      users: { type: Number, default: 0 },
      storage: { type: Number, default: 0 },
      apiCallsThisHour: { type: Number, default: 0 },
      lastApiCallReset: { type: Date, default: Date.now },
    },
    trialEndsAt: Date,
    suspendedAt: Date,
    suspendedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    suspendedReason: String,
    metadata: Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

// Indexes
TenantSchema.index({ slug: 1 }, { unique: true });
TenantSchema.index({ domain: 1 }, { unique: true, sparse: true });
TenantSchema.index({ status: 1, plan: 1 });
TenantSchema.index({ ownerId: 1 });

// Virtual for checking if trial is active
TenantSchema.virtual('isTrialActive').get(function () {
  if (this.status !== 'trial' || !this.trialEndsAt) return false;
  return this.trialEndsAt > new Date();
});

// Method to check if feature is enabled
TenantSchema.methods.hasFeature = function (feature: string): boolean {
  return this.quotas.features.includes(feature);
};

// Method to check if quota is exceeded
TenantSchema.methods.isQuotaExceeded = function (
  quotaType: 'users' | 'storage' | 'apiCalls'
): boolean {
  switch (quotaType) {
    case 'users':
      return (this.usage?.users || 0) >= this.quotas.maxUsers;
    case 'storage':
      return (this.usage?.storage || 0) >= this.quotas.maxStorage;
    case 'apiCalls':
      // Reset counter if hour has passed
      const now = new Date();
      const lastReset = this.usage?.lastApiCallReset || now;
      const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);

      if (hoursSinceReset >= 1) {
        return false; // Will be reset
      }
      return (this.usage?.apiCallsThisHour || 0) >= this.quotas.maxApiCallsPerHour;
    default:
      return false;
  }
};

// Transform output
TenantSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    // Hide sensitive SSO credentials
    if (ret.ssoConfig) {
      if (ret.ssoConfig.oauth2?.clientSecret) {
        ret.ssoConfig.oauth2.clientSecret = '***';
      }
      if (ret.ssoConfig.ldap?.bindCredentials) {
        ret.ssoConfig.ldap.bindCredentials = '***';
      }
    }
    return ret;
  },
});

export const Tenant = mongoose.model<ITenant>('Tenant', TenantSchema);
