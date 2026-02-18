# Multi-Tenancy Architecture Guide

## Overview

This document describes the multi-tenancy architecture of the Playwright & Selenium Learning Platform, including design decisions, data isolation strategies, and implementation details.

## Architecture Approach

### Shared Database with Tenant Isolation

We use a **shared database, shared schema** approach with tenant isolation enforced at the application layer.

#### Why This Approach?

**Advantages**:
- **Cost-effective**: Single database for all tenants
- **Easier maintenance**: Single schema to manage
- **Resource efficiency**: Shared connection pools
- **Simpler backups**: One database to backup
- **Cross-tenant analytics**: Easier for super admins

**Alternatives Considered**:
- **Separate databases per tenant**: More isolation but harder to manage at scale
- **Separate schemas per tenant**: Better isolation but complex schema management

## Data Model

### Core Tenant Model

```typescript
interface ITenant {
  _id: ObjectId;
  name: string;              // Display name
  slug: string;              // Unique identifier (URL-safe)
  domain?: string;           // Custom domain (optional)
  status: 'active' | 'suspended' | 'trial' | 'deleted';
  plan: 'free' | 'starter' | 'professional' | 'enterprise';

  // Branding
  branding: {
    logo?: string;
    primaryColor: string;
    secondaryColor: string;
    customCss?: string;
  };

  // Quotas
  quotas: {
    maxUsers: number;
    maxStorage: number;
    maxApiCallsPerHour: number;
    features: string[];
  };

  // SSO Configuration
  ssoConfig: {
    enabled: boolean;
    provider?: 'saml' | 'oauth2' | 'ldap';
    // Provider-specific configs
  };

  // Admin references
  ownerId: ObjectId;
  admins: ObjectId[];

  // Usage tracking
  usage: {
    users: number;
    storage: number;
    apiCallsThisHour: number;
  };
}
```

### Tenant-Scoped Models

All tenant-scoped data includes a `tenantId` reference:

```typescript
interface IUser {
  _id: ObjectId;
  tenantId?: ObjectId;      // null for super admins
  email: string;
  // ... other fields
}

interface ILesson {
  _id: ObjectId;
  tenantId: ObjectId;       // Always required for content
  title: string;
  // ... other fields
}
```

### Indexes

**Critical indexes for performance**:

```javascript
// Users - compound index for tenant isolation
db.users.createIndex({ email: 1, tenantId: 1 }, { unique: true });
db.users.createIndex({ tenantId: 1, role: 1 });

// Tenants - unique slug and domain
db.tenants.createIndex({ slug: 1 }, { unique: true });
db.tenants.createIndex({ domain: 1 }, { unique: true, sparse: true });

// All tenant-scoped collections
db.lessons.createIndex({ tenantId: 1 });
db.progress.createIndex({ tenantId: 1, userId: 1 });
```

## Tenant Resolution

### Resolution Strategy

Tenants are resolved in this order:

1. **Custom domain**: `acme.learningplatform.com`
2. **Subdomain**: `acme.app.learningplatform.com`
3. **Path-based**: `/t/acme/...`
4. **Header-based**: `X-Tenant-ID` header

### Implementation

```typescript
// Middleware resolves tenant from request
export const resolveTenant = async (req, res, next) => {
  let tenant: ITenant | null = null;

  // 1. Try custom domain
  tenant = await Tenant.findOne({
    domain: req.hostname,
    status: { $ne: 'deleted' }
  });

  // 2. Try subdomain
  if (!tenant) {
    const subdomain = extractSubdomain(req.hostname);
    if (subdomain) {
      tenant = await Tenant.findOne({
        slug: subdomain,
        status: { $ne: 'deleted' }
      });
    }
  }

  // 3. Try path-based
  if (!tenant && req.path.startsWith('/t/')) {
    const slug = req.path.split('/')[2];
    tenant = await Tenant.findOne({
      slug,
      status: { $ne: 'deleted' }
    });
  }

  // 4. Try header
  if (!tenant) {
    const tenantId = req.headers['x-tenant-id'];
    if (tenantId) {
      tenant = await Tenant.findById(tenantId);
    }
  }

  req.tenant = tenant;
  next();
};
```

## Data Isolation

