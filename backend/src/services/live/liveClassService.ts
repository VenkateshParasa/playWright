import { EventEmitter } from 'events';
import crypto from 'crypto';
import LiveClass, { ILiveClass } from '../../models/LiveClass.js';
import notificationService from '../notificationService.js';

interface ParticipantInfo {
  userId: string;
  name: string;
  email: string;
  role: 'viewer' | 'moderator' | 'speaker';
  joinedAt: Date;
}

interface ChatMessage {
  messageId: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
}

interface QAQuestion {
  questionId: string;
  userId: string;
  userName: string;
  question: string;
  askedAt: Date;
  upvotes: number;
  status: 'pending' | 'answered' | 'dismissed';
}

interface Poll {
  pollId: string;
  question: string;
  options: { text: string; votes: number }[];
  isActive: boolean;
  expiresAt?: Date;
}

class LiveClassService extends EventEmitter {
  private readonly RTMP_SERVER = process.env.RTMP_SERVER || 'rtmp://localhost/live';
  private readonly WEBRTC_SERVER = process.env.WEBRTC_SERVER || 'https://localhost:3478';

  /**
   * Schedule a new live class
   */
  async scheduleClass(data: {
    title: string;
    description: string;
    courseId?: string;
    instructorId: string;
    coInstructors?: string[];
    scheduledStartTime: Date;
    scheduledEndTime: Date;
    maxParticipants?: number;
    features?: {
      whiteboard?: boolean;
      breakoutRooms?: boolean;
      polls?: boolean;
      quizzes?: boolean;
    };
    allowChat?: boolean;
    allowQA?: boolean;
    allowScreenShare?: boolean;
    allowRecording?: boolean;
    requireApproval?: boolean;
    isPremium?: boolean;
    tags?: string[];
  }): Promise<ILiveClass> {
    const duration = Math.floor(
      (data.scheduledEndTime.getTime() - data.scheduledStartTime.getTime()) / 1000
    );

    // Generate stream key
    const streamKey = crypto.randomBytes(32).toString('hex');

    const liveClass = new LiveClass({
      ...data,
      duration,
      status: 'scheduled',
      streamConfig: {
        rtmpUrl: `${this.RTMP_SERVER}/${streamKey}`,
        streamKey,
        webrtcUrl: `${this.WEBRTC_SERVER}/${streamKey}`,
      },
      participants: [],
      chat: [],
      qaQueue: [],
      polls: [],
      attendance: [],
      breakoutRooms: [],
      analytics: {
        peakViewers: 0,
        totalViews: 0,
        averageDuration: 0,
        engagementRate: 0,
        chatMessages: 0,
        questionsAsked: 0,
      },
      notificationsSent: false,
      remindersSent: {
        oneDay: false,
        oneHour: false,
        fifteenMinutes: false,
      },
    });

    await liveClass.save();

    this.emit('class-scheduled', { classId: liveClass._id });

    return liveClass;
  }

  /**
   * Start live class
   */
  async startClass(classId: string, instructorId: string): Promise<ILiveClass> {
    const liveClass = await LiveClass.findById(classId);

    if (!liveClass) {
      throw new Error('Live class not found');
    }

    if (liveClass.instructorId.toString() !== instructorId) {
      throw new Error('Only the instructor can start the class');
    }

    if (liveClass.status !== 'scheduled') {
      throw new Error('Class has already started or ended');
    }

    liveClass.status = 'live';
    liveClass.actualStartTime = new Date();

    // Start recording if enabled
    if (liveClass.allowRecording) {
      liveClass.recording.status = 'recording';
    }

    await liveClass.save();

    this.emit('class-started', { classId: liveClass._id });

    // Send notifications to enrolled participants
    await this.notifyParticipants(classId, 'class-started');

    return liveClass;
  }

