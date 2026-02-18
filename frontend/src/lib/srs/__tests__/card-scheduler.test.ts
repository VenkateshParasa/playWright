/**
 * Unit tests for Card Scheduler
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  CardScheduler,
  createScheduler,
  defaultScheduler,
} from '../card-scheduler';
import {
  Card,
  CardState,
  DEFAULT_SCHEDULER_CONFIG,
} from '../types';
import { createNewCard, addDays, startOfDay } from '../utils';

describe('CardScheduler', () => {
  let scheduler: CardScheduler;
  let testCards: Card[];
  let now: Date;

  beforeEach(() => {
    scheduler = new CardScheduler();
    now = new Date('2024-01-15T10:00:00Z');

    // Create a diverse set of test cards
    testCards = [
      // New cards
      createNewCard('New 1', 'Answer 1', {
        state: CardState.NEW,
        nextReviewDate: now,
      }),
      createNewCard('New 2', 'Answer 2', {
        state: CardState.NEW,
        nextReviewDate: now,
      }),

      // Due today
      createNewCard('Due Today 1', 'Answer', {
        state: CardState.REVIEW,
        repetition: 3,
        interval: 10,
        nextReviewDate: now,
      }),

      // Overdue
      createNewCard('Overdue 1', 'Answer', {
        state: CardState.REVIEW,
        repetition: 2,
        interval: 5,
        nextReviewDate: addDays(now, -3),
      }),

      // Due tomorrow
      createNewCard('Due Tomorrow', 'Answer', {
        state: CardState.REVIEW,
        repetition: 4,
        interval: 15,
        nextReviewDate: addDays(now, 1),
      }),

      // Learning
      createNewCard('Learning 1', 'Answer', {
        state: CardState.LEARNING,
        repetition: 1,
        interval: 1,
        nextReviewDate: now,
      }),

      // Suspended
      createNewCard('Suspended', 'Answer', {
        state: CardState.SUSPENDED,
        nextReviewDate: addDays(now, 10),
      }),
    ];
  });

  describe('Constructor and Factory', () => {
    it('should create scheduler with default config', () => {
      const s = new CardScheduler();
      expect(s.getConfig()).toEqual(DEFAULT_SCHEDULER_CONFIG);
    });

    it('should create scheduler with custom config', () => {
      const config = { ...DEFAULT_SCHEDULER_CONFIG, maxNewCardsPerDay: 50 };
      const s = new CardScheduler(config);
      expect(s.getConfig().maxNewCardsPerDay).toBe(50);
    });

    it('should create scheduler using factory function', () => {
      const s = createScheduler();
      expect(s).toBeInstanceOf(CardScheduler);
    });

    it('should have a default scheduler instance', () => {
      expect(defaultScheduler).toBeInstanceOf(CardScheduler);
    });
  });

  describe('getDueCards', () => {
    it('should return all cards due at or before now', () => {
      const dueCards = scheduler.getDueCards(testCards, now);
      expect(dueCards.length).toBe(4); // New 1, New 2, Due Today 1, Overdue 1, Learning 1
    });

    it('should not include cards due in the future', () => {
      const dueCards = scheduler.getDueCards(testCards, now);
      const dueTomorrow = dueCards.find(c => c.front === 'Due Tomorrow');
      expect(dueTomorrow).toBeUndefined();
    });

    it('should return empty array when no cards are due', () => {
      const futureCards = testCards.map(c => ({
        ...c,
        nextReviewDate: addDays(now, 10),
      }));
      const dueCards = scheduler.getDueCards(futureCards, now);
      expect(dueCards).toHaveLength(0);
    });
  });

  describe('getOverdueCards', () => {
    it('should return only overdue cards', () => {
      const overdueCards = scheduler.getOverdueCards(testCards, now);
      expect(overdueCards.length).toBeGreaterThan(0);
      expect(overdueCards.every(c => c.nextReviewDate < now)).toBe(true);
    });

    it('should not include cards due today', () => {
      const overdueCards = scheduler.getOverdueCards(testCards, now);
      const dueToday = overdueCards.filter(c =>
        startOfDay(c.nextReviewDate).getTime() === startOfDay(now).getTime()
      );
      expect(dueToday).toHaveLength(0);
    });
  });

  describe('getNewCards', () => {
    it('should return all cards in NEW state', () => {
      const newCards = scheduler.getNewCards(testCards);
      expect(newCards).toHaveLength(2);
      expect(newCards.every(c => c.state === CardState.NEW)).toBe(true);
    });

    it('should return empty array when no new cards exist', () => {
      const reviewCards = testCards.map(c => ({ ...c, state: CardState.REVIEW }));
      const newCards = scheduler.getNewCards(reviewCards);
      expect(newCards).toHaveLength(0);
    });
  });

  describe('getLearningCards', () => {
    it('should return cards in LEARNING or RELEARNING state', () => {
      const learningCards = scheduler.getLearningCards(testCards);
      expect(learningCards.length).toBeGreaterThan(0);
      expect(
        learningCards.every(
          c => c.state === CardState.LEARNING || c.state === CardState.RELEARNING
        )
      ).toBe(true);
    });
  });

  describe('getReviewCards', () => {
    it('should return cards in REVIEW state', () => {
      const reviewCards = scheduler.getReviewCards(testCards);
      expect(reviewCards.length).toBeGreaterThan(0);
      expect(reviewCards.every(c => c.state === CardState.REVIEW)).toBe(true);
    });
  });

  describe('scheduleTodayCards', () => {
    it('should create schedules for due cards', () => {
      const schedules = scheduler.scheduleTodayCards(testCards, now);
      expect(schedules.length).toBeGreaterThan(0);
    });

    it('should respect maxReviewsPerDay limit', () => {
      const manyCards = Array(300).fill(null).map((_, i) =>
        createNewCard(`Card ${i}`, `Answer ${i}`, {
          state: CardState.REVIEW,
          nextReviewDate: now,
        })
      );

      const schedules = scheduler.scheduleTodayCards(manyCards, now);
      expect(schedules.length).toBeLessThanOrEqual(
        DEFAULT_SCHEDULER_CONFIG.maxReviewsPerDay + DEFAULT_SCHEDULER_CONFIG.maxNewCardsPerDay
      );
    });

    it('should respect maxNewCardsPerDay limit', () => {
      const manyNewCards = Array(50).fill(null).map((_, i) =>
        createNewCard(`New Card ${i}`, `Answer ${i}`, {
          state: CardState.NEW,
          nextReviewDate: now,
        })
      );

      const schedules = scheduler.scheduleTodayCards(manyNewCards, now);
      expect(schedules.length).toBeLessThanOrEqual(
        DEFAULT_SCHEDULER_CONFIG.maxNewCardsPerDay
      );
    });

    it('should include card metadata in schedule', () => {
      const schedules = scheduler.scheduleTodayCards(testCards, now);
      const schedule = schedules[0];

      expect(schedule).toHaveProperty('cardId');
      expect(schedule).toHaveProperty('dueDate');
      expect(schedule).toHaveProperty('interval');
      expect(schedule).toHaveProperty('priority');
    });

    it('should assign higher priority to overdue cards', () => {
      const schedules = scheduler.scheduleTodayCards(testCards, now);
      const overdueSchedule = schedules.find(s =>
        testCards.find(c => c.id === s.cardId)?.front === 'Overdue 1'
      );

      expect(overdueSchedule?.priority).toBeGreaterThan(100);
    });
  });

  describe('calculateRetentionRate', () => {
    it('should calculate correct retention rate', () => {
      const cards = [
        createNewCard('C1', 'A1', { totalReviews: 10, correctReviews: 8 }),
        createNewCard('C2', 'A2', { totalReviews: 5, correctReviews: 4 }),
      ];

      const rate = scheduler.calculateRetentionRate(cards);
      expect(rate).toBeCloseTo(80, 0); // (8 + 4) / (10 + 5) = 80%
    });

    it('should return 0 for cards with no reviews', () => {
      const cards = [
        createNewCard('C1', 'A1', { totalReviews: 0, correctReviews: 0 }),
      ];

      const rate = scheduler.calculateRetentionRate(cards);
      expect(rate).toBe(0);
    });

    it('should handle 100% retention', () => {
      const cards = [
        createNewCard('C1', 'A1', { totalReviews: 10, correctReviews: 10 }),
      ];

      const rate = scheduler.calculateRetentionRate(cards);
      expect(rate).toBe(100);
    });

    it('should handle 0% retention', () => {
      const cards = [
        createNewCard('C1', 'A1', { totalReviews: 10, correctReviews: 0 }),
      ];

      const rate = scheduler.calculateRetentionRate(cards);
      expect(rate).toBe(0);
    });
  });

  describe('calculateRetentionStats', () => {
    it('should calculate comprehensive retention statistics', () => {
      const reviews = [
        { timeSpent: 10000, quality: 4 },
        { timeSpent: 15000, quality: 5 },
        { timeSpent: 20000, quality: 3 },
      ];

      const stats = scheduler.calculateRetentionStats(testCards, reviews);

      expect(stats).toHaveProperty('totalCards');
      expect(stats).toHaveProperty('matureCards');
      expect(stats).toHaveProperty('youngCards');
      expect(stats).toHaveProperty('newCards');
      expect(stats).toHaveProperty('suspendedCards');
      expect(stats).toHaveProperty('overallRetention');
      expect(stats).toHaveProperty('matureRetention');
      expect(stats).toHaveProperty('youngRetention');
      expect(stats).toHaveProperty('reviewsToday');
      expect(stats).toHaveProperty('reviewsDue');
      expect(stats).toHaveProperty('reviewsOverdue');
      expect(stats).toHaveProperty('averageReviewTime');
      expect(stats).toHaveProperty('totalStudyTime');
    });

    it('should count cards correctly by category', () => {
      const stats = scheduler.calculateRetentionStats(testCards, []);

      expect(stats.totalCards).toBe(testCards.length);
      expect(stats.newCards).toBe(2);
      expect(stats.suspendedCards).toBe(1);
    });

    it('should calculate average review time', () => {
      const reviews = [
        { timeSpent: 10000, quality: 4 },
        { timeSpent: 20000, quality: 5 },
      ];

      const stats = scheduler.calculateRetentionStats(testCards, reviews);
      expect(stats.averageReviewTime).toBe(15000);
    });

    it('should handle empty review array', () => {
      const stats = scheduler.calculateRetentionStats(testCards, []);
      expect(stats.averageReviewTime).toBe(0);
      expect(stats.totalStudyTime).toBe(0);
    });
  });

  describe('predictFutureWorkload', () => {
    it('should predict workload for specified number of days', () => {
      const forecasts = scheduler.predictFutureWorkload(testCards, 7, 10000, now);
      expect(forecasts).toHaveLength(7);
    });

    it('should include date, card counts, and estimated time', () => {
      const forecasts = scheduler.predictFutureWorkload(testCards, 7, 10000, now);
      const forecast = forecasts[0];

      expect(forecast).toHaveProperty('date');
      expect(forecast).toHaveProperty('dueCards');
      expect(forecast).toHaveProperty('newCards');
      expect(forecast).toHaveProperty('estimatedTime');
      expect(forecast.date).toBeInstanceOf(Date);
    });

    it('should calculate estimated time correctly', () => {
      const forecasts = scheduler.predictFutureWorkload(testCards, 1, 5000, now);
      const forecast = forecasts[0];

      const totalCards = forecast.dueCards + forecast.newCards;
      expect(forecast.estimatedTime).toBe(totalCards * 5000);
    });

    it('should show progressive dates', () => {
      const forecasts = scheduler.predictFutureWorkload(testCards, 3, 10000, now);

      expect(forecasts[1].date.getTime()).toBeGreaterThan(forecasts[0].date.getTime());
      expect(forecasts[2].date.getTime()).toBeGreaterThan(forecasts[1].date.getTime());
    });
  });

  describe('getWorkloadSummary', () => {
    it('should calculate workload summary for date range', () => {
      const startDate = now;
      const endDate = addDays(now, 7);
      const summary = scheduler.getWorkloadSummary(testCards, startDate, endDate);

      expect(summary).toHaveProperty('totalCards');
      expect(summary).toHaveProperty('averagePerDay');
      expect(summary).toHaveProperty('peakDay');
      expect(summary).toHaveProperty('lightestDay');
    });

    it('should identify peak day correctly', () => {
      const startDate = now;
      const endDate = addDays(now, 7);
      const summary = scheduler.getWorkloadSummary(testCards, startDate, endDate);

      expect(summary.peakDay.date).toBeInstanceOf(Date);
      expect(summary.peakDay.count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('estimateCompletionTime', () => {
    it('should estimate time for all due cards', () => {
      const time = scheduler.estimateCompletionTime(testCards, 10000);
      expect(time).toBeGreaterThanOrEqual(0);
    });

    it('should calculate correctly with custom review time', () => {
      const dueCount = scheduler.getDueCards(testCards, now).length;
      const time = scheduler.estimateCompletionTime(testCards, 5000);
      expect(time).toBe(dueCount * 5000);
    });
  });

  describe('getSpacedPracticeSet', () => {
    it('should return requested number of cards', () => {
      const cards = scheduler.getSpacedPracticeSet(testCards, 4, now);
      expect(cards.length).toBeLessThanOrEqual(4);
    });

    it('should include mix of card types', () => {
      const cards = scheduler.getSpacedPracticeSet(testCards, 10, now);
      const states = new Set(cards.map(c => c.state));
      expect(states.size).toBeGreaterThan(1);
    });

    it('should not exceed available cards', () => {
      const cards = scheduler.getSpacedPracticeSet(testCards, 1000, now);
      expect(cards.length).toBeLessThanOrEqual(testCards.length);
    });
  });

  describe('rescheduleCard', () => {
    it('should update card due date', () => {
      const card = testCards[0];
      const newDate = addDays(now, 5);
      const rescheduled = scheduler.rescheduleCard(card, newDate);

      expect(rescheduled.nextReviewDate).toEqual(newDate);
      expect(rescheduled.dueDate).toEqual(newDate);
    });

    it('should update updatedAt timestamp', () => {
      const card = testCards[0];
      const newDate = addDays(now, 5);
      const rescheduled = scheduler.rescheduleCard(card, newDate);

      expect(rescheduled.updatedAt.getTime()).toBeGreaterThanOrEqual(card.updatedAt.getTime());
    });

    it('should preserve other card properties', () => {
      const card = testCards[0];
      const newDate = addDays(now, 5);
      const rescheduled = scheduler.rescheduleCard(card, newDate);

      expect(rescheduled.id).toBe(card.id);
      expect(rescheduled.front).toBe(card.front);
      expect(rescheduled.easinessFactor).toBe(card.easinessFactor);
    });
  });

  describe('bulkReschedule', () => {
    it('should reschedule multiple cards', () => {
      const rescheduled = scheduler.bulkReschedule(testCards, 5);
      expect(rescheduled).toHaveLength(testCards.length);
    });

    it('should adjust all cards by specified days', () => {
      const rescheduled = scheduler.bulkReschedule(testCards, 3);

      rescheduled.forEach((card, i) => {
        const originalDate = testCards[i].nextReviewDate;
        const expectedDate = addDays(originalDate, 3);
        expect(startOfDay(card.nextReviewDate).getTime()).toBe(
          startOfDay(expectedDate).getTime()
        );
      });
    });

    it('should handle negative adjustments', () => {
      const rescheduled = scheduler.bulkReschedule(testCards, -2);

      rescheduled.forEach((card, i) => {
        const originalDate = testCards[i].nextReviewDate;
        const expectedDate = addDays(originalDate, -2);
        expect(startOfDay(card.nextReviewDate).getTime()).toBe(
          startOfDay(expectedDate).getTime()
        );
      });
    });
  });

  describe('getRecommendedStudyTime', () => {
    it('should provide three time recommendations', () => {
      const times = scheduler.getRecommendedStudyTime(testCards, 10000);

      expect(times).toHaveProperty('minimumTime');
      expect(times).toHaveProperty('recommendedTime');
      expect(times).toHaveProperty('allDueTime');
    });

    it('should have increasing time values', () => {
      const times = scheduler.getRecommendedStudyTime(testCards, 10000);

      expect(times.minimumTime).toBeLessThanOrEqual(times.recommendedTime);
      expect(times.recommendedTime).toBeLessThanOrEqual(times.allDueTime);
    });

    it('should calculate based on average review time', () => {
      const times = scheduler.getRecommendedStudyTime(testCards, 5000);
      const overdueCount = scheduler.getOverdueCards(testCards, now).length;
      const minimumCount = Math.min(overdueCount, 10);

      expect(times.minimumTime).toBe(minimumCount * 5000);
    });
  });

  describe('analyzeDifficulty', () => {
    it('should categorize cards by difficulty', () => {
      const analysis = scheduler.analyzeDifficulty(testCards);

      expect(analysis).toHaveProperty('easy');
      expect(analysis).toHaveProperty('medium');
      expect(analysis).toHaveProperty('hard');
      expect(analysis.easy + analysis.medium + analysis.hard).toBe(testCards.length);
    });

    it('should classify based on easiness factor', () => {
      const cards = [
        createNewCard('Easy', 'A', { easinessFactor: 3.0 }),
        createNewCard('Medium', 'A', { easinessFactor: 2.3 }),
        createNewCard('Hard', 'A', { easinessFactor: 1.5 }),
      ];

      const analysis = scheduler.analyzeDifficulty(cards);
      expect(analysis.easy).toBe(1);
      expect(analysis.medium).toBe(1);
      expect(analysis.hard).toBe(1);
    });
  });

  describe('getLearningProgress', () => {
    it('should calculate learning progress metrics', () => {
      const progress = scheduler.getLearningProgress(testCards);

      expect(progress).toHaveProperty('completionRate');
      expect(progress).toHaveProperty('masteredCards');
      expect(progress).toHaveProperty('inProgressCards');
      expect(progress).toHaveProperty('notStartedCards');
    });

    it('should sum all categories to total cards', () => {
      const progress = scheduler.getLearningProgress(testCards);
      const total = progress.masteredCards + progress.inProgressCards + progress.notStartedCards;
      expect(total).toBe(testCards.length);
    });

    it('should calculate completion rate as percentage', () => {
      const progress = scheduler.getLearningProgress(testCards);
      expect(progress.completionRate).toBeGreaterThanOrEqual(0);
      expect(progress.completionRate).toBeLessThanOrEqual(100);
    });
  });

  describe('updateConfig', () => {
    it('should update configuration partially', () => {
      scheduler.updateConfig({ maxNewCardsPerDay: 50 });
      expect(scheduler.getConfig().maxNewCardsPerDay).toBe(50);
    });

    it('should preserve other config values', () => {
      const originalMaxReviews = scheduler.getConfig().maxReviewsPerDay;
      scheduler.updateConfig({ maxNewCardsPerDay: 50 });
      expect(scheduler.getConfig().maxReviewsPerDay).toBe(originalMaxReviews);
    });
  });

  describe('getConfig', () => {
    it('should return current configuration', () => {
      const config = scheduler.getConfig();
      expect(config).toHaveProperty('maxNewCardsPerDay');
      expect(config).toHaveProperty('maxReviewsPerDay');
    });

    it('should return a copy of config', () => {
      const config1 = scheduler.getConfig();
      config1.maxNewCardsPerDay = 999;
      const config2 = scheduler.getConfig();
      expect(config2.maxNewCardsPerDay).not.toBe(999);
    });
  });
});
