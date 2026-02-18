import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface Thread {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  category: 'general' | 'help' | 'show-and-tell' | 'announcements';
  tags: string[];
  upvotes: string[];
  downvotes: string[];
  views: number;
  replyCount: number;
  isPinned: boolean;
  isLocked: boolean;
  bestAnswer?: string;
  bookmarkedBy: string[];
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
}

export interface Reply {
  _id: string;
  thread: string;
  content: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  parentReply?: string;
  upvotes: string[];
  downvotes: string[];
  isBestAnswer: boolean;
  mentions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface StudyGroup {
  _id: string;
  name: string;
  description: string;
  owner: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  moderators: any[];
  members: any[];
  memberCount: number;
  isPrivate: boolean;
  inviteCode?: string;
  maxMembers: number;
  category: string;
  tags: string[];
  avatar?: string;
  banner?: string;
  schedule?: any[];
  goals: string[];
  announcements: any[];
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  _id: string;
  participants: any[];
  type: 'direct' | 'group';
  groupName?: string;
  lastMessage?: {
    content: string;
    sender: string;
    timestamp: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  conversation: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  content: string;
  attachments: any[];
  readBy: any[];
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  stats: {
    reputation: number;
    lessonsCompleted: number;
    quizzesCompleted: number;
    helpfulReplies: number;
  };
  badges: any[];
}

export interface UserProfile {
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    email: string;
  };
  bio: string;
  location?: string;
  website?: string;
  socialLinks: {
    github?: string;
    twitter?: string;
    linkedin?: string;
  };
  badges: any[];
  stats: {
    threadsCreated: number;
    repliesPosted: number;
    helpfulReplies: number;
    reputation: number;
    studyStreak: number;
    lessonsCompleted: number;
    quizzesCompleted: number;
  };
  followers: number;
  following: number;
  isFollowing?: boolean;
  isOwnProfile?: boolean;
  activity?: any[];
}

interface CommunityState {
  // Forum state
  threads: Thread[];
  currentThread: Thread | null;
  replies: Reply[];
  bookmarkedThreads: Thread[];

  // Study groups state
  studyGroups: StudyGroup[];
  currentGroup: StudyGroup | null;
  myGroups: StudyGroup[];

  // Messages state
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  unreadCount: number;

  // Leaderboard state
  leaderboard: LeaderboardEntry[];
  myPosition: any;

  // Profile state
  currentProfile: UserProfile | null;

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Actions - Forum
  setThreads: (threads: Thread[]) => void;
  setCurrentThread: (thread: Thread | null) => void;
  setReplies: (replies: Reply[]) => void;
  addReply: (reply: Reply) => void;
  updateThread: (threadId: string, updates: Partial<Thread>) => void;
  toggleBookmark: (threadId: string, isBookmarked: boolean) => void;

  // Actions - Study Groups
  setStudyGroups: (groups: StudyGroup[]) => void;
  setCurrentGroup: (group: StudyGroup | null) => void;
  setMyGroups: (groups: StudyGroup[]) => void;
  addStudyGroup: (group: StudyGroup) => void;
  updateStudyGroup: (groupId: string, updates: Partial<StudyGroup>) => void;

  // Actions - Messages
  setConversations: (conversations: Conversation[]) => void;
  setCurrentConversation: (conversation: Conversation | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setUnreadCount: (count: number) => void;

  // Actions - Leaderboard
  setLeaderboard: (entries: LeaderboardEntry[]) => void;
  setMyPosition: (position: any) => void;

  // Actions - Profile
  setCurrentProfile: (profile: UserProfile | null) => void;

  // Actions - General
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  threads: [],
  currentThread: null,
  replies: [],
  bookmarkedThreads: [],
  studyGroups: [],
  currentGroup: null,
  myGroups: [],
  conversations: [],
  currentConversation: null,
  messages: [],
  unreadCount: 0,
  leaderboard: [],
  myPosition: null,
  currentProfile: null,
  isLoading: false,
  error: null,
};

export const useCommunityStore = create<CommunityState>()(
  persist(
    (set) => ({
      ...initialState,

      // Forum actions
      setThreads: (threads) => set({ threads }),
      setCurrentThread: (thread) => set({ currentThread: thread, replies: [] }),
      setReplies: (replies) => set({ replies }),
      addReply: (reply) => set((state) => ({
        replies: [...state.replies, reply],
        currentThread: state.currentThread ? {
          ...state.currentThread,
          replyCount: state.currentThread.replyCount + 1,
        } : null,
      })),
      updateThread: (threadId, updates) => set((state) => ({
        threads: state.threads.map(t => t._id === threadId ? { ...t, ...updates } : t),
        currentThread: state.currentThread?._id === threadId
          ? { ...state.currentThread, ...updates }
          : state.currentThread,
      })),
      toggleBookmark: (threadId, isBookmarked) => set((state) => ({
        bookmarkedThreads: isBookmarked
          ? [...state.bookmarkedThreads, state.threads.find(t => t._id === threadId)!].filter(Boolean)
          : state.bookmarkedThreads.filter(t => t._id !== threadId),
      })),

      // Study group actions
      setStudyGroups: (groups) => set({ studyGroups: groups }),
      setCurrentGroup: (group) => set({ currentGroup: group }),
      setMyGroups: (groups) => set({ myGroups: groups }),
      addStudyGroup: (group) => set((state) => ({
        studyGroups: [group, ...state.studyGroups],
        myGroups: [group, ...state.myGroups],
      })),
      updateStudyGroup: (groupId, updates) => set((state) => ({
        studyGroups: state.studyGroups.map(g => g._id === groupId ? { ...g, ...updates } : g),
        currentGroup: state.currentGroup?._id === groupId
          ? { ...state.currentGroup, ...updates }
          : state.currentGroup,
      })),

      // Message actions
      setConversations: (conversations) => set({ conversations }),
      setCurrentConversation: (conversation) => set({ currentConversation: conversation, messages: [] }),
      setMessages: (messages) => set({ messages }),
      addMessage: (message) => set((state) => ({
        messages: [...state.messages, message],
      })),
      setUnreadCount: (count) => set({ unreadCount: count }),

      // Leaderboard actions
      setLeaderboard: (entries) => set({ leaderboard: entries }),
      setMyPosition: (position) => set({ myPosition: position }),

      // Profile actions
      setCurrentProfile: (profile) => set({ currentProfile: profile }),

      // General actions
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      reset: () => set(initialState),
    }),
    {
      name: 'community-storage',
      partialize: (state) => ({
        bookmarkedThreads: state.bookmarkedThreads,
        myGroups: state.myGroups,
        unreadCount: state.unreadCount,
      }),
    }
  )
);
