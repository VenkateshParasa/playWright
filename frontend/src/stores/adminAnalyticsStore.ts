import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface UserMetrics {
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  activeUsersToday: number;
  activeUsersThisWeek: number;
  activeUsersThisMonth: number;
  userGrowth: { date: string; count: number }[];
  userRetentionRate: number;
  userChurnRate: number;
  averageSessionDuration: number;
  usersByTrack: { track: string; count: number }[];
}

export interface ContentMetrics {
  totalLessons: number;
  totalQuizzes: number;
  totalExercises: number;
  totalFlashcards: number;
  completionRatesByModule: { module: string; rate: number }[];
  popularLessons: { lessonId: string; title: string; views: number }[];
  leastCompletedLessons: { lessonId: string; title: string; completionRate: number }[];
  averageQuizScores: { date: string; averageScore: number }[];
  quizPassRates: { quizId: string; quizName: string; passRate: number }[];
  difficultExercises: { exerciseId: string; exerciseName: string; completionRate: number }[];
  flashcardReviewCount: number;
  flashcardReviewThisWeek: number;
  engagementHeatmap: { dayOfWeek: number; hour: number; count: number }[];
}

export interface EngagementMetrics {
  totalStudyTime: number;
  averageStudyTimePerUser: number;
  studyTimeDistribution: { range: string; count: number }[];
  dailyActiveSessions: number;
  sessionDurationDistribution: { range: string; count: number }[];
  peakUsageTimes: { hour: number; count: number }[];
  activityHeatmap: { date: string; count: number }[];
  streakDistribution: { range: string; count: number }[];
}

export interface ProgressMetrics {
  overallCompletionRate: number;
  averageProgressPercentage: number;
  completionRateByModule: { module: string; rate: number }[];
  timeToCompleteByModule: { module: string; averageDays: number }[];
  progressDistribution: { range: string; count: number }[];
  stuckUsers: { userId: string; userName: string; lessonId: string; daysStuck: number }[];
}

export interface SRSMetrics {
  totalCards: number;
  averageCardsPerUser: number;
  cardsReviewedToday: number;
  cardsReviewedThisWeek: number;
  averageRetentionRate: number;
  retentionCurve: { interval: number; retentionRate: number }[];
  reviewFrequencyDistribution: { frequency: string; count: number }[];
  cardDifficultyDistribution: { difficulty: string; count: number }[];
}

interface AdminAnalyticsState {
  // Data
  userMetrics: UserMetrics | null;
  contentMetrics: ContentMetrics | null;
  engagementMetrics: EngagementMetrics | null;
  progressMetrics: ProgressMetrics | null;
  srsMetrics: SRSMetrics | null;

  // UI State
  dateRange: DateRange | null;
  isLoading: boolean;
  error: string | null;
  lastRefreshed: Date | null;
  selectedMetrics: string[];
  autoRefresh: boolean;
  refreshInterval: number; // in seconds

  // Actions
  setDateRange: (dateRange: DateRange | null) => void;
  setSelectedMetrics: (metrics: string[]) => void;
  setAutoRefresh: (enabled: boolean) => void;
  setRefreshInterval: (interval: number) => void;

  // Data Fetching
  fetchUserMetrics: () => Promise<void>;
  fetchContentMetrics: () => Promise<void>;
  fetchEngagementMetrics: () => Promise<void>;
  fetchProgressMetrics: () => Promise<void>;
  fetchSRSMetrics: () => Promise<void>;
  fetchAllMetrics: () => Promise<void>;
  refreshMetrics: () => Promise<void>;

