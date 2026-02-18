import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Achievement, DailyChallenge } from '../data/achievements';

interface LeaderboardEntry {
  rank: number;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  totalXP: number;
  currentLevel: number;
  currentStreak: number;
  achievementsCount: number;
}

interface UserProgress {
  totalXP: number;
  currentLevel: number;
  streak: {
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: Date | null;
  };
  lessonsCompleted: number;
  quizzesCompleted: number;
  quizzesPassed: number;
  perfectQuizzes: number;
  exercisesCompleted: number;
  flashcardsReviewed: number;
  masteredFlashcards: number;
  totalStudyTime: number;
}

interface AchievementsState {
  // User progress
  userProgress: UserProgress | null;

  // Achievements
  achievements: (Achievement & {
    unlocked?: boolean;
    progress?: number;
    percentage?: number;
  })[];

  // Unseen achievements (for notifications)
  unseenAchievements: Achievement[];

  // Daily challenges
  dailyChallenges: (DailyChallenge & {
    completed?: boolean;
    progress?: number;
  })[];
  allChallengesCompleted: boolean;

  // Leaderboard
  leaderboard: LeaderboardEntry[];

  // Loading states
  isLoadingProgress: boolean;
  isLoadingAchievements: boolean;
  isLoadingChallenges: boolean;
  isLoadingLeaderboard: boolean;

  // Actions
  setUserProgress: (progress: UserProgress) => void;
  setAchievements: (achievements: any[]) => void;
  setUnseenAchievements: (achievements: Achievement[]) => void;
  setDailyChallenges: (challenges: any[], allCompleted: boolean) => void;
  setLeaderboard: (leaderboard: LeaderboardEntry[]) => void;
  clearUnseenAchievements: () => void;

  // API actions
  fetchUserProgress: () => Promise<void>;
  fetchAchievements: () => Promise<void>;
  fetchUnseenAchievements: () => Promise<void>;
  fetchDailyChallenges: () => Promise<void>;
  fetchLeaderboard: (type?: 'xp' | 'level' | 'streak') => Promise<void>;
  markAchievementsSeen: (achievementIds: string[]) => Promise<void>;
  updateActivity: (activityType: string, data?: any) => Promise<void>;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useAchievementsStore = create<AchievementsState>()(
  persist(
    (set, get) => ({
      // Initial state
      userProgress: null,
      achievements: [],
      unseenAchievements: [],
      dailyChallenges: [],
      allChallengesCompleted: false,
      leaderboard: [],
      isLoadingProgress: false,
      isLoadingAchievements: false,
      isLoadingChallenges: false,
      isLoadingLeaderboard: false,

      // Setters
      setUserProgress: (progress) => set({ userProgress: progress }),
      setAchievements: (achievements) => set({ achievements }),
      setUnseenAchievements: (achievements) => set({ unseenAchievements: achievements }),
      setDailyChallenges: (challenges, allCompleted) =>
        set({ dailyChallenges: challenges, allChallengesCompleted: allCompleted }),
      setLeaderboard: (leaderboard) => set({ leaderboard }),
      clearUnseenAchievements: () => set({ unseenAchievements: [] }),

      // API actions
      fetchUserProgress: async () => {
        set({ isLoadingProgress: true });
        try {
          const response = await fetch(`${API_BASE_URL}/achievements/progress`, {
            credentials: 'include',
          });
          if (response.ok) {
            const result = await response.json();
            set({ userProgress: result.data });
          }
        } catch (error) {
          console.error('Failed to fetch user progress:', error);
        } finally {
          set({ isLoadingProgress: false });
        }
      },

      fetchAchievements: async () => {
        set({ isLoadingAchievements: true });
        try {
          const response = await fetch(`${API_BASE_URL}/achievements/achievements`, {
            credentials: 'include',
          });
          if (response.ok) {
            const result = await response.json();
            set({ achievements: result.data });
          }
        } catch (error) {
          console.error('Failed to fetch achievements:', error);
        } finally {
          set({ isLoadingAchievements: false });
        }
      },

      fetchUnseenAchievements: async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/achievements/achievements/unseen`, {
            credentials: 'include',
          });
          if (response.ok) {
            const result = await response.json();
            set({ unseenAchievements: result.data });
          }
        } catch (error) {
          console.error('Failed to fetch unseen achievements:', error);
        }
      },

      fetchDailyChallenges: async () => {
        set({ isLoadingChallenges: true });
        try {
          const response = await fetch(`${API_BASE_URL}/achievements/daily-challenges`, {
            credentials: 'include',
          });
          if (response.ok) {
            const result = await response.json();
            set({
              dailyChallenges: result.data.challenges,
              allChallengesCompleted: result.data.allCompleted,
            });
          }
        } catch (error) {
          console.error('Failed to fetch daily challenges:', error);
        } finally {
          set({ isLoadingChallenges: false });
        }
      },

      fetchLeaderboard: async (type = 'xp') => {
        set({ isLoadingLeaderboard: true });
        try {
          const response = await fetch(
            `${API_BASE_URL}/achievements/leaderboard?type=${type}&limit=10`,
            {
              credentials: 'include',
            }
          );
          if (response.ok) {
            const result = await response.json();
            set({ leaderboard: result.data });
          }
        } catch (error) {
          console.error('Failed to fetch leaderboard:', error);
        } finally {
          set({ isLoadingLeaderboard: false });
        }
      },

      markAchievementsSeen: async (achievementIds) => {
        try {
          await fetch(`${API_BASE_URL}/achievements/achievements/seen`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ achievementIds }),
          });
          set({ unseenAchievements: [] });
        } catch (error) {
          console.error('Failed to mark achievements as seen:', error);
        }
      },

      updateActivity: async (activityType, data) => {
        try {
          const response = await fetch(`${API_BASE_URL}/achievements/activity`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ activityType, data }),
          });

          if (response.ok) {
            const result = await response.json();
            if (result.data.progress) {
              set({ userProgress: result.data.progress });
            }
            if (result.data.newAchievements?.length > 0) {
              set({ unseenAchievements: result.data.newAchievements });
            }
            // Refresh achievements and challenges
            get().fetchAchievements();
            get().fetchDailyChallenges();
          }
        } catch (error) {
          console.error('Failed to update activity:', error);
        }
      },
    }),
    {
      name: 'achievements-storage',
      partialize: (state) => ({
        userProgress: state.userProgress,
      }),
    }
  )
);
