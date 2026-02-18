/**
 * Question Component
 * Base wrapper for all question types with common features
 * Includes question display, points, difficulty, code snippets
 */

import { Code2, Star, AlertCircle } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Question } from '../../types/quiz';
import { MultipleChoice } from './MultipleChoice';
import { TrueFalse } from './TrueFalse';

interface QuestionProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer?: string | string[] | boolean;
  onAnswer: (answer: string | string[] | boolean) => void;
  disabled?: boolean;
  showCorrectAnswer?: boolean;
  markedForReview?: boolean;
  onToggleReview?: () => void;
  className?: string;
}

export const Question: React.FC<QuestionProps> = ({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswer,
  disabled = false,
  showCorrectAnswer = false,
  markedForReview = false,
  onToggleReview,
  className = '',
}) => {
  // Difficulty badge color
  const getDifficultyColor = () => {
    switch (question.difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Render question-specific component
  const renderQuestionComponent = () => {
    switch (question.type) {
      case 'true-false':
        return (
          <TrueFalse
            question={question}
            selectedAnswer={selectedAnswer as boolean}
            onAnswer={onAnswer as (answer: boolean) => void}
            disabled={disabled}
            showCorrectAnswer={showCorrectAnswer}
          />
        );

      case 'multiple-choice':
        return (
          <MultipleChoice
            question={question}
            selectedAnswers={selectedAnswer as string | string[]}
            onAnswer={onAnswer as (answer: string | string[]) => void}
            disabled={disabled}
            showCorrectAnswer={showCorrectAnswer}
          />
        );

      case 'code-snippet':
        return (
          <div className="space-y-4">
            {/* Code Display */}
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-300">
                  <Code2 className="w-4 h-4" />
                  <span className="text-sm font-mono">{question.language}</span>
                </div>
              </div>
              <SyntaxHighlighter
                language={question.language}
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  padding: '1rem',
                  fontSize: '0.875rem',
                }}
                showLineNumbers
              >
                {question.code}
              </SyntaxHighlighter>
            </div>

            {/* Options */}
            <MultipleChoice
              question={question}
              selectedAnswers={selectedAnswer as string | string[]}
              onAnswer={onAnswer as (answer: string | string[]) => void}
              disabled={disabled}
              showCorrectAnswer={showCorrectAnswer}
            />
          </div>
        );

      default:
        return <div className="text-red-500">Unknown question type</div>;
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-600">
              Question {questionNumber} of {totalQuestions}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor()}`}>
              {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
            </span>
            {question.category && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                {question.category}
              </span>
            )}
          </div>

          {/* Points */}
          <div className="flex items-center gap-1 text-yellow-600">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-semibold">{question.points} pts</span>
          </div>
        </div>

        {/* Question Text */}
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{question.question}</h3>

        {/* Mark for Review Button */}
        {onToggleReview && !showCorrectAnswer && (
          <button
            onClick={onToggleReview}
            className={`mt-3 flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              markedForReview
                ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            type="button"
          >
            <AlertCircle className="w-4 h-4" />
            {markedForReview ? 'Marked for Review' : 'Mark for Review'}
          </button>
        )}
      </div>

      {/* Question Component */}
      <div>{renderQuestionComponent()}</div>

      {/* Answer Status */}
      {!showCorrectAnswer && selectedAnswer !== undefined && selectedAnswer !== '' && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Answer saved!</strong> You can change your answer anytime before submitting.
          </p>
        </div>
      )}
    </div>
  );
};
