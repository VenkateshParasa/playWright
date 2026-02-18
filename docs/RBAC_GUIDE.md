# RBAC (Role-Based Access Control) Configuration Guide

## Overview

This guide provides technical documentation for the Role-Based Access Control (RBAC) system in the Playwright & Selenium Learning Platform. RBAC is used to manage user permissions and control access to system resources.

## Table of Contents

1. [Architecture](#architecture)
2. [Roles and Permissions](#roles-and-permissions)
3. [Implementation Details](#implementation-details)
4. [Backend Configuration](#backend-configuration)
5. [Frontend Integration](#frontend-integration)
6. [Extending RBAC](#extending-rbac)
7. [Security Considerations](#security-considerations)
8. [Testing](#testing)

---

## Architecture

### Overview

The RBAC system uses a hierarchical role-based model where:
- Users are assigned one role
- Roles have predefined permissions
- Permissions grant access to resources and actions
- Middleware enforces permission checks

### Components

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │ has
       ▼
┌─────────────┐
│    Role     │
└──────┬──────┘
       │ has
       ▼
┌─────────────┐     ┌──────────┐
│ Permissions ├────►│ Resource │
└──────┬──────┘     └──────────┘
       │
       │ allows
       ▼
┌─────────────┐
│   Actions   │
└─────────────┘
```

---

## Roles and Permissions

### Role Hierarchy

```
Admin (highest privilege)
  │
  ├─ Instructor
  │    │
  │    └─ Student (lowest privilege)
```

### Permission Structure

```typescript
interface Permission {
  resource: Resource;
  actions: Action[];
}

type Resource =
  | 'users'
  | 'lessons'
  | 'quizzes'
  | 'exercises'
  | 'flashcards'
  | 'content'
  | 'analytics'
  | 'settings'
  | 'roles';

type Action = 'create' | 'read' | 'update' | 'delete' | 'manage';
```

### Complete Permission Matrix

| Resource    | Student | Instructor | Admin |
|-------------|---------|------------|-------|
| users       | -       | read       | CRUD  |
| lessons     | read    | CRUD       | CRUD  |
| quizzes     | read,update | CRUD  | CRUD  |
| exercises   | read,update | CRUD  | CRUD  |
| flashcards  | read,update | CRUD  | CRUD  |
| content     | -       | CRUD       | CRUD  |
| analytics   | -       | read       | CRUD  |
| settings    | read,update | read,update | CRUD |
| roles       | -       | -          | CRUD  |

**Legend:**
- **-**: No access
- **read**: Read-only access
- **CRUD**: Create, Read, Update, Delete
- **manage**: Full control including special operations

---

## Implementation Details

### Backend Structure

```
backend/src/
├── types/
│   └── permissions.ts          # Permission types and definitions
├── middleware/
│   ├── auth.ts                 # Authentication middleware
│   └── rbac.ts                 # RBAC middleware
├── models/
│   ├── User.ts                 # User model with role field
│   └── AuditLog.ts             # Audit logging for admin actions
├── services/
│   └── auditLog.ts             # Audit logging service
├── controllers/admin/
│   ├── userController.ts       # User management operations
│   └── roleController.ts       # Role management operations
└── routes/admin/
    ├── users.ts                # User management routes
    └── roles.ts                # Role management routes
```

---

## Backend Configuration

### 1. Permission Definitions

**File:** `/backend/src/types/permissions.ts`

```typescript
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  student: [
    { resource: 'lessons', actions: ['read'] },
    { resource: 'quizzes', actions: ['read', 'update'] },
    { resource: 'exercises', actions: ['read', 'update'] },
    { resource: 'flashcards', actions: ['read', 'update'] },
    { resource: 'settings', actions: ['read', 'update'] },
  ],
  instructor: [
    { resource: 'lessons', actions: ['read', 'create', 'update'] },
    { resource: 'quizzes', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'exercises', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'flashcards', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'content', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'users', actions: ['read'] },
    { resource: 'analytics', actions: ['read'] },
    { resource: 'settings', actions: ['read', 'update'] },
  ],
  admin: [
    { resource: 'users', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'lessons', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'quizzes', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'exercises', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'flashcards', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'content', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'analytics', actions: ['read', 'manage'] },
    { resource: 'settings', actions: ['read', 'update', 'manage'] },
    { resource: 'roles', actions: ['create', 'read', 'update', 'delete', 'manage'] },
  ],
};
```

### 2. Permission Checking Function

```typescript
export function hasPermission(
  role: string,
  resource: Resource,
  action: Action
): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;

  const resourcePermission = permissions.find((p) => p.resource === resource);
  if (!resourcePermission) return false;

  return (
    resourcePermission.actions.includes(action) ||
    resourcePermission.actions.includes('manage')
  );
}
```

### 3. RBAC Middleware

**File:** `/backend/src/middleware/rbac.ts`

```typescript
// Check specific permission
export const checkPermission = (resource: Resource, action: Action) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const userRole = req.user.role || 'student';
    const hasAccess = hasPermission(userRole, resource, action);

    if (!hasAccess) {
      res.status(403).json({
        success: false,
        message: `Insufficient permissions. Required: ${action} on ${resource}`,
      });
      return;
    }

    next();
  };
};

// Require admin role
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
    return;
  }
  next();
};

// Require instructor or admin
export const requireInstructorOrAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || (req.user.role !== 'instructor' && req.user.role !== 'admin')) {
    res.status(403).json({
      success: false,
      message: 'Instructor or admin access required',
    });
    return;
  }
  next();
};

