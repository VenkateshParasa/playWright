import axios, { AxiosInstance, AxiosError } from 'axios';

export interface PlaywrightLearningConfig {
  apiKey?: string;
  accessToken?: string;
  baseURL?: string;
  timeout?: number;
  maxRetries?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  meta?: any;
  links?: any;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export class PlaywrightLearningSDK {
  private client: AxiosInstance;
  private maxRetries: number;

  constructor(config: PlaywrightLearningConfig) {
    const { apiKey, accessToken, baseURL, timeout, maxRetries } = config;

    if (!apiKey && !accessToken) {
      throw new Error('Either apiKey or accessToken is required');
    }

    this.maxRetries = maxRetries || 3;

    this.client = axios.create({
      baseURL: baseURL || 'https://api.playwright-learning.com/v1',
      timeout: timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey || accessToken}`,
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => this.handleError(error)
    );
  }

  private async handleError(error: AxiosError): Promise<never> {
    if (error.response) {
      const data = error.response.data as any;
      throw new Error(data?.error?.message || 'API request failed');
    } else if (error.request) {
      throw new Error('No response received from API');
    } else {
      throw error;
    }
  }

  private async retryRequest<T>(
    fn: () => Promise<T>,
    retries: number = this.maxRetries
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return this.retryRequest(fn, retries - 1);
      }
      throw error;
    }
  }

  // User methods
  async getCurrentUser() {
    const response = await this.client.get<ApiResponse>('/users/me');
    return response.data;
  }

  async updateCurrentUser(data: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    settings?: any;
  }) {
    const response = await this.client.patch<ApiResponse>('/users/me', data);
    return response.data;
  }

  async getUserById(userId: string) {
    const response = await this.client.get<ApiResponse>(`/users/${userId}`);
    return response.data;
  }

  // API Key methods
  async createApiKey(data: {
    name: string;
    environment: 'development' | 'production';
    scopes?: string[];
    rateLimit?: number;
    expiresAt?: string;
    ipWhitelist?: string[];
    metadata?: Record<string, any>;
  }) {
    const response = await this.client.post<ApiResponse>('/api-keys', data);
    return response.data;
  }

  async listApiKeys() {
    const response = await this.client.get<ApiResponse>('/api-keys');
    return response.data;
  }

  async getApiKey(keyId: string) {
    const response = await this.client.get<ApiResponse>(`/api-keys/${keyId}`);
    return response.data;
  }

  async updateApiKey(keyId: string, data: {
    name?: string;
    scopes?: string[];
    rateLimit?: number;
    isActive?: boolean;
    ipWhitelist?: string[];
  }) {
    const response = await this.client.patch<ApiResponse>(`/api-keys/${keyId}`, data);
    return response.data;
  }

  async revokeApiKey(keyId: string) {
    const response = await this.client.delete<ApiResponse>(`/api-keys/${keyId}`);
    return response.data;
  }

  async rotateApiKey(keyId: string) {
    const response = await this.client.post<ApiResponse>(`/api-keys/${keyId}/rotate`);
    return response.data;
  }

  async getApiKeyUsage(keyId: string) {
    const response = await this.client.get<ApiResponse>(`/api-keys/${keyId}/usage`);
    return response.data;
  }

  // Webhook methods
  async createWebhook(data: {
    url: string;
    events: string[];
    description?: string;
    headers?: Record<string, string>;
    retryPolicy?: {
      maxAttempts: number;
      backoffMultiplier: number;
    };
  }) {
    const response = await this.client.post<ApiResponse>('/webhooks', data);
    return response.data;
  }

  async listWebhooks() {
    const response = await this.client.get<ApiResponse>('/webhooks');
    return response.data;
  }

  async getWebhook(webhookId: string) {
    const response = await this.client.get<ApiResponse>(`/webhooks/${webhookId}`);
    return response.data;
  }

  async updateWebhook(webhookId: string, data: {
    url?: string;
    events?: string[];
    description?: string;
    isActive?: boolean;
    headers?: Record<string, string>;
  }) {
    const response = await this.client.patch<ApiResponse>(`/webhooks/${webhookId}`, data);
    return response.data;
  }

  async deleteWebhook(webhookId: string) {
    const response = await this.client.delete<ApiResponse>(`/webhooks/${webhookId}`);
    return response.data;
  }

  async testWebhook(webhookId: string) {
    const response = await this.client.post<ApiResponse>(`/webhooks/${webhookId}/test`);
    return response.data;
  }

  async listWebhookEvents(webhookId: string, options?: PaginationOptions & { status?: string }) {
    const response = await this.client.get<ApiResponse>(`/webhooks/${webhookId}/events`, {
      params: options,
    });
    return response.data;
  }

  async getWebhookStats(webhookId: string) {
    const response = await this.client.get<ApiResponse>(`/webhooks/${webhookId}/stats`);
    return response.data;
  }

  // OAuth methods
  async createOAuthClient(data: {
    name: string;
    description?: string;
    redirectUris: string[];
    allowedScopes?: string[];
    grantTypes?: string[];
    isPublic?: boolean;
  }) {
    const response = await this.client.post<ApiResponse>('/oauth/clients', data);
    return response.data;
  }

  async listOAuthClients() {
    const response = await this.client.get<ApiResponse>('/oauth/clients');
    return response.data;
  }

  async updateOAuthClient(clientId: string, data: any) {
    const response = await this.client.patch<ApiResponse>(`/oauth/clients/${clientId}`, data);
    return response.data;
  }

  async deleteOAuthClient(clientId: string) {
    const response = await this.client.delete<ApiResponse>(`/oauth/clients/${clientId}`);
    return response.data;
  }

  // Webhook signature verification utility
  static verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    try {
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch {
      return false;
    }
  }
}

export default PlaywrightLearningSDK;
