/**
 * SRS (Spaced Repetition System) Store
 * Manages flashcards, reviews, and the SM-2 algorithm implementation
 * Enhanced with devtools and persistence
 */

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import type {
  SRSStore,
  FlashCard,
  CardReview,
  ReviewSession,
  CardStats,
  ReviewRecord,
} from '../types/store';

// ============================================================================
// SM-2 Algorithm Constants
// ============================================================================

const SM2_INITIAL_EASE_FACTOR = 2.5;
const SM2_MIN_EASE_FACTOR = 1.3;
const SM2_EASE_FACTOR_MODIFIER = 0.1;
const SM2_INTERVAL_MODIFIER = 0.15;

// ============================================================================
// Helper Functions for SM-2
// ============================================================================

/**
 * Calculates next review date using SM-2 algorithm
 */
const calculateNextReview = (
  quality: number,
  easeFactor: number,
  interval: number,
  repetitions: number
): { easeFactor: number; interval: number; repetitions: number } => {
  // Quality must be 0-5
  if (quality < 0 || quality > 5) {
    throw new Error('Quality must be between 0 and 5');
  }

  // Update ease factor
  let newEaseFactor =
    easeFactor +
    (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // Ensure ease factor doesn't go below minimum
  newEaseFactor = Math.max(newEaseFactor, SM2_MIN_EASE_FACTOR);

  let newInterval: number;
  let newRepetitions: number;

  if (quality < 3) {
    // Failed recall - reset interval and repetitions
    newInterval = 1;
    newRepetitions = 0;
  } else {
    // Successful recall
    if (repetitions === 0) {
      newInterval = 1;
    } else if (repetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * newEaseFactor);
    }
    newRepetitions = repetitions + 1;
  }

  return {
    easeFactor: newEaseFactor,
    interval: newInterval,
    repetitions: newRepetitions,
  };
};

// ============================================================================
// Initial State
// ============================================================================

const initialState = {
  cards: {},
  reviews: {},
  dueCards: [],
  currentSession: null,
  isReviewing: false,
  dailyLimit: 50,
  reviewedToday: 0,
  isLoading: false,
};

// ============================================================================
// Store Implementation
// ============================================================================

