/**
 * ProgressOverview Component
 * Displays overall progress statistics with visual indicators
 */

import React from 'react';
import { TrendingUp, TrendingDown, Minus, BookOpen, CheckCircle, Code, Brain, Flame, Clock } from 'lucide-react';
import type { OverallProgress, ProgressTrend } from '../../types/progress.types';
import { formatStudyTime } from '../../lib/progress/progressCalculations';

interface ProgressOverviewProps {
  progress: OverallProgress;
  trend?: ProgressTrend;
  className?: string;
}

export const ProgressOverview: React.FC<ProgressOverviewProps> = ({
  progress,
  trend,
  className = '',
}) => {
  const stats = [
    {
      icon: BookOpen,
      label: 'Lessons',
      value: progress.lessonsCompleted,
      total: progress.totalLessons,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      icon: CheckCircle,
      label: 'Quizzes',
      value: progress.quizzesPassed,
      total: progress.totalQuizzes,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      icon: Code,
      label: 'Exercises',
      value: progress.exercisesCompleted,
      total: progress.totalExercises,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      icon: Brain,
      label: 'Flashcards',
      value: progress.flashcardsReviewed,
      total: progress.totalFlashcards,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
    },
  ];

  const getTrendIcon = () => {
    if (!trend) return null;
    switch (trend.direction) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>
      {/* Overall Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-900">Overall Progress</h2>
          {trend && (
            <div className="flex items-center gap-2 text-sm">
              {getTrendIcon()}
              <span className={`font-medium ${
                trend.direction === 'up' ? 'text-green-600' :
                trend.direction === 'down' ? 'text-red-600' :
                'text-gray-600'
              }`}>
                {trend.percentage}% {trend.comparisonPeriod}
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className="h-8 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 flex items-center justify-end pr-3"
              style={{ width: `${Math.min(progress.percentage, 100)}%` }}
            >
              <span className="text-white text-sm font-bold">
                {progress.percentage}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const percentage = stat.total > 0 ? (stat.value / stat.total) * 100 : 0;

          return (
            <div key={stat.label} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <span className="text-sm font-medium text-gray-600">{stat.label}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                <span className="text-sm text-gray-500">/ {stat.total}</span>
              </div>
              <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${stat.color.replace('text-', 'bg-')} transition-all duration-500`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="bg-red-100 p-2 rounded-lg">
            <Flame className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-xs text-gray-600">Current Streak</p>
            <p className="text-lg font-bold text-gray-900">{progress.currentStreak} days</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="bg-orange-100 p-2 rounded-lg">
            <Flame className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="text-xs text-gray-600">Best Streak</p>
            <p className="text-lg font-bold text-gray-900">{progress.longestStreak} days</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="bg-indigo-100 p-2 rounded-lg">
            <Clock className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs text-gray-600">Total Study Time</p>
            <p className="text-lg font-bold text-gray-900">{formatStudyTime(progress.totalStudyTime)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="bg-teal-100 p-2 rounded-lg">
            <Clock className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <p className="text-xs text-gray-600">Avg Session</p>
            <p className="text-lg font-bold text-gray-900">{formatStudyTime(progress.averageSessionTime)}</p>
          </div>
        </div>
      </div>

      {/* Last Activity */}
      {progress.lastActivityDate && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Last activity:{' '}
            <span className="font-medium text-gray-900">
              {new Date(progress.lastActivityDate).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};
