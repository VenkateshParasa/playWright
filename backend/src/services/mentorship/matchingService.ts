import mongoose from 'mongoose';
import { Mentor, IMentor } from '../../models/Mentor';
import { MentorshipSession } from '../../models/MentorshipSession';
import { MentorshipProgram } from '../../models/MentorshipProgram';

export interface IMatchingCriteria {
  studentId: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;

  // Skill requirements
  requiredSkills?: string[];
  desiredExpertiseLevel?: 'intermediate' | 'advanced' | 'expert';

  // Preferences
  preferredLanguages?: string[];
  preferredIndustries?: string[];
  sessionType?: 'one-on-one' | 'office-hours' | 'group';

  // Budget
  maxBudget?: number;

  // Availability
  preferredDaysOfWeek?: number[]; // 0-6
  preferredTimeSlots?: { start: string; end: string }[];
  timezone?: string;

  // Career goals
  careerGoals?: {
    targetRole?: string;
    targetIndustry?: string;
    timeframe?: string;
  };

  // Services needed
  servicesNeeded?: string[];
}

export interface IMatchScore {
  mentorId: mongoose.Types.ObjectId;
  score: number;
  breakdown: {
    skillsMatch: number;
    availabilityMatch: number;
    languageMatch: number;
    industryMatch: number;
    budgetMatch: number;
    servicesMatch: number;
    ratingBonus: number;
  };
  mentor: IMentor;
  reasoning: string[];
}

export class MatchingService {
  /**
   * Find and rank mentors based on student criteria using AI-powered matching
   */
  async matchMentors(
    criteria: IMatchingCriteria,
    limit: number = 10
  ): Promise<IMatchScore[]> {
    try {
      // Get all active mentors accepting students
      const mentors = await Mentor.find({
        tenantId: criteria.tenantId,
        status: 'active',
        acceptingNewStudents: true,
      }).lean();

      if (mentors.length === 0) {
        return [];
      }

      // Calculate match scores for each mentor
      const scores: IMatchScore[] = [];

      for (const mentor of mentors) {
        const score = await this.calculateMatchScore(mentor as IMentor, criteria);
        if (score.score > 0) {
          scores.push(score);
        }
      }

      // Sort by score descending
      scores.sort((a, b) => b.score - a.score);

      return scores.slice(0, limit);
    } catch (error) {
      console.error('Error matching mentors:', error);
      throw new Error('Failed to match mentors');
    }
  }

