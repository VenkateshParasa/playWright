import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { LessonNavigation as LessonNavigationType } from '../../types/lesson.types';

interface LessonNavigationProps {
  navigation: LessonNavigationType;
  className?: string;
  onNavigate?: (direction: 'previous' | 'next') => void;
}

export default function LessonNavigation({
  navigation,
  className = '',
  onNavigate,
}: LessonNavigationProps) {
  const navigate = useNavigate();

  const handlePrevious = () => {
    if (navigation.previousLesson) {
      if (onNavigate) {
        onNavigate('previous');
      } else {
        navigate(`/lessons/${navigation.previousLesson.id}`);
      }
    }
  };

  const handleNext = () => {
    if (navigation.nextLesson) {
      if (onNavigate) {
        onNavigate('next');
      } else {
        navigate(`/lessons/${navigation.nextLesson.id}`);
      }
    }
  };

  return (
    <nav
      className={`lesson-navigation ${className}`}
      aria-label="Lesson navigation"
    >
      <div className="flex items-center justify-between gap-4 py-6 border-t border-gray-200 dark:border-gray-700">
        {/* Previous Lesson */}
        <div className="flex-1">
          {navigation.previousLesson ? (
            <button
              onClick={handlePrevious}
              className="group flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all w-full text-left"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Previous Lesson
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {navigation.previousLesson.title}
                </div>
              </div>
            </button>
          ) : (
            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 opacity-50">
              <div className="text-xs text-gray-400 dark:text-gray-600">
                No previous lesson
              </div>
            </div>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="hidden sm:flex flex-col items-center gap-2 px-4">
          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            Progress
          </div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            {navigation.currentIndex} / {navigation.totalLessons}
          </div>
          <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-300"
              style={{
                width: `${(navigation.currentIndex / navigation.totalLessons) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Next Lesson */}
        <div className="flex-1">
          {navigation.nextLesson ? (
            <button
              onClick={handleNext}
              className="group flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all w-full text-right"
            >
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Next Lesson
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {navigation.nextLesson.title}
                </div>
              </div>
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
              </div>
            </button>
          ) : (
            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 opacity-50 text-right">
              <div className="text-xs text-gray-400 dark:text-gray-600">
                No next lesson
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Progress */}
      <div className="sm:hidden flex items-center justify-center gap-3 pb-4">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Lesson {navigation.currentIndex} of {navigation.totalLessons}
        </span>
        <div className="flex-1 max-w-xs h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-300"
            style={{
              width: `${(navigation.currentIndex / navigation.totalLessons) * 100}%`,
            }}
          />
        </div>
      </div>
    </nav>
  );
}
