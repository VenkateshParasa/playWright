import React, { useEffect, useState } from 'react';
import { useGamificationStore } from '../../stores/gamificationStore';

export const LeaderboardPage: React.FC = () => {
  const { leaderboard, userRank, fetchLeaderboard, fetchUserRank } = useGamificationStore();
  const [leaderboardType, setLeaderboardType] = useState<'xp' | 'level' | 'streak'>('xp');
  const [timeFrame, setTimeFrame] = useState<'all' | 'daily' | 'weekly' | 'monthly'>('all');

  useEffect(() => {
    fetchLeaderboard(leaderboardType, 100, timeFrame === 'all' ? undefined : timeFrame);
    fetchUserRank(leaderboardType);
  }, [leaderboardType, timeFrame]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Leaderboard</h1>

      {/* User Rank Card */}
      {userRank && userRank.rank && (
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-6 mb-8 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Your Rank</h2>
              <p className="text-lg">#{userRank.rank} out of {userRank.totalUsers} users</p>
            </div>
            <div className="text-6xl">🏆</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <select
          className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
          value={leaderboardType}
          onChange={(e) => setLeaderboardType(e.target.value as 'xp' | 'level' | 'streak')}
        >
          <option value="xp">Total XP</option>
          <option value="level">Level</option>
          <option value="streak">Streak</option>
        </select>
        <select
          className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
          value={timeFrame}
          onChange={(e) => setTimeFrame(e.target.value as any)}
        >
          <option value="all">All Time</option>
          <option value="monthly">This Month</option>
          <option value="weekly">This Week</option>
          <option value="daily">Today</option>
        </select>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  XP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Streak
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Achievements
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {leaderboard.map((entry, index) => (
                <tr
                  key={entry.user.id}
                  className={`${
                    index < 3 ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''
                  } hover:bg-gray-50 dark:hover:bg-gray-800`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {entry.rank === 1 && <span className="text-2xl mr-2">🥇</span>}
                      {entry.rank === 2 && <span className="text-2xl mr-2">🥈</span>}
                      {entry.rank === 3 && <span className="text-2xl mr-2">🥉</span>}
                      <span className="font-bold text-lg">#{entry.rank}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold mr-3">
                        {entry.user.name.charAt(0)}
                      </div>
                      <span className="font-medium">{entry.user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-bold text-purple-600 dark:text-purple-400">
                      {entry.currentLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {entry.totalXP.toLocaleString()} XP
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="flex items-center">
                      🔥 {entry.currentStreak}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    🏆 {entry.achievementsCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
