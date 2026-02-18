# Notification System Documentation

## Overview

A comprehensive, real-time notification system for the Playwright & Selenium Learning Platform with support for in-app notifications, push notifications, and email notifications.

## Features

### Core Features
- ✅ In-app notification center with real-time updates
- ✅ Multiple notification types (SRS reviews, lessons, quizzes, achievements, etc.)
- ✅ Priority levels (urgent, high, medium, low)
- ✅ Mark as read/unread functionality
- ✅ Archive and delete notifications
- ✅ Notification history with filters
- ✅ Batch operations (mark all as read, delete, etc.)
- ✅ Search and filter notifications
- ✅ Notification preferences and settings
- ✅ Browser push notifications (optional)
- ✅ Notification sounds (optional)
- ✅ Quiet hours and daily digest
- ✅ Notification badge with unread count

### Notification Types

1. **SRS Reviews Due** - Flashcards ready for review
2. **New Lesson Available** - New lessons unlocked
3. **Quiz Deadline** - Upcoming quiz deadlines
4. **Achievement Unlocked** - Earned achievements
5. **Feedback Received** - Feedback on submissions
6. **Streak Milestone** - Learning streak achievements
7. **Lesson Completed** - Lesson completion confirmations
8. **System Notifications** - Important system messages

## Architecture

### Frontend Structure

```
frontend/src/
├── components/notifications/
│   ├── NotificationCenter.tsx      # Main notification panel
│   ├── NotificationItem.tsx        # Individual notification display
│   ├── NotificationSettings.tsx    # Notification preferences UI
│   ├── NotificationBadge.tsx       # Header badge component
│   └── index.ts                    # Exports
├── stores/
│   └── notificationStore.ts        # Zustand store for notifications
├── lib/
│   ├── notifications/
│   │   ├── notificationManager.ts  # Notification manager utility
│   │   ├── pushNotifications.ts    # Push notification service
│   │   └── index.ts                # Exports
│   └── api/
│       └── notifications.ts        # API client
└── types/
    └── notification.types.ts       # TypeScript types
```

### Backend Structure

```
backend/src/
├── routes/
│   └── notifications.ts            # API routes
├── controllers/
│   └── notificationController.ts   # Request handlers
└── services/
    └── notificationService.ts      # Business logic
```

## Usage

### Basic Usage

#### 1. Display Notification Badge in Header

```tsx
import { NotificationBadge } from '../components/notifications';

export default function Header() {
  return (
    <header>
      {/* Other header content */}
      <NotificationBadge />
    </header>
  );
}
```

#### 2. Send Notification

```typescript
import { notificationManager } from '../lib/notifications';

// Send a review notification
notificationManager.notifyReviewsDue(10, userId);

// Send a custom notification
const notification = notificationManager.create({
  userId: 'user-123',
  type: NotificationType.NEW_LESSON,
  title: 'New Lesson Available',
  message: 'Check out the new lesson on Playwright selectors',
  priority: NotificationPriority.MEDIUM,
  actions: [
    {
      label: 'Start Lesson',
      url: '/lessons/playwright-selectors',
      primary: true
    }
  ]
});

await notificationManager.send(notification);
```

#### 3. Access Notification Store

```typescript
import { useNotificationStore } from '../stores/notificationStore';

function MyComponent() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    deleteNotification,
  } = useNotificationStore();

  return (
    <div>
      <p>Unread: {unreadCount}</p>
      {notifications.map(notification => (
        <div key={notification.id}>
          <h3>{notification.title}</h3>
          <p>{notification.message}</p>
          <button onClick={() => markAsRead(notification.id)}>
            Mark as Read
          </button>
        </div>
      ))}
    </div>
  );
}
```

### Backend API Usage

#### Create Notification

```typescript
import * as notificationService from '../services/notificationService';

// Create a notification
await notificationService.createNotification({
  userId: 'user-123',
  type: 'srs_reviews_due',
  title: 'Reviews Due',
  message: 'You have 10 flashcards to review',
  priority: 'high',
  actions: [
    {
      label: 'Review Now',
      url: '/flashcards/review',
      primary: true
    }
  ]
});

// Use helper methods
await notificationService.notifyReviewsDue('user-123', 10);
await notificationService.notifyNewLesson('user-123', 'Playwright Basics');
await notificationService.notifyQuizDeadline('user-123', 'Week 1 Quiz', new Date());
await notificationService.notifyAchievement('user-123', 'First Lesson Complete');
await notificationService.notifyFeedback('user-123', 'Exercise 1');
await notificationService.notifyStreakMilestone('user-123', 7);
```

## API Endpoints

### Notification Endpoints

