# Authentication & User Management Implementation

## Overview

This document describes the complete authentication system implementation for the Playwright & Selenium Learning Platform, following the specifications in FEATURES_IMPLEMENTATION.md (Section 1.1).

## Features Implemented

- User registration with email/password
- Email verification (structure in place, email sending requires SMTP configuration)
- Login/logout functionality
- Password reset flow
- Session management with JWT
- User profile management
- Avatar support
- HTTP-only cookies for token storage
- CSRF protection
- Rate limiting on auth endpoints
- Secure password hashing with bcrypt

## Architecture

### Backend Stack
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt (12 salt rounds)
- **Security**: helmet, cors, CSRF tokens, rate-limit
- **Validation**: express-validator

### Frontend Stack
- **Framework**: React with TypeScript
- **Routing**: React Router v6
- **State Management**: Zustand with persistence
- **Styling**: Tailwind CSS
- **HTTP Client**: Fetch API

## File Structure

### Backend Files

```
backend/
├── package.json                    # Dependencies and scripts
├── tsconfig.json                   # TypeScript configuration
├── .env.example                    # Environment variables template
└── src/
    ├── server.ts                   # Express server entry point
    ├── models/
    │   ├── User.ts                 # User model with Mongoose schema
    │   └── types.ts                # TypeScript interfaces
    ├── controllers/
    │   └── authController.ts       # Authentication logic
    ├── routes/
    │   └── auth.ts                 # Auth routes with validation
    ├── middleware/
    │   ├── auth.ts                 # JWT authentication middleware
    │   ├── csrf.ts                 # CSRF protection
    │   ├── validation.ts           # Request validation
    │   └── errorHandler.ts         # Global error handler
    └── utils/
        ├── jwt.ts                  # JWT token utilities
        ├── password.ts             # Password hashing/validation
        ├── csrf.ts                 # CSRF token generation
        └── database.ts             # MongoDB connection
```

### Frontend Files

```
frontend/
├── .env.example                    # Environment variables template
└── src/
    ├── pages/
    │   ├── Auth/
    │   │   ├── Login.tsx           # Login page
    │   │   ├── Register.tsx        # Registration page
    │   │   ├── ForgotPassword.tsx  # Forgot password page
    │   │   └── ResetPassword.tsx   # Reset password page
    │   └── Profile.tsx             # User profile management
    ├── stores/
    │   └── authStore.ts            # Zustand auth store
    ├── lib/
    │   ├── api/
    │   │   ├── client.ts           # Base API client
    │   │   └── auth.ts             # Auth API functions
    │   └── types/
    │       └── auth.ts             # TypeScript interfaces
    └── components/
        └── routes/
            └── ProtectedRoute.tsx  # Route protection wrapper
```

## Setup Instructions

### Backend Setup

1. **Install Dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start MongoDB**:
   ```bash
   # Make sure MongoDB is running locally or update MONGODB_URI
   mongod
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Install Dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Configure Environment**:
   ```bash
   cp .env.example .env
   # Update VITE_API_BASE_URL if backend is not on localhost:5000
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

## API Endpoints

### Public Endpoints

#### POST /api/auth/register
Register a new user account.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Registration successful",
  "user": {
    "id": "...",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "role": "student",
    "isEmailVerified": false
  },
  "accessToken": "...",
  "refreshToken": "..."
}
```

#### POST /api/auth/login
Login with email and password.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response**: Same as register

#### POST /api/auth/logout
Logout current user (clears cookies).

#### POST /api/auth/forgot-password
Request password reset email.

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

#### POST /api/auth/reset-password
Reset password with token.

**Request Body**:
```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewPassword123!"
}
```

#### POST /api/auth/verify-email
Verify email with token.

**Request Body**:
```json
{
  "token": "verification-token-from-email"
}
```

#### POST /api/auth/refresh-token
Refresh access token using refresh token cookie.

### Protected Endpoints (Require Authentication)

#### GET /api/auth/profile
Get current user profile.

#### PUT /api/auth/profile
Update user profile.

**Request Body**:
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "avatar": "https://example.com/avatar.jpg"
}
```

#### POST /api/auth/change-password
Change user password.

**Request Body**:
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

## Security Features

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Rate Limiting
- Auth endpoints: 5 requests per 15 minutes
- Password reset: 3 requests per hour

