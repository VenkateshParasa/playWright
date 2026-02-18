import { Request, Response } from 'express';
import { landingPageService } from '../../services/marketing/landingPageService';
import mongoose from 'mongoose';

export class LandingPageController {
  /**
   * Create landing page
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { title, slug, type, content, css, seo, description } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const landingPage = await landingPageService.createLandingPage({
        tenantId: req.user?.tenantId,
        title,
        slug,
        type,
        content,
        css,
        seo,
        description,
        userId: new mongoose.Types.ObjectId(userId),
      });

      res.status(201).json(landingPage);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to create landing page',
      });
    }
  }

  /**
   * Get all landing pages
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { type, status, isTemplate, page, limit } = req.query;

      const result = await landingPageService.getLandingPages({
        tenantId: req.user?.tenantId,
        type: type as string,
        status: status as string,
        isTemplate: isTemplate === 'true',
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      res.json(result);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to fetch landing pages',
      });
    }
  }

  /**
   * Get landing page by ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const landingPage = await landingPageService.getLandingPageById(id);

      if (!landingPage) {
        res.status(404).json({ error: 'Landing page not found' });
        return;
      }

      res.json(landingPage);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to fetch landing page',
      });
    }
  }

  /**
   * Get landing page by slug (public)
   */
  async getBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      const landingPage = await landingPageService.getLandingPageBySlug(slug, req.user?.tenantId);

      if (!landingPage) {
        res.status(404).json({ error: 'Landing page not found' });
        return;
      }

      // Track page view
      await landingPageService.trackPageView(landingPage._id, {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        referer: req.headers.referer,
        utmSource: req.query.utm_source as string,
        utmMedium: req.query.utm_medium as string,
      });

      res.json(landingPage);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to fetch landing page',
      });
    }
  }

  /**
   * Update landing page
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const landingPage = await landingPageService.updateLandingPage(
        id,
        req.body,
        new mongoose.Types.ObjectId(userId)
      );

      if (!landingPage) {
        res.status(404).json({ error: 'Landing page not found' });
        return;
      }

      res.json(landingPage);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to update landing page',
      });
    }
  }

  /**
   * Delete landing page
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await landingPageService.deleteLandingPage(id);

      if (!success) {
        res.status(404).json({ error: 'Landing page not found' });
        return;
      }

      res.json({ message: 'Landing page deleted successfully' });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to delete landing page',
      });
    }
  }

  /**
   * Publish landing page
   */
  async publish(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const landingPage = await landingPageService.publishLandingPage(id);

      if (!landingPage) {
        res.status(404).json({ error: 'Landing page not found' });
        return;
      }

      res.json(landingPage);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to publish landing page',
      });
    }
  }

  /**
   * Unpublish landing page
   */
  async unpublish(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const landingPage = await landingPageService.unpublishLandingPage(id);

      if (!landingPage) {
        res.status(404).json({ error: 'Landing page not found' });
        return;
      }

      res.json(landingPage);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to unpublish landing page',
      });
    }
  }

  /**
   * Create A/B test variant
   */
  async createVariant(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, content, css } = req.body;

      const landingPage = await landingPageService.createVariant(id, {
        name,
        content,
        css,
      });

      if (!landingPage) {
        res.status(404).json({ error: 'Landing page not found' });
        return;
      }

      res.json(landingPage);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to create variant',
      });
    }
  }

  /**
   * Activate variant
   */
  async activateVariant(req: Request, res: Response): Promise<void> {
    try {
      const { id, variantId } = req.params;

      const landingPage = await landingPageService.activateVariant(id, variantId);

      if (!landingPage) {
        res.status(404).json({ error: 'Landing page not found' });
        return;
      }

      res.json(landingPage);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to activate variant',
      });
    }
  }

  /**
   * Get analytics
   */
  async getAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;

      const analytics = await landingPageService.getAnalytics(
        id,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.json(analytics);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to fetch analytics',
      });
    }
  }

  /**
   * Clone as template
   */
  async cloneAsTemplate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, category } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const template = await landingPageService.cloneAsTemplate(id, {
        name,
        category,
        userId: new mongoose.Types.ObjectId(userId),
      });

      res.status(201).json(template);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to clone as template',
      });
    }
  }

  /**
   * Create from template
   */
  async createFromTemplate(req: Request, res: Response): Promise<void> {
    try {
      const { templateId } = req.params;
      const { title, slug } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const page = await landingPageService.createFromTemplate(templateId, {
        title,
        slug,
        tenantId: req.user?.tenantId,
        userId: new mongoose.Types.ObjectId(userId),
      });

      res.status(201).json(page);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to create from template',
      });
    }
  }

  /**
   * Submit form
   */
  async submitForm(req: Request, res: Response): Promise<void> {
    try {
      const { id, formId } = req.params;
      const formData = req.body;

      const result = await landingPageService.submitForm(id, formId, formData);

      res.json(result);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to submit form',
      });
    }
  }

  /**
   * Track conversion
   */
  async trackConversion(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { variantId } = req.body;

      await landingPageService.trackConversion(id, variantId);

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to track conversion',
      });
    }
  }
}

export const landingPageController = new LandingPageController();