```
GET    /api/notifications                    # Get notifications
GET    /api/notifications/:id                # Get notification by ID
GET    /api/notifications/stats              # Get statistics
POST   /api/notifications                    # Create notification
PATCH  /api/notifications/:id                # Update notification
PATCH  /api/notifications/batch/update       # Batch update
DELETE /api/notifications/:id                # Delete notification
DELETE /api/notifications/batch/delete       # Batch delete
DELETE /api/notifications/clear/all          # Clear all
```

### Preferences Endpoints

```
GET    /api/notifications/preferences/current    # Get preferences
PUT    /api/notifications/preferences/current    # Update preferences
```

### Push Notification Endpoints

```
POST   /api/notifications/subscribe          # Subscribe to push
POST   /api/notifications/unsubscribe        # Unsubscribe from push
POST   /api/notifications/test               # Send test notification
```

## Notification Store API

### State

```typescript
{
  notifications: Notification[];      // All notifications
  unreadCount: number;               // Count of unread notifications
  preferences: NotificationPreferences; // User preferences
  isLoading: boolean;                // Loading state
  error: string | null;              // Error message
  lastFetch: Date | null;            // Last fetch timestamp
}
```

### Actions

```typescript
// Fetch notifications
fetchNotifications(filter?: NotificationFilter): Promise<void>

// Add notification
addNotification(notification: Notification): void

// Update notification
updateNotification(id: string, updates: UpdateNotificationRequest): Promise<void>

// Mark as read/unread
markAsRead(id: string): Promise<void>
markAsUnread(id: string): Promise<void>
markAllAsRead(): Promise<void>

// Archive
archiveNotification(id: string): Promise<void>
unarchiveNotification(id: string): Promise<void>

// Delete
deleteNotification(id: string): Promise<void>
clearAll(): Promise<void>

// Batch operations
batchMarkAsRead(ids: string[]): Promise<void>
batchArchive(ids: string[]): Promise<void>
batchDelete(ids: string[]): Promise<void>

// Preferences
updatePreferences(preferences: Partial<NotificationPreferences>): Promise<void>
toggleNotificationType(type: NotificationType, enabled: boolean): void

// Statistics
getStats(): NotificationStats

// Filters
filterNotifications(filter: NotificationFilter): Notification[]

// Real-time updates
handleRealtimeUpdate(notification: Notification): void
```

## Notification Manager API

```typescript
// Create and send notification
const notification = notificationManager.create(request);
await notificationManager.send(notification);

// Schedule notification
notificationManager.scheduleNotification(request, scheduledDate);

// Helper methods
notificationManager.notifyReviewsDue(count, userId);
notificationManager.notifyNewLesson(lessonTitle, userId);
notificationManager.notifyQuizDeadline(quizTitle, dueDate, userId);
notificationManager.notifyAchievement(achievementTitle, userId);
notificationManager.notifyFeedback(submissionTitle, userId);
notificationManager.notifyStreakMilestone(streak, userId);

// Permission management
await notificationManager.requestPermission();
notificationManager.isSupported();
notificationManager.getPermissionStatus();

// Queue management
notificationManager.getQueueStatus();
notificationManager.clearExpired();
```

## Push Notifications

### Setup

1. Generate VAPID keys:
```bash
npx web-push generate-vapid-keys
```

2. Set environment variables:
```env
VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
```

3. Configure in frontend:
```typescript
import { pushNotificationService } from './lib/notifications';

// Set VAPID public key
pushNotificationService.setVapidPublicKey(process.env.VITE_VAPID_PUBLIC_KEY);

// Request permission and subscribe
await pushNotificationService.subscribe();
```

### Usage

```typescript
// Check support
if (pushNotificationService.isSupported()) {
  // Request permission
  const permission = await pushNotificationService.requestPermission();

  if (permission === 'granted') {
    // Subscribe
    const subscription = await pushNotificationService.subscribe();
  }
}

// Check subscription status
const isSubscribed = await pushNotificationService.isSubscribed();

// Unsubscribe
await pushNotificationService.unsubscribe();

// Send test notification
await pushNotificationService.sendTestNotification();
```

## Notification Preferences

Users can customize notifications through the settings panel:

### Global Settings
- Enable/disable all notifications
- Enable/disable notification sounds
- Enable/disable desktop notifications
- Enable/disable email notifications

### Type-Specific Settings
Each notification type can be individually configured for:
- Sound
- Desktop notification
- Email notification

### Advanced Settings
- **Quiet Hours**: Pause notifications during specified times
- **Daily Digest**: Receive a daily summary of notifications

## Customization

### Adding Custom Notification Types

1. Add type to enum:
```typescript
// types/notification.types.ts
export enum NotificationType {
  // ... existing types
  CUSTOM_TYPE = 'custom_type',
}
```

2. Add default preferences:
```typescript
// stores/notificationStore.ts
const defaultPreferences: NotificationPreferences = {
  preferences: {
    // ... existing preferences
    custom_type: { enabled: true, sound: true, desktop: true, email: false },
  },
};
```

