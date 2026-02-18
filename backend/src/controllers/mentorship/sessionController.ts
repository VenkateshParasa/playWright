import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { bookingService } from '../../services/mentorship/bookingService';
import { sessionService } from '../../services/mentorship/sessionService';

export class SessionController {
  /**
   * Book a new session
   */
  async bookSession(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore
      const studentId = req.user.userId;
      // @ts-ignore
      const tenantId = req.user.tenantId;

      const bookingRequest = {
        ...req.body,
        studentId: new mongoose.Types.ObjectId(studentId),
        tenantId: new mongoose.Types.ObjectId(tenantId),
        mentorId: new mongoose.Types.ObjectId(req.body.mentorId),
        scheduledAt: new Date(req.body.scheduledAt),
      };

      const session = await bookingService.bookSession(bookingRequest);

      res.status(201).json({
        success: true,
        message: 'Session booked successfully',
        data: session,
      });
    } catch (error) {
      console.error('Error booking session:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to book session',
      });
    }
  }

  /**
   * Get available time slots for a mentor
   */
  async getAvailableSlots(req: Request, res: Response): Promise<void> {
    try {
      const { mentorId } = req.params;
      const { startDate, endDate, duration = 60 } = req.query;

      const slots = await bookingService.getAvailableSlots(
        new mongoose.Types.ObjectId(mentorId),
        new Date(startDate as string),
        new Date(endDate as string),
        parseInt(duration as string)
      );

      res.json({
        success: true,
        data: slots,
      });
    } catch (error) {
      console.error('Error getting available slots:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get available slots',
      });
    }
  }

  /**
   * Reschedule a session
   */
  async rescheduleSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { newStartTime, reason } = req.body;

      const session = await bookingService.rescheduleSession(
        new mongoose.Types.ObjectId(sessionId),
        new Date(newStartTime),
        reason
      );

      res.json({
        success: true,
        message: 'Session rescheduled successfully',
        data: session,
      });
    } catch (error) {
      console.error('Error rescheduling session:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to reschedule session',
      });
    }
  }

  /**
   * Cancel a session
   */
  async cancelSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { reason, cancelledBy } = req.body;

      const session = await bookingService.cancelSession(
        new mongoose.Types.ObjectId(sessionId),
        cancelledBy,
        reason
      );

      res.json({
        success: true,
        message: 'Session cancelled successfully',
        data: session,
      });
    } catch (error) {
      console.error('Error cancelling session:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to cancel session',
      });
    }
  }

  /**
   * Start a session
   */
  async startSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      // @ts-ignore
      const userId = req.user.userId;
      const { userType } = req.body;

      const session = await sessionService.startSession(
        new mongoose.Types.ObjectId(sessionId),
        new mongoose.Types.ObjectId(userId),
        userType
      );

      res.json({
        success: true,
        message: 'Session started',
        data: session,
      });
    } catch (error) {
      console.error('Error starting session:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start session',
      });
    }
  }

  /**
   * End a session
   */
  async endSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      // @ts-ignore
      const userId = req.user.userId;
      const { userType } = req.body;

      const session = await sessionService.endSession(
        new mongoose.Types.ObjectId(sessionId),
        new mongoose.Types.ObjectId(userId),
        userType
      );

      res.json({
        success: true,
        message: 'Session ended',
        data: session,
      });
    } catch (error) {
      console.error('Error ending session:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to end session',
      });
    }
  }

  /**
   * Add session note
   */
  async addNote(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      // @ts-ignore
      const authorId = req.user.userId;
      const { content, isPrivate } = req.body;

      const session = await sessionService.addNote(
        new mongoose.Types.ObjectId(sessionId),
        new mongoose.Types.ObjectId(authorId),
        content,
        isPrivate
      );

      res.json({
        success: true,
        message: 'Note added successfully',
        data: session,
      });
    } catch (error) {
      console.error('Error adding note:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add note',
      });
    }
  }

  /**
   * Add action items
   */
  async addActionItems(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { actionItems } = req.body;

      const session = await sessionService.addActionItems(
        new mongoose.Types.ObjectId(sessionId),
        actionItems
      );

      res.json({
        success: true,
        message: 'Action items added successfully',
        data: session,
      });
    } catch (error) {
      console.error('Error adding action items:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add action items',
      });
    }
  }

  /**
   * Submit session feedback
   */
  async submitFeedback(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      // @ts-ignore
      const userId = req.user.userId;
      const { rating, comment, wouldRecommend, whatWentWell, whatToImprove, userType } = req.body;

      const session = await sessionService.addFeedback({
        sessionId: new mongoose.Types.ObjectId(sessionId),
        userId: new mongoose.Types.ObjectId(userId),
        userType,
        rating,
        comment,
        wouldRecommend,
        whatWentWell,
        whatToImprove,
      });

      res.json({
        success: true,
        message: 'Feedback submitted successfully',
        data: session,
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to submit feedback',
      });
    }
  }

  /**
   * Get session history
   */
  async getSessionHistory(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore
      const userId = req.user.userId;
      const { userType, page, limit, status, startDate, endDate } = req.query;

      const filters: any = {};
      if (status) filters.status = status;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const result = userType === 'mentor'
        ? await sessionService.getMentorSessionHistory(
            new mongoose.Types.ObjectId(userId),
            filters,
            parseInt(page as string) || 1,
            parseInt(limit as string) || 20
          )
        : await sessionService.getSessionHistory(
            new mongoose.Types.ObjectId(userId),
            filters,
            parseInt(page as string) || 1,
            parseInt(limit as string) || 20
          );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Error getting session history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get session history',
      });
    }
  }

  /**
   * Get session analytics
   */
  async getSessionAnalytics(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore
      const userId = req.user.userId;
      const { userType } = req.query;

      const analytics = userType === 'mentor'
        ? await sessionService.getMentorSessionAnalytics(new mongoose.Types.ObjectId(userId))
        : await sessionService.getStudentSessionAnalytics(new mongoose.Types.ObjectId(userId));

      res.json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      console.error('Error getting session analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get session analytics',
      });
    }
  }

  /**
   * Save code snapshot
   */
  async saveCodeSnapshot(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { language, code, description } = req.body;

      const session = await sessionService.saveCodeSnapshot(
        new mongoose.Types.ObjectId(sessionId),
        { language, code, description }
      );

      res.json({
        success: true,
        message: 'Code snapshot saved',
        data: session,
      });
    } catch (error) {
      console.error('Error saving code snapshot:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to save code snapshot',
      });
    }
  }

  /**
   * Save whiteboard data
   */
  async saveWhiteboard(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { whiteboardData } = req.body;

      const session = await sessionService.saveWhiteboardData(
        new mongoose.Types.ObjectId(sessionId),
        whiteboardData
      );

      res.json({
        success: true,
        message: 'Whiteboard saved',
        data: session,
      });
    } catch (error) {
      console.error('Error saving whiteboard:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to save whiteboard',
      });
    }
  }

  /**
   * Book recurring sessions
   */
  async bookRecurringSessions(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore
      const studentId = req.user.userId;
      // @ts-ignore
      const tenantId = req.user.tenantId;

      const { recurrence, ...bookingData } = req.body;

      const bookingRequest = {
        ...bookingData,
        studentId: new mongoose.Types.ObjectId(studentId),
        tenantId: new mongoose.Types.ObjectId(tenantId),
        mentorId: new mongoose.Types.ObjectId(bookingData.mentorId),
        scheduledAt: new Date(bookingData.scheduledAt),
      };

      const sessions = await bookingService.bookRecurringSessions(bookingRequest, recurrence);

      res.status(201).json({
        success: true,
        message: 'Recurring sessions booked successfully',
        data: sessions,
      });
    } catch (error) {
      console.error('Error booking recurring sessions:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to book recurring sessions',
      });
    }
  }
}

export const sessionController = new SessionController();
