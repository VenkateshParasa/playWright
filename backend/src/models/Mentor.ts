import mongoose, { Document, Schema } from 'mongoose';

export interface IMentorExpertise {
  skill: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience: number;
}

export interface IMentorAvailability {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday
  startTime: string; // HH:mm format
  endTime: string;
  timezone: string;
}

export interface IMentorReview {
  studentId: mongoose.Types.ObjectId;
  rating: number; // 1-5
  comment: string;
  sessionId: mongoose.Types.ObjectId;
  createdAt: Date;
}

export interface IMentorStats {
  totalSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  averageRating: number;
  totalReviews: number;
  totalStudents: number;
  totalEarnings: number;
  responseTime: number; // in minutes
}

export interface IMentor extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;

  // Profile Information
  bio: string;
  title: string; // e.g., "Senior QA Engineer at Apple"
  yearsOfExperience: number;
  currentCompany?: string;
  previousCompanies?: string[];

  // Expertise
  expertise: IMentorExpertise[];
  specializations: string[]; // e.g., ['Playwright', 'Selenium', 'CI/CD']
  industries: string[]; // e.g., ['FinTech', 'E-commerce', 'Healthcare']

  // Communication
  languages: string[]; // e.g., ['English', 'Spanish']

  // Availability
  availability: IMentorAvailability[];
  timezone: string;
  maxSessionsPerWeek: number;

  // Session Preferences
  sessionTypes: ('one-on-one' | 'office-hours' | 'group' | 'workshop')[];
  sessionDurations: number[]; // in minutes, e.g., [30, 60, 90]

  // Pricing
  pricing: {
    oneOnOne: number; // per hour
    officeHours: number; // per session
    group: number; // per session
    workshop: number; // per workshop
  };
  acceptsFreeTrials: boolean;
  freeTrialDuration: number; // in minutes

  // Services Offered
  services: {
    careerCoaching: boolean;
    resumeReview: boolean;
    mockInterviews: boolean;
    codeReview: boolean;
    portfolioReview: boolean;
    linkedInOptimization: boolean;
    jobSearchAssistance: boolean;
    salaryNegotiation: boolean;
  };

  // Verification & Credentials
  isVerified: boolean;
  verificationBadges: ('expert' | 'top-rated' | 'certified' | 'industry-leader')[];
  certifications: {
    name: string;
    issuingOrganization: string;
    issueDate: Date;
    expiryDate?: Date;
    credentialUrl?: string;
  }[];

  // Social Links
  socialLinks: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    website?: string;
    portfolio?: string;
  };

  // Reviews & Ratings
  reviews: IMentorReview[];
  stats: IMentorStats;

  // Status
  status: 'active' | 'inactive' | 'on-break' | 'suspended';
  acceptingNewStudents: boolean;

  // Settings
  calendarIntegration: {
    provider?: 'google' | 'outlook' | 'apple';
    connected: boolean;
    syncEnabled: boolean;
    calendarId?: string;
  };

  videoConferencePreference: 'zoom' | 'google-meet' | 'webrtc' | 'teams';
  autoAcceptBookings: boolean;
  requireApproval: boolean;

  // Notifications
  notificationPreferences: {
    newBooking: boolean;
    cancellation: boolean;
    reminder: boolean;
    review: boolean;
    message: boolean;
  };

  // Additional Info
  introVideoUrl?: string;
  featuredReviews: mongoose.Types.ObjectId[]; // Review IDs
  customQuestionsForStudents?: string[];

  createdAt: Date;
  updatedAt: Date;
  lastActiveAt: Date;
}

const MentorExpertiseSchema = new Schema({
  skill: { type: String, required: true },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    required: true,
  },
  yearsOfExperience: { type: Number, required: true, min: 0 },
});

const MentorAvailabilitySchema = new Schema({
  dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  timezone: { type: String, required: true },
});

const MentorReviewSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  sessionId: { type: Schema.Types.ObjectId, ref: 'MentorshipSession', required: true },
  createdAt: { type: Date, default: Date.now },
});

const MentorStatsSchema = new Schema({
  totalSessions: { type: Number, default: 0 },
  completedSessions: { type: Number, default: 0 },
  cancelledSessions: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  totalStudents: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  responseTime: { type: Number, default: 0 }, // in minutes
});

