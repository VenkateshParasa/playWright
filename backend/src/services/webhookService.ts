import crypto from 'crypto';
import axios from 'axios';
import { Webhook, IWebhook } from '../models/Webhook.js';
import { WebhookEvent, IWebhookEvent } from '../models/WebhookEvent.js';

export interface WebhookPayload {
  event: string;
  timestamp: string;
  data: Record<string, any>;
}

export class WebhookService {
  /**
   * Generate a webhook secret
   */
  private static generateSecret(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate HMAC signature for webhook payload
   */
  private static generateSignature(payload: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

  /**
   * Verify webhook signature
   */
  static verifySignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = this.generateSignature(payload, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Create a new webhook
   */
  static async createWebhook(
    userId: string,
    data: {
      url: string;
      events: string[];
      description?: string;
      headers?: Record<string, string>;
      retryPolicy?: {
        maxAttempts: number;
        backoffMultiplier: number;
      };
      metadata?: Record<string, any>;
    }
  ): Promise<{ webhook: IWebhook; secret: string }> {
    const secret = this.generateSecret();

    const webhook = await Webhook.create({
      userId,
      url: data.url,
      events: data.events,
      secret,
      description: data.description,
      headers: data.headers || {},
      retryPolicy: data.retryPolicy || {
        maxAttempts: 3,
        backoffMultiplier: 2,
      },
      metadata: data.metadata || {},
    });

    return { webhook, secret };
  }

  /**
   * Get all webhooks for a user
   */
  static async getUserWebhooks(userId: string): Promise<IWebhook[]> {
    return Webhook.find({ userId, isActive: true }).sort({ createdAt: -1 });
  }

  /**
   * Get a single webhook by ID
   */
  static async getWebhookById(userId: string, webhookId: string): Promise<IWebhook | null> {
    return Webhook.findOne({ _id: webhookId, userId });
  }

  /**
   * Update a webhook
   */
  static async updateWebhook(
    userId: string,
    webhookId: string,
    updates: {
      url?: string;
      events?: string[];
      description?: string;
      headers?: Record<string, string>;
      isActive?: boolean;
      retryPolicy?: {
        maxAttempts: number;
        backoffMultiplier: number;
      };
      metadata?: Record<string, any>;
    }
  ): Promise<IWebhook | null> {
    return Webhook.findOneAndUpdate(
      { _id: webhookId, userId },
      { $set: updates },
      { new: true }
    );
  }

  /**
   * Delete a webhook
   */
  static async deleteWebhook(userId: string, webhookId: string): Promise<boolean> {
    const result = await Webhook.deleteOne({ _id: webhookId, userId });
    return result.deletedCount > 0;
  }

  /**
   * Trigger webhooks for an event
   */
  static async triggerEvent(
    eventType: string,
    data: Record<string, any>,
    userId?: string
  ): Promise<void> {
    // Find all active webhooks subscribed to this event
    const query: any = {
      events: eventType,
      isActive: true,
    };

    if (userId) {
      query.userId = userId;
    }

    const webhooks = await Webhook.find(query).select('+secret');

    // Create webhook events for each webhook
    const eventPromises = webhooks.map(async (webhook) => {
      const payload: WebhookPayload = {
        event: eventType,
        timestamp: new Date().toISOString(),
        data,
      };

      const payloadString = JSON.stringify(payload);
      const signature = this.generateSignature(payloadString, webhook.secret);

      // Create event record
      const webhookEvent = await WebhookEvent.create({
        webhookId: webhook._id,
        eventType,
        payload,
        signature,
        maxAttempts: webhook.retryPolicy.maxAttempts,
      });

      // Trigger delivery (async)
      this.deliverWebhook(webhookEvent, webhook).catch((error) => {
        console.error(`Failed to deliver webhook ${webhookEvent._id}:`, error);
      });
    });

    await Promise.all(eventPromises);
  }

  /**
   * Deliver a webhook event
   */
  private static async deliverWebhook(
    event: IWebhookEvent,
    webhook: IWebhook
  ): Promise<void> {
    const startTime = Date.now();

    try {
      const headers = {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': `sha256=${event.signature}`,
        'X-Webhook-Event': event.eventType,
        'X-Webhook-Id': event._id.toString(),
        'X-Webhook-Timestamp': event.createdAt.toISOString(),
        ...webhook.headers,
      };

      const response = await axios.post(webhook.url, event.payload, {
        headers,
        timeout: 30000, // 30 seconds
        validateStatus: (status) => status >= 200 && status < 300,
      });

      const duration = Date.now() - startTime;

      // Update event as successful
      await WebhookEvent.updateOne(
        { _id: event._id },
        {
          $set: {
            status: 'success',
            attempts: event.attempts + 1,
            lastAttemptAt: new Date(),
            responseStatus: response.status,
            responseBody: JSON.stringify(response.data).substring(0, 1000),
            deliveryDuration: duration,
          },
        }
      );

      // Update webhook stats
      await Webhook.updateOne(
        { _id: webhook._id },
        {
          $inc: { successCount: 1 },
          $set: { lastTriggeredAt: new Date() },
        }
      );
    } catch (error: any) {
      const duration = Date.now() - startTime;
      const attempts = event.attempts + 1;

      // Determine if we should retry
      const shouldRetry = attempts < event.maxAttempts;
      const status = shouldRetry ? 'retrying' : 'failed';

      // Calculate next retry time with exponential backoff
      let nextRetryAt = undefined;
      if (shouldRetry) {
        const backoffSeconds = Math.pow(webhook.retryPolicy.backoffMultiplier, attempts) * 60;
        nextRetryAt = new Date(Date.now() + backoffSeconds * 1000);
      }

      // Update event
      await WebhookEvent.updateOne(
        { _id: event._id },
        {
          $set: {
            status,
            attempts,
            lastAttemptAt: new Date(),
            nextRetryAt,
            responseStatus: error.response?.status,
            responseBody: error.response?.data
              ? JSON.stringify(error.response.data).substring(0, 1000)
              : error.message,
            errorMessage: error.message,
            deliveryDuration: duration,
          },
        }
      );

      // Update webhook stats
      if (!shouldRetry) {
        await Webhook.updateOne(
          { _id: webhook._id },
          {
            $inc: { failureCount: 1 },
            $set: { lastTriggeredAt: new Date() },
          }
        );
      }

      // Schedule retry if needed
      if (shouldRetry && nextRetryAt) {
        setTimeout(
          () => {
            this.retryWebhook(event._id.toString()).catch((retryError) => {
              console.error(`Failed to retry webhook ${event._id}:`, retryError);
            });
          },
          nextRetryAt.getTime() - Date.now()
        );
      }
    }
  }

  /**
   * Retry a failed webhook event
   */
  private static async retryWebhook(eventId: string): Promise<void> {
    const event = await WebhookEvent.findById(eventId);
    if (!event) {
      return;
    }

    const webhook = await Webhook.findById(event.webhookId).select('+secret');
    if (!webhook) {
      return;
    }

    await this.deliverWebhook(event, webhook);
  }

  /**
   * Test webhook delivery
   */
  static async testWebhook(
    userId: string,
    webhookId: string
  ): Promise<{ success: boolean; status?: number; error?: string }> {
    const webhook = await Webhook.findOne({ _id: webhookId, userId }).select('+secret');
    if (!webhook) {
      return { success: false, error: 'Webhook not found' };
    }

    const payload: WebhookPayload = {
      event: 'webhook.test',
      timestamp: new Date().toISOString(),
      data: {
        message: 'This is a test webhook delivery',
        webhookId: webhook._id,
      },
    };

    const payloadString = JSON.stringify(payload);
    const signature = this.generateSignature(payloadString, webhook.secret);

    try {
      const headers = {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': `sha256=${signature}`,
        'X-Webhook-Event': 'webhook.test',
        'X-Webhook-Timestamp': new Date().toISOString(),
        ...webhook.headers,
      };

      const response = await axios.post(webhook.url, payload, {
        headers,
        timeout: 30000,
        validateStatus: (status) => status >= 200 && status < 300,
      });

      return { success: true, status: response.status };
    } catch (error: any) {
      return {
        success: false,
        status: error.response?.status,
        error: error.message,
      };
    }
  }

  /**
   * Get webhook events/logs
   */
  static async getWebhookEvents(
    userId: string,
    webhookId: string,
    options: {
      status?: 'pending' | 'success' | 'failed' | 'retrying';
      limit?: number;
      skip?: number;
    } = {}
  ): Promise<{ events: IWebhookEvent[]; total: number }> {
    // Verify webhook belongs to user
    const webhook = await Webhook.findOne({ _id: webhookId, userId });
    if (!webhook) {
      return { events: [], total: 0 };
    }

    const query: any = { webhookId };
    if (options.status) {
      query.status = options.status;
    }

    const [events, total] = await Promise.all([
      WebhookEvent.find(query)
        .sort({ createdAt: -1 })
        .limit(options.limit || 50)
        .skip(options.skip || 0),
      WebhookEvent.countDocuments(query),
    ]);

    return { events, total };
  }

  /**
   * Get webhook statistics
   */
  static async getWebhookStats(
    userId: string,
    webhookId: string
  ): Promise<{
    successCount: number;
    failureCount: number;
    totalCount: number;
    successRate: number;
    lastTriggeredAt?: Date;
  } | null> {
    const webhook = await Webhook.findOne({ _id: webhookId, userId });
    if (!webhook) {
      return null;
    }

    const totalCount = webhook.successCount + webhook.failureCount;
    const successRate = totalCount > 0 ? (webhook.successCount / totalCount) * 100 : 0;

    return {
      successCount: webhook.successCount,
      failureCount: webhook.failureCount,
      totalCount,
      successRate,
      lastTriggeredAt: webhook.lastTriggeredAt,
    };
  }

  /**
   * Process pending webhook retries (called by cron job)
   */
  static async processRetries(): Promise<void> {
    const now = new Date();
    const events = await WebhookEvent.find({
      status: 'retrying',
      nextRetryAt: { $lte: now },
    }).limit(100);

    for (const event of events) {
      const webhook = await Webhook.findById(event.webhookId).select('+secret');
      if (webhook && webhook.isActive) {
        await this.deliverWebhook(event, webhook);
      }
    }
  }
}
