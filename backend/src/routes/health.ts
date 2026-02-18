/**
 * Health Check Routes
 *
 * Features:
 * - GET /health - Basic health check
 * - GET /health/detailed - Detailed system status
 * - GET /metrics - Prometheus metrics
 */

import express, { Request, Response } from 'express';
import { getSystemHealth, getDetailedHealth, checkAlertThresholds } from '../services/monitoringService.js';
import { exportPrometheusMetrics } from '../utils/metricsCollector.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * Basic health check
 * GET /api/health
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const health = await getSystemHealth();

    const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;

    res.status(statusCode).json({
      success: true,
      data: health,
    });
  })
);

/**
 * Detailed health check
 * GET /api/health/detailed
 */
router.get(
  '/detailed',
  asyncHandler(async (req: Request, res: Response) => {
    const health = await getDetailedHealth();

    const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;

    res.status(statusCode).json({
      success: true,
      data: health,
    });
  })
);

/**
 * Check alert thresholds
 * GET /api/health/alerts
 */
router.get(
  '/alerts',
  asyncHandler(async (req: Request, res: Response) => {
    const alerts = await checkAlertThresholds();

    res.json({
      success: true,
      data: alerts,
    });
  })
);

/**
 * Prometheus metrics endpoint
 * GET /api/health/metrics
 */
router.get('/metrics', (req: Request, res: Response) => {
  const metrics = exportPrometheusMetrics();

  res.set('Content-Type', 'text/plain');
  res.send(metrics);
});

export default router;
