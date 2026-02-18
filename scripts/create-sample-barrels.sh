#!/bin/bash

###############################################################################
# Sample Barrel Export Generator
#
# Purpose: Generate sample index.ts barrel export files for reference
# Usage: ./create-sample-barrels.sh
###############################################################################

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SAMPLES_DIR="$PROJECT_ROOT/docs/examples/barrel-exports"

echo "Creating sample barrel export files..."
mkdir -p "$SAMPLES_DIR"

###############################################################################
# Backend Samples
###############################################################################

# Sample 1: User Models Barrel
cat > "$SAMPLES_DIR/backend-models-user-index.ts" << 'EOF'
/**
 * User Domain Models Barrel Export
 *
 * This module exports all user-related models and types.
 *
 * @example
 * ```typescript
 * import { User, Session, OAuth2Token } from '@/models/user';
 * ```
 */

// Export Models
export { User } from './User';
export { Session } from './Session';
export { OAuth2Token } from './OAuth2Token';
export { SecurityPolicy } from './SecurityPolicy';
export { CommunityProfile } from './CommunityProfile';
export { UserProgress } from './UserProgress';

// Export Types
export type { IUser, UserDocument, UserMethods, UserStatics } from './User';
export type { ISession, SessionDocument } from './Session';
export type { IOAuth2Token, OAuth2TokenDocument } from './OAuth2Token';
export type { ISecurityPolicy } from './SecurityPolicy';
export type { ICommunityProfile } from './CommunityProfile';
export type { IUserProgress } from './UserProgress';
EOF

# Sample 2: Learning Models Barrel
cat > "$SAMPLES_DIR/backend-models-learning-index.ts" << 'EOF'
/**
 * Learning Domain Models Barrel Export
 */

// Export Models
export { Lesson } from './Lesson';
export { Course } from './Course';
export { Quiz } from './Quiz';
export { Flashcard } from './Flashcard';
export { Deck } from './Deck';
export { Card } from './Card';
export { UserProgress } from './UserProgress';
export { VideoProgress } from './VideoProgress';

// Export Types
export type { ILesson, LessonDocument } from './Lesson';
export type { ICourse, CourseDocument } from './Course';
export type { IQuiz, QuizDocument } from './Quiz';
export type { IFlashcard, FlashcardDocument } from './Flashcard';
export type { IDeck, DeckDocument } from './Deck';
export type { ICard, CardDocument } from './Card';
EOF

# Sample 3: Auth Services Barrel
cat > "$SAMPLES_DIR/backend-services-auth-index.ts" << 'EOF'
/**
 * Authentication Services Barrel Export
 */

export { authService } from './authService';
export { jwtService } from './jwtService';
export { sessionService } from './sessionService';
export { passwordService } from './passwordService';

// Export service interfaces
export type { AuthServiceInterface } from './authService';
export type { JwtServiceInterface } from './jwtService';
export type { SessionServiceInterface } from './sessionService';
export type { PasswordServiceInterface } from './passwordService';
EOF

# Sample 4: Learning Controllers Barrel
cat > "$SAMPLES_DIR/backend-controllers-learning-index.ts" << 'EOF'
/**
 * Learning Controllers Barrel Export
 */

export { lessonController } from './lessonController';
export { courseController } from './courseController';
export { quizController } from './quizController';
export { flashcardController } from './flashcardController';
export { progressController } from './progressController';
EOF

# Sample 5: Utils Barrel
cat > "$SAMPLES_DIR/backend-utils-index.ts" << 'EOF'
/**
 * Utility Functions Barrel Export
 */

// Logging
export { logger } from './logger';

// Validation
export {
  validateEmail,
  validatePassword,
  validateUrl,
  validatePhone,
  validateDate
} from './validation';

// Encryption
export { encrypt, decrypt, hash, compare } from './encryption';

// Date utilities
export {
  formatDate,
  parseDate,
  addDays,
  subtractDays,
  diffDays,
  isExpired
} from './dateUtils';

// String utilities
export {
  sanitize,
  slugify,
  truncate,
  capitalize,
  camelCase,
  kebabCase
} from './stringUtils';

// Array utilities
export {
  chunk,
  unique,
  groupBy,
  sortBy,
  flatten
} from './arrayUtils';

// Object utilities
export {
  pick,
  omit,
  merge,
  clone,
  isEmpty
} from './objectUtils';
EOF

