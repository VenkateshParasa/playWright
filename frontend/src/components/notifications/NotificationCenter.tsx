import React, { useState, useEffect, useMemo } from 'react';
import {
  Bell,
  Settings,
  Filter,
  CheckCheck,
  Archive,
  Trash2,
  X,
  Search,
  ChevronDown,
  Inbox,
  Clock,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import NotificationItem from './NotificationItem';
import { useNotificationStore } from '../../stores/notificationStore';
import type { NotificationType, NotificationPriority, NotificationFilter } from '../../types/notification.types';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings?: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  onOpenSettings,
}) => {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAllAsRead,
    batchArchive,
    batchDelete,
    clearAll,
    filterNotifications,
    clearError,
  } = useNotificationStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'archived'>('all');
  const [selectedType, setSelectedType] = useState<NotificationType | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<NotificationPriority | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Fetch notifications on mount
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  // Filter notifications based on active tab and filters
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // Apply tab filter
    switch (activeTab) {
      case 'unread':
        filtered = filtered.filter(n => !n.read && !n.archived);
        break;
      case 'archived':
        filtered = filtered.filter(n => n.archived);
        break;
      case 'all':
      default:
        filtered = filtered.filter(n => !n.archived);
        break;
    }

    // Apply type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(n => n.type === selectedType);
    }

    // Apply priority filter
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(n => n.priority === selectedPriority);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        n =>
          n.title.toLowerCase().includes(query) ||
          n.message.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [notifications, activeTab, selectedType, selectedPriority, searchQuery]);

  // Handle select all
  const handleSelectAll = () => {
    if (selectedIds.length === filteredNotifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredNotifications.map(n => n.id));
    }
  };

  // Handle batch mark as read
  const handleBatchMarkAsRead = async () => {
    if (selectedIds.length > 0) {
      const { batchMarkAsRead } = useNotificationStore.getState();
      await batchMarkAsRead(selectedIds);
      setSelectedIds([]);
    }
  };

  // Handle batch archive
  const handleBatchArchive = async () => {
    if (selectedIds.length > 0) {
      await batchArchive(selectedIds);
      setSelectedIds([]);
    }
  };

  // Handle batch delete
  const handleBatchDelete = async () => {
    if (selectedIds.length > 0 && confirm('Are you sure you want to delete selected notifications?')) {
      await batchDelete(selectedIds);
      setSelectedIds([]);
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  // Handle clear all
  const handleClearAll = async () => {
    if (confirm('Are you sure you want to clear all notifications?')) {
      await clearAll();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h2>
                {unreadCount > 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {unreadCount} unread
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                title="Filters"
              >
                <Filter size={20} />
              </button>

              {onOpenSettings && (
                <button
                  onClick={onOpenSettings}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                  title="Settings"
                >
                  <Settings size={20} />
                </button>
              )}

              <button
                onClick={onClose}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notifications..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as NotificationType | 'all')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                >
                  <option value="all">All Types</option>
                  <option value="srs_reviews_due">SRS Reviews Due</option>
                  <option value="new_lesson">New Lesson</option>
                  <option value="quiz_deadline">Quiz Deadline</option>
                  <option value="achievement_unlocked">Achievement Unlocked</option>
                  <option value="feedback_received">Feedback Received</option>
                  <option value="streak_milestone">Streak Milestone</option>
                  <option value="lesson_completed">Lesson Completed</option>
                  <option value="system">System</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priority
                </label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value as NotificationPriority | 'all')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                >
                  <option value="all">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'all'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'unread'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setActiveTab('archived')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'archived'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Archived
            </button>
          </div>

          {/* Actions bar */}
          {filteredNotifications.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedIds.length === filteredNotifications.length && filteredNotifications.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedIds.length > 0 ? `${selectedIds.length} selected` : 'Select all'}
                </span>
              </div>

              {selectedIds.length > 0 ? (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleBatchMarkAsRead}
                    className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
                    title="Mark as read"
                  >
                    <CheckCheck size={18} />
                  </button>
                  <button
                    onClick={handleBatchArchive}
                    className="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900 rounded"
                    title="Archive"
                  >
                    <Archive size={18} />
                  </button>
                  <button
                    onClick={handleBatchDelete}
                    className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  {activeTab === 'unread' && unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => fetchNotifications()}
                    className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    title="Refresh"
                  >
                    <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
                <button
                  onClick={clearError}
                  className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Notification list */}
          <div className="flex-1 overflow-y-auto">
            {isLoading && filteredNotifications.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-400">Loading notifications...</p>
                </div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Inbox className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No notifications
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {activeTab === 'unread'
                      ? "You're all caught up!"
                      : activeTab === 'archived'
                      ? 'No archived notifications'
                      : "You don't have any notifications yet"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2 p-4">
                {filteredNotifications.map((notification) => (
                  <div key={notification.id} className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(notification.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds([...selectedIds, notification.id]);
                        } else {
                          setSelectedIds(selectedIds.filter(id => id !== notification.id));
                        }
                      }}
                      className="mt-5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <NotificationItem
                        notification={notification}
                        showActions={true}
                        onClose={() => {}}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {filteredNotifications.length > 0 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleClearAll}
                className="w-full px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                Clear All Notifications
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
