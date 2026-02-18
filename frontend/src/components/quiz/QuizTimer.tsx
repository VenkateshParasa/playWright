/**
 * QuizTimer Component
 * Displays countdown timer with auto-submit on timeout
 * Supports pause/resume functionality
 */

import { useEffect, useState, useRef } from 'react';
import { Clock, Pause, Play, AlertTriangle } from 'lucide-react';
import { useQuizStore, selectTimeRemaining } from '../../stores/quizStore';

interface QuizTimerProps {
  timeLimit: number; // in seconds
  onTimeUp?: () => void;
  className?: string;
}

export const QuizTimer: React.FC<QuizTimerProps> = ({
  timeLimit,
  onTimeUp,
  className = '',
}) => {
  const timeRemaining = useQuizStore(selectTimeRemaining);
  const timerActive = useQuizStore((state) => state.timerActive);
  const updateTimeRemaining = useQuizStore((state) => state.updateTimeRemaining);
  const pauseQuiz = useQuizStore((state) => state.pauseQuiz);
  const resumeQuiz = useQuizStore((state) => state.resumeQuiz);

  const [localTime, setLocalTime] = useState(timeRemaining);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // No timer if timeLimit is 0
  if (timeLimit === 0) {
    return null;
  }

  // Sync local time with store
  useEffect(() => {
    setLocalTime(timeRemaining);
  }, [timeRemaining]);

  // Timer countdown logic
  useEffect(() => {
    if (!timerActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setLocalTime((prev) => {
        const newTime = Math.max(0, prev - 1);
        updateTimeRemaining(newTime);

        if (newTime === 0) {
          onTimeUp?.();
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }

        return newTime;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timerActive, updateTimeRemaining, onTimeUp]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate percentage remaining
  const percentageRemaining = (localTime / timeLimit) * 100;

  // Determine color based on time remaining
  const getColorClass = (): string => {
    if (percentageRemaining > 50) return 'text-green-600 bg-green-50 border-green-200';
    if (percentageRemaining > 25) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  // Show warning when time is running low
  const showWarning = percentageRemaining <= 25 && percentageRemaining > 0;

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Timer Display */}
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-mono text-lg font-semibold ${getColorClass()}`}
      >
        <Clock className="w-5 h-5" />
        <span>{formatTime(localTime)}</span>
        {showWarning && <AlertTriangle className="w-5 h-5 animate-pulse" />}
      </div>

      {/* Progress Bar */}
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ease-linear ${
            percentageRemaining > 50
              ? 'bg-green-500'
              : percentageRemaining > 25
              ? 'bg-yellow-500'
              : 'bg-red-500'
          }`}
          style={{ width: `${percentageRemaining}%` }}
        />
      </div>

      {/* Pause/Resume Button */}
      <button
        onClick={() => (timerActive ? pauseQuiz() : resumeQuiz())}
        className="px-3 py-2 rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-colors"
        title={timerActive ? 'Pause Quiz' : 'Resume Quiz'}
      >
        {timerActive ? (
          <Pause className="w-5 h-5 text-gray-700" />
        ) : (
          <Play className="w-5 h-5 text-gray-700" />
        )}
      </button>

      {/* Time Up Warning */}
      {localTime === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-8 text-center shadow-2xl">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Time's Up!</h2>
            <p className="text-gray-600">Submitting your quiz automatically...</p>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Compact Timer Display for navigation bar
 */
interface CompactTimerProps {
  timeRemaining: number;
  timeLimit: number;
}

export const CompactTimer: React.FC<CompactTimerProps> = ({ timeRemaining, timeLimit }) => {
  if (timeLimit === 0) return null;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const percentageRemaining = (timeRemaining / timeLimit) * 100;

  const getColorClass = (): string => {
    if (percentageRemaining > 50) return 'text-green-600';
    if (percentageRemaining > 25) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`flex items-center gap-2 font-mono font-semibold ${getColorClass()}`}>
      <Clock className="w-4 h-4" />
      <span>{formatTime(timeRemaining)}</span>
    </div>
  );
};
