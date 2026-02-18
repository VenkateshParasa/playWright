import { motion } from 'framer-motion';
import { FlashCard as FlashCardType } from '../../types/flashcard.types';

interface FlashCardProps {
  card: FlashCardType;
  isFlipped: boolean;
  onFlip: () => void;
}

export const FlashCard: React.FC<FlashCardProps> = ({ card, isFlipped, onFlip }) => {
  return (
    <div className="flashcard-container" onClick={onFlip}>
      <motion.div
        className="flashcard"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front Side */}
        <motion.div
          className="flashcard-face flashcard-front"
          style={{
            backfaceVisibility: 'hidden',
            position: 'absolute',
            width: '100%',
            height: '100%'
          }}
        >
          <div className="flashcard-content">
            <div className="flashcard-header">
              <span className="flashcard-category">{card.category}</span>
              <span className={`flashcard-difficulty flashcard-difficulty-${card.difficulty}`}>
                {card.difficulty}
              </span>
            </div>
            <div className="flashcard-body">
              <h2 className="flashcard-question">Question</h2>
              <p className="flashcard-text">{card.front}</p>
            </div>
            <div className="flashcard-tags">
              {card.tags.map((tag) => (
                <span key={tag} className="flashcard-tag">
                  #{tag}
                </span>
              ))}
            </div>
            <div className="flashcard-hint">
              Click or press Space to reveal answer
            </div>
          </div>
        </motion.div>

        {/* Back Side */}
        <motion.div
          className="flashcard-face flashcard-back"
          style={{
            backfaceVisibility: 'hidden',
            position: 'absolute',
            width: '100%',
            height: '100%',
            rotateY: 180
          }}
        >
          <div className="flashcard-content">
            <div className="flashcard-header">
              <span className="flashcard-category">{card.category}</span>
              <span className={`flashcard-difficulty flashcard-difficulty-${card.difficulty}`}>
                {card.difficulty}
              </span>
            </div>
            <div className="flashcard-body">
              <h2 className="flashcard-answer">Answer</h2>
              <p className="flashcard-text">{card.back}</p>
            </div>
            <div className="flashcard-tags">
              {card.tags.map((tag) => (
                <span key={tag} className="flashcard-tag">
                  #{tag}
                </span>
              ))}
            </div>
            <div className="flashcard-hint">
              Rate your recall below
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
