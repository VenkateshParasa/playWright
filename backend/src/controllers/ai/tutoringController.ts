/**
 * AI Tutoring Controller
 * Handles intelligent tutoring and assistance endpoints
 */

import { Request, Response } from 'express';
import { tutoringService } from '../../services/ai/tutoringService.js';
import type { TutoringRequest, AIAssistantRequest } from '../../types/ai.js';

export class TutoringController {
  /**
   * Get tutoring assistance
   * POST /api/ai/tutoring/assist
   */
  async getTutoringAssistance(req: Request, res: Response): Promise<void> {
    try {
      const request: TutoringRequest = {
        userId: (req as any).user?.id || 'anonymous',
        exerciseId: req.body.exerciseId,
        context: req.body.context,
        type: req.body.type,
        specificQuestion: req.body.specificQuestion,
      };

      if (!request.exerciseId || !request.type) {
        res.status(400).json({
          success: false,
          error: 'Exercise ID and type are required',
        });
        return;
      }

      const response = await tutoringService.getTutoringResponse(request);

      res.json({
        success: true,
        response,
      });
    } catch (error) {
      console.error('Tutoring assistance error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get hint for exercise
   * POST /api/ai/tutoring/hint
   */
  async getHint(req: Request, res: Response): Promise<void> {
    try {
      const { exerciseId, attempts = 0 } = req.body;

      if (!exerciseId) {
        res.status(400).json({
          success: false,
          error: 'Exercise ID is required',
        });
        return;
      }

      const request: TutoringRequest = {
        userId: (req as any).user?.id || 'anonymous',
        exerciseId,
        context: {
          attempts,
          timeSpent: 0,
          errors: [],
        },
        type: 'hint',
      };

      const response = await tutoringService.getTutoringResponse(request);

      res.json({
        success: true,
        hint: response.content,
        level: response.level,
        nextSteps: response.nextSteps,
      });
    } catch (error) {
      console.error('Get hint error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get debugging help
   * POST /api/ai/tutoring/debug
   */
  async getDebugHelp(req: Request, res: Response): Promise<void> {
    try {
      const { exerciseId, code, errors = [] } = req.body;

      if (!exerciseId || !code) {
        res.status(400).json({
          success: false,
          error: 'Exercise ID and code are required',
        });
        return;
      }

      const request: TutoringRequest = {
        userId: (req as any).user?.id || 'anonymous',
        exerciseId,
        context: {
          currentCode: code,
          attempts: 0,
          timeSpent: 0,
          errors,
        },
        type: 'debug',
      };

      const response = await tutoringService.getTutoringResponse(request);

      res.json({
        success: true,
        debugHelp: response.content,
        suggestions: response.suggestions,
      });
    } catch (error) {
      console.error('Debug help error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get concept explanation
   * POST /api/ai/tutoring/explain
   */
  async explainConcept(req: Request, res: Response): Promise<void> {
    try {
      const { concept, exerciseId } = req.body;

      if (!concept) {
        res.status(400).json({
          success: false,
          error: 'Concept is required',
        });
        return;
      }

      const request: TutoringRequest = {
        userId: (req as any).user?.id || 'anonymous',
        exerciseId: exerciseId || 'general',
        context: {
          attempts: 0,
          timeSpent: 0,
          errors: [],
        },
        type: 'concept',
        specificQuestion: concept,
      };

      const response = await tutoringService.getTutoringResponse(request);

      res.json({
        success: true,
        explanation: response.content,
        relatedConcepts: response.relatedConcepts,
      });
    } catch (error) {
      console.error('Explain concept error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Generate learning path recommendations
   * GET /api/ai/tutoring/learning-path/:userId
   */
  async getLearningPath(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      // Verify user access
      const requestUserId = (req as any).user?.id;
      if (userId !== requestUserId && (req as any).user?.role !== 'instructor') {
        res.status(403).json({
          success: false,
          error: 'Unauthorized',
        });
        return;
      }

      const learningPath = await tutoringService.generateLearningPath(userId);

      res.json({
        success: true,
        learningPath,
      });
    } catch (error) {
      console.error('Get learning path error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Analyze learning style
   * GET /api/ai/tutoring/learning-style/:userId
   */
  async analyzeLearningStyle(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      // Verify user access
      const requestUserId = (req as any).user?.id;
      if (userId !== requestUserId) {
        res.status(403).json({
          success: false,
          error: 'Unauthorized',
        });
        return;
      }

      const learningStyle = await tutoringService.analyzeLearningStyle(userId);

      res.json({
        success: true,
        learningStyle,
      });
    } catch (error) {
      console.error('Analyze learning style error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Generate study plan
   * POST /api/ai/tutoring/study-plan
   */
  async generateStudyPlan(req: Request, res: Response): Promise<void> {
    try {
      const { goals, timeAvailable } = req.body;
      const userId = (req as any).user?.id;

      if (!goals || !Array.isArray(goals) || goals.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Goals array is required',
        });
        return;
      }

      if (!timeAvailable || timeAvailable <= 0) {
        res.status(400).json({
          success: false,
          error: 'Time available (in hours) is required',
        });
        return;
      }

      const studyPlan = await tutoringService.generateStudyPlan(
        userId,
        goals,
        timeAvailable
      );

      res.json({
        success: true,
        studyPlan,
      });
    } catch (error) {
      console.error('Generate study plan error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get real-time coding assistance
   * POST /api/ai/tutoring/realtime-assist
   */
  async getRealtimeAssistance(req: Request, res: Response): Promise<void> {
    try {
      const { code, cursorPosition } = req.body;

      if (!code || !cursorPosition) {
        res.status(400).json({
          success: false,
          error: 'Code and cursor position are required',
        });
        return;
      }

      const assistance = await tutoringService.provideRealtimeAssistance(
        code,
        cursorPosition
      );

      res.json({
        success: true,
        assistance,
      });
    } catch (error) {
      console.error('Realtime assistance error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * AI Teaching Assistant - Answer questions
   * POST /api/ai/tutoring/assistant/ask
   */
  async askAssistant(req: Request, res: Response): Promise<void> {
    try {
      const request: AIAssistantRequest = {
        userId: (req as any).user?.id || 'anonymous',
        question: req.body.question,
        context: req.body.context,
        type: req.body.type || 'question',
      };

      if (!request.question) {
        res.status(400).json({
          success: false,
          error: 'Question is required',
        });
        return;
      }

      // Mock AI assistant response
      const response = {
        answer: `Here's the answer to your question: "${request.question}".

This is a helpful explanation that addresses your question directly.`,
        confidence: 0.85,
        sources: [
          {
            title: 'Documentation',
            url: '/docs/reference',
            relevance: 0.9,
          },
        ],
        relatedQuestions: [
          'How does this relate to testing?',
          'What are the best practices?',
        ],
        codeExamples: request.type === 'question' ? [
          {
            language: 'javascript',
            code: '// Example code\nfunction example() {\n  return true;\n}',
            explanation: 'This demonstrates the concept',
          },
        ] : undefined,
      };

      res.json({
        success: true,
        response,
      });
    } catch (error) {
      console.error('Ask assistant error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get FAQ answers
   * GET /api/ai/tutoring/faq
   */
  async getFAQ(req: Request, res: Response): Promise<void> {
    try {
      const { query, category } = req.query;

      // Fetch FAQ from database
      const faq = [
        {
          question: 'How do I get started?',
          answer: 'Start with the beginner tutorials...',
          category: 'getting-started',
          helpful: 95,
        },
        {
          question: 'What is Playwright?',
          answer: 'Playwright is a testing framework...',
          category: 'general',
          helpful: 100,
        },
      ];

      // Filter by query or category
      let filtered = faq;
      if (query) {
        const searchTerm = (query as string).toLowerCase();
        filtered = faq.filter(f =>
          f.question.toLowerCase().includes(searchTerm) ||
          f.answer.toLowerCase().includes(searchTerm)
        );
      }

      if (category) {
        filtered = filtered.filter(f => f.category === category);
      }

      res.json({
        success: true,
        faq: filtered,
      });
    } catch (error) {
      console.error('Get FAQ error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get resource recommendations
   * POST /api/ai/tutoring/resources/recommend
   */
  async recommendResources(req: Request, res: Response): Promise<void> {
    try {
      const { topic, skillLevel = 'beginner' } = req.body;

      if (!topic) {
        res.status(400).json({
          success: false,
          error: 'Topic is required',
        });
        return;
      }

      // Mock resource recommendations
      const resources = [
        {
          type: 'documentation',
          title: `${topic} Documentation`,
          url: `/docs/${topic}`,
          difficulty: skillLevel,
          estimatedTime: 30,
          relevance: 0.95,
        },
        {
          type: 'tutorial',
          title: `Getting Started with ${topic}`,
          url: `/tutorials/${topic}`,
          difficulty: skillLevel,
          estimatedTime: 60,
          relevance: 0.9,
        },
        {
          type: 'video',
          title: `${topic} Video Tutorial`,
          url: `/videos/${topic}`,
          difficulty: skillLevel,
          estimatedTime: 45,
          relevance: 0.85,
        },
      ];

      res.json({
        success: true,
        resources,
      });
    } catch (error) {
      console.error('Recommend resources error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Track tutoring session
   * POST /api/ai/tutoring/session/track
   */
  async trackSession(req: Request, res: Response): Promise<void> {
    try {
      const { exerciseId, duration, hintsUsed, completed } = req.body;
      const userId = (req as any).user?.id;

      // Save session data to database
      // await saveSession(userId, exerciseId, duration, hintsUsed, completed);

      res.json({
        success: true,
        message: 'Session tracked',
      });
    } catch (error) {
      console.error('Track session error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get tutoring analytics
   * GET /api/ai/tutoring/analytics/:userId
   */
  async getTutoringAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      // Verify user access
      const requestUserId = (req as any).user?.id;
      if (userId !== requestUserId && (req as any).user?.role !== 'instructor') {
        res.status(403).json({
          success: false,
          error: 'Unauthorized',
        });
        return;
      }

      // Fetch analytics from database
      const analytics = {
        totalSessions: 0,
        totalHintsUsed: 0,
        averageCompletionTime: 0,
        conceptsMastered: [],
        strugglingAreas: [],
        recommendedFocus: [],
      };

      res.json({
        success: true,
        analytics,
      });
    } catch (error) {
      console.error('Get analytics error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export const tutoringController = new TutoringController();
