# Mobile App Guide

## Overview

This is the official React Native mobile application for the Playwright & Selenium Learning Platform. It provides a native iOS and Android experience with full feature parity to the web application.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Key Features](#key-features)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Features

### Core Features
- **User Authentication**: Login, registration, password reset with biometric support
- **Dashboard**: Progress overview, current streak, daily goals
- **Lessons**: Browse, search, and view lessons with offline support
- **Flashcards**: Spaced repetition system with swipe gestures
- **Quizzes**: Interactive quiz taking with real-time feedback
- **Coding Exercises**: Mobile code editor with syntax highlighting
- **Progress Tracking**: Track learning progress with charts and statistics
- **Achievements**: Unlock badges and track milestones
- **Notifications**: Push notifications for reminders and updates
- **Settings**: Customize app appearance and behavior

### Mobile-Specific Features
- **Biometric Authentication**: Face ID, Touch ID, Fingerprint support
- **Offline Mode**: Download lessons for offline access
- **Push Notifications**: Stay updated with reminders and achievements
- **Haptic Feedback**: Tactile feedback for actions
- **Dark Mode**: System-aware theme switching
- **Pull-to-Refresh**: Refresh content with pull gesture
- **Swipe Gestures**: Navigate flashcards and content
- **Deep Linking**: Open specific content from notifications
- **Background Sync**: Sync data when app returns to foreground

## Architecture

### Application Architecture
```
┌─────────────────────────────────────────┐
│           React Native App              │
├─────────────────────────────────────────┤
│  Presentation Layer (Screens/Components)│
├─────────────────────────────────────────┤
│  Navigation Layer (React Navigation)    │
├─────────────────────────────────────────┤
│  State Management (Redux + React Query) │
├─────────────────────────────────────────┤
│  Business Logic Layer (Services/Hooks)  │
├─────────────────────────────────────────┤
│  Data Layer (API + AsyncStorage)        │
└─────────────────────────────────────────┘
```

### State Management
- **Redux**: Global state (auth, settings)
- **React Query**: Server state (API data)
- **Local State**: Component-specific state
- **AsyncStorage**: Persistent storage
- **Redux Persist**: Persist Redux state

### Navigation Structure
```
RootNavigator
├── OnboardingScreen (First-time users)
├── AuthNavigator (Unauthenticated)
│   ├── LoginScreen
│   ├── RegisterScreen
│   ├── ForgotPasswordScreen
│   └── ResetPasswordScreen
└── MainNavigator (Authenticated)
    ├── HomeNavigator (Tab)
    │   └── DashboardScreen
    ├── LessonNavigator (Tab)
    │   ├── LessonListScreen
    │   ├── LessonDetailScreen
    │   └── LessonPlayerScreen
    ├── FlashcardNavigator (Tab)
    │   ├── FlashcardListScreen
    │   ├── FlashcardReviewScreen
    │   └── FlashcardStatsScreen
    ├── QuizNavigator (Tab)
    │   ├── QuizListScreen
    │   ├── QuizDetailScreen
    │   ├── QuizTakingScreen
    │   └── QuizResultScreen
    └── ProfileNavigator (Tab)
        ├── ProfileOverviewScreen
        ├── ProgressScreen
        ├── AchievementsScreen
        ├── EditProfileScreen
        └── SettingsScreen
```

## Tech Stack

### Core Technologies
- **React Native**: 0.73.4
- **Expo**: ~50.0.0
- **TypeScript**: 5.3.3
- **React Navigation**: 6.x

### State Management
- **Redux Toolkit**: 2.0.1
- **Redux Persist**: 6.0.0
- **React Query**: 5.17.19

### UI & Styling
- **React Native Paper**: 5.11.6
- **React Native Vector Icons**: 10.0.3
- **React Native Reanimated**: 3.6.2
- **React Native Gesture Handler**: 2.14.0

### Native Features
- **Expo Local Authentication**: Biometric auth
- **Expo Notifications**: Push notifications
- **Expo Camera**: Camera access
- **Expo Image Picker**: Photo selection
- **Expo Secure Store**: Secure storage
- **Expo Haptics**: Haptic feedback

### Networking
- **Axios**: 1.6.5
- **React Query**: Server state management

### Testing
- **Jest**: 29.7.0
- **Testing Library**: 12.4.3
- **Detox**: 20.16.3 (E2E)

### Build & Deployment
- **EAS Build**: Expo Application Services
- **Fastlane**: CI/CD automation
- **CodePush**: OTA updates

## Getting Started

### Prerequisites
- Node.js 18+ and npm 9+
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`
- iOS: Xcode 14+ and CocoaPods
- Android: Android Studio and JDK 11+

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd mobile
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start development server**
```bash
npm start
```

5. **Run on iOS**
```bash
npm run ios
```

6. **Run on Android**
```bash
npm run android
```

### Development Mode Options

**Expo Go (Fastest)**
- Install Expo Go app on your device
- Scan QR code from terminal
- Hot reload enabled

**Development Build**
```bash
# Build development version
eas build --profile development --platform ios
eas build --profile development --platform android
```

**iOS Simulator**
```bash
npm run ios
```

**Android Emulator**
```bash
npm run android
```

## Project Structure

```
mobile/
├── src/
│   ├── components/          # Reusable components
│   │   ├── common/         # Common UI components
│   │   ├── auth/           # Auth-specific components
│   │   ├── lessons/        # Lesson components
│   │   ├── flashcards/     # Flashcard components
│   │   ├── quiz/           # Quiz components
│   │   └── navigation/     # Navigation components
│   ├── screens/            # Screen components
│   │   ├── Auth/           # Authentication screens
│   │   ├── Dashboard/      # Dashboard screens
│   │   ├── Lessons/        # Lesson screens
│   │   ├── Flashcards/     # Flashcard screens
│   │   ├── Quiz/           # Quiz screens
│   │   ├── Exercises/      # Exercise screens
│   │   ├── Profile/        # Profile screens
│   │   └── Settings/       # Settings screens
│   ├── navigation/         # Navigation configuration
│   │   ├── RootNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   ├── MainNavigator.tsx
│   │   └── linking.ts
│   ├── store/              # Redux store
│   │   ├── slices/         # Redux slices
│   │   └── index.ts
│   ├── services/           # API services
│   │   ├── api.ts          # Axios configuration
│   │   ├── auth.service.ts
│   │   ├── lesson.service.ts
│   │   └── notifications.ts
│   ├── hooks/              # Custom hooks
│   │   ├── useAppDispatch.ts
│   │   ├── useNetworkStatus.ts
│   │   └── useBiometrics.ts
│   ├── utils/              # Utility functions
│   │   ├── storage.ts
│   │   ├── validation.ts
│   │   ├── date.ts
│   │   └── helpers.ts
│   ├── constants/          # Constants and config
│   │   ├── index.ts
│   │   └── theme.ts
│   ├── types/              # TypeScript types
│   │   └── index.ts
│   └── assets/             # Static assets
│       ├── images/
│       ├── fonts/
│       └── icons/
├── tests/                  # Test files
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   └── e2e/               # E2E tests
├── android/               # Android native code
├── ios/                   # iOS native code
├── fastlane/              # Fastlane configuration
├── .github/               # GitHub workflows
├── App.tsx                # App entry point
├── app.json               # Expo configuration
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
└── README.md              # This file
```

## Key Features Implementation

### 1. Authentication

**Login with Biometrics**
```typescript
import { useBiometrics } from '@hooks';

const { authenticate } = useBiometrics();

const handleBiometricLogin = async () => {
  const success = await authenticate('Login with biometrics');
  if (success) {
    // Auto-login
  }
};
```

**Social Login** (Future)
- Google Sign-In
- Apple Sign-In
- Facebook Login

### 2. Offline Mode

**Download Lessons**
```typescript
import { lessonService } from '@services';

const downloadLesson = async (lessonId: string) => {
  const blob = await lessonService.downloadLesson(lessonId);
  await FileSystem.writeAsStringAsync(
    `${FileSystem.documentDirectory}lessons/${lessonId}.json`,
    JSON.stringify(blob)
  );
};
```

**Sync Queue**
- Actions queued when offline
- Synced when connection restored
- Conflict resolution

### 3. Push Notifications

**Setup**
```typescript
import { useNotifications } from '@services';

const { requestPermission, scheduleLocalNotification } = useNotifications();

await requestPermission();
await scheduleLocalNotification(
  'Daily Reminder',
  'Time to study!',
  { hour: 9, minute: 0 }
);
```

**Notification Types**
- Daily reminders
- Achievement unlocks
- Lesson updates
- Streak reminders
- Quiz availability

### 4. Haptic Feedback

**Usage**
```typescript
import * as Haptics from 'expo-haptics';

// Success feedback
Haptics.notificationAsync(
  Haptics.NotificationFeedbackType.Success
);

// Error feedback
Haptics.notificationAsync(
  Haptics.NotificationFeedbackType.Error
);

// Selection feedback
Haptics.selectionAsync();
```

### 5. Dark Mode

**Implementation**
```typescript
import { useTheme } from '@constants/theme';

const theme = useTheme(); // Auto-detects system preference

// Use theme colors
<View style={{ backgroundColor: theme.colors.background }} />
```

## Development

### Running the App

**Development Server**
```bash
npm start
```

**iOS Simulator**
```bash
npm run ios
```

**Android Emulator**
```bash
npm run android
```

**Web Browser**
```bash
npm run web
```

### Code Quality

**Type Checking**
```bash
npm run type-check
```

**Linting**
```bash
npm run lint
npm run lint:fix
```

**Formatting**
```bash
npm run format
```

### State Management

**Redux Usage**
```typescript
import { useAppDispatch, useAppSelector } from '@hooks';
import { login } from '@store/slices/authSlice';

const dispatch = useAppDispatch();
const { user, isAuthenticated } = useAppSelector(state => state.auth);

// Dispatch action
dispatch(login({ email, password }));
```

**React Query Usage**
```typescript
import { useQuery } from '@tanstack/react-query';
import { lessonService } from '@services';

const { data, isLoading, error } = useQuery({
  queryKey: ['lessons'],
  queryFn: () => lessonService.getLessons(),
});
```

## Testing

### Unit Tests
```bash
npm run test
npm run test:watch
npm run test:coverage
```

### E2E Tests
```bash
# Build for testing
npm run test:e2e:build:ios
npm run test:e2e:build:android

# Run E2E tests
npm run test:e2e
```

### Test Structure
```typescript
describe('LoginScreen', () => {
  it('should login successfully', async () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Sign In'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('Main');
    });
  });
});
```

## Deployment

### Building for Production

**iOS**
```bash
# Build for App Store
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

