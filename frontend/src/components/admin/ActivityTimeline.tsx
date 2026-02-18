import { Activity } from '../../types/admin';
import { CheckCircle, BookOpen, Code, Trophy, RotateCcw } from 'lucide-react';

interface ActivityTimelineProps {
  activities: Activity[];
}

export default function ActivityTimeline({ activities }: ActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No activity recorded yet
      </div>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'lesson_completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'quiz_completed':
        return <BookOpen className="w-5 h-5 text-blue-600" />;
      case 'exercise_completed':
        return <Code className="w-5 h-5 text-purple-600" />;
      case 'achievement_unlocked':
        return <Trophy className="w-5 h-5 text-yellow-600" />;
      case 'review_session':
        return <RotateCcw className="w-5 h-5 text-indigo-600" />;
      default:
        return <CheckCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'lesson_completed':
        return 'Completed Lesson';
      case 'quiz_completed':
        return 'Completed Quiz';
      case 'exercise_completed':
        return 'Completed Exercise';
      case 'achievement_unlocked':
        return 'Unlocked Achievement';
      case 'review_session':
        return 'Review Session';
      default:
        return type;
    }
  };

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {activities.map((activity, idx) => (
          <li key={idx}>
            <div className="relative pb-8">
              {idx !== activities.length - 1 && (
                <span
                  className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex items-start space-x-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white">
                    {getActivityIcon(activity.type)}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {getActivityLabel(activity.type)}
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                  {activity.metadata && (
                    <div className="mt-2 text-sm text-gray-600">
                      <pre className="text-xs bg-gray-50 p-2 rounded">
                        {JSON.stringify(activity.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
