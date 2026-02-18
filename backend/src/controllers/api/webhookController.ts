import { Request, Response } from 'express';
import { WebhookService } from '../../services/webhookService.js';

export class WebhookController {
  /**
   * Create a new webhook
   * POST /api/v1/webhooks
   */
  static async createWebhook(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.apiUserId!;
      const { url, events, description, headers, retryPolicy, metadata } = req.body;

      // Validate required fields
      if (!url || !events || !Array.isArray(events) || events.length === 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'URL and events array are required',
          },
        });
        return;
      }

      // Create webhook
      const { webhook, secret } = await WebhookService.createWebhook(userId, {
        url,
        events,
        description,
        headers,
        retryPolicy,
        metadata,
      });

      res.status(201).json({
        success: true,
        data: {
          webhook,
          secret, // Only shown once
        },
        meta: {
          message: 'Webhook created successfully. Save the secret securely - it will not be shown again.',
        },
      });
    } catch (error: any) {
      console.error('Create webhook error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message || 'Failed to create webhook',
        },
      });
    }
  }

  /**
   * Get all webhooks for the authenticated user
   * GET /api/v1/webhooks
   */
  static async getWebhooks(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.apiUserId!;
      const webhooks = await WebhookService.getUserWebhooks(userId);

      res.json({
        success: true,
        data: webhooks,
        meta: {
          total: webhooks.length,
        },
      });
    } catch (error) {
      console.error('Get webhooks error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve webhooks',
        },
      });
    }
  }

  /**
   * Get a single webhook by ID
   * GET /api/v1/webhooks/:webhookId
   */
  static async getWebhook(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.apiUserId!;
      const { webhookId } = req.params;

      const webhook = await WebhookService.getWebhookById(userId, webhookId);
      if (!webhook) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Webhook not found',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: webhook,
      });
    } catch (error) {
      console.error('Get webhook error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve webhook',
        },
      });
    }
  }

  /**
   * Update a webhook
   * PATCH /api/v1/webhooks/:webhookId
   */
  static async updateWebhook(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.apiUserId!;
      const { webhookId } = req.params;
      const updates = req.body;

      const webhook = await WebhookService.updateWebhook(userId, webhookId, updates);
      if (!webhook) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Webhook not found',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: webhook,
      });
    } catch (error) {
      console.error('Update webhook error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update webhook',
        },
      });
    }
  }

  /**
   * Delete a webhook
   * DELETE /api/v1/webhooks/:webhookId
   */
  static async deleteWebhook(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.apiUserId!;
      const { webhookId } = req.params;

      const success = await WebhookService.deleteWebhook(userId, webhookId);
      if (!success) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Webhook not found',
          },
        });
        return;
      }

      res.json({
        success: true,
        meta: {
          message: 'Webhook deleted successfully',
        },
      });
    } catch (error) {
      console.error('Delete webhook error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete webhook',
        },
      });
    }
  }

  /**
   * Test webhook delivery
   * POST /api/v1/webhooks/:webhookId/test
   */
  static async testWebhook(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.apiUserId!;
      const { webhookId } = req.params;

      const result = await WebhookService.testWebhook(userId, webhookId);

      if (result.success) {
        res.json({
          success: true,
          data: result,
          meta: {
            message: 'Webhook test delivered successfully',
          },
        });
      } else {
        res.status(400).json({
          success: false,
          error: {
            code: 'WEBHOOK_TEST_FAILED',
            message: result.error || 'Webhook test failed',
            details: result,
          },
        });
      }
    } catch (error) {
      console.error('Test webhook error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to test webhook',
        },
      });
    }
  }

  /**
   * Get webhook events/logs
   * GET /api/v1/webhooks/:webhookId/events
   */
  static async getWebhookEvents(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.apiUserId!;
      const { webhookId } = req.params;
      const { status, limit, page } = req.query;

      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 50;
      const skip = (pageNum - 1) * limitNum;

      const { events, total } = await WebhookService.getWebhookEvents(userId, webhookId, {
        status: status as any,
        limit: limitNum,
        skip,
      });

      res.json({
        success: true,
        data: events,
        meta: {
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum),
          },
        },
        links: {
          self: `/api/v1/webhooks/${webhookId}/events?page=${pageNum}&limit=${limitNum}`,
          next:
            pageNum * limitNum < total
              ? `/api/v1/webhooks/${webhookId}/events?page=${pageNum + 1}&limit=${limitNum}`
              : null,
          prev:
            pageNum > 1
              ? `/api/v1/webhooks/${webhookId}/events?page=${pageNum - 1}&limit=${limitNum}`
              : null,
        },
      });
    } catch (error) {
      console.error('Get webhook events error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve webhook events',
        },
      });
    }
  }

  /**
   * Get webhook statistics
   * GET /api/v1/webhooks/:webhookId/stats
   */
  static async getWebhookStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.apiUserId!;
      const { webhookId } = req.params;

      const stats = await WebhookService.getWebhookStats(userId, webhookId);
      if (!stats) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Webhook not found',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Get webhook stats error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve webhook statistics',
        },
      });
    }
  }
}
