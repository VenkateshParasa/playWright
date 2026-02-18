import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OAuth2Client, IOAuth2Client } from '../models/OAuth2Client.js';
import { OAuth2Token, IOAuth2Token } from '../models/OAuth2Token.js';

export interface TokenResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

export class OAuth2Service {
  private static JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  private static ACCESS_TOKEN_EXPIRY = 3600; // 1 hour in seconds
  private static REFRESH_TOKEN_EXPIRY = 2592000; // 30 days in seconds

  /**
   * Generate client credentials
   */
  private static generateClientCredentials(): {
    clientId: string;
    clientSecret: string;
  } {
    const clientId = `client_${crypto.randomBytes(16).toString('hex')}`;
    const clientSecret = crypto.randomBytes(32).toString('hex');
    return { clientId, clientSecret };
  }

  /**
   * Create a new OAuth2 client
   */
  static async createClient(
    userId: string,
    data: {
      name: string;
      description?: string;
      redirectUris: string[];
      allowedScopes?: string[];
      grantTypes?: ('authorization_code' | 'refresh_token' | 'client_credentials')[];
      isPublic?: boolean;
      logoUrl?: string;
      websiteUrl?: string;
      privacyPolicyUrl?: string;
      termsOfServiceUrl?: string;
    }
  ): Promise<{ client: IOAuth2Client; clientSecret: string }> {
    const { clientId, clientSecret } = this.generateClientCredentials();
    const hashedSecret = await bcrypt.hash(clientSecret, 10);

    const client = await OAuth2Client.create({
      userId,
      clientId,
      clientSecret: hashedSecret,
      name: data.name,
      description: data.description,
      redirectUris: data.redirectUris,
      allowedScopes: data.allowedScopes || ['users:read', 'lessons:read'],
      grantTypes: data.grantTypes || ['authorization_code', 'refresh_token'],
      isPublic: data.isPublic || false,
      logoUrl: data.logoUrl,
      websiteUrl: data.websiteUrl,
      privacyPolicyUrl: data.privacyPolicyUrl,
      termsOfServiceUrl: data.termsOfServiceUrl,
    });

    return { client, clientSecret };
  }

  /**
   * Get OAuth2 clients for a user
   */
  static async getUserClients(userId: string): Promise<IOAuth2Client[]> {
    return OAuth2Client.find({ userId, isActive: true }).sort({ createdAt: -1 });
  }

  /**
   * Get a client by client ID
   */
  static async getClientByClientId(clientId: string): Promise<IOAuth2Client | null> {
    return OAuth2Client.findOne({ clientId, isActive: true });
  }

  /**
   * Verify client credentials
   */
  static async verifyClient(
    clientId: string,
    clientSecret: string
  ): Promise<IOAuth2Client | null> {
    const client = await OAuth2Client.findOne({ clientId, isActive: true }).select(
      '+clientSecret'
    );

    if (!client) {
      return null;
    }

    // Public clients don't need secret verification
    if (client.isPublic) {
      return client;
    }

    const isValid = await bcrypt.compare(clientSecret, client.clientSecret);
    return isValid ? client : null;
  }

  /**
   * Generate authorization code (for authorization code flow)
   */
  static generateAuthorizationCode(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate access token
   */
  private static generateAccessToken(
    userId: string,
    clientId: string,
    scopes: string[]
  ): string {
    return jwt.sign(
      {
        sub: userId,
        client_id: clientId,
        scopes,
        type: 'access',
      },
      this.JWT_SECRET,
      {
        expiresIn: this.ACCESS_TOKEN_EXPIRY,
      }
    );
  }

  /**
   * Generate refresh token
   */
  private static generateRefreshToken(
    userId: string,
    clientId: string,
    scopes: string[]
  ): string {
    return jwt.sign(
      {
        sub: userId,
        client_id: clientId,
        scopes,
        type: 'refresh',
      },
      this.JWT_SECRET,
      {
        expiresIn: this.REFRESH_TOKEN_EXPIRY,
      }
    );
  }

  /**
   * Create tokens (access + refresh)
   */
  static async createTokens(
    userId: string,
    clientId: string,
    scopes: string[]
  ): Promise<TokenResponse> {
    const accessToken = this.generateAccessToken(userId, clientId, scopes);
    const refreshToken = this.generateRefreshToken(userId, clientId, scopes);

    const hashedAccessToken = await bcrypt.hash(accessToken, 10);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    const accessTokenExpiresAt = new Date(Date.now() + this.ACCESS_TOKEN_EXPIRY * 1000);
    const refreshTokenExpiresAt = new Date(Date.now() + this.REFRESH_TOKEN_EXPIRY * 1000);

    // Store token record
    await OAuth2Token.create({
      userId,
      clientId,
      accessToken: hashedAccessToken,
      refreshToken: hashedRefreshToken,
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
      scopes,
    });

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: this.ACCESS_TOKEN_EXPIRY,
      refresh_token: refreshToken,
      scope: scopes.join(' '),
    };
  }

