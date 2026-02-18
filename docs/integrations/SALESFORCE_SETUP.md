# Salesforce Integration Setup Guide

This guide walks you through setting up Salesforce integration for the Playwright & Selenium Learning Platform.

## Prerequisites

- Salesforce account (Professional, Enterprise, or Developer edition)
- System Administrator access
- Connected App permissions

## Table of Contents

1. [Creating a Connected App](#creating-a-connected-app)
2. [Configuring OAuth](#configuring-oauth)
3. [Setting up Custom Objects](#setting-up-custom-objects)
4. [Field Mapping](#field-mapping)
5. [Webhook Configuration](#webhook-configuration)
6. [Testing the Integration](#testing-the-integration)
7. [Troubleshooting](#troubleshooting)

## Creating a Connected App

### Step 1: Navigate to App Manager

1. Log in to Salesforce
2. Click **Setup** (gear icon)
3. Navigate to **Apps** → **App Manager**
4. Click **New Connected App**

### Step 2: Basic Information

Fill in the following details:

```
Connected App Name: Playwright Learning Platform
API Name: Playwright_Learning_Platform
Contact Email: your-email@example.com
```

### Step 3: Enable OAuth Settings

1. Check **Enable OAuth Settings**
2. Set **Callback URL**: `https://your-domain.com/api/integrations/salesforce/callback`
3. Select **OAuth Scopes**:
   - Full access (full)
   - Perform requests on your behalf at any time (refresh_token, offline_access)
   - Access and manage your data (api)

4. Click **Save**

### Step 4: Get Credentials

After saving:
1. Click on the app name
2. Click **Manage Consumer Details**
3. Copy **Consumer Key** (Client ID)
4. Copy **Consumer Secret** (Client Secret)

## Configuring OAuth

### Method 1: Web Server OAuth Flow (Recommended)

```javascript
// Backend configuration
const salesforceConfig = {
  loginUrl: 'https://login.salesforce.com',
  clientId: 'YOUR_CONSUMER_KEY',
  clientSecret: 'YOUR_CONSUMER_SECRET',
  redirectUri: 'https://your-domain.com/api/integrations/salesforce/callback'
};
```

### Method 2: Username-Password Flow

For automated scripts:

```javascript
const salesforceConfig = {
  loginUrl: 'https://login.salesforce.com',
  username: 'your-username@example.com',
  password: 'your-password',
  securityToken: 'your-security-token'
};
```

**Security Token**: Settings → Reset Security Token → Check email

## Setting up Custom Objects

### Create Course Object

1. **Setup** → **Object Manager** → **Create** → **Custom Object**

```
Label: Course
Plural Label: Courses
Object Name: Course
Record Name: Course Name
Data Type: Text
```

**Fields:**
- Course_ID__c (External ID, Text)
- Course_Name__c (Text, 255)
- Description__c (Long Text Area)
- Duration_Hours__c (Number, 2 decimal places)
- Price__c (Currency)
- Category__c (Picklist)
- Difficulty_Level__c (Picklist: Beginner, Intermediate, Advanced)

### Create Course Enrollment Object

```
Label: Course Enrollment
Plural Label: Course Enrollments
Object Name: Course_Enrollment
```

**Fields:**
- Contact__c (Lookup Relationship to Contact)
- Course__c (Lookup Relationship to Course__c)
- Enrollment_Date__c (Date)
- Status__c (Picklist: Enrolled, In Progress, Completed, Dropped)
- Progress__c (Percent, 0 decimal places)
- Completion_Date__c (Date)
- Score__c (Number, 2 decimal places)
- Certificate_URL__c (URL)

### Create Relationships

1. Create **Master-Detail** or **Lookup** relationship between:
   - Course_Enrollment__c → Contact
   - Course_Enrollment__c → Course__c

## Field Mapping

### User/Contact Mapping

| Platform Field | Salesforce Field | Type |
|---------------|------------------|------|
| email | Email | Email |
| firstName | FirstName | Text |
| lastName | LastName | Text |
| phone | Phone | Phone |
| company | Company | Text |
| title | Title | Text |

### Lead Mapping

| Platform Field | Salesforce Field | Type |
|---------------|------------------|------|
| email | Email | Email |
| firstName | FirstName | Text |
| lastName | LastName | Text |
| company | Company | Text |
| phone | Phone | Phone |
| status | Status | Picklist |
| source | LeadSource | Picklist |

### Enrollment Mapping

| Platform Field | Salesforce Field | Type |
|---------------|------------------|------|
| userId | Contact__c | Lookup |
| courseId | Course__c | Lookup |
| enrolledAt | Enrollment_Date__c | Date |
| status | Status__c | Picklist |
| progress | Progress__c | Percent |
| completedAt | Completion_Date__c | Date |
| finalScore | Score__c | Number |

## Platform Configuration

### In the Admin Panel

1. Navigate to **Admin** → **Integrations**
2. Find **Salesforce** card
3. Click **Configure**
4. Enter credentials:

```
Login URL: https://login.salesforce.com
Client ID: [Your Consumer Key]
Client Secret: [Your Consumer Secret]
Username: [Your Salesforce Username]
Password: [Your Salesforce Password]
Security Token: [Your Security Token]
```

5. Click **Test Connection**
6. If successful, click **Save**
7. Enable the integration with the toggle switch

### Environment Variables

```bash
SALESFORCE_LOGIN_URL=https://login.salesforce.com
SALESFORCE_CLIENT_ID=your_client_id
SALESFORCE_CLIENT_SECRET=your_client_secret
SALESFORCE_USERNAME=your_username
SALESFORCE_PASSWORD=your_password
SALESFORCE_SECURITY_TOKEN=your_security_token
SALESFORCE_API_VERSION=58.0
```

## Webhook Configuration

### Outbound Messages

1. **Setup** → **Process Automation** → **Workflow Rules**
2. Create rule for **Contact** object
3. Set evaluation criteria
4. Add **Outbound Message** action

**Endpoint URL:**
```
https://your-domain.com/api/integrations/salesforce/webhook
```

**Fields to Include:**
- Id
- FirstName
- LastName
- Email
- Phone
- LastModifiedDate

### Platform Events (Advanced)

For real-time updates:

1. **Setup** → **Platform Events**
2. Create event: `Course_Enrollment_Event__e`
3. Subscribe to events in your application

```javascript
const eventEmitter = salesforceClient.subscribe('/event/Course_Enrollment_Event__e');

eventEmitter.on('event', (data) => {
  console.log('Enrollment event received:', data);
  // Process event
});
```

## Data Synchronization

### Initial Sync

1. Navigate to **Admin** → **Integrations** → **Salesforce**
2. Click **Sync Data**
3. Select sync type:
   - **Contacts**: Sync all contacts
   - **Enrollments**: Sync all enrollments
4. Click **Start Sync**

### Scheduled Sync

Configure automatic synchronization:

```javascript
// In admin panel or via API
{
  "syncSchedule": {
    "contacts": "0 */6 * * *",  // Every 6 hours
    "enrollments": "0 */2 * * *" // Every 2 hours
  }
}
```

### Real-time Sync

Enable webhooks for real-time updates:
- User registration → Lead creation
- Course enrollment → Enrollment record
- Progress update → Enrollment update
- Course completion → Status update

## Testing the Integration

### Test Cases

#### 1. Test Authentication

```bash
curl -X POST https://your-domain.com/api/integrations/salesforce/test \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "YOUR_CLIENT_ID",
    "clientSecret": "YOUR_CLIENT_SECRET",
    "username": "YOUR_USERNAME",
    "password": "YOUR_PASSWORD",
    "securityToken": "YOUR_TOKEN"
  }'
```

#### 2. Test Lead Creation

1. Register a new user on the platform
2. Check Salesforce → Leads
3. Verify lead is created with correct data

#### 3. Test Contact Sync

1. Navigate to **Integrations** → **Salesforce** → **Sync**
2. Click **Sync Contacts**
3. Verify contacts are created/updated

#### 4. Test Enrollment Tracking

1. Enroll a user in a course
2. Check Salesforce → Course Enrollments
3. Verify enrollment record exists

#### 5. Test Progress Update

1. Update course progress on platform
2. Check Salesforce enrollment record
3. Verify progress percentage updated

## Monitoring

### Integration Logs

View logs at: **Admin** → **Integrations** → **Salesforce** → **Logs**

### Salesforce Debug Logs

1. **Setup** → **Debug Logs**
2. Click **New**
3. Select user
4. Set log level: **FINEST**

### Common Log Entries

```
[INFO] Salesforce authentication successful
[INFO] Lead created: 00Q1234567890ABC
[INFO] Contact synced: 0031234567890ABC
[ERROR] Failed to create enrollment: Invalid foreign key
```

## Troubleshooting

### Authentication Issues

**Problem**: "Invalid credentials"

**Solution**:
1. Verify username and password
2. Ensure security token is current
3. Check if IP is whitelisted
4. Verify API access is enabled

### API Limits

**Problem**: "REQUEST_LIMIT_EXCEEDED"

**Solution**:
1. Check API usage: **Setup** → **System Overview**
2. Implement rate limiting
3. Use bulk operations for large datasets
4. Consider increasing API limits

### Field Mapping Errors

**Problem**: "Required field missing"

**Solution**:
1. Review custom object field requirements
2. Update field mapping configuration
3. Ensure all required fields are mapped

### Sync Failures

**Problem**: Sync job fails repeatedly

**Solution**:
1. Check error logs
2. Verify data format matches Salesforce requirements
3. Check for duplicate detection rules
4. Verify object permissions

### Webhook Issues

**Problem**: Webhooks not received

**Solution**:
1. Verify endpoint URL is accessible
2. Check SSL certificate validity
3. Review Salesforce outbound message logs
4. Ensure firewall allows Salesforce IPs

## Best Practices

1. **Use Bulk API**: For large data operations
2. **Implement Retry Logic**: Handle transient failures
3. **Cache Tokens**: Reduce authentication calls
4. **Monitor API Usage**: Stay within limits
5. **Validate Data**: Before sending to Salesforce
6. **Use External IDs**: For efficient upserts
7. **Schedule Off-Peak**: Run large syncs during low usage
8. **Test in Sandbox**: Before production deployment

## Security Checklist

- [ ] Enable IP restrictions on Connected App
- [ ] Use OAuth instead of username-password when possible
- [ ] Rotate security tokens regularly
- [ ] Encrypt stored credentials
- [ ] Implement least privilege access
- [ ] Enable audit trails
- [ ] Monitor login history
- [ ] Use named credentials for server-to-server

## Advanced Features

### Bulk Operations

```javascript
// Bulk create enrollments
const enrollments = [...]; // Array of enrollments
const results = await salesforceClient.bulkCreate(
  'Course_Enrollment__c',
  enrollments
);
```

### SOQL Queries

```javascript
// Custom query
const results = await salesforceClient.query(
  `SELECT Id, Name, Email FROM Contact
   WHERE LastModifiedDate > LAST_N_DAYS:7`
);
```

### Change Data Capture

Subscribe to data changes:

```javascript
const cdc = salesforceClient.subscribe('/data/ContactChangeEvent');
cdc.on('change', (event) => {
  console.log('Contact changed:', event);
});
```

## Support Resources

- [Salesforce Developer Documentation](https://developer.salesforce.com)
- [REST API Guide](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/)
- [Connected Apps](https://help.salesforce.com/s/articleView?id=sf.connected_app_overview.htm)
- Platform Support: support@example.com

## Appendix

### API Endpoints

- Authentication: `/services/oauth2/token`
- Query: `/services/data/v58.0/query`
- Create: `/services/data/v58.0/sobjects/{object}`
- Update: `/services/data/v58.0/sobjects/{object}/{id}`
- Bulk: `/services/data/v58.0/jobs/ingest`

### Common Picklist Values

**Lead Status:**
- Open - Not Contacted
- Working - Contacted
- Closed - Converted
- Closed - Not Converted

**Enrollment Status:**
- Enrolled
- In Progress
- Completed
- Dropped

### Error Codes

- `INVALID_LOGIN`: Check credentials
- `INVALID_SESSION_ID`: Token expired, refresh
- `REQUEST_LIMIT_EXCEEDED`: API limit reached
- `REQUIRED_FIELD_MISSING`: Check field mapping
- `DUPLICATE_VALUE`: Record already exists
