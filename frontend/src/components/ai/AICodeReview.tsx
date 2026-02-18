/**
 * AI Code Review Component
 * Displays AI-powered code analysis and suggestions
 */

import React from 'react';
import { useAIStore } from '../../stores/aiStore';
import { CheckCircle, AlertTriangle, Info, Lightbulb, Code } from 'lucide-react';

interface AICodeReviewProps {
  code: string;
  language: string;
  exerciseId?: string;
}

export const AICodeReview: React.FC<AICodeReviewProps> = ({
  code,
  language,
  exerciseId,
}) => {
  const { codeAnalysis, loadingAnalysis, analyzeCode } = useAIStore();

  React.useEffect(() => {
    if (code && code.trim().length > 10) {
      analyzeCode(code, language, exerciseId);
    }
  }, [code]);

  if (!code || code.trim().length < 10) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <Code className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">Write some code to get AI-powered feedback</p>
      </div>
    );
  }

  if (loadingAnalysis) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!codeAnalysis) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Quality Score */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Code Quality Score</h3>
        <div className="flex items-center space-x-4">
          <div className="relative w-32 h-32">
            <svg className="transform -rotate-90 w-32 h-32">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="#e5e7eb"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke={
                  codeAnalysis.quality >= 80
                    ? '#10b981'
                    : codeAnalysis.quality >= 60
                    ? '#f59e0b'
                    : '#ef4444'
                }
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${(codeAnalysis.quality / 100) * 352} 352`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold">{codeAnalysis.quality}</span>
            </div>
          </div>
          <div>
            <p className="text-gray-600 mb-2">
              {codeAnalysis.quality >= 80
                ? 'Excellent! Your code follows best practices.'
                : codeAnalysis.quality >= 60
                ? 'Good work! Some improvements will make it great.'
                : 'Keep practicing! Focus on the suggestions below.'}
            </p>
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-gray-500">
                Complexity: {codeAnalysis.metrics.complexity}
              </span>
              <span className="text-gray-500">
                Maintainability: {codeAnalysis.metrics.maintainability}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Issues */}
      {codeAnalysis.issues && codeAnalysis.issues.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
            Issues Found ({codeAnalysis.issues.length})
          </h3>
          <div className="space-y-3">
            {codeAnalysis.issues.map((issue: any, index: number) => (
              <IssueCard key={index} issue={issue} />
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {codeAnalysis.suggestions && codeAnalysis.suggestions.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Lightbulb className="w-5 h-5 mr-2 text-yellow-600" />
            Suggestions for Improvement
          </h3>
          <div className="space-y-4">
            {codeAnalysis.suggestions.map((suggestion: any, index: number) => (
              <SuggestionCard key={index} suggestion={suggestion} />
            ))}
          </div>
        </div>
      )}

      {/* Best Practices */}
      {codeAnalysis.bestPractices && codeAnalysis.bestPractices.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Best Practices</h3>
          <div className="space-y-2">
            {codeAnalysis.bestPractices.map((practice: any, index: number) => (
              <div
                key={index}
                className={`flex items-start space-x-3 p-3 rounded-lg ${
                  practice.followed
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="flex-shrink-0 mt-1">
                  {practice.followed ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Info className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      practice.followed ? 'text-green-900' : 'text-gray-700'
                    }`}
                  >
                    {practice.practice}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {practice.explanation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comparison with Ideal */}
      {codeAnalysis.comparison && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            Comparison with Ideal Solution
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-blue-700 font-medium mb-2">
                Similarity Score: {Math.round(codeAnalysis.comparison.similarityScore)}%
              </p>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${codeAnalysis.comparison.similarityScore}%`,
                  }}
                ></div>
              </div>
            </div>

            {codeAnalysis.comparison.improvements.length > 0 && (
              <div>
                <p className="text-sm font-medium text-blue-900 mb-2">
                  Key Improvements:
                </p>
                <ul className="space-y-1">
                  {codeAnalysis.comparison.improvements.map(
                    (improvement: string, index: number) => (
                      <li key={index} className="text-sm text-blue-800 flex items-start">
                        <span className="mr-2">•</span>
                        <span>{improvement}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface IssueCardProps {
  issue: any;
}

const IssueCard: React.FC<IssueCardProps> = ({ issue }) => {
  const severityColors = {
    high: 'bg-red-50 border-red-200 text-red-900',
    medium: 'bg-orange-50 border-orange-200 text-orange-900',
    low: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  };

  const typeIcons = {
    error: <AlertTriangle className="w-5 h-5 text-red-600" />,
    warning: <AlertTriangle className="w-5 h-5 text-orange-600" />,
    info: <Info className="w-5 h-5 text-blue-600" />,
  };

  return (
    <div className={`border rounded-lg p-4 ${severityColors[issue.severity]}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">{typeIcons[issue.type]}</div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xs font-mono bg-white px-2 py-1 rounded">
              Line {issue.line}
            </span>
            <span className="text-xs font-semibold uppercase">{issue.category}</span>
          </div>
          <p className="text-sm font-medium">{issue.message}</p>
        </div>
      </div>
    </div>
  );
};

interface SuggestionCardProps {
  suggestion: any;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestion }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <h4 className="font-semibold text-gray-900 mb-2">{suggestion.title}</h4>
      <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>

      {suggestion.before && suggestion.after && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1">Before:</p>
            <pre className="bg-red-50 border border-red-200 rounded p-2 text-xs overflow-x-auto">
              <code>{suggestion.before}</code>
            </pre>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1">After:</p>
            <pre className="bg-green-50 border border-green-200 rounded p-2 text-xs overflow-x-auto">
              <code>{suggestion.after}</code>
            </pre>
          </div>
        </div>
      )}

      <div className="flex items-center space-x-2 text-xs text-green-600">
        <CheckCircle className="w-4 h-4" />
        <span className="font-medium">Benefit: {suggestion.benefit}</span>
      </div>
    </div>
  );
};
