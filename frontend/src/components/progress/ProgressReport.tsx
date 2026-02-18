/**
 * ProgressReport Component
 * Generates and exports comprehensive progress reports
 */

import React, { useState } from 'react';
import { FileText, Download, Calendar, Filter } from 'lucide-react';
import type { ProgressReport, ProgressExportOptions } from '../../types/progress.types';
import { exportToPDF, exportToCSV, exportToJSON } from '../../lib/progress/exportUtils';

interface ProgressReportProps {
  report: ProgressReport;
  onGenerateReport: (startDate: string, endDate: string) => void;
  className?: string;
}

export const ProgressReportComponent: React.FC<ProgressReportProps> = ({
  report,
  onGenerateReport,
  className = '',
}) => {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });

  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv' | 'json'>('pdf');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeDetails, setIncludeDetails] = useState(true);

  const handleExport = () => {
    const options: ProgressExportOptions = {
      format: exportFormat,
      periodStart: startDate,
      periodEnd: endDate,
      includeCharts,
      includeDetails,
    };

    // For CSV and JSON, we need to convert the report to statistics format
    if (exportFormat === 'pdf') {
      exportToPDF(report, options);
    } else if (exportFormat === 'csv') {
      // Create statistics from report
      const statistics = {
        overall: {
          percentage: report.summary.overallProgress,
          lessonsCompleted: report.summary.lessonsCompleted,
          totalLessons: 0,
          quizzesPassed: 0,
          totalQuizzes: 0,
          exercisesCompleted: 0,
          totalExercises: 0,
          flashcardsReviewed: 0,
          totalFlashcards: 0,
          currentStreak: report.summary.currentStreak,
          longestStreak: 0,
          totalStudyTime: report.summary.totalStudyTime,
          averageSessionTime: 0,
          totalSessions: 0,
          lastActivityDate: new Date().toISOString(),
        },
        modules: report.details.moduleBreakdown,
        weekly: report.details.weeklyActivity,
        daily: [],
        milestones: report.details.milestones,
      };
      exportToCSV(statistics, 'progress-report');
    } else {
      exportToJSON(report, 'progress-report');
    }
  };

  const handleGenerateReport = () => {
    onGenerateReport(startDate, endDate);
  };

  return (
    <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-2">
          <FileText className="w-7 h-7 text-blue-600" />
          Progress Report
        </h2>
        <p className="text-sm text-gray-600">
          Generate and export your learning progress report
        </p>
      </div>

      {/* Date Range Selection */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Report Period
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={endDate}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <button
          onClick={handleGenerateReport}
          className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Generate Report
        </button>
      </div>

      {/* Report Summary */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-600 font-medium mb-1">Overall Progress</p>
            <p className="text-3xl font-bold text-gray-900">
              {report.summary.overallProgress}%
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-600 font-medium mb-1">Lessons</p>
            <p className="text-3xl font-bold text-gray-900">
              {report.summary.lessonsCompleted}
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-purple-600 font-medium mb-1">Study Time</p>
            <p className="text-3xl font-bold text-gray-900">
              {Math.round(report.summary.totalStudyTime / 3600)}h
            </p>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <p className="text-sm text-red-600 font-medium mb-1">Current Streak</p>
            <p className="text-3xl font-bold text-gray-900">
              {report.summary.currentStreak}
            </p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <p className="text-sm text-yellow-600 font-medium mb-1">Achievements</p>
            <p className="text-3xl font-bold text-gray-900">
              {report.summary.achievementsEarned}
            </p>
          </div>
          <div className="bg-indigo-50 rounded-lg p-4">
            <p className="text-sm text-indigo-600 font-medium mb-1">Avg Score</p>
            <p className="text-3xl font-bold text-gray-900">
              {report.summary.averageScore}%
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {report.recommendations.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Recommendations</h3>
          <ul className="space-y-2">
            {report.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-yellow-600 mt-0.5">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Export Options */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Export Options
        </h3>

        {/* Format Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Export Format
          </label>
          <div className="flex gap-2">
            {(['pdf', 'csv', 'json'] as const).map((format) => (
              <button
                key={format}
                onClick={() => setExportFormat(format)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  exportFormat === format
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {format.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Additional Options */}
        {exportFormat === 'pdf' && (
          <div className="space-y-2 mb-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeCharts}
                onChange={(e) => setIncludeCharts(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Include charts</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeDetails}
                onChange={(e) => setIncludeDetails(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Include detailed breakdown</span>
            </label>
          </div>
        )}

        {/* Export Button */}
        <button
          onClick={handleExport}
          className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" />
          Export Report as {exportFormat.toUpperCase()}
        </button>
      </div>

      {/* Report Metadata */}
      <div className="mt-6 pt-6 border-t border-gray-200 text-sm text-gray-600">
        <p>
          <strong>Report Period:</strong>{' '}
          {new Date(report.periodStart).toLocaleDateString()} -{' '}
          {new Date(report.periodEnd).toLocaleDateString()}
        </p>
        <p className="mt-1">
          <strong>Generated:</strong> {new Date(report.generatedAt).toLocaleString()}
        </p>
        <p className="mt-1">
          <strong>User:</strong> {report.user.name} ({report.user.email})
        </p>
        <p className="mt-1">
          <strong>Learning Track:</strong> {report.user.learningTrack}
        </p>
      </div>
    </div>
  );
};
