import { Flame } from 'lucide-react';

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
  isLoading?: boolean;
}

export default function StreakCounter({
  currentStreak,
  longestStreak,
  isLoading = false,
}: StreakCounterProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-16 bg-gray-200 rounded"></div>
      </div>
    );
  }

  const streakColor = currentStreak >= 7 ? 'text-orange-600' : 'text-orange-500';
  const bgColor = currentStreak >= 7 ? 'bg-orange-100' : 'bg-orange-50';
  const borderColor = currentStreak >= 7 ? 'border-orange-200' : 'border-orange-100';

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <Flame className={`w-5 h-5 ${streakColor}`} />
        <h3 className="text-lg font-semibold text-gray-900">Daily Streak</h3>
      </div>

      <div className={`${bgColor} ${borderColor} border rounded-lg p-6 text-center mb-4`}>
        <div className="flex items-center justify-center mb-2">
          <Flame className={`w-12 h-12 ${streakColor}`} />
        </div>
        <div className={`text-5xl font-bold ${streakColor} mb-1`}>
          {currentStreak}
        </div>
        <p className="text-sm text-gray-600 font-medium">
          {currentStreak === 1 ? 'Day' : 'Days'} in a row
        </p>
      </div>

      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <span className="text-sm text-gray-600">Longest Streak</span>
        <span className="text-lg font-bold text-gray-900">
          {longestStreak} {longestStreak === 1 ? 'day' : 'days'}
        </span>
      </div>

      {currentStreak > 0 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
          <p className="text-xs text-blue-800 text-center">
            {currentStreak >= longestStreak && currentStreak > 1
              ? "New record! Keep it going!"
              : currentStreak >= 7
              ? "Amazing streak! You're on fire!"
              : "Keep learning daily to maintain your streak!"}
          </p>
        </div>
      )}
    </div>
  );
}
