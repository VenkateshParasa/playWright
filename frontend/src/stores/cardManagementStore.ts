/**
 * Card Management Store
 * Manages card browsing, editing, filtering, and bulk operations
 */

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

// =============================================================================
// Types
// =============================================================================

export type CardStatus = 'new' | 'learning' | 'review' | 'mastered' | 'suspended';
export type CardDifficulty = 'easy' | 'medium' | 'hard';
export type ViewMode = 'grid' | 'list';
export type SortBy = 'nextReviewDate' | 'createdAt' | 'difficulty' | 'totalReviews' | 'successRate';
export type SortOrder = 'asc' | 'desc';

export interface Card {
  id: string;
  deckId?: string;
  front: string;
  back: string;
  frontImages?: string[];
  backImages?: string[];
  category: string;
  tags: string[];
  difficulty?: CardDifficulty;
  status: CardStatus;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: string;
  lastReviewedAt?: string;
  totalReviews: number;
  correctReviews: number;
  incorrectReviews: number;
  totalTimeSpent: number;
  averageTimeSpent: number;
  successRate?: number;
  isSuspended: boolean;
  isNew: boolean;
  isDraft: boolean;
  relatedCards?: Array<{
    cardId: string;
    relationType: 'prerequisite' | 'related' | 'opposite' | 'example';
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Deck {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isDefault: boolean;
  stats?: {
    totalCards: number;
    newCards: number;
    learningCards: number;
    reviewCards: number;
    masteredCards: number;
    suspendedCards: number;
    dueCards: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CardFilters {
  deckId?: string;
  category?: string;
  tags?: string[];
  status?: CardStatus[];
  difficulty?: CardDifficulty[];
  dueOnly?: boolean;
}

export interface CardManagementState {
  // Cards data
  cards: Card[];
  selectedCards: Set<string>;
  currentCard: Card | null;
  totalCards: number;

  // Decks data
  decks: Deck[];
  currentDeck: Deck | null;

  // Filters and search
  filters: CardFilters;
  searchQuery: string;

  // View settings
  viewMode: ViewMode;
  sortBy: SortBy;
  sortOrder: SortOrder;

  // Pagination
  page: number;
  limit: number;
  totalPages: number;

  // UI state
  isLoading: boolean;
  error: string | null;
  bulkOperationProgress: number;

  // Draft card for editor
  draftCard: Partial<Card> | null;

  // Actions - Cards
  loadCards: (filters?: CardFilters) => Promise<void>;
  loadCard: (id: string) => Promise<void>;
  createCard: (card: Partial<Card>) => Promise<Card | null>;
  updateCard: (id: string, updates: Partial<Card>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;

  // Actions - Selection
  selectCard: (id: string) => void;
  deselectCard: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;

  // Actions - Bulk operations
  bulkSuspend: (cardIds: string[]) => Promise<void>;
  bulkResume: (cardIds: string[]) => Promise<void>;
  bulkReset: (cardIds: string[]) => Promise<void>;
  bulkDelete: (cardIds: string[]) => Promise<void>;
  bulkChangeCategory: (cardIds: string[], category: string) => Promise<void>;
  bulkChangeDeck: (cardIds: string[], deckId: string | null) => Promise<void>;

  // Actions - Card operations
  suspendCard: (id: string) => Promise<void>;
  resetCard: (id: string) => Promise<void>;

  // Actions - Filters and search
  setFilters: (filters: Partial<CardFilters>) => void;
  clearFilters: () => void;
  setSearchQuery: (query: string) => void;

  // Actions - View settings
  setViewMode: (mode: ViewMode) => void;
  setSortBy: (sortBy: SortBy) => void;
  setSortOrder: (order: SortOrder) => void;
  toggleSortOrder: () => void;

  // Actions - Pagination
  setPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;

  // Actions - Decks
  loadDecks: () => Promise<void>;
  createDeck: (deck: Partial<Deck>) => Promise<Deck | null>;
  updateDeck: (id: string, updates: Partial<Deck>) => Promise<void>;
  deleteDeck: (id: string, moveCardsTo?: string) => Promise<void>;
  setCurrentDeck: (deck: Deck | null) => void;

  // Actions - Editor
  setDraftCard: (card: Partial<Card> | null) => void;
  saveDraft: () => void;
  clearDraft: () => void;
}

// =============================================================================
// Initial State
// =============================================================================

const initialState = {
  cards: [],
  selectedCards: new Set<string>(),
  currentCard: null,
  totalCards: 0,
  decks: [],
  currentDeck: null,
  filters: {},
  searchQuery: '',
  viewMode: 'grid' as ViewMode,
  sortBy: 'nextReviewDate' as SortBy,
  sortOrder: 'asc' as SortOrder,
  page: 1,
  limit: 50,
  totalPages: 1,
  isLoading: false,
  error: null,
  bulkOperationProgress: 0,
  draftCard: null,
};

// =============================================================================
// Store Implementation
// =============================================================================

export const useCardManagementStore = create<CardManagementState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // =====================================================================
        // Load Cards
        // =====================================================================
        loadCards: async (filters?: CardFilters) => {
          set({ isLoading: true, error: null }, false, 'cards/loadCards/start');

          try {
            const state = get();
            const activeFilters = filters || state.filters;

            // Build query params
            const params = new URLSearchParams();
            params.append('page', state.page.toString());
            params.append('limit', state.limit.toString());
            params.append('sortBy', state.sortBy);
            params.append('sortOrder', state.sortOrder);

            if (state.searchQuery) params.append('search', state.searchQuery);
            if (activeFilters.deckId) params.append('deckId', activeFilters.deckId);
            if (activeFilters.category) params.append('category', activeFilters.category);
            if (activeFilters.tags && activeFilters.tags.length > 0) {
              activeFilters.tags.forEach(tag => params.append('tags', tag));
            }
            if (activeFilters.status && activeFilters.status.length > 0) {
              activeFilters.status.forEach(status => params.append('status', status));
            }
            if (activeFilters.difficulty && activeFilters.difficulty.length > 0) {
              activeFilters.difficulty.forEach(diff => params.append('difficulty', diff));
            }
            if (activeFilters.dueOnly) params.append('dueOnly', 'true');

            const response = await fetch(`/api/cards?${params.toString()}`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
              },
            });

            if (!response.ok) {
              throw new Error('Failed to load cards');
            }

            const result = await response.json();

            set(
              {
                cards: result.data.cards,
                totalCards: result.data.pagination.total,
                totalPages: result.data.pagination.pages,
                isLoading: false,
              },
              false,
              'cards/loadCards/success'
            );
          } catch (error: any) {
            console.error('Failed to load cards:', error);
            set(
              {
                isLoading: false,
                error: error.message || 'Failed to load cards',
              },
              false,
              'cards/loadCards/error'
            );
          }
        },

        // =====================================================================
        // Load Card
        // =====================================================================
        loadCard: async (id: string) => {
          set({ isLoading: true, error: null }, false, 'cards/loadCard/start');

          try {
            const response = await fetch(`/api/cards/${id}`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
              },
            });

            if (!response.ok) {
              throw new Error('Failed to load card');
            }

            const result = await response.json();

            set(
              {
                currentCard: result.data,
                isLoading: false,
              },
              false,
              'cards/loadCard/success'
            );
          } catch (error: any) {
            console.error('Failed to load card:', error);
            set(
              {
                isLoading: false,
                error: error.message || 'Failed to load card',
              },
              false,
              'cards/loadCard/error'
            );
          }
        },

