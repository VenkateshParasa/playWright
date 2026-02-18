import { Award, Trophy, Star, Zap } from 'lucide-react';
import { format } from 'date-fns';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: 'award' | 'trophy' | 'star' | 'zap';
  color: string;
  earnedAt: Date;
}

interface RecentAchievementsProps {
  achievements: Achievement[];
  totalAchievements: number;
  isLoading?: boolean;
}

const iconMap = {
  award: Award,
  trophy: Trophy,
  star: Star,
  zap: Zap,
};

const colorMap: Record<string, { bg: string; border: string; icon: string }> = {
  gold: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: 'text-yellow-600',
  },
  silver: {
    bg: 'bg-gray-50',
    border: 'border-gray-300',
    icon: 'text-gray-600',
  },
  bronze: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    icon: 'text-orange-600',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-600',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    icon: 'text-purple-600',
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'text-green-600',
  },
};

export default function RecentAchievements({
  achievements,
  totalAchievements,
  isLoading = false,
}: RecentAchievementsProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="space-y-3">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const recentAchievements = achievements.slice(0, 3);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">Recent Achievements</h3>
        </div>
        <div className="bg-yellow-100 px-3 py-1 rounded-full">
          <span className="text-sm font-semibold text-yellow-700">
            {totalAchievements} Total
          </span>
        </div>
      </div>

      {recentAchievements.length > 0 ? (
        <div className="space-y-3">
          {recentAchievements.map((achievement) => {
            const Icon = iconMap[achievement.icon];
            const colors = colorMap[achievement.color] || colorMap.blue;

            return (
              <div
                key={achievement.id}
                className={`${colors.bg} ${colors.border} border rounded-lg p-4 transition-all hover:shadow-md`}
              >
                <div className="flex items-start gap-3">
                  <div className={`${colors.bg} rounded-full p-2 border-2 ${colors.border}`}>
                    <Icon className={`w-6 h-6 ${colors.icon}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">
                      {achievement.title}
                    </h4>
                    <p className="text-xs text-gray-600 mb-2">
                      {achievement.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      Earned {format(achievement.earnedAt, 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No achievements yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Keep learning to unlock your first badge!
          </p>
        </div>
      )}

      {achievements.length > 3 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
            View All Achievements
          </button>
        </div>
      )}
    </div>
  );
}
