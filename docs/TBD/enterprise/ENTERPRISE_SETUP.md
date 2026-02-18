# Enterprise Setup Guide

## Overview

This guide covers the setup and configuration of enterprise features for the Playwright & Selenium Learning Platform, including multi-tenancy, Single Sign-On (SSO), and advanced security features.

## Table of Contents

1. [Multi-Tenancy Setup](#multi-tenancy-setup)
2. [SSO Configuration](#sso-configuration)
3. [Security Policies](#security-policies)
4. [Super Admin Setup](#super-admin-setup)
5. [Deployment Considerations](#deployment-considerations)

## Multi-Tenancy Setup

### Overview

The platform supports multiple tenants with complete data isolation, custom branding, and tenant-specific configurations.

### Tenant Isolation Strategy

We use **shared database with tenant_id isolation**:
- Single database for all tenants
- All tenant-scoped data includes a `tenantId` field
- Middleware enforces tenant isolation on all queries
- Super admins have cross-tenant access

### Creating Your First Tenant

#### Via API (Super Admin)

```bash
curl -X POST https://your-domain.com/api/super-admin/tenants \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corporation",
    "slug": "acme",
    "plan": "enterprise",
    "ownerEmail": "admin@acme.com",
    "ownerFirstName": "John",
    "ownerLastName": "Doe"
  }'
```

#### Via Super Admin Dashboard

1. Login as super admin
2. Navigate to **Super Admin** > **Tenants**
3. Click **Create New Tenant**
4. Fill in tenant details
5. Click **Create**

### Tenant Access Methods

Tenants can be accessed via:

1. **Custom Domain**: `acme.learningplatform.com`
2. **Subdomain**: `acme.app.learningplatform.com`
3. **Path-based**: `app.learningplatform.com/t/acme`
4. **Header-based**: `X-Tenant-ID: <tenant-id>`

### Configuring Custom Domains

1. **DNS Configuration**:
   ```
   CNAME: acme.learningplatform.com -> your-platform.com
   ```

2. **Update Tenant**:
   ```javascript
   await Tenant.findByIdAndUpdate(tenantId, {
     domain: 'acme.learningplatform.com'
   });
   ```

3. **SSL Certificate**: Ensure your platform supports wildcard SSL or configure per-tenant certificates.

## SSO Configuration

### Supported SSO Providers

- **SAML 2.0**: For enterprise identity providers
- **OAuth 2.0/OIDC**: Google, Microsoft, Okta, custom
- **LDAP/Active Directory**: For on-premise authentication

### SAML 2.0 Setup

#### 1. Configure in Platform

1. Navigate to **Admin** > **Tenants** > **SSO Configuration**
2. Enable SSO and select **SAML**
3. Enter configuration:

```yaml
Entry Point URL: https://idp.example.com/sso/saml
Issuer: urn:acme:sp
Callback URL: https://acme.learningplatform.com/api/sso/acme/saml/callback
Certificate: [Paste IdP certificate]
```

#### 2. Configure Your IdP

Provide the following to your IdP administrator:

- **ACS URL**: `https://your-platform.com/api/sso/{tenant-slug}/saml/callback`
- **Entity ID**: Your configured issuer
- **Metadata URL**: `https://your-platform.com/api/sso/{tenant-slug}/saml/metadata`

#### 3. Attribute Mapping

Required SAML attributes:
- `email` or `NameID`: User's email address
- `firstName` (optional): User's first name
- `lastName` (optional): User's last name

### OAuth 2.0 Setup

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Configure in platform:

```javascript
{
  "provider": "google",
  "clientId": "your-client-id.apps.googleusercontent.com",
  "clientSecret": "your-client-secret",
  "callbackUrl": "https://your-platform.com/api/sso/acme/oauth2/callback"
}
```

#### Microsoft Azure AD

1. Register app in [Azure Portal](https://portal.azure.com)
2. Configure redirect URI
3. Configure in platform:

```javascript
{
  "provider": "microsoft",
  "clientId": "your-client-id",
  "clientSecret": "your-client-secret",
  "callbackUrl": "https://your-platform.com/api/sso/acme/oauth2/callback"
}
```

#### Okta

1. Create app integration in Okta Admin
2. Select "OIDC - OpenID Connect"
3. Configure in platform:

```javascript
{
  "provider": "okta",
  "clientId": "your-client-id",
  "clientSecret": "your-client-secret",
  "authorizationUrl": "https://your-domain.okta.com/oauth2/v1/authorize",
  "tokenUrl": "https://your-domain.okta.com/oauth2/v1/token",
  "userInfoUrl": "https://your-domain.okta.com/oauth2/v1/userinfo",
  "callbackUrl": "https://your-platform.com/api/sso/acme/oauth2/callback"
}
```

### LDAP/Active Directory Setup

#### Configuration

```javascript
{
  "url": "ldaps://ldap.example.com:636",
  "bindDn": "cn=admin,dc=example,dc=com",
  "bindCredentials": "admin-password",
  "searchBase": "ou=users,dc=example,dc=com",
  "searchFilter": "(uid={{username}})",
  "usernameField": "uid",
  "emailField": "mail"
}
```

#### Active Directory Example

```javascript
{
  "url": "ldaps://ad.example.com:636",
  "bindDn": "admin@example.com",
  "bindCredentials": "admin-password",
  "searchBase": "OU=Users,DC=example,DC=com",
  "searchFilter": "(sAMAccountName={{username}})",
  "usernameField": "sAMAccountName",
  "emailField": "mail"
}
```

#### Testing LDAP Connection

```bash
curl -X POST https://your-platform.com/api/tenant/sso/test \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Security Policies

### Password Policies

Configure password requirements per tenant:

```javascript
{
  "passwordPolicy": {
    "minLength": 12,
    "maxLength": 128,
    "requireUppercase": true,
    "requireLowercase": true,
    "requireNumbers": true,
    "requireSpecialChars": true,
    "expirationDays": 90,
    "preventReuse": 10,
    "lockoutThreshold": 5,
    "lockoutDuration": 30
  }
}
```

### Multi-Factor Authentication (MFA)

Enable MFA for enhanced security:

```javascript
{
  "mfaPolicy": {
    "required": true,
    "allowedMethods": ["totp", "email", "sms"],
    "gracePeriodDays": 7
  }
}
```

### IP Whitelisting

Restrict access by IP address:

```javascript
{
  "ipWhitelist": [
    "192.168.1.0/24",
    "10.0.0.0/8"
  ],
  "ipBlacklist": [
    "203.0.113.0/24"
  ]
}
```

### Session Management

Configure session policies:

```javascript
{
  "sessionPolicy": {
    "maxConcurrentSessions": 3,
    "sessionTimeoutMinutes": 480,
    "absoluteTimeoutMinutes": 1440,
    "requireReauthForSensitive": true,
    "reauthTimeoutMinutes": 15
  }
}
```

## Super Admin Setup

### Creating First Super Admin

```javascript
// Run in MongoDB shell or via script
db.users.insertOne({
  email: "superadmin@company.com",
  password: "$2b$10$...", // bcrypt hash
  firstName: "Super",
  lastName: "Admin",
  role: "super_admin",
  isEmailVerified: true,
  status: "active",
  createdAt: new Date(),
  updatedAt: new Date()
});
```

### Super Admin Capabilities

- Create and manage tenants
- View all users across tenants
- Suspend/activate tenants
- User impersonation for support
- System health monitoring
- Audit log access
- Bulk operations

### User Impersonation

1. Navigate to **Super Admin** > **Users**
2. Find target user
3. Click **Impersonate**
4. Session expires after 1 hour
5. All actions are logged in audit trail

## Deployment Considerations

### Environment Variables

```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/playwright-learning

# JWT Secret
JWT_SECRET=your-super-secret-key-min-32-chars

# Application
NODE_ENV=production
PORT=3000

# SSO (Optional)
SAML_CALLBACK_BASE_URL=https://your-platform.com
OAUTH2_CALLBACK_BASE_URL=https://your-platform.com
```

### Database Indexes

Ensure these indexes exist:

```javascript
// Users
db.users.createIndex({ email: 1, tenantId: 1 }, { unique: true });
db.users.createIndex({ tenantId: 1, role: 1 });
db.users.createIndex({ ssoId: 1, ssoProvider: 1 });

// Tenants
db.tenants.createIndex({ slug: 1 }, { unique: true });
db.tenants.createIndex({ domain: 1 }, { unique: true, sparse: true });

// Audit Logs
db.auditlogs.createIndex({ tenantId: 1, timestamp: -1 });
db.auditlogs.createIndex({ userId: 1, timestamp: -1 });
db.auditlogs.createIndex({ timestamp: -1 });

// Sessions
db.sessions.createIndex({ token: 1 }, { unique: true });
db.sessions.createIndex({ userId: 1, status: 1 });
db.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

### Scaling Considerations

- **Session Storage**: Consider Redis for session management at scale
- **File Storage**: Use S3 or similar for tenant-specific uploads
- **Database**: Consider sharding by tenant for very large deployments
- **Caching**: Implement Redis caching for tenant configurations

### Monitoring

- Monitor tenant quota usage
- Track SSO authentication failures
- Alert on security policy violations
- Monitor session counts
- Track API rate limits

## Security Best Practices

1. **Always use HTTPS** in production
2. **Rotate JWT secrets** periodically
3. **Enable audit logging** for all tenant operations
4. **Implement rate limiting** on SSO endpoints
5. **Validate SSO certificates** properly
6. **Use secure session storage**
7. **Enable MFA** for tenant admins
8. **Regular security audits**

## Troubleshooting

### SSO Not Working

1. Check SSO configuration is saved correctly
2. Verify callback URLs match exactly
3. Check IdP certificate is valid
4. Review audit logs for error messages
5. Test connection using the "Test" button

### Tenant Isolation Issues

1. Verify middleware is applied to all routes
2. Check tenantId is set on all documents
3. Review database queries for tenant filters
4. Check user permissions and roles

### Performance Issues

1. Review database indexes
2. Check for N+1 query problems
3. Implement caching for tenant configs
4. Monitor session cleanup jobs
5. Consider Redis for session storage

## Support

For enterprise support, contact: enterprise-support@learningplatform.com
