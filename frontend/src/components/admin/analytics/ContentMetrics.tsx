import React from 'react';
import { BookOpen, FileQuestion, Code, CreditCard, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, LineChart, Heatmap } from './charts';
import { ContentMetrics as ContentMetricsType } from '../../../stores/adminAnalyticsStore';

interface ContentMetricsProps {
  metrics: ContentMetricsType;
}

export const ContentMetrics: React.FC<ContentMetricsProps> = ({ metrics }) => {
  const stats = [
    {
      label: 'Total Lessons',
      value: metrics.totalLessons,
      icon: BookOpen,
      color: 'blue',
    },
    {
      label: 'Total Quizzes',
      value: metrics.totalQuizzes,
      icon: FileQuestion,
      color: 'green',
    },
    {
      label: 'Total Exercises',
      value: metrics.totalExercises,
      icon: Code,
      color: 'purple',
    },
    {
      label: 'Total Flashcards',
      value: metrics.totalFlashcards,
      icon: CreditCard,
      color: 'amber',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; icon: string }> = {
      blue: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'text-blue-500' },
      green: { bg: 'bg-green-50', text: 'text-green-600', icon: 'text-green-500' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-600', icon: 'text-purple-500' },
      amber: { bg: 'bg-amber-50', text: 'text-amber-600', icon: 'text-amber-500' },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Content Metrics</h2>
        <div className="text-sm text-gray-600">
          Total Content Items: <span className="font-semibold">{
            metrics.totalLessons + metrics.totalQuizzes + metrics.totalExercises + metrics.totalFlashcards
          }</span>
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

      {/* Flashcard Reviews */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Flashcard Activity</h3>
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center p-6 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-gray-600 mb-2">Total Reviews</p>
            <p className="text-4xl font-bold text-blue-600">
              {metrics.flashcardReviewCount.toLocaleString()}
            </p>
          </div>
          <div className="text-center p-6 bg-green-50 rounded-lg">
            <p className="text-sm font-medium text-gray-600 mb-2">Reviews This Week</p>
            <p className="text-4xl font-bold text-green-600">
              {metrics.flashcardReviewThisWeek.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Completion Rates by Module */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <BarChart
          data={metrics.completionRatesByModule}
          xKey="module"
          bars={[{ dataKey: 'rate', name: 'Completion Rate (%)', fill: '#3b82f6' }]}
          title="Completion Rates by Module"
          height={350}
          yLabel="Completion Rate (%)"
        />
      </div>

      {/* Average Quiz Scores Over Time */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <LineChart
          data={metrics.averageQuizScores}
          xKey="date"
          lines={[{ dataKey: 'averageScore', name: 'Average Score', stroke: '#10b981' }]}
          title="Average Quiz Scores (Last 30 Days)"
          height={350}
          xLabel="Date"
          yLabel="Average Score"
        />
      </div>

      {/* Quiz Pass Rates */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <BarChart
          data={metrics.quizPassRates}
          xKey="quizName"
          bars={[{ dataKey: 'passRate', name: 'Pass Rate (%)', fill: '#10b981' }]}
          title="Quiz Pass Rates"
          height={350}
          layout="vertical"
        />
      </div>

      {/* Popular Lessons */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Most Popular Lessons (Top 10)</h3>
        <div className="space-y-3">
          {metrics.popularLessons.map((lesson, index) => (
            <div
              key={lesson.lessonId}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-semibold text-sm">
                  {index + 1}
                </span>
                <span className="font-medium text-gray-900">{lesson.title}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600 text-sm">{lesson.views} views</span>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Difficult Exercises */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Most Difficult Exercises</h3>
        <div className="space-y-3">
          {metrics.difficultExercises.map((exercise) => (
            <div
              key={exercise.exerciseId}
              className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
            >
              <span className="font-medium text-gray-900">{exercise.exerciseName}</span>
              <div className="flex items-center space-x-2">
                <span className="text-red-600 font-semibold">
                  {exercise.completionRate}%
                </span>
                <TrendingDown className="w-4 h-4 text-red-500" />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> Consider adding more hints or breaking down these exercises
            into smaller steps to improve completion rates.
          </p>
        </div>
      </div>

      {/* Least Completed Lessons */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Least Completed Lessons</h3>
        <div className="space-y-3">
          {metrics.leastCompletedLessons.map((lesson) => (
            <div
              key={lesson.lessonId}
              className="flex items-center justify-between p-3 bg-amber-50 rounded-lg"
            >
              <span className="font-medium text-gray-900">{lesson.title}</span>
              <span className="text-amber-600 font-semibold">
                {lesson.completionRate}% completion
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Action:</strong> Review these lessons for clarity, difficulty, or placement
            in the curriculum.
          </p>
        </div>
      </div>

      {/* Engagement Heatmap */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <Heatmap
          data={metrics.engagementHeatmap}
          title="Content Engagement (Day of Week × Hour of Day)"
          height={400}
        />
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Insight:</strong> Use this heatmap to identify peak learning times and
            schedule content releases or live sessions accordingly.
          </p>
        </div>
      </div>
    </div>
  );
};
