import { Response } from 'express';
import { User } from '../models/User.js';
import { AuthRequest } from '../middleware/auth.js';

/**
 * Get user settings
 */
export const getSettings = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Return user settings
    res.status(200).json({
      success: true,
      settings: user.settings || {
        theme: 'light',
        language: 'en',
        notifications: {
          srsReviewsDue: true,
          newLessonAvailable: true,
          quizDeadline: true,
          achievementUnlocked: true,
          feedbackReceived: true,
          emailNotifications: true,
          pushNotifications: false,
          sound: true,
        },
        study: {
          dailyReviewLimit: 50,
          studyReminders: true,
          reminderTime: '09:00',
          autoPlayVideos: false,
          showHints: true,
          keyboardShortcuts: true,
        },
        privacy: {
          showProfile: true,
          shareProgress: true,
          allowAnalytics: true,
        },
      },
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get settings',
    });
  }
};

/**
 * Update user settings
 */
export const updateSettings = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { theme, language, notifications, study, privacy } = req.body;

    const user = await User.findById(req.user?.userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Initialize settings if not exists
    if (!user.settings) {
      user.settings = {};
    }

    // Update settings
    if (theme) user.settings.theme = theme;
    if (language) user.settings.language = language;
    if (notifications) {
      user.settings.notifications = {
        ...user.settings.notifications,
        ...notifications,
      };
    }
    if (study) {
      user.settings.study = {
        ...user.settings.study,
        ...study,
      };
    }
    if (privacy) {
      user.settings.privacy = {
        ...user.settings.privacy,
        ...privacy,
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      settings: user.settings,
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings',
    });
  }
};

/**
 * Sync settings (alias for update)
 */
export const syncSettings = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  return updateSettings(req, res);
};

/**
 * Export all user data
 */
export const exportAllData = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // TODO: Gather all user data from different collections
    // For now, return basic user data and settings
    const exportData = {
      profile: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
      settings: user.settings,
      // TODO: Add progress data
      progress: {
        lessons: [],
        quizzes: [],
        exercises: [],
        modules: [],
      },
      // TODO: Add SRS data
      srs: {
        cards: [],
        reviews: [],
      },
      exportedAt: new Date().toISOString(),
    };

    res.status(200).json({
      success: true,
      data: exportData,
    });
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export data',
    });
  }
};

/**
 * Delete user account
 */
export const deleteAccount = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // TODO: Delete all associated data
    // - Progress data
    // - SRS reviews
    // - Quiz attempts
    // - Exercise submissions
    // - Achievements

    // Delete user
    await User.findByIdAndDelete(req.user?.userId);

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.clearCookie('csrfToken');

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account',
    });
  }
};
