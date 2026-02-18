import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, TrendingUp, Flame, Zap, User } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  totalXP: number;
  currentLevel: number;
  currentStreak: number;
  achievementsCount: number;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  isLoading?: boolean;
}

export default function Leaderboard({ entries, currentUserId, isLoading }: LeaderboardProps) {
  const [sortBy, setSortBy] = useState<'xp' | 'level' | 'streak'>('xp');

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-700" />;
      default:
        return <span className="text-lg font-bold text-gray-500">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3:
        return 'bg-gradient-to-r from-amber-600 to-amber-800 text-white';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Leaderboard</h2>
          </div>
          <TrendingUp className="w-6 h-6" />
        </div>

        {/* Sort tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy('xp')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              sortBy === 'xp'
                ? 'bg-white text-purple-600'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <Zap className="w-4 h-4" />
            XP
          </button>
          <button
            onClick={() => setSortBy('level')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              sortBy === 'level'
                ? 'bg-white text-purple-600'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <Trophy className="w-4 h-4" />
            Level
          </button>
          <button
            onClick={() => setSortBy('streak')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              sortBy === 'streak'
                ? 'bg-white text-purple-600'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <Flame className="w-4 h-4" />
            Streak
          </button>
        </div>
      </div>

      {/* Leaderboard entries */}
      <div className="divide-y divide-gray-100">
        {entries.map((entry, index) => {
          const isCurrentUser = entry.user.id === currentUserId;

          return (
            <motion.div
              key={entry.user.id}
              className={`p-4 transition-colors ${
                isCurrentUser ? 'bg-purple-50 border-l-4 border-purple-500' : 'hover:bg-gray-50'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${getRankBadgeColor(entry.rank)}`}>
                  {getRankIcon(entry.rank)}
                </div>

                {/* Avatar */}
                <div className="flex-shrink-0">
                  {entry.user.avatar ? (
                    <img
                      src={entry.user.avatar}
                      alt={entry.user.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg border-2 border-gray-200">
                      {entry.user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* User info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-semibold truncate ${isCurrentUser ? 'text-purple-700' : 'text-gray-900'}`}>
                      {entry.user.name}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs font-medium text-purple-600">(You)</span>
                      )}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium">{entry.totalXP.toLocaleString()} XP</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Trophy className="w-4 h-4 text-purple-500" />
                      <span className="font-medium">Lvl {entry.currentLevel}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span className="font-medium">{entry.currentStreak} days</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Award className="w-4 h-4 text-green-500" />
                      <span className="font-medium">{entry.achievementsCount}</span>
                    </div>
                  </div>
                </div>

                {/* Medal for top 3 */}
                {entry.rank <= 3 && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: index * 0.1 + 0.3, type: 'spring' }}
                  >
                    {entry.rank === 1 && (
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-sm">1st</span>
                      </div>
                    )}
                    {entry.rank === 2 && (
                      <div className="w-8 h-8 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-sm">2nd</span>
                      </div>
                    )}
                    {entry.rank === 3 && (
                      <div className="w-8 h-8 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-sm">3rd</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty state */}
      {entries.length === 0 && (
        <div className="p-12 text-center">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No entries yet</p>
          <p className="text-gray-400 text-sm">Be the first to climb the leaderboard!</p>
        </div>
      )}
    </div>
  );
}
