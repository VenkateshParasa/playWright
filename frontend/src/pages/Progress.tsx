/**
 * Progress Page
 * Comprehensive progress tracking dashboard with visualizations and analytics
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Download, RefreshCw } from 'lucide-react';
import {
  ProgressOverview,
  ModuleProgress,
  ProgressChart,
  Statistics,
  Milestones,
  ProgressReportComponent,
} from '../components/progress';
import type {
  ProgressStatistics,
  TimeSeriesData,
  CategoryProgress,
  ProgressReport,
} from '../types/progress.types';
import { useProgressStore } from '../stores/progressStore';
import { useSRSStore } from '../stores/srsStore';
import {
  calculateOverallProgress,
  calculateModuleProgress,
  calculateWeeklyProgress,
  calculateDailyProgress,
  calculatePerformanceMetrics,
  generateDateLabels,
  getDateRange,
} from '../lib/progress/progressCalculations';
import { calculateMilestones } from '../lib/progress/milestones';
import { generateProgressReport } from '../lib/progress/exportUtils';
import { useUIStore } from '../stores/uiStore';

export default function Progress() {
  const [isLoading, setIsLoading] = useState(true);
  const [progressData, setProgressData] = useState<ProgressStatistics | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');

  // Stores
  const {
    lessons,
    quizzes,
    exercises,
    currentStreak,
    longestStreak,
    syncProgress,
  } = useProgressStore();
  const { reviewedToday } = useSRSStore();
  const { setPageTitle, setBreadcrumbs, showToast } = useUIStore();

  // Set page metadata
  useEffect(() => {
    setPageTitle('Progress');
    setBreadcrumbs([
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Progress' },
    ]);
  }, [setPageTitle, setBreadcrumbs]);

  // Load and calculate progress data
  useEffect(() => {
    const loadProgressData = async () => {
      setIsLoading(true);

      try {
        // Calculate overall progress
        const overall = calculateOverallProgress(
          lessons,
          quizzes,
          exercises,
          reviewedToday,
          100 // Total flashcards - should come from SRS store
        );

        // Add streak data from store
        overall.currentStreak = currentStreak;
        overall.longestStreak = longestStreak;

        // Calculate module progress (example data - should come from curriculum)
        const modules = [
          calculateModuleProgress(
            'module-1',
            'Introduction to Playwright',
            1,
            Object.values(lessons).slice(0, 5),
            Object.values(quizzes).slice(0, 2),
            Object.values(exercises).slice(0, 3),
            []
          ),
          calculateModuleProgress(
            'module-2',
            'Selenium Basics',
            2,
            Object.values(lessons).slice(5, 10),
            Object.values(quizzes).slice(2, 4),
            Object.values(exercises).slice(3, 6),
            ['module-1']
          ),
          // Add more modules as needed
        ];

        // Calculate weekly progress
        const weekly = Array.from({ length: 4 }, (_, i) =>
          calculateWeeklyProgress(lessons, quizzes, exercises, i + 1)
        );

        // Calculate daily progress for last 30 days
        const dateRange = getDateRange('month');
        const dates = generateDateLabels(dateRange.start, dateRange.end, 'day');
        const daily = dates.map((date) =>
          calculateDailyProgress(lessons, quizzes, exercises, reviewedToday, date)
        );

        // Calculate performance metrics
        const performance = calculatePerformanceMetrics(quizzes, exercises, 85); // 85% retention rate

        // Calculate milestones
        const milestones = calculateMilestones(overall);

        setProgressData({
          overall,
          modules,
          weekly,
          daily,
          milestones,
        });

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load progress data:', error);
        showToast({
          type: 'error',
          message: 'Failed to load progress data',
        });
        setIsLoading(false);
      }
    };

    loadProgressData();
  }, [lessons, quizzes, exercises, currentStreak, longestStreak, reviewedToday, showToast]);

  // Generate time series data for charts
  const getTimeSeriesData = (): TimeSeriesData[] => {
    if (!progressData) return [];

    const { start, end } = getDateRange(timeRange);
    const dates = generateDateLabels(start, end, 'day');

    return dates.map((date) => {
      const dayData = progressData.daily.find((d) => d.date.startsWith(date));
      return {
        date,
        lessons: dayData?.lessonsCompleted || 0,
        quizzes: dayData?.quizzesPassed || 0,
        exercises: dayData?.exercisesCompleted || 0,
        studyTime: dayData ? Math.round(dayData.studyTime / 60) : 0, // Convert to minutes
      };
    });
  };

  // Generate category progress for pie chart
  const getCategoryProgress = (): CategoryProgress[] => {
    if (!progressData) return [];

    return [
      {
        category: 'Lessons',
        completed: progressData.overall.lessonsCompleted,
        total: progressData.overall.totalLessons,
        percentage: Math.round(
          (progressData.overall.lessonsCompleted / progressData.overall.totalLessons) * 100
        ),
        color: '#3B82F6',
      },
      {
        category: 'Quizzes',
        completed: progressData.overall.quizzesPassed,
        total: progressData.overall.totalQuizzes,
        percentage: Math.round(
          (progressData.overall.quizzesPassed / progressData.overall.totalQuizzes) * 100
        ),
        color: '#10B981',
      },
      {
        category: 'Exercises',
        completed: progressData.overall.exercisesCompleted,
        total: progressData.overall.totalExercises,
        percentage: Math.round(
          (progressData.overall.exercisesCompleted / progressData.overall.totalExercises) * 100
        ),
        color: '#8B5CF6',
      },
      {
        category: 'Flashcards',
        completed: progressData.overall.flashcardsReviewed,
        total: progressData.overall.totalFlashcards,
        percentage: Math.round(
          (progressData.overall.flashcardsReviewed / progressData.overall.totalFlashcards) * 100
        ),
        color: '#EC4899',
      },
    ];
  };

  // Generate progress report
  const handleGenerateReport = (startDate: string, endDate: string) => {
    if (!progressData) return null;

    const report = generateProgressReport(
      progressData,
      {
        name: 'John Doe', // Should come from auth store
        email: 'john@example.com',
        learningTrack: '30-day',
      },
      startDate,
      endDate
    );

    showToast({
      type: 'success',
      message: 'Report generated successfully',
    });

    return report;
  };

  // Handle sync
  const handleSync = async () => {
    try {
      await syncProgress();
      showToast({
        type: 'success',
        message: 'Progress synced successfully',
      });
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Failed to sync progress',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading progress data...</p>
        </div>
      </div>
    );
  }

  if (!progressData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">No progress data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              Your Progress
            </h1>
            <p className="text-gray-600 mt-1">
              Track your learning journey and achievements
            </p>
          </div>
          <button
            onClick={handleSync}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Sync Progress
          </button>
        </motion.div>

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ProgressOverview progress={progressData.overall} />
        </motion.div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ProgressChart
              data={getTimeSeriesData()}
              type="line"
              title="Activity Trend"
              description={`Your learning activity over the last ${timeRange}`}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <ProgressChart
              data={getCategoryProgress()}
              type="pie"
              title="Progress Distribution"
              description="Breakdown of your progress across different categories"
            />
          </motion.div>
        </div>

        {/* Module Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <ModuleProgress modules={progressData.modules} />
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Statistics
            daily={progressData.daily}
            weekly={progressData.weekly}
            performance={calculatePerformanceMetrics(quizzes, exercises, 85)}
          />
        </motion.div>

        {/* Milestones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Milestones
            milestones={progressData.milestones}
            onCelebrate={(milestone) => {
              showToast({
                type: 'success',
                message: `Congratulations on achieving: ${milestone.title}!`,
              });
            }}
          />
        </motion.div>

        {/* Study Time Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <ProgressChart
            data={getTimeSeriesData()}
            type="area"
            title="Study Time"
            description="Your study time over the selected period (in minutes)"
          />
        </motion.div>

        {/* Progress Report */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <ProgressReportComponent
            report={generateProgressReport(
              progressData,
              {
                name: 'John Doe',
                email: 'john@example.com',
                learningTrack: '30-day',
              },
              new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
              new Date().toISOString()
            )}
            onGenerateReport={handleGenerateReport}
          />
        </motion.div>
      </div>
    </div>
  );
}
