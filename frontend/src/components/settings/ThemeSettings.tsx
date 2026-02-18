/**
 * ThemeSettings Component
 * Allows users to switch between light, dark, and auto (system preference) themes
 */

import { useState, useEffect } from 'react';
import { useSettingsStore, getEffectiveTheme } from '../../stores/settingsStore';
import type { Theme } from '../../types/store';

export default function ThemeSettings() {
  const { theme, updateTheme } = useSettingsStore();
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

  // Listen to system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    // Initial check
    handleChange(mediaQuery);

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleThemeChange = (newTheme: Theme) => {
    updateTheme(newTheme);
  };

  const effectiveTheme = getEffectiveTheme();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Theme Preferences
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Choose how the application looks. Auto mode follows your system preference.
        </p>
      </div>

      {/* Theme Options */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Light Theme */}
        <button
          onClick={() => handleThemeChange('light')}
          className={`relative p-6 border-2 rounded-lg transition-all ${
            theme === 'light'
              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          <div className="flex flex-col items-center space-y-3">
            <div className="w-16 h-16 rounded-lg bg-white border-2 border-gray-300 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-yellow-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">Light</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Bright and clear</p>
            </div>
          </div>
          {theme === 'light' && (
            <div className="absolute top-2 right-2">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </button>

        {/* Dark Theme */}
        <button
          onClick={() => handleThemeChange('dark')}
          className={`relative p-6 border-2 rounded-lg transition-all ${
            theme === 'dark'
              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          <div className="flex flex-col items-center space-y-3">
            <div className="w-16 h-16 rounded-lg bg-gray-900 border-2 border-gray-700 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">Dark</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Easy on the eyes</p>
            </div>
          </div>
          {theme === 'dark' && (
            <div className="absolute top-2 right-2">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </button>

        {/* Auto Theme */}
        <button
          onClick={() => handleThemeChange('auto')}
          className={`relative p-6 border-2 rounded-lg transition-all ${
            theme === 'auto'
              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          <div className="flex flex-col items-center space-y-3">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-white to-gray-900 border-2 border-gray-400 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">Auto</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Follow system</p>
            </div>
          </div>
          {theme === 'auto' && (
            <div className="absolute top-2 right-2">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </button>
      </div>

      {/* Current Theme Info */}
      {theme === 'auto' && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start space-x-3">
            <svg
              className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                Auto mode enabled
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Currently using <span className="font-semibold">{systemTheme}</span> theme
                based on your system preference.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Preview Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Theme Preview
        </h4>
        <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h5 className="font-semibold text-gray-900 dark:text-gray-100">
                Sample Card
              </h5>
              <span className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded-full">
                Badge
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This is how text and elements will appear in the current theme.
            </p>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
              Sample Button
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
