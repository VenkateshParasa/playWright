/**
 * Retention Graph Component
 * Line graph showing retention rate over time intervals
 */

import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Activity, Download, Info } from 'lucide-react';
import { useScheduleStore } from '../../stores/scheduleStore';
import { exportRetentionToCSV, getRetentionRecommendations } from '../../lib/srs/retentionCalculator';

export const RetentionGraph: React.FC = () => {
  const [showRecommendations, setShowRecommendations] = useState(false);

  const {
    retentionCurve,
    retentionLoading,
    retentionError,
    loadRetentionCurve,
  } = useScheduleStore();

  useEffect(() => {
    loadRetentionCurve();
  }, [loadRetentionCurve]);

  const handleExportData = () => {
    if (!retentionCurve) return;

    const csv = exportRetentionToCSV(retentionCurve);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `retention-curve-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Format data for chart
  const chartData = retentionCurve?.intervals.map(d => ({
    interval: d.interval,
    retentionRate: d.retentionRate,
    sampleSize: d.sampleSize,
  })) || [];

  const averageRetention = retentionCurve?.averageRetention || 0;
  const recommendations = retentionCurve ? getRetentionRecommendations(retentionCurve) : [];

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800">{data.interval}</p>
          <p className="text-sm text-blue-600">
            Retention: {data.retentionRate.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-600">
            Sample: {data.sampleSize} cards
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-800">Retention Curve</h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Info Button */}
          <button
            onClick={() => setShowRecommendations(!showRecommendations)}
            className="flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm"
            title="Show recommendations"
          >
            <Info className="w-4 h-4" />
            {showRecommendations ? 'Hide' : 'Show'} Tips
          </button>

          {/* Export Button */}
          <button
            onClick={handleExportData}
            disabled={!retentionCurve}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-sm"
            title="Export retention data"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Error State */}
      {retentionError && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {retentionError}
        </div>
      )}

      {/* Recommendations */}
      {showRecommendations && recommendations.length > 0 && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Recommendations</h3>
          <ul className="space-y-2">
            {recommendations.map((rec, index) => (
              <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Average Retention */}
      <div className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
        <p className="text-sm text-gray-600 mb-1">Average Retention Rate</p>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold text-purple-600">{averageRetention.toFixed(1)}%</p>
          <p className="text-sm text-gray-600">
            {averageRetention >= 90 ? 'Excellent' :
             averageRetention >= 80 ? 'Very Good' :
             averageRetention >= 70 ? 'Good' :
             averageRetention >= 60 ? 'Fair' : 'Needs Improvement'}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        {retentionLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
          </div>
        ) : !retentionCurve || chartData.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <Activity className="w-12 h-12 mb-2 opacity-50" />
            <p>No retention data available</p>
            <p className="text-sm mt-1">Review more cards to see your retention curve</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="interval"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                domain={[0, 100]}
                label={{ value: 'Retention Rate (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />

              {/* Average retention line */}
              <ReferenceLine
                y={averageRetention}
                stroke="#9333ea"
                strokeDasharray="5 5"
                label={{
                  value: `Avg: ${averageRetention.toFixed(1)}%`,
                  position: 'right',
                  fill: '#9333ea',
                  fontSize: 12,
                }}
              />

              {/* Retention curve */}
              <Line
                type="monotone"
                dataKey="retentionRate"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', r: 5 }}
                activeDot={{ r: 7 }}
                name="Retention Rate"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Interpretation Guide */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">Understanding Your Retention Curve</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• <strong>Steep drops</strong> indicate you need more frequent reviews at those intervals</p>
          <p>• <strong>Stable curve</strong> means your review schedule is well-optimized</p>
          <p>• <strong>High retention</strong> (80%+) shows effective learning and review timing</p>
          <p>• <strong>Low sample sizes</strong> mean predictions are less reliable - keep studying!</p>
        </div>
      </div>
    </div>
  );
};
