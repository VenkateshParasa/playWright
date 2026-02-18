# API Reference - Playwright & Selenium Learning Platform

**Version:** 1.0.0
**Base URL:** `https://api.playwright-selenium-learning.com/api`
**Development URL:** `http://localhost:3000/api`
**Last Updated:** February 17, 2025

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Auth Endpoints](#auth-endpoints)
- [Progress Endpoints](#progress-endpoints)
- [Card/Flashcard Endpoints](#cardflashcard-endpoints)
- [Achievements Endpoints](#achievements-endpoints)
- [Notifications Endpoints](#notifications-endpoints)
- [Search Endpoints](#search-endpoints)
- [Settings Endpoints](#settings-endpoints)
- [Schedule Endpoints](#schedule-endpoints)
- [Admin Endpoints](#admin-endpoints)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Versioning](#versioning)

---

## Overview

The API follows RESTful principles and returns JSON responses. All dates are in ISO 8601 format. All authenticated endpoints require a valid JWT token.

### Base Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

### Authentication

Include JWT token in request headers:

```http
Authorization: Bearer <your_jwt_token>
```

Or token is automatically sent via HttpOnly cookie.

---

## Auth Endpoints

### Register User

Create a new user account.

**Endpoint:** `POST /auth/register`
**Authentication:** None
**Rate Limit:** 5 requests per 15 minutes per IP

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Validation Rules:**
- `email`: Valid email format, unique
- `password`: Minimum 8 characters
- `firstName`: Required, minimum 1 character
- `lastName`: Required, minimum 1 character

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123abc",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "createdAt": "2025-02-17T10:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Registration successful. Please verify your email."
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors
- `409 Conflict`: Email already exists
- `500 Internal Server Error`: Server error

---

### Login

Authenticate and receive JWT token.

**Endpoint:** `POST /auth/login`
**Authentication:** None
**Rate Limit:** 5 requests per 15 minutes per IP

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123abc",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "avatar": "https://example.com/avatar.jpg"
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "refresh_token_here"
  },
  "message": "Login successful"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid email/password format
- `401 Unauthorized`: Invalid credentials
- `429 Too Many Requests`: Rate limit exceeded

---

### Logout

Invalidate current session.

**Endpoint:** `POST /auth/logout`
**Authentication:** None (clears client-side token)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### Get Profile

Get current user's profile.

**Endpoint:** `GET /auth/profile`
**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "user_123abc",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "https://example.com/avatar.jpg",
    "role": "user",
    "preferences": {
      "theme": "dark",
      "language": "en",
      "dailyGoal": 60
    },
    "createdAt": "2025-01-01T00:00:00Z",
    "lastLoginAt": "2025-02-17T10:00:00Z"
  }
}
```

---

### Update Profile

Update user profile information.

**Endpoint:** `PUT /auth/profile`
**Authentication:** Required

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "avatar": "https://example.com/new-avatar.jpg",
  "bio": "Learning Playwright and Selenium!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "user_123abc",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "https://example.com/new-avatar.jpg",
    "bio": "Learning Playwright and Selenium!"
  },
  "message": "Profile updated successfully"
}
```

---

### Change Password

Change user password.

**Endpoint:** `POST /auth/change-password`
**Authentication:** Required

**Request Body:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword456!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Current password incorrect
- `500 Internal Server Error`: Server error

---

### Forgot Password

Request password reset email.

**Endpoint:** `POST /auth/forgot-password`
**Authentication:** None
**Rate Limit:** 3 requests per hour per IP

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "If the email exists, a password reset link has been sent"
}
```

---

### Reset Password

Reset password using token from email.

**Endpoint:** `POST /auth/reset-password`
**Authentication:** None

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "NewSecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset successful. You can now login with your new password."
}
```

**Error Responses:**
- `400 Bad Request`: Token invalid or expired
- `500 Internal Server Error`: Server error

---

### Verify Email

Verify email address using token.

**Endpoint:** `POST /auth/verify-email`
**Authentication:** None

**Request Body:**
```json
{
  "token": "verification_token_from_email"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

### Refresh Token

Get new access token using refresh token.

**Endpoint:** `POST /auth/refresh-token`
**Authentication:** None (requires refresh token)

**Request Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "new_access_token",
    "refreshToken": "new_refresh_token"
  }
}
```

---

## Progress Endpoints

### Get Progress Statistics

Get comprehensive progress statistics.

**Endpoint:** `GET /progress`
**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "overall": {
      "completionPercentage": 45.5,
      "lessonsCompleted": 25,
      "lessonsTotal": 55,
      "quizzesPassed": 10,
      "quizzesTotal": 15,
      "exercisesSolved": 18,
      "exercisesTotal": 30,
      "cardsReviewed": 250,
      "cardsMastered": 120
    },
    "streak": {
      "current": 7,
      "longest": 14,
      "lastActivity": "2025-02-17T09:30:00Z"
    },
    "studyTime": {
      "total": 18000,
      "today": 3600,
      "thisWeek": 10800,
      "average": 1800
    }
  }
}
```

---

### Get Overall Progress

Get high-level progress summary.

**Endpoint:** `GET /progress/overall`
**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "completionPercentage": 45.5,
    "lessonsCompleted": 25,
    "lessonsTotal": 55,
    "quizzesPassed": 10,
    "exercisesSolved": 18,
    "cardsReviewed": 250,
    "lastActivity": "2025-02-17T09:30:00Z"
  }
}
```

---

### Get Module Progress

Get progress by module/week.

**Endpoint:** `GET /progress/modules`
**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "modules": [
      {
        "id": "week-1",
        "name": "Week 1: Foundations",
        "lessonsCompleted": 7,
        "lessonsTotal": 7,
        "quizScore": 85,
        "exercisesSolved": 5,
        "exercisesTotal": 5,
        "completionPercentage": 100,
        "status": "completed"
      },
      {
        "id": "week-2",
        "name": "Week 2: Intermediate Skills",
        "lessonsCompleted": 5,
        "lessonsTotal": 7,
        "quizScore": 75,
        "exercisesSolved": 3,
        "exercisesTotal": 5,
        "completionPercentage": 71.4,
        "status": "in_progress"
      }
    ]
  }
}
```

---

### Get Daily Progress

Get daily progress statistics.

**Endpoint:** `GET /progress/daily`
**Authentication:** Required
**Query Parameters:**
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string

**Example:** `GET /progress/daily?startDate=2025-02-10&endDate=2025-02-17`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "daily": [
      {
        "date": "2025-02-17",
        "lessonsCompleted": 2,
        "cardsReviewed": 50,
        "exercisesSolved": 1,
        "studyTime": 3600,
        "streak": true
      },
      {
        "date": "2025-02-16",
        "lessonsCompleted": 3,
        "cardsReviewed": 40,
        "exercisesSolved": 2,
        "studyTime": 5400,
        "streak": true
      }
    ]
  }
}
```

---

### Sync Progress

Sync local progress with server.

**Endpoint:** `POST /progress/sync`
**Authentication:** Required

**Request Body:**
```json
{
  "lessons": [
    {
      "id": "lesson_1",
      "completed": true,
      "completedAt": "2025-02-17T09:00:00Z",
      "timeSpent": 1800
    }
  ],
  "flashcards": [
    {
      "id": "card_1",
      "quality": 5,
      "reviewedAt": "2025-02-17T09:30:00Z",
      "timeSpent": 30
    }
  ],
  "streak": {
    "current": 7,
    "lastActivity": "2025-02-17T09:30:00Z"
  },
  "studyTime": {
    "total": 3600,
    "sessions": [
      {
        "startTime": "2025-02-17T09:00:00Z",
        "endTime": "2025-02-17T10:00:00Z",
        "activity": "lesson"
      }
    ]
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "synced": {
      "lessons": 1,
      "flashcards": 1,
      "streak": true
    },
    "conflicts": []
  },
  "message": "Progress synced successfully"
}
```

---

## Card/Flashcard Endpoints

### List Cards

Get list of flashcards with filters.

**Endpoint:** `GET /cards`
**Authentication:** Required
**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)
- `category` (optional): Filter by category (playwright, selenium, general)
- `status` (optional): Filter by status (new, learning, review, mastered)
- `due` (optional): Filter by due date (overdue, today, week)
- `search` (optional): Search query

