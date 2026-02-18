import mongoose, { Schema, Document } from 'mongoose';

export interface ICommunityProfile extends Document {
  user: mongoose.Types.ObjectId;
  bio: string;
  avatar?: string;
  banner?: string;
  location?: string;
  website?: string;
  socialLinks: {
    github?: string;
    twitter?: string;
    linkedin?: string;
  };
  badges: {
    id: string;
    name: string;
    earnedAt: Date;
  }[];
  stats: {
    threadsCreated: number;
    repliesPosted: number;
    helpfulReplies: number;
    reputation: number;
    studyStreak: number;
    lessonsCompleted: number;
    quizzesCompleted: number;
  };
  following: mongoose.Types.ObjectId[];
  followers: mongoose.Types.ObjectId[];
  blockedUsers: mongoose.Types.ObjectId[];
  privacySettings: {
    showProfile: boolean;
    showActivity: boolean;
    showStats: boolean;
    showProgress: boolean;
    showOnLeaderboard: boolean;
    allowMessages: 'everyone' | 'following' | 'none';
  };
  preferences: {
    studyGoals: string[];
    interests: string[];
    level: 'beginner' | 'intermediate' | 'advanced';
    preferredLanguages: string[];
  };
  activity: {
    type: 'thread' | 'reply' | 'achievement' | 'lesson' | 'quiz' | 'group';
    description: string;
    timestamp: Date;
    reference?: mongoose.Types.ObjectId;
  }[];
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CommunityProfileSchema = new Schema<ICommunityProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    bio: {
      type: String,
      maxlength: 500,
      default: '',
    },
    avatar: String,
    banner: String,
    location: String,
    website: String,
    socialLinks: {
      github: String,
      twitter: String,
      linkedin: String,
    },
    badges: [{
      id: String,
      name: String,
      earnedAt: Date,
    }],
    stats: {
      threadsCreated: {
        type: Number,
        default: 0,
      },
      repliesPosted: {
        type: Number,
        default: 0,
      },
      helpfulReplies: {
        type: Number,
        default: 0,
      },
      reputation: {
        type: Number,
        default: 0,
        index: true,
      },
      studyStreak: {
        type: Number,
        default: 0,
      },
      lessonsCompleted: {
        type: Number,
        default: 0,
      },
      quizzesCompleted: {
        type: Number,
        default: 0,
      },
    },
    following: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    followers: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    blockedUsers: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    privacySettings: {
      showProfile: {
        type: Boolean,
        default: true,
      },
      showActivity: {
        type: Boolean,
        default: true,
      },
      showStats: {
        type: Boolean,
        default: true,
      },
      showProgress: {
        type: Boolean,
        default: true,
      },
      showOnLeaderboard: {
        type: Boolean,
        default: true,
      },
      allowMessages: {
        type: String,
        enum: ['everyone', 'following', 'none'],
        default: 'everyone',
      },
    },
    preferences: {
      studyGoals: [String],
      interests: [String],
      level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner',
      },
      preferredLanguages: [String],
    },
    activity: [{
      type: {
        type: String,
        enum: ['thread', 'reply', 'achievement', 'lesson', 'quiz', 'group'],
      },
      description: String,
      timestamp: Date,
      reference: Schema.Types.ObjectId,
    }],
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
CommunityProfileSchema.index({ 'stats.reputation': -1 });
CommunityProfileSchema.index({ followers: 1 });
CommunityProfileSchema.index({ following: 1 });

// Methods
CommunityProfileSchema.methods.isFollowing = function(userId: mongoose.Types.ObjectId): boolean {
  return this.following.some(id => id.equals(userId));
};

CommunityProfileSchema.methods.hasBlocked = function(userId: mongoose.Types.ObjectId): boolean {
  return this.blockedUsers.some(id => id.equals(userId));
};

CommunityProfileSchema.methods.addActivity = async function(
  type: string,
  description: string,
  reference?: mongoose.Types.ObjectId
) {
  this.activity.unshift({
    type,
    description,
    timestamp: new Date(),
    reference,
  });

  // Keep only last 50 activities
  if (this.activity.length > 50) {
    this.activity = this.activity.slice(0, 50);
  }

  await this.save();
};

export default mongoose.model<ICommunityProfile>('CommunityProfile', CommunityProfileSchema);
