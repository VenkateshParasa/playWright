import { useState } from 'react';
import { Terminal, Trash2, AlertCircle, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { ConsoleLog } from '../../types/exercise';

interface ConsoleOutputProps {
  logs: ConsoleLog[];
  onClear?: () => void;
}

export default function ConsoleOutput({ logs, onClear }: ConsoleOutputProps) {
  const [filter, setFilter] = useState<'all' | 'log' | 'error' | 'warn' | 'info'>('all');

  const getLogIcon = (type: ConsoleLog['type']) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />;
      case 'warn':
        return <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      default:
        return <CheckCircle className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getLogColorClasses = (type: ConsoleLog['type']) => {
    switch (type) {
      case 'error':
        return 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'warn':
        return 'text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'info':
        return 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      default:
        return 'text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700';
    }
  };

  const filteredLogs = logs.filter((log) => filter === 'all' || log.type === filter);

  const logCounts = {
    all: logs.length,
    log: logs.filter((l) => l.type === 'log').length,
    error: logs.filter((l) => l.type === 'error').length,
    warn: logs.filter((l) => l.type === 'warn').length,
    info: logs.filter((l) => l.type === 'info').length,
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Console Output</h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">({filteredLogs.length} messages)</span>
        </div>

        {onClear && logs.length > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded transition-colors"
            title="Clear console"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {(['all', 'log', 'error', 'warn', 'info'] as const).map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              filter === filterType
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            {logCounts[filterType] > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded bg-white/20">
                {logCounts[filterType]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Console Content */}
      <div className="h-64 overflow-y-auto bg-gray-900 dark:bg-black font-mono text-sm">
        {filteredLogs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-600">
            {logs.length === 0 ? (
              <div className="text-center">
                <Terminal className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No console output yet</p>
                <p className="text-xs mt-1">Run your code to see console.log() output here</p>
              </div>
            ) : (
              <p className="text-sm">No {filter} messages</p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-700 dark:divide-gray-800">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className={`flex items-start gap-3 px-4 py-2.5 hover:bg-gray-800 dark:hover:bg-gray-900 transition-colors border-l-2 ${
                  log.type === 'error'
                    ? 'border-red-600'
                    : log.type === 'warn'
                    ? 'border-yellow-600'
                    : log.type === 'info'
                    ? 'border-blue-600'
                    : 'border-transparent'
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">{getLogIcon(log.type)}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs font-semibold uppercase ${
                        log.type === 'error'
                          ? 'text-red-400'
                          : log.type === 'warn'
                          ? 'text-yellow-400'
                          : log.type === 'info'
                          ? 'text-blue-400'
                          : 'text-gray-400'
                      }`}
                    >
                      {log.type}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-600">
                      {log.timestamp.toLocaleTimeString()}
                    </span>
                  </div>

                  <pre
                    className={`text-sm whitespace-pre-wrap break-words ${
                      log.type === 'error'
                        ? 'text-red-300'
                        : log.type === 'warn'
                        ? 'text-yellow-300'
                        : log.type === 'info'
                        ? 'text-blue-300'
                        : 'text-gray-300'
                    }`}
                  >
                    {log.message}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer with tips */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          <span className="font-semibold">Tip:</span> Use console.log(), console.error(), console.warn(), and
          console.info() to debug your code
        </p>
      </div>
    </div>
  );
}
