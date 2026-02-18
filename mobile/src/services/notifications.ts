import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Notification } from '../types';
import api from './api';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  notifications: Notification[];
  unreadCount: number;
  requestPermission: () => Promise<boolean>;
  scheduleLocalNotification: (
    title: string,
    body: string,
    trigger?: Notifications.NotificationTriggerInput
  ) => Promise<string>;
  cancelNotification: (id: string) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token || null));

    // Listener for received notifications
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
      fetchNotifications();
    });

    // Listener for notification interactions
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      // Handle notification tap
      console.log('Notification tapped:', response);
    });

    // Fetch notifications
    fetchNotifications();

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.data);
      setUnreadCount(response.data.data.filter((n: Notification) => !n.isRead).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  };

  const scheduleLocalNotification = async (
    title: string,
    body: string,
    trigger?: Notifications.NotificationTriggerInput
  ): Promise<string> => {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },
      trigger: trigger || null,
    });
  };

  const cancelNotification = async (id: string): Promise<void> => {
    await Notifications.cancelScheduledNotificationAsync(id);
  };

  const markAsRead = async (id: string): Promise<void> => {
    try {
      await api.put(`/notifications/${id}/read`);
      await fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async (): Promise<void> => {
    try {
      await api.put('/notifications/read-all');
      await fetchNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const value = {
    expoPushToken,
    notification,
    notifications,
    unreadCount,
    requestPermission,
    scheduleLocalNotification,
    cancelNotification,
    markAsRead,
    markAllAsRead,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }

    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      })
    ).data;

    // Send token to backend
    try {
      await api.post('/notifications/register-token', { token });
    } catch (error) {
      console.error('Error registering push token:', error);
    }
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
}