### Token Management
- **Access Token**: 7 days expiration
- **Refresh Token**: 30 days expiration
- **Password Reset Token**: 1 hour expiration
- **Email Verification Token**: 24 hours expiration

### Cookie Security
- HTTP-only cookies for tokens
- Secure flag in production
- SameSite: strict

### CSRF Protection
- CSRF tokens for state-changing operations
- Token stored in cookie (accessible to JavaScript)
- Token verification on POST/PUT/DELETE requests

## Frontend Usage

### Authentication Store

```typescript
import { useAuthStore } from '@/stores/authStore';

function MyComponent() {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    register,
    clearError
  } = useAuthStore();

  // Use authentication state and functions
}
```

### Protected Routes

```typescript
import ProtectedRoute from '@/components/routes/ProtectedRoute';

// Require authentication
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>

// Prevent authenticated users (for login/register pages)
<ProtectedRoute requireAuth={false}>
  <Login />
</ProtectedRoute>
```

### API Calls

```typescript
import * as authApi from '@/lib/api/auth';

// Login
await authApi.login({ email, password });

// Register
await authApi.register({ email, password, firstName, lastName });

// Update profile
await authApi.updateProfile({ firstName, lastName });

// Change password
await authApi.changePassword({ currentPassword, newPassword });
```

## Database Schema

### User Model

```typescript
{
  email: String (unique, required, indexed),
  password: String (hashed, not returned by default),
  firstName: String (required),
  lastName: String (required),
  avatar: String (optional),
  role: 'student' | 'instructor' | 'admin',
  isEmailVerified: Boolean,
  emailVerificationToken: String (not returned by default),
  passwordResetToken: String (not returned by default),
  passwordResetExpires: Date (not returned by default),
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Testing the Implementation

### Manual Testing Steps

1. **Registration**:
   - Navigate to `/auth/register`
   - Fill in all required fields
   - Submit form
   - Should redirect to dashboard on success

2. **Login**:
   - Navigate to `/auth/login`
   - Enter credentials
   - Should redirect to dashboard on success

3. **Logout**:
   - Click logout button (needs to be added to UI)
   - Should redirect to login page

4. **Profile Update**:
   - Navigate to `/profile`
   - Edit name fields
   - Save changes
   - Should show success message

5. **Change Password**:
   - Navigate to `/profile`
   - Enter current and new passwords
   - Submit form
   - Should show success message

6. **Password Reset**:
   - Navigate to `/auth/forgot-password`
   - Enter email
   - Check console for reset token (email not configured)
   - Navigate to `/auth/reset-password?token=<token>`
   - Enter new password
   - Should redirect to login

## Known Limitations & TODOs

1. **Email Sending**: Email service not configured. Email verification and password reset tokens are generated but not sent. To enable:
   - Configure SMTP settings in `.env`
   - Implement email sending in `authController.ts` (marked with TODO comments)

2. **OAuth Integration**: OAuth (Google, GitHub) marked as optional and not implemented

3. **Avatar Upload**: Avatar field exists but file upload endpoint not implemented

4. **UI Integration**: Auth pages exist but need to be integrated into the main app routing

5. **Tests**: No automated tests written yet

## Next Steps

1. **Add Email Service**: Integrate nodemailer with SMTP configuration
2. **Update App Routing**: Add auth routes to main App.tsx
3. **Add Logout Button**: Add logout functionality to header/navigation
4. **Implement Avatar Upload**: Add file upload endpoint and UI
5. **Add Tests**: Write unit and integration tests
6. **Add OAuth**: Implement Google/GitHub OAuth if needed
7. **Add Remember Me**: Implement extended session functionality

## Dependencies

### Backend
```json
{
  "express": "^4.18.2",
  "mongoose": "^8.0.3",
  "bcrypt": "^5.1.1",
  "jsonwebtoken": "^9.0.2",
  "express-rate-limit": "^7.1.5",
  "cookie-parser": "^1.4.6",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "express-validator": "^7.0.1",
  "helmet": "^7.1.0",
  "compression": "^1.7.4",
  "morgan": "^1.10.0"
}
```

### Frontend
```json
{
  "react": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "zustand": "^4.4.0",
  "lucide-react": "^0.300.0"
}
```

## Support

For issues or questions, refer to:
- FEATURES_IMPLEMENTATION.md - Feature specifications
- PROJECT_STRUCTURE.md - Project organization
- SETUP_INSTRUCTIONS.md - General setup guide
