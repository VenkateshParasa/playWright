import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, ArrowLeft, BookOpen, Target, Clock, Award, RefreshCw, AlertCircle } from 'lucide-react';
import CodeEditor from '../components/exercises/CodeEditor';
import ExerciseRunner from '../components/exercises/ExerciseRunner';
import TestResults from '../components/exercises/TestResults';
import ConsoleOutput from '../components/exercises/ConsoleOutput';
import HintSystem from '../components/exercises/HintSystem';
import SolutionViewer from '../components/exercises/SolutionViewer';
import CodeDiff from '../components/exercises/CodeDiff';
import AttemptHistory from '../components/exercises/AttemptHistory';
import { useExerciseStore } from '../stores/exerciseStore';
import { getCodeExecutor } from '../lib/codeExecution/codeExecutor';
import { ConsoleLog, TestResult } from '../types/exercise';

export default function Exercises() {
  const { exerciseId } = useParams();
  const navigate = useNavigate();

  const {
    exercises,
    isLoading,
    error,
    currentExercise,
    currentCode,
    isRunning,
    testResults,
    consoleLogs,
    timeSpent,
    progress,
    loadExercises,
    loadExerciseById,
    setCurrentExercise,
    setCurrentCode,
    setIsRunning,
    setTestResults,
    addConsoleLog,
    clearConsoleLogs,
    incrementTimeSpent,
    resetTimeSpent,
    saveProgress,
    revealHint,
    revealSolution,
    addAttempt,
    loadAttempt,
    markAsCompleted,
    resetExercise,
  } = useExerciseStore();

  const [showExerciseList, setShowExerciseList] = useState(!exerciseId);
  const [selectedTab, setSelectedTab] = useState<'instructions' | 'hints' | 'solution'>('instructions');

  // Timer effect
  useEffect(() => {
    if (!currentExercise || isRunning) return;

    const interval = setInterval(() => {
      incrementTimeSpent();
    }, 1000);

    return () => clearInterval(interval);
  }, [currentExercise, isRunning, incrementTimeSpent]);

  // Load exercises on mount
  useEffect(() => {
    if (!exerciseId && exercises.length === 0) {
      loadExercises();
    }
  }, [exerciseId, exercises.length, loadExercises]);

  // Load exercise on mount or when exerciseId changes
  // Always load full exercise details via API — the exercises list only contains summaries
  // and is missing fields like instructions, testCases, learningObjectives, etc.
  useEffect(() => {
    if (exerciseId) {
      loadExerciseById(exerciseId).then((exercise) => {
        if (exercise) {
          setCurrentExercise(exercise);
          setShowExerciseList(false);
        } else {
          setShowExerciseList(true);
        }
      });
    } else {
      setShowExerciseList(true);
    }
  }, [exerciseId, setCurrentExercise, loadExerciseById]);

  // Auto-save progress periodically
  useEffect(() => {
    if (!currentExercise) return;

    const interval = setInterval(() => {
      saveProgress();
    }, 30000); // Save every 30 seconds

    return () => clearInterval(interval);
  }, [currentExercise, saveProgress]);

  const handleSelectExercise = (exerciseId: string) => {
    navigate(`/exercises/${exerciseId}`);
  };

  const handleRunTests = async (code: string): Promise<TestResult[]> => {
    if (!currentExercise) return [];

    setIsRunning(true);
    clearConsoleLogs();

    try {
      const executor = getCodeExecutor();

      // Extract function name from the user's code or starter code
      // Look for function declaration, prioritizing the user's code
      const functionNameMatch = code.match(/function\s+(\w+)\s*\(/);
      const functionName = functionNameMatch ? functionNameMatch[1] : 'solution';

      const result = await executor.executeWithTests(
        code,
        currentExercise.testCases,
        functionName,
        currentExercise.language
      );

      // Process console logs
      result.logs.forEach((log) => {
        const typeMatch = log.match(/^\[(\w+)\]/);
        const type = (typeMatch ? typeMatch[1].toLowerCase() : 'log') as ConsoleLog['type'];
        const message = log.replace(/^\[\w+\]\s*/, '');

        addConsoleLog({
          id: `log-${Date.now()}-${Math.random()}`,
          type,
          message,
          timestamp: new Date(),
        });
      });

      // Add backend message if provided (for Java or other backend-requiring languages)
      if (result.message) {
        addConsoleLog({
          id: `log-${Date.now()}-${Math.random()}`,
          type: 'info',
          message: result.message,
          timestamp: new Date(),
        });
      }

      if (result.testResults) {
        setTestResults(result.testResults);

        // Calculate score (only count tests that were actually executed)
        const executedTests = result.testResults.filter((r) => r.passed !== null);
        const passedTests = result.testResults.filter((r) => r.passed === true).length;
        const totalTests = (currentExercise.testCases || []).length;
        const score = executedTests.length > 0 ? Math.round((passedTests / executedTests.length) * 100) : 0;
        const allPassed = passedTests === totalTests && executedTests.length === totalTests;

        // Add attempt
        addAttempt({
          exerciseId: currentExercise.id,
          code,
          testResults: result.testResults,
          passed: allPassed,
          score,
          timeSpent,
        });

        // Mark as completed if all tests pass
        if (allPassed) {
          markAsCompleted();
        }

        return result.testResults;
      } else if (result.error) {
        addConsoleLog({
          id: `log-${Date.now()}-${Math.random()}`,
          type: 'error',
          message: result.error,
          timestamp: new Date(),
        });
      }

      return [];
    } catch (error) {
      addConsoleLog({
        id: `log-${Date.now()}-${Math.random()}`,
        type: 'error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date(),
      });
      return [];
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset to the starter code? Your current code will be lost.')) {
      resetExercise();
    }
  };

  const handleSave = () => {
    saveProgress();
    addConsoleLog({
      id: `log-${Date.now()}-${Math.random()}`,
      type: 'info',
      message: 'Progress saved successfully!',
      timestamp: new Date(),
    });
  };

  const handleRevealHint = (hintId: string) => {
    revealHint(hintId);
  };

  const handleRevealSolution = () => {
    revealSolution();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'intermediate':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
      case 'advanced':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const getProgressStats = (exerciseId: string) => {
    const prog = progress[exerciseId];
    if (!prog) return null;

    return {
      completed: prog.completed,
      bestScore: prog.bestScore,
      attempts: prog.attempts.length,
      hintsUsed: prog.hintsRevealed.length,
      solutionViewed: prog.solutionViewed,
    };
  };

  if (showExerciseList) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Coding Exercises</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Practice your coding skills with interactive exercises. Write code, run tests, and get instant feedback.
            </p>
            {exercises.length > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                {exercises.length} exercise{exercises.length !== 1 ? 's' : ''} available
              </p>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading exercises...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">Failed to Load Exercises</h3>
              <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
              <button
                onClick={() => loadExercises()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && exercises.length === 0 && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Exercises Available</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                There are currently no exercises available. Please check back later.
              </p>
              <button
                onClick={() => loadExercises()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          )}

          {/* Exercise List */}
          {!isLoading && !error && exercises.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exercises.map((exercise) => {
                const stats = getProgressStats(exercise.id);

                return (
                  <div
                    key={exercise.id}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleSelectExercise(exercise.id)}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                            {exercise.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {exercise.description}
                          </p>
                        </div>
                        {stats?.completed && (
                          <Award className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 ml-2" />
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${getDifficultyColor(
                            exercise.difficulty
                          )}`}
                        >
                          {exercise.difficulty}
                        </span>
                        <span className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                          {exercise.category}
                        </span>
                        <span className="text-xs text-gray-600 dark:text-gray-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                          {exercise.language}
                        </span>
                        <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {exercise.estimatedTime} min
                        </span>
                      </div>

                      {stats && (
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Best Score:</span>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.bestScore}%</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Attempts:</span>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.attempts}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                      <button className="w-full flex items-center justify-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                        <Play className="w-4 h-4" />
                        {stats ? 'Continue Exercise' : 'Start Exercise'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!currentExercise) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Exercise not found</p>
          <button
            onClick={() => navigate('/exercises')}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Back to exercises
          </button>
        </div>
      </div>
    );
  }

  const currentProgress = progress[currentExercise.id];
  const allTestsPassed = testResults.length > 0 && testResults.every((r) => r.passed);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-[1920px] mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/exercises')}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to exercises
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{currentExercise.title}</h1>
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`text-sm font-semibold px-3 py-1 rounded-full ${getDifficultyColor(
                    currentExercise.difficulty
                  )}`}
                >
                  {currentExercise.difficulty}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                  {currentExercise.category}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {currentExercise.estimatedTime} min
                </span>
                {currentProgress?.completed && (
                  <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    Completed
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Editor & Console */}
          <div className="space-y-6">
            <CodeEditor
              language={currentExercise.language}
              value={currentCode}
              onChange={setCurrentCode}
              height="500px"
              showLanguageSelector={false}
            />

            <ExerciseRunner
              code={currentCode}
              language={currentExercise.language}
              testCases={currentExercise.testCases}
              onRun={handleRunTests}
              onReset={handleReset}
              onSave={handleSave}
              isRunning={isRunning}
              timeSpent={timeSpent}
            />

            {testResults.length > 0 && (
              <TestResults results={testResults} totalTests={(currentExercise.testCases || []).length} />
            )}

            <ConsoleOutput logs={consoleLogs} onClear={clearConsoleLogs} />
          </div>

          {/* Right Column - Instructions, Hints, Solution */}
          <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setSelectedTab('instructions')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                    selectedTab === 'instructions'
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-900'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  Instructions
                </button>
                <button
                  onClick={() => setSelectedTab('hints')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                    selectedTab === 'hints'
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-900'
                  }`}
                >
                  <Target className="w-4 h-4" />
                  Hints
                  {currentProgress?.hintsRevealed && currentProgress.hintsRevealed.length > 0 && (
                    <span className="px-1.5 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full">
                      {currentProgress.hintsRevealed.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setSelectedTab('solution')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                    selectedTab === 'solution'
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-900'
                  }`}
                >
                  Solution
                </button>
              </div>

              <div className="p-6">
                {selectedTab === 'instructions' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Description</h3>
                      <p className="text-gray-700 dark:text-gray-300">{currentExercise.description}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Instructions</h3>
                      <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                        {(currentExercise.instructions || []).map((instruction, index) => (
                          <li key={index} className="ml-2">
                            {instruction}
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Learning Objectives
                      </h3>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                        {(currentExercise.learningObjectives || []).map((objective, index) => (
                          <li key={index} className="ml-2">
                            {objective}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {(currentExercise.tags || []).map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedTab === 'hints' && (
                  <HintSystem
                    hints={currentExercise.hints}
                    revealedHints={currentProgress?.hintsRevealed || []}
                    onRevealHint={handleRevealHint}
                    disabled={isRunning}
                  />
                )}

                {selectedTab === 'solution' && (
                  <SolutionViewer
                    solution={currentExercise.solution}
                    language={currentExercise.language}
                    isRevealed={currentProgress?.solutionViewed || false}
                    onReveal={handleRevealSolution}
                    hasPassedAllTests={allTestsPassed}
                  />
                )}
              </div>
            </div>

            {/* Code Diff */}
            {currentProgress?.solutionViewed && (
              <CodeDiff yourCode={currentCode} solutionCode={currentExercise.solution} language={currentExercise.language} />
            )}

            {/* Attempt History */}
            {currentProgress && currentProgress.attempts.length > 0 && (
              <AttemptHistory attempts={currentProgress.attempts} onLoadAttempt={loadAttempt} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
