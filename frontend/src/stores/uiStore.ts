/**
 * UI Store
 * Manages UI state including sidebar, toasts, modals, and global UI elements
 * Enhanced with devtools and comprehensive UI state management
 */

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import type { UIStore, Toast, Modal, Breadcrumb } from '../types/store';

// ============================================================================
// Initial State
// ============================================================================

const initialState = {
  sidebarOpen: true,
  sidebarCollapsed: false,
  toasts: [],
  modals: [],
  isOnline: navigator.onLine,
  isSyncing: false,
  lastSyncAt: undefined,
  globalLoading: false,
  pageTitle: 'Learning Platform',
  breadcrumbs: [],
};

// ============================================================================
// Store Implementation
// ============================================================================

export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // ====================================================================
        // Toggle Sidebar
        // ====================================================================
        toggleSidebar: () => {
          set(
            { sidebarOpen: !get().sidebarOpen },
            false,
            'ui/toggleSidebar'
          );
        },

        // ====================================================================
        // Collapse Sidebar
        // ====================================================================
        collapseSidebar: (collapsed: boolean) => {
          set({ sidebarCollapsed: collapsed }, false, 'ui/collapseSidebar');
        },

        // ====================================================================
        // Show Toast
        // ====================================================================
        showToast: (toast: Omit<Toast, 'id'>) => {
          const id = `toast-${Date.now()}-${Math.random()}`;
          const newToast: Toast = {
            ...toast,
            id,
            duration: toast.duration || 3000,
          };

          set(
            {
              toasts: [...get().toasts, newToast],
            },
            false,
            'ui/showToast'
          );

          // Auto-hide toast after duration
          if (newToast.duration && newToast.duration > 0) {
            setTimeout(() => {
              get().hideToast(id);
            }, newToast.duration);
          }
        },

        // ====================================================================
        // Hide Toast
        // ====================================================================
        hideToast: (id: string) => {
          set(
            {
              toasts: get().toasts.filter((t) => t.id !== id),
            },
            false,
            'ui/hideToast'
          );
        },

        // ====================================================================
        // Open Modal
        // ====================================================================
        openModal: (modal: Omit<Modal, 'id'>) => {
          const id = `modal-${Date.now()}-${Math.random()}`;
          const newModal: Modal = {
            ...modal,
            id,
          };

          set(
            {
              modals: [...get().modals, newModal],
            },
            false,
            'ui/openModal'
          );
        },

        // ====================================================================
        // Close Modal
        // ====================================================================
        closeModal: (id: string) => {
          set(
            {
              modals: get().modals.filter((m) => m.id !== id),
            },
            false,
            'ui/closeModal'
          );
        },

        // ====================================================================
        // Close All Modals
        // ====================================================================
        closeAllModals: () => {
          set({ modals: [] }, false, 'ui/closeAllModals');
        },

        // ====================================================================
        // Set Online Status
        // ====================================================================
        setOnlineStatus: (isOnline: boolean) => {
          set({ isOnline }, false, 'ui/setOnlineStatus');

          // Show toast when connection status changes
          if (isOnline) {
            get().showToast({
              type: 'success',
              message: 'Connection restored',
              duration: 2000,
            });
          } else {
            get().showToast({
              type: 'warning',
              message: 'You are offline',
              duration: 0, // Don't auto-hide
            });
          }
        },

        // ====================================================================
        // Set Sync Status
        // ====================================================================
        setSyncStatus: (isSyncing: boolean) => {
          set({ isSyncing }, false, 'ui/setSyncStatus');

          if (!isSyncing) {
            set(
              { lastSyncAt: new Date().toISOString() },
              false,
              'ui/updateLastSync'
            );
          }
        },

        // ====================================================================
        // Update Last Sync
        // ====================================================================
        updateLastSync: () => {
          set(
            { lastSyncAt: new Date().toISOString() },
            false,
            'ui/updateLastSync'
          );
        },

        // ====================================================================
        // Set Global Loading
        // ====================================================================
        setGlobalLoading: (loading: boolean) => {
          set({ globalLoading: loading }, false, 'ui/setGlobalLoading');
        },

        // ====================================================================
        // Set Page Title
        // ====================================================================
        setPageTitle: (title: string) => {
          set({ pageTitle: title }, false, 'ui/setPageTitle');

          // Update document title
          document.title = `${title} | Learning Platform`;
        },

        // ====================================================================
        // Set Breadcrumbs
        // ====================================================================
        setBreadcrumbs: (breadcrumbs: Breadcrumb[]) => {
          set({ breadcrumbs }, false, 'ui/setBreadcrumbs');
        },
      }),
      {
        name: 'ui-storage',
        partialize: (state) => ({
          sidebarOpen: state.sidebarOpen,
          sidebarCollapsed: state.sidebarCollapsed,
        }),
      }
    ),
    {
      name: 'UIStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

// Listen for online/offline events
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useUIStore.getState().setOnlineStatus(true);
  });

  window.addEventListener('offline', () => {
    useUIStore.getState().setOnlineStatus(false);
  });
}

// ============================================================================
// Selectors
// ============================================================================

export const selectSidebarOpen = (state: UIStore) => state.sidebarOpen;
export const selectSidebarCollapsed = (state: UIStore) => state.sidebarCollapsed;
export const selectToasts = (state: UIStore) => state.toasts;
export const selectModals = (state: UIStore) => state.modals;
export const selectIsOnline = (state: UIStore) => state.isOnline;
export const selectIsSyncing = (state: UIStore) => state.isSyncing;
export const selectGlobalLoading = (state: UIStore) => state.globalLoading;
export const selectPageTitle = (state: UIStore) => state.pageTitle;
export const selectBreadcrumbs = (state: UIStore) => state.breadcrumbs;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Shows a success toast
 */
export const showSuccessToast = (message: string, duration?: number) => {
  useUIStore.getState().showToast({
    type: 'success',
    message,
    duration,
  });
};

/**
 * Shows an error toast
 */
export const showErrorToast = (message: string, duration?: number) => {
  useUIStore.getState().showToast({
    type: 'error',
    message,
    duration,
  });
};

/**
 * Shows an info toast
 */
export const showInfoToast = (message: string, duration?: number) => {
  useUIStore.getState().showToast({
    type: 'info',
    message,
    duration,
  });
};

/**
 * Shows a warning toast
 */
export const showWarningToast = (message: string, duration?: number) => {
  useUIStore.getState().showToast({
    type: 'warning',
    message,
    duration,
  });
};

/**
 * Opens a confirmation modal
 */
export const openConfirmModal = (props: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
}) => {
  useUIStore.getState().openModal({
    type: 'confirm',
    props,
  });
};

/**
 * Checks if app is online
 */
export const isOnline = (): boolean => {
  return useUIStore.getState().isOnline;
};

/**
 * Checks if app is syncing
 */
export const isSyncing = (): boolean => {
  return useUIStore.getState().isSyncing;
};
