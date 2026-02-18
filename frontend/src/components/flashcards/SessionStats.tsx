import { motion } from 'framer-motion';
import { ReviewSession } from '../../types/flashcard.types';

interface SessionStatsProps {
  session: ReviewSession | null;
  currentTime?: number;
}

export const SessionStats: React.FC<SessionStatsProps> = ({ session, currentTime = 0 }) => {
  if (!session) return null;

  const accuracy = session.cardsReviewed > 0
    ? Math.round((session.correctCount / session.cardsReviewed) * 100)
    : 0;

  const elapsedTime = currentTime > 0
    ? currentTime
    : session.endTime
    ? Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000)
    : Math.floor((new Date().getTime() - session.startTime.getTime()) / 1000);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}m ${secs}s`;
  };

  const averageTimePerCard = session.cardsReviewed > 0
    ? Math.round(elapsedTime / session.cardsReviewed)
    : 0;

  return (
    <motion.div
      className="session-stats"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h3 className="session-stats-title">Session Statistics</h3>
      <div className="session-stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-label">Cards Reviewed</div>
            <div className="stat-value">{session.cardsReviewed}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <div className="stat-label">Accuracy</div>
            <div className="stat-value">{accuracy}%</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏰</div>
          <div className="stat-content">
            <div className="stat-label">Time Spent</div>
            <div className="stat-value">{formatTime(elapsedTime)}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <div className="stat-label">Avg Time/Card</div>
            <div className="stat-value">{averageTimePerCard}s</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-label">Correct</div>
            <div className="stat-value">{session.correctCount}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <div className="stat-label">Remaining</div>
            <div className="stat-value">{session.totalCards - session.cardsReviewed}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