  // Utilities
  clearCache: () => void;
  reset: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const useAdminAnalyticsStore = create<AdminAnalyticsState>()(
  persist(
    (set, get) => ({
      // Initial State
      userMetrics: null,
      contentMetrics: null,
      engagementMetrics: null,
      progressMetrics: null,
      srsMetrics: null,
      dateRange: null,
      isLoading: false,
      error: null,
      lastRefreshed: null,
      selectedMetrics: ['users', 'content', 'engagement', 'progress', 'srs'],
      autoRefresh: false,
      refreshInterval: 60,

      // UI Actions
      setDateRange: (dateRange) => set({ dateRange }),
      setSelectedMetrics: (metrics) => set({ selectedMetrics: metrics }),
      setAutoRefresh: (enabled) => set({ autoRefresh: enabled }),
      setRefreshInterval: (interval) => set({ refreshInterval: interval }),

      // Fetch User Metrics
      fetchUserMetrics: async () => {
        set({ isLoading: true, error: null });
        try {
          const { dateRange } = get();
          const queryParams = new URLSearchParams();
          if (dateRange) {
            queryParams.append('startDate', dateRange.startDate.toISOString());
            queryParams.append('endDate', dateRange.endDate.toISOString());
          }

          const response = await fetch(
            `${API_BASE_URL}/api/admin/analytics/users?${queryParams}`,
            {
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          if (!response.ok) {
            throw new Error('Failed to fetch user metrics');
          }

          const result = await response.json();
          set({
            userMetrics: result.data,
            isLoading: false,
            lastRefreshed: new Date(),
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false,
          });
        }
      },

      // Fetch Content Metrics
      fetchContentMetrics: async () => {
        set({ isLoading: true, error: null });
        try {
          const { dateRange } = get();
          const queryParams = new URLSearchParams();
          if (dateRange) {
            queryParams.append('startDate', dateRange.startDate.toISOString());
            queryParams.append('endDate', dateRange.endDate.toISOString());
          }

          const response = await fetch(
            `${API_BASE_URL}/api/admin/analytics/content?${queryParams}`,
            {
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          if (!response.ok) {
            throw new Error('Failed to fetch content metrics');
          }

          const result = await response.json();
          set({
            contentMetrics: result.data,
            isLoading: false,
            lastRefreshed: new Date(),
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false,
          });
        }
      },

      // Fetch Engagement Metrics
      fetchEngagementMetrics: async () => {
        set({ isLoading: true, error: null });
        try {
          const { dateRange } = get();
          const queryParams = new URLSearchParams();
          if (dateRange) {
            queryParams.append('startDate', dateRange.startDate.toISOString());
            queryParams.append('endDate', dateRange.endDate.toISOString());
          }

          const response = await fetch(
            `${API_BASE_URL}/api/admin/analytics/engagement?${queryParams}`,
            {
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          if (!response.ok) {
            throw new Error('Failed to fetch engagement metrics');
          }

          const result = await response.json();
          set({
            engagementMetrics: result.data,
            isLoading: false,
            lastRefreshed: new Date(),
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false,
          });
        }
      },

      // Fetch Progress Metrics
      fetchProgressMetrics: async () => {
        set({ isLoading: true, error: null });
        try {
          const { dateRange } = get();
          const queryParams = new URLSearchParams();
          if (dateRange) {
            queryParams.append('startDate', dateRange.startDate.toISOString());
            queryParams.append('endDate', dateRange.endDate.toISOString());
          }

          const response = await fetch(
            `${API_BASE_URL}/api/admin/analytics/progress?${queryParams}`,
            {
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          if (!response.ok) {
            throw new Error('Failed to fetch progress metrics');
          }

          const result = await response.json();
          set({
            progressMetrics: result.data,
            isLoading: false,
            lastRefreshed: new Date(),
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false,
          });
        }
      },

      // Fetch SRS Metrics
      fetchSRSMetrics: async () => {
        set({ isLoading: true, error: null });
        try {
          const { dateRange } = get();
          const queryParams = new URLSearchParams();
          if (dateRange) {
            queryParams.append('startDate', dateRange.startDate.toISOString());
            queryParams.append('endDate', dateRange.endDate.toISOString());
          }

          const response = await fetch(
            `${API_BASE_URL}/api/admin/analytics/srs?${queryParams}`,
            {
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          if (!response.ok) {
            throw new Error('Failed to fetch SRS metrics');
          }

          const result = await response.json();
          set({
            srsMetrics: result.data,
            isLoading: false,
            lastRefreshed: new Date(),
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false,
          });
        }
      },

      // Fetch All Metrics (Overview)
      fetchAllMetrics: async () => {
        set({ isLoading: true, error: null });
        try {
          const { dateRange } = get();
          const queryParams = new URLSearchParams();
          if (dateRange) {
            queryParams.append('startDate', dateRange.startDate.toISOString());
            queryParams.append('endDate', dateRange.endDate.toISOString());
          }

          const response = await fetch(
            `${API_BASE_URL}/api/admin/analytics/overview?${queryParams}`,
            {
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          if (!response.ok) {
            throw new Error('Failed to fetch analytics overview');
          }

          const result = await response.json();
          set({
            userMetrics: result.data.users,
            contentMetrics: result.data.content,
            engagementMetrics: result.data.engagement,
            progressMetrics: result.data.progress,
            srsMetrics: result.data.srs,
            isLoading: false,
            lastRefreshed: new Date(),
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false,
          });
        }
      },

      // Refresh Selected Metrics
      refreshMetrics: async () => {
        const { selectedMetrics } = get();
        set({ isLoading: true, error: null });

        try {
          const promises = [];
          if (selectedMetrics.includes('users')) {
            promises.push(get().fetchUserMetrics());
          }
          if (selectedMetrics.includes('content')) {
            promises.push(get().fetchContentMetrics());
          }
          if (selectedMetrics.includes('engagement')) {
            promises.push(get().fetchEngagementMetrics());
          }
          if (selectedMetrics.includes('progress')) {
            promises.push(get().fetchProgressMetrics());
          }
          if (selectedMetrics.includes('srs')) {
            promises.push(get().fetchSRSMetrics());
          }

          await Promise.all(promises);
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false,
          });
        }
      },

      // Clear Cache
      clearCache: () => {
        set({
          userMetrics: null,
          contentMetrics: null,
          engagementMetrics: null,
          progressMetrics: null,
          srsMetrics: null,
          lastRefreshed: null,
        });
      },

      // Reset Store
      reset: () => {
        set({
          userMetrics: null,
          contentMetrics: null,
          engagementMetrics: null,
          progressMetrics: null,
          srsMetrics: null,
          dateRange: null,
          isLoading: false,
          error: null,
          lastRefreshed: null,
          selectedMetrics: ['users', 'content', 'engagement', 'progress', 'srs'],
          autoRefresh: false,
          refreshInterval: 60,
        });
      },
    }),
    {
      name: 'admin-analytics-storage',
      partialize: (state) => ({
        dateRange: state.dateRange,
        selectedMetrics: state.selectedMetrics,
        autoRefresh: state.autoRefresh,
        refreshInterval: state.refreshInterval,
      }),
    }
  )
);