  /**
   * End live class
   */
  async endClass(classId: string, instructorId: string): Promise<ILiveClass> {
    const liveClass = await LiveClass.findById(classId);

    if (!liveClass) {
      throw new Error('Live class not found');
    }

    if (liveClass.instructorId.toString() !== instructorId) {
      throw new Error('Only the instructor can end the class');
    }

    if (liveClass.status !== 'live') {
      throw new Error('Class is not currently live');
    }

    liveClass.status = 'ended';
    liveClass.actualEndTime = new Date();

    // Stop recording
    if (liveClass.recording.status === 'recording') {
      liveClass.recording.status = 'processing';
    }

    // Update attendance
    for (const participant of liveClass.participants) {
      if (!participant.leftAt) {
        participant.leftAt = new Date();
      }

      const duration =
        (participant.leftAt.getTime() - participant.joinedAt.getTime()) / 1000;

      const existingAttendance = liveClass.attendance.find(
        (a) => a.userId.toString() === participant.userId.toString()
      );

      if (existingAttendance) {
        existingAttendance.duration += duration;
        existingAttendance.attended = existingAttendance.duration > 300; // 5 minutes minimum
      } else {
        liveClass.attendance.push({
          userId: participant.userId,
          joinedAt: participant.joinedAt,
          leftAt: participant.leftAt,
          duration,
          attended: duration > 300,
        });
      }
    }

    await liveClass.save();

    this.emit('class-ended', { classId: liveClass._id });

    return liveClass;
  }

  /**
   * Cancel live class
   */
  async cancelClass(classId: string, instructorId: string, reason?: string): Promise<void> {
    const liveClass = await LiveClass.findById(classId);

    if (!liveClass) {
      throw new Error('Live class not found');
    }

    if (liveClass.instructorId.toString() !== instructorId) {
      throw new Error('Only the instructor can cancel the class');
    }

    if (liveClass.status !== 'scheduled') {
      throw new Error('Cannot cancel a class that is live or has ended');
    }

    liveClass.status = 'cancelled';
    await liveClass.save();

    this.emit('class-cancelled', { classId: liveClass._id, reason });

    // Notify participants about cancellation
    await this.notifyParticipants(classId, 'class-cancelled', { reason });
  }

  /**
   * Join live class
   */
  async joinClass(
    classId: string,
    userId: string,
    role: 'viewer' | 'moderator' | 'speaker' = 'viewer'
  ): Promise<{ playbackUrl: string; token: string }> {
    const liveClass = await LiveClass.findById(classId);

    if (!liveClass) {
      throw new Error('Live class not found');
    }

    if (liveClass.status !== 'live') {
      throw new Error('Class is not currently live');
    }

    // Check max participants
    if (liveClass.participants.length >= liveClass.maxParticipants) {
      throw new Error('Class has reached maximum capacity');
    }

    // Check if user is already in class
    const existingParticipant = liveClass.participants.find(
      (p) => p.userId.toString() === userId && !p.leftAt
    );

    if (existingParticipant) {
      throw new Error('User is already in the class');
    }

    // Add participant
    liveClass.participants.push({
      userId: userId as any,
      joinedAt: new Date(),
      role,
      raisedHand: false,
      cameraEnabled: false,
      micEnabled: false,
      screenSharing: false,
    });

    // Update analytics
    liveClass.analytics.totalViews++;
    liveClass.analytics.peakViewers = Math.max(
      liveClass.analytics.peakViewers,
      liveClass.participants.filter((p) => !p.leftAt).length
    );

    await liveClass.save();

    this.emit('participant-joined', { classId, userId, role });

    // Generate access token
    const token = this.generateAccessToken(classId, userId, role);

    return {
      playbackUrl: liveClass.streamConfig.playbackUrl || liveClass.streamConfig.webrtcUrl || '',
      token,
    };
  }

