import { UserGamification, IUserGamification } from '../models/UserGamification';
import { Achievement, IAchievement } from '../models/Achievement';
import { Quest, IQuest } from '../models/Quest';
import { Competition, ICompetition } from '../models/Competition';
import { Reward, IReward } from '../models/Reward';
import { User } from '../models/User';
import mongoose from 'mongoose';

// XP values for different activities
export const XP_VALUES = {
  LESSON_COMPLETED: 100,
  QUIZ_PASSED: 150,
  QUIZ_PERFECT: 250,
  EXERCISE_COMPLETED: 200,
  FLASHCARD_REVIEWED: 10,
  FLASHCARD_MASTERED: 50,
  DAILY_LOGIN: 25,
  STREAK_DAY: 50,
  HELP_USER: 50,
  FORUM_POST: 30,
  ACHIEVEMENT_BRONZE: 500,
  ACHIEVEMENT_SILVER: 1000,
  ACHIEVEMENT_GOLD: 2500,
  ACHIEVEMENT_PLATINUM: 5000,
};

// Coin values for different activities
export const COIN_VALUES = {
  LESSON_COMPLETED: 20,
  QUIZ_PASSED: 30,
  QUIZ_PERFECT: 50,
  EXERCISE_COMPLETED: 40,
  DAILY_LOGIN: 10,
  STREAK_DAY: 15,
  HELP_USER: 25,
};

export class GamificationService {
  /**
   * Calculate XP required for a given level
   */
  static calculateXPForLevel(level: number): number {
    // Exponential growth: base * (level ^ 1.5)
    return Math.floor(100 * Math.pow(level, 1.5));
  }

  /**
   * Calculate current level based on total XP
   */
  static calculateLevel(totalXP: number): { level: number; xpToNextLevel: number } {
    let level = 1;
    let xpRequired = 0;
    let xpForCurrentLevel = this.calculateXPForLevel(level);

    while (totalXP >= xpRequired + xpForCurrentLevel) {
      xpRequired += xpForCurrentLevel;
      level++;
      xpForCurrentLevel = this.calculateXPForLevel(level);
    }

    const xpToNextLevel = xpRequired + xpForCurrentLevel - totalXP;

    return { level, xpToNextLevel };
  }

  /**
   * Initialize gamification profile for a new user
   */
  static async initializeUserGamification(userId: mongoose.Types.ObjectId): Promise<IUserGamification> {
    const existing = await UserGamification.findOne({ userId });
    if (existing) {
      return existing;
    }

    const userGamification = new UserGamification({
      userId,
      totalXP: 0,
      currentLevel: 1,
      xpToNextLevel: this.calculateXPForLevel(1),
      coins: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: new Date(),
    });

    return await userGamification.save();
  }

  /**
   * Award XP to user and handle level-ups
   */
  static async awardXP(
    userId: mongoose.Types.ObjectId,
    xp: number,
    source: string,
    multiplier: number = 1
  ): Promise<{
    userGamification: IUserGamification;
    leveledUp: boolean;
    newLevel?: number;
    newAchievements: IAchievement[];
  }> {
    const userGamification = await UserGamification.findOne({ userId });
    if (!userGamification) {
      throw new Error('User gamification profile not found');
    }

    // Apply multiplier from active boosters
    const activeBooster = userGamification.activeBoosters.find(
      (b) => new Date(b.expiresAt) > new Date()
    );
    if (activeBooster) {
      multiplier *= activeBooster.multiplier;
    }

    const finalXP = Math.floor(xp * multiplier);
    const oldLevel = userGamification.currentLevel;

    userGamification.totalXP += finalXP;

    // Update XP breakdown
    const breakdownKey = source.split('_')[0] as keyof typeof userGamification.xpBreakdown;
    if (userGamification.xpBreakdown[breakdownKey] !== undefined) {
      userGamification.xpBreakdown[breakdownKey] += finalXP;
    } else {
      userGamification.xpBreakdown.other += finalXP;
    }

    // Calculate new level
    const { level, xpToNextLevel } = this.calculateLevel(userGamification.totalXP);
    userGamification.currentLevel = level;
    userGamification.xpToNextLevel = xpToNextLevel;

    await userGamification.save();

    const leveledUp = level > oldLevel;

    // Check for achievements
    const newAchievements = await this.checkAchievements(userId);

    return {
      userGamification,
      leveledUp,
      newLevel: leveledUp ? level : undefined,
      newAchievements,
    };
  }

