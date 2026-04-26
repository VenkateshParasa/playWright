/**
 * Example usage of the Exercise API and Store
 * This file demonstrates how to use the new exercise API and store in your components
 */

import { useEffect } from 'react';
import { useExerciseStore } from '@/stores';

/**
 * Example 1: Load all exercises
 */
export function ExerciseListExample() {
  const { exercises, isLoading, error, loadExercises } = useExerciseStore();

  useEffect(() => {
    // Load all exercises on component mount
    loadExercises();
  }, []);

  if (isLoading) {
    return <div>Loading exercises...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h2>All Exercises</h2>
      <ul>
        {exercises.map((exercise) => (
          <li key={exercise.id}>
            {exercise.title} - {exercise.difficulty}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Example 2: Load exercises with filters
 */
export function FilteredExercisesExample() {
  const { exercises, isLoading, loadExercises } = useExerciseStore();

  useEffect(() => {
    // Load beginner exercises only
    loadExercises({
      difficulty: 'beginner',
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  }, []);

  return (
    <div>
      <h2>Beginner Exercises</h2>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {exercises.map((exercise) => (
            <li key={exercise.id}>{exercise.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Example 3: Load a specific exercise by ID
 */
export function ExerciseDetailExample({ exerciseId }: { exerciseId: string }) {
  const { currentExercise, isLoading, error, loadExerciseById, setCurrentExercise } = useExerciseStore();

  useEffect(() => {
    const loadExercise = async () => {
      const exercise = await loadExerciseById(exerciseId);
      if (exercise) {
        setCurrentExercise(exercise);
      }
    };
    loadExercise();
  }, [exerciseId]);

  if (isLoading) {
    return <div>Loading exercise...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!currentExercise) {
    return <div>Exercise not found</div>;
  }

  return (
    <div>
      <h2>{currentExercise.title}</h2>
      <p>{currentExercise.description}</p>
      <p>Difficulty: {currentExercise.difficulty}</p>
      <p>Estimated Time: {currentExercise.estimatedTime} minutes</p>
    </div>
  );
}

/**
 * Example 4: Using exercise store with code editor
 */
export function ExerciseCodeEditorExample() {
  const {
    currentExercise,
    currentCode,
    testResults,
    isRunning,
    setCurrentCode,
    saveProgress,
  } = useExerciseStore();

  if (!currentExercise) {
    return <div>Please select an exercise first</div>;
  }

  const handleCodeChange = (newCode: string) => {
    setCurrentCode(newCode);
    // Auto-save progress
    saveProgress();
  };

  return (
    <div>
      <h3>{currentExercise.title}</h3>
      <textarea
        value={currentCode}
        onChange={(e) => handleCodeChange(e.target.value)}
        rows={20}
        cols={80}
        disabled={isRunning}
      />
      <div>
        <h4>Test Results</h4>
        {testResults.map((result) => (
          <div key={result.testId}>
            {result.testName}: {result.passed ? '✓ Passed' : '✗ Failed'}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Example 5: Using hints and solution
 */
export function ExerciseHintsExample() {
  const {
    currentExercise,
    progress,
    getExerciseProgress,
    revealHint,
    revealSolution,
  } = useExerciseStore();

  if (!currentExercise) {
    return <div>No exercise selected</div>;
  }

  const exerciseProgress = getExerciseProgress(currentExercise.id);
  const revealedHints = exerciseProgress?.hintsRevealed || [];
  const solutionViewed = exerciseProgress?.solutionViewed || false;

  return (
    <div>
      <h3>Hints</h3>
      {currentExercise.hints.map((hint) => {
        const isRevealed = revealedHints.includes(hint.id);
        return (
          <div key={hint.id}>
            {isRevealed ? (
              <p>{hint.content}</p>
            ) : (
              <button onClick={() => revealHint(hint.id)}>
                Reveal Hint {hint.level}
              </button>
            )}
          </div>
        );
      })}

      {solutionViewed ? (
        <div>
          <h4>Solution</h4>
          <pre>{currentExercise.solution}</pre>
        </div>
      ) : (
        <button onClick={revealSolution}>Reveal Solution</button>
      )}
    </div>
  );
}

/**
 * Example 6: Track attempts and progress
 */
export function ExerciseProgressExample() {
  const {
    currentExercise,
    progress,
    getExerciseProgress,
  } = useExerciseStore();

  if (!currentExercise) {
    return <div>No exercise selected</div>;
  }

  const exerciseProgress = getExerciseProgress(currentExercise.id);

  if (!exerciseProgress) {
    return <div>No progress recorded yet</div>;
  }

  return (
    <div>
      <h3>Your Progress</h3>
      <p>Best Score: {exerciseProgress.bestScore}%</p>
      <p>Total Attempts: {exerciseProgress.attempts.length}</p>
      <p>Time Spent: {Math.floor(exerciseProgress.totalTimeSpent / 60)} minutes</p>
      <p>Completed: {exerciseProgress.completed ? 'Yes' : 'No'}</p>

      <h4>Attempt History</h4>
      {exerciseProgress.attempts.map((attempt) => (
        <div key={attempt.id}>
          <p>Score: {attempt.score}%</p>
          <p>Time: {new Date(attempt.timestamp).toLocaleString()}</p>
          <p>Passed: {attempt.passed ? 'Yes' : 'No'}</p>
        </div>
      ))}
    </div>
  );
}

/**
 * Example 7: Full Exercise Page with API integration
 */
export function FullExercisePageExample({ exerciseId }: { exerciseId: string }) {
  const store = useExerciseStore();

  useEffect(() => {
    const loadExercise = async () => {
      const exercise = await store.loadExerciseById(exerciseId);
      if (exercise) {
        store.setCurrentExercise(exercise);
      }
    };
    loadExercise();
  }, [exerciseId]);

  if (store.isLoading) {
    return <div>Loading...</div>;
  }

  if (store.error) {
    return <div>Error: {store.error}</div>;
  }

  if (!store.currentExercise) {
    return <div>Exercise not found</div>;
  }

  return (
    <div>
      <h1>{store.currentExercise.title}</h1>
      <p>{store.currentExercise.description}</p>

      {/* Code Editor */}
      <textarea
        value={store.currentCode}
        onChange={(e) => store.setCurrentCode(e.target.value)}
        placeholder="Write your code here..."
      />

      {/* Actions */}
      <button onClick={store.resetExercise}>Reset</button>
      <button onClick={store.saveProgress}>Save Progress</button>

      {/* Test Results */}
      <div>
        {store.testResults.map((result) => (
          <div key={result.testId}>
            {result.testName}: {result.passed ? '✓' : '✗'}
          </div>
        ))}
      </div>
    </div>
  );
}