**Android**
```bash
# Build for Play Store
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

### Over-The-Air Updates

**Publish Update**
```bash
expo publish --release-channel production
```

**Configure CodePush**
```bash
appcenter codepush release-react -a Organization/App -d Production
```

### CI/CD with Fastlane

**iOS Beta**
```bash
fastlane ios beta
```

**Android Beta**
```bash
fastlane android beta
```

### App Store Requirements

**iOS**
- App Store Connect account
- Apple Developer Program membership ($99/year)
- Provisioning profiles and certificates
- Privacy policy URL
- App screenshots (multiple sizes)

**Android**
- Google Play Console account ($25 one-time)
- Signed APK or AAB
- Privacy policy URL
- Feature graphic and screenshots
- Content rating

## Troubleshooting

### Common Issues

**Metro Bundler Issues**
```bash
# Clear cache
npm start -- --reset-cache

# Clean install
rm -rf node_modules
npm install
```

**iOS Build Errors**
```bash
cd ios
pod deintegrate
pod install
cd ..
```

**Android Build Errors**
```bash
cd android
./gradlew clean
cd ..
```

**Expo Issues**
```bash
expo doctor
expo upgrade
```

### Performance Optimization

1. **Image Optimization**
   - Use FastImage for images
   - Implement lazy loading
   - Compress images

2. **List Performance**
   - Use FlatList with proper keys
   - Implement virtualization
   - Memoize list items

3. **Bundle Size**
   - Analyze bundle: `npx react-native-bundle-visualizer`
   - Remove unused dependencies
   - Use dynamic imports

4. **Memory Management**
   - Clean up listeners in useEffect
   - Avoid memory leaks
   - Profile with React DevTools

### Debug Tools

**React Native Debugger**
```bash
# Install
brew install --cask react-native-debugger

# Use with app
# Shake device → Debug → Enable Remote JS Debugging
```

**Flipper**
- Network inspector
- Layout inspector
- Redux DevTools
- Performance monitor

## Support

For issues, questions, or contributions:
- GitHub Issues: <repository-url>/issues
- Documentation: <docs-url>
- Email: support@pwlearning.com

## License

Copyright © 2024 Playwright & Selenium Learning Platform
