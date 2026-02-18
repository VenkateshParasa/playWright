import React from 'react';
import { motion } from 'framer-motion';
import { getTierColor } from '../../lib/gamification/xpCalculator';
import { Achievement } from '../../stores/gamificationStore';

interface AchievementCardProps {
  achievement: Achievement;
  onClick?: () => void;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, onClick }) => {
  const tierColor = getTierColor(achievement.tier);
  const isLocked = !achievement.unlocked;

  return (
    <motion.div
      className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
        isLocked
          ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 opacity-60'
          : 'bg-white dark:bg-gray-900 border-purple-500 shadow-lg hover:shadow-xl'
      }`}
      style={{ borderColor: isLocked ? undefined : tierColor }}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Secret badge */}
      {achievement.isSecret && isLocked && (
        <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
          Secret
        </div>
      )}

      {/* Icon */}
      <div className="text-4xl mb-2 text-center">{achievement.icon}</div>

      {/* Title */}
      <h3 className="font-bold text-center mb-1">{achievement.name}</h3>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-3">
        {achievement.isSecret && isLocked ? '???' : achievement.description}
      </p>

      {/* Progress bar (if not unlocked) */}
      {!achievement.unlocked && achievement.percentage !== undefined && (
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span>Progress</span>
            <span>{achievement.percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${achievement.percentage}%`,
                backgroundColor: tierColor,
              }}
            />
          </div>
        </div>
      )}

      {/* Rewards */}
      <div className="flex justify-center gap-4 text-sm">
        <span className="text-purple-600 dark:text-purple-400">{achievement.xpReward} XP</span>
        <span className="text-yellow-600 dark:text-yellow-400">{achievement.coinReward} 🪙</span>
      </div>

      {/* Tier badge */}
      <div
        className="absolute bottom-2 right-2 px-2 py-1 rounded text-xs font-bold text-white capitalize"
        style={{ backgroundColor: tierColor }}
      >
        {achievement.tier}
      </div>

      {/* Unlocked overlay */}
      {achievement.unlocked && (
        <motion.div
          className="absolute inset-0 bg-green-500 bg-opacity-20 rounded-lg flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-green-600 dark:text-green-400 text-4xl">✓</div>
        </motion.div>
      )}
    </motion.div>
  );
};
