/**
 * Performance Prediction Service
 * Uses ML models to predict learning outcomes and identify at-risk students
 */

import mongoose from 'mongoose';
import { Card } from '../../models/Card.js';
import { UserProgress } from '../../models/UserProgress.js';

interface QuizScorePrediction {
  predictedScore: number;
  confidence: number;
  factors: Array<{ factor: string; impact: number }>;
  recommendation: string;
}

interface CompletionTimePrediction {
  estimatedMinutes: number;
  confidenceInterval: [number, number];
  factors: string[];
}

interface AtRiskAnalysis {
  riskLevel: 'low' | 'medium' | 'high';
  riskScore: number;
  indicators: string[];
  recommendations: string[];
  interventionNeeded: boolean;
}

interface MasteryPrediction {
  topic: string;
  currentMastery: number;
  predictedMastery: number;
  timeToMastery: number; // days
  confidence: number;
}

interface LearningEfficiencyScore {
  score: number;
  percentile: number;
  strengths: string[];
  improvementAreas: string[];
}

export class PerformancePredictionService {
  /**
   * Predict quiz score before taking
   */
  static async predictQuizScore(
    userId: string,
    quizId: string
  ): Promise<QuizScorePrediction> {
    const userPerformance = await this.getUserPerformanceMetrics(userId);
    const quizData = await this.getQuizMetadata(quizId);

    // Feature engineering
    const features = {
      avgSuccessRate: userPerformance.avgSuccessRate,
      recentPerformance: userPerformance.recentPerformance,
      categoryFamiliarity: userPerformance.categoryScores.get(
        quizData.category
      ) || 50,
      studyTimeInCategory: userPerformance.studyTimeByCategory.get(
        quizData.category
      ) || 0,
      quizDifficulty: this.difficultyToNumber(quizData.difficulty),
      retentionRate: userPerformance.retentionRate,
      learningVelocity: userPerformance.learningVelocity,
    };

    // Simple prediction model (would use trained ML model in production)
    const predictedScore = this.calculatePredictedScore(features);
    const confidence = this.calculatePredictionConfidence(features);

    // Identify key factors
    const factors = this.identifyKeyFactors(features, predictedScore);

    // Generate recommendation
    const recommendation = this.generateScoreRecommendation(
      predictedScore,
      factors
    );

    return {
      predictedScore,
      confidence,
      factors,
      recommendation,
    };
  }

  /**
   * Estimate time to complete topic
   */
  static async predictCompletionTime(
    userId: string,
    topicId: string
  ): Promise<CompletionTimePrediction> {
    const userMetrics = await this.getUserPerformanceMetrics(userId);
    const topicData = await this.getTopicMetadata(topicId);

    // Base time estimation
    const avgCompletionTime = topicData.avgCompletionTime || 60;

    // Adjust based on user's learning velocity
    const velocityMultiplier = 100 / (userMetrics.learningVelocity || 100);
    const estimatedMinutes = avgCompletionTime * velocityMultiplier;

    // Confidence interval (±20%)
    const confidenceInterval: [number, number] = [
      Math.floor(estimatedMinutes * 0.8),
      Math.ceil(estimatedMinutes * 1.2),
    ];

    // Identify factors affecting completion time
    const factors = [
      userMetrics.learningVelocity < 100
        ? 'Thorough learning style'
        : 'Fast learner',
      userMetrics.avgSuccessRate > 80 ? 'Strong foundation' : 'Building skills',
      topicData.difficulty === 'hard'
        ? 'Complex topic'
        : 'Straightforward content',
    ];

    return {
      estimatedMinutes: Math.round(estimatedMinutes),
      confidenceInterval,
      factors,
    };
  }

