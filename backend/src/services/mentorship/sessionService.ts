import mongoose from 'mongoose';
import { MentorshipSession, IMentorshipSession } from '../../models/MentorshipSession';
import { Mentor } from '../../models/Mentor';

export interface ISessionUpdate {
  status?: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  actionItems?: {
    description: string;
    assignedTo: 'student' | 'mentor';
    dueDate?: Date;
  }[];
  goals?: string[];
  goalsAchieved?: string[];
  tags?: string[];
}

export interface ISessionFeedbackRequest {
  sessionId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userType: 'student' | 'mentor';
  rating: number;
  comment: string;
  wouldRecommend: boolean;
  whatWentWell?: string;
  whatToImprove?: string;
}

export class SessionService {
  /**
   * Start a session (mark as in-progress and record join time)
   */
  async startSession(
    sessionId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    userType: 'mentor' | 'student'
  ): Promise<IMentorshipSession> {
    try {
      const session = await MentorshipSession.findById(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Update join time
      if (userType === 'mentor') {
        session.mentorJoinedAt = new Date();
      } else {
        session.studentJoinedAt = new Date();
      }

      // If both have joined, mark as in-progress
      if (session.mentorJoinedAt && session.studentJoinedAt && session.status === 'confirmed') {
        session.status = 'in-progress';
      }

      await session.save();
      return session;
    } catch (error) {
      console.error('Error starting session:', error);
      throw error;
    }
  }

  /**
   * End a session (record leave time and update status)
   */
  async endSession(
    sessionId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    userType: 'mentor' | 'student'
  ): Promise<IMentorshipSession> {
    try {
      const session = await MentorshipSession.findById(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Update leave time
      if (userType === 'mentor') {
        session.mentorLeftAt = new Date();
      } else {
        session.studentLeftAt = new Date();
      }

      // If mentor has left, mark session as completed
      if (session.mentorLeftAt && session.status === 'in-progress') {
        session.markAsCompleted();

        // Update mentor stats
        const mentor = await Mentor.findOne({ userId: session.mentorId });
        if (mentor) {
          mentor.updateStats({ completed: true, earnings: session.amount });
          await mentor.save();
        }
      }

      await session.save();
      return session;
    } catch (error) {
      console.error('Error ending session:', error);
      throw error;
    }
  }

  /**
   * Add a note to a session
   */
  async addNote(
    sessionId: mongoose.Types.ObjectId,
    authorId: mongoose.Types.ObjectId,
    content: string,
    isPrivate: boolean = false
  ): Promise<IMentorshipSession> {
    try {
      const session = await MentorshipSession.findById(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      session.addNote(authorId, content, isPrivate);
      await session.save();

      return session;
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  }

  /**
   * Add action items to a session
   */
  async addActionItems(
    sessionId: mongoose.Types.ObjectId,
    actionItems: {
      description: string;
      assignedTo: 'student' | 'mentor';
      dueDate?: Date;
    }[]
  ): Promise<IMentorshipSession> {
    try {
      const session = await MentorshipSession.findById(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      for (const item of actionItems) {
        session.addActionItem(item.description, item.assignedTo, item.dueDate);
      }

      await session.save();
      return session;
    } catch (error) {
      console.error('Error adding action items:', error);
      throw error;
    }
  }

  /**
   * Complete an action item
   */
  async completeActionItem(
    sessionId: mongoose.Types.ObjectId,
    actionItemId: string
  ): Promise<IMentorshipSession> {
    try {
      const session = await MentorshipSession.findById(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      const completed = session.completeActionItem(actionItemId);
      if (!completed) {
        throw new Error('Action item not found');
      }

      await session.save();
      return session;
    } catch (error) {
      console.error('Error completing action item:', error);
      throw error;
    }
  }

  /**
   * Add shared resources to a session
   */
  async addSharedResource(
    sessionId: mongoose.Types.ObjectId,
    resource: {
      type: 'link' | 'file' | 'code' | 'document';
      title: string;
      url: string;
      uploadedBy: mongoose.Types.ObjectId;
    }
  ): Promise<IMentorshipSession> {
    try {
      const session = await MentorshipSession.findById(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      session.sharedResources.push({
        ...resource,
        uploadedAt: new Date(),
      });

      await session.save();
      return session;
    } catch (error) {
      console.error('Error adding shared resource:', error);
      throw error;
    }
  }

  /**
   * Save code snapshot during session
   */
  async saveCodeSnapshot(
    sessionId: mongoose.Types.ObjectId,
    snapshot: {
      language: string;
      code: string;
      description?: string;
    }
  ): Promise<IMentorshipSession> {
    try {
      const session = await MentorshipSession.findById(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      session.codeSnapshots.push({
        ...snapshot,
        timestamp: new Date(),
      });

      await session.save();
      return session;
    } catch (error) {
      console.error('Error saving code snapshot:', error);
      throw error;
    }
  }

  /**
   * Save whiteboard data
   */
  async saveWhiteboardData(
    sessionId: mongoose.Types.ObjectId,
    whiteboardData: string
  ): Promise<IMentorshipSession> {
    try {
      const session = await MentorshipSession.findById(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      session.whiteboardData = whiteboardData;
      await session.save();

      return session;
    } catch (error) {
      console.error('Error saving whiteboard data:', error);
      throw error;
    }
  }

  /**
   * Add session feedback
   */
  async addFeedback(request: ISessionFeedbackRequest): Promise<IMentorshipSession> {
    try {
      const session = await MentorshipSession.findById(request.sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      if (session.status !== 'completed') {
        throw new Error('Can only provide feedback for completed sessions');
      }

      const feedback = {
        rating: request.rating,
        comment: request.comment,
        wouldRecommend: request.wouldRecommend,
        whatWentWell: request.whatWentWell,
        whatToImprove: request.whatToImprove,
        createdAt: new Date(),
      };

      if (request.userType === 'student') {
        session.studentFeedback = feedback;

        // Add review to mentor
        const mentor = await Mentor.findById(session.mentorId);
        if (mentor) {
          mentor.addReview(
            request.userId,
            request.sessionId,
            request.rating,
            request.comment
          );
          await mentor.save();
        }
      } else {
        session.mentorFeedback = feedback;
      }

      await session.save();
      return session;
    } catch (error) {
      console.error('Error adding feedback:', error);
      throw error;
    }
  }

  /**
   * Upload session recording
   */
  async uploadRecording(
    sessionId: mongoose.Types.ObjectId,
    recording: {
      url: string;
      duration: number;
      size: number;
      format: string;
    }
  ): Promise<IMentorshipSession> {
    try {
      const session = await MentorshipSession.findById(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      session.recordings.push({
        ...recording,
        uploadedAt: new Date(),
      });

      await session.save();
      return session;
    } catch (error) {
      console.error('Error uploading recording:', error);
      throw error;
    }
  }

  /**
   * Get session history for a student
   */
  async getSessionHistory(
    studentId: mongoose.Types.ObjectId,
    filters?: {
      status?: string;
      mentorId?: mongoose.Types.ObjectId;
      startDate?: Date;
      endDate?: Date;
    },
    page: number = 1,
    limit: number = 20
  ): Promise<{ sessions: IMentorshipSession[]; total: number; pages: number }> {
    try {
      const query: any = { studentId };

      if (filters?.status) {
        query.status = filters.status;
      }

      if (filters?.mentorId) {
        query.mentorId = filters.mentorId;
      }

      if (filters?.startDate || filters?.endDate) {
        query.scheduledAt = {};
        if (filters.startDate) {
          query.scheduledAt.$gte = filters.startDate;
        }
        if (filters.endDate) {
          query.scheduledAt.$lte = filters.endDate;
        }
      }

      const total = await MentorshipSession.countDocuments(query);
      const pages = Math.ceil(total / limit);
      const skip = (page - 1) * limit;

      const sessions = await MentorshipSession.find(query)
        .populate('mentorId')
        .sort({ scheduledAt: -1 })
        .skip(skip)
        .limit(limit);

      return { sessions, total, pages };
    } catch (error) {
      console.error('Error getting session history:', error);
      throw new Error('Failed to get session history');
    }
  }

  /**
   * Get mentor session history
   */
  async getMentorSessionHistory(
    mentorId: mongoose.Types.ObjectId,
    filters?: {
      status?: string;
      studentId?: mongoose.Types.ObjectId;
      startDate?: Date;
      endDate?: Date;
    },
    page: number = 1,
    limit: number = 20
  ): Promise<{ sessions: IMentorshipSession[]; total: number; pages: number }> {
    try {
      const query: any = { mentorId };

      if (filters?.status) {
        query.status = filters.status;
      }

      if (filters?.studentId) {
        query.studentId = filters.studentId;
      }

      if (filters?.startDate || filters?.endDate) {
        query.scheduledAt = {};
        if (filters.startDate) {
          query.scheduledAt.$gte = filters.startDate;
        }
        if (filters.endDate) {
          query.scheduledAt.$lte = filters.endDate;
        }
      }

      const total = await MentorshipSession.countDocuments(query);
      const pages = Math.ceil(total / limit);
      const skip = (page - 1) * limit;

      const sessions = await MentorshipSession.find(query)
        .populate('studentId')
        .sort({ scheduledAt: -1 })
        .skip(skip)
        .limit(limit);

      return { sessions, total, pages };
    } catch (error) {
      console.error('Error getting mentor session history:', error);
      throw new Error('Failed to get mentor session history');
    }
  }

  /**
   * Get session analytics for a student
   */
  async getStudentSessionAnalytics(
    studentId: mongoose.Types.ObjectId
  ): Promise<{
    totalSessions: number;
    completedSessions: number;
    cancelledSessions: number;
    upcomingSessions: number;
    totalHours: number;
    averageRating: number;
    mentorsWorkedWith: number;
    topTopics: { topic: string; count: number }[];
  }> {
    try {
      const sessions = await MentorshipSession.find({ studentId });

      const completed = sessions.filter((s) => s.status === 'completed');
      const cancelled = sessions.filter((s) => s.status === 'cancelled');
      const upcoming = sessions.filter(
        (s) => s.status === 'scheduled' || s.status === 'confirmed'
      );

      const totalHours = completed.reduce((sum, s) => sum + (s.actualDuration || s.duration), 0) / 60;

      const ratings = completed
        .filter((s) => s.mentorFeedback?.rating)
        .map((s) => s.mentorFeedback!.rating);
      const averageRating = ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
        : 0;

      const uniqueMentors = new Set(sessions.map((s) => s.mentorId.toString()));

      // Get top topics from tags
      const topicCounts = new Map<string, number>();
      sessions.forEach((s) => {
        s.tags?.forEach((tag) => {
          topicCounts.set(tag, (topicCounts.get(tag) || 0) + 1);
        });
      });

      const topTopics = Array.from(topicCounts.entries())
        .map(([topic, count]) => ({ topic, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        totalSessions: sessions.length,
        completedSessions: completed.length,
        cancelledSessions: cancelled.length,
        upcomingSessions: upcoming.length,
        totalHours: Math.round(totalHours * 10) / 10,
        averageRating: Math.round(averageRating * 10) / 10,
        mentorsWorkedWith: uniqueMentors.size,
        topTopics,
      };
    } catch (error) {
      console.error('Error getting student session analytics:', error);
      throw new Error('Failed to get student session analytics');
    }
  }

  /**
   * Get session analytics for a mentor
   */
  async getMentorSessionAnalytics(
    mentorId: mongoose.Types.ObjectId
  ): Promise<{
    totalSessions: number;
    completedSessions: number;
    cancelledSessions: number;
    upcomingSessions: number;
    totalHours: number;
    totalEarnings: number;
    averageRating: number;
    studentsHelped: number;
    completionRate: number;
  }> {
    try {
      const sessions = await MentorshipSession.find({ mentorId });

      const completed = sessions.filter((s) => s.status === 'completed');
      const cancelled = sessions.filter((s) => s.status === 'cancelled');
      const upcoming = sessions.filter(
        (s) => s.status === 'scheduled' || s.status === 'confirmed'
      );

      const totalHours = completed.reduce((sum, s) => sum + (s.actualDuration || s.duration), 0) / 60;

      const totalEarnings = completed.reduce(
        (sum, s) => sum + (s.paymentStatus === 'completed' ? s.amount : 0),
        0
      );

      const ratings = completed
        .filter((s) => s.studentFeedback?.rating)
        .map((s) => s.studentFeedback!.rating);
      const averageRating = ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
        : 0;

      const uniqueStudents = new Set(sessions.map((s) => s.studentId.toString()));

      const completionRate = sessions.length > 0
        ? (completed.length / sessions.length) * 100
        : 0;

      return {
        totalSessions: sessions.length,
        completedSessions: completed.length,
        cancelledSessions: cancelled.length,
        upcomingSessions: upcoming.length,
        totalHours: Math.round(totalHours * 10) / 10,
        totalEarnings: Math.round(totalEarnings * 100) / 100,
        averageRating: Math.round(averageRating * 10) / 10,
        studentsHelped: uniqueStudents.size,
        completionRate: Math.round(completionRate * 10) / 10,
      };
    } catch (error) {
      console.error('Error getting mentor session analytics:', error);
      throw new Error('Failed to get mentor session analytics');
    }
  }

  /**
   * Schedule follow-up session
   */
  async scheduleFollowUp(
    sessionId: mongoose.Types.ObjectId,
    followUpSessionId: mongoose.Types.ObjectId
  ): Promise<IMentorshipSession> {
    try {
      const session = await MentorshipSession.findById(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      session.followUpScheduled = true;
      session.followUpSessionId = followUpSessionId;
      await session.save();

      return session;
    } catch (error) {
      console.error('Error scheduling follow-up:', error);
      throw error;
    }
  }

  /**
   * Mark session as no-show
   */
  async markNoShow(
    sessionId: mongoose.Types.ObjectId,
    noShowParty: 'mentor' | 'student'
  ): Promise<IMentorshipSession> {
    try {
      const session = await MentorshipSession.findById(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      session.status = 'no-show';
      session.notes.push({
        author: session.mentorId,
        content: `${noShowParty === 'mentor' ? 'Mentor' : 'Student'} did not show up for the session`,
        isPrivate: false,
        createdAt: new Date(),
      });

      await session.save();

      // Update stats
      if (noShowParty === 'student') {
        const mentor = await Mentor.findById(session.mentorId);
        if (mentor) {
          mentor.updateStats({ cancelled: true });
          await mentor.save();
        }
      }

      return session;
    } catch (error) {
      console.error('Error marking no-show:', error);
      throw error;
    }
  }
}

export const sessionService = new SessionService();
