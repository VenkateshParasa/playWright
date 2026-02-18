import mongoose from 'mongoose';
import { MentorshipSession, IMentorshipSession } from '../../models/MentorshipSession';
import { Mentor } from '../../models/Mentor';

export interface IBookingRequest {
  mentorId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  type: 'one-on-one' | 'office-hours' | 'group' | 'workshop';
  title: string;
  description?: string;
  scheduledAt: Date;
  duration: number; // in minutes
  timezone: string;
  agenda?: string[];
  tags?: string[];
}

export interface IAvailabilitySlot {
  date: Date;
  startTime: Date;
  endTime: Date;
  available: boolean;
  reason?: string;
}

export class BookingService {
  /**
   * Book a session with a mentor
   */
  async bookSession(request: IBookingRequest): Promise<IMentorshipSession> {
    try {
      // Validate mentor exists and is available
      const mentor = await Mentor.findById(request.mentorId);
      if (!mentor) {
        throw new Error('Mentor not found');
      }

      if (mentor.status !== 'active') {
        throw new Error('Mentor is not currently active');
      }

      if (!mentor.acceptingNewStudents) {
        throw new Error('Mentor is not accepting new students');
      }

      // Check if the time slot is available
      const isAvailable = await this.checkAvailability(
        request.mentorId,
        request.scheduledAt,
        request.duration
      );

      if (!isAvailable) {
        throw new Error('The selected time slot is not available');
      }

      // Check mentor's session limit
      const weekStart = new Date(request.scheduledAt);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const sessionsThisWeek = await MentorshipSession.countDocuments({
        mentorId: request.mentorId,
        scheduledAt: { $gte: weekStart, $lt: weekEnd },
        status: { $in: ['scheduled', 'confirmed', 'in-progress'] },
      });

      if (sessionsThisWeek >= mentor.maxSessionsPerWeek) {
        throw new Error('Mentor has reached maximum sessions for this week');
      }

      // Calculate session times
      const startTime = new Date(request.scheduledAt);
      const endTime = new Date(startTime.getTime() + request.duration * 60000);

      // Determine if payment is required
      const isPaid = mentor.pricing[request.type] > 0;
      const amount = isPaid ? mentor.pricing[request.type] : 0;

      // Determine initial status based on mentor settings
      const initialStatus = mentor.autoAcceptBookings ? 'confirmed' : 'scheduled';

      // Create session
      const session = new MentorshipSession({
        tenantId: request.tenantId,
        mentorId: request.mentorId,
        studentId: request.studentId,
        type: request.type,
        title: request.title,
        description: request.description,
        agenda: request.agenda,
        scheduledAt: request.scheduledAt,
        startTime,
        endTime,
        duration: request.duration,
        timezone: request.timezone,
        status: initialStatus,
        meetingProvider: mentor.videoConferencePreference,
        isPaid,
        amount,
        currency: 'USD',
        paymentStatus: isPaid ? 'pending' : 'not-required',
        tags: request.tags,
      });

      await session.save();

      // Generate meeting link based on provider
      const meetingLink = await this.generateMeetingLink(
        session._id.toString(),
        mentor.videoConferencePreference
      );

      session.meetingLink = meetingLink;
      await session.save();

      // Schedule reminders
      await this.scheduleReminders(session._id);

      return session;
    } catch (error) {
      console.error('Error booking session:', error);
      throw error;
    }
  }

  /**
   * Check if a time slot is available for a mentor
   */
  async checkAvailability(
    mentorId: mongoose.Types.ObjectId,
    startTime: Date,
    duration: number
  ): Promise<boolean> {
    try {
      const endTime = new Date(startTime.getTime() + duration * 60000);

      // Check if mentor has any conflicting sessions
      const conflictingSessions = await MentorshipSession.findOne({
        mentorId,
        status: { $in: ['scheduled', 'confirmed', 'in-progress'] },
        $or: [
          {
            startTime: { $lte: startTime },
            endTime: { $gt: startTime },
          },
          {
            startTime: { $lt: endTime },
            endTime: { $gte: endTime },
          },
          {
            startTime: { $gte: startTime },
            endTime: { $lte: endTime },
          },
        ],
      });

      return !conflictingSessions;
    } catch (error) {
      console.error('Error checking availability:', error);
      throw new Error('Failed to check availability');
    }
  }