**Example:** `GET /cards?category=playwright&status=review&due=today&page=1&limit=20`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "cards": [
      {
        "id": "card_123",
        "front": "What is a selector in Playwright?",
        "back": "A selector is a way to identify elements on a page...",
        "category": "playwright",
        "tags": ["basics", "selectors"],
        "easeFactor": 2.5,
        "interval": 7,
        "repetitions": 3,
        "nextReview": "2025-02-17T00:00:00Z",
        "lastReviewed": "2025-02-10T10:30:00Z",
        "status": "review",
        "successRate": 85,
        "totalReviews": 10
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

---

### Get Single Card

Get details of a specific card.

**Endpoint:** `GET /cards/:id`
**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "card_123",
    "front": "What is a selector in Playwright?",
    "back": "A selector is a way to identify elements on a page...",
    "category": "playwright",
    "tags": ["basics", "selectors"],
    "easeFactor": 2.5,
    "interval": 7,
    "repetitions": 3,
    "nextReview": "2025-02-17T00:00:00Z",
    "lastReviewed": "2025-02-10T10:30:00Z",
    "reviewHistory": [
      {
        "date": "2025-02-10T10:30:00Z",
        "quality": 4,
        "timeSpent": 25
      }
    ],
    "relatedCards": ["card_124", "card_125"]
  }
}
```

---

### Create Card

Create a new flashcard.

**Endpoint:** `POST /cards`
**Authentication:** Required

**Request Body:**
```json
{
  "front": "What is Page Object Model?",
  "back": "POM is a design pattern that creates an object repository...",
  "category": "general",
  "tags": ["design-patterns", "best-practices"],
  "deckId": "deck_456"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "card_789",
    "front": "What is Page Object Model?",
    "back": "POM is a design pattern that creates an object repository...",
    "category": "general",
    "tags": ["design-patterns", "best-practices"],
    "deckId": "deck_456",
    "easeFactor": 2.5,
    "interval": 0,
    "repetitions": 0,
    "nextReview": "2025-02-17T00:00:00Z",
    "createdAt": "2025-02-17T10:00:00Z"
  },
  "message": "Card created successfully"
}
```

---

### Update Card

Update an existing card.

**Endpoint:** `PUT /cards/:id`
**Authentication:** Required

**Request Body:**
```json
{
  "front": "Updated question",
  "back": "Updated answer",
  "tags": ["new-tag"]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "card_123",
    "front": "Updated question",
    "back": "Updated answer",
    "tags": ["new-tag"],
    "updatedAt": "2025-02-17T10:00:00Z"
  },
  "message": "Card updated successfully"
}
```

---

### Delete Card

Delete a card.

**Endpoint:** `DELETE /cards/:id`
**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Card deleted successfully"
}
```

