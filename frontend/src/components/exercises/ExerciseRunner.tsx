import { useState } from 'react';
import { Play, RotateCcw, Save, Clock, AlertCircle } from 'lucide-react';
import { TestResult, ProgrammingLanguage, TestCase } from '../../types/exercise';

interface ExerciseRunnerProps {
  code: string;
  language: ProgrammingLanguage;
  testCases: TestCase[];
  onRun: (code: string) => Promise<TestResult[]>;
  onReset: () => void;
  onSave?: () => void;
  isRunning?: boolean;
  timeSpent: number;
}

export default function ExerciseRunner({
  code,
  language,
  testCases,
  onRun,
  onReset,
  onSave,
  isRunning = false,
  timeSpent,
}: ExerciseRunnerProps) {
  const [lastRunTime, setLastRunTime] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    setError(null);
    setLastRunTime(new Date());

    try {
      await onRun(code);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while running the code');
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const visibleTestCount = testCases.filter((tc) => !tc.hidden).length;
  const totalTestCount = testCases.length;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Run Tests</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Time spent: {formatTime(timeSpent)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onSave && (
            <button
              onClick={onSave}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              title="Save progress"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
          )}

          <button
            onClick={onReset}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Reset to starter code"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>

          <button
            onClick={handleRun}
            disabled={isRunning || !code.trim()}
            className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors shadow-sm"
          >
            <Play className="w-4 h-4" />
            <span>{isRunning ? 'Running...' : 'Run Tests'}</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            {totalTestCount === visibleTestCount
              ? `${totalTestCount} test case${totalTestCount !== 1 ? 's' : ''}`
              : `${visibleTestCount} visible test case${visibleTestCount !== 1 ? 's' : ''} + ${
                  totalTestCount - visibleTestCount
                } hidden`}
          </span>
          {lastRunTime && (
            <span className="text-gray-500 dark:text-gray-500 text-xs">
              Last run: {lastRunTime.toLocaleTimeString()}
            </span>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-red-900 dark:text-red-300 mb-1">Execution Error</h4>
              <p className="text-sm text-red-700 dark:text-red-400 font-mono whitespace-pre-wrap">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Test Cases</h4>
            {testCases.filter((tc) => !tc.hidden).length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">All test cases are hidden</p>
            ) : (
              <div className="space-y-2">
                {testCases
                  .filter((tc) => !tc.hidden)
                  .map((testCase) => (
                    <div
                      key={testCase.id}
                      className="flex items-start gap-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded"
                    >
                      <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 mt-1.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{testCase.name}</p>
                        <div className="mt-1 text-xs text-gray-600 dark:text-gray-400 space-y-1">
                          <div>
                            <span className="font-medium">Input:</span>{' '}
                            <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                              {JSON.stringify(testCase.input)}
                            </code>
                          </div>
                          <div>
                            <span className="font-medium">Expected:</span>{' '}
                            <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                              {JSON.stringify(testCase.expectedOutput)}
                            </code>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>
            Click "Run Tests" to execute your code against the test cases. Your code will be run in a sandboxed
            environment.
          </p>
        </div>
      </div>
    </div>
  );
}
