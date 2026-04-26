/**
 * Exercise Usage Example - Live Route
 * Demonstrates exercise store usage with real data.
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExerciseStore } from '../../stores/exerciseStore';

export default function ExercisesExample() {
  const navigate = useNavigate();
  const {
    exercises,
    currentExercise,
    currentCode,
    testResults,
    isRunning,
    isLoading,
    error,
    progress,
    loadExercises,
    loadExerciseById,
    setCurrentExercise,
    setCurrentCode,
    saveProgress,
    revealHint,
    revealSolution,
    getExerciseProgress,
    resetExercise,
  } = useExerciseStore();

  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  const handleSelectExercise = async (id: string) => {
    const ex = await loadExerciseById(id);
    if (ex) setCurrentExercise(ex);
  };

  const exerciseProgress = currentExercise ? getExerciseProgress(currentExercise.id) : null;
  const revealedHints = exerciseProgress?.hintsRevealed || [];
  const solutionViewed = exerciseProgress?.solutionViewed || false;

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/examples')} className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
          ← Examples
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exercise Usage</h1>
          <p className="text-sm text-gray-500 mt-0.5">Exercise store patterns with real data</p>
        </div>
      </div>

      {/* Exercise List */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          All Exercises ({exercises.length} loaded)
        </h2>
        {isLoading && <p className="text-gray-500">Loading...</p>}
        {error && <p className="text-red-600">Error: {error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {exercises.map((exercise) => {
            const prog = getExerciseProgress(exercise.id);
            return (
              <button
                key={exercise.id}
                onClick={() => handleSelectExercise(exercise.id)}
                className={`text-left p-4 rounded-lg border-2 transition-all ${
                  currentExercise?.id === exercise.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 bg-white hover:border-indigo-300'
                }`}
              >
                <div className="font-medium text-gray-900 text-sm">{exercise.title}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500 capitalize">{exercise.difficulty}</span>
                  {prog?.completed && (
                    <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Completed</span>
                  )}
                  {prog && !prog.completed && prog.attempts.length > 0 && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
                      {prog.attempts.length} attempt{prog.attempts.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Selected Exercise Detail */}
      {currentExercise && (
        <>
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Exercise Detail</h2>
            <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-2">
              <h3 className="text-xl font-bold text-gray-900">{currentExercise.title}</h3>
              <p className="text-gray-600">{currentExercise.description}</p>
              <div className="flex gap-4 text-sm text-gray-500">
                <span>Difficulty: <strong className="capitalize">{currentExercise.difficulty}</strong></span>
                <span>Est. time: <strong>{currentExercise.estimatedTime} min</strong></span>
              </div>
            </div>
          </section>

          {/* Code Editor */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Code Editor (with auto-save)</h2>
            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
              <textarea
                value={currentCode}
                onChange={(e) => {
                  setCurrentCode(e.target.value);
                  saveProgress();
                }}
                rows={10}
                disabled={isRunning}
                className="w-full font-mono text-sm border border-gray-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
                placeholder="Write your code here..."
              />
              <div className="flex gap-2">
                <button
                  onClick={resetExercise}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={saveProgress}
                  className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                >
                  Save Progress
                </button>
              </div>
              {testResults.length > 0 && (
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-gray-700">Test Results</h4>
                  {testResults.map((result) => (
                    <div key={result.testId} className={`text-sm px-3 py-1.5 rounded ${result.passed ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {result.passed ? '✓' : '✗'} {result.testName}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Hints */}
          {currentExercise.hints && currentExercise.hints.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Hints &amp; Solution</h2>
              <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                {currentExercise.hints.map((hint: any) => {
                  const isRevealed = revealedHints.includes(hint.id);
                  return (
                    <div key={hint.id}>
                      {isRevealed ? (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-gray-700">
                          <span className="font-medium text-yellow-800">Hint {hint.level}: </span>
                          {hint.content}
                        </div>
                      ) : (
                        <button
                          onClick={() => revealHint(hint.id)}
                          className="px-4 py-2 text-sm bg-yellow-50 text-yellow-700 border border-yellow-200 rounded hover:bg-yellow-100 transition-colors"
                        >
                          Reveal Hint {hint.level}
                        </button>
                      )}
                    </div>
                  );
                })}
                {solutionViewed ? (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Solution</h4>
                    <pre className="bg-gray-50 border border-gray-200 rounded p-3 text-xs overflow-x-auto">{currentExercise.solution}</pre>
                  </div>
                ) : (
                  <button
                    onClick={revealSolution}
                    className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  >
                    Reveal Solution
                  </button>
                )}
              </div>
            </section>
          )}

          {/* Progress */}
          {exerciseProgress && (
            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Your Progress</h2>
              <div className="bg-white border border-gray-200 rounded-lg p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">{exerciseProgress.bestScore}%</div>
                  <div className="text-xs text-gray-500 mt-1">Best Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">{exerciseProgress.attempts.length}</div>
                  <div className="text-xs text-gray-500 mt-1">Attempts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">{Math.floor(exerciseProgress.totalTimeSpent / 60)}</div>
                  <div className="text-xs text-gray-500 mt-1">Minutes Spent</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${exerciseProgress.completed ? 'text-green-600' : 'text-gray-400'}`}>
                    {exerciseProgress.completed ? 'Yes' : 'No'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Completed</div>
                </div>
              </div>
              {exerciseProgress.attempts.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h3 className="text-sm font-medium text-gray-700">Attempt History</h3>
                  {exerciseProgress.attempts.map((attempt: any) => (
                    <div key={attempt.id} className="flex items-center gap-4 text-sm bg-gray-50 border border-gray-200 rounded px-3 py-2">
                      <span className={attempt.passed ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                        {attempt.passed ? 'Passed' : 'Failed'}
                      </span>
                      <span className="text-gray-600">{attempt.score}%</span>
                      <span className="text-gray-400">{new Date(attempt.timestamp).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </>
      )}

      {!currentExercise && !isLoading && exercises.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          Select an exercise above to see its details, code editor, hints, and progress.
        </div>
      )}
    </div>
  );
}
