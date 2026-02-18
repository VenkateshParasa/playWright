# PWA Implementation Guide

## Overview

This document describes the Progressive Web App (PWA) implementation for the Test Automation Academy learning platform. The PWA features enable offline functionality, app installation, background sync, and native app-like experience.

## Features Implemented

### 1. Service Worker (Section 5.1)

#### Workbox Configuration
- **Location**: `frontend/vite.config.ts`
- **Cache Strategies**:
  - **Cache-First**: Static assets (fonts, images, code examples)
  - **Network-First**: API calls, flashcard data
  - **Stale-While-Revalidate**: Lesson content
- **Cache Versioning**: `test-automation-academy-v1`
- **Cache Cleanup**: Automatic cleanup of outdated caches
- **Maximum File Size**: 5MB per cached file

#### Service Worker Registration
- **Location**: `frontend/src/registerServiceWorker.ts`
- **Features**:
  - Automatic registration in production
  - Update detection and notification
  - Offline ready events
  - Background sync support
  - Message passing between SW and client

#### Offline Fallback
- **Location**: `frontend/public/offline.html`
- **Features**:
  - Beautiful standalone offline page
  - Lists available offline features
  - Auto-reconnect detection
  - Animated UI elements

### 2. PWA Installation (Section 5.4)

#### Web App Manifest
- **Location**: `frontend/public/manifest.json`
- **Features**:
  - App metadata (name, description, theme)
  - Multiple icon sizes (72x72 to 512x512)
  - App shortcuts to key features
  - Share target configuration
  - Screenshots for app stores
  - Standalone display mode

#### Install Prompt Component
- **Location**: `frontend/src/components/InstallPrompt.tsx`
- **Features**:
  - Custom installation UI
  - Platform detection (mobile/desktop)
  - Installation benefits display
  - Session-based dismissal
  - Links to platform-specific instructions

#### Installation Instructions
- **Location**: `frontend/src/components/InstallInstructions.tsx`
- **Features**:
  - Platform-specific guides (iOS, Android, Chrome, Edge)
  - Step-by-step instructions with icons
  - Platform selector
  - Troubleshooting tips
  - Beautiful modal UI

### 3. Update Notification

- **Location**: `frontend/src/components/UpdateNotification.tsx`
- **Features**:
  - Alerts when new version available
  - One-click update with reload
  - Dismissible notification
  - Loading state during update

### 4. Network Monitoring

- **Location**: `frontend/src/lib/networkMonitor.ts`
- **Features**:
  - Online/offline detection
  - Connection type detection (2G, 3G, 4G)
  - Slow connection warning
  - Network status hook (`useNetworkStatus`)
  - Visual network indicator component
  - Offline request queue

### 5. PWA Utilities

- **Location**: `frontend/src/lib/pwa-utils.ts`
- **Features**:
  - Capability detection (standalone, installable, etc.)
  - Platform and browser detection
  - Network status utilities
  - Storage quota estimation
  - Persistent storage request
  - Share API support
  - Clipboard API
  - Wake Lock API
  - Badging API

### 6. PWA Status Component

- **Location**: `frontend/src/components/PWAStatus.tsx`
- **Features**:
  - Installation status display
  - Network information
  - Platform details
  - Storage usage visualization
  - Feature support matrix
  - Cache management
  - Service worker controls

## File Structure

```
frontend/
├── public/
│   ├── offline.html              # Offline fallback page
│   ├── manifest.json             # Web app manifest
│   └── icons/                    # App icons (multiple sizes)
├── src/
│   ├── registerServiceWorker.ts # SW registration logic
│   ├── components/
│   │   ├── UpdateNotification.tsx    # Update alert
│   │   ├── InstallPrompt.tsx         # Install prompt UI
│   │   ├── InstallInstructions.tsx   # Platform instructions
│   │   └── PWAStatus.tsx             # PWA diagnostics
│   ├── lib/
│   │   ├── pwa-utils.ts          # PWA utility functions
│   │   └── networkMonitor.ts     # Network monitoring
│   ├── main.tsx                  # SW registration on startup
│   └── App.tsx                   # PWA components integration
└── vite.config.ts                # Workbox configuration
```

