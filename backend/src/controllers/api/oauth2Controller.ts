import { Request, Response } from 'express';
import { OAuth2Service } from '../../services/oauth2Service.js';

export class OAuth2Controller {
  /**
   * Create a new OAuth2 client
   * POST /api/v1/oauth/clients
   */
  static async createClient(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.apiUserId!;
      const {
        name,
        description,
        redirectUris,
        allowedScopes,
        grantTypes,
        isPublic,
        logoUrl,
        websiteUrl,
        privacyPolicyUrl,
        termsOfServiceUrl,
      } = req.body;

      if (!name || !redirectUris || !Array.isArray(redirectUris)) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Name and redirectUris are required',
          },
        });
        return;
      }

      const { client, clientSecret } = await OAuth2Service.createClient(userId, {
        name,
        description,
        redirectUris,
        allowedScopes,
        grantTypes,
        isPublic,
        logoUrl,
        websiteUrl,
        privacyPolicyUrl,
        termsOfServiceUrl,
      });

      res.status(201).json({
        success: true,
        data: {
          client,
          clientSecret, // Only shown once
        },
        meta: {
          message: 'OAuth2 client created successfully. Save the client secret securely.',
        },
      });
    } catch (error) {
      console.error('Create OAuth2 client error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create OAuth2 client',
        },
      });
    }
  }

  /**
   * Get all OAuth2 clients for the user
   * GET /api/v1/oauth/clients
   */
  static async getClients(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.apiUserId!;
      const clients = await OAuth2Service.getUserClients(userId);

      res.json({
        success: true,
        data: clients,
        meta: {
          total: clients.length,
        },
      });
    } catch (error) {
      console.error('Get OAuth2 clients error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve OAuth2 clients',
        },
      });
    }
  }

  /**
   * Update an OAuth2 client
   * PATCH /api/v1/oauth/clients/:clientId
   */
  static async updateClient(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.apiUserId!;
      const { clientId } = req.params;
      const updates = req.body;

      const client = await OAuth2Service.updateClient(userId, clientId, updates);
      if (!client) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'OAuth2 client not found',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: client,
      });
    } catch (error) {
      console.error('Update OAuth2 client error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update OAuth2 client',
        },
      });
    }
  }

  /**
   * Delete an OAuth2 client
   * DELETE /api/v1/oauth/clients/:clientId
   */
  static async deleteClient(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.apiUserId!;
      const { clientId } = req.params;

      const success = await OAuth2Service.deleteClient(userId, clientId);
      if (!success) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'OAuth2 client not found',
          },
        });
        return;
      }

      res.json({
        success: true,
        meta: {
          message: 'OAuth2 client deleted successfully',
        },
      });
    } catch (error) {
      console.error('Delete OAuth2 client error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete OAuth2 client',
        },
      });
    }
  }

  /**
   * Exchange authorization code for tokens
   * POST /api/v1/oauth/token
   */
  static async token(req: Request, res: Response): Promise<void> {
    try {
      const { grant_type, client_id, client_secret, code, refresh_token, scope } = req.body;

      if (!grant_type || !client_id) {
        res.status(400).json({
          error: 'invalid_request',
          error_description: 'grant_type and client_id are required',
        });
        return;
      }

      // Verify client
      const client = await OAuth2Service.verifyClient(client_id, client_secret);
      if (!client) {
        res.status(401).json({
          error: 'invalid_client',
          error_description: 'Invalid client credentials',
        });
        return;
      }

      if (grant_type === 'authorization_code') {
        // In a real implementation, you would verify the authorization code
        // and exchange it for tokens. For now, we'll create tokens directly.
        const scopes = scope ? scope.split(' ') : client.allowedScopes;
        const tokens = await OAuth2Service.createTokens(
          client.userId.toString(),
          client_id,
          scopes
        );
        res.json(tokens);
      } else if (grant_type === 'refresh_token') {
        if (!refresh_token) {
          res.status(400).json({
            error: 'invalid_request',
            error_description: 'refresh_token is required',
          });
          return;
        }

        const tokens = await OAuth2Service.refreshAccessToken(refresh_token);
        if (!tokens) {
          res.status(401).json({
            error: 'invalid_grant',
            error_description: 'Invalid or expired refresh token',
          });
          return;
        }

        res.json(tokens);
      } else {
        res.status(400).json({
          error: 'unsupported_grant_type',
          error_description: 'Unsupported grant type',
        });
      }
    } catch (error) {
      console.error('Token exchange error:', error);
      res.status(500).json({
        error: 'server_error',
        error_description: 'An error occurred while processing the token request',
      });
    }
  }

  /**
   * Revoke a token
   * POST /api/v1/oauth/revoke
   */
  static async revokeToken(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;

      if (!token) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Token is required',
          },
        });
        return;
      }

      await OAuth2Service.revokeToken(token);

      res.json({
        success: true,
        meta: {
          message: 'Token revoked successfully',
        },
      });
    } catch (error) {
      console.error('Revoke token error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to revoke token',
        },
      });
    }
  }

  /**
   * Get active tokens for a client
   * GET /api/v1/oauth/clients/:clientId/tokens
   */
  static async getClientTokens(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.apiUserId!;
      const { clientId } = req.params;

      const tokens = await OAuth2Service.getClientTokens(userId, clientId);

      res.json({
        success: true,
        data: tokens,
        meta: {
          total: tokens.length,
        },
      });
    } catch (error) {
      console.error('Get client tokens error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve tokens',
        },
      });
    }
  }
}
