/**
 * UpdateNotification Component
 * Displays a notification when a new version of the app is available
 */

import React, { useState, useEffect } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { updateServiceWorker } from '../registerServiceWorker';

interface UpdateNotificationProps {
  onClose?: () => void;
}

const UpdateNotification: React.FC<UpdateNotificationProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Show notification with a slight delay for better UX
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleUpdate = () => {
    setIsUpdating(true);
    updateServiceWorker();
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 300);
  };

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
      role="alert"
      aria-live="assertive"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-5 h-5 text-white" />
            <h3 className="text-white font-semibold">Update Available</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-200 transition-colors"
            aria-label="Close notification"
            disabled={isUpdating}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
            A new version of the Test Automation Academy is available. Update now to get the latest
            features and improvements.
          </p>

          <div className="flex space-x-3">
            <button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Update Now</span>
                </>
              )}
            </button>

            <button
              onClick={handleClose}
              disabled={isUpdating}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
            >
              Later
            </button>
          </div>
        </div>

        {/* Info footer */}
        <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2 text-xs text-gray-600 dark:text-gray-400">
          The app will reload after the update
        </div>
      </div>
    </div>
  );
};

export default UpdateNotification;
