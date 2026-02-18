import { useEffect, useRef, useState, useMemo } from 'react';
import { Lesson, ModuleGroup } from '../../types/lesson.types';
import LessonCard, { CompactLessonCard } from './LessonCard';
import { BookOpen, ChevronDown, ChevronRight } from 'lucide-react';

interface LessonListProps {
  lessons: Lesson[];
  viewMode?: 'grid' | 'list' | 'grouped';
  onLessonClick?: (lesson: Lesson) => void;
  className?: string;
}

export default function LessonList({
  lessons,
  viewMode = 'grid',
  onLessonClick,
  className = '',
}: LessonListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const ITEM_HEIGHT = viewMode === 'list' ? 100 : 450; // Approximate heights
  const BUFFER_SIZE = 5;

  // Virtual scrolling: Track scroll position and update visible range
  useEffect(() => {
    const container = containerRef.current;
    if (!container || lessons.length < 50) return; // Only use virtual scrolling for large lists

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;

      const start = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE);
      const end = Math.min(
        lessons.length,
        Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + BUFFER_SIZE
      );

      setVisibleRange({ start, end });
    };

    container.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial calculation

    return () => container.removeEventListener('scroll', handleScroll);
  }, [lessons.length, ITEM_HEIGHT]);

  // For large lists, use virtual scrolling
  const visibleLessons =
    lessons.length < 50 ? lessons : lessons.slice(visibleRange.start, visibleRange.end);

  const totalHeight = lessons.length * ITEM_HEIGHT;
  const offsetY = visibleRange.start * ITEM_HEIGHT;

  if (lessons.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No lessons found</h3>
        <p className="text-gray-600">Try adjusting your filters or search query.</p>
      </div>
    );
  }

  if (viewMode === 'grouped') {
    return <GroupedLessonList lessons={lessons} onLessonClick={onLessonClick} />;
  }

  return (
    <div
      ref={containerRef}
      className={`${lessons.length >= 50 ? 'max-h-screen overflow-y-auto' : ''} ${className}`}
    >
      <div style={{ height: lessons.length >= 50 ? totalHeight : 'auto', position: 'relative' }}>
        <div
          style={{
            transform: lessons.length >= 50 ? `translateY(${offsetY}px)` : undefined,
            position: lessons.length >= 50 ? 'absolute' : 'relative',
            width: '100%',
          }}
        >
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {visibleLessons.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  onClick={onLessonClick ? () => onLessonClick(lesson) : undefined}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {visibleLessons.map((lesson) => (
                <CompactLessonCard
                  key={lesson.id}
                  lesson={lesson}
                  onClick={onLessonClick ? () => onLessonClick(lesson) : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Grouped view - organized by week and module
function GroupedLessonList({
  lessons,
  onLessonClick,
}: {
  lessons: Lesson[];
  onLessonClick?: (lesson: Lesson) => void;
}) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['1-1']));

  // Group lessons by week and module
  const groupedLessons = useMemo(() => {
    const groups = new Map<string, ModuleGroup>();

    lessons.forEach((lesson) => {
      const key = `${lesson.week}-${lesson.module}`;
      if (!groups.has(key)) {
        groups.set(key, {
          week: lesson.week,
          module: lesson.module,
          title: `Week ${lesson.week} - Module ${lesson.module}`,
          description: '',
          lessons: [],
          progress: 0,
          isLocked: false,
        });
      }
      groups.get(key)!.lessons.push(lesson);
    });

    // Calculate progress for each group
    groups.forEach((group) => {
      const totalProgress = group.lessons.reduce((sum, l) => sum + l.progress, 0);
      group.progress = totalProgress / group.lessons.length;
      group.isLocked = group.lessons.every((l) => l.status === 'locked');
    });

    // Sort groups by week and module
    return Array.from(groups.values()).sort((a, b) => {
      if (a.week !== b.week) return a.week - b.week;
      return a.module - b.module;
    });
  }, [lessons]);

  const toggleGroup = (key: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedGroups(newExpanded);
  };

  return (
    <div className="space-y-4">
      {groupedLessons.map((group) => {
        const key = `${group.week}-${group.module}`;
        const isExpanded = expandedGroups.has(key);

        return (
          <div key={key} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            {/* Group Header */}
            <button
              onClick={() => toggleGroup(key)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-2 rounded-lg ${
                    group.isLocked ? 'bg-gray-100' : 'bg-blue-100'
                  }`}
                >
                  <BookOpen
                    className={`w-5 h-5 ${group.isLocked ? 'text-gray-500' : 'text-blue-600'}`}
                  />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-900">{group.title}</h3>
                  <p className="text-sm text-gray-600">
                    {group.lessons.length} lessons • {Math.round(group.progress)}% complete
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {/* Progress Bar */}
                <div className="hidden sm:block w-32">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        group.progress === 100
                          ? 'bg-green-500'
                          : group.progress > 0
                          ? 'bg-blue-500'
                          : 'bg-gray-300'
                      } transition-all duration-300`}
                      style={{ width: `${group.progress}%` }}
                    />
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                )}
              </div>
            </button>

            {/* Group Content */}
            {isExpanded && (
              <div className="px-6 pb-6 space-y-3 border-t border-gray-100">
                {group.lessons.map((lesson) => (
                  <div key={lesson.id} className="pt-3">
                    <CompactLessonCard
                      lesson={lesson}
                      onClick={onLessonClick ? () => onLessonClick(lesson) : undefined}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Loading skeleton for lesson list
export function LessonListSkeleton({ viewMode = 'grid' }: { viewMode?: 'grid' | 'list' }) {
  const skeletonCount = viewMode === 'grid' ? 6 : 8;

  return (
    <div
      className={
        viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
          : 'space-y-3'
      }
    >
      {Array.from({ length: skeletonCount }).map((_, index) => (
        <div
          key={index}
          className={`bg-white rounded-lg shadow-md border border-gray-200 animate-pulse ${
            viewMode === 'grid' ? 'p-5' : 'p-4'
          }`}
        >
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            {viewMode === 'grid' && (
              <>
                <div className="flex gap-2 mt-4">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-2 bg-gray-200 rounded w-full mt-4"></div>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
