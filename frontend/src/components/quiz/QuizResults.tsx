/**
 * QuizResults Component
 * Displays comprehensive quiz results with score, performance metrics, and detailed breakdown
 * Includes pass/fail status, retry option, and review functionality
 */

import { Trophy, CheckCircle2, XCircle, Clock, Star, TrendingUp, RefreshCw, Eye, Download } from 'lucide-react';
import { AnswerExplanation } from './AnswerExplanation';
import type { QuizResult, Quiz } from '../../types/quiz';

interface QuizResultsProps {
  result: QuizResult;
  quiz: Quiz;
  onRetry?: () => void;
  onExit?: () => void;
  showDetailedReview?: boolean;
  className?: string;
}

export const QuizResults: React.FC<QuizResultsProps> = ({
  result,
  quiz,
  onRetry,
  onExit,
  showDetailedReview = false,
  className = '',
}) => {
  const {
    score,
    maxScore,
    percentage,
    passed,
    completedAt,
    timeSpent,
    correctAnswers,
    totalQuestions,
    questionResults,
  } = result;

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  // Calculate performance level
  const getPerformanceLevel = () => {
    if (percentage >= 90) return { label: 'Excellent', color: 'text-green-600', emoji: '🌟' };
    if (percentage >= 75) return { label: 'Great', color: 'text-blue-600', emoji: '👍' };
    if (percentage >= 60) return { label: 'Good', color: 'text-yellow-600', emoji: '👌' };
    return { label: 'Needs Improvement', color: 'text-orange-600', emoji: '📚' };
  };

  const performance = getPerformanceLevel();

  // Calculate average time per question
  const avgTimePerQuestion = Math.round(timeSpent / totalQuestions);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Hero Section */}
      <div
        className={`relative overflow-hidden rounded-2xl shadow-xl ${
          passed ? 'bg-gradient-to-br from-green-500 to-green-700' : 'bg-gradient-to-br from-orange-500 to-red-600'
        }`}
      >
        <div className="absolute inset-0 bg-white opacity-10 pattern-dots" />
        <div className="relative px-8 py-12 text-white text-center">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            {passed ? (
              <div className="p-6 bg-white bg-opacity-20 rounded-full">
                <Trophy className="w-16 h-16" />
              </div>
            ) : (
              <div className="p-6 bg-white bg-opacity-20 rounded-full">
                <TrendingUp className="w-16 h-16" />
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold mb-2">
            {passed ? 'Congratulations!' : 'Keep Learning!'}
          </h1>
          <p className="text-xl opacity-90">
            You {passed ? 'passed' : 'completed'} the quiz
          </p>

          {/* Score Display */}
          <div className="mt-8 flex items-center justify-center gap-8">
            <div>
              <p className="text-6xl font-bold">{percentage}%</p>
              <p className="text-lg opacity-90 mt-1">
                {score} / {maxScore} points
              </p>
            </div>
            <div className="text-left">
              <p className="text-lg opacity-90">
                {correctAnswers} / {totalQuestions} correct
              </p>
              <p className="text-lg opacity-90">
                Time: {formatTime(timeSpent)}
              </p>
            </div>
          </div>

          {/* Performance Badge */}
          <div className="mt-6 inline-block px-6 py-2 bg-white bg-opacity-20 rounded-full">
            <span className="text-lg font-semibold">
              {performance.emoji} {performance.label}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Pass/Fail Status */}
        <div className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            {passed ? (
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600" />
            )}
            <h3 className="font-semibold text-gray-900">Status</h3>
          </div>
          <p className={`text-2xl font-bold ${passed ? 'text-green-600' : 'text-red-600'}`}>
            {passed ? 'Passed' : 'Failed'}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Required: {quiz.passingScore}%
          </p>
        </div>

        {/* Score */}
        <div className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Star className="w-6 h-6 text-yellow-600" />
            <h3 className="font-semibold text-gray-900">Score</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{score}</p>
          <p className="text-sm text-gray-600 mt-1">
            out of {maxScore} points
          </p>
        </div>

        {/* Time Spent */}
        <div className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-6 h-6 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Time</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatTime(timeSpent)}</p>
          <p className="text-sm text-gray-600 mt-1">
            Avg: {avgTimePerQuestion}s/question
          </p>
        </div>

        {/* Accuracy */}
        <div className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6 text-purple-600" />
            <h3 className="font-semibold text-gray-900">Accuracy</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {Math.round((correctAnswers / totalQuestions) * 100)}%
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {correctAnswers} of {totalQuestions}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-md"
            type="button"
          >
            <RefreshCw className="w-5 h-5" />
            Retry Quiz
          </button>
        )}

        {showDetailedReview && (
          <button
            onClick={() => {
              const reviewSection = document.getElementById('detailed-review');
              reviewSection?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors shadow-md"
            type="button"
          >
            <Eye className="w-5 h-5" />
            Review Answers
          </button>
        )}

        <button
          onClick={() => {
            // Simple download results as JSON
            const dataStr = JSON.stringify(result, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
            const exportFileDefaultName = `quiz-results-${quiz.id}-${new Date().toISOString()}.json`;
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
          }}
          className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors shadow-md"
          type="button"
        >
          <Download className="w-5 h-5" />
          Download Results
        </button>

        {onExit && (
          <button
            onClick={onExit}
            className="flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors"
            type="button"
          >
            Exit
          </button>
        )}
      </div>

      {/* Detailed Review Section */}
      {showDetailedReview && (
        <div id="detailed-review" className="space-y-4">
          <div className="flex items-center justify-between border-b-2 border-gray-200 pb-4">
            <h2 className="text-2xl font-bold text-gray-900">Detailed Review</h2>
            <p className="text-sm text-gray-600">
              Showing all {totalQuestions} questions
            </p>
          </div>

          {questionResults.map((questionResult, index) => (
            <AnswerExplanation key={questionResult.questionId} result={questionResult} />
          ))}
        </div>
      )}

      {/* Motivational Message */}
      {!passed && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center">
          <p className="text-lg text-blue-900 font-medium mb-2">
            Don't give up! Every attempt is a learning opportunity.
          </p>
          <p className="text-blue-700">
            Review the explanations above and try again when you're ready. You've got this! 💪
          </p>
        </div>
      )}

      {/* Completion Date */}
      <div className="text-center text-sm text-gray-500">
        Completed on {new Date(completedAt).toLocaleString()}
      </div>
    </div>
  );
};