  /**
   * Calculate match score for a specific mentor
   */
  private async calculateMatchScore(
    mentor: IMentor,
    criteria: IMatchingCriteria
  ): Promise<IMatchScore> {
    const breakdown = {
      skillsMatch: 0,
      availabilityMatch: 0,
      languageMatch: 0,
      industryMatch: 0,
      budgetMatch: 0,
      servicesMatch: 0,
      ratingBonus: 0,
    };

    const reasoning: string[] = [];

    // 1. Skills Match (30% weight)
    if (criteria.requiredSkills && criteria.requiredSkills.length > 0) {
      const mentorSkills = mentor.expertise.map((e) => e.skill.toLowerCase());
      const requiredSkills = criteria.requiredSkills.map((s) => s.toLowerCase());

      const matchedSkills = requiredSkills.filter((skill) =>
        mentorSkills.some((ms) => ms.includes(skill) || skill.includes(ms))
      );

      breakdown.skillsMatch = (matchedSkills.length / requiredSkills.length) * 30;

      if (matchedSkills.length > 0) {
        reasoning.push(
          `Matches ${matchedSkills.length}/${requiredSkills.length} required skills`
        );
      }

      // Bonus for expertise level
      if (criteria.desiredExpertiseLevel) {
        const expertiseLevels = { intermediate: 2, advanced: 3, expert: 4 };
        const desiredLevel = expertiseLevels[criteria.desiredExpertiseLevel];

        const hasExpertise = matchedSkills.some((skill) => {
          const mentorExpertise = mentor.expertise.find(
            (e) => e.skill.toLowerCase() === skill
          );
          if (mentorExpertise) {
            const mentorLevel = expertiseLevels[mentorExpertise.level as keyof typeof expertiseLevels] || 0;
            return mentorLevel >= desiredLevel;
          }
          return false;
        });

        if (hasExpertise) {
          breakdown.skillsMatch += 5;
          reasoning.push('Has desired expertise level in key skills');
        }
      }
    } else {
      breakdown.skillsMatch = 15; // Default partial score if no specific skills required
    }

    // 2. Availability Match (20% weight)
    if (criteria.preferredDaysOfWeek && criteria.preferredDaysOfWeek.length > 0) {
      const mentorDays = mentor.availability.map((a) => a.dayOfWeek);
      const matchedDays = criteria.preferredDaysOfWeek.filter((day) =>
        mentorDays.includes(day)
      );

      breakdown.availabilityMatch = (matchedDays.length / criteria.preferredDaysOfWeek.length) * 20;

      if (matchedDays.length > 0) {
        reasoning.push(`Available on ${matchedDays.length} of your preferred days`);
      }
    } else {
      breakdown.availabilityMatch = 10; // Default score
    }

    // 3. Language Match (15% weight)
    if (criteria.preferredLanguages && criteria.preferredLanguages.length > 0) {
      const mentorLanguages = mentor.languages.map((l) => l.toLowerCase());
      const preferredLanguages = criteria.preferredLanguages.map((l) => l.toLowerCase());

      const matchedLanguages = preferredLanguages.filter((lang) =>
        mentorLanguages.includes(lang)
      );

      breakdown.languageMatch = (matchedLanguages.length / preferredLanguages.length) * 15;

      if (matchedLanguages.length > 0) {
        reasoning.push(`Speaks ${matchedLanguages.join(', ')}`);
      }
    } else {
      breakdown.languageMatch = 7.5; // Default score
    }

    // 4. Industry Match (15% weight)
    if (criteria.preferredIndustries && criteria.preferredIndustries.length > 0) {
      const mentorIndustries = mentor.industries.map((i) => i.toLowerCase());
      const preferredIndustries = criteria.preferredIndustries.map((i) => i.toLowerCase());

      const matchedIndustries = preferredIndustries.filter((ind) =>
        mentorIndustries.includes(ind)
      );

      breakdown.industryMatch = (matchedIndustries.length / preferredIndustries.length) * 15;

      if (matchedIndustries.length > 0) {
        reasoning.push(`Has experience in ${matchedIndustries.join(', ')}`);
      }
    } else {
      breakdown.industryMatch = 7.5; // Default score
    }

    // 5. Budget Match (10% weight)
    if (criteria.maxBudget) {
      const sessionPrice = mentor.pricing.oneOnOne || 0;

      if (sessionPrice === 0) {
        breakdown.budgetMatch = 10;
        reasoning.push('Offers free sessions');
      } else if (sessionPrice <= criteria.maxBudget) {
        const budgetRatio = 1 - sessionPrice / criteria.maxBudget;
        breakdown.budgetMatch = 5 + budgetRatio * 5;
        reasoning.push('Within your budget');
      } else if (mentor.acceptsFreeTrials) {
        breakdown.budgetMatch = 3;
        reasoning.push('Offers free trial session');
      }
    } else {
      breakdown.budgetMatch = 5; // Default score
    }

    // 6. Services Match (10% weight)
    if (criteria.servicesNeeded && criteria.servicesNeeded.length > 0) {
      const availableServices: string[] = [];
      Object.entries(mentor.services).forEach(([service, available]) => {
        if (available) availableServices.push(service);
      });

      const matchedServices = criteria.servicesNeeded.filter((service) =>
        availableServices.some((s) => s.toLowerCase().includes(service.toLowerCase()))
      );

      breakdown.servicesMatch = (matchedServices.length / criteria.servicesNeeded.length) * 10;

      if (matchedServices.length > 0) {
        reasoning.push(`Offers ${matchedServices.length}/${criteria.servicesNeeded.length} services you need`);
      }
    } else {
      breakdown.servicesMatch = 5; // Default score
    }

    // 7. Rating Bonus (bonus points, can add up to 10 extra)
    if (mentor.stats.averageRating > 0) {
      breakdown.ratingBonus = (mentor.stats.averageRating / 5) * 5;

      if (mentor.stats.averageRating >= 4.5) {
        breakdown.ratingBonus += 2;
        reasoning.push('Highly rated mentor (4.5+ stars)');
      }

      if (mentor.stats.totalReviews >= 20) {
        breakdown.ratingBonus += 2;
        reasoning.push('Experienced with 20+ reviews');
      }

      if (mentor.isVerified) {
        breakdown.ratingBonus += 1;
        reasoning.push('Verified mentor');
      }
    }

    // Calculate total score
    const totalScore = Math.min(
      100,
      breakdown.skillsMatch +
        breakdown.availabilityMatch +
        breakdown.languageMatch +
        breakdown.industryMatch +
        breakdown.budgetMatch +
        breakdown.servicesMatch +
        breakdown.ratingBonus
    );

    return {
      mentorId: mentor._id,
      score: Math.round(totalScore * 10) / 10,
      breakdown,
      mentor,
      reasoning,
    };
  }

  /**
   * Find similar students who worked with a mentor
   */
  async findSimilarStudentMatches(
    studentId: mongoose.Types.ObjectId,
    tenantId: mongoose.Types.ObjectId,
    limit: number = 5
  ): Promise<{
    mentorId: mongoose.Types.ObjectId;
    similarityScore: number;
    sharedGoals: string[];
  }[]> {
    try {
      // Get programs of similar students
      const studentPrograms = await MentorshipProgram.find({
        studentId,
        tenantId,
        status: { $in: ['active', 'completed'] },
      });

      // For now, return empty array - would need ML model for similarity
      // This is a placeholder for future AI-powered recommendations
      return [];
    } catch (error) {
      console.error('Error finding similar matches:', error);
      throw new Error('Failed to find similar matches');
    }
  }

