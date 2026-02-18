import React, { useState, useEffect } from 'react';
import { Play, Save, Share2, Settings, Layout, Split, Code2, Terminal as TerminalIcon, Globe } from 'lucide-react';
import CodeEditor, { CodeFile } from '../../components/playground/CodeEditor';
import Terminal from '../../components/playground/Terminal';
import BrowserPreview from '../../components/playground/BrowserPreview';

type LayoutMode = 'editor-only' | 'editor-terminal' | 'editor-preview' | 'full';

interface ExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  executionTime: number;
  stdout?: string;
  stderr?: string;
}

export const Playground: React.FC = () => {
  const [files, setFiles] = useState<CodeFile[]>([
    {
      id: '1',
      name: 'index.js',
      language: 'javascript',
      content: `// Welcome to the Playground!
// Write your code here and click Run to execute

console.log('Hello, World!');

// Try some async operations
async function fetchData() {
  const response = await fetch('https://api.example.com/data');
  const data = await response.json();
  console.log(data);
}

// fetchData();
`,
      path: 'index.js',
    },
  ]);

  const [activeFileId, setActiveFileId] = useState('1');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('full');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [sandboxId, setSandboxId] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');

  useEffect(() => {
    // Create sandbox on component mount
    createSandbox();

    return () => {
      // Cleanup sandbox on unmount
      if (sandboxId) {
        deleteSandbox();
      }
    };
  }, []);

  const createSandbox = async () => {
    try {
      const response = await fetch('/api/playground/sandbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'nodejs',
          duration: 120, // 2 hours
        }),
      });

      if (response.ok) {
        const sandbox = await response.json();
        setSandboxId(sandbox.id);
      }
    } catch (error) {
      console.error('Failed to create sandbox:', error);
    }
  };

  const deleteSandbox = async () => {
    if (!sandboxId) return;

    try {
      await fetch(`/api/playground/sandbox/${sandboxId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to delete sandbox:', error);
    }
  };

  const handleRun = async (code: string, language: string) => {
    setIsExecuting(true);
    setExecutionResult(null);

    try {
      const response = await fetch('/api/playground/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
        }),
      });

      const result: ExecutionResult = await response.json();
      setExecutionResult(result);
    } catch (error) {
      setExecutionResult({
        success: false,
        error: error instanceof Error ? error.message : 'Execution failed',
        executionTime: 0,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSave = async (file: CodeFile) => {
    if (!sandboxId) return;

    try {
      await fetch(`/api/playground/sandbox/${sandboxId}/file`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: file.path,
          content: file.content,
        }),
      });

      // Show success message
      console.log('File saved successfully');
    } catch (error) {
      console.error('Failed to save file:', error);
    }
  };

  const handleFileChange = (fileId: string, content: string) => {
    setFiles((prev) =>
      prev.map((file) => (file.id === fileId ? { ...file, content } : file))
    );
  };

  const handleFileAdd = (name: string, language: string) => {
    const newFile: CodeFile = {
      id: Date.now().toString(),
      name,
      language,
      content: '',
      path: name,
    };

    setFiles((prev) => [...prev, newFile]);
    setActiveFileId(newFile.id);
  };

  const handleFileDelete = (fileId: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== fileId));

    if (activeFileId === fileId && files.length > 1) {
      const remainingFiles = files.filter((file) => file.id !== fileId);
      setActiveFileId(remainingFiles[0].id);
    }
  };

  const handleTerminalCommand = async (command: string) => {
    if (!sandboxId) {
      return {
        stdout: 'Error: No sandbox available',
        stderr: '',
        exitCode: 1,
      };
    }

    try {
      const response = await fetch(`/api/playground/sandbox/${sandboxId}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      return {
        stdout: '',
        stderr: error instanceof Error ? error.message : 'Command failed',
        exitCode: 1,
      };
    }
  };

  const handleShare = async () => {
    // Create shareable link
    const shareData = {
      files,
      language: selectedLanguage,
    };

    const shareId = btoa(JSON.stringify(shareData));
    const shareUrl = `${window.location.origin}/playground?share=${shareId}`;

    await navigator.clipboard.writeText(shareUrl);
    alert('Share link copied to clipboard!');
  };

  const getLayoutClass = () => {
    switch (layoutMode) {
      case 'editor-only':
        return 'grid-cols-1';
      case 'editor-terminal':
        return 'grid-cols-1 grid-rows-[1fr_300px]';
      case 'editor-preview':
        return 'grid-cols-2';
      case 'full':
        return 'grid-cols-2 grid-rows-[1fr_300px]';
      default:
        return 'grid-cols-2 grid-rows-[1fr_300px]';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-white">Code Playground</h1>

          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-3 py-1.5 bg-gray-700 text-white text-sm rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
            <option value="ruby">Ruby</option>
            <option value="php">PHP</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLayoutMode('editor-only')}
            className={`p-2 rounded transition-colors ${
              layoutMode === 'editor-only'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title="Editor only"
          >
            <Code2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setLayoutMode('editor-terminal')}
            className={`p-2 rounded transition-colors ${
              layoutMode === 'editor-terminal'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title="Editor + Terminal"
          >
            <TerminalIcon className="w-4 h-4" />
          </button>

          <button
            onClick={() => setLayoutMode('editor-preview')}
            className={`p-2 rounded transition-colors ${
              layoutMode === 'editor-preview'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title="Editor + Preview"
          >
            <Split className="w-4 h-4" />
          </button>

          <button
            onClick={() => setLayoutMode('full')}
            className={`p-2 rounded transition-colors ${
              layoutMode === 'full'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title="Full layout"
          >
            <Layout className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-700 mx-2" />

          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>

          <button className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 grid gap-1 p-1 overflow-hidden ${getLayoutClass()}`}>
        {/* Code Editor */}
        <div className="overflow-hidden rounded-lg">
          <CodeEditor
            files={files}
            activeFileId={activeFileId}
            language={selectedLanguage}
            theme="vs-dark"
            onRun={handleRun}
            onSave={handleSave}
            onFileChange={handleFileChange}
            onFileSelect={setActiveFileId}
            onFileAdd={handleFileAdd}
            onFileDelete={handleFileDelete}
          />
        </div>

        {/* Preview/Output */}
        {(layoutMode === 'editor-preview' || layoutMode === 'full') && (
          <div className="overflow-hidden rounded-lg bg-white">
            {executionResult ? (
              <div className="h-full overflow-auto">
                <div className="p-4 bg-gray-800 text-white font-mono text-sm">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-semibold">Output:</span>
                    <span className="text-xs text-gray-400">
                      Executed in {executionResult.executionTime}ms
                    </span>
                  </div>

                  {executionResult.success ? (
                    <div className="space-y-2">
                      {executionResult.stdout && (
                        <div className="text-green-400">
                          <pre className="whitespace-pre-wrap">{executionResult.stdout}</pre>
                        </div>
                      )}
                      {executionResult.output && (
                        <div className="text-gray-300">
                          <pre className="whitespace-pre-wrap">{executionResult.output}</pre>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-red-400">
                      <div className="font-semibold mb-1">Error:</div>
                      <pre className="whitespace-pre-wrap">
                        {executionResult.error || executionResult.stderr}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Click Run to execute your code</p>
                  <p className="text-sm mt-2">Keyboard shortcut: Cmd/Ctrl + Enter</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Terminal */}
        {(layoutMode === 'editor-terminal' || layoutMode === 'full') && (
          <div
            className={`overflow-hidden rounded-lg ${
              layoutMode === 'full' ? 'col-span-2' : ''
            }`}
          >
            <Terminal
              sandboxId={sandboxId || undefined}
              onCommand={handleTerminalCommand}
            />
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-6 py-2 bg-gray-800 border-t border-gray-700 text-sm">
        <div className="flex items-center gap-4 text-gray-400">
          <span>Language: {selectedLanguage}</span>
          {sandboxId && (
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              Sandbox: {sandboxId.slice(0, 8)}
            </span>
          )}
          {isExecuting && <span className="text-blue-400">Executing...</span>}
        </div>

        <div className="flex items-center gap-4 text-gray-400">
          <span>{files.length} files</span>
          <span>Auto-save: On</span>
        </div>
      </div>
    </div>
  );
};

export default Playground;
