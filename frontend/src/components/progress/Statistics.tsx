/**
 * Statistics Component
 * Displays detailed statistics with time range filtering
 */

import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Calendar, Activity, Target, Award } from 'lucide-react';
import type { TimeRange, DailyProgress, WeeklyProgress, PerformanceMetrics } from '../../types/progress.types';
import { formatStudyTime } from '../../lib/progress/progressCalculations';

interface StatisticsProps {
  daily: DailyProgress[];
  weekly: WeeklyProgress[];
  performance: PerformanceMetrics;
  className?: string;
}

export const Statistics: React.FC<StatisticsProps> = ({
  daily,
  weekly,
  performance,
  className = '',
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');

  const timeRangeOptions: { label: string; value: TimeRange }[] = [
    { label: 'Today', value: 'day' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'All Time', value: 'all' },
  ];

  // Calculate stats based on time range
  const getFilteredStats = () => {
    const now = new Date();
    let filteredDaily = daily;

    switch (timeRange) {
      case 'day':
        filteredDaily = daily.filter((d) => {
          const date = new Date(d.date);
          return date.toDateString() === now.toDateString();
        });
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredDaily = daily.filter((d) => new Date(d.date) >= weekAgo);
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filteredDaily = daily.filter((d) => new Date(d.date) >= monthAgo);
        break;
      case 'all':
        filteredDaily = daily;
        break;
    }

    const totalLessons = filteredDaily.reduce((sum, d) => sum + d.lessonsCompleted, 0);
    const totalQuizzes = filteredDaily.reduce((sum, d) => sum + d.quizzesPassed, 0);
    const totalExercises = filteredDaily.reduce((sum, d) => sum + d.exercisesCompleted, 0);
    const totalFlashcards = filteredDaily.reduce((sum, d) => sum + d.flashcardsReviewed, 0);
    const totalStudyTime = filteredDaily.reduce((sum, d) => sum + d.studyTime, 0);
    const totalSessions = filteredDaily.reduce((sum, d) => sum + d.sessions, 0);

    const avgSessionTime = totalSessions > 0 ? totalStudyTime / totalSessions : 0;
    const avgDailyTime = filteredDaily.length > 0 ? totalStudyTime / filteredDaily.length : 0;

    return {
      totalLessons,
      totalQuizzes,
      totalExercises,
      totalFlashcards,
      totalStudyTime,
      totalSessions,
      avgSessionTime,
      avgDailyTime,
      activeDays: filteredDaily.filter((d) => d.sessions > 0).length,
    };
  };

  const stats = getFilteredStats();

  const getTrendIcon = (trend: 'improving' | 'declining' | 'stable') => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>
      {/* Header with Time Range Selector */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Statistics</h2>
        <div className="flex gap-2">
          {timeRangeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setTimeRange(option.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Stats */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          Activity Overview
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-600 font-medium mb-1">Lessons Completed</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalLessons}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-600 font-medium mb-1">Quizzes Passed</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalQuizzes}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-purple-600 font-medium mb-1">Exercises Done</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalExercises}</p>
          </div>
          <div className="bg-pink-50 rounded-lg p-4">
            <p className="text-sm text-pink-600 font-medium mb-1">Cards Reviewed</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalFlashcards}</p>
          </div>
        </div>
      </div>

      {/* Time Stats */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-600" />
          Time Metrics
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-indigo-50 rounded-lg p-4">
            <p className="text-sm text-indigo-600 font-medium mb-1">Total Study Time</p>
            <p className="text-2xl font-bold text-gray-900">{formatStudyTime(stats.totalStudyTime)}</p>
          </div>
          <div className="bg-teal-50 rounded-lg p-4">
            <p className="text-sm text-teal-600 font-medium mb-1">Avg Session</p>
            <p className="text-2xl font-bold text-gray-900">{formatStudyTime(stats.avgSessionTime)}</p>
          </div>
          <div className="bg-cyan-50 rounded-lg p-4">
            <p className="text-sm text-cyan-600 font-medium mb-1">Avg Daily Time</p>
            <p className="text-2xl font-bold text-gray-900">{formatStudyTime(stats.avgDailyTime)}</p>
          </div>
          <div className="bg-sky-50 rounded-lg p-4">
            <p className="text-sm text-sky-600 font-medium mb-1">Active Days</p>
            <p className="text-2xl font-bold text-gray-900">{stats.activeDays}</p>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-orange-600" />
          Performance Metrics
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Quiz Performance */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-gray-600 font-medium">Average Quiz Score</p>
                <p className="text-3xl font-bold text-gray-900">{performance.averageQuizScore}%</p>
              </div>
              <div className="flex items-center gap-2">
                {getTrendIcon(performance.quizScoreTrend)}
                <span className={`text-sm font-medium ${
                  performance.quizScoreTrend === 'improving' ? 'text-green-600' :
                  performance.quizScoreTrend === 'declining' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {performance.quizScoreTrend}
                </span>
              </div>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500"
                style={{ width: `${performance.averageQuizScore}%` }}
              />
            </div>
          </div>

          {/* Exercise Performance */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-gray-600 font-medium">Average Exercise Score</p>
                <p className="text-3xl font-bold text-gray-900">{performance.averageExerciseScore}%</p>
              </div>
              <div className="flex items-center gap-2">
                {getTrendIcon(performance.exerciseScoreTrend)}
                <span className={`text-sm font-medium ${
                  performance.exerciseScoreTrend === 'improving' ? 'text-green-600' :
                  performance.exerciseScoreTrend === 'declining' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {performance.exerciseScoreTrend}
                </span>
              </div>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                style={{ width: `${performance.averageExerciseScore}%` }}
              />
            </div>
          </div>

          {/* Flashcard Retention */}
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 font-medium mb-2">Flashcard Retention</p>
            <p className="text-3xl font-bold text-gray-900 mb-3">{performance.flashcardRetention}%</p>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-500"
                style={{ width: `${performance.flashcardRetention}%` }}
              />
            </div>
          </div>

          {/* Completion Rate */}
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 font-medium mb-2">Completion Rate</p>
            <p className="text-3xl font-bold text-gray-900 mb-3">{performance.completionRate}%</p>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                style={{ width: `${performance.completionRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Consistency Score */}
        <div className="mt-4 border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Award className="w-6 h-6 text-indigo-600" />
              <div>
                <p className="text-sm text-gray-600 font-medium">Consistency Score</p>
                <p className="text-xs text-gray-500">Based on regular study patterns</p>
              </div>
            </div>
            <p className="text-4xl font-bold text-indigo-600">{performance.consistencyScore}%</p>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
              style={{ width: `${performance.consistencyScore}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