  /**
   * Verify access token
   */
  static async verifyAccessToken(token: string): Promise<{
    userId: string;
    clientId: string;
    scopes: string[];
  } | null> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as {
        sub: string;
        client_id: string;
        scopes: string[];
        type: string;
      };

      if (decoded.type !== 'access') {
        return null;
      }

      // Check if token is revoked
      const tokenRecord = await OAuth2Token.findOne({
        userId: decoded.sub,
        clientId: decoded.client_id,
        isRevoked: false,
      }).select('+accessToken');

      if (!tokenRecord) {
        return null;
      }

      // Verify token hash matches
      const isValid = await bcrypt.compare(token, tokenRecord.accessToken);
      if (!isValid) {
        return null;
      }

      return {
        userId: decoded.sub,
        clientId: decoded.client_id,
        scopes: decoded.scopes,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshAccessToken(refreshToken: string): Promise<TokenResponse | null> {
    try {
      const decoded = jwt.verify(refreshToken, this.JWT_SECRET) as {
        sub: string;
        client_id: string;
        scopes: string[];
        type: string;
      };

      if (decoded.type !== 'refresh') {
        return null;
      }

      // Find token record
      const tokenRecord = await OAuth2Token.findOne({
        userId: decoded.sub,
        clientId: decoded.client_id,
        isRevoked: false,
      }).select('+refreshToken');

      if (!tokenRecord) {
        return null;
      }

      // Verify refresh token hash
      const isValid = await bcrypt.compare(refreshToken, tokenRecord.refreshToken!);
      if (!isValid) {
        return null;
      }

      // Check if refresh token is expired
      if (tokenRecord.refreshTokenExpiresAt! < new Date()) {
        return null;
      }

      // Create new access token
      const newAccessToken = this.generateAccessToken(
        decoded.sub,
        decoded.client_id,
        decoded.scopes
      );
      const hashedAccessToken = await bcrypt.hash(newAccessToken, 10);
      const accessTokenExpiresAt = new Date(Date.now() + this.ACCESS_TOKEN_EXPIRY * 1000);

      // Update token record
      await OAuth2Token.updateOne(
        { _id: tokenRecord._id },
        {
          $set: {
            accessToken: hashedAccessToken,
            accessTokenExpiresAt,
          },
        }
      );

      return {
        access_token: newAccessToken,
        token_type: 'Bearer',
        expires_in: this.ACCESS_TOKEN_EXPIRY,
        scope: decoded.scopes.join(' '),
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Revoke a token
   */
  static async revokeToken(token: string): Promise<boolean> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as {
        sub: string;
        client_id: string;
      };

      const result = await OAuth2Token.updateMany(
        {
          userId: decoded.sub,
          clientId: decoded.client_id,
          isRevoked: false,
        },
        {
          $set: { isRevoked: true },
        }
      );

      return result.modifiedCount > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Revoke all tokens for a client
   */
  static async revokeAllClientTokens(userId: string, clientId: string): Promise<number> {
    const result = await OAuth2Token.updateMany(
      {
        userId,
        clientId,
        isRevoked: false,
      },
      {
        $set: { isRevoked: true },
      }
    );

    return result.modifiedCount;
  }

  /**
   * Update OAuth2 client
   */
  static async updateClient(
    userId: string,
    clientId: string,
    updates: {
      name?: string;
      description?: string;
      redirectUris?: string[];
      allowedScopes?: string[];
      isActive?: boolean;
      logoUrl?: string;
      websiteUrl?: string;
      privacyPolicyUrl?: string;
      termsOfServiceUrl?: string;
    }
  ): Promise<IOAuth2Client | null> {
    const client = await OAuth2Client.findOne({ clientId, userId });
    if (!client) {
      return null;
    }

    return OAuth2Client.findByIdAndUpdate(client._id, { $set: updates }, { new: true });
  }

  /**
   * Delete OAuth2 client
   */
  static async deleteClient(userId: string, clientId: string): Promise<boolean> {
    const client = await OAuth2Client.findOne({ clientId, userId });
    if (!client) {
      return false;
    }

    // Revoke all tokens for this client
    await this.revokeAllClientTokens(userId, clientId);

    // Delete client
    const result = await OAuth2Client.deleteOne({ _id: client._id });
    return result.deletedCount > 0;
  }

  /**
   * Get active tokens for a client
   */
  static async getClientTokens(
    userId: string,
    clientId: string
  ): Promise<IOAuth2Token[]> {
    const client = await OAuth2Client.findOne({ clientId, userId });
    if (!client) {
      return [];
    }

    return OAuth2Token.find({
      userId,
      clientId,
      isRevoked: false,
      accessTokenExpiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });
  }
}
