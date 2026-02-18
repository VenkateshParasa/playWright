import React, { useState } from 'react';
import { CheckCircle, Circle, Clock, BookOpen } from 'lucide-react';

interface LessonProgressProps {
  lessonId: string;
  completed: boolean;
  timeSpent: number; // in seconds
  estimatedTime: number; // in minutes
  onMarkComplete: (lessonId: string) => void;
  onMarkIncomplete?: (lessonId: string) => void;
  className?: string;
}

export default function LessonProgress({
  lessonId,
  completed,
  timeSpent,
  estimatedTime,
  onMarkComplete,
  onMarkIncomplete,
  className = '',
}: LessonProgressProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleComplete = async () => {
    setIsLoading(true);
    try {
      if (completed && onMarkIncomplete) {
        await onMarkIncomplete(lessonId);
      } else {
        await onMarkComplete(lessonId);
      }
    } catch (error) {
      console.error('Failed to update lesson progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const progressPercentage = Math.min(
    100,
    (timeSpent / (estimatedTime * 60)) * 100
  );

  return (
    <div
      className={`lesson-progress bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Lesson Progress
        </h3>
        {completed && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
            <CheckCircle className="w-3 h-3" />
            Completed
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="space-y-3 mb-4">
        {/* Time spent */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Time Spent</span>
          </div>
          <span className="font-medium text-gray-900 dark:text-white">
            {formatTime(timeSpent)}
          </span>
        </div>

        {/* Estimated time */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <BookOpen className="w-4 h-4" />
            <span>Estimated Time</span>
          </div>
          <span className="font-medium text-gray-900 dark:text-white">
            {estimatedTime} min
          </span>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
            <span>Reading Progress</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                completed
                  ? 'bg-green-600 dark:bg-green-500'
                  : 'bg-blue-600 dark:bg-blue-500'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={handleToggleComplete}
        disabled={isLoading}
        className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
          completed
            ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            : 'bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Updating...</span>
          </>
        ) : completed ? (
          <>
            <Circle className="w-4 h-4" />
            <span>Mark as Incomplete</span>
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4" />
            <span>Mark as Complete</span>
          </>
        )}
      </button>

      {/* Completion message */}
      {completed && (
        <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-xs text-green-700 dark:text-green-400 text-center">
            Great job! You've completed this lesson.
          </p>
        </div>
      )}
    </div>
  );
}
