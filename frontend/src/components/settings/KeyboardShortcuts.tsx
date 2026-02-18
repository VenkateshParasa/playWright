/**
 * KeyboardShortcuts Component
 * Displays available keyboard shortcuts and allows customization
 */

import { useState } from 'react';
import { areKeyboardShortcutsEnabled } from '../../stores/settingsStore';

interface Shortcut {
  category: string;
  shortcuts: Array<{
    keys: string[];
    description: string;
    customizable: boolean;
  }>;
}

export default function KeyboardShortcuts() {
  const enabled = areKeyboardShortcutsEnabled();

  const shortcuts: Shortcut[] = [
    {
      category: 'Navigation',
      shortcuts: [
        { keys: ['G', 'H'], description: 'Go to Home/Dashboard', customizable: false },
        { keys: ['G', 'L'], description: 'Go to Lessons', customizable: false },
        { keys: ['G', 'F'], description: 'Go to Flashcards', customizable: false },
        { keys: ['G', 'S'], description: 'Go to Settings', customizable: false },
        { keys: ['/', '?'], description: 'Open search', customizable: false },
      ],
    },
    {
      category: 'Flashcard Review',
      shortcuts: [
        { keys: ['Space'], description: 'Flip card', customizable: false },
        { keys: ['1'], description: 'Rate: Again', customizable: true },
        { keys: ['2'], description: 'Rate: Hard', customizable: true },
        { keys: ['3'], description: 'Rate: Good', customizable: true },
        { keys: ['4'], description: 'Rate: Easy', customizable: true },
        { keys: ['5'], description: 'Rate: Perfect', customizable: true },
        { keys: ['U'], description: 'Undo last rating', customizable: false },
        { keys: ['S'], description: 'Skip card', customizable: false },
      ],
    },
    {
      category: 'Lesson Player',
      shortcuts: [
        { keys: ['N'], description: 'Next section', customizable: false },
        { keys: ['P'], description: 'Previous section', customizable: false },
        { keys: ['M'], description: 'Mark as complete', customizable: false },
        { keys: ['B'], description: 'Toggle bookmark', customizable: false },
        { keys: ['T'], description: 'Toggle table of contents', customizable: false },
      ],
    },
    {
      category: 'Quiz & Exercises',
      shortcuts: [
        { keys: ['→'], description: 'Next question', customizable: false },
        { keys: ['←'], description: 'Previous question', customizable: false },
        { keys: ['Enter'], description: 'Submit answer', customizable: false },
        { keys: ['H'], description: 'Show hint', customizable: false },
        { keys: ['R'], description: 'Run code (exercises)', customizable: false },
      ],
    },
    {
      category: 'General',
      shortcuts: [
        { keys: ['Ctrl/Cmd', 'K'], description: 'Open command palette', customizable: false },
        { keys: ['Ctrl/Cmd', 'S'], description: 'Save changes', customizable: false },
        { keys: ['Esc'], description: 'Close modal/dialog', customizable: false },
        { keys: ['?'], description: 'Show keyboard shortcuts', customizable: false },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Keyboard Shortcuts
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Learn keyboard shortcuts to navigate and use the platform more efficiently
        </p>
      </div>

      {!enabled && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start space-x-3">
            <svg
              className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5"
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
            <div>
              <p className="text-sm font-medium text-yellow-900 dark:text-yellow-200">
                Keyboard shortcuts are currently disabled
              </p>
              <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">
                Enable them in Study Settings to use these shortcuts.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Shortcuts List */}
      <div className="space-y-8">
        {shortcuts.map((category) => (
          <div key={category.category} className="space-y-4">
            <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {category.category}
            </h4>

            <div className="space-y-2">
              {category.shortcuts.map((shortcut, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    enabled
                      ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                      : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 opacity-60'
                  }`}
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {shortcut.description}
                    </p>
                    {shortcut.customizable && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Customizable
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {shortcut.keys.map((key, keyIndex) => (
                      <span key={keyIndex} className="flex items-center space-x-1">
                        <kbd className="px-3 py-1.5 text-sm font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm">
                          {key}
                        </kbd>
                        {keyIndex < shortcut.keys.length - 1 && (
                          <span className="text-gray-400 dark:text-gray-500">+</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Print Shortcuts */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg text-sm font-medium transition-colors inline-flex items-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            />
          </svg>
          <span>Print Shortcut Reference</span>
        </button>
      </div>

      {/* Tips */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start space-x-3">
            <svg
              className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0"
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
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                Shortcut Tips
              </h4>
              <ul className="mt-2 space-y-1 text-sm text-blue-800 dark:text-blue-300">
                <li>• Press <kbd className="px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-800 rounded">?</kbd> anytime to see available shortcuts</li>
                <li>• Most shortcuts work when keyboard shortcuts are enabled</li>
                <li>• Some shortcuts may vary based on your operating system</li>
                <li>• Customizable shortcuts can be changed in future updates</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
