import { Request, Response } from 'express';
import StudyGroup from '../../models/StudyGroup.js';
import CommunityProfile from '../../models/CommunityProfile.js';
import Notification from '../../models/Notification.js';
import { sendNotification } from '../../services/communityNotificationService.js';
import crypto from 'crypto';

// Get all study groups with filtering
export const getStudyGroups = async (req: Request, res: Response) => {
  try {
    const {
      category,
      search,
      tag,
      page = 1,
      limit = 20,
      myGroups,
    } = req.query;

    const userId = req.user?.id;
    const query: any = { isArchived: false };

    // Show only public groups unless user is viewing their own groups
    if (!myGroups) {
      query.isPrivate = false;
    } else if (userId) {
      query.$or = [
        { members: userId },
        { owner: userId },
        { moderators: userId },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (tag) {
      query.tags = tag;
    }

    if (search) {
      query.$text = { $search: search as string };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const groups = await StudyGroup.find(query)
      .populate('owner', 'firstName lastName avatar')
      .populate('moderators', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // Add member count to each group
    const groupsWithCount = groups.map(group => ({
      ...group,
      memberCount: group.members.length,
    }));

    const total = await StudyGroup.countDocuments(query);

    res.json({
      success: true,
      data: {
        groups: groupsWithCount,
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
      message: 'Error fetching study groups',
      error: error.message,
    });
  }
};

// Get single study group
export const getStudyGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const group = await StudyGroup.findById(id)
      .populate('owner', 'firstName lastName avatar')
      .populate('moderators', 'firstName lastName avatar')
      .populate('members', 'firstName lastName avatar');

    if (!group || group.isArchived) {
      return res.status(404).json({
        success: false,
        message: 'Study group not found',
      });
    }

    // Check if user has access to private group
    if (group.isPrivate && userId) {
      const hasAccess = group.isMember(userId) || group.isModerator(userId);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this private group',
        });
      }
    }

    res.json({
      success: true,
      data: group,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching study group',
      error: error.message,
    });
  }
};

// Create new study group
export const createStudyGroup = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      category,
      tags,
      isPrivate,
      maxMembers,
      goals,
      schedule,
    } = req.body;
    const userId = req.user.id;

    const groupData: any = {
      name,
      description,
      category,
      tags: tags || [],
      isPrivate: isPrivate || false,
      maxMembers: maxMembers || 50,
      owner: userId,
      members: [userId],
      goals: goals || [],
      schedule: schedule || [],
    };

    // Generate invite code for private groups
    if (isPrivate) {
      groupData.inviteCode = crypto.randomBytes(8).toString('hex');
    }

    const group = await StudyGroup.create(groupData);

    // Update user profile
    await CommunityProfile.findOneAndUpdate(
      { user: userId },
      {
        $push: {
          activity: {
            type: 'group',
            description: `Created study group: ${name}`,
            timestamp: new Date(),
            reference: group._id,
          },
        },
      },
      { upsert: true }
    );

    const populatedGroup = await StudyGroup.findById(group._id)
      .populate('owner', 'firstName lastName avatar');

    res.status(201).json({
      success: true,
      message: 'Study group created successfully',
      data: populatedGroup,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error creating study group',
      error: error.message,
    });
  }
};

// Join study group
export const joinStudyGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { inviteCode } = req.body;
    const userId = req.user.id;

    const group = await StudyGroup.findById(id);
    if (!group || group.isArchived) {
      return res.status(404).json({
        success: false,
        message: 'Study group not found',
      });
    }

    // Check if already a member
    if (group.isMember(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this group',
      });
    }

    // Check if group is full
    if (group.members.length >= group.maxMembers) {
      return res.status(400).json({
        success: false,
        message: 'This group is full',
      });
    }

    // Verify invite code for private groups
    if (group.isPrivate) {
      if (!inviteCode || inviteCode !== group.inviteCode) {
        return res.status(403).json({
          success: false,
          message: 'Invalid invite code',
        });
      }
    }

    group.members.push(userId);
    await group.save();

    // Send notification to group owner
    await sendNotification({
      recipient: group.owner,
      sender: userId,
      type: 'group_message',
      title: 'New member joined your group',
      message: `Someone joined your study group "${group.name}"`,
      link: `/community/groups/${id}`,
    });

    res.json({
      success: true,
      message: 'Successfully joined the study group',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error joining study group',
      error: error.message,
    });
  }
};

