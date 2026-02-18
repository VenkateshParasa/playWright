import api, { handleApiError } from './api';
import { Flashcard, ApiResponse } from '../types';

export const flashcardService = {
  /**
   * Get all flashcards
   */
  getFlashcards: async (params?: {
    category?: string;
    difficulty?: string;
  }): Promise<ApiResponse<Flashcard[]>> => {
    try {
      const response = await api.get('/flashcards', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get flashcards due for review
   */
  getDueFlashcards: async (): Promise<ApiResponse<Flashcard[]>> => {
    try {
      const response = await api.get('/flashcards/due');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Review flashcard
   */
  reviewFlashcard: async (
    id: string,
    quality: 'again' | 'hard' | 'good' | 'easy'
  ): Promise<ApiResponse<Flashcard>> => {
    try {
      const response = await api.post(`/flashcards/${id}/review`, { quality });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get flashcard statistics
   */
  getStats: async (): Promise<
    ApiResponse<{
      totalCards: number;
      reviewedToday: number;
      dueToday: number;
      masteredCards: number;
    }>
  > => {
    try {
      const response = await api.get('/flashcards/stats');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Create custom flashcard
   */
  createFlashcard: async (data: {
    front: string;
    back: string;
    category: string;
  }): Promise<ApiResponse<Flashcard>> => {
    try {
      const response = await api.post('/flashcards', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Update flashcard
   */
  updateFlashcard: async (
    id: string,
    data: Partial<Flashcard>
  ): Promise<ApiResponse<Flashcard>> => {
    try {
      const response = await api.put(`/flashcards/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Delete flashcard
   */
  deleteFlashcard: async (id: string): Promise<ApiResponse<void>> => {
    try {
      const response = await api.delete(`/flashcards/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
