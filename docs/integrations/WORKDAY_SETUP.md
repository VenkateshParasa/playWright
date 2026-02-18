# Workday Integration Setup Guide

This guide provides detailed instructions for integrating Workday with the Playwright & Selenium Learning Platform.

## Prerequisites

- Workday tenant access
- Integration System User (ISU) credentials
- Workday API access enabled
- Admin permissions for security configuration

## Table of Contents

1. [Overview](#overview)
2. [Creating Integration System User](#creating-integration-system-user)
3. [Configuring Security](#configuring-security)
4. [API Endpoints](#api-endpoints)
5. [Field Mapping](#field-mapping)
6. [Platform Configuration](#platform-configuration)
7. [Data Synchronization](#data-synchronization)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

## Overview

The Workday integration enables:
- **Employee data synchronization**
- **Learning record management**
- **Compliance training tracking**
- **Automated user provisioning**
- **Learning plan synchronization**
- **Performance data integration**

## Creating Integration System User

### Step 1: Create ISU

1. Log in to Workday as administrator
2. Navigate to **Create Integration System User**
3. Fill in details:

```
Username: PLAYWRIGHT_LEARNING_ISU
Integration System User Name: Playwright Learning Platform
Session Timeout Minutes: 0 (no timeout)
```

4. Click **OK**

### Step 2: Generate Password

1. Search for **Maintain Password Rules**
2. Create or use existing rule
3. Return to ISU task
4. Click **Generate Password**
5. **Save credentials securely**

### Step 3: Assign Security Groups

Required security groups:
- Integration System Security Group
- System Users
- External Integrations

## Configuring Security

### Domain Security Policies

Configure access for the following domains:

#### Human Resources Domain

| Operation | Domain | Required Permissions |
|-----------|--------|---------------------|
| Get | Worker Data | Get Only |
| Get | Person Data | Get Only |
| Get | Employment Data | Get Only |
| Get | Organization Data | Get Only |

#### Learning Domain

| Operation | Domain | Required Permissions |
|-----------|--------|---------------------|
| Get | Learner Enrollments | Get and Put |
| Put | Learner Enrollments | Get and Put |
| Get | Learning Content | Get Only |
| Get | Learning Plans | Get and Put |
| Put | Learning Records | Get and Put |

#### Integration Domain

| Operation | Domain | Required Permissions |
|-----------|--------|---------------------|
| Get | Integration Services | Get Only |
| Get | Web Service Report | Get Only |

### Step-by-Step Security Setup

1. Search **Domain Security Policy**
2. For each required domain:
   - Select the domain
   - Click **Edit**
   - Add **Integration System Security Group**
   - Select appropriate permissions
   - Click **OK**

### Activate Pending Security Policy Changes

1. Search **Activate Pending Security Policy Changes**
2. Review changes
3. Add comment: "Playwright Learning Platform Integration"
4. Click **OK**

## API Endpoints

### Base URL Structure

```
https://wd2-impl-services1.workday.com/ccx/service/[tenant_name]/[service]/[version]
```

**Example:**
```
https://wd2-impl-services1.workday.com/ccx/service/company123/Human_Resources/v38.0
```

### Available Services

#### Human Resources API

```
GET /workers
GET /workers/{worker_id}
GET /organizations
```

#### Learning API

```
GET /learner_enrollments
POST /learner_enrollments
PATCH /learner_enrollments/{enrollment_id}
GET /learning_content
GET /learning_plans
POST /learning_records
```

#### Integration API

```
GET /integration_systems
GET /integration_events
```

## Field Mapping

### Employee/Worker Mapping

| Platform Field | Workday Field | API Path |
|---------------|---------------|----------|
| userId | Worker_ID | worker.id |
| email | Email_Address | worker.email |
| firstName | Legal_First_Name | worker.first_name |
| lastName | Legal_Last_Name | worker.last_name |
| employeeId | Employee_ID | worker.employee_id |
| jobTitle | Job_Title | worker.job_title |
| department | Organization_Name | worker.department |
| hireDate | Hire_Date | worker.hire_date |
| manager | Manager_Reference | worker.manager.id |

### Learning Record Mapping

| Platform Field | Workday Field | API Path |
|---------------|---------------|----------|
| enrollmentId | Enrollment_ID | enrollment.id |
| workerId | Worker_Reference | enrollment.worker.id |
| courseId | Learning_Content_ID | enrollment.learning_content.id |
| courseName | Learning_Content_Name | enrollment.learning_content.descriptor |
| status | Enrollment_Status | enrollment.status |
| enrollmentDate | Enrollment_Date | enrollment.enrollment_date |
| completionDate | Completion_Date | enrollment.completion_date |
| score | Score | enrollment.score |
| credits | Credits | enrollment.credits |

### Compliance Training Mapping

| Platform Field | Workday Field | API Path |
|---------------|---------------|----------|
| trainingId | Training_ID | training.id |
| trainingName | Training_Name | training.descriptor |
| requiredBy | Required_By_Date | training.required_by |
| completionDate | Completion_Date | training.completion_date |
| status | Compliance_Status | training.status |
| expirationDate | Expiration_Date | training.expiration_date |

## Platform Configuration

### Admin Panel Setup

1. Navigate to **Admin** → **Integrations**
2. Find **Workday** card
3. Click **Configure**
4. Enter configuration:

```json
{
  "tenantName": "company123",
  "username": "PLAYWRIGHT_LEARNING_ISU",
  "password": "[ISU_PASSWORD]",
  "apiVersion": "v38.0",
  "baseUrl": "https://wd2-impl-services1.workday.com/ccx/service/company123"
}
```

5. Click **Test Connection**
6. Save configuration
7. Enable integration

### Environment Variables

```bash
WORKDAY_TENANT_NAME=company123
WORKDAY_USERNAME=PLAYWRIGHT_LEARNING_ISU
WORKDAY_PASSWORD=your_isu_password
WORKDAY_API_VERSION=v38.0
WORKDAY_BASE_URL=https://wd2-impl-services1.workday.com/ccx/service/company123
```

## Data Synchronization

### Initial Employee Sync

```javascript
// Sync all employees
POST /api/integrations/workday/sync
{
  "action": "sync_employees",
  "limit": 100,
  "offset": 0
}
```

**Response:**
```json
{
  "success": true,
  "jobId": "workday-sync-123456",
  "recordsQueued": 500
}
```

### Learning Records Sync

```javascript
// Sync learning records for all employees
POST /api/integrations/workday/sync
{
  "action": "sync_learning_records",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

### Compliance Training Sync

```javascript
// Sync compliance training status
POST /api/integrations/workday/sync
{
  "action": "sync_compliance_training",
  "workerId": "21001"
}
```

### Real-time Updates

Enable webhooks for real-time synchronization:

**Supported Events:**
- Employee hired
- Employee terminated
- Learning enrollment created
- Learning completion
- Compliance status change

### Scheduled Sync

Configure automatic synchronization:

```javascript
{
  "syncSchedule": {
    "employees": "0 2 * * *",        // Daily at 2 AM
    "learningRecords": "0 */4 * * *", // Every 4 hours
    "compliance": "0 6 * * 1"         // Weekly on Monday at 6 AM
  }
}
```

## User Provisioning

### Automatic Provisioning

When a new employee is added in Workday:

1. Employee data is synced to platform
2. User account is created automatically
3. Welcome email is sent
4. Default learning plan is assigned

### Configuration

```json
{
  "provisioning": {
    "enabled": true,
    "autoCreateUsers": true,
    "sendWelcomeEmail": true,
    "defaultRole": "learner",
    "assignDefaultLearningPlan": true
  }
}
```

### Deprovisioning

When an employee is terminated:

1. User account is deactivated
2. Active enrollments are paused
3. Access is revoked
4. Data is archived

## Learning Plan Synchronization

### Push Learning Plan to Workday

```javascript
POST /api/integrations/workday/learning-plans
{
  "workerId": "21001",
  "courses": [
    {
      "courseId": "COURSE001",
      "courseName": "Playwright Fundamentals",
      "dueDate": "2024-12-31"
    },
    {
      "courseId": "COURSE002",
      "courseName": "Selenium Advanced",
      "dueDate": "2024-12-31"
    }
  ]
}
```

### Pull Learning Plan from Workday

```javascript
GET /api/integrations/workday/learning-plans/{workerId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "workerId": "21001",
    "learningPlan": [
      {
        "contentId": "LEARNING001",
        "contentName": "Compliance Training",
        "dueDate": "2024-06-30",
        "status": "Not Started"
      }
    ]
  }
}
```

## Compliance Tracking

### Track Completion

When a user completes a compliance course:

```javascript
POST /api/integrations/workday/compliance
{
  "workerId": "21001",
  "trainingId": "COMPLIANCE001",
  "trainingName": "Information Security",
  "completionDate": "2024-02-15",
  "status": "Compliant",
  "expirationDate": "2025-02-15"
}
```

### Get Compliance Status

```javascript
GET /api/integrations/workday/compliance/{workerId}
```

## Testing

### Test Authentication

```bash
curl -X POST https://your-domain.com/api/integrations/workday/test \
  -H "Content-Type: application/json" \
  -d '{
    "tenantName": "company123",
    "username": "PLAYWRIGHT_LEARNING_ISU",
    "password": "your_password"
  }'
```

### Test Employee Sync

1. Navigate to **Integrations** → **Workday**
2. Click **Test Sync**
3. Select **Employees**
4. Set limit: 10
5. Click **Run Test**
6. Verify employees are retrieved

### Test Learning Record Creation

1. Complete a course on the platform
2. Check Workday Learning Record
3. Verify record exists with correct data

### Test Compliance Tracking

1. Complete compliance training
2. Check Workday Compliance Dashboard
3. Verify status is updated to "Compliant"

## Monitoring

### Integration Logs

View at: **Admin** → **Integrations** → **Workday** → **Logs**

**Log Levels:**
- INFO: Successful operations
- WARNING: Retryable errors
- ERROR: Failed operations

### Workday Studio Logs

1. Open Workday Studio
2. Navigate to integration
3. View execution history
4. Check for errors

### Common Log Entries

```
[INFO] Employee sync completed: 500 records
[INFO] Learning record created for worker 21001
[WARNING] Worker not found: 99999
[ERROR] API rate limit exceeded
```

## Troubleshooting

### Authentication Issues

**Problem**: "Invalid credentials"

**Solution:**
1. Verify ISU username and password
2. Check if ISU is active
3. Verify security group assignments
4. Check if password has expired

### Permission Errors

**Problem**: "Insufficient privileges"

**Solution:**
1. Review domain security policies
2. Verify ISU has required permissions
3. Activate pending security changes
4. Wait 5-10 minutes for cache refresh

### API Errors

**Problem**: "Service not found"

**Solution:**
1. Verify tenant name is correct
2. Check API version compatibility
3. Ensure service is enabled in tenant
4. Verify base URL format

### Sync Failures

**Problem**: Employee sync fails

**Solution:**
1. Check API rate limits
2. Verify worker IDs exist
3. Review error logs for specific failures
4. Reduce batch size

### Data Mapping Issues

**Problem**: Fields not populating correctly

**Solution:**
1. Review field mapping configuration
2. Check for custom field names
3. Verify data types match
4. Test with sample data

## Best Practices

1. **Use ISU for Integration**: Never use regular user accounts
2. **Implement Pagination**: For large data sets
3. **Handle Rate Limits**: Respect API limits
4. **Cache Worker Data**: Reduce API calls
5. **Validate Data**: Before sending to Workday
6. **Schedule Off-Peak**: Run syncs during low usage
7. **Monitor Logs**: Regular log review
8. **Test in Preview**: Before production deployment

## Security Checklist

- [ ] ISU credentials stored securely
- [ ] Password rotation policy in place
- [ ] Least privilege access configured
- [ ] API calls logged and monitored
- [ ] SSL/TLS encryption enabled
- [ ] IP whitelisting configured (if applicable)
- [ ] Regular security audits scheduled
- [ ] Incident response plan documented

## Performance Optimization

### Batch Processing

```javascript
// Process in batches of 100
const batchSize = 100;
for (let offset = 0; offset < totalRecords; offset += batchSize) {
  await workdayClient.syncEmployees(batchSize, offset);
  // Add delay to respect rate limits
  await delay(1000);
}
```

### Caching Strategy

- Cache employee data for 24 hours
- Cache learning content for 7 days
- Invalidate on explicit sync

### Rate Limiting

Workday API limits:
- 100 requests per minute
- 10,000 requests per hour

Implementation:
```javascript
const rateLimiter = new RateLimiter(100, 60000); // 100 per minute
await rateLimiter.throttle();
```

## Advanced Features

### Custom Reports

Create custom Workday reports:

1. Navigate to **Create Custom Report**
2. Select data source: **Workers**
3. Add required fields
4. Enable **Web Service**
5. Note report URL
6. Use in API calls

### Event Notifications

Subscribe to Workday events:

```javascript
// Configure webhook endpoint
POST /api/integrations/workday/webhooks
{
  "events": [
    "WORKER_HIRE",
    "WORKER_TERMINATION",
    "LEARNING_COMPLETION"
  ],
  "endpoint": "https://your-domain.com/api/webhooks/workday"
}
```

### Custom Fields

Map custom Workday fields:

```javascript
{
  "customFieldMapping": {
    "platform_field": "workday.custom_field_id",
    "employee_type": "worker.custom_organization_reference"
  }
}
```

## Support Resources

- [Workday Web Services Documentation](https://community.workday.com/sites/default/files/file-hosting/productionapi/index.html)
- [Integration Guide](https://doc.workday.com/admin-guide/en-us/integration-guide/integration-guide.pdf)
- [Community Forum](https://community.workday.com)
- Platform Support: support@example.com

## Appendix

### API Version Compatibility

| API Version | Release Date | Support End |
|-------------|--------------|-------------|
| v38.0 | 2023-09 | 2025-09 |
| v39.0 | 2024-03 | 2026-03 |
| v40.0 | 2024-09 | 2026-09 |

### Common Error Codes

- `WD-0001`: Authentication failed
- `WD-0002`: Invalid request format
- `WD-0003`: Resource not found
- `WD-0004`: Permission denied
- `WD-0005`: Rate limit exceeded

### Sample SOAP Request

```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wd="urn:com.workday/bsvc">
   <soapenv:Header>
      <wd:Workday_Common_Header>
         <wd:Include_Reference_Descriptors_In_Response>true</wd:Include_Reference_Descriptors_In_Response>
      </wd:Workday_Common_Header>
   </soapenv:Header>
   <soapenv:Body>
      <wd:Get_Workers_Request>
         <wd:Request_References>
            <wd:Worker_Reference>
               <wd:ID wd:type="Employee_ID">21001</wd:ID>
            </wd:Worker_Reference>
         </wd:Request_References>
      </wd:Get_Workers_Request>
   </soapenv:Body>
</soapenv:Envelope>
```
