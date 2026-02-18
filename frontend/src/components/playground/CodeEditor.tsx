import React, { useRef, useEffect, useState } from 'react';
import Editor, { Monaco, OnMount } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import {
  Play,
  Save,
  Download,
  Upload,
  Settings,
  Copy,
  Check,
  FileCode,
  FolderOpen,
  Plus,
  X,
} from 'lucide-react';

export interface CodeFile {
  id: string;
  name: string;
  language: string;
  content: string;
  path: string;
}

export interface CodeEditorProps {
  files?: CodeFile[];
  activeFileId?: string;
  language?: string;
  theme?: 'vs-dark' | 'light';
  readOnly?: boolean;
  showMinimap?: boolean;
  fontSize?: number;
  onRun?: (code: string, language: string) => void;
  onSave?: (file: CodeFile) => void;
  onFileChange?: (fileId: string, content: string) => void;
  onFileSelect?: (fileId: string) => void;
  onFileAdd?: (name: string, language: string) => void;
  onFileDelete?: (fileId: string) => void;
  className?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  files = [],
  activeFileId,
  language = 'javascript',
  theme = 'vs-dark',
  readOnly = false,
  showMinimap = true,
  fontSize = 14,
  onRun,
  onSave,
  onFileChange,
  onFileSelect,
  onFileAdd,
  onFileDelete,
  className = '',
}) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);

  const [currentFile, setCurrentFile] = useState<CodeFile | null>(null);
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editorTheme, setEditorTheme] = useState(theme);
  const [editorFontSize, setEditorFontSize] = useState(fontSize);
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileLanguage, setNewFileLanguage] = useState('javascript');

  // Update current file when activeFileId changes
  useEffect(() => {
    if (activeFileId && files.length > 0) {
      const file = files.find((f) => f.id === activeFileId);
      if (file) {
        setCurrentFile(file);
      }
    } else if (files.length > 0 && !currentFile) {
      setCurrentFile(files[0]);
    }
  }, [activeFileId, files]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Configure IntelliSense and autocomplete
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });

    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      esModuleInterop: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      reactNamespace: 'React',
      allowJs: true,
      typeRoots: ['node_modules/@types'],
    });

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleSave();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleRun();
    });

    // Add custom themes
    monaco.editor.defineTheme('custom-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#1e1e1e',
        'editor.foreground': '#d4d4d4',
        'editor.lineHighlightBackground': '#2a2a2a',
        'editorCursor.foreground': '#aeafad',
        'editor.selectionBackground': '#264f78',
      },
    });
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined && currentFile) {
      if (onFileChange) {
        onFileChange(currentFile.id, value);
      }
      setCurrentFile({ ...currentFile, content: value });
    }
  };

  const handleRun = () => {
    if (currentFile && onRun) {
      onRun(currentFile.content, currentFile.language);
    }
  };

  const handleSave = () => {
    if (currentFile && onSave) {
      onSave(currentFile);
    }
  };

  const handleCopy = async () => {
    if (currentFile) {
      await navigator.clipboard.writeText(currentFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (currentFile) {
      const blob = new Blob([currentFile.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = currentFile.name;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleFileSelect = (fileId: string) => {
    const file = files.find((f) => f.id === fileId);
    if (file) {
      setCurrentFile(file);
      if (onFileSelect) {
        onFileSelect(fileId);
      }
    }
  };

  const handleNewFile = () => {
    if (newFileName && onFileAdd) {
      onFileAdd(newFileName, newFileLanguage);
      setNewFileName('');
      setNewFileLanguage('javascript');
      setShowNewFileDialog(false);
    }
  };

  const handleDeleteFile = (fileId: string) => {
    if (onFileDelete) {
      onFileDelete(fileId);
    }
  };

  const formatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
    }
  };

  const languageOptions = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'c', label: 'C' },
    { value: 'csharp', label: 'C#' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'php', label: 'PHP' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'json', label: 'JSON' },
    { value: 'yaml', label: 'YAML' },
    { value: 'markdown', label: 'Markdown' },
  ];

  return (
    <div className={`flex flex-col h-full bg-gray-900 ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <button
            onClick={handleRun}
            disabled={!onRun || readOnly}
            className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-sm font-medium transition-colors"
          >
            <Play className="w-4 h-4" />
            Run
          </button>

          <button
            onClick={handleSave}
            disabled={!onSave || readOnly}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            Save
          </button>

          <div className="w-px h-6 bg-gray-700 mx-2" />

          <button
            onClick={formatCode}
            className="p-1.5 hover:bg-gray-700 text-gray-300 rounded transition-colors"
            title="Format code (Shift+Alt+F)"
          >
            <FileCode className="w-4 h-4" />
          </button>

          <button
            onClick={handleCopy}
            className="p-1.5 hover:bg-gray-700 text-gray-300 rounded transition-colors"
            title="Copy to clipboard"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={handleDownload}
            className="p-1.5 hover:bg-gray-700 text-gray-300 rounded transition-colors"
            title="Download file"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 hover:bg-gray-700 text-gray-300 rounded transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {currentFile && (
            <span className="text-sm text-gray-400">
              {currentFile.name}
            </span>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="px-4 py-3 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Theme</label>
              <select
                value={editorTheme}
                onChange={(e) => setEditorTheme(e.target.value as any)}
                className="px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-600"
              >
                <option value="vs-dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Font Size</label>
              <input
                type="number"
                value={editorFontSize}
                onChange={(e) => setEditorFontSize(Number(e.target.value))}
                min={10}
                max={24}
                className="w-16 px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-600"
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* File Explorer */}
        {files.length > 0 && (
          <div className="w-56 bg-gray-800 border-r border-gray-700 overflow-y-auto">
            <div className="p-2 border-b border-gray-700 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase">Files</span>
              {onFileAdd && (
                <button
                  onClick={() => setShowNewFileDialog(true)}
                  className="p-1 hover:bg-gray-700 text-gray-400 rounded"
                  title="New file"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="p-2 space-y-1">
              {files.map((file) => (
                <div
                  key={file.id}
                  className={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer hover:bg-gray-700 ${
                    currentFile?.id === file.id ? 'bg-gray-700' : ''
                  }`}
                  onClick={() => handleFileSelect(file.id)}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FileCode className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-200 truncate">{file.name}</span>
                  </div>
                  {onFileDelete && files.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFile(file.id);
                      }}
                      className="p-0.5 hover:bg-gray-600 text-gray-400 rounded opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Editor */}
        <div className="flex-1">
          <Editor
            height="100%"
            language={currentFile?.language || language}
            value={currentFile?.content || ''}
            theme={editorTheme}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            options={{
              readOnly,
              minimap: { enabled: showMinimap },
              fontSize: editorFontSize,
              fontFamily: "'Fira Code', 'Monaco', 'Menlo', monospace",
              fontLigatures: true,
              automaticLayout: true,
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              lineNumbers: 'on',
              renderWhitespace: 'selection',
              tabSize: 2,
              insertSpaces: true,
              formatOnPaste: true,
              formatOnType: true,
              suggestOnTriggerCharacters: true,
              acceptSuggestionOnEnter: 'on',
              quickSuggestions: true,
              parameterHints: { enabled: true },
              folding: true,
              foldingStrategy: 'indentation',
              showFoldingControls: 'always',
              bracketPairColorization: { enabled: true },
            }}
          />
        </div>
      </div>

      {/* New File Dialog */}
      {showNewFileDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-white mb-4">New File</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">File Name</label>
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="example.js"
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Language</label>
                <select
                  value={newFileLanguage}
                  onChange={(e) => setNewFileLanguage(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                >
                  {languageOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleNewFile}
                disabled={!newFileName}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded font-medium transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowNewFileDialog(false);
                  setNewFileName('');
                  setNewFileLanguage('javascript');
                }}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
