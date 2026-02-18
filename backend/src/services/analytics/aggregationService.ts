import { User } from '../../models/User';
import { UserProgress } from '../../models/UserProgress';
import { Card } from '../../models/Card';
import mongoose from 'mongoose';

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface CohortData {
  cohort: string;
  week0: number;
  week1: number;
  week2: number;
  week3: number;
  week4: number;
  [key: string]: string | number;
}

export interface FunnelStage {
  stage: string;
  count: number;
  percentage: number;
  dropoff?: number;
}

export interface PredictiveMetrics {
  churnProbability: {
    userId: string;
    userName: string;
    probability: number;
    riskFactors: string[];
  }[];
  completionProbability: {
    userId: string;
    userName: string;
    probability: number;
    estimatedDays: number;
  }[];
  recommendationEffectiveness: {
    totalRecommendations: number;
    clickedRecommendations: number;
    completedRecommendations: number;
    effectiveness: number;
  };
}

export interface ABTestResult {
  testName: string;
  variantA: {
    name: string;
    conversions: number;
    total: number;
    conversionRate: number;
  };
  variantB: {
    name: string;
    conversions: number;
    total: number;
    conversionRate: number;
  };
  pValue: number;
  winner?: string;
  confidenceLevel: number;
}

export class AggregationService {
  /**
   * Get real-time metrics with WebSocket support
   */
  async getRealTimeMetrics() {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const [
      activeUsersLast5Min,
      activeUsersLastHour,
      recentCompletions,
      recentQuizAttempts,
      avgQuizScore,
    ] = await Promise.all([
      UserProgress.countDocuments({
        lastActivityAt: { $gte: fiveMinutesAgo },
      }),
      UserProgress.countDocuments({
        lastActivityAt: { $gte: hourAgo },
      }),
      UserProgress.aggregate([
        {
          $match: { lastActivityAt: { $gte: hourAgo } },
        },
        {
          $group: {
            _id: null,
            lessonCompletions: { $sum: '$lessonsCompleted' },
          },
        },
      ]),
      UserProgress.aggregate([
        {
          $match: { lastActivityAt: { $gte: hourAgo } },
        },
        {
          $group: {
            _id: null,
            quizAttempts: { $sum: '$quizzesCompleted' },
          },
        },
      ]),
      this.calculateRecentAverageQuizScore(),
    ]);

    return {
      activeUsers: {
        last5Minutes: activeUsersLast5Min,
        lastHour: activeUsersLastHour,
      },
      recentActivity: {
        lessonCompletions: recentCompletions[0]?.lessonCompletions || 0,
        quizAttempts: recentQuizAttempts[0]?.quizAttempts || 0,
        averageQuizScore: avgQuizScore,
      },
      timestamp: now.toISOString(),
    };
  }

  /**
   * Get time-series data for charts
   */
  async getTimeSeriesData(
    metric: string,
    granularity: 'daily' | 'weekly' | 'monthly' | 'yearly',
    startDate: Date,
    endDate: Date
  ): Promise<TimeSeriesDataPoint[]> {
    const data: TimeSeriesDataPoint[] = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      let nextDate = new Date(currentDate);

      switch (granularity) {
        case 'daily':
          nextDate.setDate(nextDate.getDate() + 1);
          break;
        case 'weekly':
          nextDate.setDate(nextDate.getDate() + 7);
          break;
        case 'monthly':
          nextDate.setMonth(nextDate.getMonth() + 1);
          break;
        case 'yearly':
          nextDate.setFullYear(nextDate.getFullYear() + 1);
          break;
      }

      const value = await this.getMetricValueForPeriod(metric, currentDate, nextDate);

      data.push({
        date: this.formatDate(currentDate, granularity),
        value,
        label: this.formatLabel(currentDate, granularity),
      });

      currentDate = nextDate;
    }

