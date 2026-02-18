import mongoose, { Schema, Document } from 'mongoose';

export interface IAssetMetadata {
  width?: number;
  height?: number;
  duration?: number;
  format?: string;
  bitrate?: number;
  codec?: string;
  [key: string]: any;
}

export interface IAssetVersion {
  version: number;
  url: string;
  size: number;
  createdAt: Date;
  createdBy: mongoose.Types.ObjectId;
  changeLog?: string;
}

export interface IAsset extends Document {
  title: string;
  fileName: string;
  originalFileName: string;
  description?: string;

  // File information
  url: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other';
  mimeType: string;
  size: number; // in bytes
  checksum: string;

  // Organization
  folder?: string;
  tags: string[];
  category?: string;

  // Metadata
  metadata: IAssetMetadata;
  alt?: string; // For images
  thumbnail?: string;

  // Versioning
  currentVersion: number;
  versions: IAssetVersion[];

  // Usage tracking
  usageCount: number;
  usedIn: {
    type: 'course' | 'lesson' | 'quiz' | 'flashcard' | 'exercise';
    id: mongoose.Types.ObjectId;
  }[];

  // Status
  isPublic: boolean;
  status: 'processing' | 'ready' | 'failed';
  processingProgress?: number;
  errorMessage?: string;

  // CDN
  cdnUrl?: string;
  cdnEnabled: boolean;

  createdBy: mongoose.Types.ObjectId;
  lastModifiedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AssetVersionSchema = new Schema<IAssetVersion>({
  version: { type: Number, required: true },
  url: { type: String, required: true },
  size: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  changeLog: { type: String }
});

const AssetSchema = new Schema<IAsset>({
  title: { type: String, required: true },
  fileName: { type: String, required: true },
  originalFileName: { type: String, required: true },
  description: { type: String },

  url: { type: String, required: true },
  type: {
    type: String,
    enum: ['image', 'video', 'audio', 'document', 'archive', 'other'],
    required: true
  },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  checksum: { type: String, required: true },

  folder: { type: String },
  tags: [{ type: String }],
  category: { type: String },

  metadata: { type: Schema.Types.Mixed, default: {} },
  alt: { type: String },
  thumbnail: { type: String },

  currentVersion: { type: Number, default: 1 },
  versions: [AssetVersionSchema],

  usageCount: { type: Number, default: 0 },
  usedIn: [{
    type: {
      type: String,
      enum: ['course', 'lesson', 'quiz', 'flashcard', 'exercise'],
      required: true
    },
    id: { type: Schema.Types.ObjectId, required: true }
  }],

  isPublic: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['processing', 'ready', 'failed'],
    default: 'processing'
  },
  processingProgress: { type: Number },
  errorMessage: { type: String },

  cdnUrl: { type: String },
  cdnEnabled: { type: Boolean, default: false },

  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  lastModifiedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Indexes
AssetSchema.index({ fileName: 1 });
AssetSchema.index({ type: 1 });
AssetSchema.index({ folder: 1 });
AssetSchema.index({ tags: 1 });
AssetSchema.index({ createdBy: 1 });
AssetSchema.index({ status: 1 });
AssetSchema.index({ checksum: 1 });

// Methods
AssetSchema.methods.createVersion = function(url: string, size: number, userId: mongoose.Types.ObjectId, changeLog?: string) {
  const newVersion: IAssetVersion = {
    version: this.currentVersion + 1,
    url,
    size,
    createdAt: new Date(),
    createdBy: userId,
    changeLog
  };

  this.versions.push(newVersion);
  this.currentVersion = newVersion.version;
  this.url = url;
  this.size = size;

  return newVersion;
};

AssetSchema.methods.trackUsage = function(contentType: string, contentId: mongoose.Types.ObjectId) {
  const existingUsage = this.usedIn.find(
    u => u.type === contentType && u.id.toString() === contentId.toString()
  );

  if (!existingUsage) {
    this.usedIn.push({ type: contentType, id: contentId });
    this.usageCount += 1;
  }
};

AssetSchema.methods.removeUsage = function(contentType: string, contentId: mongoose.Types.ObjectId) {
  const index = this.usedIn.findIndex(
    u => u.type === contentType && u.id.toString() === contentId.toString()
  );

  if (index > -1) {
    this.usedIn.splice(index, 1);
    this.usageCount = Math.max(0, this.usageCount - 1);
  }
};

export default mongoose.model<IAsset>('Asset', AssetSchema);
