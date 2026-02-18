import { motion } from 'framer-motion';
import { Achievement, tierConfig } from '../../data/achievements';
import { Lock, Sparkles } from 'lucide-react';

interface AchievementBadgeProps {
  achievement: Achievement & {
    unlocked?: boolean;
    progress?: number;
    percentage?: number;
  };
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
  onClick?: () => void;
}

export default function AchievementBadge({
  achievement,
  size = 'medium',
  showProgress = false,
  onClick,
}: AchievementBadgeProps) {
  const tier = tierConfig[achievement.tier];
  const isUnlocked = achievement.unlocked || false;
  const progress = achievement.progress || 0;
  const percentage = achievement.percentage || 0;

  const sizeClasses = {
    small: 'w-16 h-16 text-2xl',
    medium: 'w-24 h-24 text-4xl',
    large: 'w-32 h-32 text-5xl',
  };

  const containerClasses = {
    small: 'w-20 h-20',
    medium: 'w-28 h-28',
    large: 'w-36 h-36',
  };

  return (
    <motion.div
      className={`relative ${containerClasses[size]} ${onClick ? 'cursor-pointer' : ''}`}
      whileHover={onClick ? { scale: 1.05 } : {}}
      whileTap={onClick ? { scale: 0.95 } : {}}
      onClick={onClick}
    >
      {/* Badge circle with tier color */}
      <motion.div
        className={`
          ${sizeClasses[size]}
          rounded-full
          flex items-center justify-center
          relative
          overflow-hidden
          ${isUnlocked ? tier.bgColor : 'bg-gray-200'}
          ${isUnlocked ? `border-4 ${tier.borderColor}` : 'border-4 border-gray-300'}
          transition-all duration-300
        `}
        initial={false}
        animate={{
          opacity: isUnlocked ? 1 : 0.5,
          filter: isUnlocked ? 'grayscale(0%)' : 'grayscale(100%)',
        }}
      >
        {/* Gradient background for unlocked badges */}
        {isUnlocked && (
          <div
            className={`absolute inset-0 bg-gradient-to-br ${tier.gradient} opacity-10`}
          />
        )}

        {/* Icon or lock */}
        <div className="relative z-10">
          {isUnlocked ? (
            <span className="drop-shadow-sm">{achievement.icon}</span>
          ) : (
            <Lock className="w-1/2 h-1/2 text-gray-400" />
          )}
        </div>

        {/* Progress ring for in-progress achievements */}
        {!isUnlocked && showProgress && progress > 0 && (
          <svg
            className="absolute inset-0 w-full h-full transform -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-gray-300"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className={tier.textColor}
              strokeDasharray={`${2 * Math.PI * 46}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 46 }}
              animate={{
                strokeDashoffset: 2 * Math.PI * 46 * (1 - percentage / 100),
              }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
        )}

        {/* Sparkle effect for unlocked badges */}
        {isUnlocked && size !== 'small' && (
          <motion.div
            className="absolute top-1 right-1"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className={`w-4 h-4 ${tier.textColor}`} />
          </motion.div>
        )}
      </motion.div>

      {/* Tier badge */}
      {size !== 'small' && (
        <div
          className={`
            absolute -bottom-1 left-1/2 transform -translate-x-1/2
            px-2 py-0.5 rounded-full text-xs font-bold
            ${isUnlocked ? tier.bgColor : 'bg-gray-200'}
            ${isUnlocked ? tier.textColor : 'text-gray-500'}
            border ${isUnlocked ? tier.borderColor : 'border-gray-300'}
            uppercase tracking-wide
          `}
        >
          {achievement.tier}
        </div>
      )}

      {/* XP reward indicator */}
      {isUnlocked && size === 'large' && (
        <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
          +{achievement.xpReward} XP
        </div>
      )}

      {/* Progress percentage */}
      {!isUnlocked && showProgress && progress > 0 && size !== 'small' && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-gray-600 whitespace-nowrap">
          {progress}/{achievement.condition.target}
        </div>
      )}
    </motion.div>
  );
}
