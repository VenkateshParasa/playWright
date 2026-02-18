import webpush from 'web-push';

// Types
interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  priority: string;
  read: boolean;
  archived: boolean;
  createdAt: Date;
  readAt?: Date;
  expiresAt?: Date;
  actions?: any[];
  metadata?: Record<string, any>;
  icon?: string;
  imageUrl?: string;
}

interface NotificationPreferences {
  enabled: boolean;
  soundEnabled: boolean;
  desktopEnabled: boolean;
  emailEnabled: boolean;
  preferences: Record<string, any>;
  quietHours?: any;
  dailyDigest?: any;
}

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// In-memory storage (replace with database in production)
let notifications: Notification[] = [];
let preferences: Map<string, NotificationPreferences> = new Map();
let pushSubscriptions: Map<string, PushSubscription[]> = new Map();

// Configure web-push (replace with your VAPID keys)
// webpush.setVapidDetails(
//   'mailto:your-email@example.com',
//   process.env.VAPID_PUBLIC_KEY || '',
//   process.env.VAPID_PRIVATE_KEY || ''
// );

// Generate unique ID
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Get notifications with filters
export const getNotifications = async (
  filter: any,
  limit: number = 50,
  offset: number = 0
) => {
  let filtered = notifications.filter(n => n.userId === filter.userId);

  if (filter.type) {
    filtered = filtered.filter(n => n.type === filter.type);
  }

  if (filter.priority) {
    filtered = filtered.filter(n => n.priority === filter.priority);
  }

  if (filter.read !== undefined) {
    filtered = filtered.filter(n => n.read === filter.read);
  }

  if (filter.archived !== undefined) {
    filtered = filtered.filter(n => n.archived === filter.archived);
  }

  // Sort by created date (newest first)
  filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const total = filtered.length;
  const unread = filtered.filter(n => !n.read && !n.archived).length;
  const paginated = filtered.slice(offset, offset + limit);

  return {
    notifications: paginated,
    total,
    unread,
    hasMore: offset + limit < total,
  };
};

// Get notification by ID
export const getNotificationById = async (id: string, userId: string) => {
  return notifications.find(n => n.id === id && n.userId === userId);
};

// Get notification statistics
export const getNotificationStats = async (userId: string) => {
  const userNotifications = notifications.filter(n => n.userId === userId);

  const stats = {
    total: userNotifications.length,
    unread: userNotifications.filter(n => !n.read && !n.archived).length,
    byType: {} as Record<string, number>,
    byPriority: {} as Record<string, number>,
  };

  userNotifications.forEach(n => {
    stats.byType[n.type] = (stats.byType[n.type] || 0) + 1;
    stats.byPriority[n.priority] = (stats.byPriority[n.priority] || 0) + 1;
  });

  return stats;
};

// Create notification
export const createNotification = async (data: any): Promise<Notification> => {
  const notification: Notification = {
    id: generateId(),
    userId: data.userId,
    type: data.type,
    title: data.title,
    message: data.message,
    priority: data.priority || 'medium',
    read: false,
    archived: false,
    createdAt: new Date(),
    actions: data.actions,
    metadata: data.metadata,
    expiresAt: data.expiresAt,
    icon: data.icon,
    imageUrl: data.imageUrl,
  };

  notifications.push(notification);

  // Send push notification if enabled
  await sendPushNotification(notification);

  return notification;
};

// Update notification
export const updateNotification = async (
  id: string,
  userId: string,
  updates: any
) => {
  const index = notifications.findIndex(n => n.id === id && n.userId === userId);

  if (index === -1) {
    return null;
  }

  const notification = notifications[index];

  if (updates.read !== undefined) {
    notification.read = updates.read;
    notification.readAt = updates.read ? new Date() : undefined;
  }

  if (updates.archived !== undefined) {
    notification.archived = updates.archived;
  }

  notifications[index] = notification;
  return notification;
};

// Batch update notifications
export const batchUpdateNotifications = async (
  notificationIds: string[],
  userId: string,
  updates: any
) => {
  let updatedCount = 0;

  for (const id of notificationIds) {
    const result = await updateNotification(id, userId, updates);
    if (result) updatedCount++;
  }

  return {
    success: true,
    updated: updatedCount,
  };
};

