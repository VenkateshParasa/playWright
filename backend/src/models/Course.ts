import mongoose, { Schema, Document } from 'mongoose';

export interface IPrerequisite {
  courseId: mongoose.Types.ObjectId;
  required: boolean;
}

export interface ISection {
  _id?: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  order: number;
  lessons: mongoose.Types.ObjectId[];
  isPublished: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICourseVersion {
  version: number;
  createdAt: Date;
  createdBy: mongoose.Types.ObjectId;
  sections: ISection[];
  metadata: {
    title: string;
    description: string;
    objectives: string[];
  };
  changeLog?: string;
}

export interface ICourse extends Document {
  title: string;
  slug: string;
  description: string;
  thumbnail?: string;
  instructors: mongoose.Types.ObjectId[];
  category: string;
  tags: string[];
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  language: string;

  // Content structure
  sections: ISection[];
  objectives: string[];
  prerequisites: IPrerequisite[];

  // Settings
  isPublished: boolean;
  isDraft: boolean;
  allowDiscussions: boolean;
  allowReviews: boolean;
  certificateEnabled: boolean;

  // Pricing
  price: number;
  currency: string;
  isPremium: boolean;

  // Metadata
  estimatedDuration: number; // in minutes
  enrollmentCount: number;
  averageRating: number;
  reviewCount: number;
  completionCount: number;

  // Versioning
  currentVersion: number;
  versions: ICourseVersion[];

  // Status
  status: 'draft' | 'review' | 'published' | 'archived';
  publishedAt?: Date;
  archivedAt?: Date;

  // Template
  isTemplate: boolean;
  templateCategory?: string;

  createdBy: mongoose.Types.ObjectId;
  lastModifiedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PrerequisiteSchema = new Schema<IPrerequisite>({
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  required: { type: Boolean, default: true }
});

const SectionSchema = new Schema<ISection>({
  title: { type: String, required: true },
  description: { type: String },
  order: { type: Number, required: true },
  lessons: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
  isPublished: { type: Boolean, default: false }
}, { timestamps: true });

const CourseVersionSchema = new Schema<ICourseVersion>({
  version: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sections: [SectionSchema],
  metadata: {
    title: String,
    description: String,
    objectives: [String]
  },
  changeLog: String
});

const CourseSchema = new Schema<ICourse>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  thumbnail: { type: String },
  instructors: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  category: { type: String, required: true },
  tags: [{ type: String }],
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'beginner'
  },
  language: { type: String, default: 'en' },

  sections: [SectionSchema],
  objectives: [{ type: String }],
  prerequisites: [PrerequisiteSchema],

  isPublished: { type: Boolean, default: false },
  isDraft: { type: Boolean, default: true },
  allowDiscussions: { type: Boolean, default: true },
  allowReviews: { type: Boolean, default: true },
  certificateEnabled: { type: Boolean, default: false },

  price: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
  isPremium: { type: Boolean, default: false },

  estimatedDuration: { type: Number, default: 0 },
  enrollmentCount: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  completionCount: { type: Number, default: 0 },

  currentVersion: { type: Number, default: 1 },
  versions: [CourseVersionSchema],

  status: {
    type: String,
    enum: ['draft', 'review', 'published', 'archived'],
    default: 'draft'
  },
  publishedAt: { type: Date },
  archivedAt: { type: Date },

  isTemplate: { type: Boolean, default: false },
  templateCategory: { type: String },

  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  lastModifiedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Indexes
CourseSchema.index({ slug: 1 });
CourseSchema.index({ category: 1, isPublished: 1 });
CourseSchema.index({ tags: 1 });
CourseSchema.index({ level: 1 });
CourseSchema.index({ createdBy: 1 });
CourseSchema.index({ instructors: 1 });
CourseSchema.index({ status: 1 });

// Methods
CourseSchema.methods.createVersion = function(userId: mongoose.Types.ObjectId, changeLog?: string) {
  const newVersion: ICourseVersion = {
    version: this.currentVersion + 1,
    createdAt: new Date(),
    createdBy: userId,
    sections: JSON.parse(JSON.stringify(this.sections)),
    metadata: {
      title: this.title,
      description: this.description,
      objectives: [...this.objectives]
    },
    changeLog
  };

  this.versions.push(newVersion);
  this.currentVersion = newVersion.version;

  return newVersion;
};

CourseSchema.methods.restoreVersion = function(version: number) {
  const versionData = this.versions.find(v => v.version === version);
  if (!versionData) {
    throw new Error(`Version ${version} not found`);
  }

  this.sections = JSON.parse(JSON.stringify(versionData.sections));
  this.title = versionData.metadata.title;
  this.description = versionData.metadata.description;
  this.objectives = [...versionData.metadata.objectives];

  return this;
};

export default mongoose.model<ICourse>('Course', CourseSchema);
