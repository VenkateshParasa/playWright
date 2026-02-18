/**
 * Adaptive Learning Path Component
 * Shows personalized learning path with adjustments
 */

import React, { useEffect } from 'react';
import { useAIStore } from '../../stores/aiStore';
import { Route, FastForward, AlertCircle, TrendingUp, BookOpen } from 'lucide-react';

export const AdaptiveLearningPath: React.FC = () => {
  const {
    learningPath,
    performanceAnalysis,
    loadingAdaptive,
    fetchLearningPath,
    fetchPerformanceAnalysis,
  } = useAIStore();

  useEffect(() => {
    fetchLearningPath();
    fetchPerformanceAnalysis();
  }, []);

  if (loadingAdaptive) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Level & Pace */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Route className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Your Learning Path</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Current Level</p>
            <p className="text-2xl font-bold text-blue-600 capitalize">
              {learningPath?.currentLevel || 'Beginner'}
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Suggested Pace</p>
            <p className="text-2xl font-bold text-green-600 capitalize">
              {learningPath?.paceSuggestion?.replace('-', ' ') || 'Normal'}
            </p>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Difficulty</p>
            <p className="text-2xl font-bold text-purple-600 capitalize">
              {learningPath?.difficultyAdjustment || 'Same'}
            </p>
          </div>
        </div>

        {/* Performance Analysis */}
        {performanceAnalysis && (
          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Performance Overview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                label="Overall Score"
                value={`${Math.round(performanceAnalysis.overallScore)}%`}
                color="blue"
              />
              <MetricCard
                label="Retention"
                value={`${Math.round(performanceAnalysis.retentionRate)}%`}
                color="green"
              />
              <MetricCard
                label="Efficiency"
                value={Math.round(performanceAnalysis.learningEfficiency)}
                color="purple"
              />
              <MetricCard
                label="Consistency"
                value={`${Math.round(performanceAnalysis.consistencyScore)}%`}
                color="orange"
              />
            </div>
          </div>
        )}
      </div>

      {/* Recommended Path */}
      {learningPath && learningPath.recommendedPath.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
            Recommended Learning Sequence
          </h3>
          <div className="space-y-3">
            {learningPath.recommendedPath.map((item, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item}</p>
                </div>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skippable Content */}
      {learningPath && learningPath.skippableContent.length > 0 && (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
          <h3 className="font-semibold text-green-900 mb-3 flex items-center">
            <FastForward className="w-5 h-5 mr-2" />
            You Can Skip These
          </h3>
          <p className="text-sm text-green-700 mb-3">
            Based on your performance, you've already mastered these topics:
          </p>
          <ul className="space-y-2">
            {learningPath.skippableContent.map((item, index) => (
              <li key={index} className="flex items-center space-x-2">
                <span className="text-green-600">✓</span>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Required Remediation */}
      {learningPath && learningPath.requiredRemediation.length > 0 && (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6">
          <h3 className="font-semibold text-orange-900 mb-3 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            Areas Needing Practice
          </h3>
          <p className="text-sm text-orange-700 mb-3">
            Focus on these topics to strengthen your foundation:
          </p>
          <ul className="space-y-2">
            {learningPath.requiredRemediation.map((item, index) => (
              <li key={index} className="flex items-center space-x-2">
                <span className="text-orange-600">!</span>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Weak & Strong Areas */}
      {performanceAnalysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {performanceAnalysis.weakCategories.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-red-600 mb-4">Areas to Improve</h3>
              <div className="space-y-2">
                {performanceAnalysis.weakCategories.map(
                  (category: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-red-50 rounded"
                    >
                      <span className="text-gray-700">{category}</span>
                      <span className="text-xs text-red-600 font-medium">
                        {Math.round(
                          performanceAnalysis.categoryScores.get(category) || 0
                        )}
                        %
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {performanceAnalysis.strongCategories.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-green-600 mb-4">Your Strengths</h3>
              <div className="space-y-2">
                {performanceAnalysis.strongCategories.map(
                  (category: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-green-50 rounded"
                    >
                      <span className="text-gray-700">{category}</span>
                      <span className="text-xs text-green-600 font-medium">
                        {Math.round(
                          performanceAnalysis.categoryScores.get(category) || 0
                        )}
                        %
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface MetricCardProps {
  label: string;
  value: string | number;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className={`rounded-lg p-3 ${colorClasses[color]}`}>
      <p className="text-xs opacity-75 mb-1">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
};
