import api, { handleApiError } from './api';
import { Lesson, ApiResponse, PaginatedResponse } from '../types';

export const lessonService = {
  /**
   * Get all lessons
   */
  getLessons: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    difficulty?: string;
    search?: string;
  }): Promise<ApiResponse<PaginatedResponse<Lesson>>> => {
    try {
      const response = await api.get('/lessons', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get lesson by ID
   */
  getLessonById: async (id: string): Promise<ApiResponse<Lesson>> => {
    try {
      const response = await api.get(`/lessons/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Mark lesson as completed
   */
  completeLesson: async (id: string): Promise<ApiResponse<void>> => {
    try {
      const response = await api.post(`/lessons/${id}/complete`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Update lesson progress
   */
  updateProgress: async (id: string, progress: number): Promise<ApiResponse<void>> => {
    try {
      const response = await api.put(`/lessons/${id}/progress`, { progress });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Download lesson for offline access
   */
  downloadLesson: async (id: string): Promise<Blob> => {
    try {
      const response = await api.get(`/lessons/${id}/download`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get lesson categories
   */
  getCategories: async (): Promise<ApiResponse<string[]>> => {
    try {
      const response = await api.get('/lessons/categories');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get recommended lessons
   */
  getRecommendedLessons: async (): Promise<ApiResponse<Lesson[]>> => {
    try {
      const response = await api.get('/lessons/recommended');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
