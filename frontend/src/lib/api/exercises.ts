import apiFetch from './client';
import { Exercise, TestResult } from '@/types/exercise';

/**
 * API response types
 */
interface ExercisesResponse {
  success: boolean;
  exercises: Exercise[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface ExerciseResponse {
  success: boolean;
  exercise: Exercise;
}

interface SubmitSolutionResponse {
  success: boolean;
  result: {
    allTestsPassed: boolean;
    score: number;
    testResults: TestResult[];
    hiddenTestCount: number;
    executionTime: number;
    logs?: string[];
    error?: string;
  };
}

interface CategoryResponse {
  success: boolean;
  categories: Array<{
    name: string;
    count: number;
    difficulties: string[];
  }>;
}

/**
 * Query parameters for fetching exercises
 */
export interface ExerciseQueryParams {
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  category?: string;
  language?: 'typescript' | 'javascript' | 'java';
  tags?: string | string[];
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Fetch all exercises with optional filters
 */
export async function getAllExercises(
  params?: ExerciseQueryParams
): Promise<ExercisesResponse> {
  const queryParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          queryParams.append(key, value.join(','));
        } else {
          queryParams.append(key, String(value));
        }
      }
    });
  }

  const queryString = queryParams.toString();
  const endpoint = `/api/exercises${queryString ? `?${queryString}` : ''}`;

  return apiFetch<ExercisesResponse>(endpoint);
}

/**
 * Fetch a specific exercise by ID
 */
export async function getExerciseById(id: string): Promise<Exercise> {
  const response = await apiFetch<ExerciseResponse>(`/api/exercises/${id}`);
  return response.exercise;
}

/**
 * Fetch exercises by category
 */
export async function getExercisesByCategory(
  category: string,
  page: number = 1,
  limit: number = 20
): Promise<ExercisesResponse> {
  return apiFetch<ExercisesResponse>(
    `/api/exercises/category/${category}?page=${page}&limit=${limit}`
  );
}

/**
 * Fetch exercises by difficulty
 */
export async function getExercisesByDifficulty(
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  page: number = 1,
  limit: number = 20
): Promise<ExercisesResponse> {
  return apiFetch<ExercisesResponse>(
    `/api/exercises/difficulty/${difficulty}?page=${page}&limit=${limit}`
  );
}

/**
 * Submit exercise solution for validation
 */
export async function submitExerciseSolution(
  id: string,
  code: string
): Promise<SubmitSolutionResponse> {
  return apiFetch<SubmitSolutionResponse>(`/api/exercises/${id}/submit`, {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

/**
 * Get all exercise categories
 */
export async function getExerciseCategories(): Promise<CategoryResponse> {
  return apiFetch<CategoryResponse>('/api/exercises/categories');
}

/**
 * Get exercise statistics
 */
export async function getExerciseStats(id: string): Promise<{
  success: boolean;
  stats: {
    viewCount: number;
    completionCount: number;
    attemptCount: number;
    averageScore: number;
    completionRate: number;
  };
}> {
  return apiFetch(`/api/exercises/${id}/stats`);
}
