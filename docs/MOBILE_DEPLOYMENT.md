# Mobile App Deployment Guide

## Overview

This guide covers the complete deployment process for both iOS and Android platforms, including app store submission, OTA updates, and CI/CD setup.

## Table of Contents

- [Prerequisites](#prerequisites)
- [iOS Deployment](#ios-deployment)
- [Android Deployment](#android-deployment)
- [Over-The-Air Updates](#over-the-air-updates)
- [CI/CD Setup](#cicd-setup)
- [Version Management](#version-management)
- [App Store Guidelines](#app-store-guidelines)
- [Monitoring](#monitoring)
- [Rollback Strategy](#rollback-strategy)

## Prerequisites

### Required Accounts

**iOS**
- Apple Developer Account ($99/year)
- App Store Connect access
- Apple ID with 2FA enabled

**Android**
- Google Play Console account ($25 one-time)
- Google Account

**Expo**
- Expo account (free)
- EAS subscription (optional, for advanced features)

### Required Tools
```bash
# Expo CLI
npm install -g expo-cli eas-cli

# Fastlane
brew install fastlane

# App Center CLI (for CodePush)
npm install -g appcenter-cli
```

## iOS Deployment

### 1. Certificates and Provisioning

**Using EAS (Recommended)**
```bash
# Configure credentials
eas credentials

# Build production
eas build --platform ios --profile production
```

**Manual Setup**
1. Create App ID in Apple Developer Portal
2. Generate certificates
3. Create provisioning profiles
4. Add to Xcode

### 2. App Store Connect Setup

**Create App Listing**
1. Log in to App Store Connect
2. Click "My Apps" → "+" → "New App"
3. Fill in app information:
   - Name: "Playwright & Selenium Learning"
   - Primary Language: English
   - Bundle ID: com.pwlearning.app
   - SKU: PWLEARN001

**App Information**
```yaml
Name: Playwright & Selenium Learning
Subtitle: Master Test Automation
Category: Education
Privacy Policy URL: https://pwlearning.com/privacy
Support URL: https://pwlearning.com/support
Marketing URL: https://pwlearning.com
```

**Version Information**
```yaml
Version: 1.0.0
Copyright: 2024 PW Learning Inc.
Age Rating: 4+
```

### 3. App Store Screenshots

**Required Sizes**
- 6.7" (iPhone 14 Pro Max): 1290 x 2796 px
- 6.5" (iPhone 11 Pro Max): 1242 x 2688 px
- 5.5" (iPhone 8 Plus): 1242 x 2208 px
- 12.9" iPad Pro: 2048 x 2732 px

**Screenshot Guidelines**
```typescript
// Use react-native-screenshot
import { captureScreen } from 'react-native-view-shot';

const generateScreenshots = async () => {
  const screenshots = [
    'dashboard',
    'lessons',
    'flashcards',
    'quiz',
    'profile',
  ];

  for (const screen of screenshots) {
    await captureScreen({
      format: 'png',
      quality: 1.0,
    });
  }
};
```

### 4. Build and Submit

**Build for App Store**
```bash
# Using EAS
eas build --platform ios --profile production

# Wait for build to complete
# Download IPA from EAS dashboard
```

**Submit to App Store**
```bash
# Using EAS
eas submit --platform ios

# Or using Fastlane
fastlane ios release
```

**Fastlane Configuration**
```ruby
# fastlane/Fastfile
platform :ios do
  desc "Upload to App Store"
  lane :release do
    # Increment build number
    increment_build_number(
      build_number: latest_testflight_build_number + 1
    )

    # Build app
    build_app(
      scheme: "PlaywrightSeleniumLearning",
      export_method: "app-store",
      output_directory: "./build"
    )

    # Upload to App Store
    upload_to_app_store(
      skip_metadata: false,
      skip_screenshots: false,
      submit_for_review: true,
      automatic_release: false,
      submission_information: {
        add_id_info_uses_idfa: false
      }
    )
  end

  desc "Upload to TestFlight"
  lane :beta do
    build_app(
      scheme: "PlaywrightSeleniumLearning",
      export_method: "app-store"
    )

    upload_to_testflight(
      skip_waiting_for_build_processing: true
    )
  end
end
```

### 5. TestFlight Beta

**Setup Beta Testing**
```bash
# Build and upload
eas build --platform ios --profile preview
eas submit --platform ios --latest

# Or with Fastlane
fastlane ios beta
```

**Add Beta Testers**
1. Open App Store Connect
2. Go to TestFlight tab
3. Add internal/external testers
4. Send invitation

### 6. App Review Process

**Review Information**
```yaml
Contact Information:
  First Name: John
  Last Name: Doe
  Phone: +1 234 567 8900
  Email: review@pwlearning.com

Demo Account (if required):
  Username: demo@pwlearning.com
  Password: Demo123!@#

Notes:
  - App requires network connection
  - Some features require authentication
  - Push notifications are optional
```

**Common Rejection Reasons**
- Incomplete app information
- Missing privacy policy
- Crashes on launch
- Broken features
- Guidelines violations

## Android Deployment

### 1. Signing Configuration

**Generate Keystore**
```bash
# Generate release keystore
keytool -genkeypair -v -storetype PKCS12 \
  -keystore pwlearning-release.keystore \
  -alias pwlearning-key \
  -keyalg RSA -keysize 2048 -validity 10000

# Store credentials securely
# Never commit keystore to version control
```

**Configure Gradle**
```gradle
// android/app/build.gradle
android {
  signingConfigs {
    release {
      if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
        storeFile file(MYAPP_RELEASE_STORE_FILE)
        storePassword MYAPP_RELEASE_STORE_PASSWORD
        keyAlias MYAPP_RELEASE_KEY_ALIAS
        keyPassword MYAPP_RELEASE_KEY_PASSWORD
      }
    }
  }

  buildTypes {
    release {
      signingConfig signingConfigs.release
      minifyEnabled true
      shrinkResources true
      proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
  }
}
```

**Gradle Properties** (android/gradle.properties)
```properties
MYAPP_RELEASE_STORE_FILE=pwlearning-release.keystore
MYAPP_RELEASE_KEY_ALIAS=pwlearning-key
MYAPP_RELEASE_STORE_PASSWORD=***
MYAPP_RELEASE_KEY_PASSWORD=***
```

### 2. Google Play Console Setup

**Create App**
1. Log in to Google Play Console
2. Click "Create app"
3. Fill in details:
   - App name: Playwright & Selenium Learning
   - Default language: English (US)
   - App or game: App
   - Free or paid: Free

**App Dashboard**
```yaml
App Details:
  App name: Playwright & Selenium Learning
  Short description: Master test automation
  Full description: |
    Learn Playwright and Selenium with interactive lessons,
    flashcards, and quizzes. Track your progress and earn
    achievements as you master test automation.

  Category: Education
  Tags: Education, E-Learning, Programming
  Email: support@pwlearning.com
  Privacy policy: https://pwlearning.com/privacy
```

**Store Listing Assets**
- App icon: 512 x 512 px (PNG)
- Feature graphic: 1024 x 500 px (PNG/JPG)
- Phone screenshots: At least 2, up to 8 (16:9 or 9:16)
- Tablet screenshots: Optional, up to 8
- TV banner: 1280 x 720 px (if applicable)

### 3. Content Rating

**Questionnaire**
```yaml
Violence: No
Sexual Content: No
Profanity: No
Drugs: No
Gambling: No
User Interaction: Yes (Users can interact)
Shares Location: No
Personal Information: Yes (Email, username)
```

### 4. Build and Submit

**Build AAB**
```bash
# Using EAS
eas build --platform android --profile production

# Or using Gradle
cd android
./gradlew bundleRelease

# Output: android/app/build/outputs/bundle/release/app-release.aab
```

**Submit to Play Store**
```bash
# Using EAS
eas submit --platform android

# Or using Fastlane
fastlane android release
```

**Fastlane Configuration**
```ruby
# fastlane/Fastfile
platform :android do
  desc "Upload to Google Play"
  lane :release do
    # Build AAB
    gradle(
      task: "bundle",
      build_type: "Release",
      project_dir: "android/"
    )

    # Upload to Play Store
    upload_to_play_store(
      track: 'production',
      release_status: 'draft',
      aab: 'android/app/build/outputs/bundle/release/app-release.aab',
      skip_upload_metadata: false,
      skip_upload_images: false,
      skip_upload_screenshots: false
    )
  end

  desc "Upload to Play Store Beta"
  lane :beta do
    gradle(
      task: "bundle",
      build_type: "Release",
      project_dir: "android/"
    )

    upload_to_play_store(
      track: 'beta',
      aab: 'android/app/build/outputs/bundle/release/app-release.aab'
    )
  end
end
```

### 5. Internal Testing

**Setup Internal Testing**
1. Go to Testing → Internal testing
2. Create new release
3. Upload AAB
4. Add testers via email list
5. Save and review

**Beta Testing**
1. Go to Testing → Closed testing
2. Create new track
3. Upload AAB
4. Add testers
5. Publish

### 6. Production Release

**Release Types**
- Full rollout: 100% of users
- Staged rollout: Gradual increase (5% → 20% → 50% → 100%)
- Managed release: Control release timing

**Create Production Release**
```bash
# Complete all store listing requirements
# Upload final AAB
# Submit for review
```

## Over-The-Air Updates

### Expo Updates

**Configure Updates**
```json
// app.json
{
  "expo": {
    "updates": {
      "enabled": true,
      "fallbackToCacheTimeout": 0,
      "url": "https://u.expo.dev/[project-id]"
    },
    "runtimeVersion": {
      "policy": "sdkVersion"
    }
  }
}
```

**Publish Update**
```bash
# Build and publish
eas update --branch production --message "Fix critical bug"

# Publish to specific channel
eas update --branch staging --message "Staging update"
```

**Update Strategy**
```typescript
// App.tsx
import * as Updates from 'expo-updates';

useEffect(() => {
  const checkForUpdates = async () => {
    try {
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();

        // Prompt user or reload automatically
        Alert.alert(
          'Update Available',
          'A new version is available. Restart to apply.',
          [
            { text: 'Later', style: 'cancel' },
            {
              text: 'Restart',
              onPress: () => Updates.reloadAsync(),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  };

  checkForUpdates();
}, []);
```

### CodePush (Alternative)

**Setup CodePush**
```bash
# Install App Center CLI
npm install -g appcenter-cli

# Login
appcenter login

# Create apps
appcenter apps create -d PWLearning-iOS -o iOS -p React-Native
appcenter apps create -d PWLearning-Android -o Android -p React-Native
```

**Release Update**
```bash
# iOS
appcenter codepush release-react \
  -a Organization/PWLearning-iOS \
  -d Production \
  -m --description "Bug fixes"

# Android
appcenter codepush release-react \
  -a Organization/PWLearning-Android \
  -d Production \
  -m --description "Bug fixes"
```

## CI/CD Setup

### GitHub Actions

**Complete Workflow**
```yaml
# .github/workflows/mobile-deploy.yml
name: Mobile Deployment

on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  deploy-ios:
    name: Deploy iOS
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          cd mobile
          npm ci

      - name: Setup EAS
        uses: expo/expo-github-action@v8
        with:
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Build iOS
        run: |
          cd mobile
          eas build --platform ios --profile production --non-interactive

      - name: Submit to App Store
        run: |
          cd mobile
          eas submit --platform ios --latest --non-interactive

  deploy-android:
    name: Deploy Android
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          cd mobile
          npm ci

      - name: Setup EAS
        uses: expo/expo-github-action@v8
        with:
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Build Android
        run: |
          cd mobile
          eas build --platform android --profile production --non-interactive

      - name: Submit to Play Store
        run: |
          cd mobile
          eas submit --platform android --latest --non-interactive
```

## Version Management

### Semantic Versioning

**Version Format**: MAJOR.MINOR.PATCH (e.g., 1.2.3)

- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes

**Version Update**
```bash
# Update version in package.json
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.0 → 1.1.0
npm version major  # 1.0.0 → 2.0.0
```

**Update app.json**
```json
{
  "expo": {
    "version": "1.0.1",
    "ios": {
      "buildNumber": "2"
    },
    "android": {
      "versionCode": 2
    }
  }
}
```

### Build Numbers

**iOS**
- Increments with each build
- Can be same version with different build numbers
- Example: 1.0.0 (1), 1.0.0 (2)

**Android**
- versionCode must increment
- versionName for display
- Example: versionCode 2, versionName "1.0.1"

## App Store Guidelines

### iOS App Store

**Required**
- Privacy policy
- Terms of service
- App description
- Keywords
- Screenshots
- App icon
- Support URL
- Copyright

**Guidelines**
- No crashes
- No private API usage
- Accurate description
- Appropriate age rating
- Functional demo account

### Google Play Store

**Required**
- Privacy policy
- App description
- Category
- Content rating
- Screenshots
- Feature graphic
- App icon

**Guidelines**
- No malware
- No copyright infringement
- Accurate representation
- Proper permissions usage
- Working functionality

## Monitoring

### Crash Reporting

**Sentry**
```typescript
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: __DEV__ ? 'development' : 'production',
  tracesSampleRate: 1.0,
});
```

**Firebase Crashlytics**
```typescript
import crashlytics from '@react-native-firebase/crashlytics';

// Log errors
crashlytics().recordError(error);

// Log custom events
crashlytics().log('User completed lesson');
```

### Analytics

**Firebase Analytics**
```typescript
import analytics from '@react-native-firebase/analytics';

// Log events
await analytics().logEvent('lesson_completed', {
  lesson_id: '123',
  duration: 300,
});
```

## Rollback Strategy

### iOS Rollback
1. Remove app from sale (temporary)
2. Submit previous version
3. Expedited review request
4. Re-enable when approved

### Android Rollback
1. Go to Production track
2. Click "Release" → "Create new release"
3. Select previous APK/AAB
4. Halt current rollout
5. Release previous version

### OTA Rollback
```bash
# Expo Updates
eas update:rollback --branch production

# CodePush
appcenter codepush rollback \
  -a Organization/App \
  -d Production
```

## Best Practices

1. **Test Thoroughly**: Test on real devices before release
2. **Beta Testing**: Use TestFlight/Internal Testing
3. **Staged Rollout**: Release to small percentage first
4. **Monitor Metrics**: Watch crash rate and user feedback
5. **Version Control**: Tag releases in git
6. **Documentation**: Keep changelog updated
7. **Backup**: Store keystores and certificates securely
8. **Communication**: Notify users of major changes

## Checklist

### Pre-Release
- [ ] All tests passing
- [ ] No critical bugs
- [ ] Performance optimized
- [ ] Screenshots updated
- [ ] Store listing complete
- [ ] Privacy policy updated
- [ ] Version numbers updated
- [ ] Changelog prepared

### Release
- [ ] Build successful
- [ ] Submitted to stores
- [ ] Beta tested
- [ ] Monitoring enabled
- [ ] Team notified
- [ ] Documentation updated

### Post-Release
- [ ] Monitor crash rate
- [ ] Check user reviews
- [ ] Track metrics
- [ ] Respond to feedback
- [ ] Plan next release

## Support

For deployment issues:
- Email: devops@pwlearning.com
- Slack: #mobile-deployments
- Documentation: https://docs.pwlearning.com
