// Notification Types and Interfaces

export enum NotificationType {
  SRS_REVIEWS_DUE = 'srs_reviews_due',
  NEW_LESSON = 'new_lesson',
  QUIZ_DEADLINE = 'quiz_deadline',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  FEEDBACK_RECEIVED = 'feedback_received',
  STREAK_MILESTONE = 'streak_milestone',
  LESSON_COMPLETED = 'lesson_completed',
  SYSTEM = 'system',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface NotificationAction {
  label: string;
  url: string;
  primary?: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  read: boolean;
  archived: boolean;
  createdAt: Date;
  readAt?: Date;
  expiresAt?: Date;
  actions?: NotificationAction[];
  metadata?: Record<string, any>;
  icon?: string;
  imageUrl?: string;
}

export interface NotificationPreferences {
  enabled: boolean;
  soundEnabled: boolean;
  desktopEnabled: boolean;
  emailEnabled: boolean;
  preferences: {
    [key in NotificationType]: {
      enabled: boolean;
      sound: boolean;
      desktop: boolean;
      email: boolean;
    };
  };
  quietHours?: {
    enabled: boolean;
    startTime: string; // HH:mm format
    endTime: string; // HH:mm format
  };
  dailyDigest?: {
    enabled: boolean;
    time: string; // HH:mm format
  };
}

export interface NotificationFilter {
  types?: NotificationType[];
  priority?: NotificationPriority[];
  read?: boolean;
  archived?: boolean;
  startDate?: Date;
  endDate?: Date;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
  byPriority: Record<NotificationPriority, number>;
}

export interface NotificationSound {
  type: NotificationType;
  soundFile: string;
  enabled: boolean;
}

// Push Notification interfaces
export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  vibrate?: number[];
  tag?: string;
  requireInteraction?: boolean;
  actions?: {
    action: string;
    title: string;
    icon?: string;
  }[];
  data?: any;
}

// API Response types
export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  unread: number;
  hasMore: boolean;
}

export interface CreateNotificationRequest {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  actions?: NotificationAction[];
  metadata?: Record<string, any>;
  expiresAt?: Date;
}

export interface UpdateNotificationRequest {
  read?: boolean;
  archived?: boolean;
}

export interface BatchUpdateNotificationRequest {
  notificationIds: string[];
  updates: UpdateNotificationRequest;
}

// Queue management types
export interface NotificationQueueItem {
  id: string;
  notification: Notification;
  scheduledFor: Date;
  retryCount: number;
  maxRetries: number;
  status: 'pending' | 'sent' | 'failed';
}

// WebSocket event types
export interface NotificationEvent {
  type: 'new' | 'update' | 'delete';
  notification: Notification;
  timestamp: Date;
}
