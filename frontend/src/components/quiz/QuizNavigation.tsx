/**
 * QuizNavigation Component
 * Provides navigation between questions with overview grid
 * Shows question status: answered, unanswered, marked for review
 */

import { ChevronLeft, ChevronRight, Grid3x3, Check, AlertCircle, Circle } from 'lucide-react';
import { useState } from 'react';
import type { Question, QuizAnswer } from '../../types/quiz';

interface QuizNavigationProps {
  questions: Question[];
  currentIndex: number;
  answers: Record<string, QuizAnswer>;
  onNavigate: (index: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  className?: string;
}

export const QuizNavigation: React.FC<QuizNavigationProps> = ({
  questions,
  currentIndex,
  answers,
  onNavigate,
  onPrevious,
  onNext,
  className = '',
}) => {
  const [showGrid, setShowGrid] = useState(false);

  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < questions.length - 1;

  // Get question status
  const getQuestionStatus = (question: Question) => {
    const answer = answers[question.id];
    if (!answer) return 'unanswered';
    if (answer.markedForReview) return 'review';
    return 'answered';
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'answered':
        return <Check className="w-4 h-4" />;
      case 'review':
        return <AlertCircle className="w-4 h-4" />;
      case 'unanswered':
        return <Circle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  // Get status color
  const getStatusColor = (status: string, isCurrent: boolean) => {
    if (isCurrent) {
      return 'bg-blue-600 text-white border-blue-600';
    }

    switch (status) {
      case 'answered':
        return 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200';
      case 'review':
        return 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200';
      case 'unanswered':
        return 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50';
      default:
        return 'bg-white text-gray-700 border-gray-300';
    }
  };

  // Count questions by status
  const statusCounts = {
    answered: questions.filter((q) => getQuestionStatus(q) === 'answered').length,
    review: questions.filter((q) => getQuestionStatus(q) === 'review').length,
    unanswered: questions.filter((q) => getQuestionStatus(q) === 'unanswered').length,
  };

  return (
    <div className={className}>
      {/* Navigation Bar */}
      <div className="flex items-center justify-between gap-4 p-4 bg-white border-2 border-gray-200 rounded-lg shadow-sm">
        {/* Previous Button */}
        <button
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            canGoPrevious
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-gray-50 text-gray-400 cursor-not-allowed'
          }`}
          type="button"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* Current Question Indicator */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Question</p>
            <p className="text-2xl font-bold text-gray-900">
              {currentIndex + 1}
              <span className="text-lg text-gray-500"> / {questions.length}</span>
            </p>
          </div>

          {/* Grid Toggle */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            title="Show question grid"
            type="button"
          >
            <Grid3x3 className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Next Button */}
        <button
          onClick={onNext}
          disabled={!canGoNext}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            canGoNext
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-50 text-gray-400 cursor-not-allowed'
          }`}
          type="button"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Status Summary */}
      <div className="mt-3 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-100 border border-green-300" />
          <span className="text-gray-700">
            Answered: <strong>{statusCounts.answered}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-orange-100 border border-orange-300" />
          <span className="text-gray-700">
            Review: <strong>{statusCounts.review}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-white border border-gray-300" />
          <span className="text-gray-700">
            Unanswered: <strong>{statusCounts.unanswered}</strong>
          </span>
        </div>
      </div>

      {/* Question Grid Overlay */}
      {showGrid && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowGrid(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
              <h3 className="text-xl font-bold text-gray-900">Question Overview</h3>
              <p className="text-sm text-gray-600 mt-1">Click on a question to jump to it</p>
            </div>

            {/* Grid */}
            <div className="p-6 grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {questions.map((question, index) => {
                const status = getQuestionStatus(question);
                const isCurrent = index === currentIndex;

                return (
                  <button
                    key={question.id}
                    onClick={() => {
                      onNavigate(index);
                      setShowGrid(false);
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${getStatusColor(
                      status,
                      isCurrent
                    )}`}
                    type="button"
                  >
                    <span className="text-lg font-bold">{index + 1}</span>
                    <div className="mt-1">{getStatusIcon(status)}</div>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
              <p className="text-sm font-semibold text-gray-700 mb-2">Legend:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded border-2 bg-blue-600 border-blue-600" />
                  <span className="text-gray-700">Current</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded border-2 bg-green-100 border-green-300 flex items-center justify-center text-green-700">
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="text-gray-700">Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded border-2 bg-orange-100 border-orange-300 flex items-center justify-center text-orange-700">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <span className="text-gray-700">Review</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded border-2 bg-white border-gray-300 flex items-center justify-center text-gray-400">
                    <Circle className="w-4 h-4" />
                  </div>
                  <span className="text-gray-700">Unanswered</span>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowGrid(false)}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
