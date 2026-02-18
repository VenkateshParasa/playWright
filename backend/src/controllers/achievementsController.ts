import { Request, Response } from 'express';
import { UserProgress, IUserProgress } from '../models/UserProgress.js';
import { User } from '../models/User.js';
import { achievements, getLevelFromXP, getXPForNextLevel, generateDailyChallenges } from '../utils/achievements.js';

// Get user progress
export const getUserProgress = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    let userProgress = await UserProgress.findOne({ userId });

    // Create if doesn't exist
    if (!userProgress) {
      userProgress = await UserProgress.create({ userId });
    }

    return res.status(200).json({
      success: true,
      data: userProgress,
    });
  } catch (error) {
    console.error('Get user progress error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user progress',
    });
  }
};

// Get achievements with progress
export const getAchievements = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    let userProgress = await UserProgress.findOne({ userId });

    if (!userProgress) {
      userProgress = await UserProgress.create({ userId });
    }

    const achievementsWithProgress = achievements.map((achievement) => {
      const unlocked = userProgress!.unlockedAchievements.find(
        (ua) => ua.achievementId === achievement.id
      );

      const progress = userProgress!.achievementProgress.get(achievement.id) || 0;

      return {
        ...achievement,
        unlocked: !!unlocked,
        unlockedAt: unlocked?.unlockedAt,
        progress,
        percentage: Math.min((progress / achievement.condition.target) * 100, 100),
      };
    });

    return res.status(200).json({
      success: true,
      data: achievementsWithProgress,
    });
  } catch (error) {
    console.error('Get achievements error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch achievements',
    });
  }
};

// Get unseen achievement notifications
export const getUnseenAchievements = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const userProgress = await UserProgress.findOne({ userId });

    if (!userProgress) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    const unseenAchievements = userProgress.unlockedAchievements
      .filter((ua) => !ua.notificationSeen)
      .map((ua) => {
        const achievement = achievements.find((a) => a.id === ua.achievementId);
        return {
          ...achievement,
          unlockedAt: ua.unlockedAt,
        };
      });

    return res.status(200).json({
      success: true,
      data: unseenAchievements,
    });
  } catch (error) {
    console.error('Get unseen achievements error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch unseen achievements',
    });
  }
};

// Mark achievement notifications as seen
export const markAchievementsSeen = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { achievementIds } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const userProgress = await UserProgress.findOne({ userId });

    if (!userProgress) {
      return res.status(404).json({
        success: false,
        message: 'User progress not found',
      });
    }

    userProgress.unlockedAchievements.forEach((ua) => {
      if (achievementIds.includes(ua.achievementId)) {
        ua.notificationSeen = true;
      }
    });

    await userProgress.save();

    return res.status(200).json({
      success: true,
      message: 'Achievement notifications marked as seen',
    });
  } catch (error) {
    console.error('Mark achievements seen error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark achievements as seen',
    });
  }
};

// Get leaderboard
export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const { limit = 10, type = 'xp' } = req.query;
    const limitNum = parseInt(limit as string, 10);

    let sortField = {};
    if (type === 'xp') {
      sortField = { totalXP: -1 };
    } else if (type === 'level') {
      sortField = { currentLevel: -1, totalXP: -1 };
    } else if (type === 'streak') {
      sortField = { 'streak.currentStreak': -1 };
    }

    const topUsers = await UserProgress.find()
      .sort(sortField)
      .limit(limitNum)
      .populate('userId', 'firstName lastName avatar');

    const leaderboard = topUsers.map((up, index) => ({
      rank: index + 1,
      user: {
        id: up.userId,
        name: (up.userId as any).firstName + ' ' + (up.userId as any).lastName,
        avatar: (up.userId as any).avatar,
      },
      totalXP: up.totalXP,
      currentLevel: up.currentLevel,
      currentStreak: up.streak.currentStreak,
      achievementsCount: up.unlockedAchievements.length,
    }));

    return res.status(200).json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard',
    });
  }
};

