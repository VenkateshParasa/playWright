/**
 * Retention Calculator for SRS System
 * Calculates retention rates, predicts future retention, and analyzes factors
 */

import { FlashCard, CardReview } from '../../types/flashcard.types';
import { RetentionData, RetentionCurve, RETENTION_INTERVALS } from '../../types/schedule.types';
import { differenceInDays, parseISO } from 'date-fns';

/**
 * Card with review history for retention analysis
 */
export interface CardWithHistory extends FlashCard {
  reviewHistory: CardReview[];
}

/**
 * Retention analysis result
 */
export interface RetentionAnalysis {
  interval: string;
  days: number;
  reviewed: number; // Cards that reached this interval
  remembered: number; // Cards that were successfully recalled
  retentionRate: number; // Percentage
}

/**
 * Calculate retention rate for a specific time interval
 *
 * @param cards - Cards with review history
 * @param intervalDays - Number of days after initial review
 * @param qualityThreshold - Minimum quality rating to count as "remembered" (default: 3)
 * @returns Retention analysis for the interval
 */
export function calculateRetentionForInterval(
  cards: CardWithHistory[],
  intervalDays: number,
  qualityThreshold: number = 3
): RetentionAnalysis {
  // Find cards that have been reviewed and reached this interval
  const relevantCards = cards.filter(card => {
    if (!card.lastReviewed || card.reviewHistory.length < 2) {
      return false;
    }

    const firstReview = new Date(card.reviewHistory[0].timestamp);
    const lastReview = card.lastReviewed;
    const daysSinceFirst = differenceInDays(lastReview, firstReview);

    // Card must have reached or passed this interval
    return daysSinceFirst >= intervalDays;
  });

  if (relevantCards.length === 0) {
    return {
      interval: `${intervalDays} days`,
      days: intervalDays,
      reviewed: 0,
      remembered: 0,
      retentionRate: 0,
    };
  }

  // Count how many cards were successfully recalled at this interval
  let remembered = 0;

  for (const card of relevantCards) {
    const firstReview = new Date(card.reviewHistory[0].timestamp);

    // Find the review closest to the target interval
    const targetDate = new Date(firstReview);
    targetDate.setDate(targetDate.getDate() + intervalDays);

    // Find review within ±20% of target interval
    const tolerance = Math.max(1, Math.floor(intervalDays * 0.2));
    const relevantReview = card.reviewHistory.find(review => {
      const reviewDate = new Date(review.timestamp);
      const daysSinceFirst = differenceInDays(reviewDate, firstReview);
      const diff = Math.abs(daysSinceFirst - intervalDays);
      return diff <= tolerance;
    });

    if (relevantReview && relevantReview.quality >= qualityThreshold) {
      remembered++;
    }
  }

  const retentionRate = (remembered / relevantCards.length) * 100;

  return {
    interval: `${intervalDays} days`,
    days: intervalDays,
    reviewed: relevantCards.length,
    remembered,
    retentionRate: Math.round(retentionRate * 100) / 100, // Round to 2 decimal places
  };
}

/**
 * Calculate retention curve across multiple intervals
 *
 * @param cards - Cards with review history
 * @param intervals - Array of day intervals to analyze (defaults to standard intervals)
 * @returns Complete retention curve data
 */
export function calculateRetentionCurve(
  cards: CardWithHistory[],
  intervals?: number[]
): RetentionCurve {
  const targetIntervals = intervals || RETENTION_INTERVALS.map(i => i.days);

  const retentionData: RetentionData[] = targetIntervals.map(days => {
    const analysis = calculateRetentionForInterval(cards, days);

    return {
      interval: RETENTION_INTERVALS.find(i => i.days === days)?.label || `${days} days`,
      days,
      retentionRate: analysis.retentionRate,
      sampleSize: analysis.reviewed,
    };
  });

  // Calculate average retention rate (weighted by sample size)
  const totalSamples = retentionData.reduce((sum, d) => sum + d.sampleSize, 0);
  const averageRetention =
    totalSamples > 0
      ? retentionData.reduce((sum, d) => sum + d.retentionRate * d.sampleSize, 0) / totalSamples
      : 0;

  return {
    intervals: retentionData,
    averageRetention: Math.round(averageRetention * 100) / 100,
  };
}

