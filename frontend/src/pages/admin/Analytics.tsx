import React, { useEffect, useState } from 'react';
import { BarChart3, RefreshCw, Calendar, Download } from 'lucide-react';
import { useAdminAnalyticsStore } from '../../stores/adminAnalyticsStore';
import { UserMetrics } from '../../components/admin/analytics/UserMetrics';
import { ContentMetrics } from '../../components/admin/analytics/ContentMetrics';
import { EngagementMetrics } from '../../components/admin/analytics/EngagementMetrics';
import { ProgressMetrics } from '../../components/admin/analytics/ProgressMetrics';
import { SRSMetrics } from '../../components/admin/analytics/SRSMetrics';
import { ReportGenerator } from '../../components/admin/analytics/ReportGenerator';

export const Analytics: React.FC = () => {
  const {
    userMetrics,
    contentMetrics,
    engagementMetrics,
    progressMetrics,
    srsMetrics,
    isLoading,
    error,
    lastRefreshed,
    dateRange,
    autoRefresh,
    refreshInterval,
    setDateRange,
    fetchAllMetrics,
    refreshMetrics,
  } = useAdminAnalyticsStore();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'users' | 'content' | 'engagement' | 'progress' | 'srs' | 'reports'
  >('overview');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch metrics on mount
  useEffect(() => {
    if (!userMetrics && !isLoading) {
      fetchAllMetrics();
    }
  }, []);

  // Auto-refresh logic
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refreshMetrics();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const handleRefresh = () => {
    refreshMetrics();
  };

  const handleDateRangeApply = () => {
    if (startDate && endDate) {
      setDateRange({
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
      fetchAllMetrics();
      setShowDatePicker(false);
    }
  };

  const handleDateRangeClear = () => {
    setDateRange(null);
    setStartDate('');
    setEndDate('');
    fetchAllMetrics();
    setShowDatePicker(false);
  };

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: BarChart3 },
    { id: 'users' as const, label: 'Users' },
    { id: 'content' as const, label: 'Content' },
    { id: 'engagement' as const, label: 'Engagement' },
    { id: 'progress' as const, label: 'Progress' },
    { id: 'srs' as const, label: 'SRS' },
    { id: 'reports' as const, label: 'Reports', icon: Download },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            </div>
            <div className="flex items-center space-x-3">
              {/* Date Range Picker */}
              <div className="relative">
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  {dateRange ? (
                    <span className="text-sm">
                      {dateRange.startDate.toLocaleDateString()} -{' '}
                      {dateRange.endDate.toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="text-sm">All Time</span>
                  )}
                </button>

                {showDatePicker && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10">
                    <h3 className="text-sm font-semibold mb-3">Select Date Range</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">End Date</label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={handleDateRangeApply}
                          disabled={!startDate || !endDate}
                          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 text-sm"
                        >
                          Apply
                        </button>
                        <button
                          onClick={handleDateRangeClear}
                          className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Last Refreshed */}
          {lastRefreshed && (
            <p className="text-sm text-gray-600">
              Last updated: {new Date(lastRefreshed).toLocaleString()}
            </p>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span className="flex items-center">
                    {Icon && <Icon className="w-4 h-4 mr-2" />}
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && !userMetrics && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading analytics data...</p>
            </div>
          </div>
        )}

        {/* Content */}
        {!isLoading || userMetrics ? (
          <div className="space-y-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {userMetrics && <UserMetrics metrics={userMetrics} />}
                {contentMetrics && <ContentMetrics metrics={contentMetrics} />}
                {engagementMetrics && <EngagementMetrics metrics={engagementMetrics} />}
              </div>
            )}

            {/* Individual Tabs */}
            {activeTab === 'users' && userMetrics && <UserMetrics metrics={userMetrics} />}
            {activeTab === 'content' && contentMetrics && (
              <ContentMetrics metrics={contentMetrics} />
            )}
            {activeTab === 'engagement' && engagementMetrics && (
              <EngagementMetrics metrics={engagementMetrics} />
            )}
            {activeTab === 'progress' && progressMetrics && (
              <ProgressMetrics metrics={progressMetrics} />
            )}
            {activeTab === 'srs' && srsMetrics && <SRSMetrics metrics={srsMetrics} />}
            {activeTab === 'reports' && <ReportGenerator />}
          </div>
        ) : null}

        {/* Empty State */}
        {!isLoading && !userMetrics && !error && (
          <div className="text-center py-20">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-600 mb-4">Click refresh to load analytics data</p>
            <button
              onClick={handleRefresh}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Load Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