---

### Bulk Operations

Perform bulk operations on multiple cards.

**Endpoint:** `POST /cards/bulk`
**Authentication:** Required

**Request Body:**
```json
{
  "operation": "suspend",
  "cardIds": ["card_1", "card_2", "card_3"]
}
```

**Operations:** `suspend`, `unsuspend`, `reset`, `delete`, `move_to_deck`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "processed": 3,
    "successful": 3,
    "failed": 0
  },
  "message": "Bulk operation completed"
}
```

---

### Suspend Card

Suspend a card from reviews.

**Endpoint:** `POST /cards/:id/suspend`
**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "card_123",
    "suspended": true
  },
  "message": "Card suspended"
}
```

---

### Reset Card Progress

Reset card to initial state.

**Endpoint:** `POST /cards/:id/reset`
**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "card_123",
    "easeFactor": 2.5,
    "interval": 0,
    "repetitions": 0,
    "nextReview": "2025-02-17T00:00:00Z"
  },
  "message": "Card progress reset"
}
```

---

### Get Card Statistics

Get detailed statistics for a card.

**Endpoint:** `GET /cards/:id/stats`
**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalReviews": 15,
    "successRate": 87,
    "averageQuality": 4.2,
    "averageTimeSpent": 28,
    "retentionRate": 90,
    "reviewHistory": [
      {
        "date": "2025-02-17",
        "quality": 5,
        "timeSpent": 20
      }
    ],
    "qualityDistribution": {
      "0": 0,
      "1": 1,
      "2": 0,
      "3": 2,
      "4": 5,
      "5": 7
    }
  }
}
```

