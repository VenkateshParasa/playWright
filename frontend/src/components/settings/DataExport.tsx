/**
 * DataExport Component
 * Allows users to export their data in JSON or CSV format
 */

import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { exportSettings } from '../../stores/settingsStore';

export default function DataExport() {
  const { user } = useAuthStore();
  const [exporting, setExporting] = useState(false);
  const [exportType, setExportType] = useState<'json' | 'csv'>('json');

  const exportData = async (type: 'settings' | 'progress' | 'reviews' | 'all') => {
    setExporting(true);

    try {
      let data: any = {};
      let filename = '';

      switch (type) {
        case 'settings':
          data = JSON.parse(exportSettings());
          filename = `settings-${Date.now()}.json`;
          break;

        case 'progress':
          // TODO: Implement progress export
          const progressResponse = await fetch('/api/progress/export', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
            },
          });
          data = await progressResponse.json();
          filename = `progress-${Date.now()}.${exportType}`;
          break;

        case 'reviews':
          // TODO: Implement reviews export
          const reviewsResponse = await fetch('/api/srs/export', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
            },
          });
          data = await reviewsResponse.json();
          filename = `reviews-${Date.now()}.${exportType}`;
          break;

        case 'all':
          // TODO: Implement full data export
          const allResponse = await fetch('/api/settings/export-all', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
            },
          });
          data = await allResponse.json();
          filename = `all-data-${Date.now()}.${exportType}`;
          break;
      }

      // Convert to CSV if needed
      if (exportType === 'csv' && type !== 'settings') {
        data = convertToCSV(data);
      } else {
        data = JSON.stringify(data, null, 2);
      }

      // Download file
      const blob = new Blob([data], {
        type: exportType === 'json' ? 'application/json' : 'text/csv',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const convertToCSV = (data: any): string => {
    // Simple CSV converter
    if (Array.isArray(data)) {
      if (data.length === 0) return '';

      const headers = Object.keys(data[0]);
      const rows = data.map((row) =>
        headers.map((header) => JSON.stringify(row[header] || '')).join(',')
      );

      return [headers.join(','), ...rows].join('\n');
    }

    // For non-array data, convert to key-value pairs
    const entries = Object.entries(data);
    return ['Key,Value', ...entries.map(([k, v]) => `${k},${JSON.stringify(v)}`)].join('\n');
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Export Your Data
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Download your data in JSON or CSV format for backup or analysis
        </p>
      </div>

      {/* Export Format Selection */}
      <div className="space-y-4">
        <div>
          <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Export Format
          </h4>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setExportType('json')}
              className={`px-4 py-2 border-2 rounded-lg font-medium transition-all ${
                exportType === 'json'
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              JSON
            </button>
            <button
              onClick={() => setExportType('csv')}
              className={`px-4 py-2 border-2 rounded-lg font-medium transition-all ${
                exportType === 'csv'
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              CSV
            </button>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="space-y-4">
        <div>
          <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">
            What to Export
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Settings Export */}
          <div className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <svg
                  className="w-6 h-6 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Settings & Preferences
                </h5>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Theme, notifications, study preferences, and privacy settings
                </p>
                <button
                  onClick={() => exportData('settings')}
                  disabled={exporting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {exporting ? 'Exporting...' : 'Export Settings'}
                </button>
              </div>
            </div>
          </div>

          {/* Progress Export */}
          <div className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <svg
                  className="w-6 h-6 text-green-600 dark:text-green-400"
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
              </div>
              <div className="flex-1">
                <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Learning Progress
                </h5>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Lessons completed, quiz scores, exercise submissions, and statistics
                </p>
                <button
                  onClick={() => exportData('progress')}
                  disabled={exporting}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {exporting ? 'Exporting...' : 'Export Progress'}
                </button>
              </div>
            </div>
          </div>

          {/* Reviews Export */}
          <div className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <svg
                  className="w-6 h-6 text-purple-600 dark:text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  SRS Reviews
                </h5>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Flashcard reviews, scheduling data, and retention statistics
                </p>
                <button
                  onClick={() => exportData('reviews')}
                  disabled={exporting}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {exporting ? 'Exporting...' : 'Export Reviews'}
                </button>
              </div>
            </div>
          </div>

          {/* All Data Export */}
          <div className="p-6 border-2 border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-blue-200 dark:bg-blue-800/50 rounded-lg">
                <svg
                  className="w-6 h-6 text-blue-700 dark:text-blue-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Complete Data Export
                </h5>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  All your data in a single file (settings, progress, reviews, and more)
                </p>
                <button
                  onClick={() => exportData('all')}
                  disabled={exporting}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {exporting ? 'Exporting...' : 'Export All Data'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
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
                About Data Exports
              </h4>
              <ul className="mt-2 space-y-1 text-sm text-blue-800 dark:text-blue-300">
                <li>• Exported data is in a machine-readable format</li>
                <li>• JSON format preserves data structure and relationships</li>
                <li>• CSV format is suitable for spreadsheet applications</li>
                <li>• All timestamps are in ISO 8601 format (UTC)</li>
                <li>• Exports do not include passwords or sensitive credentials</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
