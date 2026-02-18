/**
 * MultipleChoice Component
 * Handles both single and multiple answer selection
 * Shows visual feedback and correct answers after submission
 */

import { Check, X, Circle, CheckCircle2 } from 'lucide-react';
import type { MultipleChoiceQuestion, CodeSnippetQuestion } from '../../types/quiz';

interface MultipleChoiceProps {
  question: MultipleChoiceQuestion | CodeSnippetQuestion;
  selectedAnswers?: string | string[];
  onAnswer: (answer: string | string[]) => void;
  disabled?: boolean;
  showCorrectAnswer?: boolean;
  className?: string;
}

export const MultipleChoice: React.FC<MultipleChoiceProps> = ({
  question,
  selectedAnswers,
  onAnswer,
  disabled = false,
  showCorrectAnswer = false,
  className = '',
}) => {
  const { options, allowMultiple } = question;

  // Normalize selected answers to array
  const selectedArray = Array.isArray(selectedAnswers)
    ? selectedAnswers
    : selectedAnswers
    ? [selectedAnswers]
    : [];

  // Get correct answer IDs
  const correctAnswerIds = options.filter((opt) => opt.isCorrect).map((opt) => opt.id);

  // Check if user's answer is correct
  const isUserAnswerCorrect =
    selectedArray.length > 0 &&
    selectedArray.length === correctAnswerIds.length &&
    selectedArray.every((id) => correctAnswerIds.includes(id));

  // Handle option selection
  const handleOptionClick = (optionId: string) => {
    if (disabled || showCorrectAnswer) return;

    if (allowMultiple) {
      // Multiple selection mode
      const newSelection = selectedArray.includes(optionId)
        ? selectedArray.filter((id) => id !== optionId)
        : [...selectedArray, optionId];
      onAnswer(newSelection);
    } else {
      // Single selection mode
      onAnswer(optionId);
    }
  };

  // Determine option styling
  const getOptionClass = (optionId: string, isCorrectOption: boolean): string => {
    const baseClass =
      'flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 text-left';

    // Show correct answer mode (after submission)
    if (showCorrectAnswer) {
      if (isCorrectOption) {
        return `${baseClass} bg-green-50 border-green-500 text-green-900`;
      }
      if (selectedArray.includes(optionId) && !isCorrectOption) {
        return `${baseClass} bg-red-50 border-red-500 text-red-900`;
      }
      return `${baseClass} bg-gray-50 border-gray-200 text-gray-600 opacity-70`;
    }

    // Normal selection mode
    if (disabled) {
      return `${baseClass} bg-gray-50 border-gray-200 cursor-not-allowed opacity-50`;
    }

    if (selectedArray.includes(optionId)) {
      return `${baseClass} bg-blue-50 border-blue-500 text-blue-900 shadow-md`;
    }

    return `${baseClass} bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50`;
  };

  // Render selection indicator
  const renderIndicator = (optionId: string, isCorrectOption: boolean) => {
    if (showCorrectAnswer) {
      if (isCorrectOption) {
        return <Check className="w-6 h-6 text-green-600 flex-shrink-0" />;
      }
      if (selectedArray.includes(optionId)) {
        return <X className="w-6 h-6 text-red-600 flex-shrink-0" />;
      }
      return <Circle className="w-6 h-6 text-gray-300 flex-shrink-0" />;
    }

    if (allowMultiple) {
      return selectedArray.includes(optionId) ? (
        <CheckCircle2 className="w-6 h-6 text-blue-600 flex-shrink-0" />
      ) : (
        <Circle className="w-6 h-6 text-gray-400 flex-shrink-0" />
      );
    } else {
      return (
        <div
          className={`w-6 h-6 rounded-full border-2 flex-shrink-0 ${
            selectedArray.includes(optionId)
              ? 'border-blue-600 bg-blue-600'
              : 'border-gray-400 bg-white'
          }`}
        >
          {selectedArray.includes(optionId) && (
            <div className="w-full h-full rounded-full bg-white scale-50" />
          )}
        </div>
      );
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Selection hint */}
      {allowMultiple && !showCorrectAnswer && (
        <div className="text-sm text-gray-600 italic mb-4">
          Select all that apply
        </div>
      )}

      {/* Options */}
      {options.map((option) => {
        const isCorrectOption = option.isCorrect;
        const isSelected = selectedArray.includes(option.id);

        return (
          <button
            key={option.id}
            onClick={() => handleOptionClick(option.id)}
            className={`w-full ${getOptionClass(option.id, isCorrectOption)}`}
            disabled={disabled && !showCorrectAnswer}
            type="button"
          >
            {renderIndicator(option.id, isCorrectOption)}
            <div className="flex-1">
              <span className="text-base">{option.text}</span>
              {showCorrectAnswer && isCorrectOption && (
                <span className="ml-2 text-sm font-semibold">(Correct)</span>
              )}
            </div>
          </button>
        );
      })}

      {/* Feedback after submission */}
      {showCorrectAnswer && (
        <div
          className={`mt-4 p-4 rounded-lg ${
            isUserAnswerCorrect
              ? 'bg-green-50 border-2 border-green-200 text-green-800'
              : 'bg-red-50 border-2 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2 font-semibold mb-2">
            {isUserAnswerCorrect ? (
              <>
                <Check className="w-5 h-5" />
                <span>Correct!</span>
              </>
            ) : (
              <>
                <X className="w-5 h-5" />
                <span>Incorrect</span>
              </>
            )}
          </div>

          {/* Show selected vs correct */}
          <div className="text-sm space-y-1">
            <p>
              <strong>Your answer:</strong>{' '}
              {selectedArray.length > 0
                ? options
                    .filter((opt) => selectedArray.includes(opt.id))
                    .map((opt) => opt.text)
                    .join(', ')
                : 'No answer selected'}
            </p>
            {!isUserAnswerCorrect && (
              <p>
                <strong>Correct answer:</strong>{' '}
                {options
                  .filter((opt) => opt.isCorrect)
                  .map((opt) => opt.text)
                  .join(', ')}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
