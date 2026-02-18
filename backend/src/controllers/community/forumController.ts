import { Request, Response } from 'express';
import Thread from '../../models/Thread.js';
import Reply from '../../models/Reply.js';
import CommunityProfile from '../../models/CommunityProfile.js';
import Notification from '../../models/Notification.js';
import { detectSpam } from '../../services/moderationService.js';
import { sendNotification } from '../../services/communityNotificationService.js';

// Get all threads with filtering and sorting
export const getThreads = async (req: Request, res: Response) => {
  try {
    const {
      category,
      sort = 'recent',
      search,
      tag,
      page = 1,
      limit = 20,
    } = req.query;

    const query: any = { isDeleted: false };

    if (category) {
      query.category = category;
    }

    if (tag) {
      query.tags = tag;
    }

    if (search) {
      query.$text = { $search: search as string };
    }

    let sortOptions: any = {};
    switch (sort) {
      case 'recent':
        sortOptions = { lastActivityAt: -1 };
        break;
      case 'popular':
        sortOptions = { views: -1, upvotes: -1 };
        break;
      case 'unanswered':
        query.replyCount = 0;
        sortOptions = { createdAt: -1 };
        break;
      case 'trending':
        // Threads with recent activity and high upvotes
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        query.lastActivityAt = { $gte: threeDaysAgo };
        sortOptions = { upvotes: -1, views: -1 };
        break;
      default:
        sortOptions = { lastActivityAt: -1 };
    }

    // Pinned threads always come first
    const pinnedThreads = await Thread.find({ ...query, isPinned: true })
      .populate('author', 'firstName lastName avatar')
      .populate('bestAnswer')
      .sort(sortOptions)
      .limit(5);

    const skip = (Number(page) - 1) * Number(limit);
    const regularThreads = await Thread.find({ ...query, isPinned: false })
      .populate('author', 'firstName lastName avatar')
      .populate('bestAnswer')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    const total = await Thread.countDocuments({ ...query, isPinned: false });

    res.json({
      success: true,
      data: {
        pinned: pinnedThreads,
        threads: regularThreads,
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
      message: 'Error fetching threads',
      error: error.message,
    });
  }
};

// Get single thread with replies
export const getThread = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const thread = await Thread.findById(id)
      .populate('author', 'firstName lastName avatar')
      .populate('bestAnswer');

    if (!thread || thread.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Thread not found',
      });
    }

    // Increment view count
    await thread.incrementViews();

    // Get replies
    const replies = await Reply.find({
      thread: id,
      isDeleted: false,
    })
      .populate('author', 'firstName lastName avatar')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      data: {
        thread,
        replies,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching thread',
      error: error.message,
    });
  }
};

// Create new thread
export const createThread = async (req: Request, res: Response) => {
  try {
    const { title, content, category, tags } = req.body;
    const userId = (req as any).user.userId;

    // Check for spam
    const isSpam = detectSpam(`${title} ${content}`);
    if (isSpam) {
      return res.status(400).json({
        success: false,
        message: 'Your post contains spam content. Please revise and try again.',
      });
    }

    const thread = await Thread.create({
      title,
      content,
      category,
      tags: tags || [],
      author: userId,
    });

    // Update user profile stats
    await CommunityProfile.findOneAndUpdate(
      { user: userId },
      {
        $inc: { 'stats.threadsCreated': 1 },
        $push: {
          activity: {
            type: 'thread',
            description: `Created thread: ${title}`,
            timestamp: new Date(),
            reference: thread._id,
          },
        },
      },
      { upsert: true }
    );

    const populatedThread = await Thread.findById(thread._id)
      .populate('author', 'firstName lastName avatar');

    res.status(201).json({
      success: true,
      message: 'Thread created successfully',
      data: populatedThread,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error creating thread',
      error: error.message,
    });
  }
};