  /**
   * Leave live class
   */
  async leaveClass(classId: string, userId: string): Promise<void> {
    const liveClass = await LiveClass.findById(classId);

    if (!liveClass) {
      throw new Error('Live class not found');
    }

    const participant = liveClass.participants.find(
      (p) => p.userId.toString() === userId && !p.leftAt
    );

    if (!participant) {
      throw new Error('Participant not found in class');
    }

    participant.leftAt = new Date();

    // Update attendance
    const duration = (participant.leftAt.getTime() - participant.joinedAt.getTime()) / 1000;

    const existingAttendance = liveClass.attendance.find(
      (a) => a.userId.toString() === userId
    );

    if (existingAttendance) {
      existingAttendance.duration += duration;
      existingAttendance.leftAt = participant.leftAt;
      existingAttendance.attended = existingAttendance.duration > 300;
    } else {
      liveClass.attendance.push({
        userId: participant.userId,
        joinedAt: participant.joinedAt,
        leftAt: participant.leftAt,
        duration,
        attended: duration > 300,
      });
    }

    await liveClass.save();

    this.emit('participant-left', { classId, userId });
  }

  /**
   * Send chat message
   */
  async sendChatMessage(classId: string, userId: string, message: string): Promise<ChatMessage> {
    const liveClass = await LiveClass.findById(classId);

    if (!liveClass) {
      throw new Error('Live class not found');
    }

    if (!liveClass.allowChat) {
      throw new Error('Chat is disabled for this class');
    }

    const messageId = crypto.randomBytes(16).toString('hex');

    liveClass.chat.push({
      messageId: messageId as any,
      userId: userId as any,
      message,
      timestamp: new Date(),
      isDeleted: false,
    });

    liveClass.analytics.chatMessages++;

    await liveClass.save();

    const chatMessage: ChatMessage = {
      messageId,
      userId,
      userName: 'User', // TODO: Get user name
      message,
      timestamp: new Date(),
    };

    this.emit('chat-message', { classId, message: chatMessage });

    return chatMessage;
  }

  /**
   * Ask question in Q&A
   */
  async askQuestion(classId: string, userId: string, question: string): Promise<QAQuestion> {
    const liveClass = await LiveClass.findById(classId);

    if (!liveClass) {
      throw new Error('Live class not found');
    }

    if (!liveClass.allowQA) {
      throw new Error('Q&A is disabled for this class');
    }

    const questionId = crypto.randomBytes(16).toString('hex');

    liveClass.qaQueue.push({
      questionId,
      userId: userId as any,
      question,
      askedAt: new Date(),
      upvotes: 0,
      status: 'pending',
    });

    liveClass.analytics.questionsAsked++;

    await liveClass.save();

    const qaQuestion: QAQuestion = {
      questionId,
      userId,
      userName: 'User', // TODO: Get user name
      question,
      askedAt: new Date(),
      upvotes: 0,
      status: 'pending',
    };

    this.emit('question-asked', { classId, question: qaQuestion });

    return qaQuestion;
  }

  /**
   * Answer question
   */
  async answerQuestion(
    classId: string,
    questionId: string,
    instructorId: string,
    answer: string
  ): Promise<void> {
    const liveClass = await LiveClass.findById(classId);

    if (!liveClass) {
      throw new Error('Live class not found');
    }

    const question = liveClass.qaQueue.find((q) => q.questionId === questionId);

    if (!question) {
      throw new Error('Question not found');
    }

    question.answer = answer;
    question.answeredAt = new Date();
    question.answeredBy = instructorId as any;
    question.status = 'answered';

    await liveClass.save();

    this.emit('question-answered', { classId, questionId, answer });
  }

  /**
   * Create poll
   */
  async createPoll(
    classId: string,
    question: string,
    options: string[],
    expiresIn?: number
  ): Promise<Poll> {
    const liveClass = await LiveClass.findById(classId);

    if (!liveClass) {
      throw new Error('Live class not found');
    }

    const pollId = crypto.randomBytes(16).toString('hex');

    const poll: Poll = {
      pollId,
      question,
      options: options.map((text) => ({ text, votes: 0 })),
      isActive: true,
      expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000) : undefined,
    };

    liveClass.polls.push(poll as any);
    await liveClass.save();

    this.emit('poll-created', { classId, poll });