// Allow self or admin
export const requireSelfOrAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
    return;
  }

  const targetUserId = req.params.id || req.params.userId;
  const isAdmin = req.user.role === 'admin';
  const isSelf = req.user.userId === targetUserId;

  if (!isAdmin && !isSelf) {
    res.status(403).json({
      success: false,
      message: 'You can only access your own resources',
    });
    return;
  }

  next();
};
```

### 4. Route Protection

```typescript
// Example: User management routes
router.use(authenticate);  // All routes require authentication
router.use(requireAdmin);  // All routes require admin role

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

// Example: Content routes with granular permissions
router.post('/lessons',
  authenticate,
  checkPermission('lessons', 'create'),
  createLesson
);

router.put('/lessons/:id',
  authenticate,
  checkPermission('lessons', 'update'),
  updateLesson
);

router.delete('/lessons/:id',
  authenticate,
  checkPermission('lessons', 'delete'),
  deleteLesson
);
```

---

## Frontend Integration

### 1. Type Definitions

**File:** `/frontend/src/types/admin.ts`

```typescript
export interface Role {
  name: string;
  permissions: Permission[];
}

export interface Permission {
  resource: string;
  actions: string[];
}
```

### 2. Admin User Store

**File:** `/frontend/src/stores/adminUserStore.ts`

```typescript
interface AdminUserState {
  users: User[];
  roles: Role[];
  // ... other state

  setRoles: (roles: Role[]) => void;
  // ... other actions
}
```

### 3. API Functions

**File:** `/frontend/src/lib/api/admin.ts`

```typescript
export async function getRoles(): Promise<Role[]> {
  const response = await apiClient.get('/admin/roles');
  return response.data.data;
}

export async function getRoleByName(name: string): Promise<Role> {
  const response = await apiClient.get(`/admin/roles/${name}`);
  return response.data.data;
}
```

### 4. Route Protection

**File:** `/frontend/src/App.tsx`

```typescript
// Protected admin routes
<Route path="/admin" element={<ProtectedRoute requiredRole="admin" />}>
  <Route path="users" element={<UserManagement />} />
  <Route path="users/:id" element={<UserDetail />} />
  <Route path="users/bulk" element={<BulkActions />} />
  <Route path="roles" element={<RoleManager />} />
</Route>

// Protected instructor routes
<Route path="/content" element={<ProtectedRoute requiredRole="instructor" />}>
  <Route path="lessons/new" element={<LessonEditor />} />
  <Route path="quizzes/new" element={<QuizEditor />} />
