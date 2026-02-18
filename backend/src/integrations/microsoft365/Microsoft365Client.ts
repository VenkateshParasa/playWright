import { Client } from '@microsoft/microsoft-graph-client';
import { AuthenticationProvider } from '@microsoft/microsoft-graph-client';
import { EventEmitter } from 'events';
import axios from 'axios';

export interface Microsoft365Config {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  redirectUri: string;
  scopes?: string[];
}

export interface AzureADUser {
  id: string;
  userPrincipalName: string;
  displayName: string;
  givenName?: string;
  surname?: string;
  mail?: string;
  mobilePhone?: string;
  jobTitle?: string;
  department?: string;
  officeLocation?: string;
}

export interface TeamsMessage {
  channelId: string;
  teamId: string;
  content: string;
  contentType?: 'text' | 'html';
  mentions?: Array<{ userId: string; displayName: string }>;
}

export interface CalendarEvent {
  subject: string;
  body: {
    contentType: 'HTML' | 'text';
    content: string;
  };
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{
    emailAddress: {
      address: string;
      name?: string;
    };
    type: 'required' | 'optional' | 'resource';
  }>;
  location?: {
    displayName: string;
  };
  isOnlineMeeting?: boolean;
  onlineMeetingProvider?: 'teamsForBusiness';
}

class CustomAuthProvider implements AuthenticationProvider {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async getAccessToken(): Promise<string> {
    return this.accessToken;
  }
}

export class Microsoft365Client extends EventEmitter {
  private config: Microsoft365Config;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private graphClient: Client | null = null;

  constructor(config: Microsoft365Config) {
    super();
    this.config = {
      ...config,
      scopes: config.scopes || [
        'User.Read.All',
        'Group.ReadWrite.All',
        'Mail.Send',
        'Calendars.ReadWrite',
        'Files.ReadWrite.All',
        'Sites.ReadWrite.All',
        'Team.ReadBasic.All',
        'Channel.ReadBasic.All',
        'ChatMessage.Send',
      ],
    };
  }