---

### Import Cards

Import cards from JSON or CSV.

**Endpoint:** `POST /cards/import`
**Authentication:** Required
**Content-Type:** `multipart/form-data`

**Request Body (multipart):**
- `file`: File to import (JSON or CSV)
- `deckId`: Target deck ID
- `overwrite`: Whether to overwrite existing cards

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "imported": 50,
    "skipped": 5,
    "errors": []
  },
  "message": "Cards imported successfully"
}
```

---

### Export Cards

Export cards to JSON or CSV.

**Endpoint:** `GET /cards/export`
**Authentication:** Required
**Query Parameters:**
- `format`: Export format (json, csv)
- `deckId` (optional): Specific deck to export
- `category` (optional): Filter by category

**Example:** `GET /cards/export?format=json&category=playwright`

**Response (200 OK):**
Returns file download with appropriate Content-Type and Content-Disposition headers.

---

### List Decks

Get list of card decks.

**Endpoint:** `GET /decks`
**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "decks": [
      {
        "id": "deck_1",
        "name": "Playwright Basics",
        "description": "Fundamental Playwright concepts",
        "cardCount": 50,
        "category": "playwright",
        "createdAt": "2025-01-01T00:00:00Z"
      }
    ]
  }
}
```

---

### Create Deck

Create a new deck.

**Endpoint:** `POST /decks`
**Authentication:** Required

**Request Body:**
```json
{
  "name": "Advanced Playwright",
  "description": "Advanced Playwright techniques",
  "category": "playwright"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "deck_2",
    "name": "Advanced Playwright",
    "description": "Advanced Playwright techniques",
    "category": "playwright",
    "cardCount": 0,
    "createdAt": "2025-02-17T10:00:00Z"
  },
  "message": "Deck created successfully"
}
```

---

## Achievements Endpoints

### Get Achievements

Get all achievements and user's progress.

