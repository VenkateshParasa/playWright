/**
 * Data Preprocessing for ML Models
 * Prepares user data for model training and inference
 */

import { Card } from '../../models/Card.js';
import { UserProgress } from '../../models/UserProgress.js';
import mongoose from 'mongoose';

export interface FeatureVector {
  userId: string;
  features: number[];
  featureNames: string[];
  timestamp: Date;
}

export interface TrainingData {
  features: number[][];
  labels: number[];
  featureNames: string[];
}

export class MLPreprocessing {
  /**
   * Extract features for recommendation model
   */
  static async extractRecommendationFeatures(
    userId: string
  ): Promise<FeatureVector> {
    const progress = await UserProgress.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    }).lean();

    const cards = await Card.find({
      userId: new mongoose.Types.ObjectId(userId),
      isActive: true,
    }).lean();

    const features: number[] = [];
    const featureNames: string[] = [];

    // User engagement features
    features.push(progress?.totalXP || 0);
    featureNames.push('total_xp');

    features.push(progress?.currentLevel || 1);
    featureNames.push('current_level');

    features.push(progress?.lessonsCompleted || 0);
    featureNames.push('lessons_completed');

    features.push(progress?.flashcardsReviewed || 0);
    featureNames.push('flashcards_reviewed');

    // Performance features
    const avgSuccessRate =
      cards.reduce((sum, card) => sum + card.successRate, 0) /
        (cards.length || 1);
    features.push(avgSuccessRate);
    featureNames.push('avg_success_rate');

    // Time features
    const avgStudyTime =
      (progress?.studySessions || []).reduce(
        (sum: number, s: any) => sum + s.duration,
        0
      ) / ((progress?.studySessions || []).length || 1);
    features.push(avgStudyTime);
    featureNames.push('avg_study_time');

    // Streak features
    features.push(progress?.streak?.currentStreak || 0);
    featureNames.push('current_streak');

    // Category preferences (top 5 categories)
    const categoryScores = this.calculateCategoryScores(cards);
    const topCategories = Array.from(categoryScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    topCategories.forEach(([category, score], i) => {
      features.push(score);
      featureNames.push(`category_${i}_score`);
    });

    // Pad to fixed size
    while (features.length < 20) {
      features.push(0);
      featureNames.push(`padding_${features.length}`);
    }

    return {
      userId,
      features,
      featureNames,
      timestamp: new Date(),
    };
  }

  /**
   * Extract features for performance prediction
   */
  static async extractPerformanceFeatures(
    userId: string
  ): Promise<FeatureVector> {
    const progress = await UserProgress.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    }).lean();

    const cards = await Card.find({
      userId: new mongoose.Types.ObjectId(userId),
      isActive: true,
    }).lean();

    const features: number[] = [];
    const featureNames: string[] = [];

    // Historical performance
    const recentCards = cards.slice(-10);
    const recentSuccessRate =
      recentCards.reduce((sum, card) => sum + card.successRate, 0) /
      (recentCards.length || 1);

    features.push(recentSuccessRate);
    featureNames.push('recent_success_rate');

    // Review statistics
    const avgReviews =
      cards.reduce((sum, card) => sum + card.totalReviews, 0) /
      (cards.length || 1);
    features.push(avgReviews);
    featureNames.push('avg_reviews');

    const avgInterval =
      cards.reduce((sum, card) => sum + card.interval, 0) / (cards.length || 1);
    features.push(avgInterval);
    featureNames.push('avg_interval');

    // Learning velocity
    const learningVelocity =
      (progress?.totalXP || 0) / ((progress?.totalStudyTime || 1) / 60);
    features.push(learningVelocity);
    featureNames.push('learning_velocity');

    // Retention metrics
    const retainedCards = cards.filter((c) => c.successRate >= 70).length;
    const retentionRate = (retainedCards / (cards.length || 1)) * 100;
    features.push(retentionRate);
    featureNames.push('retention_rate');

    // Time-based features
    const daysSinceStart = progress?.createdAt
      ? (Date.now() - new Date(progress.createdAt).getTime()) /
        (1000 * 60 * 60 * 24)
      : 0;
    features.push(daysSinceStart);
    featureNames.push('days_since_start');

    // Consistency
    const sessionCount = progress?.studySessions?.length || 0;
    const consistency = sessionCount / Math.max(daysSinceStart, 1);
    features.push(consistency);
    featureNames.push('consistency');

    // Pad to fixed size
    while (features.length < 15) {
      features.push(0);
      featureNames.push(`padding_${features.length}`);
    }

    return {
      userId,
      features,
      featureNames,
      timestamp: new Date(),
    };
  }

  /**
   * Normalize features (min-max scaling)
   */
  static normalize(
    features: number[],
    min: number[] = [],
    max: number[] = []
  ): number[] {
    if (min.length === 0 || max.length === 0) {
      // Calculate min/max from data
      return features; // Would calculate in production
    }

    return features.map((value, i) => {
      const range = max[i] - min[i];
      if (range === 0) return 0;
      return (value - min[i]) / range;
    });
  }

  /**
   * Standardize features (z-score)
   */
  static standardize(
    features: number[],
    mean: number[] = [],
    std: number[] = []
  ): number[] {
    if (mean.length === 0 || std.length === 0) {
      return features;
    }

    return features.map((value, i) => {
      if (std[i] === 0) return 0;
      return (value - mean[i]) / std[i];
    });
  }

  /**
   * One-hot encode categorical features
   */
  static oneHotEncode(
    category: string,
    categories: string[]
  ): number[] {
    const encoded = new Array(categories.length).fill(0);
    const index = categories.indexOf(category);
    if (index >= 0) {
      encoded[index] = 1;
    }
    return encoded;
  }

  /**
   * Prepare training data from multiple users
   */
  static async prepareTrainingData(
    userIds: string[],
    labelExtractor: (userId: string) => Promise<number>
  ): Promise<TrainingData> {
    const allFeatures: number[][] = [];
    const allLabels: number[] = [];
    let featureNames: string[] = [];

    for (const userId of userIds) {
      const featureVector = await this.extractPerformanceFeatures(userId);
      const label = await labelExtractor(userId);

      allFeatures.push(featureVector.features);
      allLabels.push(label);

      if (featureNames.length === 0) {
        featureNames = featureVector.featureNames;
      }
    }

    return {
      features: allFeatures,
      labels: allLabels,
      featureNames,
    };
  }

  /**
   * Split data into train/test sets
   */
  static trainTestSplit(
    data: TrainingData,
    testSize: number = 0.2
  ): {
    trainFeatures: number[][];
    trainLabels: number[];
    testFeatures: number[][];
    testLabels: number[];
  } {
    const n = data.features.length;
    const testCount = Math.floor(n * testSize);

    // Shuffle indices
    const indices = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    const trainIndices = indices.slice(testCount);
    const testIndices = indices.slice(0, testCount);

    return {
      trainFeatures: trainIndices.map((i) => data.features[i]),
      trainLabels: trainIndices.map((i) => data.labels[i]),
      testFeatures: testIndices.map((i) => data.features[i]),
      testLabels: testIndices.map((i) => data.labels[i]),
    };
  }

  // ==================== Helper Methods ====================

  private static calculateCategoryScores(cards: any[]): Map<string, number> {
    const categoryScores = new Map<string, number>();

    cards.forEach((card) => {
      if (!categoryScores.has(card.category)) {
        categoryScores.set(card.category, 0);
      }
      // Score based on success rate and review count
      const score = card.successRate * (1 + Math.log(card.totalReviews + 1));
      categoryScores.set(
        card.category,
        (categoryScores.get(card.category) || 0) + score
      );
    });

    return categoryScores;
  }
}
