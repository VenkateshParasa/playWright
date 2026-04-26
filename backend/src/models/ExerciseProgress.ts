import mongoose, { Schema, Document } from 'mongoose';

export interface ITestResult {
  testId: string;
  testName: string;
  passed: boolean;
  actual?: any;
  expected?: any;
  error?: string;
  executionTime?: number;
}

export interface IExerciseAttempt {
  attemptNumber: number;
  code: string;
  timestamp: Date;
  testResults: ITestResult[];
  passed: boolean;
  score: number;
  timeSpent: number; // in seconds
  executionTime: number; // in milliseconds
}

export interface IExerciseProgress extends Document {
  userId: mongoose.Types.ObjectId;
  exerciseId: mongoose.Types.ObjectId;

  // Current state
  currentCode: string;
  hintsRevealed: string[];
  solutionViewed: boolean;

  // Attempts history
  attempts: IExerciseAttempt[];
  attemptCount: number;

  // Progress tracking
  completed: boolean;
  bestScore: number;
  totalTimeSpent: number; // in seconds

  // Timestamps
  firstAttemptDate: Date;
  lastAttemptDate?: Date;
  completedDate?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const TestResultSchema = new Schema<ITestResult>({
  testId: { type: String, required: true },
  testName: { type: String, required: true },
  passed: { type: Boolean, required: true },
  actual: { type: Schema.Types.Mixed },
  expected: { type: Schema.Types.Mixed },
  error: { type: String },
  executionTime: { type: Number }
});

const ExerciseAttemptSchema = new Schema<IExerciseAttempt>({
  attemptNumber: { type: Number, required: true },
  code: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  testResults: [TestResultSchema],
  passed: { type: Boolean, required: true },
  score: { type: Number, required: true, min: 0, max: 100 },
  timeSpent: { type: Number, default: 0 },
  executionTime: { type: Number, default: 0 }
});

const ExerciseProgressSchema = new Schema<IExerciseProgress>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  exerciseId: {
    type: Schema.Types.ObjectId,
    ref: 'Exercise',
    required: true,
    index: true
  },

  currentCode: {
    type: String,
    default: ''
  },
  hintsRevealed: {
    type: [String],
    default: []
  },
  solutionViewed: {
    type: Boolean,
    default: false
  },

  attempts: {
    type: [ExerciseAttemptSchema],
    default: []
  },
  attemptCount: {
    type: Number,
    default: 0
  },

  completed: {
    type: Boolean,
    default: false,
    index: true
  },
  bestScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  totalTimeSpent: {
    type: Number,
    default: 0
  },

  firstAttemptDate: {
    type: Date,
    default: Date.now
  },
  lastAttemptDate: {
    type: Date
  },
  completedDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
ExerciseProgressSchema.index({ userId: 1, exerciseId: 1 }, { unique: true });
ExerciseProgressSchema.index({ userId: 1, completed: 1 });
ExerciseProgressSchema.index({ exerciseId: 1, completed: 1 });
ExerciseProgressSchema.index({ userId: 1, bestScore: -1 });

// Methods
ExerciseProgressSchema.methods.recordAttempt = function(
  code: string,
  testResults: ITestResult[],
  passed: boolean,
  score: number,
  timeSpent: number,
  executionTime: number
) {
  this.attemptCount += 1;

  const attempt: IExerciseAttempt = {
    attemptNumber: this.attemptCount,
    code,
    timestamp: new Date(),
    testResults,
    passed,
    score,
    timeSpent,
    executionTime
  };

  this.attempts.push(attempt);
  this.currentCode = code;
  this.lastAttemptDate = new Date();
  this.totalTimeSpent += timeSpent;

  // Update best score
  if (score > this.bestScore) {
    this.bestScore = score;
  }

  // Mark as completed if passed and not already completed
  if (passed && !this.completed) {
    this.completed = true;
    this.completedDate = new Date();
  }

  return this.save();
};

ExerciseProgressSchema.methods.revealHint = function(hintId: string) {
  if (!this.hintsRevealed.includes(hintId)) {
    this.hintsRevealed.push(hintId);
    return this.save();
  }
  return Promise.resolve(this);
};

ExerciseProgressSchema.methods.viewSolution = function() {
  this.solutionViewed = true;
  return this.save();
};

ExerciseProgressSchema.methods.saveCurrentCode = function(code: string) {
  this.currentCode = code;
  return this.save();
};

// Statics
ExerciseProgressSchema.statics.getOrCreate = async function(
  userId: mongoose.Types.ObjectId,
  exerciseId: mongoose.Types.ObjectId
) {
  let progress = await this.findOne({ userId, exerciseId });

  if (!progress) {
    progress = await this.create({
      userId,
      exerciseId,
      firstAttemptDate: new Date()
    });
  }

  return progress;
};

ExerciseProgressSchema.statics.getUserProgress = async function(userId: mongoose.Types.ObjectId) {
  return this.find({ userId })
    .populate('exerciseId', 'title difficulty category estimatedTime')
    .sort({ lastAttemptDate: -1 });
};

ExerciseProgressSchema.statics.getUserStats = async function(userId: mongoose.Types.ObjectId) {
  const stats = await this.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: null,
        totalExercises: { $sum: 1 },
        completedExercises: {
          $sum: { $cond: ['$completed', 1, 0] }
        },
        averageScore: { $avg: '$bestScore' },
        totalTimeSpent: { $sum: '$totalTimeSpent' },
        totalAttempts: { $sum: '$attemptCount' }
      }
    }
  ]);

  if (stats.length === 0) {
    return {
      totalExercises: 0,
      completedExercises: 0,
      averageScore: 0,
      totalTimeSpent: 0,
      totalAttempts: 0,
      completionRate: 0
    };
  }

  const result = stats[0];
  return {
    totalExercises: result.totalExercises,
    completedExercises: result.completedExercises,
    averageScore: Math.round(result.averageScore),
    totalTimeSpent: result.totalTimeSpent,
    totalAttempts: result.totalAttempts,
    completionRate: Math.round((result.completedExercises / result.totalExercises) * 100)
  };
};

export default mongoose.model<IExerciseProgress>('ExerciseProgress', ExerciseProgressSchema);
