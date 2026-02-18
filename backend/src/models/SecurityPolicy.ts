import mongoose, { Document, Schema } from 'mongoose';

export interface ISecurityPolicy extends Document {
  _id: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  ipWhitelist: string[]; // CIDR ranges
  ipBlacklist: string[]; // CIDR ranges
  geoRestrictions?: {
    allowedCountries?: string[]; // ISO country codes
    blockedCountries?: string[]; // ISO country codes
  };
  passwordPolicy: {
    minLength: number;
    maxLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    specialCharsSet?: string;
    expirationDays?: number;
    preventReuse: number; // number of previous passwords to check
    lockoutThreshold: number; // failed attempts before lockout
    lockoutDuration: number; // minutes
  };
  mfaPolicy: {
    required: boolean;
    allowedMethods: ('totp' | 'sms' | 'email' | 'backup_codes')[];
    gracePeriodDays?: number; // days to enforce MFA after activation
  };
  sessionPolicy: {
    maxConcurrentSessions: number;
    sessionTimeoutMinutes: number;
    absoluteTimeoutMinutes?: number; // max session duration regardless of activity
    requireReauthForSensitive: boolean;
    reauthTimeoutMinutes: number;
  };
  rateLimiting: {
    loginAttempts: {
      maxAttempts: number;
      windowMinutes: number;
    };
    apiCalls: {
      maxPerHour: number;
      maxPerDay: number;
    };
  };
  auditSettings: {
    logAuthEvents: boolean;
    logDataAccess: boolean;
    logAdminActions: boolean;
    logSecurityEvents: boolean;
    retentionDays: number;
  };
  complianceMode?: 'standard' | 'hipaa' | 'gdpr' | 'sox' | 'pci-dss';
  customRules?: Array<{
    name: string;
    description: string;
    rule: string; // regex or expression
    action: 'allow' | 'deny' | 'log';
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const SecurityPolicySchema = new Schema<ISecurityPolicy>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      unique: true,
      index: true,
    },
    ipWhitelist: {
      type: [String],
      default: [],
    },
    ipBlacklist: {
      type: [String],
      default: [],
    },
    geoRestrictions: {
      allowedCountries: [String],
      blockedCountries: [String],
    },
    passwordPolicy: {
      minLength: { type: Number, default: 8, min: 6, max: 128 },
      maxLength: { type: Number, default: 128, min: 8, max: 256 },
      requireUppercase: { type: Boolean, default: true },
      requireLowercase: { type: Boolean, default: true },
      requireNumbers: { type: Boolean, default: true },
      requireSpecialChars: { type: Boolean, default: false },
      specialCharsSet: { type: String, default: '!@#$%^&*()_+-=[]{}|;:,.<>?' },
      expirationDays: { type: Number, min: 0 },
      preventReuse: { type: Number, default: 5, min: 0, max: 24 },
      lockoutThreshold: { type: Number, default: 5, min: 3, max: 10 },
      lockoutDuration: { type: Number, default: 30, min: 5, max: 1440 },
    },
    mfaPolicy: {
      required: { type: Boolean, default: false },
      allowedMethods: {
        type: [String],
        enum: ['totp', 'sms', 'email', 'backup_codes'],
        default: ['totp', 'email'],
      },
      gracePeriodDays: { type: Number, default: 7, min: 0, max: 90 },
    },
    sessionPolicy: {
      maxConcurrentSessions: { type: Number, default: 3, min: 1, max: 10 },
      sessionTimeoutMinutes: { type: Number, default: 480, min: 15, max: 43200 }, // 8 hours default, max 30 days
      absoluteTimeoutMinutes: { type: Number, min: 60, max: 43200 },
      requireReauthForSensitive: { type: Boolean, default: true },
      reauthTimeoutMinutes: { type: Number, default: 15, min: 5, max: 60 },
    },
    rateLimiting: {
      loginAttempts: {
        maxAttempts: { type: Number, default: 5, min: 3, max: 20 },
        windowMinutes: { type: Number, default: 15, min: 5, max: 60 },
      },
      apiCalls: {
        maxPerHour: { type: Number, default: 1000, min: 100, max: 100000 },
        maxPerDay: { type: Number, default: 10000, min: 1000, max: 1000000 },
      },
    },
    auditSettings: {
      logAuthEvents: { type: Boolean, default: true },
      logDataAccess: { type: Boolean, default: false },
      logAdminActions: { type: Boolean, default: true },
      logSecurityEvents: { type: Boolean, default: true },
      retentionDays: { type: Number, default: 90, min: 30, max: 2555 }, // max 7 years
    },
    complianceMode: {
      type: String,
      enum: ['standard', 'hipaa', 'gdpr', 'sox', 'pci-dss'],
      default: 'standard',
    },
    customRules: [{
      name: { type: String, required: true },
      description: String,
      rule: { type: String, required: true },
      action: {
        type: String,
        enum: ['allow', 'deny', 'log'],
        default: 'log',
      },
    }],
  },
  {
    timestamps: true,
  }
);

// Index for tenant lookups
SecurityPolicySchema.index({ tenantId: 1 });

// Method to validate password against policy
SecurityPolicySchema.methods.validatePassword = function (password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const policy = this.passwordPolicy;

  if (password.length < policy.minLength) {
    errors.push(`Password must be at least ${policy.minLength} characters long`);
  }

  if (password.length > policy.maxLength) {
    errors.push(`Password must not exceed ${policy.maxLength} characters`);
  }

  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (policy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (policy.requireNumbers && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (policy.requireSpecialChars) {
    const specialChars = policy.specialCharsSet || '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const regex = new RegExp(`[${specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`);
    if (!regex.test(password)) {
      errors.push('Password must contain at least one special character');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

// Method to check if IP is allowed
SecurityPolicySchema.methods.isIpAllowed = function (ip: string): boolean {
  // If whitelist exists and has entries, IP must be in whitelist
  if (this.ipWhitelist && this.ipWhitelist.length > 0) {
    return this.ipWhitelist.some((range: string) => this.ipMatchesCidr(ip, range));
  }

  // Check if IP is in blacklist
  if (this.ipBlacklist && this.ipBlacklist.length > 0) {
    return !this.ipBlacklist.some((range: string) => this.ipMatchesCidr(ip, range));
  }

  return true;
};

// Helper method to check if IP matches CIDR range
SecurityPolicySchema.methods.ipMatchesCidr = function (ip: string, cidr: string): boolean {
  // Simple implementation - in production, use a library like 'ip-range-check'
  if (!cidr.includes('/')) {
    return ip === cidr;
  }

  // For now, just check exact match or wildcard
  const [network] = cidr.split('/');
  return ip.startsWith(network.substring(0, network.lastIndexOf('.')));
};

// Transform output
SecurityPolicySchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const SecurityPolicy = mongoose.model<ISecurityPolicy>('SecurityPolicy', SecurityPolicySchema);
