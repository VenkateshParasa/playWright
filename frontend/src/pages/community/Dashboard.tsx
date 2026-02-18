import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Users, Trophy, TrendingUp, Award, Star } from 'lucide-react';

export default function CommunityDashboard() {
  const [dashboard, setDashboard] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await fetch('/api/community/profiles/dashboard');
      const data = await response.json();
      if (data.success) {
        setDashboard(data.data);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Community
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Connect, learn, and grow with fellow test automation enthusiasts
          </p>
        </div>

        {/* Stats */}
        {dashboard?.stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Discussions</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {dashboard.stats.totalThreads.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <MessageSquare size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Community Members</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {dashboard.stats.totalMembers.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Users size={24} className="text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Study Groups</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {dashboard.stats.totalGroups.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Trophy size={24} className="text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link
            to="/community/forum"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition"
          >
            <MessageSquare size={32} className="text-blue-600 dark:text-blue-400 mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Forum</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ask questions and share knowledge
            </p>
          </Link>

          <Link
            to="/community/study-groups"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition"
          >
            <Users size={32} className="text-green-600 dark:text-green-400 mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Study Groups</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Learn together with peers
            </p>
          </Link>

          <Link
            to="/community/leaderboard"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition"
          >
            <Trophy size={32} className="text-yellow-600 dark:text-yellow-400 mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Leaderboard</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              See top performers
            </p>
          </Link>

          <Link
            to="/community/messages"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition"
          >
            <MessageSquare size={32} className="text-purple-600 dark:text-purple-400 mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Messages</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Connect with members
            </p>
          </Link>
        </div>

        {/* Trending Discussions */}
        {dashboard?.trendingThreads && dashboard.trendingThreads.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp size={24} />
                Trending Discussions
              </h2>
              <Link
                to="/community/forum?sort=trending"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {dashboard.trendingThreads.map((thread: any) => (
                <Link
                  key={thread._id}
                  to={`/community/forum/thread/${thread._id}`}
                  className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={thread.author.avatar || `https://ui-avatars.com/api/?name=${thread.author.firstName}+${thread.author.lastName}`}
                      alt={thread.author.firstName}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {thread.title}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <span>{thread.author.firstName} {thread.author.lastName}</span>
                        <span>•</span>
                        <span>{thread.views} views</span>
                        <span>•</span>
                        <span>{thread.replyCount} replies</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Members */}
          {dashboard?.activeMembers && dashboard.activeMembers.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Star size={24} />
                Active Members This Week
              </h2>
              <div className="space-y-3">
                {dashboard.activeMembers.map((member: any, index: number) => (
                  <Link
                    key={member.user._id}
                    to={`/community/profile/${member.user._id}`}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition"
                  >
                    <span className="text-lg font-bold text-gray-400 w-6">
                      #{index + 1}
                    </span>
                    <img
                      src={member.user.avatar || `https://ui-avatars.com/api/?name=${member.user.firstName}+${member.user.lastName}`}
                      alt={member.user.firstName}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {member.user.firstName} {member.user.lastName}
                      </p>
                      <div className="flex items-center gap-2">
                        <Award size={14} className="text-yellow-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {member.reputation} reputation
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Popular Groups */}
          {dashboard?.popularGroups && dashboard.popularGroups.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Users size={24} />
                Popular Study Groups
              </h2>
              <div className="space-y-3">
                {dashboard.popularGroups.map((group: any) => (
                  <Link
                    key={group._id}
                    to={`/community/study-groups/${group._id}`}
                    className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={group.avatar || '/default-group-avatar.png'}
                        alt={group.name}
                        className="w-12 h-12 rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {group.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {group.members?.length || 0} members
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
