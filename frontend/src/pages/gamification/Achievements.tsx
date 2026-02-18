import React, { useEffect, useState } from 'react';
import { useGamificationStore } from '../../stores/gamificationStore';
import { AchievementCard } from '../../components/gamification/AchievementCard';
import { XPBar } from '../../components/gamification/XPBar';

export const AchievementsPage: React.FC = () => {
  const {
    userProgress,
    achievements,
    fetchUserProgress,
    fetchAchievements,
    isLoading,
  } = useGamificationStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);

  useEffect(() => {
    fetchUserProgress();
    fetchAchievements();
  }, []);

  const categories = ['all', 'learning', 'srs', 'speed', 'quality', 'consistency', 'social', 'special'];
  const tiers = ['all', 'bronze', 'silver', 'gold', 'platinum'];

  const filteredAchievements = achievements.filter((achievement) => {
    if (selectedCategory !== 'all' && achievement.category !== selectedCategory) return false;
    if (selectedTier !== 'all' && achievement.tier !== selectedTier) return false;
    if (showUnlockedOnly && !achievement.unlocked) return false;
    return true;
  });

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Achievements</h1>
        {userProgress && (
          <div className="mb-6">
            <XPBar totalXP={userProgress.totalXP} showLevel showNumbers animate />
          </div>
        )}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {unlockedCount} / {totalCount} Unlocked
              </h2>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all"
                  style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
                />
              </div>
            </div>
            <div className="text-6xl">🏆</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <select
            className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Tier</label>
          <select
            className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
          >
            {tiers.map((tier) => (
              <option key={tier} value={tier}>
                {tier.charAt(0).toUpperCase() + tier.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="mr-2"
              checked={showUnlockedOnly}
              onChange={(e) => setShowUnlockedOnly(e.target.checked)}
            />
            <span className="text-sm">Show unlocked only</span>
          </label>
        </div>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAchievements.map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No achievements match your filters.
        </div>
      )}
    </div>
  );
};
