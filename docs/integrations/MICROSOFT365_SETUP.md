# Microsoft 365 Integration Setup Guide

Complete guide for integrating Microsoft 365 services with the Playwright & Selenium Learning Platform.

## Prerequisites

- Microsoft 365 tenant (Business or Enterprise)
- Global Administrator access
- Azure AD application registration permissions

## Table of Contents

1. [Azure AD App Registration](#azure-ad-app-registration)
2. [Azure AD Integration](#azure-ad-integration)
3. [Microsoft Teams](#microsoft-teams)
4. [SharePoint](#sharepoint)
5. [OneDrive](#onedrive)
6. [Outlook Calendar](#outlook-calendar)
7. [Platform Configuration](#platform-configuration)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

## Azure AD App Registration

### Step 1: Register Application

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **New registration**

**Fill in details:**
```
Name: Playwright Learning Platform
Supported account types: Accounts in this organizational directory only
Redirect URI: Web - https://your-domain.com/api/integrations/microsoft365/callback
```

4. Click **Register**

### Step 2: Note Application Details

After registration, note:
- **Application (client) ID**
- **Directory (tenant) ID**

### Step 3: Create Client Secret

1. Go to **Certificates & secrets**
2. Click **New client secret**
3. Description: `Learning Platform Integration`
4. Expiration: `24 months` (recommended)
5. Click **Add**
6. **Copy the secret value immediately** (shown only once)

### Step 4: Configure API Permissions

1. Go to **API permissions**
2. Click **Add a permission**
3. Select **Microsoft Graph**
4. Choose **Delegated permissions**

**Required Permissions:**

**User Management:**
- User.Read.All
- User.ReadWrite.All
- Directory.Read.All

**Teams:**
- Team.ReadBasic.All
- Channel.ReadBasic.All
- ChatMessage.Send
- TeamsAppInstallation.ReadWriteForUser

**Calendar:**
- Calendars.ReadWrite
- OnlineMeetings.ReadWrite

**Mail:**
- Mail.Send
- Mail.ReadWrite

**Files:**
- Files.ReadWrite.All
- Sites.ReadWrite.All

5. Click **Add permissions**
6. Click **Grant admin consent** (requires admin)

## Azure AD Integration

### Single Sign-On (SSO)

#### Configure Enterprise Application

1. **Azure AD** → **Enterprise applications**
2. Click **New application**
3. Create custom application
4. Configure SSO settings:

```
Login URL: https://your-domain.com/login
Logout URL: https://your-domain.com/logout
Reply URL: https://your-domain.com/api/auth/microsoft365/callback
```

#### User Provisioning

1. In Enterprise application, go to **Provisioning**
2. Set provisioning mode to **Automatic**
3. Configure:

```
Tenant URL: https://your-domain.com/api/scim
Secret Token: [Your SCIM token]
```

4. Test connection
5. Start provisioning

### User Synchronization

**Automatic sync on:**
- User creation in Azure AD
- User attribute changes
- User deletion/deactivation

**Sync attributes:**
- Email
- First name
- Last name
- Display name
- Job title
- Department
- Manager

## Microsoft Teams

### Create Teams App

1. Go to [Teams Developer Portal](https://dev.teams.microsoft.com)
2. Click **New app**
3. Fill in app details:

```
App name: Playwright Learning
Short description: Access your learning platform
Long description: Complete Playwright and Selenium courses directly in Teams
```

### Configure Bot

1. In app, go to **Configure** → **Bots**
2. Click **Create bot**
3. Bot name: `Playwright Learning Bot`
4. Bot endpoint: `https://your-domain.com/api/teams/bot`
5. Note **Bot ID** and **Password**

### Add Messaging Extension

```json
{
  "messageHandlers": [
    {
      "type": "link",
      "value": {
        "domains": [
          "your-domain.com"
        ]
      }
    }
  ]
}
```

### Create Tab

1. Go to **Configure** → **Tabs**
2. Add personal tab:

```
Name: My Courses
Content URL: https://your-domain.com/teams/courses
Website URL: https://your-domain.com
```

3. Add team tab:

```
Name: Team Learning
Configuration URL: https://your-domain.com/teams/config
Content URL: https://your-domain.com/teams/dashboard
```

### Install App

1. Download app package
2. **Teams** → **Apps** → **Upload a custom app**
3. Select organization scope
4. Install for users/teams

## SharePoint

### Create Site Collection

1. Go to **SharePoint Admin Center**
2. Click **Sites** → **Active sites**
3. Click **Create**
4. Choose **Team site**

```
Site name: Learning Platform Materials
Site address: /sites/learning
Primary administrator: [Admin email]
```

### Configure Document Library

1. Open site
2. Create document library: `Course Materials`
3. Create folders:
   - `/Courses`
   - `/Assignments`
   - `/Resources`
   - `/Certificates`

### Set Permissions

1. **Site settings** → **Site permissions**
2. Break inheritance if needed
3. Grant permissions:
   - Learning Platform App: Full Control
   - Instructors: Edit
   - Learners: Read

### Enable API Access

1. **SharePoint Admin Center** → **API access**
2. Approve pending requests
3. Grant **Sites.ReadWrite.All**

## OneDrive

### Configure App Access

1. OneDrive admin center
2. **Settings** → **App permissions**
3. Add app: **Playwright Learning Platform**
4. Grant permissions: **Files.ReadWrite.All**

### Setup Sync

Configure automatic file sync:
- User uploads → OneDrive personal folder
- Assignments → Shared folder
- Certificates → Secure folder

## Outlook Calendar

### Calendar Integration

**Features:**
- Automatic event creation for classes
- Reminder notifications
- Teams meeting links
- Instructor availability

### Configure Calendar Sync

```javascript
{
  "calendarSync": {
    "enabled": true,
    "autoCreateEvents": true,
    "reminderMinutes": 15,
    "includeTeamsMeeting": true
  }
}
```

### Create Calendar Event

```javascript
POST /api/integrations/microsoft365/calendar/events
{
  "subject": "Playwright Advanced Course",
  "startDateTime": "2024-03-01T10:00:00",
  "endDateTime": "2024-03-01T11:30:00",
  "attendees": [
    "user1@company.com",
    "user2@company.com"
  ],
  "includeTeamsMeeting": true
}
```

## Platform Configuration

### Environment Variables

```bash
# Azure AD
MICROSOFT_CLIENT_ID=your_client_id
MICROSOFT_CLIENT_SECRET=your_client_secret
MICROSOFT_TENANT_ID=your_tenant_id
MICROSOFT_REDIRECT_URI=https://your-domain.com/api/integrations/microsoft365/callback

# Teams Bot
MICROSOFT_TEAMS_BOT_ID=your_bot_id
MICROSOFT_TEAMS_BOT_PASSWORD=your_bot_password

# SharePoint
MICROSOFT_SHAREPOINT_SITE_ID=your_site_id
MICROSOFT_SHAREPOINT_DRIVE_ID=your_drive_id
```

### Admin Panel Configuration

1. Navigate to **Admin** → **Integrations**
2. Find **Microsoft 365** card
3. Click **Configure**
4. Enter credentials:

```json
{
  "clientId": "[Application ID]",
  "clientSecret": "[Client Secret]",
  "tenantId": "[Tenant ID]",
  "redirectUri": "https://your-domain.com/api/integrations/microsoft365/callback",
  "scopes": [
    "User.Read.All",
    "Calendars.ReadWrite",
    "Files.ReadWrite.All",
    "Sites.ReadWrite.All"
  ]
}
```

5. Click **Authorize**
6. Sign in with admin account
7. Grant permissions
8. Save configuration

## Features Implementation

### User Provisioning

Automatic user creation from Azure AD:

```javascript
// When new user is added in Azure AD
{
  "event": "user.created",
  "user": {
    "email": "newuser@company.com",
    "firstName": "John",
    "lastName": "Doe",
    "jobTitle": "Software Engineer",
    "department": "Engineering"
  }
}
// Platform creates account automatically
```

### Teams Notifications

Send course notifications to Teams:

```javascript
POST /api/integrations/microsoft365/teams/notify
{
  "channelId": "channel_id",
  "message": "New course available: Playwright Advanced",
  "type": "MessageCard",
  "actions": [
    {
      "type": "OpenUrl",
      "title": "View Course",
      "url": "https://your-domain.com/courses/123"
    }
  ]
}
```

### File Upload to SharePoint

Upload course materials:

```javascript
POST /api/integrations/microsoft365/sharepoint/upload
{
  "siteId": "site_id",
  "folderPath": "/Courses/Playwright",
  "fileName": "lesson-1.pdf",
  "file": [binary data]
}
```

### Calendar Events

Create class schedule:

```javascript
POST /api/integrations/microsoft365/calendar
{
  "userId": "user@company.com",
  "event": {
    "subject": "Weekly Q&A Session",
    "start": "2024-03-05T14:00:00Z",
    "end": "2024-03-05T15:00:00Z",
    "isOnlineMeeting": true,
    "onlineMeetingProvider": "teamsForBusiness"
  }
}
```

## Testing

### Test Authentication

```bash
curl -X POST https://your-domain.com/api/integrations/microsoft365/test \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "YOUR_CLIENT_ID",
    "clientSecret": "YOUR_CLIENT_SECRET",
    "tenantId": "YOUR_TENANT_ID"
  }'
```

### Test User Sync

1. Create user in Azure AD
2. Check platform for new account
3. Verify user attributes synced

### Test Teams Integration

1. Install Teams app
2. Send test message
3. Verify notification received

### Test SharePoint Upload

1. Upload file via platform
2. Check SharePoint library
3. Verify file appears

## Monitoring

### Microsoft Graph API Logs

View API calls:
1. **Azure AD** → **App registrations** → Your app
2. **Monitoring** → **Sign-in logs**
3. Filter by application

### Common Log Entries

```
[INFO] Azure AD user synced: user@company.com
[INFO] Teams message sent to channel: general
[INFO] File uploaded to SharePoint: document.pdf
[ERROR] Calendar event creation failed: Invalid timezone
```

## Troubleshooting

### Authentication Issues

**Problem**: "Invalid client secret"

**Solution:**
1. Verify client secret hasn't expired
2. Generate new secret if needed
3. Update platform configuration

### Permission Errors

**Problem**: "Insufficient privileges"

**Solution:**
1. Review API permissions
2. Grant admin consent
3. Wait 5-10 minutes for propagation

### Teams Bot Not Responding

**Problem**: Bot messages not received

**Solution:**
1. Verify bot endpoint is accessible
2. Check bot credentials
3. Review bot registration
4. Test with Bot Framework Emulator

### SharePoint Access Denied

**Problem**: Cannot upload files

**Solution:**
1. Check site permissions
2. Verify app has Sites.ReadWrite.All
3. Ensure user has access to site

## Best Practices

1. **Use Application Permissions**: For background services
2. **Implement Token Caching**: Reduce authentication calls
3. **Handle Rate Limits**: Respect throttling limits
4. **Batch Operations**: Use $batch for multiple calls
5. **Delta Queries**: Use for incremental syncs
6. **Webhook Subscriptions**: For real-time updates
7. **Error Handling**: Implement retry logic
8. **Monitor Usage**: Track API consumption

## Security

### Conditional Access Policies

Configure in Azure AD:
1. Require MFA for admin consent
2. Restrict to specific locations
3. Block legacy authentication

### Data Protection

- All data encrypted in transit (TLS 1.2+)
- Tokens stored encrypted
- Regular security audits
- Compliance with Microsoft policies

### Audit Logs

Enable audit logging:
1. **Azure AD** → **Audit logs**
2. Track all API calls
3. Monitor permission changes
4. Review user provisioning events

## Advanced Features

### Batch Requests

```javascript
POST https://graph.microsoft.com/v1.0/$batch
{
  "requests": [
    {
      "id": "1",
      "method": "GET",
      "url": "/me"
    },
    {
      "id": "2",
      "method": "GET",
      "url": "/me/messages"
    }
  ]
}
```

### Delta Queries

```javascript
// Initial query
GET /users/delta

// Subsequent queries
GET /users/delta?$deltatoken={deltatoken}
```

### Change Notifications

Subscribe to webhooks:

```javascript
POST https://graph.microsoft.com/v1.0/subscriptions
{
  "changeType": "created,updated",
  "notificationUrl": "https://your-domain.com/api/webhooks/microsoft365",
  "resource": "/users",
  "expirationDateTime": "2024-03-01T00:00:00Z"
}
```

## Support Resources

- [Microsoft Graph Documentation](https://docs.microsoft.com/graph)
- [Teams Platform Documentation](https://docs.microsoft.com/microsoftteams/platform)
- [Azure AD Documentation](https://docs.microsoft.com/azure/active-directory)
- Platform Support: support@example.com

## Appendix

### API Rate Limits

| Resource | Limit |
|----------|-------|
| User operations | 2000 requests/second/app |
| Mail operations | 1000 requests/minute/mailbox |
| Calendar | 500 requests/minute |
| Files | 10000 requests/10 minutes |

### Error Codes

- `InvalidAuthenticationToken`: Token expired
- `InsufficientPermissions`: Missing API permission
- `TooManyRequests`: Rate limit exceeded
- `ResourceNotFound`: Resource doesn't exist
