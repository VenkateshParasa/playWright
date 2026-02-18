import { useState } from 'react';
import { GitCompare, ChevronDown, ChevronUp } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { ProgrammingLanguage } from '../../types/exercise';

interface CodeDiffProps {
  yourCode: string;
  solutionCode: string;
  language: ProgrammingLanguage;
}

const LANGUAGE_MAP: Record<ProgrammingLanguage, string> = {
  typescript: 'typescript',
  javascript: 'javascript',
  java: 'java',
};

export default function CodeDiff({ yourCode, solutionCode, language }: CodeDiffProps) {
  const [expanded, setExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'inline'>('split');

  const calculateDiffStats = () => {
    const yourLines = yourCode.split('\n').filter((line) => line.trim());
    const solutionLines = solutionCode.split('\n').filter((line) => line.trim());

    return {
      yourLinesCount: yourLines.length,
      solutionLinesCount: solutionLines.length,
      difference: yourLines.length - solutionLines.length,
    };
  };

  const stats = calculateDiffStats();

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-b border-indigo-200 dark:border-indigo-800 hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <GitCompare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Compare with Solution</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Your code: {stats.yourLinesCount} lines • Solution: {stats.solutionLinesCount} lines
              {stats.difference !== 0 && (
                <span
                  className={`ml-2 ${
                    stats.difference > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'
                  }`}
                >
                  ({stats.difference > 0 ? '+' : ''}
                  {stats.difference} lines)
                </span>
              )}
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
          {/* View Mode Selector */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">View Mode:</span>
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('split')}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                    viewMode === 'split'
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  Split View
                </button>
                <button
                  onClick={() => setViewMode('inline')}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                    viewMode === 'inline'
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  Inline View
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-indigo-500 rounded"></div>
                <span className="text-gray-600 dark:text-gray-400">Your Code</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-gray-600 dark:text-gray-400">Solution</span>
              </div>
            </div>
          </div>

          {/* Split View */}
          {viewMode === 'split' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-t-lg">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span className="text-sm font-semibold text-indigo-900 dark:text-indigo-300">Your Code</span>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-b-lg overflow-hidden">
                  <Editor
                    height="400px"
                    language={LANGUAGE_MAP[language]}
                    value={yourCode}
                    theme="vs-dark"
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      fontSize: 13,
                      lineNumbers: 'on',
                      renderLineHighlight: 'all',
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-t-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-semibold text-green-900 dark:text-green-300">Solution Code</span>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-b-lg overflow-hidden">
                  <Editor
                    height="400px"
                    language={LANGUAGE_MAP[language]}
                    value={solutionCode}
                    theme="vs-dark"
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      fontSize: 13,
                      lineNumbers: 'on',
                      renderLineHighlight: 'all',
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Inline View */}
          {viewMode === 'inline' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-t-lg">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span className="text-sm font-semibold text-indigo-900 dark:text-indigo-300">Your Code</span>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-b-lg overflow-hidden">
                  <Editor
                    height="300px"
                    language={LANGUAGE_MAP[language]}
                    value={yourCode}
                    theme="vs-dark"
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      fontSize: 13,
                      lineNumbers: 'on',
                      renderLineHighlight: 'all',
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-t-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-semibold text-green-900 dark:text-green-300">Solution Code</span>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-b-lg overflow-hidden">
                  <Editor
                    height="300px"
                    language={LANGUAGE_MAP[language]}
                    value={solutionCode}
                    theme="vs-dark"
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      fontSize: 13,
                      lineNumbers: 'on',
                      renderLineHighlight: 'all',
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Comparison Tips */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <GitCompare className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900 dark:text-blue-300">
              <p className="font-medium mb-1">Comparison Tips</p>
              <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
                <li>Look for differences in approach and algorithm choice</li>
                <li>Compare code readability and structure</li>
                <li>Note any performance optimizations in the solution</li>
                <li>Check for edge cases that might be handled differently</li>
                <li>Consider variable naming and code organization</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
