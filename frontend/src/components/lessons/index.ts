// Lesson Components - Barrel Export

// Lesson Browser Components
export { default as LessonCard, CompactLessonCard } from './LessonCard';
export { default as LessonList, LessonListSkeleton } from './LessonList';
export { default as LessonSearch, CompactLessonSearch } from './LessonSearch';
export { default as LessonFilters, ActiveFiltersBar } from './LessonFilters';
export {
  default as ProgressBadge,
  ProgressIcon,
  ProgressIndicator,
} from './ProgressBadge';

// Lesson Player Components
export { default as LessonPlayer } from './LessonPlayer';
export { default as LessonContent, calculateReadingTime } from './LessonContent';
export { default as CodeExample } from './CodeExample';
export {
  default as TableOfContents,
  generateTableOfContents,
  useActiveHeading,
} from './TableOfContents';
export { default as LessonNavigation } from './LessonNavigation';
export { default as LessonProgress } from './LessonProgress';

// Re-export types
export type {
  Lesson,
  LessonContent as LessonContentType,
  LessonNavigation as LessonNavigationType,
  TableOfContentsItem,
  CodeExample as CodeExampleType,
  LessonPosition,
  LessonBookmark,
  ReadingTimeEstimate,
} from '../../types/lesson.types';