## Usage

### Installation

The PWA is automatically configured through Vite PWA plugin. No additional installation needed.

```bash
npm install
npm run dev    # Development with SW enabled
npm run build  # Production build with optimized SW
```

### Development

Service worker is enabled in development mode via `devOptions` in `vite.config.ts`. This allows testing PWA features without building.

### Testing Offline Mode

1. Open the app in Chrome DevTools
2. Go to Application > Service Workers
3. Check "Offline" checkbox
4. Navigate the app to see cached content
5. Try making API calls to see offline queue

### Updating the Cache

To update the cache version and force cache cleanup:

1. Edit `vite.config.ts`
2. Change `cacheId` to new version (e.g., `'test-automation-academy-v2'`)
3. Rebuild the app
4. Service worker will clean up old caches automatically

## Caching Strategies

### Cache-First (Static Assets)
- **Use Case**: Fonts, images, code examples
- **Behavior**: Serve from cache, fall back to network
- **Expiration**: 30 days to 1 year
- **Max Entries**: 10-100 items

### Network-First (API Calls)
- **Use Case**: Dynamic data, user progress, flashcards
- **Behavior**: Try network first, fall back to cache
- **Timeout**: 10 seconds
- **Expiration**: 24 hours
- **Max Entries**: 150-200 items

### Stale-While-Revalidate (Lesson Content)
- **Use Case**: Content that updates occasionally
- **Behavior**: Serve from cache, update in background
- **Expiration**: 7 days
- **Max Entries**: 50 items

## Background Sync

### Offline Request Queue

When network is unavailable, failed requests are queued:

```typescript
import { offlineQueue } from './lib/networkMonitor';

// Add request to queue
await offlineQueue.add('/api/progress', 'POST', { lessonId: 1 });

// Queue processes automatically when back online
```

### Manual Queue Management

```typescript
// Check queue status
const status = offlineQueue.getStatus();
console.log(`${status.count} requests pending`);

// Process queue manually
await offlineQueue.processQueue();

// Clear queue
await offlineQueue.clear();
```

## Installation Prompts

### Automatic Prompt

The install prompt appears automatically:
- After 3 seconds on the page
- Only if not already installed
- Only if not dismissed in current session

### Manual Prompt

Users can trigger installation from Settings page or via the install button in the prompt.

### Platform Detection

The app detects the user's platform and shows appropriate instructions:
- iOS Safari: Share button → Add to Home Screen
- Android Chrome: Menu → Install app
- Desktop Chrome: Address bar icon or menu
- Desktop Edge: Settings → Apps → Install

## Service Worker Lifecycle

### Registration
1. Service worker registered on app load (production only)
2. Installation begins automatically
3. `onOfflineReady` event fired when ready

### Updates
1. New version detected (check every hour + on visibility change)
2. `onNeedRefresh` event fired
3. User sees update notification
4. User clicks "Update Now"
5. `updateServiceWorker()` called
6. Page reloads with new version

### Manual Control

```typescript
import {
  registerServiceWorker,
  updateServiceWorker,
  unregisterServiceWorker,
  isServiceWorkerActive,
} from './registerServiceWorker';

// Check if SW is active
const active = isServiceWorkerActive();

// Force update
updateServiceWorker();

// Unregister (for debugging)
await unregisterServiceWorker();
```

## Network Indicator

Visual indicator shows network status:

```tsx
import { NetworkIndicator } from './lib/networkMonitor';

<NetworkIndicator position="top" showWhenOnline={false} />
```

Options:
- `position`: 'top' or 'bottom'
- `showWhenOnline`: Show indicator when connection is slow

## PWA Capabilities Detection

