/**
 * Adaptive Learning Service
 * Dynamically adjusts curriculum and difficulty based on user performance
 */

import mongoose from 'mongoose';
import { Card } from '../../models/Card.js';
import { UserProgress } from '../../models/UserProgress.js';

interface LearningPath {
  userId: string;
  currentLevel: string;
  recommendedPath: string[];
  skippableContent: string[];
  requiredRemediation: string[];
  paceSuggestion: 'fast-track' | 'normal' | 'slower';
  difficultyAdjustment: 'easier' | 'same' | 'harder';
}

interface PerformanceAnalysis {
  overallScore: number;
  categoryScores: Map<string, number>;
  weakCategories: string[];
  strongCategories: string[];
  learningEfficiency: number;
  retentionRate: number;
  consistencyScore: number;
}

interface CurriculumAdjustment {
  skipContent: string[];
  addRemediation: string[];
  adjustDifficulty: 'increase' | 'decrease' | 'maintain';
  adjustPace: 'faster' | 'slower' | 'maintain';
  reason: string;
}

export class AdaptiveLearningService {
  /**
   * Generate personalized learning path
   */
  static async generateLearningPath(userId: string): Promise<LearningPath> {
    const performance = await this.analyzePerformance(userId);
    const currentProgress = await this.getCurrentProgress(userId);

    // Determine if user can skip prerequisites
    const skippableContent = await this.identifySkippableContent(
      userId,
      performance
    );

    // Identify areas needing remediation
    const requiredRemediation = await this.identifyRemediationNeeds(
      userId,
      performance
    );

    // Suggest optimal pace
    const paceSuggestion = this.suggestPace(performance);

    // Recommend difficulty level
    const difficultyAdjustment = this.recommendDifficulty(performance);

    // Build recommended path
    const recommendedPath = await this.buildOptimalPath(
      userId,
      performance,
      currentProgress,
      skippableContent,
      requiredRemediation
    );

    return {
      userId,
      currentLevel: this.determineCurrentLevel(performance),
      recommendedPath,
      skippableContent,
      requiredRemediation,
      paceSuggestion,
      difficultyAdjustment,
    };
  }

