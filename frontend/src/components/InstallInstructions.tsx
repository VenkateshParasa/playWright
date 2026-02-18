/**
 * InstallInstructions Component
 * Platform-specific installation instructions for PWA
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Monitor,
  Chrome,
  Share2,
  PlusSquare,
  MoreVertical,
  Menu,
  Download,
} from 'lucide-react';

interface InstallInstructionsProps {
  onClose: () => void;
}

type Platform = 'ios' | 'android' | 'chrome-desktop' | 'edge-desktop' | 'other';

interface Instruction {
  platform: Platform;
  title: string;
  icon: React.ReactNode;
  steps: {
    step: number;
    text: string;
    icon?: React.ReactNode;
  }[];
}

const InstallInstructions: React.FC<InstallInstructionsProps> = ({ onClose }) => {
  const [detectedPlatform, setDetectedPlatform] = useState<Platform>('other');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isChrome = /chrome/.test(userAgent) && !/edge/.test(userAgent);
    const isEdge = /edge/.test(userAgent);

    if (isIOS) {
      setDetectedPlatform('ios');
    } else if (isAndroid) {
      setDetectedPlatform('android');
    } else if (isChrome) {
      setDetectedPlatform('chrome-desktop');
    } else if (isEdge) {
      setDetectedPlatform('edge-desktop');
    }

    // Animate in
    setTimeout(() => setIsVisible(true), 50);
  }, []);

  const instructions: Instruction[] = [
    {
      platform: 'ios',
      title: 'iOS (Safari)',
      icon: <Smartphone className="w-6 h-6" />,
      steps: [
        {
          step: 1,
          text: 'Tap the Share button at the bottom of Safari',
          icon: <Share2 className="w-5 h-5 text-indigo-600" />,
        },
        {
          step: 2,
          text: 'Scroll down and tap "Add to Home Screen"',
          icon: <PlusSquare className="w-5 h-5 text-indigo-600" />,
        },
        {
          step: 3,
          text: 'Tap "Add" in the top right corner',
        },
        {
          step: 4,
          text: 'The app will appear on your home screen',
        },
      ],
    },
    {
      platform: 'android',
      title: 'Android (Chrome)',
      icon: <Smartphone className="w-6 h-6" />,
      steps: [
        {
          step: 1,
          text: 'Tap the menu button (three dots) in the top right',
          icon: <MoreVertical className="w-5 h-5 text-indigo-600" />,
        },
        {
          step: 2,
          text: 'Tap "Install app" or "Add to Home screen"',
          icon: <Download className="w-5 h-5 text-indigo-600" />,
        },
        {
          step: 3,
          text: 'Tap "Install" in the popup dialog',
        },
        {
          step: 4,
          text: 'The app will be added to your home screen and app drawer',
        },
      ],
    },
    {
      platform: 'chrome-desktop',
      title: 'Desktop (Chrome)',
      icon: <Monitor className="w-6 h-6" />,
      steps: [
        {
          step: 1,
          text: 'Click the install icon in the address bar (right side)',
          icon: <Download className="w-5 h-5 text-indigo-600" />,
        },
        {
          step: 2,
          text: 'Or click the menu button (three dots) and select "Install Test Automation Academy"',
          icon: <Menu className="w-5 h-5 text-indigo-600" />,
        },
        {
          step: 3,
          text: 'Click "Install" in the confirmation dialog',
        },
        {
          step: 4,
          text: 'The app will open in a new window and be added to your apps',
        },
      ],
    },
    {
      platform: 'edge-desktop',
      title: 'Desktop (Edge)',
      icon: <Monitor className="w-6 h-6" />,
      steps: [
        {
          step: 1,
          text: 'Click the app icon in the address bar',
          icon: <Download className="w-5 h-5 text-indigo-600" />,
        },
        {
          step: 2,
          text: 'Or click Settings and more (...) and select "Apps" > "Install this site as an app"',
        },
        {
          step: 3,
          text: 'Click "Install" in the dialog',
        },
        {
          step: 4,
          text: 'The app will be available in your Start menu and taskbar',
        },
      ],
    },
  ];

  const currentInstructions =
    instructions.find((i) => i.platform === detectedPlatform) || instructions[2];

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none`}
      >
        <div
          className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto pointer-events-auto transition-all duration-300 ${
            isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 rounded-lg p-2">
                <Download className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-white text-xl font-bold">How to Install</h2>
                <p className="text-white text-opacity-90 text-sm">
                  Add this app to your device
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Close instructions"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Platform selector */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">
                Select Your Platform
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {instructions.map((instruction) => (
                  <button
                    key={instruction.platform}
                    onClick={() => setDetectedPlatform(instruction.platform)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      detectedPlatform === instruction.platform
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div
                      className={`flex flex-col items-center space-y-1 ${
                        detectedPlatform === instruction.platform
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {instruction.icon}
                      <span className="text-xs font-medium text-center">
                        {instruction.title}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                {currentInstructions.icon}
                <span>{currentInstructions.title} Installation</span>
              </h3>

              <div className="space-y-4">
                {currentInstructions.steps.map((step) => (
                  <div key={step.step} className="flex items-start space-x-4">
                    {/* Step number */}
                    <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                      {step.step}
                    </div>

                    {/* Step content */}
                    <div className="flex-1 pt-1">
                      <div className="flex items-start space-x-2">
                        {step.icon && <div className="flex-shrink-0 mt-0.5">{step.icon}</div>}
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {step.text}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional info */}
            <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  <svg
                    className="w-5 h-5 text-blue-600 dark:text-blue-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    Why Install?
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                    Installing the app gives you faster access, offline functionality, and a
                    native app experience. Your progress syncs automatically when you're back
                    online.
                  </p>
                </div>
              </div>
            </div>

            {/* Troubleshooting */}
            <details className="mt-4">
              <summary className="text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Troubleshooting
              </summary>
              <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 space-y-2 pl-4">
                <p>
                  <strong>Don't see the install option?</strong> Make sure you're using a
                  supported browser (Chrome, Safari, Edge, or Firefox).
                </p>
                <p>
                  <strong>Already installed?</strong> Check your home screen, app drawer, or
                  desktop for the app icon.
                </p>
                <p>
                  <strong>Need to uninstall?</strong> Long-press the app icon and select
                  "Remove" or uninstall from your browser's app management settings.
                </p>
              </div>
            </details>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleClose}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstallInstructions;