```typescript
import { getPWACapabilities } from './lib/pwa-utils';

const capabilities = getPWACapabilities();

console.log({
  isStandalone: capabilities.isStandalone,
  isInstallable: capabilities.isInstallable,
  serviceWorker: capabilities.serviceWorker,
  pushNotifications: capabilities.pushNotifications,
  backgroundSync: capabilities.backgroundSync,
  platform: capabilities.platform,
  browser: capabilities.browser,
});
```

## Storage Management

### Check Storage Quota

```typescript
import { estimateStorageQuota, formatBytes } from './lib/pwa-utils';

const { usage, quota, percentUsed } = await estimateStorageQuota();
console.log(`Using ${formatBytes(usage)} of ${formatBytes(quota)}`);
```

### Request Persistent Storage

```typescript
import { requestPersistentStorage, isPersisted } from './lib/pwa-utils';

const persisted = await isPersisted();
if (!persisted) {
  await requestPersistentStorage();
}
```

### Clear Cache

```typescript
// Clear all caches
const cacheNames = await caches.keys();
await Promise.all(cacheNames.map(name => caches.delete(name)));
```

## Testing

### PWA Audit

1. Build the production app: `npm run build`
2. Serve it: `npm run preview`
3. Open Chrome DevTools
4. Go to Lighthouse tab
5. Run PWA audit
6. Check for 100% score

### Manual Testing Checklist

- [ ] App installs correctly on mobile
- [ ] App installs correctly on desktop
- [ ] Offline page displays when offline
- [ ] Cached pages load offline
- [ ] Network indicator shows status
- [ ] Update notification appears on new version
- [ ] Background sync works when reconnecting
- [ ] App shortcuts work (long-press icon)
- [ ] Share target works (if supported)
- [ ] Service worker updates correctly

## Troubleshooting

### Service Worker Not Registering

1. Check browser support (Chrome, Firefox, Safari, Edge)
2. Verify HTTPS (required except localhost)
3. Check console for registration errors
4. Clear application data and retry

### Cache Not Updating

1. Change `cacheId` in `vite.config.ts`
2. Clear browser cache
3. Unregister service worker
4. Hard refresh (Ctrl+Shift+R)

### Install Prompt Not Showing

1. Check if already installed
2. Verify manifest.json is served correctly
3. Check browser support for `beforeinstallprompt`
4. Wait 3 seconds after page load
5. Check session storage for dismissal

### Offline Features Not Working

1. Verify service worker is active
2. Check cache storage in DevTools
3. Verify network requests are being intercepted
4. Check workbox configuration

## Best Practices

1. **Cache Versioning**: Update cache version with each deployment
2. **Cache Size**: Keep cache under 50MB total
3. **Update Frequency**: Check for updates on app launch and focus
4. **User Control**: Let users clear cache and disable offline features
5. **Error Handling**: Always provide offline fallback for critical features
6. **Network Detection**: Adapt UI based on connection quality
7. **Background Sync**: Queue all mutations when offline
8. **Storage Quota**: Monitor and warn users before running out of space

## Browser Support

- **Chrome/Edge**: Full support ✅
- **Firefox**: Full support ✅
- **Safari**: Partial support (iOS 11.3+) ⚠️
- **Opera**: Full support ✅

## Performance Impact

- **Service Worker**: ~20KB gzipped
- **Workbox Runtime**: ~50KB gzipped
- **Cache Storage**: Dynamic based on usage
- **Initial Load**: Minimal impact (<100ms)
- **Navigation**: Faster after first visit

## Security Considerations

1. HTTPS required for service workers
2. Cache only public/non-sensitive data
3. Validate cached responses before use
4. Implement cache expiration
5. Clear sensitive data on logout
6. Use SameSite cookies for API calls

## Future Enhancements

- [ ] Push notifications for review reminders
- [ ] Periodic background sync for content updates
- [ ] Web Share Target for sharing notes
- [ ] File System Access API for exports
- [ ] Advanced caching strategies
- [ ] Predictive prefetching
- [ ] Cache analytics and metrics
- [ ] A/B testing for install prompts

## Resources

- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [Web.dev PWA](https://web.dev/progressive-web-apps/)
- [PWA Builder](https://www.pwabuilder.com/)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
