import { Request, Response } from 'express';
import CommunityProfile from '../../models/CommunityProfile.js';
import Thread from '../../models/Thread.js';
import Reply from '../../models/Reply.js';
import StudyGroup from '../../models/StudyGroup.js';
import { sendNotification } from '../../services/communityNotificationService.js';

// Get user profile
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.id;

    const profile = await CommunityProfile.findOne({ user: userId })
      .populate('user', 'firstName lastName avatar email createdAt')
      .populate('followers', 'firstName lastName avatar')
      .populate('following', 'firstName lastName avatar');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
      });
    }

    // Check privacy settings
    if (!profile.privacySettings.showProfile && !currentUserId?.equals(userId)) {
      return res.status(403).json({
        success: false,
        message: 'This profile is private',
      });
    }

    // Check if blocked
    if (currentUserId && profile.hasBlocked(currentUserId)) {
      return res.status(403).json({
        success: false,
        message: 'You cannot view this profile',
      });
    }

    // Build response based on privacy settings
    const response: any = {
      user: profile.user,
      bio: profile.bio,
      avatar: profile.avatar,
      banner: profile.banner,
      location: profile.location,
      website: profile.website,
      socialLinks: profile.socialLinks,
      badges: profile.badges,
      createdAt: profile.createdAt,
    };

    if (profile.privacySettings.showStats || currentUserId?.equals(userId)) {
      response.stats = profile.stats;
    }

    if (profile.privacySettings.showActivity || currentUserId?.equals(userId)) {
      response.activity = profile.activity.slice(0, 20);
    }

    response.followers = profile.followers.length;
    response.following = profile.following.length;

    // Check if current user is following
    if (currentUserId) {
      response.isFollowing = profile.followers.some(f => f._id.equals(currentUserId));
      response.isOwnProfile = currentUserId.equals(userId);
    }

    res.json({
      success: true,
      data: response,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message,
    });
  }
};

// Update own profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    // Prevent updating sensitive fields
    delete updates.user;
    delete updates.stats;
    delete updates.followers;
    delete updates.following;
    delete updates.badges;

    const profile = await CommunityProfile.findOneAndUpdate(
      { user: userId },
      { $set: updates },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: profile,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message,
    });
  }
};

// Follow user
export const followUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { targetUserId } = req.params;

    if (userId === targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself',
      });
    }

    const [userProfile, targetProfile] = await Promise.all([
      CommunityProfile.findOne({ user: userId }),
      CommunityProfile.findOne({ user: targetUserId }),
    ]);

    if (!targetProfile) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if already following
    const isFollowing = userProfile?.following.some(id => id.equals(targetUserId));
    if (isFollowing) {
      return res.status(400).json({
        success: false,
        message: 'You are already following this user',
      });
    }

    // Add to following/followers
    await CommunityProfile.findOneAndUpdate(
      { user: userId },
      { $addToSet: { following: targetUserId } },
      { upsert: true }
    );

    await CommunityProfile.findOneAndUpdate(
      { user: targetUserId },
      { $addToSet: { followers: userId } },
      { upsert: true }
    );

    // Send notification
    await sendNotification({
      recipient: targetUserId,
      sender: userId,
      type: 'follow',
      title: 'New follower',
      message: 'Someone started following you',
      link: `/community/profile/${userId}`,
    });

    res.json({
      success: true,
      message: 'Successfully followed user',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error following user',
      error: error.message,
    });
  }
};

// Unfollow user
export const unfollowUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { targetUserId } = req.params;

    await CommunityProfile.findOneAndUpdate(
      { user: userId },
      { $pull: { following: targetUserId } }
    );

    await CommunityProfile.findOneAndUpdate(
      { user: targetUserId },
      { $pull: { followers: userId } }
    );

    res.json({
      success: true,
      message: 'Successfully unfollowed user',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error unfollowing user',
      error: error.message,
    });
  }
};

