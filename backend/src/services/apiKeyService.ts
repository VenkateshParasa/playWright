import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { ApiKey, IApiKey } from '../models/ApiKey.js';

export class ApiKeyService {
  /**
   * Generate a new API key
   */
  private static generateKey(): { key: string; prefix: string } {
    const randomBytes = crypto.randomBytes(32);
    const key = `pk_${crypto.randomBytes(4).toString('hex')}_${randomBytes.toString('hex')}`;
    const prefix = key.substring(0, 15); // First 15 chars for identification
    return { key, prefix };
  }

  /**
   * Create a new API key for a user
   */
  static async createApiKey(
    userId: string,
    data: {
      name: string;
      environment: 'development' | 'production';
      scopes?: string[];
      rateLimit?: number;
      expiresAt?: Date;
      ipWhitelist?: string[];
      metadata?: Record<string, any>;
    }
  ): Promise<{ apiKey: IApiKey; plainKey: string }> {
    const { key, prefix } = this.generateKey();
    const hashedKey = await bcrypt.hash(key, 10);

    const apiKey = await ApiKey.create({
      userId,
      name: data.name,
      key: hashedKey,
      keyPrefix: prefix,
      environment: data.environment,
      scopes: data.scopes || ['users:read', 'lessons:read'],
      rateLimit: data.rateLimit || 1000,
      expiresAt: data.expiresAt,
      ipWhitelist: data.ipWhitelist || [],
      metadata: data.metadata || {},
    });

    return { apiKey, plainKey: key };
  }

  /**
   * Verify an API key and return the key document
   */
  static async verifyApiKey(key: string): Promise<IApiKey | null> {
    const prefix = key.substring(0, 15);

    // Find keys with matching prefix
    const apiKeys = await ApiKey.find({
      keyPrefix: prefix,
      isActive: true,
    }).select('+key');

    // Check each key with matching prefix
    for (const apiKey of apiKeys) {
      const isValid = await bcrypt.compare(key, apiKey.key);
      if (isValid) {
        // Check if expired
        if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
          return null;
        }

        // Update usage stats
        await ApiKey.updateOne(
          { _id: apiKey._id },
          {
            $inc: { usageCount: 1 },
            $set: { lastUsedAt: new Date() },
          }
        );

        return apiKey;
      }
    }

    return null;
  }

  /**
   * Get all API keys for a user
   */
  static async getUserApiKeys(userId: string): Promise<IApiKey[]> {
    return ApiKey.find({ userId, isActive: true }).sort({ createdAt: -1 });
  }

  /**
   * Get a single API key by ID
   */
  static async getApiKeyById(userId: string, keyId: string): Promise<IApiKey | null> {
    return ApiKey.findOne({ _id: keyId, userId });
  }

  /**
   * Update an API key
   */
  static async updateApiKey(
    userId: string,
    keyId: string,
    updates: {
      name?: string;
      scopes?: string[];
      rateLimit?: number;
      isActive?: boolean;
      ipWhitelist?: string[];
      metadata?: Record<string, any>;
    }
  ): Promise<IApiKey | null> {
    return ApiKey.findOneAndUpdate(
      { _id: keyId, userId },
      { $set: updates },
      { new: true }
    );
  }

  /**
   * Revoke an API key
   */
  static async revokeApiKey(userId: string, keyId: string): Promise<boolean> {
    const result = await ApiKey.updateOne(
      { _id: keyId, userId },
      { $set: { isActive: false } }
    );
    return result.modifiedCount > 0;
  }

  /**
   * Rotate an API key (create new, revoke old)
   */
  static async rotateApiKey(
    userId: string,
    keyId: string
  ): Promise<{ apiKey: IApiKey; plainKey: string } | null> {
    const oldKey = await ApiKey.findOne({ _id: keyId, userId });
    if (!oldKey) {
      return null;
    }

    // Create new key with same settings
    const newKeyData = await this.createApiKey(userId, {
      name: oldKey.name,
      environment: oldKey.environment,
      scopes: oldKey.scopes,
      rateLimit: oldKey.rateLimit,
      expiresAt: oldKey.expiresAt,
      ipWhitelist: oldKey.ipWhitelist,
      metadata: oldKey.metadata,
    });

    // Revoke old key
    await this.revokeApiKey(userId, keyId);

    return newKeyData;
  }

  /**
   * Get API key usage statistics
   */
  static async getUsageStats(
    userId: string,
    keyId: string
  ): Promise<{
    usageCount: number;
    lastUsedAt?: Date;
    rateLimit: number;
    percentUsed: number;
  } | null> {
    const apiKey = await ApiKey.findOne({ _id: keyId, userId });
    if (!apiKey) {
      return null;
    }

    return {
      usageCount: apiKey.usageCount,
      lastUsedAt: apiKey.lastUsedAt,
      rateLimit: apiKey.rateLimit,
      percentUsed: (apiKey.usageCount / apiKey.rateLimit) * 100,
    };
  }

  /**
   * Check if API key has required scope
   */
  static hasScope(apiKey: IApiKey, requiredScope: string): boolean {
    return apiKey.scopes.includes(requiredScope) || apiKey.scopes.includes('*');
  }

  /**
   * Validate IP address against whitelist
   */
  static validateIpAddress(apiKey: IApiKey, ipAddress: string): boolean {
    if (!apiKey.ipWhitelist || apiKey.ipWhitelist.length === 0) {
      return true; // No IP restrictions
    }
    return apiKey.ipWhitelist.includes(ipAddress);
  }
}
