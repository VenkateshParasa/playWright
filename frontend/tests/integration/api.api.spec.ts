import { test, expect } from '@playwright/test';

/**
 * API Integration Tests
 * Tests backend API endpoints directly
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

test.describe('API Integration Tests', () => {
  let authToken: string;

  test.beforeAll(async ({ request }) => {
    // Login to get auth token
    const response = await request.post(`${API_BASE_URL}/api/auth/login`, {
      data: {
        email: 'student@test.com',
        password: 'Test123!@#',
      },
    });

    const data = await response.json();
    authToken = data.token;
  });

  test.describe('Authentication API', () => {
    test('POST /api/auth/register - should register new user', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/api/auth/register`, {
        data: {
          firstName: 'Test',
          lastName: 'User',
          email: `test-${Date.now()}@test.com`,
          password: 'Test123!@#',
        },
      });

      expect(response.status()).toBe(201);

      const data = await response.json();
      expect(data).toHaveProperty('token');
      expect(data).toHaveProperty('user');
    });

    test('POST /api/auth/login - should login with valid credentials', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/api/auth/login`, {
        data: {
          email: 'student@test.com',
          password: 'Test123!@#',
        },
      });

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('token');
      expect(data.user.email).toBe('student@test.com');
    });

    test('POST /api/auth/login - should reject invalid credentials', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/api/auth/login`, {
        data: {
          email: 'student@test.com',
          password: 'wrongpassword',
        },
      });

      expect(response.status()).toBe(401);
    });

    test('POST /api/auth/logout - should logout user', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/api/auth/logout`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);
    });

    test('POST /api/auth/forgot-password - should send reset email', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/api/auth/forgot-password`, {
        data: {
          email: 'student@test.com',
        },
      });

      expect(response.status()).toBe(200);
    });

    test('GET /api/auth/me - should return current user', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('email');
    });

    test('GET /api/auth/me - should reject without token', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/auth/me`);
      expect(response.status()).toBe(401);
    });
  });

  test.describe('Lessons API', () => {
    test('GET /api/lessons - should return all lessons', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/lessons`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });

    test('GET /api/lessons/:id - should return lesson by ID', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/lessons/lesson-1`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('title');
    });

    test('GET /api/lessons/:id - should return 404 for invalid ID', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/lessons/invalid-id`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(404);
    });

    test('POST /api/lessons/:id/complete - should mark lesson as complete', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/api/lessons/lesson-1/complete`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data.completed).toBe(true);
    });

    test('GET /api/lessons/search - should search lessons', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/lessons/search?q=playwright`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  test.describe('Quiz API', () => {
    test('GET /api/quizzes - should return all quizzes', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/quizzes`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });

    test('GET /api/quizzes/:id - should return quiz by ID', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/quizzes/quiz-1`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('questions');
    });

    test('POST /api/quizzes/:id/submit - should submit quiz answers', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/api/quizzes/quiz-1/submit`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        data: {
          answers: {
            q1: { answer: 'o1', timeSpent: 30 },
            q2: { answer: true, timeSpent: 20 },
          },
        },
      });

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('score');
      expect(data).toHaveProperty('percentage');
      expect(data).toHaveProperty('passed');
    });

    test('GET /api/quizzes/history - should return quiz history', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/quizzes/history`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  test.describe('Flashcards API', () => {
    test('GET /api/flashcards - should return all flashcards', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/flashcards`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });

    test('GET /api/flashcards/due - should return due cards', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/flashcards/due`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });

    test('POST /api/flashcards/:id/review - should submit card review', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/api/flashcards/card-1/review`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        data: {
          quality: 4,
          timeSpent: 15,
        },
      });

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('nextReviewDate');
    });

    test('POST /api/flashcards - should create new card', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/api/flashcards`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        data: {
          front: 'Test Question',
          back: 'Test Answer',
          category: 'Test',
          tags: ['test'],
          difficulty: 'easy',
        },
      });

      expect(response.status()).toBe(201);

      const data = await response.json();
      expect(data).toHaveProperty('id');
    });

    test('PUT /api/flashcards/:id - should update card', async ({ request }) => {
      const response = await request.put(`${API_BASE_URL}/api/flashcards/card-1`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        data: {
          front: 'Updated Question',
          back: 'Updated Answer',
        },
      });

      expect(response.status()).toBe(200);
    });

    test('DELETE /api/flashcards/:id - should delete card', async ({ request }) => {
      // Create a card first
      const createResponse = await request.post(`${API_BASE_URL}/api/flashcards`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        data: {
          front: 'Delete Me',
          back: 'Delete Answer',
          category: 'Test',
          tags: [],
          difficulty: 'easy',
        },
      });

      const { id } = await createResponse.json();

      // Delete it
      const response = await request.delete(`${API_BASE_URL}/api/flashcards/${id}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);
    });
  });

  test.describe('Progress API', () => {
    test('GET /api/progress - should return user progress', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/progress`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('lessonsCompleted');
      expect(data).toHaveProperty('quizzesCompleted');
      expect(data).toHaveProperty('totalStudyTime');
    });

    test('GET /api/progress/stats - should return progress statistics', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/progress/stats`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('completionRate');
    });

    test('GET /api/progress/streak - should return current streak', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/progress/streak`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('current');
      expect(data).toHaveProperty('longest');
    });
  });

  test.describe('Error Handling', () => {
    test('should handle 404 errors', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/nonexistent`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(404);
    });

    test('should handle 500 errors gracefully', async ({ request }) => {
      // This would need a specific endpoint that triggers a 500 error
      // For testing purposes only
    });

    test('should validate request body', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/api/flashcards`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        data: {
          // Missing required fields
          front: 'Test',
        },
      });

      expect(response.status()).toBe(400);
    });

    test('should rate limit requests', async ({ request }) => {
      // Send many requests quickly
      const requests = Array(100).fill(null).map(() =>
        request.get(`${API_BASE_URL}/api/lessons`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        })
      );

      const responses = await Promise.all(requests);

      // Some should be rate limited
      const rateLimited = responses.filter(r => r.status() === 429);
      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });

  test.describe('File Upload', () => {
    test('POST /api/upload - should upload file', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/api/upload`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        multipart: {
          file: {
            name: 'test.txt',
            mimeType: 'text/plain',
            buffer: Buffer.from('test content'),
          },
        },
      });

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('url');
    });

    test('POST /api/upload - should validate file type', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/api/upload`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        multipart: {
          file: {
            name: 'test.exe',
            mimeType: 'application/x-msdownload',
            buffer: Buffer.from('malicious content'),
          },
        },
      });

      expect(response.status()).toBe(400);
    });

    test('POST /api/upload - should validate file size', async ({ request }) => {
      // Create large buffer (> max size)
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB

      const response = await request.post(`${API_BASE_URL}/api/upload`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        multipart: {
          file: {
            name: 'large.txt',
            mimeType: 'text/plain',
            buffer: largeBuffer,
          },
        },
      });

      expect(response.status()).toBe(400);
    });
  });
});
