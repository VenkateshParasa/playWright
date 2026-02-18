/**
 * Integration tests for complete SRS workflow
 * These tests demonstrate real-world usage scenarios
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createNewCard,
  calculateNextReview,
  applyReviewResult,
  CardScheduler,
  type Card,
  type QualityRating,
  CardState,
  addDays,
} from '../index';

describe('SRS Integration Tests', () => {
  describe('Complete Review Workflow', () => {
    it('should handle a complete learning journey from new to mastered', () => {
      // Create a new card
      let card = createNewCard(
        'What is the Page Object Model?',
        'A design pattern for organizing test automation code'
      );

      expect(card.state).toBe(CardState.NEW);
      expect(card.repetition).toBe(0);
      expect(card.interval).toBe(0);

      // First review - good recall (quality 4)
      let result = calculateNextReview(card, 4);
      card = applyReviewResult(card, result);

      expect(card.state).toBe(CardState.LEARNING);
      expect(card.repetition).toBe(1);
      expect(card.interval).toBe(1); // 1 day
      expect(card.totalReviews).toBe(1);
      expect(card.correctReviews).toBe(1);

      // Second review - perfect recall (quality 5)
      result = calculateNextReview(card, 5);
      card = applyReviewResult(card, result);

      expect(card.state).toBe(CardState.REVIEW);
      expect(card.repetition).toBe(2);
      expect(card.interval).toBeGreaterThan(1);
      expect(card.totalReviews).toBe(2);
      expect(card.correctReviews).toBe(2);

      // Third review - still good (quality 4)
      result = calculateNextReview(card, 4);
      card = applyReviewResult(card, result);

      expect(card.state).toBe(CardState.REVIEW);
      expect(card.repetition).toBe(3);
      expect(card.interval).toBeGreaterThan(6);

      // Card is now in mature review state
      expect(card.streakCount).toBe(3);
    });

    it('should handle failed recall and recovery', () => {
      // Create a card with some progress
      let card = createNewCard('Test', 'Answer', {
        repetition: 3,
        interval: 15,
        state: CardState.REVIEW,
        streakCount: 3,
      });

      // Fail to recall (quality 1)
      let result = calculateNextReview(card, 1);
      card = applyReviewResult(card, result);

      expect(card.state).toBe(CardState.RELEARNING);
      expect(card.repetition).toBe(0);
      expect(card.interval).toBe(0);
      expect(card.streakCount).toBe(0);

      // Relearn - first attempt (quality 4)
      result = calculateNextReview(card, 4);
      card = applyReviewResult(card, result);

      expect(card.state).toBe(CardState.LEARNING);
      expect(card.repetition).toBe(1);

      // Relearn - second attempt (quality 5)
      result = calculateNextReview(card, 5);
      card = applyReviewResult(card, result);

      expect(card.state).toBe(CardState.REVIEW);
      expect(card.repetition).toBe(2);
    });
  });

  describe('Scheduler Integration', () => {
    let scheduler: CardScheduler;
    let cards: Card[];
    let now: Date;

    beforeEach(() => {
      scheduler = new CardScheduler();
      now = new Date('2024-01-15T10:00:00Z');

      // Create a realistic card collection
      cards = [
        // 5 new cards
        ...Array(5).fill(null).map((_, i) =>
          createNewCard(`New Question ${i + 1}`, `New Answer ${i + 1}`)
        ),

        // 10 cards due today
        ...Array(10).fill(null).map((_, i) =>
          createNewCard(`Due Today ${i + 1}`, `Answer ${i + 1}`, {
            repetition: 2,
            interval: 5,
            state: CardState.REVIEW,
            nextReviewDate: now,
          })
        ),

        // 3 overdue cards
        ...Array(3).fill(null).map((_, i) =>
          createNewCard(`Overdue ${i + 1}`, `Answer ${i + 1}`, {
            repetition: 2,
            interval: 7,
            state: CardState.REVIEW,
            nextReviewDate: addDays(now, -3),
          })
        ),

        // 5 cards due in the future
        ...Array(5).fill(null).map((_, i) =>
          createNewCard(`Future ${i + 1}`, `Answer ${i + 1}`, {
            repetition: 3,
            interval: 10,
            state: CardState.REVIEW,
            nextReviewDate: addDays(now, 5),
          })
        ),
      ];
    });

    it('should schedule appropriate cards for study session', () => {
      const schedule = scheduler.scheduleTodayCards(cards, now);

      // Should include due and new cards, respecting limits
      expect(schedule.length).toBeGreaterThan(0);
      expect(schedule.length).toBeLessThanOrEqual(20); // maxNewCardsPerDay default

      // Overdue cards should have high priority
      const overdueSchedules = schedule.filter(s => {
        const card = cards.find(c => c.id === s.cardId);
        return card && card.front.includes('Overdue');
      });

      expect(overdueSchedules.length).toBeGreaterThan(0);
      expect(overdueSchedules[0].priority).toBeGreaterThan(100);
    });

    it('should calculate accurate statistics', () => {
      // Add review history to cards
      const cardsWithHistory = cards.map(c => ({
        ...c,
        totalReviews: 5,
        correctReviews: 4,
      }));

      const retention = scheduler.calculateRetentionRate(cardsWithHistory);
      expect(retention).toBeCloseTo(80, 0); // 4/5 = 80%

      const progress = scheduler.getLearningProgress(cardsWithHistory);
      expect(progress.totalCards).toBe(cards.length);
      expect(progress.newCards).toBeGreaterThan(0);
    });

    it('should predict realistic workload', () => {
      const forecast = scheduler.predictFutureWorkload(cards, 7, 10000, now);

      expect(forecast).toHaveLength(7);

      // Today should have the most cards (due + overdue + new)
      const today = forecast[0];
      expect(today.dueCards).toBeGreaterThan(0);

      // Total time should be reasonable
      expect(today.estimatedTime).toBeGreaterThan(0);
      expect(today.estimatedTime).toBeLessThan(1000000); // Less than 1000 seconds
    });

    it('should provide useful study time recommendations', () => {
      const times = scheduler.getRecommendedStudyTime(cards, 10000);

      expect(times.minimumTime).toBeGreaterThan(0);
      expect(times.recommendedTime).toBeGreaterThanOrEqual(times.minimumTime);
      expect(times.allDueTime).toBeGreaterThanOrEqual(times.recommendedTime);
    });
  });

  describe('Real-world Scenario: 30-day Learning Journey', () => {
    it('should simulate a realistic learning progression', () => {
      const scheduler = new CardScheduler();
      let cards: Card[] = [];

      // Day 1: Create 10 new cards
      for (let i = 0; i < 10; i++) {
        cards.push(createNewCard(`Question ${i + 1}`, `Answer ${i + 1}`));
      }

      let day = new Date('2024-01-01T10:00:00Z');
      const stats = [];

      // Simulate 30 days of studying
      for (let dayNum = 0; dayNum < 30; dayNum++) {
        const dueCards = scheduler.getDueCards(cards, day);

        // Review due cards with varying quality
        const updatedCards = dueCards.map((card, index) => {
          // Simulate realistic quality distribution
          const quality: QualityRating =
            Math.random() > 0.8 ? 3 : Math.random() > 0.5 ? 4 : 5;

          const result = calculateNextReview(card, quality, day);
          return applyReviewResult(card, result);
        });

        // Update cards in main collection
        updatedCards.forEach(updatedCard => {
          const index = cards.findIndex(c => c.id === updatedCard.id);
          if (index !== -1) {
            cards[index] = updatedCard;
          }
        });

        // Collect daily statistics
        const retention = scheduler.calculateRetentionRate(cards);
        const progress = scheduler.getLearningProgress(cards);

        stats.push({
          day: dayNum + 1,
          dueCount: dueCards.length,
          retention,
          mastered: progress.masteredCards,
          completion: progress.completionRate,
        });

        // Move to next day
        day = addDays(day, 1);
      }

      // Verify learning progression
      const firstDay = stats[0];
      const lastDay = stats[stats.length - 1];

      // Retention should improve or stay high
      expect(lastDay.retention).toBeGreaterThanOrEqual(firstDay.retention - 10);

      // Some cards should be mastered by end
      expect(lastDay.mastered).toBeGreaterThan(0);

      // Completion rate should increase
      expect(lastDay.completion).toBeGreaterThan(firstDay.completion);

      // Should have reviewed cards multiple times
      const avgReviews =
        cards.reduce((sum, c) => sum + c.totalReviews, 0) / cards.length;
      expect(avgReviews).toBeGreaterThan(3);
    });
  });

  describe('Bulk Operations Performance', () => {
    it('should handle large card collections efficiently', () => {
      const scheduler = new CardScheduler();

      // Create 1000 cards
      const cards = Array(1000)
        .fill(null)
        .map((_, i) =>
          createNewCard(`Question ${i}`, `Answer ${i}`, {
            repetition: Math.floor(Math.random() * 5),
            interval: Math.floor(Math.random() * 30),
            state: Math.random() > 0.5 ? CardState.REVIEW : CardState.LEARNING,
          })
        );

      const start = Date.now();

      // Perform various operations
      const dueCards = scheduler.getDueCards(cards);
      const schedule = scheduler.scheduleTodayCards(cards);
      const retention = scheduler.calculateRetentionRate(cards);
      const forecast = scheduler.predictFutureWorkload(cards, 7);
      const progress = scheduler.getLearningProgress(cards);

      const elapsed = Date.now() - start;

      // All operations should complete quickly (< 100ms for 1000 cards)
      expect(elapsed).toBeLessThan(100);

      // Results should be valid
      expect(dueCards).toBeInstanceOf(Array);
      expect(schedule).toBeInstanceOf(Array);
      expect(retention).toBeGreaterThanOrEqual(0);
      expect(forecast).toHaveLength(7);
      expect(progress.totalCards).toBe(1000);
    });
  });

  describe('Edge Cases', () => {
    it('should handle card with extremely long interval', () => {
      const card = createNewCard('Test', 'Answer', {
        repetition: 20,
        interval: 36500, // 100 years (max)
        easinessFactor: 3.0,
      });

      const result = calculateNextReview(card, 5);
      const updated = applyReviewResult(card, result);

      // Should respect maximum interval
      expect(updated.interval).toBeLessThanOrEqual(36500);
    });

    it('should handle card with minimum easiness factor', () => {
      const card = createNewCard('Test', 'Answer', {
        easinessFactor: 1.3, // minimum
      });

      // Multiple failures should not reduce below minimum
      let currentCard = card;
      for (let i = 0; i < 5; i++) {
        const result = calculateNextReview(currentCard, 0);
        currentCard = applyReviewResult(currentCard, result);
      }

      expect(currentCard.easinessFactor).toBeGreaterThanOrEqual(1.3);
    });

    it('should handle empty card collection', () => {
      const scheduler = new CardScheduler();
      const emptyCards: Card[] = [];

      const dueCards = scheduler.getDueCards(emptyCards);
      const retention = scheduler.calculateRetentionRate(emptyCards);
      const progress = scheduler.getLearningProgress(emptyCards);

      expect(dueCards).toHaveLength(0);
      expect(retention).toBe(0);
      expect(progress.totalCards).toBe(0);
    });
  });

  describe('Configuration Changes', () => {
    it('should respect custom scheduler configuration', () => {
      const scheduler = new CardScheduler({
        maxNewCardsPerDay: 5,
        maxReviewsPerDay: 10,
        minimumEasinessFactor: 1.5,
      });

      const cards = Array(50)
        .fill(null)
        .map((_, i) => createNewCard(`Q${i}`, `A${i}`));

      const schedule = scheduler.scheduleTodayCards(cards);

      // Should respect new limits
      expect(schedule.length).toBeLessThanOrEqual(15); // 5 new + 10 reviews max
    });

    it('should allow configuration updates', () => {
      const scheduler = new CardScheduler();

      scheduler.updateConfig({ maxNewCardsPerDay: 100 });

      const config = scheduler.getConfig();
      expect(config.maxNewCardsPerDay).toBe(100);
    });
  });
});
