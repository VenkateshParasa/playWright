import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ReviewSession, CardReview, FlashCard } from '../types/flashcard.types';

interface SessionStore {
  currentSession: ReviewSession | null;
  currentCardIndex: number;
  isFlipped: boolean;
  isPaused: boolean;
  undoHistory: CardReview[];
  dueCards: FlashCard[];
  cardStartTime: number;

  // Actions
  startSession: (cards: FlashCard[]) => void;
  endSession: () => void;
  setCurrentCardIndex: (index: number) => void;
  flipCard: () => void;
  togglePause: () => void;
  reviewCard: (cardId: string, quality: number) => void;
  undoLastReview: () => void;
  skipCard: () => void;
  nextCard: () => void;
  resetSession: () => void;
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      currentSession: null,
      currentCardIndex: 0,
      isFlipped: false,
      isPaused: false,
      undoHistory: [],
      dueCards: [],
      cardStartTime: Date.now(),

      startSession: (cards) => {
        const newSession: ReviewSession = {
          id: `session-${Date.now()}`,
          startTime: new Date(),
          cardsReviewed: 0,
          totalCards: cards.length,
          correctCount: 0,
          timeSpent: 0,
          reviews: []
        };

        set({
          currentSession: newSession,
          dueCards: cards,
          currentCardIndex: 0,
          isFlipped: false,
          isPaused: false,
          undoHistory: [],
          cardStartTime: Date.now()
        });
      },

      endSession: () => {
        const { currentSession } = get();
        if (currentSession) {
          const endTime = new Date();
          const timeSpent = Math.floor((endTime.getTime() - currentSession.startTime.getTime()) / 1000);

          set({
            currentSession: {
              ...currentSession,
              endTime,
              timeSpent
            }
          });
        }
      },

      setCurrentCardIndex: (index) => {
        set({
          currentCardIndex: index,
          isFlipped: false,
          cardStartTime: Date.now()
        });
      },

      flipCard: () => {
        set((state) => ({ isFlipped: !state.isFlipped }));
      },

      togglePause: () => {
        set((state) => ({ isPaused: !state.isPaused }));
      },

      reviewCard: (cardId, quality) => {
        const { currentSession, cardStartTime, undoHistory } = get();

        if (!currentSession) return;

        const timeSpent = Math.floor((Date.now() - cardStartTime) / 1000);
        const review: CardReview = {
          cardId,
          quality,
          timeSpent,
          timestamp: new Date()
        };

        const updatedSession: ReviewSession = {
          ...currentSession,
          cardsReviewed: currentSession.cardsReviewed + 1,
          correctCount: quality >= 4 ? currentSession.correctCount + 1 : currentSession.correctCount,
          reviews: [...currentSession.reviews, review]
        };

        set({
          currentSession: updatedSession,
          undoHistory: [...undoHistory, review],
          isFlipped: false,
          cardStartTime: Date.now()
        });
      },

      undoLastReview: () => {
        const { currentSession, undoHistory, currentCardIndex } = get();

        if (!currentSession || undoHistory.length === 0) return;

        const lastReview = undoHistory[undoHistory.length - 1];
        const updatedReviews = currentSession.reviews.slice(0, -1);

        const updatedSession: ReviewSession = {
          ...currentSession,
          cardsReviewed: Math.max(0, currentSession.cardsReviewed - 1),
          correctCount: lastReview.quality >= 4
            ? Math.max(0, currentSession.correctCount - 1)
            : currentSession.correctCount,
          reviews: updatedReviews
        };

        set({
          currentSession: updatedSession,
          undoHistory: undoHistory.slice(0, -1),
          currentCardIndex: Math.max(0, currentCardIndex - 1),
          isFlipped: false,
          cardStartTime: Date.now()
        });
      },

      skipCard: () => {
        const { currentCardIndex, dueCards } = get();

        if (currentCardIndex < dueCards.length - 1) {
          set({
            currentCardIndex: currentCardIndex + 1,
            isFlipped: false,
            cardStartTime: Date.now()
          });
        }
      },

      nextCard: () => {
        const { currentCardIndex, dueCards } = get();

        if (currentCardIndex < dueCards.length - 1) {
          set({
            currentCardIndex: currentCardIndex + 1,
            isFlipped: false,
            cardStartTime: Date.now()
          });
        }
      },

      resetSession: () => {
        set({
          currentSession: null,
          currentCardIndex: 0,
          isFlipped: false,
          isPaused: false,
          undoHistory: [],
          dueCards: [],
          cardStartTime: Date.now()
        });
      }
    }),
    {
      name: 'flashcard-session-storage',
      partialize: (state) => ({
        currentSession: state.currentSession,
        currentCardIndex: state.currentCardIndex,
        undoHistory: state.undoHistory,
        dueCards: state.dueCards
      })
    }
  )
);