**Endpoint:** `GET /achievements`
**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "achievements": [
      {
        "id": "first_lesson",
        "name": "First Steps",
        "description": "Complete your first lesson",
        "icon": "🎯",
        "category": "lessons",
        "unlocked": true,
        "unlockedAt": "2025-02-01T10:00:00Z",
        "progress": 1,
        "requirement": 1
      },
      {
        "id": "streak_7",
        "name": "Week Warrior",
        "description": "Maintain a 7-day streak",
        "icon": "🔥",
        "category": "streak",
        "unlocked": true,
        "unlockedAt": "2025-02-17T00:00:00Z",
        "progress": 7,
        "requirement": 7
      },
      {
        "id": "cards_100",
        "name": "Card Master",
        "description": "Review 100 flashcards",
        "icon": "📚",
        "category": "flashcards",
        "unlocked": false,
        "progress": 75,
        "requirement": 100
      }
    ],
    "stats": {
      "totalAchievements": 50,
      "unlockedAchievements": 15,
      "completionPercentage": 30,
      "points": 1250
    }
  }
}
```

---

## Notifications Endpoints

### Get Notifications

Get user's notifications.

**Endpoint:** `GET /notifications`
**Authentication:** Required
**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `unreadOnly` (optional): Only unread notifications

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif_1",
        "type": "achievement_unlocked",
        "title": "Achievement Unlocked!",
        "message": "You've earned the 'Week Warrior' badge",
        "data": {
          "achievementId": "streak_7"
        },
        "read": false,
        "createdAt": "2025-02-17T09:00:00Z"
      },
      {
        "id": "notif_2",
        "type": "cards_due",
        "title": "Cards Ready for Review",
        "message": "You have 25 cards due for review",
        "data": {
          "cardCount": 25
        },
        "read": true,
        "createdAt": "2025-02-17T08:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "unreadCount": 5
    }
  }
}
```

---

### Mark Notification as Read

Mark a notification as read.

**Endpoint:** `PUT /notifications/:id/read`
**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

### Mark All as Read

Mark all notifications as read.

**Endpoint:** `PUT /notifications/read-all`
**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "markedAsRead": 5
  },
  "message": "All notifications marked as read"
}
```

---

## Search Endpoints

### Global Search

Search across all content types.

**Endpoint:** `GET /search`
**Authentication:** Required
**Query Parameters:**
- `q`: Search query (required)
- `type` (optional): Content type filter (lessons, cards, exercises, quizzes)
- `category` (optional): Category filter
- `limit` (optional): Result limit per type

**Example:** `GET /search?q=selector&type=lessons&limit=10`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "query": "selector",
    "results": {
      "lessons": [
        {
          "id": "lesson_5",
          "title": "Understanding Selectors",
          "excerpt": "...learn about different types of selectors...",
          "type": "lesson",
          "relevance": 0.95
        }
      ],
      "cards": [
        {
          "id": "card_10",
          "front": "What is a CSS selector?",
          "type": "card",
          "relevance": 0.88
        }
      ],
      "exercises": [],
      "quizzes": []
    },
    "totalResults": 15
  }
}
```

---

## Settings Endpoints

### Get Settings

Get user settings.

**Endpoint:** `GET /settings`
**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "general": {
      "theme": "dark",
      "language": "en",
      "timezone": "America/New_York"
    },
    "study": {
      "dailyGoal": 60,
      "dailyReviewLimit": 50,
      "newCardsPerDay": 10
    },
    "notifications": {
      "email": true,
      "push": true,
      "dailyReminder": true,
      "reminderTime": "09:00"
    },
    "privacy": {
      "publicProfile": false,
      "showProgress": true,
      "analytics": true
    }
  }
}
```

---

### Update Settings

Update user settings.

**Endpoint:** `PUT /settings`
**Authentication:** Required

**Request Body:**
```json
{
  "general": {
    "theme": "light"
  },
  "study": {
    "dailyGoal": 90
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "general": {
      "theme": "light"
    },
    "study": {
      "dailyGoal": 90
    }
  },
  "message": "Settings updated successfully"
}
```

---

## Schedule Endpoints

### Get Review Schedule

Get upcoming flashcard review schedule.

**Endpoint:** `GET /schedule/reviews`
**Authentication:** Required
**Query Parameters:**
- `startDate` (optional): Start date
- `endDate` (optional): End date
- `forecast` (optional): Days to forecast (default: 7)

**Example:** `GET /schedule/reviews?forecast=14`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "schedule": [
      {
        "date": "2025-02-17",
        "cardsDue": 25,
        "estimatedTime": 750
      },
      {
        "date": "2025-02-18",
        "cardsDue": 30,
        "estimatedTime": 900
      }
    ],
    "summary": {
      "totalDue": 150,
      "averagePerDay": 21,
      "peakDay": "2025-02-20",
      "peakDayCount": 45
    }
  }
}
```

