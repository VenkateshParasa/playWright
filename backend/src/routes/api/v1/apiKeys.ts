import express from 'express';
import { ApiKeyController } from '../../../controllers/api/apiKeyController.js';
import { authenticateApi, requireScope } from '../../../middleware/apiAuth.js';
import { apiKeyRateLimit } from '../../../middleware/apiRateLimit.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateApi);
router.use(apiKeyRateLimit);

// API Key management routes
router.post('/', requireScope('api_keys:write'), ApiKeyController.createApiKey);
router.get('/', requireScope('api_keys:read'), ApiKeyController.getApiKeys);
router.get('/:keyId', requireScope('api_keys:read'), ApiKeyController.getApiKey);
router.patch('/:keyId', requireScope('api_keys:write'), ApiKeyController.updateApiKey);
router.delete('/:keyId', requireScope('api_keys:write'), ApiKeyController.revokeApiKey);
router.post('/:keyId/rotate', requireScope('api_keys:write'), ApiKeyController.rotateApiKey);
router.get('/:keyId/usage', requireScope('api_keys:read'), ApiKeyController.getUsageStats);

export default router;
