import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

interface XPBarProps {
  currentXP: number;
  requiredXP: number;
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
}

export default function XPBar({
  currentXP,
  requiredXP,
  showLabel = true,
  size = 'medium',
  animated = true,
}: XPBarProps) {
  const progress = Math.min((currentXP / requiredXP) * 100, 100);

  const heightClasses = {
    small: 'h-2',
    medium: 'h-3',
    large: 'h-4',
  };

  const textSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className={`flex items-center justify-between mb-2 ${textSizeClasses[size]}`}>
          <div className="flex items-center gap-1 text-gray-700 font-medium">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span>XP Progress</span>
          </div>
          <span className="font-semibold text-gray-900">
            {currentXP.toLocaleString()} / {requiredXP.toLocaleString()}
          </span>
        </div>
      )}

      <div className={`bg-gray-200 rounded-full ${heightClasses[size]} overflow-hidden shadow-inner`}>
        {animated ? (
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 shadow-md relative overflow-hidden"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            {/* Shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
            />
          </motion.div>
        ) : (
          <div
            className="h-full rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 shadow-md"
            style={{ width: `${progress}%` }}
          />
        )}
      </div>

      {showLabel && size !== 'small' && (
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>{Math.round(progress)}% complete</span>
          <span>{(requiredXP - currentXP).toLocaleString()} XP to go</span>
        </div>
      )}
    </div>
  );
}
