# Enterprise Features - Quick Reference

## Quick Start

### 1. Create Super Admin
```javascript
db.users.insertOne({
  email: "admin@company.com",
  password: "$2b$10$...", // Use bcrypt.hash()
  firstName: "Super",
  lastName: "Admin",
  role: "super_admin",
  isEmailVerified: true,
  status: "active",
  createdAt: new Date(),
  updatedAt: new Date()
});
```

### 2. Create First Tenant
```bash
POST /api/super-admin/tenants
{
  "name": "Acme Corp",
  "slug": "acme",
  "plan": "enterprise",
  "ownerEmail": "admin@acme.com"
}
```

### 3. Configure SSO
```bash
# Login as tenant admin
# Navigate to Settings > SSO Configuration
# Select provider (SAML/OAuth2/LDAP)
# Fill in configuration
# Test connection
```

## Key Concepts

### Tenant Resolution Order
1. Custom domain: `acme.platform.com`
2. Subdomain: `acme.app.platform.com`
3. Path: `/t/acme/...`
4. Header: `X-Tenant-ID: <id>`

### User Roles
- `student`: Regular learner
- `instructor`: Content creator
- `admin`: Tenant admin
- `tenant_admin`: Tenant owner/admin
- `super_admin`: Platform administrator

### Tenant Plans
- `free`: Limited features, trial period
- `starter`: Basic features
- `professional`: Advanced features
- `enterprise`: Full features + SSO

## Common Tasks

### Configure SAML SSO
```javascript
{
  "enabled": true,
  "provider": "saml",
  "saml": {
    "entryPoint": "https://idp.example.com/sso",
    "issuer": "urn:acme:sp",
    "callbackUrl": "https://platform.com/api/sso/acme/saml/callback",
    "cert": "-----BEGIN CERTIFICATE-----..."
  }
}
```

### Configure OAuth2 (Google)
```javascript
{
  "enabled": true,
  "provider": "oauth2",
  "oauth2": {
    "provider": "google",
    "clientId": "123.apps.googleusercontent.com",
    "clientSecret": "secret",
    "callbackUrl": "https://platform.com/api/sso/acme/oauth2/callback"
  }
}
```

### Configure Security Policy
```javascript
{
  "passwordPolicy": {
    "minLength": 12,
    "requireUppercase": true,
    "requireNumbers": true,
    "expirationDays": 90,
    "preventReuse": 10
  },
  "sessionPolicy": {
    "maxConcurrentSessions": 3,
    "sessionTimeoutMinutes": 480
  },
  "ipWhitelist": ["192.168.1.0/24"]
}
```

## API Quick Reference

### Tenant Management
```bash
GET    /api/tenant/details
PUT    /api/tenant/update
GET    /api/tenant/users
GET    /api/tenant/sso/config
PUT    /api/tenant/sso/config
POST   /api/tenant/sso/test
GET    /api/tenant/security/policy
PUT    /api/tenant/security/policy
GET    /api/tenant/usage
```

### Super Admin
```bash
GET    /api/super-admin/tenants
POST   /api/super-admin/tenants
PUT    /api/super-admin/tenants/:id
POST   /api/super-admin/tenants/:id/suspend
POST   /api/super-admin/tenants/:id/activate
DELETE /api/super-admin/tenants/:id
GET    /api/super-admin/users
POST   /api/super-admin/users/:id/impersonate
POST   /api/super-admin/users/bulk
GET    /api/super-admin/users/export
GET    /api/super-admin/health
GET    /api/super-admin/audit-logs
```

### SSO Authentication
```bash
GET    /api/sso/:tenantSlug/login-url
POST   /api/sso/:tenantSlug/saml/callback
GET    /api/sso/:tenantSlug/saml/metadata
GET    /api/sso/:tenantSlug/oauth2/callback
POST   /api/sso/:tenantSlug/ldap/login
```

## Middleware Usage

### Apply Tenant Context
```typescript
import { resolveTenant, requireTenant } from './middleware/tenancy';

router.use(resolveTenant);
router.get('/data', requireTenant, controller.getData);
```

### Enforce Feature Access
```typescript
import { requireTenantFeature } from './middleware/tenancy';

router.get('/analytics',
  authenticate,
  requireTenantFeature('advanced-analytics'),
  controller.getAnalytics
);
```

