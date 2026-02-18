/**
 * Review Forecast Component
 * Bar chart showing reviews due for the next N days
 */

import React, { useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Download } from 'lucide-react';
import { useScheduleStore } from '../../stores/scheduleStore';
import { FORECAST_RANGES } from '../../types/schedule.types';

export const ReviewForecast: React.FC = () => {
  const {
    forecastData,
    forecastRange,
    forecastLoading,
    forecastError,
    loadForecastData,
    setForecastRange,
  } = useScheduleStore();

  useEffect(() => {
    loadForecastData(forecastRange);
  }, [forecastRange, loadForecastData]);

  const handleExportData = () => {
    const csv = [
      ['Date', 'New', 'Learning', 'Review', 'Total', 'Est. Time (min)'],
      ...forecastData.map(d => [
        d.date,
        d.new,
        d.learning,
        d.review,
        d.total,
        d.estimatedTime,
      ]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `review-forecast-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate statistics
  const totalCards = forecastData.reduce((sum, d) => sum + d.total, 0);
  const averagePerDay = forecastData.length > 0 ? Math.round(totalCards / forecastData.length) : 0;
  const peakDay = forecastData.reduce(
    (max, d) => (d.total > max.total ? d : max),
    forecastData[0] || { total: 0, date: '' }
  );

  // Format data for chart
  const chartData = forecastData.map(d => ({
    date: format(parseISO(d.date), 'MMM d'),
    New: d.new,
    Learning: d.learning,
    Review: d.review,
    total: d.total,
  }));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">Review Forecast</h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Range Selector */}
          <select
            value={forecastRange}
            onChange={e => setForecastRange(Number(e.target.value) as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {FORECAST_RANGES.map(range => (
              <option key={range.days} value={range.days}>
                {range.label}
              </option>
            ))}
          </select>

          {/* Export Button */}
          <button
            onClick={handleExportData}
            disabled={forecastData.length === 0}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-sm"
            title="Export forecast data"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Error State */}
      {forecastError && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {forecastError}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Total Reviews</p>
          <p className="text-2xl font-bold text-blue-600">{totalCards}</p>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Average per Day</p>
          <p className="text-2xl font-bold text-green-600">{averagePerDay}</p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Peak Day</p>
          <p className="text-lg font-bold text-purple-600">
            {peakDay.date ? format(parseISO(peakDay.date), 'MMM d') : '-'}
          </p>
          <p className="text-sm text-gray-600">{peakDay.total} cards</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        {forecastLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : forecastData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            No forecast data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="New" stackId="a" fill="#3b82f6" name="New Cards" />
              <Bar dataKey="Learning" stackId="a" fill="#f59e0b" name="Learning" />
              <Bar dataKey="Review" stackId="a" fill="#10b981" name="Review" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded" />
          <span className="text-gray-600">New Cards</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded" />
          <span className="text-gray-600">Learning</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded" />
          <span className="text-gray-600">Review</span>
        </div>
      </div>
    </div>
  );
};
