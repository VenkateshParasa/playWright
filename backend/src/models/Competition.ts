import mongoose, { Document, Schema } from 'mongoose';

export type CompetitionType = 'weekly' | 'monthly' | 'tournament' | 'head_to_head' | 'team' | 'speed' | 'accuracy';
export type CompetitionStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';

export interface ICompetition extends Document {
  _id: mongoose.Types.ObjectId;
  competitionId: string;
  name: string;
  description: string;
  type: CompetitionType;
  status: CompetitionStatus;
  category: string; // 'lessons', 'quizzes', 'srs', 'exercises', 'all'
  startDate: Date;
  endDate: Date;
  rules: {
    scoringType: string; // 'xp', 'count', 'accuracy', 'speed'
    minParticipants?: number;
    maxParticipants?: number;
    entryFee?: number; // Coins
  };
  prizes: {
    rank: number;
    xp: number;
    coins: number;
    items?: string[];
    badge?: string;
    title?: string;
  }[];
  participants: {
    userId: mongoose.Types.ObjectId;
    score: number;
    rank?: number;
    joinedAt: Date;
  }[];
  leaderboard: {
    userId: mongoose.Types.ObjectId;
    userName: string;
    userAvatar?: string;
    score: number;
    rank: number;
    updatedAt: Date;
  }[];
  isTeamBased: boolean;
  teams?: {
    teamId: string;
    name: string;
    members: mongoose.Types.ObjectId[];
    score: number;
    rank?: number;
  }[];
  icon: string;
  banner?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CompetitionSchema = new Schema<ICompetition>(
  {
    competitionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['weekly', 'monthly', 'tournament', 'head_to_head', 'team', 'speed', 'accuracy'],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['upcoming', 'active', 'completed', 'cancelled'],
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
      index: true,
    },
    endDate: {
      type: Date,
      required: true,
      index: true,
    },
    rules: {
      scoringType: {
        type: String,
        required: true,
      },
      minParticipants: Number,
      maxParticipants: Number,
      entryFee: Number,
    },
    prizes: [{
      rank: {
        type: Number,
        required: true,
      },
      xp: {
        type: Number,
        required: true,
      },
      coins: {
        type: Number,
        required: true,
      },
      items: [String],
      badge: String,
      title: String,
    }],
    participants: [{
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      score: {
        type: Number,
        default: 0,
      },
      rank: Number,
      joinedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    leaderboard: [{
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      userName: String,
      userAvatar: String,
      score: {
        type: Number,
        required: true,
      },
      rank: {
        type: Number,
        required: true,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    isTeamBased: {
      type: Boolean,
      default: false,
    },
    teams: [{
      teamId: String,
      name: String,
      members: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
      }],
      score: {
        type: Number,
        default: 0,
      },
      rank: Number,
    }],
    icon: {
      type: String,
      required: true,
    },
    banner: String,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

CompetitionSchema.index({ status: 1, startDate: 1, endDate: 1 });
CompetitionSchema.index({ 'participants.userId': 1 });

CompetitionSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Competition = mongoose.model<ICompetition>('Competition', CompetitionSchema);