export const useSRSStore = create<SRSStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // ====================================================================
        // Load Cards
        // ====================================================================
        loadCards: async () => {
          set({ isLoading: true }, false, 'srs/loadCards/start');

          try {
            // TODO: Replace with actual API call
            const response = await fetch('/api/flashcards', {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
              },
            });

            if (!response.ok) {
              throw new Error('Failed to load flashcards');
            }

            const data = await response.json();
            const cards: Record<string, FlashCard> = {};

            data.cards.forEach((card: FlashCard) => {
              cards[card.id] = card;

              // Initialize review if not exists
              if (!get().reviews[card.id]) {
                get().reviews[card.id] = {
                  cardId: card.id,
                  quality: 0,
                  easeFactor: SM2_INITIAL_EASE_FACTOR,
                  interval: 0,
                  repetitions: 0,
                  nextReviewDate: new Date().toISOString(),
                  lastReviewedAt: new Date().toISOString(),
                  reviewHistory: [],
                };
              }
            });

            set(
              {
                cards,
                isLoading: false,
              },
              false,
              'srs/loadCards/success'
            );

            // Calculate due cards
            get().calculateDueCards();
          } catch (error) {
            console.error('Failed to load cards:', error);
            set({ isLoading: false }, false, 'srs/loadCards/error');
          }
        },

        // ====================================================================
        // Review Card
        // ====================================================================
        reviewCard: (cardId: string, quality: number) => {
          const review = get().reviews[cardId];
          if (!review) {
            console.error('Card review not found:', cardId);
            return;
          }

          // Calculate next review using SM-2
          const { easeFactor, interval, repetitions } = calculateNextReview(
            quality,
            review.easeFactor,
            review.interval,
            review.repetitions
          );

          // Calculate next review date
          const nextReviewDate = new Date();
          nextReviewDate.setDate(nextReviewDate.getDate() + interval);

          // Create review record
          const reviewRecord: ReviewRecord = {
            date: new Date().toISOString(),
            quality,
            timeSpent: 0, // TODO: Track actual time
          };

          // Update review
          set(
            {
              reviews: {
                ...get().reviews,
                [cardId]: {
                  ...review,
                  quality,
                  easeFactor,
                  interval,
                  repetitions,
                  nextReviewDate: nextReviewDate.toISOString(),
                  lastReviewedAt: new Date().toISOString(),
                  reviewHistory: [...review.reviewHistory, reviewRecord],
                },
              },
              reviewedToday: get().reviewedToday + 1,
            },
            false,
            'srs/reviewCard'
          );

          // Update session stats
          if (get().currentSession) {
            const session = get().currentSession!;
            set(
              {
                currentSession: {
                  ...session,
                  cardsReviewed: session.cardsReviewed + 1,
                  averageQuality:
                    (session.averageQuality * session.cardsReviewed + quality) /
                    (session.cardsReviewed + 1),
                },
              },
              false,
              'srs/updateSession'
            );
          }

          // Recalculate due cards
          get().calculateDueCards();
        },

        // ====================================================================
        // Start Session
        // ====================================================================
        startSession: () => {
          const dueCards = get().dueCards;

          if (dueCards.length === 0) {
            console.warn('No due cards to review');
            return;
          }

          const session: ReviewSession = {
            id: `session-${Date.now()}`,
            startedAt: new Date().toISOString(),
            cardsReviewed: 0,
            totalCards: Math.min(dueCards.length, get().dailyLimit),
            averageQuality: 0,
            totalTime: 0,
          };

          set(
            {
              currentSession: session,
              isReviewing: true,
            },
            false,
            'srs/startSession'
          );
        },

        // ====================================================================
        // End Session
        // ====================================================================
        endSession: () => {
          const session = get().currentSession;

          if (session) {
            const completedSession: ReviewSession = {
              ...session,
              completedAt: new Date().toISOString(),
              totalTime: Math.round(
                (new Date().getTime() - new Date(session.startedAt).getTime()) / 1000
              ),
            };

            // TODO: Save session to backend
            console.log('Session completed:', completedSession);
          }

          set(
            {
              currentSession: null,
              isReviewing: false,
            },
            false,
            'srs/endSession'
          );
        },

        // ====================================================================
        // Skip Card
        // ====================================================================
        skipCard: (cardId: string) => {
          console.log('Skipping card:', cardId);
          // TODO: Implement skip logic if needed
        },

        // ====================================================================
        // Undo Last Review
        // ====================================================================
        undoLastReview: () => {
          // TODO: Implement undo functionality
          console.warn('Undo not yet implemented');
        },

        // ====================================================================
        // Update Daily Limit
        // ====================================================================
        updateDailyLimit: (limit: number) => {
          set({ dailyLimit: limit }, false, 'srs/updateDailyLimit');
        },

        // ====================================================================
        // Calculate Due Cards
        // ====================================================================
        calculateDueCards: () => {
          const { reviews } = get();
          const now = new Date();
          const today = now.toISOString().split('T')[0];

          // Reset reviewed today if it's a new day
          const lastReview = Object.values(reviews)[0]?.lastReviewedAt;
          if (lastReview && lastReview.split('T')[0] !== today) {
            set({ reviewedToday: 0 }, false, 'srs/resetDailyCount');
          }

          // Find all cards due for review
          const dueCardIds = Object.entries(reviews)
            .filter(([_, review]) => {
              const nextReview = new Date(review.nextReviewDate);
              return nextReview <= now;
            })
            .map(([cardId]) => cardId)
            .sort((a, b) => {
              // Sort by next review date (oldest first)
              const reviewA = reviews[a];
              const reviewB = reviews[b];
              return (
                new Date(reviewA.nextReviewDate).getTime() -
                new Date(reviewB.nextReviewDate).getTime()
              );
            });

          set({ dueCards: dueCardIds }, false, 'srs/calculateDueCards');
        },

        // ====================================================================
        // Get Card Stats
        // ====================================================================
        getCardStats: (cardId: string): CardStats => {
          const review = get().reviews[cardId];

          if (!review) {
            return {
              totalReviews: 0,
              averageQuality: 0,
              successRate: 0,
              currentStreak: 0,
              retentionRate: 0,
            };
          }

          const history = review.reviewHistory;
          const totalReviews = history.length;

          if (totalReviews === 0) {
            return {
              totalReviews: 0,
              averageQuality: 0,
              successRate: 0,
              currentStreak: 0,
              retentionRate: 0,
            };
          }

          const averageQuality =
            history.reduce((sum, r) => sum + r.quality, 0) / totalReviews;

          const successfulReviews = history.filter((r) => r.quality >= 3).length;
          const successRate = (successfulReviews / totalReviews) * 100;

          // Calculate current streak (consecutive successful reviews)
          let currentStreak = 0;
          for (let i = history.length - 1; i >= 0; i--) {
            if (history[i].quality >= 3) {
              currentStreak++;
            } else {
              break;
            }
          }

          // Retention rate (based on ease factor)
          const retentionRate = Math.min(
            ((review.easeFactor - SM2_MIN_EASE_FACTOR) /
              (SM2_INITIAL_EASE_FACTOR - SM2_MIN_EASE_FACTOR)) *
              100,
            100
          );

          return {
            totalReviews,
            averageQuality,
            successRate,
            currentStreak,
            retentionRate,
          };
        },

        // ====================================================================
        // Sync Reviews
        // ====================================================================
        syncReviews: async () => {
          set({ isLoading: true }, false, 'srs/sync/start');

          try {
            // TODO: Replace with actual API call
            const response = await fetch('/api/flashcards/reviews', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
              },
              body: JSON.stringify({
                reviews: get().reviews,
                reviewedToday: get().reviewedToday,
              }),
            });

            if (!response.ok) {
              throw new Error('Failed to sync reviews');
            }

            set({ isLoading: false }, false, 'srs/sync/success');
          } catch (error) {
            console.error('Failed to sync reviews:', error);
            set({ isLoading: false }, false, 'srs/sync/error');
          }
        },
      }),
      {
        name: 'srs-storage',
        partialize: (state) => ({
          cards: state.cards,
          reviews: state.reviews,
          dailyLimit: state.dailyLimit,
          reviewedToday: state.reviewedToday,
        }),
        onRehydrateStorage: () => {
          return (state) => {
            if (state) {
              // Recalculate due cards on rehydration
              state.calculateDueCards();
            }
          };
        },
      }
    ),
    {
      name: 'SRSStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

// ============================================================================
// Selectors
// ============================================================================

export const selectDueCardsCount = (state: SRSStore) => state.dueCards.length;
export const selectIsReviewing = (state: SRSStore) => state.isReviewing;
export const selectCurrentSession = (state: SRSStore) => state.currentSession;
export const selectReviewedToday = (state: SRSStore) => state.reviewedToday;
export const selectDailyLimit = (state: SRSStore) => state.dailyLimit;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Gets the next due card
 */
export const getNextDueCard = (): FlashCard | null => {
  const { dueCards, cards } = useSRSStore.getState();

  if (dueCards.length === 0) return null;

  return cards[dueCards[0]] || null;
};

/**
 * Checks if daily limit is reached
 */
export const isDailyLimitReached = (): boolean => {
  const { reviewedToday, dailyLimit } = useSRSStore.getState();
  return reviewedToday >= dailyLimit;
};

/**
 * Gets total cards count
 */
export const getTotalCardsCount = (): number => {
  return Object.keys(useSRSStore.getState().cards).length;
};
