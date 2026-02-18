/**
 * Utility functions for SRS date calculations and helpers
 */

import {
  Card,
  QualityRating,
  ValidationError,
  Result,
  DEFAULT_CARD_VALUES,
} from './types';

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Add minutes to a date
 */
export function addMinutes(date: Date, minutes: number): Date {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
}

/**
 * Get the start of a day (midnight)
 */
export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get the end of a day (23:59:59.999)
 */
export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  const today = startOfDay(new Date());
  const checkDate = startOfDay(date);
  return today.getTime() === checkDate.getTime();
}

/**
 * Check if a date is in the past
 */
export function isPast(date: Date): boolean {
  return date.getTime() < new Date().getTime();
}

/**
 * Check if a date is in the future
 */
export function isFuture(date: Date): boolean {
  return date.getTime() > new Date().getTime();
}

/**
 * Get the number of days between two dates
 */
export function daysBetween(date1: Date, date2: Date): number {
  const start = startOfDay(date1);
  const end = startOfDay(date2);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if a card is due for review
 */
export function isCardDue(card: Card, now: Date = new Date()): boolean {
  return card.nextReviewDate.getTime() <= now.getTime();
}

/**
 * Check if a card is overdue
 */
export function isCardOverdue(card: Card, now: Date = new Date()): boolean {
  const daysDue = daysBetween(card.nextReviewDate, now);
  return isCardDue(card, now) && daysDue > 0;
}

/**
 * Get the number of days until a card is due
 */
export function daysUntilDue(card: Card, now: Date = new Date()): number {
  const today = startOfDay(now);
  const dueDate = startOfDay(card.nextReviewDate);
  const diffTime = dueDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Validate quality rating (0-5)
 */
export function validateQuality(quality: number): Result<QualityRating, ValidationError> {
  if (!Number.isInteger(quality) || quality < 0 || quality > 5) {
    return {
      success: false,
      error: ValidationError.INVALID_QUALITY,
    };
  }
  return { success: true, data: quality as QualityRating };
}

/**
 * Validate easiness factor (must be >= 1.3)
 */
export function validateEasinessFactor(ef: number): Result<number, ValidationError> {
  if (typeof ef !== 'number' || isNaN(ef) || ef < 1.3) {
    return {
      success: false,
      error: ValidationError.INVALID_EASINESS_FACTOR,
    };
  }
  return { success: true, data: ef };
}

/**
 * Validate interval (must be >= 0)
 */
export function validateInterval(interval: number): Result<number, ValidationError> {
  if (typeof interval !== 'number' || isNaN(interval) || interval < 0) {
    return {
      success: false,
      error: ValidationError.INVALID_INTERVAL,
    };
  }
  return { success: true, data: interval };
}

/**
 * Validate repetition count (must be >= 0)
 */
export function validateRepetition(repetition: number): Result<number, ValidationError> {
  if (typeof repetition !== 'number' || isNaN(repetition) || repetition < 0 || !Number.isInteger(repetition)) {
    return {
      success: false,
      error: ValidationError.INVALID_REPETITION,
    };
  }
  return { success: true, data: repetition };
}

/**
 * Validate a date object
 */
export function validateDate(date: any): Result<Date, ValidationError> {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return {
      success: false,
      error: ValidationError.INVALID_DATE,
    };
  }
  return { success: true, data: date };
}

/**
 * Clamp a number between min and max values
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Round to a specified number of decimal places
 */
export function roundTo(value: number, decimals: number): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

/**
 * Calculate percentage (0-100)
 */
export function calculatePercentage(part: number, total: number): number {
  if (total === 0) return 0;
  return roundTo((part / total) * 100, 2);
}

/**
 * Format milliseconds to human-readable time
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new card with default values
 */
export function createNewCard(
  front: string,
  back: string,
  options?: Partial<Card>
): Card {
  const now = new Date();
  return {
    id: generateId(),
    front,
    back,
    ...DEFAULT_CARD_VALUES,
    dueDate: now,
    nextReviewDate: now,
    createdAt: now,
    updatedAt: now,
    totalReviews: 0,
    correctReviews: 0,
    streakCount: 0,
    ...options,
  };
}

/**
 * Check if a quality rating is passing (>= 3)
 */
export function isPassingGrade(quality: QualityRating): boolean {
  return quality >= 3;
}

/**
 * Check if a quality rating is failing (< 3)
 */
export function isFailingGrade(quality: QualityRating): boolean {
  return quality < 3;
}

/**
 * Get cards due within a date range
 */
export function getCardsDueInRange(
  cards: Card[],
  startDate: Date,
  endDate: Date
): Card[] {
  const start = startOfDay(startDate).getTime();
  const end = endOfDay(endDate).getTime();

  return cards.filter((card) => {
    const dueTime = card.nextReviewDate.getTime();
    return dueTime >= start && dueTime <= end;
  });
}

/**
 * Get cards due today
 */
export function getCardsDueToday(cards: Card[]): Card[] {
  const today = new Date();
  return getCardsDueInRange(cards, today, today);
}

/**
 * Sort cards by due date (ascending)
 */
export function sortCardsByDueDate(cards: Card[]): Card[] {
  return [...cards].sort(
    (a, b) => a.nextReviewDate.getTime() - b.nextReviewDate.getTime()
  );
}

/**
 * Sort cards by priority (overdue cards first, then by due date)
 */
export function sortCardsByPriority(cards: Card[], now: Date = new Date()): Card[] {
  return [...cards].sort((a, b) => {
    const aOverdue = isCardOverdue(a, now);
    const bOverdue = isCardOverdue(b, now);

    // Overdue cards come first
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;

    // Both overdue or both not overdue, sort by due date
    return a.nextReviewDate.getTime() - b.nextReviewDate.getTime();
  });
}

/**
 * Calculate average time spent on reviews
 */
export function calculateAverageReviewTime(
  reviews: { timeSpent: number }[]
): number {
  if (reviews.length === 0) return 0;
  const totalTime = reviews.reduce((sum, review) => sum + review.timeSpent, 0);
  return Math.round(totalTime / reviews.length);
}

/**
 * Group cards by date
 */
export function groupCardsByDate(cards: Card[]): Map<string, Card[]> {
  const groups = new Map<string, Card[]>();

  cards.forEach((card) => {
    const dateKey = startOfDay(card.nextReviewDate).toISOString().split('T')[0];
    const existing = groups.get(dateKey) || [];
    groups.set(dateKey, [...existing, card]);
  });

  return groups;
}

/**
 * Shuffle an array (Fisher-Yates algorithm)
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
