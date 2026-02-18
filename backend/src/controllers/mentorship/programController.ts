import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { MentorshipProgram } from '../../models/MentorshipProgram';

export class ProgramController {
  /**
   * Create a mentorship program
   */
  async createProgram(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore
      const tenantId = req.user.tenantId;
      const programData = {
        ...req.body,
        tenantId: new mongoose.Types.ObjectId(tenantId),
        mentorId: new mongoose.Types.ObjectId(req.body.mentorId),
        studentId: new mongoose.Types.ObjectId(req.body.studentId),
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
      };

      const program = new MentorshipProgram(programData);
      await program.save();

      res.status(201).json({
        success: true,
        message: 'Mentorship program created successfully',
        data: program,
      });
    } catch (error) {
      console.error('Error creating program:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create program',
      });
    }
  }

  /**
   * Update program
   */
  async updateProgram(req: Request, res: Response): Promise<void> {
    try {
      const { programId } = req.params;
      const program = await MentorshipProgram.findByIdAndUpdate(programId, req.body, { new: true });

      if (!program) {
        res.status(404).json({ success: false, message: 'Program not found' });
        return;
      }

      res.json({ success: true, message: 'Program updated successfully', data: program });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to update program' });
    }
  }

  /**
   * Get program by ID
   */
  async getProgram(req: Request, res: Response): Promise<void> {
    try {
      const { programId } = req.params;
      const program = await MentorshipProgram.findById(programId)
        .populate('mentorId studentId sessionIds');

      if (!program) {
        res.status(404).json({ success: false, message: 'Program not found' });
        return;
      }

      res.json({ success: true, data: program });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to get program' });
    }
  }

  /**
   * Get programs for student
   */
  async getStudentPrograms(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore
      const studentId = req.user.userId;
      const { status } = req.query;

      const query: any = { studentId: new mongoose.Types.ObjectId(studentId) };
      if (status) query.status = status;

      const programs = await MentorshipProgram.find(query).populate('mentorId').sort({ startDate: -1 });

      res.json({ success: true, data: programs });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to get programs' });
    }
  }

  /**
   * Get programs for mentor
   */
  async getMentorPrograms(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore
      const mentorId = req.user.userId;
      const { status } = req.query;

      const query: any = { mentorId: new mongoose.Types.ObjectId(mentorId) };
      if (status) query.status = status;

      const programs = await MentorshipProgram.find(query).populate('studentId').sort({ startDate: -1 });

      res.json({ success: true, data: programs });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to get programs' });
    }
  }

  /**
   * Add goal to program
   */
  async addGoal(req: Request, res: Response): Promise<void> {
    try {
      const { programId } = req.params;
      const { title, description, category, targetDate } = req.body;

      const program = await MentorshipProgram.findById(programId);
      if (!program) {
        res.status(404).json({ success: false, message: 'Program not found' });
        return;
      }

      program.addGoal(title, description, category, targetDate ? new Date(targetDate) : undefined);
      await program.save();

      res.json({ success: true, message: 'Goal added successfully', data: program });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to add goal' });
    }
  }

  /**
   * Complete milestone
   */
  async completeMilestone(req: Request, res: Response): Promise<void> {
    try {
      const { programId, milestoneId } = req.params;

      const program = await MentorshipProgram.findById(programId);
      if (!program) {
        res.status(404).json({ success: false, message: 'Program not found' });
        return;
      }

      const success = program.completeMilestone(milestoneId);
      if (!success) {
        res.status(404).json({ success: false, message: 'Milestone not found' });
        return;
      }

      await program.save();
      res.json({ success: true, message: 'Milestone completed', data: program });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to complete milestone' });
    }
  }

  /**
   * Add check-in
   */
  async addCheckIn(req: Request, res: Response): Promise<void> {
    try {
      const { programId } = req.params;
      const { scheduledDate } = req.body;

      const program = await MentorshipProgram.findById(programId);
      if (!program) {
        res.status(404).json({ success: false, message: 'Program not found' });
        return;
      }

      program.addCheckIn(new Date(scheduledDate));
      await program.save();

      res.json({ success: true, message: 'Check-in scheduled', data: program });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to schedule check-in' });
    }
  }

  /**
   * Generate progress report
   */
  async generateReport(req: Request, res: Response): Promise<void> {
    try {
      const { programId } = req.params;
      // @ts-ignore
      const generatedBy = req.user.userId;
      const { type, summary, strengths, areasForImprovement, recommendations, nextSteps } = req.body;

      const program = await MentorshipProgram.findById(programId);
      if (!program) {
        res.status(404).json({ success: false, message: 'Program not found' });
        return;
      }

      program.updateProgress();

      const report = {
        generatedAt: new Date(),
        generatedBy: new mongoose.Types.ObjectId(generatedBy),
        type,
        summary,
        progressPercentage: program.progress.overall,
        goalsAchieved: program.goals.filter(g => g.status === 'achieved').length,
        goalsPending: program.goals.filter(g => g.status === 'active').length,
        sessionsCompleted: program.completedSessions,
        sessionsScheduled: program.upcomingSessions,
        strengths,
        areasForImprovement,
        recommendations,
        nextSteps,
      };

      program.reports.push(report);
      await program.save();

      res.json({ success: true, message: 'Report generated', data: report });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to generate report' });
    }
  }
}

export const programController = new ProgramController();
