import mongoose, { Schema, Document } from 'mongoose';

export type ProgrammingLanguage = 'typescript' | 'javascript' | 'java';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface ITestCase {
  id: string;
  name: string;
  input: any;
  expectedOutput: any;
  hidden?: boolean;
}

export interface IHint {
  id: string;
  level: number;
  content: string;
}

export interface IExercise extends Document {
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  category: string;
  estimatedTime: number; // in minutes
  language: ProgrammingLanguage;
  starterCode: string;
  solution: string;
  testCases: ITestCase[];
  hints: IHint[];
  instructions: string[];
  learningObjectives: string[];
  tags: string[];

  // Metadata
  viewCount: number;
  completionCount: number;
  averageScore: number;
  attemptCount: number;

  // Status
  isPublished: boolean;

  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TestCaseSchema = new Schema<ITestCase>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  input: { type: Schema.Types.Mixed, required: true },
  expectedOutput: { type: Schema.Types.Mixed, required: true },
  hidden: { type: Boolean, default: false }
});

const HintSchema = new Schema<IHint>({
  id: { type: String, required: true },
  level: { type: Number, required: true, min: 1, max: 3 },
  content: { type: String, required: true }
});

const ExerciseSchema = new Schema<IExercise>({
  title: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  estimatedTime: {
    type: Number,
    default: 15
  },
  language: {
    type: String,
    enum: ['typescript', 'javascript', 'java'],
    required: true,
    index: true
  },
  starterCode: {
    type: String,
    required: true
  },
  solution: {
    type: String,
    required: true
  },
  testCases: {
    type: [TestCaseSchema],
    required: true,
    validate: {
      validator: function(v: ITestCase[]) {
        return v && v.length > 0;
      },
      message: 'At least one test case is required'
    }
  },
  hints: {
    type: [HintSchema],
    default: []
  },
  instructions: {
    type: [String],
    default: []
  },
  learningObjectives: {
    type: [String],
    default: []
  },
  tags: {
    type: [String],
    default: [],
    index: true
  },

  // Metadata
  viewCount: {
    type: Number,
    default: 0
  },
  completionCount: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  },
  attemptCount: {
    type: Number,
    default: 0
  },

  // Status
  isPublished: {
    type: Boolean,
    default: true,
    index: true
  },

  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
ExerciseSchema.index({ difficulty: 1, category: 1 });
ExerciseSchema.index({ language: 1, difficulty: 1 });
ExerciseSchema.index({ tags: 1 });
ExerciseSchema.index({ isPublished: 1, difficulty: 1 });
ExerciseSchema.index({ category: 1, isPublished: 1 });

// Text index for search
ExerciseSchema.index({
  title: 'text',
  description: 'text',
  category: 'text',
  tags: 'text'
});

// Methods
ExerciseSchema.methods.incrementView = function() {
  this.viewCount += 1;
  return this.save();
};

ExerciseSchema.methods.recordAttempt = function(passed: boolean, score: number) {
  this.attemptCount += 1;
  if (passed) {
    this.completionCount += 1;
  }
  // Update average score
  const totalScore = this.averageScore * (this.attemptCount - 1) + score;
  this.averageScore = totalScore / this.attemptCount;
  return this.save();
};

// Filter out hidden test cases for students
ExerciseSchema.methods.getVisibleTestCases = function() {
  return this.testCases.filter((tc: ITestCase) => !tc.hidden);
};

export default mongoose.model<IExercise>('Exercise', ExerciseSchema);
