import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeExampleProps {
  code: string;
  language: string;
  title?: string;
  filename?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
  className?: string;
}

export default function CodeExample({
  code,
  language,
  title,
  filename,
  showLineNumbers = true,
  highlightLines = [],
  className = '',
}: CodeExampleProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const lines = code.split('\n');

  return (
    <div className={`code-example rounded-lg overflow-hidden my-4 ${className}`}>
      {/* Header */}
      {(title || filename) && (
        <div className="code-header bg-gray-800 dark:bg-gray-900 px-4 py-2 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center gap-2">
            {filename && (
              <span className="text-sm text-gray-300 font-mono">{filename}</span>
            )}
            {title && !filename && (
              <span className="text-sm text-gray-300">{title}</span>
            )}
            <span className="text-xs text-gray-500 bg-gray-700 px-2 py-0.5 rounded">
              {language}
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="copy-button flex items-center gap-1 px-2 py-1 rounded text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
            title="Copy code"
            aria-label="Copy code to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Code block */}
      <div className="code-content bg-gray-900 dark:bg-gray-950 overflow-x-auto">
        <pre className="p-4">
          <code className={`language-${language} block`}>
            {lines.map((line, index) => {
              const lineNumber = index + 1;
              const isHighlighted = highlightLines.includes(lineNumber);

              return (
                <div
                  key={index}
                  className={`code-line ${isHighlighted ? 'bg-blue-500/10 border-l-2 border-blue-500' : ''}`}
                >
                  {showLineNumbers && (
                    <span className="line-number inline-block w-8 text-right mr-4 text-gray-500 select-none">
                      {lineNumber}
                    </span>
                  )}
                  <span className="text-gray-100">{line || ' '}</span>
                </div>
              );
            })}
          </code>
        </pre>
      </div>

      {/* Footer - only show if no header */}
      {!title && !filename && (
        <div className="code-footer bg-gray-800 dark:bg-gray-900 px-4 py-2 flex items-center justify-between border-t border-gray-700">
          <span className="text-xs text-gray-500">{language}</span>
          <button
            onClick={handleCopy}
            className="copy-button flex items-center gap-1 px-2 py-1 rounded text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
            title="Copy code"
            aria-label="Copy code to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span className="text-xs">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span className="text-xs">Copy</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
