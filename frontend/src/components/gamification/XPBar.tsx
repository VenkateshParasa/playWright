import React from 'react';
import { motion } from 'framer-motion';
import { calculateLevel } from '../../lib/gamification/xpCalculator';

interface XPBarProps {
  totalXP: number;
  showLevel?: boolean;
  showNumbers?: boolean;
  animate?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const XPBar: React.FC<XPBarProps> = ({
  totalXP,
  showLevel = true,
  showNumbers = true,
  animate = true,
  size = 'medium',
}) => {
  const { level, xpInCurrentLevel, xpForCurrentLevel } = calculateLevel(totalXP);
  const progress = (xpInCurrentLevel / xpForCurrentLevel) * 100;

  const heights = { small: 'h-2', medium: 'h-4', large: 'h-6' };
  const textSizes = { small: 'text-xs', medium: 'text-sm', large: 'text-base' };

  return (
    <div className="w-full">
      {showLevel && (
        <div className="flex items-center justify-between mb-2">
          <span className={`font-bold text-purple-600 dark:text-purple-400 ${textSizes[size]}`}>
            Level {level}
          </span>
          {showNumbers && (
            <span className={`text-gray-600 dark:text-gray-400 ${textSizes[size]}`}>
              {xpInCurrentLevel.toLocaleString()} / {xpForCurrentLevel.toLocaleString()} XP
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full ${heights[size]} overflow-hidden`}>
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: animate ? 1 : 0, ease: 'easeOut' }}
        />
      </div>
      {showNumbers && (
        <div className="text-right mt-1">
          <span className={`text-gray-500 dark:text-gray-400 ${textSizes[size]}`}>
            {progress.toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
};
