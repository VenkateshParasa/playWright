import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, ArrowLeft, BookOpen, Target, Clock, Award } from 'lucide-react';
import CodeEditor from '../components/exercises/CodeEditor';
import ExerciseRunner from '../components/exercises/ExerciseRunner';
import TestResults from '../components/exercises/TestResults';
import ConsoleOutput from '../components/exercises/ConsoleOutput';
import HintSystem from '../components/exercises/HintSystem';
import SolutionViewer from '../components/exercises/SolutionViewer';
import CodeDiff from '../components/exercises/CodeDiff';
import AttemptHistory from '../components/exercises/AttemptHistory';
import { useExerciseStore } from '../stores/exerciseStore';
import { mockExercises } from '../data/exercises';
import { getCodeExecutor } from '../lib/codeExecution/codeExecutor';
import { ConsoleLog, TestResult } from '../types/exercise';

export default function Exercises() {
  const { exerciseId } = useParams();
  const navigate = useNavigate();

  const {
    currentExercise,
    currentCode,
    isRunning,
    testResults,
    consoleLogs,
    timeSpent,
    progress,
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

  // Load exercise on mount or when exerciseId changes
  useEffect(() => {
    if (exerciseId) {
      const exercise = mockExercises.find((ex) => ex.id === exerciseId);
      if (exercise) {
        setCurrentExercise(exercise);
        setShowExerciseList(false);
      } else {
        setShowExerciseList(true);
      }
    } else {
      setShowExerciseList(true);
    }
  }, [exerciseId, setCurrentExercise]);

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

      // Extract function name from the exercise
      const functionNameMatch = currentExercise.starterCode.match(/function\s+(\w+)/);
      const functionName = functionNameMatch ? functionNameMatch[1] : 'solution';

      const result = await executor.executeWithTests(code, currentExercise.testCases, functionName);

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

      if (result.testResults) {
        setTestResults(result.testResults);

        // Calculate score
        const passedTests = result.testResults.filter((r) => r.passed).length;
        const totalTests = currentExercise.testCases.length;
        const score = Math.round((passedTests / totalTests) * 100);
        const allPassed = passedTests === totalTests;

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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockExercises.map((exercise) => {
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
              <TestResults results={testResults} totalTests={currentExercise.testCases.length} />
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
                        {currentExercise.instructions.map((instruction, index) => (
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
                        {currentExercise.learningObjectives.map((objective, index) => (
                          <li key={index} className="ml-2">
                            {objective}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {currentExercise.tags.map((tag) => (
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
