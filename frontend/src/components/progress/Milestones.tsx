/**
 * Milestones Component
 * Displays milestone achievements with celebration animations
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Award, Lock, Sparkles, X } from 'lucide-react';
import type { Milestone, MilestoneCategory } from '../../types/progress.types';
import { getMilestoneProgress, MILESTONE_CATEGORIES } from '../../lib/progress/milestones';

interface MilestonesProps {
  milestones: Milestone[];
  onCelebrate?: (milestone: Milestone) => void;
  className?: string;
}

export const Milestones: React.FC<MilestonesProps> = ({
  milestones,
  onCelebrate,
  className = '',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<MilestoneCategory | 'all'>('all');
  const [celebrationMilestone, setCelebrationMilestone] = useState<Milestone | null>(null);

  // Filter milestones by category
  const filteredMilestones = selectedCategory === 'all'
    ? milestones
    : milestones.filter((m) => m.category === selectedCategory);

  // Group milestones by completion status
  const completedMilestones = filteredMilestones.filter((m) => m.isCompleted);
  const inProgressMilestones = filteredMilestones.filter((m) => !m.isCompleted && m.current > 0);
  const lockedMilestones = filteredMilestones.filter((m) => !m.isCompleted && m.current === 0);

  // Celebration animation
  const showCelebration = (milestone: Milestone) => {
    setCelebrationMilestone(milestone);
    onCelebrate?.(milestone);
  };

  const closeCelebration = () => {
    setCelebrationMilestone(null);
  };

  const renderMilestone = (milestone: Milestone) => {
    const progress = getMilestoneProgress(milestone);
    const isLocked = milestone.current === 0 && !milestone.isCompleted;

    return (
      <motion.div
        key={milestone.id}
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`relative border rounded-lg p-4 transition-all ${
          milestone.isCompleted
            ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 shadow-md'
            : isLocked
            ? 'bg-gray-50 border-gray-200'
            : 'bg-white border-gray-300 hover:border-blue-400 hover:shadow-sm'
        }`}
        onClick={() => milestone.isCompleted && showCelebration(milestone)}
      >
        {/* Completion Badge */}
        {milestone.isCompleted && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2 shadow-lg"
          >
            <Trophy className="w-4 h-4 text-white" />
          </motion.div>
        )}

        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className={`flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center text-3xl ${
              milestone.isCompleted
                ? 'bg-gradient-to-br from-yellow-400 to-orange-400 shadow-lg'
                : isLocked
                ? 'bg-gray-200'
                : 'bg-gray-100'
            }`}
          >
            {isLocked ? <Lock className="w-8 h-8 text-gray-400" /> : milestone.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h4
                  className={`font-semibold ${
                    milestone.isCompleted ? 'text-gray-900' : isLocked ? 'text-gray-400' : 'text-gray-900'
                  }`}
                >
                  {milestone.title}
                </h4>
                <p
                  className={`text-sm ${
                    milestone.isCompleted ? 'text-gray-600' : isLocked ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {milestone.description}
                </p>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                  milestone.isCompleted
                    ? 'bg-green-100 text-green-700'
                    : isLocked
                    ? 'bg-gray-200 text-gray-600'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {milestone.category}
              </span>
            </div>

            {/* Progress */}
            {!milestone.isCompleted && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">
                    {milestone.current} / {milestone.target}
                  </span>
                  <span className="font-medium text-gray-900">{progress}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                  />
                </div>
              </div>
            )}

            {/* Reward Info */}
            {milestone.reward && milestone.isCompleted && (
              <div className="mt-3 flex items-center gap-2 text-sm">
                <Star className="w-4 h-4 text-yellow-600" />
                <span className="text-gray-700">
                  Reward: <span className="font-medium">{milestone.reward.description}</span>
                </span>
              </div>
            )}

            {/* Completion Date */}
            {milestone.completedAt && (
              <p className="mt-2 text-xs text-gray-500">
                Completed on {new Date(milestone.completedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <>
      <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Award className="w-7 h-7 text-yellow-600" />
              Milestones
            </h2>
            <div className="text-sm text-gray-600">
              <span className="font-medium text-gray-900">{completedMilestones.length}</span> /{' '}
              {milestones.length} Completed
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({milestones.length})
            </button>
            {Object.entries(MILESTONE_CATEGORIES).map(([key, value]) => {
              const count = milestones.filter((m) => m.category === key).length;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key as MilestoneCategory)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === key
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={{
                    backgroundColor: selectedCategory === key ? value.color : undefined,
                  }}
                >
                  {value.icon} {value.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Milestone Lists */}
        <div className="space-y-6">
          {/* Completed */}
          {completedMilestones.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                Completed ({completedMilestones.length})
              </h3>
              <div className="space-y-3">
                <AnimatePresence>
                  {completedMilestones.map((milestone) => renderMilestone(milestone))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* In Progress */}
          {inProgressMilestones.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                In Progress ({inProgressMilestones.length})
              </h3>
              <div className="space-y-3">
                <AnimatePresence>
                  {inProgressMilestones.map((milestone) => renderMilestone(milestone))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Locked */}
          {lockedMilestones.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Lock className="w-5 h-5 text-gray-600" />
                Locked ({lockedMilestones.length})
              </h3>
              <div className="space-y-3">
                <AnimatePresence>
                  {lockedMilestones.map((milestone) => renderMilestone(milestone))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Celebration Modal */}
      <AnimatePresence>
        {celebrationMilestone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            onClick={closeCelebration}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              className="relative bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={closeCelebration}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>

              {/* Celebration Content */}
              <div className="text-center">
                {/* Animated Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                  className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-5xl shadow-lg"
                >
                  {celebrationMilestone.icon}
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-bold text-gray-900 mb-2"
                >
                  🎉 Congratulations! 🎉
                </motion.h2>

                {/* Milestone Title */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl font-semibold text-gray-800 mb-2"
                >
                  {celebrationMilestone.title}
                </motion.p>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-600 mb-6"
                >
                  {celebrationMilestone.description}
                </motion.p>

                {/* Reward */}
                {celebrationMilestone.reward && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg p-4 mb-6"
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Star className="w-5 h-5 text-yellow-600" />
                      <span className="font-semibold text-gray-900">Reward Unlocked</span>
                    </div>
                    <p className="text-sm text-gray-700">{celebrationMilestone.reward.description}</p>
                  </motion.div>
                )}

                {/* Close Button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  onClick={closeCelebration}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-colors"
                >
                  Awesome!
                </motion.button>
              </div>

              {/* Confetti Effect (decorative) */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: -20, x: Math.random() * 400 - 200, opacity: 1 }}
                    animate={{
                      y: 500,
                      x: Math.random() * 400 - 200,
                      opacity: 0,
                      rotate: Math.random() * 360,
                    }}
                    transition={{ duration: 2, delay: Math.random() * 0.5 }}
                    className="absolute top-0 left-1/2 w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][
                        i % 5
                      ],
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
