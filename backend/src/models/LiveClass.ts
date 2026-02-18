import mongoose, { Schema, Document } from 'mongoose';

export interface ILiveClass extends Document {
  title: string;
  description: string;
  courseId?: mongoose.Types.ObjectId;
  instructorId: mongoose.Types.ObjectId;
  coInstructors: mongoose.Types.ObjectId[];
  scheduledStartTime: Date;
  scheduledEndTime: Date;
  actualStartTime?: Date;
  actualEndTime?: Date;
  duration: number;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  streamConfig: {
    rtmpUrl?: string;
    streamKey?: string;
    webrtcUrl?: string;
    playbackUrl?: string;
    recordingUrl?: string;
  };
  recording: {
    enabled: boolean;
    status: 'not_started' | 'recording' | 'processing' | 'ready' | 'failed';
    url?: string;
    videoId?: mongoose.Types.ObjectId;
    duration?: number;
    size?: number;
  };
  participants: {
    userId: mongoose.Types.ObjectId;
    joinedAt: Date;
    leftAt?: Date;
    role: 'viewer' | 'moderator' | 'speaker';
    raisedHand: boolean;
    raisedHandAt?: Date;
    cameraEnabled: boolean;
    micEnabled: boolean;
    screenSharing: boolean;
  }[];
  maxParticipants: number;
  allowChat: boolean;
  allowQA: boolean;
  allowScreenShare: boolean;
  allowRecording: boolean;
  requireApproval: boolean;
  features: {
    whiteboard: boolean;
    breakoutRooms: boolean;
    polls: boolean;
    quizzes: boolean;
  };
  chat: {
    messageId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    message: string;
    timestamp: Date;
    isDeleted: boolean;
  }[];
  qaQueue: {
    questionId: string;
    userId: mongoose.Types.ObjectId;
    question: string;
    askedAt: Date;
    answeredAt?: Date;
    answeredBy?: mongoose.Types.ObjectId;
    answer?: string;
    upvotes: number;
    status: 'pending' | 'answered' | 'dismissed';
  }[];
  polls: {
    pollId: string;
    question: string;
    options: { text: string; votes: number }[];
    createdAt: Date;
    expiresAt?: Date;
    isActive: boolean;
  }[];
  attendance: {
    userId: mongoose.Types.ObjectId;
    joinedAt: Date;
    leftAt?: Date;
    duration: number;
    attended: boolean;
  }[];
  breakoutRooms: {
    roomId: string;
    name: string;
    participants: mongoose.Types.ObjectId[];
    createdAt: Date;
    closedAt?: Date;
  }[];
  analytics: {
    peakViewers: number;
    totalViews: number;
    averageDuration: number;
    engagementRate: number;
    chatMessages: number;
    questionsAsked: number;
  };
  thumbnail?: string;
  tags: string[];
  isPremium: boolean;
  accessCode?: string;
  notificationsSent: boolean;
  remindersSent: {
    oneDay: boolean;
    oneHour: boolean;
    fifteenMinutes: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const LiveClassSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
    },
    instructorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    coInstructors: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    scheduledStartTime: {
      type: Date,
      required: true,
    },
    scheduledEndTime: {
      type: Date,
      required: true,
    },
    actualStartTime: {
      type: Date,
    },
    actualEndTime: {
      type: Date,
    },
    duration: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['scheduled', 'live', 'ended', 'cancelled'],
      default: 'scheduled',
    },
    streamConfig: {
      rtmpUrl: { type: String },
      streamKey: { type: String },
      webrtcUrl: { type: String },
      playbackUrl: { type: String },
      recordingUrl: { type: String },
    },
    recording: {
      enabled: { type: Boolean, default: true },
      status: {
        type: String,
        enum: ['not_started', 'recording', 'processing', 'ready', 'failed'],
        default: 'not_started',
      },
      url: { type: String },
      videoId: { type: Schema.Types.ObjectId, ref: 'Video' },
      duration: { type: Number },
      size: { type: Number },
    },
    participants: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        joinedAt: { type: Date, required: true },
        leftAt: { type: Date },
        role: {
          type: String,
          enum: ['viewer', 'moderator', 'speaker'],
          default: 'viewer',
        },
        raisedHand: { type: Boolean, default: false },
        raisedHandAt: { type: Date },
        cameraEnabled: { type: Boolean, default: false },
        micEnabled: { type: Boolean, default: false },
        screenSharing: { type: Boolean, default: false },
      },
    ],
    maxParticipants: {
      type: Number,
      default: 100,
    },
    allowChat: {
      type: Boolean,
      default: true,
    },
    allowQA: {
      type: Boolean,
      default: true,
    },
    allowScreenShare: {
      type: Boolean,
      default: true,
    },
    allowRecording: {
      type: Boolean,
      default: true,
    },
    requireApproval: {
      type: Boolean,
      default: false,
    },
    features: {
      whiteboard: { type: Boolean, default: false },
      breakoutRooms: { type: Boolean, default: false },
      polls: { type: Boolean, default: true },
      quizzes: { type: Boolean, default: false },
    },
    chat: [
      {
        messageId: { type: Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        message: { type: String, required: true, maxlength: 1000 },
        timestamp: { type: Date, default: Date.now },
        isDeleted: { type: Boolean, default: false },
      },
    ],
    qaQueue: [
      {
        questionId: { type: String, required: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        question: { type: String, required: true, maxlength: 500 },
        askedAt: { type: Date, default: Date.now },
        answeredAt: { type: Date },
        answeredBy: { type: Schema.Types.ObjectId, ref: 'User' },
        answer: { type: String, maxlength: 2000 },
        upvotes: { type: Number, default: 0 },
        status: {
          type: String,
          enum: ['pending', 'answered', 'dismissed'],
          default: 'pending',
        },
      },
    ],
    polls: [
      {
        pollId: { type: String, required: true },
        question: { type: String, required: true, maxlength: 200 },
        options: [
          {
            text: { type: String, required: true },
            votes: { type: Number, default: 0 },
          },
        ],
        createdAt: { type: Date, default: Date.now },
        expiresAt: { type: Date },
        isActive: { type: Boolean, default: true },
      },
    ],
    attendance: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        joinedAt: { type: Date, required: true },
        leftAt: { type: Date },
        duration: { type: Number, default: 0 },
        attended: { type: Boolean, default: false },
      },
    ],
    breakoutRooms: [
      {
        roomId: { type: String, required: true },
        name: { type: String, required: true },
        participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        createdAt: { type: Date, default: Date.now },
        closedAt: { type: Date },
      },
    ],
    analytics: {
      peakViewers: { type: Number, default: 0 },
      totalViews: { type: Number, default: 0 },
      averageDuration: { type: Number, default: 0 },
      engagementRate: { type: Number, default: 0 },
      chatMessages: { type: Number, default: 0 },
      questionsAsked: { type: Number, default: 0 },
    },
    thumbnail: {
      type: String,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    isPremium: {
      type: Boolean,
      default: false,
    },
    accessCode: {
      type: String,
    },
    notificationsSent: {
      type: Boolean,
      default: false,
    },
    remindersSent: {
      oneDay: { type: Boolean, default: false },
      oneHour: { type: Boolean, default: false },
      fifteenMinutes: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
LiveClassSchema.index({ instructorId: 1, scheduledStartTime: -1 });
LiveClassSchema.index({ status: 1, scheduledStartTime: 1 });
LiveClassSchema.index({ courseId: 1 });
LiveClassSchema.index({ scheduledStartTime: 1 });
LiveClassSchema.index({ 'participants.userId': 1 });

export default mongoose.model<ILiveClass>('LiveClass', LiveClassSchema);
