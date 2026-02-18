/**
 * StudySettings Component
 * Manages study preferences including daily review limit and study reminders
 */

import { useState } from 'react';
import { useSettingsStore } from '../../stores/settingsStore';

export default function StudySettings() {
  const { study, updateStudyPreferences } = useSettingsStore();
  const [dailyLimit, setDailyLimit] = useState(study.dailyReviewLimit.toString());

  const handleDailyLimitChange = (value: string) => {
    setDailyLimit(value);
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0 && numValue <= 500) {
      updateStudyPreferences({ dailyReviewLimit: numValue });
    }
  };

  const handleReminderTimeChange = (time: string) => {
    updateStudyPreferences({ reminderTime: time });
  };

  const handleToggle = (key: 'studyReminders' | 'autoPlayVideos' | 'showHints' | 'keyboardShortcuts') => {
    updateStudyPreferences({ [key]: !study[key] });
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Study Preferences
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Customize your learning experience and set study goals
        </p>
      </div>

      {/* Daily Review Limit */}
      <div className="space-y-4">
        <div>
          <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Daily Review Limit
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Maximum number of flashcards to review per day
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="10"
              max="500"
              step="10"
              value={dailyLimit}
              onChange={(e) => handleDailyLimitChange(e.target.value)}
              className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="10"
                max="500"
                value={dailyLimit}
                onChange={(e) => handleDailyLimitChange(e.target.value)}
                className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">cards</span>
            </div>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              Setting a daily limit helps maintain consistent study habits. Recommended: 50-100
              cards per day.
            </p>
          </div>
        </div>
      </div>

      {/* Study Reminders */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
        <div>
          <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Study Reminders
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Get reminded to study at a specific time each day
          </p>
        </div>

        <div className="space-y-4">
          {/* Enable Reminders Toggle */}
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
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <div className="flex-1">
                <label
                  htmlFor="studyReminders"
                  className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer"
                >
                  Enable Study Reminders
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Receive daily reminders to maintain your study streak
                </p>
              </div>
            </div>
            <button
              id="studyReminders"
              type="button"
              role="switch"
              aria-checked={study.studyReminders}
              onClick={() => handleToggle('studyReminders')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                study.studyReminders ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  study.studyReminders ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Reminder Time */}
          {study.studyReminders && (
            <div className="pl-4 space-y-3">
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                Reminder Time
              </label>
              <input
                type="time"
                value={study.reminderTime || '09:00'}
                onChange={(e) => handleReminderTimeChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Learning Experience */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
        <div>
          <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Learning Experience
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Customize how content is displayed and interacted with
          </p>
        </div>

        <div className="space-y-3">
          {/* Auto-play Videos */}
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
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <label
                  htmlFor="autoPlayVideos"
                  className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer"
                >
                  Auto-play Videos
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Automatically start videos when viewing lessons
                </p>
              </div>
            </div>
            <button
              id="autoPlayVideos"
              type="button"
              role="switch"
              aria-checked={study.autoPlayVideos}
              onClick={() => handleToggle('autoPlayVideos')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                study.autoPlayVideos ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  study.autoPlayVideos ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Show Hints */}
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
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              <div className="flex-1">
                <label
                  htmlFor="showHints"
                  className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer"
                >
                  Show Hints
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Display helpful hints during exercises and quizzes
                </p>
              </div>
            </div>
            <button
              id="showHints"
              type="button"
              role="switch"
              aria-checked={study.showHints}
              onClick={() => handleToggle('showHints')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                study.showHints ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  study.showHints ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Keyboard Shortcuts */}
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
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
              <div className="flex-1">
                <label
                  htmlFor="keyboardShortcuts"
                  className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer"
                >
                  Keyboard Shortcuts
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Enable keyboard shortcuts for faster navigation
                </p>
              </div>
            </div>
            <button
              id="keyboardShortcuts"
              type="button"
              role="switch"
              aria-checked={study.keyboardShortcuts}
              onClick={() => handleToggle('keyboardShortcuts')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                study.keyboardShortcuts ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  study.keyboardShortcuts ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Study Tips */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-start space-x-3">
            <svg
              className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-green-900 dark:text-green-200">
                Study Tips
              </h4>
              <ul className="mt-2 space-y-1 text-sm text-green-800 dark:text-green-300">
                <li>• Study at the same time each day to build a habit</li>
                <li>• Take short breaks between review sessions</li>
                <li>• Review cards even when you think you know them</li>
                <li>• Be honest with quality ratings for best results</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
