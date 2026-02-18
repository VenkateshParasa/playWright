# Playwright & Selenium Learning - Mobile App

<div align="center">

![App Icon](./src/assets/images/icon.png)

**Native iOS and Android app for mastering test automation**

[![React Native](https://img.shields.io/badge/React%20Native-0.73-61DAFB?logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-~50.0-000020?logo=expo)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[Features](#features) • [Installation](#installation) • [Documentation](#documentation) • [Contributing](#contributing)

</div>

---

## Overview

The official mobile application for the Playwright & Selenium Learning Platform provides a seamless native experience for iOS and Android users. Learn test automation on the go with interactive lessons, flashcards, quizzes, and coding exercises.

## Features

### 🎓 Learning Features
- **Interactive Lessons**: Video tutorials, code examples, and hands-on exercises
- **Flashcards**: Spaced repetition system for effective memorization
- **Quizzes**: Test your knowledge with interactive assessments
- **Coding Exercises**: Practice with mobile-optimized code editor
- **Progress Tracking**: Monitor your learning journey with detailed statistics
- **Achievements**: Earn badges and unlock milestones

### 📱 Mobile-Optimized
- **Offline Mode**: Download lessons and study without internet
- **Push Notifications**: Reminders for daily goals and new content
- **Biometric Auth**: Face ID, Touch ID, and Fingerprint support
- **Dark Mode**: System-aware theme switching
- **Haptic Feedback**: Tactile responses for better UX
- **Swipe Gestures**: Intuitive navigation and flashcard review

### 🔒 Security & Privacy
- Secure authentication with biometrics
- Encrypted data storage
- HTTPS-only API communication
- Privacy-first design

### ⚡ Performance
- Native performance on iOS and Android
- Optimized image loading and caching
- List virtualization for smooth scrolling
- 60 FPS animations
- App launch time < 3 seconds

## Screenshots

<div align="center">

| Dashboard | Lessons | Flashcards | Quiz |
|-----------|---------|------------|------|
| ![Dashboard](./screenshots/dashboard.png) | ![Lessons](./screenshots/lessons.png) | ![Flashcards](./screenshots/flashcards.png) | ![Quiz](./screenshots/quiz.png) |

</div>

## Tech Stack

### Core
- **React Native**: 0.73.4
- **Expo**: ~50.0.0
- **TypeScript**: 5.3.3
- **React Navigation**: 6.x

### State Management
- **Redux Toolkit**: 2.0.1
- **Redux Persist**: 6.0.0
- **React Query**: 5.17.19

### UI & Animations
- **React Native Reanimated**: 3.6.2
- **React Native Gesture Handler**: 2.14.0
- **React Native Paper**: 5.11.6
- **React Native Vector Icons**: 10.0.3

### Development
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Jest**: Unit testing
- **Detox**: E2E testing

## Installation

### Prerequisites

- **Node.js**: 18+ and npm 9+
- **Expo CLI**: `npm install -g expo-cli eas-cli`
- **iOS**: macOS with Xcode 14+ and CocoaPods
- **Android**: Android Studio and JDK 11+

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd mobile

# Install dependencies
npm install

# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

### Development with Expo Go

1. Install Expo Go on your device ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
2. Start the development server: `npm start`
3. Scan the QR code with your device

## Project Structure

```
mobile/
├── src/
│   ├── components/       # Reusable UI components
│   ├── screens/         # Screen components
│   ├── navigation/      # Navigation configuration
│   ├── store/           # Redux store
│   ├── services/        # API services
│   ├── hooks/           # Custom hooks
│   ├── utils/           # Utility functions
│   ├── constants/       # Constants and config
│   ├── types/           # TypeScript types
│   └── assets/          # Images, fonts, icons
├── tests/               # Test files
├── android/             # Android native code
├── ios/                 # iOS native code
├── App.tsx              # App entry point
├── app.json             # Expo configuration
└── package.json         # Dependencies
```

## Available Scripts

```bash
# Development
npm start                 # Start Metro bundler
npm run ios              # Run on iOS
npm run android          # Run on Android
npm run web              # Run in web browser

# Testing
npm test                 # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
npm run test:e2e         # Run E2E tests

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run type-check       # Run TypeScript compiler
npm run format           # Format code with Prettier

# Building
npm run build:ios        # Build iOS app
npm run build:android    # Build Android app
eas build --platform all # Build both platforms with EAS
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
# API Configuration
API_BASE_URL=https://api.pwlearning.com

# Expo Configuration
EXPO_PROJECT_ID=your-project-id

# Firebase (Optional)
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-auth-domain
FIREBASE_PROJECT_ID=your-project-id

# Sentry (Optional)
SENTRY_DSN=your-sentry-dsn
```

### App Configuration

Edit `app.json` to customize:

```json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.yourcompany.app"
    },
    "android": {
      "package": "com.yourcompany.app"
    }
  }
}
```

## Development

### Code Style

We use ESLint and Prettier for code formatting:

```bash
# Check code style
npm run lint

# Auto-fix issues
npm run lint:fix

# Format all files
npm run format
```

### Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### Debugging

#### React Native Debugger
```bash
# Install
brew install --cask react-native-debugger

# Open app and enable debugging
# iOS: Cmd + D → Debug
# Android: Cmd + M → Debug
```

#### Flipper
Flipper is included for advanced debugging:
- Network inspector
- Layout inspector
- Redux DevTools
- Performance monitor

## Building & Deployment

### Production Build

**iOS**
```bash
# Build with EAS
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

**Android**
```bash
# Build with EAS
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

### Beta Testing

**iOS (TestFlight)**
```bash
eas build --platform ios --profile preview
eas submit --platform ios
```

**Android (Internal Testing)**
```bash
eas build --platform android --profile preview
eas submit --platform android
```

### Over-The-Air Updates

```bash
# Publish update
eas update --branch production --message "Bug fixes"

# View updates
eas update:list --branch production
```

## Documentation

- [Mobile App Guide](../docs/MOBILE_APP_GUIDE.md) - Complete feature documentation
- [Development Guide](../docs/MOBILE_DEVELOPMENT.md) - Development workflow and best practices
- [Deployment Guide](../docs/MOBILE_DEPLOYMENT.md) - Build and deployment instructions
- [Architecture](../docs/MOBILE_APP_ARCHITECTURE.md) - Technical architecture documentation

## Contributing

We welcome contributions! Please see our [Contributing Guide](../CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Review Process

1. All code must pass CI checks
2. At least one approval required
3. All comments must be resolved
4. Squash and merge to main

## Troubleshooting

### Common Issues

**Metro bundler issues**
```bash
npm start -- --reset-cache
```

**iOS build errors**
```bash
cd ios && pod deintegrate && pod install && cd ..
```

**Android build errors**
```bash
cd android && ./gradlew clean && cd ..
```

**Clear all caches**
```bash
rm -rf node_modules
npm install
```

### Getting Help

- 📚 [Documentation](../docs/)
- 💬 [GitHub Discussions](https://github.com/your-org/repo/discussions)
- 🐛 [Issue Tracker](https://github.com/your-org/repo/issues)
- 📧 Email: support@pwlearning.com

## Performance

### Bundle Size
- iOS: ~45MB
- Android: ~48MB
- First load: < 3 seconds

### Benchmarks
- 60 FPS animations
- < 100ms navigation transitions
- < 500ms API response handling

## Security

### Reporting Security Issues

Please report security vulnerabilities to security@pwlearning.com. Do not create public GitHub issues for security problems.

### Security Measures

- Biometric authentication
- Encrypted secure storage
- Certificate pinning
- HTTPS-only communication
- Regular security audits

## Roadmap

### Version 1.1 (Q2 2024)
- [ ] Widgets support (iOS/Android)
- [ ] Share sheet integration
- [ ] Calendar integration
- [ ] Siri shortcuts (iOS)
- [ ] Android App Shortcuts

### Version 1.2 (Q3 2024)
- [ ] iPad split view support
- [ ] Android tablet optimization
- [ ] Offline AI assistant
- [ ] Advanced code editor
- [ ] Video downloads

### Version 2.0 (Q4 2024)
- [ ] Live coding sessions
- [ ] Peer-to-peer learning
- [ ] AR learning experiences
- [ ] Voice commands
- [ ] Multi-language support

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [React Native](https://reactnative.dev/) - The mobile framework
- [Expo](https://expo.dev/) - Development platform
- [React Navigation](https://reactnavigation.org/) - Navigation library
- All our amazing contributors!

## Contact

- **Website**: https://pwlearning.com
- **Email**: support@pwlearning.com
- **Twitter**: [@pwlearning](https://twitter.com/pwlearning)
- **LinkedIn**: [PW Learning](https://linkedin.com/company/pwlearning)

---

<div align="center">

Made with ❤️ by the PW Learning Team

⭐ Star us on GitHub — it helps!

[Website](https://pwlearning.com) • [Blog](https://blog.pwlearning.com) • [Twitter](https://twitter.com/pwlearning)

</div>
