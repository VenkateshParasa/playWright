import React, { useEffect } from 'react';
import { useGamificationStore } from '../../stores/gamificationStore';
import { getRarityColor } from '../../lib/gamification/xpCalculator';

export const RewardShopPage: React.FC = () => {
  const {
    rewards,
    userProgress,
    inventory,
    fetchRewards,
    fetchUserProgress,
    fetchInventory,
    purchaseReward,
  } = useGamificationStore();

  const [selectedType, setSelectedType] = React.useState<string>('all');
  const [selectedRarity, setSelectedRarity] = React.useState<string>('all');

  useEffect(() => {
    fetchRewards();
    fetchUserProgress();
    fetchInventory();
  }, []);

  const handlePurchase = async (rewardId: string, cost: number) => {
    if (!userProgress || userProgress.coins < cost) {
      alert('Not enough coins!');
      return;
    }

    const result = await purchaseReward(rewardId);
    if (result.success) {
      alert('Purchase successful!');
    } else {
      alert(result.message);
    }
  };

  const filteredRewards = rewards.filter((reward) => {
    if (selectedType !== 'all' && reward.type !== selectedType) return false;
    if (selectedRarity !== 'all' && reward.rarity !== selectedRarity) return false;
    return true;
  });

  const isOwned = (rewardId: string) => {
    return inventory.some((item) => item.rewardId === rewardId);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Reward Shop</h1>
        {userProgress && (
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Your Coins</h2>
                <p className="text-4xl font-bold">{userProgress.coins.toLocaleString()} 🪙</p>
              </div>
              <div className="text-6xl">💰</div>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Type</label>
          <select
            className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="avatar">Avatars</option>
            <option value="frame">Frames</option>
            <option value="badge">Badges</option>
            <option value="title">Titles</option>
            <option value="theme">Themes</option>
            <option value="emoji">Emoji Packs</option>
            <option value="booster">Boosters</option>
            <option value="skip">Utility</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Rarity</label>
          <select
            className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            value={selectedRarity}
            onChange={(e) => setSelectedRarity(e.target.value)}
          >
            <option value="all">All Rarities</option>
            <option value="common">Common</option>
            <option value="rare">Rare</option>
            <option value="epic">Epic</option>
            <option value="legendary">Legendary</option>
          </select>
        </div>
      </div>

      {/* Reward Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredRewards.map((reward) => {
          const rarityColor = getRarityColor(reward.rarity);
          const owned = isOwned(reward.rewardId);
          const canAfford = userProgress && userProgress.coins >= reward.cost;

          return (
            <div
              key={reward.id}
              className="bg-white dark:bg-gray-900 rounded-lg border-2 shadow-lg overflow-hidden"
              style={{ borderColor: rarityColor }}
            >
              {/* Limited badge */}
              {reward.isLimited && (
                <div className="bg-red-600 text-white text-xs px-2 py-1 text-center font-bold">
                  LIMITED EDITION
                  {reward.stock && ` - ${reward.stock} left`}
                </div>
              )}

              {/* Icon */}
              <div className="p-6 text-center">
                <div className="text-6xl mb-4">{reward.icon}</div>
                <h3 className="font-bold text-lg mb-2">{reward.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {reward.description}
                </p>

                {/* Requirements */}
                {reward.requirementLevel && userProgress && (
                  <div className="text-sm mb-2">
                    {userProgress.currentLevel >= reward.requirementLevel ? (
                      <span className="text-green-600">✓ Level {reward.requirementLevel}</span>
                    ) : (
                      <span className="text-red-600">
                        Requires Level {reward.requirementLevel}
                      </span>
                    )}
                  </div>
                )}

                {/* Price */}
                <div className="mb-4">
                  <div
                    className="text-2xl font-bold"
                    style={{ color: canAfford ? rarityColor : '#EF4444' }}
                  >
                    {reward.cost.toLocaleString()} 🪙
                  </div>
                </div>

                {/* Purchase Button */}
                {owned ? (
                  <button
                    disabled
                    className="w-full bg-green-600 text-white py-2 rounded-lg font-bold opacity-50"
                  >
                    Owned ✓
                  </button>
                ) : (
                  <button
                    onClick={() => handlePurchase(reward.rewardId, reward.cost)}
                    disabled={!canAfford}
                    className={`w-full py-2 rounded-lg font-bold transition-all ${
                      canAfford
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {canAfford ? 'Purchase' : 'Not Enough Coins'}
                  </button>
                )}
              </div>

              {/* Rarity Badge */}
              <div
                className="px-4 py-2 text-center text-white font-bold text-sm capitalize"
                style={{ backgroundColor: rarityColor }}
              >
                {reward.rarity}
              </div>
            </div>
          );
        })}
      </div>

      {filteredRewards.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No rewards match your filters.
        </div>
      )}
    </div>
  );
};