// Block user
export const blockUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { targetUserId } = req.params;

    if (userId === targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot block yourself',
      });
    }

    await CommunityProfile.findOneAndUpdate(
      { user: userId },
      {
        $addToSet: { blockedUsers: targetUserId },
        $pull: { following: targetUserId, followers: targetUserId },
      },
      { upsert: true }
    );

    // Remove from other user's lists
    await CommunityProfile.findOneAndUpdate(
      { user: targetUserId },
      { $pull: { following: userId, followers: userId } }
    );

    res.json({
      success: true,
      message: 'User blocked successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error blocking user',
      error: error.message,
    });
  }
};

// Unblock user
export const unblockUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { targetUserId } = req.params;

    await CommunityProfile.findOneAndUpdate(
      { user: userId },
      { $pull: { blockedUsers: targetUserId } }
    );

    res.json({
      success: true,
      message: 'User unblocked successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error unblocking user',
      error: error.message,
    });
  }
};

// Get user's threads
export const getUserThreads = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const threads = await Thread.find({
      author: userId,
      isDeleted: false,
    })
      .populate('author', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Thread.countDocuments({
      author: userId,
      isDeleted: false,
    });

    res.json({
      success: true,
      data: {
        threads,
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
      message: 'Error fetching user threads',
      error: error.message,
    });
  }
};

// Get user's study groups
export const getUserGroups = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const groups = await StudyGroup.find({
      $or: [
        { members: userId },
        { owner: userId },
        { moderators: userId },
      ],
      isArchived: false,
    })
      .populate('owner', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await StudyGroup.countDocuments({
      $or: [
        { members: userId },
        { owner: userId },
        { moderators: userId },
      ],
      isArchived: false,
    });

    res.json({
      success: true,
      data: {
        groups,
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
      message: 'Error fetching user groups',
      error: error.message,
    });
  }
};

// Get community dashboard stats
export const getCommunityDashboard = async (req: Request, res: Response) => {
  try {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const [
      trendingThreads,
      activeMembers,
      recentAchievements,
      popularGroups,
    ] = await Promise.all([
      // Trending discussions
      Thread.find({
        isDeleted: false,
        lastActivityAt: { $gte: threeDaysAgo },
      })
        .populate('author', 'firstName lastName avatar')
        .sort({ views: -1, upvotes: -1 })
        .limit(5),

      // Active members this week
      CommunityProfile.find({
        lastActive: { $gte: threeDaysAgo },
      })
        .populate('user', 'firstName lastName avatar')
        .sort({ 'stats.reputation': -1 })
        .limit(10),

      // Recent achievements (placeholder - would need actual achievement data)
      CommunityProfile.find({
        'badges.earnedAt': { $gte: threeDaysAgo },
      })
        .populate('user', 'firstName lastName avatar')
        .sort({ 'badges.earnedAt': -1 })
        .limit(10),

      // Popular study groups
      StudyGroup.find({
        isArchived: false,
        isPrivate: false,
      })
        .populate('owner', 'firstName lastName avatar')
        .sort({ members: -1 })
        .limit(5),
    ]);

    // Community statistics
    const [totalThreads, totalMembers, totalGroups] = await Promise.all([
      Thread.countDocuments({ isDeleted: false }),
      CommunityProfile.countDocuments({}),
      StudyGroup.countDocuments({ isArchived: false }),
    ]);

    res.json({
      success: true,
      data: {
        trendingThreads,
        activeMembers: activeMembers.map(m => ({
          user: m.user,
          reputation: m.stats.reputation,
          badges: m.badges.slice(0, 3),
        })),
        recentAchievements: recentAchievements.map(m => ({
          user: m.user,
          badge: m.badges[0],
        })),
        popularGroups,
        stats: {
          totalThreads,
          totalMembers,
          totalGroups,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching community dashboard',
      error: error.message,
    });
  }
};
