/**
 * QuizPlayer Component
 * Main quiz interface that orchestrates all quiz functionality
 * Handles quiz flow, timer, navigation, and submission
 */

import { useState, useEffect } from 'react';
import { AlertTriangle, Send, Save, X } from 'lucide-react';
import { useQuizStore, selectCurrentQuestion, selectCurrentQuestionIndex, selectAnswers } from '../../stores/quizStore';
import { Question } from './Question';
import { QuizTimer } from './QuizTimer';
import { QuizNavigation } from './QuizNavigation';
import { QuizResults } from './QuizResults';
import type { Quiz } from '../../types/quiz';

interface QuizPlayerProps {
  quiz: Quiz;
  onExit: () => void;
  className?: string;
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({ quiz, onExit, className = '' }) => {
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  const currentSession = useQuizStore((state) => state.currentSession);
  const currentQuestion = useQuizStore(selectCurrentQuestion);
  const currentIndex = useQuizStore(selectCurrentQuestionIndex);
  const answers = useQuizStore(selectAnswers);
  const isCompleted = useQuizStore((state) => state.currentSession?.isCompleted || false);
  const result = useQuizStore((state) => state.currentSession?.result);

  const answerQuestion = useQuizStore((state) => state.answerQuestion);
  const markForReview = useQuizStore((state) => state.markForReview);
  const unmarkForReview = useQuizStore((state) => state.unmarkForReview);
  const goToQuestion = useQuizStore((state) => state.goToQuestion);
  const nextQuestion = useQuizStore((state) => state.nextQuestion);
  const previousQuestion = useQuizStore((state) => state.previousQuestion);
  const submitQuiz = useQuizStore((state) => state.submitQuiz);
  const retryQuiz = useQuizStore((state) => state.retryQuiz);
  const saveProgress = useQuizStore((state) => state.saveProgress);

  // Auto-save on answer change
  useEffect(() => {
    if (currentSession && !isCompleted) {
      const timeoutId = setTimeout(() => {
        saveProgress();
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [answers, currentSession, isCompleted, saveProgress]);

  // Prevent accidental page close
  useEffect(() => {
    if (!isCompleted && currentSession) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = '';
        return '';
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [isCompleted, currentSession]);

  // Disable right-click (anti-cheating)
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      if (!isCompleted) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, [isCompleted]);

  // Disable copy/paste (anti-cheating)
  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => {
      if (!isCompleted) {
        e.preventDefault();
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      if (!isCompleted) {
        e.preventDefault();
      }
    };

    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
    };
  }, [isCompleted]);

  if (!currentSession || !currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  // Show results if completed
  if (isCompleted && result) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <QuizResults
          result={result}
          quiz={quiz}
          onRetry={() => retryQuiz(quiz.id)}
          onExit={onExit}
          showDetailedReview={true}
        />
      </div>
    );
  }

  const currentAnswer = answers[currentQuestion.id];
  const unansweredCount = quiz.questions.filter((q) => !answers[q.id]).length;
  const reviewCount = Object.values(answers).filter((a) => a.markedForReview).length;

  // Handle answer
  const handleAnswer = (answer: string | string[] | boolean) => {
    answerQuestion(currentQuestion.id, answer);
  };

  // Handle mark for review toggle
  const handleToggleReview = () => {
    if (currentAnswer?.markedForReview) {
      unmarkForReview(currentQuestion.id);
    } else {
      markForReview(currentQuestion.id);
    }
  };

  // Handle submit
  const handleSubmit = () => {
    if (unansweredCount > 0) {
      setShowSubmitModal(true);
    } else {
      submitQuiz();
    }
  };

  // Handle exit
  const handleExit = () => {
    setShowExitModal(true);
  };

  return (
    <div className={`max-w-5xl mx-auto px-4 py-6 ${className}`}>
      {/* Header */}
      <div className="mb-6 bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
            <p className="text-gray-600 mt-1">{quiz.description}</p>
          </div>
          <button
            onClick={handleExit}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Exit Quiz"
            type="button"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Timer */}
        <QuizTimer
          timeLimit={quiz.timeLimit}
          onTimeUp={() => submitQuiz()}
        />
      </div>

      {/* Question */}
      <Question
        question={currentQuestion}
        questionNumber={currentIndex + 1}
        totalQuestions={quiz.questions.length}
        selectedAnswer={currentAnswer?.answer}
        onAnswer={handleAnswer}
        markedForReview={currentAnswer?.markedForReview}
        onToggleReview={handleToggleReview}
        className="mb-6"
      />

      {/* Navigation */}
      <QuizNavigation
        questions={quiz.questions}
        currentIndex={currentIndex}
        answers={answers}
        onNavigate={goToQuestion}
        onPrevious={previousQuestion}
        onNext={nextQuestion}
        className="mb-6"
      />

      {/* Submit Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to submit?</h3>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>
                Answered: <strong>{quiz.questions.length - unansweredCount}</strong> /{' '}
                {quiz.questions.length}
              </span>
              {reviewCount > 0 && (
                <span className="text-orange-600">
                  Marked for review: <strong>{reviewCount}</strong>
                </span>
              )}
            </div>
            {unansweredCount > 0 && (
              <p className="text-sm text-orange-600 mt-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                You have {unansweredCount} unanswered question{unansweredCount > 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={saveProgress}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              type="button"
            >
              <Save className="w-5 h-5" />
              Save Progress
            </button>

            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors shadow-md"
              type="button"
            >
              <Send className="w-5 h-5" />
              Submit Quiz
            </button>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Unanswered Questions</h3>
                <p className="text-gray-600">
                  You have <strong>{unansweredCount}</strong> unanswered question
                  {unansweredCount > 1 ? 's' : ''}. Are you sure you want to submit?
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-end mt-6">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                type="button"
              >
                Go Back
              </button>
              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  submitQuiz();
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                type="button"
              >
                Submit Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Exit Quiz?</h3>
                <p className="text-gray-600">
                  Your progress will be saved. You can continue this quiz later from where you left off.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-end mt-6">
              <button
                onClick={() => setShowExitModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  saveProgress();
                  onExit();
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                type="button"
              >
                Exit Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
