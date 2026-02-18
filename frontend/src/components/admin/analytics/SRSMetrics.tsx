import React from 'react';
import { CreditCard, TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import { LineChart, BarChart, Histogram } from './charts';
import { SRSMetrics as SRSMetricsType } from '../../../stores/adminAnalyticsStore';

interface SRSMetricsProps {
  metrics: SRSMetricsType;
}

export const SRSMetrics: React.FC<SRSMetricsProps> = ({ metrics }) => {
  const stats = [
    {
      label: 'Total Cards',
      value: metrics.totalCards,
      icon: CreditCard,
      color: 'blue',
    },
    {
      label: 'Avg Cards/User',
      value: metrics.averageCardsPerUser.toFixed(1),
      icon: BarChart3,
      color: 'green',
    },
    {
      label: 'Reviews Today',
      value: metrics.cardsReviewedToday,
      icon: Calendar,
      color: 'purple',
    },
    {
      label: 'Retention Rate',
      value: `${metrics.averageRetentionRate}%`,
      icon: TrendingUp,
      color: 'emerald',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; icon: string }> = {
      blue: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'text-blue-500' },
      green: { bg: 'bg-green-50', text: 'text-green-600', icon: 'text-green-500' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-600', icon: 'text-purple-500' },
      emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: 'text-emerald-500' },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Spaced Repetition System (SRS) Metrics</h2>
        <div className="text-sm text-gray-600">
          Reviews This Week: <span className="font-semibold">{metrics.cardsReviewedThisWeek}</span>
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

      {/* Review Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Review Activity</h3>
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center p-6 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-gray-600 mb-2">Today</p>
            <p className="text-4xl font-bold text-blue-600">
              {metrics.cardsReviewedToday.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">cards reviewed</p>
          </div>
          <div className="text-center p-6 bg-green-50 rounded-lg">
            <p className="text-sm font-medium text-gray-600 mb-2">This Week</p>
            <p className="text-4xl font-bold text-green-600">
              {metrics.cardsReviewedThisWeek.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">cards reviewed</p>
          </div>
        </div>
      </div>

      {/* Retention Curve */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <LineChart
          data={metrics.retentionCurve}
          xKey="interval"
          lines={[{ dataKey: 'retentionRate', name: 'Retention Rate (%)', stroke: '#10b981' }]}
          title="Retention Curve Over Time"
          height={350}
          xLabel="Days Since Review"
          yLabel="Retention Rate (%)"
        />
        <div className="mt-4 p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>Analysis:</strong> The retention curve shows how well users remember content
            over time. A gradual decline is expected; steep drops may indicate content difficulty.
          </p>
        </div>
      </div>

      {/* Review Frequency Distribution */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <BarChart
          data={metrics.reviewFrequencyDistribution}
          xKey="frequency"
          bars={[{ dataKey: 'count', name: 'Users', fill: '#8b5cf6' }]}
          title="Review Frequency Distribution"
          height={350}
          xLabel="Review Frequency"
          yLabel="Number of Users"
        />
        <div className="mt-4 p-3 bg-purple-50 rounded-lg">
          <p className="text-sm text-purple-800">
            <strong>Insight:</strong> Daily reviewers show the best retention rates. Encourage
            users to establish daily review habits.
          </p>
        </div>
      </div>

      {/* Card Difficulty Distribution */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <BarChart
          data={metrics.cardDifficultyDistribution}
          xKey="difficulty"
          bars={[{ dataKey: 'count', name: 'Cards', fill: '#f59e0b' }]}
          title="Card Difficulty Distribution"
          height={350}
          xLabel="Difficulty Level"
          yLabel="Number of Cards"
        />
        <div className="mt-4 p-3 bg-amber-50 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> Difficulty is based on user performance (ease factor). Cards
            marked as "Hard" may need content revision or better explanations.
          </p>
        </div>
      </div>

      {/* SRS Algorithm Performance */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold mb-3 text-gray-900">SRS Algorithm Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Average Retention</p>
            <p className="text-3xl font-bold text-green-600">{metrics.averageRetentionRate}%</p>
            <p className="text-xs text-gray-500 mt-1">Excellent!</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Total Cards</p>
            <p className="text-3xl font-bold text-blue-600">{metrics.totalCards}</p>
            <p className="text-xs text-gray-500 mt-1">in system</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Cards per User</p>
            <p className="text-3xl font-bold text-purple-600">
              {metrics.averageCardsPerUser.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500 mt-1">average</p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Recommendation:</strong> The SRS system is performing well with{' '}
            {metrics.averageRetentionRate}% retention rate. Continue monitoring and adjust
            intervals if retention drops below 80%.
          </p>
        </div>
      </div>

      {/* Best Practices */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-3">SRS Best Practices</h3>
        <div className="space-y-3">
          <div className="flex items-start p-3 bg-green-50 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-semibold mr-3">
              1
            </div>
            <div>
              <p className="font-medium text-gray-900">Daily Review Habit</p>
              <p className="text-sm text-gray-600">
                Encourage users to review cards daily for optimal retention (currently{' '}
                {metrics.reviewFrequencyDistribution.find((d) => d.frequency === 'Daily')?.count ||
                  0}{' '}
                daily reviewers).
              </p>
            </div>
          </div>
          <div className="flex items-start p-3 bg-blue-50 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold mr-3">
              2
            </div>
            <div>
              <p className="font-medium text-gray-900">Content Quality</p>
              <p className="text-sm text-gray-600">
                Review "Hard" cards ({
                  metrics.cardDifficultyDistribution.find((d) => d.difficulty === 'Hard')?.count ||
                  0
                }) for content improvements or additional context.
              </p>
            </div>
          </div>
          <div className="flex items-start p-3 bg-purple-50 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-semibold mr-3">
              3
            </div>
            <div>
              <p className="font-medium text-gray-900">Algorithm Tuning</p>
              <p className="text-sm text-gray-600">
                Monitor the retention curve and adjust SM-2 parameters if retention drops
                significantly after specific intervals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
