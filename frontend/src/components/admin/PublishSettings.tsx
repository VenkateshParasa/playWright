import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import type { ContentStatus } from '../../stores/adminContentStore';

interface PublishSettingsProps {
  status: ContentStatus;
  scheduledFor?: string;
  track?: '30-day' | '60-day' | 'both';
  onStatusChange: (status: ContentStatus) => void;
  onScheduleChange: (date: string) => void;
  onTrackChange?: (track: '30-day' | '60-day' | 'both') => void;
}

const PublishSettings: React.FC<PublishSettingsProps> = ({
  status,
  scheduledFor,
  track,
  onStatusChange,
  onScheduleChange,
  onTrackChange,
}) => {
  const [isScheduled, setIsScheduled] = React.useState(!!scheduledFor);

  const handleScheduleToggle = (checked: boolean) => {
    setIsScheduled(checked);
    if (!checked) {
      onScheduleChange('');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-4 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Publishing Settings
      </h3>

      {/* Status Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Status
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <input
              type="radio"
              name="status"
              value="draft"
              checked={status === 'draft'}
              onChange={() => onStatusChange('draft')}
              className="w-4 h-4 text-blue-600"
            />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Draft</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Not visible to users
              </p>
            </div>
          </label>

          <label className="flex items-center gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <input
              type="radio"
              name="status"
              value="published"
              checked={status === 'published'}
              onChange={() => onStatusChange('published')}
              className="w-4 h-4 text-blue-600"
            />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Published
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Visible to all users immediately
              </p>
            </div>
          </label>

          <label className="flex items-center gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <input
              type="radio"
              name="status"
              value="scheduled"
              checked={status === 'scheduled'}
              onChange={() => {
                onStatusChange('scheduled');
                setIsScheduled(true);
              }}
              className="w-4 h-4 text-blue-600"
            />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Scheduled
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Publish at a specific date and time
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Schedule Date/Time */}
      {status === 'scheduled' && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            <Calendar className="w-4 h-4 inline mr-1" />
            Schedule For
          </label>
          <input
            type="datetime-local"
            value={scheduledFor || ''}
            onChange={(e) => onScheduleChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            min={new Date().toISOString().slice(0, 16)}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Content will be automatically published at this time
          </p>
        </div>
      )}

      {/* Track Selection (for lessons) */}
      {onTrackChange && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Learning Track
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <input
                type="radio"
                name="track"
                value="30-day"
                checked={track === '30-day'}
                onChange={() => onTrackChange('30-day')}
                className="w-4 h-4 text-blue-600"
              />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  30-Day Track
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  For accelerated learning
                </p>
              </div>
            </label>

            <label className="flex items-center gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <input
                type="radio"
                name="track"
                value="60-day"
                checked={track === '60-day'}
                onChange={() => onTrackChange('60-day')}
                className="w-4 h-4 text-blue-600"
              />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  60-Day Track
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  For comprehensive learning
                </p>
              </div>
            </label>

            <label className="flex items-center gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <input
                type="radio"
                name="track"
                value="both"
                checked={track === 'both'}
                onChange={() => onTrackChange('both')}
                className="w-4 h-4 text-blue-600"
              />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Both Tracks</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Available in both tracks
                </p>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Visibility Info */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Visibility:</strong>{' '}
          {status === 'draft' && 'Only visible to admins'}
          {status === 'published' && 'Visible to all users'}
          {status === 'scheduled' &&
            scheduledFor &&
            `Will be published on ${new Date(scheduledFor).toLocaleString()}`}
        </p>
      </div>
    </div>
  );
};

export default PublishSettings;
