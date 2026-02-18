import { Request, Response } from 'express';
import { ApiKeyService } from '../../services/apiKeyService.js';

export class ApiKeyController {
  /**
   * Create a new API key
   * POST /api/v1/api-keys
   */
  static async createApiKey(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.apiUserId!;
      const { name, environment, scopes, rateLimit, expiresAt, ipWhitelist, metadata } = req.body;

      // Validate required fields
      if (!name || !environment) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Name and environment are required',
          },
        });
        return;
      }

      // Create API key
      const { apiKey, plainKey } = await ApiKeyService.createApiKey(userId, {
        name,
        environment,
        scopes,
        rateLimit,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        ipWhitelist,
        metadata,
      });

      res.status(201).json({
        success: true,
        data: {
          apiKey,
          key: plainKey, // Only shown once
        },
        meta: {
          message: 'API key created successfully. Save this key securely - it will not be shown again.',
        },
      });
    } catch (error) {
      console.error('Create API key error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create API key',
        },
      });
    }
  }

  /**
   * Get all API keys for the authenticated user
   * GET /api/v1/api-keys
   */
  static async getApiKeys(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.apiUserId!;
      const apiKeys = await ApiKeyService.getUserApiKeys(userId);

      res.json({
        success: true,
        data: apiKeys,
        meta: {
          total: apiKeys.length,
        },
      });
    } catch (error) {
      console.error('Get API keys error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve API keys',
        },
      });
    }
  }

  /**
   * Get a single API key by ID
   * GET /api/v1/api-keys/:keyId
   */
  static async getApiKey(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.apiUserId!;
      const { keyId } = req.params;

      const apiKey = await ApiKeyService.getApiKeyById(userId, keyId);
      if (!apiKey) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'API key not found',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: apiKey,
      });
    } catch (error) {
      console.error('Get API key error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve API key',
        },
      });
    }
  }

  /**
   * Update an API key
   * PATCH /api/v1/api-keys/:keyId
   */
  static async updateApiKey(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.apiUserId!;
      const { keyId } = req.params;
      const updates = req.body;

      const apiKey = await ApiKeyService.updateApiKey(userId, keyId, updates);
      if (!apiKey) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'API key not found',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: apiKey,
      });
    } catch (error) {
      console.error('Update API key error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update API key',
        },
      });
    }
  }

  /**
   * Revoke an API key
   * DELETE /api/v1/api-keys/:keyId
   */
  static async revokeApiKey(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.apiUserId!;
      const { keyId } = req.params;

      const success = await ApiKeyService.revokeApiKey(userId, keyId);
      if (!success) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'API key not found',
          },
        });
        return;
      }

      res.json({
        success: true,
        meta: {
          message: 'API key revoked successfully',
        },
      });
    } catch (error) {
      console.error('Revoke API key error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to revoke API key',
        },
      });
    }
  }

  /**
   * Rotate an API key
   * POST /api/v1/api-keys/:keyId/rotate
   */
  static async rotateApiKey(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.apiUserId!;
      const { keyId } = req.params;

      const result = await ApiKeyService.rotateApiKey(userId, keyId);
      if (!result) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'API key not found',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: {
          apiKey: result.apiKey,
          key: result.plainKey, // Only shown once
        },
        meta: {
          message: 'API key rotated successfully. Save this key securely - it will not be shown again.',
        },
      });
    } catch (error) {
      console.error('Rotate API key error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to rotate API key',
        },
      });
    }
  }

  /**
   * Get API key usage statistics
   * GET /api/v1/api-keys/:keyId/usage
   */
  static async getUsageStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.apiUserId!;
      const { keyId } = req.params;

      const stats = await ApiKeyService.getUsageStats(userId, keyId);
      if (!stats) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'API key not found',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Get usage stats error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve usage statistics',
        },
      });
    }
  }
}
