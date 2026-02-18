/**
 * Spaced Repetition System (SRS) Types
 * Based on SuperMemo SM-2 Algorithm
 */

/**
 * Quality rating for a card review (0-5)
 * 0 - Complete blackout
 * 1 - Incorrect response, correct answer remembered
 * 2 - Incorrect response, correct answer seemed easy to recall
 * 3 - Correct response, but required significant difficulty
 * 4 - Correct response, after some hesitation
 * 5 - Perfect response
 */
export type QualityRating = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * Card state in the SRS system
 */
export enum CardState {
  NEW = 'new',           // Card has never been reviewed
  LEARNING = 'learning', // Card is being learned (repetition < 2)
  REVIEW = 'review',     // Card is in review mode (repetition >= 2)
  RELEARNING = 'relearning', // Card failed and needs relearning
  SUSPENDED = 'suspended', // Card is suspended by user
}

/**
 * Represents a flashcard in the SRS system
 */
export interface Card {
  id: string;
  front: string;
  back: string;
  category?: string;
  tags?: string[];

  // SM-2 Algorithm Parameters
  easinessFactor: number;    // Default: 2.5
  interval: number;          // Days until next review
  repetition: number;        // Number of consecutive correct reviews

  // Scheduling Information
  state: CardState;
  dueDate: Date;
  lastReviewDate?: Date;
  nextReviewDate: Date;

  // Statistics
  totalReviews: number;
  correctReviews: number;
  streakCount: number;       // Current streak of correct reviews

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Result of a card review
 */
export interface ReviewResult {
  cardId: string;
  quality: QualityRating;
  reviewDate: Date;
  timeSpent: number;         // Milliseconds

  // Updated card state after review
  newEasinessFactor: number;
  newInterval: number;
  newRepetition: number;
  newState: CardState;
  nextReviewDate: Date;
}

/**
 * Review session containing multiple card reviews
 */
export interface ReviewSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  cardsReviewed: number;
  cardsCorrect: number;
  totalTimeSpent: number;    // Milliseconds
  reviews: ReviewResult[];
}

/**
 * Schedule information for a card
 */
export interface Schedule {
  cardId: string;
  dueDate: Date;
  interval: number;
  priority: number;          // Higher = more urgent
}

/**
 * Statistics for retention analysis
 */
export interface RetentionStats {
  totalCards: number;
  matureCards: number;       // Cards with repetition >= 2
  youngCards: number;        // Cards with repetition < 2
  newCards: number;
  suspendedCards: number;

  // Retention rates
  overallRetention: number;  // Percentage (0-100)
  matureRetention: number;
  youngRetention: number;

  // Review statistics
  reviewsToday: number;
  reviewsDue: number;
  reviewsOverdue: number;

  // Time statistics
  averageReviewTime: number; // Milliseconds
  totalStudyTime: number;    // Milliseconds
}

/**
 * Workload forecast for future dates
 */
export interface WorkloadForecast {
  date: Date;
  dueCards: number;
  newCards: number;
  estimatedTime: number;     // Milliseconds
}

/**
 * Configuration for the SRS scheduler
 */
export interface SchedulerConfig {
  maxNewCardsPerDay: number;
  maxReviewsPerDay: number;
  newCardSteps: number[];    // Learning steps in minutes (e.g., [1, 10])
  graduatingInterval: number; // Days (default: 1)
  easyInterval: number;      // Days (default: 4)
  minimumEasinessFactor: number; // Default: 1.3
  maximumInterval: number;   // Days (default: 36500 = 100 years)
  hardInterval: number;      // Multiplier (default: 1.2)
  easyBonus: number;         // Multiplier (default: 1.3)
}

/**
 * Default configuration values
 */
export const DEFAULT_SCHEDULER_CONFIG: SchedulerConfig = {
  maxNewCardsPerDay: 20,
  maxReviewsPerDay: 200,
  newCardSteps: [1, 10],
  graduatingInterval: 1,
  easyInterval: 4,
  minimumEasinessFactor: 1.3,
  maximumInterval: 36500,
  hardInterval: 1.2,
  easyBonus: 1.3,
};

/**
 * Default card values for new cards
 */
export const DEFAULT_CARD_VALUES = {
  easinessFactor: 2.5,
  interval: 0,
  repetition: 0,
  state: CardState.NEW,
  totalReviews: 0,
  correctReviews: 0,
  streakCount: 0,
} as const;

/**
 * Validation error types
 */
export enum ValidationError {
  INVALID_QUALITY = 'INVALID_QUALITY',
  INVALID_EASINESS_FACTOR = 'INVALID_EASINESS_FACTOR',
  INVALID_INTERVAL = 'INVALID_INTERVAL',
  INVALID_REPETITION = 'INVALID_REPETITION',
  INVALID_DATE = 'INVALID_DATE',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
}

/**
 * Result type for operations that can fail
 */
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };
