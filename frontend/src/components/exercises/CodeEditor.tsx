import { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { ProgrammingLanguage } from '../../types/exercise';
import { Code, Copy, Check, Settings, Maximize2, Minimize2 } from 'lucide-react';

interface CodeEditorProps {
  language: ProgrammingLanguage;
  value: string;
  onChange: (value: string) => void;
  onLanguageChange?: (language: ProgrammingLanguage) => void;
  readOnly?: boolean;
  height?: string;
  showLanguageSelector?: boolean;
  showToolbar?: boolean;
}

const LANGUAGE_MAP: Record<ProgrammingLanguage, string> = {
  typescript: 'typescript',
  javascript: 'javascript',
  java: 'java',
};

const LANGUAGE_DISPLAY: Record<ProgrammingLanguage, string> = {
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  java: 'Java',
};

export default function CodeEditor({
  language,
  value,
  onChange,
  onLanguageChange,
  readOnly = false,
  height = '400px',
  showLanguageSelector = true,
  showToolbar = true,
}: CodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [wordWrap, setWordWrap] = useState<'on' | 'off'>('off');
  const [minimap, setMinimap] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleFormat = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument').run();
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isFullscreen]);

  const editorOptions = {
    readOnly,
    fontSize,
    wordWrap,
    minimap: { enabled: minimap },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    renderLineHighlight: 'all' as const,
    lineNumbers: 'on' as const,
    folding: true,
    bracketPairColorization: {
      enabled: true,
    },
    suggest: {
      enabled: !readOnly,
    },
    quickSuggestions: !readOnly,
  };

  return (
    <div
      ref={containerRef}
      className={`relative border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden ${
        isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900' : ''
      }`}
    >
      {showToolbar && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-gray-500" />
            {showLanguageSelector && onLanguageChange && (
              <select
                value={language}
                onChange={(e) => onLanguageChange(e.target.value as ProgrammingLanguage)}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(LANGUAGE_DISPLAY).map(([key, display]) => (
                  <option key={key} value={key}>
                    {display}
                  </option>
                ))}
              </select>
            )}
            {!showLanguageSelector && (
              <span className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                {LANGUAGE_DISPLAY[language]}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleFormat}
              disabled={readOnly}
              className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Format code (Alt+Shift+F)"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <button
              onClick={handleCopy}
              className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Copy code"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                title="Editor settings"
              >
                <Settings className="w-4 h-4" />
              </button>

              {showSettings && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 space-y-3 z-10">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Font Size: {fontSize}px
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="24"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={wordWrap === 'on'}
                      onChange={(e) => setWordWrap(e.target.checked ? 'on' : 'off')}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Word Wrap</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={minimap}
                      onChange={(e) => setMinimap(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Show Minimap</span>
                  </label>
                </div>
              )}
            </div>

            <button
              onClick={toggleFullscreen}
              className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title={isFullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      <Editor
        height={isFullscreen ? 'calc(100vh - 48px)' : height}
        language={LANGUAGE_MAP[language]}
        value={value}
        onChange={(value) => onChange(value || '')}
        onMount={handleEditorDidMount}
        theme="vs-dark"
        options={editorOptions}
        loading={
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Loading editor...</div>
          </div>
        }
      />
    </div>
  );
}