  /**
   * Get OAuth authorization URL
   */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      response_type: 'code',
      redirect_uri: this.config.redirectUri,
      response_mode: 'query',
      scope: this.config.scopes!.join(' '),
      state: state || '',
    });

    return `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForToken(code: string): Promise<any> {
    try {
      const params = new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code,
        redirect_uri: this.config.redirectUri,
        grant_type: 'authorization_code',
        scope: this.config.scopes!.join(' '),
      });

      const response = await axios.post(
        `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/token`,
        params,
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      );

      this.accessToken = response.data.access_token;
      this.refreshToken = response.data.refresh_token;

      this.initializeGraphClient();
      this.emit('authenticated', response.data);

      return response.data;
    } catch (error) {
      this.emit('error', error);
      throw new Error(`Microsoft 365 authentication failed: ${error.message}`);
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
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: this.refreshToken,
        grant_type: 'refresh_token',
        scope: this.config.scopes!.join(' '),
      });

      const response = await axios.post(
        `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/token`,
        params,
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      );

      this.accessToken = response.data.access_token;
      if (response.data.refresh_token) {
        this.refreshToken = response.data.refresh_token;
      }

      this.initializeGraphClient();
      this.emit('token_refreshed');
    } catch (error) {
      this.emit('error', error);
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }

  /**
   * Initialize Microsoft Graph client
   */
  private initializeGraphClient(): void {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    const authProvider = new CustomAuthProvider(this.accessToken);
    this.graphClient = Client.initWithMiddleware({ authProvider });
  }

  /**
   * Set access token manually
   */
  setAccessToken(accessToken: string, refreshToken?: string): void {
    this.accessToken = accessToken;
    if (refreshToken) {
      this.refreshToken = refreshToken;
    }
    this.initializeGraphClient();
  }

  /**
   * Get Azure AD user
   */
  async getUser(userId: string): Promise<AzureADUser> {
    this.ensureClient();

    try {
      const user = await this.graphClient!.api(`/users/${userId}`).get();
      this.emit('user_fetched', userId);
      return user;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * List Azure AD users
   */
  async listUsers(filter?: string): Promise<AzureADUser[]> {
    this.ensureClient();

    try {
      let request = this.graphClient!.api('/users');

      if (filter) {
        request = request.filter(filter);
      }

      const response = await request.get();
      return response.value || [];
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Create Azure AD user
   */
  async createUser(user: Partial<AzureADUser> & { password: string }): Promise<string> {
    this.ensureClient();

    try {
      const newUser = await this.graphClient!.api('/users').post({
        accountEnabled: true,
        displayName: user.displayName,
        mailNickname: user.userPrincipalName?.split('@')[0],
        userPrincipalName: user.userPrincipalName,
        passwordProfile: {
          forceChangePasswordNextSignIn: true,
          password: user.password,
        },
        givenName: user.givenName,
        surname: user.surname,
        jobTitle: user.jobTitle,
        department: user.department,
      });

      this.emit('user_created', newUser.id);
      return newUser.id;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Sync Azure AD users
   */
  async syncUsers(): Promise<AzureADUser[]> {
    const users = await this.listUsers();
    this.emit('users_synced', users.length);
    return users;
  }

  /**
   * Send Teams message to channel
   */
  async sendTeamsMessage(message: TeamsMessage): Promise<string> {
    this.ensureClient();

    try {
      const chatMessage = await this.graphClient!
        .api(`/teams/${message.teamId}/channels/${message.channelId}/messages`)
        .post({
          body: {
            contentType: message.contentType || 'text',
            content: message.content,
          },
        });

      this.emit('teams_message_sent', chatMessage.id);
      return chatMessage.id;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Create Teams channel
   */
  async createTeamsChannel(
    teamId: string,
    channelName: string,
    description?: string
  ): Promise<string> {
    this.ensureClient();

    try {
      const channel = await this.graphClient!.api(`/teams/${teamId}/channels`).post({
        displayName: channelName,
        description: description || '',
      });

      this.emit('teams_channel_created', channel.id);
      return channel.id;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Create calendar event
   */
  async createCalendarEvent(userId: string, event: CalendarEvent): Promise<string> {
    this.ensureClient();

    try {
      const calendarEvent = await this.graphClient!
        .api(`/users/${userId}/calendar/events`)
        .post(event);

      this.emit('calendar_event_created', calendarEvent.id);
      return calendarEvent.id;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Upload file to OneDrive
   */
  async uploadFile(
    userId: string,
    fileName: string,
    content: Buffer
  ): Promise<string> {
    this.ensureClient();

    try {
      const file = await this.graphClient!
        .api(`/users/${userId}/drive/root:/${fileName}:/content`)
        .put(content);

      this.emit('file_uploaded', file.id);
      return file.id;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Upload file to SharePoint
   */
  async uploadToSharePoint(
    siteId: string,
    folderPath: string,
    fileName: string,
    content: Buffer
  ): Promise<string> {
    this.ensureClient();

    try {
      const file = await this.graphClient!
        .api(`/sites/${siteId}/drive/root:/${folderPath}/${fileName}:/content`)
        .put(content);

      this.emit('sharepoint_file_uploaded', file.id);
      return file.id;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Send email via Outlook
   */
  async sendEmail(
    userId: string,
    to: string[],
    subject: string,
    body: string,
    isHtml: boolean = true
  ): Promise<void> {
    this.ensureClient();

    try {
      await this.graphClient!.api(`/users/${userId}/sendMail`).post({
        message: {
          subject,
          body: {
            contentType: isHtml ? 'HTML' : 'Text',
            content: body,
          },
          toRecipients: to.map(email => ({
            emailAddress: { address: email },
          })),
        },
      });

      this.emit('email_sent', { to, subject });
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Get SharePoint site
   */
  async getSharePointSite(siteName: string): Promise<any> {
    this.ensureClient();

    try {
      const site = await this.graphClient!.api(`/sites/root:/sites/${siteName}`).get();
      return site;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * List SharePoint document libraries
   */
  async listDocumentLibraries(siteId: string): Promise<any[]> {
    this.ensureClient();

    try {
      const response = await this.graphClient!.api(`/sites/${siteId}/drives`).get();
      return response.value || [];
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Create Teams meeting
   */
  async createTeamsMeeting(
    userId: string,
    subject: string,
    startTime: string,
    endTime: string,
    attendees: string[]
  ): Promise<any> {
    const event = await this.createCalendarEvent(userId, {
      subject,
      body: {
        contentType: 'HTML',
        content: 'Join the Teams meeting',
      },
      start: {
        dateTime: startTime,
        timeZone: 'UTC',
      },
      end: {
        dateTime: endTime,
        timeZone: 'UTC',
      },
      attendees: attendees.map(email => ({
        emailAddress: { address: email },
        type: 'required' as const,
      })),
      isOnlineMeeting: true,
      onlineMeetingProvider: 'teamsForBusiness',
    });

    this.emit('teams_meeting_created', event);
    return event;
  }

  /**
   * Ensure Graph client is initialized
   */
  private ensureClient(): void {
    if (!this.graphClient) {
      throw new Error('Microsoft Graph client not initialized. Please authenticate first.');
    }
  }

  /**
   * Check if authenticated
   */
  isAuthenticated(): boolean {
    return this.accessToken !== null && this.graphClient !== null;
  }
}

export default Microsoft365Client;
