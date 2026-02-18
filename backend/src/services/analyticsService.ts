import { User } from '../models/User';
import { UserProgress } from '../models/UserProgress';
import mongoose from 'mongoose';

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface UserMetrics {
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  activeUsersToday: number;
  activeUsersThisWeek: number;
  activeUsersThisMonth: number;
  userGrowth: { date: string; count: number }[];
  userRetentionRate: number;
  userChurnRate: number;
  averageSessionDuration: number;
  usersByTrack: { track: string; count: number }[];
}

export interface ContentMetrics {
  totalLessons: number;
  totalQuizzes: number;
  totalExercises: number;
  totalFlashcards: number;
  completionRatesByModule: { module: string; rate: number }[];
  popularLessons: { lessonId: string; title: string; views: number }[];
  leastCompletedLessons: { lessonId: string; title: string; completionRate: number }[];
  averageQuizScores: { date: string; averageScore: number }[];
  quizPassRates: { quizId: string; quizName: string; passRate: number }[];
  difficultExercises: { exerciseId: string; exerciseName: string; completionRate: number }[];
  flashcardReviewCount: number;
  flashcardReviewThisWeek: number;
  engagementHeatmap: { dayOfWeek: number; hour: number; count: number }[];
}

export interface EngagementMetrics {
  totalStudyTime: number;
  averageStudyTimePerUser: number;
  studyTimeDistribution: { range: string; count: number }[];
  dailyActiveSessions: number;
  sessionDurationDistribution: { range: string; count: number }[];
  peakUsageTimes: { hour: number; count: number }[];
  activityHeatmap: { date: string; count: number }[];
  streakDistribution: { range: string; count: number }[];
}

export interface ProgressMetrics {
  overallCompletionRate: number;
  averageProgressPercentage: number;
  completionRateByModule: { module: string; rate: number }[];
  timeToCompleteByModule: { module: string; averageDays: number }[];
  progressDistribution: { range: string; count: number }[];
  stuckUsers: { userId: string; userName: string; lessonId: string; daysStuck: number }[];
}

export interface SRSMetrics {
  totalCards: number;
  averageCardsPerUser: number;
  cardsReviewedToday: number;
  cardsReviewedThisWeek: number;
  averageRetentionRate: number;
  retentionCurve: { interval: number; retentionRate: number }[];
  reviewFrequencyDistribution: { frequency: string; count: number }[];
  cardDifficultyDistribution: { difficulty: string; count: number }[];
}

