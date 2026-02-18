import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  Bell,
  BookOpen,
  Award,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Clock,
  Flame,
  Info,
  X,
  Archive,
  ExternalLink,
  Eye,
  EyeOff,
} from 'lucide-react';
import type { Notification, NotificationType, NotificationPriority } from '../../types/notification.types';
import { useNotificationStore } from '../../stores/notificationStore';

interface NotificationItemProps {
  notification: Notification;
  compact?: boolean;
  showActions?: boolean;
  onClose?: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  compact = false,
  showActions = true,
  onClose,
}) => {
  const { markAsRead, markAsUnread, archiveNotification, deleteNotification } = useNotificationStore();

  // Get icon based on notification type
  const getIcon = (type: NotificationType) => {
    const iconProps = { size: compact ? 16 : 20 };

    switch (type) {
      case 'srs_reviews_due':
        return <Bell {...iconProps} />;
      case 'new_lesson':
        return <BookOpen {...iconProps} />;
      case 'achievement_unlocked':
        return <Award {...iconProps} />;
      case 'feedback_received':
        return <MessageSquare {...iconProps} />;
      case 'quiz_deadline':
        return <Clock {...iconProps} />;
      case 'streak_milestone':
        return <Flame {...iconProps} />;
      case 'lesson_completed':
        return <CheckCircle {...iconProps} />;
      case 'system':
        return <Info {...iconProps} />;
      default:
        return <Bell {...iconProps} />;
    }
  };

  // Get color based on priority
  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case 'urgent':
        return 'border-red-500 bg-red-50 dark:bg-red-950';
      case 'high':
        return 'border-orange-500 bg-orange-50 dark:bg-orange-950';
      case 'medium':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-950';
      case 'low':
        return 'border-gray-500 bg-gray-50 dark:bg-gray-950';
      default:
        return 'border-gray-300 bg-white dark:bg-gray-900';
    }
  };

  // Get icon color based on type
  const getIconColor = (type: NotificationType) => {
    switch (type) {
      case 'srs_reviews_due':
        return 'text-blue-600 dark:text-blue-400';
      case 'new_lesson':
        return 'text-green-600 dark:text-green-400';
      case 'achievement_unlocked':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'feedback_received':
        return 'text-purple-600 dark:text-purple-400';
      case 'quiz_deadline':
        return 'text-orange-600 dark:text-orange-400';
      case 'streak_milestone':
        return 'text-red-600 dark:text-red-400';
      case 'lesson_completed':
        return 'text-teal-600 dark:text-teal-400';
      case 'system':
        return 'text-gray-600 dark:text-gray-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (notification.read) {
      await markAsUnread(notification.id);
    } else {
      await markAsRead(notification.id);
    }
  };

  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await archiveNotification(notification.id);
    onClose?.();
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteNotification(notification.id);
    onClose?.();
  };

  const handleActionClick = (url: string) => {
    markAsRead(notification.id);
    window.location.href = url;
    onClose?.();
  };

  return (
    <div
      className={`
        relative border-l-4 rounded-lg p-4 transition-all duration-200
        ${notification.read ? 'opacity-60' : 'opacity-100'}
        ${getPriorityColor(notification.priority)}
        hover:shadow-md
        ${compact ? 'p-3' : 'p-4'}
      `}
    >
      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Close notification"
        >
          <X size={16} />
        </button>
      )}

      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className={`flex-shrink-0 ${getIconColor(notification.type)}`}>
          {getIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h4
            className={`
              font-semibold text-gray-900 dark:text-gray-100
              ${compact ? 'text-sm' : 'text-base'}
              ${!notification.read ? 'font-bold' : ''}
            `}
          >
            {notification.title}
          </h4>

          {/* Message */}
          <p
            className={`
              text-gray-700 dark:text-gray-300 mt-1
              ${compact ? 'text-xs' : 'text-sm'}
            `}
          >
            {notification.message}
          </p>

          {/* Timestamp */}
          <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
            <Clock size={12} className="mr-1" />
            <span>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>

            {/* Priority badge */}
            {notification.priority === 'urgent' && (
              <span className="ml-2 px-2 py-0.5 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs rounded">
                Urgent
              </span>
            )}
          </div>

          {/* Actions */}
          {showActions && notification.actions && notification.actions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {notification.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleActionClick(action.url)}
                  className={`
                    inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md
                    transition-colors duration-200
                    ${
                      action.primary
                        ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }
                  `}
                >
                  {action.label}
                  <ExternalLink size={14} className="ml-1" />
                </button>
              ))}
            </div>
          )}

          {/* Quick actions */}
          {showActions && (
            <div className="flex items-center space-x-3 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleMarkAsRead}
                className="flex items-center text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                title={notification.read ? 'Mark as unread' : 'Mark as read'}
              >
                {notification.read ? <EyeOff size={14} /> : <Eye size={14} />}
                <span className="ml-1">{notification.read ? 'Unread' : 'Read'}</span>
              </button>

              <button
                onClick={handleArchive}
                className="flex items-center text-xs text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                title="Archive"
              >
                <Archive size={14} />
                <span className="ml-1">Archive</span>
              </button>

              <button
                onClick={handleDelete}
                className="flex items-center text-xs text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Delete"
              >
                <X size={14} />
                <span className="ml-1">Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Image if present */}
      {notification.imageUrl && !compact && (
        <div className="mt-3 rounded-md overflow-hidden">
          <img
            src={notification.imageUrl}
            alt={notification.title}
            className="w-full h-auto object-cover"
          />
        </div>
      )}

      {/* Unread indicator */}
      {!notification.read && (
        <div className="absolute top-4 left-0 w-2 h-2 bg-blue-600 rounded-full -ml-1" />
      )}
    </div>
  );
};

export default NotificationItem;
