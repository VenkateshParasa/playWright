/**
 * Performance Predictions Component
 * Shows AI predictions for learning outcomes
 */

import React, { useEffect } from 'react';
import { useAIStore } from '../../stores/aiStore';
import { TrendingUp, AlertCircle, Award, Clock } from 'lucide-react';

export const PerformancePredictions: React.FC = () => {
  const {
    dropoutRisk,
    learningEfficiency,
    loadingPredictions,
    fetchDropoutRisk,
    fetchLearningEfficiency,
  } = useAIStore();

  useEffect(() => {
    fetchDropoutRisk();
    fetchLearningEfficiency();
  }, []);

  if (loadingPredictions) {
    return <div className="animate-pulse bg-gray-200 rounded-lg h-64"></div>;
  }

  return (
    <div className="space-y-6">
      {/* Learning Efficiency */}
      {learningEfficiency && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2 text-purple-600" />
            Learning Efficiency
          </h3>
          <div className="flex items-center space-x-6 mb-6">
            <div className="relative w-24 h-24">
              <svg className="transform -rotate-90 w-24 h-24">
                <circle cx="48" cy="48" r="44" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                <circle
                  cx="48"
                  cy="48"
                  r="44"
                  stroke="#a855f7"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(learningEfficiency.score / 100) * 276} 276`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold">{Math.round(learningEfficiency.score)}</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-2">
                You're in the top {100 - learningEfficiency.percentile}% of learners!
              </p>
              <div className="text-sm">
                <p className="text-gray-600 mb-1">XP per Hour:</p>
                <p className="font-semibold text-lg text-purple-600">
                  {learningEfficiency.score.toFixed(1)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold text-green-600 mb-2">Strengths</h4>
              <ul className="space-y-1">
                {learningEfficiency.strengths.map((strength: string, i: number) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-orange-600 mb-2">
                Areas to Improve
              </h4>
              <ul className="space-y-1">
                {learningEfficiency.improvementAreas.map((area: string, i: number) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start">
                    <span className="text-orange-600 mr-2">→</span>
                    {area}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Dropout Risk */}
      {dropoutRisk && (
        <div
          className={`rounded-lg shadow-md p-6 ${
            dropoutRisk.riskLevel === 'high'
              ? 'bg-red-50 border-2 border-red-200'
              : dropoutRisk.riskLevel === 'medium'
              ? 'bg-orange-50 border-2 border-orange-200'
              : 'bg-green-50 border-2 border-green-200'
          }`}
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            Engagement Analysis
          </h3>

          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-2">Risk Level</p>
              <p
                className={`text-2xl font-bold ${
                  dropoutRisk.riskLevel === 'high'
                    ? 'text-red-600'
                    : dropoutRisk.riskLevel === 'medium'
                    ? 'text-orange-600'
                    : 'text-green-600'
                }`}
              >
                {dropoutRisk.riskLevel.toUpperCase()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-2">Risk Score</p>
              <p className="text-2xl font-bold text-gray-900">{dropoutRisk.riskScore}%</p>
            </div>
          </div>

          {dropoutRisk.indicators.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-semibold mb-2">Indicators:</p>
              <ul className="space-y-1">
                {dropoutRisk.indicators.map((indicator: string, i: number) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start">
                    <span className="mr-2">•</span>
                    {indicator}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {dropoutRisk.recommendations.length > 0 && (
            <div>
              <p className="text-sm font-semibold mb-2">Recommendations:</p>
              <ul className="space-y-1">
                {dropoutRisk.recommendations.map((rec: string, i: number) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start">
                    <span className="text-blue-600 mr-2">→</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
