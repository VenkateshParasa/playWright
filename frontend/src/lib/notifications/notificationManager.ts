import type {
  Notification,
  NotificationType,
  NotificationPriority,
  CreateNotificationRequest,
  NotificationQueueItem,
  NotificationSound,
} from '../../types/notification.types';
import { useNotificationStore } from '../../stores/notificationStore';

class NotificationManager {
  private queue: NotificationQueueItem[] = [];
  private sounds: Map<NotificationType, HTMLAudioElement> = new Map();
  private isProcessing = false;
  private retryDelay = 1000; // Start with 1 second
  private maxRetryDelay = 60000; // Max 1 minute

  constructor() {
    this.initializeSounds();
    this.startQueueProcessor();
  }

  // Initialize notification sounds
  private initializeSounds() {
    const soundConfigs: NotificationSound[] = [
      { type: NotificationType.SRS_REVIEWS_DUE, soundFile: '/sounds/reviews-due.mp3', enabled: true },
      { type: NotificationType.NEW_LESSON, soundFile: '/sounds/new-lesson.mp3', enabled: true },
      { type: NotificationType.QUIZ_DEADLINE, soundFile: '/sounds/deadline.mp3', enabled: true },
      { type: NotificationType.ACHIEVEMENT_UNLOCKED, soundFile: '/sounds/achievement.mp3', enabled: true },
      { type: NotificationType.FEEDBACK_RECEIVED, soundFile: '/sounds/feedback.mp3', enabled: true },
      { type: NotificationType.STREAK_MILESTONE, soundFile: '/sounds/milestone.mp3', enabled: true },
      { type: NotificationType.LESSON_COMPLETED, soundFile: '/sounds/complete.mp3', enabled: true },
      { type: NotificationType.SYSTEM, soundFile: '/sounds/system.mp3', enabled: true },
    ];

    soundConfigs.forEach(config => {
      if (config.enabled) {
        const audio = new Audio(config.soundFile);
        audio.preload = 'auto';
        this.sounds.set(config.type, audio);
      }
    });
  }

