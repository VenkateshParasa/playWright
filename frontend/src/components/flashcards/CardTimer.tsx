import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CardTimerProps {
  isPaused: boolean;
  onReset?: () => void;
}

export const CardTimer: React.FC<CardTimerProps> = ({ isPaused, onReset }) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused]);

  useEffect(() => {
    setSeconds(0);
  }, [onReset]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (seconds < 10) return '#22c55e'; // green
    if (seconds < 30) return '#eab308'; // yellow
    return '#ef4444'; // red
  };

  return (
    <motion.div
      className="card-timer"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="timer-icon">⏱️</div>
      <div className="timer-display" style={{ color: getTimerColor() }}>
        {formatTime(seconds)}
      </div>
      {isPaused && <div className="timer-paused-badge">Paused</div>}
    </motion.div>
  );
};