// Create reply to thread
export const createReply = async (req: Request, res: Response) => {
  try {
    const { threadId } = req.params;
    const { content, parentReply, mentions } = req.body;
    const userId = req.user.id;

    const thread = await Thread.findById(threadId);
    if (!thread || thread.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Thread not found',
      });
    }

    if (thread.isLocked) {
      return res.status(403).json({
        success: false,
        message: 'This thread is locked and cannot accept new replies',
      });
    }

    // Check for spam
    const isSpam = detectSpam(content);
    if (isSpam) {
      return res.status(400).json({
        success: false,
        message: 'Your reply contains spam content. Please revise and try again.',
      });
    }

    const reply = await Reply.create({
      thread: threadId,
      content,
      author: userId,
      parentReply: parentReply || undefined,
      mentions: mentions || [],
    });

    // Update thread
    thread.replyCount += 1;
    await thread.updateLastActivity();

    // Update user profile
    await CommunityProfile.findOneAndUpdate(
      { user: userId },
      {
        $inc: { 'stats.repliesPosted': 1 },
        $push: {
          activity: {
            type: 'reply',
            description: `Replied to thread: ${thread.title}`,
            timestamp: new Date(),
            reference: thread._id,
          },
        },
      },
      { upsert: true }
    );

    // Send notification to thread author
    if (!thread.author.equals(userId)) {
      await sendNotification({
        recipient: thread.author,
        sender: userId,
        type: 'reply',
        title: 'New reply to your thread',
        message: `Someone replied to your thread "${thread.title}"`,
        link: `/community/forum/thread/${threadId}`,
        reference: {
          model: 'Thread',
          id: thread._id,
        },
      });
    }

    // Send notifications to mentioned users
    if (mentions && mentions.length > 0) {
      for (const mentionedUserId of mentions) {
        if (!mentionedUserId.equals(userId)) {
          await sendNotification({
            recipient: mentionedUserId,
            sender: userId,
            type: 'mention',
            title: 'You were mentioned in a thread',
            message: `You were mentioned in "${thread.title}"`,
            link: `/community/forum/thread/${threadId}`,
            reference: {
              model: 'Thread',
              id: thread._id,
            },
          });
        }
      }
    }

    const populatedReply = await Reply.findById(reply._id)
      .populate('author', 'firstName lastName avatar');

    res.status(201).json({
      success: true,
      message: 'Reply posted successfully',
      data: populatedReply,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error creating reply',
      error: error.message,
    });
  }
};

// Upvote thread
export const upvoteThread = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const thread = await Thread.findById(id);
    if (!thread || thread.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Thread not found',
      });
    }

    const hasUpvoted = thread.upvotes.some(uid => uid.equals(userId));
    const hasDownvoted = thread.downvotes.some(uid => uid.equals(userId));

    if (hasUpvoted) {
      // Remove upvote
      thread.upvotes = thread.upvotes.filter(uid => !uid.equals(userId));
    } else {
      // Add upvote
      thread.upvotes.push(userId);
      // Remove downvote if exists
      if (hasDownvoted) {
        thread.downvotes = thread.downvotes.filter(uid => !uid.equals(userId));
      }

      // Send notification to author
      if (!thread.author.equals(userId)) {
        await sendNotification({
          recipient: thread.author,
          sender: userId,
          type: 'upvote',
          title: 'Your thread was upvoted',
          message: `Someone upvoted your thread "${thread.title}"`,
          link: `/community/forum/thread/${id}`,
        });
      }
    }

    await thread.save();

    res.json({
      success: true,
      data: {
        upvotes: thread.upvotes.length,
        downvotes: thread.downvotes.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error voting on thread',
      error: error.message,
    });
  }
};

// Downvote thread
export const downvoteThread = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const thread = await Thread.findById(id);
    if (!thread || thread.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Thread not found',
      });
    }

    const hasUpvoted = thread.upvotes.some(uid => uid.equals(userId));
    const hasDownvoted = thread.downvotes.some(uid => uid.equals(userId));

    if (hasDownvoted) {
      // Remove downvote
      thread.downvotes = thread.downvotes.filter(uid => !uid.equals(userId));
    } else {
      // Add downvote
      thread.downvotes.push(userId);
      // Remove upvote if exists
      if (hasUpvoted) {
        thread.upvotes = thread.upvotes.filter(uid => !uid.equals(userId));
      }
    }

    await thread.save();

    res.json({
      success: true,
      data: {
        upvotes: thread.upvotes.length,
        downvotes: thread.downvotes.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error voting on thread',
      error: error.message,
    });
  }
};

