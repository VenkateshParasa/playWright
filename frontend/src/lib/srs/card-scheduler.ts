/**
 * Card Scheduler for SRS System
 * Manages card scheduling, workload prediction, and retention analysis
 */

import {
  Card,
  CardState,
  Schedule,
  RetentionStats,
  WorkloadForecast,
  SchedulerConfig,
  DEFAULT_SCHEDULER_CONFIG,
} from './types';
import {
  addDays,
  startOfDay,
  endOfDay,
  isCardDue,
  isCardOverdue,
  getCardsDueInRange,
  getCardsDueToday,
  sortCardsByPriority,
  calculatePercentage,
  groupCardsByDate,
  daysUntilDue,
} from './utils';
import { calculateOptimalInterval } from './sm2-algorithm';

/**
 * Card Scheduler Class
 * Handles card scheduling and workload management
 */
export class CardScheduler {
  private config: SchedulerConfig;

  constructor(config: SchedulerConfig = DEFAULT_SCHEDULER_CONFIG) {
    this.config = config;
  }

  /**
   * Get cards that are due for review
   */
  getDueCards(cards: Card[], now: Date = new Date()): Card[] {
    return cards.filter(card => isCardDue(card, now));
  }

  /**
   * Get overdue cards
   */
  getOverdueCards(cards: Card[], now: Date = new Date()): Card[] {
    return cards.filter(card => isCardOverdue(card, now));
  }

  /**
   * Get new cards (never reviewed)
   */
  getNewCards(cards: Card[]): Card[] {
    return cards.filter(card => card.state === CardState.NEW);
  }

  /**
   * Get cards in learning state
   */
  getLearningCards(cards: Card[]): Card[] {
    return cards.filter(
      card => card.state === CardState.LEARNING || card.state === CardState.RELEARNING
    );
  }

  /**
   * Get cards in review state (mature cards)
   */
  getReviewCards(cards: Card[]): Card[] {
    return cards.filter(card => card.state === CardState.REVIEW);
  }

  /**
   * Schedule cards for today's review session
   * Respects daily limits for new cards and reviews
   */
  scheduleTodayCards(cards: Card[], now: Date = new Date()): Schedule[] {
    const dueCards = this.getDueCards(cards, now);
    const newCards = this.getNewCards(cards);

    // Sort due cards by priority
    const sortedDueCards = sortCardsByPriority(dueCards, now);

    // Limit reviews
    const reviewsToday = sortedDueCards.slice(0, this.config.maxReviewsPerDay);

    // Add new cards up to the daily limit
    const newCardsToday = newCards.slice(0, this.config.maxNewCardsPerDay);

    // Combine and create schedules
    const allCards = [...reviewsToday, ...newCardsToday];

    return allCards.map((card, index) => ({
      cardId: card.id,
      dueDate: card.nextReviewDate,
      interval: card.interval,
      priority: this.calculatePriority(card, now, index),
    }));
  }

  /**
   * Calculate priority score for a card
   * Higher priority = more urgent
   */
  private calculatePriority(card: Card, now: Date, index: number): number {
    let priority = 100;

    // Overdue cards get higher priority
    if (isCardOverdue(card, now)) {
      const daysOverdue = Math.abs(daysUntilDue(card, now));
      priority += daysOverdue * 10;
    }

    // New cards get medium priority
    if (card.state === CardState.NEW) {
      priority += 50;
    }

    // Learning cards get higher priority
    if (card.state === CardState.LEARNING || card.state === CardState.RELEARNING) {
      priority += 75;
    }

    // Adjust by position (earlier = higher priority)
    priority -= index * 0.1;

    return Math.round(priority);
  }

  /**
   * Calculate retention rate for cards
   */
  calculateRetentionRate(cards: Card[]): number {
    const reviewedCards = cards.filter(card => card.totalReviews > 0);

    if (reviewedCards.length === 0) {
      return 0;
    }

    const totalReviews = reviewedCards.reduce(
      (sum, card) => sum + card.totalReviews,
      0
    );

    const correctReviews = reviewedCards.reduce(
      (sum, card) => sum + card.correctReviews,
      0
    );

    return calculatePercentage(correctReviews, totalReviews);
  }

