import { Request, Response } from 'express';
import liveClassService from '../../services/live/liveClassService.js';
import LiveClass from '../../models/LiveClass.js';

/**
 * Schedule a new live class
 */
export const scheduleClass = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    const classData = {
      ...req.body,
      instructorId: userId,
    };

    const liveClass = await liveClassService.scheduleClass(classData);

    res.status(201).json({
      message: 'Live class scheduled successfully',
      class: liveClass,
    });
  } catch (error) {
    console.error('Schedule class error:', error);
    res.status(500).json({ error: 'Failed to schedule class' });
  }
};

/**
 * Get live class details
 */
export const getClass = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const liveClass = await liveClassService.getClassDetails(id);

    if (!liveClass) {
      res.status(404).json({ error: 'Live class not found' });
      return;
    }

    res.json({ class: liveClass });
  } catch (error) {
    console.error('Get class error:', error);
    res.status(500).json({ error: 'Failed to get class details' });
  }
};

/**
 * Start live class
 */
export const startClass = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const liveClass = await liveClassService.startClass(id, userId);

    res.json({
      message: 'Live class started',
      class: liveClass,
    });
  } catch (error) {
    console.error('Start class error:', error);
    res.status(500).json({ error: 'Failed to start class' });
  }
};

/**
 * End live class
 */
export const endClass = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const liveClass = await liveClassService.endClass(id, userId);

    res.json({
      message: 'Live class ended',
      class: liveClass,
    });
  } catch (error) {
    console.error('End class error:', error);
    res.status(500).json({ error: 'Failed to end class' });
  }
};

/**
 * Cancel live class
 */
export const cancelClass = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const { reason } = req.body;

    await liveClassService.cancelClass(id, userId, reason);

    res.json({ message: 'Live class cancelled' });
  } catch (error) {
    console.error('Cancel class error:', error);
    res.status(500).json({ error: 'Failed to cancel class' });
  }
};

/**
 * Join live class
 */
export const joinClass = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const { role } = req.body;

    const result = await liveClassService.joinClass(id, userId, role);

    res.json(result);
  } catch (error) {
    console.error('Join class error:', error);
    res.status(500).json({ error: 'Failed to join class' });
  }
};

/**
 * Leave live class
 */
export const leaveClass = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    await liveClassService.leaveClass(id, userId);

    res.json({ message: 'Left class successfully' });
  } catch (error) {
    console.error('Leave class error:', error);
    res.status(500).json({ error: 'Failed to leave class' });
  }
};

/**
 * Send chat message
 */
export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const { message } = req.body;

    const chatMessage = await liveClassService.sendChatMessage(id, userId, message);

    res.json({ message: chatMessage });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

/**
 * Get chat messages
 */
export const getMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { limit = 50, before } = req.query;

    const liveClass = await LiveClass.findById(id).populate('chat.userId', 'name email');

    if (!liveClass) {
      res.status(404).json({ error: 'Live class not found' });
      return;
    }

    let messages = liveClass.chat.filter((m) => !m.isDeleted);

    if (before) {
      const beforeDate = new Date(before as string);
      messages = messages.filter((m) => m.timestamp < beforeDate);
    }

    messages = messages.slice(-Number(limit));

    res.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
};

/**
 * Ask question in Q&A
 */
export const askQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const { question } = req.body;

    const qaQuestion = await liveClassService.askQuestion(id, userId, question);

    res.json({ question: qaQuestion });
  } catch (error) {
    console.error('Ask question error:', error);
    res.status(500).json({ error: 'Failed to ask question' });
  }
};

/**
 * Answer question
 */
export const answerQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, questionId } = req.params;
    const userId = (req as any).user.id;
    const { answer } = req.body;

    await liveClassService.answerQuestion(id, questionId, userId, answer);

    res.json({ message: 'Question answered' });
  } catch (error) {
    console.error('Answer question error:', error);
    res.status(500).json({ error: 'Failed to answer question' });
  }
};

/**
 * Get Q&A queue
 */
export const getQAQueue = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.query;

    const liveClass = await LiveClass.findById(id).populate('qaQueue.userId', 'name email');

    if (!liveClass) {
      res.status(404).json({ error: 'Live class not found' });
      return;
    }

    let questions = liveClass.qaQueue;

    if (status) {
      questions = questions.filter((q) => q.status === status);
    }

    // Sort by upvotes and time
    questions.sort((a, b) => {
      if (a.upvotes !== b.upvotes) {
        return b.upvotes - a.upvotes;
      }
      return a.askedAt.getTime() - b.askedAt.getTime();
    });

    res.json({ questions });
  } catch (error) {
    console.error('Get Q&A queue error:', error);
    res.status(500).json({ error: 'Failed to get Q&A queue' });
  }
};

/**
 * Create poll
 */
export const createPoll = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { question, options, expiresIn } = req.body;

    const poll = await liveClassService.createPoll(id, question, options, expiresIn);

    res.json({ poll });
  } catch (error) {
    console.error('Create poll error:', error);
    res.status(500).json({ error: 'Failed to create poll' });
  }
};

