import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { User, UserFilters, UserStats, Activity, Role } from '../types/admin';

interface AdminUserState {
  // Users list
  users: User[];
  selectedUsers: string[];
  totalUsers: number;
  currentPage: number;
  totalPages: number;

  // Filters and sorting
  filters: UserFilters;

  // Statistics
  stats: UserStats | null;

  // Current user detail
  currentUser: User | null;
  currentUserActivity: Activity[];

  // Roles
  roles: Role[];

  // Loading states
  isLoading: boolean;
  isLoadingStats: boolean;
  isLoadingActivity: boolean;

  // Error state
  error: string | null;

  // Actions
  setUsers: (users: User[], total: number, page: number, totalPages: number) => void;
  setFilters: (filters: Partial<UserFilters>) => void;
  setStats: (stats: UserStats) => void;
  setCurrentUser: (user: User | null) => void;
  setCurrentUserActivity: (activity: Activity[]) => void;
  setRoles: (roles: Role[]) => void;
  setSelectedUsers: (userIds: string[]) => void;
  toggleUserSelection: (userId: string) => void;
  selectAllUsers: () => void;
  deselectAllUsers: () => void;
  setLoading: (loading: boolean) => void;
  setLoadingStats: (loading: boolean) => void;
  setLoadingActivity: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentPage: (page: number) => void;
  reset: () => void;
}

const initialFilters: UserFilters = {
  search: '',
  role: 'all',
  status: 'all',
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export const useAdminUserStore = create<AdminUserState>()(
  devtools(
    (set, get) => ({
      // Initial state
      users: [],
      selectedUsers: [],
      totalUsers: 0,
      currentPage: 1,
      totalPages: 1,
      filters: initialFilters,
      stats: null,
      currentUser: null,
      currentUserActivity: [],
      roles: [],
      isLoading: false,
      isLoadingStats: false,
      isLoadingActivity: false,
      error: null,

      // Actions
      setUsers: (users, total, page, totalPages) =>
        set({ users, totalUsers: total, currentPage: page, totalPages }),

      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
          currentPage: 1, // Reset to first page when filters change
        })),

      setStats: (stats) => set({ stats }),

      setCurrentUser: (user) => set({ currentUser: user }),

      setCurrentUserActivity: (activity) =>
        set({ currentUserActivity: activity }),

      setRoles: (roles) => set({ roles }),

      setSelectedUsers: (userIds) => set({ selectedUsers: userIds }),

      toggleUserSelection: (userId) =>
        set((state) => {
          const isSelected = state.selectedUsers.includes(userId);
          return {
            selectedUsers: isSelected
              ? state.selectedUsers.filter((id) => id !== userId)
              : [...state.selectedUsers, userId],
          };
        }),

      selectAllUsers: () =>
        set((state) => ({
          selectedUsers: state.users.map((u) => u.id),
        })),

      deselectAllUsers: () => set({ selectedUsers: [] }),

      setLoading: (loading) => set({ isLoading: loading }),

      setLoadingStats: (loading) => set({ isLoadingStats: loading }),

      setLoadingActivity: (loading) => set({ isLoadingActivity: loading }),

      setError: (error) => set({ error }),

      setCurrentPage: (page) => set({ currentPage: page }),

      reset: () =>
        set({
          users: [],
          selectedUsers: [],
          totalUsers: 0,
          currentPage: 1,
          totalPages: 1,
          filters: initialFilters,
          stats: null,
          currentUser: null,
          currentUserActivity: [],
          isLoading: false,
          isLoadingStats: false,
          isLoadingActivity: false,
          error: null,
        }),
    }),
    { name: 'admin-user-store' }
  )
);
