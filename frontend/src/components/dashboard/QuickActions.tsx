import { BookOpen, Brain, Code, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickActionsProps {
  nextLessonId?: string;
  nextLessonTitle?: string;
  reviewsAvailable: number;
  exercisesAvailable: number;
  isLoading?: boolean;
}

export default function QuickActions({
  nextLessonId,
  nextLessonTitle,
  reviewsAvailable,
  exercisesAvailable,
  isLoading = false,
}: QuickActionsProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="space-y-3">
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const actions = [
    {
      id: 'continue-learning',
      title: nextLessonTitle || 'Continue Learning',
      description: nextLessonId
        ? 'Resume your current lesson'
        : 'Start your learning journey',
      icon: BookOpen,
      color: 'blue',
      badge: null,
      onClick: () => navigate(nextLessonId ? `/lessons/${nextLessonId}` : '/lessons'),
      disabled: false,
    },
    {
      id: 'review-cards',
      title: 'Review Flashcards',
      description: 'Practice with spaced repetition',
      icon: Brain,
      color: 'purple',
      badge: reviewsAvailable > 0 ? reviewsAvailable : null,
      onClick: () => navigate('/flashcards'),
      disabled: false,
    },
    {
      id: 'practice-exercises',
      title: 'Practice Exercises',
      description: 'Work on coding challenges',
      icon: Code,
      color: 'green',
      badge: exercisesAvailable > 0 ? exercisesAvailable : null,
      onClick: () => navigate('/exercises'),
      disabled: false,
    },
  ];

  const colorClasses = {
    blue: {
      bg: 'bg-blue-50 hover:bg-blue-100',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      badge: 'bg-blue-600',
    },
    purple: {
      bg: 'bg-purple-50 hover:bg-purple-100',
      border: 'border-purple-200',
      icon: 'text-purple-600',
      badge: 'bg-purple-600',
    },
    green: {
      bg: 'bg-green-50 hover:bg-green-100',
      border: 'border-green-200',
      icon: 'text-green-600',
      badge: 'bg-green-600',
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <ArrowRight className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
      </div>

      <div className="space-y-3">
        {actions.map((action) => {
          const Icon = action.icon;
          const colors = colorClasses[action.color as keyof typeof colorClasses];

          return (
            <button
              key={action.id}
              onClick={action.onClick}
              disabled={action.disabled}
              className={`w-full ${colors.bg} ${colors.border} border rounded-lg p-4 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group`}
            >
              <div className="flex items-center gap-4">
                <div className={`rounded-full p-3 bg-white shadow-sm`}>
                  <Icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-gray-900">
                      {action.title}
                    </h4>
                    {action.badge && (
                      <span
                        className={`${colors.badge} text-white text-xs font-bold px-2 py-0.5 rounded-full`}
                      >
                        {action.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600">{action.description}</p>
                </div>
                <ArrowRight
                  className={`w-5 h-5 ${colors.icon} group-hover:translate-x-1 transition-transform`}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Additional quick links */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/progress')}
            className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            View Progress
          </button>
          <button
            onClick={() => navigate('/lessons')}
            className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            Browse Lessons
          </button>
        </div>
      </div>
    </div>
  );
}
