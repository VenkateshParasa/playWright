import React, { useState } from 'react';
import { Download, FileText, Calendar, CheckSquare } from 'lucide-react';
import { useAdminAnalyticsStore } from '../../../stores/adminAnalyticsStore';
import { exportToCSV, exportToJSON, generateReportSummary } from '../../../lib/analytics/exportUtils';

export const ReportGenerator: React.FC = () => {
  const {
    userMetrics,
    contentMetrics,
    engagementMetrics,
    progressMetrics,
    srsMetrics,
    dateRange,
  } = useAdminAnalyticsStore();

  const [selectedMetrics, setSelectedMetrics] = useState({
    users: true,
    content: true,
    engagement: true,
    progress: true,
    srs: true,
  });

  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'pdf'>('json');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleMetricToggle = (metric: keyof typeof selectedMetrics) => {
    setSelectedMetrics((prev) => ({
      ...prev,
      [metric]: !prev[metric],
    }));
  };

  const generateReport = () => {
    setIsGenerating(true);

    try {
      const reportData: any = {
        generatedAt: new Date().toISOString(),
        dateRange: dateRange
          ? {
              start: dateRange.startDate.toISOString(),
              end: dateRange.endDate.toISOString(),
            }
          : null,
      };

      // Add selected metrics
      if (selectedMetrics.users && userMetrics) {
        reportData.users = userMetrics;
      }
      if (selectedMetrics.content && contentMetrics) {
        reportData.content = contentMetrics;
      }
      if (selectedMetrics.engagement && engagementMetrics) {
        reportData.engagement = engagementMetrics;
      }
      if (selectedMetrics.progress && progressMetrics) {
        reportData.progress = progressMetrics;
      }
      if (selectedMetrics.srs && srsMetrics) {
        reportData.srs = srsMetrics;
      }

      // Export based on format
      const timestamp = new Date().toISOString().split('T')[0];

      if (exportFormat === 'json') {
        exportToJSON(reportData, `analytics-report-${timestamp}.json`);
      } else if (exportFormat === 'csv') {
        // For CSV, we'll export a summary
        const summary = generateReportSummary(reportData);
        const csvData = [
          { section: 'Report Summary', data: summary },
        ];
        exportToCSV(csvData, `analytics-report-${timestamp}.csv`);
      } else if (exportFormat === 'pdf') {
        const summary = generateReportSummary(reportData);
        alert(`PDF Export Preview:\n\n${summary}\n\nNote: Install jsPDF for full PDF support`);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const metricOptions = [
    { key: 'users' as const, label: 'User Metrics', available: !!userMetrics },
    { key: 'content' as const, label: 'Content Metrics', available: !!contentMetrics },
    { key: 'engagement' as const, label: 'Engagement Metrics', available: !!engagementMetrics },
    { key: 'progress' as const, label: 'Progress Metrics', available: !!progressMetrics },
    { key: 'srs' as const, label: 'SRS Metrics', available: !!srsMetrics },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <FileText className="w-6 h-6 text-blue-500 mr-3" />
        <h2 className="text-2xl font-bold text-gray-900">Generate Analytics Report</h2>
      </div>

      {/* Date Range Display */}
      {dateRange && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-blue-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">Report Date Range:</span>
          </div>
          <p className="text-sm text-gray-600 mt-1 ml-7">
            {dateRange.startDate.toLocaleDateString()} -{' '}
            {dateRange.endDate.toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Metric Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-900">
          Select Metrics to Include
        </h3>
        <div className="space-y-2">
          {metricOptions.map((option) => (
            <label
              key={option.key}
              className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedMetrics[option.key]
                  ? 'bg-blue-50 border-blue-300'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              } ${!option.available ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type="checkbox"
                checked={selectedMetrics[option.key]}
                onChange={() => handleMetricToggle(option.key)}
                disabled={!option.available}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="ml-3 text-sm font-medium text-gray-900">
                {option.label}
              </span>
              {!option.available && (
                <span className="ml-auto text-xs text-gray-500">
                  (No data available)
                </span>
              )}
              {selectedMetrics[option.key] && option.available && (
                <CheckSquare className="ml-auto w-4 h-4 text-blue-500" />
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Export Format Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-900">Export Format</h3>
        <div className="grid grid-cols-3 gap-3">
          {(['json', 'csv', 'pdf'] as const).map((format) => (
            <button
              key={format}
              onClick={() => setExportFormat(format)}
              className={`p-4 rounded-lg border-2 transition-all ${
                exportFormat === format
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <p className="text-sm font-semibold text-gray-900 uppercase">
                {format}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {format === 'json' && 'Complete data structure'}
                {format === 'csv' && 'Spreadsheet compatible'}
                {format === 'pdf' && 'Printable document'}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={generateReport}
        disabled={isGenerating || !Object.values(selectedMetrics).some((v) => v)}
        className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {isGenerating ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Generating Report...
          </>
        ) : (
          <>
            <Download className="w-5 h-5 mr-2" />
            Download Report ({exportFormat.toUpperCase()})
          </>
        )}
      </button>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">
          Report Instructions
        </h4>
        <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
          <li>Select the metrics you want to include in your report</li>
          <li>Choose your preferred export format</li>
          <li>Click "Download Report" to generate and download the file</li>
          <li>JSON format includes complete data for further analysis</li>
          <li>CSV format is compatible with Excel and Google Sheets</li>
          <li>PDF format creates a printable summary (requires jsPDF library)</li>
        </ul>
      </div>

      {/* Quick Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-gray-600">Total Users</p>
          <p className="text-lg font-bold text-blue-600">
            {userMetrics?.totalUsers || 0}
          </p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-xs text-gray-600">Active Today</p>
          <p className="text-lg font-bold text-green-600">
            {userMetrics?.activeUsersToday || 0}
          </p>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <p className="text-xs text-gray-600">Total Content</p>
          <p className="text-lg font-bold text-purple-600">
            {contentMetrics
              ? contentMetrics.totalLessons +
                contentMetrics.totalQuizzes +
                contentMetrics.totalExercises
              : 0}
          </p>
        </div>
      </div>
    </div>
  );
};
