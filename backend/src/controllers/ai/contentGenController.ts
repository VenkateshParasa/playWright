/**
 * AI Content Generation Controller
 * Handles AI-powered content generation endpoints
 */

import { Request, Response } from 'express';
import { contentGenerationService } from '../../services/ai/contentGenerationService.js';
import type { ContentGenerationRequest, QuizGenerationOptions } from '../../types/ai.js';

export class ContentGenController {
  /**
   * Generate quiz questions from content
   * POST /api/ai/content/quiz/generate
   */
  async generateQuiz(req: Request, res: Response): Promise<void> {
    try {
      const { content, options } = req.body;

      if (!content) {
        res.status(400).json({
          success: false,
          error: 'Content is required',
        });
        return;
      }

      const quizOptions: QuizGenerationOptions = {
        questionCount: options?.questionCount || 5,
        difficulty: options?.difficulty || 'mixed',
        includeMultipleChoice: options?.includeMultipleChoice ?? true,
        includeTrueFalse: options?.includeTrueFalse ?? true,
        includeShortAnswer: options?.includeShortAnswer ?? false,
        distractorQuality: options?.distractorQuality || 'advanced',
      };

      const questions = await contentGenerationService.generateQuiz(content, quizOptions);

      res.json({
        success: true,
        questions,
        metadata: {
          generatedAt: new Date(),
          questionCount: questions.length,
          difficulty: quizOptions.difficulty,
        },
      });
    } catch (error) {
      console.error('Quiz generation error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Generate flashcards from content
   * POST /api/ai/content/flashcards/generate
   */
  async generateFlashcards(req: Request, res: Response): Promise<void> {
    try {
      const { content, count = 10 } = req.body;

      if (!content) {
        res.status(400).json({
          success: false,
          error: 'Content is required',
        });
        return;
      }

      const flashcards = await contentGenerationService.generateFlashcards(content, count);

      res.json({
        success: true,
        flashcards,
        metadata: {
          generatedAt: new Date(),
          count: flashcards.length,
        },
      });
    } catch (error) {
      console.error('Flashcard generation error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Generate exercise from topic
   * POST /api/ai/content/exercise/generate
   */
  async generateExercise(req: Request, res: Response): Promise<void> {
    try {
      const { topic, difficulty = 'medium', language = 'javascript' } = req.body;

      if (!topic) {
        res.status(400).json({
          success: false,
          error: 'Topic is required',
        });
        return;
      }

      const exercise = await contentGenerationService.generateExercise(
        topic,
        difficulty,
        language
      );

      res.json({
        success: true,
        exercise,
        metadata: {
          generatedAt: new Date(),
          topic,
          difficulty,
          language,
        },
      });
    } catch (error) {
      console.error('Exercise generation error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Generate exercise variations
   * POST /api/ai/content/exercise/variations
   */
  async generateExerciseVariations(req: Request, res: Response): Promise<void> {
    try {
      const { exerciseId, exerciseContent, count = 3 } = req.body;

      if (!exerciseId || !exerciseContent) {
        res.status(400).json({
          success: false,
          error: 'Exercise ID and content are required',
        });
        return;
      }

      const variations = await contentGenerationService.generateExerciseVariations(
        exerciseId,
        exerciseContent,
        count
      );

      res.json({
        success: true,
        variations,
      });
    } catch (error) {
      console.error('Exercise variation generation error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Generate summary from transcript
   * POST /api/ai/content/summary/generate
   */
  async generateSummary(req: Request, res: Response): Promise<void> {
    try {
      const { transcript, maxLength = 500 } = req.body;

      if (!transcript) {
        res.status(400).json({
          success: false,
          error: 'Transcript is required',
        });
        return;
      }

      const summary = await contentGenerationService.generateSummary(transcript, maxLength);

      res.json({
        success: true,
        summary,
        metadata: {
          generatedAt: new Date(),
          originalLength: transcript.length,
          summaryLength: summary.length,
        },
      });
    } catch (error) {
      console.error('Summary generation error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Generate explanation for a concept
   * POST /api/ai/content/explanation/generate
   */
  async generateExplanation(req: Request, res: Response): Promise<void> {
    try {
      const { concept, context, level = 'beginner' } = req.body;

      if (!concept) {
        res.status(400).json({
          success: false,
          error: 'Concept is required',
        });
        return;
      }

      const explanation = await contentGenerationService.generateExplanation(
        concept,
        context || '',
        level
      );

      res.json({
        success: true,
        explanation,
        metadata: {
          generatedAt: new Date(),
          concept,
          level,
        },
      });
    } catch (error) {
      console.error('Explanation generation error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Generate code snippet
   * POST /api/ai/content/code/generate
   */
  async generateCodeSnippet(req: Request, res: Response): Promise<void> {
    try {
      const { description, language = 'javascript' } = req.body;

      if (!description) {
        res.status(400).json({
          success: false,
          error: 'Description is required',
        });
        return;
      }

      const result = await contentGenerationService.generateCodeSnippet(
        description,
        language
      );

      res.json({
        success: true,
        code: result.code,
        explanation: result.explanation,
        metadata: {
          generatedAt: new Date(),
          language,
        },
      });
    } catch (error) {
      console.error('Code snippet generation error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Auto-tag content
   * POST /api/ai/content/tags/generate
   */
  async generateTags(req: Request, res: Response): Promise<void> {
    try {
      const { content } = req.body;

      if (!content) {
        res.status(400).json({
          success: false,
          error: 'Content is required',
        });
        return;
      }

      const tags = await contentGenerationService.autoTagContent(content);

      res.json({
        success: true,
        tags,
      });
    } catch (error) {
      console.error('Tag generation error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Detect prerequisites
   * POST /api/ai/content/prerequisites/detect
   */
  async detectPrerequisites(req: Request, res: Response): Promise<void> {
    try {
      const { content } = req.body;

      if (!content) {
        res.status(400).json({
          success: false,
          error: 'Content is required',
        });
        return;
      }

      const prerequisites = await contentGenerationService.detectPrerequisites(content);

      res.json({
        success: true,
        prerequisites,
      });
    } catch (error) {
      console.error('Prerequisite detection error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Estimate difficulty level
   * POST /api/ai/content/difficulty/estimate
   */
  async estimateDifficulty(req: Request, res: Response): Promise<void> {
    try {
      const { content } = req.body;

      if (!content) {
        res.status(400).json({
          success: false,
          error: 'Content is required',
        });
        return;
      }

      const difficulty = await contentGenerationService.estimateDifficulty(content);

      res.json({
        success: true,
        difficulty,
      });
    } catch (error) {
      console.error('Difficulty estimation error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Extract learning objectives
   * POST /api/ai/content/objectives/extract
   */
  async extractObjectives(req: Request, res: Response): Promise<void> {
    try {
      const { content } = req.body;

      if (!content) {
        res.status(400).json({
          success: false,
          error: 'Content is required',
        });
        return;
      }

      const objectives = await contentGenerationService.extractLearningObjectives(content);

      res.json({
        success: true,
        objectives,
      });
    } catch (error) {
      console.error('Objective extraction error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Analyze content quality
   * POST /api/ai/content/quality/analyze
   */
  async analyzeContentQuality(req: Request, res: Response): Promise<void> {
    try {
      const { content } = req.body;

      if (!content) {
        res.status(400).json({
          success: false,
          error: 'Content is required',
        });
        return;
      }

      // Mock quality analysis
      const quality = {
        overall: 85,
        dimensions: {
          clarity: 90,
          completeness: 85,
          accuracy: 88,
          engagement: 80,
          accessibility: 82,
        },
        suggestions: [
          'Add more examples',
          'Include visual aids',
          'Simplify complex terminology',
        ],
        predictedEngagement: 0.75,
        readabilityLevel: 'intermediate',
      };

      res.json({
        success: true,
        quality,
      });
    } catch (error) {
      console.error('Quality analysis error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Generate bulk content
   * POST /api/ai/content/bulk/generate
   */
  async generateBulkContent(req: Request, res: Response): Promise<void> {
    try {
      const { contents, contentType } = req.body;

      if (!Array.isArray(contents) || contents.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Contents array is required',
        });
        return;
      }

      // Process in background for large batches
      if (contents.length > 10) {
        // Queue for background processing
        res.json({
          success: true,
          message: 'Bulk generation queued',
          jobId: `job-${Date.now()}`,
          estimatedTime: contents.length * 5, // seconds
        });
        return;
      }

      // Process immediately for small batches
      const results = await Promise.all(
        contents.map(async (content) => {
          try {
            switch (contentType) {
              case 'quiz':
                return await contentGenerationService.generateQuiz(content.text, {
                  questionCount: 5,
                  difficulty: 'mixed',
                  includeMultipleChoice: true,
                  includeTrueFalse: true,
                  includeShortAnswer: false,
                  distractorQuality: 'advanced',
                });
              case 'flashcards':
                return await contentGenerationService.generateFlashcards(content.text, 10);
              default:
                throw new Error(`Unknown content type: ${contentType}`);
            }
          } catch (error) {
            return {
              error: error instanceof Error ? error.message : 'Unknown error',
            };
          }
        })
      );

      res.json({
        success: true,
        results,
        processed: contents.length,
      });
    } catch (error) {
      console.error('Bulk generation error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get generation history
   * GET /api/ai/content/history
   */
  async getGenerationHistory(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 50, offset = 0, type } = req.query;

      // Fetch from database
      res.json({
        success: true,
        history: [],
        pagination: {
          limit: Number(limit),
          offset: Number(offset),
          total: 0,
        },
      });
    } catch (error) {
      console.error('Get history error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Configure AI model settings
   * POST /api/ai/content/config
   */
  async configureAI(req: Request, res: Response): Promise<void> {
    try {
      const { provider, model, temperature, apiKey } = req.body;

      // Check if user is admin
      const isAdmin = (req as any).user?.role === 'admin';

      if (!isAdmin) {
        res.status(403).json({
          success: false,
          error: 'Unauthorized: Admin access required',
        });
        return;
      }

      contentGenerationService.configure({
        provider,
        model,
        temperature,
        apiKey,
      });

      res.json({
        success: true,
        message: 'AI configuration updated',
      });
    } catch (error) {
      console.error('Configure AI error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export const contentGenController = new ContentGenController();