###############################################################################
# Frontend Samples
###############################################################################

# Sample 6: Common Components Barrel
cat > "$SAMPLES_DIR/frontend-components-common-index.ts" << 'EOF'
/**
 * Common Components Barrel Export
 *
 * Shared components used across the application
 */

export { Button } from './Button';
export { Input } from './Input';
export { Card } from './Card';
export { Modal } from './Modal';
export { Dropdown } from './Dropdown';
export { Tabs } from './Tabs';
export { Badge } from './Badge';
export { Avatar } from './Avatar';
export { Spinner } from './Spinner';
export { LoadingState } from './LoadingState';
export { ErrorBoundary } from './ErrorBoundary';
export { EmptyState } from './EmptyState';

// Export component props
export type { ButtonProps } from './Button';
export type { InputProps } from './Input';
export type { CardProps } from './Card';
export type { ModalProps } from './Modal';
export type { DropdownProps } from './Dropdown';
export type { TabsProps } from './Tabs';
EOF

# Sample 7: Layout Components Barrel
cat > "$SAMPLES_DIR/frontend-components-layout-index.ts" << 'EOF'
/**
 * Layout Components Barrel Export
 */

export { Layout } from './Layout';
export { Header } from './Header';
export { Sidebar } from './Sidebar';
export { Footer } from './Footer';
export { Breadcrumbs } from './Breadcrumbs';
export { Navigation } from './Navigation';

// Export component props
export type { LayoutProps } from './Layout';
export type { HeaderProps } from './Header';
export type { SidebarProps } from './Sidebar';
export type { FooterProps } from './Footer';
EOF

# Sample 8: Lessons Components Barrel
cat > "$SAMPLES_DIR/frontend-components-lessons-index.ts" << 'EOF'
/**
 * Lessons Components Barrel Export
 */

export { LessonCard } from './LessonCard';
export { LessonList } from './LessonList';
export { LessonPlayer } from './LessonPlayer';
export { VideoPlayer } from './VideoPlayer';
export { TableOfContents } from './TableOfContents';

// Export component props
export type { LessonCardProps } from './LessonCard';
export type { LessonListProps } from './LessonList';
export type { LessonPlayerProps } from './LessonPlayer';
export type { VideoPlayerProps } from './VideoPlayer';
EOF

# Sample 9: Auth Pages Barrel
cat > "$SAMPLES_DIR/frontend-pages-auth-index.ts" << 'EOF'
/**
 * Authentication Pages Barrel Export
 */

export { LoginPage } from './LoginPage';
export { RegisterPage } from './RegisterPage';
export { ForgotPasswordPage } from './ForgotPasswordPage';
export { ResetPasswordPage } from './ResetPasswordPage';
export { SSOCallbackPage } from './SSOCallbackPage';
EOF

# Sample 10: Stores Barrel
cat > "$SAMPLES_DIR/frontend-stores-index.ts" << 'EOF'
/**
 * Stores Barrel Export (Zustand)
 *
 * All application state stores
 */

export { useAuthStore } from './authStore';
export { useUserStore } from './userStore';
export { useLearningStore } from './learningStore';
export { useProgressStore } from './progressStore';
export { useGamificationStore } from './gamificationStore';
export { useAchievementsStore } from './achievementsStore';
export { useCommunityStore } from './communityStore';
export { useNotificationStore } from './notificationStore';
export { useUIStore } from './uiStore';
export { useSettingsStore } from './settingsStore';

// Export store types
export type { AuthStore } from './authStore';
export type { UserStore } from './userStore';
export type { LearningStore } from './learningStore';
export type { ProgressStore } from './progressStore';
export type { GamificationStore } from './gamificationStore';
EOF

# Sample 11: Hooks Barrel
cat > "$SAMPLES_DIR/frontend-hooks-index.ts" << 'EOF'
/**
 * Custom Hooks Barrel Export
 */

// Data hooks
export { useAuth } from './useAuth';
export { useUser } from './useUser';
export { useProgress } from './useProgress';
export { useLesson } from './useLesson';
export { useQuiz } from './useQuiz';

// Utility hooks
export { useDebounce } from './useDebounce';
export { useThrottle } from './useThrottle';
export { useLocalStorage } from './useLocalStorage';
export { useSessionStorage } from './useSessionStorage';
export { useMediaQuery } from './useMediaQuery';
export { useIntersectionObserver } from './useIntersectionObserver';
export { useWebSocket } from './useWebSocket';
export { useNotifications } from './useNotifications';
EOF

