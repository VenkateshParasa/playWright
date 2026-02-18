import { motion } from 'framer-motion';
import { QualityRating, QUALITY_LABELS } from '../../types/flashcard.types';

interface QualityButtonsProps {
  onRate: (quality: QualityRating) => void;
  disabled?: boolean;
}

const qualityColors = {
  0: '#ef4444', // red-500
  1: '#f97316', // orange-500
  2: '#f59e0b', // amber-500
  3: '#eab308', // yellow-500
  4: '#84cc16', // lime-500
  5: '#22c55e'  // green-500
};

export const QualityButtons: React.FC<QualityButtonsProps> = ({ onRate, disabled = false }) => {
  const qualities: QualityRating[] = [0, 1, 2, 3, 4, 5];

  return (
    <div className="quality-buttons">
      <div className="quality-buttons-header">
        <h3>How well did you recall this card?</h3>
        <p className="quality-buttons-hint">Press 0-5 on your keyboard or click a button</p>
      </div>
      <div className="quality-buttons-grid">
        {qualities.map((quality) => (
          <motion.button
            key={quality}
            className="quality-button"
            onClick={() => onRate(quality)}
            disabled={disabled}
            whileHover={{ scale: disabled ? 1 : 1.05 }}
            whileTap={{ scale: disabled ? 1 : 0.95 }}
            style={{
              backgroundColor: qualityColors[quality],
              opacity: disabled ? 0.5 : 1
            }}
          >
            <span className="quality-number">{quality}</span>
            <span className="quality-label">{QUALITY_LABELS[quality]}</span>
          </motion.button>
        ))}
      </div>
      <div className="quality-buttons-info">
        <div className="quality-info-item">
          <span className="quality-info-icon">💡</span>
          <span>0-2: Card will be shown again soon</span>
        </div>
        <div className="quality-info-item">
          <span className="quality-info-icon">⏱️</span>
          <span>3-4: Card scheduled for review later</span>
        </div>
        <div className="quality-info-item">
          <span className="quality-info-icon">✨</span>
          <span>5: Card moves to longer interval</span>
        </div>
      </div>
    </div>
  );
};
