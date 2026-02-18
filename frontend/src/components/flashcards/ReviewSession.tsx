import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlashCard } from './FlashCard';
import { QualityButtons } from './QualityButtons';
import { ProgressBar } from './ProgressBar';
import { CardTimer } from './CardTimer';
import { SessionStats } from './SessionStats';
import { CardDeck } from './CardDeck';
import { useSessionStore } from '../../stores/sessionStore';
import { QualityRating, MOTIVATIONAL_MESSAGES } from '../../types/flashcard.types';

interface ReviewSessionProps {
  onComplete: () => void;
}

export const ReviewSession: React.FC<ReviewSessionProps> = ({ onComplete }) => {
  const {
    currentSession,
    currentCardIndex,
    isFlipped,
    isPaused,
    dueCards,
    undoHistory,
    flipCard,
    togglePause,
    reviewCard,
    undoLastReview,
    skipCard,
    nextCard,
    endSession
  } = useSessionStore();

  const [showMotivation, setShowMotivation] = useState(false);
  const [motivationalMessage, setMotivationalMessage] = useState('');
  const [sessionTime, setSessionTime] = useState(0);

  useEffect(() => {
    // Update session time every second
    if (!isPaused && currentSession) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((new Date().getTime() - currentSession.startTime.getTime()) / 1000);
        setSessionTime(elapsed);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isPaused, currentSession]);

  useEffect(() => {
    // Keyboard shortcuts
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isPaused) return;

      // Space to flip
      if (e.code === 'Space' && !isFlipped) {
        e.preventDefault();
        flipCard();
        return;
      }

      // Number keys for ratings (0-5)
      const key = parseInt(e.key);
      if (!isNaN(key) && key >= 0 && key <= 5 && isFlipped) {
        handleRating(key as QualityRating);
      }

      // Arrow keys for navigation
      if (e.code === 'ArrowRight' && isFlipped) {
        skipCard();
      }

      // Undo with Ctrl/Cmd + Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFlipped, isPaused, currentCardIndex, flipCard, skipCard]);

  const handleRating = (quality: QualityRating) => {
    if (!currentSession || currentCardIndex >= dueCards.length) return;

    const currentCard = dueCards[currentCardIndex];
    reviewCard(currentCard.id, quality);

    // Show motivational message for good ratings
    if (quality >= 4) {
      const message = MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
      setMotivationalMessage(message);
      setShowMotivation(true);
      setTimeout(() => setShowMotivation(false), 2000);
    }

    // Move to next card or complete session
    if (currentCardIndex < dueCards.length - 1) {
      setTimeout(() => nextCard(), 300);
    } else {
      setTimeout(() => {
        endSession();
        onComplete();
      }, 1000);
    }
  };

  const handleUndo = () => {
    if (undoHistory.length > 0) {
      undoLastReview();
    }
  };

  const handleSkip = () => {
    skipCard();
  };

  if (!currentSession || dueCards.length === 0) {
    return (
      <div className="review-session-empty">
        <h2>No cards to review</h2>
        <p>Start a new session to review your flashcards</p>
      </div>
    );
  }

  const currentCard = dueCards[currentCardIndex];
  const isLastCard = currentCardIndex >= dueCards.length - 1;

  return (
    <div className="review-session">
      {/* Motivational Message Overlay */}
      <AnimatePresence>
        {showMotivation && (
          <motion.div
            className="motivational-overlay"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <div className="motivational-message">
              <span className="motivational-icon">🎉</span>
              <h2>{motivationalMessage}</h2>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="review-session-header">
        <ProgressBar current={currentSession.cardsReviewed} total={currentSession.totalCards} />
        <div className="review-session-controls">
          <CardTimer isPaused={isPaused} onReset={currentCardIndex} />
          <button
            className="control-button"
            onClick={togglePause}
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? '▶️ Resume' : '⏸️ Pause'}
          </button>
          <button
            className="control-button"
            onClick={handleUndo}
            disabled={undoHistory.length === 0}
            title="Undo last rating (Ctrl/Cmd + Z)"
          >
            ↶ Undo
          </button>
          <button
            className="control-button skip-button"
            onClick={handleSkip}
            disabled={isLastCard}
            title="Skip card (Arrow Right)"
          >
            ⏭️ Skip
          </button>
        </div>
      </div>

      <div className="review-session-content">
        <div className="review-session-main">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCard.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <FlashCard
                card={currentCard}
                isFlipped={isFlipped}
                onFlip={flipCard}
              />
            </motion.div>
          </AnimatePresence>

          {isFlipped && !isPaused && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <QualityButtons onRate={handleRating} disabled={isPaused} />
            </motion.div>
          )}
        </div>

        <div className="review-session-sidebar">
          <CardDeck cards={dueCards} currentIndex={currentCardIndex} />
          <SessionStats session={currentSession} currentTime={sessionTime} />
        </div>
      </div>

      <div className="review-session-shortcuts">
        <h4>⌨️ Keyboard Shortcuts</h4>
        <div className="shortcuts-grid">
          <div className="shortcut-item">
            <kbd>Space</kbd>
            <span>Flip card</span>
          </div>
          <div className="shortcut-item">
            <kbd>0-5</kbd>
            <span>Rate card</span>
          </div>
          <div className="shortcut-item">
            <kbd>→</kbd>
            <span>Skip card</span>
          </div>
          <div className="shortcut-item">
            <kbd>Ctrl/Cmd + Z</kbd>
            <span>Undo rating</span>
          </div>
        </div>
      </div>
    </div>
  );
};