  /**
   * Award coins to user
   */
  static async awardCoins(
    userId: mongoose.Types.ObjectId,
    coins: number
  ): Promise<IUserGamification> {
    const userGamification = await UserGamification.findOne({ userId });
    if (!userGamification) {
      throw new Error('User gamification profile not found');
    }

    userGamification.coins += coins;
    userGamification.totalCoinsEarned += coins;

    return await userGamification.save();
  }

  /**
   * Update streak for user
   */
  static async updateStreak(userId: mongoose.Types.ObjectId): Promise<{
    userGamification: IUserGamification;
    streakContinued: boolean;
    streakBroken: boolean;
    newAchievements: IAchievement[];
  }> {
    const userGamification = await UserGamification.findOne({ userId });
    if (!userGamification) {
      throw new Error('User gamification profile not found');
    }

    const lastActivity = new Date(userGamification.lastActivityDate);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

    let streakContinued = false;
    let streakBroken = false;

    if (daysDiff === 0) {
      // Same day, no change
      streakContinued = false;
    } else if (daysDiff === 1) {
      // Next day, continue streak
      userGamification.currentStreak += 1;
      streakContinued = true;

      // Award streak XP and coins
      await this.awardXP(userId, XP_VALUES.STREAK_DAY, 'streaks');
      await this.awardCoins(userId, COIN_VALUES.STREAK_DAY);

      if (userGamification.currentStreak > userGamification.longestStreak) {
        userGamification.longestStreak = userGamification.currentStreak;
      }
    } else if (daysDiff > 1) {
      // Streak broken - check for freeze
      if (userGamification.streakFreezes > 0) {
        // Use freeze
        userGamification.streakFreezes -= 1;
        streakContinued = true;
      } else {
        // Streak lost
        userGamification.currentStreak = 1;
        streakBroken = true;
      }
    }

    userGamification.lastActivityDate = now;
    await userGamification.save();

    const newAchievements = await this.checkAchievements(userId);

    return {
      userGamification,
      streakContinued,
      streakBroken,
      newAchievements,
    };
  }

