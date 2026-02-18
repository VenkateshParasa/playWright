import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Achievement, achievementCategories } from '../../data/achievements';
import AchievementBadge from './AchievementBadge';
import { Filter, Search, Trophy, Lock, CheckCircle } from 'lucide-react';

interface AchievementListProps {
  achievements: (Achievement & {
    unlocked?: boolean;
    progress?: number;
    percentage?: number;
  })[];
  isLoading?: boolean;
}

export default function AchievementList({ achievements, isLoading }: AchievementListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 bg-gray-200 rounded-full" />
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const filteredAchievements = achievements.filter((achievement) => {
    const matchesCategory = selectedCategory === 'all' || achievement.category === selectedCategory;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'unlocked' && achievement.unlocked) ||
      (filterStatus === 'locked' && !achievement.unlocked);
    const matchesSearch =
      searchQuery === '' ||
      achievement.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      achievement.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesStatus && matchesSearch;
  });

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const completionPercentage = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Achievement Progress</h2>
            <p className="text-purple-100">
              {unlockedCount} of {totalCount} achievements unlocked
            </p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold mb-1">{completionPercentage}%</div>
            <Trophy className="w-8 h-8 mx-auto" />
          </div>
        </div>
        <div className="mt-4 bg-white/20 rounded-full h-3 overflow-hidden">
          <motion.div
            className="bg-white h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search achievements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {achievementCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === 'all'
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            All
          </button>
          <button
            onClick={() => setFilterStatus('unlocked')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === 'unlocked'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Unlocked
          </button>
          <button
            onClick={() => setFilterStatus('locked')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === 'locked'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Lock className="w-4 h-4" />
            Locked
          </button>
        </div>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredAchievements.map((achievement) => (
            <motion.div
              key={achievement.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className={`
                bg-white rounded-lg shadow-md p-6 cursor-pointer
                hover:shadow-lg transition-shadow
                ${achievement.unlocked ? 'border-l-4 border-green-500' : 'border-l-4 border-gray-300'}
              `}
              onClick={() => setSelectedAchievement(achievement)}
            >
              <div className="flex items-start gap-4">
                <AchievementBadge achievement={achievement} size="medium" showProgress />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-gray-900 mb-1 truncate">
                    {achievement.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {achievement.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                      +{achievement.xpReward} XP
                    </span>
                    {achievement.unlocked ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Unlocked
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
                        {achievement.progress || 0}/{achievement.condition.target}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress bar for locked achievements */}
              {!achievement.unlocked && achievement.percentage !== undefined && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{Math.round(achievement.percentage)}%</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-purple-500 to-indigo-600 h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${achievement.percentage}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredAchievements.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No achievements found</p>
          <p className="text-gray-400 text-sm">Try adjusting your filters</p>
        </div>
      )}

      {/* Achievement Detail Modal */}
      <AnimatePresence>
        {selectedAchievement && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedAchievement(null)}
          >
            <motion.div
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center text-center">
                <AchievementBadge achievement={selectedAchievement} size="large" showProgress />
                <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-2">
                  {selectedAchievement.name}
                </h2>
                <p className="text-gray-600 mb-4">{selectedAchievement.description}</p>

                <div className="w-full space-y-3">
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">XP Reward</span>
                    <span className="text-lg font-bold text-purple-600">
                      +{selectedAchievement.xpReward} XP
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Category</span>
                    <span className="text-sm font-semibold text-gray-900 capitalize">
                      {selectedAchievement.category}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Requirement</span>
                    <span className="text-sm text-gray-900">
                      {selectedAchievement.condition.description}
                    </span>
                  </div>

                  {selectedAchievement.unlocked ? (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-700 flex items-center gap-2 justify-center">
                        <CheckCircle className="w-4 h-4" />
                        Unlocked on{' '}
                        {selectedAchievement.unlockedAt
                          ? new Date(selectedAchievement.unlockedAt).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <p className="text-sm font-medium text-orange-700 mb-2">
                        Progress: {selectedAchievement.progress || 0}/{selectedAchievement.condition.target}
                      </p>
                      <div className="bg-orange-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-orange-500 h-full rounded-full"
                          style={{ width: `${selectedAchievement.percentage || 0}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setSelectedAchievement(null)}
                  className="mt-6 px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