// Leave study group
export const leaveStudyGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const group = await StudyGroup.findById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Study group not found',
      });
    }

    // Owner cannot leave, must transfer ownership first
    if (group.isOwner(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Owner cannot leave the group. Please transfer ownership first.',
      });
    }

    if (!group.isMember(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You are not a member of this group',
      });
    }

    // Remove from members and moderators
    group.members = group.members.filter(m => !m.equals(userId));
    group.moderators = group.moderators.filter(m => !m.equals(userId));
    await group.save();

    res.json({
      success: true,
      message: 'Successfully left the study group',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error leaving study group',
      error: error.message,
    });
  }
};

// Invite members to study group
export const inviteToGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userIds } = req.body;
    const userId = req.user.id;

    const group = await StudyGroup.findById(id);
    if (!group || group.isArchived) {
      return res.status(404).json({
        success: false,
        message: 'Study group not found',
      });
    }

    // Only owner and moderators can invite
    if (!group.isModerator(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Only moderators can invite members',
      });
    }

    // Send invitations
    for (const invitedUserId of userIds) {
      await sendNotification({
        recipient: invitedUserId,
        sender: userId,
        type: 'group_invite',
        title: 'Study group invitation',
        message: `You've been invited to join "${group.name}"`,
        link: `/community/groups/${id}`,
      });
    }

    res.json({
      success: true,
      message: 'Invitations sent successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error sending invitations',
      error: error.message,
    });
  }
};

// Update study group
export const updateStudyGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    const group = await StudyGroup.findById(id);
    if (!group || group.isArchived) {
      return res.status(404).json({
        success: false,
        message: 'Study group not found',
      });
    }

    // Only owner and moderators can update
    if (!group.isModerator(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Only moderators can update the group',
      });
    }

    // Prevent updating certain fields
    delete updates.owner;
    delete updates.members;
    delete updates.inviteCode;

    Object.assign(group, updates);
    await group.save();

    res.json({
      success: true,
      message: 'Study group updated successfully',
      data: group,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error updating study group',
      error: error.message,
    });
  }
};

// Add announcement to group
export const addAnnouncement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const userId = req.user.id;

    const group = await StudyGroup.findById(id);
    if (!group || group.isArchived) {
      return res.status(404).json({
        success: false,
        message: 'Study group not found',
      });
    }

    // Only owner and moderators can post announcements
    if (!group.isModerator(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Only moderators can post announcements',
      });
    }

    group.announcements.unshift({
      title,
      content,
      author: userId,
      createdAt: new Date(),
    });

    await group.save();

    // Notify all members
    for (const memberId of group.members) {
      if (!memberId.equals(userId)) {
        await sendNotification({
          recipient: memberId,
          sender: userId,
          type: 'group_message',
          title: `New announcement in ${group.name}`,
          message: title,
          link: `/community/groups/${id}`,
        });
      }
    }

    res.json({
      success: true,
      message: 'Announcement posted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error posting announcement',
      error: error.message,
    });
  }
};

// Create group challenge
export const createChallenge = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, points, startDate, endDate } = req.body;
    const userId = req.user.id;

    const group = await StudyGroup.findById(id);
    if (!group || group.isArchived) {
      return res.status(404).json({
        success: false,
        message: 'Study group not found',
      });
    }

    // Only owner and moderators can create challenges
    if (!group.isModerator(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Only moderators can create challenges',
      });
    }

    group.challenges.push({
      title,
      description,
      points,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      participants: [],
    });

    await group.save();

    res.json({
      success: true,
      message: 'Challenge created successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error creating challenge',
      error: error.message,
    });
  }
};

// Get group leaderboard
export const getGroupLeaderboard = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const group = await StudyGroup.findById(id);
    if (!group || group.isArchived) {
      return res.status(404).json({
        success: false,
        message: 'Study group not found',
      });
    }

    // Get member profiles with stats
    const memberProfiles = await CommunityProfile.find({
      user: { $in: group.members },
    })
      .populate('user', 'firstName lastName avatar')
      .sort({ 'stats.reputation': -1 })
      .limit(100);

    const leaderboard = memberProfiles.map((profile, index) => ({
      rank: index + 1,
      user: profile.user,
      reputation: profile.stats.reputation,
      lessonsCompleted: profile.stats.lessonsCompleted,
      quizzesCompleted: profile.stats.quizzesCompleted,
      helpfulReplies: profile.stats.helpfulReplies,
    }));

    res.json({
      success: true,
      data: leaderboard,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching group leaderboard',
      error: error.message,
    });
  }
};

// Delete study group
export const deleteStudyGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const group = await StudyGroup.findById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Study group not found',
      });
    }

    // Only owner can delete
    if (!group.isOwner(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Only the owner can delete this group',
      });
    }

    group.isArchived = true;
    await group.save();

    res.json({
      success: true,
      message: 'Study group deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error deleting study group',
      error: error.message,
    });
  }
};
