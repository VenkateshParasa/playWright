/**
 * Utility functions for lesson-related operations
 */

import type { LessonPosition, LessonBookmark } from '../../types/lesson.types';

// ============================================================================
// Local Storage Keys
// ============================================================================

const STORAGE_KEYS = {
  LESSON_PROGRESS: 'lesson-progress',
  LESSON_POSITION: 'lesson-position',
  LESSON_BOOKMARKS: 'lesson-bookmarks',
  LESSON_TIME: 'lesson-time',
} as const;

// ============================================================================
// Progress Management
// ============================================================================

export interface LessonProgressData {
  completed: boolean;
  bookmarked: boolean;
  timeSpent: number;
  lastAccessedAt: string;
}

export function saveLessonProgress(
  lessonId: string,
  data: LessonProgressData
): void {
  try {
    const key = `${STORAGE_KEYS.LESSON_PROGRESS}-${lessonId}`;
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save lesson progress:', error);
  }
}

export function loadLessonProgress(lessonId: string): LessonProgressData | null {
  try {
    const key = `${STORAGE_KEYS.LESSON_PROGRESS}-${lessonId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load lesson progress:', error);
    return null;
  }
}

export function clearLessonProgress(lessonId: string): void {
  try {
    const key = `${STORAGE_KEYS.LESSON_PROGRESS}-${lessonId}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear lesson progress:', error);
  }
}

// ============================================================================
// Position Management (Auto-save scroll position)
// ============================================================================

export function saveLessonPosition(position: LessonPosition): void {
  try {
    const key = `${STORAGE_KEYS.LESSON_POSITION}-${position.lessonId}`;
    localStorage.setItem(key, JSON.stringify(position));
  } catch (error) {
    console.error('Failed to save lesson position:', error);
  }
}

export function loadLessonPosition(lessonId: string): LessonPosition | null {
  try {
    const key = `${STORAGE_KEYS.LESSON_POSITION}-${lessonId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load lesson position:', error);
    return null;
  }
}

export function restoreLessonPosition(lessonId: string): void {
  const position = loadLessonPosition(lessonId);
  if (position && position.scrollPosition > 0) {
    // Delay to ensure content is rendered
    setTimeout(() => {
      window.scrollTo({
        top: position.scrollPosition,
        behavior: 'smooth',
      });
    }, 100);
  }
}

// ============================================================================
// Bookmark Management
// ============================================================================

export function saveBookmark(bookmark: LessonBookmark): void {
  try {
    const bookmarks = loadAllBookmarks();
    const existingIndex = bookmarks.findIndex((b) => b.id === bookmark.id);

    if (existingIndex >= 0) {
      bookmarks[existingIndex] = bookmark;
    } else {
      bookmarks.push(bookmark);
    }

    localStorage.setItem(STORAGE_KEYS.LESSON_BOOKMARKS, JSON.stringify(bookmarks));
  } catch (error) {
    console.error('Failed to save bookmark:', error);
  }
}

export function removeBookmark(bookmarkId: string): void {
  try {
    const bookmarks = loadAllBookmarks();
    const filtered = bookmarks.filter((b) => b.id !== bookmarkId);
    localStorage.setItem(STORAGE_KEYS.LESSON_BOOKMARKS, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to remove bookmark:', error);
  }
}

export function loadAllBookmarks(): LessonBookmark[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LESSON_BOOKMARKS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load bookmarks:', error);
    return [];
  }
}

export function isLessonBookmarked(lessonId: string): boolean {
  const bookmarks = loadAllBookmarks();
  return bookmarks.some((b) => b.lessonId === lessonId);
}

// ============================================================================
// Time Tracking
// ============================================================================

export function startTimeTracking(lessonId: string): number {
  const startTime = Date.now();
  sessionStorage.setItem(`${STORAGE_KEYS.LESSON_TIME}-${lessonId}`, String(startTime));
  return startTime;
}

export function getElapsedTime(lessonId: string): number {
  try {
    const startTime = sessionStorage.getItem(`${STORAGE_KEYS.LESSON_TIME}-${lessonId}`);
    if (startTime) {
      return Math.floor((Date.now() - parseInt(startTime, 10)) / 1000);
    }
    return 0;
  } catch (error) {
    console.error('Failed to get elapsed time:', error);
    return 0;
  }
}

export function stopTimeTracking(lessonId: string): void {
  try {
    sessionStorage.removeItem(`${STORAGE_KEYS.LESSON_TIME}-${lessonId}`);
  } catch (error) {
    console.error('Failed to stop time tracking:', error);
  }
}

// ============================================================================
// Dark Mode Support
// ============================================================================

export function initializeDarkMode(): void {
  // Check for saved preference or system preference
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export function toggleDarkMode(): void {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

export function setDarkMode(enabled: boolean): void {
  if (enabled) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
}

export function isDarkMode(): boolean {
  return document.documentElement.classList.contains('dark');
}

// ============================================================================
// Reading Time Calculation
// ============================================================================

export interface ReadingTimeResult {
  text: string;
  minutes: number;
  words: number;
  time: number; // in milliseconds
}

export function calculateReadingTime(
  content: string,
  wordsPerMinute: number = 200
): ReadingTimeResult {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  const time = (words / wordsPerMinute) * 60 * 1000;

  return {
    text: `${minutes} min read`,
    minutes,
    words,
    time,
  };
}

// ============================================================================
// Content Processing
// ============================================================================

export function extractHeadingsFromMarkdown(markdown: string): Array<{
  level: number;
  text: string;
  id: string;
}> {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: Array<{ level: number; text: string; id: string }> = [];

  let match;
  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');

    headings.push({ level, text, id });
  }

  return headings;
}

export function highlightCodeBlocks(markdown: string): string {
  // This would integrate with a syntax highlighting library
  // For now, it's a placeholder
  return markdown;
}

// ============================================================================
// URL Helpers
// ============================================================================

export function getLessonUrl(lessonId: string): string {
  return `/lessons/${lessonId}`;
}

export function shareLessonUrl(lessonId: string, title: string): void {
  const url = `${window.location.origin}/lessons/${lessonId}`;

  if (navigator.share) {
    navigator
      .share({
        title,
        url,
      })
      .catch((error) => console.error('Error sharing:', error));
  } else {
    // Fallback to copying to clipboard
    navigator.clipboard
      .writeText(url)
      .then(() => alert('Link copied to clipboard!'))
      .catch((error) => console.error('Failed to copy:', error));
  }
}

// ============================================================================
// Print Support
// ============================================================================

export function printLesson(): void {
  window.print();
}

export function prepareLessonForPrint(): void {
  // Add print-specific styles
  document.body.classList.add('print-mode');
}

export function cleanupAfterPrint(): void {
  document.body.classList.remove('print-mode');
}
