import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG, STORAGE_KEYS } from '../constants';
import { storage } from '../utils/storage';
import { Store } from '@reduxjs/toolkit';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
let accessToken: string | null = null;
let refreshToken: string | null = null;

export const setTokens = (access: string, refresh: string) => {
  accessToken = access;
  refreshToken = refresh;
};

export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
};

export const getAccessToken = () => accessToken;

// Setup interceptors
export const setupInterceptors = (store: Store) => {
  // Request interceptor
  api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      // Get token from storage if not in memory
      if (!accessToken) {
        accessToken = await storage.get<string>(STORAGE_KEYS.AUTH_TOKEN);
      }

      // Add token to headers
      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      // Handle 401 errors (unauthorized)
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Get refresh token
          if (!refreshToken) {
            refreshToken = await storage.get<string>(STORAGE_KEYS.REFRESH_TOKEN);
          }

          if (refreshToken) {
            // Try to refresh token
            const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/refresh`, {
              refreshToken,
            });

            const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
              response.data.data;

            // Update tokens
            setTokens(newAccessToken, newRefreshToken);
            await storage.set(STORAGE_KEYS.AUTH_TOKEN, newAccessToken);
            await storage.set(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);

            // Retry original request with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }
            return api(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, logout user
          clearTokens();
          await storage.remove(STORAGE_KEYS.AUTH_TOKEN);
          await storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
          await storage.remove(STORAGE_KEYS.USER_DATA);

          // Dispatch logout action
          store.dispatch({ type: 'auth/logout' });

          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};

// Error handler
export const handleApiError = (error: any): string => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      // Server responded with error
      return error.response.data?.message || error.response.data?.error || 'Server error';
    } else if (error.request) {
      // Request made but no response
      return 'Network error. Please check your connection.';
    }
  }
  return error.message || 'An unexpected error occurred';
};

export default api;
