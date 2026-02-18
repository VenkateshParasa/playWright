import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  Lesson,
  LessonFilters,
  LessonStats,
  LessonFilterState,
} from '../types/lesson.types';
import { mockLessons, calculateLessonStats } from '../data/mockLessons';

interface LessonsStore {
  // State
  lessons: Lesson[];
  filters: LessonFilters;
  viewMode: 'grid' | 'list' | 'grouped';
  isLoading: boolean;
  error: string | null;

  // Computed
  filteredLessons: Lesson[];
  stats: LessonStats;

  // Actions
  setFilters: (filters: LessonFilters) => void;
  updateFilter: (key: keyof LessonFilters, value: any) => void;
  clearFilters: () => void;
  setViewMode: (mode: 'grid' | 'list' | 'grouped') => void;
  setSearchQuery: (query: string) => void;
  fetchLessons: () => Promise<void>;
  updateLessonProgress: (lessonId: string, progress: number) => void;
  markLessonComplete: (lessonId: string) => void;
  startLesson: (lessonId: string) => void;
}

const defaultFilters: LessonFilters = {
  track: 'all',
  difficulty: 'all',
  status: 'all',
  week: 'all',
  tags: [],
  searchQuery: '',
  sortBy: 'order',
  sortOrder: 'asc',
};

// Helper function to filter lessons
function filterLessons(lessons: Lesson[], filters: LessonFilters): Lesson[] {
  let filtered = [...lessons];

  // Track filter
  if (filters.track !== 'all') {
    filtered = filtered.filter((l) => l.track === filters.track || l.track === 'both');
  }

  // Difficulty filter
  if (filters.difficulty !== 'all') {
    filtered = filtered.filter((l) => l.difficulty === filters.difficulty);
  }

  // Status filter
  if (filters.status !== 'all') {
    filtered = filtered.filter((l) => l.status === filters.status);
  }

  // Week filter
  if (filters.week !== 'all') {
    filtered = filtered.filter((l) => l.week === filters.week);
  }

  // Tags filter
  if (filters.tags.length > 0) {
    filtered = filtered.filter((l) =>
      filters.tags.some((tagId) => l.tags.some((t) => t.id === tagId))
    );
  }

  // Search filter
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (l) =>
        l.title.toLowerCase().includes(query) ||
        l.description.toLowerCase().includes(query) ||
        l.topics.some((t) => t.toLowerCase().includes(query)) ||
        l.tags.some((t) => t.name.toLowerCase().includes(query))
    );
  }

  // Sort
  filtered.sort((a, b) => {
    let comparison = 0;
    switch (filters.sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'difficulty':
        const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
        comparison = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        break;
      case 'duration':
        comparison = a.estimatedDuration - b.estimatedDuration;
        break;
      case 'order':
      default:
        comparison = a.order - b.order;
        break;
    }
    return filters.sortOrder === 'asc' ? comparison : -comparison;
  });

  return filtered;
}

export const useLessonsStore = create<LessonsStore>()(
  persist(
    (set, get) => ({
      // Initial state
      lessons: mockLessons,
      filters: defaultFilters,
      viewMode: 'grid',
      isLoading: false,
      error: null,

      // Computed values
      get filteredLessons() {
        return filterLessons(get().lessons, get().filters);
      },

      get stats() {
        return calculateLessonStats(get().lessons);
      },

      // Actions
      setFilters: (filters) => {
        set({ filters });
      },

      updateFilter: (key, value) => {
        set((state) => ({
          filters: { ...state.filters, [key]: value },
        }));
      },

      clearFilters: () => {
        set((state) => ({
          filters: {
            ...defaultFilters,
            searchQuery: state.filters.searchQuery, // Keep search query
          },
        }));
      },

      setViewMode: (mode) => {
        set({ viewMode: mode });
      },

      setSearchQuery: (query) => {
        set((state) => ({
          filters: { ...state.filters, searchQuery: query },
        }));
      },

      fetchLessons: async () => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 500));
          // In production, replace with actual API call:
          // const response = await fetch('/api/lessons');
          // const data = await response.json();
          // set({ lessons: data, isLoading: false });
          set({ lessons: mockLessons, isLoading: false });
        } catch (error) {
          set({ error: 'Failed to fetch lessons', isLoading: false });
        }
      },

      updateLessonProgress: (lessonId, progress) => {
        set((state) => ({
          lessons: state.lessons.map((lesson) =>
            lesson.id === lessonId
              ? {
                  ...lesson,
                  progress,
                  status:
                    progress === 100
                      ? 'completed'
                      : progress > 0
                      ? 'in-progress'
                      : lesson.status,
                  completedAt: progress === 100 ? new Date() : lesson.completedAt,
                  startedAt: progress > 0 && !lesson.startedAt ? new Date() : lesson.startedAt,
                }
              : lesson
          ),
        }));
      },

      markLessonComplete: (lessonId) => {
        set((state) => ({
          lessons: state.lessons.map((lesson) =>
            lesson.id === lessonId
              ? {
                  ...lesson,
                  status: 'completed',
                  progress: 100,
                  completedAt: new Date(),
                  startedAt: lesson.startedAt || new Date(),
                }
              : lesson
          ),
        }));
      },

      startLesson: (lessonId) => {
        set((state) => ({
          lessons: state.lessons.map((lesson) =>
            lesson.id === lessonId
              ? {
                  ...lesson,
                  status: lesson.status === 'available' ? 'in-progress' : lesson.status,
                  startedAt: lesson.startedAt || new Date(),
                }
              : lesson
          ),
        }));
      },
    }),
    {
      name: 'lessons-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        filters: state.filters,
        viewMode: state.viewMode,
      }),
    }
  )
);

// Selectors for better performance
export const selectFilteredLessons = (state: LessonsStore) => state.filteredLessons;
export const selectStats = (state: LessonsStore) => state.stats;
export const selectFilters = (state: LessonsStore) => state.filters;
export const selectViewMode = (state: LessonsStore) => state.viewMode;
