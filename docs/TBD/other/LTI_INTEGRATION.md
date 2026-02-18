# LTI 1.3 Integration Guide

## Overview

LTI (Learning Tools Interoperability) 1.3 enables seamless integration with Learning Management Systems (LMS) like Canvas, Moodle, and Blackboard.

## Quick Start

### 1. Register Platform

```typescript
POST /api/lti/platforms/register
{
  "name": "Canvas LMS",
  "url": "https://canvas.instructure.com",
  "clientId": "10000000000001",
  "deploymentIds": ["1:deployment-id"],
  "keysetUrl": "https://canvas.instructure.com/api/lti/security/jwks",
  "tokenUrl": "https://canvas.instructure.com/login/oauth2/token",
  "authUrl": "https://canvas.instructure.com/api/lti/authorize_redirect"
}
```

### 2. OIDC Login Flow

```
LMS → Tool (OIDC Login Initiation)
GET /api/lti/login?iss=...&login_hint=...&target_link_uri=...

Tool → LMS (Authentication Request)
GET {authUrl}?response_type=id_token&scope=openid&...

LMS → Tool (Launch with ID Token)
POST /api/lti/launch
id_token=eyJhbGc...&state=state-token
```

### 3. Handle Launch

```typescript
const launchRequest = await ltiProvider.validateLaunchRequest(idToken, state);

// Access launch data
const userId = launchRequest.lis?.personContactEmailPrimary;
const courseName = launchRequest.context?.title;
const roles = launchRequest.roles; // ['Instructor', 'Learner']
```

## Deep Linking

### Request

```json
{
  "messageType": "LtiDeepLinkingRequest",
  "deepLinkingSettings": {
    "deepLinkReturnUrl": "https://platform.example.com/deep_link/return",
    "acceptTypes": ["ltiResourceLink", "link", "file"],
    "acceptPresentationDocumentTargets": ["iframe", "window"],
    "acceptMultiple": true
  }
}
```

### Response

```typescript
POST /api/lti/deep-link/response
{
  "contentItems": [
    {
      "type": "ltiResourceLink",
      "title": "Playwright Course Module 1",
      "url": "https://tool.example.com/modules/1",
      "custom": {
        "module_id": "1",
        "difficulty": "beginner"
      }
    }
  ]
}
```

## Assignment and Grade Services (AGS)

### Get Line Items

```typescript
GET /api/lti/ags/lineitems

Response:
[
  {
    "id": "https://platform.example.com/lineitems/1",
    "scoreMaximum": 100,
    "label": "Quiz 1",
    "resourceId": "quiz-1"
  }
]
```

### Create Line Item

```typescript
POST /api/lti/ags/lineitems
{
  "scoreMaximum": 100,
  "label": "Final Exam",
  "resourceId": "exam-final",
  "tag": "assessment"
}
```

### Send Score

```typescript
POST /api/lti/ags/scores
{
  "userId": "user-123",
  "scoreGiven": 85,
  "scoreMaximum": 100,
  "comment": "Great work!",
  "timestamp": "2024-01-15T10:30:00Z",
  "activityProgress": "Completed",
  "gradingProgress": "FullyGraded"
}
```

## Names and Role Provisioning Services (NRPS)

```typescript
GET /api/lti/nrps/members

Response:
{
  "members": [
    {
      "status": "Active",
      "name": "John Doe",
      "email": "john@example.com",
      "roles": ["http://purl.imsglobal.org/vocab/lis/v2/membership#Learner"]
    }
  ]
}
```

## Security

### Token Validation

1. Verify signature using platform's public key
2. Check token expiration
3. Validate nonce (prevent replay attacks)
4. Verify audience matches client ID
5. Check issuer matches platform URL

### Access Tokens

```typescript
// Get access token for AGS/NRPS
const token = await ltiProvider.getAccessToken(platform, [
  'https://purl.imsglobal.org/spec/lti-ags/scope/score',
  'https://purl.imsglobal.org/spec/lti-nrps/scope/contextmembership.readonly'
]);

// Use token
axios.post(agsUrl, scoreData, {
  headers: { Authorization: `Bearer ${token}` }
});
```

## Configuration

### Tool Settings (for LMS)

```json
{
  "title": "Playwright Learning Platform",
  "description": "Interactive Playwright & Selenium courses",
  "target_link_uri": "https://tool.example.com/lti/launch",
  "oidc_initiation_url": "https://tool.example.com/lti/login",
  "public_jwk_url": "https://tool.example.com/lti/jwks",
  "scopes": [
    "https://purl.imsglobal.org/spec/lti-ags/scope/lineitem",
    "https://purl.imsglobal.org/spec/lti-ags/scope/score",
    "https://purl.imsglobal.org/spec/lti-nrps/scope/contextmembership.readonly"
  ],
  "extensions": [
    {
      "platform": "canvas.instructure.com",
      "settings": {
        "placements": [
          {
            "placement": "course_navigation",
            "message_type": "LtiResourceLinkRequest",
            "target_link_uri": "https://tool.example.com/lti/launch"
          }
        ]
      }
    }
  ]
}
```

## Testing

### Test in Canvas

1. Navigate to Settings → Apps → View App Configurations
2. Click "+ App"
3. Select "Paste XML" or "By URL"
4. Enter configuration
5. Install app
6. Launch from course navigation

### Test Launch Request

```typescript
describe('LTI Launch', () => {
  it('should validate launch token', async () => {
    const launchRequest = await ltiProvider.validateLaunchRequest(mockToken, state);
    expect(launchRequest.messageType).toBe('LtiResourceLinkRequest');
  });
});
```

## Best Practices

1. **Validate All Tokens**: Never trust unvalidated data
2. **Use HTTPS**: Always use secure connections
3. **Store Secrets Securely**: Use environment variables
4. **Handle Errors Gracefully**: Show user-friendly messages
5. **Log Security Events**: Track all authentication attempts
6. **Test with Multiple LMS**: Canvas, Moodle, Blackboard, etc.

## Resources

- [IMS Global LTI 1.3 Spec](https://www.imsglobal.org/spec/lti/v1p3/)
- [LTI Advantage](https://www.imsglobal.org/spec/lti/v1p3/impl)
- [Canvas LTI Documentation](https://canvas.instructure.com/doc/api/file.lti_dev_key_config.html)
- [Moodle LTI Documentation](https://docs.moodle.org/en/LTI)
