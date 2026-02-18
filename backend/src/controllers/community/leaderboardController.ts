import { Request, Response } from 'express';
import CommunityProfile from '../../models/CommunityProfile.js';

// Get global leaderboard
export const getGlobalLeaderboard = async (req: Request, res: Response) => {
  try {
    const {
      timeframe = 'all',
      category = 'reputation',
      page = 1,
      limit = 100,
    } = req.query;

    const query: any = {
      'privacySettings.showOnLeaderboard': true,
    };

    // Apply timeframe filter
    if (timeframe !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (timeframe) {
        case 'weekly':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'monthly':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0);
      }

      query.lastActive = { $gte: startDate };
    }

    // Determine sort field
    let sortField = 'stats.reputation';
    switch (category) {
      case 'lessons':
        sortField = 'stats.lessonsCompleted';
        break;
      case 'quizzes':
        sortField = 'stats.quizzesCompleted';
        break;
      case 'helpful':
        sortField = 'stats.helpfulReplies';
        break;
      case 'streak':
        sortField = 'stats.studyStreak';
        break;
      default:
        sortField = 'stats.reputation';
    }

    const skip = (Number(page) - 1) * Number(limit);

    const profiles = await CommunityProfile.find(query)
      .populate('user', 'firstName lastName avatar')
      .sort({ [sortField]: -1 })
      .skip(skip)
      .limit(Number(limit));

    const leaderboard = profiles.map((profile, index) => ({
      rank: skip + index + 1,
      user: profile.user,
      stats: profile.stats,
      badges: profile.badges.slice(0, 3), // Show top 3 badges
    }));

    const total = await CommunityProfile.countDocuments(query);

    res.json({
      success: true,
      data: {
        leaderboard,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching leaderboard',
      error: error.message,
    });
  }
};

// Get user's leaderboard position
export const getUserPosition = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { category = 'reputation' } = req.query;

    const profile = await CommunityProfile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
      });
    }

    // Determine sort field
    let sortField = 'stats.reputation';
    let userValue = profile.stats.reputation;

    switch (category) {
      case 'lessons':
        sortField = 'stats.lessonsCompleted';
        userValue = profile.stats.lessonsCompleted;
        break;
      case 'quizzes':
        sortField = 'stats.quizzesCompleted';
        userValue = profile.stats.quizzesCompleted;
        break;
      case 'helpful':
        sortField = 'stats.helpfulReplies';
        userValue = profile.stats.helpfulReplies;
        break;
      case 'streak':
        sortField = 'stats.studyStreak';
        userValue = profile.stats.studyStreak;
        break;
    }

    // Count users with higher scores
    const rank = await CommunityProfile.countDocuments({
      [sortField]: { $gt: userValue },
      'privacySettings.showOnLeaderboard': true,
    }) + 1;

    const total = await CommunityProfile.countDocuments({
      'privacySettings.showOnLeaderboard': true,
    });

    res.json({
      success: true,
      data: {
        rank,
        total,
        percentile: ((total - rank) / total * 100).toFixed(1),
        score: userValue,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user position',
      error: error.message,
    });
  }
};

// Get category-specific leaderboard (Playwright, Selenium, etc.)
export const getCategoryLeaderboard = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // This would be based on lessons/quizzes completed in specific categories
    // For now, using overall stats as placeholder
    const skip = (Number(page) - 1) * Number(limit);

    const profiles = await CommunityProfile.find({
      'privacySettings.showOnLeaderboard': true,
      'preferences.interests': category,
    })
      .populate('user', 'firstName lastName avatar')
      .sort({ 'stats.reputation': -1 })
      .skip(skip)
      .limit(Number(limit));

    const leaderboard = profiles.map((profile, index) => ({
      rank: skip + index + 1,
      user: profile.user,
      stats: profile.stats,
      badges: profile.badges.slice(0, 3),
    }));

    const total = await CommunityProfile.countDocuments({
      'privacySettings.showOnLeaderboard': true,
      'preferences.interests': category,
    });

    res.json({
      success: true,
      data: {
        leaderboard,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching category leaderboard',
      error: error.message,
    });
  }
};

// Update leaderboard opt-in setting
export const updateLeaderboardOptIn = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { optIn } = req.body;

    await CommunityProfile.findOneAndUpdate(
      { user: userId },
      {
        'privacySettings.showOnLeaderboard': optIn,
      },
      { upsert: true }
    );

    res.json({
      success: true,
      message: `Successfully ${optIn ? 'opted in to' : 'opted out of'} leaderboard`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error updating leaderboard preference',
      error: error.message,
    });
  }
};
