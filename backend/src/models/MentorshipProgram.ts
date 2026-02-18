import mongoose, { Document, Schema } from 'mongoose';

export interface IMilestone {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  order: number;
  targetDate?: Date;
  completedDate?: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'skipped';
  deliverables: string[];
  notes?: string;
}

export interface ICheckIn {
  scheduledDate: Date;
  completedDate?: Date;
  status: 'scheduled' | 'completed' | 'missed';
  summary?: string;
  challenges?: string;
  achievements?: string;
  nextSteps?: string;
  sessionId?: mongoose.Types.ObjectId;
}

export interface IGoal {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: 'skill' | 'career' | 'project' | 'certification' | 'interview' | 'other';
  targetDate?: Date;
  status: 'active' | 'achieved' | 'deferred' | 'cancelled';
  progress: number; // 0-100
  achievedDate?: Date;
  metrics?: {
    name: string;
    current: number;
    target: number;
    unit: string;
  }[];
}

export interface ISkillGap {
  skill: string;
  currentLevel: 'none' | 'beginner' | 'intermediate' | 'advanced' | 'expert';
  targetLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  priority: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  resources: {
    type: 'course' | 'article' | 'video' | 'project' | 'book';
    title: string;
    url: string;
  }[];
}

export interface IProgramReport {
  generatedAt: Date;
  generatedBy: mongoose.Types.ObjectId;
  type: 'weekly' | 'monthly' | 'milestone' | 'final';
  summary: string;
  progressPercentage: number;
  goalsAchieved: number;
  goalsPending: number;
  sessionsCompleted: number;
  sessionsScheduled: number;
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
  nextSteps: string[];
}

export interface IMentorshipProgram extends Document {
  _id: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;

  // Program Details
  name: string;
  description: string;
  type: 'career-transition' | 'skill-development' | 'interview-prep' | 'leadership' | 'custom';
  duration: number; // in weeks
  startDate: Date;
  endDate: Date;
  expectedHoursPerWeek: number;

  // Participants
  mentorId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;

  // Status
  status: 'pending' | 'active' | 'on-hold' | 'completed' | 'cancelled' | 'suspended';
  statusReason?: string;

  // Structure
  milestones: IMilestone[];
  checkIns: ICheckIn[];
  frequency: 'weekly' | 'bi-weekly' | 'monthly' | 'custom';

  // Goals & Progress
  goals: IGoal[];
  skillGaps: ISkillGap[];
  learningPath: {
    phase: string;
    topics: string[];
    resources: string[];
    completed: boolean;
  }[];

  // Career Focus
  careerGoals: {
    targetRole?: string;
    targetCompany?: string;
    targetSalary?: number;
    desiredIndustries?: string[];
    timeframe?: string; // e.g., "3-6 months"
  };

  // Documents & Resources
  documents: {
    type: 'resume' | 'portfolio' | 'cover-letter' | 'linkedin' | 'other';
    name: string;
    url: string;
    version: number;
    uploadedBy: mongoose.Types.ObjectId;
    uploadedAt: Date;
    feedback?: string;
    status: 'draft' | 'review' | 'approved' | 'needs-revision';
  }[];

  // Progress Tracking
  progress: {
    overall: number; // 0-100
    skills: number;
    career: number;
    goals: number;
    lastUpdatedAt: Date;
  };

  // Reports
  reports: IProgramReport[];

  // Sessions
  totalSessions: number;
  completedSessions: number;
  upcomingSessions: number;
  sessionIds: mongoose.Types.ObjectId[];

  // Mock Interviews
  mockInterviews: {
    scheduledDate: Date;
    completedDate?: Date;
    type: 'technical' | 'behavioral' | 'system-design' | 'case-study' | 'combined';
    company?: string;
    role?: string;
    feedback?: {
      strengths: string[];
      weaknesses: string[];
      technicalScore: number;
      communicationScore: number;
      problemSolvingScore: number;
      overallScore: number;
      recommendation: string;
    };
    recording?: string;
    sessionId?: mongoose.Types.ObjectId;
  }[];

  // Job Applications
  jobApplications: {
    company: string;
    role: string;
    url: string;
    appliedDate: Date;
    status: 'applied' | 'screening' | 'interview' | 'offer' | 'rejected' | 'withdrawn';
    notes?: string;
    interviews: {
      date: Date;
      type: string;
      outcome?: string;
    }[];
    offer?: {
      salary: number;
      equity?: string;
      benefits?: string;
      acceptedDate?: Date;
    };
  }[];

