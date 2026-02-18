import mongoose, { Schema, Document } from 'mongoose';

export interface IStudyGroup extends Document {
  name: string;
  description: string;
  owner: mongoose.Types.ObjectId;
  moderators: mongoose.Types.ObjectId[];
  members: mongoose.Types.ObjectId[];
  isPrivate: boolean;
  inviteCode?: string;
  maxMembers: number;
  category: string;
  tags: string[];
  avatar?: string;
  banner?: string;
  schedule?: {
    day: string;
    time: string;
    timezone: string;
  }[];
  goals: string[];
  resources: {
    title: string;
    url: string;
    type: 'link' | 'file' | 'document';
  }[];
  challenges: {
    title: string;
    description: string;
    points: number;
    startDate: Date;
    endDate: Date;
    participants: mongoose.Types.ObjectId[];
  }[];
  announcements: {
    title: string;
    content: string;
    author: mongoose.Types.ObjectId;
    createdAt: Date;
  }[];
  isActive: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StudyGroupSchema = new Schema<IStudyGroup>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      index: 'text',
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000,
      index: 'text',
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    moderators: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    members: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    isPrivate: {
      type: Boolean,
      default: false,
      index: true,
    },
    inviteCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    maxMembers: {
      type: Number,
      default: 50,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
    avatar: String,
    banner: String,
    schedule: [{
      day: String,
      time: String,
      timezone: String,
    }],
    goals: [String],
    resources: [{
      title: String,
      url: String,
      type: {
        type: String,
        enum: ['link', 'file', 'document'],
      },
    }],
    challenges: [{
      title: String,
      description: String,
      points: Number,
      startDate: Date,
      endDate: Date,
      participants: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
      }],
    }],
    announcements: [{
      title: String,
      content: String,
      author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
StudyGroupSchema.index({ category: 1, isPrivate: 1 });
StudyGroupSchema.index({ tags: 1 });
StudyGroupSchema.index({ members: 1 });

// Virtual for member count
StudyGroupSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Methods
StudyGroupSchema.methods.isMember = function(userId: mongoose.Types.ObjectId): boolean {
  return this.members.some(member => member.equals(userId));
};

StudyGroupSchema.methods.isModerator = function(userId: mongoose.Types.ObjectId): boolean {
  return this.moderators.some(mod => mod.equals(userId)) || this.owner.equals(userId);
};

StudyGroupSchema.methods.isOwner = function(userId: mongoose.Types.ObjectId): boolean {
  return this.owner.equals(userId);
};

export default mongoose.model<IStudyGroup>('StudyGroup', StudyGroupSchema);
