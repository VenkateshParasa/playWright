/**
 * AI Recommendation Engine
 * Provides personalized content recommendations using collaborative and content-based filtering
 */

import mongoose from 'mongoose';
import { Card } from '../../models/Card.js';
import { UserProgress } from '../../models/UserProgress.js';
import { User } from '../../models/User.js';

interface UserProfile {
  userId: string;
  preferredCategories: string[];
  averagePerformance: number;
  studyTimePattern: 'morning' | 'afternoon' | 'evening' | 'night';
  learningVelocity: number;
  weakAreas: string[];
  strongAreas: string[];
}

interface ContentItem {
  id: string;
  type: 'lesson' | 'flashcard' | 'quiz' | 'exercise';
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  prerequisites: string[];
  tags: string[];
  avgCompletionTime: number;
  popularity: number;
}

interface Recommendation {
  item: ContentItem;
  score: number;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

export class RecommendationEngine {
  /**
   * Get personalized content recommendations
   */
  static async getRecommendations(
    userId: string,
    contentType?: 'lesson' | 'flashcard' | 'quiz' | 'exercise',
    limit: number = 10
  ): Promise<Recommendation[]> {
    const userProfile = await this.buildUserProfile(userId);
    const candidates = await this.getCandidateContent(userId, contentType);

    // Score each candidate
    const scoredItems = candidates.map((item) => ({
      item,
      score: this.calculateRecommendationScore(item, userProfile),
      reason: this.generateReason(item, userProfile),
      priority: this.determinePriority(item, userProfile),
    }));

    // Sort by score and return top N
    return scoredItems.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  /**
   * Recommend next lesson based on learning path
   */
  static async recommendNextLesson(userId: string): Promise<Recommendation[]> {
    const userProfile = await this.buildUserProfile(userId);
    const completedLessons = await this.getCompletedContent(userId, 'lesson');

    // Find lessons where prerequisites are met
    const availableLessons = await this.findAvailableLessons(
      userId,
      completedLessons
    );

    // Score based on learning path optimization
    return availableLessons.map((lesson) => ({
      item: lesson,
      score: this.scoreLessonFit(lesson, userProfile, completedLessons),
      reason: this.getLessonRecommendationReason(lesson, userProfile),
      priority: 'high' as const,
    }));
  }

  /**
   * Recommend flashcards to review based on performance
   */
  static async recommendFlashcardsToReview(
    userId: string,
    limit: number = 20
  ): Promise<any[]> {
    const cards = await Card.find({
      userId: new mongoose.Types.ObjectId(userId),
      isActive: true,
    }).lean();

    // Calculate forgetting risk for each card
    const scoredCards = cards.map((card) => ({
      card,
      forgettingRisk: this.calculateForgettingRisk(card),
      priority: this.calculateReviewPriority(card),
    }));

    // Sort by forgetting risk and priority
    return scoredCards
      .sort((a, b) => {
        if (b.priority !== a.priority) {
          return b.priority - a.priority;
        }
        return b.forgettingRisk - a.forgettingRisk;
      })
      .slice(0, limit)
      .map((item) => ({
        ...item.card,
        forgettingRisk: item.forgettingRisk,
        reviewPriority: item.priority,
        reason: this.getReviewReason(item.card, item.forgettingRisk),
      }));
  }

  /**
   * Recommend exercises based on skill gaps
   */
  static async recommendExercises(
    userId: string,
    limit: number = 5
  ): Promise<Recommendation[]> {
    const userProfile = await this.buildUserProfile(userId);
    const skillGaps = await this.identifySkillGaps(userId);

    // Find exercises that address skill gaps
    const targetedExercises = await this.findExercisesForSkills(
      skillGaps,
      userProfile
    );

    return targetedExercises
      .map((exercise) => ({
        item: exercise,
        score: this.scoreExerciseFit(exercise, skillGaps, userProfile),
        reason: `Helps improve: ${skillGaps.join(', ')}`,
        priority: 'high' as const,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Collaborative filtering recommendations
   */
  static async getCollaborativeRecommendations(
    userId: string,
    limit: number = 10
  ): Promise<Recommendation[]> {
    const similarUsers = await this.findSimilarUsers(userId);
    const userCompletedContent = await this.getCompletedContent(userId);

    // Find content completed by similar users but not by current user
    const recommendations: Recommendation[] = [];

    for (const similarUser of similarUsers) {
      const theirContent = await this.getCompletedContent(similarUser.userId);

      for (const content of theirContent) {
        if (
          !userCompletedContent.some((c) => c.id === content.id) &&
          !recommendations.some((r) => r.item.id === content.id)
        ) {
          recommendations.push({
            item: content,
            score: similarUser.similarity * content.popularity,
            reason: `Popular among learners with similar progress`,
            priority: 'medium',
          });
        }
      }
    }

    return recommendations.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  /**
   * Time-based recommendations (what to study now)
   */
  static async getTimeBasedRecommendations(
    userId: string
  ): Promise<Recommendation[]> {
    const now = new Date();
    const hour = now.getHours();
    const userProfile = await this.buildUserProfile(userId);

    // Check if it's the user's optimal study time
    const isOptimalTime = this.isOptimalStudyTime(hour, userProfile);

    // Get due reviews
    const dueReviews = await Card.find({
      userId: new mongoose.Types.ObjectId(userId),
      isActive: true,
      nextReviewDate: { $lte: now },
    })
      .limit(20)
      .lean();

    const recommendations: Recommendation[] = [];

    if (dueReviews.length > 0) {
      recommendations.push({
        item: {
          id: 'flashcard-review',
          type: 'flashcard',
          category: 'review',
          difficulty: 'medium',
          prerequisites: [],
          tags: ['srs', 'review'],
          avgCompletionTime: dueReviews.length * 2,
          popularity: 1,
        },
        score: 10,
        reason: `${dueReviews.length} flashcards are due for review`,
        priority: 'high',
      });
    }

    // Quick exercise if low on time
    if (!isOptimalTime && hour < 23) {
      const quickExercises = await this.getQuickContent(userId, 10);
      recommendations.push({
        item: quickExercises[0],
        score: 7,
        reason: 'Quick 10-minute exercise before bed',
        priority: 'medium',
      });
    }

    return recommendations;
  }

  /**
   * Content similarity matching
   */
  static async findSimilarContent(
    contentId: string,
    contentType: string,
    limit: number = 5
  ): Promise<ContentItem[]> {
    // This would use TF-IDF or embeddings for real similarity
    // For now, simplified version using tags and category

    const content = await this.getContentById(contentId, contentType);
    if (!content) return [];

    const similarContent = await this.getCandidateContent(null, contentType);

    return similarContent
      .filter((c) => c.id !== contentId)
      .map((c) => ({
        ...c,
        similarity: this.calculateContentSimilarity(content, c),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  // ==================== Helper Methods ====================

  private static async buildUserProfile(userId: string): Promise<UserProfile> {
    const progress = await UserProgress.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    }).lean();

    const cards = await Card.find({
      userId: new mongoose.Types.ObjectId(userId),
      isActive: true,
    }).lean();

    // Analyze categories
    const categoryPerformance = new Map<string, number[]>();
    cards.forEach((card) => {
      if (!categoryPerformance.has(card.category)) {
        categoryPerformance.set(card.category, []);
      }
      categoryPerformance.get(card.category)?.push(card.successRate);
    });

    const preferredCategories = Array.from(categoryPerformance.entries())
      .sort((a, b) => {
        const avgA = a[1].reduce((sum, val) => sum + val, 0) / a[1].length;
        const avgB = b[1].reduce((sum, val) => sum + val, 0) / b[1].length;
        return avgB - avgA;
      })
      .slice(0, 5)
      .map(([category]) => category);

    // Calculate weak and strong areas
    const weakAreas: string[] = [];
    const strongAreas: string[] = [];

    categoryPerformance.forEach((rates, category) => {
      const avg = rates.reduce((sum, val) => sum + val, 0) / rates.length;
      if (avg < 60) weakAreas.push(category);
      if (avg > 80) strongAreas.push(category);
    });

    // Determine study time pattern
    const studyTimePattern = this.analyzeStudyTimePattern(
      progress?.studySessions || []
    );

    // Calculate learning velocity (XP per hour)
    const totalTime = progress?.totalStudyTime || 1;
    const learningVelocity = (progress?.totalXP || 0) / (totalTime / 60);

    return {
      userId,
      preferredCategories,
      averagePerformance:
        cards.reduce((sum, card) => sum + card.successRate, 0) /
          cards.length || 0,
      studyTimePattern,
      learningVelocity,
      weakAreas,
      strongAreas,
    };
  }

  private static analyzeStudyTimePattern(
    sessions: any[]
  ): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hourCounts = { morning: 0, afternoon: 0, evening: 0, night: 0 };

    sessions.forEach((session) => {
      const hour = new Date(session.date).getHours();
      if (hour >= 6 && hour < 12) hourCounts.morning++;
      else if (hour >= 12 && hour < 17) hourCounts.afternoon++;
      else if (hour >= 17 && hour < 22) hourCounts.evening++;
      else hourCounts.night++;
    });

    const maxCount = Math.max(...Object.values(hourCounts));
    return (Object.entries(hourCounts).find(
      ([, count]) => count === maxCount
    )?.[0] || 'evening') as any;
  }

  private static calculateRecommendationScore(
    item: ContentItem,
    profile: UserProfile
  ): number {
    let score = 50; // Base score

    // Category preference bonus
    if (profile.preferredCategories.includes(item.category)) {
      score += 20;
    }

    // Difficulty matching
    if (profile.averagePerformance > 80 && item.difficulty === 'hard') {
      score += 15;
    } else if (
      profile.averagePerformance < 60 &&
      item.difficulty === 'easy'
    ) {
      score += 15;
    } else if (item.difficulty === 'medium') {
      score += 10;
    }

    // Weak area targeting
    if (profile.weakAreas.some((area) => item.tags.includes(area))) {
      score += 25;
    }

    // Popularity bonus
    score += item.popularity * 5;

    return Math.min(score, 100);
  }

  private static generateReason(
    item: ContentItem,
    profile: UserProfile
  ): string {
    const reasons: string[] = [];

    if (profile.preferredCategories.includes(item.category)) {
      reasons.push('matches your interests');
    }

    if (profile.weakAreas.some((area) => item.tags.includes(area))) {
      reasons.push('helps improve weak areas');
    }

    if (item.popularity > 0.7) {
      reasons.push('highly rated by other learners');
    }

    return reasons.join(', ') || 'recommended for your level';
  }

  private static determinePriority(
    item: ContentItem,
    profile: UserProfile
  ): 'high' | 'medium' | 'low' {
    if (profile.weakAreas.some((area) => item.tags.includes(area))) {
      return 'high';
    }

    if (profile.preferredCategories.includes(item.category)) {
      return 'medium';
    }

    return 'low';
  }

  private static calculateForgettingRisk(card: any): number {
    const now = new Date();
    const daysSinceReview = card.lastReviewed
      ? (now.getTime() - new Date(card.lastReviewed).getTime()) /
        (1000 * 60 * 60 * 24)
      : 999;

    const intervalRatio = daysSinceReview / (card.interval || 1);

    // High risk if past due date or low success rate
    let risk = intervalRatio * 50;

    if (card.successRate < 70) {
      risk += 30;
    }

    if (card.easinessFactor < 2.0) {
      risk += 20;
    }

    return Math.min(risk, 100);
  }

  private static calculateReviewPriority(card: any): number {
    const now = new Date();
    const isOverdue = new Date(card.nextReviewDate) < now;

    if (isOverdue) {
      const daysOverdue =
        (now.getTime() - new Date(card.nextReviewDate).getTime()) /
        (1000 * 60 * 60 * 24);
      return 100 + daysOverdue * 10;
    }

    return 50;
  }

  private static getReviewReason(card: any, forgettingRisk: number): string {
    if (forgettingRisk > 80) {
      return 'High risk of forgetting - review soon!';
    } else if (forgettingRisk > 60) {
      return 'Due for review to maintain retention';
    } else {
      return 'Regular review to strengthen memory';
    }
  }

  private static async getCandidateContent(
    userId: string | null,
    contentType?: string
  ): Promise<ContentItem[]> {
    // Simplified - would query actual content database
    return [
      {
        id: 'lesson-1',
        type: 'lesson',
        category: 'playwright-basics',
        difficulty: 'easy',
        prerequisites: [],
        tags: ['locators', 'selectors'],
        avgCompletionTime: 30,
        popularity: 0.9,
      },
      {
        id: 'lesson-2',
        type: 'lesson',
        category: 'playwright-advanced',
        difficulty: 'hard',
        prerequisites: ['lesson-1'],
        tags: ['testing', 'automation'],
        avgCompletionTime: 45,
        popularity: 0.8,
      },
    ];
  }

  private static async getCompletedContent(
    userId: string,
    contentType?: string
  ): Promise<ContentItem[]> {
    // Simplified - would query user progress
    return [];
  }

  private static async findAvailableLessons(
    userId: string,
    completed: ContentItem[]
  ): Promise<ContentItem[]> {
    const allLessons = await this.getCandidateContent(userId, 'lesson');
    const completedIds = new Set(completed.map((c) => c.id));

    return allLessons.filter((lesson) => {
      if (completedIds.has(lesson.id)) return false;

      return lesson.prerequisites.every((prereq) => completedIds.has(prereq));
    });
  }

  private static scoreLessonFit(
    lesson: ContentItem,
    profile: UserProfile,
    completed: ContentItem[]
  ): number {
    let score = 50;

    // Just completed prerequisites
    const recentlyCompleted = completed.slice(-3).map((c) => c.id);
    if (
      lesson.prerequisites.some((prereq) => recentlyCompleted.includes(prereq))
    ) {
      score += 30;
    }

    // Difficulty matching
    if (profile.averagePerformance > 80 && lesson.difficulty === 'hard') {
      score += 20;
    }

    return score;
  }

  private static getLessonRecommendationReason(
    lesson: ContentItem,
    profile: UserProfile
  ): string {
    return `Next step in your ${lesson.category} learning path`;
  }

  private static async identifySkillGaps(userId: string): Promise<string[]> {
    const profile = await this.buildUserProfile(userId);
    return profile.weakAreas;
  }

  private static async findExercisesForSkills(
    skills: string[],
    profile: UserProfile
  ): Promise<ContentItem[]> {
    const allExercises = await this.getCandidateContent(
      profile.userId,
      'exercise'
    );
    return allExercises.filter((ex) =>
      ex.tags.some((tag) => skills.includes(tag))
    );
  }

  private static scoreExerciseFit(
    exercise: ContentItem,
    gaps: string[],
    profile: UserProfile
  ): number {
    const relevantTags = exercise.tags.filter((tag) => gaps.includes(tag));
    return relevantTags.length * 25 + 25;
  }

  private static async findSimilarUsers(
    userId: string
  ): Promise<Array<{ userId: string; similarity: number }>> {
    // Simplified collaborative filtering
    // Would use cosine similarity on user-content interaction matrix
    return [];
  }

  private static isOptimalStudyTime(
    hour: number,
    profile: UserProfile
  ): boolean {
    const patterns = {
      morning: hour >= 6 && hour < 12,
      afternoon: hour >= 12 && hour < 17,
      evening: hour >= 17 && hour < 22,
      night: hour >= 22 || hour < 6,
    };

    return patterns[profile.studyTimePattern] || false;
  }

  private static async getQuickContent(
    userId: string,
    maxTime: number
  ): Promise<ContentItem[]> {
    const content = await this.getCandidateContent(userId);
    return content.filter((c) => c.avgCompletionTime <= maxTime);
  }

  private static async getContentById(
    contentId: string,
    contentType: string
  ): Promise<ContentItem | null> {
    // Would query actual content
    return null;
  }

  private static calculateContentSimilarity(
    a: ContentItem,
    b: ContentItem
  ): number {
    let similarity = 0;

    // Category match
    if (a.category === b.category) similarity += 40;

    // Tag overlap
    const commonTags = a.tags.filter((tag) => b.tags.includes(tag));
    similarity += (commonTags.length / Math.max(a.tags.length, b.tags.length)) * 40;

    // Difficulty similarity
    const difficultyScore = {
      easy: 1,
      medium: 2,
      hard: 3,
    };
    const diffDiff = Math.abs(
      difficultyScore[a.difficulty] - difficultyScore[b.difficulty]
    );
    similarity += (3 - diffDiff) * 10;

    return similarity;
  }
}
