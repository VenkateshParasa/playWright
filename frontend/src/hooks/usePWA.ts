/**
 * Custom React Hooks for PWA Features
 */

import { useState, useEffect, useCallback } from 'react';
import {
  isStandalone,
  isPWAInstallable,
  getDisplayMode,
  estimateStorageQuota,
  isPersisted,
  getPWACapabilities,
  PWACapabilities,
} from '../lib/pwa-utils';

/**
 * Hook to check if app is installed (running in standalone mode)
 */
export function useIsInstalled(): boolean {
  const [installed, setInstalled] = useState(() => isStandalone());

  useEffect(() => {
    // Check on mount and when display mode changes
    const checkInstalled = () => {
      setInstalled(isStandalone());
    };

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', checkInstalled);

    return () => {
      mediaQuery.removeEventListener('change', checkInstalled);
    };
  }, []);

  return installed;
}

/**
 * Hook to check if app is installable
 */
export function useIsInstallable(): boolean {
  const [installable, setInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallable(true);
    };

    const handleAppInstalled = () => {
      setInstallable(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Initial check
    setInstallable(isPWAInstallable());

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  return installable;
}

/**
 * Hook to get current display mode
 */
export function useDisplayMode() {
  const [displayMode, setDisplayMode] = useState(() => getDisplayMode());

  useEffect(() => {
    const modes = ['standalone', 'fullscreen', 'minimal-ui', 'browser'];

    const handlers = modes.map((mode) => {
      const mediaQuery = window.matchMedia(`(display-mode: ${mode})`);
      const handler = (e: MediaQueryListEvent) => {
        if (e.matches) {
          setDisplayMode(mode as any);
        }
      };
      mediaQuery.addEventListener('change', handler);
      return { mediaQuery, handler };
    });

    return () => {
      handlers.forEach(({ mediaQuery, handler }) => {
        mediaQuery.removeEventListener('change', handler);
      });
    };
  }, []);

  return displayMode;
}

/**
 * Hook to monitor storage quota
 */
export function useStorageQuota() {
  const [storage, setStorage] = useState({
    usage: 0,
    quota: 0,
    percentUsed: 0,
  });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const quota = await estimateStorageQuota();
      setStorage(quota);
    } catch (error) {
      console.error('Failed to get storage quota:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    // Refresh every minute
    const interval = setInterval(refresh, 60000);

    return () => clearInterval(interval);
  }, [refresh]);

  return { ...storage, loading, refresh };
}

/**
 * Hook to check if storage is persisted
 */
export function useIsPersisted() {
  const [persisted, setPersisted] = useState(false);
  const [loading, setLoading] = useState(true);

  const check = useCallback(async () => {
    setLoading(true);
    try {
      const result = await isPersisted();
      setPersisted(result);
    } catch (error) {
      console.error('Failed to check persistence:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  return { persisted, loading, check };
}

/**
 * Hook to get all PWA capabilities
 */
export function usePWACapabilities() {
  const [capabilities, setCapabilities] = useState<PWACapabilities | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    try {
      const caps = getPWACapabilities();
      setCapabilities(caps);
    } catch (error) {
      console.error('Failed to get PWA capabilities:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { capabilities, loading, refresh };
}

/**
 * Hook for service worker update detection
 */
export function useServiceWorkerUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const handleUpdateAvailable = () => {
      setUpdateAvailable(true);
    };

    window.addEventListener('sw-update-available', handleUpdateAvailable);

    return () => {
      window.removeEventListener('sw-update-available', handleUpdateAvailable);
    };
  }, []);

  const update = useCallback(() => {
    setIsUpdating(true);
    // Import dynamically to avoid circular dependencies
    import('../registerServiceWorker').then(({ updateServiceWorker }) => {
      updateServiceWorker();
    });
  }, []);

  const dismiss = useCallback(() => {
    setUpdateAvailable(false);
  }, []);

  return {
    updateAvailable,
    isUpdating,
    update,
    dismiss,
  };
}

/**
 * Hook for offline ready detection
 */
export function useOfflineReady() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const handleOfflineReady = () => {
      setIsReady(true);
    };

    window.addEventListener('sw-offline-ready', handleOfflineReady);

    return () => {
      window.removeEventListener('sw-offline-ready', handleOfflineReady);
    };
  }, []);

  return isReady;
}

/**
 * Hook to detect when app visibility changes
 */
export function useVisibilityChange(callback: (visible: boolean) => void) {
  useEffect(() => {
    const handleVisibilityChange = () => {
      callback(document.visibilityState === 'visible');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [callback]);
}

/**
 * Hook to detect when user is idle
 */
export function useIdleDetection(timeout: number = 60000) {
  const [isIdle, setIsIdle] = useState(false);

  useEffect(() => {
    let idleTimer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(idleTimer);
      setIsIdle(false);
      idleTimer = setTimeout(() => setIsIdle(true), timeout);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

    events.forEach((event) => {
      document.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      clearTimeout(idleTimer);
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [timeout]);

  return isIdle;
}

/**
 * Hook to check if app is running on battery
 */
export function useBatteryStatus() {
  const [battery, setBattery] = useState<{
    charging: boolean;
    level: number;
    chargingTime: number;
    dischargingTime: number;
  } | null>(null);

  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const updateBattery = () => {
          setBattery({
            charging: battery.charging,
            level: battery.level,
            chargingTime: battery.chargingTime,
            dischargingTime: battery.dischargingTime,
          });
        };

        updateBattery();

        battery.addEventListener('chargingchange', updateBattery);
        battery.addEventListener('levelchange', updateBattery);

        return () => {
          battery.removeEventListener('chargingchange', updateBattery);
          battery.removeEventListener('levelchange', updateBattery);
        };
      });
    }
  }, []);

  return battery;
}

/**
 * Hook to manage app badge
 */
export function useAppBadge() {
  const [count, setCount] = useState(0);

  const setBadge = useCallback(async (newCount: number) => {
    setCount(newCount);

    if ('setAppBadge' in navigator) {
      try {
        if (newCount > 0) {
          await (navigator as any).setAppBadge(newCount);
        } else {
          await (navigator as any).clearAppBadge();
        }
      } catch (error) {
        console.error('Failed to set badge:', error);
      }
    }
  }, []);

  const clearBadge = useCallback(async () => {
    await setBadge(0);
  }, [setBadge]);

  const incrementBadge = useCallback(async () => {
    await setBadge(count + 1);
  }, [count, setBadge]);

  return {
    count,
    setBadge,
    clearBadge,
    incrementBadge,
  };
}

/**
 * Hook to manage wake lock
 */
export function useWakeLock() {
  const [isLocked, setIsLocked] = useState(false);
  const [wakeLock, setWakeLock] = useState<any>(null);

  const request = useCallback(async () => {
    if (!('wakeLock' in navigator)) {
      console.warn('Wake Lock API not supported');
      return false;
    }

    try {
      const lock = await (navigator as any).wakeLock.request('screen');
      setWakeLock(lock);
      setIsLocked(true);

      lock.addEventListener('release', () => {
        setIsLocked(false);
        setWakeLock(null);
      });

      return true;
    } catch (error) {
      console.error('Failed to acquire wake lock:', error);
      return false;
    }
  }, []);

  const release = useCallback(async () => {
    if (wakeLock) {
      try {
        await wakeLock.release();
        setIsLocked(false);
        setWakeLock(null);
      } catch (error) {
        console.error('Failed to release wake lock:', error);
      }
    }
  }, [wakeLock]);

  // Auto-release on unmount
  useEffect(() => {
    return () => {
      if (wakeLock) {
        wakeLock.release();
      }
    };
  }, [wakeLock]);

  return {
    isLocked,
    request,
    release,
  };
}
