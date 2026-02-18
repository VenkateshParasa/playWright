# Security Best Practices for Developers

This guide outlines security best practices for developing and maintaining the Playwright & Selenium Learning Platform.

## Table of Contents

- [Code Security](#code-security)
- [Authentication & Authorization](#authentication--authorization)
- [Input Validation](#input-validation)
- [Data Protection](#data-protection)
- [API Security](#api-security)
- [Frontend Security](#frontend-security)
- [Database Security](#database-security)
- [Deployment Security](#deployment-security)
- [Testing Security](#testing-security)

---

## Code Security

### Never Commit Secrets

**❌ Never do this:**
```typescript
const API_KEY = 'sk_live_abc123xyz789'; // Hardcoded secret
const DB_PASSWORD = 'mypassword123';
```

**✅ Do this instead:**
```typescript
const API_KEY = process.env.API_KEY;
const DB_PASSWORD = process.env.DB_PASSWORD;
```

### Use Environment Variables

- Store all secrets in environment variables
- Use `.env` files for local development
- Add `.env` to `.gitignore`
- Use different secrets for each environment

### Validate Dependencies

```bash
# Before adding new dependencies
npm audit <package-name>

# Regular security audits
npm audit
npm audit fix

# Use Snyk for deeper scanning
snyk test
```

### Keep Dependencies Updated

```bash
# Check for outdated packages
npm outdated

# Update packages safely
npm update

# Update major versions carefully
npm install package@latest
```

---

## Authentication & Authorization

### Password Handling

**✅ Correct way to hash passwords:**

```typescript
import bcrypt from 'bcrypt';

// Hashing a password
const saltRounds = 12;
const hashedPassword = await bcrypt.hash(password, saltRounds);

// Verifying a password
const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
```

**❌ Never store plain text passwords:**
```typescript
// NEVER DO THIS
user.password = password;
```

### JWT Token Best Practices

```typescript
// ✅ Use strong secrets
const JWT_SECRET = process.env.JWT_SECRET; // At least 32 characters

// ✅ Set reasonable expiration times
const accessToken = jwt.sign(payload, JWT_SECRET, {
  expiresIn: '15m', // Short-lived access tokens
});

const refreshToken = jwt.sign(payload, JWT_SECRET, {
  expiresIn: '7d', // Longer-lived refresh tokens
});

// ✅ Verify tokens properly
try {
  const decoded = jwt.verify(token, JWT_SECRET);
} catch (error) {
  // Handle invalid token
}
```

### Session Management

```typescript
// ✅ Implement session timeout
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// ✅ Track session activity
await updateSessionActivity(token);

// ✅ Implement logout on all devices
await revokeAllUserSessions(userId);
```

---

## Input Validation

### Always Validate on Server-Side

```typescript
import { body, validationResult } from 'express-validator';

// ✅ Validate all inputs
app.post('/api/users',
  [
    body('email').isEmail().normalizeEmail(),
    body('username').isLength({ min: 3, max: 30 }).trim(),
    body('password').isLength({ min: 12 }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Process request
  }
);
```

### Sanitize User Input

```typescript
import { sanitizeInput } from './middleware/sanitize';

// ✅ Sanitize before processing
app.use(sanitizeInput);

// ✅ Remove dangerous HTML
const sanitized = stripHtml(userInput);

// ✅ Escape HTML for display
const safe = escapeHtml(userInput);
```

### Prevent SQL/NoSQL Injection

```typescript
// ✅ Use parameterized queries with ORM
const user = await User.findOne({ email: email });

// ❌ Never concatenate user input into queries
// NEVER DO THIS:
const query = `SELECT * FROM users WHERE email = '${email}'`;
```

### Validate File Uploads

```typescript
// ✅ Validate file types and sizes
const validateFile = (file: Express.Multer.File) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error('Invalid file type');
  }

  if (file.size > maxSize) {
    throw new Error('File too large');
  }
};
```

---

## Data Protection

### Encrypt Sensitive Data

```typescript
import { encrypt, decrypt } from './utils/encryption';

// ✅ Encrypt PII before storing
const encryptedSSN = encrypt(ssn);
await user.save({ ssn: encryptedSSN });

// ✅ Decrypt when needed
const decryptedSSN = decrypt(user.ssn);
```

### Mask Sensitive Data in Logs

```typescript
import { sanitizeObject } from './utils/encryption';

// ✅ Sanitize before logging
const safeUser = sanitizeObject(user);
logger.info('User action', { user: safeUser });

// ✅ Use specific masking functions
const maskedEmail = maskEmail(user.email);
const maskedCard = maskCreditCard(cardNumber);
```

### Implement Data Retention

```typescript
// ✅ Automatically delete old data
const deleteOldData = async () => {
  const retentionDays = 365;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  await Data.deleteMany({ createdAt: { $lt: cutoffDate } });
};
```

---

## API Security

### Implement Rate Limiting

```typescript
import { apiRateLimiter, authRateLimiter } from './middleware/rateLimit';

// ✅ Apply rate limiting to all endpoints
app.use('/api', apiRateLimiter);

// ✅ Stricter limits for auth endpoints
app.use('/api/auth', authRateLimiter);
```

### CSRF Protection

```typescript
import { csrfProtection } from './middleware/csrf';

// ✅ Protect state-changing operations
app.post('/api/*', csrfProtection);
app.put('/api/*', csrfProtection);
app.delete('/api/*', csrfProtection);
```

### Validate Content-Type

```typescript
// ✅ Ensure correct content type
app.use(validateContentType(['application/json']));
```

### Secure Error Messages

```typescript
// ❌ Never expose sensitive information
// NEVER DO THIS:
res.status(500).json({ error: error.stack });

// ✅ Use generic error messages
res.status(500).json({
  success: false,
  message: 'An error occurred. Please try again later.',
});

// ✅ Log detailed errors server-side only
logger.error('Database error', { error, userId });
```

---

## Frontend Security

### Prevent XSS Attacks

```typescript
import { sanitizeHtml, escapeHtml } from './utils/security';

// ✅ Sanitize user input before rendering
const SafeComponent = ({ userContent }) => {
  const safe = sanitizeHtml(userContent);
  return <div>{safe}</div>;
};

// ❌ Never use dangerouslySetInnerHTML with unsanitized content
// ONLY USE IF ABSOLUTELY NECESSARY AND CONTENT IS SANITIZED:
<div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
```

### Secure Local Storage

```typescript
import { SecureStorage } from './utils/security';

// ✅ Encrypt sensitive data in localStorage
SecureStorage.setItem('userData', data, encryptionKey);

// ✅ Retrieve and decrypt
const userData = SecureStorage.getItem('userData', encryptionKey);

// ❌ Never store sensitive data unencrypted
// NEVER DO THIS:
localStorage.setItem('password', password);
```

### Validate URLs

```typescript
import { isValidUrl, isSafeUrl } from './utils/security';

// ✅ Validate URLs before navigation
const handleClick = (url: string) => {
  if (!isValidUrl(url) || !isSafeUrl(url)) {
    console.error('Invalid or unsafe URL');
    return;
  }
  window.location.href = url;
};
```

### Content Security Policy

```typescript
// ✅ Implement CSP in your application
const cspDirectives = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'"],
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", 'data:', 'https:'],
  connectSrc: ["'self'"],
  frameSrc: ["'none'"],
};
```

---

## Database Security

### Use Parameterized Queries

```typescript
// ✅ Always use ORM methods
const user = await User.findOne({ email });
const users = await User.find({ role: 'student' });

// ✅ Use query builders safely
const users = await User.find()
  .where('age').gt(18)
  .where('active').equals(true);
```

### Implement Least Privilege

```typescript
// ✅ Create database users with minimal permissions
// Database user should only have permissions for operations it needs

// Production DB user:
// - READ, WRITE on application tables
// - NO DROP, ALTER, CREATE permissions
```

### Connection Security

```typescript
// ✅ Use connection pooling
mongoose.connect(process.env.MONGODB_URI, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
});

// ✅ Use SSL/TLS for connections
mongoose.connect(process.env.MONGODB_URI, {
  ssl: true,
  sslValidate: true,
});
```

---

## Deployment Security

### Environment Variables

```bash
# ✅ Production environment variables
NODE_ENV=production
JWT_SECRET=<long-random-string>
ENCRYPTION_KEY=<long-random-string>
DATABASE_URL=<secure-connection-string>

# ✅ Never use default secrets in production
# ❌ JWT_SECRET=your-secret-key-change-in-production
```

### HTTPS Configuration

```typescript
// ✅ Enforce HTTPS in production
if (process.env.NODE_ENV === 'production' && !req.secure) {
  return res.redirect(301, `https://${req.headers.host}${req.url}`);
}
```

### Security Headers

```typescript
import helmet from 'helmet';

// ✅ Use helmet for security headers
app.use(helmet({
  contentSecurityPolicy: true,
  hsts: { maxAge: 31536000, includeSubDomains: true },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
}));
```

### Docker Security

```dockerfile
# ✅ Use non-root user
USER node

# ✅ Scan for vulnerabilities
# docker scan myimage

# ✅ Use specific versions
FROM node:20-alpine

# ✅ Minimize layers
RUN npm ci --only=production && npm cache clean --force
```

---

## Testing Security

### Security Test Checklist

```typescript
// ✅ Test authentication
describe('Authentication', () => {
  it('should reject invalid credentials', async () => {
    // Test implementation
  });

  it('should lock account after failed attempts', async () => {
    // Test implementation
  });
});

// ✅ Test input validation
describe('Input Validation', () => {
  it('should reject XSS attempts', async () => {
    // Test implementation
  });

  it('should sanitize user input', async () => {
    // Test implementation
  });
});

// ✅ Test authorization
describe('Authorization', () => {
  it('should deny access without token', async () => {
    // Test implementation
  });

  it('should enforce role-based permissions', async () => {
    // Test implementation
  });
});
```

### Penetration Testing

```bash
# ✅ Run regular security scans
npm audit
snyk test

# ✅ Use OWASP ZAP for penetration testing
# zap-cli quick-scan http://localhost:3000

# ✅ Test for common vulnerabilities
# - SQL Injection
# - XSS
# - CSRF
# - Authentication bypass
# - Broken access control
```

---

## Security Checklist

Before deploying to production:

- [ ] All secrets are in environment variables
- [ ] `.env` files are in `.gitignore`
- [ ] Strong JWT secrets are configured
- [ ] HTTPS is enforced
- [ ] Security headers are configured
- [ ] Rate limiting is enabled
- [ ] CSRF protection is enabled
- [ ] Input validation is implemented
- [ ] Error messages don't expose sensitive info
- [ ] Passwords are hashed with bcrypt
- [ ] Sensitive data is encrypted
- [ ] Dependencies are up to date
- [ ] Security scans pass (`npm audit`)
- [ ] Logs don't contain sensitive data
- [ ] Database uses parameterized queries
- [ ] File uploads are validated
- [ ] Session timeout is configured
- [ ] Security tests are passing

---

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

**Remember:** Security is not a one-time task. It's an ongoing process that requires constant vigilance and updates.