        // =====================================================================
        // Create Card
        // =====================================================================
        createCard: async (card: Partial<Card>) => {
          set({ isLoading: true, error: null }, false, 'cards/createCard/start');

          try {
            const response = await fetch('/api/cards', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
              },
              body: JSON.stringify(card),
            });

            if (!response.ok) {
              throw new Error('Failed to create card');
            }

            const result = await response.json();

            set({ isLoading: false }, false, 'cards/createCard/success');

            // Reload cards
            await get().loadCards();

            return result.data;
          } catch (error: any) {
            console.error('Failed to create card:', error);
            set(
              {
                isLoading: false,
                error: error.message || 'Failed to create card',
              },
              false,
              'cards/createCard/error'
            );
            return null;
          }
        },

        // =====================================================================
        // Update Card
        // =====================================================================
        updateCard: async (id: string, updates: Partial<Card>) => {
          set({ isLoading: true, error: null }, false, 'cards/updateCard/start');

          try {
            const response = await fetch(`/api/cards/${id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
              },
              body: JSON.stringify(updates),
            });

            if (!response.ok) {
              throw new Error('Failed to update card');
            }

            const result = await response.json();

            // Update local state optimistically
            set(
              state => ({
                cards: state.cards.map(c => (c.id === id ? { ...c, ...result.data } : c)),
                currentCard: state.currentCard?.id === id
                  ? { ...state.currentCard, ...result.data }
                  : state.currentCard,
                isLoading: false,
              }),
              false,
              'cards/updateCard/success'
            );
          } catch (error: any) {
            console.error('Failed to update card:', error);
            set(
              {
                isLoading: false,
                error: error.message || 'Failed to update card',
              },
              false,
              'cards/updateCard/error'
            );
          }
        },

        // =====================================================================
        // Delete Card
        // =====================================================================
        deleteCard: async (id: string) => {
          set({ isLoading: true, error: null }, false, 'cards/deleteCard/start');

          try {
            const response = await fetch(`/api/cards/${id}`, {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
              },
            });

            if (!response.ok) {
              throw new Error('Failed to delete card');
            }

            // Remove from local state
            set(
              state => ({
                cards: state.cards.filter(c => c.id !== id),
                selectedCards: new Set([...state.selectedCards].filter(cid => cid !== id)),
                totalCards: state.totalCards - 1,
                isLoading: false,
              }),
              false,
              'cards/deleteCard/success'
            );
          } catch (error: any) {
            console.error('Failed to delete card:', error);
            set(
              {
                isLoading: false,
                error: error.message || 'Failed to delete card',
              },
              false,
              'cards/deleteCard/error'
            );
          }
        },

        // =====================================================================
        // Selection Actions
        // =====================================================================
        selectCard: (id: string) => {
          set(
            state => ({
              selectedCards: new Set([...state.selectedCards, id]),
            }),
            false,
            'cards/selectCard'
          );
        },

        deselectCard: (id: string) => {
          set(
            state => {
              const newSet = new Set(state.selectedCards);
              newSet.delete(id);
              return { selectedCards: newSet };
            },
            false,
            'cards/deselectCard'
          );
        },

        selectAll: () => {
          set(
            state => ({
              selectedCards: new Set(state.cards.map(c => c.id)),
            }),
            false,
            'cards/selectAll'
          );
        },

        deselectAll: () => {
          set({ selectedCards: new Set() }, false, 'cards/deselectAll');
        },

        // =====================================================================
        // Bulk Operations
        // =====================================================================
        bulkSuspend: async (cardIds: string[]) => {
          set({ isLoading: true, error: null, bulkOperationProgress: 0 }, false, 'cards/bulkSuspend/start');

          try {
            const response = await fetch('/api/cards/bulk', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
              },
              body: JSON.stringify({
                operation: 'suspend',
                cardIds,
              }),
            });

            if (!response.ok) {
              throw new Error('Failed to suspend cards');
            }

            set({ isLoading: false, bulkOperationProgress: 100 }, false, 'cards/bulkSuspend/success');

            // Reload cards
            await get().loadCards();
          } catch (error: any) {
            console.error('Failed to suspend cards:', error);
            set(
              {
                isLoading: false,
                error: error.message || 'Failed to suspend cards',
              },
              false,
              'cards/bulkSuspend/error'
            );
          }
        },

        bulkResume: async (cardIds: string[]) => {
          set({ isLoading: true, error: null, bulkOperationProgress: 0 }, false, 'cards/bulkResume/start');

          try {
            const response = await fetch('/api/cards/bulk', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
              },
              body: JSON.stringify({
                operation: 'resume',
                cardIds,
              }),
            });

            if (!response.ok) {
              throw new Error('Failed to resume cards');
            }

            set({ isLoading: false, bulkOperationProgress: 100 }, false, 'cards/bulkResume/success');

            // Reload cards
            await get().loadCards();
          } catch (error: any) {
            console.error('Failed to resume cards:', error);
            set(
              {
                isLoading: false,
                error: error.message || 'Failed to resume cards',
              },
              false,
              'cards/bulkResume/error'
            );
          }
        },

        bulkReset: async (cardIds: string[]) => {
          set({ isLoading: true, error: null, bulkOperationProgress: 0 }, false, 'cards/bulkReset/start');

          try {
            const response = await fetch('/api/cards/bulk', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
              },
              body: JSON.stringify({
                operation: 'reset',
                cardIds,
              }),
            });

            if (!response.ok) {
              throw new Error('Failed to reset cards');
            }

            set({ isLoading: false, bulkOperationProgress: 100 }, false, 'cards/bulkReset/success');

            // Reload cards
            await get().loadCards();
          } catch (error: any) {
            console.error('Failed to reset cards:', error);
            set(
              {
                isLoading: false,
                error: error.message || 'Failed to reset cards',
              },
              false,
              'cards/bulkReset/error'
            );
          }
        },

        bulkDelete: async (cardIds: string[]) => {
          set({ isLoading: true, error: null, bulkOperationProgress: 0 }, false, 'cards/bulkDelete/start');

          try {
            const response = await fetch('/api/cards/bulk', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
              },
              body: JSON.stringify({
                operation: 'delete',
                cardIds,
              }),
            });

            if (!response.ok) {
              throw new Error('Failed to delete cards');
            }

            set({ isLoading: false, bulkOperationProgress: 100 }, false, 'cards/bulkDelete/success');

            // Reload cards
            await get().loadCards();
          } catch (error: any) {
            console.error('Failed to delete cards:', error);
            set(
              {
                isLoading: false,
                error: error.message || 'Failed to delete cards',
              },
              false,
              'cards/bulkDelete/error'
            );
          }
        },

        bulkChangeCategory: async (cardIds: string[], category: string) => {
          set({ isLoading: true, error: null }, false, 'cards/bulkChangeCategory/start');

          try {
            const response = await fetch('/api/cards/bulk', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
              },
              body: JSON.stringify({
                operation: 'changeCategory',
                cardIds,
                data: { category },
              }),
            });

            if (!response.ok) {
              throw new Error('Failed to change category');
            }

            set({ isLoading: false }, false, 'cards/bulkChangeCategory/success');

            // Reload cards
            await get().loadCards();
          } catch (error: any) {
            console.error('Failed to change category:', error);
            set(
              {
                isLoading: false,
                error: error.message || 'Failed to change category',
              },
              false,
              'cards/bulkChangeCategory/error'
            );
          }
        },

        bulkChangeDeck: async (cardIds: string[], deckId: string | null) => {
          set({ isLoading: true, error: null }, false, 'cards/bulkChangeDeck/start');

          try {
            const response = await fetch('/api/cards/bulk', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
              },
              body: JSON.stringify({
                operation: 'changeDeck',
                cardIds,
                data: { deckId },
              }),
            });

            if (!response.ok) {
              throw new Error('Failed to change deck');
            }

            set({ isLoading: false }, false, 'cards/bulkChangeDeck/success');

            // Reload cards
            await get().loadCards();
          } catch (error: any) {
            console.error('Failed to change deck:', error);
            set(
              {
                isLoading: false,
                error: error.message || 'Failed to change deck',
              },
              false,
              'cards/bulkChangeDeck/error'
            );
          }
        },

        // =====================================================================
        // Card Operations
        // =====================================================================
        suspendCard: async (id: string) => {
          set({ isLoading: true, error: null }, false, 'cards/suspendCard/start');

          try {
            const response = await fetch(`/api/cards/${id}/suspend`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
              },
            });

            if (!response.ok) {
              throw new Error('Failed to suspend card');
            }

            const result = await response.json();

            // Update local state
            set(
              state => ({
                cards: state.cards.map(c => (c.id === id ? result.data : c)),
                isLoading: false,
              }),
              false,
              'cards/suspendCard/success'
            );
          } catch (error: any) {
            console.error('Failed to suspend card:', error);
            set(
              {
                isLoading: false,
                error: error.message || 'Failed to suspend card',
              },
              false,
              'cards/suspendCard/error'
            );
          }
        },

        resetCard: async (id: string) => {
          set({ isLoading: true, error: null }, false, 'cards/resetCard/start');

          try {
            const response = await fetch(`/api/cards/${id}/reset`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
              },
            });

            if (!response.ok) {
              throw new Error('Failed to reset card');
            }

            const result = await response.json();

            // Update local state
            set(
              state => ({
                cards: state.cards.map(c => (c.id === id ? result.data : c)),
                isLoading: false,
              }),
              false,
              'cards/resetCard/success'
            );
          } catch (error: any) {
            console.error('Failed to reset card:', error);
            set(
              {
                isLoading: false,
                error: error.message || 'Failed to reset card',
              },
              false,
              'cards/resetCard/error'
            );
          }
        },

        // =====================================================================
        // Filters and Search
        // =====================================================================
        setFilters: (filters: Partial<CardFilters>) => {
          set(
            state => ({
              filters: { ...state.filters, ...filters },
              page: 1, // Reset to first page
            }),
            false,
            'cards/setFilters'
          );

          // Reload cards with new filters
          get().loadCards();
        },

        clearFilters: () => {
          set({ filters: {}, page: 1 }, false, 'cards/clearFilters');
          get().loadCards();
        },

        setSearchQuery: (query: string) => {
          set({ searchQuery: query, page: 1 }, false, 'cards/setSearchQuery');

          // Debounced reload will be handled by the component
        },

        // =====================================================================
        // View Settings
        // =====================================================================
        setViewMode: (mode: ViewMode) => {
          set({ viewMode: mode }, false, 'cards/setViewMode');
        },

        setSortBy: (sortBy: SortBy) => {
          set({ sortBy, page: 1 }, false, 'cards/setSortBy');
          get().loadCards();
        },

        setSortOrder: (order: SortOrder) => {
          set({ sortOrder: order, page: 1 }, false, 'cards/setSortOrder');
          get().loadCards();
        },

        toggleSortOrder: () => {
          set(
            state => ({
              sortOrder: state.sortOrder === 'asc' ? 'desc' : 'asc',
              page: 1,
            }),
            false,
            'cards/toggleSortOrder'
          );
          get().loadCards();
        },

        // =====================================================================
        // Pagination
        // =====================================================================
        setPage: (page: number) => {
          set({ page }, false, 'cards/setPage');
          get().loadCards();
        },

        nextPage: () => {
          set(
            state => {
              if (state.page < state.totalPages) {
                return { page: state.page + 1 };
              }
              return state;
            },
            false,
            'cards/nextPage'
          );
          get().loadCards();
        },

        prevPage: () => {
          set(
            state => {
              if (state.page > 1) {
                return { page: state.page - 1 };
              }
              return state;
            },
            false,
            'cards/prevPage'
          );
          get().loadCards();
        },

        // =====================================================================
        // Deck Management
        // =====================================================================
        loadDecks: async () => {
          try {
            const response = await fetch('/api/decks', {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
              },
            });

            if (!response.ok) {
              throw new Error('Failed to load decks');
            }

            const result = await response.json();
            set({ decks: result.data }, false, 'cards/loadDecks/success');
          } catch (error: any) {
            console.error('Failed to load decks:', error);
          }
        },

        createDeck: async (deck: Partial<Deck>) => {
          set({ isLoading: true, error: null }, false, 'cards/createDeck/start');

          try {
            const response = await fetch('/api/decks', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
              },
              body: JSON.stringify(deck),
            });

            if (!response.ok) {
              throw new Error('Failed to create deck');
            }

            const result = await response.json();

            set({ isLoading: false }, false, 'cards/createDeck/success');

            // Reload decks
            await get().loadDecks();

            return result.data;
          } catch (error: any) {
            console.error('Failed to create deck:', error);
            set(
              {
                isLoading: false,
                error: error.message || 'Failed to create deck',
              },
              false,
              'cards/createDeck/error'
            );
            return null;
          }
        },

        updateDeck: async (id: string, updates: Partial<Deck>) => {
          set({ isLoading: true, error: null }, false, 'cards/updateDeck/start');

          try {
            const response = await fetch(`/api/decks/${id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
              },
              body: JSON.stringify(updates),
            });

            if (!response.ok) {
              throw new Error('Failed to update deck');
            }

            set({ isLoading: false }, false, 'cards/updateDeck/success');

            // Reload decks
            await get().loadDecks();
          } catch (error: any) {
            console.error('Failed to update deck:', error);
            set(
              {
                isLoading: false,
                error: error.message || 'Failed to update deck',
              },
              false,
              'cards/updateDeck/error'
            );
          }
        },

        deleteDeck: async (id: string, moveCardsTo?: string) => {
          set({ isLoading: true, error: null }, false, 'cards/deleteDeck/start');

          try {
            const url = moveCardsTo
              ? `/api/decks/${id}?moveCardsTo=${moveCardsTo}`
              : `/api/decks/${id}`;

            const response = await fetch(url, {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
              },
            });

            if (!response.ok) {
              throw new Error('Failed to delete deck');
            }

            set({ isLoading: false }, false, 'cards/deleteDeck/success');

            // Reload decks
            await get().loadDecks();
          } catch (error: any) {
            console.error('Failed to delete deck:', error);
            set(
              {
                isLoading: false,
                error: error.message || 'Failed to delete deck',
              },
              false,
              'cards/deleteDeck/error'
            );
          }
        },

        setCurrentDeck: (deck: Deck | null) => {
          set({ currentDeck: deck }, false, 'cards/setCurrentDeck');
        },

        // =====================================================================
        // Editor
        // =====================================================================
        setDraftCard: (card: Partial<Card> | null) => {
          set({ draftCard: card }, false, 'cards/setDraftCard');
        },

        saveDraft: () => {
          const { draftCard } = get();
          if (draftCard) {
            localStorage.setItem('card-draft', JSON.stringify(draftCard));
          }
        },

        clearDraft: () => {
          set({ draftCard: null }, false, 'cards/clearDraft');
          localStorage.removeItem('card-draft');
        },
      }),
      {
        name: 'card-management-storage',
        partialize: (state) => ({
          viewMode: state.viewMode,
          sortBy: state.sortBy,
          sortOrder: state.sortOrder,
          limit: state.limit,
          draftCard: state.draftCard,
        }),
      }
    ),
    {
      name: 'CardManagementStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

// =============================================================================
// Selectors
// =============================================================================

export const selectCards = (state: CardManagementState) => state.cards;
export const selectSelectedCards = (state: CardManagementState) => state.selectedCards;
export const selectFilters = (state: CardManagementState) => state.filters;
export const selectViewMode = (state: CardManagementState) => state.viewMode;
export const selectIsLoading = (state: CardManagementState) => state.isLoading;
export const selectDecks = (state: CardManagementState) => state.decks;