  /**
   * Analyze user performance across all dimensions
   */
  static async analyzePerformance(
    userId: string
  ): Promise<PerformanceAnalysis> {
    const cards = await Card.find({
      userId: new mongoose.Types.ObjectId(userId),
      isActive: true,
    }).lean();

    const progress = await UserProgress.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    }).lean();

    // Calculate category scores
    const categoryScores = new Map<string, number>();
    const categoryCards = new Map<string, any[]>();

    cards.forEach((card) => {
      if (!categoryCards.has(card.category)) {
        categoryCards.set(card.category, []);
      }
      categoryCards.get(card.category)?.push(card);
    });

    categoryCards.forEach((cards, category) => {
      const avgSuccess =
        cards.reduce((sum, card) => sum + card.successRate, 0) / cards.length;
      categoryScores.set(category, avgSuccess);
    });

    // Identify weak and strong categories
    const weakCategories: string[] = [];
    const strongCategories: string[] = [];

    categoryScores.forEach((score, category) => {
      if (score < 60) weakCategories.push(category);
      if (score > 85) strongCategories.push(category);
    });

    // Calculate overall score
    const overallScore =
      cards.reduce((sum, card) => sum + card.successRate, 0) / cards.length ||
      0;

    // Calculate learning efficiency (XP per study hour)
    const learningEfficiency =
      (progress?.totalXP || 0) / ((progress?.totalStudyTime || 1) / 60);

    // Calculate retention rate
    const retentionRate = this.calculateRetentionRate(cards);

    // Calculate consistency (variance in performance)
    const consistencyScore = this.calculateConsistency(cards);

    return {
      overallScore,
      categoryScores,
      weakCategories,
      strongCategories,
      learningEfficiency,
      retentionRate,
      consistencyScore,
    };
  }

  /**
   * Adjust curriculum based on performance
   */
  static async adjustCurriculum(
    userId: string
  ): Promise<CurriculumAdjustment> {
    const performance = await this.analyzePerformance(userId);

    const adjustment: CurriculumAdjustment = {
      skipContent: [],
      addRemediation: [],
      adjustDifficulty: 'maintain',
      adjustPace: 'maintain',
      reason: '',
    };

    // High performers can skip basic content
    if (performance.overallScore > 85 && performance.consistencyScore > 80) {
      adjustment.skipContent = await this.findBasicContent(userId);
      adjustment.adjustDifficulty = 'increase';
      adjustment.adjustPace = 'faster';
      adjustment.reason =
        'Excellent performance - advancing to challenging content';
    }

    // Struggling learners need remediation
    if (performance.overallScore < 60 || performance.retentionRate < 50) {
      adjustment.addRemediation = await this.findRemediationContent(
        performance.weakCategories
      );
      adjustment.adjustDifficulty = 'decrease';
      adjustment.adjustPace = 'slower';
      adjustment.reason =
        'Building stronger foundation in weak areas first';
    }

    // Inconsistent performance needs practice
    if (
      performance.consistencyScore < 60 &&
      performance.overallScore >= 60 &&
      performance.overallScore <= 85
    ) {
      adjustment.addRemediation = await this.findPracticeContent(userId);
      adjustment.adjustPace = 'slower';
      adjustment.reason = 'More practice needed to solidify understanding';
    }

    return adjustment;
  }

  /**
   * Determine if user has mastered prerequisites
   */
  static async hasMetPrerequisites(
    userId: string,
    contentId: string
  ): Promise<boolean> {
    const prerequisites = await this.getPrerequisites(contentId);
    const masteredTopics = await this.getMasteredTopics(userId);

    return prerequisites.every((prereq) => masteredTopics.includes(prereq));
  }

  /**
   * Suggest optimal difficulty for next content
   */
  static async suggestNextDifficulty(
    userId: string,
    category: string
  ): Promise<'easy' | 'medium' | 'hard'> {
    const performance = await this.analyzePerformance(userId);
    const categoryScore = performance.categoryScores.get(category) || 50;

    if (categoryScore > 85) return 'hard';
    if (categoryScore > 70) return 'medium';
    return 'easy';
  }

  /**
   * Calculate optimal study pace
   */
  static async calculateOptimalPace(userId: string): Promise<{
    lessonsPerWeek: number;
    reviewsPerDay: number;
    studyMinutesPerDay: number;
  }> {
    const performance = await this.analyzePerformance(userId);
    const progress = await UserProgress.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    }).lean();

    const recentSessions = (progress?.studySessions || []).slice(-14); // Last 2 weeks
    const avgDailyTime =
      recentSessions.reduce((sum, s) => sum + s.duration, 0) /
      (recentSessions.length || 1);

    let lessonsPerWeek = 3;
    let reviewsPerDay = 20;
    let studyMinutesPerDay = 30;

    // Fast learners
    if (performance.learningEfficiency > 100 && performance.overallScore > 80) {
      lessonsPerWeek = 5;
      reviewsPerDay = 30;
      studyMinutesPerDay = 45;
    }

    // Struggling learners
    if (performance.overallScore < 60 || performance.retentionRate < 50) {
      lessonsPerWeek = 2;
      reviewsPerDay = 15;
      studyMinutesPerDay = 25;
    }

    // Adjust based on actual study time
    if (avgDailyTime > 60) {
      studyMinutesPerDay = Math.min(avgDailyTime, 90);
    }

    return {
      lessonsPerWeek,
      reviewsPerDay,
      studyMinutesPerDay,
    };
  }

  /**
   * Identify weak areas requiring focused practice
   */
  static async identifyWeakAreas(userId: string): Promise<
    Array<{
      category: string;
      score: number;
      recommendedActions: string[];
    }>
  > {
    const performance = await this.analyzePerformance(userId);

    return performance.weakCategories.map((category) => ({
      category,
      score: performance.categoryScores.get(category) || 0,
      recommendedActions: [
        'Review fundamental concepts',
        'Complete practice exercises',
        'Watch tutorial videos',
        'Join study group for this topic',
      ],
    }));
  }

  /**
   * Determine learning style based on behavior
   */
  static async detectLearningStyle(userId: string): Promise<{
    style: 'visual' | 'practical' | 'theoretical' | 'mixed';
    confidence: number;
    recommendations: string[];
  }> {
    const progress = await UserProgress.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    }).lean();

    // Analyze activity patterns
    const exerciseRatio = (progress?.exercisesCompleted || 0) /
      Math.max(progress?.lessonsCompleted || 1, 1);
    const flashcardRatio = (progress?.flashcardsReviewed || 0) /
      Math.max(progress?.lessonsCompleted || 1, 1);

    let style: 'visual' | 'practical' | 'theoretical' | 'mixed' = 'mixed';
    let confidence = 50;

    if (exerciseRatio > 2) {
      style = 'practical';
      confidence = 75;
    } else if (flashcardRatio > 3) {
      style = 'theoretical';
      confidence = 70;
    } else if (exerciseRatio > 1 && flashcardRatio > 1.5) {
      style = 'mixed';
      confidence = 80;
    }

    const recommendations = this.getStyleBasedRecommendations(style);

    return { style, confidence, recommendations };
  }

  // ==================== Helper Methods ====================

  private static calculateRetentionRate(cards: any[]): number {
    const reviewedCards = cards.filter((c) => c.totalReviews > 0);
    if (reviewedCards.length === 0) return 0;

    const retainedCards = reviewedCards.filter((c) => c.successRate >= 70);
    return (retainedCards.length / reviewedCards.length) * 100;
  }

  private static calculateConsistency(cards: any[]): number {
    if (cards.length === 0) return 0;

    const successRates = cards.map((c) => c.successRate);
    const mean =
      successRates.reduce((sum, rate) => sum + rate, 0) / successRates.length;

    const variance =
      successRates.reduce((sum, rate) => sum + Math.pow(rate - mean, 2), 0) /
      successRates.length;

    const stdDev = Math.sqrt(variance);

    // Lower standard deviation = higher consistency
    return Math.max(0, 100 - stdDev);
  }

  private static determineCurrentLevel(
    performance: PerformanceAnalysis
  ): string {
    if (performance.overallScore > 85) return 'advanced';
    if (performance.overallScore > 70) return 'intermediate';
    return 'beginner';
  }

  private static suggestPace(
    performance: PerformanceAnalysis
  ): 'fast-track' | 'normal' | 'slower' {
    if (performance.overallScore > 85 && performance.learningEfficiency > 100) {
      return 'fast-track';
    }

    if (performance.overallScore < 60 || performance.retentionRate < 50) {
      return 'slower';
    }

    return 'normal';
  }

  private static recommendDifficulty(
    performance: PerformanceAnalysis
  ): 'easier' | 'same' | 'harder' {
    if (performance.overallScore > 85 && performance.consistencyScore > 75) {
      return 'harder';
    }

    if (performance.overallScore < 60) {
      return 'easier';
    }

    return 'same';
  }

  private static async identifySkippableContent(
    userId: string,
    performance: PerformanceAnalysis
  ): Promise<string[]> {
    // High performers can skip basic tutorials
    if (performance.overallScore > 85) {
      return ['basics-intro', 'getting-started', 'setup-guide'];
    }
    return [];
  }

  private static async identifyRemediationNeeds(
    userId: string,
    performance: PerformanceAnalysis
  ): Promise<string[]> {
    return performance.weakCategories.map(
      (cat) => `${cat}-remediation`
    );
  }

  private static async buildOptimalPath(
    userId: string,
    performance: PerformanceAnalysis,
    currentProgress: any,
    skippable: string[],
    remediation: string[]
  ): Promise<string[]> {
    const path: string[] = [];

    // Add remediation first if needed
    path.push(...remediation);

    // Add intermediate content
    path.push('intermediate-concepts', 'practical-exercises');

    // Add advanced content for high performers
    if (performance.overallScore > 75) {
      path.push('advanced-techniques', 'expert-patterns');
    }

    return path;
  }

  private static async getCurrentProgress(userId: string): Promise<any> {
    return UserProgress.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    }).lean();
  }

  private static async findBasicContent(userId: string): Promise<string[]> {
    return ['intro-lesson', 'basic-tutorial'];
  }

  private static async findRemediationContent(
    weakCategories: string[]
  ): Promise<string[]> {
    return weakCategories.map((cat) => `${cat}-practice`);
  }

  private static async findPracticeContent(userId: string): Promise<string[]> {
    return ['practice-set-1', 'practice-set-2'];
  }

  private static async getPrerequisites(contentId: string): Promise<string[]> {
    // Would query content database
    return [];
  }

  private static async getMasteredTopics(userId: string): Promise<string[]> {
    const performance = await this.analyzePerformance(userId);
    return performance.strongCategories;
  }

  private static getStyleBasedRecommendations(
    style: string
  ): string[] {
    const recommendations: Record<string, string[]> = {
      visual: [
        'Watch video tutorials',
        'Use diagrams and flowcharts',
        'Focus on UI-based examples',
      ],
      practical: [
        'Complete hands-on exercises',
        'Build real projects',
        'Learn by doing',
      ],
      theoretical: [
        'Read documentation thoroughly',
        'Use flashcards for concepts',
        'Study best practices',
      ],
      mixed: [
        'Balance theory and practice',
        'Use diverse learning materials',
        'Alternate between reading and coding',
      ],
    };

    return recommendations[style] || recommendations.mixed;
  }
}
