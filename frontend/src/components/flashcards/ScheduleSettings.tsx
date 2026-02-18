/**
 * Schedule Settings Component
 * Manage review schedule configuration and limits
 */

import React, { useState, useEffect } from 'react';
import { Settings, Save, RotateCcw } from 'lucide-react';
import { useScheduleStore } from '../../stores/scheduleStore';
import { DEFAULT_SCHEDULE_SETTINGS, ScheduleSettings as ScheduleSettingsType } from '../../types/schedule.types';

export const ScheduleSettings: React.FC = () => {
  const {
    settings,
    settingsLoading,
    settingsError,
    loadSettings,
    updateSettings,
  } = useScheduleStore();

  const [localSettings, setLocalSettings] = useState<ScheduleSettingsType>(settings);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    setLocalSettings(settings);
    setHasChanges(false);
  }, [settings]);

  const handleChange = (field: keyof ScheduleSettingsType, value: any) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    try {
      await updateSettings(localSettings);
      setHasChanges(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const handleReset = () => {
    setLocalSettings(DEFAULT_SCHEDULE_SETTINGS);
    setHasChanges(true);
    setSaveSuccess(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-bold text-gray-800">Schedule Settings</h2>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Reset to defaults"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {/* Error State */}
      {settingsError && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {settingsError}
        </div>
      )}

      {/* Success State */}
      {saveSuccess && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
          Settings saved successfully!
        </div>
      )}

      {/* Settings Form */}
      <div className="space-y-6">
        {/* Daily Limits */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Daily Limits</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum New Cards per Day
              </label>
              <input
                type="number"
                min="0"
                max="999"
                value={localSettings.maxNewCardsPerDay}
                onChange={e => handleChange('maxNewCardsPerDay', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-600 mt-1">
                How many new cards to introduce each day
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Reviews per Day
              </label>
              <input
                type="number"
                min="0"
                max="9999"
                value={localSettings.maxReviewsPerDay}
                onChange={e => handleChange('maxReviewsPerDay', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-600 mt-1">
                Maximum number of review cards per day
              </p>
            </div>
          </div>
        </div>

        {/* Learning Steps */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Learning Steps</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Learning Steps (in minutes)
            </label>
            <input
              type="text"
              value={localSettings.learningSteps.join(' ')}
              onChange={e => {
                const steps = e.target.value
                  .split(' ')
                  .map(s => Number(s.trim()))
                  .filter(n => !isNaN(n) && n > 0);
                handleChange('learningSteps', steps);
              }}
              placeholder="1 10 60 1440"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-600 mt-1">
              Space-separated intervals (e.g., "1 10 60 1440" = 1min, 10min, 1hr, 1day)
            </p>
          </div>
        </div>

        {/* Intervals */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Intervals</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Graduating Interval (days)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={localSettings.graduatingInterval}
                onChange={e => handleChange('graduatingInterval', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-600 mt-1">
                Interval when a card graduates from learning
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Easy Interval Multiplier
              </label>
              <input
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={localSettings.easyIntervalMultiplier}
                onChange={e => handleChange('easyIntervalMultiplier', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-600 mt-1">
                Multiplier applied when you rate a card as "Easy"
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Interval (days)
              </label>
              <input
                type="number"
                min="30"
                max="36500"
                value={localSettings.maximumInterval}
                onChange={e => handleChange('maximumInterval', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-600 mt-1">
                Maximum delay between reviews (default: ~100 years)
              </p>
            </div>
          </div>
        </div>

        {/* Review Order */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Review Order</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order of Cards in Review Sessions
            </label>
            <select
              value={localSettings.reviewOrder}
              onChange={e => handleChange('reviewOrder', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="due-date">Due Date (oldest first)</option>
              <option value="random">Random</option>
              <option value="difficulty">Difficulty (hardest first)</option>
            </select>
            <p className="text-xs text-gray-600 mt-1">
              How cards are ordered during review sessions
            </p>
          </div>
        </div>

        {/* New Card Introduction Rate */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">New Card Introduction</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Card Introduction Rate
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={localSettings.newCardIntroductionRate}
              onChange={e => handleChange('newCardIntroductionRate', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-600 mt-1">
              Number of new cards to introduce per day (can be different from max)
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={!hasChanges || settingsLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
        >
          {settingsLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
};
