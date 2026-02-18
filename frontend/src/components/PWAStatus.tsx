/**
 * PWA Status Component
 * Shows PWA installation status, capabilities, and storage info
 */

import React, { useState, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  Download,
  HardDrive,
  CheckCircle,
  XCircle,
  Smartphone,
  Monitor,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import {
  getPWACapabilities,
  PWACapabilities,
  estimateStorageQuota,
  formatBytes,
  requestPersistentStorage,
  isPersisted,
} from '../lib/pwa-utils';
import { useNetworkStatus } from '../lib/networkMonitor';
import { isServiceWorkerActive, unregisterServiceWorker } from '../registerServiceWorker';

const PWAStatus: React.FC = () => {
  const [capabilities, setCapabilities] = useState<PWACapabilities | null>(null);
  const [storage, setStorage] = useState<{ usage: number; quota: number; percentUsed: number }>({
    usage: 0,
    quota: 0,
    percentUsed: 0,
  });
  const [isPersistentStorage, setIsPersistentStorage] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const networkStatus = useNetworkStatus();
  const swActive = isServiceWorkerActive();

  useEffect(() => {
    loadPWAStatus();
  }, []);

  const loadPWAStatus = async () => {
    setCapabilities(getPWACapabilities());

    const storageInfo = await estimateStorageQuota();
    setStorage(storageInfo);

    const persisted = await isPersisted();
    setIsPersistentStorage(persisted);
  };

  const handleRequestPersistentStorage = async () => {
    const granted = await requestPersistentStorage();
    setIsPersistentStorage(granted);
  };

  const handleRefreshStatus = async () => {
    setIsRefreshing(true);
    await loadPWAStatus();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleUnregisterSW = async () => {
    if (confirm('Are you sure you want to unregister the service worker? This will disable offline functionality.')) {
      await unregisterServiceWorker();
      alert('Service worker unregistered. Please refresh the page.');
    }
  };

  const handleClearCache = async () => {
    if (confirm('This will clear all cached data. Continue?')) {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
        alert('Cache cleared successfully!');
        await loadPWAStatus();
      }
    }
  };

  if (!capabilities) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">PWA Status</h2>
        <button
          onClick={handleRefreshStatus}
          disabled={isRefreshing}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Installation Status */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <Download className="w-5 h-5" />
          <span>Installation Status</span>
        </h3>

        <div className="space-y-3">
          <StatusItem
            label="Installed (Standalone)"
            value={capabilities.isStandalone}
            icon={capabilities.isStandalone ? <CheckCircle /> : <XCircle />}
          />
          <StatusItem
            label="Installable"
            value={capabilities.isInstallable}
            icon={capabilities.isInstallable ? <CheckCircle /> : <XCircle />}
          />
          <StatusItem
            label="Service Worker Active"
            value={swActive}
            icon={swActive ? <CheckCircle /> : <XCircle />}
          />
          <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-sm text-gray-600 dark:text-gray-400">Display Mode</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
              {capabilities.displayMode}
            </span>
          </div>
        </div>
      </div>

      {/* Network Status */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          {networkStatus.online ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
          <span>Network Status</span>
        </h3>

        <div className="space-y-3">
          <StatusItem
            label="Online"
            value={networkStatus.online}
            icon={networkStatus.online ? <CheckCircle /> : <XCircle />}
          />
          {networkStatus.online && (
            <>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">Connection Type</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white uppercase">
                  {networkStatus.effectiveType}
                </span>
              </div>
              {networkStatus.downlink && (
                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Downlink</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {networkStatus.downlink.toFixed(2)} Mbps
                  </span>
                </div>
              )}
              <StatusItem
                label="Slow Connection"
                value={networkStatus.isSlowConnection}
                icon={networkStatus.isSlowConnection ? <AlertCircle /> : <CheckCircle />}
              />
            </>
          )}
        </div>
      </div>

      {/* Platform & Browser */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          {capabilities.isMobile ? <Smartphone className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
          <span>Platform Information</span>
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-sm text-gray-600 dark:text-gray-400">Platform</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
              {capabilities.platform}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-sm text-gray-600 dark:text-gray-400">Browser</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
              {capabilities.browser}
            </span>
          </div>
          <StatusItem
            label="Mobile Device"
            value={capabilities.isMobile}
            icon={capabilities.isMobile ? <CheckCircle /> : <XCircle />}
          />
        </div>
      </div>

      {/* Storage */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <HardDrive className="w-5 h-5" />
          <span>Storage</span>
        </h3>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Used Storage</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {formatBytes(storage.usage)} / {formatBytes(storage.quota)}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(storage.percentUsed, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {storage.percentUsed.toFixed(2)}% used
            </p>
          </div>

          <StatusItem
            label="Persistent Storage"
            value={isPersistentStorage}
            icon={isPersistentStorage ? <CheckCircle /> : <XCircle />}
          />

          {!isPersistentStorage && (
            <button
              onClick={handleRequestPersistentStorage}
              className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors text-sm"
            >
              Request Persistent Storage
            </button>
          )}
        </div>
      </div>

      {/* Features Support */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Feature Support
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <StatusItem label="Push Notifications" value={capabilities.pushNotifications} />
          <StatusItem label="Background Sync" value={capabilities.backgroundSync} />
          <StatusItem label="Periodic Sync" value={capabilities.periodicSync} />
          <StatusItem label="Web Share" value={capabilities.share} />
          <StatusItem label="Clipboard" value={capabilities.clipboard} />
          <StatusItem label="Wake Lock" value={capabilities.wakeLock} />
          <StatusItem label="Badging" value={capabilities.badging} />
          <StatusItem label="Service Worker" value={capabilities.serviceWorker} />
        </div>
      </div>

      {/* Advanced Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Advanced Actions
        </h3>

        <div className="space-y-3">
          <button
            onClick={handleClearCache}
            className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors text-sm"
          >
            Clear All Cached Data
          </button>

          {swActive && (
            <button
              onClick={handleUnregisterSW}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors text-sm"
            >
              Unregister Service Worker
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

interface StatusItemProps {
  label: string;
  value: boolean;
  icon?: React.ReactNode;
}

const StatusItem: React.FC<StatusItemProps> = ({ label, value, icon }) => {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <div className="flex items-center space-x-2">
        <span
          className={`text-sm font-medium ${
            value
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {value ? 'Enabled' : 'Disabled'}
        </span>
        {icon && (
          <div
            className={`w-5 h-5 ${
              value
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default PWAStatus;
