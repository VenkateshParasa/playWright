import express from 'express';
import { WebhookController } from '../../../controllers/api/webhookController.js';
import { authenticateApi, requireScope } from '../../../middleware/apiAuth.js';
import { apiKeyRateLimit, webhookRateLimit } from '../../../middleware/apiRateLimit.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateApi);
router.use(apiKeyRateLimit);

// Webhook management routes
router.post('/', webhookRateLimit, requireScope('webhooks:write'), WebhookController.createWebhook);
router.get('/', requireScope('webhooks:read'), WebhookController.getWebhooks);
router.get('/:webhookId', requireScope('webhooks:read'), WebhookController.getWebhook);
router.patch('/:webhookId', requireScope('webhooks:write'), WebhookController.updateWebhook);
router.delete('/:webhookId', requireScope('webhooks:write'), WebhookController.deleteWebhook);
router.post('/:webhookId/test', requireScope('webhooks:write'), WebhookController.testWebhook);
router.get('/:webhookId/events', requireScope('webhooks:read'), WebhookController.getWebhookEvents);
router.get('/:webhookId/stats', requireScope('webhooks:read'), WebhookController.getWebhookStats);

export default router;
