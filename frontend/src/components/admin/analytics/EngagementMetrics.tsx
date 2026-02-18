import React from 'react';
import { Clock, Activity, Zap, Calendar } from 'lucide-react';
import { Histogram, BarChart, LineChart } from './charts';
import { EngagementMetrics as EngagementMetricsType } from '../../../stores/adminAnalyticsStore';

interface EngagementMetricsProps {
  metrics: EngagementMetricsType;
}

export const EngagementMetrics: React.FC<EngagementMetricsProps> = ({ metrics }) => {
  const stats = [
    {
      label: 'Total Study Time',
      value: `${(metrics.totalStudyTime / 60).toFixed(1)}h`,
      subtitle: `${metrics.totalStudyTime.toLocaleString()} minutes`,
      icon: Clock,
      color: 'blue',
    },
    {
      label: 'Avg Study Time/User',
      value: `${metrics.averageStudyTimePerUser.toFixed(1)} min`,
      icon: Activity,
      color: 'green',
    },
    {
      label: 'Daily Active Sessions',
      value: metrics.dailyActiveSessions,
      icon: Zap,
      color: 'purple',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; icon: string }> = {
      blue: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'text-blue-500' },
      green: { bg: 'bg-green-50', text: 'text-green-600', icon: 'text-green-500' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-600', icon: 'text-purple-500' },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Engagement Metrics</h2>
        <Calendar className="w-6 h-6 text-gray-400" />
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
              {stat.subtitle && (
                <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Study Time Distribution */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <Histogram
          data={metrics.studyTimeDistribution}
          title="Study Time Distribution"
          height={350}
          xLabel="Study Time Range"
          yLabel="Number of Users"
          color="#3b82f6"
        />
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Insight:</strong> Most users spend between 30-60 minutes per session. Consider
            optimizing content length for this duration.
          </p>
        </div>
      </div>

      {/* Session Duration Distribution */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <Histogram
          data={metrics.sessionDurationDistribution}
          title="Session Duration Distribution"
          height={350}
          xLabel="Session Duration Range"
          yLabel="Number of Sessions"
          color="#10b981"
        />
      </div>

      {/* Peak Usage Times */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <LineChart
          data={metrics.peakUsageTimes}
          xKey="hour"
          lines={[{ dataKey: 'count', name: 'Active Sessions', stroke: '#8b5cf6' }]}
          title="Peak Usage Times (24-Hour)"
          height={350}
          xLabel="Hour of Day"
          yLabel="Active Sessions"
        />
        <div className="mt-4 p-3 bg-purple-50 rounded-lg">
          <p className="text-sm text-purple-800">
            <strong>Tip:</strong> Schedule system maintenance during low-activity hours to
            minimize user impact.
          </p>
        </div>
      </div>

      {/* Streak Distribution */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <BarChart
          data={metrics.streakDistribution}
          xKey="range"
          bars={[{ dataKey: 'count', name: 'Users', fill: '#f59e0b' }]}
          title="User Streak Distribution"
          height={350}
          xLabel="Streak Length"
          yLabel="Number of Users"
        />
        <div className="mt-4 p-3 bg-amber-50 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>Gamification Opportunity:</strong> Users with 30+ day streaks are highly
            engaged. Consider special rewards or recognition for these users.
          </p>
        </div>
      </div>

      {/* Activity Heatmap (Calendar View) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Activity Heatmap (Last Year)</h3>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Simplified calendar heatmap */}
            <div className="grid grid-cols-7 gap-2">
              {metrics.activityHeatmap.slice(0, 365).map((day, index) => {
                const intensity = day.count;
                const getColor = () => {
                  if (intensity === 0) return 'bg-gray-100';
                  if (intensity < 5) return 'bg-green-200';
                  if (intensity < 10) return 'bg-green-400';
                  if (intensity < 15) return 'bg-green-600';
                  return 'bg-green-800';
                };

                return (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-sm ${getColor()} hover:ring-2 hover:ring-blue-400 cursor-pointer transition-all`}
                    title={`${day.date}: ${day.count} activities`}
                  />
                );
              })}
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center space-x-2 text-xs text-gray-600">
          <span>Less</span>
          <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
          <div className="w-3 h-3 bg-green-200 rounded-sm"></div>
          <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
          <div className="w-3 h-3 bg-green-600 rounded-sm"></div>
          <div className="w-3 h-3 bg-green-800 rounded-sm"></div>
          <span>More</span>
        </div>
      </div>

      {/* Summary Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold mb-3 text-gray-900">Engagement Insights</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <span>
              Average session duration is{' '}
              <strong>{metrics.averageStudyTimePerUser.toFixed(1)} minutes</strong>, indicating
              focused learning sessions.
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-purple-500 mr-2">•</span>
            <span>
              <strong>{metrics.dailyActiveSessions} active sessions</strong> today shows healthy
              platform usage.
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">•</span>
            <span>
              Users with longer streaks (15+ days) show{' '}
              <strong>significantly higher completion rates</strong>.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};
