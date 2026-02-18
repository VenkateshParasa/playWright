# User Management - Quick Reference

## Quick Start

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## Common Operations

### Create Admin User (MongoDB Shell)
```javascript
db.users.insertOne({
  email: "admin@example.com",
  password: "$2b$10$hashedpassword", // Use bcrypt to hash
  firstName: "Admin",
  lastName: "User",
  role: "admin",
  status: "active",
  isEmailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
});
```

### Check User Permissions
```typescript
import { hasPermission } from './types/permissions';

const canManageUsers = hasPermission('admin', 'users', 'manage');
```

### Protect Backend Route
```typescript
import { authenticate } from './middleware/auth';
import { checkPermission } from './middleware/rbac';

router.post('/endpoint',
  authenticate,
  checkPermission('resource', 'action'),
  handler
);
```

### Frontend - Fetch Users
```typescript
const response = await getUsers({
  page: 1,
  limit: 20,
  search: 'john',
  role: 'student',
  status: 'active'
});
```

### Create Audit Log
```typescript
await createAuditLog(req, {
  action: 'user.update',
  resource: 'user',
  resourceId: userId,
  changes: [{ field: 'role', oldValue: 'student', newValue: 'admin' }]
});
```

---

## API Endpoints Quick Reference

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/admin/users | List users | Admin |
| GET | /api/admin/users/stats | User statistics | Admin |
| GET | /api/admin/users/:id | User details | Admin |
| PUT | /api/admin/users/:id | Update user | Admin |
| DELETE | /api/admin/users/:id | Delete user | Admin |
| POST | /api/admin/users/:id/suspend | Suspend user | Admin |
| POST | /api/admin/users/:id/activate | Activate user | Admin |
| POST | /api/admin/users/:id/reset-password | Reset password | Admin |
| GET | /api/admin/users/:id/activity | Activity timeline | Admin |
| POST | /api/admin/users/bulk | Bulk operations | Admin |
| GET | /api/admin/roles | List roles | Admin |
| GET | /api/admin/roles/:name | Role details | Admin |

---

## Permission Matrix

| Resource | Student | Instructor | Admin |
|----------|---------|------------|-------|
| users | - | read | CRUD + manage |
| lessons | read | CRUD | CRUD + manage |
| quizzes | read, update | CRUD | CRUD + manage |
| exercises | read, update | CRUD | CRUD + manage |
| flashcards | read, update | CRUD | CRUD + manage |
| content | - | CRUD | CRUD + manage |
| analytics | - | read | read + manage |
| settings | read, update | read, update | CRUD + manage |
| roles | - | - | CRUD + manage |

---

## Frontend Routes

```
/admin/users              # User management page
/admin/users/:id          # User detail page
/admin/users/bulk         # Bulk actions page
```

---

## Environment Variables

### Backend (.env)
```bash
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/playwright-learning
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:5000/api
```

---

## Database Collections

### users
```javascript
{
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  avatar?: string,
  role: 'student' | 'instructor' | 'admin',
  status: 'active' | 'suspended' | 'deleted',
  suspendedAt?: Date,
  suspendedBy?: ObjectId,
  suspendedReason?: string,
  isEmailVerified: boolean,
  lastLogin?: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### auditlogs
```javascript
{
  adminId: ObjectId,
  adminEmail: string,
  action: string,
  resource: string,
  resourceId?: string,
  changes?: [{ field, oldValue, newValue }],
  metadata?: object,
  ipAddress?: string,
  userAgent?: string,
  timestamp: Date
}
```

---

## Bulk Operations

```typescript
// Suspend multiple users
await bulkUserOperations({
  operation: 'suspend',
  userIds: ['id1', 'id2'],
  data: { reason: 'Policy violation' }
});

// Activate multiple users
await bulkUserOperations({
  operation: 'activate',
  userIds: ['id1', 'id2']
});

// Delete multiple users (soft)
await bulkUserOperations({
  operation: 'delete',
  userIds: ['id1', 'id2']
});

// Export users
await bulkUserOperations({
  operation: 'export',
  userIds: ['id1', 'id2']
});
```

---

## Common Queries

### Find Active Admins
```javascript
db.users.find({ role: 'admin', status: 'active' });
```

### Find Suspended Users
```javascript
db.users.find({ status: 'suspended' });
```

### Find Recent Registrations
```javascript
db.users.find({
  createdAt: { $gte: new Date(Date.now() - 7*24*60*60*1000) }
});
```

### Find Admin Actions in Last 24h
```javascript
db.auditlogs.find({
  timestamp: { $gte: new Date(Date.now() - 24*60*60*1000) }
}).sort({ timestamp: -1 });
```

---

## Troubleshooting

### Permission Denied
```bash
# Check user role
console.log(req.user?.role);

# Verify token includes role
const decoded = verifyToken(token);
console.log(decoded);
```

### Audit Log Not Created
```bash
# Check error logs
console.error('Audit log failed:', error);

# Verify MongoDB connection
mongoose.connection.readyState === 1
```

### Users Not Loading
```bash
# Check API response
curl http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer <token>"

# Check backend logs
npm run dev

# Check frontend console
F12 -> Console
```

---

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### E2E Tests
```bash
cd frontend
npm run test:e2e
```

---

## Security Checklist

- [ ] All admin routes require authentication
- [ ] RBAC middleware enforces permissions
- [ ] Audit logs enabled for all operations
- [ ] Passwords hashed with bcrypt
- [ ] JWT tokens include user role
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Input validation on all endpoints
- [ ] Sensitive data excluded from responses

---

## Production Deployment

1. Set NODE_ENV=production
2. Use strong JWT_SECRET
3. Enable HTTPS
4. Configure rate limiting
5. Set up monitoring
6. Configure backups
7. Test all operations
8. Review security checklist

---

## Support Resources

- [USER_MANAGEMENT_GUIDE.md](./USER_MANAGEMENT_GUIDE.md) - Admin guide
- [RBAC_GUIDE.md](./RBAC_GUIDE.md) - Technical RBAC guide
- [USER_MANAGEMENT_IMPLEMENTATION.md](./USER_MANAGEMENT_IMPLEMENTATION.md) - Implementation details

---

## Contact

For issues:
1. Check documentation
2. Review audit logs
3. Check browser/server logs
4. Contact development team
