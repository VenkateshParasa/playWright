/**
 * Spaced Repetition System (SRS) Library
 * SM-2 Algorithm Implementation
 *
 * @module srs
 */

// Types
export type {
  Card,
  QualityRating,
  ReviewResult,
  ReviewSession,
  Schedule,
  RetentionStats,
  WorkloadForecast,
  SchedulerConfig,
  Result,
} from './types';

export {
  CardState,
  ValidationError,
  DEFAULT_SCHEDULER_CONFIG,
  DEFAULT_CARD_VALUES,
} from './types';

// SM-2 Algorithm
export {
  updateEasinessFactor,
  calculateNextInterval,
  trackRepetitionCount,
  handleFailedRecall,
  calculateNextReview,
  applyReviewResult,
  calculateBulkReviews,
  applyBulkReviews,
  calculateOptimalInterval,
  predictFutureReviews,
  calculateCardStability,
  adjustEasinessFactor,
} from './sm2-algorithm';

// Card Scheduler
export {
  CardScheduler,
  createScheduler,
  defaultScheduler,
} from './card-scheduler';

// Utilities
export {
  addDays,
  addMinutes,
  startOfDay,
  endOfDay,
  isToday,
  isPast,
  isFuture,
  daysBetween,
  isCardDue,
  isCardOverdue,
  daysUntilDue,
  validateQuality,
  validateEasinessFactor,
  validateInterval,
  validateRepetition,
  validateDate,
  clamp,
  roundTo,
  calculatePercentage,
  formatDuration,
  generateId,
  createNewCard,
  isPassingGrade,
  isFailingGrade,
  getCardsDueInRange,
  getCardsDueToday,
  sortCardsByDueDate,
  sortCardsByPriority,
  calculateAverageReviewTime,
  groupCardsByDate,
  shuffleArray,
} from './utils';