---

## Admin Endpoints

Admin endpoints require `admin` role.

### List Users

Get list of all users.

**Endpoint:** `GET /admin/users`
**Authentication:** Required (Admin)
**Query Parameters:**
- `page`, `limit`: Pagination
- `role`: Filter by role
- `search`: Search by name/email

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_1",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "user",
        "verified": true,
        "active": true,
        "createdAt": "2025-01-15T00:00:00Z",
        "lastLoginAt": "2025-02-17T09:00:00Z",
        "stats": {
          "lessonsCompleted": 25,
          "studyTime": 18000
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 1250,
      "pages": 25
    }
  }
}
```

---

### Update User

Update user information (admin).

**Endpoint:** `PUT /admin/users/:id`
**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "role": "instructor",
  "active": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "user_1",
    "role": "instructor",
    "active": true,
    "updatedAt": "2025-02-17T10:00:00Z"
  },
  "message": "User updated successfully"
}
```

---

### Get Analytics

Get platform analytics.

**Endpoint:** `GET /admin/analytics`
**Authentication:** Required (Admin)
**Query Parameters:**
- `startDate`, `endDate`: Date range
- `metric`: Specific metric to retrieve

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 1250,
      "active": 850,
      "newThisMonth": 120
    },
    "engagement": {
      "dailyActiveUsers": 450,
      "averageSessionDuration": 2400,
      "completionRate": 68
    },
    "content": {
      "lessonsViewed": 15000,
      "quizzesCompleted": 5000,
      "cardsReviewed": 75000
    }
  }
}
```

---

## Error Handling

### Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `AUTHENTICATION_REQUIRED` | 401 | No valid authentication token |
| `INVALID_CREDENTIALS` | 401 | Email or password incorrect |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

### Error Response Examples

**Validation Error:**
```json
{
  "success": false,
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "email": "Valid email is required",
    "password": "Password must be at least 8 characters"
  }
}
```

**Authentication Error:**
```json
{
  "success": false,
  "error": "Authentication required",
  "code": "AUTHENTICATION_REQUIRED"
}
```

**Not Found Error:**
```json
{
  "success": false,
  "error": "Card not found",
  "code": "NOT_FOUND",
  "details": {
    "cardId": "card_invalid"
  }
}
```

---

## Rate Limiting

Rate limits protect the API from abuse.

### Limits by Endpoint Category

| Category | Limit | Window |
|----------|-------|--------|
| Auth (login/register) | 5 requests | 15 minutes |
| Password reset | 3 requests | 1 hour |
| Standard API | 100 requests | 15 minutes |
| Search | 30 requests | 1 minute |
| Admin | 200 requests | 15 minutes |

### Rate Limit Headers

Responses include rate limit headers:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1645099800
```

### Rate Limit Exceeded Response

```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 300
}
```

---

## Versioning

The API is versioned via URL path:

- **Current Version:** `v1`
- **Base URL:** `/api/v1/...`

Version 1 is stable. Future versions will be announced with deprecation notices.

---

## Postman Collection

Download the Postman collection for easy API testing:

[Download Postman Collection](../postman/PlaywrightSeleniumLearning.postman_collection.json)

**Import Steps:**
1. Open Postman
2. Click Import
3. Select the JSON file
4. Configure environment variables

---

## Webhooks

_(Future Feature)_

Webhooks will allow you to receive real-time notifications for events like:
- User registration
- Quiz completion
- Achievement unlocked
- Progress milestones

---

## SDK Support

Official SDKs coming soon:
- JavaScript/TypeScript
- Python
- Java

For now, use any HTTP client library to interact with the API.

---

**For questions or support, contact:** support@playwright-selenium-learning.com

*Last Updated: February 17, 2025*
*Version: 1.0.0*
