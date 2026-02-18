/**
 * ModuleProgress Component
 * Displays progress breakdown by module/week
 */

import React, { useState } from 'react';
import { CheckCircle, Circle, Lock, ChevronRight, Clock, Award } from 'lucide-react';
import type { ModuleProgressData } from '../../types/progress.types';
import { formatStudyTime } from '../../lib/progress/progressCalculations';

interface ModuleProgressProps {
  modules: ModuleProgressData[];
  className?: string;
}

export const ModuleProgress: React.FC<ModuleProgressProps> = ({ modules, className = '' }) => {
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  const getStatusIcon = (module: ModuleProgressData) => {
    if (module.isLocked) {
      return <Lock className="w-5 h-5 text-gray-400" />;
    }
    if (module.progress === 100) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
    if (module.progress > 0) {
      return <Circle className="w-5 h-5 text-blue-600" fill="currentColor" fillOpacity={0.2} />;
    }
    return <Circle className="w-5 h-5 text-gray-400" />;
  };

  const getProgressColor = (progress: number): string => {
    if (progress === 100) return 'bg-green-600';
    if (progress >= 75) return 'bg-blue-600';
    if (progress >= 50) return 'bg-yellow-600';
    if (progress >= 25) return 'bg-orange-600';
    return 'bg-red-600';
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModule(expandedModule === moduleId ? null : moduleId);
  };

  return (
    <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Module Progress</h2>

      <div className="space-y-3">
        {modules.map((module) => (
          <div
            key={module.moduleId}
            className={`border rounded-lg transition-all ${
              module.isLocked
                ? 'border-gray-200 bg-gray-50'
                : 'border-gray-300 hover:border-blue-400 hover:shadow-sm'
            }`}
          >
            {/* Module Header */}
            <div
              className={`p-4 ${module.isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              onClick={() => !module.isLocked && toggleModule(module.moduleId)}
            >
              <div className="flex items-center gap-4">
                {/* Status Icon */}
                <div className="flex-shrink-0">{getStatusIcon(module)}</div>

                {/* Module Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-500 uppercase">
                      Week {module.weekNumber}
                    </span>
                    {module.progress === 100 && (
                      <Award className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                  <h3
                    className={`font-semibold text-gray-900 truncate ${
                      module.isLocked ? 'text-gray-400' : ''
                    }`}
                  >
                    {module.moduleName}
                  </h3>

                  {/* Progress Bar */}
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getProgressColor(module.progress)} transition-all duration-500`}
                        style={{ width: `${module.progress}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700 w-12 text-right">
                      {module.progress}%
                    </span>
                  </div>
                </div>

                {/* Expand Icon */}
                {!module.isLocked && (
                  <ChevronRight
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      expandedModule === module.moduleId ? 'rotate-90' : ''
                    }`}
                  />
                )}
              </div>
            </div>

            {/* Module Details (Expanded) */}
            {expandedModule === module.moduleId && !module.isLocked && (
              <div className="px-4 pb-4 border-t border-gray-200">
                <div className="pt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Lessons */}
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-blue-600 font-medium mb-1">Lessons</p>
                    <p className="text-lg font-bold text-gray-900">
                      {module.lessonsCompleted}
                      <span className="text-sm text-gray-500">/{module.totalLessons}</span>
                    </p>
                  </div>

                  {/* Quizzes */}
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs text-green-600 font-medium mb-1">Quizzes</p>
                    <p className="text-lg font-bold text-gray-900">
                      {module.quizzesPassed}
                      <span className="text-sm text-gray-500">/{module.totalQuizzes}</span>
                    </p>
                  </div>

                  {/* Exercises */}
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-xs text-purple-600 font-medium mb-1">Exercises</p>
                    <p className="text-lg font-bold text-gray-900">
                      {module.exercisesCompleted}
                      <span className="text-sm text-gray-500">/{module.totalExercises}</span>
                    </p>
                  </div>

                  {/* Time Spent */}
                  <div className="bg-indigo-50 rounded-lg p-3">
                    <p className="text-xs text-indigo-600 font-medium mb-1">Time Spent</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatStudyTime(module.timeSpent)}
                    </p>
                  </div>
                </div>

                {/* Dates */}
                <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                  {module.startedAt && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        Started: {new Date(module.startedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {module.completedAt && (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>
                        Completed: {new Date(module.completedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Prerequisites */}
                {module.prerequisites.length > 0 && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-600 mb-1">Prerequisites:</p>
                    <div className="flex flex-wrap gap-1">
                      {module.prerequisites.map((prereq) => (
                        <span
                          key={prereq}
                          className="px-2 py-1 bg-white border border-gray-300 rounded text-xs text-gray-700"
                        >
                          {prereq}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-green-600">
              {modules.filter((m) => m.progress === 100).length}
            </p>
            <p className="text-sm text-gray-600">Completed</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {modules.filter((m) => m.progress > 0 && m.progress < 100).length}
            </p>
            <p className="text-sm text-gray-600">In Progress</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-600">
              {modules.filter((m) => m.progress === 0 && !m.isLocked).length}
            </p>
            <p className="text-sm text-gray-600">Not Started</p>
          </div>
        </div>
      </div>
    </div>
  );
};