  /**
   * Get available time slots for a mentor for a specific date range
   */
  async getAvailableSlots(
    mentorId: mongoose.Types.ObjectId,
    startDate: Date,
    endDate: Date,
    duration: number = 60
  ): Promise<IAvailabilitySlot[]> {
    try {
      const mentor = await Mentor.findById(mentorId);
      if (!mentor) {
        throw new Error('Mentor not found');
      }

      const slots: IAvailabilitySlot[] = [];

      // Get all booked sessions in the date range
      const bookedSessions = await MentorshipSession.find({
        mentorId,
        scheduledAt: { $gte: startDate, $lte: endDate },
        status: { $in: ['scheduled', 'confirmed', 'in-progress'] },
      }).select('startTime endTime');

      // Iterate through each day in the range
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();

        // Find mentor's availability for this day
        const dayAvailability = mentor.availability.filter((a) => a.dayOfWeek === dayOfWeek);

        if (dayAvailability.length > 0) {
          for (const avail of dayAvailability) {
            // Parse time slots
            const [startHour, startMinute] = avail.startTime.split(':').map(Number);
            const [endHour, endMinute] = avail.endTime.split(':').map(Number);

            const slotStart = new Date(currentDate);
            slotStart.setHours(startHour, startMinute, 0, 0);

            const slotEnd = new Date(currentDate);
            slotEnd.setHours(endHour, endMinute, 0, 0);

            // Generate slots for this availability window
            let currentSlot = new Date(slotStart);
            while (currentSlot < slotEnd) {
              const slotEndTime = new Date(currentSlot.getTime() + duration * 60000);

              if (slotEndTime <= slotEnd) {
                // Check if this slot conflicts with any booked session
                const isBooked = bookedSessions.some((session) => {
                  return (
                    (currentSlot >= session.startTime && currentSlot < session.endTime) ||
                    (slotEndTime > session.startTime && slotEndTime <= session.endTime) ||
                    (currentSlot <= session.startTime && slotEndTime >= session.endTime)
                  );
                });

                // Check if slot is in the past
                const isPast = currentSlot < new Date();

                slots.push({
                  date: new Date(currentDate),
                  startTime: new Date(currentSlot),
                  endTime: new Date(slotEndTime),
                  available: !isBooked && !isPast,
                  reason: isPast ? 'Past time slot' : isBooked ? 'Already booked' : undefined,
                });
              }

              // Move to next slot (30-minute intervals)
              currentSlot = new Date(currentSlot.getTime() + 30 * 60000);
            }
          }
        }

        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return slots;
    } catch (error) {
      console.error('Error getting available slots:', error);
      throw new Error('Failed to get available slots');
    }
  }

