import express from 'express';
import usersRouter from './users.js';
import apiKeysRouter from './apiKeys.js';
import webhooksRouter from './webhooks.js';
import oauthRouter from './oauth.js';

const router = express.Router();

// API v1 routes
router.use('/users', usersRouter);
router.use('/api-keys', apiKeysRouter);
router.use('/webhooks', webhooksRouter);
router.use('/oauth', oauthRouter);

// API health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'operational',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;
