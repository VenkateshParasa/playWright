import { motion } from 'framer-motion';
import { DailyChallenge as DailyChallengeType } from '../../data/achievements';
import { CheckCircle, Circle, Target, Sparkles, Clock } from 'lucide-react';

interface DailyChallengeProps {
  challenges: (DailyChallengeType & {
    completed?: boolean;
    progress?: number;
  })[];
  allCompleted?: boolean;
  isLoading?: boolean;
}

export default function DailyChallenge({ challenges, allCompleted, isLoading }: DailyChallengeProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  const completedCount = challenges.filter((c) => c.completed).length;
  const totalCount = challenges.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Daily Challenges</h2>
              <p className="text-orange-100 text-sm">Complete all for bonus XP!</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{completedCount}/{totalCount}</div>
            <div className="text-xs text-orange-100 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Resets at midnight
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-white/20 rounded-full h-3 overflow-hidden">
          <motion.div
            className="bg-white h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* All completed celebration */}
      {allCompleted && (
        <motion.div
          className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 border-b border-green-200"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring' }}
            >
              <Sparkles className="w-8 h-8 text-green-600" />
            </motion.div>
            <div>
              <h3 className="font-bold text-green-900">All Challenges Complete!</h3>
              <p className="text-sm text-green-700">You earned +150 bonus XP!</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Challenge list */}
      <div className="divide-y divide-gray-100">
        {challenges.map((challenge, index) => {
          const isCompleted = challenge.completed || false;
          const progress = challenge.current || 0;
          const target = challenge.target;
          const progressPercent = Math.min((progress / target) * 100, 100);

          return (
            <motion.div
              key={challenge.id}
              className={`p-4 transition-colors ${
                isCompleted ? 'bg-green-50/50' : 'hover:bg-gray-50'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                    isCompleted
                      ? 'bg-green-100 border-2 border-green-500'
                      : 'bg-orange-100 border-2 border-orange-300'
                  }`}
                >
                  {challenge.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3
                      className={`font-semibold ${
                        isCompleted ? 'text-green-900 line-through' : 'text-gray-900'
                      }`}
                    >
                      {challenge.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-orange-600 whitespace-nowrap">
                        +{challenge.xpReward} XP
                      </span>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">{challenge.description}</p>

                  {/* Progress bar */}
                  {!isCompleted && (
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span className="font-medium">
                          {progress}/{target}
                        </span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                        <motion.div
                          className="bg-gradient-to-r from-orange-400 to-red-500 h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercent}%` }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                        />
                      </div>
                    </div>
                  )}

                  {isCompleted && (
                    <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Completed
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty state */}
      {challenges.length === 0 && (
        <div className="p-12 text-center">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No challenges available</p>
          <p className="text-gray-400 text-sm">Check back tomorrow!</p>
        </div>
      )}
    </div>
  );
}