// Get daily challenges
export const getDailyChallenges = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    let userProgress = await UserProgress.findOne({ userId });

    if (!userProgress) {
      userProgress = await UserProgress.create({ userId });
    }

    const today = new Date().toISOString().split('T')[0];
    let todaysChallenges = userProgress.dailyChallenges.find((dc) => dc.date === today);

    // Generate new challenges if not exist
    if (!todaysChallenges) {
      const challenges = generateDailyChallenges();
      todaysChallenges = {
        date: today,
        challenges: challenges.map((c) => ({
          challengeId: c.id,
          completed: false,
          progress: 0,
          target: c.target,
        })),
        allCompleted: false,
      };

      userProgress.dailyChallenges.push(todaysChallenges);
      await userProgress.save();
    }

    const challengesWithDetails = todaysChallenges.challenges.map((c) => {
      const challengeDef = generateDailyChallenges().find((cd) => cd.id === c.challengeId);
      return {
        ...challengeDef,
        ...c,
        current: c.progress,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        challenges: challengesWithDetails,
        allCompleted: todaysChallenges.allCompleted,
      },
    });
  } catch (error) {
    console.error('Get daily challenges error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch daily challenges',
    });
  }
};

// Award XP
export const awardXP = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { amount, reason } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid XP amount',
      });
    }

    let userProgress = await UserProgress.findOne({ userId });

    if (!userProgress) {
      userProgress = await UserProgress.create({ userId });
    }

    const oldLevel = userProgress.currentLevel;
    userProgress.totalXP += amount;
    const newLevel = getLevelFromXP(userProgress.totalXP);
    userProgress.currentLevel = newLevel;

    await userProgress.save();

    const leveledUp = newLevel > oldLevel;

    return res.status(200).json({
      success: true,
      data: {
        xpAwarded: amount,
        totalXP: userProgress.totalXP,
        currentLevel: newLevel,
        leveledUp,
        reason,
      },
    });
  } catch (error) {
    console.error('Award XP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to award XP',
    });
  }
};

// Update activity (lessons, quizzes, etc.)
export const updateActivity = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { activityType, data } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    let userProgress = await UserProgress.findOne({ userId });

    if (!userProgress) {
      userProgress = await UserProgress.create({ userId });
    }

    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();

    // Update activity based on type
    switch (activityType) {
      case 'lesson_completed':
        userProgress.lessonsCompleted += 1;
        await checkSpecialConditions(userProgress, hour, dayOfWeek);
        break;

      case 'quiz_completed':
        userProgress.quizzesCompleted += 1;
        if (data?.passed) {
          userProgress.quizzesPassed += 1;
        }
        if (data?.score === 100) {
          userProgress.perfectQuizzes += 1;
        }
        break;

      case 'exercise_completed':
        userProgress.exercisesCompleted += 1;
        break;

      case 'flashcard_reviewed':
        userProgress.flashcardsReviewed += data?.count || 1;
        if (data?.mastered) {
          userProgress.masteredFlashcards += 1;
        }
        break;

      case 'study_session':
        userProgress.totalStudyTime += data?.duration || 0;
        userProgress.studySessions.push({
          date: now,
          duration: data?.duration || 0,
          activitiesCount: data?.activitiesCount || 1,
        });
        break;
    }

    // Update streak
    await updateStreak(userProgress);

    // Update daily challenges
    await updateDailyChallenges(userProgress, activityType, data);

    // Check for achievement unlocks
    const newAchievements = await checkAchievements(userProgress);

    // Update last activity
    userProgress.lastActivityAt = now;

    await userProgress.save();

    return res.status(200).json({
      success: true,
      data: {
        progress: userProgress,
        newAchievements,
      },
    });
  } catch (error) {
    console.error('Update activity error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update activity',
    });
  }
};

// Helper functions
async function updateStreak(userProgress: IUserProgress) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastActivity = userProgress.streak.lastActivityDate
    ? new Date(
        userProgress.streak.lastActivityDate.getFullYear(),
        userProgress.streak.lastActivityDate.getMonth(),
        userProgress.streak.lastActivityDate.getDate()
      )
    : null;

  if (!lastActivity) {
    // First activity
    userProgress.streak.currentStreak = 1;
    userProgress.streak.longestStreak = 1;
    userProgress.streak.lastActivityDate = now;
  } else {
    const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) {
      // Same day, don't update streak
      return;
    } else if (daysDiff === 1) {
      // Consecutive day
      userProgress.streak.currentStreak += 1;
      userProgress.streak.longestStreak = Math.max(
        userProgress.streak.longestStreak,
        userProgress.streak.currentStreak
      );
      userProgress.streak.lastActivityDate = now;
    } else {
      // Streak broken
      userProgress.streak.currentStreak = 1;
      userProgress.streak.lastActivityDate = now;
    }
  }
}

