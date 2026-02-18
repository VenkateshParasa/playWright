/**
 * Learning Pattern Analysis Service
 * Analyzes user behavior to identify learning patterns and optimize experience
 */

import mongoose from 'mongoose';
import { UserProgress } from '../../models/UserProgress.js';

interface LearningPattern {
  userId: string;
  optimalStudyTime: {
    hour: number;
    dayOfWeek: number;
    confidence: number;
  };
  learningStyle: {
    type: 'visual' | 'practical' | 'theoretical' | 'mixed';
    confidence: number;
    indicators: string[];
  };
  sessionQuality: {
    avgDuration: number;
    avgProductivity: number;
    optimalDuration: number;
  };
  distractionLevel: {
    score: number; // 0-100, higher = more distracted
    indicators: string[];
  };
  productivityMetrics: {
    xpPerHour: number;
    completionRate: number;
    consistencyScore: number;
  };
  learningVelocity: {
    current: number;
    trend: 'increasing' | 'stable' | 'decreasing';
    comparedToAverage: number; // percentage
  };
}

interface StudySession {
  date: Date;
  duration: number;
  activitiesCompleted: number;
  xpGained: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: number;
  quality: number; // calculated metric
}

export class PatternAnalysisService {
  /**
   * Analyze comprehensive learning patterns
   */
  static async analyzeLearningPatterns(userId: string): Promise<LearningPattern> {
    const progress = await UserProgress.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    }).lean();

    if (!progress) {
      return this.getDefaultPattern(userId);
    }

    // Analyze study sessions
    const sessions = this.processSessions(
      progress.studySessions || [],
      progress.totalXP || 0
    );

    // Identify optimal study time
    const optimalStudyTime = this.identifyOptimalStudyTime(sessions);

    // Detect learning style
    const learningStyle = this.detectLearningStyle(progress);

    // Analyze session quality
    const sessionQuality = this.analyzeSessionQuality(sessions);

    // Detect distraction level
    const distractionLevel = this.analyzeDistractionLevel(sessions);

    // Calculate productivity metrics
    const productivityMetrics = this.calculateProductivityMetrics(
      progress,
      sessions
    );

    // Calculate learning velocity
    const learningVelocity = this.calculateLearningVelocity(sessions);

    return {
      userId,
      optimalStudyTime,
      learningStyle,
      sessionQuality,
      distractionLevel,
      productivityMetrics,
      learningVelocity,
    };
  }

  /**
   * Identify optimal study time
   */
  static identifyOptimalStudyTime(
    sessions: StudySession[]
  ): { hour: number; dayOfWeek: number; confidence: number } {
    if (sessions.length < 5) {
      return { hour: 18, dayOfWeek: 1, confidence: 0 }; // Default evening, Monday
    }

    // Group by hour and day of week
    const hourPerformance = new Map<number, number[]>();
    const dayPerformance = new Map<number, number[]>();

    sessions.forEach((session) => {
      const hour = new Date(session.date).getHours();
      const day = new Date(session.date).getDay();

      if (!hourPerformance.has(hour)) {
        hourPerformance.set(hour, []);
      }
      hourPerformance.get(hour)?.push(session.quality);

      if (!dayPerformance.has(day)) {
        dayPerformance.set(day, []);
      }
      dayPerformance.get(day)?.push(session.quality);
    });

    // Find best performing hour
    let bestHour = 18;
    let bestHourScore = 0;

    hourPerformance.forEach((qualities, hour) => {
      const avgQuality =
        qualities.reduce((sum, q) => sum + q, 0) / qualities.length;
      if (avgQuality > bestHourScore) {
        bestHourScore = avgQuality;
        bestHour = hour;
      }
    });

    // Find best performing day
    let bestDay = 1;
    let bestDayScore = 0;

    dayPerformance.forEach((qualities, day) => {
      const avgQuality =
        qualities.reduce((sum, q) => sum + q, 0) / qualities.length;
      if (avgQuality > bestDayScore) {
        bestDayScore = avgQuality;
        bestDay = day;
      }
    });

    const confidence = Math.min(95, sessions.length * 5);

    return {
      hour: bestHour,
      dayOfWeek: bestDay,
      confidence,
    };
  }

  /**
   * Detect learning style from behavior
   */
  static detectLearningStyle(progress: any): {
    type: 'visual' | 'practical' | 'theoretical' | 'mixed';
    confidence: number;
    indicators: string[];
  } {
    const indicators: string[] = [];
    const scores = {
      visual: 0,
      practical: 0,
      theoretical: 0,
    };

    // Analyze activity ratios
    const lessonsCompleted = progress.lessonsCompleted || 0;
    const exercisesCompleted = progress.exercisesCompleted || 0;
    const flashcardsReviewed = progress.flashcardsReviewed || 0;

    const total = lessonsCompleted + exercisesCompleted + flashcardsReviewed || 1;

    const exerciseRatio = exercisesCompleted / total;
    const flashcardRatio = flashcardsReviewed / total;
    const lessonRatio = lessonsCompleted / total;

    // Practical learners complete more exercises
    if (exerciseRatio > 0.4) {
      scores.practical += 40;
      indicators.push('High exercise completion rate');
    }

    // Theoretical learners review more flashcards
    if (flashcardRatio > 0.4) {
      scores.theoretical += 40;
      indicators.push('Frequent flashcard reviews');
    }

    // Visual learners balance between content types
    if (lessonRatio > 0.3 && lessonRatio < 0.6) {
      scores.visual += 30;
      indicators.push('Balanced content consumption');
    }

    // Check session patterns
    const avgSessionDuration =
      (progress.studySessions || []).reduce(
        (sum: number, s: any) => sum + s.duration,
        0
      ) / (progress.studySessions?.length || 1);

    if (avgSessionDuration < 20) {
      scores.practical += 20;
      indicators.push('Short, focused sessions');
    } else if (avgSessionDuration > 40) {
      scores.theoretical += 20;
      indicators.push('Long, deep-dive sessions');
    }

    // Determine style
    const maxScore = Math.max(scores.visual, scores.practical, scores.theoretical);
    let type: 'visual' | 'practical' | 'theoretical' | 'mixed' = 'mixed';

    if (maxScore === scores.practical && maxScore > 40) {
      type = 'practical';
    } else if (maxScore === scores.theoretical && maxScore > 40) {
      type = 'theoretical';
    } else if (maxScore === scores.visual && maxScore > 30) {
      type = 'visual';
    }

    const confidence = Math.min(85, maxScore);

    return { type, confidence, indicators };
  }

  /**
   * Analyze study session quality
   */
  static analyzeSessionQuality(sessions: StudySession[]): {
    avgDuration: number;
    avgProductivity: number;
    optimalDuration: number;
  } {
    if (sessions.length === 0) {
      return {
        avgDuration: 0,
        avgProductivity: 0,
        optimalDuration: 30,
      };
    }

    const avgDuration =
      sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length;

    const avgProductivity =
      sessions.reduce((sum, s) => sum + s.quality, 0) / sessions.length;

    // Find optimal duration (best productivity)
    const durationBuckets = new Map<number, number[]>(); // duration bucket -> qualities

    sessions.forEach((session) => {
      const bucket = Math.floor(session.duration / 10) * 10; // Round to 10-min buckets
      if (!durationBuckets.has(bucket)) {
        durationBuckets.set(bucket, []);
      }
      durationBuckets.get(bucket)?.push(session.quality);
    });

    let optimalDuration = 30;
    let bestQuality = 0;

    durationBuckets.forEach((qualities, duration) => {
      const avgQuality =
        qualities.reduce((sum, q) => sum + q, 0) / qualities.length;
      if (avgQuality > bestQuality && qualities.length >= 3) {
        bestQuality = avgQuality;
        optimalDuration = duration;
      }
    });

    return {
      avgDuration: Math.round(avgDuration),
      avgProductivity: Math.round(avgProductivity),
      optimalDuration,
    };
  }

  /**
   * Detect distraction level
   */
  static analyzeDistractionLevel(sessions: StudySession[]): {
    score: number;
    indicators: string[];
  } {
    const indicators: string[] = [];
    let score = 0;

    if (sessions.length < 3) {
      return { score: 0, indicators: ['Insufficient data'] };
    }

    // Check for interrupted sessions (very short)
    const shortSessions = sessions.filter((s) => s.duration < 5).length;
    if (shortSessions / sessions.length > 0.3) {
      score += 30;
      indicators.push('Frequent short sessions (possible interruptions)');
    }

    // Check productivity drops
    const recentSessions = sessions.slice(-10);
    const productivityTrend = this.calculateTrend(
      recentSessions.map((s) => s.quality)
    );

    if (productivityTrend < -0.1) {
      score += 25;
      indicators.push('Declining productivity trend');
    }

    // Check inconsistency
    const qualities = sessions.map((s) => s.quality);
    const variance = this.calculateVariance(qualities);

    if (variance > 400) {
      score += 20;
      indicators.push('Inconsistent performance');
    }

    // Check long gaps between sessions
    for (let i = 1; i < sessions.length; i++) {
      const gap =
        (new Date(sessions[i].date).getTime() -
          new Date(sessions[i - 1].date).getTime()) /
        (1000 * 60 * 60 * 24);
      if (gap > 3) {
        score += 5;
        indicators.push('Long gaps between study sessions');
        break;
      }
    }

    return {
      score: Math.min(100, score),
      indicators,
    };
  }

  /**
   * Calculate productivity metrics
   */
  static calculateProductivityMetrics(
    progress: any,
    sessions: StudySession[]
  ): {
    xpPerHour: number;
    completionRate: number;
    consistencyScore: number;
  } {
    const totalMinutes = progress.totalStudyTime || 1;
    const xpPerHour = (progress.totalXP || 0) / (totalMinutes / 60);

    // Completion rate (started vs completed)
    const completionRate = Math.min(
      100,
      ((progress.quizzesPassed || 0) / Math.max(progress.quizzesCompleted || 1, 1)) *
        100
    );

    // Consistency score based on variance
    const qualities = sessions.map((s) => s.quality);
    const mean = qualities.reduce((sum, q) => sum + q, 0) / (qualities.length || 1);
    const variance = this.calculateVariance(qualities);
    const consistencyScore = Math.max(0, 100 - Math.sqrt(variance));

    return {
      xpPerHour: Math.round(xpPerHour * 10) / 10,
      completionRate: Math.round(completionRate),
      consistencyScore: Math.round(consistencyScore),
    };
  }

  /**
   * Calculate learning velocity and trend
   */
  static calculateLearningVelocity(sessions: StudySession[]): {
    current: number;
    trend: 'increasing' | 'stable' | 'decreasing';
    comparedToAverage: number;
  } {
    if (sessions.length === 0) {
      return { current: 0, trend: 'stable', comparedToAverage: 0 };
    }

    // Calculate current velocity (recent 5 sessions)
    const recentSessions = sessions.slice(-5);
    const currentVelocity =
      recentSessions.reduce((sum, s) => sum + s.quality, 0) /
      recentSessions.length;

    // Calculate overall average
    const avgVelocity =
      sessions.reduce((sum, s) => sum + s.quality, 0) / sessions.length;

    // Determine trend
    const trendSlope = this.calculateTrend(sessions.map((s) => s.quality));

    let trend: 'increasing' | 'stable' | 'decreasing' = 'stable';
    if (trendSlope > 0.1) trend = 'increasing';
    else if (trendSlope < -0.1) trend = 'decreasing';

    const comparedToAverage = ((currentVelocity - avgVelocity) / avgVelocity) * 100;

    return {
      current: Math.round(currentVelocity),
      trend,
      comparedToAverage: Math.round(comparedToAverage),
    };
  }

  /**
   * Generate personalized study recommendations
   */
  static generateStudyRecommendations(pattern: LearningPattern): string[] {
    const recommendations: string[] = [];

    // Time-based recommendations
    if (pattern.optimalStudyTime.confidence > 60) {
      const hour = pattern.optimalStudyTime.hour;
      const timeStr =
        hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
      recommendations.push(
        `Your most productive time is ${timeStr} around ${hour}:00. Try to schedule study sessions then.`
      );
    }

    // Style-based recommendations
    if (pattern.learningStyle.type === 'practical') {
      recommendations.push(
        'Focus on hands-on exercises and coding challenges for best results.'
      );
    } else if (pattern.learningStyle.type === 'theoretical') {
      recommendations.push(
        'Deep-dive into concepts with flashcards and documentation before practicing.'
      );
    }

    // Session duration recommendations
    if (pattern.sessionQuality.optimalDuration !== pattern.sessionQuality.avgDuration) {
      recommendations.push(
        `Aim for ${pattern.sessionQuality.optimalDuration}-minute sessions for optimal focus.`
      );
    }

    // Distraction recommendations
    if (pattern.distractionLevel.score > 50) {
      recommendations.push(
        'Consider using focus techniques like Pomodoro to minimize distractions.',
        'Find a quieter study environment to improve concentration.'
      );
    }

    // Productivity recommendations
    if (pattern.productivityMetrics.consistencyScore < 60) {
      recommendations.push(
        'Build a regular study routine to improve consistency.'
      );
    }

    // Velocity recommendations
    if (pattern.learningVelocity.trend === 'decreasing') {
      recommendations.push(
        'Your learning pace is slowing. Take a break or try new learning methods.',
        'Consider joining a study group for renewed motivation.'
      );
    }

    return recommendations;
  }

  // ==================== Helper Methods ====================

  private static processSessions(
    rawSessions: any[],
    totalXP: number
  ): StudySession[] {
    return rawSessions.map((session, index) => {
      const date = new Date(session.date);
      const hour = date.getHours();

      let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night' = 'evening';
      if (hour >= 6 && hour < 12) timeOfDay = 'morning';
      else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
      else if (hour >= 17 && hour < 22) timeOfDay = 'evening';
      else timeOfDay = 'night';

      // Calculate quality score
      const xpPerMinute = (session.activitiesCount * 10) / (session.duration || 1);
      const quality = Math.min(100, xpPerMinute * 10);

      return {
        date: session.date,
        duration: session.duration,
        activitiesCompleted: session.activitiesCount,
        xpGained: session.activitiesCount * 10,
        timeOfDay,
        dayOfWeek: date.getDay(),
        quality,
      };
    });
  }

  private static getDefaultPattern(userId: string): LearningPattern {
    return {
      userId,
      optimalStudyTime: { hour: 18, dayOfWeek: 1, confidence: 0 },
      learningStyle: {
        type: 'mixed',
        confidence: 0,
        indicators: ['Insufficient data'],
      },
      sessionQuality: {
        avgDuration: 0,
        avgProductivity: 0,
        optimalDuration: 30,
      },
      distractionLevel: { score: 0, indicators: [] },
      productivityMetrics: {
        xpPerHour: 0,
        completionRate: 0,
        consistencyScore: 0,
      },
      learningVelocity: {
        current: 0,
        trend: 'stable',
        comparedToAverage: 0,
      },
    };
  }

  private static calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;

    // Simple linear regression slope
    const n = values.length;
    const sumX = (n * (n - 1)) / 2; // 0 + 1 + 2 + ... + (n-1)
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, i) => sum + i * val, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  }

  private static calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance =
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      values.length;

    return variance;
  }
}