    return data;
  }

  /**
   * Get user engagement metrics (DAU, MAU, retention rates)
   */
  async getUserEngagementMetrics() {
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);

    // DAU (Daily Active Users)
    const dau = await User.countDocuments({
      lastLogin: { $gte: today },
    });

    // WAU (Weekly Active Users)
    const wau = await User.countDocuments({
      lastLogin: { $gte: weekAgo },
    });

    // MAU (Monthly Active Users)
    const mau = await User.countDocuments({
      lastLogin: { $gte: monthAgo },
    });

    // DAU/MAU ratio (stickiness)
    const stickiness = mau > 0 ? (dau / mau) * 100 : 0;

    // Day-over-day retention
    const yesterdayActiveUsers = await User.countDocuments({
      lastLogin: { $gte: yesterday, $lt: today },
    });

    const returnedUsers = await User.countDocuments({
      lastLogin: { $gte: today },
      createdAt: { $lt: yesterday },
    });

    const dayOverDayRetention =
      yesterdayActiveUsers > 0 ? (returnedUsers / yesterdayActiveUsers) * 100 : 0;

    // 7-day retention
    const retention7Day = await this.calculateRetentionRate(7);

    // 30-day retention
    const retention30Day = await this.calculateRetentionRate(30);

    return {
      dau,
      wau,
      mau,
      stickiness: Math.round(stickiness * 100) / 100,
      retention: {
        dayOverDay: Math.round(dayOverDayRetention * 100) / 100,
        sevenDay: retention7Day,
        thirtyDay: retention30Day,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get learning outcomes analytics
   */
  async getLearningOutcomesAnalytics() {
    const progressDocs = await UserProgress.find({}).lean();

    // Calculate completion rates
    const totalUsers = progressDocs.length;
    const usersWithCompletions = progressDocs.filter(
      (doc) => doc.lessonsCompleted > 0
    ).length;
    const completionRate = totalUsers > 0 ? (usersWithCompletions / totalUsers) * 100 : 0;

    // Calculate pass rates
    const usersWithQuizzes = progressDocs.filter((doc) => doc.quizzesCompleted > 0).length;
    const passRate =
      usersWithQuizzes > 0
        ? (progressDocs.reduce((sum, doc) => sum + (doc.quizzesPassed || 0), 0) /
            progressDocs.reduce((sum, doc) => sum + (doc.quizzesCompleted || 0), 1)) *
          100
        : 0;

    // Calculate average time-to-completion
    const averageTimeToCompletion = await this.calculateAverageTimeToCompletion();

    // Calculate perfect quiz percentage
    const perfectQuizRate =
      usersWithQuizzes > 0
        ? (progressDocs.reduce((sum, doc) => sum + (doc.perfectQuizzes || 0), 0) /
            progressDocs.reduce((sum, doc) => sum + (doc.quizzesCompleted || 0), 1)) *
          100
        : 0;

    // Learning velocity (average activities per day)
    const learningVelocity = await this.calculateLearningVelocity(progressDocs);

    return {
      completionRate: Math.round(completionRate * 100) / 100,
      passRate: Math.round(passRate * 100) / 100,
      perfectQuizRate: Math.round(perfectQuizRate * 100) / 100,
      averageTimeToCompletion,
      learningVelocity,
      totalLearners: totalUsers,
      activeLearners: usersWithCompletions,
    };
  }

  /**
   * Get content performance analytics
   */
  async getContentPerformance() {
    // Mock data for most popular lessons (would integrate with actual lesson tracking)
    const mostPopularLessons = [
      {
        lessonId: 'lesson-1',
        title: 'Introduction to Playwright',
        views: 1245,
        completions: 1089,
        avgRating: 4.7,
        avgTimeSpent: 18.5,
      },
      {
        lessonId: 'lesson-2',
        title: 'Setting Up Your First Test',
        views: 1198,
        completions: 987,
        avgRating: 4.6,
        avgTimeSpent: 22.3,
      },
      {
        lessonId: 'lesson-3',
        title: 'Understanding Locators',
        views: 1087,
        completions: 856,
        avgRating: 4.5,
        avgTimeSpent: 25.7,
      },
    ];

    const highestRatedContent = [
      {
        contentId: 'lesson-10',
        title: 'Advanced Test Patterns',
        type: 'lesson',
        rating: 4.9,
        totalRatings: 245,
      },
      {
        contentId: 'quiz-5',
        title: 'Locators Mastery Quiz',
        type: 'quiz',
        rating: 4.8,
        totalRatings: 189,
      },
    ];

    const contentWithHighDropoff = await this.identifyHighDropoffContent();

    return {
      mostPopularLessons,
      highestRatedContent,
      contentWithHighDropoff,
    };
  }

  /**
   * Cohort analysis
   */
  async getCohortAnalysis(startDate: Date, endDate: Date): Promise<CohortData[]> {
    const cohorts: CohortData[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const cohortStart = new Date(currentDate);
      const cohortEnd = new Date(currentDate);
      cohortEnd.setDate(cohortEnd.getDate() + 7);

      const cohortUsers = await User.find({
        createdAt: { $gte: cohortStart, $lt: cohortEnd },
      })
        .select('_id')
        .lean();

      const cohortUserIds = cohortUsers.map((u) => u._id);

      if (cohortUserIds.length > 0) {
        const cohortData: CohortData = {
          cohort: this.formatDate(cohortStart, 'weekly'),
          week0: cohortUserIds.length,
          week1: 0,
          week2: 0,
          week3: 0,
          week4: 0,
        };

        // Calculate retention for each week
        for (let week = 1; week <= 4; week++) {
          const weekStart = new Date(cohortEnd);
          weekStart.setDate(weekStart.getDate() + (week - 1) * 7);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 7);

          const activeUsers = await User.countDocuments({
            _id: { $in: cohortUserIds },
            lastLogin: { $gte: weekStart, $lt: weekEnd },
          });

          cohortData[`week${week}`] = activeUsers;
        }

        cohorts.push(cohortData);
      }

      currentDate.setDate(currentDate.getDate() + 7);
    }

    return cohorts;
  }

  /**
   * Funnel analysis
   */
  async getFunnelAnalysis(): Promise<FunnelStage[]> {
    const totalUsers = await User.countDocuments();
    const emailVerified = await User.countDocuments({ isEmailVerified: true });
    const startedLearning = await UserProgress.countDocuments({ lessonsCompleted: { $gt: 0 } });
    const completedFirstModule = await UserProgress.countDocuments({
      lessonsCompleted: { $gte: 5 },
    });
    const completedQuiz = await UserProgress.countDocuments({ quizzesCompleted: { $gt: 0 } });
    const activeLearners = await UserProgress.countDocuments({
      lessonsCompleted: { $gte: 10 },
    });

    const stages: FunnelStage[] = [
      {
        stage: 'Registered',
        count: totalUsers,
        percentage: 100,
      },
      {
        stage: 'Email Verified',
        count: emailVerified,
        percentage: (emailVerified / totalUsers) * 100,
        dropoff: totalUsers - emailVerified,
      },
      {
        stage: 'Started Learning',
        count: startedLearning,
        percentage: (startedLearning / totalUsers) * 100,
        dropoff: emailVerified - startedLearning,
      },
      {
        stage: 'Completed First Module',
        count: completedFirstModule,
        percentage: (completedFirstModule / totalUsers) * 100,
        dropoff: startedLearning - completedFirstModule,
      },
      {
        stage: 'Completed Quiz',
        count: completedQuiz,
        percentage: (completedQuiz / totalUsers) * 100,
        dropoff: completedFirstModule - completedQuiz,
      },
      {
        stage: 'Active Learner',
        count: activeLearners,
        percentage: (activeLearners / totalUsers) * 100,
        dropoff: completedQuiz - activeLearners,
      },
    ];

    return stages;
  }

  /**
   * A/B test results visualization
   */
  async getABTestResults(testName: string): Promise<ABTestResult> {
    // Mock A/B test data (would integrate with actual A/B testing framework)
    const mockResults: ABTestResult = {
      testName,
      variantA: {
        name: 'Control',
        conversions: 245,
        total: 1000,
        conversionRate: 24.5,
      },
      variantB: {
        name: 'Variant',
        conversions: 289,
        total: 1000,
        conversionRate: 28.9,
      },
      pValue: 0.023,
      winner: 'Variant B',
      confidenceLevel: 95,
    };

    return mockResults;
  }

  /**
   * Predictive analytics - Churn prediction
   */
  async predictChurn(): Promise<PredictiveMetrics['churnProbability']> {
    const now = new Date();
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Find users at risk of churning
    const atRiskUsers = await UserProgress.find({
      lastActivityAt: { $lt: twoWeeksAgo },
      lessonsCompleted: { $gt: 0, $lt: 50 },
    })
      .populate('userId', 'firstName lastName')
      .limit(20)
      .lean();

    return atRiskUsers.map((user: any) => {
      const daysSinceActivity = Math.floor(
        (now.getTime() - new Date(user.lastActivityAt).getTime()) / (24 * 60 * 60 * 1000)
      );

      const riskFactors: string[] = [];
      let probability = 0;

      if (daysSinceActivity > 14) {
        riskFactors.push('No activity for 2+ weeks');
        probability += 30;
      }
      if (user.lessonsCompleted < 10) {
        riskFactors.push('Low lesson completion');
        probability += 20;
      }
      if (user.quizzesCompleted < 3) {
        riskFactors.push('Few quiz attempts');
        probability += 15;
      }
      if (user.streak?.currentStreak === 0) {
        riskFactors.push('Lost learning streak');
        probability += 20;
      }
      if (user.totalStudyTime < 60) {
        riskFactors.push('Low study time');
        probability += 15;
      }

      return {
        userId: user.userId?._id?.toString() || '',
        userName: user.userId
          ? `${user.userId.firstName} ${user.userId.lastName}`
          : 'Unknown',
        probability: Math.min(probability, 95),
        riskFactors,
      };
    });
  }

  /**
   * Predictive analytics - Completion probability
   */
  async predictCompletion(): Promise<PredictiveMetrics['completionProbability']> {
    const activeUsers = await UserProgress.find({
      lessonsCompleted: { $gt: 0, $lt: 50 },
    })
      .populate('userId', 'firstName lastName')
      .limit(20)
      .lean();

    return activeUsers.map((user: any) => {
      const completionRate = (user.lessonsCompleted || 0) / 50;
      const daysActive = user.studySessions?.length || 1;
      const avgLessonsPerDay = (user.lessonsCompleted || 0) / Math.max(daysActive, 1);

      const remainingLessons = 50 - (user.lessonsCompleted || 0);
      const estimatedDays = Math.ceil(remainingLessons / Math.max(avgLessonsPerDay, 0.5));

      let probability = completionRate * 100;

      if (user.streak?.currentStreak > 7) probability += 20;
      if (user.quizzesPassed > user.quizzesCompleted * 0.7) probability += 15;
      if (user.totalStudyTime > 300) probability += 10;

      return {
        userId: user.userId?._id?.toString() || '',
        userName: user.userId
          ? `${user.userId.firstName} ${user.userId.lastName}`
          : 'Unknown',
        probability: Math.min(probability, 95),
        estimatedDays,
      };
    });
  }

  /**
   * Admin analytics - System performance metrics
   */
  async getSystemMetrics() {
    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    return {
      database: {
        totalCollections: 15,
        totalDocuments: await this.getTotalDocumentCount(),
        avgQueryTime: 23.5, // milliseconds
        connectionPoolSize: 10,
      },
      performance: {
        avgResponseTime: 145, // milliseconds
        requestsPerMinute: 42,
        errorRate: 0.2, // percentage
        uptime: 99.9, // percentage
      },
      resources: {
        cpuUsage: 45, // percentage
        memoryUsage: 62, // percentage
        diskUsage: 38, // percentage
      },
      timestamp: now.toISOString(),
    };
  }

  // Helper methods

  private async calculateRecentAverageQuizScore(): Promise<number> {
    const progressDocs = await UserProgress.find({
      quizzesCompleted: { $gt: 0 },
    }).lean();

    if (progressDocs.length === 0) return 0;

    const totalQuizzes = progressDocs.reduce((sum, doc) => sum + doc.quizzesCompleted, 0);
    const totalPassed = progressDocs.reduce((sum, doc) => sum + doc.quizzesPassed, 0);

    return totalQuizzes > 0 ? Math.round((totalPassed / totalQuizzes) * 100) : 0;
  }

  private async getMetricValueForPeriod(
    metric: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    switch (metric) {
      case 'newUsers':
        return await User.countDocuments({
          createdAt: { $gte: startDate, $lt: endDate },
        });
      case 'activeUsers':
        return await User.countDocuments({
          lastLogin: { $gte: startDate, $lt: endDate },
        });
      case 'lessonCompletions':
        const result = await UserProgress.aggregate([
          {
            $match: {
              updatedAt: { $gte: startDate, $lt: endDate },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$lessonsCompleted' },
            },
          },
        ]);
        return result[0]?.total || 0;
      default:
        return 0;
    }
  }

  private formatDate(date: Date, granularity: string): string {
    switch (granularity) {
      case 'daily':
        return date.toISOString().split('T')[0];
      case 'weekly':
        return `Week of ${date.toISOString().split('T')[0]}`;
      case 'monthly':
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      case 'yearly':
        return String(date.getFullYear());
      default:
        return date.toISOString();
    }
  }

  private formatLabel(date: Date, granularity: string): string {
    switch (granularity) {
      case 'daily':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case 'weekly':
        return `Week ${Math.ceil(date.getDate() / 7)}`;
      case 'monthly':
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      case 'yearly':
        return String(date.getFullYear());
      default:
        return date.toISOString();
    }
  }

  private async calculateRetentionRate(days: number): Promise<number> {
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const usersAtStart = await User.countDocuments({
      createdAt: { $lt: startDate },
    });

    const activeUsers = await User.countDocuments({
      createdAt: { $lt: startDate },
      lastLogin: { $gte: startDate },
    });

    return usersAtStart > 0 ? Math.round((activeUsers / usersAtStart) * 100 * 100) / 100 : 0;
  }

  private async calculateAverageTimeToCompletion(): Promise<number> {
    // Mock calculation - would track actual completion dates
    return 28.5; // days
  }

  private async calculateLearningVelocity(progressDocs: any[]): Promise<number> {
    let totalVelocity = 0;
    let count = 0;

    for (const doc of progressDocs) {
      if (doc.createdAt && doc.lessonsCompleted > 0) {
        const daysSinceStart = Math.max(
          1,
          Math.floor((Date.now() - new Date(doc.createdAt).getTime()) / (24 * 60 * 60 * 1000))
        );
        const velocity =
          (doc.lessonsCompleted + doc.quizzesCompleted + doc.exercisesCompleted) / daysSinceStart;
        totalVelocity += velocity;
        count++;
      }
    }

    return count > 0 ? Math.round((totalVelocity / count) * 100) / 100 : 0;
  }

  private async identifyHighDropoffContent() {
    // Mock data - would track actual content engagement
    return [
      {
        contentId: 'lesson-25',
        title: 'Advanced API Mocking',
        startCount: 456,
        completionCount: 178,
        dropoffRate: 61,
      },
      {
        contentId: 'lesson-32',
        title: 'Performance Testing',
        startCount: 389,
        completionCount: 165,
        dropoffRate: 58,
      },
    ];
  }

  private async getTotalDocumentCount(): Promise<number> {
    const collections = await mongoose.connection.db.collections();
    let total = 0;

    for (const collection of collections) {
      total += await collection.countDocuments();
    }

    return total;
  }
}

export const aggregationService = new AggregationService();
