import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Exercise, ExerciseProgress, ExerciseAttempt, TestResult, ConsoleLog } from '../types/exercise';
import { getAllExercises, getExerciseById, ExerciseQueryParams } from '../lib/api/exercises';

interface ExerciseStore {
  // Current exercise state
  currentExercise: Exercise | null;
  currentCode: string;
  isRunning: boolean;
  testResults: TestResult[];
  consoleLogs: ConsoleLog[];
  timeSpent: number;

  // Exercises list
  exercises: Exercise[];
  isLoading: boolean;
  error: string | null;

  // Progress tracking
  progress: Record<string, ExerciseProgress>;

  // Actions
  setCurrentExercise: (exercise: Exercise) => void;
  setCurrentCode: (code: string) => void;
  setIsRunning: (isRunning: boolean) => void;
  setTestResults: (results: TestResult[]) => void;
  addConsoleLog: (log: ConsoleLog) => void;
  clearConsoleLogs: () => void;
  incrementTimeSpent: () => void;
  resetTimeSpent: () => void;

  // API Actions
  loadExercises: (params?: ExerciseQueryParams) => Promise<void>;
  loadExerciseById: (id: string) => Promise<Exercise | null>;

  // Progress management
  getExerciseProgress: (exerciseId: string) => ExerciseProgress | undefined;
  saveProgress: () => void;
  revealHint: (hintId: string) => void;
  revealSolution: () => void;
  addAttempt: (attempt: Omit<ExerciseAttempt, 'id' | 'timestamp'>) => void;
  loadAttempt: (attempt: ExerciseAttempt) => void;
  markAsCompleted: () => void;
  resetExercise: () => void;
}

