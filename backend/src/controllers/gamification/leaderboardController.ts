import { Request, Response } from 'express';
import { GamificationService } from '../../services/gamificationService';
import mongoose from 'mongoose';

export const leaderboardController = {
  getLeaderboard: async (req: Request, res: Response) => {
    try {
      const { type = 'xp', limit = 100, timeFrame } = req.query;
      const leaderboard = await GamificationService.getLeaderboard(
        type as 'xp' | 'level' | 'streak',
        parseInt(limit as string),
        timeFrame as 'daily' | 'weekly' | 'monthly' | undefined
      );
      res.json({ success: true, data: leaderboard });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getUserRank: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const { type = 'xp' } = req.query;
      const fullLeaderboard = await GamificationService.getLeaderboard(
        type as 'xp' | 'level' | 'streak',
        10000
      );

      const userRank = fullLeaderboard.findIndex((entry) => entry.user.id.toString() === userId);

      res.json({
        success: true,
        data: {
          rank: userRank === -1 ? null : userRank + 1,
          totalUsers: fullLeaderboard.length,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};
