import mongoose, { Document, Schema } from 'mongoose';

export interface ISessionNote {
  author: mongoose.Types.ObjectId;
  content: string;
  isPrivate: boolean;
  createdAt: Date;
}

export interface ISessionRecording {
  url: string;
  duration: number; // in seconds
  size: number; // in bytes
  format: string;
  uploadedAt: Date;
}

export interface IActionItem {
  _id: mongoose.Types.ObjectId;
  description: string;
  assignedTo: 'student' | 'mentor';
  dueDate?: Date;
  completed: boolean;
  completedAt?: Date;
}

export interface ISessionFeedback {
  rating: number; // 1-5
  comment: string;
  wouldRecommend: boolean;
  whatWentWell?: string;
  whatToImprove?: string;
  createdAt: Date;
}

export interface IMentorshipSession extends Document {
  _id: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;

  // Participants
  mentorId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  programId?: mongoose.Types.ObjectId; // If part of a structured program

  // Session Details
  type: 'one-on-one' | 'office-hours' | 'group' | 'workshop';
  title: string;
  description?: string;
  agenda?: string[];

  // Scheduling
  scheduledAt: Date;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  timezone: string;

  // Status
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  cancellationReason?: string;
  cancelledBy?: 'mentor' | 'student' | 'system';
  cancelledAt?: Date;

  // Meeting Details
  meetingLink?: string;
  meetingProvider: 'zoom' | 'google-meet' | 'webrtc' | 'teams';
  meetingId?: string;
  meetingPassword?: string;

  // Session Content
  notes: ISessionNote[];
  sharedResources: {
    type: 'link' | 'file' | 'code' | 'document';
    title: string;
    url: string;
    uploadedBy: mongoose.Types.ObjectId;
    uploadedAt: Date;
  }[];
  recordings: ISessionRecording[];

  // Collaboration
  whiteboardData?: string; // JSON string of whiteboard state
  codeSnapshots: {
    language: string;
    code: string;
    timestamp: Date;
    description?: string;
  }[];

  // Outcomes
  actionItems: IActionItem[];
  goals: string[];
  goalsAchieved: string[];

  // Feedback
  studentFeedback?: ISessionFeedback;
  mentorFeedback?: ISessionFeedback;

  // Payment
  isPaid: boolean;
  amount: number;
  currency: string;
  paymentStatus: 'pending' | 'completed' | 'refunded' | 'failed' | 'not-required';
  paymentId?: string;
  paymentMethod?: string;

  // Reminders
  reminders: {
    type: 'email' | 'sms' | 'push';
    sentAt: Date;
    delivered: boolean;
  }[];

  // Attendance
  mentorJoinedAt?: Date;
  studentJoinedAt?: Date;
  mentorLeftAt?: Date;
  studentLeftAt?: Date;
  actualDuration?: number; // in minutes

  // Follow-up
  followUpScheduled: boolean;
  followUpSessionId?: mongoose.Types.ObjectId;

