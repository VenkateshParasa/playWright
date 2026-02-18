import jsforce, { Connection } from 'jsforce';
import { EventEmitter } from 'events';

export interface SalesforceConfig {
  loginUrl: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  apiVersion?: string;
}

export interface SalesforceContact {
  Id?: string;
  FirstName: string;
  LastName: string;
  Email: string;
  Phone?: string;
  Company?: string;
  Title?: string;
  LeadSource?: string;
}

export interface SalesforceLead {
  Id?: string;
  FirstName: string;
  LastName: string;
  Email: string;
  Company: string;
  Phone?: string;
  Status: string;
  LeadSource: string;
  Description?: string;
}

export interface SalesforceOpportunity {
  Id?: string;
  Name: string;
  AccountId?: string;
  StageName: string;
  CloseDate: string;
  Amount?: number;
  Probability?: number;
  Type?: string;
  LeadSource?: string;
  Description?: string;
}

export interface CourseEnrollment {
  Id?: string;
  Name: string;
  Contact__c: string;
  Course__c: string;
  Enrollment_Date__c: string;
  Status__c: string;
  Progress__c: number;
  Completion_Date__c?: string;
}

export class SalesforceClient extends EventEmitter {
  private connection: Connection | null = null;
  private config: SalesforceConfig;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(config: SalesforceConfig) {
    super();
    this.config = {
      ...config,
      apiVersion: config.apiVersion || '58.0',
    };
  }

  /**
   * Authenticate using OAuth2
   */
  async authenticate(username: string, password: string, securityToken: string): Promise<void> {
    try {
      this.connection = new jsforce.Connection({
        loginUrl: this.config.loginUrl,
        version: this.config.apiVersion,
      });

      const userInfo = await this.connection.login(username, password + securityToken);
      this.accessToken = this.connection.accessToken || null;
      this.emit('authenticated', userInfo);
    } catch (error) {
      this.emit('error', error);
      throw new Error(`Salesforce authentication failed: ${error.message}`);
    }
  }

