# Enterprise Features - Dependencies Guide

## Required NPM Packages

### Backend Dependencies

Add these to `/backend/package.json`:

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.3",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "cookie-parser": "^1.4.6",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "helmet": "^7.1.0",
    "compression": "^1.7.4",
    "morgan": "^1.10.0",
    "express-rate-limit": "^7.1.5",
    "express-validator": "^7.0.1",
    "node-cache": "^5.1.2",
    "json2csv": "^6.0.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/bcrypt": "^5.0.2",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/cookie-parser": "^1.4.6",
    "@types/cors": "^2.8.17",
    "@types/node": "^20.10.0",
    "@types/compression": "^1.7.5",
    "@types/morgan": "^1.9.9",
    "typescript": "^5.3.0",
    "tsx": "^4.7.0",
    "vitest": "^1.0.0"
  }
}
```

### Optional SSO Libraries (Production Recommended)

For production deployments, consider adding these specialized libraries:

```json
{
  "dependencies": {
    "@node-saml/node-saml": "^4.0.5",
    "passport-saml": "^3.2.4",
    "ldapjs": "^3.0.5",
    "activedirectory2": "^2.1.0",
    "xml-crypto": "^3.2.0",
    "xml2js": "^0.6.2"
  }
}
```

### Frontend Dependencies

No additional dependencies required beyond existing React setup.

## Installation Commands

### Backend
```bash
cd backend
npm install json2csv
```

### Optional Production SSO Libraries
```bash
# For enhanced SAML support
npm install @node-saml/node-saml passport-saml xml-crypto xml2js

# For LDAP/AD support
npm install ldapjs @types/ldapjs

# For Active Directory
npm install activedirectory2
```

## TypeScript Configuration

Ensure `/backend/tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "types": ["node"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## Environment Setup

### Development
```bash
# .env.development
MONGODB_URI=mongodb://localhost:27017/playwright-learning-dev
JWT_SECRET=dev-secret-change-in-production
NODE_ENV=development
PORT=3001
```

### Production
```bash
# .env.production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/playwright-learning
JWT_SECRET=super-strong-secret-min-32-chars-random
NODE_ENV=production
PORT=3000
SAML_CALLBACK_BASE_URL=https://your-production-domain.com
OAUTH2_CALLBACK_BASE_URL=https://your-production-domain.com
```

## Build and Start Scripts

Update `/backend/package.json` scripts:

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "start:prod": "NODE_ENV=production node dist/server.js",
    "test": "vitest",
    "lint": "eslint . --ext ts",
    "format": "prettier --write \"src/**/*.{ts,json}\"",
    "type-check": "tsc --noEmit",
    "db:indexes": "node scripts/create-indexes.js"
  }
}
```

## Database Index Creation Script

Create `/backend/scripts/create-indexes.js`:

```javascript
const mongoose = require('mongoose');
require('dotenv').config();

async function createIndexes() {
  await mongoose.connect(process.env.MONGODB_URI);

  const db = mongoose.connection.db;

  console.log('Creating indexes...');

  // Users
  await db.collection('users').createIndex({ email: 1, tenantId: 1 }, { unique: true });
  await db.collection('users').createIndex({ tenantId: 1, role: 1 });
  await db.collection('users').createIndex({ ssoId: 1, ssoProvider: 1 });

  // Tenants
  await db.collection('tenants').createIndex({ slug: 1 }, { unique: true });
  await db.collection('tenants').createIndex({ domain: 1 }, { unique: true, sparse: true });
  await db.collection('tenants').createIndex({ status: 1, plan: 1 });

  // Sessions
  await db.collection('sessions').createIndex({ token: 1 }, { unique: true });
  await db.collection('sessions').createIndex({ userId: 1, status: 1 });
  await db.collection('sessions').createIndex({ tenantId: 1, status: 1 });
  await db.collection('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

  // Audit Logs
  await db.collection('auditlogs').createIndex({ tenantId: 1, timestamp: -1 });
  await db.collection('auditlogs').createIndex({ userId: 1, timestamp: -1 });
  await db.collection('auditlogs').createIndex({ category: 1, severity: 1, timestamp: -1 });

  // Security Policies
  await db.collection('securitypolicies').createIndex({ tenantId: 1 }, { unique: true });

  console.log('✅ All indexes created successfully');

  await mongoose.disconnect();
}

createIndexes().catch(console.error);
```

Run with:
```bash
node backend/scripts/create-indexes.js
```

## Docker Setup

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --production

# Copy built application
COPY dist ./dist

# Set environment
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "dist/server.js"]
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6
    volumes:
      - mongo-data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    ports:
      - "27017:27017"

  backend:
    build: ./backend
    depends_on:
      - mongodb
    environment:
      MONGODB_URI: mongodb://admin:password@mongodb:27017/playwright-learning?authSource=admin
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: production
    ports:
      - "3000:3000"
    restart: unless-stopped

volumes:
  mongo-data:
```

## Verification Checklist

After installing dependencies:

- [ ] Run `npm install` successfully
- [ ] Build with `npm run build` works
- [ ] TypeScript compiles without errors
- [ ] All imports resolve correctly
- [ ] Database indexes created
- [ ] Environment variables set
- [ ] Server starts without errors
- [ ] Can create super admin user
- [ ] Can create first tenant
- [ ] SSO endpoints respond

## Common Issues

### Issue: Module not found
**Solution**: Run `npm install` in correct directory

### Issue: TypeScript errors
**Solution**: Ensure all `@types/*` packages installed

### Issue: Database connection fails
**Solution**: Check MONGODB_URI in .env file

### Issue: JWT errors
**Solution**: Ensure JWT_SECRET is set and strong

## Support

If you encounter dependency issues:
1. Check Node.js version (18+)
2. Delete `node_modules` and `package-lock.json`
3. Run `npm install` again
4. Check for version conflicts
5. Contact support@learningplatform.com

---

**Last Updated**: February 17, 2026
