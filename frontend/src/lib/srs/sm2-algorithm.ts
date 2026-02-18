/**
 * SuperMemo SM-2 Algorithm Implementation
 * Based on the original SM-2 algorithm by Piotr Wozniak
 *
 * Algorithm Description:
 * - Quality ratings: 0-5 (0 = complete blackout, 5 = perfect recall)
 * - Easiness Factor (EF): Starts at 2.5, adjusted based on quality
 * - Interval: Days until next review, increases with successful recalls
 * - Repetition: Number of consecutive successful reviews
 *
 * @see https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
 */

import {
  Card,
  CardState,
  QualityRating,
  ReviewResult,
  SchedulerConfig,
  DEFAULT_SCHEDULER_CONFIG,
} from './types';
import {
  addDays,
  clamp,
  roundTo,
  isPassingGrade,
  isFailingGrade,
} from './utils';

/**
 * Calculate the new easiness factor based on quality rating
 *
 * Formula: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
 * Where:
 * - EF' is the new easiness factor
 * - EF is the current easiness factor
 * - q is the quality rating (0-5)
 *
 * The easiness factor is clamped to a minimum of 1.3
 */
export function updateEasinessFactor(
  currentEF: number,
  quality: QualityRating,
  config: SchedulerConfig = DEFAULT_SCHEDULER_CONFIG
): number {
  const q = quality;
  const delta = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);
  const newEF = currentEF + delta;

  // Clamp to minimum easiness factor
  return roundTo(
    Math.max(newEF, config.minimumEasinessFactor),
    2
  );
}

/**
 * Calculate the next interval based on SM-2 algorithm
 *
 * Rules:
 * - First successful review: 1 day
 * - Second successful review: 6 days
 * - Subsequent reviews: previous interval * easiness factor
 * - Failed review (quality < 3): reset to 1 day
 */
export function calculateNextInterval(
  currentInterval: number,
  repetition: number,
  easinessFactor: number,
  quality: QualityRating,
  config: SchedulerConfig = DEFAULT_SCHEDULER_CONFIG
): number {
  // Failed recall (quality < 3): reset interval
  if (isFailingGrade(quality)) {
    return 0;
  }

  let newInterval: number;

  if (repetition === 0) {
    // First successful review: 1 day
    newInterval = config.graduatingInterval;
  } else if (repetition === 1) {
    // Second successful review: 6 days
    newInterval = 6;
  } else {
    // Subsequent reviews: previous interval * easiness factor
    newInterval = Math.round(currentInterval * easinessFactor);
  }

  // Apply quality-based modifiers
  if (quality === 5) {
    // Perfect recall: bonus multiplier
    newInterval = Math.round(newInterval * config.easyBonus);
  } else if (quality === 3) {
    // Hard recall: reduce interval
    newInterval = Math.round(newInterval * config.hardInterval);
  }

  // Clamp to maximum interval
  return Math.min(newInterval, config.maximumInterval);
}

/**
 * Track and update repetition count
 *
 * Rules:
 * - Increment on successful review (quality >= 3)
 * - Reset to 0 on failed review (quality < 3)
 */
export function trackRepetitionCount(
  currentRepetition: number,
  quality: QualityRating
): number {
  if (isPassingGrade(quality)) {
    return currentRepetition + 1;
  }
  return 0;
}

/**
 * Handle failed recall by resetting interval and starting relearning
 */
export function handleFailedRecall(card: Card): Partial<Card> {
  return {
    interval: 0,
    repetition: 0,
    state: CardState.RELEARNING,
    streakCount: 0,
  };
}

/**
 * Calculate the next review date based on interval
 */
export function calculateNextReviewDate(
  currentDate: Date,
  interval: number
): Date {
  if (interval === 0) {
    // For relearning cards, review in 10 minutes
    const nextReview = new Date(currentDate);
    nextReview.setMinutes(nextReview.getMinutes() + 10);
    return nextReview;
  }

  return addDays(currentDate, interval);
}

/**
 * Determine the new card state after review
 */
export function determineCardState(
  currentState: CardState,
  repetition: number,
  quality: QualityRating
): CardState {
  // Failed review: move to relearning
  if (isFailingGrade(quality)) {
    return CardState.RELEARNING;
  }

  // Successful review
  if (repetition >= 2) {
    return CardState.REVIEW;
  } else {
    return CardState.LEARNING;
  }
}

/**
 * Main function to calculate the next review for a card based on quality rating
 *
 * This is the core of the SM-2 algorithm implementation
 */
