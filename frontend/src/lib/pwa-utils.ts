/**
 * PWA Utility Functions
 * Helpers for detecting PWA capabilities, installation status, and network conditions
 */

/**
 * Check if the app is running in standalone mode (installed PWA)
 */
export function isStandalone(): boolean {
  // Check multiple methods for different browsers
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

/**
 * Check if PWA installation is supported
 */
export function isPWAInstallable(): boolean {
  // Check if beforeinstallprompt is supported
  return 'onbeforeinstallprompt' in window;
}

/**
 * Check if service workers are supported
 */
export function isServiceWorkerSupported(): boolean {
  return 'serviceWorker' in navigator;
}

/**
 * Check if the browser supports push notifications
 */
export function isPushNotificationSupported(): boolean {
  return 'Notification' in window && 'PushManager' in window;
}

/**
 * Check if background sync is supported
 */
export function isBackgroundSyncSupported(): boolean {
  return 'serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype;
}

/**
 * Check if periodic background sync is supported
 */
export function isPeriodicSyncSupported(): boolean {
  return (
    'serviceWorker' in navigator && 'periodicSync' in ServiceWorkerRegistration.prototype
  );
}

/**
 * Detect the current platform
 */
export type Platform = 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'unknown';

export function detectPlatform(): Platform {
  const userAgent = navigator.userAgent.toLowerCase();
  const platform = navigator.platform.toLowerCase();

  if (/iphone|ipad|ipod/.test(userAgent)) {
    return 'ios';
  } else if (/android/.test(userAgent)) {
    return 'android';
  } else if (/win/.test(platform)) {
    return 'windows';
  } else if (/mac/.test(platform)) {
    return 'macos';
  } else if (/linux/.test(platform)) {
    return 'linux';
  }

  return 'unknown';
}

/**
 * Detect if the device is mobile
 */
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Detect the browser
 */
export type Browser = 'chrome' | 'firefox' | 'safari' | 'edge' | 'opera' | 'unknown';

export function detectBrowser(): Browser {
  const userAgent = navigator.userAgent.toLowerCase();

  if (userAgent.includes('edg/')) {
    return 'edge';
  } else if (userAgent.includes('chrome') && !userAgent.includes('edg/')) {
    return 'chrome';
  } else if (userAgent.includes('firefox')) {
    return 'firefox';
  } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
    return 'safari';
  } else if (userAgent.includes('opera') || userAgent.includes('opr/')) {
    return 'opera';
  }

  return 'unknown';
}

/**
 * Network status utilities
 */

export interface NetworkStatus {
  online: boolean;
  effectiveType?: '2g' | '3g' | '4g' | 'slow-2g' | 'unknown';
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

export function getNetworkStatus(): NetworkStatus {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

  return {
    online: navigator.onLine,
    effectiveType: connection?.effectiveType || 'unknown',
    downlink: connection?.downlink,
    rtt: connection?.rtt,
    saveData: connection?.saveData || false,
  };
}

export function isOnline(): boolean {
  return navigator.onLine;
}

export function isSlowConnection(): boolean {
  const status = getNetworkStatus();
  return (
    status.effectiveType === 'slow-2g' ||
    status.effectiveType === '2g' ||
    (status.rtt !== undefined && status.rtt > 500) ||
    (status.downlink !== undefined && status.downlink < 0.5)
  );
}

export function isSaveDataEnabled(): boolean {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  return connection?.saveData || false;
}

/**
 * Listen to network status changes
 */
export function onNetworkChange(callback: (online: boolean) => void): () => void {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

/**
 * Storage utilities
 */

export async function estimateStorageQuota(): Promise<{
  usage: number;
  quota: number;
  percentUsed: number;
}> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    const usage = estimate.usage || 0;
    const quota = estimate.quota || 0;
    const percentUsed = quota > 0 ? (usage / quota) * 100 : 0;

    return { usage, quota, percentUsed };
  }

  return { usage: 0, quota: 0, percentUsed: 0 };
}

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Request persistent storage
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if ('storage' in navigator && 'persist' in navigator.storage) {
    const isPersisted = await navigator.storage.persist();
    console.log(`Persistent storage ${isPersisted ? 'granted' : 'denied'}`);
    return isPersisted;
  }
  return false;
}

