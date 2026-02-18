/**
 * Achievement System Integration Examples
 *
 * This file demonstrates how to integrate the achievements system
 * into different parts of your application.
 */

import { useActivityTracker } from '../lib/achievements/achievementEngine';
import { useAchievementsStore } from '../stores/achievementsStore';

// ============================================================================
// Example 1: Tracking Lesson Completion
// ============================================================================

export function LessonPlayer({ lessonId }: { lessonId: string }) {
  const { trackLessonCompleted, trackStudySession } = useActivityTracker();
  const [startTime] = useState(Date.now());

  const handleCompleteLesson = async () => {
    const studyDuration = Math.floor((Date.now() - startTime) / 1000 / 60); // minutes

    // Track lesson completion
    await trackLessonCompleted({ lessonId });

    // Track study time
    await trackStudySession({
      duration: studyDuration,
      activitiesCount: 1,
    });

    // Navigate to next lesson or show completion message
  };

  return (
    <div>
      {/* Lesson content */}
      <button onClick={handleCompleteLesson}>
        Complete Lesson
      </button>
    </div>
  );
}

// ============================================================================
// Example 2: Tracking Quiz Completion
// ============================================================================

export function QuizResults({ quizId, score, totalQuestions }: any) {
  const { trackQuizCompleted } = useActivityTracker();
  const isPassed = score >= (totalQuestions * 0.7); // 70% pass rate
  const isPerfect = score === totalQuestions;

  useEffect(() => {
    trackQuizCompleted({
      quizId,
      score: (score / totalQuestions) * 100,
      passed: isPassed,
    });
  }, []);

  return (
    <div>
      <h2>Quiz Results</h2>
      <p>Score: {score}/{totalQuestions}</p>
      {isPerfect && <p>🎉 Perfect score! Achievement unlocked!</p>}
    </div>
  );
}

// ============================================================================
// Example 3: Tracking Flashcard Reviews
// ============================================================================

export function FlashcardSession({ cards }: any) {
  const { trackFlashcardReviewed } = useActivityTracker();
  const [reviewedCount, setReviewedCount] = useState(0);
  const [masteredCount, setMasteredCount] = useState(0);

  const handleCardReviewed = async (quality: number) => {
    setReviewedCount(prev => prev + 1);

    if (quality === 5) {
      setMasteredCount(prev => prev + 1);
      await trackFlashcardReviewed({ count: 1, mastered: true });
    } else {
      await trackFlashcardReviewed({ count: 1 });
    }
  };

  return (
    <div>
      {/* Flashcard UI */}
      <p>Reviewed: {reviewedCount} | Mastered: {masteredCount}</p>
    </div>
  );
}

// ============================================================================
// Example 4: Tracking Exercise Completion
// ============================================================================

export function CodeExercise({ exerciseId }: { exerciseId: string }) {
  const { trackExerciseCompleted } = useActivityTracker();

  const handleSubmitSolution = async (code: string) => {
    // Run tests
    const testsPass = await runTests(code);

    if (testsPass) {
      await trackExerciseCompleted({ exerciseId });
      // Show success message
    }
  };

  return (
    <div>
      {/* Code editor */}
      <button onClick={() => handleSubmitSolution('')}>
        Submit Solution
      </button>
    </div>
  );
}

// ============================================================================
// Example 5: Displaying Achievement Notifications
// ============================================================================

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { unseenAchievements, markAchievementsSeen } = useAchievementsStore();
  const [currentNotification, setCurrentNotification] = useState(null);

  useEffect(() => {
    if (unseenAchievements.length > 0) {
      setCurrentNotification(unseenAchievements[0]);
    }
  }, [unseenAchievements]);

  const handleCloseNotification = () => {
    if (currentNotification) {
      markAchievementsSeen([currentNotification.id]);
    }
    setCurrentNotification(null);
  };

  return (
    <div>
      {children}
      <AchievementNotification
        achievement={currentNotification}
        onClose={handleCloseNotification}
      />
    </div>
  );
}

// ============================================================================
// Example 6: Displaying User XP in Header
// ============================================================================

export function UserHeader() {
  const { userProgress, fetchUserProgress } = useAchievementsStore();
  const xpInfo = userProgress ? getXPForNextLevel(userProgress.totalXP) : null;

  useEffect(() => {
    fetchUserProgress();
  }, []);

  if (!userProgress || !xpInfo) return null;

  return (
    <div className="flex items-center gap-4">
      {/* User avatar */}
      <div>
        <p className="font-bold">Level {userProgress.currentLevel}</p>
        <XPBar
          currentXP={xpInfo.current}
          requiredXP={xpInfo.required}
          size="small"
          showLabel={false}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Example 7: Dashboard Widget - Recent Achievements
// ============================================================================

export function RecentAchievements() {
  const { achievements } = useAchievementsStore();

  const recentlyUnlocked = achievements
    .filter(a => a.unlocked)
    .sort((a, b) =>
      new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime()
    )
    .slice(0, 3);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold mb-4">Recent Achievements</h3>
      <div className="flex gap-4">
        {recentlyUnlocked.map(achievement => (
          <AchievementBadge
            key={achievement.id}
            achievement={achievement}
            size="medium"
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Example 8: Dashboard Widget - Daily Challenges Progress
// ============================================================================

export function DailyChallengesWidget() {
  const { dailyChallenges, fetchDailyChallenges } = useAchievementsStore();

  useEffect(() => {
    fetchDailyChallenges();
  }, []);

  const completedCount = dailyChallenges.filter(c => c.completed).length;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold mb-4">Today's Challenges</h3>
      <p className="text-3xl font-bold text-purple-600">
        {completedCount}/{dailyChallenges.length}
      </p>
      <p className="text-sm text-gray-600">challenges completed</p>
    </div>
  );
}

// ============================================================================
// Example 9: Manual XP Award (for special events)
// ============================================================================

export function SpecialEventButton() {
  const { awardXP } = useActivityTracker();

  const handleSpecialEvent = async () => {
    await awardXP(500, 'Participated in special event');
    alert('You earned 500 bonus XP!');
  };

  return (
    <button onClick={handleSpecialEvent}>
      Complete Special Event (+500 XP)
    </button>
  );
}

// ============================================================================
// Example 10: Achievement Progress in Settings
// ============================================================================

export function AchievementStats() {
  const { userProgress, achievements } = useAchievementsStore();

  if (!userProgress) return null;

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const completionRate = (unlockedCount / totalCount) * 100;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold mb-4">Your Progress</h3>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600">Achievements</p>
          <p className="text-2xl font-bold">{unlockedCount}/{totalCount}</p>
          <div className="bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-purple-600 h-2 rounded-full"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-600">Total XP</p>
          <p className="text-2xl font-bold">{userProgress.totalXP.toLocaleString()}</p>
        </div>

        <div>
          <p className="text-sm text-gray-600">Current Level</p>
          <p className="text-2xl font-bold">{userProgress.currentLevel}</p>
        </div>

        <div>
          <p className="text-sm text-gray-600">Current Streak</p>
          <p className="text-2xl font-bold">{userProgress.streak.currentStreak} days</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Helper function (mock)
// ============================================================================

async function runTests(code: string): Promise<boolean> {
  // Mock implementation
  return true;
}

// Import statements (add these at the top)
import { useState, useEffect } from 'react';
import AchievementNotification from '../components/achievements/AchievementNotification';
import AchievementBadge from '../components/achievements/AchievementBadge';
import XPBar from '../components/achievements/XPBar';
import { getXPForNextLevel } from '../data/achievements';
