import React from 'react';
import { Users, UserPlus, Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, PieChart } from './charts';
import { UserMetrics as UserMetricsType } from '../../../stores/adminAnalyticsStore';

interface UserMetricsProps {
  metrics: UserMetricsType;
}

export const UserMetrics: React.FC<UserMetricsProps> = ({ metrics }) => {
  const stats = [
    {
      label: 'Total Users',
      value: metrics.totalUsers,
      icon: Users,
      color: 'blue',
    },
    {
      label: 'New Users (Today)',
      value: metrics.newUsersToday,
      icon: UserPlus,
      color: 'green',
    },
    {
      label: 'Active Users (Today)',
      value: metrics.activeUsersToday,
      icon: Activity,
      color: 'purple',
    },
    {
      label: 'Retention Rate',
      value: `${metrics.userRetentionRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'emerald',
    },
  ];

  const engagementStats = [
    { label: 'New This Week', value: metrics.newUsersThisWeek },
    { label: 'New This Month', value: metrics.newUsersThisMonth },
    { label: 'Active This Week', value: metrics.activeUsersThisWeek },
    { label: 'Active This Month', value: metrics.activeUsersThisMonth },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; icon: string }> = {
      blue: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'text-blue-500' },
      green: { bg: 'bg-green-50', text: 'text-green-600', icon: 'text-green-500' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-600', icon: 'text-purple-500' },
      emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: 'text-emerald-500' },
      red: { bg: 'bg-red-50', text: 'text-red-600', icon: 'text-red-500' },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">User Metrics</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>Churn Rate:</span>
          <span className="font-semibold text-red-600">
            {metrics.userChurnRate.toFixed(1)}%
          </span>
          <TrendingDown className="w-4 h-4 text-red-500" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Engagement Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Engagement Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {engagementStats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Average Session Duration:{' '}
            <span className="font-semibold text-gray-900">
              {metrics.averageSessionDuration.toFixed(1)} minutes
            </span>
          </p>
        </div>
      </div>

      {/* User Growth Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <LineChart
          data={metrics.userGrowth}
          xKey="date"
          lines={[{ dataKey: 'count', name: 'New Users', stroke: '#3b82f6' }]}
          title="User Growth (Last 30 Days)"
          height={350}
          xLabel="Date"
          yLabel="New Users"
        />
      </div>

      {/* Users by Learning Track */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <PieChart
          data={metrics.usersByTrack}
          nameKey="track"
          valueKey="count"
          title="Users by Learning Track"
          height={350}
        />
      </div>

      {/* Retention vs Churn */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Retention vs Churn</h3>
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center p-6 bg-emerald-50 rounded-lg">
            <p className="text-sm font-medium text-gray-600 mb-2">Retention Rate</p>
            <p className="text-4xl font-bold text-emerald-600">
              {metrics.userRetentionRate.toFixed(1)}%
            </p>
            <TrendingUp className="w-6 h-6 text-emerald-500 mx-auto mt-2" />
          </div>
          <div className="text-center p-6 bg-red-50 rounded-lg">
            <p className="text-sm font-medium text-gray-600 mb-2">Churn Rate</p>
            <p className="text-4xl font-bold text-red-600">
              {metrics.userChurnRate.toFixed(1)}%
            </p>
            <TrendingDown className="w-6 h-6 text-red-500 mx-auto mt-2" />
          </div>
        </div>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Retention rate is calculated based on users who were active
            in the last 30 days compared to total users created before that period.
          </p>
        </div>
      </div>
    </div>
  );
};
