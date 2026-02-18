/**
 * Recommendations Panel Component
 * Displays AI-powered content recommendations
 */

import React, { useEffect } from 'react';
import { useAIStore } from '../../stores/aiStore';
import { Sparkles, TrendingUp, Clock, Target } from 'lucide-react';

export const RecommendationsPanel: React.FC = () => {
  const {
    recommendations,
    nextLesson,
    loadingRecommendations,
    fetchRecommendations,
    fetchNextLesson,
  } = useAIStore();

  useEffect(() => {
    fetchRecommendations();
    fetchNextLesson();
  }, []);

  if (loadingRecommendations) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Next Lesson Recommendation */}
      {nextLesson && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center space-x-2 mb-4">
            <Sparkles className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Recommended Next</h3>
          </div>

          <div className="space-y-3">
            <h4 className="text-xl font-bold">{nextLesson.item.category}</h4>
            <p className="text-blue-100">{nextLesson.reason}</p>

            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{nextLesson.item.avgCompletionTime} min</span>
              </div>
              <div className="flex items-center space-x-1">
                <Target className="w-4 h-4" />
                <span className="capitalize">{nextLesson.item.difficulty}</span>
              </div>
            </div>

            <button className="mt-4 bg-white text-blue-600 font-semibold py-2 px-6 rounded-lg hover:bg-blue-50 transition-colors">
              Start Learning
            </button>
          </div>
        </div>
      )}

      {/* Other Recommendations */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Personalized Recommendations
          </h3>
          <button
            onClick={() => fetchRecommendations()}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Refresh
          </button>
        </div>

        <div className="space-y-4">
          {recommendations.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No recommendations available yet. Complete more activities to get personalized suggestions!
            </p>
          ) : (
            recommendations.map((rec, index) => (
              <RecommendationCard key={index} recommendation={rec} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

interface RecommendationCardProps {
  recommendation: any;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation }) => {
  const priorityColors = {
    high: 'border-red-200 bg-red-50',
    medium: 'border-yellow-200 bg-yellow-50',
    low: 'border-green-200 bg-green-50',
  };

  const priorityIcons = {
    high: '🔥',
    medium: '⭐',
    low: '💡',
  };

  return (
    <div
      className={`border-2 rounded-lg p-4 hover:shadow-md transition-shadow ${
        priorityColors[recommendation.priority]
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xl">{priorityIcons[recommendation.priority]}</span>
            <h4 className="font-semibold text-gray-900">
              {recommendation.item.category}
            </h4>
            <span className="text-xs px-2 py-1 rounded-full bg-white text-gray-600">
              {recommendation.item.type}
            </span>
          </div>

          <p className="text-sm text-gray-600 mb-3">{recommendation.reason}</p>

          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span className="capitalize">{recommendation.item.difficulty}</span>
            <span>•</span>
            <span>Score: {Math.round(recommendation.score)}%</span>
          </div>
        </div>

        <button className="ml-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
          View
        </button>
      </div>
    </div>
  );
};
