import apiFetch from './client';
import type {
  RegisterData,
  LoginData,
  UpdateProfileData,
  ChangePasswordData,
  ForgotPasswordData,
  ResetPasswordData,
  AuthResponse,
  UserProfile,
} from '../types/auth';

/**
 * Register a new user
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  return apiFetch<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * Login user
 */
export const login = async (data: LoginData): Promise<AuthResponse> => {
  return apiFetch<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * Logout user
 */
export const logout = async (): Promise<{ success: boolean; message: string }> => {
  return apiFetch('/api/auth/logout', {
    method: 'POST',
  });
};

/**
 * Get current user profile
 */
export const getProfile = async (): Promise<{ success: boolean; user: UserProfile }> => {
  return apiFetch('/api/auth/profile', {
    method: 'GET',
  });
};

/**
 * Update user profile
 */
export const updateProfile = async (
  data: UpdateProfileData
): Promise<{ success: boolean; message: string; user: UserProfile }> => {
  return apiFetch('/api/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

/**
 * Change password
 */
export const changePassword = async (
  data: ChangePasswordData
): Promise<{ success: boolean; message: string }> => {
  return apiFetch('/api/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * Request password reset
 */
export const forgotPassword = async (
  data: ForgotPasswordData
): Promise<{ success: boolean; message: string }> => {
  return apiFetch('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * Reset password with token
 */
export const resetPassword = async (
  data: ResetPasswordData
): Promise<{ success: boolean; message: string }> => {
  return apiFetch('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * Verify email with token
 */
export const verifyEmail = async (
  token: string
): Promise<{ success: boolean; message: string }> => {
  return apiFetch('/api/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
};

/**
 * Refresh access token
 */
export const refreshToken = async (): Promise<{
  success: boolean;
  accessToken: string;
}> => {
  return apiFetch('/api/auth/refresh-token', {
    method: 'POST',
  });
};