  /**
   * Identify at-risk students
   */
  static async assessDropoutRisk(userId: string): Promise<AtRiskAnalysis> {
    const metrics = await this.getUserPerformanceMetrics(userId);
    const engagementData = await this.getEngagementMetrics(userId);

    let riskScore = 0;
    const indicators: string[] = [];

    // Performance indicators
    if (metrics.avgSuccessRate < 50) {
      riskScore += 25;
      indicators.push('Low success rate in reviews');
    }

    if (metrics.retentionRate < 40) {
      riskScore += 20;
      indicators.push('Poor knowledge retention');
    }

    // Engagement indicators
    if (engagementData.daysSinceLastActivity > 7) {
      riskScore += 30;
      indicators.push('Inactive for over a week');
    }

    if (engagementData.completionRate < 30) {
      riskScore += 15;
      indicators.push('Low lesson completion rate');
    }

    if (engagementData.avgSessionDuration < 10) {
      riskScore += 10;
      indicators.push('Short study sessions');
    }

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (riskScore >= 60) riskLevel = 'high';
    else if (riskScore >= 30) riskLevel = 'medium';

    // Generate recommendations
    const recommendations = this.generateRetentionRecommendations(
      riskLevel,
      indicators
    );

    return {
      riskLevel,
      riskScore,
      indicators,
      recommendations,
      interventionNeeded: riskLevel === 'high',
    };
  }

  /**
   * Predict mastery level for topics
   */
  static async predictTopicMastery(
    userId: string,
    topic: string
  ): Promise<MasteryPrediction> {
    const cards = await Card.find({
      userId: new mongoose.Types.ObjectId(userId),
      category: topic,
      isActive: true,
    }).lean();

    if (cards.length === 0) {
      return {
        topic,
        currentMastery: 0,
        predictedMastery: 0,
        timeToMastery: 30,
        confidence: 0,
      };
    }

    // Calculate current mastery
    const avgSuccessRate =
      cards.reduce((sum, card) => sum + card.successRate, 0) / cards.length;
    const masteredCards = cards.filter((c) => c.successRate >= 85).length;
    const currentMastery = (masteredCards / cards.length) * 100;

    // Predict future mastery based on learning curve
    const avgReviews =
      cards.reduce((sum, card) => sum + card.totalReviews, 0) / cards.length;
    const growthRate = this.estimateGrowthRate(cards);

    // Logistic growth model
    const predictedMastery = Math.min(
      100,
      currentMastery + growthRate * (100 - currentMastery)
    );

    // Estimate time to 85% mastery
    const reviewsNeeded = this.estimateReviewsToMastery(
      currentMastery,
      growthRate
    );
    const timeToMastery = reviewsNeeded * 1; // Assume 1 day per review cycle

    const confidence = Math.min(95, avgReviews * 5);

    return {
      topic,
      currentMastery,
      predictedMastery,
      timeToMastery,
      confidence,
    };
  }

