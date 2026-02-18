import React, { useEffect } from 'react';
import { useGamificationStore } from '../../stores/gamificationStore';

export const QuestsPage: React.FC = () => {
  const {
    dailyQuests,
    allQuests,
    fetchDailyQuests,
    fetchAllQuests,
    startQuest,
  } = useGamificationStore();

  const [selectedTab, setSelectedTab] = React.useState<'daily' | 'weekly' | 'story' | 'all'>('daily');

  useEffect(() => {
    fetchDailyQuests();
    fetchAllQuests();
  }, []);

  const getQuestsForTab = () => {
    switch (selectedTab) {
      case 'daily':
        return dailyQuests;
      case 'weekly':
        return allQuests.filter((q) => q.type === 'weekly');
      case 'story':
        return allQuests.filter((q) => q.type === 'story' || q.type === 'tutorial');
      default:
        return allQuests;
    }
  };

  const questsToDisplay = getQuestsForTab();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'hard':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'epic':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Quests</h1>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b">
        {(['daily', 'weekly', 'story', 'all'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`px-6 py-3 font-medium capitalize transition-all ${
              selectedTab === tab
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Quest List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {questsToDisplay.map((quest) => {
          const overallProgress = quest.progress
            ? (quest.progress.reduce((sum, p) => sum + (p.currentValue / p.targetValue), 0) /
                quest.requirements.length) *
              100
            : 0;

          return (
            <div
              key={quest.id}
              className={`bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden border-2 ${
                quest.completed
                  ? 'border-green-500'
                  : quest.active
                  ? 'border-purple-500'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{quest.icon}</div>
                    <div>
                      <h3 className="font-bold text-xl mb-1">{quest.name}</h3>
                      <div className="flex gap-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${getDifficultyColor(
                            quest.difficulty
                          )}`}
                        >
                          {quest.difficulty}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 font-medium capitalize">
                          {quest.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  {quest.completed && (
                    <div className="text-4xl text-green-600">✓</div>
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 mb-4">{quest.description}</p>

                {/* Requirements */}
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Requirements:</h4>
                  {quest.requirements.map((req, index) => {
                    const progress = quest.progress?.[index];
                    const percentage = progress
                      ? (progress.currentValue / progress.targetValue) * 100
                      : 0;

                    return (
                      <div key={index} className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>{req.description}</span>
                          {progress && (
                            <span className="font-medium">
                              {progress.currentValue} / {progress.targetValue}
                            </span>
                          )}
                        </div>
                        {quest.active && !quest.completed && (
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="h-full bg-purple-600 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Rewards */}
                <div className="border-t pt-4 mb-4">
                  <h4 className="font-medium mb-2">Rewards:</h4>
                  <div className="flex gap-4">
                    <span className="text-purple-600 dark:text-purple-400 font-bold">
                      {quest.rewards.xp} XP
                    </span>
                    <span className="text-yellow-600 dark:text-yellow-400 font-bold">
                      {quest.rewards.coins} 🪙
                    </span>
                    {quest.rewards.items && quest.rewards.items.length > 0 && (
                      <span className="text-blue-600 dark:text-blue-400 font-bold">
                        + {quest.rewards.items.length} item(s)
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                {quest.completed ? (
                  <button
                    disabled
                    className="w-full bg-green-600 text-white py-2 rounded-lg font-bold opacity-50"
                  >
                    Completed ✓
                  </button>
                ) : quest.active ? (
                  <div className="w-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 py-2 rounded-lg font-bold text-center">
                    In Progress ({overallProgress.toFixed(0)}%)
                  </div>
                ) : (
                  <button
                    onClick={() => startQuest(quest.questId)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-bold transition-all"
                  >
                    Start Quest
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {questsToDisplay.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No quests available in this category.
        </div>
      )}
    </div>
  );
};
