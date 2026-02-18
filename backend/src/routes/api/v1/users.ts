import express from 'express';
import { UserApiController } from '../../../controllers/api/userApiController.js';
import { authenticateApi, requireScope } from '../../../middleware/apiAuth.js';
import { apiKeyRateLimit } from '../../../middleware/apiRateLimit.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateApi);
router.use(apiKeyRateLimit);

// User routes
router.get('/me', requireScope('users:read'), UserApiController.getCurrentUser);
router.patch('/me', requireScope('users:write'), UserApiController.updateCurrentUser);
router.get('/:userId', requireScope('users:read'), UserApiController.getUserById);

export default router;
