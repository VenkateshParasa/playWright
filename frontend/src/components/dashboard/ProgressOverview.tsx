import { TrendingUp, BookOpen, CheckCircle2 } from 'lucide-react';

interface ProgressOverviewProps {
  overallProgress: number;
  currentWeek: number;
  totalWeeks: number;
  lessonsCompleted: number;
  totalLessons: number;
  isLoading?: boolean;
}

export default function ProgressOverview({
  overallProgress,
  currentWeek,
  totalWeeks,
  lessonsCompleted,
  totalLessons,
  isLoading = false,
}: ProgressOverviewProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Progress Overview</h3>
      </div>

      {/* Overall Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm font-bold text-blue-600">{overallProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${overallProgress}%` }}
          ></div>
        </div>
      </div>

      {/* Current Week Indicator */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Current Progress</p>
            <p className="text-xl font-bold text-blue-600">
              Week {currentWeek} of {totalWeeks}
            </p>
          </div>
          <div className="bg-blue-100 rounded-full p-3">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Lessons Completed */}
      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 rounded-full p-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Lessons Completed</p>
            <p className="text-lg font-bold text-gray-900">
              {lessonsCompleted} / {totalLessons}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-green-600">
            {Math.round((lessonsCompleted / totalLessons) * 100)}%
          </p>
        </div>
      </div>
    </div>
  );
}
