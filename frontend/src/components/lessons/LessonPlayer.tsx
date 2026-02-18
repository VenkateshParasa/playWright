import React, { useEffect, useState, useCallback } from 'react';
import { Bookmark, BookmarkCheck, Clock, Share2, Printer } from 'lucide-react';
import LessonContent, { calculateReadingTime } from './LessonContent';
import TableOfContents, { generateTableOfContents, useActiveHeading } from './TableOfContents';
import LessonProgress from './LessonProgress';
import LessonNavigation from './LessonNavigation';
import type {
  Lesson,
  LessonContent as LessonContentType,
  TableOfContentsItem,
  LessonNavigation as LessonNavigationType,
  LessonPosition,
} from '../../types/lesson.types';

interface LessonPlayerProps {
  lesson: Lesson;
  lessonContent: LessonContentType;
  navigation: LessonNavigationType;
  isCompleted: boolean;
  isBookmarked: boolean;
  timeSpent: number; // in seconds
  onMarkComplete: (lessonId: string) => void;
  onMarkIncomplete?: (lessonId: string) => void;
  onToggleBookmark: (lessonId: string) => void;
  onUpdateTime: (lessonId: string, time: number) => void;
  onSavePosition?: (position: LessonPosition) => void;
  className?: string;
}

export default function LessonPlayer({
  lesson,
  lessonContent,
  navigation,
  isCompleted,
  isBookmarked,
  timeSpent,
  onMarkComplete,
  onMarkIncomplete,
  onToggleBookmark,
  onUpdateTime,
  onSavePosition,
  className = '',
}: LessonPlayerProps) {
  const [tableOfContents, setTableOfContents] = useState<TableOfContentsItem[]>([]);
  const [startTime] = useState(Date.now());
  const [readingTime, setReadingTime] = useState({ text: '', minutes: 0 });

  // Calculate reading time
  useEffect(() => {
    const time = calculateReadingTime(lessonContent.content);
    setReadingTime(time);
  }, [lessonContent.content]);

  // Generate table of contents
  useEffect(() => {
    const toc = generateTableOfContents(lessonContent.content);
    setTableOfContents(toc);
  }, [lessonContent.content]);

  // Track active heading
  const tocIds = tableOfContents.flatMap((item) => {
    const ids = [item.id];
    if (item.children) {
      ids.push(...item.children.map((child) => child.id));
    }
    return ids;
  });
  const activeHeadingId = useActiveHeading(tocIds);

  // Track time spent
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      onUpdateTime(lesson.id, timeSpent + elapsedSeconds);
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [lesson.id, startTime, timeSpent, onUpdateTime]);

  // Update time on unmount
  useEffect(() => {
    return () => {
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      onUpdateTime(lesson.id, timeSpent + elapsedSeconds);
    };
  }, [lesson.id, startTime, timeSpent, onUpdateTime]);

  // Handle scroll position saving
  const handleScroll = useCallback(
    (position: number) => {
      if (onSavePosition) {
        onSavePosition({
          lessonId: lesson.id,
          scrollPosition: position,
          lastAccessedAt: new Date().toISOString(),
        });
      }
    },
    [lesson.id, onSavePosition]
  );

  // Handle bookmark toggle
  const handleToggleBookmark = () => {
    onToggleBookmark(lesson.id);
  };

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: lesson.title,
          text: lesson.description,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`lesson-player ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {lesson.title}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {lesson.description}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleBookmark}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                title={isBookmarked ? 'Remove bookmark' : 'Bookmark lesson'}
                aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark lesson'}
              >
                {isBookmarked ? (
                  <BookmarkCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                ) : (
                  <Bookmark className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>

              <button
                onClick={handleShare}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                title="Share lesson"
                aria-label="Share lesson"
              >
                <Share2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>

              <button
                onClick={handlePrint}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors print:hidden"
                title="Print lesson"
                aria-label="Print lesson"
              >
                <Printer className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Meta information */}
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{readingTime.text}</span>
            </div>
            <span>•</span>
            <span className="capitalize">{lesson.difficulty}</span>
            {lesson.tags && lesson.tags.length > 0 && (
              <>
                <span>•</span>
                <div className="flex items-center gap-2">
                  {lesson.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag.id}
                      className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </header>

        {/* Main content area */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          {/* Lesson content */}
          <div className="min-w-0">
            <article className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 lg:p-8">
              <LessonContent
                content={lessonContent.content}
                onScroll={handleScroll}
              />
            </article>

            {/* Video embed if available */}
            {lessonContent.videoUrl && (
              <div className="mt-8 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Video Tutorial
                </h2>
                <div className="aspect-video">
                  <iframe
                    src={lessonContent.videoUrl}
                    title={`${lesson.title} video`}
                    className="w-full h-full rounded-lg"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Resources */}
            {lessonContent.resources && lessonContent.resources.length > 0 && (
              <div className="mt-8 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Additional Resources
                </h2>
                <ul className="space-y-2">
                  {lessonContent.resources.map((resource) => (
                    <li key={resource.id}>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <span>{resource.title}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({resource.type})
                        </span>
                      </a>
                      {resource.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 ml-6">
                          {resource.description}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Navigation */}
            <div className="mt-8">
              <LessonNavigation navigation={navigation} />
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Progress card */}
            <LessonProgress
              lessonId={lesson.id}
              completed={isCompleted}
              timeSpent={timeSpent}
              estimatedTime={lesson.estimatedDuration}
              onMarkComplete={onMarkComplete}
              onMarkIncomplete={onMarkIncomplete}
            />

            {/* Table of contents */}
            {tableOfContents.length > 0 && (
              <TableOfContents items={tableOfContents} activeId={activeHeadingId} />
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