/**
 * Predict future retention rate based on current data
 * Uses exponential decay model: R(t) = R₀ * e^(-λt)
 *
 * @param retentionCurve - Current retention curve
 * @param targetDays - Days in the future to predict
 * @returns Predicted retention rate (0-100)
 */
export function predictFutureRetention(
  retentionCurve: RetentionCurve,
  targetDays: number
): number {
  const validData = retentionCurve.intervals.filter(d => d.sampleSize > 0);

  if (validData.length < 2) {
    // Not enough data for prediction
    return retentionCurve.averageRetention;
  }

  // Fit exponential decay model
  // Using simple two-point method with first and last data points
  const first = validData[0];
  const last = validData[validData.length - 1];

  const R0 = first.retentionRate / 100; // Convert to decimal
  const Rt = last.retentionRate / 100;
  const t = last.days - first.days;

  if (t === 0 || R0 === 0) {
    return retentionCurve.averageRetention;
  }

  // Calculate decay constant: λ = -ln(Rt/R0) / t
  const lambda = -Math.log(Rt / R0) / t;

  // Predict: R(target) = R0 * e^(-λ * target)
  const predictedRetention = R0 * Math.exp(-lambda * targetDays);

  // Convert back to percentage and clamp between 0-100
  return Math.max(0, Math.min(100, predictedRetention * 100));
}

/**
 * Analyze factors affecting retention
 *
 * @param cards - Cards with review history
 * @returns Analysis of retention factors
 */
export function analyzeRetentionFactors(cards: CardWithHistory[]): {
  byDifficulty: Record<string, number>;
  byCategory: Record<string, number>;
  byInitialQuality: Record<string, number>;
  byReviewFrequency: {
    range: string;
    averageRetention: number;
  }[];
} {
  // Retention by difficulty
  const byDifficulty: Record<string, { total: number; sum: number }> = {};

  cards.forEach(card => {
    if (!byDifficulty[card.difficulty]) {
      byDifficulty[card.difficulty] = { total: 0, sum: 0 };
    }
    byDifficulty[card.difficulty].total++;
    if (card.successRate !== undefined) {
      byDifficulty[card.difficulty].sum += card.successRate;
    }
  });

  const difficultyRetention: Record<string, number> = {};
  Object.keys(byDifficulty).forEach(key => {
    const data = byDifficulty[key];
    difficultyRetention[key] = data.total > 0 ? data.sum / data.total : 0;
  });

  // Retention by category
  const byCategory: Record<string, { total: number; sum: number }> = {};

  cards.forEach(card => {
    if (!byCategory[card.category]) {
      byCategory[card.category] = { total: 0, sum: 0 };
    }
    byCategory[card.category].total++;
    if (card.successRate !== undefined) {
      byCategory[card.category].sum += card.successRate;
    }
  });

  const categoryRetention: Record<string, number> = {};
  Object.keys(byCategory).forEach(key => {
    const data = byCategory[key];
    categoryRetention[key] = data.total > 0 ? data.sum / data.total : 0;
  });

  // Retention by initial quality (first review quality)
  const byInitialQuality: Record<string, { total: number; sum: number }> = {
    '0-1': { total: 0, sum: 0 },
    '2-3': { total: 0, sum: 0 },
    '4-5': { total: 0, sum: 0 },
  };

  cards.forEach(card => {
    if (card.reviewHistory.length > 0) {
      const firstQuality = card.reviewHistory[0].quality;
      let bucket: string;

      if (firstQuality <= 1) bucket = '0-1';
      else if (firstQuality <= 3) bucket = '2-3';
      else bucket = '4-5';

      byInitialQuality[bucket].total++;
      if (card.successRate !== undefined) {
        byInitialQuality[bucket].sum += card.successRate;
      }
    }
  });

  const initialQualityRetention: Record<string, number> = {};
  Object.keys(byInitialQuality).forEach(key => {
    const data = byInitialQuality[key];
    initialQualityRetention[key] = data.total > 0 ? data.sum / data.total : 0;
  });

  // Retention by review frequency
  const byFrequency: {
    range: string;
    cards: CardWithHistory[];
  }[] = [
    { range: '1-5 reviews', cards: [] },
    { range: '6-10 reviews', cards: [] },
    { range: '11-20 reviews', cards: [] },
    { range: '21+ reviews', cards: [] },
  ];

  cards.forEach(card => {
    const reviewCount = card.reviewHistory.length;

    if (reviewCount <= 5) byFrequency[0].cards.push(card);
    else if (reviewCount <= 10) byFrequency[1].cards.push(card);
    else if (reviewCount <= 20) byFrequency[2].cards.push(card);
    else byFrequency[3].cards.push(card);
  });

  const frequencyRetention = byFrequency.map(group => ({
    range: group.range,
    averageRetention:
      group.cards.length > 0
        ? group.cards.reduce((sum, c) => sum + (c.successRate || 0), 0) / group.cards.length
        : 0,
  }));

  return {
    byDifficulty: difficultyRetention,
    byCategory: categoryRetention,
    byInitialQuality: initialQualityRetention,
    byReviewFrequency: frequencyRetention,
  };
}