const MentorSchema = new Schema<IMentor>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    bio: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    yearsOfExperience: {
      type: Number,
      required: true,
      min: 0,
    },
    currentCompany: String,
    previousCompanies: [String],
    expertise: [MentorExpertiseSchema],
    specializations: [String],
    industries: [String],
    languages: {
      type: [String],
      default: ['English'],
    },
    availability: [MentorAvailabilitySchema],
    timezone: {
      type: String,
      required: true,
      default: 'UTC',
    },
    maxSessionsPerWeek: {
      type: Number,
      default: 10,
      min: 1,
    },
    sessionTypes: {
      type: [String],
      enum: ['one-on-one', 'office-hours', 'group', 'workshop'],
      default: ['one-on-one'],
    },
    sessionDurations: {
      type: [Number],
      default: [30, 60],
    },
    pricing: {
      oneOnOne: { type: Number, default: 50 },
      officeHours: { type: Number, default: 25 },
      group: { type: Number, default: 30 },
      workshop: { type: Number, default: 100 },
    },
    acceptsFreeTrials: {
      type: Boolean,
      default: false,
    },
    freeTrialDuration: {
      type: Number,
      default: 15,
    },
    services: {
      careerCoaching: { type: Boolean, default: false },
      resumeReview: { type: Boolean, default: false },
      mockInterviews: { type: Boolean, default: false },
      codeReview: { type: Boolean, default: false },
      portfolioReview: { type: Boolean, default: false },
      linkedInOptimization: { type: Boolean, default: false },
      jobSearchAssistance: { type: Boolean, default: false },
      salaryNegotiation: { type: Boolean, default: false },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationBadges: {
      type: [String],
      enum: ['expert', 'top-rated', 'certified', 'industry-leader'],
      default: [],
    },
    certifications: [
      {
        name: { type: String, required: true },
        issuingOrganization: { type: String, required: true },
        issueDate: { type: Date, required: true },
        expiryDate: Date,
        credentialUrl: String,
      },
    ],
    socialLinks: {
      linkedin: String,
      github: String,
      twitter: String,
      website: String,
      portfolio: String,
    },
    reviews: [MentorReviewSchema],
    stats: {
      type: MentorStatsSchema,
      default: () => ({}),
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'on-break', 'suspended'],
      default: 'active',
      index: true,
    },
    acceptingNewStudents: {
      type: Boolean,
      default: true,
    },
    calendarIntegration: {
      provider: {
        type: String,
        enum: ['google', 'outlook', 'apple'],
      },
      connected: { type: Boolean, default: false },
      syncEnabled: { type: Boolean, default: false },
      calendarId: String,
    },
    videoConferencePreference: {
      type: String,
      enum: ['zoom', 'google-meet', 'webrtc', 'teams'],
      default: 'webrtc',
    },
    autoAcceptBookings: {
      type: Boolean,
      default: false,
    },
    requireApproval: {
      type: Boolean,
      default: true,
    },
    notificationPreferences: {
      newBooking: { type: Boolean, default: true },
      cancellation: { type: Boolean, default: true },
      reminder: { type: Boolean, default: true },
      review: { type: Boolean, default: true },
      message: { type: Boolean, default: true },
    },
    introVideoUrl: String,
    featuredReviews: [{ type: Schema.Types.ObjectId, ref: 'MentorshipSession' }],
    customQuestionsForStudents: [String],
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
MentorSchema.index({ tenantId: 1, status: 1 });
MentorSchema.index({ 'stats.averageRating': -1 });
MentorSchema.index({ specializations: 1 });
MentorSchema.index({ industries: 1 });
MentorSchema.index({ acceptingNewStudents: 1 });
MentorSchema.index({ isVerified: 1 });
MentorSchema.index({ 'pricing.oneOnOne': 1 });

// Text search index
MentorSchema.index({
  title: 'text',
  bio: 'text',
  specializations: 'text',
  industries: 'text',
});

// Methods
MentorSchema.methods.addReview = function (
  studentId: mongoose.Types.ObjectId,
  sessionId: mongoose.Types.ObjectId,
  rating: number,
  comment: string
): void {
  this.reviews.push({
    studentId,
    sessionId,
    rating,
    comment,
    createdAt: new Date(),
  });

  // Update stats
  this.stats.totalReviews = this.reviews.length;
  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.stats.averageRating = totalRating / this.reviews.length;
};

MentorSchema.methods.updateStats = function (sessionUpdate: {
  completed?: boolean;
  cancelled?: boolean;
  earnings?: number;
  newStudent?: boolean;
}): void {
  if (sessionUpdate.completed) {
    this.stats.totalSessions += 1;
    this.stats.completedSessions += 1;
  }
  if (sessionUpdate.cancelled) {
    this.stats.cancelledSessions += 1;
  }
  if (sessionUpdate.earnings) {
    this.stats.totalEarnings += sessionUpdate.earnings;
  }
  if (sessionUpdate.newStudent) {
    this.stats.totalStudents += 1;
  }
};

MentorSchema.methods.isAvailable = function (date: Date): boolean {
  if (this.status !== 'active' || !this.acceptingNewStudents) {
    return false;
  }

  const dayOfWeek = date.getDay();
  const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

  return this.availability.some(
    (slot) => slot.dayOfWeek === dayOfWeek && timeStr >= slot.startTime && timeStr <= slot.endTime
  );
};

// Transform output
MentorSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Mentor = mongoose.model<IMentor>('Mentor', MentorSchema);
