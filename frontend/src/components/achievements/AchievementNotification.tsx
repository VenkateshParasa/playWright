import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Achievement, tierConfig } from '../../data/achievements';
import { X, Sparkles, Trophy } from 'lucide-react';
import AchievementBadge from './AchievementBadge';

interface AchievementNotificationProps {
  achievement: Achievement | null;
  onClose: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export default function AchievementNotification({
  achievement,
  onClose,
  autoClose = true,
  autoCloseDelay = 5000,
}: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);

      if (autoClose) {
        const timer = setTimeout(() => {
          handleClose();
        }, autoCloseDelay);

        return () => clearTimeout(timer);
      }
    }
  }, [achievement, autoClose, autoCloseDelay]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  if (!achievement) return null;

  const tier = tierConfig[achievement.tier];

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          >
            {/* Notification card */}
            <motion.div
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: 50 }}
              transition={{ type: 'spring', duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with gradient */}
              <div className={`relative bg-gradient-to-r ${tier.gradient} p-6 text-white`}>
                {/* Close button */}
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>

                {/* Floating sparkles */}
                <div className="absolute inset-0 overflow-hidden">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0],
                        x: [0, Math.random() * 100 - 50],
                        y: [0, Math.random() * 100 - 50],
                      }}
                      transition={{
                        duration: 2,
                        delay: i * 0.2,
                        repeat: Infinity,
                        repeatDelay: 1,
                      }}
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                    >
                      <Sparkles className="w-4 h-4" />
                    </motion.div>
                  ))}
                </div>

                {/* Trophy icon */}
                <motion.div
                  className="flex justify-center mb-4"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Trophy className="w-12 h-12" />
                </motion.div>

                {/* Title */}
                <motion.h2
                  className="text-2xl font-bold text-center mb-2"
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Achievement Unlocked!
                </motion.h2>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Badge with animation */}
                <motion.div
                  className="flex justify-center mb-4"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', delay: 0.4, duration: 0.8 }}
                >
                  <AchievementBadge achievement={{ ...achievement, unlocked: true }} size="large" />
                </motion.div>

                {/* Achievement name */}
                <motion.h3
                  className="text-xl font-bold text-gray-900 text-center mb-2"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {achievement.name}
                </motion.h3>

                {/* Achievement description */}
                <motion.p
                  className="text-gray-600 text-center mb-4"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  {achievement.description}
                </motion.p>

                {/* XP reward */}
                <motion.div
                  className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 mb-4"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">XP Earned</span>
                    <motion.span
                      className="text-2xl font-bold text-purple-600"
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.2, 1] }}
                      transition={{ delay: 0.8, duration: 0.5 }}
                    >
                      +{achievement.xpReward} XP
                    </motion.span>
                  </div>
                </motion.div>

                {/* Tier badge */}
                <motion.div
                  className="flex justify-center"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.9 }}
                >
                  <div
                    className={`
                    px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide
                    ${tier.bgColor} ${tier.textColor} border ${tier.borderColor}
                  `}
                  >
                    {achievement.tier} Tier
                  </div>
                </motion.div>

                {/* Action button */}
                <motion.button
                  onClick={handleClose}
                  className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Continue Learning
                </motion.button>
              </div>
            </motion.div>

            {/* Confetti effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: ['#F59E0B', '#8B5CF6', '#3B82F6', '#10B981', '#EF4444'][i % 5],
                    left: `${Math.random() * 100}%`,
                    top: '-5%',
                  }}
                  initial={{ y: 0, opacity: 1, rotate: 0 }}
                  animate={{
                    y: window.innerHeight + 100,
                    opacity: [1, 1, 0],
                    rotate: Math.random() * 720,
                    x: (Math.random() - 0.5) * 200,
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    delay: i * 0.05,
                    ease: 'easeIn',
                  }}
                />
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