/**
 * Calculate confidence intervals for retention curve
 * Uses Wilson score interval for binomial proportions
 *
 * @param retentionCurve - Retention curve data
 * @param confidenceLevel - Confidence level (default: 0.95 for 95%)
 * @returns Retention curve with confidence intervals
 */
export function calculateConfidenceIntervals(
  retentionCurve: RetentionCurve,
  confidenceLevel: number = 0.95
): RetentionCurve {
  // Z-score for confidence level (1.96 for 95%)
  const z = confidenceLevel === 0.95 ? 1.96 : 2.576; // 99% = 2.576

  const intervalsWithCI = retentionCurve.intervals.map(data => {
    const n = data.sampleSize;
    const p = data.retentionRate / 100; // Convert to decimal

    if (n === 0) {
      return { ...data };
    }

    // Wilson score interval
    const denominator = 1 + (z * z) / n;
    const center = (p + (z * z) / (2 * n)) / denominator;
    const margin = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / denominator;

    const lower = Math.max(0, (center - margin) * 100);
    const upper = Math.min(100, (center + margin) * 100);

    return {
      ...data,
      confidenceInterval: {
        lower: Math.round(lower * 100) / 100,
        upper: Math.round(upper * 100) / 100,
      },
    };
  });

  return {
    ...retentionCurve,
    intervals: intervalsWithCI,
  };
}

/**
 * Get retention recommendations based on analysis
 *
 * @param retentionCurve - Retention curve data
 * @returns Array of recommendations
 */
export function getRetentionRecommendations(retentionCurve: RetentionCurve): string[] {
  const recommendations: string[] = [];
  const avgRetention = retentionCurve.averageRetention;

  if (avgRetention < 70) {
    recommendations.push('Your overall retention is below 70%. Consider reviewing cards more frequently.');
  }

  if (avgRetention >= 90) {
    recommendations.push('Excellent retention! Your spaced repetition schedule is working well.');
  }

  // Check for steep drops
  for (let i = 1; i < retentionCurve.intervals.length; i++) {
    const prev = retentionCurve.intervals[i - 1];
    const curr = retentionCurve.intervals[i];

    if (prev.sampleSize > 0 && curr.sampleSize > 0) {
      const drop = prev.retentionRate - curr.retentionRate;

      if (drop > 20) {
        recommendations.push(
          `Significant retention drop detected between ${prev.interval} and ${curr.interval}. Consider adding intermediate review sessions.`
        );
      }
    }
  }

  // Check for insufficient data
  const lowSampleIntervals = retentionCurve.intervals.filter(d => d.sampleSize < 10 && d.sampleSize > 0);

  if (lowSampleIntervals.length > 0) {
    recommendations.push(
      'Some intervals have insufficient data. Continue studying to improve retention predictions.'
    );
  }

  return recommendations;
}

/**
 * Export retention data to CSV format
 *
 * @param retentionCurve - Retention curve data
 * @returns CSV string
 */
export function exportRetentionToCSV(retentionCurve: RetentionCurve): string {
  const headers = ['Interval', 'Days', 'Retention Rate (%)', 'Sample Size'];
  const rows = retentionCurve.intervals.map(data => [
    data.interval,
    data.days.toString(),
    data.retentionRate.toFixed(2),
    data.sampleSize.toString(),
  ]);

  const csv = [headers, ...rows].map(row => row.join(',')).join('\n');

  return csv;
}