  /**
   * Calculate detailed retention statistics
   */
  calculateRetentionStats(
    cards: Card[],
    reviews: Array<{ timeSpent: number; quality: number }>
  ): RetentionStats {
    const matureCards = cards.filter(card => card.repetition >= 2);
    const youngCards = cards.filter(
      card => card.repetition < 2 && card.totalReviews > 0
    );
    const newCards = cards.filter(card => card.state === CardState.NEW);
    const suspendedCards = cards.filter(
      card => card.state === CardState.SUSPENDED
    );

    const now = new Date();
    const dueCards = this.getDueCards(cards, now);
    const overdueCards = this.getOverdueCards(cards, now);
    const todayCards = getCardsDueToday(cards);

    // Calculate retention rates
    const overallRetention = this.calculateRetentionRate(cards);
    const matureRetention = this.calculateRetentionRate(matureCards);
    const youngRetention = this.calculateRetentionRate(youngCards);

    // Calculate review statistics
    const avgReviewTime =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.timeSpent, 0) / reviews.length
        : 0;

    const totalStudyTime = reviews.reduce((sum, r) => sum + r.timeSpent, 0);

    return {
      totalCards: cards.length,
      matureCards: matureCards.length,
      youngCards: youngCards.length,
      newCards: newCards.length,
      suspendedCards: suspendedCards.length,
      overallRetention,
      matureRetention,
      youngRetention,
      reviewsToday: todayCards.length,
      reviewsDue: dueCards.length,
      reviewsOverdue: overdueCards.length,
      averageReviewTime: Math.round(avgReviewTime),
      totalStudyTime,
    };
  }

  /**
   * Predict future workload for the next N days
   */
  predictFutureWorkload(
    cards: Card[],
    days: number = 30,
    averageReviewTime: number = 10000, // 10 seconds in ms
    startDate: Date = new Date()
  ): WorkloadForecast[] {
    const forecasts: WorkloadForecast[] = [];

    // Group existing due cards by date
    const cardsByDate = groupCardsByDate(cards);

    for (let i = 0; i < days; i++) {
      const date = addDays(startOfDay(startDate), i);
      const dateKey = date.toISOString().split('T')[0];

      // Get cards due on this date
      const dueCards = cardsByDate.get(dateKey) || [];

      // Count new cards (only on day 0)
      const newCards = i === 0 ? this.getNewCards(cards).length : 0;

      // Estimate time
      const totalCards = dueCards.length + newCards;
      const estimatedTime = totalCards * averageReviewTime;

      forecasts.push({
        date,
        dueCards: dueCards.length,
        newCards,
        estimatedTime,
      });
    }

    return forecasts;
  }

  /**
   * Get workload summary for a date range
   */
  getWorkloadSummary(
    cards: Card[],
    startDate: Date,
    endDate: Date
  ): {
    totalCards: number;
    averagePerDay: number;
    peakDay: { date: Date; count: number };
    lightestDay: { date: Date; count: number };
  } {
    const dueCards = getCardsDueInRange(cards, startDate, endDate);
    const cardsByDate = groupCardsByDate(dueCards);

    let peakCount = 0;
    let peakDate = startDate;
    let lightestCount = Infinity;
    let lightestDate = startDate;

    const days = Math.ceil(
      (endOfDay(endDate).getTime() - startOfDay(startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    cardsByDate.forEach((cards, dateKey) => {
      const count = cards.length;
      const date = new Date(dateKey);

      if (count > peakCount) {
        peakCount = count;
        peakDate = date;
      }

      if (count < lightestCount) {
        lightestCount = count;
        lightestDate = date;
      }
    });

    return {
      totalCards: dueCards.length,
      averagePerDay: Math.round(dueCards.length / days),
      peakDay: { date: peakDate, count: peakCount },
      lightestDay: { date: lightestDate, count: lightestCount },
    };
  }

  /**
   * Estimate time to complete all due cards
   */
  estimateCompletionTime(
    cards: Card[],
    averageReviewTime: number = 10000 // 10 seconds in ms
  ): number {
    const dueCards = this.getDueCards(cards);
    return dueCards.length * averageReviewTime;
  }

  /**
   * Get cards for spaced practice (interleaving)
   * Returns a mix of new, learning, and review cards
   */
  getSpacedPracticeSet(
    cards: Card[],
    count: number = 20,
    now: Date = new Date()
  ): Card[] {
    const dueCards = this.getDueCards(cards, now);
    const newCards = this.getNewCards(cards);
    const learningCards = this.getLearningCards(cards);

    // Calculate distribution
    const newCount = Math.min(newCards.length, Math.floor(count * 0.3));
    const learningCount = Math.min(
      learningCards.length,
      Math.floor(count * 0.3)
    );
    const reviewCount = count - newCount - learningCount;

    // Select cards
    const selected = [
      ...newCards.slice(0, newCount),
      ...learningCards.slice(0, learningCount),
      ...sortCardsByPriority(dueCards, now).slice(0, reviewCount),
    ];

    return selected;
  }

  /**
   * Reschedule a card to a specific date (manual override)
   */
  rescheduleCard(card: Card, newDate: Date): Card {
    return {
      ...card,
      nextReviewDate: newDate,
      dueDate: newDate,
      updatedAt: new Date(),
    };
  }

  /**
   * Bulk reschedule cards
   */
  bulkReschedule(
    cards: Card[],
    adjustDays: number
  ): Card[] {
    return cards.map(card => {
      const newDate = addDays(card.nextReviewDate, adjustDays);
      return this.rescheduleCard(card, newDate);
    });
  }

  /**
   * Get recommended study time for today
   * Based on due cards and average review time
   */
  getRecommendedStudyTime(
    cards: Card[],
    averageReviewTime: number = 10000
  ): {
    minimumTime: number;
    recommendedTime: number;
    allDueTime: number;
  } {
    const dueCards = this.getDueCards(cards);
    const overdueCards = this.getOverdueCards(cards);

    const minimumCards = Math.min(overdueCards.length, 10);
    const recommendedCards = Math.min(dueCards.length, 30);
    const allDueCards = dueCards.length;

    return {
      minimumTime: minimumCards * averageReviewTime,
      recommendedTime: recommendedCards * averageReviewTime,
      allDueTime: allDueCards * averageReviewTime,
    };
  }

  /**
   * Analyze card difficulty distribution
   */
  analyzeDifficulty(cards: Card[]): {
    easy: number;   // EF > 2.5
    medium: number; // 2.0 <= EF <= 2.5
    hard: number;   // EF < 2.0
  } {
    const easy = cards.filter(card => card.easinessFactor > 2.5).length;
    const medium = cards.filter(
      card => card.easinessFactor >= 2.0 && card.easinessFactor <= 2.5
    ).length;
    const hard = cards.filter(card => card.easinessFactor < 2.0).length;

    return { easy, medium, hard };
  }

  /**
   * Get learning progress metrics
   */
  getLearningProgress(cards: Card[]): {
    completionRate: number;
    masteredCards: number;
    inProgressCards: number;
    notStartedCards: number;
  } {
    const masteredCards = cards.filter(
      card => card.state === CardState.REVIEW && card.repetition >= 5
    ).length;

    const inProgressCards = cards.filter(
      card =>
        card.state === CardState.LEARNING ||
        card.state === CardState.RELEARNING ||
        (card.state === CardState.REVIEW && card.repetition < 5)
    ).length;

    const notStartedCards = cards.filter(
      card => card.state === CardState.NEW
    ).length;

    const completionRate = calculatePercentage(
      masteredCards,
      cards.length
    );

    return {
      completionRate,
      masteredCards,
      inProgressCards,
      notStartedCards,
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<SchedulerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): SchedulerConfig {
    return { ...this.config };
  }
}

/**
 * Create a new scheduler instance
 */
export function createScheduler(
  config?: SchedulerConfig
): CardScheduler {
  return new CardScheduler(config);
}

/**
 * Export a default scheduler instance
 */
export const defaultScheduler = new CardScheduler();
