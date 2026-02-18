import mongoose, { Schema, Document } from 'mongoose';

export interface IVideoProgress extends Document {
  userId: mongoose.Types.ObjectId;
  videoId: mongoose.Types.ObjectId;
  watchedDuration: number;
  totalDuration: number;
  progressPercentage: number;
  lastWatchedPosition: number;
  completedAt?: Date;
  watchSessions: {
    startTime: Date;
    endTime: Date;
    duration: number;
    watchedRanges: { start: number; end: number }[];
  }[];
  bookmarks: {
    timestamp: number;
    note?: string;
    createdAt: Date;
  }[];
  notes: {
    timestamp: number;
    content: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
  playbackSpeed: number;
  quality: string;
  subtitlesEnabled: boolean;
  subtitleLanguage?: string;
  lastUpdated: Date;
}

const VideoProgressSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    videoId: {
      type: Schema.Types.ObjectId,
      ref: 'Video',
      required: true,
    },
    watchedDuration: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalDuration: {
      type: Number,
      required: true,
    },
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    lastWatchedPosition: {
      type: Number,
      default: 0,
      min: 0,
    },
    completedAt: {
      type: Date,
    },
    watchSessions: [
      {
        startTime: { type: Date, required: true },
        endTime: { type: Date, required: true },
        duration: { type: Number, required: true },
        watchedRanges: [
          {
            start: { type: Number, required: true },
            end: { type: Number, required: true },
          },
        ],
      },
    ],
    bookmarks: [
      {
        timestamp: { type: Number, required: true },
        note: { type: String, maxlength: 500 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    notes: [
      {
        timestamp: { type: Number, required: true },
        content: { type: String, required: true, maxlength: 2000 },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    playbackSpeed: {
      type: Number,
      default: 1.0,
      min: 0.5,
      max: 2.0,
    },
    quality: {
      type: String,
      default: 'auto',
    },
    subtitlesEnabled: {
      type: Boolean,
      default: false,
    },
    subtitleLanguage: {
      type: String,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user-video queries
VideoProgressSchema.index({ userId: 1, videoId: 1 }, { unique: true });
VideoProgressSchema.index({ userId: 1, lastUpdated: -1 });
VideoProgressSchema.index({ videoId: 1 });

// Update lastUpdated on save
VideoProgressSchema.pre('save', function (next) {
  this.lastUpdated = new Date();
  next();
});

export default mongoose.model<IVideoProgress>('VideoProgress', VideoProgressSchema);
