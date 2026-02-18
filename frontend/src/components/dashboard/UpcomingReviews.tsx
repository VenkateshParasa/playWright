import { Clock, Brain, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Review {
  id: string;
  title: string;
  dueTime: Date;
  category: string;
}

interface UpcomingReviewsProps {
  totalDueToday: number;
  totalDueTomorrow: number;
  upcomingReviews: Review[];
  isLoading?: boolean;
}

export default function UpcomingReviews({
  totalDueToday,
  totalDueTomorrow,
  upcomingReviews,
  isLoading = false,
}: UpcomingReviewsProps) {
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

  const urgentReviews = upcomingReviews.slice(0, 3);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">Upcoming Reviews</h3>
      </div>

      {/* Review counts */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-medium text-gray-600">Due Today</span>
          </div>
          <p className="text-3xl font-bold text-purple-600">{totalDueToday}</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-gray-600">Due Tomorrow</span>
          </div>
          <p className="text-3xl font-bold text-blue-600">{totalDueTomorrow}</p>
        </div>
      </div>

      {/* Next reviews list */}
      {urgentReviews.length > 0 ? (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Next Up:</h4>
          {urgentReviews.map((review) => (
            <div
              key={review.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {review.title}
                </p>
                <p className="text-xs text-gray-500">{review.category}</p>
              </div>
              <div className="ml-3 flex items-center gap-1 text-xs text-gray-600">
                <Clock className="w-3 h-3" />
                {format(review.dueTime, 'HH:mm')}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Brain className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No reviews due today</p>
          <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
        </div>
      )}

      {totalDueToday > urgentReviews.length && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-center text-gray-600">
            +{totalDueToday - urgentReviews.length} more reviews due today
          </p>
        </div>
      )}
    </div>
  );
}