  /**
   * Reschedule a session
   */
  async rescheduleSession(
    sessionId: mongoose.Types.ObjectId,
    newStartTime: Date,
    rescheduleReason?: string
  ): Promise<IMentorshipSession> {
    try {
      const session = await MentorshipSession.findById(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      if (!session.canBeRescheduled()) {
        throw new Error('Session cannot be rescheduled (less than 24 hours notice)');
      }

      // Check new time availability
      const isAvailable = await this.checkAvailability(
        session.mentorId,
        newStartTime,
        session.duration
      );

      if (!isAvailable) {
        throw new Error('The new time slot is not available');
      }

      // Update session times
      session.scheduledAt = newStartTime;
      session.startTime = newStartTime;
      session.endTime = new Date(newStartTime.getTime() + session.duration * 60000);

      // Add note about rescheduling
      session.notes.push({
        author: session.studentId,
        content: `Session rescheduled. Reason: ${rescheduleReason || 'Not specified'}`,
        isPrivate: false,
        createdAt: new Date(),
      });

      await session.save();

      // Reschedule reminders
      await this.scheduleReminders(session._id);

      return session;
    } catch (error) {
      console.error('Error rescheduling session:', error);
      throw error;
    }
  }

  /**
   * Cancel a session
   */
  async cancelSession(
    sessionId: mongoose.Types.ObjectId,
    cancelledBy: 'mentor' | 'student' | 'system',
    reason?: string
  ): Promise<IMentorshipSession> {
    try {
      const session = await MentorshipSession.findById(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      if (!session.canBeCancelled()) {
        throw new Error('Session cannot be cancelled (less than 24 hours notice)');
      }

      session.cancel(cancelledBy, reason);

      // Handle refund if payment was made
      if (session.paymentStatus === 'completed') {
        // Calculate refund based on cancellation time
        const hoursUntilSession = (session.scheduledAt.getTime() - Date.now()) / (1000 * 60 * 60);

        if (hoursUntilSession >= 48) {
          // Full refund if cancelled 48+ hours in advance
          session.paymentStatus = 'refunded';
        } else if (hoursUntilSession >= 24) {
          // 50% refund if cancelled 24-48 hours in advance
          // This would need to be handled by payment service
        }
      }

      await session.save();

      // Update mentor stats
      const mentor = await Mentor.findById(session.mentorId);
      if (mentor) {
        mentor.updateStats({ cancelled: true });
        await mentor.save();
      }

      return session;
    } catch (error) {
      console.error('Error cancelling session:', error);
      throw error;
    }
  }

  /**
   * Confirm a session (for mentors with manual approval)
   */
  async confirmSession(sessionId: mongoose.Types.ObjectId): Promise<IMentorshipSession> {
    try {
      const session = await MentorshipSession.findById(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      if (session.status !== 'scheduled') {
        throw new Error('Session cannot be confirmed');
      }

      session.status = 'confirmed';
      await session.save();

      return session;
    } catch (error) {
      console.error('Error confirming session:', error);
      throw error;
    }
  }

  /**
   * Generate meeting link based on provider
   */
  private async generateMeetingLink(
    sessionId: string,
    provider: 'zoom' | 'google-meet' | 'webrtc' | 'teams'
  ): Promise<string> {
    // In production, integrate with actual video conferencing APIs
    switch (provider) {
      case 'zoom':
        // Would integrate with Zoom API
        return `https://zoom.us/j/${sessionId}`;
      case 'google-meet':
        // Would integrate with Google Meet API
        return `https://meet.google.com/${sessionId}`;
      case 'teams':
        // Would integrate with Microsoft Teams API
        return `https://teams.microsoft.com/l/meetup-join/${sessionId}`;
      case 'webrtc':
      default:
        // Use internal WebRTC solution
        return `/mentorship/session/${sessionId}/room`;
    }
  }

  /**
   * Schedule reminders for a session
   */
  private async scheduleReminders(sessionId: mongoose.Types.ObjectId): Promise<void> {
    try {
      const session = await MentorshipSession.findById(sessionId);
      if (!session) return;

      // Clear existing reminders
      session.reminders = [];

      const scheduledTime = session.scheduledAt.getTime();
      const now = Date.now();

      // Schedule reminders at 24 hours, 1 hour, and 15 minutes before session
      const reminderTimes = [
        { hours: 24, type: 'email' as const },
        { hours: 1, type: 'email' as const },
        { minutes: 15, type: 'push' as const },
      ];

      for (const reminder of reminderTimes) {
        const reminderTime = reminder.hours
          ? scheduledTime - reminder.hours * 60 * 60 * 1000
          : scheduledTime - (reminder.minutes || 0) * 60 * 1000;

        if (reminderTime > now) {
          // In production, schedule actual notifications
          // For now, just record the reminder schedule
          session.reminders.push({
            type: reminder.type,
            sentAt: new Date(reminderTime),
            delivered: false,
          });
        }
      }

      await session.save();
    } catch (error) {
      console.error('Error scheduling reminders:', error);
    }
  }

  /**
   * Book recurring sessions
   */
  async bookRecurringSessions(
    request: IBookingRequest,
    recurrence: {
      frequency: 'weekly' | 'bi-weekly' | 'monthly';
      occurrences: number;
    }
  ): Promise<IMentorshipSession[]> {
    try {
      const sessions: IMentorshipSession[] = [];
      const recurringSeriesId = new mongoose.Types.ObjectId();

      let currentDate = new Date(request.scheduledAt);

      for (let i = 0; i < recurrence.occurrences; i++) {
        const sessionRequest = {
          ...request,
          scheduledAt: new Date(currentDate),
        };

        const session = await this.bookSession(sessionRequest);
        session.isRecurring = true;
        session.recurringSeriesId = recurringSeriesId;
        await session.save();

        sessions.push(session);

        // Calculate next occurrence
        switch (recurrence.frequency) {
          case 'weekly':
            currentDate.setDate(currentDate.getDate() + 7);
            break;
          case 'bi-weekly':
            currentDate.setDate(currentDate.getDate() + 14);
            break;
          case 'monthly':
            currentDate.setMonth(currentDate.getMonth() + 1);
            break;
        }
      }

      return sessions;
    } catch (error) {
      console.error('Error booking recurring sessions:', error);
      throw error;
    }
  }

  /**
   * Get upcoming sessions for a student
   */
  async getUpcomingSessions(
    studentId: mongoose.Types.ObjectId,
    limit: number = 10
  ): Promise<IMentorshipSession[]> {
    try {
      const sessions = await MentorshipSession.find({
        studentId,
        scheduledAt: { $gte: new Date() },
        status: { $in: ['scheduled', 'confirmed'] },
      })
        .populate('mentorId')
        .sort({ scheduledAt: 1 })
        .limit(limit);

      return sessions;
    } catch (error) {
      console.error('Error getting upcoming sessions:', error);
      throw new Error('Failed to get upcoming sessions');
    }
  }

  /**
   * Get upcoming sessions for a mentor
   */
  async getMentorUpcomingSessions(
    mentorId: mongoose.Types.ObjectId,
    limit: number = 10
  ): Promise<IMentorshipSession[]> {
    try {
      const sessions = await MentorshipSession.find({
        mentorId,
        scheduledAt: { $gte: new Date() },
        status: { $in: ['scheduled', 'confirmed'] },
      })
        .populate('studentId')
        .sort({ scheduledAt: 1 })
        .limit(limit);

      return sessions;
    } catch (error) {
      console.error('Error getting mentor upcoming sessions:', error);
      throw new Error('Failed to get mentor upcoming sessions');
    }
  }
}

export const bookingService = new BookingService();