export const useExerciseStore = create<ExerciseStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentExercise: null,
      currentCode: '',
      isRunning: false,
      testResults: [],
      consoleLogs: [],
      timeSpent: 0,
      exercises: [],
      isLoading: false,
      error: null,
      progress: {},

      // Set current exercise
      setCurrentExercise: (exercise) => {
        const progress = get().progress[exercise.id];
        set({
          currentExercise: exercise,
          currentCode: progress?.currentCode || exercise.starterCode,
          testResults: [],
          consoleLogs: [],
          timeSpent: 0,
        });
      },

      // Set current code
      setCurrentCode: (code) => {
        set({ currentCode: code });
      },

      // Set running state
      setIsRunning: (isRunning) => {
        set({ isRunning });
      },

      // Set test results
      setTestResults: (results) => {
        set({ testResults: results });
      },

      // Add console log
      addConsoleLog: (log) => {
        set((state) => ({
          consoleLogs: [...state.consoleLogs, log],
        }));
      },

      // Clear console logs
      clearConsoleLogs: () => {
        set({ consoleLogs: [] });
      },

      // Increment time spent
      incrementTimeSpent: () => {
        set((state) => ({
          timeSpent: state.timeSpent + 1,
        }));
      },

      // Reset time spent
      resetTimeSpent: () => {
        set({ timeSpent: 0 });
      },

      // Load exercises from API
      loadExercises: async (params?: ExerciseQueryParams) => {
        set({ isLoading: true, error: null });
        try {
          const response = await getAllExercises(params);
          set({
            exercises: response.exercises,
            isLoading: false,
            error: null
          });
        } catch (error) {
          console.error('Failed to load exercises:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to load exercises'
          });
        }
      },

      // Load specific exercise by ID from API
      loadExerciseById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const exercise = await getExerciseById(id);
          set({
            isLoading: false,
            error: null
          });
          return exercise;
        } catch (error) {
          console.error('Failed to load exercise:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to load exercise'
          });
          return null;
        }
      },

      // Get exercise progress
      getExerciseProgress: (exerciseId) => {
        return get().progress[exerciseId];
      },

      // Save progress
      saveProgress: () => {
        const { currentExercise, currentCode, progress } = get();
        if (!currentExercise) return;

        const existingProgress = progress[currentExercise.id] || {
          exerciseId: currentExercise.id,
          currentCode: '',
          attempts: [],
          hintsRevealed: [],
          solutionViewed: false,
          completed: false,
          bestScore: 0,
          totalTimeSpent: 0,
        };

        set({
          progress: {
            ...progress,
            [currentExercise.id]: {
              ...existingProgress,
              currentCode,
              totalTimeSpent: existingProgress.totalTimeSpent + get().timeSpent,
              lastAttemptDate: new Date(),
            },
          },
        });
      },

      // Reveal hint
      revealHint: (hintId) => {
        const { currentExercise, progress } = get();
        if (!currentExercise) return;

        const existingProgress = progress[currentExercise.id] || {
          exerciseId: currentExercise.id,
          currentCode: '',
          attempts: [],
          hintsRevealed: [],
          solutionViewed: false,
          completed: false,
          bestScore: 0,
          totalTimeSpent: 0,
        };

        set({
          progress: {
            ...progress,
            [currentExercise.id]: {
              ...existingProgress,
              hintsRevealed: [...existingProgress.hintsRevealed, hintId],
            },
          },
        });
      },

      // Reveal solution
      revealSolution: () => {
        const { currentExercise, progress } = get();
        if (!currentExercise) return;

        const existingProgress = progress[currentExercise.id] || {
          exerciseId: currentExercise.id,
          currentCode: '',
          attempts: [],
          hintsRevealed: [],
          solutionViewed: false,
          completed: false,
          bestScore: 0,
          totalTimeSpent: 0,
        };

        set({
          progress: {
            ...progress,
            [currentExercise.id]: {
              ...existingProgress,
              solutionViewed: true,
            },
          },
        });
      },

      // Add attempt
      addAttempt: (attemptData) => {
        const { currentExercise, progress, timeSpent } = get();
        if (!currentExercise) return;

        const existingProgress = progress[currentExercise.id] || {
          exerciseId: currentExercise.id,
          currentCode: '',
          attempts: [],
          hintsRevealed: [],
          solutionViewed: false,
          completed: false,
          bestScore: 0,
          totalTimeSpent: 0,
        };

        const attempt: ExerciseAttempt = {
          id: `attempt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
          ...attemptData,
        };

        const newBestScore = Math.max(existingProgress.bestScore, attempt.score);
        const isNewlyCompleted = attempt.passed && !existingProgress.completed;

        set({
          progress: {
            ...progress,
            [currentExercise.id]: {
              ...existingProgress,
              attempts: [...existingProgress.attempts, attempt],
              bestScore: newBestScore,
              totalTimeSpent: existingProgress.totalTimeSpent + timeSpent,
              lastAttemptDate: new Date(),
              completed: attempt.passed || existingProgress.completed,
              completedDate: isNewlyCompleted ? new Date() : existingProgress.completedDate,
            },
          },
        });

        // ====================================================================
        // Integration with progressStore
        // ====================================================================
        // Import progressStore dynamically to avoid circular dependency
        import('./progressStore').then(({ useProgressStore }) => {
          const { completeExercise } = useProgressStore.getState();
          completeExercise(currentExercise.id, attempt.score, timeSpent);
        });

        // ====================================================================
        // Integration with achievementsStore
        // ====================================================================
        // Import achievementsStore dynamically to avoid circular dependency
        import('./achievementsStore').then(({ useAchievementsStore }) => {
          const { checkExerciseAchievements, awardExerciseXP } = useAchievementsStore.getState();

          if (isNewlyCompleted) {
            checkExerciseAchievements({
              exerciseId: currentExercise.id,
              score: attempt.score,
              timeSpent,
              completed: true,
            });
          }

          awardExerciseXP(attempt.score, isNewlyCompleted);
        });

        // Reset time spent after saving attempt
        set({ timeSpent: 0 });
      },

      // Load attempt
      loadAttempt: (attempt) => {
        set({
          currentCode: attempt.code,
          testResults: attempt.testResults,
        });
      },

      // Mark as completed
      markAsCompleted: () => {
        const { currentExercise, progress } = get();
        if (!currentExercise) return;

        const existingProgress = progress[currentExercise.id];
        if (!existingProgress) return;

        const isNewlyCompleted = !existingProgress.completed;

        set({
          progress: {
            ...progress,
            [currentExercise.id]: {
              ...existingProgress,
              completed: true,
              completedDate: new Date(),
            },
          },
        });

        // ====================================================================
        // Integration with progressStore
        // ====================================================================
        if (isNewlyCompleted) {
          import('./progressStore').then(({ useProgressStore }) => {
            const { completeExercise } = useProgressStore.getState();
            completeExercise(
              currentExercise.id,
              existingProgress.bestScore,
              existingProgress.totalTimeSpent
            );
          });

          // ====================================================================
          // Integration with achievementsStore
          // ====================================================================
          import('./achievementsStore').then(({ useAchievementsStore }) => {
            const { checkExerciseAchievements } = useAchievementsStore.getState();
            checkExerciseAchievements({
              exerciseId: currentExercise.id,
              score: existingProgress.bestScore,
              timeSpent: existingProgress.totalTimeSpent,
              completed: true,
            });
          });
        }
      },

      // Reset exercise
      resetExercise: () => {
        const { currentExercise } = get();
        if (!currentExercise) return;

        set({
          currentCode: currentExercise.starterCode,
          testResults: [],
          consoleLogs: [],
          timeSpent: 0,
        });
      },
    }),
    {
      name: 'exercise-storage',
      partialize: (state) => ({
        progress: state.progress,
      }),
    }
  )
);
