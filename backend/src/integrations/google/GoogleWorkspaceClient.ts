import { google, Auth } from 'googleapis';
import { EventEmitter } from 'events';

export interface GoogleConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes?: string[];
}

export interface GoogleUser {
  id: string;
  email: string;
  name?: string;
  givenName?: string;
  familyName?: string;
  picture?: string;
}

export interface GoogleClassroomCourse {
  id?: string;
  name: string;
  section?: string;
  description?: string;
  room?: string;
  ownerId?: string;
  courseState?: 'ACTIVE' | 'ARCHIVED' | 'PROVISIONED' | 'DECLINED';
}

export interface GoogleCalendarEvent {
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  attendees?: Array<{ email: string }>;
  conferenceData?: {
    createRequest: {
      requestId: string;
      conferenceSolutionKey: { type: 'hangoutsMeet' };
    };
  };
}

export class GoogleWorkspaceClient extends EventEmitter {
  private config: GoogleConfig;
  private oauth2Client: Auth.OAuth2Client;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(config: GoogleConfig) {
    super();
    this.config = {
      ...config,
      scopes: config.scopes || [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/classroom.courses',
        'https://www.googleapis.com/auth/classroom.rosters',
        'https://www.googleapis.com/auth/classroom.coursework.students',
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/gmail.send',
      ],
    };

    this.oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );
  }

  /**
   * Get OAuth authorization URL
   */
  getAuthorizationUrl(state?: string): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: this.config.scopes,
      state,
      prompt: 'consent',
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForToken(code: string): Promise<any> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);

      this.accessToken = tokens.access_token || null;
      this.refreshToken = tokens.refresh_token || null;

      this.emit('authenticated', tokens);
      return tokens;
    } catch (error) {
      this.emit('error', error);
      throw new Error(`Google authentication failed: ${error.message}`);
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(): Promise<void> {
    try {
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      this.oauth2Client.setCredentials(credentials);

      this.accessToken = credentials.access_token || null;
      if (credentials.refresh_token) {
        this.refreshToken = credentials.refresh_token;
      }

      this.emit('token_refreshed');
    } catch (error) {
      this.emit('error', error);
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }

  /**
   * Set credentials manually
   */
  setCredentials(accessToken: string, refreshToken?: string): void {
    this.accessToken = accessToken;
    if (refreshToken) {
      this.refreshToken = refreshToken;
    }

    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }

  /**
   * Get user profile
   */
  async getUserProfile(): Promise<GoogleUser> {
    try {
      const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
      const response = await oauth2.userinfo.get();

      return {
        id: response.data.id!,
        email: response.data.email!,
        name: response.data.name || undefined,
        givenName: response.data.given_name || undefined,
        familyName: response.data.family_name || undefined,
        picture: response.data.picture || undefined,
      };
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Create Google Classroom course
   */
  async createClassroomCourse(course: GoogleClassroomCourse): Promise<string> {
    try {
      const classroom = google.classroom({ version: 'v1', auth: this.oauth2Client });
      const response = await classroom.courses.create({
        requestBody: {
          name: course.name,
          section: course.section,
          description: course.description,
          room: course.room,
          ownerId: course.ownerId,
          courseState: course.courseState || 'ACTIVE',
        },
      });

      const courseId = response.data.id!;
      this.emit('classroom_course_created', courseId);
      return courseId;
    } catch (error) {
      this.emit('error', error);
      throw new Error(`Failed to create classroom course: ${error.message}`);
    }
  }

  /**
   * List Classroom courses
   */
  async listClassroomCourses(): Promise<any[]> {
    try {
      const classroom = google.classroom({ version: 'v1', auth: this.oauth2Client });
      const response = await classroom.courses.list();

      return response.data.courses || [];
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Add student to course
   */
  async addStudentToCourse(courseId: string, studentEmail: string): Promise<void> {
    try {
      const classroom = google.classroom({ version: 'v1', auth: this.oauth2Client });
      await classroom.courses.students.create({
        courseId,
        requestBody: {
          userId: studentEmail,
        },
      });

      this.emit('student_added', { courseId, studentEmail });
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Create coursework assignment
   */
  async createCoursework(
    courseId: string,
    title: string,
    description: string,
    dueDate?: string
  ): Promise<string> {
    try {
      const classroom = google.classroom({ version: 'v1', auth: this.oauth2Client });
      const response = await classroom.courses.courseWork.create({
        courseId,
        requestBody: {
          title,
          description,
          workType: 'ASSIGNMENT',
          state: 'PUBLISHED',
          ...(dueDate && {
            dueDate: {
              year: new Date(dueDate).getFullYear(),
              month: new Date(dueDate).getMonth() + 1,
              day: new Date(dueDate).getDate(),
            },
          }),
        },
      });

      const workId = response.data.id!;
      this.emit('coursework_created', workId);
      return workId;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Upload file to Google Drive
   */
  async uploadFileToDrive(
    fileName: string,
    mimeType: string,
    content: Buffer,
    folderId?: string
  ): Promise<string> {
    try {
      const drive = google.drive({ version: 'v3', auth: this.oauth2Client });

      const response = await drive.files.create({
        requestBody: {
          name: fileName,
          mimeType,
          ...(folderId && { parents: [folderId] }),
        },
        media: {
          mimeType,
          body: content,
        },
      });

      const fileId = response.data.id!;
      this.emit('drive_file_uploaded', fileId);
      return fileId;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Create Google Drive folder
   */
  async createDriveFolder(folderName: string, parentId?: string): Promise<string> {
    try {
      const drive = google.drive({ version: 'v3', auth: this.oauth2Client });

      const response = await drive.files.create({
        requestBody: {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
          ...(parentId && { parents: [parentId] }),
        },
      });

      const folderId = response.data.id!;
      this.emit('drive_folder_created', folderId);
      return folderId;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * List Drive files
   */
  async listDriveFiles(folderId?: string, query?: string): Promise<any[]> {
    try {
      const drive = google.drive({ version: 'v3', auth: this.oauth2Client });

      let q = query || '';
      if (folderId) {
        q = q ? `${q} and '${folderId}' in parents` : `'${folderId}' in parents`;
      }

      const response = await drive.files.list({
        q,
        fields: 'files(id, name, mimeType, createdTime, modifiedTime, size)',
      });

      return response.data.files || [];
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Create Google Calendar event
   */
  async createCalendarEvent(
    calendarId: string,
    event: GoogleCalendarEvent
  ): Promise<string> {
    try {
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      const response = await calendar.events.insert({
        calendarId,
        conferenceDataVersion: event.conferenceData ? 1 : 0,
        requestBody: event,
      });

      const eventId = response.data.id!;
      this.emit('calendar_event_created', eventId);
      return eventId;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Create Google Meet meeting
   */
  async createMeetMeeting(
    summary: string,
    startTime: string,
    endTime: string,
    attendees: string[]
  ): Promise<any> {
    const event = await this.createCalendarEvent('primary', {
      summary,
      start: {
        dateTime: startTime,
        timeZone: 'UTC',
      },
      end: {
        dateTime: endTime,
        timeZone: 'UTC',
      },
      attendees: attendees.map(email => ({ email })),
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    });

    this.emit('meet_meeting_created', event);
    return event;
  }

  /**
   * Send email via Gmail
   */
  async sendEmail(
    to: string,
    subject: string,
    body: string,
    isHtml: boolean = false
  ): Promise<string> {
    try {
      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

      const message = [
        `To: ${to}`,
        `Subject: ${subject}`,
        `Content-Type: ${isHtml ? 'text/html' : 'text/plain'}; charset=utf-8`,
        '',
        body,
      ].join('\n');

      const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const response = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
        },
      });

      const messageId = response.data.id!;
      this.emit('email_sent', messageId);
      return messageId;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Share Drive file
   */
  async shareDriveFile(
    fileId: string,
    email: string,
    role: 'reader' | 'writer' | 'commenter' = 'reader'
  ): Promise<void> {
    try {
      const drive = google.drive({ version: 'v3', auth: this.oauth2Client });

      await drive.permissions.create({
        fileId,
        requestBody: {
          type: 'user',
          role,
          emailAddress: email,
        },
      });

      this.emit('file_shared', { fileId, email, role });
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Get calendar events
   */
  async getCalendarEvents(
    calendarId: string,
    timeMin?: string,
    timeMax?: string
  ): Promise<any[]> {
    try {
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      const response = await calendar.events.list({
        calendarId,
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: 'startTime',
      });

      return response.data.items || [];
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Check if authenticated
   */
  isAuthenticated(): boolean {
    return this.accessToken !== null;
  }
}

export default GoogleWorkspaceClient;