</Route>
```

### 5. Conditional Rendering

```typescript
// Show UI elements based on role
const { user } = useAuthStore();

{user?.role === 'admin' && (
  <button onClick={deleteUser}>Delete User</button>
)}

{(user?.role === 'admin' || user?.role === 'instructor') && (
  <Link to="/content/new">Create Content</Link>
)}
```

---

## Extending RBAC

### Adding New Resources

1. **Update Permission Types**

```typescript
// backend/src/types/permissions.ts
type Resource =
  | 'users'
  | 'lessons'
  | 'projects'  // New resource
  | ...;
```

2. **Define Permissions**

```typescript
admin: [
  // ... existing permissions
  { resource: 'projects', actions: ['create', 'read', 'update', 'delete', 'manage'] },
],
instructor: [
  { resource: 'projects', actions: ['read', 'create', 'update'] },
],
student: [
  { resource: 'projects', actions: ['read'] },
],
```

3. **Protect Routes**

```typescript
router.post('/projects',
  authenticate,
  checkPermission('projects', 'create'),
  createProject
);
```

### Adding New Roles

1. **Update User Model**

```typescript
// backend/src/models/User.ts
role: {
  type: String,
  enum: ['student', 'instructor', 'admin', 'moderator'],  // Add new role
  default: 'student',
}
```

2. **Define Role Permissions**

```typescript
// backend/src/types/permissions.ts
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  // ... existing roles
  moderator: [
    { resource: 'users', actions: ['read'] },
    { resource: 'content', actions: ['read', 'update'] },
    { resource: 'analytics', actions: ['read'] },
  ],
};
```

3. **Update Middleware**

```typescript
export const requireModerator = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || (req.user.role !== 'moderator' && req.user.role !== 'admin')) {
    res.status(403).json({
      success: false,
      message: 'Moderator or admin access required',
    });
    return;
  }
  next();
};
```

### Adding New Actions

1. **Update Action Type**

```typescript
type Action =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'manage'
  | 'publish'  // New action
  | 'approve'; // New action
```

2. **Assign to Roles**

```typescript
instructor: [
  { resource: 'content', actions: ['create', 'read', 'update', 'publish'] },
],
admin: [
  { resource: 'content', actions: ['create', 'read', 'update', 'delete', 'publish', 'approve'] },
],
```

---

## Security Considerations

### 1. Principle of Least Privilege

- Grant minimum necessary permissions
- Review role assignments regularly
- Remove permissions when no longer needed

### 2. Defense in Depth

- **Multiple layers of protection:**
  - Frontend route guards (user experience)
  - Backend authentication (verify identity)
  - Backend authorization (check permissions)
  - Database constraints (final safeguard)

### 3. Audit Logging

```typescript
// Log all admin actions
await createAuditLog(req, {
  action: 'user.update',
  resource: 'user',
  resourceId: userId,
  changes: [
    { field: 'role', oldValue: 'student', newValue: 'instructor' }
  ],
});
```

### 4. Token Security

- Store JWT in HTTP-only cookies
- Include role in JWT payload
- Verify role on every request
- Implement token refresh mechanism
- Set appropriate token expiration

### 5. Input Validation

```typescript
// Validate role changes
const VALID_ROLES = ['student', 'instructor', 'admin'];
if (!VALID_ROLES.includes(newRole)) {
  throw new Error('Invalid role');
}
```

### 6. Rate Limiting

```typescript
// Limit sensitive operations
import rateLimit from 'express-rate-limit';

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
});

