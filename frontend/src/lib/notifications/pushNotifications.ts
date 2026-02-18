import type {
  PushSubscription as CustomPushSubscription,
  PushNotificationPayload,
} from '../../types/notification.types';

class PushNotificationService {
  private registration: ServiceWorkerRegistration | null = null;
  private vapidPublicKey: string = '';

  constructor() {
    this.initialize();
  }

  // Initialize push notification service
  private async initialize() {
    if (!this.isSupported()) {
      console.warn('Push notifications are not supported in this browser');
      return;
    }

    try {
      // Wait for service worker to be ready
      this.registration = await navigator.serviceWorker.ready;
      console.log('Push notification service initialized');
    } catch (error) {
      console.error('Failed to initialize push notification service:', error);
    }
  }

  // Check if push notifications are supported
  isSupported(): boolean {
    return (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }

  // Set VAPID public key
  setVapidPublicKey(key: string) {
    this.vapidPublicKey = key;
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Notifications are not supported');
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  // Get current permission status
  getPermissionStatus(): NotificationPermission {
    if (!('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  // Subscribe to push notifications
  async subscribe(): Promise<CustomPushSubscription | null> {
    if (!this.registration) {
      throw new Error('Service worker not registered');
    }

    if (!this.vapidPublicKey) {
      throw new Error('VAPID public key not set');
    }

    try {
      // Request permission first
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      // Subscribe to push
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey),
      });

      // Convert to our custom format
      const customSubscription = this.convertSubscription(subscription);

      // Send subscription to backend
      await this.sendSubscriptionToBackend(customSubscription);

      return customSubscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      throw error;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe(): Promise<void> {
    if (!this.registration) {
      throw new Error('Service worker not registered');
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();

        // Remove subscription from backend
        await this.removeSubscriptionFromBackend(this.convertSubscription(subscription));
      }
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      throw error;
    }
  }

  // Get current subscription
  async getSubscription(): Promise<CustomPushSubscription | null> {
    if (!this.registration) {
      return null;
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription();
      return subscription ? this.convertSubscription(subscription) : null;
    } catch (error) {
      console.error('Failed to get push subscription:', error);
      return null;
    }
  }

  // Check if currently subscribed
  async isSubscribed(): Promise<boolean> {
    const subscription = await this.getSubscription();
    return subscription !== null;
  }

  // Send test notification
  async sendTestNotification(): Promise<void> {
    if (!this.registration) {
      throw new Error('Service worker not registered');
    }

    try {
      await this.registration.showNotification('Test Notification', {
        body: 'This is a test notification from the learning platform',
        icon: '/icons/notification-icon.png',
        badge: '/icons/badge-icon.png',
        vibrate: [200, 100, 200],
        tag: 'test-notification',
        requireInteraction: false,
        actions: [
          {
            action: 'open',
            title: 'Open App',
          },
          {
            action: 'close',
            title: 'Close',
          },
        ],
      });
    } catch (error) {
      console.error('Failed to send test notification:', error);
      throw error;
    }
  }

  // Show notification
  async showNotification(payload: PushNotificationPayload): Promise<void> {
    if (!this.registration) {
      throw new Error('Service worker not registered');
    }

    try {
      await this.registration.showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/icons/notification-icon.png',
        badge: payload.badge || '/icons/badge-icon.png',
        image: payload.image,
        vibrate: payload.vibrate || [200, 100, 200],
        tag: payload.tag,
        requireInteraction: payload.requireInteraction || false,
        actions: payload.actions,
        data: payload.data,
      });
    } catch (error) {
      console.error('Failed to show notification:', error);
      throw error;
    }
  }

  // Convert PushSubscription to custom format
  private convertSubscription(subscription: globalThis.PushSubscription): CustomPushSubscription {
    const key = subscription.getKey('p256dh');
    const auth = subscription.getKey('auth');

    return {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: key ? this.arrayBufferToBase64(key) : '',
        auth: auth ? this.arrayBufferToBase64(auth) : '',
      },
    };
  }

  // Send subscription to backend
  private async sendSubscriptionToBackend(subscription: CustomPushSubscription): Promise<void> {
    try {
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription to backend');
      }
    } catch (error) {
      console.error('Failed to send subscription to backend:', error);
      throw error;
    }
  }

  // Remove subscription from backend
  private async removeSubscriptionFromBackend(subscription: CustomPushSubscription): Promise<void> {
    try {
      const response = await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });

      if (!response.ok) {
        throw new Error('Failed to remove subscription from backend');
      }
    } catch (error) {
      console.error('Failed to remove subscription from backend:', error);
      throw error;
    }
  }

  // Convert base64 string to Uint8Array
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Convert ArrayBuffer to base64
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  // Get notification statistics
  async getNotificationStats() {
    if (!this.registration) {
      return {
        supported: false,
        permission: 'denied' as NotificationPermission,
        subscribed: false,
      };
    }

    const subscription = await this.getSubscription();

    return {
      supported: this.isSupported(),
      permission: this.getPermissionStatus(),
      subscribed: subscription !== null,
      subscription: subscription,
    };
  }

  // Handle push event (to be called from service worker)
  static handlePushEvent(event: PushEvent) {
    try {
      const data = event.data?.json();

      const options: NotificationOptions = {
        body: data.body,
        icon: data.icon || '/icons/notification-icon.png',
        badge: data.badge || '/icons/badge-icon.png',
        image: data.image,
        vibrate: data.vibrate || [200, 100, 200],
        tag: data.tag,
        requireInteraction: data.requireInteraction || false,
        actions: data.actions,
        data: data.data,
      };

      // @ts-ignore - self is available in service worker context
      return self.registration.showNotification(data.title, options);
    } catch (error) {
      console.error('Failed to handle push event:', error);
      throw error;
    }
  }

  // Handle notification click (to be called from service worker)
  static handleNotificationClick(event: NotificationEvent) {
    event.notification.close();

    const urlToOpen = event.notification.data?.url || '/';

    // @ts-ignore - clients is available in service worker context
    event.waitUntil(
      // @ts-ignore
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList: any[]) => {
        // Check if there is already a window/tab open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }

        // If not, open a new window/tab
        // @ts-ignore
        if (clients.openWindow) {
          // @ts-ignore
          return clients.openWindow(urlToOpen);
        }
      })
    );
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();

// Example VAPID public key (replace with actual key)
// pushNotificationService.setVapidPublicKey('YOUR_VAPID_PUBLIC_KEY');
