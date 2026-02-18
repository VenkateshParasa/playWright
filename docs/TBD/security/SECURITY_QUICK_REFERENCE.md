# Security Quick Reference Guide

**Quick access to security implementations and common tasks**

---

## 🚀 Quick Start

### Check Security Status
```bash
# Run security audit
./scripts/security-audit.sh

# Check for vulnerabilities
cd backend && npm audit
cd frontend && npm audit
```

### Environment Setup
```bash
# Required environment variables
JWT_SECRET=<32-char-random-string>
ENCRYPTION_KEY=<32-char-random-string>
DATABASE_URL=<mongodb-connection>
NODE_ENV=production
```

---

## 🔐 Authentication

### Password Requirements
- ✅ Minimum 12 characters
- ✅ Uppercase + lowercase + numbers + special chars
- ✅ Not in common password list
- ✅ Different from last 5 passwords

### JWT Tokens
```typescript
// Access token: 15 minutes
// Refresh token: 7 days
// Stored in httpOnly cookies
```

### Account Lockout
- 5 failed attempts → 30-minute lockout
- Automatic reset after successful login

---

## 🛡️ API Security

### Rate Limits
| Endpoint | Limit | Window |
|----------|-------|--------|
| General API | 100 req | 15 min |
| Auth | 5 req | 15 min |
| Password Reset | 3 req | 1 hour |
| Registration | 5 req | 1 hour |

### CSRF Protection
```typescript
// All POST/PUT/DELETE require CSRF token
// Token in cookie: XSRF-TOKEN
// Header: X-CSRF-TOKEN
```

---

## 📝 Input Validation

### Common Validations
```typescript
// Email
validateEmail() // 254 chars max, valid format

// Password
validatePassword() // 12-128 chars, complexity

// URL
validateUrl() // HTTPS only, no internal IPs

// File Upload
max size: 10MB
allowed: .jpg, .png, .gif, .pdf
```

---

## 🔒 Data Protection

### Encryption
```typescript
import { encrypt, decrypt } from './utils/encryption';

// Encrypt sensitive data
const encrypted = encrypt(sensitiveData);

// Decrypt when needed
const decrypted = decrypt(encrypted);
```

### Masking
```typescript
import { maskEmail, maskCreditCard } from './utils/encryption';

maskEmail('user@example.com')     // us***@example.com
maskCreditCard('1234567890123456') // ************3456
```

---

## 🔍 Security Headers

### Current Headers
```
Content-Security-Policy: default-src 'self'
Strict-Transport-Security: max-age=31536000
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

---

## 📊 Monitoring

### Security Logs
```typescript
// Authentication events
// Authorization failures
// Failed login attempts
// Rate limit violations
// Suspicious activity
```

### Check Logs
```bash
# View recent security events
tail -f logs/security.log

# Check failed logins
grep "failed login" logs/security.log
```

---

## 🚨 Incident Response

### Critical Issue (P0)
1. Alert incident commander immediately
2. Isolate affected systems
3. Preserve evidence
4. Begin incident log
5. Follow `/docs/INCIDENT_RESPONSE_PLAN.md`

### Report Security Issue
```
Email: security@yourcompany.com
Subject: [SECURITY] Brief description
Include: Steps to reproduce, impact, PoC
```

---

## ✅ Pre-Deployment Checklist

### Must-Check Items
- [ ] JWT_SECRET changed from default
- [ ] HTTPS enabled in production
- [ ] Environment variables set
- [ ] npm audit passing
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] CSRF protection active
- [ ] Logs don't contain secrets

**Full checklist:** `/docs/SECURITY_CHECKLIST.md`

---

## 🔧 Common Tasks

### Add New API Endpoint
```typescript
// 1. Add rate limiting
app.post('/api/new-endpoint',
  apiRateLimiter,
  csrfProtection,
  authenticate,
  // your handler
);

// 2. Add input validation
const validateNewEndpoint = [
  body('field').trim().notEmpty(),
  // more validations
];

// 3. Sanitize input
app.use(sanitizeInput);
```

### Add New User Role
```typescript
// 1. Add to RBAC middleware
const roles = ['admin', 'instructor', 'student', 'newrole'];

// 2. Add permissions
const permissions = {
  newrole: ['resource:read', 'resource:write']
};

// 3. Protect endpoints
app.get('/api/resource',
  authenticate,
  requireRole('newrole'),
  // handler
);
```

### Update Dependencies
```bash
# Check for updates
npm outdated

# Update safely
npm update

# Check security
npm audit
npm audit fix
```

---

## 📚 Documentation Links

| Document | Purpose |
|----------|---------|
| `/SECURITY.md` | Security policy |
| `/docs/SECURITY_BEST_PRACTICES.md` | Developer guide |
| `/docs/SECURITY_CHECKLIST.md` | Deployment checklist |
| `/docs/INCIDENT_RESPONSE_PLAN.md` | Emergency procedures |
| `/docs/SECURITY_AUDIT_REPORT.md` | Audit findings |

---

## 🎯 Security Scores

| Category | Score |
|----------|-------|
| Overall Security | 85/100 |
| OWASP Top 10 | 96/100 |
| Authentication | 10/10 |
| API Security | 10/10 |
| Data Protection | 9/10 |

**Status:** 🟢 Production Ready

---

## 🆘 Emergency Contacts

- **Security Team:** security@yourcompany.com
- **On-Call:** [Phone Number]
- **Incident Commander:** [Name/Contact]

---

## 🔗 Useful Commands

```bash
# Security audit
./scripts/security-audit.sh

# Dependency scan
npm audit

# Run tests
npm test

# Check types
npm run type-check

# Lint code
npm run lint

# Security scan in CI
git push  # triggers GitHub Actions
```

---

## 💡 Quick Tips

1. **Never commit secrets** - Use environment variables
2. **Validate server-side** - Never trust client input
3. **Use rate limiting** - On all endpoints
4. **Log security events** - But mask sensitive data
5. **Keep dependencies updated** - Run npm audit regularly
6. **Follow the checklist** - Before every deployment
7. **Test security** - Regular penetration testing
8. **Document changes** - Update security docs

---

**Last Updated:** January 2025
**Version:** 1.0

*For detailed information, see full documentation in `/docs/` directory*
