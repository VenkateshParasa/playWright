/**
 * TrueFalse Component
 * Displays true/false questions with visual feedback
 */

import { Check, X } from 'lucide-react';
import type { TrueFalseQuestion } from '../../types/quiz';

interface TrueFalseProps {
  question: TrueFalseQuestion;
  selectedAnswer?: boolean;
  onAnswer: (answer: boolean) => void;
  disabled?: boolean;
  showCorrectAnswer?: boolean;
  className?: string;
}

export const TrueFalse: React.FC<TrueFalseProps> = ({
  question,
  selectedAnswer,
  onAnswer,
  disabled = false,
  showCorrectAnswer = false,
  className = '',
}) => {
  const isCorrect = selectedAnswer === question.correctAnswer;

  const getOptionClass = (value: boolean): string => {
    const baseClass =
      'flex items-center justify-center gap-3 p-6 rounded-lg border-2 cursor-pointer transition-all duration-200';

    // Show correct answer mode (after submission)
    if (showCorrectAnswer) {
      if (value === question.correctAnswer) {
        return `${baseClass} bg-green-50 border-green-500 text-green-900`;
      }
      if (selectedAnswer === value && !isCorrect) {
        return `${baseClass} bg-red-50 border-red-500 text-red-900`;
      }
      return `${baseClass} bg-gray-50 border-gray-200 text-gray-400 opacity-50`;
    }

    // Normal selection mode
    if (disabled) {
      return `${baseClass} bg-gray-50 border-gray-200 cursor-not-allowed opacity-50`;
    }

    if (selectedAnswer === value) {
      return `${baseClass} bg-blue-50 border-blue-500 text-blue-900 shadow-md`;
    }

    return `${baseClass} bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50`;
  };

  const handleOptionClick = (value: boolean) => {
    if (!disabled && !showCorrectAnswer) {
      onAnswer(value);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* True Option */}
      <button
        onClick={() => handleOptionClick(true)}
        className={`w-full ${getOptionClass(true)}`}
        disabled={disabled && !showCorrectAnswer}
        type="button"
      >
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600">
          <Check className="w-8 h-8" strokeWidth={3} />
        </div>
        <span className="text-xl font-semibold">True</span>
        {showCorrectAnswer && question.correctAnswer === true && (
          <span className="ml-auto text-sm font-medium">(Correct Answer)</span>
        )}
      </button>

      {/* False Option */}
      <button
        onClick={() => handleOptionClick(false)}
        className={`w-full ${getOptionClass(false)}`}
        disabled={disabled && !showCorrectAnswer}
        type="button"
      >
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600">
          <X className="w-8 h-8" strokeWidth={3} />
        </div>
        <span className="text-xl font-semibold">False</span>
        {showCorrectAnswer && question.correctAnswer === false && (
          <span className="ml-auto text-sm font-medium">(Correct Answer)</span>
        )}
      </button>

      {/* Feedback after submission */}
      {showCorrectAnswer && (
        <div
          className={`p-4 rounded-lg ${
            isCorrect
              ? 'bg-green-50 border-2 border-green-200 text-green-800'
              : 'bg-red-50 border-2 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2 font-semibold mb-1">
            {isCorrect ? (
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
          <p className="text-sm">
            Your answer: <strong>{selectedAnswer ? 'True' : 'False'}</strong>
          </p>
          {!isCorrect && (
            <p className="text-sm">
              Correct answer: <strong>{question.correctAnswer ? 'True' : 'False'}</strong>
            </p>
          )}
        </div>
      )}
    </div>
  );
};
