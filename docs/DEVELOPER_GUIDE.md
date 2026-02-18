# Playwright & Selenium Learning Platform - Developer Guide

**Version:** 1.0.0
**Last Updated:** February 17, 2025

## Table of Contents

- [Introduction](#introduction)
- [Getting Started](#getting-started)
- [Architecture Overview](#architecture-overview)
- [Development Environment](#development-environment)
- [Project Structure](#project-structure)
- [Frontend Development](#frontend-development)
- [Backend Development](#backend-development)
- [Database Management](#database-management)
- [State Management](#state-management)
- [API Integration](#api-integration)
- [Testing](#testing)
- [Code Style Guide](#code-style-guide)
- [Component Library](#component-library)
- [Debugging](#debugging)
- [Performance Optimization](#performance-optimization)
- [Security Best Practices](#security-best-practices)
- [Contributing](#contributing)
- [Release Process](#release-process)

---

## Introduction

Welcome to the developer guide for the Playwright & Selenium Learning Platform. This guide covers everything you need to know to contribute to the project, from initial setup to deployment.

### Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite (build tool)
- Tailwind CSS + shadcn/ui
- Zustand (state management)
- React Query (server state)
- IndexedDB (offline storage)
- Monaco Editor (code editor)
- Framer Motion (animations)

**Backend:**
- Node.js + Express
- TypeScript
- MongoDB (via Mongoose)
- JWT authentication
- Docker (for code execution sandbox)

**Testing:**
- Vitest (unit tests)
- React Testing Library (component tests)
- Playwright (E2E tests)
- TestNG (Java tests)

**DevOps:**
- GitHub Actions (CI/CD)
- Vercel (frontend hosting)
- Railway/Render (backend hosting)
- Docker (containerization)

---

## Getting Started

### Prerequisites

Ensure you have the following installed:

```bash
# Required
Node.js 20+          # https://nodejs.org/
npm 9+              # Comes with Node.js
Git                 # https://git-scm.com/

# Optional but recommended
Docker Desktop      # https://www.docker.com/products/docker-desktop
VS Code            # https://code.visualstudio.com/
```

**For Java development:**
```bash
Java JDK 17+       # https://adoptium.net/
Maven 3.9+         # https://maven.apache.org/
```

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/playwright-selenium-learning.git
cd playwright-selenium-learning
```

#### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

#### 3. Install Backend Dependencies

```bash
cd ../backend
npm install
```

#### 4. Install Playwright Dependencies

```bash
cd ../playwright-runner
npm install
npx playwright install --with-deps
```

#### 5. Install Selenium/Java Dependencies

```bash
cd ../selenium-java
mvn clean install
```

### Environment Setup

#### Frontend Environment Variables

Create `.env.local` in the `frontend` directory:

```bash
# API Configuration
VITE_API_URL=http://localhost:3000
VITE_ENV=development

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_SENTRY=false

# Debug
VITE_DEBUG=true
```

#### Backend Environment Variables

Create `.env` in the `backend` directory:

```bash
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=mongodb://localhost:27017/playwright_learning_dev

# Authentication
JWT_SECRET=your-development-secret-key
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Optional: Email
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-pass
```

See [ENVIRONMENT_VARIABLES.md](../docs/ENVIRONMENT_VARIABLES.md) for complete list.

### Running the Application

#### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

Runs on `http://localhost:5173`

#### Start Backend Development Server

```bash
cd backend
npm run dev
```

Runs on `http://localhost:3000`

#### Run Both Concurrently (Optional)

From the root directory:

```bash
npm run dev:all
```

### Verify Installation

1. Open `http://localhost:5173` in your browser
2. You should see the landing page
3. Try navigating to different pages
4. Check browser console for errors

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React)                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │  UI Components (shadcn/ui)                       │  │
│  │  ├─ Pages                                        │  │
│  │  ├─ Components                                   │  │
│  │  └─ Layout                                       │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  State Management                                 │  │
│  │  ├─ Zustand (Client State)                       │  │
│  │  └─ React Query (Server State)                   │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Core Libraries                                   │  │
│  │  ├─ SRS Engine (SM-2 Algorithm)                  │  │
│  │  ├─ IndexedDB (Offline Storage)                  │  │
│  │  ├─ Service Worker (Caching)                     │  │
│  │  └─ Sync Manager (Offline Sync)                  │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           │ REST API
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  Backend (Node.js/Express)               │
│  ┌──────────────────────────────────────────────────┐  │
│  │  API Routes                                       │  │
│  │  ├─ Auth                                         │  │
│  │  ├─ Progress                                     │  │
│  │  ├─ Cards                                        │  │
│  │  ├─ Admin                                        │  │
│  │  └─ Health                                       │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Middleware                                       │  │
│  │  ├─ Authentication                                │  │
│  │  ├─ Authorization (RBAC)                         │  │
│  │  ├─ Error Handler                                │  │
│  │  └─ Rate Limiting                                │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Services                                         │  │
│  │  ├─ Auth Service                                 │  │
│  │  ├─ Auto-Grader                                  │  │
│  │  ├─ Code Runner                                  │  │
│  │  └─ Notification Service                         │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   Database (MongoDB)                     │
│  ├─ Users Collection                                    │
│  ├─ Progress Collection                                 │
│  ├─ Cards Collection                                    │
│  ├─ Submissions Collection                              │
│  └─ Audit Logs Collection                               │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

#### 1. User Authentication Flow

```
User → Login Form → API (POST /auth/login)
  → Validate Credentials → Generate JWT
  → Return Token → Store in HttpOnly Cookie
  → Redirect to Dashboard
```

#### 2. Lesson Reading Flow

```
User → Lesson Page → Check IndexedDB
  → If cached: Display from IndexedDB
  → If not: Fetch from API → Cache in IndexedDB → Display
```

#### 3. Flashcard Review Flow

```
User → Start Review → Fetch Due Cards (IndexedDB)
  → Display Card → User Rates → SM-2 Algorithm
  → Calculate Next Review Date → Update IndexedDB
  → Sync to Backend (if online)
```

#### 4. Exercise Submission Flow

```
User → Write Code → Click Submit
  → API (POST /exercises/submit)
  → Docker Container → Run Tests
  → Return Results → Display Feedback
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

---

## Development Environment

### Recommended VS Code Extensions

Install these extensions for the best development experience:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "usernamehw.errorlens",
    "eamodio.gitlens",
    "ms-playwright.playwright",
    "mongodb.mongodb-vscode",
    "formulahendry.auto-rename-tag",
    "dsznajder.es7-react-js-snippets"
  ]
}
```

Save this as `.vscode/extensions.json` in the project root.

### VS Code Settings

Recommended workspace settings (`.vscode/settings.json`):

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

### Git Configuration

#### Git Hooks (Husky)

We use Husky for Git hooks:

```bash
# Install Husky
npm install --save-dev husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run lint && npm run type-check"

# Add commit-msg hook (commitlint)
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'
```

#### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```bash
feat(flashcards): add keyboard shortcuts for rating

Implemented keyboard shortcuts 0-5 for rating cards during review sessions.

Closes #123
```

```bash
fix(auth): resolve JWT expiration handling

Fixed issue where expired tokens weren't being refreshed properly.
```

### Database Setup

#### MongoDB Local Setup

**Option 1: Local Installation**

```bash
# macOS (using Homebrew)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Linux (Ubuntu)
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

**Option 2: Docker**

```bash
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  -v mongodb_data:/data/db \
  mongo:6.0
```

**Option 3: MongoDB Atlas (Cloud)**

1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string
4. Update `DATABASE_URL` in `.env`

#### Seeding Data

Populate the database with initial data:

```bash
cd backend
npm run seed
```

This creates:
- Sample users
- Flashcards
- Lessons
- Exercises

---

## Project Structure

### Frontend Structure

```
frontend/
├── public/
│   ├── manifest.json           # PWA manifest
│   ├── icons/                  # PWA icons
│   └── codeExecutionWorker.js  # Web Worker for code execution
├── src/
│   ├── main.tsx                # App entry point
│   ├── App.tsx                 # Root component with routing
│   ├── components/             # Reusable components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── layout/             # Layout components
│   │   ├── dashboard/          # Dashboard-specific
│   │   ├── lessons/            # Lesson components
│   │   ├── flashcards/         # Flashcard components
│   │   ├── exercises/          # Exercise components
│   │   ├── quiz/               # Quiz components
│   │   ├── search/             # Search components
│   │   ├── notifications/      # Notification components
│   │   ├── settings/           # Settings components
│   │   ├── progress/           # Progress tracking
│   │   ├── achievements/       # Gamification
│   │   └── admin/              # Admin components
│   ├── pages/                  # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Lessons.tsx
│   │   ├── LessonDetail.tsx
│   │   ├── Flashcards.tsx
│   │   ├── Exercises.tsx
│   │   ├── Exercise.tsx
│   │   ├── Quiz.tsx
│   │   ├── Progress.tsx
│   │   ├── Settings.tsx
│   │   └── Auth/
│   │       ├── Login.tsx
│   │       ├── Register.tsx
│   │       └── ForgotPassword.tsx
│   ├── lib/                    # Core libraries
│   │   ├── srs/                # Spaced repetition system
│   │   │   ├── sm2-algorithm.ts
│   │   │   ├── card-scheduler.ts
│   │   │   └── types.ts
│   │   ├── db/                 # IndexedDB wrapper
│   │   │   ├── schema.ts
│   │   │   ├── operations.ts
│   │   │   └── sync.ts
│   │   ├── api/                # API client
│   │   │   ├── client.ts
│   │   │   └── endpoints.ts
│   │   ├── sync/               # Offline sync
│   │   │   ├── syncManager.ts
│   │   │   └── conflictResolver.ts
│   │   └── utils/              # Utilities
│   │       ├── date.ts
│   │       ├── storage.ts
│   │       └── cn.ts
│   ├── hooks/                  # Custom React hooks
│   │   ├── useSRS.ts
│   │   ├── useProgress.ts
│   │   ├── useOfflineSync.ts
│   │   └── useAuth.ts
│   ├── stores/                 # Zustand stores
│   │   ├── authStore.ts
│   │   ├── progressStore.ts
│   │   ├── srsStore.ts
│   │   └── settingsStore.ts
│   ├── data/                   # Static data
│   │   ├── curriculum/         # Lesson content
│   │   ├── flashcards/         # Flashcard decks
│   │   └── exercises/          # Exercise definitions
│   ├── types/                  # TypeScript types
│   │   ├── curriculum.ts
│   │   ├── srs.ts
│   │   ├── exercise.ts
│   │   └── user.ts
│   └── styles/
│       └── globals.css         # Global styles
├── tests/
│   ├── unit/                   # Unit tests
│   ├── integration/            # Integration tests
│   └── e2e/                    # E2E tests
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── playwright.config.ts
└── vitest.config.ts
```

### Backend Structure

```
backend/
├── src/
│   ├── server.ts               # Server entry point
│   ├── routes/                 # API routes
│   │   ├── auth.ts
│   │   ├── progress.ts
│   │   ├── cards.ts
│   │   ├── achievements.ts
│   │   ├── notifications.ts
│   │   ├── search.ts
│   │   ├── settings.ts
│   │   ├── schedule.ts
│   │   ├── health.ts
│   │   └── admin/
│   │       ├── users.ts
│   │       ├── content.ts
│   │       └── analytics.ts
│   ├── controllers/            # Route handlers
│   │   ├── authController.ts
│   │   ├── progressController.ts
│   │   └── ...
│   ├── services/               # Business logic
│   │   ├── authService.ts
│   │   ├── srsService.ts
│   │   ├── autoGrader.ts
│   │   └── notificationService.ts
│   ├── middleware/             # Express middleware
│   │   ├── auth.ts
│   │   ├── rbac.ts
│   │   ├── errorHandler.ts
│   │   ├── logger.ts
│   │   └── rateLimit.ts
│   ├── models/                 # Mongoose models
│   │   ├── User.ts
│   │   ├── Card.ts
│   │   ├── Flashcard.ts
│   │   ├── UserProgress.ts
│   │   ├── Deck.ts
│   │   └── AuditLog.ts
│   ├── utils/                  # Utility functions
│   │   ├── jwt.ts
│   │   ├── sandbox.ts
│   │   ├── validation.ts
│   │   └── monitoring.ts
│   └── types/
│       └── types.ts
├── tests/
│   ├── unit/
│   └── integration/
├── package.json
└── tsconfig.json
```

---

## Frontend Development

### Component Development

#### Creating a New Component

1. **Create component file:**

```bash
# Create a new component in the appropriate directory
touch frontend/src/components/lessons/LessonCard.tsx
```

2. **Component template:**

```tsx
import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface LessonCardProps {
  title: string;
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  completed: boolean;
  onClick: () => void;
}

export function LessonCard({
  title,
  description,
  duration,
  difficulty,
  completed,
  onClick,
}: LessonCardProps) {
  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Badge variant={completed ? 'success' : 'default'}>
            {completed ? 'Completed' : 'Available'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {description}
        </p>
        <div className="flex gap-2">
          <Badge variant="outline">{duration} min</Badge>
          <Badge variant="secondary">{difficulty}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
```

3. **Export from index:**

```tsx
// components/lessons/index.ts
export { LessonCard } from './LessonCard';
export { LessonList } from './LessonList';
export { LessonPlayer } from './LessonPlayer';
```

#### Styling with Tailwind

Use Tailwind utility classes:

```tsx
<div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
    Title
  </h2>
  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
    Click Me
  </button>
</div>
```

Use `cn()` utility for conditional classes:

```tsx
import { cn } from '@/lib/utils';

<div className={cn(
  "px-4 py-2 rounded-md",
  isActive && "bg-blue-600 text-white",
  !isActive && "bg-gray-200 text-gray-700"
)}>
  Content
</div>
```

### State Management

#### Using Zustand

**Creating a Store:**

```typescript
// stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

**Using a Store:**

```tsx
import { useAuthStore } from '@/stores/authStore';

function UserProfile() {
  const { user, logout } = useAuthStore();

  return (
    <div>
      <p>Welcome, {user?.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

#### Using React Query

**Setting up React Query:**

```tsx
// main.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
});

root.render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
```

**Fetching Data:**

```tsx
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

function LessonList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['lessons'],
    queryFn: () => api.get('/lessons'),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data.map(lesson => (
        <LessonCard key={lesson.id} {...lesson} />
      ))}
    </div>
  );
}
```

**Mutations:**

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

function LessonComplete({ lessonId }: { lessonId: string }) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => api.post(`/progress/lesson/${lessonId}/complete`),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['progress'] });
    },
  });

  return (
    <button
      onClick={() => mutation.mutate()}
      disabled={mutation.isLoading}
    >
      {mutation.isLoading ? 'Saving...' : 'Mark as Complete'}
    </button>
  );
}
```

### Custom Hooks

#### Creating Custom Hooks

```typescript
// hooks/useProgress.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export function useProgress() {
  return useQuery({
    queryKey: ['progress'],
    queryFn: () => api.get('/progress'),
    select: (data) => ({
      ...data,
      completionPercentage: (data.completed / data.total) * 100,
    }),
  });
}
```

**Usage:**

```tsx
import { useProgress } from '@/hooks/useProgress';

function ProgressCard() {
  const { data: progress, isLoading } = useProgress();

  if (isLoading) return <Skeleton />;

  return (
    <div>
      <h3>Progress</h3>
      <ProgressBar value={progress.completionPercentage} />
      <p>{progress.completed} of {progress.total} completed</p>
    </div>
  );
}
```

### Routing

#### Setting up Routes

```tsx
// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/routes/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="lessons" element={<Lessons />} />
          <Route path="lessons/:id" element={<LessonDetail />} />
          <Route
            path="flashcards"
            element={
              <ProtectedRoute>
                <Flashcards />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

#### Protected Routes

```tsx
// routes/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```

---

## Backend Development

### API Routes

#### Creating a New Route

1. **Define route file:**

```typescript
// routes/lessons.ts
import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  getLessons,
  getLessonById,
  completeLesson
} from '../controllers/lessonController';

const router = express.Router();

// Public routes
router.get('/lessons', getLessons);
router.get('/lessons/:id', getLessonById);

// Protected routes
router.post('/lessons/:id/complete', authenticate, completeLesson);

export default router;
```

2. **Register in server:**

```typescript
// server.ts
import lessonsRoutes from './routes/lessons';

app.use('/api', lessonsRoutes);
```

### Controllers

Controllers handle request/response logic:

```typescript
// controllers/lessonController.ts
import { Request, Response } from 'express';
import { Lesson } from '../models/Lesson';
import { UserProgress } from '../models/UserProgress';

export async function getLessons(req: Request, res: Response) {
  try {
    const lessons = await Lesson.find().sort({ order: 1 });
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
}

export async function getLessonById(req: Request, res: Response) {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    res.json(lesson);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lesson' });
  }
}

export async function completeLesson(req: Request, res: Response) {
  try {
    const userId = req.user.id; // From auth middleware
    const lessonId = req.params.id;

    const progress = await UserProgress.findOneAndUpdate(
      { userId, lessonId },
      { completed: true, completedAt: new Date() },
      { upsert: true, new: true }
    );

    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update progress' });
  }
}
```

### Middleware

#### Authentication Middleware

```typescript
// middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

interface JwtPayload {
  userId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}
```

#### Authorization Middleware (RBAC)

```typescript
// middleware/rbac.ts
import { Request, Response, NextFunction } from 'express';

export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

// Usage:
// router.delete('/users/:id', authenticate, authorize('admin'), deleteUser);
```

#### Error Handler

```typescript
// middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', error);

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: error.message,
    });
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Default error
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined,
  });
}

// Register at the end of middleware chain:
// app.use(errorHandler);
```

### Models (Mongoose)

#### Defining Models

```typescript
// models/Card.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ICard extends Document {
  userId: string;
  front: string;
  back: string;
  category: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: Date;
  lastReviewed?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CardSchema = new Schema<ICard>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    front: {
      type: String,
      required: true,
    },
    back: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['playwright', 'selenium', 'general'],
    },
    easeFactor: {
      type: Number,
      default: 2.5,
    },
    interval: {
      type: Number,
      default: 0,
    },
    repetitions: {
      type: Number,
      default: 0,
    },
    nextReview: {
      type: Date,
      required: true,
      index: true,
    },
    lastReviewed: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
CardSchema.index({ userId: 1, nextReview: 1 });

export const Card = mongoose.model<ICard>('Card', CardSchema);
```

---

## Database Management

### Migrations

We don't use traditional migrations with MongoDB. Instead, we version our schemas and handle migrations in code:

```typescript
// models/User.ts
const UserSchema = new Schema({
  // ... fields
  schemaVersion: {
    type: Number,
    default: 1,
  },
});

// Migration function
UserSchema.methods.migrate = async function() {
  if (this.schemaVersion < 2) {
    // Perform migration to version 2
    this.newField = 'default value';
    this.schemaVersion = 2;
    await this.save();
  }
};
```

### Seeding Data

```typescript
// scripts/seed.ts
import mongoose from 'mongoose';
import { User } from '../models/User';
import { Card } from '../models/Card';
import { flashcardsData } from '../data/flashcards';

async function seed() {
  await mongoose.connect(process.env.DATABASE_URL!);

  // Clear existing data
  await User.deleteMany({});
  await Card.deleteMany({});

  // Create admin user
  await User.create({
    name: 'Admin User',
    email: 'admin@example.com',
    password: await bcrypt.hash('admin123', 10),
    role: 'admin',
  });

  // Create flashcards
  await Card.insertMany(flashcardsData);

  console.log('Database seeded successfully');
  process.exit(0);
}

seed();
```

Run with:
```bash
npm run seed
```

### Backup and Restore

```bash
# Backup
mongodump --uri="mongodb://localhost:27017/playwright_learning_dev" --out=./backups/$(date +%Y%m%d)

# Restore
mongorestore --uri="mongodb://localhost:27017/playwright_learning_dev" ./backups/20250217
```

---

## Testing

### Unit Tests (Vitest)

```typescript
// lib/srs/sm2-algorithm.test.ts
import { describe, it, expect } from 'vitest';
import { calculateNextReview } from './sm2-algorithm';

describe('SM-2 Algorithm', () => {
  it('should calculate next review for quality 5', () => {
    const result = calculateNextReview({
      quality: 5,
      easeFactor: 2.5,
      interval: 1,
      repetitions: 1,
    });

    expect(result.interval).toBeGreaterThan(1);
    expect(result.easeFactor).toBeGreaterThanOrEqual(2.5);
  });

  it('should reset interval for quality < 3', () => {
    const result = calculateNextReview({
      quality: 2,
      easeFactor: 2.5,
      interval: 10,
      repetitions: 5,
    });

    expect(result.interval).toBe(1);
    expect(result.repetitions).toBe(0);
  });
});
```

Run tests:
```bash
npm run test          # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage
```

### Component Tests (React Testing Library)

```typescript
// components/lessons/LessonCard.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LessonCard } from './LessonCard';

describe('LessonCard', () => {
  const props = {
    title: 'Test Lesson',
    description: 'Test Description',
    duration: 30,
    difficulty: 'beginner' as const,
    completed: false,
    onClick: vi.fn(),
  };

  it('renders lesson information correctly', () => {
    render(<LessonCard {...props} />);

    expect(screen.getByText('Test Lesson')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('30 min')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    render(<LessonCard {...props} />);

    fireEvent.click(screen.getByText('Test Lesson'));
    expect(props.onClick).toHaveBeenCalledTimes(1);
  });

  it('shows completed badge when completed', () => {
    render(<LessonCard {...props} completed={true} />);

    expect(screen.getByText('Completed')).toBeInTheDocument();
  });
});
```

### E2E Tests (Playwright)

```typescript
// tests/e2e/lesson-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Lesson Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Login
    await page.click('text=Login');
    await page.fill('[name=email]', 'test@example.com');
    await page.fill('[name=password]', 'password123');
    await page.click('button:has-text("Sign In")');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should complete a lesson', async ({ page }) => {
    // Navigate to lessons
    await page.click('text=Lessons');
    await expect(page).toHaveURL('/lessons');

    // Click first lesson
    await page.click('.lesson-card:first-child');
    await expect(page).toHaveURL(/\/lessons\/.+/);

    // Mark as complete
    await page.click('text=Mark as Complete');
    await expect(page.locator('.completed-badge')).toBeVisible();

    // Verify progress updated
    await page.goto('/progress');
    await expect(page.locator('.progress-percentage')).toContainText(/[1-9]/);
  });
});
```

Run E2E tests:
```bash
npm run test:e2e          # Run E2E tests
npm run test:e2e:headed   # With visible browser
npm run test:e2e:ui       # Interactive UI mode
```

---

## Code Style Guide

### TypeScript Guidelines

#### Use TypeScript Features

```typescript
// ✅ Good: Use interfaces for object shapes
interface User {
  id: string;
  name: string;
  email: string;
}

// ✅ Good: Use type for unions
type Status = 'idle' | 'loading' | 'success' | 'error';

// ✅ Good: Use generics
function identity<T>(value: T): T {
  return value;
}

// ❌ Bad: Using 'any'
function process(data: any) {
  return data;
}

// ✅ Good: Use unknown for truly unknown types
function process(data: unknown) {
  if (typeof data === 'string') {
    return data.toUpperCase();
  }
}
```

#### Naming Conventions

```typescript
// Interfaces and Types: PascalCase
interface UserProfile {}
type StatusCode = number;

// Variables and Functions: camelCase
const userName = 'John';
function fetchData() {}

// Constants: UPPERCASE_SNAKE_CASE
const API_URL = 'https://api.example.com';
const MAX_RETRIES = 3;

// Components: PascalCase
function UserProfile() {}

// Private properties: _camelCase
class User {
  private _password: string;
}
```

### React Guidelines

#### Component Structure

```tsx
// ✅ Good: Clear component structure
import React from 'react';
import { useQuery } from '@tanstack/react-query';

interface Props {
  userId: string;
}

export function UserProfile({ userId }: Props) {
  // 1. Hooks
  const { data, isLoading } = useQuery(/*...*/);

  // 2. Event handlers
  const handleClick = () => {
    // ...
  };

  // 3. Early returns
  if (isLoading) return <Skeleton />;
  if (!data) return <ErrorMessage />;

  // 4. Main render
  return (
    <div>
      {/* ... */}
    </div>
  );
}
```

#### Prefer Functional Components

```tsx
// ✅ Good: Functional component
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

// ❌ Bad: Class component (avoid unless necessary)
class Counter extends React.Component {
  // ...
}
```

### ESLint Rules

Our ESLint configuration:

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error", {
      "argsIgnorePattern": "^_"
    }],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "error",
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off"
  }
}
```

### Prettier Configuration

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "arrowParens": "always"
}
```

---

## Component Library

We use **shadcn/ui** for our component library. It's not a dependency; components are copied into your project and customizable.

### Installing Components

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
```

### Using Components

```tsx
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

function Example() {
  return (
    <Card>
      <CardHeader>
        <h3>Card Title</h3>
      </CardHeader>
      <CardContent>
        <p>Card content</p>
        <Button variant="default">Click Me</Button>
      </CardContent>
    </Card>
  );
}
```

### Customizing Components

Components are in `frontend/src/components/ui/`. Customize directly:

```tsx
// components/ui/button.tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        // Add custom variant
        custom: "bg-purple-600 text-white hover:bg-purple-700",
      },
    },
  }
);
```

---

## Debugging

### Frontend Debugging

#### Browser DevTools

- **Elements**: Inspect DOM and styles
- **Console**: View logs and errors
- **Network**: Monitor API calls
- **Application**: View localStorage, IndexedDB, Service Worker
- **Performance**: Profile performance

#### React DevTools

Install [React DevTools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi) for:
- Component tree inspection
- Props and state viewing
- Performance profiling

#### Zustand DevTools

```typescript
import { devtools } from 'zustand/middleware';

export const useStore = create(
  devtools(
    (set) => ({
      // ...
    }),
    { name: 'MyStore' }
  )
);
```

View in Redux DevTools extension.

### Backend Debugging

#### VS Code Debug Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/backend/src/server.ts",
      "preLaunchTask": "tsc: build - backend/tsconfig.json",
      "outFiles": ["${workspaceFolder}/backend/dist/**/*.js"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

#### Logging

```typescript
import { logger } from './utils/logger';

logger.info('User logged in', { userId: user.id });
logger.error('Failed to fetch data', { error: error.message });
logger.debug('Debug info', { data });
```

#### Request Logging

We use Morgan:

```typescript
import morgan from 'morgan';

app.use(morgan('combined'));
```

---

## Performance Optimization

### Frontend Performance

#### Code Splitting

```tsx
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

#### Memoization

```tsx
import { memo, useMemo, useCallback } from 'react';

// Memoize component
const ExpensiveComponent = memo(function ExpensiveComponent({ data }) {
  return <div>{/* render */}</div>;
});

// Memoize computed value
function Component({ items }) {
  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price, 0);
  }, [items]);

  return <div>Total: {total}</div>;
}

// Memoize callback
function Component({ onSave }) {
  const handleClick = useCallback(() => {
    onSave(data);
  }, [onSave, data]);

  return <button onClick={handleClick}>Save</button>;
}
```

#### Virtual Scrolling

For long lists, use virtual scrolling:

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

function LongList({ items }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {items[virtualItem.index]}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Backend Performance

#### Database Indexing

```typescript
// Add indexes for frequently queried fields
CardSchema.index({ userId: 1, nextReview: 1 });
UserSchema.index({ email: 1 }, { unique: true });
```

#### Caching

```typescript
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes

export async function getLessons() {
  const cacheKey = 'all-lessons';

  // Check cache
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  // Fetch from DB
  const lessons = await Lesson.find();

  // Store in cache
  cache.set(cacheKey, lessons);

  return lessons;
}
```

#### Pagination

```typescript
export async function getLessons(req: Request, res: Response) {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const lessons = await Lesson.find()
    .skip(skip)
    .limit(limit)
    .sort({ order: 1 });

  const total = await Lesson.countDocuments();

  res.json({
    lessons,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
}
```

---

## Security Best Practices

### Authentication Security

```typescript
// Use bcrypt for password hashing
import bcrypt from 'bcrypt';

const hashedPassword = await bcrypt.hash(password, 10);
const isValid = await bcrypt.compare(password, hashedPassword);

// Use secure JWT settings
const token = jwt.sign(
  { userId: user.id },
  process.env.JWT_SECRET!,
  { expiresIn: '7d', algorithm: 'HS256' }
);

// Store JWT in HttpOnly cookie
res.cookie('token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});
```

### Input Validation

```typescript
import { body, validationResult } from 'express-validator';

export const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
];

export async function login(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Process login
}

// Use in route:
// router.post('/login', validateLogin, login);
```

### CSRF Protection

```typescript
import csrf from 'csurf';

const csrfProtection = csrf({ cookie: true });

app.use(csrfProtection);

// Send CSRF token to frontend
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});
```

### Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
});

app.use('/api/', limiter);

// Stricter limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
});

app.use('/api/auth/login', authLimiter);
```

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed contribution guidelines.

### Quick Start for Contributors

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run tests: `npm run test`
5. Commit with conventional commits: `feat(component): add new feature`
6. Push and create a Pull Request

---

## Release Process

### Version Bumping

We use semantic versioning (MAJOR.MINOR.PATCH):

```bash
# Patch release (bug fixes)
npm version patch

# Minor release (new features, backward compatible)
npm version minor

# Major release (breaking changes)
npm version major
```

### Creating a Release

1. **Update CHANGELOG.md**
2. **Bump version**: `npm version minor`
3. **Push tags**: `git push --tags`
4. **Create GitHub Release**: Tag triggers deployment

### Deployment

Deployment is automated via GitHub Actions:
- **Staging**: Deployed on every push to `develop`
- **Production**: Deployed on every push to `main`

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for details.

---

## Additional Resources

- **Architecture Documentation**: [ARCHITECTURE.md](./ARCHITECTURE.md)
- **API Reference**: [API_REFERENCE.md](./API_REFERENCE.md)
- **Database Schema**: [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
- **Deployment Guide**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Contributing Guidelines**: [CONTRIBUTING.md](./CONTRIBUTING.md)

---

**Happy Coding!**

*Last Updated: February 17, 2025*
*Version: 1.0.0*
