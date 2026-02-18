import { useState } from 'react';
import { Eye, EyeOff, AlertTriangle, CheckCircle, Code } from 'lucide-react';
import CodeEditor from './CodeEditor';
import { ProgrammingLanguage } from '../../types/exercise';

interface SolutionViewerProps {
  solution: string;
  language: ProgrammingLanguage;
  isRevealed: boolean;
  onReveal: () => void;
  hasPassedAllTests?: boolean;
  requiresConfirmation?: boolean;
}

export default function SolutionViewer({
  solution,
  language,
  isRevealed,
  onReveal,
  hasPassedAllTests = false,
  requiresConfirmation = true,
}: SolutionViewerProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleReveal = () => {
    if (requiresConfirmation && !hasPassedAllTests && !showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    onReveal();
    setExpanded(true);
    setShowConfirmation(false);
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div
        className={`flex items-center justify-between px-4 py-3 border-b ${
          isRevealed
            ? 'bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800'
            : 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800'
        }`}
      >
        <div className="flex items-center gap-3">
          <Code className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Solution Code</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {isRevealed ? 'Solution revealed' : 'View the official solution'}
            </p>
          </div>
        </div>

        {isRevealed ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors"
          >
            {expanded ? (
              <>
                <EyeOff className="w-4 h-4" />
                Hide Solution
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Show Solution
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleReveal}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-all shadow-sm"
          >
            <Eye className="w-4 h-4" />
            Reveal Solution
          </button>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && !isRevealed && (
        <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-lg font-semibold text-yellow-900 dark:text-yellow-300 mb-2">
                Are you sure you want to reveal the solution?
              </h4>
              <div className="space-y-2 text-sm text-yellow-800 dark:text-yellow-400">
                <p>Before viewing the solution, consider:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Have you tried all the available hints?</li>
                  <li>Have you attempted different approaches?</li>
                  <li>Have you debugged your code with console.log?</li>
                  <li>Would stepping away and returning help?</li>
                </ul>
                <p className="mt-3 font-medium">
                  Viewing the solution will mark this exercise as "solution viewed" in your progress.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleReveal}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors"
            >
              Yes, Show Solution
            </button>
          </div>
        </div>
      )}

      {/* Success Message */}
      {hasPassedAllTests && !isRevealed && (
        <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-green-900 dark:text-green-300">
            <p className="font-medium mb-1">Congratulations! You've passed all tests!</p>
            <p className="text-xs text-green-700 dark:text-green-400">
              You can now view the official solution to compare approaches and learn alternative implementations.
            </p>
          </div>
        </div>
      )}

      {/* Solution Code */}
      {isRevealed && expanded && (
        <div className="p-4 space-y-4">
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900 dark:text-blue-300">
              <p className="font-medium mb-1">About this solution</p>
              <p className="text-xs text-blue-700 dark:text-blue-400">
                This is one possible solution. There may be other valid approaches. Study this code to understand
                different techniques and best practices.
              </p>
            </div>
          </div>

          <CodeEditor
            language={language}
            value={solution}
            onChange={() => {}}
            readOnly={true}
            height="400px"
            showLanguageSelector={false}
            showToolbar={true}
          />

          <div className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
            <Code className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <p className="font-medium mb-1">Learning Tips</p>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                <li>Compare this solution with your own code</li>
                <li>Identify differences in approach and efficiency</li>
                <li>Try to understand why certain techniques were used</li>
                <li>Practice implementing similar patterns in other exercises</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed State Message */}
      {isRevealed && !expanded && (
        <div className="p-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Click "Show Solution" to view the code again
          </p>
        </div>
      )}
    </div>
  );
}
