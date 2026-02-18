import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Award, Target, Users, Zap, TrendingUp } from 'lucide-react';
import { useAchievementsStore } from '../stores/achievementsStore';
import AchievementList from '../components/achievements/AchievementList';
import AchievementNotification from '../components/achievements/AchievementNotification';
import LevelProgress from '../components/achievements/LevelProgress';
import DailyChallenge from '../components/achievements/DailyChallenge';
import Leaderboard from '../components/achievements/Leaderboard';
import XPBar from '../components/achievements/XPBar';
import { getXPForNextLevel } from '../data/achievements';

export default function Achievements() {
  const [activeTab, setActiveTab] = useState<'achievements' | 'challenges' | 'leaderboard'>(
    'achievements'
  );
  const [currentNotification, setCurrentNotification] = useState<any>(null);

  const {
    userProgress,
    achievements,
    unseenAchievements,
    dailyChallenges,
    allChallengesCompleted,
    leaderboard,
    isLoadingProgress,
    isLoadingAchievements,
    isLoadingChallenges,
    isLoadingLeaderboard,
    fetchUserProgress,
    fetchAchievements,
    fetchUnseenAchievements,
    fetchDailyChallenges,
    fetchLeaderboard,
    markAchievementsSeen,
    clearUnseenAchievements,
  } = useAchievementsStore();

  useEffect(() => {
    fetchUserProgress();
    fetchAchievements();
    fetchUnseenAchievements();
    fetchDailyChallenges();
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    if (unseenAchievements.length > 0) {
      setCurrentNotification(unseenAchievements[0]);
    }
  }, [unseenAchievements]);

  const handleCloseNotification = () => {
    if (currentNotification) {
      markAchievementsSeen([currentNotification.id]);
    }
    setCurrentNotification(null);
  };

  const xpInfo = userProgress ? getXPForNextLevel(userProgress.totalXP) : null;

  const stats = [
    {
      icon: Trophy,
      label: 'Achievements',
      value: achievements.filter((a) => a.unlocked).length,
      total: achievements.length,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      icon: Zap,
      label: 'Total XP',
      value: userProgress?.totalXP.toLocaleString() || '0',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: TrendingUp,
      label: 'Level',
      value: userProgress?.currentLevel || 1,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Target,
      label: 'Current Streak',
      value: `${userProgress?.streak.currentStreak || 0} days`,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Trophy className="w-10 h-10 text-yellow-500" />
            Achievements & Progress
          </h1>
          <p className="text-gray-600">Track your learning journey and compete with others</p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                className="bg-white rounded-lg shadow-md p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center gap-4">
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                      {stat.total && (
                        <span className="text-lg text-gray-400">/{stat.total}</span>
                      )}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Level Progress and XP Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {userProgress && (
              <LevelProgress currentLevel={userProgress.currentLevel} totalXP={userProgress.totalXP} />
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <DailyChallenge
              challenges={dailyChallenges}
              allCompleted={allChallengesCompleted}
              isLoading={isLoadingChallenges}
            />
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-md p-2 flex gap-2">
            <button
              onClick={() => setActiveTab('achievements')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'achievements'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Award className="w-5 h-5" />
              Achievements
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'leaderboard'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Users className="w-5 h-5" />
              Leaderboard
            </button>
          </div>
        </div>

        {/* Tab content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'achievements' && (
            <AchievementList achievements={achievements} isLoading={isLoadingAchievements} />
          )}

          {activeTab === 'leaderboard' && (
            <div className="grid grid-cols-1 gap-6">
              <Leaderboard
                entries={leaderboard}
                currentUserId="current-user-id" // TODO: Get from auth store
                isLoading={isLoadingLeaderboard}
              />
            </div>
          )}
        </motion.div>

        {/* Achievement notification */}
        <AchievementNotification
          achievement={currentNotification}
          onClose={handleCloseNotification}
        />
      </div>
    </div>
  );
}
