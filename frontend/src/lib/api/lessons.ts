import { Lesson, LessonIndex } from '@/types/lesson';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
const DATA_PATH = '/data/lessons';

/**
 * Fetch the lesson index
 */
export async function fetchLessonIndex(): Promise<LessonIndex> {
  const response = await fetch(`${BACKEND_URL}${DATA_PATH}/index.json`);
  if (!response.ok) {
    throw new Error('Failed to fetch lesson index');
  }
  return response.json();
}

/**
 * Fetch a specific lesson by track, category, and lesson number
 */
export async function fetchLesson(
  track: 'playwright' | 'selenium',
  category: 'beginner' | 'intermediate' | 'advanced',
  lessonNumber: number
): Promise<Lesson> {
  const lessonId = String(lessonNumber).padStart(3, '0');
  const response = await fetch(
    `${BACKEND_URL}${DATA_PATH}/${track}/${category}/lesson-${lessonId}.json`
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch lesson: ${track}/${category}/lesson-${lessonId}`);
  }
  
  return response.json();
}

/**
 * Fetch lesson by ID (e.g., "pw-beginner-001")
 */
export async function fetchLessonById(lessonId: string): Promise<Lesson> {
  // Parse lesson ID: pw-beginner-001 or sel-intermediate-005
  console.log('[fetchLessonById] Received lesson ID:', lessonId);
  const parts = lessonId.split('-');
  console.log('[fetchLessonById] Split parts:', parts);
  
  if (parts.length < 3) {
    throw new Error(`Invalid lesson ID format: ${lessonId}. Expected format: pw-beginner-001`);
  }
  
  const track = parts[0] === 'pw' ? 'playwright' : 'selenium';
  const category = parts[1] as 'beginner' | 'intermediate' | 'advanced';
  const lessonNumber = parseInt(parts[2], 10);
  
  console.log('[fetchLessonById] Parsed:', { track, category, lessonNumber });
  
  if (isNaN(lessonNumber)) {
    throw new Error(`Invalid lesson number in ID: ${lessonId}. Could not parse: ${parts[2]}`);
  }
  
  return fetchLesson(track, category, lessonNumber);
}

/**
 * Fetch all lessons for a specific track and category
 */
export async function fetchLessonsByCategory(
  track: 'playwright' | 'selenium',
  category: 'beginner' | 'intermediate' | 'advanced'
): Promise<Lesson[]> {
  const lessons: Lesson[] = [];
  
  // Fetch up to 10 lessons (adjust based on actual count)
  for (let i = 1; i <= 10; i++) {
    try {
      const lessonId = String(i).padStart(3, '0');
      const response = await fetch(
        `${BACKEND_URL}${DATA_PATH}/${track}/${category}/lesson-${lessonId}.json`
      );
      
      if (!response.ok) {
        // Stop when we can't fetch more lessons
        break;
      }
      
      const lesson: Lesson = await response.json();
      lessons.push(lesson);
    } catch (error) {
      // Stop when we can't fetch more lessons
      console.error(`Failed to fetch lesson ${i}:`, error);
      break;
    }
  }
  
  return lessons;
}

/**
 * Fetch all lessons for a track
 */
export async function fetchLessonsByTrack(
  track: 'playwright' | 'selenium'
): Promise<Lesson[]> {
  const categories: Array<'beginner' | 'intermediate' | 'advanced'> = [
    'beginner',
    'intermediate',
    'advanced'
  ];
  
  const allLessons: Lesson[] = [];
  
  for (const category of categories) {
    const lessons = await fetchLessonsByCategory(track, category);
    allLessons.push(...lessons);
  }
  
  return allLessons;
}