  /**
   * Calculate learning efficiency score
   */
  static async calculateLearningEfficiency(
    userId: string
  ): Promise<LearningEfficiencyScore> {
    const metrics = await this.getUserPerformanceMetrics(userId);
    const progress = await UserProgress.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    }).lean();

    // Calculate efficiency components
    const timeEfficiency = this.calculateTimeEfficiency(
      progress?.totalXP || 0,
      progress?.totalStudyTime || 1
    );
    const retentionEfficiency = metrics.retentionRate;
    const consistencyEfficiency = this.calculateConsistency(metrics);
    const progressionEfficiency = this.calculateProgressionRate(progress);

    // Weighted average
    const score =
      timeEfficiency * 0.3 +
      retentionEfficiency * 0.3 +
      consistencyEfficiency * 0.2 +
      progressionEfficiency * 0.2;

    // Calculate percentile (simplified)
    const percentile = Math.min(99, Math.floor(score));

    // Identify strengths and improvements
    const strengths: string[] = [];
    const improvementAreas: string[] = [];

    if (timeEfficiency > 80) strengths.push('Efficient time usage');
    else improvementAreas.push('Study time optimization');

    if (retentionEfficiency > 75)
      strengths.push('Strong knowledge retention');
    else improvementAreas.push('Review consistency');

    if (consistencyEfficiency > 75) strengths.push('Consistent performance');
    else improvementAreas.push('Performance stability');

    return {
      score,
      percentile,
      strengths,
      improvementAreas,
    };
  }

  /**
   * Forecast progress over time
   */
  static async forecastProgress(
    userId: string,
    daysAhead: number
  ): Promise<
    Array<{
      date: Date;
      predictedXP: number;
      predictedLevel: number;
      predictedMasteredCards: number;
    }>
  > {
    const progress = await UserProgress.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    }).lean();

    const currentXP = progress?.totalXP || 0;
    const recentSessions = (progress?.studySessions || []).slice(-7);

    // Calculate daily average XP gain
    const avgDailyXP =
      recentSessions.reduce((sum, s) => sum + (s.activitiesCount * 10), 0) /
      (recentSessions.length || 1);

    const forecast = [];
    for (let day = 1; day <= daysAhead; day++) {
      const predictedXP = currentXP + avgDailyXP * day;
      const predictedLevel = Math.floor(Math.sqrt(predictedXP / 100)) + 1;

      forecast.push({
        date: new Date(Date.now() + day * 24 * 60 * 60 * 1000),
        predictedXP: Math.round(predictedXP),
        predictedLevel,
        predictedMasteredCards:
          (progress?.masteredFlashcards || 0) + Math.floor(day * 1.5),
      });
    }

    return forecast;
  }

  // ==================== Helper Methods ====================

  private static async getUserPerformanceMetrics(userId: string): Promise<any> {
    const cards = await Card.find({
      userId: new mongoose.Types.ObjectId(userId),
      isActive: true,
    }).lean();

    const progress = await UserProgress.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    }).lean();

    const avgSuccessRate =
      cards.reduce((sum, card) => sum + card.successRate, 0) /
        (cards.length || 1);

    // Recent performance (last 10 reviews)
    const recentCards = cards
      .filter((c) => c.reviewHistory.length > 0)
      .slice(-10);
    const recentPerformance =
      recentCards.reduce((sum, card) => {
        const lastReview = card.reviewHistory[card.reviewHistory.length - 1];
        return sum + (lastReview.quality >= 3 ? 100 : 0);
      }, 0) / (recentCards.length || 1);

    // Category scores
    const categoryScores = new Map<string, number>();
    const categoryCards = new Map<string, any[]>();

    cards.forEach((card) => {
      if (!categoryCards.has(card.category)) {
        categoryCards.set(card.category, []);
      }
      categoryCards.get(card.category)?.push(card);
    });

    categoryCards.forEach((cards, category) => {
      const avg =
        cards.reduce((sum, card) => sum + card.successRate, 0) / cards.length;
      categoryScores.set(category, avg);
    });

    // Study time by category (simplified)
    const studyTimeByCategory = new Map<string, number>();
    categoryCards.forEach((cards, category) => {
      const totalTime = cards.reduce(
        (sum, card) => sum + card.reviewHistory.length * 2,
        0
      );
      studyTimeByCategory.set(category, totalTime);
    });

    // Retention rate
    const reviewedCards = cards.filter((c) => c.totalReviews > 0);
    const retainedCards = reviewedCards.filter((c) => c.successRate >= 70);
    const retentionRate =
      (retainedCards.length / (reviewedCards.length || 1)) * 100;

    // Learning velocity
    const learningVelocity =
      (progress?.totalXP || 0) / ((progress?.totalStudyTime || 1) / 60);

    return {
      avgSuccessRate,
      recentPerformance,
      categoryScores,
      studyTimeByCategory,
      retentionRate,
      learningVelocity,
    };
  }

  private static async getQuizMetadata(quizId: string): Promise<any> {
    // Would query quiz database
    return {
      category: 'playwright-basics',
      difficulty: 'medium',
      avgScore: 75,
      completionRate: 85,
    };
  }

  private static async getTopicMetadata(topicId: string): Promise<any> {
    return {
      avgCompletionTime: 45,
      difficulty: 'medium',
      prerequisiteCount: 2,
    };
  }

  private static difficultyToNumber(
    difficulty: string
  ): number {
    const map: Record<string, number> = { easy: 1, medium: 2, hard: 3 };
    return map[difficulty] || 2;
  }

  private static calculatePredictedScore(features: any): number {
    // Simplified linear model (would use trained model in production)
    let score = 50;

    score += (features.avgSuccessRate - 50) * 0.3;
    score += (features.recentPerformance - 50) * 0.25;
    score += (features.categoryFamiliarity - 50) * 0.2;
    score += Math.min(10, features.studyTimeInCategory / 10);
    score -= (features.quizDifficulty - 2) * 10;
    score += (features.retentionRate - 50) * 0.15;

    return Math.max(0, Math.min(100, score));
  }

  private static calculatePredictionConfidence(features: any): number {
    let confidence = 50;

    // More data = higher confidence
    if (features.avgSuccessRate > 0) confidence += 20;
    if (features.studyTimeInCategory > 30) confidence += 15;
    if (features.retentionRate > 0) confidence += 15;

    return Math.min(95, confidence);
  }

  private static identifyKeyFactors(
    features: any,
    predictedScore: number
  ): Array<{ factor: string; impact: number }> {
    const factors = [
      {
        factor: 'Average Success Rate',
        impact: (features.avgSuccessRate - 50) * 0.3,
      },
      {
        factor: 'Recent Performance',
        impact: (features.recentPerformance - 50) * 0.25,
      },
      {
        factor: 'Category Familiarity',
        impact: (features.categoryFamiliarity - 50) * 0.2,
      },
      { factor: 'Retention Rate', impact: (features.retentionRate - 50) * 0.15 },
    ];

    return factors.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
  }

  private static generateScoreRecommendation(
    predictedScore: number,
    factors: any[]
  ): string {
    if (predictedScore >= 80) {
      return "You're well prepared! Focus on staying calm during the quiz.";
    } else if (predictedScore >= 60) {
      return 'Review key concepts before taking the quiz. You can do this!';
    } else {
      const weakFactor = factors.find((f) => f.impact < -5);
      return `Spend more time on ${weakFactor?.factor || 'weak areas'} before attempting.`;
    }
  }

  private static async getEngagementMetrics(userId: string): Promise<any> {
    const progress = await UserProgress.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    }).lean();

    const daysSinceLastActivity = progress?.lastActivityAt
      ? Math.floor(
          (Date.now() - new Date(progress.lastActivityAt).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 999;

    const completionRate =
      ((progress?.lessonsCompleted || 0) / Math.max(10, 1)) * 100;

    const recentSessions = (progress?.studySessions || []).slice(-7);
    const avgSessionDuration =
      recentSessions.reduce((sum, s) => sum + s.duration, 0) /
      (recentSessions.length || 1);

    return {
      daysSinceLastActivity,
      completionRate,
      avgSessionDuration,
    };
  }

  private static generateRetentionRecommendations(
    riskLevel: string,
    indicators: string[]
  ): string[] {
    const recommendations = [];

    if (indicators.includes('Inactive for over a week')) {
      recommendations.push(
        'Set a daily reminder to study',
        'Start with short 10-minute sessions'
      );
    }

    if (indicators.includes('Low success rate in reviews')) {
      recommendations.push(
        'Review fundamental concepts',
        'Focus on easier content first'
      );
    }

    if (indicators.includes('Poor knowledge retention')) {
      recommendations.push(
        'Increase review frequency',
        'Use active recall techniques'
      );
    }

    if (riskLevel === 'high') {
      recommendations.push(
        'Consider reaching out to an instructor',
        'Join a study group for motivation'
      );
    }

    return recommendations;
  }

  private static estimateGrowthRate(cards: any[]): number {
    // Calculate learning curve slope
    const recentCards = cards.filter(
      (c) => c.reviewHistory.length >= 3
    );

    if (recentCards.length === 0) return 0.1;

    const growthRates = recentCards.map((card) => {
      const history = card.reviewHistory.slice(-3);
      const improvement =
        history[history.length - 1].quality - history[0].quality;
      return improvement / 5; // Normalize to 0-1
    });

    return (
      growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length
    );
  }

  private static estimateReviewsToMastery(
    currentMastery: number,
    growthRate: number
  ): number {
    if (currentMastery >= 85) return 0;
    if (growthRate <= 0) return 30;

    const masteryGap = 85 - currentMastery;
    return Math.ceil(masteryGap / (growthRate * 10));
  }

  private static calculateTimeEfficiency(
    totalXP: number,
    totalMinutes: number
  ): number {
    const xpPerHour = totalXP / (totalMinutes / 60);
    return Math.min(100, xpPerHour);
  }

  private static calculateConsistency(metrics: any): number {
    const variance = Math.abs(metrics.avgSuccessRate - metrics.recentPerformance);
    return Math.max(0, 100 - variance);
  }

  private static calculateProgressionRate(progress: any): number {
    const daysActive = progress?.studySessions?.length || 1;
    const lessonsPerDay = (progress?.lessonsCompleted || 0) / daysActive;
    return Math.min(100, lessonsPerDay * 20);
  }
}
