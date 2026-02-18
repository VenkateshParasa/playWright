import { Request, Response } from 'express';
import { User } from '../../models/User.js';

export class UserApiController {
  /**
   * Get current user profile
   * GET /api/v1/users/me
   */
  static async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.apiUserId!;

      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'User not found',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve user',
        },
      });
    }
  }

  /**
   * Update current user profile
   * PATCH /api/v1/users/me
   */
  static async updateCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.apiUserId!;
      const { firstName, lastName, avatar, settings } = req.body;

      const allowedUpdates: any = {};
      if (firstName) allowedUpdates.firstName = firstName;
      if (lastName) allowedUpdates.lastName = lastName;
      if (avatar) allowedUpdates.avatar = avatar;
      if (settings) allowedUpdates.settings = settings;

      const user = await User.findByIdAndUpdate(userId, { $set: allowedUpdates }, { new: true });

      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'User not found',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update user',
        },
      });
    }
  }

  /**
   * Get a user by ID (public info only)
   * GET /api/v1/users/:userId
   */
  static async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId).select('firstName lastName avatar role');
      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'User not found',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve user',
        },
      });
    }
  }
}
