/**
 * Achievements Integration Example - Live Route
 * Shows achievement store data and integration patterns.
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAchievementsStore } from '../../stores/achievementsStore';
import { useActivityTracker } from '../../lib/achievements/achievementEngine';

export default function AchievementsExample() {
  const navigate = useNavigate();
  const {
    userProgress,
    achievements,
    dailyChallenges,
    isLoadingProgress,
    isLoadingAchievements,
    isLoadingChallenges,
    fetchUserProgress,
    fetchAchievements,
    fetchDailyChallenges,
  } = useAchievementsStore();
  const { awardXP } = useActivityTracker();

  useEffect(() => {
    fetchUserProgress();
    fetchAchievements();
    fetchDailyChallenges();
  }, [fetchUserProgress, fetchAchievements, fetchDailyChallenges]);

  const unlockedAchievements = achievements.filter((a) => a.unlocked);
  const lockedAchievements = achievements.filter((a) => !a.unlocked);
  const completedChallenges = dailyChallenges.filter((c) => c.completed);
  const completionRate = achievements.length > 0
    ? Math.round((unlockedAchievements.length / achievements.length) * 100)
    : 0;

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/examples')} className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
          ← Examples
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Achievement Integration</h1>
          <p className="text-sm text-gray-500 mt-0.5">Live achievement store data and tracking patterns</p>
        </div>
      </div>

      {/* User Progress Stats */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">User Progress</h2>
        {isLoadingProgress ? (
          <p className="text-gray-500">Loading progress...</p>
        ) : userProgress ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total XP', value: userProgress.totalXP.toLocaleString(), color: 'text-indigo-600' },
              { label: 'Level', value: userProgress.currentLevel, color: 'text-blue-600' },
              { label: 'Current Streak', value: `${userProgress.streak.currentStreak} days`, color: 'text-green-600' },
              { label: 'Longest Streak', value: `${userProgress.streak.longestStreak} days`, color: 'text-purple-600' },
              { label: 'Lessons Done', value: userProgress.lessonsCompleted, color: 'text-indigo-600' },
              { label: 'Exercises Done', value: userProgress.exercisesCompleted, color: 'text-blue-600' },
              { label: 'Flashcards Reviewed', value: userProgress.flashcardsReviewed, color: 'text-green-600' },
              { label: 'Cards Mastered', value: userProgress.masteredFlashcards, color: 'text-purple-600' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <div className={`text-2xl font-bold ${color}`}>{value}</div>
                <div className="text-xs text-gray-500 mt-1">{label}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No progress data yet. Start learning to earn XP!</p>
        )}
      </section>

      {/* Award XP Demo */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Award XP (Special Event)</h2>
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-4">
          <p className="text-sm text-gray-600">Manually award XP — useful for special events or testing.</p>
          <button
            onClick={() => awardXP(50, 'Viewed Achievement Examples')}
            className="shrink-0 px-4 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors"
          >
            Award 50 XP
          </button>
        </div>
      </section>

      {/* Achievement Progress */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Achievement Progress ({unlockedAchievements.length}/{achievements.length})
        </h2>
        {isLoadingAchievements ? (
          <p className="text-gray-500">Loading achievements...</p>
        ) : (
          <>
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Completion</span>
                <span>{completionRate}%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full transition-all" style={{ width: `${completionRate}%` }} />
              </div>
            </div>

            {unlockedAchievements.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Unlocked</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {unlockedAchievements.map((a) => (
                    <div key={a.id} className="bg-white border border-green-200 rounded-lg p-3 flex items-start gap-3">
                      <span className="text-2xl">{a.icon}</span>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{a.name}</div>
                        <div className="text-xs text-gray-500">{a.description}</div>
                        {a.xpReward && <div className="text-xs text-green-600 mt-0.5">+{a.xpReward} XP</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {lockedAchievements.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Locked ({lockedAchievements.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {lockedAchievements.slice(0, 6).map((a) => (
                    <div key={a.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-start gap-3 opacity-60">
                      <span className="text-2xl grayscale">{a.icon}</span>
                      <div>
                        <div className="font-medium text-gray-700 text-sm">{a.name}</div>
                        <div className="text-xs text-gray-400">{a.description}</div>
                        {(a as any).percentage !== undefined && (
                          <div className="mt-1">
                            <div className="bg-gray-200 rounded-full h-1">
                              <div className="bg-purple-400 h-1 rounded-full" style={{ width: `${(a as any).percentage}%` }} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {achievements.length === 0 && (
              <p className="text-gray-500">No achievements loaded. Connect to the backend to see real data.</p>
            )}
          </>
        )}
      </section>

      {/* Daily Challenges */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Today's Challenges ({completedChallenges.length}/{dailyChallenges.length})
        </h2>
        {isLoadingChallenges ? (
          <p className="text-gray-500">Loading challenges...</p>
        ) : dailyChallenges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {dailyChallenges.map((c) => (
              <div key={c.id} className={`border rounded-lg p-4 flex items-center gap-3 ${c.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                <span className="text-xl">{c.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm">{c.title}</div>
                  <div className="text-xs text-gray-500">{c.description}</div>
                  {!c.completed && c.progress !== undefined && (
                    <div className="mt-1">
                      <div className="bg-gray-200 rounded-full h-1">
                        <div className="bg-purple-500 h-1 rounded-full" style={{ width: `${Math.min(100, ((c.progress || 0) / (c.target || 1)) * 100)}%` }} />
                      </div>
                    </div>
                  )}
                </div>
                {c.completed && <span className="text-green-600 text-lg">✓</span>}
                <span className="text-xs text-purple-600 font-medium shrink-0">+{c.xpReward} XP</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No daily challenges loaded. Connect to the backend to see real challenges.</p>
        )}
      </section>
    </div>
  );
}
