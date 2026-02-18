/**
 * Study Time Analytics Component
 * Displays study time statistics and patterns
 */

import React, { useEffect } from 'react';
import { Clock, TrendingUp, Calendar, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useScheduleStore } from '../../stores/scheduleStore';

export const StudyTimeAnalytics: React.FC = () => {
  const {
    studyTimeAnalytics,
    studyTimeLoading,
    studyTimeError,
    loadStudyTimeAnalytics,
  } = useScheduleStore();

  useEffect(() => {
    loadStudyTimeAnalytics();
  }, [loadStudyTimeAnalytics]);

  // Format duration in seconds to readable string
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Prepare hour-of-day chart data
  const hourChartData = studyTimeAnalytics?.byHourOfDay.map((seconds, hour) => ({
    hour: hour === 0 ? '12am' : hour < 12 ? `${hour}am` : hour === 12 ? '12pm' : `${hour - 12}pm`,
    minutes: Math.round(seconds / 60),
  })) || [];

  // Get top categories
  const topCategories = studyTimeAnalytics
    ? Object.entries(studyTimeAnalytics.byCategory)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
    : [];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-bold text-gray-800">Study Time Analytics</h2>
      </div>

      {/* Error State */}
      {studyTimeError && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {studyTimeError}
        </div>
      )}

      {/* Loading State */}
      {studyTimeLoading ? (
        <div className="h-40 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : !studyTimeAnalytics ? (
        <div className="text-center text-gray-500 py-8">
          No study time data available
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-blue-600" />
                <p className="text-sm text-gray-600">Total Time</p>
              </div>
              <p className="text-xl font-bold text-blue-600">
                {formatDuration(studyTimeAnalytics.totalTime)}
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-green-600" />
                <p className="text-sm text-gray-600">This Week</p>
              </div>
              <p className="text-xl font-bold text-green-600">
                {formatDuration(studyTimeAnalytics.weekTime)}
              </p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <p className="text-sm text-gray-600">Avg Session</p>
              </div>
              <p className="text-xl font-bold text-purple-600">
                {formatDuration(studyTimeAnalytics.averageSessionDuration)}
              </p>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4 text-orange-600" />
                <p className="text-sm text-gray-600">Streak</p>
              </div>
              <p className="text-xl font-bold text-orange-600">
                {studyTimeAnalytics.streak} days
              </p>
            </div>
          </div>

          {/* Study Time by Hour of Day */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Study Time by Hour</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="hour"
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="minutes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Most Productive Hours */}
          {studyTimeAnalytics.mostProductiveHours.length > 0 && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Most Productive Hours</h3>
              <div className="flex gap-2">
                {studyTimeAnalytics.mostProductiveHours.map(hour => (
                  <span
                    key={hour}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                  >
                    {hour === 0 ? '12am' : hour < 12 ? `${hour}am` : hour === 12 ? '12pm' : `${hour - 12}pm`}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Time by Category */}
          {topCategories.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">Top Categories</h3>
              <div className="space-y-2">
                {topCategories.map(([category, seconds]) => {
                  const totalSeconds = Object.values(studyTimeAnalytics.byCategory).reduce(
                    (sum, s) => sum + s,
                    0
                  );
                  const percentage = ((seconds / totalSeconds) * 100).toFixed(0);

                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-700">{category}</span>
                        <span className="text-gray-600">
                          {formatDuration(seconds)} ({percentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Study Calendar Mini View */}
          {studyTimeAnalytics.studyDays.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Recent Activity</h3>
              <p className="text-sm text-gray-600">
                Studied on {studyTimeAnalytics.studyDays.length} day
                {studyTimeAnalytics.studyDays.length !== 1 ? 's' : ''} this month
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
