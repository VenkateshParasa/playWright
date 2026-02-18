import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Mentor, IMentor } from '../../models/Mentor';
import { matchingService } from '../../services/mentorship/matchingService';

export class MentorController {
  /**
   * Create a mentor profile
   */
  async createMentorProfile(req: Request, res: Response): Promise<void> {
    try {
      const {
        bio,
        title,
        yearsOfExperience,
        currentCompany,
        previousCompanies,
        expertise,
        specializations,
        industries,
        languages,
        availability,
        timezone,
        maxSessionsPerWeek,
        sessionTypes,
        sessionDurations,
        pricing,
        acceptsFreeTrials,
        freeTrialDuration,
        services,
        certifications,
        socialLinks,
        videoConferencePreference,
        autoAcceptBookings,
        introVideoUrl,
        customQuestionsForStudents,
      } = req.body;

      // @ts-ignore - userId comes from auth middleware
      const userId = req.user.userId;
      // @ts-ignore - tenantId comes from auth middleware
      const tenantId = req.user.tenantId;

      // Check if mentor profile already exists
      const existingMentor = await Mentor.findOne({ userId });
      if (existingMentor) {
        res.status(400).json({
          success: false,
          message: 'Mentor profile already exists',
        });
        return;
      }

      const mentor = new Mentor({
        userId,
        tenantId,
        bio,
        title,
        yearsOfExperience,
        currentCompany,
        previousCompanies,
        expertise,
        specializations,
        industries,
        languages: languages || ['English'],
        availability: availability || [],
        timezone: timezone || 'UTC',
        maxSessionsPerWeek: maxSessionsPerWeek || 10,
        sessionTypes: sessionTypes || ['one-on-one'],
        sessionDurations: sessionDurations || [30, 60],
        pricing: pricing || { oneOnOne: 50, officeHours: 25, group: 30, workshop: 100 },
        acceptsFreeTrials: acceptsFreeTrials || false,
        freeTrialDuration: freeTrialDuration || 15,
        services: services || {},
        certifications: certifications || [],
        socialLinks: socialLinks || {},
        videoConferencePreference: videoConferencePreference || 'webrtc',
        autoAcceptBookings: autoAcceptBookings || false,
        requireApproval: !autoAcceptBookings,
        introVideoUrl,
        customQuestionsForStudents,
      });

      await mentor.save();

      res.status(201).json({
        success: true,
        message: 'Mentor profile created successfully',
        data: mentor,
      });
    } catch (error) {
      console.error('Error creating mentor profile:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create mentor profile',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Update mentor profile
   */
  async updateMentorProfile(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore
      const userId = req.user.userId;
      const updates = req.body;

      const mentor = await Mentor.findOne({ userId });
      if (!mentor) {
        res.status(404).json({
          success: false,
          message: 'Mentor profile not found',
        });
        return;
      }

      // Update allowed fields
      const allowedFields = [
        'bio',
        'title',
        'yearsOfExperience',
        'currentCompany',
        'previousCompanies',
        'expertise',
        'specializations',
        'industries',
        'languages',
        'availability',
        'timezone',
        'maxSessionsPerWeek',
        'sessionTypes',
        'sessionDurations',
        'pricing',
        'acceptsFreeTrials',
        'freeTrialDuration',
        'services',
        'certifications',
        'socialLinks',
        'status',
        'acceptingNewStudents',
        'videoConferencePreference',
        'autoAcceptBookings',
        'notificationPreferences',
        'introVideoUrl',
        'customQuestionsForStudents',
      ];

      allowedFields.forEach((field) => {
        if (updates[field] !== undefined) {
          (mentor as any)[field] = updates[field];
        }
      });

      mentor.lastActiveAt = new Date();
      await mentor.save();

      res.json({
        success: true,
        message: 'Mentor profile updated successfully',
        data: mentor,
      });
    } catch (error) {
      console.error('Error updating mentor profile:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update mentor profile',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get mentor profile by user ID
   */
  async getMentorProfile(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore
      const userId = req.user?.userId || req.params.userId;

      const mentor = await Mentor.findOne({ userId }).populate('userId', 'firstName lastName email avatar');
      if (!mentor) {
        res.status(404).json({
          success: false,
          message: 'Mentor profile not found',
        });
        return;
      }

      res.json({
        success: true,
        data: mentor,
      });
    } catch (error) {
      console.error('Error getting mentor profile:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get mentor profile',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get mentor by ID
   */
  async getMentorById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const mentor = await Mentor.findById(id).populate('userId', 'firstName lastName email avatar');
      if (!mentor) {
        res.status(404).json({
          success: false,
          message: 'Mentor not found',
        });
        return;
      }

      res.json({
        success: true,
        data: mentor,
      });
    } catch (error) {
      console.error('Error getting mentor:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get mentor',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Search and filter mentors
   */
  async searchMentors(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore
      const tenantId = req.user.tenantId;
      const {
        skills,
        industries,
        languages,
        minRating,
        maxPrice,
        availability,
        sessionType,
        services,
        verified,
        search,
        page = 1,
        limit = 20,
        sortBy = 'rating',
      } = req.query;

      const query: any = {
        tenantId,
        status: 'active',
        acceptingNewStudents: true,
      };

      // Skills filter
      if (skills) {
        const skillArray = (skills as string).split(',');
        query['expertise.skill'] = { $in: skillArray };
      }

      // Industries filter
      if (industries) {
        const industryArray = (industries as string).split(',');
        query.industries = { $in: industryArray };
      }

      // Languages filter
      if (languages) {
        const languageArray = (languages as string).split(',');
        query.languages = { $in: languageArray };
      }

      // Rating filter
      if (minRating) {
        query['stats.averageRating'] = { $gte: parseFloat(minRating as string) };
      }

      // Price filter
      if (maxPrice) {
        query['pricing.oneOnOne'] = { $lte: parseFloat(maxPrice as string) };
      }

      // Session type filter
      if (sessionType) {
        query.sessionTypes = sessionType;
      }

      // Services filter
      if (services) {
        const serviceArray = (services as string).split(',');
        serviceArray.forEach((service) => {
          query[`services.${service}`] = true;
        });
      }

      // Verified filter
      if (verified === 'true') {
        query.isVerified = true;
      }

      // Text search
      if (search) {
        query.$text = { $search: search as string };
      }

      // Sorting
      let sort: any = {};
      switch (sortBy) {
        case 'rating':
          sort = { 'stats.averageRating': -1, 'stats.totalReviews': -1 };
          break;
        case 'price-low':
          sort = { 'pricing.oneOnOne': 1 };
          break;
        case 'price-high':
          sort = { 'pricing.oneOnOne': -1 };
          break;
        case 'experience':
          sort = { yearsOfExperience: -1 };
          break;
        case 'sessions':
          sort = { 'stats.completedSessions': -1 };
          break;
        default:
          sort = { 'stats.averageRating': -1 };
      }

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const [mentors, total] = await Promise.all([
        Mentor.find(query)
          .populate('userId', 'firstName lastName email avatar')
          .sort(sort)
          .skip(skip)
          .limit(limitNum),
        Mentor.countDocuments(query),
      ]);

      res.json({
        success: true,
        data: {
          mentors,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum),
          },
        },
      });
    } catch (error) {
      console.error('Error searching mentors:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search mentors',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Match mentors using AI-powered matching
   */
  async matchMentors(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore
      const studentId = req.user.userId;
      // @ts-ignore
      const tenantId = req.user.tenantId;
      const { limit = 10 } = req.query;

      const criteria = {
        studentId: new mongoose.Types.ObjectId(studentId),
        tenantId: new mongoose.Types.ObjectId(tenantId),
        ...req.body,
      };

      const matches = await matchingService.matchMentors(criteria, parseInt(limit as string));

      res.json({
        success: true,
        data: matches,
      });
    } catch (error) {
      console.error('Error matching mentors:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to match mentors',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get top-rated mentors
   */
  async getTopRatedMentors(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore
      const tenantId = req.user.tenantId;
      const { category, limit = 10 } = req.query;

      const mentors = await matchingService.getTopRatedMentors(
        new mongoose.Types.ObjectId(tenantId),
        category as string,
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: mentors,
      });
    } catch (error) {
      console.error('Error getting top-rated mentors:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get top-rated mentors',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get recommended mentors based on learning history
   */
  async getRecommendedMentors(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore
      const studentId = req.user.userId;
      // @ts-ignore
      const tenantId = req.user.tenantId;
      const { limit = 5 } = req.query;

      const mentors = await matchingService.getRecommendedMentors(
        new mongoose.Types.ObjectId(studentId),
        new mongoose.Types.ObjectId(tenantId),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: mentors,
      });
    } catch (error) {
      console.error('Error getting recommended mentors:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get recommended mentors',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Check mentor-student compatibility
   */
  async checkCompatibility(req: Request, res: Response): Promise<void> {
    try {
      const { mentorId } = req.params;
      // @ts-ignore
      const studentId = req.user.userId;

      const compatibility = await matchingService.checkCompatibility(
        new mongoose.Types.ObjectId(mentorId),
        new mongoose.Types.ObjectId(studentId)
      );

      res.json({
        success: true,
        data: compatibility,
      });
    } catch (error) {
      console.error('Error checking compatibility:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check compatibility',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get mentor statistics
   */
  async getMentorStats(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const mentor = await Mentor.findById(id);
      if (!mentor) {
        res.status(404).json({
          success: false,
          message: 'Mentor not found',
        });
        return;
      }

      res.json({
        success: true,
        data: mentor.stats,
      });
    } catch (error) {
      console.error('Error getting mentor stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get mentor stats',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get mentor reviews
   */
  async getMentorReviews(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const mentor = await Mentor.findById(id).populate('reviews.studentId', 'firstName lastName avatar');
      if (!mentor) {
        res.status(404).json({
          success: false,
          message: 'Mentor not found',
        });
        return;
      }

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const reviews = mentor.reviews
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(skip, skip + limitNum);

      res.json({
        success: true,
        data: {
          reviews,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: mentor.reviews.length,
            pages: Math.ceil(mentor.reviews.length / limitNum),
          },
          averageRating: mentor.stats.averageRating,
          totalReviews: mentor.stats.totalReviews,
        },
      });
    } catch (error) {
      console.error('Error getting mentor reviews:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get mentor reviews',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Update mentor availability
   */
  async updateAvailability(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore
      const userId = req.user.userId;
      const { availability, timezone } = req.body;

      const mentor = await Mentor.findOne({ userId });
      if (!mentor) {
        res.status(404).json({
          success: false,
          message: 'Mentor profile not found',
        });
        return;
      }

      if (availability) mentor.availability = availability;
      if (timezone) mentor.timezone = timezone;

      await mentor.save();

      res.json({
        success: true,
        message: 'Availability updated successfully',
        data: {
          availability: mentor.availability,
          timezone: mentor.timezone,
        },
      });
    } catch (error) {
      console.error('Error updating availability:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update availability',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Connect calendar integration
   */
  async connectCalendar(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore
      const userId = req.user.userId;
      const { provider, calendarId } = req.body;

      const mentor = await Mentor.findOne({ userId });
      if (!mentor) {
        res.status(404).json({
          success: false,
          message: 'Mentor profile not found',
        });
        return;
      }

      mentor.calendarIntegration = {
        provider,
        connected: true,
        syncEnabled: true,
        calendarId,
      };

      await mentor.save();

      res.json({
        success: true,
        message: 'Calendar connected successfully',
        data: mentor.calendarIntegration,
      });
    } catch (error) {
      console.error('Error connecting calendar:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to connect calendar',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export const mentorController = new MentorController();
