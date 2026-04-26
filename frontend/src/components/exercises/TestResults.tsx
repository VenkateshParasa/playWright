import { CheckCircle, XCircle, Clock, TrendingUp, Award } from 'lucide-react';
import { TestResult } from '../../types/exercise';

interface TestResultsProps {
  results: TestResult[];
  totalTests: number;
  showDetails?: boolean;
}

export default function TestResults({ results, totalTests, showDetails = true }: TestResultsProps) {
  const passedCount = results.filter((r) => r.passed === true).length;
  const failedCount = results.filter((r) => r.passed === false).length;
  const notExecutedCount = results.filter((r) => r.passed === null).length;
  const totalExecutionTime = results.reduce((sum, r) => sum + (r.executionTime || 0), 0);
  const averageExecutionTime = results.length > 0 ? totalExecutionTime / results.length : 0;
  const passRate = totalTests > 0 ? Math.round((passedCount / totalTests) * 100) : 0;

  const getStatusColor = () => {
    if (passedCount === totalTests) return 'text-green-600 dark:text-green-400';
    if (failedCount === totalTests) return 'text-red-600 dark:text-red-400';
    return 'text-yellow-600 dark:text-yellow-400';
  };

  const getStatusBg = () => {
    if (passedCount === totalTests) return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    if (failedCount === totalTests) return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
  };

  if (results.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">No test results yet. Run your code to see the results.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <div className={`border rounded-lg p-6 ${getStatusBg()}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Test Results</h3>
          {passedCount === totalTests && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <Award className="w-5 h-5" />
              <span className="font-semibold">All Tests Passed!</span>
            </div>
          )}
        </div>

        {notExecutedCount > 0 && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-400">
              <strong>{notExecutedCount}</strong> test{notExecutedCount !== 1 ? 's' : ''} could not be executed and require{notExecutedCount === 1 ? 's' : ''} backend support.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Pass Rate</span>
              <TrendingUp className={`w-4 h-4 ${getStatusColor()}`} />
            </div>
            <p className={`text-2xl font-bold ${getStatusColor()}`}>{passRate}%</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {passedCount} of {totalTests} tests
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Passed</span>
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{passedCount}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Successful tests</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Failed</span>
              <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{failedCount}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Failed tests</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Time</span>
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {averageExecutionTime.toFixed(2)}ms
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Execution time</p>
          </div>
        </div>
      </div>

      {/* Detailed Results */}
      {showDetails && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">Detailed Test Results</h4>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {results.map((result, index) => (
              <div key={result.testId} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {result.passed === true ? (
                      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    ) : result.passed === false ? (
                      <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-gray-400 dark:border-gray-500 flex items-center justify-center">
                        <span className="text-xs text-gray-600 dark:text-gray-400">?</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900 dark:text-gray-100">
                        Test {index + 1}: {result.testName}
                      </h5>
                      {result.executionTime !== undefined && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {result.executionTime.toFixed(2)}ms
                        </span>
                      )}
                    </div>

                    {result.passed === true ? (
                      <p className="text-sm text-green-700 dark:text-green-400 font-medium">✓ Test passed</p>
                    ) : result.passed === null ? (
                      <div className="space-y-2">
                        <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">○ Test not executed</p>
                        {result.message && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3">
                            <p className="text-xs text-blue-800 dark:text-blue-400">{result.message}</p>
                          </div>
                        )}
                        <div className="mt-2">
                          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Expected Output:</p>
                          <pre className="text-xs bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded p-2 font-mono overflow-x-auto">
                            {JSON.stringify(result.expected, null, 2)}
                          </pre>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {result.error && (
                          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
                            <p className="text-sm font-semibold text-red-900 dark:text-red-300 mb-1">Error:</p>
                            <pre className="text-xs text-red-800 dark:text-red-400 font-mono whitespace-pre-wrap overflow-x-auto">
                              {result.error}
                            </pre>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Expected:</p>
                            <pre className="text-xs bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded p-2 font-mono overflow-x-auto">
                              {JSON.stringify(result.expected, null, 2)}
                            </pre>
                          </div>

                          <div>
                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Actual:</p>
                            <pre className="text-xs bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded p-2 font-mono overflow-x-auto">
                              {JSON.stringify(result.actual, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
