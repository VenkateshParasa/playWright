// Lesson Types and Interfaces

export type LessonStatus = 'completed' | 'in-progress' | 'locked' | 'available';

export type LessonTrack = '30-day' | '60-day' | 'both';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export type SortOption = 'order' | 'difficulty' | 'duration' | 'title';

export interface LessonTag {
  id: string;
  name: string;
  color: string;
}

export interface Prerequisite {
  id: string;
  title: string;
  completed: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  track: LessonTrack;
  week: number;
  module: number;
  order: number;
  status: LessonStatus;
  difficulty: DifficultyLevel;
  estimatedDuration: number; // in minutes
  completedAt?: Date;
  startedAt?: Date;
  progress: number; // 0-100
  tags: LessonTag[];
  prerequisites: Prerequisite[];
  topics: string[];
  learningObjectives: string[];
  thumbnail?: string;
}

export interface LessonFilters {
  track: LessonTrack | 'all';
  difficulty: DifficultyLevel | 'all';
  status: LessonStatus | 'all';
  week: number | 'all';
  tags: string[];
  searchQuery: string;
  sortBy: SortOption;
  sortOrder: 'asc' | 'desc';
}

export interface LessonStats {
  totalLessons: number;
  completedLessons: number;
  inProgressLessons: number;
  lockedLessons: number;
  averageProgress: number;
  totalTimeSpent: number;
}

export interface ModuleGroup {
  week: number;
  module: number;
  title: string;
  description: string;
  lessons: Lesson[];
  progress: number;
  isLocked: boolean;
}

// Filter state for localStorage persistence
export interface LessonFilterState {
  filters: LessonFilters;
  lastUpdated: string;
}

// ============================================================================
// Lesson Player Types
// ============================================================================

export interface LessonContent {
  id: string;
  lessonId: string;
  content: string; // Markdown content
  videoUrl?: string;
  resources: LessonResource[];
  codeExamples: CodeExample[];
}

export interface LessonResource {
  id: string;
  type: 'link' | 'file' | 'video' | 'documentation';
  title: string;
  url: string;
  description?: string;
}

export interface TableOfContentsItem {
  id: string;
  title: string;
  level: number; // 1-6 for h1-h6
  children: TableOfContentsItem[];
}

export interface LessonPosition {
  lessonId: string;
  scrollPosition: number;
  lastAccessedAt: string;
}

export interface LessonBookmark {
  id: string;
  lessonId: string;
  title: string;
  createdAt: string;
  note?: string;
}

export interface CodeExample {
  id: string;
  language: string;
  code: string;
  title?: string;
  filename?: string;
  highlightLines?: number[];
  showLineNumbers?: boolean;
}

export interface ReadingTimeEstimate {
  text: string; // "5 min read"
  minutes: number;
  words: number;
  time: number; // in milliseconds
}

export interface LessonNavigation {
  previousLesson?: {
    id: string;
    title: string;
  };
  nextLesson?: {
    id: string;
    title: string;
  };
  currentIndex: number;
  totalLessons: number;
}
