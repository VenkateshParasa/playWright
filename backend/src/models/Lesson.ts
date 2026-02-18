import mongoose, { Schema, Document } from 'mongoose';

export interface ICodeBlock {
  language: string;
  code: string;
  fileName?: string;
  highlightLines?: number[];
  showLineNumbers: boolean;
}

export interface IVideo {
  provider: 'youtube' | 'vimeo' | 'self-hosted';
  url: string;
  thumbnail?: string;
  duration: number;
  chapters?: {
    time: number;
    title: string;
  }[];
  captions?: {
    language: string;
    url: string;
  }[];
  quality?: {
    resolution: string;
    url: string;
  }[];
}

export interface IQuizEmbed {
  quizId: mongoose.Types.ObjectId;
  required: boolean;
  passingScore?: number;
}

export interface IResource {
  title: string;
  type: 'pdf' | 'zip' | 'doc' | 'image' | 'link' | 'other';
  url: string;
  size?: number;
  description?: string;
}

export interface IInteractiveElement {
  type: 'tab' | 'accordion' | 'callout' | 'code-sandbox' | 'exercise';
  content: any;
  settings?: Record<string, any>;
}

export interface ILessonVersion {
  version: number;
  createdAt: Date;
  createdBy: mongoose.Types.ObjectId;
  content: string;
  changeLog?: string;
}

export interface ILesson extends Document {
  title: string;
  slug: string;
  description?: string;
  courseId: mongoose.Types.ObjectId;
  sectionId?: mongoose.Types.ObjectId;

  // Content
  content: string; // Rich text content
  contentType: 'markdown' | 'html' | 'wysiwyg';
  codeBlocks: ICodeBlock[];
  videos: IVideo[];
  quizzes: IQuizEmbed[];
  resources: IResource[];
  interactiveElements: IInteractiveElement[];

  // Learning
  objectives: string[];
  prerequisites: string[];
  estimatedDuration: number; // in minutes
  difficulty: 'easy' | 'medium' | 'hard';

  // Metadata
  order: number;
  isPublished: boolean;
  isFree: boolean;
  allowComments: boolean;

  // Versioning
  currentVersion: number;
  versions: ILessonVersion[];

  // Engagement
  viewCount: number;
  completionCount: number;
  averageTimeSpent: number;
  likeCount: number;

  createdBy: mongoose.Types.ObjectId;
  lastModifiedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CodeBlockSchema = new Schema<ICodeBlock>({
  language: { type: String, required: true },
  code: { type: String, required: true },
  fileName: { type: String },
  highlightLines: [{ type: Number }],
  showLineNumbers: { type: Boolean, default: true }
});

const VideoSchema = new Schema<IVideo>({
  provider: {
    type: String,
    enum: ['youtube', 'vimeo', 'self-hosted'],
    required: true
  },
  url: { type: String, required: true },
  thumbnail: { type: String },
  duration: { type: Number, default: 0 },
  chapters: [{
    time: Number,
    title: String
  }],
  captions: [{
    language: String,
    url: String
  }],
  quality: [{
    resolution: String,
    url: String
  }]
});

const QuizEmbedSchema = new Schema<IQuizEmbed>({
  quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
  required: { type: Boolean, default: false },
  passingScore: { type: Number }
});

const ResourceSchema = new Schema<IResource>({
  title: { type: String, required: true },
  type: {
    type: String,
    enum: ['pdf', 'zip', 'doc', 'image', 'link', 'other'],
    required: true
  },
  url: { type: String, required: true },
  size: { type: Number },
  description: { type: String }
});

const InteractiveElementSchema = new Schema<IInteractiveElement>({
  type: {
    type: String,
    enum: ['tab', 'accordion', 'callout', 'code-sandbox', 'exercise'],
    required: true
  },
  content: { type: Schema.Types.Mixed, required: true },
  settings: { type: Schema.Types.Mixed }
});

const LessonVersionSchema = new Schema<ILessonVersion>({
  version: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  changeLog: { type: String }
});

const LessonSchema = new Schema<ILesson>({
  title: { type: String, required: true },
  slug: { type: String, required: true },
  description: { type: String },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  sectionId: { type: Schema.Types.ObjectId },

  content: { type: String, default: '' },
  contentType: {
    type: String,
    enum: ['markdown', 'html', 'wysiwyg'],
    default: 'wysiwyg'
  },
  codeBlocks: [CodeBlockSchema],
  videos: [VideoSchema],
  quizzes: [QuizEmbedSchema],
  resources: [ResourceSchema],
  interactiveElements: [InteractiveElementSchema],

  objectives: [{ type: String }],
  prerequisites: [{ type: String }],
  estimatedDuration: { type: Number, default: 0 },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },

  order: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: false },
  isFree: { type: Boolean, default: false },
  allowComments: { type: Boolean, default: true },

  currentVersion: { type: Number, default: 1 },
  versions: [LessonVersionSchema],

  viewCount: { type: Number, default: 0 },
  completionCount: { type: Number, default: 0 },
  averageTimeSpent: { type: Number, default: 0 },
  likeCount: { type: Number, default: 0 },

  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  lastModifiedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Indexes
LessonSchema.index({ slug: 1 });
LessonSchema.index({ courseId: 1, order: 1 });
LessonSchema.index({ sectionId: 1 });
LessonSchema.index({ isPublished: 1 });
LessonSchema.index({ createdBy: 1 });

// Compound index for course lessons
LessonSchema.index({ courseId: 1, isPublished: 1, order: 1 });

// Methods
LessonSchema.methods.createVersion = function(userId: mongoose.Types.ObjectId, changeLog?: string) {
  const newVersion: ILessonVersion = {
    version: this.currentVersion + 1,
    createdAt: new Date(),
    createdBy: userId,
    content: this.content,
    changeLog
  };

  this.versions.push(newVersion);
  this.currentVersion = newVersion.version;

  return newVersion;
};

LessonSchema.methods.restoreVersion = function(version: number) {
  const versionData = this.versions.find(v => v.version === version);
  if (!versionData) {
    throw new Error(`Version ${version} not found`);
  }

  this.content = versionData.content;
  return this;
};

export default mongoose.model<ILesson>('Lesson', LessonSchema);
