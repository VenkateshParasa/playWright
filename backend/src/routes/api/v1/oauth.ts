import express from 'express';
import { OAuth2Controller } from '../../../controllers/api/oauth2Controller.js';
import { authenticateApi } from '../../../middleware/apiAuth.js';
import { oauthRateLimit } from '../../../middleware/apiRateLimit.js';

const router = express.Router();

// OAuth2 token endpoint (public - no auth required)
router.post('/token', oauthRateLimit, OAuth2Controller.token);
router.post('/revoke', oauthRateLimit, OAuth2Controller.revokeToken);

// OAuth2 client management (authenticated)
router.use('/clients', authenticateApi);
router.post('/clients', OAuth2Controller.createClient);
router.get('/clients', OAuth2Controller.getClients);
router.patch('/clients/:clientId', OAuth2Controller.updateClient);
router.delete('/clients/:clientId', OAuth2Controller.deleteClient);
router.get('/clients/:clientId/tokens', OAuth2Controller.getClientTokens);

export default router;