  /**
   * Track activity and award appropriate XP/coins
   */
  static async trackActivity(
    userId: mongoose.Types.ObjectId,
    activityType: string,
    data?: any
  ): Promise<{
    userGamification: IUserGamification;
    xpAwarded: number;
    coinsAwarded: number;
    newAchievements: IAchievement[];
    leveledUp: boolean;
    newLevel?: number;
  }> {
    const userGamification = await UserGamification.findOne({ userId });
    if (!userGamification) {
      throw new Error('User gamification profile not found');
    }

    let xpAwarded = 0;
    let coinsAwarded = 0;

    // Update activity stats
    switch (activityType) {
      case 'lesson_completed':
        userGamification.lessonsCompleted += 1;
        xpAwarded = XP_VALUES.LESSON_COMPLETED;
        coinsAwarded = COIN_VALUES.LESSON_COMPLETED;
        break;

      case 'quiz_completed':
        userGamification.quizzesCompleted += 1;
        if (data?.passed) {
          userGamification.quizzesPassed += 1;
          if (data?.score === 100) {
            userGamification.perfectQuizzes += 1;
            xpAwarded = XP_VALUES.QUIZ_PERFECT;
            coinsAwarded = COIN_VALUES.QUIZ_PERFECT;
          } else {
            xpAwarded = XP_VALUES.QUIZ_PASSED;
            coinsAwarded = COIN_VALUES.QUIZ_PASSED;
          }
        }
        break;

      case 'exercise_completed':
        userGamification.exercisesCompleted += 1;
        xpAwarded = XP_VALUES.EXERCISE_COMPLETED;
        coinsAwarded = COIN_VALUES.EXERCISE_COMPLETED;
        break;

      case 'flashcard_reviewed':
        userGamification.flashcardsReviewed += data?.count || 1;
        xpAwarded = XP_VALUES.FLASHCARD_REVIEWED * (data?.count || 1);
        break;

      case 'flashcard_mastered':
        userGamification.masteredFlashcards += 1;
        xpAwarded = XP_VALUES.FLASHCARD_MASTERED;
        break;

      case 'help_user':
        userGamification.helpfulAnswers += 1;
        xpAwarded = XP_VALUES.HELP_USER;
        coinsAwarded = COIN_VALUES.HELP_USER;
        break;

      case 'forum_post':
        userGamification.forumPosts += 1;
        xpAwarded = XP_VALUES.FORUM_POST;
        break;

      case 'daily_login':
        xpAwarded = XP_VALUES.DAILY_LOGIN;
        coinsAwarded = COIN_VALUES.DAILY_LOGIN;
        break;

      case 'study_time':
        userGamification.totalStudyTime += data?.minutes || 0;
        break;
    }

    await userGamification.save();

    // Award XP and coins
    let result;
    if (xpAwarded > 0) {
      result = await this.awardXP(userId, xpAwarded, activityType);
    } else {
      result = {
        userGamification,
        leveledUp: false,
        newAchievements: await this.checkAchievements(userId),
      };
    }

    if (coinsAwarded > 0) {
      await this.awardCoins(userId, coinsAwarded);
    }

    // Update streak
    await this.updateStreak(userId);

    // Update quest progress
    await this.updateQuestProgress(userId, activityType, data);

    return {
      userGamification: result.userGamification,
      xpAwarded,
      coinsAwarded,
      newAchievements: result.newAchievements,
      leveledUp: result.leveledUp,
      newLevel: result.newLevel,
    };
  }

  /**
   * Check and unlock achievements
   */
  static async checkAchievements(userId: mongoose.Types.ObjectId): Promise<IAchievement[]> {
    const userGamification = await UserGamification.findOne({ userId });
    if (!userGamification) {
      return [];
    }

    const allAchievements = await Achievement.find();
    const newAchievements: IAchievement[] = [];

    for (const achievement of allAchievements) {
      // Skip if already unlocked
      const alreadyUnlocked = userGamification.unlockedAchievements.some(
        (a) => a.achievementId === achievement.achievementId
      );

      if (alreadyUnlocked) {
        continue;
      }

      // Check requirement
      let requirementMet = false;

      switch (achievement.requirement.type) {
        case 'lessons_completed':
          requirementMet = userGamification.lessonsCompleted >= achievement.requirement.value;
          break;

        case 'quiz_passed_high_score':
          requirementMet = userGamification.quizzesPassed >= achievement.requirement.value;
          break;

        case 'perfect_quizzes':
          requirementMet = userGamification.perfectQuizzes >= achievement.requirement.value;
          break;

        case 'exercises_completed':
          requirementMet = userGamification.exercisesCompleted >= achievement.requirement.value;
          break;

        case 'flashcards_reviewed':
          requirementMet = userGamification.flashcardsReviewed >= achievement.requirement.value;
          break;

        case 'mastered_flashcards':
          requirementMet = userGamification.masteredFlashcards >= achievement.requirement.value;
          break;

        case 'helpful_answers':
          requirementMet = userGamification.helpfulAnswers >= achievement.requirement.value;
          break;

        case 'streak_days':
          requirementMet = userGamification.currentStreak >= achievement.requirement.value;
          break;

        case 'level_reached':
          requirementMet = userGamification.currentLevel >= achievement.requirement.value;
          break;

        case 'total_xp':
          requirementMet = userGamification.totalXP >= achievement.requirement.value;
          break;

        case 'total_coins_earned':
          requirementMet = userGamification.totalCoinsEarned >= achievement.requirement.value;
          break;

        case 'achievements_unlocked':
          requirementMet =
            userGamification.unlockedAchievements.length >= achievement.requirement.value;
          break;

        case 'quests_completed':
          requirementMet =
            userGamification.completedQuests.length >= achievement.requirement.value;
          break;

        case 'forum_posts':
          requirementMet = userGamification.forumPosts >= achievement.requirement.value;
          break;

        case 'total_study_time':
          requirementMet = userGamification.totalStudyTime >= achievement.requirement.value;
          break;
      }

      if (requirementMet) {
        // Unlock achievement
        userGamification.unlockedAchievements.push({
          achievementId: achievement.achievementId,
          unlockedAt: new Date(),
          seen: false,
        });

        // Award XP and coins
        await this.awardXP(userId, achievement.xpReward, 'achievements');
        await this.awardCoins(userId, achievement.coinReward);

        newAchievements.push(achievement);
      }
    }

    if (newAchievements.length > 0) {
      await userGamification.save();
    }

    return newAchievements;
  }

