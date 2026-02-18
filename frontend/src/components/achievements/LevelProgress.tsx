import { motion } from 'framer-motion';
import { Trophy, Star, Zap } from 'lucide-react';
import { getLevelConfig, getXPForNextLevel } from '../../data/achievements';

interface LevelProgressProps {
  currentLevel: number;
  totalXP: number;
  showDetails?: boolean;
}

export default function LevelProgress({ currentLevel, totalXP, showDetails = true }: LevelProgressProps) {
  const xpInfo = getXPForNextLevel(totalXP);
  const levelConfig = getLevelConfig(currentLevel);
  const progress = (xpInfo.current / xpInfo.required) * 100;

  const getLevelColor = (level: number) => {
    if (level >= 50) return 'from-purple-500 to-pink-500';
    if (level >= 40) return 'from-purple-500 to-indigo-600';
    if (level >= 30) return 'from-yellow-500 to-orange-500';
    if (level >= 20) return 'from-blue-500 to-indigo-500';
    if (level >= 10) return 'from-green-500 to-teal-500';
    if (level >= 5) return 'from-emerald-500 to-green-600';
    return 'from-gray-400 to-gray-600';
  };

  const getLevelIcon = (level: number) => {
    if (level >= 30) return Trophy;
    if (level >= 10) return Star;
    return Zap;
  };

  const LevelIcon = getLevelIcon(currentLevel);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Level Progress</h3>
          {levelConfig && (
            <p className="text-sm text-gray-600">{levelConfig.title}</p>
          )}
        </div>
        <motion.div
          className={`
            w-16 h-16 rounded-full flex items-center justify-center
            bg-gradient-to-br ${getLevelColor(currentLevel)} text-white shadow-lg
          `}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <LevelIcon className="w-8 h-8" />
        </motion.div>
      </div>

      {/* Current Level */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-4xl font-bold text-gray-900">{currentLevel}</span>
          <span className="text-lg text-gray-600">→</span>
          <span className="text-2xl font-semibold text-gray-400">{currentLevel + 1}</span>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span className="font-medium">
            {xpInfo.current.toLocaleString()} / {xpInfo.required.toLocaleString()} XP
          </span>
          <span className="font-semibold">{Math.round(progress)}%</span>
        </div>
        <div className="bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${getLevelColor(currentLevel)} shadow-lg`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <div className="w-full h-full bg-gradient-to-t from-transparent to-white/30" />
          </motion.div>
        </div>
      </div>

      {/* Details */}
      {showDetails && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
            <p className="text-xs text-gray-600 mb-1">Total XP</p>
            <p className="text-lg font-bold text-blue-700">{totalXP.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border border-green-100">
            <p className="text-xs text-gray-600 mb-1">To Next Level</p>
            <p className="text-lg font-bold text-green-700">
              {(xpInfo.required - xpInfo.current).toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