// Delete notification
export const deleteNotification = async (id: string, userId: string) => {
  const index = notifications.findIndex(n => n.id === id && n.userId === userId);

  if (index === -1) {
    return false;
  }

  notifications.splice(index, 1);
  return true;
};

// Batch delete notifications
export const batchDeleteNotifications = async (
  notificationIds: string[],
  userId: string
) => {
  let deletedCount = 0;

  for (const id of notificationIds) {
    const result = await deleteNotification(id, userId);
    if (result) deletedCount++;
  }

  return {
    success: true,
    deleted: deletedCount,
  };
};

// Clear all notifications
export const clearAllNotifications = async (userId: string) => {
  const initialLength = notifications.length;
  notifications = notifications.filter(n => n.userId !== userId);
  const deletedCount = initialLength - notifications.length;

  return {
    success: true,
    deleted: deletedCount,
  };
};

// Get user preferences
export const getPreferences = async (userId: string) => {
  let userPrefs = preferences.get(userId);

  if (!userPrefs) {
    // Return default preferences
    userPrefs = {
      enabled: true,
      soundEnabled: true,
      desktopEnabled: true,
      emailEnabled: false,
      preferences: {
        srs_reviews_due: { enabled: true, sound: true, desktop: true, email: false },
        new_lesson: { enabled: true, sound: true, desktop: true, email: false },
        quiz_deadline: { enabled: true, sound: true, desktop: true, email: true },
        achievement_unlocked: { enabled: true, sound: true, desktop: true, email: false },
        feedback_received: { enabled: true, sound: true, desktop: true, email: true },
        streak_milestone: { enabled: true, sound: true, desktop: true, email: false },
        lesson_completed: { enabled: true, sound: false, desktop: false, email: false },
        system: { enabled: true, sound: false, desktop: true, email: false },
      },
      quietHours: {
        enabled: false,
        startTime: '22:00',
        endTime: '08:00',
      },
      dailyDigest: {
        enabled: false,
        time: '09:00',
      },
    };
    preferences.set(userId, userPrefs);
  }

  return userPrefs;
};

// Update user preferences
export const updatePreferences = async (
  userId: string,
  updates: Partial<NotificationPreferences>
) => {
  const currentPrefs = await getPreferences(userId);
  const updatedPrefs = { ...currentPrefs, ...updates };
  preferences.set(userId, updatedPrefs);
  return updatedPrefs;
};

// Subscribe to push notifications
export const subscribeToPush = async (
  userId: string,
  subscription: PushSubscription
) => {
  const userSubscriptions = pushSubscriptions.get(userId) || [];

  // Check if subscription already exists
  const existingIndex = userSubscriptions.findIndex(
    s => s.endpoint === subscription.endpoint
  );

  if (existingIndex !== -1) {
    userSubscriptions[existingIndex] = subscription;
  } else {
    userSubscriptions.push(subscription);
  }

  pushSubscriptions.set(userId, userSubscriptions);

  return {
    success: true,
    subscription,
  };
};

// Unsubscribe from push notifications
export const unsubscribeFromPush = async (
  userId: string,
  subscription: PushSubscription
) => {
  const userSubscriptions = pushSubscriptions.get(userId) || [];
  const filtered = userSubscriptions.filter(
    s => s.endpoint !== subscription.endpoint
  );

  pushSubscriptions.set(userId, filtered);

  return {
    success: true,
  };
};

// Send push notification
const sendPushNotification = async (notification: Notification) => {
  const userPrefs = await getPreferences(notification.userId);
  const typePrefs = userPrefs.preferences[notification.type];

  // Check if desktop notifications are enabled
  if (!userPrefs.desktopEnabled || !typePrefs?.desktop) {
    return;
  }

  // Get user's push subscriptions
  const subscriptions = pushSubscriptions.get(notification.userId) || [];

  const payload = JSON.stringify({
    title: notification.title,
    body: notification.message,
    icon: notification.icon || '/icons/notification-icon.png',
    badge: '/icons/badge-icon.png',
    tag: notification.id,
    data: {
      url: notification.actions?.[0]?.url || '/',
      notificationId: notification.id,
    },
  });

  // Send to all subscriptions
  for (const subscription of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
          },
        },
        payload
      );
    } catch (error) {
      console.error('Failed to send push notification:', error);
      // Remove invalid subscription
      await unsubscribeFromPush(notification.userId, subscription);
    }
  }
};