### Automatic Tenant Scoping

All queries are automatically scoped to the current tenant:

```typescript
// Middleware adds tenant filter
export const enforceTenantIsolation = (req, res, next) => {
  if (req.tenant && req.user.role !== 'super_admin') {
    req.tenantFilter = { tenantId: req.tenant._id };
  }
  next();
};

// Usage in controllers
const users = await User.find({
  ...req.tenantFilter,  // Automatically adds tenantId
  status: 'active'
});
```

### Super Admin Override

Super admins can access all tenants:

```typescript
// Super admins don't have tenantId filter
if (user.role === 'super_admin') {
  // Can query across all tenants
  const allUsers = await User.find({});
}
```

## Feature Flags & Quotas

### Feature-Based Access Control

```typescript
// Check if tenant has feature
tenant.hasFeature('advanced-analytics'); // true/false

// Middleware to require feature
export const requireTenantFeature = (feature: string) => {
  return (req, res, next) => {
    if (!req.tenant.hasFeature(feature)) {
      return res.status(403).json({
        error: 'Feature not available',
        upgrade: true
      });
    }
    next();
  };
};

// Usage in routes
router.get('/analytics',
  authenticate,
  requireTenantFeature('advanced-analytics'),
  analyticsController.getReport
);
```

### Quota Enforcement

```typescript
// Check quota before operation
export const checkTenantQuota = (quotaType: 'users' | 'storage') => {
  return async (req, res, next) => {
    if (req.tenant.isQuotaExceeded(quotaType)) {
      return res.status(429).json({
        error: 'Quota exceeded',
        quotaType,
        upgrade: true
      });
    }
    next();
  };
};

// Usage
router.post('/users',
  authenticate,
  checkTenantQuota('users'),
  userController.create
);
```

## Branding & Customization

### CSS Variables

Tenant branding is applied via CSS variables:

```typescript
// Middleware injects branding
export const injectTenantBranding = (req, res, next) => {
  if (req.tenant) {
    res.locals.branding = req.tenant.branding;
    res.locals.cssVariables = {
      '--primary-color': req.tenant.branding.primaryColor,
      '--secondary-color': req.tenant.branding.secondaryColor,
    };
  }
  next();
};
```

### Frontend Application

```html
<!-- Rendered with tenant colors -->
<style>
  :root {
    --primary-color: {{cssVariables['--primary-color']}};
    --secondary-color: {{cssVariables['--secondary-color']}};
  }
</style>
```

## Security Considerations

### Preventing Tenant Leakage

**1. Never trust client-provided tenant ID**:

```typescript
// BAD - Client can manipulate tenantId
const tenantId = req.body.tenantId;
const data = await Data.find({ tenantId });

// GOOD - Use resolved tenant
const data = await Data.find({ tenantId: req.tenant._id });
```

**2. Always validate tenant context**:

```typescript
// Verify user belongs to tenant
if (user.tenantId && user.tenantId.toString() !== req.tenant._id.toString()) {
  throw new Error('User does not belong to this tenant');
}
```

**3. Database-level isolation**:

```typescript
// Use middleware to enforce filters
mongoose.plugin(function tenantPlugin(schema) {
  schema.pre(/^find/, function() {
    if (this.options.skipTenantFilter) return;

    const context = getCurrentContext();
    if (context.tenantId && !context.isSuperAdmin) {
      this.where({ tenantId: context.tenantId });
    }
  });
});
```

### Audit Logging

All tenant operations are logged:

```typescript
await AuditLog.create({
  tenantId: req.tenant._id,
  userId: req.user._id,
  action: 'user.create',
  category: 'admin',
  resource: 'user',
  resourceId: newUser._id,
  ipAddress: req.ip,
  timestamp: new Date()
});
```

## Scaling Strategies

### Caching

**Tenant configuration caching**:

```typescript
const tenantCache = new NodeCache({ stdTTL: 300 }); // 5 min

async function getTenant(slug: string) {
  let tenant = tenantCache.get(slug);

  if (!tenant) {
    tenant = await Tenant.findOne({ slug });
    tenantCache.set(slug, tenant);
  }

  return tenant;
}
```

### Database Sharding

For very large deployments, consider sharding:

```
Shard 1: Tenants A-M
Shard 2: Tenants N-Z
```

**Shard key**: `tenantId` ensures all tenant data is on same shard.

### Read Replicas

Route read operations to replicas:

```typescript
// Write to primary
await User.create({ ... });

// Read from replica
const users = await User.find({ ... }).read('secondary');
```

## Migration Strategies

### Adding New Tenants

```typescript
async function createTenant(data) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Create tenant
    const tenant = await Tenant.create([data], { session });

    // Create owner user
    const owner = await User.create([{
      tenantId: tenant[0]._id,
      ...ownerData
    }], { session });

    // Create security policy
    await SecurityPolicy.create([{
      tenantId: tenant[0]._id
    }], { session });

    await session.commitTransaction();
    return tenant[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
```

### Migrating Existing Data

```typescript
// Add tenantId to existing data
async function migrateToMultiTenant() {
  const defaultTenant = await Tenant.findOne({ slug: 'default' });

  // Update users without tenantId
  await User.updateMany(
    { tenantId: { $exists: false } },
    { $set: { tenantId: defaultTenant._id } }
  );

  // Update lessons
  await Lesson.updateMany(
    { tenantId: { $exists: false } },
    { $set: { tenantId: defaultTenant._id } }
  );
}
```

## Testing Multi-Tenancy

### Unit Tests

```typescript
describe('Tenant Isolation', () => {
  it('should only return users from current tenant', async () => {
    const tenant1 = await createTenant('tenant1');
    const tenant2 = await createTenant('tenant2');

    await User.create({ tenantId: tenant1._id, email: 'user1@t1.com' });
    await User.create({ tenantId: tenant2._id, email: 'user1@t2.com' });

    const req = { tenant: tenant1 };
    const users = await User.find({ tenantId: req.tenant._id });

    expect(users).toHaveLength(1);
    expect(users[0].email).toBe('user1@t1.com');
  });
});
```

### Integration Tests

```typescript
describe('Tenant Resolution', () => {
  it('should resolve tenant from subdomain', async () => {
    const tenant = await Tenant.create({ slug: 'acme' });

    const res = await request(app)
      .get('/api/tenant/details')
      .set('Host', 'acme.app.example.com');

    expect(res.body.slug).toBe('acme');
  });
});
```

## Monitoring

### Key Metrics

- **Tenant count by status**
- **Users per tenant**
- **Storage per tenant**
- **API calls per tenant**
- **Quota violations**
- **Failed tenant resolutions**

### Alerts

```typescript
// Alert on quota exceeded
if (tenant.isQuotaExceeded('users')) {
  sendAlert({
    severity: 'warning',
    message: `Tenant ${tenant.slug} exceeded user quota`,
    tenant: tenant.slug
  });
}
```

## Best Practices

1. **Always use tenant middleware** on protected routes
2. **Never trust client-provided tenant IDs**
3. **Test tenant isolation** thoroughly
4. **Monitor quota usage** proactively
5. **Cache tenant configurations** for performance
6. **Implement comprehensive audit logging**
7. **Plan for multi-region** deployment
8. **Regular backup and restore** testing
9. **Document tenant limits** clearly
10. **Provide self-service** tenant management

## Common Pitfalls

### Data Leakage

```typescript
// BAD - No tenant filter
const allUsers = await User.find({});

// GOOD - Filtered by tenant
const tenantUsers = await User.find({
  tenantId: req.tenant._id
});
```

### Performance Issues

```typescript
// BAD - N+1 queries
for (const lesson of lessons) {
  const tenant = await Tenant.findById(lesson.tenantId);
}

// GOOD - Populate
const lessons = await Lesson.find({})
  .populate('tenantId');
```

### Quota Bypass

```typescript
// BAD - Create user without checking quota
await User.create({ ... });

// GOOD - Check quota first
if (tenant.isQuotaExceeded('users')) {
  throw new Error('User quota exceeded');
}
await User.create({ ... });
```

## Additional Resources

- [Enterprise Setup Guide](./ENTERPRISE_SETUP.md)
- [SSO Configuration](./SSO_CONFIGURATION.md)
- [Security Best Practices](./SECURITY.md)

## Support

For architecture questions: architecture@learningplatform.com