### Check Quotas
```typescript
import { checkTenantQuota } from './middleware/tenancy';

router.post('/users',
  authenticate,
  checkTenantQuota('users'),
  controller.createUser
);
```

## Database Queries

### Tenant-Scoped Query
```typescript
// Automatically filtered by middleware
const users = await User.find({
  ...req.tenantFilter,  // { tenantId: tenant._id }
  status: 'active'
});
```

### Cross-Tenant Query (Super Admin)
```typescript
// Super admins can query all tenants
if (user.role === 'super_admin') {
  const allUsers = await User.find({ status: 'active' });
}
```

## Security Best Practices

### ✅ DO
- Always use `req.tenant._id` for tenant context
- Validate tenant ownership before operations
- Log all admin actions to audit trail
- Use HTTPS in production
- Implement rate limiting
- Validate SSO certificates
- Use environment variables for secrets

### ❌ DON'T
- Trust client-provided tenant IDs
- Skip tenant filter in queries
- Expose sensitive SSO credentials
- Use weak JWT secrets
- Skip audit logging
- Allow cross-tenant data access
- Hard-code configuration values

## Troubleshooting

### SSO Not Working
1. Check configuration saved correctly
2. Verify callback URLs match
3. Test with "Test Connection" button
4. Review audit logs for errors
5. Verify certificates are valid

### Tenant Isolation Issue
1. Verify middleware applied to route
2. Check tenantId on all documents
3. Review query filters
4. Check user belongs to tenant

### Performance Problems
1. Review database indexes
2. Check for N+1 queries
3. Implement caching
4. Monitor quota usage
5. Consider Redis for sessions

## Monitoring Queries

### System Health
```javascript
// Active tenants
db.tenants.countDocuments({ status: 'active' });

// Total users
db.users.countDocuments({ status: 'active' });

// Active sessions
db.sessions.countDocuments({ status: 'active' });

// Recent errors (24h)
db.auditlogs.countDocuments({
  severity: { $in: ['error', 'critical'] },
  timestamp: { $gte: new Date(Date.now() - 24*60*60*1000) }
});
```

### Tenant Usage
```javascript
// Users per tenant
db.users.aggregate([
  { $match: { status: 'active' } },
  { $group: { _id: '$tenantId', count: { $sum: 1 } } }
]);

// Quota violations
db.tenants.find({
  $expr: { $gte: ['$usage.users', '$quotas.maxUsers'] }
});
```

## Environment Variables

```bash
# Required
MONGODB_URI=mongodb://localhost:27017/playwright-learning
JWT_SECRET=change-this-to-a-strong-secret-minimum-32-characters
NODE_ENV=production

# Optional
PORT=3000
SESSION_TIMEOUT_MINUTES=480
MFA_ENABLED=true
SAML_CALLBACK_BASE_URL=https://your-platform.com
```

## File Locations

### Backend
- Models: `/backend/src/models/`
- Controllers: `/backend/src/controllers/admin/`
- Services: `/backend/src/services/sso/`
- Middleware: `/backend/src/middleware/`
- Routes: `/backend/src/routes/`

### Frontend
- Tenant Settings: `/frontend/src/pages/admin/Tenants/`
- Super Admin: `/frontend/src/pages/admin/SuperAdmin/`

### Documentation
- Setup Guide: `/docs/ENTERPRISE_SETUP.md`
- SSO Guide: `/docs/SSO_CONFIGURATION.md`
- Architecture: `/docs/MULTI_TENANCY_GUIDE.md`

## Support

- **Documentation**: See `/docs` directory
- **Technical Support**: support@learningplatform.com
- **Security Issues**: security@learningplatform.com
- **Enterprise Sales**: enterprise@learningplatform.com

## Quick Links

- [Complete Implementation Summary](./ENTERPRISE_IMPLEMENTATION_SUMMARY.md)
- [Enterprise Setup Guide](./docs/ENTERPRISE_SETUP.md)
- [SSO Configuration](./docs/SSO_CONFIGURATION.md)
- [Multi-Tenancy Guide](./docs/MULTI_TENANCY_GUIDE.md)

---

**Version**: 1.0.0
**Last Updated**: February 17, 2026
**Status**: Production Ready
