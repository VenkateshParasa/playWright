import { apiClient } from './client';
import {
  User,
  UserWithProgress,
  UserStats,
  Activity,
  Role,
  BulkOperation,
} from '../types/admin';

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
  startDate?: string;
  endDate?: string;
}

export interface GetUsersResponse {
  success: boolean;
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Get all users with pagination and filters
 */
export async function getUsers(params: GetUsersParams): Promise<GetUsersResponse> {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value));
    }
  });

  const response = await apiClient.get(`/admin/users?${queryParams.toString()}`);
  return response.data;
}

/**
 * Get user by ID with full details
 */
export async function getUserById(id: string): Promise<UserWithProgress> {
  const response = await apiClient.get(`/admin/users/${id}`);
  return response.data.data;
}

/**
 * Update user
 */
export async function updateUser(
  id: string,
  updates: Partial<User>
): Promise<User> {
  const response = await apiClient.put(`/admin/users/${id}`, updates);
  return response.data.data;
}

/**
 * Delete user
 */
export async function deleteUser(
  id: string,
  hardDelete: boolean = false
): Promise<void> {
  await apiClient.delete(`/admin/users/${id}?hardDelete=${hardDelete}`);
}

/**
 * Suspend user
 */
export async function suspendUser(id: string, reason: string): Promise<User> {
  const response = await apiClient.post(`/admin/users/${id}/suspend`, {
    reason,
  });
  return response.data.data;
}

/**
 * Activate user
 */
export async function activateUser(id: string): Promise<User> {
  const response = await apiClient.post(`/admin/users/${id}/activate`);
  return response.data.data;
}

/**
 * Reset user password
 */
export async function resetUserPassword(
  id: string,
  sendEmail: boolean = true
): Promise<{ tempPassword?: string; emailSent: boolean }> {
  const response = await apiClient.post(`/admin/users/${id}/reset-password`, {
    sendEmail,
  });
  return response.data.data;
}

/**
 * Get user statistics
 */
export async function getUserStats(): Promise<UserStats> {
  const response = await apiClient.get('/admin/users/stats');
  return response.data.data;
}

/**
 * Bulk operations on users
 */
export async function bulkUserOperations(
  operation: BulkOperation
): Promise<{ modifiedCount?: number; data?: User[] }> {
  const response = await apiClient.post('/admin/users/bulk', operation);
  return response.data.data || {};
}

/**
 * Get user activity timeline
 */
export async function getUserActivity(
  id: string,
  limit: number = 50
): Promise<Activity[]> {
  const response = await apiClient.get(
    `/admin/users/${id}/activity?limit=${limit}`
  );
  return response.data.data;
}

/**
 * Get all roles
 */
export async function getRoles(): Promise<Role[]> {
  const response = await apiClient.get('/admin/roles');
  return response.data.data;
}

/**
 * Get role by name
 */
export async function getRoleByName(name: string): Promise<Role> {
  const response = await apiClient.get(`/admin/roles/${name}`);
  return response.data.data;
}

/**
 * Export users to CSV
 */
export async function exportUsersToCSV(userIds?: string[]): Promise<Blob> {
  const operation: BulkOperation = {
    operation: 'export',
    userIds: userIds || [],
  };

  const response = await bulkUserOperations(operation);

  if (!response.data) {
    throw new Error('No data to export');
  }

  // Convert to CSV
  const users = response.data;
  const headers = [
    'ID',
    'Email',
    'First Name',
    'Last Name',
    'Role',
    'Status',
    'Email Verified',
    'Last Login',
    'Created At',
  ];

  const rows = users.map((user: User) => [
    user.id,
    user.email,
    user.firstName,
    user.lastName,
    user.role,
    user.status,
    user.isEmailVerified ? 'Yes' : 'No',
    user.lastLogin || 'Never',
    user.createdAt,
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');

  return new Blob([csv], { type: 'text/csv' });
}

/**
 * Export users to JSON
 */
export async function exportUsersToJSON(userIds?: string[]): Promise<Blob> {
  const operation: BulkOperation = {
    operation: 'export',
    userIds: userIds || [],
  };

  const response = await bulkUserOperations(operation);

  if (!response.data) {
    throw new Error('No data to export');
  }

  const json = JSON.stringify(response.data, null, 2);
  return new Blob([json], { type: 'application/json' });
}