  /**
   * Update quest progress
   */
  static async updateQuestProgress(
    userId: mongoose.Types.ObjectId,
    activityType: string,
    data?: any
  ): Promise<void> {
    const userGamification = await UserGamification.findOne({ userId });
    if (!userGamification) {
      return;
    }

    for (const activeQuest of userGamification.activeQuests) {
      const quest = await Quest.findOne({ questId: activeQuest.questId });
      if (!quest) continue;

      for (let i = 0; i < quest.requirements.length; i++) {
        const requirement = quest.requirements[i];
        let progressMade = false;

        // Check if activity matches requirement
        if (
          (requirement.type === 'complete_lessons' && activityType === 'lesson_completed') ||
          (requirement.type === 'complete_quiz' && activityType === 'quiz_completed') ||
          (requirement.type === 'complete_exercise' && activityType === 'exercise_completed') ||
          (requirement.type === 'review_cards' && activityType === 'flashcard_reviewed') ||
          (requirement.type === 'answer_question' && activityType === 'help_user') ||
          (requirement.type === 'forum_post' && activityType === 'forum_post')
        ) {
          progressMade = true;
        }

        if (progressMade) {
          if (!activeQuest.progress[i]) {
            activeQuest.progress[i] = {
              requirementIndex: i,
              currentValue: 0,
              targetValue: requirement.value,
            };
          }

          activeQuest.progress[i].currentValue += data?.count || 1;

          // Check if quest completed
          const allRequirementsMet = activeQuest.progress.every(
            (p) => p.currentValue >= p.targetValue
          );

          if (allRequirementsMet) {
            // Complete quest
            userGamification.completedQuests.push({
              questId: quest.questId,
              completedAt: new Date(),
            });

            // Remove from active quests
            userGamification.activeQuests = userGamification.activeQuests.filter(
              (q) => q.questId !== quest.questId
            );

            // Award rewards
            await this.awardXP(userId, quest.rewards.xp, 'quests');
            await this.awardCoins(userId, quest.rewards.coins);

            // Award items if any
            if (quest.rewards.items && quest.rewards.items.length > 0) {
              for (const itemId of quest.rewards.items) {
                userGamification.inventory.push({
                  rewardId: itemId,
                  acquiredAt: new Date(),
                  source: 'quest',
                  isEquipped: false,
                });
              }
            }
          }
        }
      }
    }

    await userGamification.save();
  }

