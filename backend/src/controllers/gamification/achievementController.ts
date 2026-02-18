import { Request, Response } from 'express';
import { GamificationService } from '../../services/gamificationService';
import { UserGamification } from '../../models/UserGamification';
import { Achievement } from '../../models/Achievement';
import mongoose from 'mongoose';

export const achievementController = {
  // Get user progress
  getUserProgress: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      let userGamification = await UserGamification.findOne({ userId: new mongoose.Types.ObjectId(userId) });

      if (!userGamification) {
        userGamification = await GamificationService.initializeUserGamification(
          new mongoose.Types.ObjectId(userId)
        );
      }

      res.json({
        success: true,
        data: {
          totalXP: userGamification.totalXP,
          currentLevel: userGamification.currentLevel,
          xpToNextLevel: userGamification.xpToNextLevel,
          streak: {
            currentStreak: userGamification.currentStreak,
            longestStreak: userGamification.longestStreak,
            lastActivityDate: userGamification.lastActivityDate,
          },
          coins: userGamification.coins,
          lessonsCompleted: userGamification.lessonsCompleted,
          quizzesCompleted: userGamification.quizzesCompleted,
          quizzesPassed: userGamification.quizzesPassed,
          perfectQuizzes: userGamification.perfectQuizzes,
          exercisesCompleted: userGamification.exercisesCompleted,
          flashcardsReviewed: userGamification.flashcardsReviewed,
          masteredFlashcards: userGamification.masteredFlashcards,
          totalStudyTime: userGamification.totalStudyTime,
          xpBreakdown: userGamification.xpBreakdown,
          dailyXPGoal: userGamification.dailyXPGoal,
          dailyXPEarned: userGamification.dailyXPEarned,
        },
      });
    } catch (error: any) {
      console.error('Error getting user progress:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Get all achievements with user progress
  getAchievements: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const userGamification = await UserGamification.findOne({ userId: new mongoose.Types.ObjectId(userId) });
      const allAchievements = await Achievement.find().sort({ tier: 1, category: 1 });

      const achievementsWithProgress = allAchievements.map((achievement) => {
        const unlocked = userGamification?.unlockedAchievements.find(
          (a) => a.achievementId === achievement.achievementId
        );

        // Calculate progress for achievements not yet unlocked
        let progress = 0;
        let percentage = 0;

        if (!unlocked && userGamification) {
          switch (achievement.requirement.type) {
            case 'lessons_completed':
              progress = userGamification.lessonsCompleted;
              break;
            case 'quiz_passed_high_score':
            case 'quiz_passed':
              progress = userGamification.quizzesPassed;
              break;
            case 'perfect_quizzes':
              progress = userGamification.perfectQuizzes;
              break;
            case 'exercises_completed':
              progress = userGamification.exercisesCompleted;
              break;
            case 'flashcards_reviewed':
              progress = userGamification.flashcardsReviewed;
              break;
            case 'mastered_flashcards':
              progress = userGamification.masteredFlashcards;
              break;
            case 'helpful_answers':
              progress = userGamification.helpfulAnswers;
              break;
            case 'streak_days':
              progress = userGamification.currentStreak;
              break;
            case 'level_reached':
              progress = userGamification.currentLevel;
              break;
            case 'total_xp':
              progress = userGamification.totalXP;
              break;
            case 'total_coins_earned':
              progress = userGamification.totalCoinsEarned;
              break;
            case 'achievements_unlocked':
              progress = userGamification.unlockedAchievements.length;
              break;
            case 'quests_completed':
              progress = userGamification.completedQuests.length;
              break;
            case 'forum_posts':
              progress = userGamification.forumPosts;
              break;
            case 'total_study_time':
              progress = userGamification.totalStudyTime;
              break;
          }

          percentage = Math.min(100, Math.floor((progress / achievement.requirement.value) * 100));
        }

        return {
          ...achievement.toJSON(),
          unlocked: !!unlocked,
          unlockedAt: unlocked?.unlockedAt,
          progress: unlocked ? achievement.requirement.value : progress,
          percentage: unlocked ? 100 : percentage,
          seen: unlocked?.seen || false,
        };
      });

      res.json({ success: true, data: achievementsWithProgress });
    } catch (error: any) {
      console.error('Error getting achievements:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Get unseen achievements
  getUnseenAchievements: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const userGamification = await UserGamification.findOne({ userId: new mongoose.Types.ObjectId(userId) });
      if (!userGamification) {
        return res.json({ success: true, data: [] });
      }

      const unseenAchievementIds = userGamification.unlockedAchievements
        .filter((a) => !a.seen)
        .map((a) => a.achievementId);

      const achievements = await Achievement.find({ achievementId: { $in: unseenAchievementIds } });

      res.json({ success: true, data: achievements });
    } catch (error: any) {
      console.error('Error getting unseen achievements:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Mark achievements as seen
  markAchievementsSeen: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      const { achievementIds } = req.body;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const userGamification = await UserGamification.findOne({ userId: new mongoose.Types.ObjectId(userId) });
      if (!userGamification) {
        return res.status(404).json({ success: false, message: 'User gamification not found' });
      }

      for (const achievementId of achievementIds) {
        const achievement = userGamification.unlockedAchievements.find(
          (a) => a.achievementId === achievementId
        );
        if (achievement) {
          achievement.seen = true;
        }
      }

      await userGamification.save();

      res.json({ success: true, message: 'Achievements marked as seen' });
    } catch (error: any) {
      console.error('Error marking achievements as seen:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Track activity
  trackActivity: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      const { activityType, data } = req.body;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const result = await GamificationService.trackActivity(
        new mongoose.Types.ObjectId(userId),
        activityType,
        data
      );

      res.json({
        success: true,
        data: {
          xpAwarded: result.xpAwarded,
          coinsAwarded: result.coinsAwarded,
          leveledUp: result.leveledUp,
          newLevel: result.newLevel,
          newAchievements: result.newAchievements,
          progress: {
            totalXP: result.userGamification.totalXP,
            currentLevel: result.userGamification.currentLevel,
            xpToNextLevel: result.userGamification.xpToNextLevel,
            coins: result.userGamification.coins,
            currentStreak: result.userGamification.currentStreak,
          },
        },
      });
    } catch (error: any) {
      console.error('Error tracking activity:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
};
