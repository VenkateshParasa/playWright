/**
 * InstallPrompt Component
 * Custom UI for PWA installation prompt (Add to Home Screen)
 */

import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor, HelpCircle } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallPromptProps {
  onInstallSuccess?: () => void;
  onInstallDismiss?: () => void;
  showInstructions?: () => void;
}

const InstallPrompt: React.FC<InstallPromptProps> = ({
  onInstallSuccess,
  onInstallDismiss,
  showInstructions,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [platform, setPlatform] = useState<'mobile' | 'desktop'>('desktop');

  useEffect(() => {
    // Check if app is already installed/running in standalone mode
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://');

    setIsStandalone(standalone);

    // Detect platform
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    setPlatform(isMobile ? 'mobile' : 'desktop');

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the default mini-infobar from appearing
      e.preventDefault();

      // Store the event for later use
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);

      // Show custom install prompt after a delay (better UX)
      setTimeout(() => {
        setIsVisible(true);
      }, 3000);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setDeferredPrompt(null);
      setIsVisible(false);
      onInstallSuccess?.();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [onInstallSuccess]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Show instructions if prompt is not available
      showInstructions?.();
      return;
    }

    setIsInstalling(true);

    try {
      // Show the install prompt
      await deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;

      console.log(`User response to install prompt: ${outcome}`);

      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        onInstallSuccess?.();
      } else {
        console.log('User dismissed the install prompt');
        onInstallDismiss?.();
      }

      // Clear the saved prompt
      setDeferredPrompt(null);
      setIsVisible(false);
    } catch (error) {
      console.error('Error showing install prompt:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onInstallDismiss?.();

    // Don't show again for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already installed or dismissed
  if (
    isStandalone ||
    !isVisible ||
    sessionStorage.getItem('pwa-install-dismissed') === 'true'
  ) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
      role="dialog"
      aria-labelledby="install-title"
      aria-describedby="install-description"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Download className="w-5 h-5 text-white" />
            <h3 id="install-title" className="text-white font-semibold">
              Install App
            </h3>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white hover:text-gray-200 transition-colors"
            aria-label="Close install prompt"
            disabled={isInstalling}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <p id="install-description" className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            Install Test Automation Academy for quick access and a native app experience. Works
            offline and syncs your progress across devices.
          </p>

          {/* Benefits */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mb-4 space-y-2">
            <div className="flex items-start space-x-2 text-sm">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
              <span className="text-gray-700 dark:text-gray-300">
                Quick access from home screen
              </span>
            </div>
            <div className="flex items-start space-x-2 text-sm">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
              <span className="text-gray-700 dark:text-gray-300">Works offline with cached content</span>
            </div>
            <div className="flex items-start space-x-2 text-sm">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
              <span className="text-gray-700 dark:text-gray-300">Faster loading and native feel</span>
            </div>
            <div className="flex items-start space-x-2 text-sm">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
              <span className="text-gray-700 dark:text-gray-300">No app store required</span>
            </div>
          </div>

          {/* Platform indicator */}
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
            {platform === 'mobile' ? (
              <>
                <Smartphone className="w-4 h-4" />
                <span>Mobile optimized</span>
              </>
            ) : (
              <>
                <Monitor className="w-4 h-4" />
                <span>Desktop optimized</span>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleInstallClick}
              disabled={isInstalling}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-indigo-400 disabled:to-purple-400 text-white font-semibold px-5 py-3 rounded-lg transition-all flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
            >
              {isInstalling ? (
                <>
                  <Download className="w-5 h-5 animate-bounce" />
                  <span>Installing...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>Install Now</span>
                </>
              )}
            </button>

            {showInstructions && (
              <button
                onClick={showInstructions}
                disabled={isInstalling}
                className="px-4 py-3 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors font-medium flex items-center justify-center space-x-1"
              >
                <HelpCircle className="w-4 h-4" />
                <span>How to Install</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer hint */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 px-4 py-2 text-xs text-gray-600 dark:text-gray-400 text-center">
          Takes less than 5 seconds - No personal info required
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
