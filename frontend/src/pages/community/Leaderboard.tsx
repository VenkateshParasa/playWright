import React, { useEffect } from 'react';
import { useCommunityStore } from '../../stores/communityStore';
import { Trophy, TrendingUp, Award, Users } from 'lucide-react';

const TIMEFRAMES = [
  { id: 'all', name: 'All Time' },
  { id: 'monthly', name: 'This Month' },
  { id: 'weekly', name: 'This Week' },
];

const CATEGORIES = [
  { id: 'reputation', name: 'Reputation' },
  { id: 'lessons', name: 'Lessons' },
  { id: 'quizzes', name: 'Quizzes' },
  { id: 'helpful', name: 'Helpful' },
  { id: 'streak', name: 'Streak' },
];

export default function Leaderboard() {
  const { leaderboard, myPosition, setLeaderboard, setMyPosition, setLoading } = useCommunityStore();
  const [timeframe, setTimeframe] = React.useState('all');
  const [category, setCategory] = React.useState('reputation');

  useEffect(() => {
    loadLeaderboard();
    loadMyPosition();
  }, [timeframe, category]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ timeframe, category });
      const response = await fetch(`/api/community/leaderboard/global?${params}`);
      const data = await response.json();

      if (data.success) {
        setLeaderboard(data.data.leaderboard);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyPosition = async () => {
    try {
      const params = new URLSearchParams({ category });
      const response = await fetch(`/api/community/leaderboard/my-position?${params}`);
      const data = await response.json();

      if (data.success) {
        setMyPosition(data.data);
      }
    } catch (error) {
      console.error('Error loading position:', error);
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-orange-600';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) return <Trophy size={20} className={getRankColor(rank)} />;
    return <span className={`font-bold ${getRankColor(rank)}`}>#{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Leaderboard</h1>
          <p className="text-gray-600 dark:text-gray-400">See how you rank among fellow learners</p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Timeframe
              </label>
              <div className="flex gap-2">
                {TIMEFRAMES.map((tf) => (
                  <button
                    key={tf.id}
                    onClick={() => setTimeframe(tf.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      timeframe === tf.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {tf.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      category === cat.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* My Position */}
        {myPosition && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 mb-6 text-white">
            <h2 className="text-xl font-bold mb-4">Your Position</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-3xl font-bold">#{myPosition.rank}</div>
                <div className="text-blue-100 text-sm">Rank</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{myPosition.score}</div>
                <div className="text-blue-100 text-sm">Score</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{myPosition.percentile}%</div>
                <div className="text-blue-100 text-sm">Top</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{myPosition.total}</div>
                <div className="text-blue-100 text-sm">Total Users</div>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Reputation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Lessons
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Quizzes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Badges
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {leaderboard.map((entry) => (
                  <tr
                    key={entry.user._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getRankIcon(entry.rank)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img
                          src={entry.user.avatar || `https://ui-avatars.com/api/?name=${entry.user.firstName}+${entry.user.lastName}`}
                          alt={`${entry.user.firstName} ${entry.user.lastName}`}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {entry.user.firstName} {entry.user.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                        <Award size={16} />
                        <span className="font-semibold">{entry.stats.reputation}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                      {entry.stats.lessonsCompleted}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                      {entry.stats.quizzesCompleted}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-1">
                        {entry.badges.slice(0, 3).map((badge, i) => (
                          <span
                            key={i}
                            className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs"
                            title={badge.name}
                          >
                            {badge.name[0]}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