  // Templates & Resources
  templateId?: mongoose.Types.ObjectId;
  sharedResources: {
    title: string;
    description?: string;
    type: 'link' | 'file' | 'video' | 'course' | 'book';
    url: string;
    addedBy: mongoose.Types.ObjectId;
    addedAt: Date;
  }[];

  // Communication
  lastContactDate: Date;
  communicationChannel: ('platform' | 'email' | 'slack' | 'whatsapp')[];

  // Pricing & Payment
  pricing: {
    total: number;
    currency: string;
    paymentSchedule: 'upfront' | 'monthly' | 'per-session' | 'milestone-based';
    installments?: {
      amount: number;
      dueDate: Date;
      paidDate?: Date;
      status: 'pending' | 'paid' | 'overdue';
    }[];
  };

  // Completion
  completionCriteria: {
    minimumSessions: number;
    requiredMilestones: string[];
    skillsToAchieve: string[];
    customCriteria?: string[];
  };
  completedAt?: Date;
  completionCertificate?: string;

  // Ratings & Feedback
  studentRating?: {
    rating: number;
    feedback: string;
    wouldRecommend: boolean;
    createdAt: Date;
  };
  mentorRating?: {
    rating: number;
    feedback: string;
    studentEngagement: number;
    createdAt: Date;
  };

  // Metadata
  tags: string[];
  isTemplate: boolean;
  visibility: 'private' | 'shared' | 'public';

  createdAt: Date;
  updatedAt: Date;
}

const MilestoneSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  order: { type: Number, required: true },
  targetDate: Date,
  completedDate: Date,
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'skipped'],
    default: 'pending',
  },
  deliverables: [String],
  notes: String,
});

const CheckInSchema = new Schema({
  scheduledDate: { type: Date, required: true },
  completedDate: Date,
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'missed'],
    default: 'scheduled',
  },
  summary: String,
  challenges: String,
  achievements: String,
  nextSteps: String,
  sessionId: { type: Schema.Types.ObjectId, ref: 'MentorshipSession' },
});

const GoalSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['skill', 'career', 'project', 'certification', 'interview', 'other'],
    required: true,
  },
  targetDate: Date,
  status: {
    type: String,
    enum: ['active', 'achieved', 'deferred', 'cancelled'],
    default: 'active',
  },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  achievedDate: Date,
  metrics: [
    {
      name: String,
      current: Number,
      target: Number,
      unit: String,
    },
  ],
});

const SkillGapSchema = new Schema({
  skill: { type: String, required: true },
  currentLevel: {
    type: String,
    enum: ['none', 'beginner', 'intermediate', 'advanced', 'expert'],
    required: true,
  },
  targetLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    required: true,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  recommendations: [String],
  resources: [
    {
      type: {
        type: String,
        enum: ['course', 'article', 'video', 'project', 'book'],
      },
      title: String,
      url: String,
    },
  ],
});

const ProgramReportSchema = new Schema({
  generatedAt: { type: Date, default: Date.now },
  generatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['weekly', 'monthly', 'milestone', 'final'],
    required: true,
  },
  summary: { type: String, required: true },
  progressPercentage: { type: Number, required: true, min: 0, max: 100 },
  goalsAchieved: { type: Number, default: 0 },
  goalsPending: { type: Number, default: 0 },
  sessionsCompleted: { type: Number, default: 0 },
  sessionsScheduled: { type: Number, default: 0 },
  strengths: [String],
  areasForImprovement: [String],
  recommendations: [String],
  nextSteps: [String],
});