// Mark reply as best answer
export const markBestAnswer = async (req: Request, res: Response) => {
  try {
    const { threadId, replyId } = req.params;
    const userId = req.user.id;

    const thread = await Thread.findById(threadId);
    if (!thread || thread.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Thread not found',
      });
    }

    // Only thread author can mark best answer
    if (!thread.author.equals(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Only the thread author can mark the best answer',
      });
    }

    const reply = await Reply.findById(replyId);
    if (!reply || reply.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found',
      });
    }

    // Update previous best answer if exists
    if (thread.bestAnswer) {
      await Reply.findByIdAndUpdate(thread.bestAnswer, { isBestAnswer: false });
    }

    // Set new best answer
    thread.bestAnswer = reply._id;
    reply.isBestAnswer = true;

    await thread.save();
    await reply.save();

    // Update reputation for reply author
    await CommunityProfile.findOneAndUpdate(
      { user: reply.author },
      {
        $inc: {
          'stats.helpfulReplies': 1,
          'stats.reputation': 10,
        },
      }
    );

    // Send notification
    await sendNotification({
      recipient: reply.author,
      sender: userId,
      type: 'best_answer',
      title: 'Your answer was marked as best',
      message: `Your answer was marked as the best answer in "${thread.title}"`,
      link: `/community/forum/thread/${threadId}`,
    });

    res.json({
      success: true,
      message: 'Best answer marked successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error marking best answer',
      error: error.message,
    });
  }
};

// Bookmark thread
export const bookmarkThread = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const thread = await Thread.findById(id);
    if (!thread || thread.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Thread not found',
      });
    }

    const isBookmarked = thread.bookmarkedBy.some(uid => uid.equals(userId));

    if (isBookmarked) {
      thread.bookmarkedBy = thread.bookmarkedBy.filter(uid => !uid.equals(userId));
    } else {
      thread.bookmarkedBy.push(userId);
    }

    await thread.save();

    res.json({
      success: true,
      data: {
        isBookmarked: !isBookmarked,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error bookmarking thread',
      error: error.message,
    });
  }
};

// Flag thread for moderation
export const flagThread = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    const thread = await Thread.findById(id);
    if (!thread || thread.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Thread not found',
      });
    }

    if (!thread.flaggedBy) {
      thread.flaggedBy = [];
    }

    const alreadyFlagged = thread.flaggedBy.some(uid => uid.equals(userId));
    if (alreadyFlagged) {
      return res.status(400).json({
        success: false,
        message: 'You have already flagged this thread',
      });
    }

    thread.isFlagged = true;
    thread.flagReason = reason;
    thread.flaggedBy.push(userId);

    await thread.save();

    res.json({
      success: true,
      message: 'Thread flagged for review',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error flagging thread',
      error: error.message,
    });
  }
};

// Delete thread
export const deleteThread = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const thread = await Thread.findById(id);
    if (!thread || thread.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Thread not found',
      });
    }

    // Only author or admin can delete
    if (!thread.author.equals(userId) && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this thread',
      });
    }

    thread.isDeleted = true;
    thread.deletedAt = new Date();
    await thread.save();

    res.json({
      success: true,
      message: 'Thread deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error deleting thread',
      error: error.message,
    });
  }
};

// Get user's bookmarked threads
export const getBookmarkedThreads = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const threads = await Thread.find({
      bookmarkedBy: userId,
      isDeleted: false,
    })
      .populate('author', 'firstName lastName avatar')
      .sort({ lastActivityAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Thread.countDocuments({
      bookmarkedBy: userId,
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
      message: 'Error fetching bookmarked threads',
      error: error.message,
    });
  }
};