export class AnalyticsService {
  /**
   * Get user metrics with growth and engagement data
   */
  async getUserMetrics(dateRange?: DateRange): Promise<UserMetrics> {
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Total users
    const totalUsers = await User.countDocuments();

    // New users
    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: today },
    });

    const newUsersThisWeek = await User.countDocuments({
      createdAt: { $gte: weekAgo },
    });

    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: monthAgo },
    });

    // Active users (based on lastLogin or lastActivityAt)
    const activeUsersToday = await User.countDocuments({
      lastLogin: { $gte: today },
    });

    const activeUsersThisWeek = await User.countDocuments({
      lastLogin: { $gte: weekAgo },
    });

    const activeUsersThisMonth = await User.countDocuments({
      lastLogin: { $gte: monthAgo },
    });

    // User growth over time (last 30 days)
    const userGrowth = await this.calculateUserGrowth(30);

    // Retention and churn (simplified calculation)
    const retentionData = await this.calculateRetentionAndChurn(monthAgo);

    // Average session duration (from UserProgress studySessions)
    const avgSessionDuration = await this.calculateAverageSessionDuration();

    // Users by track (mock data - would need learning track assignment)
    const usersByTrack = await this.getUsersByTrack();

    return {
      totalUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      activeUsersToday,
      activeUsersThisWeek,
      activeUsersThisMonth,
      userGrowth,
      userRetentionRate: retentionData.retention,
      userChurnRate: retentionData.churn,
      averageSessionDuration: avgSessionDuration,
      usersByTrack,
    };
  }

  /**
   * Get content engagement metrics
   */
  async getContentMetrics(dateRange?: DateRange): Promise<ContentMetrics> {
    // These would be based on actual content models
    // For now, returning aggregated data from UserProgress
    const progressDocs = await UserProgress.find({}).lean();

    const totalLessons = 50; // Mock - would query Lesson model
    const totalQuizzes = 30; // Mock - would query Quiz model
    const totalExercises = 40; // Mock - would query Exercise model
    const totalFlashcards = 500; // Mock - would query Flashcard model

    // Calculate completion rates
    const completionRatesByModule = await this.getCompletionRatesByModule();

    // Popular lessons (mock data - would track views)
    const popularLessons = this.getMockPopularLessons();

    // Least completed lessons
    const leastCompletedLessons = this.getMockLeastCompletedLessons();

    // Average quiz scores over time
    const averageQuizScores = await this.getAverageQuizScoresOverTime();

    // Quiz pass rates
    const quizPassRates = await this.getQuizPassRates(progressDocs);

    // Difficult exercises
    const difficultExercises = this.getMockDifficultExercises();

    // Flashcard review counts
    const flashcardReviewCount = progressDocs.reduce(
      (sum, doc) => sum + (doc.flashcardsReviewed || 0),
      0
    );

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const flashcardReviewThisWeek = await UserProgress.aggregate([
      {
        $match: {
          updatedAt: { $gte: weekAgo },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$flashcardsReviewed' },
        },
      },
    ]).then((result) => (result[0]?.total || 0));

    // Engagement heatmap
    const engagementHeatmap = await this.getEngagementHeatmap();

    return {
      totalLessons,
      totalQuizzes,
      totalExercises,
      totalFlashcards,
      completionRatesByModule,
      popularLessons,
      leastCompletedLessons,
      averageQuizScores,
      quizPassRates,
      difficultExercises,
      flashcardReviewCount,
      flashcardReviewThisWeek,
      engagementHeatmap,
    };
  }

  /**
   * Get engagement metrics
   */
  async getEngagementMetrics(dateRange?: DateRange): Promise<EngagementMetrics> {
    const progressDocs = await UserProgress.find({}).lean();

    // Total study time
    const totalStudyTime = progressDocs.reduce(
      (sum, doc) => sum + (doc.totalStudyTime || 0),
      0
    );

    // Average study time per user
    const averageStudyTimePerUser =
      progressDocs.length > 0 ? totalStudyTime / progressDocs.length : 0;

    // Study time distribution
    const studyTimeDistribution = this.calculateStudyTimeDistribution(progressDocs);

    // Daily active sessions
    const dailyActiveSessions = await this.calculateDailyActiveSessions();

    // Session duration distribution
    const sessionDurationDistribution =
      await this.calculateSessionDurationDistribution(progressDocs);

    // Peak usage times
    const peakUsageTimes = await this.calculatePeakUsageTimes(progressDocs);

    // Activity heatmap (calendar view)
    const activityHeatmap = await this.calculateActivityHeatmap();

    // Streak distribution
    const streakDistribution = this.calculateStreakDistribution(progressDocs);

    return {
      totalStudyTime,
      averageStudyTimePerUser,
      studyTimeDistribution,
      dailyActiveSessions,
      sessionDurationDistribution,
      peakUsageTimes,
      activityHeatmap,
      streakDistribution,
    };
  }

  /**
   * Get learning progress metrics
   */
  async getProgressMetrics(dateRange?: DateRange): Promise<ProgressMetrics> {
    const progressDocs = await UserProgress.find({}).lean();

    // Overall completion rate
    const totalCompletions = progressDocs.reduce(
      (sum, doc) =>
        sum +
        (doc.lessonsCompleted || 0) +
        (doc.quizzesCompleted || 0) +
        (doc.exercisesCompleted || 0),
      0
    );
    const totalContent = 120; // Mock total content items
    const overallCompletionRate =
      progressDocs.length > 0
        ? (totalCompletions / (progressDocs.length * totalContent)) * 100
        : 0;

    // Average progress percentage (based on lessons completed)
    const averageProgressPercentage =
      progressDocs.length > 0
        ? (progressDocs.reduce((sum, doc) => sum + (doc.lessonsCompleted || 0), 0) /
            progressDocs.length /
            50) *
          100
        : 0;

    // Completion rate by module
    const completionRateByModule = await this.getCompletionRatesByModule();

    // Time to complete by module (mock data)
    const timeToCompleteByModule = this.getMockTimeToCompleteByModule();

    // Progress distribution
    const progressDistribution = this.calculateProgressDistribution(progressDocs);

    // Stuck users (users with low recent activity)
    const stuckUsers = await this.identifyStuckUsers();

    return {
      overallCompletionRate,
      averageProgressPercentage,
      completionRateByModule,
      timeToCompleteByModule,
      progressDistribution,
      stuckUsers,
    };
  }

  /**
   * Get SRS metrics
   */
  async getSRSMetrics(dateRange?: DateRange): Promise<SRSMetrics> {
    const progressDocs = await UserProgress.find({}).lean();

    // Total cards (mock - would query Flashcard model)
    const totalCards = 500;

    // Average cards per user
    const averageCardsPerUser = totalCards / Math.max(progressDocs.length, 1);

    // Cards reviewed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cardsReviewedToday = progressDocs.reduce(
      (sum, doc) => sum + (doc.flashcardsReviewed || 0),
      0
    );

    // Cards reviewed this week
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const cardsReviewedThisWeek = progressDocs.reduce(
      (sum, doc) => sum + (doc.flashcardsReviewed || 0),
      0
    );

    // Average retention rate (mock calculation)
    const averageRetentionRate = 85; // Would calculate from actual review data

    // Retention curve
    const retentionCurve = this.getMockRetentionCurve();

    // Review frequency distribution
    const reviewFrequencyDistribution = this.getMockReviewFrequencyDistribution();

    // Card difficulty distribution
    const cardDifficultyDistribution = this.getMockCardDifficultyDistribution();

    return {
      totalCards,
      averageCardsPerUser,
      cardsReviewedToday,
      cardsReviewedThisWeek,
      averageRetentionRate,
      retentionCurve,
      reviewFrequencyDistribution,
      cardDifficultyDistribution,
    };
  }

  // Helper methods

  private async calculateUserGrowth(days: number) {
    const growth = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = await User.countDocuments({
        createdAt: { $gte: date, $lt: nextDate },
      });

      growth.push({
        date: date.toISOString().split('T')[0],
        count,
      });
    }

    return growth;
  }

  private async calculateRetentionAndChurn(fromDate: Date) {
    const usersAtStart = await User.countDocuments({
      createdAt: { $lt: fromDate },
    });

    const activeUsers = await User.countDocuments({
      createdAt: { $lt: fromDate },
      lastLogin: { $gte: fromDate },
    });

    const retention = usersAtStart > 0 ? (activeUsers / usersAtStart) * 100 : 0;
    const churn = 100 - retention;

    return { retention, churn };
  }

  private async calculateAverageSessionDuration() {
    const result = await UserProgress.aggregate([
      { $unwind: '$studySessions' },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: '$studySessions.duration' },
        },
      },
    ]);

    return result[0]?.avgDuration || 0;
  }

  private async getUsersByTrack() {
    // Mock data - would require learning track field in User model
    return [
      { track: '30-day', count: 45 },
      { track: '60-day', count: 32 },
    ];
  }

  private async getCompletionRatesByModule() {
    // Mock data - would calculate from actual lesson completion data
    return [
      { module: 'Week 1: Introduction', rate: 85 },
      { module: 'Week 2: Locators', rate: 72 },
      { module: 'Week 3: Actions', rate: 68 },
      { module: 'Week 4: Assertions', rate: 55 },
      { module: 'Week 5: Advanced', rate: 42 },
    ];
  }

  private getMockPopularLessons() {
    return [
      { lessonId: 'lesson-1', title: 'Introduction to Playwright', views: 245 },
      { lessonId: 'lesson-2', title: 'Setting Up Your First Test', views: 198 },
      { lessonId: 'lesson-3', title: 'Understanding Locators', views: 176 },
      { lessonId: 'lesson-4', title: 'Working with Web Elements', views: 154 },
      { lessonId: 'lesson-5', title: 'Assertions and Expectations', views: 142 },
    ];
  }

  private getMockLeastCompletedLessons() {
    return [
      { lessonId: 'lesson-45', title: 'Advanced API Testing', completionRate: 22 },
      { lessonId: 'lesson-48', title: 'Performance Optimization', completionRate: 28 },
      { lessonId: 'lesson-42', title: 'Visual Regression Testing', completionRate: 35 },
    ];
  }

  private async getAverageQuizScoresOverTime() {
    // Mock data - would aggregate from quiz attempts
    const scores = [];
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      scores.push({
        date: date.toISOString().split('T')[0],
        averageScore: 70 + Math.random() * 20,
      });
    }

    return scores;
  }

  private async getQuizPassRates(progressDocs: any[]) {
    // Mock data - would calculate from quiz attempts
    return [
      { quizId: 'quiz-1', quizName: 'Playwright Basics Quiz', passRate: 82 },
      { quizId: 'quiz-2', quizName: 'Locators Quiz', passRate: 75 },
      { quizId: 'quiz-3', quizName: 'Actions Quiz', passRate: 68 },
      { quizId: 'quiz-4', quizName: 'Assertions Quiz', passRate: 71 },
      { quizId: 'quiz-5', quizName: 'Advanced Topics Quiz', passRate: 55 },
    ];
  }

  private getMockDifficultExercises() {
    return [
      { exerciseId: 'ex-10', exerciseName: 'Complex Form Automation', completionRate: 35 },
      { exerciseId: 'ex-15', exerciseName: 'API Integration Test', completionRate: 42 },
      { exerciseId: 'ex-18', exerciseName: 'Multi-Tab Handling', completionRate: 48 },
    ];
  }

  private async getEngagementHeatmap() {
    const heatmap = [];
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        heatmap.push({
          dayOfWeek: day,
          hour,
          count: Math.floor(Math.random() * 50),
        });
      }
    }
    return heatmap;
  }

  private calculateStudyTimeDistribution(progressDocs: any[]) {
    const ranges = [
      { range: '0-30 min', count: 0 },
      { range: '30-60 min', count: 0 },
      { range: '1-2 hours', count: 0 },
      { range: '2-5 hours', count: 0 },
      { range: '5+ hours', count: 0 },
    ];

    progressDocs.forEach((doc) => {
      const time = doc.totalStudyTime || 0;
      if (time < 30) ranges[0].count++;
      else if (time < 60) ranges[1].count++;
      else if (time < 120) ranges[2].count++;
      else if (time < 300) ranges[3].count++;
      else ranges[4].count++;
    });

    return ranges;
  }

  private async calculateDailyActiveSessions() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await UserProgress.aggregate([
      { $unwind: '$studySessions' },
      {
        $match: {
          'studySessions.date': { $gte: today },
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
        },
      },
    ]);

    return result[0]?.count || 0;
  }

  private async calculateSessionDurationDistribution(progressDocs: any[]) {
    const ranges = [
      { range: '0-15 min', count: 0 },
      { range: '15-30 min', count: 0 },
      { range: '30-60 min', count: 0 },
      { range: '60+ min', count: 0 },
    ];

    progressDocs.forEach((doc) => {
      if (doc.studySessions) {
        doc.studySessions.forEach((session: any) => {
          const duration = session.duration || 0;
          if (duration < 15) ranges[0].count++;
          else if (duration < 30) ranges[1].count++;
          else if (duration < 60) ranges[2].count++;
          else ranges[3].count++;
        });
      }
    });

    return ranges;
  }

  private async calculatePeakUsageTimes(progressDocs: any[]) {
    const hourCounts = new Array(24).fill(0);

    progressDocs.forEach((doc) => {
      if (doc.studySessions) {
        doc.studySessions.forEach((session: any) => {
          const hour = new Date(session.date).getHours();
          hourCounts[hour]++;
        });
      }
    });

    return hourCounts.map((count, hour) => ({ hour, count }));
  }

  private async calculateActivityHeatmap() {
    const heatmap = [];
    const now = new Date();

    for (let i = 364; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      heatmap.push({
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 20),
      });
    }

    return heatmap;
  }

  private calculateStreakDistribution(progressDocs: any[]) {
    const ranges = [
      { range: '1-7 days', count: 0 },
      { range: '8-14 days', count: 0 },
      { range: '15-30 days', count: 0 },
      { range: '30+ days', count: 0 },
    ];

    progressDocs.forEach((doc) => {
      const streak = doc.streak?.currentStreak || 0;
      if (streak >= 1 && streak <= 7) ranges[0].count++;
      else if (streak <= 14) ranges[1].count++;
      else if (streak <= 30) ranges[2].count++;
      else if (streak > 30) ranges[3].count++;
    });

    return ranges;
  }

  private calculateProgressDistribution(progressDocs: any[]) {
    const ranges = [
      { range: '0-20%', count: 0 },
      { range: '21-40%', count: 0 },
      { range: '41-60%', count: 0 },
      { range: '61-80%', count: 0 },
      { range: '81-100%', count: 0 },
    ];

    progressDocs.forEach((doc) => {
      const progress = ((doc.lessonsCompleted || 0) / 50) * 100;
      if (progress <= 20) ranges[0].count++;
      else if (progress <= 40) ranges[1].count++;
      else if (progress <= 60) ranges[2].count++;
      else if (progress <= 80) ranges[3].count++;
      else ranges[4].count++;
    });

    return ranges;
  }

  private getMockTimeToCompleteByModule() {
    return [
      { module: 'Week 1', averageDays: 5.2 },
      { module: 'Week 2', averageDays: 6.8 },
      { module: 'Week 3', averageDays: 7.5 },
      { module: 'Week 4', averageDays: 8.2 },
      { module: 'Week 5', averageDays: 9.1 },
    ];
  }

  private async identifyStuckUsers() {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const stuckUsers = await UserProgress.find({
      lastActivityAt: { $lt: weekAgo },
      lessonsCompleted: { $gt: 0, $lt: 50 },
    })
      .limit(10)
      .populate('userId', 'firstName lastName')
      .lean();

    return stuckUsers.map((user: any) => ({
      userId: user.userId?._id?.toString() || '',
      userName: user.userId
        ? `${user.userId.firstName} ${user.userId.lastName}`
        : 'Unknown',
      lessonId: 'lesson-unknown',
      daysStuck: Math.floor(
        (Date.now() - new Date(user.lastActivityAt).getTime()) / (24 * 60 * 60 * 1000)
      ),
    }));
  }

  private getMockRetentionCurve() {
    return [
      { interval: 1, retentionRate: 95 },
      { interval: 2, retentionRate: 88 },
      { interval: 4, retentionRate: 82 },
      { interval: 8, retentionRate: 75 },
      { interval: 16, retentionRate: 70 },
      { interval: 32, retentionRate: 65 },
    ];
  }

  private getMockReviewFrequencyDistribution() {
    return [
      { frequency: 'Daily', count: 45 },
      { frequency: '2-3 times/week', count: 28 },
      { frequency: 'Weekly', count: 15 },
      { frequency: 'Bi-weekly', count: 8 },
      { frequency: 'Monthly', count: 4 },
    ];
  }

  private getMockCardDifficultyDistribution() {
    return [
      { difficulty: 'Easy', count: 245 },
      { difficulty: 'Medium', count: 180 },
      { difficulty: 'Hard', count: 75 },
    ];
  }
}

export const analyticsService = new AnalyticsService();
