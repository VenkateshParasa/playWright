import api, { handleApiError } from './api';
import { Quiz, QuizAttempt, Answer, ApiResponse } from '../types';

export const quizService = {
  /**
   * Get all quizzes
   */
  getQuizzes: async (params?: {
    category?: string;
    difficulty?: string;
  }): Promise<ApiResponse<Quiz[]>> => {
    try {
      const response = await api.get('/quizzes', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get quiz by ID
   */
  getQuizById: async (id: string): Promise<ApiResponse<Quiz>> => {
    try {
      const response = await api.get(`/quizzes/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Start quiz attempt
   */
  startQuiz: async (id: string): Promise<ApiResponse<QuizAttempt>> => {
    try {
      const response = await api.post(`/quizzes/${id}/start`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Submit quiz answer
   */
  submitAnswer: async (
    attemptId: string,
    questionId: string,
    answer: string | string[]
  ): Promise<ApiResponse<void>> => {
    try {
      const response = await api.post(`/quizzes/attempts/${attemptId}/answer`, {
        questionId,
        answer,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Complete quiz attempt
   */
  completeQuiz: async (
    attemptId: string,
    answers: Answer[]
  ): Promise<ApiResponse<QuizAttempt>> => {
    try {
      const response = await api.post(`/quizzes/attempts/${attemptId}/complete`, {
        answers,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get quiz attempt
   */
  getAttempt: async (attemptId: string): Promise<ApiResponse<QuizAttempt>> => {
    try {
      const response = await api.get(`/quizzes/attempts/${attemptId}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get user's quiz attempts
   */
  getUserAttempts: async (quizId?: string): Promise<ApiResponse<QuizAttempt[]>> => {
    try {
      const params = quizId ? { quizId } : undefined;
      const response = await api.get('/quizzes/attempts', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
