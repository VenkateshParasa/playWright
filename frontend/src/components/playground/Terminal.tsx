import React, { useRef, useEffect, useState } from 'react';
import { Terminal as TerminalIcon, X, Copy, Download, Maximize2, Minimize2 } from 'lucide-react';

// Note: This component requires xterm.js and xterm-addon-fit
// Install: npm install xterm xterm-addon-fit
// Import the CSS in your main app: import 'xterm/css/xterm.css';

export interface TerminalProps {
  sandboxId?: string;
  onCommand?: (command: string) => Promise<{ stdout: string; stderr: string; exitCode: number }>;
  welcomeMessage?: string;
  prompt?: string;
  className?: string;
}

export const Terminal: React.FC<TerminalProps> = ({
  sandboxId,
  onCommand,
  welcomeMessage = 'Welcome to the interactive terminal!\nType commands and press Enter to execute.\n\n',
  prompt = '$ ',
  className = '',
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<any>(null);
  const fitAddonRef = useRef<any>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentCommand, setCurrentCommand] = useState('');

  useEffect(() => {
    if (!terminalRef.current) return;

    // Dynamically import xterm to avoid SSR issues
    const initTerminal = async () => {
      try {
        const { Terminal } = await import('xterm');
        const { FitAddon } = await import('xterm-addon-fit');

        const term = new Terminal({
          cursorBlink: true,
          cursorStyle: 'block',
          fontFamily: "'Fira Code', 'Monaco', 'Menlo', monospace",
          fontSize: 14,
          lineHeight: 1.2,
          theme: {
            background: '#1e1e1e',
            foreground: '#d4d4d4',
            cursor: '#aeafad',
            black: '#000000',
            red: '#cd3131',
            green: '#0dbc79',
            yellow: '#e5e510',
            blue: '#2472c8',
            magenta: '#bc3fbc',
            cyan: '#11a8cd',
            white: '#e5e5e5',
            brightBlack: '#666666',
            brightRed: '#f14c4c',
            brightGreen: '#23d18b',
            brightYellow: '#f5f543',
            brightBlue: '#3b8eea',
            brightMagenta: '#d670d6',
            brightCyan: '#29b8db',
            brightWhite: '#ffffff',
          },
          scrollback: 1000,
          allowTransparency: true,
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);

        term.open(terminalRef.current!);
        fitAddon.fit();

        // Write welcome message
        term.write(welcomeMessage);
        term.write(prompt);

        xtermRef.current = term;
        fitAddonRef.current = fitAddon;

        let commandBuffer = '';

        // Handle terminal input
        term.onData(async (data) => {
          const code = data.charCodeAt(0);

          // Handle special keys
          if (code === 13) {
            // Enter key
            term.write('\r\n');

            if (commandBuffer.trim()) {
              setHistory((prev) => [...prev, commandBuffer]);
              await executeCommand(commandBuffer);
              commandBuffer = '';
            }

            term.write(prompt);
          } else if (code === 127) {
            // Backspace
            if (commandBuffer.length > 0) {
              commandBuffer = commandBuffer.slice(0, -1);
              term.write('\b \b');
            }
          } else if (code === 27) {
            // Escape sequences (arrow keys, etc.)
            // Handle arrow up/down for history
            if (data === '\x1b[A') {
              // Arrow up
              if (historyIndex < history.length - 1) {
                const newIndex = historyIndex + 1;
                setHistoryIndex(newIndex);
                const cmd = history[history.length - 1 - newIndex];
                if (cmd) {
                  // Clear current line
                  term.write('\r' + prompt + ' '.repeat(commandBuffer.length) + '\r' + prompt);
                  term.write(cmd);
                  commandBuffer = cmd;
                }
              }
            } else if (data === '\x1b[B') {
              // Arrow down
              if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);
                const cmd = history[history.length - 1 - newIndex];
                if (cmd) {
                  term.write('\r' + prompt + ' '.repeat(commandBuffer.length) + '\r' + prompt);
                  term.write(cmd);
                  commandBuffer = cmd;
                }
              } else if (historyIndex === 0) {
                setHistoryIndex(-1);
                term.write('\r' + prompt + ' '.repeat(commandBuffer.length) + '\r' + prompt);
                commandBuffer = '';
              }
            }
          } else if (code < 32) {
            // Control characters
            if (code === 3) {
              // Ctrl+C
              term.write('^C\r\n');
              commandBuffer = '';
              term.write(prompt);
            } else if (code === 12) {
              // Ctrl+L (clear screen)
              term.clear();
              term.write(prompt);
            }
          } else {
            // Regular character
            commandBuffer += data;
            term.write(data);
          }
        });

        // Handle window resize
        const handleResize = () => {
          fitAddon.fit();
        };

        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
          term.dispose();
        };
      } catch (error) {
        console.error('Failed to initialize terminal:', error);
      }
    };

    const executeCommand = async (command: string) => {
      if (!xtermRef.current) return;

      const term = xtermRef.current;

      try {
        if (onCommand) {
          // Execute command via callback
          const result = await onCommand(command);

          if (result.stdout) {
            term.write(result.stdout.replace(/\n/g, '\r\n'));
          }

          if (result.stderr) {
            term.write('\x1b[31m' + result.stderr.replace(/\n/g, '\r\n') + '\x1b[0m');
          }
        } else {
          // Built-in commands
          const parts = command.trim().split(/\s+/);
          const cmd = parts[0];
          const args = parts.slice(1);

          switch (cmd) {
            case 'help':
              term.write('Available commands:\r\n');
              term.write('  help    - Show this help message\r\n');
              term.write('  clear   - Clear the terminal\r\n');
              term.write('  echo    - Print text\r\n');
              term.write('  history - Show command history\r\n');
              break;

            case 'clear':
              term.clear();
              break;

            case 'echo':
              term.write(args.join(' ') + '\r\n');
              break;

            case 'history':
              history.forEach((cmd, i) => {
                term.write(`${i + 1}  ${cmd}\r\n`);
              });
              break;

            default:
              term.write(`\x1b[31mCommand not found: ${cmd}\x1b[0m\r\n`);
              term.write('Type "help" for available commands.\r\n');
          }
        }
      } catch (error) {
        term.write(`\x1b[31mError: ${error instanceof Error ? error.message : 'Unknown error'}\x1b[0m\r\n`);
      }
    };

    initTerminal();
  }, []);

  const handleClear = () => {
    if (xtermRef.current) {
      xtermRef.current.clear();
      xtermRef.current.write(prompt);
    }
  };

  const handleCopy = async () => {
    if (xtermRef.current) {
      const selection = xtermRef.current.getSelection();
      if (selection) {
        await navigator.clipboard.writeText(selection);
      }
    }
  };

  const handleDownload = () => {
    if (xtermRef.current) {
      const content = history.join('\n');
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'terminal-history.txt';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setTimeout(() => {
      if (fitAddonRef.current) {
        fitAddonRef.current.fit();
      }
    }, 100);
  };

  return (
    <div
      className={`flex flex-col bg-gray-900 ${
        isFullscreen ? 'fixed inset-0 z-50' : 'h-full'
      } ${className}`}
    >
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-300">Terminal</span>
          {sandboxId && (
            <span className="text-xs text-gray-500">
              ({sandboxId.slice(0, 8)})
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-1.5 hover:bg-gray-700 text-gray-400 rounded transition-colors"
            title="Copy selection"
          >
            <Copy className="w-4 h-4" />
          </button>

          <button
            onClick={handleDownload}
            className="p-1.5 hover:bg-gray-700 text-gray-400 rounded transition-colors"
            title="Download history"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={handleClear}
            className="p-1.5 hover:bg-gray-700 text-gray-400 rounded transition-colors"
            title="Clear terminal"
          >
            <X className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 hover:bg-gray-700 text-gray-400 rounded transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      <div className="flex-1 overflow-hidden p-2">
        <div ref={terminalRef} className="h-full" />
      </div>

      {/* Status Bar */}
      <div className="px-4 py-1 bg-gray-800 border-t border-gray-700 flex items-center justify-between text-xs text-gray-500">
        <span>{history.length} commands executed</span>
        {sandboxId && <span>Connected to sandbox</span>}
      </div>
    </div>
  );
};

export default Terminal;
