import type {
  Notification,
  NotificationsResponse,
  CreateNotificationRequest,
  UpdateNotificationRequest,
  BatchUpdateNotificationRequest,
  NotificationPreferences,
  NotificationFilter,
  NotificationStats,
  PushSubscription,
} from '../../types/notification.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Get notifications
export const getNotifications = async (
  filter?: NotificationFilter,
  limit: number = 50,
  offset: number = 0
): Promise<NotificationsResponse> => {
  const params = new URLSearchParams();

  if (filter?.types) params.append('type', filter.types.join(','));
  if (filter?.priority) params.append('priority', filter.priority.join(','));
  if (filter?.read !== undefined) params.append('read', String(filter.read));
  if (filter?.archived !== undefined) params.append('archived', String(filter.archived));
  params.append('limit', String(limit));
  params.append('offset', String(offset));

  const response = await fetch(`${API_BASE_URL}/notifications?${params.toString()}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch notifications');
  }

  return response.json();
};

// Get notification by ID
export const getNotificationById = async (id: string): Promise<Notification> => {
  const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch notification');
  }

  return response.json();
};

// Get notification statistics
export const getNotificationStats = async (): Promise<NotificationStats> => {
  const response = await fetch(`${API_BASE_URL}/notifications/stats`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch notification stats');
  }

  return response.json();
};

// Create notification
export const createNotification = async (
  request: CreateNotificationRequest
): Promise<Notification> => {
  const response = await fetch(`${API_BASE_URL}/notifications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error('Failed to create notification');
  }

  return response.json();
};

// Update notification
export const updateNotification = async (
  id: string,
  updates: UpdateNotificationRequest
): Promise<Notification> => {
  const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error('Failed to update notification');
  }

  return response.json();
};

// Batch update notifications
export const batchUpdateNotifications = async (
  request: BatchUpdateNotificationRequest
): Promise<{ success: boolean; updated: number }> => {
  const response = await fetch(`${API_BASE_URL}/notifications/batch/update`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error('Failed to batch update notifications');
  }

  return response.json();
};

// Delete notification
export const deleteNotification = async (id: string): Promise<{ success: boolean }> => {
  const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to delete notification');
  }

  return response.json();
};

// Batch delete notifications
export const batchDeleteNotifications = async (
  notificationIds: string[]
): Promise<{ success: boolean; deleted: number }> => {
  const response = await fetch(`${API_BASE_URL}/notifications/batch/delete`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ notificationIds }),
  });

  if (!response.ok) {
    throw new Error('Failed to batch delete notifications');
  }

  return response.json();
};

// Clear all notifications
export const clearAllNotifications = async (): Promise<{ success: boolean; deleted: number }> => {
  const response = await fetch(`${API_BASE_URL}/notifications/clear/all`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to clear notifications');
  }

  return response.json();
};

// Get notification preferences
export const getPreferences = async (): Promise<NotificationPreferences> => {
  const response = await fetch(`${API_BASE_URL}/notifications/preferences/current`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch preferences');
  }

  return response.json();
};

// Update notification preferences
export const updatePreferences = async (
  preferences: Partial<NotificationPreferences>
): Promise<NotificationPreferences> => {
  const response = await fetch(`${API_BASE_URL}/notifications/preferences/current`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(preferences),
  });

  if (!response.ok) {
    throw new Error('Failed to update preferences');
  }

  return response.json();
};

// Subscribe to push notifications
export const subscribeToPush = async (
  subscription: PushSubscription
): Promise<{ success: boolean; subscription: PushSubscription }> => {
  const response = await fetch(`${API_BASE_URL}/notifications/subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(subscription),
  });

  if (!response.ok) {
    throw new Error('Failed to subscribe to push notifications');
  }

  return response.json();
};

// Unsubscribe from push notifications
export const unsubscribeFromPush = async (
  subscription: PushSubscription
): Promise<{ success: boolean }> => {
  const response = await fetch(`${API_BASE_URL}/notifications/unsubscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(subscription),
  });

  if (!response.ok) {
    throw new Error('Failed to unsubscribe from push notifications');
  }

  return response.json();
};

// Send test notification
export const sendTestNotification = async (): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/notifications/test`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to send test notification');
  }

  return response.json();
};
