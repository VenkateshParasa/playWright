import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ReviewSession } from '../components/flashcards/ReviewSession';
import { useSessionStore } from '../stores/sessionStore';
import { mockFlashcards } from '../data/mockFlashcards';
import './Flashcards.css';

export const Flashcards: React.FC = () => {
  const { currentSession, startSession, resetSession } = useSessionStore();
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    // Clean up on unmount
    return () => {
      // Optional: save session state or cleanup
    };
  }, []);

  const handleStartSession = () => {
    setShowResults(false);
    startSession(mockFlashcards);
  };

  const handleSessionComplete = () => {
    setShowResults(true);
  };

  const handleNewSession = () => {
    resetSession();
    setShowResults(false);
  };

  if (showResults && currentSession) {
    return (
      <div className="flashcards-page">
        <motion.div
          className="session-results"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="results-header">
            <div className="results-icon">🎉</div>
            <h1>Session Complete!</h1>
            <p>Congratulations on completing your review session</p>
          </div>

          <div className="results-stats">
            <div className="result-stat">
              <div className="result-stat-icon">📊</div>
              <div className="result-stat-value">{currentSession.cardsReviewed}</div>
              <div className="result-stat-label">Cards Reviewed</div>
            </div>
            <div className="result-stat">
              <div className="result-stat-icon">🎯</div>
              <div className="result-stat-value">
                {currentSession.cardsReviewed > 0
                  ? Math.round((currentSession.correctCount / currentSession.cardsReviewed) * 100)
                  : 0}%
              </div>
              <div className="result-stat-label">Accuracy</div>
            </div>
            <div className="result-stat">
              <div className="result-stat-icon">⏰</div>
              <div className="result-stat-value">
                {Math.floor(
                  (currentSession.endTime
                    ? currentSession.endTime.getTime() - currentSession.startTime.getTime()
                    : 0) / 60000
                )}m
              </div>
              <div className="result-stat-label">Time Spent</div>
            </div>
            <div className="result-stat">
              <div className="result-stat-icon">✅</div>
              <div className="result-stat-value">{currentSession.correctCount}</div>
              <div className="result-stat-label">Correct Answers</div>
            </div>
          </div>

          <div className="results-performance">
            <h3>Performance Summary</h3>
            <div className="performance-bars">
              <div className="performance-bar">
                <span className="performance-label">Excellent (5)</span>
                <div className="performance-track">
                  <div
                    className="performance-fill performance-excellent"
                    style={{
                      width: `${
                        (currentSession.reviews.filter((r) => r.quality === 5).length /
                          currentSession.cardsReviewed) *
                        100
                      }%`
                    }}
                  />
                </div>
                <span className="performance-count">
                  {currentSession.reviews.filter((r) => r.quality === 5).length}
                </span>
              </div>
              <div className="performance-bar">
                <span className="performance-label">Good (4)</span>
                <div className="performance-track">
                  <div
                    className="performance-fill performance-good"
                    style={{
                      width: `${
                        (currentSession.reviews.filter((r) => r.quality === 4).length /
                          currentSession.cardsReviewed) *
                        100
                      }%`
                    }}
                  />
                </div>
                <span className="performance-count">
                  {currentSession.reviews.filter((r) => r.quality === 4).length}
                </span>
              </div>
              <div className="performance-bar">
                <span className="performance-label">Fair (3)</span>
                <div className="performance-track">
                  <div
                    className="performance-fill performance-fair"
                    style={{
                      width: `${
                        (currentSession.reviews.filter((r) => r.quality === 3).length /
                          currentSession.cardsReviewed) *
                        100
                      }%`
                    }}
                  />
                </div>
                <span className="performance-count">
                  {currentSession.reviews.filter((r) => r.quality === 3).length}
                </span>
              </div>
              <div className="performance-bar">
                <span className="performance-label">Needs Review (0-2)</span>
                <div className="performance-track">
                  <div
                    className="performance-fill performance-needs-review"
                    style={{
                      width: `${
                        (currentSession.reviews.filter((r) => r.quality <= 2).length /
                          currentSession.cardsReviewed) *
                        100
                      }%`
                    }}
                  />
                </div>
                <span className="performance-count">
                  {currentSession.reviews.filter((r) => r.quality <= 2).length}
                </span>
              </div>
            </div>
          </div>

          <div className="results-actions">
            <button className="btn btn-primary" onClick={handleNewSession}>
              Start New Session
            </button>
            <button className="btn btn-secondary" onClick={() => window.location.href = '/'}>
              Back to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (currentSession) {
    return (
      <div className="flashcards-page">
        <ReviewSession onComplete={handleSessionComplete} />
      </div>
    );
  }

  return (
    <div className="flashcards-page">
      <motion.div
        className="flashcards-welcome"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="welcome-header">
          <h1>Flashcard Review</h1>
          <p>Master Playwright and Selenium with spaced repetition</p>
        </div>

        <div className="welcome-stats">
          <div className="welcome-stat-card">
            <div className="stat-card-icon">📚</div>
            <div className="stat-card-content">
              <div className="stat-card-value">{mockFlashcards.length}</div>
              <div className="stat-card-label">Cards Available</div>
            </div>
          </div>
          <div className="welcome-stat-card">
            <div className="stat-card-icon">📝</div>
            <div className="stat-card-content">
              <div className="stat-card-value">{mockFlashcards.length}</div>
              <div className="stat-card-label">Cards Due Today</div>
            </div>
          </div>
          <div className="welcome-stat-card">
            <div className="stat-card-icon">🎯</div>
            <div className="stat-card-content">
              <div className="stat-card-value">
                {Math.round(
                  (mockFlashcards.filter((c) => c.repetitions > 0).length / mockFlashcards.length) *
                    100
                )}%
              </div>
              <div className="stat-card-label">Mastery</div>
            </div>
          </div>
        </div>

        <div className="welcome-categories">
          <h3>Available Categories</h3>
          <div className="category-grid">
            {Array.from(new Set(mockFlashcards.map((c) => c.category))).map((category) => {
              const categoryCards = mockFlashcards.filter((c) => c.category === category);
              return (
                <div key={category} className="category-card">
                  <h4>{category}</h4>
                  <p>{categoryCards.length} cards</p>
                  <div className="category-difficulty">
                    <span className="difficulty-badge difficulty-easy">
                      {categoryCards.filter((c) => c.difficulty === 'easy').length} Easy
                    </span>
                    <span className="difficulty-badge difficulty-medium">
                      {categoryCards.filter((c) => c.difficulty === 'medium').length} Medium
                    </span>
                    <span className="difficulty-badge difficulty-hard">
                      {categoryCards.filter((c) => c.difficulty === 'hard').length} Hard
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="welcome-features">
          <h3>Review Features</h3>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">🔄</div>
              <h4>Spaced Repetition</h4>
              <p>Cards appear at optimal intervals for maximum retention</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">⌨️</div>
              <h4>Keyboard Shortcuts</h4>
              <p>Fast review with keyboard support (Space, 0-5, arrows)</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📊</div>
              <h4>Progress Tracking</h4>
              <p>Detailed statistics and performance analytics</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">↶</div>
              <h4>Undo & Skip</h4>
              <p>Undo ratings or skip cards you want to review later</p>
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-large" onClick={handleStartSession}>
          Start Review Session
        </button>

        <div className="welcome-tips">
          <h4>💡 Tips for Effective Review</h4>
          <ul>
            <li>Review cards daily for best results</li>
            <li>Be honest with your ratings - it helps the algorithm</li>
            <li>Focus on understanding, not just memorization</li>
            <li>Take breaks between long sessions</li>
            <li>Use keyboard shortcuts for faster reviews</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default Flashcards;