/**
 * Vote on poll
 */
export const votePoll = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, pollId } = req.params;
    const { optionIndex } = req.body;

    await liveClassService.votePoll(id, pollId, optionIndex);

    res.json({ message: 'Vote recorded' });
  } catch (error) {
    console.error('Vote poll error:', error);
    res.status(500).json({ error: 'Failed to vote on poll' });
  }
};

/**
 * Get polls
 */
export const getPolls = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { active } = req.query;

    const liveClass = await LiveClass.findById(id);

    if (!liveClass) {
      res.status(404).json({ error: 'Live class not found' });
      return;
    }

    let polls = liveClass.polls;

    if (active === 'true') {
      polls = polls.filter((p) => p.isActive);
    }

    res.json({ polls });
  } catch (error) {
    console.error('Get polls error:', error);
    res.status(500).json({ error: 'Failed to get polls' });
  }
};

/**
 * Raise hand
 */
export const raiseHand = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    await liveClassService.raiseHand(id, userId);

    res.json({ message: 'Hand raised' });
  } catch (error) {
    console.error('Raise hand error:', error);
    res.status(500).json({ error: 'Failed to raise hand' });
  }
};

/**
 * Lower hand
 */
export const lowerHand = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    await liveClassService.lowerHand(id, userId);

    res.json({ message: 'Hand lowered' });
  } catch (error) {
    console.error('Lower hand error:', error);
    res.status(500).json({ error: 'Failed to lower hand' });
  }
};

/**
 * Get participants
 */
export const getParticipants = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const liveClass = await LiveClass.findById(id).populate(
      'participants.userId',
      'name email avatar'
    );

    if (!liveClass) {
      res.status(404).json({ error: 'Live class not found' });
      return;
    }

    const activeParticipants = liveClass.participants.filter((p) => !p.leftAt);

    res.json({ participants: activeParticipants });
  } catch (error) {
    console.error('Get participants error:', error);
    res.status(500).json({ error: 'Failed to get participants' });
  }
};

/**
 * Get attendance report
 */
export const getAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const attendance = await liveClassService.getAttendanceReport(id);

    res.json({ attendance });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ error: 'Failed to get attendance' });
  }
};

/**
 * Get upcoming classes
 */
export const getUpcomingClasses = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 10, instructorId } = req.query;

    const classes = await liveClassService.getUpcomingClasses(
      Number(limit),
      instructorId as string
    );

    res.json({ classes });
  } catch (error) {
    console.error('Get upcoming classes error:', error);
    res.status(500).json({ error: 'Failed to get upcoming classes' });
  }
};

/**
 * Get live classes
 */
export const getLiveClasses = async (req: Request, res: Response): Promise<void> => {
  try {
    const classes = await liveClassService.getLiveClasses();

    res.json({ classes });
  } catch (error) {
    console.error('Get live classes error:', error);
    res.status(500).json({ error: 'Failed to get live classes' });
  }
};

/**
 * Update class
 */
export const updateClass = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const updates = req.body;

    const liveClass = await LiveClass.findById(id);

    if (!liveClass) {
      res.status(404).json({ error: 'Live class not found' });
      return;
    }

    // Check permission
    if (liveClass.instructorId.toString() !== userId) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    // Can only update scheduled classes
    if (liveClass.status !== 'scheduled') {
      res.status(400).json({ error: 'Cannot update class that is live or has ended' });
      return;
    }

    // Update allowed fields
    const allowedFields = [
      'title',
      'description',
      'scheduledStartTime',
      'scheduledEndTime',
      'maxParticipants',
      'allowChat',
      'allowQA',
      'allowScreenShare',
      'allowRecording',
      'requireApproval',
      'features',
      'tags',
    ];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        (liveClass as any)[field] = updates[field];
      }
    }

    await liveClass.save();

    res.json({ message: 'Class updated', class: liveClass });
  } catch (error) {
    console.error('Update class error:', error);
    res.status(500).json({ error: 'Failed to update class' });
  }
};

/**
 * Delete class
 */
export const deleteClass = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const liveClass = await LiveClass.findById(id);

    if (!liveClass) {
      res.status(404).json({ error: 'Live class not found' });
      return;
    }

    // Check permission
    if (liveClass.instructorId.toString() !== userId) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    // Can only delete scheduled classes
    if (liveClass.status !== 'scheduled') {
      res.status(400).json({ error: 'Cannot delete class that is live or has ended' });
      return;
    }

    await LiveClass.findByIdAndDelete(id);

    res.json({ message: 'Class deleted' });
  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({ error: 'Failed to delete class' });
  }
};

/**
 * Get class analytics
 */
export const getClassAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const liveClass = await LiveClass.findById(id);

    if (!liveClass) {
      res.status(404).json({ error: 'Live class not found' });
      return;
    }

    res.json({ analytics: liveClass.analytics });
  } catch (error) {
    console.error('Get class analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
};