3. Add icon mapping:
```typescript
// components/notifications/NotificationItem.tsx
const getIcon = (type: NotificationType) => {
  switch (type) {
    // ... existing cases
    case 'custom_type':
      return <CustomIcon {...iconProps} />;
  }
};
```

4. Create helper method:
```typescript
// lib/notifications/notificationManager.ts
notifyCustomType(data: any, userId: string) {
  const notification = this.create({
    userId,
    type: NotificationType.CUSTOM_TYPE,
    title: 'Custom Notification',
    message: 'Custom message',
    priority: NotificationPriority.MEDIUM,
  });

  this.send(notification);
}
```

### Custom Notification Sounds

1. Add sound files to `public/sounds/`:
```
public/sounds/
├── reviews-due.mp3
├── new-lesson.mp3
├── achievement.mp3
└── custom-sound.mp3
```

2. Update sound configuration:
```typescript
// lib/notifications/notificationManager.ts
const soundConfigs: NotificationSound[] = [
  { type: NotificationType.CUSTOM_TYPE, soundFile: '/sounds/custom-sound.mp3', enabled: true },
];
```

## Best Practices

1. **Use Appropriate Priority Levels**
   - Urgent: Critical system messages, security alerts
   - High: Deadlines, important reviews
   - Medium: New content, achievements
   - Low: Streak milestones, non-critical updates

2. **Provide Clear Actions**
   - Always include relevant action buttons
   - Mark primary actions clearly
   - Use descriptive labels

3. **Respect User Preferences**
   - Check preferences before sending notifications
   - Honor quiet hours settings
   - Allow granular control per notification type

4. **Handle Errors Gracefully**
   - Implement retry logic for failed notifications
   - Log errors for debugging
   - Provide user feedback on failures

5. **Optimize Performance**
   - Limit the number of stored notifications
   - Clean up expired notifications regularly
   - Use pagination for large notification lists

## Testing

### Frontend Testing

```typescript
import { describe, it, expect } from 'vitest';
import { notificationManager } from '../lib/notifications';

describe('Notification Manager', () => {
  it('should create notification with correct properties', () => {
    const notification = notificationManager.create({
      userId: 'test-user',
      type: NotificationType.SYSTEM,
      title: 'Test',
      message: 'Test message',
    });

    expect(notification.userId).toBe('test-user');
    expect(notification.title).toBe('Test');
    expect(notification.read).toBe(false);
  });
});
```

### Backend Testing

```typescript
import { describe, it, expect } from '@jest/globals';
import * as notificationService from '../services/notificationService';

describe('Notification Service', () => {
  it('should create notification', async () => {
    const notification = await notificationService.createNotification({
      userId: 'test-user',
      type: 'system',
      title: 'Test',
      message: 'Test message',
    });

    expect(notification.id).toBeDefined();
    expect(notification.userId).toBe('test-user');
  });
});
```

## Troubleshooting

### Push Notifications Not Working

1. Check browser support:
```typescript
if (!pushNotificationService.isSupported()) {
  console.log('Push notifications not supported');
}
```

2. Verify VAPID keys are set correctly

3. Check service worker registration:
```typescript
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('Service worker:', reg);
});
```

4. Inspect browser console for errors

### Notifications Not Appearing

1. Check notification preferences
2. Verify user is authenticated
3. Check API endpoints are accessible
4. Inspect network requests in browser DevTools

### Sound Not Playing

1. Check browser autoplay policies
2. Verify sound files exist in public folder
3. Check user preferences allow sounds
4. Test with user interaction first

## Performance Considerations

- **Lazy Loading**: Notification components are loaded on demand
- **Virtual Scrolling**: Use for large notification lists
- **Debouncing**: Search and filter inputs are debounced
- **Caching**: Notification data is cached with Zustand persist
- **Pagination**: API supports pagination for large datasets
- **Cleanup**: Expired notifications are automatically cleaned up

## Security Considerations

- All API endpoints require authentication
- User can only access their own notifications
- Input validation on all endpoints
- Rate limiting on notification creation
- XSS protection through React's built-in escaping
- CSRF protection with tokens

## Future Enhancements

- [ ] Email notifications with templates
- [ ] SMS notifications
- [ ] WebSocket support for real-time updates
- [ ] Notification grouping and threading
- [ ] Rich media attachments
- [ ] Notification templates
- [ ] Analytics and tracking
- [ ] A/B testing for notification content
- [ ] Multi-language support
- [ ] Advanced filtering and search

## Contributing

When adding new notification features:

1. Update TypeScript types
2. Add corresponding UI components
3. Implement backend endpoints
4. Update this documentation
5. Add tests for new functionality
6. Update API documentation

## License

MIT