export function calculateNextReview(
  card: Card,
  quality: QualityRating,
  reviewDate: Date = new Date(),
  config: SchedulerConfig = DEFAULT_SCHEDULER_CONFIG
): ReviewResult {
  // Update easiness factor
  const newEasinessFactor = updateEasinessFactor(
    card.easinessFactor,
    quality,
    config
  );

  // Update repetition count
  const newRepetition = trackRepetitionCount(card.repetition, quality);

  // Calculate new interval
  const newInterval = calculateNextInterval(
    card.interval,
    card.repetition,
    newEasinessFactor,
    quality,
    config
  );

  // Determine new state
  const newState = determineCardState(card.state, newRepetition, quality);

  // Calculate next review date
  const nextReviewDate = calculateNextReviewDate(reviewDate, newInterval);

  return {
    cardId: card.id,
    quality,
    reviewDate,
    timeSpent: 0, // To be filled by the caller
    newEasinessFactor,
    newInterval,
    newRepetition,
    newState,
    nextReviewDate,
  };
}

/**
 * Apply review result to a card (immutable update)
 */
export function applyReviewResult(
  card: Card,
  result: ReviewResult
): Card {
  const isPassing = isPassingGrade(result.quality);
  const now = result.reviewDate;

  return {
    ...card,
    easinessFactor: result.newEasinessFactor,
    interval: result.newInterval,
    repetition: result.newRepetition,
    state: result.newState,
    lastReviewDate: result.reviewDate,
    nextReviewDate: result.nextReviewDate,
    dueDate: result.nextReviewDate,
    totalReviews: card.totalReviews + 1,
    correctReviews: card.correctReviews + (isPassing ? 1 : 0),
    streakCount: isPassing ? card.streakCount + 1 : 0,
    updatedAt: now,
  };
}

/**
 * Bulk review calculation for multiple cards
 * Optimized for performance with large datasets
 */
export function calculateBulkReviews(
  reviews: Array<{ card: Card; quality: QualityRating; reviewDate?: Date }>,
  config: SchedulerConfig = DEFAULT_SCHEDULER_CONFIG
): ReviewResult[] {
  return reviews.map(({ card, quality, reviewDate = new Date() }) =>
    calculateNextReview(card, quality, reviewDate, config)
  );
}

/**
 * Apply multiple review results to cards (batch operation)
 */
export function applyBulkReviews(
  cards: Card[],
  results: ReviewResult[]
): Card[] {
  const resultMap = new Map(results.map(r => [r.cardId, r]));

  return cards.map(card => {
    const result = resultMap.get(card.id);
    return result ? applyReviewResult(card, result) : card;
  });
}

/**
 * Calculate optimal interval for a given easiness factor and repetition
 * Useful for forecasting and scheduling
 */
export function calculateOptimalInterval(
  repetition: number,
  easinessFactor: number,
  config: SchedulerConfig = DEFAULT_SCHEDULER_CONFIG
): number {
  if (repetition === 0) {
    return config.graduatingInterval;
  } else if (repetition === 1) {
    return 6;
  }

  // Start from 6 days (second interval) and multiply
  let interval = 6;
  for (let i = 2; i <= repetition; i++) {
    interval = Math.round(interval * easinessFactor);
  }

  return Math.min(interval, config.maximumInterval);
}

/**
 * Predict the next N review dates for a card given consistent quality
 * Useful for long-term planning
 */
export function predictFutureReviews(
  card: Card,
  assumedQuality: QualityRating = 4,
  count: number = 10,
  config: SchedulerConfig = DEFAULT_SCHEDULER_CONFIG
): Date[] {
  let currentCard = { ...card };
  const futureDates: Date[] = [];

  for (let i = 0; i < count; i++) {
    const result = calculateNextReview(
      currentCard,
      assumedQuality,
      currentCard.nextReviewDate,
      config
    );

    futureDates.push(result.nextReviewDate);

    // Update card for next iteration
    currentCard = applyReviewResult(currentCard, result);
  }

  return futureDates;
}

/**
 * Calculate stability of a card's learning
 * Higher stability = better learned
 *
 * Stability factors:
 * - Repetition count (more = better)
 * - Easiness factor (higher = easier to remember)
 * - Current interval (longer = more stable)
 */
export function calculateCardStability(card: Card): number {
  const repetitionScore = Math.min(card.repetition / 10, 1) * 0.4;
  const easinessScore = ((card.easinessFactor - 1.3) / (3.0 - 1.3)) * 0.3;
  const intervalScore = Math.min(card.interval / 365, 1) * 0.3;

  return roundTo((repetitionScore + easinessScore + intervalScore) * 100, 2);
}

/**
 * Adjust easiness factor manually (for advanced users)
 * Useful for fine-tuning the algorithm
 */
export function adjustEasinessFactor(
  card: Card,
  adjustment: number,
  config: SchedulerConfig = DEFAULT_SCHEDULER_CONFIG
): number {
  const newEF = card.easinessFactor + adjustment;
  return clamp(
    roundTo(newEF, 2),
    config.minimumEasinessFactor,
    5.0
  );
}
