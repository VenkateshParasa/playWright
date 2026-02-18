import { Request, Response } from 'express';
import { Competition } from '../../models/Competition';
import { UserGamification } from '../../models/UserGamification';
import mongoose from 'mongoose';

export const competitionController = {
  // Get all competitions
  getAllCompetitions: async (req: Request, res: Response) => {
    try {
      const { status, type } = req.query;
      const filter: any = {};

      if (status) filter.status = status;
      if (type) filter.type = type;

      const competitions = await Competition.find(filter).sort({ startDate: -1 });

      res.json({ success: true, data: competitions });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Get active competitions
  getActiveCompetitions: async (req: Request, res: Response) => {
    try {
      const now = new Date();
      const competitions = await Competition.find({
        status: 'active',
        startDate: { $lte: now },
        endDate: { $gte: now },
      });

      res.json({ success: true, data: competitions });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Join competition
  joinCompetition: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      const { competitionId } = req.params;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const competition = await Competition.findOne({ competitionId });
      if (!competition) {
        return res.status(404).json({ success: false, message: 'Competition not found' });
      }

      // Check if competition is active
      if (competition.status !== 'active' && competition.status !== 'upcoming') {
        return res.status(400).json({ success: false, message: 'Competition is not active' });
      }

      // Check if already joined
      const alreadyJoined = competition.participants.some(
        (p) => p.userId.toString() === userId
      );

      if (alreadyJoined) {
        return res.status(400).json({ success: false, message: 'Already joined' });
      }

      // Check entry fee
      if (competition.rules.entryFee) {
        const userGamification = await UserGamification.findOne({ userId: new mongoose.Types.ObjectId(userId) });
        if (!userGamification || userGamification.coins < competition.rules.entryFee) {
          return res.status(400).json({ success: false, message: 'Insufficient coins' });
        }

        userGamification.coins -= competition.rules.entryFee;
        userGamification.totalCoinsSpent += competition.rules.entryFee;
        await userGamification.save();
      }

      // Add participant
      competition.participants.push({
        userId: new mongoose.Types.ObjectId(userId),
        score: 0,
        joinedAt: new Date(),
      });

      await competition.save();

      // Add to user's active competitions
      const userGamification = await UserGamification.findOne({ userId: new mongoose.Types.ObjectId(userId) });
      if (userGamification) {
        userGamification.activeCompetitions.push({
          competitionId: competition.competitionId,
          joinedAt: new Date(),
          currentScore: 0,
        });
        await userGamification.save();
      }

      res.json({ success: true, message: 'Joined competition', data: competition });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Get competition details
  getCompetitionDetails: async (req: Request, res: Response) => {
    try {
      const { competitionId } = req.params;
      const competition = await Competition.findOne({ competitionId }).populate(
        'participants.userId',
        'firstName lastName avatar'
      );

      if (!competition) {
        return res.status(404).json({ success: false, message: 'Competition not found' });
      }

      res.json({ success: true, data: competition });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Get competition leaderboard
  getCompetitionLeaderboard: async (req: Request, res: Response) => {
    try {
      const { competitionId } = req.params;
      const competition = await Competition.findOne({ competitionId });

      if (!competition) {
        return res.status(404).json({ success: false, message: 'Competition not found' });
      }

      res.json({ success: true, data: competition.leaderboard });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Get user's competitions
  getUserCompetitions: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const userGamification = await UserGamification.findOne({ userId: new mongoose.Types.ObjectId(userId) });
      if (!userGamification) {
        return res.json({ success: true, data: { active: [], history: [] } });
      }

      const activeCompetitionIds = userGamification.activeCompetitions.map((c) => c.competitionId);
      const activeCompetitions = await Competition.find({
        competitionId: { $in: activeCompetitionIds },
      });

      res.json({
        success: true,
        data: {
          active: activeCompetitions,
          history: userGamification.competitionHistory,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};
