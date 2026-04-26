import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserProgress {
  totalXP: number;
  currentLevel: number;
  xpToNextLevel: number;
  coins: number;
  currentStreak: number;
  longestStreak: number;
  lessonsCompleted: number;
  quizzesCompleted: number;
  quizzesPassed: number;
  perfectQuizzes: number;
  exercisesCompleted: number;
  flashcardsReviewed: number;
  masteredFlashcards: number;
  totalStudyTime: number;
  xpBreakdown: {
    lessons: number;
    quizzes: number;
    exercises: number;
    flashcards: number;
    social: number;
    streaks: number;
    achievements: number;
    other: number;
  };
  dailyXPGoal: number;
  dailyXPEarned: number;
}

export interface Achievement {
  id: string;
  achievementId: string;
  name: string;
  description: string;
  category: string;
  tier: string;
  xpReward: number;
  coinReward: number;
  icon: string;
  isSecret: boolean;
  unlocked?: boolean;
  unlockedAt?: Date;
  progress?: number;
  percentage?: number;
  seen?: boolean;
}

export interface Quest {
  id: string;
  questId: string;
  name: string;
  description: string;
  type: string;
  difficulty: string;
  category: string;
  requirements: { type: string; value: number; description: string }[];
  rewards: { xp: number; coins: number; items?: string[] };
  icon: string;
  progress?: { requirementIndex: number; currentValue: number; targetValue: number }[];
  completed?: boolean;
  active?: boolean;
}

export interface Reward {
  id: string;
  rewardId: string;
  name: string;
  description: string;
  type: string;
  rarity: string;
  cost: number;
  icon: string;
  preview?: string;
  isLimited: boolean;
  stock?: number;
  requirementLevel?: number;
  requirementAchievements?: string[];
}

export interface Competition {
  id: string;
  competitionId: string;
  name: string;
  description: string;
  type: string;
  status: string;
  category: string;
  startDate: Date;
  endDate: Date;
  prizes: any[];
  leaderboard: any[];
  icon: string;
  banner?: string;
}

export interface LeaderboardEntry {
  rank: number;
  user: { id: string; name: string; avatar?: string };
  totalXP: number;
  currentLevel: number;
  currentStreak: number;
  achievementsCount: number;
}

interface GamificationState {
  // User progress
  userProgress: UserProgress | null;

  // Achievements
  achievements: Achievement[];
  unseenAchievements: Achievement[];

  // Quests
  dailyQuests: Quest[];
  allQuests: Quest[];

  // Rewards & Inventory
  rewards: Reward[];
  inventory: any[];
  equippedItems: any;
  activeBoosters: any[];

  // Competitions
  competitions: Competition[];
  activeCompetitions: Competition[];
  userCompetitions: { active: Competition[]; history: any[] };

  // Leaderboards
  leaderboard: LeaderboardEntry[];
  userRank: { rank: number | null; totalUsers: number } | null;

  // Loading states
  isLoading: boolean;

  // Actions
  fetchUserProgress: () => Promise<void>;
  fetchAchievements: () => Promise<void>;
  fetchUnseenAchievements: () => Promise<void>;
  markAchievementsSeen: (achievementIds: string[]) => Promise<void>;
  trackActivity: (activityType: string, data?: any) => Promise<any>;

  fetchDailyQuests: () => Promise<void>;
  fetchAllQuests: (type?: string, category?: string) => Promise<void>;
  startQuest: (questId: string) => Promise<void>;

  fetchRewards: (type?: string, rarity?: string) => Promise<void>;
  fetchInventory: () => Promise<void>;
  purchaseReward: (rewardId: string) => Promise<any>;
  equipItem: (rewardId: string, slot: string) => Promise<void>;
  activateBooster: (rewardId: string) => Promise<void>;

  fetchCompetitions: (status?: string, type?: string) => Promise<void>;
  fetchActiveCompetitions: () => Promise<void>;
  fetchUserCompetitions: () => Promise<void>;
  joinCompetition: (competitionId: string) => Promise<void>;

