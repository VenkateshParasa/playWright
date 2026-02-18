import React from 'react';
import { Target, TrendingUp, Users, AlertCircle } from 'lucide-react';
import { Histogram, BarChart } from './charts';
import { ProgressMetrics as ProgressMetricsType } from '../../../stores/adminAnalyticsStore';

interface ProgressMetricsProps {
  metrics: ProgressMetricsType;
}

export const ProgressMetrics: React.FC<ProgressMetricsProps> = ({ metrics }) => {
  const stats = [
    {
      label: 'Overall Completion',
      value: `${metrics.overallCompletionRate.toFixed(1)}%`,
      icon: Target,
      color: 'blue',
    },
    {
      label: 'Avg Progress',
      value: `${metrics.averageProgressPercentage.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'green',
    },
    {
      label: 'Stuck Users',
      value: metrics.stuckUsers.length,
      icon: AlertCircle,
      color: 'red',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; icon: string }> = {
      blue: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'text-blue-500' },
      green: { bg: 'bg-green-50', text: 'text-green-600', icon: 'text-green-500' },
      red: { bg: 'bg-red-50', text: 'text-red-600', icon: 'text-red-500' },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Learning Progress Metrics</h2>
        <Users className="w-6 h-6 text-gray-400" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const colors = getColorClasses(stat.color);
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`${colors.bg} rounded-lg p-6 border border-gray-200`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <Icon className={`w-5 h-5 ${colors.icon}`} />
              </div>
              <p className={`text-3xl font-bold ${colors.text}`}>{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Progress Distribution */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <Histogram
          data={metrics.progressDistribution}
          title="User Progress Distribution"
          height={350}
          xLabel="Progress Percentage"
          yLabel="Number of Users"
          color="#3b82f6"
        />
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Insight:</strong> The distribution shows where most users are in their learning
            journey. Focus support on groups with lower progress.
          </p>
        </div>
      </div>

      {/* Completion Rate by Module */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <BarChart
          data={metrics.completionRateByModule}
          xKey="module"
          bars={[{ dataKey: 'rate', name: 'Completion Rate (%)', fill: '#10b981' }]}
          title="Completion Rate by Module"
          height={350}
          yLabel="Completion Rate (%)"
        />
        <div className="mt-4 p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>Note:</strong> Modules with lower completion rates may need content review or
            prerequisite adjustments.
          </p>
        </div>
      </div>

      {/* Time to Complete by Module */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <BarChart
          data={metrics.timeToCompleteByModule}
          xKey="module"
          bars={[{ dataKey: 'averageDays', name: 'Average Days', fill: '#8b5cf6' }]}
          title="Average Time to Complete by Module"
          height={350}
          yLabel="Days"
        />
        <div className="mt-4 p-3 bg-purple-50 rounded-lg">
          <p className="text-sm text-purple-800">
            <strong>Planning:</strong> Use these metrics to set realistic expectations for module
            completion times.
          </p>
        </div>
      </div>

      {/* Stuck Users */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          Users Needing Attention
        </h3>
        {metrics.stuckUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No stuck users identified. Great job!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {metrics.stuckUsers.map((user) => (
              <div
                key={user.userId}
                className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200"
              >
                <div>
                  <p className="font-medium text-gray-900">{user.userName}</p>
                  <p className="text-sm text-gray-600">Lesson: {user.lessonId}</p>
                </div>
                <div className="text-right">
                  <p className="text-red-600 font-semibold">{user.daysStuck} days</p>
                  <p className="text-xs text-gray-500">since last activity</p>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-sm text-amber-800">
            <strong>Action Items:</strong>
          </p>
          <ul className="list-disc list-inside text-sm text-amber-700 mt-2 space-y-1">
            <li>Send re-engagement emails to inactive users</li>
            <li>Offer personalized support or tutoring sessions</li>
            <li>Review the content they're stuck on for clarity issues</li>
            <li>Consider adding hints or breaking down complex topics</li>
          </ul>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
        <h3 className="text-lg font-semibold mb-3 text-gray-900">Progress Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Platform Completion Rate</p>
            <div className="flex items-center">
              <div className="flex-1 bg-gray-200 rounded-full h-3 mr-2">
                <div
                  className="bg-green-500 h-3 rounded-full"
                  style={{ width: `${metrics.overallCompletionRate}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {metrics.overallCompletionRate.toFixed(1)}%
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Average User Progress</p>
            <div className="flex items-center">
              <div className="flex-1 bg-gray-200 rounded-full h-3 mr-2">
                <div
                  className="bg-blue-500 h-3 rounded-full"
                  style={{ width: `${metrics.averageProgressPercentage}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {metrics.averageProgressPercentage.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
