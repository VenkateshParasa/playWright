import { Request, Response } from 'express';
import { Quest } from '../../models/Quest';
import { UserGamification } from '../../models/UserGamification';
import { GamificationService } from '../../services/gamificationService';
import mongoose from 'mongoose';

export const questController = {
  // Get daily quests
  getDailyQuests: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const dailyQuests = await Quest.find({
        type: 'daily',
        isRepeatable: true,
      }).limit(3);

      const userGamification = await UserGamification.findOne({ userId: new mongoose.Types.ObjectId(userId) });

      const questsWithProgress = dailyQuests.map((quest) => {
        const activeQuest = userGamification?.activeQuests.find((q) => q.questId === quest.questId);
        const isCompleted = userGamification?.completedQuests.some(
          (q) => q.questId === quest.questId && new Date(q.completedAt) >= today
        );

        return {
          ...quest.toJSON(),
          progress: activeQuest?.progress || [],
          completed: isCompleted || false,
        };
      });

      res.json({ success: true, data: questsWithProgress });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Get all quests
  getAllQuests: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const { type, category } = req.query;
      const filter: any = {};

      if (type) filter.type = type;
      if (category) filter.category = category;

      const quests = await Quest.find(filter);
      const userGamification = await UserGamification.findOne({ userId: new mongoose.Types.ObjectId(userId) });

      const questsWithProgress = quests.map((quest) => {
        const activeQuest = userGamification?.activeQuests.find((q) => q.questId === quest.questId);
        const isCompleted = userGamification?.completedQuests.some((q) => q.questId === quest.questId);

        return {
          ...quest.toJSON(),
          progress: activeQuest?.progress || [],
          completed: isCompleted || false,
          active: !!activeQuest,
        };
      });

      res.json({ success: true, data: questsWithProgress });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Start quest
  startQuest: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      const { questId } = req.params;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const quest = await Quest.findOne({ questId });
      if (!quest) {
        return res.status(404).json({ success: false, message: 'Quest not found' });
      }

      const userGamification = await UserGamification.findOne({ userId: new mongoose.Types.ObjectId(userId) });
      if (!userGamification) {
        return res.status(404).json({ success: false, message: 'User gamification not found' });
      }

      // Check if already active
      const alreadyActive = userGamification.activeQuests.some((q) => q.questId === questId);
      if (alreadyActive) {
        return res.status(400).json({ success: false, message: 'Quest already active' });
      }

      // Check prerequisites
      if (quest.prerequisiteQuests && quest.prerequisiteQuests.length > 0) {
        const hasPrerequisites = quest.prerequisiteQuests.every((prereqId) =>
          userGamification.completedQuests.some((q) => q.questId === prereqId)
        );

        if (!hasPrerequisites) {
          return res.status(400).json({ success: false, message: 'Prerequisites not met' });
        }
      }

      // Add to active quests
      userGamification.activeQuests.push({
        questId: quest.questId,
        startedAt: new Date(),
        progress: quest.requirements.map((req, index) => ({
          requirementIndex: index,
          currentValue: 0,
          targetValue: req.value,
        })),
      });

      await userGamification.save();

      res.json({ success: true, message: 'Quest started', data: userGamification.activeQuests });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Get quest details
  getQuestDetails: async (req: Request, res: Response) => {
    try {
      const { questId } = req.params;
      const quest = await Quest.findOne({ questId });

      if (!quest) {
        return res.status(404).json({ success: false, message: 'Quest not found' });
      }

      res.json({ success: true, data: quest });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};
