import { Request, Response } from 'express';
import { Conversation, Message } from '../../models/Message.js';
import CommunityProfile from '../../models/CommunityProfile.js';
import { sendNotification } from '../../services/communityNotificationService.js';

// Get all conversations for user
export const getConversations = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const conversations = await Conversation.find({
      participants: userId,
      isArchived: false,
    })
      .populate('participants', 'firstName lastName avatar')
      .populate('lastMessage.sender', 'firstName lastName')
      .sort({ 'lastMessage.timestamp': -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Conversation.countDocuments({
      participants: userId,
      isArchived: false,
    });

    res.json({
      success: true,
      data: {
        conversations,
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
      message: 'Error fetching conversations',
      error: error.message,
    });
  }
};

// Get or create conversation with user
export const getOrCreateConversation = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { recipientId } = req.body;

    // Check if recipient has messaging enabled
    const recipientProfile = await CommunityProfile.findOne({ user: recipientId });
    if (recipientProfile) {
      // Check privacy settings
      if (recipientProfile.privacySettings.allowMessages === 'none') {
        return res.status(403).json({
          success: false,
          message: 'This user has disabled messages',
        });
      }

      if (recipientProfile.privacySettings.allowMessages === 'following') {
        const isFollowing = recipientProfile.followers.some(id => id.equals(userId));
        if (!isFollowing) {
          return res.status(403).json({
            success: false,
            message: 'You can only message users who follow you',
          });
        }
      }

      // Check if user is blocked
      if (recipientProfile.hasBlocked(userId)) {
        return res.status(403).json({
          success: false,
          message: 'You cannot message this user',
        });
      }
    }

    // Find existing conversation
    let conversation = await Conversation.findOne({
      type: 'direct',
      participants: { $all: [userId, recipientId], $size: 2 },
    })
      .populate('participants', 'firstName lastName avatar');

    // Create new conversation if doesn't exist
    if (!conversation) {
      conversation = await Conversation.create({
        type: 'direct',
        participants: [userId, recipientId],
      });

      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'firstName lastName avatar');
    }

    res.json({
      success: true,
      data: conversation,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error getting conversation',
      error: error.message,
    });
  }
};

// Get messages in conversation
export const getMessages = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    const { page = 1, limit = 50 } = req.query;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    // Verify user is participant
    const isParticipant = conversation.participants.some(p => p.equals(userId));
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this conversation',
      });
    }

    const skip = (Number(page) - 1) * Number(limit);

    const messages = await Message.find({
      conversation: conversationId,
      isDeleted: false,
    })
      .populate('sender', 'firstName lastName avatar')
      .populate('replyTo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Mark messages as read
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: userId },
        'readBy.user': { $ne: userId },
      },
      {
        $push: {
          readBy: {
            user: userId,
            readAt: new Date(),
          },
        },
      }
    );

    const total = await Message.countDocuments({
      conversation: conversationId,
      isDeleted: false,
    });

    res.json({
      success: true,
      data: {
        messages: messages.reverse(),
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
      message: 'Error fetching messages',
      error: error.message,
    });
  }
};

// Send message
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const { content, replyTo } = req.body;
    const userId = req.user.id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    // Verify user is participant
    const isParticipant = conversation.participants.some(p => p.equals(userId));
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this conversation',
      });
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: userId,
      content,
      replyTo: replyTo || undefined,
      readBy: [{
        user: userId,
        readAt: new Date(),
      }],
    });

    // Update conversation last message
    conversation.lastMessage = {
      content,
      sender: userId,
      timestamp: new Date(),
    };
    await conversation.save();

    // Send notifications to other participants
    const otherParticipants = conversation.participants.filter(p => !p.equals(userId));
    for (const participantId of otherParticipants) {
      await sendNotification({
        recipient: participantId,
        sender: userId,
        type: 'group_message',
        title: 'New message',
        message: content.substring(0, 100),
        link: `/community/messages/${conversationId}`,
      });
    }

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'firstName lastName avatar');

    res.status(201).json({
      success: true,
      data: populatedMessage,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message,
    });
  }
};

// Edit message
export const editMessage = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const message = await Message.findById(messageId);
    if (!message || message.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Only sender can edit
    if (!message.sender.equals(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own messages',
      });
    }

    message.content = content;
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();

    res.json({
      success: true,
      message: 'Message updated successfully',
      data: message,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error editing message',
      error: error.message,
    });
  }
};

// Delete message
export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(messageId);
    if (!message || message.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Only sender can delete
    if (!message.sender.equals(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages',
      });
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    await message.save();

    res.json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error deleting message',
      error: error.message,
    });
  }
};

// Get unread message count
export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    // Get all user's conversations
    const conversations = await Conversation.find({
      participants: userId,
    }).select('_id');

    const conversationIds = conversations.map(c => c._id);

    // Count unread messages
    const unreadCount = await Message.countDocuments({
      conversation: { $in: conversationIds },
      sender: { $ne: userId },
      'readBy.user': { $ne: userId },
      isDeleted: false,
    });

    res.json({
      success: true,
      data: {
        unreadCount,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching unread count',
      error: error.message,
    });
  }
};

// Archive conversation
export const archiveConversation = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    // Verify user is participant
    const isParticipant = conversation.participants.some(p => p.equals(userId));
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this conversation',
      });
    }

    conversation.isArchived = true;
    await conversation.save();

    res.json({
      success: true,
      message: 'Conversation archived successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error archiving conversation',
      error: error.message,
    });
  }
};

// Search messages
export const searchMessages = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { query, conversationId } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    // Get user's conversations
    const conversations = await Conversation.find({
      participants: userId,
    }).select('_id');

    const conversationIds = conversationId
      ? [conversationId]
      : conversations.map(c => c._id);

    const messages = await Message.find({
      conversation: { $in: conversationIds },
      content: { $regex: query, $options: 'i' },
      isDeleted: false,
    })
      .populate('sender', 'firstName lastName avatar')
      .populate('conversation')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: messages,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error searching messages',
      error: error.message,
    });
  }
};
