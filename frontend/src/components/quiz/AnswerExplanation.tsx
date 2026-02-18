/**
 * AnswerExplanation Component
 * Displays detailed explanation for quiz answers
 * Shows after quiz submission with correct/incorrect feedback
 */

import { CheckCircle2, XCircle, Lightbulb, Star } from 'lucide-react';
import type { QuestionResult } from '../../types/quiz';

interface AnswerExplanationProps {
  result: QuestionResult;
  className?: string;
}

export const AnswerExplanation: React.FC<AnswerExplanationProps> = ({
  result,
  className = '',
}) => {
  const {
    question,
    userAnswer,
    correctAnswer,
    isCorrect,
    points,
    earnedPoints,
    explanation,
    timeSpent,
  } = result;

  // Format time spent
  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Format answer for display
  const formatAnswer = (answer: string | string[] | boolean): string => {
    if (typeof answer === 'boolean') {
      return answer ? 'True' : 'False';
    }
    if (Array.isArray(answer)) {
      return answer.join(', ');
    }
    return answer || 'No answer provided';
  };

  return (
    <div
      className={`bg-white rounded-lg border-2 shadow-sm overflow-hidden ${
        isCorrect ? 'border-green-300' : 'border-red-300'
      } ${className}`}
    >
      {/* Header */}
      <div
        className={`px-6 py-4 flex items-center justify-between ${
          isCorrect ? 'bg-green-50' : 'bg-red-50'
        }`}
      >
        <div className="flex items-center gap-3">
          {isCorrect ? (
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          ) : (
            <XCircle className="w-6 h-6 text-red-600" />
          )}
          <div>
            <h4
              className={`font-semibold ${
                isCorrect ? 'text-green-900' : 'text-red-900'
              }`}
            >
              {isCorrect ? 'Correct Answer!' : 'Incorrect Answer'}
            </h4>
            <p
              className={`text-sm ${
                isCorrect ? 'text-green-700' : 'text-red-700'
              }`}
            >
              {question}
            </p>
          </div>
        </div>

        {/* Points */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="flex items-center gap-1 text-yellow-600">
              <Star className="w-4 h-4 fill-current" />
              <span className="font-semibold">
                {earnedPoints} / {points}
              </span>
            </div>
            <p className="text-xs text-gray-600">Time: {formatTime(timeSpent)}</p>
          </div>
        </div>
      </div>

      {/* Answer Details */}
      <div className="px-6 py-4 space-y-4">
        {/* Your Answer */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-1">Your Answer:</p>
          <div
            className={`p-3 rounded-lg ${
              isCorrect
                ? 'bg-green-50 text-green-900 border border-green-200'
                : 'bg-red-50 text-red-900 border border-red-200'
            }`}
          >
            {formatAnswer(userAnswer)}
          </div>
        </div>

        {/* Correct Answer (if incorrect) */}
        {!isCorrect && (
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">Correct Answer:</p>
            <div className="p-3 rounded-lg bg-green-50 text-green-900 border border-green-200">
              {formatAnswer(correctAnswer)}
            </div>
          </div>
        )}

        {/* Explanation */}
        {explanation && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900 mb-1">Explanation:</p>
                <p className="text-sm text-blue-800">{explanation}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Compact Explanation - for use in question review
 */
interface CompactExplanationProps {
  isCorrect: boolean;
  explanation?: string;
}

export const CompactExplanation: React.FC<CompactExplanationProps> = ({
  isCorrect,
  explanation,
}) => {
  if (!explanation) return null;

  return (
    <div
      className={`mt-4 p-4 rounded-lg border ${
        isCorrect
          ? 'bg-green-50 border-green-200'
          : 'bg-blue-50 border-blue-200'
      }`}
    >
      <div className="flex items-start gap-2">
        <Lightbulb
          className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
            isCorrect ? 'text-green-600' : 'text-blue-600'
          }`}
        />
        <div>
          <p
            className={`text-sm font-semibold mb-1 ${
              isCorrect ? 'text-green-900' : 'text-blue-900'
            }`}
          >
            Explanation:
          </p>
          <p
            className={`text-sm ${
              isCorrect ? 'text-green-800' : 'text-blue-800'
            }`}
          >
            {explanation}
          </p>
        </div>
      </div>
    </div>
  );
};
