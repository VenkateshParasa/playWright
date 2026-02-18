/**
 * Achievements Component Showcase
 *
 * A visual demonstration of all achievement components with different states and variants.
 * Use this as a reference or storybook for the achievement system.
 */

import { useState } from 'react';
import {
  AchievementBadge,
  AchievementList,
  AchievementNotification,
  Leaderboard,
  DailyChallenge,
  LevelProgress,
  XPBar,
} from '../components/achievements';
import { achievements } from '../data/achievements';

export default function AchievementsShowcase() {
  const [selectedDemo, setSelectedDemo] = useState<string>('badges');
  const [showNotification, setShowNotification] = useState(false);

  // Sample data
  const sampleAchievements = achievements.slice(0, 6).map((a, i) => ({
    ...a,
    unlocked: i < 3,
    progress: i >= 3 ? (i * 20) : 0,
    percentage: i >= 3 ? (i * 20) : 0,
    unlockedAt: i < 3 ? new Date() : undefined,
  }));

  const sampleLeaderboard = [
    {
      rank: 1,
      user: { id: '1', name: 'Alice Johnson', avatar: undefined },
      totalXP: 15000,
      currentLevel: 25,
      currentStreak: 45,
      achievementsCount: 25,
    },
    {
      rank: 2,
      user: { id: '2', name: 'Bob Smith', avatar: undefined },
      totalXP: 12000,
      currentLevel: 22,
      currentStreak: 30,
      achievementsCount: 20,
    },
    {
      rank: 3,
      user: { id: '3', name: 'Carol White', avatar: undefined },
      totalXP: 10000,
      currentLevel: 20,
      currentStreak: 25,
      achievementsCount: 18,
    },
  ];

  const sampleChallenges = [
    {
      id: 'daily_lesson',
      title: 'Complete a Lesson',
      description: 'Complete 1 lesson today',
      icon: '📚',
      xpReward: 50,
      type: 'lesson' as const,
      target: 1,
      current: 1,
      completed: true,
      progress: 1,
    },
    {
      id: 'daily_quiz',
      title: 'Pass a Quiz',
      description: 'Pass 1 quiz with at least 70%',
      icon: '✅',
      xpReward: 75,
      type: 'quiz' as const,
      target: 1,
      current: 0,
      completed: false,
      progress: 0,
    },
    {
      id: 'daily_flashcards',
      title: 'Review Flashcards',
      description: 'Review 15 flashcards',
      icon: '🎴',
      xpReward: 40,
      type: 'flashcards' as const,
      target: 15,
      current: 8,
      completed: false,
      progress: 8,
    },
  ];

  const demos = {
    badges: {
      title: 'Achievement Badges',
      description: 'Badges in different sizes, tiers, and states',
      component: (
        <div className="space-y-8">
          {/* Size variants */}
          <div>
            <h3 className="text-lg font-bold mb-4">Size Variants</h3>
            <div className="flex items-center gap-8">
              <div>
                <p className="text-sm text-gray-600 mb-2">Small</p>
                <AchievementBadge
                  achievement={{ ...achievements[0], unlocked: true }}
                  size="small"
                />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Medium</p>
                <AchievementBadge
                  achievement={{ ...achievements[0], unlocked: true }}
                  size="medium"
                />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Large</p>
                <AchievementBadge
                  achievement={{ ...achievements[0], unlocked: true }}
                  size="large"
                />
              </div>
            </div>
          </div>

          {/* Tier variants */}
          <div>
            <h3 className="text-lg font-bold mb-4">All Tiers (Unlocked)</h3>
            <div className="flex items-center gap-6 flex-wrap">
              {['bronze', 'silver', 'gold', 'platinum', 'diamond'].map((tier) => {
                const achievement = achievements.find(a => a.tier === tier) || achievements[0];
                return (
                  <div key={tier}>
                    <p className="text-sm text-gray-600 mb-2 capitalize">{tier}</p>
                    <AchievementBadge
                      achievement={{ ...achievement, unlocked: true }}
                      size="medium"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* States */}
          <div>
            <h3 className="text-lg font-bold mb-4">States</h3>
            <div className="flex items-center gap-6 flex-wrap">
              <div>
                <p className="text-sm text-gray-600 mb-2">Unlocked</p>
                <AchievementBadge
                  achievement={{ ...achievements[0], unlocked: true }}
                  size="medium"
                />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Locked (No Progress)</p>
                <AchievementBadge
                  achievement={{ ...achievements[0], unlocked: false, progress: 0 }}
                  size="medium"
                />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">In Progress (50%)</p>
                <AchievementBadge
                  achievement={{
                    ...achievements[0],
                    unlocked: false,
                    progress: 5,
                    percentage: 50,
                  }}
                  size="medium"
                  showProgress
                />
              </div>
            </div>
          </div>
        </div>
      ),
    },

    list: {
      title: 'Achievement List',
      description: 'Filterable grid of achievements with search',
      component: (
        <AchievementList achievements={sampleAchievements} isLoading={false} />
      ),
    },

    notification: {
      title: 'Achievement Notification',
      description: 'Animated celebration when unlocking achievements',
      component: (
        <div className="space-y-4">
          <button
            onClick={() => setShowNotification(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700"
          >
            Show Notification Demo
          </button>
          <p className="text-sm text-gray-600">
            Click the button to see the achievement unlock animation with confetti!
          </p>
          <AchievementNotification
            achievement={showNotification ? achievements[0] : null}
            onClose={() => setShowNotification(false)}
          />
        </div>
      ),
    },

    leaderboard: {
      title: 'Leaderboard',
      description: 'Top players with rankings and stats',
      component: <Leaderboard entries={sampleLeaderboard} currentUserId="2" />,
    },

    challenges: {
      title: 'Daily Challenges',
      description: '3 daily challenges with progress tracking',
      component: <DailyChallenge challenges={sampleChallenges} allCompleted={false} />,
    },

    progress: {
      title: 'Level Progress',
      description: 'Level display with XP progress bar',
      component: (
        <div className="space-y-6">
          <LevelProgress currentLevel={15} totalXP={38500} showDetails />

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold mb-4">Level Progression Examples</h3>
            <div className="space-y-4">
              {[5, 10, 20, 30, 40, 50].map((level) => {
                const xp = level * level * 100;
                return (
                  <div key={level}>
                    <p className="text-sm text-gray-600 mb-2">Level {level}</p>
                    <LevelProgress currentLevel={level} totalXP={xp} showDetails={false} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ),
    },

    xpBar: {
      title: 'XP Bar',
      description: 'Progress bar variants',
      component: (
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold mb-4">Size Variants</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Small</p>
                <XPBar currentXP={3000} requiredXP={10000} size="small" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Medium</p>
                <XPBar currentXP={5000} requiredXP={10000} size="medium" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Large</p>
                <XPBar currentXP={7500} requiredXP={10000} size="large" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Progress States</h3>
            <div className="space-y-4">
              {[10, 25, 50, 75, 90, 100].map((percent) => (
                <div key={percent}>
                  <p className="text-sm text-gray-600 mb-2">{percent}% Complete</p>
                  <XPBar
                    currentXP={percent * 100}
                    requiredXP={10000}
                    size="medium"
                    showLabel={false}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Achievements Component Showcase
          </h1>
          <p className="text-gray-600">
            Visual demonstration of all achievement components with different states and variants
          </p>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {Object.entries(demos).map(([key, demo]) => (
              <button
                key={key}
                onClick={() => setSelectedDemo(key)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedDemo === key
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {demo.title}
              </button>
            ))}
          </div>
        </div>

        {/* Demo content */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {demos[selectedDemo].title}
          </h2>
          <p className="text-gray-600 mb-6">{demos[selectedDemo].description}</p>
          <div>{demos[selectedDemo].component}</div>
        </div>

        {/* Code snippet */}
        <div className="mt-8 bg-gray-900 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-white mb-4">Usage Example</h3>
          <pre className="text-green-400 text-sm overflow-x-auto">
            <code>{getCodeSnippet(selectedDemo)}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}

// Helper function to get code snippets
function getCodeSnippet(demo: string): string {
  const snippets = {
    badges: `import { AchievementBadge } from './components/achievements';

<AchievementBadge
  achievement={achievement}
  size="medium"
  showProgress={true}
  onClick={() => console.log('Badge clicked')}
/>`,

    list: `import { AchievementList } from './components/achievements';

<AchievementList
  achievements={achievements}
  isLoading={false}
/>`,

    notification: `import { AchievementNotification } from './components/achievements';

<AchievementNotification
  achievement={unlockedAchievement}
  onClose={() => setNotification(null)}
  autoClose={true}
  autoCloseDelay={5000}
/>`,

    leaderboard: `import { Leaderboard } from './components/achievements';

<Leaderboard
  entries={leaderboardData}
  currentUserId={userId}
  isLoading={false}
/>`,

    challenges: `import { DailyChallenge } from './components/achievements';

<DailyChallenge
  challenges={challenges}
  allCompleted={false}
  isLoading={false}
/>`,

    progress: `import { LevelProgress } from './components/achievements';

<LevelProgress
  currentLevel={15}
  totalXP={38500}
  showDetails={true}
/>`,

    xpBar: `import { XPBar } from './components/achievements';

<XPBar
  currentXP={5000}
  requiredXP={10000}
  showLabel={true}
  size="medium"
  animated={true}
/>`,
  };

  return snippets[demo] || '';
}
