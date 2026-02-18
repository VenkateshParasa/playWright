/**
 * Service Worker Registration and Management
 * Handles PWA lifecycle events, updates, and offline functionality
 */

import { Workbox } from 'workbox-window';

// Define custom events for service worker updates
export interface ServiceWorkerEvents {
  onNeedRefresh: () => void;
  onOfflineReady: () => void;
  onRegistered: (registration: ServiceWorkerRegistration) => void;
  onRegisterError: (error: Error) => void;
}

let wb: Workbox | undefined;

/**
 * Register service worker with event handlers
 */
export function registerServiceWorker(events: ServiceWorkerEvents): () => void {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker is not supported in this browser');
    return () => {};
  }

  // Create Workbox instance
  wb = new Workbox('/sw.js', { scope: '/' });

  let registration: ServiceWorkerRegistration | undefined;

  // When a new service worker is installed and waiting
  wb.addEventListener('waiting', () => {
    console.log('New service worker is waiting');
    events.onNeedRefresh();
  });

  // When the service worker becomes controlling
  wb.addEventListener('controlling', () => {
    console.log('Service worker is now controlling');
    // Reload page to use new service worker
    window.location.reload();
  });

  // When service worker is activated
  wb.addEventListener('activated', (event) => {
    console.log('Service worker activated', event);

    // If there's no previous controller, this is a fresh install
    if (!event.isUpdate) {
      console.log('Service worker installed for the first time');
      events.onOfflineReady();
    }
  });

  // Handle messages from service worker
  wb.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CACHE_UPDATED') {
      console.log('Cache updated:', event.data.payload);
    }
  });

  // Register the service worker
  wb.register()
    .then((reg) => {
      registration = reg;
      console.log('Service Worker registered:', reg);
      events.onRegistered(reg);

      // Check for updates every hour
      setInterval(() => {
        reg.update();
      }, 60 * 60 * 1000);
    })
    .catch((error) => {
      console.error('Service Worker registration failed:', error);
      events.onRegisterError(error);
    });

  // Check for updates on page visibility change
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && registration) {
      registration.update();
    }
  });

  // Cleanup function
  return () => {
    if (wb) {
      wb.removeEventListener('waiting', () => {});
      wb.removeEventListener('controlling', () => {});
      wb.removeEventListener('activated', () => {});
    }
  };
}

/**
 * Update service worker to activate waiting worker
 */
export function updateServiceWorker(): void {
  if (wb) {
    wb.messageSkipWaiting();
  }
}

/**
 * Unregister service worker (useful for development/testing)
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
      console.log('Service Worker unregistered');
      return true;
    } catch (error) {
      console.error('Error unregistering service worker:', error);
      return false;
    }
  }
  return false;
}

/**
 * Check if service worker is registered and active
 */
export function isServiceWorkerActive(): boolean {
  return !!(
    navigator.serviceWorker &&
    navigator.serviceWorker.controller
  );
}

/**
 * Get service worker registration
 */
export async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if ('serviceWorker' in navigator) {
    return await navigator.serviceWorker.getRegistration();
  }
  return null;
}

/**
 * Send message to service worker
 */
export function sendMessageToSW(message: any): void {
  if (wb && navigator.serviceWorker.controller) {
    wb.messageSW(message);
  }
}

/**
 * Background sync for offline actions
 */
export async function registerBackgroundSync(tag: string): Promise<void> {
  if (!('serviceWorker' in navigator) || !('sync' in ServiceWorkerRegistration.prototype)) {
    console.warn('Background Sync is not supported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await (registration as any).sync.register(tag);
    console.log(`Background sync registered: ${tag}`);
  } catch (error) {
    console.error('Background sync registration failed:', error);
  }
}

/**
 * Queue failed request for background sync
 */
export async function queueFailedRequest(request: {
  url: string;
  method: string;
  body?: any;
  headers?: Record<string, string>;
}): Promise<void> {
  // Store failed request in IndexedDB for background sync
  const db = await openSyncDB();
  const tx = db.transaction('sync-queue', 'readwrite');
  const store = tx.objectStore('sync-queue');

  await store.add({
    ...request,
    timestamp: Date.now(),
    retries: 0
  });

  await tx.done;

  // Register background sync
  await registerBackgroundSync('sync-failed-requests');
}

/**
 * Open IndexedDB for sync queue
 */
async function openSyncDB(): Promise<any> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('pwa-sync', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains('sync-queue')) {
        const store = db.createObjectStore('sync-queue', {
          keyPath: 'id',
          autoIncrement: true
        });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('url', 'url', { unique: false });
      }
    };
  });
}

/**
 * Clear sync queue (after successful sync)
 */
export async function clearSyncQueue(): Promise<void> {
  try {
    const db = await openSyncDB();
    const tx = db.transaction('sync-queue', 'readwrite');
    const store = tx.objectStore('sync-queue');
    await store.clear();
    await tx.done;
    console.log('Sync queue cleared');
  } catch (error) {
    console.error('Error clearing sync queue:', error);
  }
}

/**
 * Get all items in sync queue
 */
export async function getSyncQueue(): Promise<any[]> {
  try {
    const db = await openSyncDB();
    const tx = db.transaction('sync-queue', 'readonly');
    const store = tx.objectStore('sync-queue');
    return await store.getAll();
  } catch (error) {
    console.error('Error getting sync queue:', error);
    return [];
  }
}