  /**
   * Authenticate using OAuth2 web flow
   */
  async authenticateWithOAuth(code: string): Promise<void> {
    try {
      const oauth2 = new jsforce.OAuth2({
        loginUrl: this.config.loginUrl,
        clientId: this.config.clientId,
        clientSecret: this.config.clientSecret,
        redirectUri: this.config.redirectUri,
      });

      this.connection = new jsforce.Connection({ oauth2 });
      const userInfo = await this.connection.authorize(code);

      this.accessToken = this.connection.accessToken || null;
      this.refreshToken = this.connection.refreshToken || null;

      this.emit('authenticated', userInfo);
    } catch (error) {
      this.emit('error', error);
      throw new Error(`Salesforce OAuth authentication failed: ${error.message}`);
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
      const oauth2 = new jsforce.OAuth2({
        loginUrl: this.config.loginUrl,
        clientId: this.config.clientId,
        clientSecret: this.config.clientSecret,
      });

      this.connection = new jsforce.Connection({
        oauth2,
        refreshToken: this.refreshToken,
      });

      await this.connection.refresh(this.refreshToken);
      this.accessToken = this.connection.accessToken || null;
      this.emit('token_refreshed');
    } catch (error) {
      this.emit('error', error);
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }

  /**
   * Create a lead from user registration
   */
  async createLead(lead: SalesforceLead): Promise<string> {
    this.ensureConnected();

    try {
      const result = await this.connection!.sobject('Lead').create(lead);

      if (!result.success) {
        throw new Error(`Failed to create lead: ${result.errors?.join(', ')}`);
      }

      this.emit('lead_created', result.id);
      return result.id as string;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Create or update a contact
   */
  async upsertContact(contact: SalesforceContact): Promise<string> {
    this.ensureConnected();

    try {
      const result = await this.connection!
        .sobject('Contact')
        .upsert(contact, 'Email');

      if (!result.success) {
        throw new Error(`Failed to upsert contact: ${result.errors?.join(', ')}`);
      }

      this.emit('contact_synced', result.id);
      return result.id as string;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Create an opportunity
   */
  async createOpportunity(opportunity: SalesforceOpportunity): Promise<string> {
    this.ensureConnected();

    try {
      const result = await this.connection!
        .sobject('Opportunity')
        .create(opportunity);

      if (!result.success) {
        throw new Error(`Failed to create opportunity: ${result.errors?.join(', ')}`);
      }

      this.emit('opportunity_created', result.id);
      return result.id as string;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Create custom course enrollment object
   */
  async createCourseEnrollment(enrollment: CourseEnrollment): Promise<string> {
    this.ensureConnected();

    try {
      const result = await this.connection!
        .sobject('Course_Enrollment__c')
        .create(enrollment);

      if (!result.success) {
        throw new Error(`Failed to create enrollment: ${result.errors?.join(', ')}`);
      }

      this.emit('enrollment_created', result.id);
      return result.id as string;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Update course enrollment progress
   */
  async updateEnrollmentProgress(
    enrollmentId: string,
    progress: number,
    status: string
  ): Promise<void> {
    this.ensureConnected();

    try {
      const result = await this.connection!
        .sobject('Course_Enrollment__c')
        .update({
          Id: enrollmentId,
          Progress__c: progress,
          Status__c: status,
          ...(status === 'Completed' && {
            Completion_Date__c: new Date().toISOString().split('T')[0],
          }),
        });

      if (!result.success) {
        throw new Error(`Failed to update enrollment: ${result.errors?.join(', ')}`);
      }

      this.emit('enrollment_updated', enrollmentId);
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Query Salesforce using SOQL
   */
  async query<T = any>(soql: string): Promise<T[]> {
    this.ensureConnected();

    try {
      const result = await this.connection!.query<T>(soql);
      return result.records;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Bulk create records
   */
  async bulkCreate(objectType: string, records: any[]): Promise<any[]> {
    this.ensureConnected();

    try {
      const results = await this.connection!
        .sobject(objectType)
        .create(records);

      this.emit('bulk_created', { objectType, count: records.length });
      return Array.isArray(results) ? results : [results];
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Get contact by email
   */
  async getContactByEmail(email: string): Promise<SalesforceContact | null> {
    const contacts = await this.query<SalesforceContact>(
      `SELECT Id, FirstName, LastName, Email, Phone, Company, Title
       FROM Contact
       WHERE Email = '${email}'
       LIMIT 1`
    );

    return contacts.length > 0 ? contacts[0] : null;
  }

  /**
   * Get enrollment statistics
   */
  async getEnrollmentStats(contactId: string): Promise<any> {
    const enrollments = await this.query(
      `SELECT Status__c, COUNT(Id) total
       FROM Course_Enrollment__c
       WHERE Contact__c = '${contactId}'
       GROUP BY Status__c`
    );

    return enrollments;
  }

  /**
   * Ensure connection is established
   */
  private ensureConnected(): void {
    if (!this.connection || !this.accessToken) {
      throw new Error('Not connected to Salesforce. Please authenticate first.');
    }
  }

  /**
   * Disconnect from Salesforce
   */
  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.logout();
      this.connection = null;
      this.accessToken = null;
      this.refreshToken = null;
      this.emit('disconnected');
    }
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.connection !== null && this.accessToken !== null;
  }

  /**
   * Get OAuth authorization URL
   */
  getAuthorizationUrl(state?: string): string {
    const oauth2 = new jsforce.OAuth2({
      loginUrl: this.config.loginUrl,
      clientId: this.config.clientId,
      clientSecret: this.config.clientSecret,
      redirectUri: this.config.redirectUri,
    });

    return oauth2.getAuthorizationUrl({
      scope: 'api refresh_token',
      state,
    });
  }
}

export default SalesforceClient;
