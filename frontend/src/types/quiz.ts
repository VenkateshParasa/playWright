/**
 * Type definitions for Quiz System
 * Supports multiple question types with comprehensive features
 */

// ============================================================================
// Question Types
// ============================================================================

export type QuestionType = 'multiple-choice' | 'true-false' | 'code-snippet';

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  question: string;
  points: number;
  explanation?: string;
  category?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple-choice';
  options: QuizOption[];
  allowMultiple: boolean; // true for multiple answers, false for single
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: 'true-false';
  correctAnswer: boolean;
}

export interface CodeSnippetQuestion extends BaseQuestion {
  type: 'code-snippet';
  code: string;
  language: 'javascript' | 'typescript' | 'java' | 'python';
  options: QuizOption[];
  allowMultiple: boolean;
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export type Question = MultipleChoiceQuestion | TrueFalseQuestion | CodeSnippetQuestion;

// ============================================================================
// Quiz Types
// ============================================================================

export interface Quiz {
  id: string;
  title: string;
  description: string;
  lessonId?: string;
  moduleId?: string;
  questions: Question[];
  timeLimit: number; // in seconds (0 = no limit)
  passingScore: number; // percentage (0-100)
  randomizeQuestions?: boolean;
  randomizeOptions?: boolean;
  allowReview: boolean;
  showExplanations: boolean;
  maxAttempts?: number; // undefined = unlimited
  tags?: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: string;
  updatedAt?: string;
}

// ============================================================================
// Quiz State Types
// ============================================================================

export interface QuizAnswer {
  questionId: string;
  answer: string | string[] | boolean; // single option, multiple options, or true/false
  markedForReview: boolean;
  timeSpent: number; // seconds spent on this question
  answeredAt?: string;
}

export interface QuizProgress {
  currentQuestionIndex: number;
  answers: Record<string, QuizAnswer>;
  timeRemaining: number; // seconds
  startedAt: string;
  isPaused: boolean;
}

export interface QuizResult {
  quizId: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  completedAt: string;
  timeSpent: number;
  answers: Record<string, QuizAnswer>;
  correctAnswers: number;
  totalQuestions: number;
  questionResults: QuestionResult[];
}

export interface QuestionResult {
  questionId: string;
  question: string;
  userAnswer: string | string[] | boolean;
  correctAnswer: string | string[] | boolean;
  isCorrect: boolean;
  points: number;
  earnedPoints: number;
  explanation?: string;
  timeSpent: number;
}

// ============================================================================
// Quiz Session Types
// ============================================================================

export interface QuizSession {
  quiz: Quiz;
  progress: QuizProgress;
  result?: QuizResult;
  isCompleted: boolean;
}

// ============================================================================
// Quiz Store State
// ============================================================================

export interface QuizState {
  currentSession: QuizSession | null;
  quizHistory: QuizResult[];
  isLoading: boolean;
  error: string | null;

  // Timer state
  timerActive: boolean;
  timeElapsed: number;

  // UI state
  showResults: boolean;
  showExplanations: boolean;
}

// ============================================================================
// Quiz Store Actions
// ============================================================================

export interface QuizActions {
  // Session management
  startQuiz: (quiz: Quiz) => void;
  submitQuiz: () => void;
  pauseQuiz: () => void;
  resumeQuiz: () => void;
  retryQuiz: (quizId: string) => void;
  exitQuiz: () => void;

  // Navigation
  goToQuestion: (index: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;

  // Answer management
  answerQuestion: (questionId: string, answer: string | string[] | boolean) => void;
  markForReview: (questionId: string) => void;
  unmarkForReview: (questionId: string) => void;

  // Timer management
  startTimer: () => void;
  stopTimer: () => void;
  updateTimeRemaining: (seconds: number) => void;

  // Results
  calculateResults: () => QuizResult;
  saveToHistory: (result: QuizResult) => void;
  getQuizHistory: (quizId: string) => QuizResult[];
  getBestScore: (quizId: string) => number;

  // Auto-save
  saveProgress: () => void;
  loadProgress: (quizId: string) => boolean;
  clearProgress: (quizId: string) => void;

  // State management
  resetState: () => void;
  setError: (error: string | null) => void;
}

export type QuizStore = QuizState & QuizActions;

// ============================================================================
// Utility Types
// ============================================================================

export interface QuizStatistics {
  totalAttempts: number;
  bestScore: number;
  averageScore: number;
  passRate: number;
  averageTimeSpent: number;
  lastAttemptDate?: string;
}

export interface QuizFilters {
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
  lessonId?: string;
  moduleId?: string;
  completed?: boolean;
  passed?: boolean;
}
