/**
 * Progress Tracking Types
 * Comprehensive type definitions for the progress tracking system
 */

// ============================================================================
// Progress Statistics Types
// ============================================================================

export interface ProgressStatistics {
  overall: OverallProgress;
  modules: ModuleProgressData[];
  weekly: WeeklyProgress[];
  daily: DailyProgress[];
  milestones: Milestone[];
}

export interface OverallProgress {
  percentage: number;
  lessonsCompleted: number;
  totalLessons: number;
  quizzesPassed: number;
  totalQuizzes: number;
  exercisesCompleted: number;
  totalExercises: number;
  flashcardsReviewed: number;
  totalFlashcards: number;
  currentStreak: number;
  longestStreak: number;
  totalStudyTime: number; // seconds
  averageSessionTime: number; // seconds
  totalSessions: number;
  lastActivityDate: string;
}

export interface ModuleProgressData {
  moduleId: string;
  moduleName: string;
  weekNumber: number;
  progress: number; // 0-100
  lessonsCompleted: number;
  totalLessons: number;
  quizzesPassed: number;
  totalQuizzes: number;
  exercisesCompleted: number;
  totalExercises: number;
  timeSpent: number; // seconds
  startedAt?: string;
  completedAt?: string;
  isLocked: boolean;
  prerequisites: string[];
}

export interface WeeklyProgress {
  weekNumber: number;
  startDate: string;
  endDate: string;
  lessonsCompleted: number;
  quizzesPassed: number;
  exercisesCompleted: number;
  studyTime: number; // seconds
  sessions: number;
  averageScore: number;
}

export interface DailyProgress {
  date: string;
  lessonsCompleted: number;
  quizzesPassed: number;
  exercisesCompleted: number;
  flashcardsReviewed: number;
  studyTime: number; // seconds
  sessions: number;
}

// ============================================================================
// Milestone Types
// ============================================================================

export interface Milestone {
  id: string;
  title: string;
  description: string;
  category: MilestoneCategory;
  target: number;
  current: number;
  isCompleted: boolean;
  completedAt?: string;
  icon: string;
  color: string;
  reward?: MilestoneReward;
}

export type MilestoneCategory =
  | 'lessons'
  | 'quizzes'
  | 'exercises'
  | 'flashcards'
  | 'streak'
  | 'time'
  | 'score';

export interface MilestoneReward {
  type: 'badge' | 'points' | 'unlock';
  value: string | number;
  description: string;
}

// ============================================================================
// Chart Data Types
// ============================================================================

export interface ChartDataPoint {
  label: string;
  value: number;
  date?: string;
  category?: string;
}

export interface TimeSeriesData {
  date: string;
  lessons: number;
  quizzes: number;
  exercises: number;
  studyTime: number;
  score?: number;
}

export interface CategoryProgress {
  category: string;
  completed: number;
  total: number;
  percentage: number;
  color: string;
}

export interface PerformanceMetrics {
  averageQuizScore: number;
  quizScoreTrend: 'improving' | 'declining' | 'stable';
  averageExerciseScore: number;
  exerciseScoreTrend: 'improving' | 'declining' | 'stable';
  flashcardRetention: number;
  completionRate: number;
  consistencyScore: number; // 0-100
}

// ============================================================================
// Report Types
// ============================================================================

export interface ProgressReport {
  generatedAt: string;
  periodStart: string;
  periodEnd: string;
  user: {
    name: string;
    email: string;
    learningTrack: '30-day' | '60-day';
  };
  summary: ReportSummary;
  details: ReportDetails;
  recommendations: string[];
}

export interface ReportSummary {
  overallProgress: number;
  lessonsCompleted: number;
  totalStudyTime: number;
  currentStreak: number;
  achievementsEarned: number;
  averageScore: number;
}

export interface ReportDetails {
  moduleBreakdown: ModuleProgressData[];
  weeklyActivity: WeeklyProgress[];
  performanceMetrics: PerformanceMetrics;
  topicsMastered: string[];
  topicsNeedingWork: string[];
  milestones: Milestone[];
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ProgressAPIResponse {
  success: boolean;
  data: ProgressStatistics;
  message?: string;
}

export interface ProgressUpdateRequest {
  type: 'lesson' | 'quiz' | 'exercise' | 'flashcard';
  itemId: string;
  completed: boolean;
  score?: number;
  timeSpent: number;
}

export interface ProgressExportOptions {
  format: 'pdf' | 'csv' | 'json';
  periodStart?: string;
  periodEnd?: string;
  includeCharts: boolean;
  includeDetails: boolean;
}

// ============================================================================
// Filter and Sort Types
// ============================================================================

export interface ProgressFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  modules?: string[];
  categories?: MilestoneCategory[];
  completionStatus?: 'all' | 'completed' | 'in-progress' | 'not-started';
}

export type ProgressSortBy =
  | 'date'
  | 'progress'
  | 'time'
  | 'score'
  | 'module'
  | 'completion';

export type SortOrder = 'asc' | 'desc';

// ============================================================================
// Time Range Types
// ============================================================================

export type TimeRange = 'day' | 'week' | 'month' | 'all' | 'custom';

export interface TimeRangeOption {
  label: string;
  value: TimeRange;
  days?: number;
}

// ============================================================================
// Utility Types
// ============================================================================

export interface ProgressCalculation {
  calculate: () => number;
  isComplete: () => boolean;
  getDetails: () => Record<string, any>;
}

export interface ProgressTrend {
  direction: 'up' | 'down' | 'stable';
  percentage: number;
  comparisonPeriod: string;
}
