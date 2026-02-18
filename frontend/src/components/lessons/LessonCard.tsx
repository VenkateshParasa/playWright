import { Clock, BarChart3, Tag, Lock, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Lesson } from '../../types/lesson.types';
import { ProgressIndicator } from './ProgressBadge';
import { useNavigate } from 'react-router-dom';

interface LessonCardProps {
  lesson: Lesson;
  onClick?: () => void;
  className?: string;
}

export default function LessonCard({ lesson, onClick, className = '' }: LessonCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (lesson.status === 'locked') {
      return; // Don't allow navigation to locked lessons
    }
    if (onClick) {
      onClick();
    } else {
      navigate(`/lessons/${lesson.id}`);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'intermediate':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'advanced':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTagColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-700 border-blue-200',
      purple: 'bg-purple-100 text-purple-700 border-purple-200',
      green: 'bg-green-100 text-green-700 border-green-200',
      yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      orange: 'bg-orange-100 text-orange-700 border-orange-200',
      red: 'bg-red-100 text-red-700 border-red-200',
      pink: 'bg-pink-100 text-pink-700 border-pink-200',
      indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      teal: 'bg-teal-100 text-teal-700 border-teal-200',
      cyan: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    };
    return colors[color] || colors.blue;
  };

  const isLocked = lesson.status === 'locked';
  const hasUnmetPrerequisites = lesson.prerequisites.some((p) => !p.completed);

  return (
    <div
      onClick={handleClick}
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-200 ${
        isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-blue-300'
      } ${className}`}
    >
      {/* Header */}
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Week {lesson.week} • Module {lesson.module}
              </span>
              {isLocked && <Lock className="w-3.5 h-3.5 text-gray-400" />}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
              {lesson.title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">{lesson.description}</p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-4">
          <ProgressIndicator
            progress={lesson.progress}
            status={lesson.status}
            showPercentage={lesson.status === 'in-progress'}
            size="sm"
          />
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-4">
          {/* Estimated Duration */}
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{lesson.estimatedDuration} min</span>
          </div>

          {/* Difficulty */}
          <div className="flex items-center gap-1">
            <BarChart3 className="w-4 h-4" />
            <span
              className={`text-xs px-2 py-0.5 border rounded-full font-medium capitalize ${getDifficultyColor(
                lesson.difficulty
              )}`}
            >
              {lesson.difficulty}
            </span>
          </div>

          {/* Track Badge */}
          <div className="flex items-center gap-1">
            <span
              className={`text-xs px-2 py-0.5 border rounded-full font-medium ${
                lesson.track === '30-day'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : lesson.track === '60-day'
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : 'bg-gray-50 text-gray-700 border-gray-200'
              }`}
            >
              {lesson.track === 'both' ? 'Both Tracks' : lesson.track}
            </span>
          </div>
        </div>

        {/* Tags */}
        {lesson.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {lesson.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className={`inline-flex items-center gap-1 text-xs px-2 py-1 border rounded-md font-medium ${getTagColor(
                  tag.color
                )}`}
              >
                <Tag className="w-3 h-3" />
                {tag.name}
              </span>
            ))}
            {lesson.tags.length > 3 && (
              <span className="inline-flex items-center text-xs px-2 py-1 bg-gray-100 text-gray-600 border border-gray-200 rounded-md font-medium">
                +{lesson.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Prerequisites Warning */}
        {hasUnmetPrerequisites && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
            <div className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800 mb-1">
                  Prerequisites Required
                </p>
                <ul className="text-xs text-yellow-700 space-y-1">
                  {lesson.prerequisites
                    .filter((p) => !p.completed)
                    .map((prereq) => (
                      <li key={prereq.id} className="flex items-center gap-1">
                        <span className="w-1 h-1 bg-yellow-600 rounded-full"></span>
                        {prereq.title}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Topics Preview */}
        {lesson.topics.length > 0 && (
          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Topics Covered
            </p>
            <ul className="text-sm text-gray-700 space-y-1">
              {lesson.topics.slice(0, 3).map((topic, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-1">{topic}</span>
                </li>
              ))}
              {lesson.topics.length > 3 && (
                <li className="text-xs text-gray-500 italic">
                  +{lesson.topics.length - 3} more topics
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className={`px-5 py-3 border-t border-gray-100 flex items-center justify-between ${
          isLocked ? 'bg-gray-50' : 'bg-blue-50'
        }`}
      >
        <div className="text-sm">
          {lesson.status === 'completed' && lesson.completedAt && (
            <span className="text-green-600 font-medium">
              Completed {new Date(lesson.completedAt).toLocaleDateString()}
            </span>
          )}
          {lesson.status === 'in-progress' && lesson.startedAt && (
            <span className="text-blue-600 font-medium">
              Started {new Date(lesson.startedAt).toLocaleDateString()}
            </span>
          )}
          {lesson.status === 'available' && (
            <span className="text-purple-600 font-medium">Ready to start</span>
          )}
          {lesson.status === 'locked' && (
            <span className="text-gray-500 font-medium">Complete prerequisites to unlock</span>
          )}
        </div>
        {!isLocked && (
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
        )}
      </div>
    </div>
  );
}

// Compact version for list view
export function CompactLessonCard({ lesson, onClick, className = '' }: LessonCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (lesson.status === 'locked') return;
    if (onClick) {
      onClick();
    } else {
      navigate(`/lessons/${lesson.id}`);
    }
  };

  const isLocked = lesson.status === 'locked';

  return (
    <div
      onClick={handleClick}
      className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-4 border border-gray-200 ${
        isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-blue-300'
      } ${className}`}
    >
      <div className="flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-500 font-medium">
              W{lesson.week}M{lesson.module}
            </span>
            <h4 className="text-sm font-semibold text-gray-900 truncate">{lesson.title}</h4>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {lesson.estimatedDuration}m
            </span>
            <span className="capitalize">{lesson.difficulty}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ProgressIndicator
            progress={lesson.progress}
            status={lesson.status}
            showPercentage={false}
            size="sm"
            className="w-24"
          />
          {!isLocked && <ChevronRight className="w-4 h-4 text-gray-400" />}
        </div>
      </div>
    </div>
  );
}