  // Play notification sound
  private playSound(type: NotificationType) {
    const { preferences } = useNotificationStore.getState();

    if (!preferences.soundEnabled) return;

    const typePrefs = preferences.preferences[type];
    if (!typePrefs?.sound) return;

    const audio = this.sounds.get(type);
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(err => {
        console.warn('Failed to play notification sound:', err);
      });
    }
  }

  // Create notification
  create(request: CreateNotificationRequest): Notification {
    const notification: Notification = {
      id: this.generateId(),
      userId: request.userId,
      type: request.type,
      title: request.title,
      message: request.message,
      priority: request.priority || NotificationPriority.MEDIUM,
      read: false,
      archived: false,
      createdAt: new Date(),
      actions: request.actions,
      metadata: request.metadata,
      expiresAt: request.expiresAt,
    };

    return notification;
  }

  // Send notification
  async send(notification: Notification) {
    const { addNotification, preferences } = useNotificationStore.getState();

    // Check if notification type is enabled
    const typePrefs = preferences.preferences[notification.type];
    if (!typePrefs?.enabled) {
      console.log('Notification type disabled:', notification.type);
      return;
    }

    // Add to store
    addNotification(notification);

    // Play sound
    this.playSound(notification.type);

    // Show desktop notification
    if (preferences.desktopEnabled && typePrefs?.desktop) {
      await this.showDesktopNotification(notification);
    }

    // Queue for API sync
    this.queueNotification(notification);
  }

  // Show desktop notification
  private async showDesktopNotification(notification: Notification) {
    if (!('Notification' in window)) {
      console.warn('Browser does not support desktop notifications');
      return;
    }

    if (Notification.permission === 'granted') {
      try {
        const desktopNotification = new Notification(notification.title, {
          body: notification.message,
          icon: notification.icon || '/icons/notification-icon.png',
          badge: '/icons/badge-icon.png',
          tag: notification.id,
          requireInteraction: notification.priority === NotificationPriority.URGENT,
          data: notification.metadata,
        });

        desktopNotification.onclick = () => {
          window.focus();
          if (notification.actions && notification.actions.length > 0) {
            window.location.href = notification.actions[0].url;
          }
          desktopNotification.close();
        };
      } catch (error) {
        console.error('Failed to show desktop notification:', error);
      }
    } else if (Notification.permission === 'default') {
      // Request permission
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        await this.showDesktopNotification(notification);
      }
    }
  }

  // Queue notification for processing
  private queueNotification(notification: Notification, scheduledFor?: Date) {
    const queueItem: NotificationQueueItem = {
      id: this.generateId(),
      notification,
      scheduledFor: scheduledFor || new Date(),
      retryCount: 0,
      maxRetries: 3,
      status: 'pending',
    };

    this.queue.push(queueItem);
  }

  // Start queue processor
  private startQueueProcessor() {
    setInterval(() => {
      if (!this.isProcessing && this.queue.length > 0) {
        this.processQueue();
      }
    }, 5000); // Process every 5 seconds
  }

  // Process notification queue
  private async processQueue() {
    this.isProcessing = true;

    const now = new Date();
    const itemsToProcess = this.queue.filter(
      item => item.status === 'pending' && item.scheduledFor <= now
    );

    for (const item of itemsToProcess) {
      try {
        // API call to send notification to backend
        // await notificationApi.sendNotification(item.notification);

        // Mark as sent
        item.status = 'sent';

        // Remove from queue
        this.queue = this.queue.filter(q => q.id !== item.id);
      } catch (error) {
        console.error('Failed to process notification:', error);

        // Retry logic
        item.retryCount++;
        if (item.retryCount >= item.maxRetries) {
          item.status = 'failed';
          console.error('Max retries reached for notification:', item.notification.id);
        } else {
          // Exponential backoff
          const delay = Math.min(this.retryDelay * Math.pow(2, item.retryCount), this.maxRetryDelay);
          item.scheduledFor = new Date(Date.now() + delay);
        }
      }
    }

    this.isProcessing = false;
  }

  // Schedule notification for later
  scheduleNotification(request: CreateNotificationRequest, scheduledFor: Date) {
    const notification = this.create(request);
    this.queueNotification(notification, scheduledFor);
  }

  // Generate unique ID
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Browser does not support notifications');
      return 'denied';
    }

    return await Notification.requestPermission();
  }

  // Check if notifications are supported
  isSupported(): boolean {
    return 'Notification' in window;
  }

  // Get permission status
  getPermissionStatus(): NotificationPermission {
    if (!('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  // Helper methods for common notification types
  notifyReviewsDue(count: number, userId: string) {
    const notification = this.create({
      userId,
      type: NotificationType.SRS_REVIEWS_DUE,
      title: 'Reviews Due',
      message: `You have ${count} flashcard${count !== 1 ? 's' : ''} to review`,
      priority: NotificationPriority.HIGH,
      actions: [
        {
          label: 'Review Now',
          url: '/flashcards/review',
          primary: true,
        },
      ],
      metadata: { count },
    });

    this.send(notification);
  }

  notifyNewLesson(lessonTitle: string, userId: string) {
    const notification = this.create({
      userId,
      type: NotificationType.NEW_LESSON,
      title: 'New Lesson Available',
      message: `"${lessonTitle}" is now available`,
      priority: NotificationPriority.MEDIUM,
      actions: [
        {
          label: 'Start Lesson',
          url: '/lessons',
          primary: true,
        },
      ],
      metadata: { lessonTitle },
    });

    this.send(notification);
  }

  notifyQuizDeadline(quizTitle: string, dueDate: Date, userId: string) {
    const notification = this.create({
      userId,
      type: NotificationType.QUIZ_DEADLINE,
      title: 'Quiz Deadline Approaching',
      message: `"${quizTitle}" is due on ${dueDate.toLocaleDateString()}`,
      priority: NotificationPriority.HIGH,
      actions: [
        {
          label: 'Take Quiz',
          url: '/quizzes',
          primary: true,
        },
      ],
      metadata: { quizTitle, dueDate },
    });

    this.send(notification);
  }

  notifyAchievement(achievementTitle: string, userId: string) {
    const notification = this.create({
      userId,
      type: NotificationType.ACHIEVEMENT_UNLOCKED,
      title: 'Achievement Unlocked!',
      message: `You've earned: ${achievementTitle}`,
      priority: NotificationPriority.MEDIUM,
      actions: [
        {
          label: 'View Achievements',
          url: '/achievements',
          primary: true,
        },
      ],
      metadata: { achievementTitle },
    });

    this.send(notification);
  }

  notifyFeedback(submissionTitle: string, userId: string) {
    const notification = this.create({
      userId,
      type: NotificationType.FEEDBACK_RECEIVED,
      title: 'New Feedback Received',
      message: `Feedback available for "${submissionTitle}"`,
      priority: NotificationPriority.MEDIUM,
      actions: [
        {
          label: 'View Feedback',
          url: '/submissions',
          primary: true,
        },
      ],
      metadata: { submissionTitle },
    });

    this.send(notification);
  }

  notifyStreakMilestone(streak: number, userId: string) {
    const notification = this.create({
      userId,
      type: NotificationType.STREAK_MILESTONE,
      title: 'Streak Milestone!',
      message: `Congratulations on your ${streak}-day streak!`,
      priority: NotificationPriority.LOW,
      actions: [
        {
          label: 'View Progress',
          url: '/dashboard',
          primary: true,
        },
      ],
      metadata: { streak },
    });

    this.send(notification);
  }

  // Clear expired notifications
  clearExpired() {
    const { notifications, deleteNotification } = useNotificationStore.getState();
    const now = new Date();

    notifications.forEach(n => {
      if (n.expiresAt && new Date(n.expiresAt) < now) {
        deleteNotification(n.id);
      }
    });
  }

  // Get queue status
  getQueueStatus() {
    return {
      total: this.queue.length,
      pending: this.queue.filter(q => q.status === 'pending').length,
      failed: this.queue.filter(q => q.status === 'failed').length,
    };
  }
}

// Export singleton instance
export const notificationManager = new NotificationManager();

// Auto-clear expired notifications every hour
setInterval(() => {
  notificationManager.clearExpired();
}, 60 * 60 * 1000);