# Sample 12: Services Barrel
cat > "$SAMPLES_DIR/frontend-services-index.ts" << 'EOF'
/**
 * API Services Barrel Export
 */

export { apiClient } from './api';
export { authService } from './authService';
export { userService } from './userService';
export { lessonService } from './lessonService';
export { courseService } from './courseService';
export { quizService } from './quizService';
export { flashcardService } from './flashcardService';
export { progressService } from './progressService';
export { achievementService } from './achievementService';
export { communityService } from './communityService';
EOF

# Sample 13: Master Models Barrel (Backend)
cat > "$SAMPLES_DIR/backend-models-index.ts" << 'EOF'
/**
 * Models Master Barrel Export
 *
 * Re-exports all domain models for convenience.
 * Use domain-specific imports for better tree-shaking.
 *
 * @example
 * ```typescript
 * // Preferred (better tree-shaking)
 * import { User } from '@/models/user';
 *
 * // Also works (but imports more)
 * import { User } from '@/models';
 * ```
 */

// User domain
export * from './user';

// Learning domain
export * from './learning';

// Gamification domain
export * from './gamification';

// Commerce domain
export * from './commerce';

// Enterprise domain
export * from './enterprise';

// Community domain
export * from './community';

// Content domain
export * from './content';

// Marketing domain
export * from './marketing';

// Mentorship domain
export * from './mentorship';

// Analytics domain
export * from './analytics';

// Shared
export * from './shared';
EOF

# Sample 14: Master Components Barrel (Frontend)
cat > "$SAMPLES_DIR/frontend-components-index.ts" << 'EOF'
/**
 * Components Master Barrel Export
 *
 * Re-exports all component categories.
 * Use category-specific imports for better tree-shaking.
 */

export * from './common';
export * from './layout';
export * from './ui';
export * from './ai';
export * from './gamification';
export * from './analytics';
export * from './video';
export * from './lessons';
export * from './quiz';
export * from './flashcards';
export * from './exercises';
export * from './dashboard';
export * from './progress';
export * from './notifications';
export * from './search';
export * from './settings';
export * from './community';
export * from './admin';
export * from './code';
export * from './playground';
export * from './achievements';
export * from './accessibility';
export * from './routes';
EOF

###############################################################################
# Create README
###############################################################################

cat > "$SAMPLES_DIR/README.md" << 'EOF'
# Barrel Export Samples

This folder contains sample `index.ts` barrel export files for reference.

## Backend Samples

- **backend-models-user-index.ts** - User domain models
- **backend-models-learning-index.ts** - Learning domain models
- **backend-services-auth-index.ts** - Auth services
- **backend-controllers-learning-index.ts** - Learning controllers
- **backend-utils-index.ts** - Utility functions
- **backend-models-index.ts** - Master models barrel

## Frontend Samples

- **frontend-components-common-index.ts** - Common components
- **frontend-components-layout-index.ts** - Layout components
- **frontend-components-lessons-index.ts** - Lesson components
- **frontend-pages-auth-index.ts** - Auth pages
- **frontend-stores-index.ts** - State stores
- **frontend-hooks-index.ts** - Custom hooks
- **frontend-services-index.ts** - API services
- **frontend-components-index.ts** - Master components barrel

## Usage

Copy these samples to your actual folders and customize as needed.

Example:
```bash
cp docs/examples/barrel-exports/backend-models-user-index.ts backend/src/models/user/index.ts
```

Then customize the file to match your actual exports.

## Best Practices

1. **Be Explicit**: List each export individually
2. **Group Related Items**: Organize by category
3. **Export Types Separately**: Use `export type` for types
4. **Document**: Add JSDoc comments for public API
5. **Keep Flat**: Avoid nested barrel exports

See BARREL_EXPORTS_GUIDE.md for complete guide.
EOF

echo "✓ Sample barrel export files created in $SAMPLES_DIR"
echo ""
echo "Files created:"
ls -1 "$SAMPLES_DIR"
echo ""
echo "To use these samples:"
echo "1. Review the sample files in docs/examples/barrel-exports/"
echo "2. Copy to your target folders"
echo "3. Customize to match your actual exports"
echo "4. See BARREL_EXPORTS_GUIDE.md for more details"
