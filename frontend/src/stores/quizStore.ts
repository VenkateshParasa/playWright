/**
 * Quiz Store
 * Manages quiz sessions, progress, answers, and results with auto-save functionality
 * Enhanced with devtools and persistence
 */

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import type {
  QuizStore,
  Quiz,
  QuizSession,
  QuizAnswer,
  QuizResult,
  Question,
  QuestionResult,
  MultipleChoiceQuestion,
  TrueFalseQuestion,
  CodeSnippetQuestion,
} from '../types/quiz';

// ============================================================================
// Constants
// ============================================================================

const STORAGE_PREFIX = 'quiz-progress-';

// ============================================================================
// Initial State
// ============================================================================

const initialState = {
  currentSession: null,
  quizHistory: [],
  isLoading: false,
  error: null,
  timerActive: false,
  timeElapsed: 0,
  showResults: false,
  showExplanations: false,
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Checks if an answer is correct
 */
const isAnswerCorrect = (question: Question, userAnswer: string | string[] | boolean): boolean => {
  switch (question.type) {
    case 'true-false':
      return userAnswer === (question as TrueFalseQuestion).correctAnswer;

    case 'multiple-choice':
    case 'code-snippet': {
      const mcQuestion = question as MultipleChoiceQuestion | CodeSnippetQuestion;
      const correctOptions = mcQuestion.options.filter((opt) => opt.isCorrect).map((opt) => opt.id);

      if (mcQuestion.allowMultiple) {
        // For multiple answers, check if arrays match
        const userAnswerArray = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
        return (
          correctOptions.length === userAnswerArray.length &&
          correctOptions.every((id) => userAnswerArray.includes(id))
        );
      } else {
        // For single answer, check if it matches
        return correctOptions.includes(userAnswer as string);
      }
    }

    default:
      return false;
  }
};

/**
 * Gets the correct answer for display
 */
const getCorrectAnswer = (question: Question): string | string[] | boolean => {
  switch (question.type) {
    case 'true-false':
      return (question as TrueFalseQuestion).correctAnswer;

    case 'multiple-choice':
    case 'code-snippet': {
      const mcQuestion = question as MultipleChoiceQuestion | CodeSnippetQuestion;
      const correctOptions = mcQuestion.options.filter((opt) => opt.isCorrect);
      return mcQuestion.allowMultiple
        ? correctOptions.map((opt) => opt.id)
        : correctOptions[0]?.id || '';
    }

    default:
      return '';
  }
};

// ============================================================================
// Store Implementation
// ============================================================================

export const useQuizStore = create<QuizStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // ====================================================================
        // Session Management
        // ====================================================================

        startQuiz: (quiz: Quiz) => {
          const now = new Date().toISOString();

          // Try to load saved progress
          const savedProgress = localStorage.getItem(`${STORAGE_PREFIX}${quiz.id}`);
          if (savedProgress) {
            try {
              const parsed = JSON.parse(savedProgress);
              set(
                {
                  currentSession: parsed,
                  timerActive: true,
                  showResults: false,
                  error: null,
                },
                false,
                'quiz/resumeFromSaved'
              );
              return;
            } catch (error) {
              console.error('Failed to load saved progress:', error);
            }
          }

          // Start new session
          const session: QuizSession = {
            quiz,
            progress: {
              currentQuestionIndex: 0,
              answers: {},
              timeRemaining: quiz.timeLimit,
              startedAt: now,
              isPaused: false,
            },
            isCompleted: false,
          };

          set(
            {
              currentSession: session,
              timerActive: quiz.timeLimit > 0,
              timeElapsed: 0,
              showResults: false,
              error: null,
            },
            false,
            'quiz/start'
          );

          // Auto-save initial state
          get().saveProgress();
        },

        submitQuiz: () => {
          const session = get().currentSession;
          if (!session) {
            get().setError('No active quiz session');
            return;
          }

          // Stop timer
          get().stopTimer();

          // Calculate results
          const result = get().calculateResults();

          // Update session
          set(
            {
              currentSession: {
                ...session,
                result,
                isCompleted: true,
              },
              showResults: true,
              showExplanations: session.quiz.showExplanations,
            },
            false,
            'quiz/submit'
          );

          // Save to history
          get().saveToHistory(result);

          // Clear auto-saved progress
          get().clearProgress(session.quiz.id);
        },

        pauseQuiz: () => {
          const session = get().currentSession;
          if (!session) return;

          set(
            {
              currentSession: {
                ...session,
                progress: {
                  ...session.progress,
                  isPaused: true,
                },
              },
              timerActive: false,
            },
            false,
            'quiz/pause'
          );

          get().saveProgress();
        },

        resumeQuiz: () => {
          const session = get().currentSession;
          if (!session) return;

          set(
            {
              currentSession: {
                ...session,
                progress: {
                  ...session.progress,
                  isPaused: false,
                },
              },
              timerActive: session.quiz.timeLimit > 0,
            },
            false,
            'quiz/resume'
          );
        },

        retryQuiz: (quizId: string) => {
          const session = get().currentSession;
          if (!session || session.quiz.id !== quizId) {
            get().setError('Quiz not found');
            return;
          }

          // Check max attempts
          const history = get().getQuizHistory(quizId);
          if (
            session.quiz.maxAttempts &&
            history.length >= session.quiz.maxAttempts
          ) {
            get().setError(`Maximum attempts (${session.quiz.maxAttempts}) reached`);
            return;
          }

          // Clear progress and restart
          get().clearProgress(quizId);
          get().startQuiz(session.quiz);
        },

        exitQuiz: () => {
          const session = get().currentSession;
          if (session && !session.isCompleted) {
            // Save progress before exiting
            get().saveProgress();
          }

          set(
            {
              currentSession: null,
              timerActive: false,
              showResults: false,
              error: null,
            },
            false,
            'quiz/exit'
          );
        },

        // ====================================================================
        // Navigation
        // ====================================================================

        goToQuestion: (index: number) => {
          const session = get().currentSession;
          if (!session || session.isCompleted) return;

          const maxIndex = session.quiz.questions.length - 1;
          const validIndex = Math.max(0, Math.min(index, maxIndex));

          set(
            {
              currentSession: {
                ...session,
                progress: {
                  ...session.progress,
                  currentQuestionIndex: validIndex,
                },
              },
            },
            false,
            'quiz/goToQuestion'
          );

          get().saveProgress();
        },

        nextQuestion: () => {
          const session = get().currentSession;
          if (!session) return;

          const nextIndex = session.progress.currentQuestionIndex + 1;
          if (nextIndex < session.quiz.questions.length) {
            get().goToQuestion(nextIndex);
          }
        },

        previousQuestion: () => {
          const session = get().currentSession;
          if (!session) return;

          const prevIndex = session.progress.currentQuestionIndex - 1;
          if (prevIndex >= 0) {
            get().goToQuestion(prevIndex);
          }
        },

        // ====================================================================
        // Answer Management
        // ====================================================================

        answerQuestion: (questionId: string, answer: string | string[] | boolean) => {
          const session = get().currentSession;
          if (!session || session.isCompleted) return;

          const now = new Date().toISOString();
          const existingAnswer = session.progress.answers[questionId];

          const newAnswer: QuizAnswer = {
            questionId,
            answer,
            markedForReview: existingAnswer?.markedForReview || false,
            timeSpent: existingAnswer?.timeSpent || 0,
            answeredAt: now,
          };

          set(
            {
              currentSession: {
                ...session,
                progress: {
                  ...session.progress,
                  answers: {
                    ...session.progress.answers,
                    [questionId]: newAnswer,
                  },
                },
              },
            },
            false,
            'quiz/answerQuestion'
          );

          get().saveProgress();
        },

        markForReview: (questionId: string) => {
          const session = get().currentSession;
          if (!session) return;

          const existingAnswer = session.progress.answers[questionId];
          if (!existingAnswer) return;

          set(
            {
              currentSession: {
                ...session,
                progress: {
                  ...session.progress,
                  answers: {
                    ...session.progress.answers,
                    [questionId]: {
                      ...existingAnswer,
                      markedForReview: true,
                    },
                  },
                },
              },
            },
            false,
            'quiz/markForReview'
          );

          get().saveProgress();
        },

        unmarkForReview: (questionId: string) => {
          const session = get().currentSession;
          if (!session) return;

          const existingAnswer = session.progress.answers[questionId];
          if (!existingAnswer) return;

          set(
            {
              currentSession: {
                ...session,
                progress: {
                  ...session.progress,
                  answers: {
                    ...session.progress.answers,
                    [questionId]: {
                      ...existingAnswer,
                      markedForReview: false,
                    },
                  },
                },
              },
            },
            false,
            'quiz/unmarkForReview'
          );

          get().saveProgress();
        },

        // ====================================================================
        // Timer Management
        // ====================================================================

        startTimer: () => {
          set({ timerActive: true }, false, 'quiz/timer/start');
        },

        stopTimer: () => {
          set({ timerActive: false }, false, 'quiz/timer/stop');
        },

        updateTimeRemaining: (seconds: number) => {
          const session = get().currentSession;
          if (!session) return;

          set(
            {
              currentSession: {
                ...session,
                progress: {
                  ...session.progress,
                  timeRemaining: seconds,
                },
              },
            },
            false,
            'quiz/timer/update'
          );

          // Auto-submit when time runs out
          if (seconds <= 0) {
            get().submitQuiz();
          }
        },

        // ====================================================================
        // Results Calculation
        // ====================================================================

        calculateResults: (): QuizResult => {
          const session = get().currentSession;
          if (!session) {
            throw new Error('No active quiz session');
          }

          const { quiz, progress } = session;
          const startTime = new Date(progress.startedAt).getTime();
          const endTime = Date.now();
          const timeSpent = Math.floor((endTime - startTime) / 1000);

          let totalScore = 0;
          let earnedScore = 0;
          let correctCount = 0;

          const questionResults: QuestionResult[] = quiz.questions.map((question) => {
            const userAnswer = progress.answers[question.id];
            const isCorrect = userAnswer
              ? isAnswerCorrect(question, userAnswer.answer)
              : false;

            if (isCorrect) {
              correctCount++;
              earnedScore += question.points;
            }
            totalScore += question.points;

            return {
              questionId: question.id,
              question: question.question,
              userAnswer: userAnswer?.answer || '',
              correctAnswer: getCorrectAnswer(question),
              isCorrect,
              points: question.points,
              earnedPoints: isCorrect ? question.points : 0,
              explanation: question.explanation,
              timeSpent: userAnswer?.timeSpent || 0,
            };
          });

          const percentage = totalScore > 0 ? Math.round((earnedScore / totalScore) * 100) : 0;
          const passed = percentage >= quiz.passingScore;

          return {
            quizId: quiz.id,
            score: earnedScore,
            maxScore: totalScore,
            percentage,
            passed,
            completedAt: new Date().toISOString(),
            timeSpent,
            answers: progress.answers,
            correctAnswers: correctCount,
            totalQuestions: quiz.questions.length,
            questionResults,
          };
        },

        saveToHistory: (result: QuizResult) => {
          set(
            {
              quizHistory: [...get().quizHistory, result],
            },
            false,
            'quiz/saveHistory'
          );
        },

        getQuizHistory: (quizId: string) => {
          return get().quizHistory.filter((result) => result.quizId === quizId);
        },

        getBestScore: (quizId: string) => {
          const history = get().getQuizHistory(quizId);
          if (history.length === 0) return 0;

          return Math.max(...history.map((result) => result.percentage));
        },

        // ====================================================================
        // Auto-save
        // ====================================================================

        saveProgress: () => {
          const session = get().currentSession;
          if (!session || session.isCompleted) return;

          const key = `${STORAGE_PREFIX}${session.quiz.id}`;
          localStorage.setItem(key, JSON.stringify(session));
        },

        loadProgress: (quizId: string): boolean => {
          const key = `${STORAGE_PREFIX}${quizId}`;
          const saved = localStorage.getItem(key);

          if (!saved) return false;

          try {
            const session = JSON.parse(saved) as QuizSession;
            set(
              {
                currentSession: session,
                timerActive: !session.progress.isPaused && session.quiz.timeLimit > 0,
                error: null,
              },
              false,
              'quiz/loadProgress'
            );
            return true;
          } catch (error) {
            console.error('Failed to load progress:', error);
            return false;
          }
        },

        clearProgress: (quizId: string) => {
          const key = `${STORAGE_PREFIX}${quizId}`;
          localStorage.removeItem(key);
        },

        // ====================================================================
        // State Management
        // ====================================================================

        resetState: () => {
          set(initialState, false, 'quiz/reset');
        },

        setError: (error: string | null) => {
          set({ error }, false, 'quiz/setError');
        },
      }),
      {
        name: 'quiz-storage',
        partialize: (state) => ({
          quizHistory: state.quizHistory,
        }),
      }
    ),
    {
      name: 'QuizStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

// ============================================================================
// Selectors
// ============================================================================

export const selectCurrentQuiz = (state: QuizStore) => state.currentSession?.quiz;
export const selectCurrentQuestion = (state: QuizStore) => {
  const session = state.currentSession;
  if (!session) return null;
  return session.quiz.questions[session.progress.currentQuestionIndex];
};
export const selectCurrentQuestionIndex = (state: QuizStore) =>
  state.currentSession?.progress.currentQuestionIndex || 0;
export const selectAnswers = (state: QuizStore) => state.currentSession?.progress.answers || {};
export const selectQuizResult = (state: QuizStore) => state.currentSession?.result;
export const selectIsCompleted = (state: QuizStore) => state.currentSession?.isCompleted || false;
export const selectTimeRemaining = (state: QuizStore) =>
  state.currentSession?.progress.timeRemaining || 0;
