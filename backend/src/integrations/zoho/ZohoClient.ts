import axios, { AxiosInstance } from 'axios';
import { EventEmitter } from 'events';

export interface ZohoConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  accountsUrl?: string;
  apiDomain?: string;
}

export interface ZohoContact {
  id?: string;
  First_Name: string;
  Last_Name: string;
  Email: string;
  Phone?: string;
  Company?: string;
  Description?: string;
  Lead_Source?: string;
  [key: string]: any;
}

export interface ZohoLead {
  id?: string;
  First_Name: string;
  Last_Name: string;
  Email: string;
  Company: string;
  Phone?: string;
  Lead_Status: string;
  Lead_Source: string;
  Description?: string;
  [key: string]: any;
}

export interface ZohoDeal {
  id?: string;
  Deal_Name: string;
  Amount: number;
  Stage: string;
  Closing_Date: string;
  Contact_Name?: string;
  Description?: string;
  [key: string]: any;
}

export class ZohoClient extends EventEmitter {
  private config: ZohoConfig;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private apiClient: AxiosInstance;
  private accountsUrl: string;
  private apiDomain: string;

  constructor(config: ZohoConfig) {
    super();
    this.config = config;
    this.accountsUrl = config.accountsUrl || 'https://accounts.zoho.com';
    this.apiDomain = config.apiDomain || 'https://www.zohoapis.com';

    this.apiClient = axios.create({
      baseURL: `${this.apiDomain}/crm/v3`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add interceptor to include access token
    this.apiClient.interceptors.request.use(config => {
      if (this.accessToken) {
        config.headers.Authorization = `Zoho-oauthtoken ${this.accessToken}`;
      }
      return config;
    });

    // Add interceptor to handle token refresh
    this.apiClient.interceptors.response.use(
      response => response,
      async error => {
        if (error.response?.status === 401 && this.refreshToken) {
          try {
            await this.refreshAccessToken();
            error.config.headers.Authorization = `Zoho-oauthtoken ${this.accessToken}`;
            return axios.request(error.config);
          } catch (refreshError) {
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get OAuth authorization URL
   */
  getAuthorizationUrl(scopes: string[], state?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: scopes.join(','),
      access_type: 'offline',
    });

    if (state) {
      params.append('state', state);
    }

    return `${this.accountsUrl}/oauth/v2/auth?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<any> {
    try {
      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: this.config.redirectUri,
        code,
      });

      const response = await axios.post(
        `${this.accountsUrl}/oauth/v2/token`,
        params,
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      );

      this.accessToken = response.data.access_token;
      this.refreshToken = response.data.refresh_token;

      this.emit('authenticated', response.data);
      return response.data;
    } catch (error) {
      this.emit('error', error);
      throw new Error(`Zoho authentication failed: ${error.message}`);
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const params = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: this.refreshToken,
      });

      const response = await axios.post(
        `${this.accountsUrl}/oauth/v2/token`,
        params,
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      );

      this.accessToken = response.data.access_token;
      this.emit('token_refreshed');
    } catch (error) {
      this.emit('error', error);
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }

  /**
   * Create a lead
   */
  async createLead(lead: ZohoLead): Promise<string> {
    try {
      const response = await this.apiClient.post('/Leads', {
        data: [lead],
      });

      const result = response.data.data[0];
      if (result.code === 'SUCCESS') {
        this.emit('lead_created', result.details.id);
        return result.details.id;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      this.emit('error', error);
      throw new Error(`Failed to create Zoho lead: ${error.message}`);
    }
  }

  /**
   * Create or update a contact
   */
  async upsertContact(contact: ZohoContact): Promise<string> {
    try {
      const response = await this.apiClient.post('/Contacts/upsert', {
        data: [contact],
        duplicate_check_fields: ['Email'],
      });

      const result = response.data.data[0];
      if (result.code === 'SUCCESS') {
        this.emit('contact_synced', result.details.id);
        return result.details.id;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      this.emit('error', error);
      throw new Error(`Failed to upsert Zoho contact: ${error.message}`);
    }
  }

  /**
   * Create a deal
   */
  async createDeal(deal: ZohoDeal): Promise<string> {
    try {
      const response = await this.apiClient.post('/Deals', {
        data: [deal],
      });

      const result = response.data.data[0];
      if (result.code === 'SUCCESS') {
        this.emit('deal_created', result.details.id);
        return result.details.id;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      this.emit('error', error);
      throw new Error(`Failed to create Zoho deal: ${error.message}`);
    }
  }

  /**
   * Search records
   */
  async searchRecords(
    module: string,
    criteria: string
  ): Promise<any[]> {
    try {
      const response = await this.apiClient.get(`/${module}/search`, {
        params: { criteria },
      });

      return response.data.data || [];
    } catch (error) {
      if (error.response?.status === 204) {
        return []; // No records found
      }
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Get contact by email
   */
  async getContactByEmail(email: string): Promise<ZohoContact | null> {
    const contacts = await this.searchRecords(
      'Contacts',
      `(Email:equals:${email})`
    );

    return contacts.length > 0 ? contacts[0] : null;
  }

  /**
   * Update record
   */
  async updateRecord(
    module: string,
    recordId: string,
    data: Record<string, any>
  ): Promise<void> {
    try {
      const response = await this.apiClient.put(`/${module}/${recordId}`, {
        data: [{ id: recordId, ...data }],
      });

      const result = response.data.data[0];
      if (result.code !== 'SUCCESS') {
        throw new Error(result.message);
      }

      this.emit('record_updated', { module, recordId });
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Delete record
   */
  async deleteRecord(module: string, recordId: string): Promise<void> {
    try {
      const response = await this.apiClient.delete(`/${module}/${recordId}`);

      const result = response.data.data[0];
      if (result.code !== 'SUCCESS') {
        throw new Error(result.message);
      }

      this.emit('record_deleted', { module, recordId });
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Get records
   */
  async getRecords(
    module: string,
    page: number = 1,
    perPage: number = 200
  ): Promise<any[]> {
    try {
      const response = await this.apiClient.get(`/${module}`, {
        params: { page, per_page: perPage },
      });

      return response.data.data || [];
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Bulk create records
   */
  async bulkCreate(module: string, records: any[]): Promise<any[]> {
    try {
      // Zoho allows max 100 records per request
      const chunks = this.chunkArray(records, 100);
      const results = [];

      for (const chunk of chunks) {
        const response = await this.apiClient.post(`/${module}`, {
          data: chunk,
        });

        results.push(...response.data.data);
      }

      this.emit('bulk_created', { module, count: records.length });
      return results;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Get related records
   */
  async getRelatedRecords(
    module: string,
    recordId: string,
    relatedModule: string
  ): Promise<any[]> {
    try {
      const response = await this.apiClient.get(
        `/${module}/${recordId}/${relatedModule}`
      );

      return response.data.data || [];
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Helper method to chunk array
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Set access token manually
   */
  setAccessToken(accessToken: string, refreshToken?: string): void {
    this.accessToken = accessToken;
    if (refreshToken) {
      this.refreshToken = refreshToken;
    }
  }

  /**
   * Check if client is authenticated
   */
  isAuthenticated(): boolean {
    return this.accessToken !== null;
  }
}

export default ZohoClient;
