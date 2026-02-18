import { Request, Response } from 'express';
import { emailCampaignService } from '../../services/marketing/emailCampaignService';
import mongoose from 'mongoose';

export class CampaignController {
  /**
   * Create campaign
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, type, subject, fromName, fromEmail, htmlContent, textContent } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const campaign = await emailCampaignService.createCampaign({
        tenantId: req.user?.tenantId,
        name,
        type,
        subject,
        fromName,
        fromEmail,
        htmlContent,
        userId: new mongoose.Types.ObjectId(userId),
      });

      res.status(201).json(campaign);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to create campaign',
      });
    }
  }

  /**
   * Get all campaigns
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { type, status, page, limit } = req.query;

      const result = await emailCampaignService.getCampaigns({
        tenantId: req.user?.tenantId,
        type: type as string,
        status: status as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      res.json(result);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to fetch campaigns',
      });
    }
  }

  /**
   * Get campaign by ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const campaign = await emailCampaignService.getCampaignById(id);

      if (!campaign) {
        res.status(404).json({ error: 'Campaign not found' });
        return;
      }

      res.json(campaign);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to fetch campaign',
      });
    }
  }

  /**
   * Update campaign
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const campaign = await emailCampaignService.updateCampaign(
        id,
        req.body,
        new mongoose.Types.ObjectId(userId)
      );

      if (!campaign) {
        res.status(404).json({ error: 'Campaign not found' });
        return;
      }

      res.json(campaign);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to update campaign',
      });
    }
  }

  /**
   * Delete campaign
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await emailCampaignService.deleteCampaign(id);

      if (!success) {
        res.status(404).json({ error: 'Campaign not found' });
        return;
      }

      res.json({ message: 'Campaign deleted successfully' });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to delete campaign',
      });
    }
  }

  /**
   * Schedule campaign
   */
  async schedule(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { sendAt } = req.body;

      if (!sendAt) {
        res.status(400).json({ error: 'sendAt is required' });
        return;
      }

      const campaign = await emailCampaignService.scheduleCampaign(id, new Date(sendAt));

      if (!campaign) {
        res.status(404).json({ error: 'Campaign not found' });
        return;
      }

      res.json(campaign);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to schedule campaign',
      });
    }
  }

  /**
   * Send campaign now
   */
  async sendNow(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const campaign = await emailCampaignService.sendCampaignNow(id);

      if (!campaign) {
        res.status(404).json({ error: 'Campaign not found' });
        return;
      }

      res.json(campaign);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to send campaign',
      });
    }
  }

  /**
   * Pause campaign
   */
  async pause(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const campaign = await emailCampaignService.pauseCampaign(id);

      if (!campaign) {
        res.status(404).json({ error: 'Campaign not found' });
        return;
      }

      res.json(campaign);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to pause campaign',
      });
    }
  }

  /**
   * Resume campaign
   */
  async resume(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const campaign = await emailCampaignService.resumeCampaign(id);

      if (!campaign) {
        res.status(404).json({ error: 'Campaign not found' });
        return;
      }

      res.json(campaign);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to resume campaign',
      });
    }
  }

  /**
   * Cancel campaign
   */
  async cancel(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const campaign = await emailCampaignService.cancelCampaign(id);

      if (!campaign) {
        res.status(404).json({ error: 'Campaign not found' });
        return;
      }

      res.json(campaign);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to cancel campaign',
      });
    }
  }

  /**
   * Send test email
   */
  async sendTest(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { testEmails } = req.body;

      if (!testEmails || !Array.isArray(testEmails) || testEmails.length === 0) {
        res.status(400).json({ error: 'testEmails array is required' });
        return;
      }

      await emailCampaignService.sendTestEmail(id, testEmails);

      res.json({ message: 'Test emails sent successfully' });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to send test emails',
      });
    }
  }

  /**
   * Get campaign analytics
   */
  async getAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;

      const analytics = await emailCampaignService.getAnalytics(
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
   * Track email open (via pixel)
   */
  async trackOpen(req: Request, res: Response): Promise<void> {
    try {
      const { campaignId, email } = req.params;

      await emailCampaignService.trackOpen(campaignId, email);

      // Return 1x1 transparent pixel
      const pixel = Buffer.from(
        'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
        'base64'
      );

      res.writeHead(200, {
        'Content-Type': 'image/gif',
        'Content-Length': pixel.length,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      });
      res.end(pixel);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to track open',
      });
    }
  }

  /**
   * Track email click (redirect)
   */
  async trackClick(req: Request, res: Response): Promise<void> {
    try {
      const { campaignId } = req.params;
      const { url, email } = req.query;

      if (!url || !email) {
        res.status(400).json({ error: 'url and email are required' });
        return;
      }

      await emailCampaignService.trackClick(campaignId, email as string, url as string);

      // Redirect to original URL
      res.redirect(url as string);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to track click',
      });
    }
  }
}

export const campaignController = new CampaignController();
