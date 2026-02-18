import { useState } from 'react';
import { Lightbulb, Lock, Unlock, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { Hint } from '../../types/exercise';

interface HintSystemProps {
  hints: Hint[];
  revealedHints: string[];
  onRevealHint: (hintId: string) => void;
  disabled?: boolean;
}

export default function HintSystem({ hints, revealedHints, onRevealHint, disabled = false }: HintSystemProps) {
  const [expanded, setExpanded] = useState(true);

  const sortedHints = [...hints].sort((a, b) => a.level - b.level);
  const nextHintToReveal = sortedHints.find((hint) => !revealedHints.includes(hint.id));
  const revealedCount = revealedHints.length;
  const totalHints = hints.length;

  const getHintLevelLabel = (level: number): string => {
    switch (level) {
      case 1:
        return 'Gentle Nudge';
      case 2:
        return 'More Specific';
      case 3:
        return 'Nearly the Answer';
      default:
        return `Level ${level}`;
    }
  };

  const getHintLevelColor = (level: number): string => {
    switch (level) {
      case 1:
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 2:
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 3:
        return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
    }
  };

  if (hints.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-b border-yellow-200 dark:border-yellow-800 hover:from-yellow-100 hover:to-orange-100 dark:hover:from-yellow-900/30 dark:hover:to-orange-900/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Hints Available</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {revealedCount} of {totalHints} hints revealed
            </p>
          </div>
        </div>

        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        )}
      </button>

      {/* Content */}
      {expanded && (
        <div className="p-4 space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Progress</span>
              <span className="text-gray-900 dark:text-gray-100 font-medium">
                {revealedCount}/{totalHints}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-500"
                style={{ width: `${(revealedCount / totalHints) * 100}%` }}
              />
            </div>
          </div>

          {/* Warning Message */}
          {revealedCount === 0 && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900 dark:text-blue-300">
                <p className="font-medium mb-1">Try solving without hints first!</p>
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  Hints are revealed progressively. Each hint gives you more specific guidance.
                </p>
              </div>
            </div>
          )}

          {/* Hints List */}
          <div className="space-y-3">
            {sortedHints.map((hint, index) => {
              const isRevealed = revealedHints.includes(hint.id);
              const isNext = nextHintToReveal?.id === hint.id;

              return (
                <div
                  key={hint.id}
                  className={`border rounded-lg overflow-hidden transition-all ${
                    isRevealed
                      ? getHintLevelColor(hint.level)
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900'
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="flex-shrink-0 mt-0.5">
                        {isRevealed ? (
                          <Unlock className="w-5 h-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <Lock className="w-5 h-5 text-gray-400 dark:text-gray-600" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            Hint {index + 1}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              isRevealed
                                ? 'bg-white/50 dark:bg-black/20'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            {getHintLevelLabel(hint.level)}
                          </span>
                        </div>

                        {isRevealed ? (
                          <p className="text-sm leading-relaxed">{hint.content}</p>
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                            {isNext ? 'Click below to reveal this hint' : 'Locked - Reveal previous hints first'}
                          </p>
                        )}
                      </div>
                    </div>

                    {!isRevealed && isNext && (
                      <button
                        onClick={() => onRevealHint(hint.id)}
                        disabled={disabled}
                        className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed rounded-lg transition-all shadow-sm"
                      >
                        <Unlock className="w-4 h-4" />
                        Reveal Hint {index + 1}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* All Hints Revealed Message */}
          {revealedCount === totalHints && (
            <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <Lightbulb className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-900 dark:text-green-300">
                <p className="font-medium">All hints revealed!</p>
                <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                  If you're still stuck, you can view the solution.
                </p>
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              <span className="font-semibold">Tip:</span> Try to solve the exercise using fewer hints to challenge
              yourself and improve your problem-solving skills!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
