/**
 * Quiz Page
 * Entry point for quiz system - displays available quizzes and launches quiz player
 * Shows quiz history, best scores, and filtering options
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Filter,
  Search,
  History,
} from 'lucide-react';
import { QuizPlayer } from '../components/quiz/QuizPlayer';
import { useQuizStore } from '../stores/quizStore';
import { mockQuizzes } from '../data/mockQuizzes';
import type { Quiz } from '../types/quiz';

const Quiz: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [showHistory, setShowHistory] = useState(false);

  const startQuiz = useQuizStore((state) => state.startQuiz);
  const exitQuiz = useQuizStore((state) => state.exitQuiz);
  const currentSession = useQuizStore((state) => state.currentSession);
  const quizHistory = useQuizStore((state) => state.quizHistory);
  const getBestScore = useQuizStore((state) => state.getBestScore);
  const getQuizHistory = useQuizStore((state) => state.getQuizHistory);

  // Check if there's a quiz ID in URL params
  useEffect(() => {
    const quizId = searchParams.get('id');
    if (quizId && !selectedQuiz) {
      const quiz = mockQuizzes.find((q) => q.id === quizId);
      if (quiz) {
        handleStartQuiz(quiz);
      }
    }
  }, [searchParams]);

  // Filter quizzes
  const filteredQuizzes = mockQuizzes.filter((quiz) => {
    const matchesSearch =
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDifficulty =
      difficultyFilter === 'all' || quiz.difficulty === difficultyFilter;

    return matchesSearch && matchesDifficulty;
  });

  // Handle start quiz
  const handleStartQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    startQuiz(quiz);
    setSearchParams({ id: quiz.id });
  };

  // Handle exit quiz
  const handleExitQuiz = () => {
    exitQuiz();
    setSelectedQuiz(null);
    setSearchParams({});
  };

  // Format time
  const formatTime = (seconds: number): string => {
    if (seconds === 0) return 'No time limit';
    const mins = Math.floor(seconds / 60);
    return `${mins} minute${mins !== 1 ? 's' : ''}`;
  };

  // Get difficulty badge color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // If quiz is active, show player
  if (selectedQuiz && currentSession) {
    return <QuizPlayer quiz={selectedQuiz} onExit={handleExitQuiz} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Quizzes</h1>
        <p className="text-lg text-gray-600">
          Test your knowledge and track your progress
        </p>
      </div>

      {/* Filters and Search */}
      <div className="mb-8 bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* History Toggle */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              showHistory
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <History className="w-5 h-5" />
            History
          </button>
        </div>
      </div>

      {/* Quiz History */}
      {showHistory && quizHistory.length > 0 && (
        <div className="mb-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Attempts</h2>
          <div className="space-y-3">
            {quizHistory.slice(-10).reverse().map((result, index) => {
              const quiz = mockQuizzes.find((q) => q.id === result.quizId);
              if (!quiz) return null;

              return (
                <div
                  key={`${result.quizId}-${index}`}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    {result.passed ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600" />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">{quiz.title}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(result.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{result.percentage}%</p>
                    <p className="text-sm text-gray-600">
                      {result.correctAnswers}/{result.totalQuestions} correct
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quiz Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuizzes.map((quiz) => {
          const bestScore = getBestScore(quiz.id);
          const attempts = getQuizHistory(quiz.id);
          const hasAttempts = attempts.length > 0;
          const lastAttempt = hasAttempts ? attempts[attempts.length - 1] : null;

          return (
            <div
              key={quiz.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden border-2 border-gray-200"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900">{quiz.title}</h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(
                      quiz.difficulty
                    )}`}
                  >
                    {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">{quiz.description}</p>
              </div>

              {/* Stats */}
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <BookOpen className="w-4 h-4" />
                    <span>{quiz.questions.length} questions</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(quiz.timeLimit)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Award className="w-4 h-4" />
                    <span>{quiz.passingScore}% to pass</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <TrendingUp className="w-4 h-4" />
                    <span>{attempts.length} attempt{attempts.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>

              {/* Best Score */}
              {hasAttempts && (
                <div className="px-6 py-3 bg-blue-50 border-b border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-900">Best Score:</span>
                    <span className="text-lg font-bold text-blue-600">{bestScore}%</span>
                  </div>
                  {lastAttempt && (
                    <p className="text-xs text-blue-700 mt-1">
                      Last attempt: {new Date(lastAttempt.completedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}

              {/* Action Button */}
              <div className="p-6">
                <button
                  onClick={() => handleStartQuiz(quiz)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-md"
                >
                  {hasAttempts ? (
                    <>
                      <RotateCcw className="w-5 h-5" />
                      Retake Quiz
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Start Quiz
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* No Results */}
      {filteredQuizzes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">No quizzes found matching your criteria.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setDifficultyFilter('all');
            }}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default Quiz;
