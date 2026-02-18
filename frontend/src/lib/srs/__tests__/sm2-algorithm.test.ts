/**
 * Unit tests for SM-2 Algorithm
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
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
} from '../sm2-algorithm';
import {
  Card,
  CardState,
  QualityRating,
  DEFAULT_SCHEDULER_CONFIG,
  DEFAULT_CARD_VALUES,
} from '../types';
import { createNewCard } from '../utils';

describe('SM-2 Algorithm', () => {
  let testCard: Card;

  beforeEach(() => {
    testCard = createNewCard(
      'Test Question',
      'Test Answer',
      {
        easinessFactor: 2.5,
        interval: 0,
        repetition: 0,
        state: CardState.NEW,
      }
    );
  });

  describe('updateEasinessFactor', () => {
    it('should increase EF for perfect recall (quality 5)', () => {
      const newEF = updateEasinessFactor(2.5, 5);
      expect(newEF).toBeGreaterThan(2.5);
      expect(newEF).toBeCloseTo(2.6, 1);
    });

    it('should decrease EF for poor recall (quality 0)', () => {
      const newEF = updateEasinessFactor(2.5, 0);
      expect(newEF).toBeLessThan(2.5);
    });

    it('should maintain EF close to current for quality 4', () => {
      const newEF = updateEasinessFactor(2.5, 4);
      expect(newEF).toBeCloseTo(2.5, 1);
    });

    it('should enforce minimum EF of 1.3', () => {
      const newEF = updateEasinessFactor(1.3, 0);
      expect(newEF).toBeGreaterThanOrEqual(1.3);
    });

    it('should apply custom minimum EF from config', () => {
      const config = { ...DEFAULT_SCHEDULER_CONFIG, minimumEasinessFactor: 1.5 };
      const newEF = updateEasinessFactor(1.5, 0, config);
      expect(newEF).toBeGreaterThanOrEqual(1.5);
    });

    it('should round to 2 decimal places', () => {
      const newEF = updateEasinessFactor(2.5, 4);
      expect(newEF.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(2);
    });
  });

  describe('calculateNextInterval', () => {
    it('should return 0 for failed recall (quality < 3)', () => {
      expect(calculateNextInterval(10, 3, 2.5, 0)).toBe(0);
      expect(calculateNextInterval(10, 3, 2.5, 1)).toBe(0);
      expect(calculateNextInterval(10, 3, 2.5, 2)).toBe(0);
    });

    it('should return 1 day for first successful review', () => {
      const interval = calculateNextInterval(0, 0, 2.5, 4);
      expect(interval).toBe(1);
    });

    it('should return 6 days for second successful review', () => {
      const interval = calculateNextInterval(1, 1, 2.5, 4);
      expect(interval).toBe(6);
    });

    it('should multiply by EF for subsequent reviews', () => {
      const interval = calculateNextInterval(6, 2, 2.5, 4);
      expect(interval).toBe(15); // 6 * 2.5 = 15
    });

    it('should apply easy bonus for perfect recall (quality 5)', () => {
      const config = { ...DEFAULT_SCHEDULER_CONFIG, easyBonus: 1.3 };
      const interval = calculateNextInterval(6, 2, 2.5, 5, config);
      expect(interval).toBeGreaterThan(15); // More than 6 * 2.5
    });

    it('should reduce interval for hard recall (quality 3)', () => {
      const config = { ...DEFAULT_SCHEDULER_CONFIG, hardInterval: 1.2 };
      const interval = calculateNextInterval(6, 2, 2.5, 3, config);
      expect(interval).toBe(18); // (6 * 2.5) * 1.2
    });

    it('should respect maximum interval', () => {
      const config = { ...DEFAULT_SCHEDULER_CONFIG, maximumInterval: 100 };
      const interval = calculateNextInterval(90, 5, 2.5, 5, config);
      expect(interval).toBeLessThanOrEqual(100);
    });
  });

  describe('trackRepetitionCount', () => {
    it('should increment repetition for passing grades', () => {
      expect(trackRepetitionCount(0, 3)).toBe(1);
      expect(trackRepetitionCount(1, 4)).toBe(2);
      expect(trackRepetitionCount(2, 5)).toBe(3);
    });

    it('should reset repetition for failing grades', () => {
      expect(trackRepetitionCount(5, 0)).toBe(0);
      expect(trackRepetitionCount(3, 1)).toBe(0);
      expect(trackRepetitionCount(2, 2)).toBe(0);
    });
  });

  describe('handleFailedRecall', () => {
    it('should reset interval to 0', () => {
      const result = handleFailedRecall(testCard);
      expect(result.interval).toBe(0);
    });

    it('should reset repetition to 0', () => {
      const result = handleFailedRecall(testCard);
      expect(result.repetition).toBe(0);
    });

    it('should set state to RELEARNING', () => {
      const result = handleFailedRecall(testCard);
      expect(result.state).toBe(CardState.RELEARNING);
    });

    it('should reset streak count to 0', () => {
      const result = handleFailedRecall(testCard);
      expect(result.streakCount).toBe(0);
    });
  });

  describe('calculateNextReview', () => {
    it('should calculate review result for new card with good response', () => {
      const result = calculateNextReview(testCard, 4);

      expect(result.cardId).toBe(testCard.id);
      expect(result.quality).toBe(4);
      expect(result.newRepetition).toBe(1);
      expect(result.newInterval).toBe(1);
      expect(result.newState).toBe(CardState.LEARNING);
    });

    it('should calculate review result for failed recall', () => {
      const result = calculateNextReview(testCard, 1);

      expect(result.newRepetition).toBe(0);
      expect(result.newInterval).toBe(0);
      expect(result.newState).toBe(CardState.RELEARNING);
    });

    it('should progress card to REVIEW state after 2 repetitions', () => {
      const card = { ...testCard, repetition: 1, interval: 1 };
      const result = calculateNextReview(card, 4);

      expect(result.newRepetition).toBe(2);
      expect(result.newState).toBe(CardState.REVIEW);
    });

    it('should use provided review date', () => {
      const reviewDate = new Date('2024-01-15T10:00:00Z');
      const result = calculateNextReview(testCard, 4, reviewDate);

      expect(result.reviewDate).toEqual(reviewDate);
    });

    it('should calculate correct next review date', () => {
      const reviewDate = new Date('2024-01-15T10:00:00Z');
      const result = calculateNextReview(testCard, 4, reviewDate);

      const expectedDate = new Date('2024-01-16T10:00:00Z');
      expect(result.nextReviewDate.toISOString()).toBe(expectedDate.toISOString());
    });

    it('should handle relearning cards with 10-minute interval', () => {
      const reviewDate = new Date('2024-01-15T10:00:00Z');
      const result = calculateNextReview(testCard, 2, reviewDate);

      expect(result.newInterval).toBe(0);
      const minutesDiff = (result.nextReviewDate.getTime() - reviewDate.getTime()) / 60000;
      expect(minutesDiff).toBe(10);
    });
  });

  describe('applyReviewResult', () => {
    it('should update card with review result', () => {
      const reviewDate = new Date('2024-01-15T10:00:00Z');
      const result = calculateNextReview(testCard, 4, reviewDate);
      const updatedCard = applyReviewResult(testCard, result);

      expect(updatedCard.easinessFactor).toBe(result.newEasinessFactor);
      expect(updatedCard.interval).toBe(result.newInterval);
      expect(updatedCard.repetition).toBe(result.newRepetition);
      expect(updatedCard.state).toBe(result.newState);
      expect(updatedCard.lastReviewDate).toEqual(reviewDate);
      expect(updatedCard.nextReviewDate).toEqual(result.nextReviewDate);
    });

    it('should increment total reviews', () => {
      const result = calculateNextReview(testCard, 4);
      const updatedCard = applyReviewResult(testCard, result);

      expect(updatedCard.totalReviews).toBe(1);
    });

    it('should increment correct reviews for passing grade', () => {
      const result = calculateNextReview(testCard, 4);
      const updatedCard = applyReviewResult(testCard, result);

      expect(updatedCard.correctReviews).toBe(1);
    });

    it('should not increment correct reviews for failing grade', () => {
      const result = calculateNextReview(testCard, 2);
      const updatedCard = applyReviewResult(testCard, result);

      expect(updatedCard.correctReviews).toBe(0);
    });

    it('should increment streak count for passing grade', () => {
      const result = calculateNextReview(testCard, 4);
      const updatedCard = applyReviewResult(testCard, result);

      expect(updatedCard.streakCount).toBe(1);
    });

    it('should reset streak count for failing grade', () => {
      const cardWithStreak = { ...testCard, streakCount: 5 };
      const result = calculateNextReview(cardWithStreak, 2);
      const updatedCard = applyReviewResult(cardWithStreak, result);

      expect(updatedCard.streakCount).toBe(0);
    });

    it('should preserve original card data', () => {
      const result = calculateNextReview(testCard, 4);
      const updatedCard = applyReviewResult(testCard, result);

      expect(updatedCard.id).toBe(testCard.id);
      expect(updatedCard.front).toBe(testCard.front);
      expect(updatedCard.back).toBe(testCard.back);
      expect(updatedCard.createdAt).toEqual(testCard.createdAt);
    });
  });

  describe('calculateBulkReviews', () => {
    it('should calculate reviews for multiple cards', () => {
      const cards = [
        createNewCard('Q1', 'A1'),
        createNewCard('Q2', 'A2'),
        createNewCard('Q3', 'A3'),
      ];

      const reviews = calculateBulkReviews([
        { card: cards[0], quality: 4 },
        { card: cards[1], quality: 5 },
        { card: cards[2], quality: 2 },
      ]);

      expect(reviews).toHaveLength(3);
      expect(reviews[0].cardId).toBe(cards[0].id);
      expect(reviews[1].cardId).toBe(cards[1].id);
      expect(reviews[2].cardId).toBe(cards[2].id);
    });

    it('should handle different quality ratings', () => {
      const card = createNewCard('Q', 'A');
      const reviews = calculateBulkReviews([
        { card, quality: 0 },
        { card, quality: 5 },
      ]);

      expect(reviews[0].newInterval).toBe(0); // Failed
      expect(reviews[1].newInterval).toBeGreaterThan(0); // Passed
    });
  });

  describe('applyBulkReviews', () => {
    it('should apply multiple review results to cards', () => {
      const cards = [
        createNewCard('Q1', 'A1'),
        createNewCard('Q2', 'A2'),
      ];

      const results = calculateBulkReviews([
        { card: cards[0], quality: 4 },
        { card: cards[1], quality: 5 },
      ]);

      const updatedCards = applyBulkReviews(cards, results);

      expect(updatedCards[0].totalReviews).toBe(1);
      expect(updatedCards[1].totalReviews).toBe(1);
      expect(updatedCards[0].repetition).toBe(1);
      expect(updatedCards[1].repetition).toBe(1);
    });

    it('should preserve cards not in review results', () => {
      const cards = [
        createNewCard('Q1', 'A1'),
        createNewCard('Q2', 'A2'),
        createNewCard('Q3', 'A3'),
      ];

      const results = calculateBulkReviews([
        { card: cards[0], quality: 4 },
      ]);

      const updatedCards = applyBulkReviews(cards, results);

      expect(updatedCards[0].totalReviews).toBe(1);
      expect(updatedCards[1].totalReviews).toBe(0);
      expect(updatedCards[2].totalReviews).toBe(0);
    });
  });

  describe('calculateOptimalInterval', () => {
    it('should return 1 for first repetition', () => {
      const interval = calculateOptimalInterval(0, 2.5);
      expect(interval).toBe(1);
    });

    it('should return 6 for second repetition', () => {
      const interval = calculateOptimalInterval(1, 2.5);
      expect(interval).toBe(6);
    });

    it('should calculate exponentially for later repetitions', () => {
      const interval1 = calculateOptimalInterval(2, 2.5);
      const interval2 = calculateOptimalInterval(3, 2.5);

      expect(interval1).toBe(15); // 6 * 2.5
      expect(interval2).toBe(38); // 15 * 2.5 (rounded)
    });

    it('should respect maximum interval', () => {
      const config = { ...DEFAULT_SCHEDULER_CONFIG, maximumInterval: 100 };
      const interval = calculateOptimalInterval(10, 2.5, config);
      expect(interval).toBeLessThanOrEqual(100);
    });
  });

  describe('predictFutureReviews', () => {
    it('should predict future review dates', () => {
      const dates = predictFutureReviews(testCard, 4, 5);

      expect(dates).toHaveLength(5);
      expect(dates[0]).toBeInstanceOf(Date);
      expect(dates[1].getTime()).toBeGreaterThan(dates[0].getTime());
    });

    it('should show exponential spacing for consistent quality', () => {
      const dates = predictFutureReviews(testCard, 4, 3);

      const interval1 = (dates[0].getTime() - testCard.nextReviewDate.getTime()) / (1000 * 60 * 60 * 24);
      const interval2 = (dates[1].getTime() - dates[0].getTime()) / (1000 * 60 * 60 * 24);

      expect(interval2).toBeGreaterThan(interval1);
    });
  });

  describe('calculateCardStability', () => {
    it('should return 0 for new card', () => {
      const stability = calculateCardStability(testCard);
      expect(stability).toBeGreaterThanOrEqual(0);
      expect(stability).toBeLessThan(50);
    });

    it('should increase with repetition count', () => {
      const card1 = { ...testCard, repetition: 0 };
      const card2 = { ...testCard, repetition: 5 };

      const stability1 = calculateCardStability(card1);
      const stability2 = calculateCardStability(card2);

      expect(stability2).toBeGreaterThan(stability1);
    });

    it('should increase with higher easiness factor', () => {
      const card1 = { ...testCard, easinessFactor: 1.3 };
      const card2 = { ...testCard, easinessFactor: 3.0 };

      const stability1 = calculateCardStability(card1);
      const stability2 = calculateCardStability(card2);

      expect(stability2).toBeGreaterThan(stability1);
    });

    it('should increase with longer intervals', () => {
      const card1 = { ...testCard, interval: 1 };
      const card2 = { ...testCard, interval: 100 };

      const stability1 = calculateCardStability(card1);
      const stability2 = calculateCardStability(card2);

      expect(stability2).toBeGreaterThan(stability1);
    });

    it('should return value between 0 and 100', () => {
      const matureCard = {
        ...testCard,
        repetition: 10,
        easinessFactor: 3.0,
        interval: 365,
      };

      const stability = calculateCardStability(matureCard);
      expect(stability).toBeGreaterThanOrEqual(0);
      expect(stability).toBeLessThanOrEqual(100);
    });
  });

  describe('adjustEasinessFactor', () => {
    it('should increase EF with positive adjustment', () => {
      const newEF = adjustEasinessFactor(testCard, 0.5);
      expect(newEF).toBe(3.0);
    });

    it('should decrease EF with negative adjustment', () => {
      const newEF = adjustEasinessFactor(testCard, -0.5);
      expect(newEF).toBe(2.0);
    });

    it('should respect minimum EF', () => {
      const newEF = adjustEasinessFactor(testCard, -5);
      expect(newEF).toBeGreaterThanOrEqual(1.3);
    });

    it('should respect maximum EF of 5.0', () => {
      const newEF = adjustEasinessFactor(testCard, 5);
      expect(newEF).toBeLessThanOrEqual(5.0);
    });

    it('should round to 2 decimal places', () => {
      const newEF = adjustEasinessFactor(testCard, 0.123);
      expect(newEF.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very high repetition counts', () => {
      const card = { ...testCard, repetition: 100, interval: 36500 };
      const result = calculateNextReview(card, 4);

      expect(result.newRepetition).toBe(101);
      expect(result.newInterval).toBeLessThanOrEqual(DEFAULT_SCHEDULER_CONFIG.maximumInterval);
    });

    it('should handle minimum easiness factor', () => {
      const card = { ...testCard, easinessFactor: 1.3 };
      const result = calculateNextReview(card, 0);

      expect(result.newEasinessFactor).toBeGreaterThanOrEqual(1.3);
    });

    it('should handle all quality ratings correctly', () => {
      const qualities: QualityRating[] = [0, 1, 2, 3, 4, 5];

      qualities.forEach(quality => {
        const result = calculateNextReview(testCard, quality);
        expect(result.quality).toBe(quality);
        expect(result.newEasinessFactor).toBeGreaterThanOrEqual(1.3);
      });
    });
  });
});