    return poll;
  }

  /**
   * Vote on poll
   */
  async votePoll(classId: string, pollId: string, optionIndex: number): Promise<void> {
    const liveClass = await LiveClass.findById(classId);

    if (!liveClass) {
      throw new Error('Live class not found');
    }

    const poll = liveClass.polls.find((p) => p.pollId === pollId);

    if (!poll) {
      throw new Error('Poll not found');
    }

    if (!poll.isActive) {
      throw new Error('Poll is not active');
    }

    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      throw new Error('Invalid option index');
    }

    poll.options[optionIndex].votes++;
    await liveClass.save();

    this.emit('poll-voted', { classId, pollId, optionIndex });
  }

  /**
   * Raise hand
   */
  async raiseHand(classId: string, userId: string): Promise<void> {
    const liveClass = await LiveClass.findById(classId);

    if (!liveClass) {
      throw new Error('Live class not found');
    }

    const participant = liveClass.participants.find(
      (p) => p.userId.toString() === userId && !p.leftAt
    );

    if (!participant) {
      throw new Error('Participant not found');
    }

    participant.raisedHand = true;
    participant.raisedHandAt = new Date();

    await liveClass.save();

    this.emit('hand-raised', { classId, userId });
  }

  /**
   * Lower hand
   */
  async lowerHand(classId: string, userId: string): Promise<void> {
    const liveClass = await LiveClass.findById(classId);

    if (!liveClass) {
      throw new Error('Live class not found');
    }

    const participant = liveClass.participants.find(
      (p) => p.userId.toString() === userId && !p.leftAt
    );

    if (!participant) {
      throw new Error('Participant not found');
    }

    participant.raisedHand = false;
    participant.raisedHandAt = undefined;

    await liveClass.save();

    this.emit('hand-lowered', { classId, userId });
  }

  /**
   * Generate access token for participant
   */
  private generateAccessToken(
    classId: string,
    userId: string,
    role: string
  ): string {
    const payload = {
      classId,
      userId,
      role,
      exp: Math.floor(Date.now() / 1000) + 3600 * 4, // 4 hours
    };

    const token = crypto
      .createHmac('sha256', process.env.JWT_SECRET || 'your-secret-key')
      .update(JSON.stringify(payload))
      .digest('hex');

    return token;
  }

  /**
   * Send notifications to participants
   */
  private async notifyParticipants(
    classId: string,
    type: string,
    data?: any
  ): Promise<void> {
    // TODO: Implement notification logic
    // This would typically send emails or push notifications to enrolled participants
    console.log(`Sending ${type} notification for class ${classId}`, data);
  }

  /**
   * Get upcoming classes
   */
  async getUpcomingClasses(
    limit: number = 10,
    instructorId?: string
  ): Promise<ILiveClass[]> {
    const query: any = {
      status: 'scheduled',
      scheduledStartTime: { $gte: new Date() },
    };

    if (instructorId) {
      query.instructorId = instructorId;
    }

    return await LiveClass.find(query)
      .sort({ scheduledStartTime: 1 })
      .limit(limit)
      .populate('instructorId', 'name email');
  }

  /**
   * Get live classes
   */
  async getLiveClasses(): Promise<ILiveClass[]> {
    return await LiveClass.find({ status: 'live' })
      .sort({ actualStartTime: -1 })
      .populate('instructorId', 'name email');
  }

  /**
   * Get class details
   */
  async getClassDetails(classId: string): Promise<ILiveClass | null> {
    return await LiveClass.findById(classId)
      .populate('instructorId', 'name email')
      .populate('coInstructors', 'name email')
      .populate('participants.userId', 'name email');
  }

  /**
   * Get attendance report
   */
  async getAttendanceReport(classId: string): Promise<any[]> {
    const liveClass = await LiveClass.findById(classId).populate(
      'attendance.userId',
      'name email'
    );

    if (!liveClass) {
      throw new Error('Live class not found');
    }

    return liveClass.attendance.map((a) => ({
      user: a.userId,
      joinedAt: a.joinedAt,
      leftAt: a.leftAt,
      duration: a.duration,
      attended: a.attended,
    }));
  }
}

export default new LiveClassService();
