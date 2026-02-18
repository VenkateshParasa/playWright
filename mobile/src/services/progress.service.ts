import api, { handleApiError } from './api';
import { Progress, ApiResponse } from '../types';

export const progressService = {
  /**
   * Get user progress
   */
  getProgress: async (): Promise<ApiResponse<Progress>> => {
    try {
      const response = await api.get('/progress');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get weekly progress
   */
  getWeeklyProgress: async (weeks: number = 4): Promise<ApiResponse<Progress>> => {
    try {
      const response = await api.get('/progress/weekly', { params: { weeks } });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get achievements
   */
  getAchievements: async (): Promise<ApiResponse<Progress['achievements']>> => {
    try {
      const response = await api.get('/progress/achievements');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Update streak
   */
  updateStreak: async (): Promise<ApiResponse<{ currentStreak: number }>> => {
    try {
      const response = await api.post('/progress/streak');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Log study session
   */
  logStudySession: async (duration: number): Promise<ApiResponse<void>> => {
    try {
      const response = await api.post('/progress/study-session', { duration });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
