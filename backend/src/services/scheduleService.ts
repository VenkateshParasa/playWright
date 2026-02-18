/**
 * Schedule Service
 * Business logic for schedule-related operations
 */

import { Card, ICard } from '../models/Card';
import mongoose from 'mongoose';

export interface CalendarData {
  date: string;
  count: number;
  breakdown: {
    new: number;
    learning: number;
    review: number;
  };
}

export interface ForecastData {
  date: string;
  new: number;
  learning: number;
  review: number;
  total: number;
  estimatedTime: number;
}

export interface HeatmapData {
  date: string;
  count: number;
  intensity: number;
}

export interface RetentionInterval {
  interval: string;
  days: number;
  retentionRate: number;
  sampleSize: number;
}

export class ScheduleService {
  /**
   * Get calendar data for date range
   */
  async getCalendarData(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CalendarData[]> {
    const cards = await Card.find({
      userId: new mongoose.Types.ObjectId(userId),
      isActive: true,
      nextReviewDate: {
        $gte: startDate,
        $lte: endDate,
      },
    }).select('nextReviewDate state');

    // Group by date
    const dateMap = new Map<string, CalendarData>();

    cards.forEach(card => {
      const dateStr = card.nextReviewDate.toISOString().split('T')[0];

      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, {
          date: dateStr,
          count: 0,
          breakdown: { new: 0, learning: 0, review: 0 },
        });
      }

      const data = dateMap.get(dateStr)!;
      data.count++;

      if (card.state === 'new') data.breakdown.new++;
      else if (card.state === 'learning' || card.state === 'relearning')
        data.breakdown.learning++;
      else data.breakdown.review++;
    });

    return Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get forecast data for next N days
   */
  async getForecastData(userId: string, days: number): Promise<ForecastData[]> {
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + days);

    const cards = await Card.find({
      userId: new mongoose.Types.ObjectId(userId),
      isActive: true,
      nextReviewDate: {
        $gte: startDate,
        $lt: endDate,
      },
    }).select('nextReviewDate state');

    // Group by date
    const dateMap = new Map<string, ForecastData>();