  /**
   * Get leaderboard
   */
  static async getLeaderboard(
    type: 'xp' | 'level' | 'streak' = 'xp',
    limit: number = 100,
    timeFrame?: 'daily' | 'weekly' | 'monthly'
  ): Promise<any[]> {
    const sortField = type === 'xp' ? 'totalXP' : type === 'level' ? 'currentLevel' : 'currentStreak';

    let query: any = { showOnLeaderboard: true };

    // Apply time frame filter if needed
    if (timeFrame) {
      const now = new Date();
      let startDate: Date;

      switch (timeFrame) {
        case 'daily':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'weekly':
          const dayOfWeek = now.getDay();
          startDate = new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'monthly':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
      }

      query.updatedAt = { $gte: startDate };
    }

    const leaderboard = await UserGamification.find(query)
      .sort({ [sortField]: -1 })
      .limit(limit)
      .populate('userId', 'firstName lastName avatar');

    return leaderboard.map((entry, index) => ({
      rank: index + 1,
      user: {
        id: entry.userId._id,
        name: `${entry.userId.firstName} ${entry.userId.lastName}`,
        avatar: entry.userId.avatar,
      },
      totalXP: entry.totalXP,
      currentLevel: entry.currentLevel,
      currentStreak: entry.currentStreak,
      achievementsCount: entry.unlockedAchievements.length,
    }));
  }

  /**
   * Purchase reward from shop
   */
  static async purchaseReward(
    userId: mongoose.Types.ObjectId,
    rewardId: string
  ): Promise<{ success: boolean; message: string; userGamification?: IUserGamification }> {
    const userGamification = await UserGamification.findOne({ userId });
    const reward = await Reward.findOne({ rewardId });

    if (!userGamification) {
      return { success: false, message: 'User gamification profile not found' };
    }

    if (!reward) {
      return { success: false, message: 'Reward not found' };
    }

    // Check requirements
    if (reward.requirementLevel && userGamification.currentLevel < reward.requirementLevel) {
      return { success: false, message: 'Level requirement not met' };
    }

    if (reward.requirementAchievements && reward.requirementAchievements.length > 0) {
      const hasAllAchievements = reward.requirementAchievements.every((achId) =>
        userGamification.unlockedAchievements.some((a) => a.achievementId === achId)
      );

      if (!hasAllAchievements) {
        return { success: false, message: 'Achievement requirements not met' };
      }
    }

    // Check if user has enough coins
    if (userGamification.coins < reward.cost) {
      return { success: false, message: 'Not enough coins' };
    }

    // Check stock for limited items
    if (reward.isLimited && reward.stock !== undefined && reward.stock <= 0) {
      return { success: false, message: 'Out of stock' };
    }

    // Check availability dates
    if (reward.availableFrom && new Date() < reward.availableFrom) {
      return { success: false, message: 'Not yet available' };
    }

    if (reward.availableUntil && new Date() > reward.availableUntil) {
      return { success: false, message: 'No longer available' };
    }

    // Deduct coins
    userGamification.coins -= reward.cost;
    userGamification.totalCoinsSpent += reward.cost;

    // Add to inventory
    userGamification.inventory.push({
      rewardId: reward.rewardId,
      acquiredAt: new Date(),
      source: 'purchase',
      isEquipped: false,
    });

    // Handle boosters
    if (reward.type === 'booster' && reward.metadata?.boosterMultiplier) {
      userGamification.activeBoosters.push({
        rewardId: reward.rewardId,
        multiplier: reward.metadata.boosterMultiplier,
        expiresAt: new Date(Date.now() + reward.metadata.boosterDuration! * 60 * 60 * 1000),
        activatedAt: new Date(),
      });
    }

    // Handle streak freezes
    if (reward.type === 'skip' && reward.metadata?.skipCount && rewardId.includes('freeze')) {
      userGamification.streakFreezes += reward.metadata.skipCount;
    }

    await userGamification.save();

    // Update stock for limited items
    if (reward.isLimited && reward.stock !== undefined) {
      reward.stock -= 1;
      await reward.save();
    }

    return { success: true, message: 'Reward purchased successfully', userGamification };
  }
}