// Send test notification
export const sendTestNotification = async (userId: string) => {
  const notification: Notification = {
    id: generateId(),
    userId,
    type: 'system',
    title: 'Test Notification',
    message: 'This is a test notification from the learning platform',
    priority: 'low',
    read: false,
    archived: false,
    createdAt: new Date(),
  };

  notifications.push(notification);
  await sendPushNotification(notification);
};

// Schedule notification (for future implementation)
export const scheduleNotification = async (
  notification: Notification,
  scheduledFor: Date
) => {
  // Implement scheduling logic
  // Could use a job queue like Bull or agenda
  console.log('Scheduling notification for:', scheduledFor);
};

// Send email notification (for future implementation)
export const sendEmailNotification = async (notification: Notification) => {
  // Implement email sending logic
  // Could use SendGrid, Mailgun, etc.
  console.log('Sending email notification:', notification.title);
};

// Cleanup expired notifications (should be run periodically)
export const cleanupExpiredNotifications = async () => {
  const now = new Date();
  const initialLength = notifications.length;

  notifications = notifications.filter(
    n => !n.expiresAt || new Date(n.expiresAt) > now
  );

  const deleted = initialLength - notifications.length;
  console.log(`Cleaned up ${deleted} expired notifications`);

  return {
    success: true,
    deleted,
  };
};

// Helper: Notify reviews due
export const notifyReviewsDue = async (userId: string, count: number) => {
  return createNotification({
    userId,
    type: 'srs_reviews_due',
    title: 'Reviews Due',
    message: `You have ${count} flashcard${count !== 1 ? 's' : ''} to review`,
    priority: 'high',
    actions: [
      {
        label: 'Review Now',
        url: '/flashcards/review',
        primary: true,
      },
    ],
    metadata: { count },
  });
};

// Helper: Notify new lesson
export const notifyNewLesson = async (userId: string, lessonTitle: string) => {
  return createNotification({
    userId,
    type: 'new_lesson',
    title: 'New Lesson Available',
    message: `"${lessonTitle}" is now available`,
    priority: 'medium',
    actions: [
      {
        label: 'Start Lesson',
        url: '/lessons',
        primary: true,
      },
    ],
    metadata: { lessonTitle },
  });
};

// Helper: Notify quiz deadline
export const notifyQuizDeadline = async (
  userId: string,
  quizTitle: string,
  dueDate: Date
) => {
  return createNotification({
    userId,
    type: 'quiz_deadline',
    title: 'Quiz Deadline Approaching',
    message: `"${quizTitle}" is due on ${dueDate.toLocaleDateString()}`,
    priority: 'high',
    actions: [
      {
        label: 'Take Quiz',
        url: '/quizzes',
        primary: true,
      },
    ],
    metadata: { quizTitle, dueDate },
  });
};

// Helper: Notify achievement
export const notifyAchievement = async (userId: string, achievementTitle: string) => {
  return createNotification({
    userId,
    type: 'achievement_unlocked',
    title: 'Achievement Unlocked!',
    message: `You've earned: ${achievementTitle}`,
    priority: 'medium',
    actions: [
      {
        label: 'View Achievements',
        url: '/achievements',
        primary: true,
      },
    ],
    metadata: { achievementTitle },
  });
};

// Helper: Notify feedback
export const notifyFeedback = async (userId: string, submissionTitle: string) => {
  return createNotification({
    userId,
    type: 'feedback_received',
    title: 'New Feedback Received',
    message: `Feedback available for "${submissionTitle}"`,
    priority: 'medium',
    actions: [
      {
        label: 'View Feedback',
        url: '/submissions',
        primary: true,
      },
    ],
    metadata: { submissionTitle },
  });
};

// Helper: Notify streak milestone
export const notifyStreakMilestone = async (userId: string, streak: number) => {
  return createNotification({
    userId,
    type: 'streak_milestone',
    title: 'Streak Milestone!',
    message: `Congratulations on your ${streak}-day streak!`,
    priority: 'low',
    actions: [
      {
        label: 'View Progress',
        url: '/dashboard',
        primary: true,
      },
    ],
    metadata: { streak },
  });
};
