import { useState } from 'react';
import { History, ChevronDown, ChevronUp, CheckCircle, XCircle, Clock, Code, TrendingUp } from 'lucide-react';
import { ExerciseAttempt } from '../../types/exercise';
import { formatDistanceToNow } from 'date-fns';

interface AttemptHistoryProps {
  attempts: ExerciseAttempt[];
  onLoadAttempt?: (attempt: ExerciseAttempt) => void;
}

export default function AttemptHistory({ attempts, onLoadAttempt }: AttemptHistoryProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState<string | null>(null);

  const sortedAttempts = [...attempts].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const stats = {
    totalAttempts: attempts.length,
    successfulAttempts: attempts.filter((a) => a.passed).length,
    bestScore: Math.max(...attempts.map((a) => a.score), 0),
    totalTimeSpent: attempts.reduce((sum, a) => sum + a.timeSpent, 0),
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getScoreColor = (score: number) => {
    if (score === 100) return 'text-green-600 dark:text-green-400';
    if (score >= 75) return 'text-blue-600 dark:text-blue-400';
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score === 100) return 'bg-green-100 dark:bg-green-900/30';
    if (score >= 75) return 'bg-blue-100 dark:bg-blue-900/30';
    if (score >= 50) return 'bg-yellow-100 dark:bg-yellow-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  if (attempts.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-3">
          <History className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Attempt History</h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
          No attempts yet. Run your code to create your first attempt!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-colors"
      >
        <div className="flex items-center gap-3">
          <History className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Attempt History</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {stats.totalAttempts} attempt{stats.totalAttempts !== 1 ? 's' : ''} • Best score: {stats.bestScore}%
            </p>
          </div>
        </div>

        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        )}
      </button>

      {/* Content */}
      {expanded && (
        <div className="p-4 space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <History className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Total Attempts</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalAttempts}</p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-xs font-medium text-green-700 dark:text-green-400">Successful</span>
              </div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.successfulAttempts}</p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium text-blue-700 dark:text-blue-400">Best Score</span>
              </div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.bestScore}%</p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-medium text-purple-700 dark:text-purple-400">Total Time</span>
              </div>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {formatTime(stats.totalTimeSpent)}
              </p>
            </div>
          </div>

          {/* Attempts List */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">All Attempts</h4>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {sortedAttempts.map((attempt, index) => (
                <div
                  key={attempt.id}
                  className={`border rounded-lg overflow-hidden transition-all ${
                    selectedAttempt === attempt.id
                      ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-800'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <button
                    onClick={() => setSelectedAttempt(selectedAttempt === attempt.id ? null : attempt.id)}
                    className="w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-left"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="flex-shrink-0 mt-1">
                          {attempt.passed ? (
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              Attempt #{sortedAttempts.length - index}
                            </span>
                            <span
                              className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getScoreBg(
                                attempt.score
                              )} ${getScoreColor(attempt.score)}`}
                            >
                              {attempt.score}%
                            </span>
                            {attempt.score === stats.bestScore && attempt.score > 0 && (
                              <span className="px-2 py-0.5 text-xs font-semibold text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                                Best
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDistanceToNow(new Date(attempt.timestamp), { addSuffix: true })}
                            </span>
                            <span>
                              {attempt.testResults.filter((r) => r.passed).length}/{attempt.testResults.length} tests
                              passed
                            </span>
                            <span>Time: {formatTime(attempt.timeSpent)}</span>
                          </div>
                        </div>
                      </div>

                      {onLoadAttempt && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onLoadAttempt(attempt);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded transition-colors"
                        >
                          <Code className="w-3.5 h-3.5" />
                          Load
                        </button>
                      )}
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {selectedAttempt === attempt.id && (
                    <div className="px-4 pb-4 space-y-3 bg-gray-50 dark:bg-gray-900">
                      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                        <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Test Results</h5>
                        <div className="space-y-1">
                          {attempt.testResults.map((result, idx) => (
                            <div
                              key={result.testId}
                              className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded text-xs"
                            >
                              <div className="flex items-center gap-2">
                                {result.passed ? (
                                  <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                                ) : (
                                  <XCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                                )}
                                <span className="text-gray-700 dark:text-gray-300">{result.testName}</span>
                              </div>
                              {result.executionTime !== undefined && (
                                <span className="text-gray-500 dark:text-gray-400">
                                  {result.executionTime.toFixed(2)}ms
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
