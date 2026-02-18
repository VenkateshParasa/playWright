import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestionOption {
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface ICodeQuestion {
  starterCode: string;
  solution: string;
  testCases: {
    input: string;
    expectedOutput: string;
    isHidden: boolean;
  }[];
  language: string;
}

export interface IQuestion {
  _id?: mongoose.Types.ObjectId;
  type: 'multiple-choice' | 'true-false' | 'fill-in-blank' | 'code' | 'essay' | 'matching';
  question: string;
  points: number;
  options?: IQuestionOption[];
  correctAnswer?: string; // For fill-in-blank
  codeQuestion?: ICodeQuestion;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  order: number;
  timeLimit?: number; // in seconds
  allowPartialCredit: boolean;
}

export interface IQuiz extends Document {
  title: string;
  slug: string;
  description?: string;
  courseId?: mongoose.Types.ObjectId;
  lessonId?: mongoose.Types.ObjectId;

  // Questions
  questions: IQuestion[];
  questionBank: IQuestion[]; // Pool of questions for randomization

  // Settings
  isPublished: boolean;
  passingScore: number; // percentage
  timeLimit?: number; // in minutes
  maxAttempts?: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showCorrectAnswers: boolean;
  showScoreImmediately: boolean;
  allowReview: boolean;
  randomizeFromBank: boolean;
  questionCount?: number; // Number of questions to show from bank

  // Scheduling
  availableFrom?: Date;
  availableUntil?: Date;

  // Grading
  autoGrade: boolean;
  requireProctor: boolean;

  // Analytics
  attemptCount: number;
  averageScore: number;
  completionRate: number;

  createdBy: mongoose.Types.ObjectId;
  lastModifiedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IQuizAttempt extends Document {
  quizId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  courseId?: mongoose.Types.ObjectId;
  lessonId?: mongoose.Types.ObjectId;

  // Attempt details
  attemptNumber: number;
  startedAt: Date;
  submittedAt?: Date;
  timeSpent: number; // in seconds

  // Questions and answers
  questions: IQuestion[];
  answers: {
    questionId: mongoose.Types.ObjectId;
    answer: any;
    isCorrect?: boolean;
    pointsAwarded: number;
    timeSpent: number;
  }[];

  // Scoring
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;

  // Status
  status: 'in-progress' | 'submitted' | 'graded' | 'expired';
  isGraded: boolean;
  gradedBy?: mongoose.Types.ObjectId;
  gradedAt?: Date;
  feedback?: string;

  createdAt: Date;
  updatedAt: Date;
}

const QuestionOptionSchema = new Schema<IQuestionOption>({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
  explanation: { type: String }
});

const CodeQuestionSchema = new Schema<ICodeQuestion>({
  starterCode: { type: String, required: true },
  solution: { type: String, required: true },
  testCases: [{
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
    isHidden: { type: Boolean, default: false }
  }],
  language: { type: String, required: true }
});

const QuestionSchema = new Schema<IQuestion>({
  type: {
    type: String,
    enum: ['multiple-choice', 'true-false', 'fill-in-blank', 'code', 'essay', 'matching'],
    required: true
  },
  question: { type: String, required: true },
  points: { type: Number, default: 1 },
  options: [QuestionOptionSchema],
  correctAnswer: { type: String },
  codeQuestion: CodeQuestionSchema,
  explanation: { type: String },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  tags: [{ type: String }],
  order: { type: Number, default: 0 },
  timeLimit: { type: Number },
  allowPartialCredit: { type: Boolean, default: false }
});

const QuizSchema = new Schema<IQuiz>({
  title: { type: String, required: true },
  slug: { type: String, required: true },
  description: { type: String },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
  lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson' },

  questions: [QuestionSchema],
  questionBank: [QuestionSchema],

  isPublished: { type: Boolean, default: false },
  passingScore: { type: Number, default: 70 },
  timeLimit: { type: Number },
  maxAttempts: { type: Number },
  shuffleQuestions: { type: Boolean, default: false },
  shuffleOptions: { type: Boolean, default: false },
  showCorrectAnswers: { type: Boolean, default: true },
  showScoreImmediately: { type: Boolean, default: true },
  allowReview: { type: Boolean, default: true },
  randomizeFromBank: { type: Boolean, default: false },
  questionCount: { type: Number },

  availableFrom: { type: Date },
  availableUntil: { type: Date },

  autoGrade: { type: Boolean, default: true },
  requireProctor: { type: Boolean, default: false },

  attemptCount: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
  completionRate: { type: Number, default: 0 },

  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  lastModifiedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Indexes
QuizSchema.index({ slug: 1 });
QuizSchema.index({ courseId: 1 });
QuizSchema.index({ lessonId: 1 });
QuizSchema.index({ isPublished: 1 });
QuizSchema.index({ createdBy: 1 });

// Quiz Attempt Schema
const QuizAttemptSchema = new Schema<IQuizAttempt>({
  quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
  lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson' },

  attemptNumber: { type: Number, required: true },
  startedAt: { type: Date, default: Date.now },
  submittedAt: { type: Date },
  timeSpent: { type: Number, default: 0 },

  questions: [QuestionSchema],
  answers: [{
    questionId: { type: Schema.Types.ObjectId, required: true },
    answer: { type: Schema.Types.Mixed },
    isCorrect: { type: Boolean },
    pointsAwarded: { type: Number, default: 0 },
    timeSpent: { type: Number, default: 0 }
  }],

  score: { type: Number, default: 0 },
  maxScore: { type: Number, required: true },
  percentage: { type: Number, default: 0 },
  passed: { type: Boolean, default: false },

  status: {
    type: String,
    enum: ['in-progress', 'submitted', 'graded', 'expired'],
    default: 'in-progress'
  },
  isGraded: { type: Boolean, default: false },
  gradedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  gradedAt: { type: Date },
  feedback: { type: String }
}, { timestamps: true });

// Indexes for QuizAttempt
QuizAttemptSchema.index({ quizId: 1, userId: 1 });
QuizAttemptSchema.index({ userId: 1, status: 1 });
QuizAttemptSchema.index({ courseId: 1 });

export const Quiz = mongoose.model<IQuiz>('Quiz', QuizSchema);
export const QuizAttempt = mongoose.model<IQuizAttempt>('QuizAttempt', QuizAttemptSchema);

export default Quiz;
