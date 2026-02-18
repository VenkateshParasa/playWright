import React from 'react';
import ReactMarkdown from 'react-markdown';
import { X } from 'lucide-react';
import type {
  LessonContent,
  QuizContent,
  ExerciseContent,
  FlashcardDeck,
} from '../../stores/adminContentStore';
import FlashCard from '../flashcards/FlashCard';

interface ContentPreviewProps {
  content: LessonContent | QuizContent | ExerciseContent | FlashcardDeck;
  type: 'lesson' | 'quiz' | 'exercise' | 'flashcard';
  onClose: () => void;
}

const ContentPreview: React.FC<ContentPreviewProps> = ({ content, type, onClose }) => {
  const renderLessonPreview = (lesson: LessonContent) => (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {lesson.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-3">{lesson.description}</p>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
            {lesson.difficulty}
          </span>
          <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
            {lesson.duration} min
          </span>
          <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
            {lesson.category}
          </span>
        </div>
      </div>

      {/* Learning Objectives */}
      {lesson.learningObjectives.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Learning Objectives
          </h2>
          <ul className="list-disc list-inside space-y-1">
            {lesson.learningObjectives.map((objective, index) => (
              <li key={index} className="text-gray-700 dark:text-gray-300">
                {objective}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Content */}
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <ReactMarkdown>{lesson.content}</ReactMarkdown>
      </div>
    </div>
  );

  const renderQuizPreview = (quiz: QuizContent) => (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {quiz.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-3">{quiz.description}</p>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
            {quiz.timeLimit} min
          </span>
          <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
            {quiz.questions.length} questions
          </span>
          <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
            {quiz.passingScore}% to pass
          </span>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {quiz.questions.map((question, index) => (
          <div
            key={question.id}
            className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div className="flex items-start gap-2 mb-3">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                {index + 1}
              </span>
              <div className="flex-1">
                <p className="text-gray-900 dark:text-white font-medium">
                  {question.question}
                </p>
                {question.image && (
                  <img
                    src={question.image}
                    alt="Question"
                    className="mt-2 rounded max-w-md"
                  />
                )}
              </div>
            </div>

            {question.type === 'multiple-choice' && question.options && (
              <div className="space-y-2 ml-10">
                {question.options.map((option, optIndex) => {
                  const isCorrect = Array.isArray(question.correctAnswer)
                    ? question.correctAnswer.includes(option)
                    : question.correctAnswer === option;

                  return (
                    <div
                      key={optIndex}
                      className={`p-2 rounded ${
                        isCorrect
                          ? 'bg-green-100 dark:bg-green-900 border border-green-500'
                          : 'bg-white dark:bg-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 border-2 border-gray-300 dark:border-gray-500 rounded-full flex items-center justify-center text-sm">
                          {String.fromCharCode(65 + optIndex)}
                        </span>
                        <span className="text-gray-900 dark:text-white">{option}</span>
                        {isCorrect && (
                          <span className="ml-auto text-green-600 dark:text-green-400 text-sm font-semibold">
                            Correct
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {question.type === 'true-false' && (
              <div className="space-y-2 ml-10">
                {['True', 'False'].map((option) => {
                  const isCorrect = question.correctAnswer === option;
                  return (
                    <div
                      key={option}
                      className={`p-2 rounded ${
                        isCorrect
                          ? 'bg-green-100 dark:bg-green-900 border border-green-500'
                          : 'bg-white dark:bg-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-gray-900 dark:text-white">{option}</span>
                        {isCorrect && (
                          <span className="ml-auto text-green-600 dark:text-green-400 text-sm font-semibold">
                            Correct
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {question.explanation && (
              <div className="mt-3 ml-10 p-3 bg-blue-50 dark:bg-blue-900/30 rounded">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Explanation:</strong> {question.explanation}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderExercisePreview = (exercise: ExerciseContent) => (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {exercise.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-3">{exercise.description}</p>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
            {exercise.language}
          </span>
          <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
            {exercise.difficulty}
          </span>
          <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
            ~{exercise.timeEstimate} min
          </span>
        </div>
      </div>

      {/* Starter Code */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Starter Code
        </h2>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
          <code>{exercise.starterCode}</code>
        </pre>
      </div>

      {/* Test Cases */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Test Cases
        </h2>
        <div className="space-y-2">
          {exercise.testCases
            .filter((tc) => !tc.isHidden)
            .map((testCase, index) => (
              <div
                key={testCase.id}
                className="p-3 bg-gray-50 dark:bg-gray-700 rounded"
              >
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Test Case {index + 1}
                  {testCase.description && `: ${testCase.description}`}
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Input:</span>
                    <code className="block mt-1 bg-white dark:bg-gray-800 p-2 rounded">
                      {testCase.input}
                    </code>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Expected Output:
                    </span>
                    <code className="block mt-1 bg-white dark:bg-gray-800 p-2 rounded">
                      {testCase.expectedOutput}
                    </code>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Hints */}
      {exercise.hints.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Hints
          </h2>
          <div className="space-y-2">
            {exercise.hints.map((hint, index) => (
              <div key={index} className="p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Hint {index + 1}:</strong> {hint}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderFlashcardPreview = (deck: FlashcardDeck) => (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {deck.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-3">{deck.description}</p>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
            {deck.cards.length} cards
          </span>
          <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
            {deck.difficulty}
          </span>
          <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
            {deck.category}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
          Preview Cards
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {deck.cards.slice(0, 6).map((card) => (
            <div key={card.id} className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
              <div className="mb-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Front:</p>
                <p className="text-sm text-gray-900 dark:text-white">{card.front}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Back:</p>
                <p className="text-sm text-gray-900 dark:text-white">{card.back}</p>
              </div>
            </div>
          ))}
        </div>
        {deck.cards.length > 6 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 text-center">
            + {deck.cards.length - 6} more cards
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Content Preview
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {type === 'lesson' && renderLessonPreview(content as LessonContent)}
          {type === 'quiz' && renderQuizPreview(content as QuizContent)}
          {type === 'exercise' && renderExercisePreview(content as ExerciseContent)}
          {type === 'flashcard' && renderFlashcardPreview(content as FlashcardDeck)}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContentPreview;