    // Initialize all dates
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      dateMap.set(dateStr, {
        date: dateStr,
        new: 0,
        learning: 0,
        review: 0,
        total: 0,
        estimatedTime: 0,
      });
    }

    // Fill with data
    cards.forEach(card => {
      const dateStr = card.nextReviewDate.toISOString().split('T')[0];
      const data = dateMap.get(dateStr);

      if (data) {
        data.total++;

        if (card.state === 'new') data.new++;
        else if (card.state === 'learning' || card.state === 'relearning')
          data.learning++;
        else data.review++;

        // Estimate 10 seconds per card
        data.estimatedTime = Math.ceil((data.total * 10) / 60); // in minutes
      }
    });

    return Array.from(dateMap.values());
  }

  /**
   * Get heatmap data for a year
   */
  async getHeatmapData(userId: string, year: number): Promise<HeatmapData[]> {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    // Get all reviews in the year
    const cards = await Card.find({
      userId: new mongoose.Types.ObjectId(userId),
      isActive: true,
      'reviewHistory.timestamp': {
        $gte: startDate,
        $lte: endDate,
      },
    }).select('reviewHistory');

    // Count reviews by date
    const dateMap = new Map<string, number>();

    cards.forEach(card => {
      card.reviewHistory.forEach(review => {
        const reviewDate = new Date(review.timestamp);
        if (reviewDate >= startDate && reviewDate <= endDate) {
          const dateStr = reviewDate.toISOString().split('T')[0];
          dateMap.set(dateStr, (dateMap.get(dateStr) || 0) + 1);
        }
      });
    });

    // Convert to array with intensity levels
    const heatmapData: HeatmapData[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const count = dateMap.get(dateStr) || 0;
      const intensity = this.calculateIntensity(count);

      heatmapData.push({ date: dateStr, count, intensity });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return heatmapData;
  }

  /**
   * Calculate heatmap intensity (0-4)
   */
  private calculateIntensity(count: number): number {
    if (count === 0) return 0;
    if (count <= 5) return 1;
    if (count <= 10) return 2;
    if (count <= 20) return 3;
    return 4;
  }

  /**
   * Calculate retention curve
   */
  async getRetentionCurve(userId: string, categoryId?: string): Promise<{
    intervals: RetentionInterval[];
    averageRetention: number;
  }> {
    const query: any = {
      userId: new mongoose.Types.ObjectId(userId),
      isActive: true,
      totalReviews: { $gt: 0 },
    };

    if (categoryId) {
      query.category = categoryId;
    }

    const cards = await Card.find(query).select(
      'reviewHistory totalReviews correctReviews successRate'
    );

    // Define intervals to analyze (in days)
    const intervalDays = [1, 3, 7, 14, 30, 60, 90, 180, 365];
    const intervals: RetentionInterval[] = [];

    for (const days of intervalDays) {
      const retention = this.calculateRetentionForInterval(cards, days);
      intervals.push(retention);
    }

    // Calculate average
    const totalSamples = intervals.reduce((sum, i) => sum + i.sampleSize, 0);
    const averageRetention =
      totalSamples > 0
        ? intervals.reduce((sum, i) => sum + i.retentionRate * i.sampleSize, 0) /
          totalSamples
        : 0;

    return {
      intervals,
      averageRetention: Math.round(averageRetention * 100) / 100,
    };
  }

  /**
   * Calculate retention for a specific interval
   */
  private calculateRetentionForInterval(
    cards: any[],
    intervalDays: number
  ): RetentionInterval {
    const relevantCards = cards.filter(card => {
      if (card.reviewHistory.length < 2) return false;

      const firstReview = new Date(card.reviewHistory[0].timestamp);
      const lastReview = new Date(card.reviewHistory[card.reviewHistory.length - 1].timestamp);
      const daysSinceFirst = Math.floor(
        (lastReview.getTime() - firstReview.getTime()) / (1000 * 60 * 60 * 24)
      );

      return daysSinceFirst >= intervalDays;
    });

    if (relevantCards.length === 0) {
      return {
        interval: `${intervalDays} day${intervalDays !== 1 ? 's' : ''}`,
        days: intervalDays,
        retentionRate: 0,
        sampleSize: 0,
      };
    }

    // Use average success rate as proxy for retention
    const avgSuccessRate =
      relevantCards.reduce((sum, c) => sum + c.successRate, 0) / relevantCards.length;

    return {
      interval: `${intervalDays} day${intervalDays !== 1 ? 's' : ''}`,
      days: intervalDays,
      retentionRate: Math.round(avgSuccessRate * 100) / 100,
      sampleSize: relevantCards.length,
    };
  }

  /**
   * Get day breakdown
   */
  async getDayBreakdown(userId: string, date: string): Promise<any> {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const cards = await Card.find({
      userId: new mongoose.Types.ObjectId(userId),
      isActive: true,
      nextReviewDate: {
        $gte: targetDate,
        $lt: nextDate,
      },
    });

    // Build breakdown
    const byCategory: Record<string, number> = {};
    const byType = { new: 0, learning: 0, review: 0 };
    let totalInterval = 0;

    const cardList = cards.map(card => {
      // Update category count
      byCategory[card.category] = (byCategory[card.category] || 0) + 1;

      // Update type count
      if (card.state === 'new') byType.new++;
      else if (card.state === 'learning' || card.state === 'relearning')
        byType.learning++;
      else byType.review++;

      totalInterval += card.interval;

      return {
        id: card._id.toString(),
        front: card.front,
        back: card.back,
        category: card.category,
        difficulty: card.difficulty,
        type: card.state === 'new' ? 'new' : card.state === 'learning' || card.state === 'relearning' ? 'learning' : 'review',
        interval: card.interval,
      };
    });

    const averageInterval = cards.length > 0 ? totalInterval / cards.length : 0;
    const estimatedTime = Math.ceil((cards.length * 10) / 60); // 10 seconds per card, in minutes

    return {
      date,
      cards: cardList,
      summary: {
        total: cards.length,
        byCategory,
        byType,
        averageInterval: Math.round(averageInterval * 10) / 10,
        estimatedTime,
      },
    };
  }

  /**
   * Get study time analytics
   */
  async getStudyTimeAnalytics(userId: string): Promise<any> {
    const cards = await Card.find({
      userId: new mongoose.Types.ObjectId(userId),
      isActive: true,
      totalReviews: { $gt: 0 },
    }).select('reviewHistory category');

    // Calculate totals
    let totalTime = 0;
    let weekTime = 0;
    let monthTime = 0;
    const byCategory: Record<string, number> = {};
    const byHourOfDay = new Array(24).fill(0);
    const studyDaysSet = new Set<string>();

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    cards.forEach(card => {
      card.reviewHistory.forEach(review => {
        const reviewDate = new Date(review.timestamp);
        const timeInSeconds = review.timeSpent / 1000;

        totalTime += timeInSeconds;

        if (reviewDate >= weekAgo) {
          weekTime += timeInSeconds;
        }

        if (reviewDate >= monthAgo) {
          monthTime += timeInSeconds;
        }

        // By category
        byCategory[card.category] = (byCategory[card.category] || 0) + timeInSeconds;

        // By hour
        const hour = reviewDate.getHours();
        byHourOfDay[hour] += timeInSeconds;

        // Study days
        const dateStr = reviewDate.toISOString().split('T')[0];
        studyDaysSet.add(dateStr);
      });
    });

    // Calculate average session duration
    const totalReviews = cards.reduce((sum, c) => sum + c.reviewHistory.length, 0);
    const averageSessionDuration = totalReviews > 0 ? totalTime / totalReviews : 0;

    // Find most productive hours (top 3)
    const hourIndices = byHourOfDay
      .map((time, hour) => ({ hour, time }))
      .sort((a, b) => b.time - a.time)
      .slice(0, 3)
      .map(h => h.hour);

    // Calculate streak
    const sortedDays = Array.from(studyDaysSet).sort().reverse();
    let streak = 0;
    const today = now.toISOString().split('T')[0];

    for (let i = 0; i < sortedDays.length; i++) {
      const expectedDate = new Date(now);
      expectedDate.setDate(expectedDate.getDate() - i);
      const expectedDateStr = expectedDate.toISOString().split('T')[0];

      if (sortedDays[i] === expectedDateStr) {
        streak++;
      } else {
        break;
      }
    }

    return {
      totalTime: Math.round(totalTime),
      weekTime: Math.round(weekTime),
      monthTime: Math.round(monthTime),
      averageSessionDuration: Math.round(averageSessionDuration),
      byCategory,
      byHourOfDay: byHourOfDay.map(t => Math.round(t)),
      streak,
      studyDays: Array.from(studyDaysSet),
      mostProductiveHours: hourIndices,
    };
  }

  /**
   * Manual reschedule cards
   */
  async rescheduleCards(
    userId: string,
    items: Array<{ cardId: string; newDueDate: string; reason?: string }>
  ): Promise<void> {
    for (const item of items) {
      const card = await Card.findOne({
        _id: new mongoose.Types.ObjectId(item.cardId),
        userId: new mongoose.Types.ObjectId(userId),
      });

      if (card) {
        card.manualReschedule(new Date(item.newDueDate), item.reason || '');
        await card.save();
      }
    }
  }
}

export const scheduleService = new ScheduleService();