  /**
   * Get recommended mentors based on student's learning history
   */
  async getRecommendedMentors(
    studentId: mongoose.Types.ObjectId,
    tenantId: mongoose.Types.ObjectId,
    limit: number = 5
  ): Promise<IMentor[]> {
    try {
      // Get student's completed sessions to understand their learning focus
      const pastSessions = await MentorshipSession.find({
        studentId,
        tenantId,
        status: 'completed',
      })
        .sort({ scheduledAt: -1 })
        .limit(10)
        .lean();

      // Extract skills and topics from past sessions
      const focusAreas = new Set<string>();
      pastSessions.forEach((session) => {
        session.tags?.forEach((tag) => focusAreas.add(tag));
      });

      // Find mentors who specialize in these areas
      const mentors = await Mentor.find({
        tenantId,
        status: 'active',
        acceptingNewStudents: true,
        specializations: { $in: Array.from(focusAreas) },
        'stats.averageRating': { $gte: 4.0 },
      })
        .sort({ 'stats.averageRating': -1 })
        .limit(limit)
        .lean();

      return mentors as IMentor[];
    } catch (error) {
      console.error('Error getting recommended mentors:', error);
      throw new Error('Failed to get recommended mentors');
    }
  }

  /**
   * Get top-rated mentors in specific categories
   */
  async getTopRatedMentors(
    tenantId: mongoose.Types.ObjectId,
    category?: string,
    limit: number = 10
  ): Promise<IMentor[]> {
    try {
      const query: any = {
        tenantId,
        status: 'active',
        acceptingNewStudents: true,
        'stats.totalReviews': { $gte: 5 },
      };

      if (category) {
        query.specializations = category;
      }

      const mentors = await Mentor.find(query)
        .sort({ 'stats.averageRating': -1, 'stats.totalReviews': -1 })
        .limit(limit)
        .lean();

      return mentors as IMentor[];
    } catch (error) {
      console.error('Error getting top-rated mentors:', error);
      throw new Error('Failed to get top-rated mentors');
    }
  }

  /**
   * Check mentor-student compatibility
   */
  async checkCompatibility(
    mentorId: mongoose.Types.ObjectId,
    studentId: mongoose.Types.ObjectId
  ): Promise<{
    compatible: boolean;
    score: number;
    factors: { name: string; value: string; impact: 'positive' | 'negative' | 'neutral' }[];
  }> {
    try {
      const mentor = await Mentor.findById(mentorId);
      if (!mentor) {
        throw new Error('Mentor not found');
      }

      const factors: {
        name: string;
        value: string;
        impact: 'positive' | 'negative' | 'neutral';
      }[] = [];
      let compatibilityScore = 50; // Start at neutral

      // Check if mentor is available
      if (mentor.status !== 'active' || !mentor.acceptingNewStudents) {
        factors.push({
          name: 'Availability',
          value: 'Mentor is not currently accepting students',
          impact: 'negative',
        });
        compatibilityScore -= 30;
      } else {
        factors.push({
          name: 'Availability',
          value: 'Mentor is accepting new students',
          impact: 'positive',
        });
        compatibilityScore += 10;
      }

      // Check rating
      if (mentor.stats.averageRating >= 4.5) {
        factors.push({
          name: 'Rating',
          value: `Excellent rating (${mentor.stats.averageRating}/5)`,
          impact: 'positive',
        });
        compatibilityScore += 15;
      } else if (mentor.stats.averageRating >= 4.0) {
        factors.push({
          name: 'Rating',
          value: `Good rating (${mentor.stats.averageRating}/5)`,
          impact: 'positive',
        });
        compatibilityScore += 10;
      }

      // Check response time
      if (mentor.stats.responseTime <= 60) {
        factors.push({
          name: 'Response Time',
          value: 'Responds quickly (within 1 hour)',
          impact: 'positive',
        });
        compatibilityScore += 10;
      }

      // Check experience
      if (mentor.stats.completedSessions >= 50) {
        factors.push({
          name: 'Experience',
          value: `Very experienced (${mentor.stats.completedSessions}+ sessions)`,
          impact: 'positive',
        });
        compatibilityScore += 10;
      }

      // Check if verified
      if (mentor.isVerified) {
        factors.push({
          name: 'Verification',
          value: 'Verified mentor',
          impact: 'positive',
        });
        compatibilityScore += 5;
      }

      return {
        compatible: compatibilityScore >= 60,
        score: Math.min(100, compatibilityScore),
        factors,
      };
    } catch (error) {
      console.error('Error checking compatibility:', error);
      throw new Error('Failed to check compatibility');
    }
  }
}

export const matchingService = new MatchingService();
