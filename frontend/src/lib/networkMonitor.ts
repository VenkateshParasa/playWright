/**
 * Network Monitor
 * Monitors network connectivity and provides offline/online status
 */

import { useEffect, useState, useCallback } from 'react';
import { getNetworkStatus, isOnline, isSlowConnection, NetworkStatus } from './pwa-utils';

export interface NetworkState extends NetworkStatus {
  isSlowConnection: boolean;
}

/**
 * React hook to monitor network status
 */
export function useNetworkStatus(): NetworkState {
  const [networkState, setNetworkState] = useState<NetworkState>(() => ({
    ...getNetworkStatus(),
    isSlowConnection: isSlowConnection(),
  }));

  const updateNetworkStatus = useCallback(() => {
    setNetworkState({
      ...getNetworkStatus(),
      isSlowConnection: isSlowConnection(),
    });
  }, []);

  useEffect(() => {
    // Update on mount
    updateNetworkStatus();

    // Listen for online/offline events
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    // Listen for connection change events
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;

    if (connection) {
      connection.addEventListener('change', updateNetworkStatus);
    }

    // Cleanup
    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);

      if (connection) {
        connection.removeEventListener('change', updateNetworkStatus);
      }
    };
  }, [updateNetworkStatus]);

  return networkState;
}

/**
 * React hook to detect when going offline/online
 */
export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(() => isOnline());

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return online;
}

/**
 * Network status indicator component
 */
export interface NetworkIndicatorProps {
  showWhenOnline?: boolean;
  position?: 'top' | 'bottom';
}

/**
 * Offline banner component
 */
import React from 'react';
import { WifiOff, Wifi, Signal } from 'lucide-react';

export const NetworkIndicator: React.FC<NetworkIndicatorProps> = ({
  showWhenOnline = false,
  position = 'top',
}) => {
  const networkState = useNetworkStatus();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!networkState.online) {
      setVisible(true);
    } else if (networkState.isSlowConnection && showWhenOnline) {
      setVisible(true);
    } else {
      // Show "back online" message briefly
      if (visible) {
        setTimeout(() => setVisible(false), 3000);
      }
    }
  }, [networkState.online, networkState.isSlowConnection, showWhenOnline, visible]);

  if (!visible && (networkState.online && !networkState.isSlowConnection)) {
    return null;
  }

  const positionClasses = position === 'top' ? 'top-0' : 'bottom-0';

  return (
    <div
      className={`fixed left-0 right-0 ${positionClasses} z-50 transition-transform duration-300 ${
        visible ? 'translate-y-0' : position === 'top' ? '-translate-y-full' : 'translate-y-full'
      }`}
      role="alert"
      aria-live="polite"
    >
      {!networkState.online ? (
        <div className="bg-red-500 text-white px-4 py-2 text-center">
          <div className="flex items-center justify-center space-x-2">
            <WifiOff className="w-5 h-5" />
            <span className="font-medium">You are offline</span>
            <span className="text-red-100 text-sm">- Cached content available</span>
          </div>
        </div>
      ) : networkState.isSlowConnection ? (
        <div className="bg-yellow-500 text-white px-4 py-2 text-center">
          <div className="flex items-center justify-center space-x-2">
            <Signal className="w-5 h-5" />
            <span className="font-medium">Slow connection detected</span>
            <span className="text-yellow-100 text-sm">
              - {networkState.effectiveType?.toUpperCase()}
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-green-500 text-white px-4 py-2 text-center">
          <div className="flex items-center justify-center space-x-2">
            <Wifi className="w-5 h-5" />
            <span className="font-medium">Back online</span>
            <span className="text-green-100 text-sm">- Syncing your progress...</span>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Queue manager for offline requests
 */
export class OfflineRequestQueue {
  private queue: Array<{
    id: string;
    url: string;
    method: string;
    body?: any;
    headers?: Record<string, string>;
    timestamp: number;
    retries: number;
  }> = [];

  private maxRetries = 3;
  private retryDelay = 1000; // Start with 1 second

  constructor() {
    // Load queue from localStorage on initialization
    this.loadQueue();

    // Listen for online event to process queue
    window.addEventListener('online', () => this.processQueue());
  }

  /**
   * Add request to queue
   */
  async add(
    url: string,
    method: string = 'POST',
    body?: any,
    headers?: Record<string, string>
  ): Promise<void> {
    const request = {
      id: `${Date.now()}-${Math.random()}`,
      url,
      method,
      body,
      headers,
      timestamp: Date.now(),
      retries: 0,
    };

    this.queue.push(request);
    await this.saveQueue();

    console.log('Request queued for offline sync:', request);
  }

  /**
   * Process all queued requests
   */
  async processQueue(): Promise<void> {
    if (!isOnline() || this.queue.length === 0) {
      return;
    }

    console.log(`Processing ${this.queue.length} queued requests...`);

    const results = await Promise.allSettled(
      this.queue.map((request) => this.processRequest(request))
    );

    // Remove successful requests from queue
    this.queue = this.queue.filter((request, index) => {
      const result = results[index];
      if (result.status === 'fulfilled' && result.value) {
        return false; // Remove from queue
      }
      return true; // Keep in queue
    });

    await this.saveQueue();

    const successCount = results.filter((r) => r.status === 'fulfilled' && r.value).length;
    console.log(`Processed ${successCount} requests successfully`);
  }

  /**
   * Process a single request
   */
  private async processRequest(request: typeof this.queue[0]): Promise<boolean> {
    try {
      const response = await fetch(request.url, {
        method: request.method,
        headers: {
          'Content-Type': 'application/json',
          ...request.headers,
        },
        body: request.body ? JSON.stringify(request.body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      console.log('Request processed successfully:', request.id);
      return true;
    } catch (error) {
      console.error('Failed to process request:', request.id, error);

      // Increment retry count
      request.retries++;

      // Remove if max retries exceeded
      if (request.retries >= this.maxRetries) {
        console.warn('Max retries exceeded for request:', request.id);
        return true; // Remove from queue
      }

      // Exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, this.retryDelay * Math.pow(2, request.retries))
      );

      return false; // Keep in queue for retry
    }
  }

  /**
   * Get queue status
   */
  getStatus(): {
    count: number;
    oldestTimestamp: number | null;
  } {
    return {
      count: this.queue.length,
      oldestTimestamp: this.queue.length > 0 ? Math.min(...this.queue.map((r) => r.timestamp)) : null,
    };
  }

  /**
   * Clear queue
   */
  async clear(): Promise<void> {
    this.queue = [];
    await this.saveQueue();
  }

  /**
   * Save queue to localStorage
   */
  private async saveQueue(): Promise<void> {
    try {
      localStorage.setItem('offline-request-queue', JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  /**
   * Load queue from localStorage
   */
  private loadQueue(): void {
    try {
      const saved = localStorage.getItem('offline-request-queue');
      if (saved) {
        this.queue = JSON.parse(saved);
        console.log(`Loaded ${this.queue.length} requests from offline queue`);
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
      this.queue = [];
    }
  }
}

// Export singleton instance
export const offlineQueue = new OfflineRequestQueue();
