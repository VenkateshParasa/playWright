import { Request, Response } from 'express';
import { Reward } from '../../models/Reward';
import { UserGamification } from '../../models/UserGamification';
import { GamificationService } from '../../services/gamificationService';
import mongoose from 'mongoose';

export const rewardController = {
  // Get all rewards in shop
  getAllRewards: async (req: Request, res: Response) => {
    try {
      const { type, rarity } = req.query;
      const filter: any = {};

      if (type) filter.type = type;
      if (rarity) filter.rarity = rarity;

      const now = new Date();
      const rewards = await Reward.find({
        ...filter,
        $or: [{ availableUntil: { $exists: false } }, { availableUntil: { $gte: now } }],
      });

      res.json({ success: true, data: rewards });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Purchase reward
  purchaseReward: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      const { rewardId } = req.params;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const result = await GamificationService.purchaseReward(
        new mongoose.Types.ObjectId(userId),
        rewardId
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Get user inventory
  getUserInventory: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const userGamification = await UserGamification.findOne({ userId: new mongoose.Types.ObjectId(userId) });
      if (!userGamification) {
        return res.status(404).json({ success: false, message: 'User gamification not found' });
      }

      const rewardIds = userGamification.inventory.map((item) => item.rewardId);
      const rewards = await Reward.find({ rewardId: { $in: rewardIds } });

      const inventory = userGamification.inventory.map((item) => {
        const reward = rewards.find((r) => r.rewardId === item.rewardId);
        return {
          ...item,
          reward: reward?.toJSON(),
        };
      });

      res.json({
        success: true,
        data: {
          inventory,
          equippedItems: userGamification.equippedItems,
          activeBoosters: userGamification.activeBoosters,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Equip item
  equipItem: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      const { rewardId, slot } = req.body;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const userGamification = await UserGamification.findOne({ userId: new mongoose.Types.ObjectId(userId) });
      if (!userGamification) {
        return res.status(404).json({ success: false, message: 'User gamification not found' });
      }

      // Check if user owns the item
      const ownedItem = userGamification.inventory.find((item) => item.rewardId === rewardId);
      if (!ownedItem) {
        return res.status(400).json({ success: false, message: 'Item not owned' });
      }

      // Unequip previous item in slot
      userGamification.inventory.forEach((item) => {
        const reward = item.rewardId;
        if (userGamification.equippedItems[slot as keyof typeof userGamification.equippedItems] === reward) {
          item.isEquipped = false;
        }
      });

      // Equip new item
      ownedItem.isEquipped = true;
      userGamification.equippedItems[slot as keyof typeof userGamification.equippedItems] = rewardId;

      await userGamification.save();

      res.json({ success: true, message: 'Item equipped', data: userGamification.equippedItems });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Activate booster
  activateBooster: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      const { rewardId } = req.params;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const userGamification = await UserGamification.findOne({ userId: new mongoose.Types.ObjectId(userId) });
      if (!userGamification) {
        return res.status(404).json({ success: false, message: 'User gamification not found' });
      }

      const ownedItem = userGamification.inventory.find((item) => item.rewardId === rewardId);
      if (!ownedItem) {
        return res.status(400).json({ success: false, message: 'Booster not owned' });
      }

      const reward = await Reward.findOne({ rewardId });
      if (!reward || reward.type !== 'booster') {
        return res.status(400).json({ success: false, message: 'Invalid booster' });
      }

      // Check if booster already active
      const alreadyActive = userGamification.activeBoosters.some(
        (b) => b.rewardId === rewardId && new Date(b.expiresAt) > new Date()
      );

      if (alreadyActive) {
        return res.status(400).json({ success: false, message: 'Booster already active' });
      }

      // Activate booster
      userGamification.activeBoosters.push({
        rewardId,
        multiplier: reward.metadata?.boosterMultiplier || 1,
        expiresAt: new Date(Date.now() + (reward.metadata?.boosterDuration || 24) * 60 * 60 * 1000),
        activatedAt: new Date(),
      });

      await userGamification.save();

      res.json({ success: true, message: 'Booster activated', data: userGamification.activeBoosters });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};