router.use('/admin/*', adminLimiter);
```

---

## Testing

### Unit Tests

```typescript
// Test permission checking
describe('hasPermission', () => {
  it('should allow admin to manage users', () => {
    expect(hasPermission('admin', 'users', 'manage')).toBe(true);
  });

  it('should deny student from deleting lessons', () => {
    expect(hasPermission('student', 'lessons', 'delete')).toBe(false);
  });

  it('should allow instructor to create content', () => {
    expect(hasPermission('instructor', 'content', 'create')).toBe(true);
  });
});
```

### Integration Tests

```typescript
// Test RBAC middleware
describe('RBAC Middleware', () => {
  it('should allow admin to access user management', async () => {
    const response = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
  });

  it('should deny student from accessing user management', async () => {
    const response = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(response.status).toBe(403);
  });
});
```

### E2E Tests

```typescript
// Test role-based access in UI
test('admin can access user management page', async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto('/admin/users');
  await expect(page.locator('h1')).toContainText('User Management');
});

test('student cannot access user management page', async ({ page }) => {
  await loginAsStudent(page);
  await page.goto('/admin/users');
  await expect(page.locator('text=Access Denied')).toBeVisible();
});
```

---

## Best Practices

### 1. Consistent Permission Checks

- Always check permissions on backend
- Use middleware for route protection
- Don't rely solely on frontend checks
- Validate permissions in controllers as backup

### 2. Clear Permission Names

- Use descriptive resource names
- Use standard CRUD action names
- Document special actions (e.g., 'publish', 'approve')

### 3. Regular Audits

- Review role assignments monthly
- Check for orphaned permissions
- Verify critical operations are protected
- Test permission boundaries

### 4. Documentation

- Document each role's purpose
- List all permissions per role
- Explain special permissions
- Keep docs updated with changes

### 5. Error Messages

- Provide clear permission errors
- Don't expose system details
- Log failed permission checks
- Help users understand requirements

---

## Troubleshooting

### Permission Denied Errors

1. **Check user role:**
   ```typescript
   console.log('User role:', req.user?.role);
   ```

2. **Verify permission definition:**
   ```typescript
   console.log('Permissions:', ROLE_PERMISSIONS[role]);
   ```

3. **Check middleware order:**
   ```typescript
   // Correct order
   router.use(authenticate);  // First
   router.use(checkPermission('resource', 'action'));  // Second
   ```

### Token Issues

1. **Verify token includes role:**
   ```typescript
   const decoded = verifyToken(token);
   console.log('Token payload:', decoded);
   ```

2. **Check token expiration:**
   ```typescript
   if (decoded.exp < Date.now() / 1000) {
     // Token expired
   }
   ```

### Audit Log Issues

1. **Verify audit logs are created:**
   ```typescript
   const logs = await AuditLog.find({ adminId: userId });
   console.log('Recent logs:', logs);
   ```

2. **Check error handling:**
   ```typescript
   try {
     await createAuditLog(req, data);
   } catch (error) {
     console.error('Audit log failed:', error);
   }
   ```

---

## Migration Guide

### From Simple Role Check to RBAC

**Before:**
```typescript
if (user.role !== 'admin') {
  return res.status(403).json({ message: 'Admin only' });
}
```

**After:**
```typescript
router.use(authenticate);
router.use(checkPermission('users', 'manage'));
```

### Benefits

- Centralized permission management
- Easier to extend and modify
- Consistent across application
- Better audit trail
- More maintainable code

---

## API Reference

### Permission Check Function

```typescript
hasPermission(role: string, resource: Resource, action: Action): boolean
```

### Middleware Functions

```typescript
checkPermission(resource: Resource, action: Action): Middleware
requireAdmin: Middleware
requireInstructorOrAdmin: Middleware
requireSelfOrAdmin: Middleware
```

### Audit Functions

```typescript
createAuditLog(req: AuthRequest, data: AuditLogData): Promise<void>
getAuditLogs(params: AuditLogParams): Promise<AuditLogResult>
getUserAuditLogs(userId: string, limit?: number): Promise<AuditLog[]>
```

---

## Resources

- [OWASP Access Control](https://owasp.org/www-community/Access_Control)
- [NIST RBAC Model](https://csrc.nist.gov/projects/role-based-access-control)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

## Version History

- **v1.0** (2024-02): Initial RBAC implementation

---

For user-facing documentation, see: [USER_MANAGEMENT_GUIDE.md](./USER_MANAGEMENT_GUIDE.md)