  // Metadata
  tags: string[];
  isRecurring: boolean;
  recurringSeriesId?: mongoose.Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const SessionNoteSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  isPrivate: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const SessionRecordingSchema = new Schema({
  url: { type: String, required: true },
  duration: { type: Number, required: true },
  size: { type: Number, required: true },
  format: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

const ActionItemSchema = new Schema({
  description: { type: String, required: true },
  assignedTo: {
    type: String,
    enum: ['student', 'mentor'],
    required: true,
  },
  dueDate: Date,
  completed: { type: Boolean, default: false },
  completedAt: Date,
});

const SessionFeedbackSchema = new Schema({
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  wouldRecommend: { type: Boolean, required: true },
  whatWentWell: String,
  whatToImprove: String,
  createdAt: { type: Date, default: Date.now },
});

const MentorshipSessionSchema = new Schema<IMentorshipSession>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
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
    programId: {
      type: Schema.Types.ObjectId,
      ref: 'MentorshipProgram',
      index: true,
    },
    type: {
      type: String,
      enum: ['one-on-one', 'office-hours', 'group', 'workshop'],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    description: {
      type: String,
      maxlength: 2000,
    },
    agenda: [String],
    scheduledAt: {
      type: Date,
      required: true,
      index: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 15,
    },
    timezone: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
      default: 'scheduled',
      index: true,
    },
    cancellationReason: String,
    cancelledBy: {
      type: String,
      enum: ['mentor', 'student', 'system'],
    },
    cancelledAt: Date,
    meetingLink: String,
    meetingProvider: {
      type: String,
      enum: ['zoom', 'google-meet', 'webrtc', 'teams'],
      required: true,
    },
    meetingId: String,
    meetingPassword: String,
    notes: [SessionNoteSchema],
    sharedResources: [
      {
        type: {
          type: String,
          enum: ['link', 'file', 'code', 'document'],
          required: true,
        },
        title: { type: String, required: true },
        url: { type: String, required: true },
        uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    recordings: [SessionRecordingSchema],
    whiteboardData: String,
    codeSnapshots: [
      {
        language: { type: String, required: true },
        code: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        description: String,
      },
    ],
    actionItems: [ActionItemSchema],
    goals: [String],
    goalsAchieved: [String],
    studentFeedback: SessionFeedbackSchema,
    mentorFeedback: SessionFeedbackSchema,
    isPaid: {
      type: Boolean,
      default: false,
    },
    amount: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'refunded', 'failed', 'not-required'],
      default: 'not-required',
      index: true,
    },
    paymentId: String,
    paymentMethod: String,
    reminders: [
      {
        type: {
          type: String,
          enum: ['email', 'sms', 'push'],
          required: true,
        },
        sentAt: { type: Date, required: true },
        delivered: { type: Boolean, default: false },
      },
    ],
    mentorJoinedAt: Date,
    studentJoinedAt: Date,
    mentorLeftAt: Date,
    studentLeftAt: Date,
    actualDuration: Number,
    followUpScheduled: {
      type: Boolean,
      default: false,
    },
    followUpSessionId: {
      type: Schema.Types.ObjectId,
      ref: 'MentorshipSession',
    },
    tags: [String],
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringSeriesId: {
      type: Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
MentorshipSessionSchema.index({ mentorId: 1, scheduledAt: 1 });
MentorshipSessionSchema.index({ studentId: 1, scheduledAt: 1 });
MentorshipSessionSchema.index({ tenantId: 1, status: 1 });
MentorshipSessionSchema.index({ scheduledAt: 1, status: 1 });
MentorshipSessionSchema.index({ programId: 1 });

// Methods
MentorshipSessionSchema.methods.addNote = function (
  author: mongoose.Types.ObjectId,
  content: string,
  isPrivate = false
): void {
  this.notes.push({
    author,
    content,
    isPrivate,
    createdAt: new Date(),
  });
};

MentorshipSessionSchema.methods.addActionItem = function (
  description: string,
  assignedTo: 'student' | 'mentor',
  dueDate?: Date
): void {
  this.actionItems.push({
    _id: new mongoose.Types.ObjectId(),
    description,
    assignedTo,
    dueDate,
    completed: false,
  });
};

MentorshipSessionSchema.methods.completeActionItem = function (actionItemId: string): boolean {
  const item = this.actionItems.id(actionItemId);
  if (item) {
    item.completed = true;
    item.completedAt = new Date();
    return true;
  }
  return false;
};

MentorshipSessionSchema.methods.cancel = function (
  cancelledBy: 'mentor' | 'student' | 'system',
  reason?: string
): void {
  this.status = 'cancelled';
  this.cancelledBy = cancelledBy;
  this.cancelledAt = new Date();
  if (reason) {
    this.cancellationReason = reason;
  }
};

MentorshipSessionSchema.methods.markAsCompleted = function (): void {
  this.status = 'completed';
  if (this.mentorJoinedAt && this.mentorLeftAt) {
    this.actualDuration = Math.floor(
      (this.mentorLeftAt.getTime() - this.mentorJoinedAt.getTime()) / 60000
    );
  }
};

MentorshipSessionSchema.methods.canBeCancelled = function (): boolean {
  if (this.status !== 'scheduled' && this.status !== 'confirmed') {
    return false;
  }

  // Can't cancel if session starts in less than 24 hours
  const hoursUntilSession = (this.scheduledAt.getTime() - Date.now()) / (1000 * 60 * 60);
  return hoursUntilSession >= 24;
};

MentorshipSessionSchema.methods.canBeRescheduled = function (): boolean {
  return this.canBeCancelled();
};

// Transform output
MentorshipSessionSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    // Don't expose meeting password in JSON responses
    if (ret.meetingPassword) {
      ret.meetingPassword = '***';
    }
    return ret;
  },
});

export const MentorshipSession = mongoose.model<IMentorshipSession>(
  'MentorshipSession',
  MentorshipSessionSchema
);
