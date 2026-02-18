/**
 * PrivacySettings Component
 * Manages privacy settings including data visibility and account deletion
 */

import { useState } from 'react';
import { useSettingsStore } from '../../stores/settingsStore';
import { useUIStore } from '../../stores/uiStore';

export default function PrivacySettings() {
  const { privacy, updatePrivacy } = useSettingsStore();
  const { openModal } = useUIStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const handleToggle = (key: 'showProfile' | 'shareProgress' | 'allowAnalytics') => {
    updatePrivacy({ [key]: !privacy[key] });
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      return;
    }

    try {
      // TODO: Implement account deletion API call
      const response = await fetch('/api/settings/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        // Logout and redirect
        window.location.href = '/';
      } else {
        alert('Failed to delete account. Please try again.');
      }
    } catch (error) {
      console.error('Account deletion error:', error);
      alert('An error occurred while deleting your account');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Privacy & Data
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Control your privacy settings and manage your data
        </p>
      </div>

      {/* Privacy Settings */}
      <div className="space-y-4">
        <div>
          <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Visibility Settings
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Control what information is visible to others
          </p>
        </div>

        <div className="space-y-3">
          {/* Show Profile */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-start space-x-3 flex-1">
              <svg
                className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <div className="flex-1">
                <label
                  htmlFor="showProfile"
                  className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer"
                >
                  Public Profile
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Allow others to view your profile information
                </p>
              </div>
            </div>
            <button
              id="showProfile"
              type="button"
              role="switch"
              aria-checked={privacy.showProfile}
              onClick={() => handleToggle('showProfile')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                privacy.showProfile ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  privacy.showProfile ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Share Progress */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-start space-x-3 flex-1">
              <svg
                className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <div className="flex-1">
                <label
                  htmlFor="shareProgress"
                  className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer"
                >
                  Share Progress
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Allow others to see your learning progress and achievements
                </p>
              </div>
            </div>
            <button
              id="shareProgress"
              type="button"
              role="switch"
              aria-checked={privacy.shareProgress}
              onClick={() => handleToggle('shareProgress')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                privacy.shareProgress ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  privacy.shareProgress ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Analytics */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
        <div>
          <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Data Collection
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Help us improve the platform
          </p>
        </div>

        <div className="space-y-3">
          {/* Allow Analytics */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-start space-x-3 flex-1">
              <svg
                className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <div className="flex-1">
                <label
                  htmlFor="allowAnalytics"
                  className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer"
                >
                  Usage Analytics
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Allow anonymous usage data to help improve the platform
                </p>
              </div>
            </div>
            <button
              id="allowAnalytics"
              type="button"
              role="switch"
              aria-checked={privacy.allowAnalytics}
              onClick={() => handleToggle('allowAnalytics')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                privacy.allowAnalytics ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  privacy.allowAnalytics ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-900 dark:text-blue-200">
            We collect anonymous usage data to understand how the platform is used and to improve
            the learning experience. No personal information is shared with third parties.
          </p>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
        <div>
          <h4 className="text-base font-semibold text-red-600 dark:text-red-400">Danger Zone</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Irreversible and destructive actions
          </p>
        </div>

        {!showDeleteConfirm ? (
          <div className="p-4 border-2 border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h5 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Delete Account
                </h5>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Permanently delete your account and all associated data. This action cannot be
                  undone.
                </p>
              </div>
              <button
                onClick={handleDeleteAccount}
                className="ml-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 border-2 border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 rounded-lg space-y-4">
            <div className="flex items-start space-x-3">
              <svg
                className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div className="flex-1">
                <h5 className="text-base font-semibold text-red-900 dark:text-red-200">
                  Are you absolutely sure?
                </h5>
                <p className="text-sm text-red-800 dark:text-red-300 mt-2">
                  This action will permanently delete your account, including:
                </p>
                <ul className="mt-2 space-y-1 text-sm text-red-800 dark:text-red-300">
                  <li>• All your learning progress and statistics</li>
                  <li>• All flashcard reviews and history</li>
                  <li>• All quiz and exercise submissions</li>
                  <li>• All personal information and settings</li>
                  <li>• All achievements and badges</li>
                </ul>
                <p className="text-sm text-red-800 dark:text-red-300 mt-3">
                  Type <span className="font-semibold">DELETE</span> to confirm:
                </p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="mt-2 w-full px-4 py-2 border-2 border-red-300 dark:border-red-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={confirmDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE'}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
              >
                I understand, delete my account
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText('');
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Privacy Policy Link */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 hover:underline">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <a href="/privacy-policy" className="cursor-pointer">
            Read our Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
}