const MentorshipProgramSchema = new Schema<IMentorshipProgram>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    type: {
      type: String,
      enum: ['career-transition', 'skill-development', 'interview-prep', 'leadership', 'custom'],
      required: true,
      index: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    startDate: {
      type: Date,
      required: true,
      index: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    expectedHoursPerWeek: {
      type: Number,
      default: 2,
      min: 1,
    },
    mentorId: {
      type: Schema.Types.ObjectId,
      ref: 'Mentor',
      required: true,
      index: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'on-hold', 'completed', 'cancelled', 'suspended'],
      default: 'pending',
      index: true,
    },
    statusReason: String,
    milestones: [MilestoneSchema],
    checkIns: [CheckInSchema],
    frequency: {
      type: String,
      enum: ['weekly', 'bi-weekly', 'monthly', 'custom'],
      default: 'weekly',
    },
    goals: [GoalSchema],
    skillGaps: [SkillGapSchema],
    learningPath: [
      {
        phase: { type: String, required: true },
        topics: [String],
        resources: [String],
        completed: { type: Boolean, default: false },
      },
    ],
    careerGoals: {
      targetRole: String,
      targetCompany: String,
      targetSalary: Number,
      desiredIndustries: [String],
      timeframe: String,
    },
    documents: [
      {
        type: {
          type: String,
          enum: ['resume', 'portfolio', 'cover-letter', 'linkedin', 'other'],
          required: true,
        },
        name: { type: String, required: true },
        url: { type: String, required: true },
        version: { type: Number, default: 1 },
        uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        uploadedAt: { type: Date, default: Date.now },
        feedback: String,
        status: {
          type: String,
          enum: ['draft', 'review', 'approved', 'needs-revision'],
          default: 'draft',
        },
      },
    ],
    progress: {
      overall: { type: Number, default: 0, min: 0, max: 100 },
      skills: { type: Number, default: 0, min: 0, max: 100 },
      career: { type: Number, default: 0, min: 0, max: 100 },
      goals: { type: Number, default: 0, min: 0, max: 100 },
      lastUpdatedAt: { type: Date, default: Date.now },
    },
    reports: [ProgramReportSchema],
    totalSessions: { type: Number, default: 0 },
    completedSessions: { type: Number, default: 0 },
    upcomingSessions: { type: Number, default: 0 },
    sessionIds: [{ type: Schema.Types.ObjectId, ref: 'MentorshipSession' }],
    mockInterviews: [
      {
        scheduledDate: { type: Date, required: true },
        completedDate: Date,
        type: {
          type: String,
          enum: ['technical', 'behavioral', 'system-design', 'case-study', 'combined'],
          required: true,
        },
        company: String,
        role: String,
        feedback: {
          strengths: [String],
          weaknesses: [String],
          technicalScore: { type: Number, min: 0, max: 10 },
          communicationScore: { type: Number, min: 0, max: 10 },
          problemSolvingScore: { type: Number, min: 0, max: 10 },
          overallScore: { type: Number, min: 0, max: 10 },
          recommendation: String,
        },
        recording: String,
        sessionId: { type: Schema.Types.ObjectId, ref: 'MentorshipSession' },
      },
    ],
    jobApplications: [
      {
        company: { type: String, required: true },
        role: { type: String, required: true },
        url: String,
        appliedDate: { type: Date, required: true },
        status: {
          type: String,
          enum: ['applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn'],
          default: 'applied',
        },
        notes: String,
        interviews: [
          {
            date: { type: Date, required: true },
            type: { type: String, required: true },
            outcome: String,
          },
        ],
        offer: {
          salary: Number,
          equity: String,
          benefits: String,
          acceptedDate: Date,
        },
      },
    ],
    templateId: {
      type: Schema.Types.ObjectId,
      ref: 'MentorshipProgram',
    },
    sharedResources: [
      {
        title: { type: String, required: true },
        description: String,
        type: {
          type: String,
          enum: ['link', 'file', 'video', 'course', 'book'],
          required: true,
        },
        url: { type: String, required: true },
        addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    lastContactDate: {
      type: Date,
      default: Date.now,
    },
    communicationChannel: {
      type: [String],
      enum: ['platform', 'email', 'slack', 'whatsapp'],
      default: ['platform'],
    },
    pricing: {
      total: { type: Number, required: true, min: 0 },
      currency: { type: String, default: 'USD' },
      paymentSchedule: {
        type: String,
        enum: ['upfront', 'monthly', 'per-session', 'milestone-based'],
        default: 'upfront',
      },
      installments: [
        {
          amount: { type: Number, required: true },
          dueDate: { type: Date, required: true },
          paidDate: Date,
          status: {
            type: String,
            enum: ['pending', 'paid', 'overdue'],
            default: 'pending',
          },
        },
      ],
    },
    completionCriteria: {
      minimumSessions: { type: Number, default: 8 },
      requiredMilestones: [String],
      skillsToAchieve: [String],
      customCriteria: [String],
    },
    completedAt: Date,
    completionCertificate: String,
    studentRating: {
      rating: { type: Number, min: 1, max: 5 },
      feedback: String,
      wouldRecommend: Boolean,
      createdAt: Date,
    },
    mentorRating: {
      rating: { type: Number, min: 1, max: 5 },
      feedback: String,
      studentEngagement: { type: Number, min: 1, max: 5 },
      createdAt: Date,
    },
    tags: [String],
    isTemplate: {
      type: Boolean,
      default: false,
    },
    visibility: {
      type: String,
      enum: ['private', 'shared', 'public'],
      default: 'private',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
MentorshipProgramSchema.index({ tenantId: 1, status: 1 });
MentorshipProgramSchema.index({ mentorId: 1, status: 1 });
MentorshipProgramSchema.index({ studentId: 1, status: 1 });
MentorshipProgramSchema.index({ startDate: 1, endDate: 1 });
MentorshipProgramSchema.index({ type: 1 });
MentorshipProgramSchema.index({ isTemplate: 1 });

// Methods
MentorshipProgramSchema.methods.updateProgress = function (): void {
  // Calculate overall progress
  const completedMilestones = this.milestones.filter((m) => m.status === 'completed').length;
  const totalMilestones = this.milestones.length;
  const milestoneProgress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

  const achievedGoals = this.goals.filter((g) => g.status === 'achieved').length;
  const totalGoals = this.goals.length;
  const goalProgress = totalGoals > 0 ? (achievedGoals / totalGoals) * 100 : 0;

  const sessionProgress =
    this.totalSessions > 0 ? (this.completedSessions / this.totalSessions) * 100 : 0;

  this.progress.overall = Math.round((milestoneProgress + goalProgress + sessionProgress) / 3);
  this.progress.goals = Math.round(goalProgress);
  this.progress.lastUpdatedAt = new Date();
};

MentorshipProgramSchema.methods.addGoal = function (
  title: string,
  description: string,
  category: string,
  targetDate?: Date
): void {
  this.goals.push({
    _id: new mongoose.Types.ObjectId(),
    title,
    description,
    category,
    targetDate,
    status: 'active',
    progress: 0,
  });
};

MentorshipProgramSchema.methods.achieveGoal = function (goalId: string): boolean {
  const goal = this.goals.id(goalId);
  if (goal && goal.status === 'active') {
    goal.status = 'achieved';
    goal.progress = 100;
    goal.achievedDate = new Date();
    this.updateProgress();
    return true;
  }
  return false;
};

MentorshipProgramSchema.methods.completeMilestone = function (milestoneId: string): boolean {
  const milestone = this.milestones.id(milestoneId);
  if (milestone) {
    milestone.status = 'completed';
    milestone.completedDate = new Date();
    this.updateProgress();
    return true;
  }
  return false;
};

MentorshipProgramSchema.methods.isCompleted = function (): boolean {
  if (this.status === 'completed') return true;

  const criteria = this.completionCriteria;
  if (this.completedSessions < criteria.minimumSessions) return false;

  if (criteria.requiredMilestones && criteria.requiredMilestones.length > 0) {
    const completedMilestones = this.milestones
      .filter((m) => m.status === 'completed')
      .map((m) => m.title);
    const hasAllRequired = criteria.requiredMilestones.every((req) =>
      completedMilestones.includes(req)
    );
    if (!hasAllRequired) return false;
  }

  return true;
};

MentorshipProgramSchema.methods.addCheckIn = function (scheduledDate: Date): void {
  this.checkIns.push({
    scheduledDate,
    status: 'scheduled',
  });
};

MentorshipProgramSchema.methods.completeCheckIn = function (
  checkInIndex: number,
  summary: string,
  challenges?: string,
  achievements?: string,
  nextSteps?: string
): boolean {
  if (checkInIndex >= 0 && checkInIndex < this.checkIns.length) {
    const checkIn = this.checkIns[checkInIndex];
    checkIn.status = 'completed';
    checkIn.completedDate = new Date();
    checkIn.summary = summary;
    if (challenges) checkIn.challenges = challenges;
    if (achievements) checkIn.achievements = achievements;
    if (nextSteps) checkIn.nextSteps = nextSteps;
    this.lastContactDate = new Date();
    return true;
  }
  return false;
};

// Transform output
MentorshipProgramSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const MentorshipProgram = mongoose.model<IMentorshipProgram>(
  'MentorshipProgram',
  MentorshipProgramSchema
);