export async function isPersisted(): Promise<boolean> {
  if ('storage' in navigator && 'persisted' in navigator.storage) {
    return await navigator.storage.persisted();
  }
  return false;
}

/**
 * Display mode detection
 */
export type DisplayMode = 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';

export function getDisplayMode(): DisplayMode {
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return 'standalone';
  }
  if (window.matchMedia('(display-mode: fullscreen)').matches) {
    return 'fullscreen';
  }
  if (window.matchMedia('(display-mode: minimal-ui)').matches) {
    return 'minimal-ui';
  }
  return 'browser';
}

/**
 * Share API
 */
export interface ShareData {
  title?: string;
  text?: string;
  url?: string;
  files?: File[];
}

export function canShare(data?: ShareData): boolean {
  if (!('share' in navigator)) {
    return false;
  }

  if (data && 'canShare' in navigator) {
    return (navigator as any).canShare(data);
  }

  return true;
}

export async function share(data: ShareData): Promise<void> {
  if (!canShare(data)) {
    throw new Error('Web Share API is not supported');
  }

  try {
    await navigator.share(data);
    console.log('Shared successfully');
  } catch (error: any) {
    // User cancelled the share
    if (error.name === 'AbortError') {
      console.log('Share cancelled');
    } else {
      throw error;
    }
  }
}

/**
 * Clipboard API
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if ('clipboard' in navigator && 'writeText' in navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }

  // Fallback for older browsers
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard (fallback):', error);
    return false;
  }
}

/**
 * Wake Lock API (prevent screen from sleeping)
 */
let wakeLock: any = null;

export async function requestWakeLock(): Promise<boolean> {
  if (!('wakeLock' in navigator)) {
    console.warn('Wake Lock API is not supported');
    return false;
  }

  try {
    wakeLock = await (navigator as any).wakeLock.request('screen');
    console.log('Wake Lock acquired');

    wakeLock.addEventListener('release', () => {
      console.log('Wake Lock released');
    });

    return true;
  } catch (error) {
    console.error('Failed to acquire Wake Lock:', error);
    return false;
  }
}

export async function releaseWakeLock(): Promise<void> {
  if (wakeLock) {
    await wakeLock.release();
    wakeLock = null;
  }
}

/**
 * Badging API (app icon badge)
 */
export function isBadgingSupported(): boolean {
  return 'setAppBadge' in navigator;
}

export async function setBadge(count?: number): Promise<void> {
  if (!isBadgingSupported()) {
    console.warn('Badging API is not supported');
    return;
  }

  try {
    if (count !== undefined && count > 0) {
      await (navigator as any).setAppBadge(count);
    } else {
      await (navigator as any).setAppBadge();
    }
  } catch (error) {
    console.error('Failed to set badge:', error);
  }
}

export async function clearBadge(): Promise<void> {
  if (!isBadgingSupported()) {
    return;
  }

  try {
    await (navigator as any).clearAppBadge();
  } catch (error) {
    console.error('Failed to clear badge:', error);
  }
}

/**
 * Get PWA capabilities summary
 */
export interface PWACapabilities {
  isStandalone: boolean;
  isInstallable: boolean;
  serviceWorker: boolean;
  pushNotifications: boolean;
  backgroundSync: boolean;
  periodicSync: boolean;
  share: boolean;
  clipboard: boolean;
  wakeLock: boolean;
  badging: boolean;
  platform: Platform;
  browser: Browser;
  isMobile: boolean;
  displayMode: DisplayMode;
}

export function getPWACapabilities(): PWACapabilities {
  return {
    isStandalone: isStandalone(),
    isInstallable: isPWAInstallable(),
    serviceWorker: isServiceWorkerSupported(),
    pushNotifications: isPushNotificationSupported(),
    backgroundSync: isBackgroundSyncSupported(),
    periodicSync: isPeriodicSyncSupported(),
    share: canShare(),
    clipboard: 'clipboard' in navigator,
    wakeLock: 'wakeLock' in navigator,
    badging: isBadgingSupported(),
    platform: detectPlatform(),
    browser: detectBrowser(),
    isMobile: isMobileDevice(),
    displayMode: getDisplayMode(),
  };
}