  fetchLeaderboard: (type?: string, limit?: number, timeFrame?: string) => Promise<void>;
  fetchUserRank: (type?: string) => Promise<void>;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      userProgress: null,
      achievements: [],
      unseenAchievements: [],
      dailyQuests: [],
      allQuests: [],
      rewards: [],
      inventory: [],
      equippedItems: {},
      activeBoosters: [],
      competitions: [],
      activeCompetitions: [],
      userCompetitions: { active: [], history: [] },
      leaderboard: [],
      userRank: null,
      isLoading: false,

      fetchUserProgress: async () => {
        set({ isLoading: true });
        try {
          const response = await fetch(`${API_BASE_URL}/gamification/progress`, {
            credentials: 'include',
          });
          if (response.ok) {
            const result = await response.json();
            set({ userProgress: result.data });
          }
        } catch (error) {
          console.error('Failed to fetch user progress:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      fetchAchievements: async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/gamification/achievements`, {
            credentials: 'include',
          });
          if (response.ok) {
            const result = await response.json();
            set({ achievements: result.data });
          }
        } catch (error) {
          console.error('Failed to fetch achievements:', error);
        }
      },

      fetchUnseenAchievements: async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/gamification/achievements/unseen`, {
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

      markAchievementsSeen: async (achievementIds) => {
        try {
          await fetch(`${API_BASE_URL}/gamification/achievements/seen`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ achievementIds }),
          });
          set({ unseenAchievements: [] });
        } catch (error) {
          console.error('Failed to mark achievements as seen:', error);
        }
      },

      trackActivity: async (activityType, data) => {
        try {
          const response = await fetch(`${API_BASE_URL}/gamification/activity`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ activityType, data }),
          });

          if (response.ok) {
            const result = await response.json();
            if (result.data.progress) {
              set((state) => ({
                userProgress: { ...state.userProgress!, ...result.data.progress },
              }));
            }

            if (result.data.newAchievements?.length > 0) {
              set({ unseenAchievements: result.data.newAchievements });
            }

            get().fetchAchievements();
            get().fetchDailyQuests();

            return result.data;
          }
        } catch (error) {
          console.error('Failed to track activity:', error);
        }
      },

      fetchDailyQuests: async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/gamification/quests/daily`, {
            credentials: 'include',
          });
          if (response.ok) {
            const result = await response.json();
            set({ dailyQuests: result.data });
          }
        } catch (error) {
          console.error('Failed to fetch daily quests:', error);
        }
      },

      fetchAllQuests: async (type, category) => {
        try {
          let url = `${API_BASE_URL}/gamification/quests?`;
          if (type) url += `type=${type}&`;
          if (category) url += `category=${category}&`;

          const response = await fetch(url, { credentials: 'include' });
          if (response.ok) {
            const result = await response.json();
            set({ allQuests: result.data });
          }
        } catch (error) {
          console.error('Failed to fetch quests:', error);
        }
      },

      startQuest: async (questId) => {
        try {
          const response = await fetch(`${API_BASE_URL}/gamification/quests/${questId}/start`, {
            method: 'POST',
            credentials: 'include',
          });
          if (response.ok) {
            get().fetchAllQuests();
            get().fetchDailyQuests();
          }
        } catch (error) {
          console.error('Failed to start quest:', error);
        }
      },

      fetchRewards: async (type, rarity) => {
        try {
          let url = `${API_BASE_URL}/gamification/rewards?`;
          if (type) url += `type=${type}&`;
          if (rarity) url += `rarity=${rarity}&`;

          const response = await fetch(url, { credentials: 'include' });
          if (response.ok) {
            const result = await response.json();
            set({ rewards: result.data });
          }
        } catch (error) {
          console.error('Failed to fetch rewards:', error);
        }
      },

      fetchInventory: async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/gamification/inventory`, {
            credentials: 'include',
          });
          if (response.ok) {
            const result = await response.json();
            set({
              inventory: result.data.inventory,
              equippedItems: result.data.equippedItems,
              activeBoosters: result.data.activeBoosters,
            });
          }
        } catch (error) {
          console.error('Failed to fetch inventory:', error);
        }
      },

      purchaseReward: async (rewardId) => {
        try {
          const response = await fetch(`${API_BASE_URL}/gamification/rewards/${rewardId}/purchase`, {
            method: 'POST',
            credentials: 'include',
          });

          const result = await response.json();

          if (response.ok) {
            get().fetchUserProgress();
            get().fetchInventory();
          }

          return result;
        } catch (error) {
          console.error('Failed to purchase reward:', error);
          return { success: false, message: 'Failed to purchase reward' };
        }
      },

      equipItem: async (rewardId, slot) => {
        try {
          const response = await fetch(`${API_BASE_URL}/gamification/inventory/equip`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rewardId, slot }),
          });

          if (response.ok) {
            get().fetchInventory();
          }
        } catch (error) {
          console.error('Failed to equip item:', error);
        }
      },

      activateBooster: async (rewardId) => {
        try {
          const response = await fetch(`${API_BASE_URL}/gamification/boosters/${rewardId}/activate`, {
            method: 'POST',
            credentials: 'include',
          });

          if (response.ok) {
            get().fetchInventory();
          }
        } catch (error) {
          console.error('Failed to activate booster:', error);
        }
      },

      fetchCompetitions: async (status, type) => {
        try {
          let url = `${API_BASE_URL}/gamification/competitions?`;
          if (status) url += `status=${status}&`;
          if (type) url += `type=${type}&`;

          const response = await fetch(url, { credentials: 'include' });
          if (response.ok) {
            const result = await response.json();
            set({ competitions: result.data });
          }
        } catch (error) {
          console.error('Failed to fetch competitions:', error);
        }
      },

      fetchActiveCompetitions: async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/gamification/competitions/active`, {
            credentials: 'include',
          });
          if (response.ok) {
            const result = await response.json();
            set({ activeCompetitions: result.data });
          }
        } catch (error) {
          console.error('Failed to fetch active competitions:', error);
        }
      },

      fetchUserCompetitions: async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/gamification/competitions/mine`, {
            credentials: 'include',
          });
          if (response.ok) {
            const result = await response.json();
            set({ userCompetitions: result.data });
          }
        } catch (error) {
          console.error('Failed to fetch user competitions:', error);
        }
      },

      joinCompetition: async (competitionId) => {
        try {
          const response = await fetch(`${API_BASE_URL}/gamification/competitions/${competitionId}/join`, {
            method: 'POST',
            credentials: 'include',
          });

          if (response.ok) {
            get().fetchActiveCompetitions();
            get().fetchUserCompetitions();
            get().fetchUserProgress();
          }
        } catch (error) {
          console.error('Failed to join competition:', error);
        }
      },

      fetchLeaderboard: async (type = 'xp', limit = 100, timeFrame) => {
        try {
          let url = `${API_BASE_URL}/gamification/leaderboard?type=${type}&limit=${limit}`;
          if (timeFrame) url += `&timeFrame=${timeFrame}`;

          const response = await fetch(url, { credentials: 'include' });
          if (response.ok) {
            const result = await response.json();
            set({ leaderboard: result.data });
          }
        } catch (error) {
          console.error('Failed to fetch leaderboard:', error);
        }
      },

      fetchUserRank: async (type = 'xp') => {
        try {
          const response = await fetch(`${API_BASE_URL}/gamification/leaderboard/rank?type=${type}`, {
            credentials: 'include',
          });
          if (response.ok) {
            const result = await response.json();
            set({ userRank: result.data });
          }
        } catch (error) {
          console.error('Failed to fetch user rank:', error);
        }
      },
    }),
    {
      name: 'gamification-storage',
      partialize: (state) => ({
        userProgress: state.userProgress,
      }),
    }
  )
);
