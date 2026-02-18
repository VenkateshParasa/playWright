import { CheckCircle2, Lock, PlayCircle, Circle } from 'lucide-react';
import { LessonStatus } from '../../types/lesson.types';

interface ProgressBadgeProps {
  status: LessonStatus;
  progress?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export default function ProgressBadge({
  status,
  progress = 0,
  size = 'md',
  showLabel = true,
  className = '',
}: ProgressBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const getBadgeConfig = () => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle2,
          label: 'Completed',
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600',
        };
      case 'in-progress':
        return {
          icon: PlayCircle,
          label: `In Progress ${progress > 0 ? `(${progress}%)` : ''}`,
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
        };
      case 'locked':
        return {
          icon: Lock,
          label: 'Locked',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-600',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-500',
        };
      case 'available':
      default:
        return {
          icon: Circle,
          label: 'Available',
          bgColor: 'bg-purple-100',
          textColor: 'text-purple-700',
          borderColor: 'border-purple-200',
          iconColor: 'text-purple-600',
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-1.5 ${sizeClasses[size]} ${config.bgColor} ${config.textColor} ${config.borderColor} border rounded-full font-medium ${className}`}
    >
      <Icon className={`${iconSizes[size]} ${config.iconColor}`} />
      {showLabel && <span>{config.label}</span>}
    </div>
  );
}

// Compact version for use in small spaces
export function ProgressIcon({
  status,
  size = 'md',
  className = '',
}: Omit<ProgressBadgeProps, 'showLabel' | 'progress'>) {
  return <ProgressBadge status={status} size={size} showLabel={false} className={className} />;
}

// Progress indicator with percentage bar
export function ProgressIndicator({
  progress,
  status,
  showPercentage = true,
  size = 'md',
  className = '',
}: {
  progress: number;
  status: LessonStatus;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const heightClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const getProgressColor = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-blue-500';
      case 'locked':
        return 'bg-gray-300';
      case 'available':
      default:
        return 'bg-purple-500';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <ProgressBadge status={status} size="sm" />
        {showPercentage && (
          <span className="text-sm font-medium text-gray-600">{progress}%</span>
        )}
      </div>
      <div className={`w-full bg-gray-200 rounded-full ${heightClasses[size]} overflow-hidden`}>
        <div
          className={`${heightClasses[size]} ${getProgressColor()} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