async function checkSpecialConditions(userProgress: IUserProgress, hour: number, dayOfWeek: number) {
  // Night owl (10 PM - 2 AM)
  if (hour >= 22 || hour < 2) {
    userProgress.nightOwlCount += 1;
  }

  // Early bird (5 AM - 7 AM)
  if (hour >= 5 && hour < 7) {
    userProgress.earlyBirdCount += 1;
  }

  // Weekend warrior (Saturday or Sunday)
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    userProgress.weekendWarriorCount += 1;
  }
}

async function updateDailyChallenges(userProgress: IUserProgress, activityType: string, data: any) {
  const today = new Date().toISOString().split('T')[0];
  const todaysChallenges = userProgress.dailyChallenges.find((dc) => dc.date === today);

  if (!todaysChallenges) return;

  todaysChallenges.challenges.forEach((challenge) => {
    if (
      (activityType === 'lesson_completed' && challenge.challengeId === 'daily_lesson') ||
      (activityType === 'quiz_completed' && data?.passed && challenge.challengeId === 'daily_quiz') ||
      (activityType === 'flashcard_reviewed' && challenge.challengeId === 'daily_flashcards')
    ) {
      challenge.progress += activityType === 'flashcard_reviewed' ? data?.count || 1 : 1;
      challenge.completed = challenge.progress >= challenge.target;
    }
  });

  todaysChallenges.allCompleted = todaysChallenges.challenges.every((c) => c.completed);

  // Award XP if all challenges completed
  if (todaysChallenges.allCompleted) {
    userProgress.totalXP += 150; // Bonus XP for completing all daily challenges
  }
}

async function checkAchievements(userProgress: IUserProgress): Promise<any[]> {
  const newAchievements: any[] = [];

  for (const achievement of achievements) {
    // Skip if already unlocked
    if (userProgress.unlockedAchievements.some((ua) => ua.achievementId === achievement.id)) {
      continue;
    }

    let currentProgress = 0;
    let shouldUnlock = false;

    switch (achievement.condition.type) {
      case 'lessons_completed':
        currentProgress = userProgress.lessonsCompleted;
        shouldUnlock = currentProgress >= achievement.condition.target;
        break;

      case 'quizzes_passed':
        currentProgress = userProgress.quizzesPassed;
        shouldUnlock = currentProgress >= achievement.condition.target;
        break;

      case 'perfect_quizzes':
        currentProgress = userProgress.perfectQuizzes;
        shouldUnlock = currentProgress >= achievement.condition.target;
        break;

      case 'exercises_completed':
        currentProgress = userProgress.exercisesCompleted;
        shouldUnlock = currentProgress >= achievement.condition.target;
        break;

      case 'flashcards_reviewed':
        currentProgress = userProgress.flashcardsReviewed;
        shouldUnlock = currentProgress >= achievement.condition.target;
        break;

      case 'mastery_cards':
        currentProgress = userProgress.masteredFlashcards;
        shouldUnlock = currentProgress >= achievement.condition.target;
        break;

      case 'streak_days':
        currentProgress = userProgress.streak.currentStreak;
        shouldUnlock = currentProgress >= achievement.condition.target;
        break;

      case 'study_time':
        currentProgress = userProgress.totalStudyTime;
        shouldUnlock = currentProgress >= achievement.condition.target;
        break;

      case 'night_owl':
        currentProgress = userProgress.nightOwlCount;
        shouldUnlock = currentProgress >= achievement.condition.target;
        break;

      case 'early_bird':
        currentProgress = userProgress.earlyBirdCount;
        shouldUnlock = currentProgress >= achievement.condition.target;
        break;

      case 'weekend_warrior':
        currentProgress = userProgress.weekendWarriorCount;
        shouldUnlock = currentProgress >= achievement.condition.target;
        break;

      case 'level_reached':
        currentProgress = userProgress.currentLevel;
        shouldUnlock = currentProgress >= achievement.condition.target;
        break;

      case 'total_xp':
        currentProgress = userProgress.totalXP;
        shouldUnlock = currentProgress >= achievement.condition.target;
        break;
    }

    // Update progress
    userProgress.achievementProgress.set(achievement.id, currentProgress);

    // Unlock if conditions met
    if (shouldUnlock) {
      userProgress.unlockedAchievements.push({
        achievementId: achievement.id,
        unlockedAt: new Date(),
        notificationSeen: false,
      });
      userProgress.totalXP += achievement.xpReward;
      userProgress.currentLevel = getLevelFromXP(userProgress.totalXP);
      newAchievements.push({
        ...achievement,
        unlockedAt: new Date(),
      });
    }
  }

  return newAchievements;
}
