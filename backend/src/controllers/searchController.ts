import { Request, Response, NextFunction } from 'express';

interface SearchQuery {
  q: string;
  type?: 'lesson' | 'exercise' | 'flashcard' | 'quiz' | 'all';
  difficulty?: 'easy' | 'medium' | 'hard' | 'all';
  category?: string;
  track?: '30-day' | '60-day' | 'both' | 'all';
  limit?: number;
  offset?: number;
}

interface SearchResult {
  id: string;
  type: string;
  title: string;
  description: string;
  url: string;
  difficulty?: string;
  category?: string;
  tags?: string[];
  score?: number;
  metadata?: Record<string, any>;
}

/**
 * Search controller for handling global search requests
 */
class SearchController {
  /**
   * Perform global search across all content types
   */
  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        q: query,
        type = 'all',
        difficulty = 'all',
        category,
        track = 'all',
        limit = 20,
        offset = 0,
      } = req.query as SearchQuery;

      // Validate query
      if (!query || typeof query !== 'string' || query.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: 'Search query is required',
        });
        return;
      }

      // Trim and sanitize query
      const sanitizedQuery = query.trim().toLowerCase();

      // In production, this would query the database
      // For now, we'll return a mock response structure
      const results: SearchResult[] = [];
      const total = 0;

      res.status(200).json({
        success: true,
        data: {
          results,
          pagination: {
            total,
            limit: parseInt(String(limit)),
            offset: parseInt(String(offset)),
            hasMore: total > parseInt(String(offset)) + parseInt(String(limit)),
          },
          filters: {
            type,
            difficulty,
            category,
            track,
          },
          query: sanitizedQuery,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get search suggestions based on partial query
   */
  async suggestions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q: query, limit = 5 } = req.query;

      if (!query || typeof query !== 'string' || query.trim().length < 2) {
        res.status(400).json({
          success: false,
          message: 'Query must be at least 2 characters',
        });
        return;
      }

      const sanitizedQuery = query.trim().toLowerCase();

      // In production, this would query the database for suggestions
      const suggestions: string[] = [];

      res.status(200).json({
        success: true,
        data: {
          suggestions,
          query: sanitizedQuery,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get popular/trending searches
   */
  async trending(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { limit = 10 } = req.query;

      // In production, this would fetch from analytics database
      const trending = [
        { query: 'playwright selectors', count: 142 },
        { query: 'page object model', count: 128 },
        { query: 'async await', count: 95 },
        { query: 'test fixtures', count: 87 },
        { query: 'api testing', count: 76 },
      ].slice(0, parseInt(String(limit)));

      res.status(200).json({
        success: true,
        data: {
          trending,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Track search analytics
   */
  async trackAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { query, resultsCount, filters, selectedResultId, selectedResultType } = req.body;

      if (!query || typeof query !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Query is required',
        });
        return;
      }

      // In production, this would save to analytics database
      // For now, just acknowledge receipt
      console.log('Search analytics:', {
        query,
        resultsCount,
        filters,
        selectedResultId,
        selectedResultType,
        timestamp: new Date(),
        userId: (req as any).user?.id, // If authenticated
      });

      res.status(200).json({
        success: true,
        message: 'Analytics tracked successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all available categories for filtering
   */
  async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // In production, this would query unique categories from database
      const categories = [
        'Week 1',
        'Week 2',
        'Week 3',
        'Week 4',
        'Playwright Basics',
        'Advanced Playwright',
        'Selenium WebDriver',
        'Testing Framework',
        'Best Practices',
        'API Testing',
      ];

      res.status(200).json({
        success: true,
        data: {
          categories,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all available tags for filtering
   */
  async getTags(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // In production, this would query unique tags from database
      const tags = [
        'fundamentals',
        'playwright',
        'selenium',
        'testing',
        'best-practices',
        'advanced',
        'debugging',
        'ci-cd',
        'page-object',
        'api-testing',
      ];

      res.status(200).json({
        success: true,
        data: {
          tags,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new SearchController();
