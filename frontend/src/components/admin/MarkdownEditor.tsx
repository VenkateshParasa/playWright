import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Bold,
  Italic,
  Code,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Image as ImageIcon,
  Maximize2,
  Minimize2,
  Eye,
  Edit3,
  Split,
} from 'lucide-react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
  allowImages?: boolean;
  onImageUpload?: () => void;
}

type ViewMode = 'edit' | 'preview' | 'split';

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start writing...',
  height = '500px',
  allowImages = true,
  onImageUpload,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isFullScreen]);

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText =
      value.substring(0, start) +
      before +
      selectedText +
      after +
      value.substring(end);

    onChange(newText);

    // Set cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const formatBold = () => insertText('**', '**');
  const formatItalic = () => insertText('*', '*');
  const formatCode = () => insertText('`', '`');
  const formatCodeBlock = () => insertText('\n```\n', '\n```\n');
  const formatH1 = () => insertText('# ');
  const formatH2 = () => insertText('## ');
  const formatH3 = () => insertText('### ');
  const formatList = () => insertText('- ');
  const formatOrderedList = () => insertText('1. ');
  const formatLink = () => insertText('[', '](url)');
  const formatImage = () => insertText('![alt text](', ')');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Tab key support
    if (e.key === 'Tab') {
      e.preventDefault();
      insertText('  ');
    }

    // Ctrl/Cmd shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          formatBold();
          break;
        case 'i':
          e.preventDefault();
          formatItalic();
          break;
        case 'k':
          e.preventDefault();
          formatLink();
          break;
        case '`':
          e.preventDefault();
          formatCode();
          break;
      }
    }
  };

  return (
    <div
      className={`markdown-editor border border-gray-300 rounded-lg overflow-hidden bg-white dark:bg-gray-800 dark:border-gray-600 ${
        isFullScreen ? 'fixed inset-4 z-50' : ''
      }`}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2">
        <div className="flex items-center gap-1 flex-wrap">
          <button
            onClick={formatBold}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            title="Bold (Ctrl+B)"
            type="button"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={formatItalic}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            title="Italic (Ctrl+I)"
            type="button"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={formatCode}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            title="Inline Code (Ctrl+`)"
            type="button"
          >
            <Code className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          <button
            onClick={formatH1}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            title="Heading 1"
            type="button"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            onClick={formatH2}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            title="Heading 2"
            type="button"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            onClick={formatH3}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            title="Heading 3"
            type="button"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          <button
            onClick={formatList}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            title="Bullet List"
            type="button"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={formatOrderedList}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            title="Numbered List"
            type="button"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          <button
            onClick={formatLink}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            title="Insert Link (Ctrl+K)"
            type="button"
          >
            <LinkIcon className="w-4 h-4" />
          </button>

          {allowImages && (
            <button
              onClick={onImageUpload || formatImage}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              title="Insert Image"
              type="button"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode('edit')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'edit'
                ? 'bg-blue-500 text-white'
                : 'hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            title="Edit Mode"
            type="button"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'split'
                ? 'bg-blue-500 text-white'
                : 'hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            title="Split View"
            type="button"
          >
            <Split className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'preview'
                ? 'bg-blue-500 text-white'
                : 'hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            title="Preview Mode"
            type="button"
          >
            <Eye className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            title={isFullScreen ? 'Exit Fullscreen' : 'Fullscreen'}
            type="button"
          >
            {isFullScreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div
        className={`flex ${viewMode === 'split' ? 'divide-x dark:divide-gray-600' : ''}`}
        style={{ height: isFullScreen ? 'calc(100% - 50px)' : height }}
      >
        {/* Editor */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div
            className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} overflow-hidden`}
          >
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full h-full p-4 resize-none focus:outline-none font-mono text-sm bg-transparent dark:text-gray-100"
              spellCheck={false}
            />
          </div>
        )}

        {/* Preview */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div
            className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} overflow-y-auto`}
          >
            <div className="p-4 prose prose-sm max-w-none dark:prose-invert">
              {value ? (
                <ReactMarkdown
                  components={{
                    code: ({ node, inline, className, children, ...props }) => {
                      const match = /language-(\w+)/.exec(className || '');
                      return inline ? (
                        <code
                          className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-sm"
                          {...props}
                        >
                          {children}
                        </code>
                      ) : (
                        <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto">
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </pre>
                      );
                    },
                  }}
                >
                  {value}
                </ReactMarkdown>
              ) : (
                <p className="text-gray-400 italic">Preview will appear here...</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkdownEditor;
