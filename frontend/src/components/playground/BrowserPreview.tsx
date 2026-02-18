import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  Home,
  ExternalLink,
  Maximize2,
  Minimize2,
  Monitor,
  Smartphone,
  Tablet,
  Eye,
  Code,
  Network,
  Bug,
} from 'lucide-react';

export interface BrowserPreviewProps {
  url?: string;
  html?: string;
  sessionId?: string;
  onNavigate?: (url: string) => void;
  onScreenshot?: () => void;
  showDevTools?: boolean;
  className?: string;
}

export interface ConsoleMessage {
  type: 'log' | 'warn' | 'error' | 'info';
  message: string;
  timestamp: Date;
}

export interface NetworkRequest {
  url: string;
  method: string;
  status?: number;
  time: number;
  size?: number;
}

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

const VIEWPORT_SIZES = {
  desktop: { width: 1280, height: 720, label: 'Desktop' },
  tablet: { width: 768, height: 1024, label: 'Tablet' },
  mobile: { width: 375, height: 667, label: 'Mobile' },
};

export const BrowserPreview: React.FC<BrowserPreviewProps> = ({
  url: initialUrl = 'about:blank',
  html,
  sessionId,
  onNavigate,
  onScreenshot,
  showDevTools = true,
  className = '',
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [inputUrl, setInputUrl] = useState(initialUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [viewportSize, setViewportSize] = useState<ViewportSize>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'console' | 'network' | 'elements'>('preview');
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);
  const [networkRequests, setNetworkRequests] = useState<NetworkRequest[]>([]);
  const [elements, setElements] = useState<string>('');

  useEffect(() => {
    setInputUrl(initialUrl);
    setUrl(initialUrl);
  }, [initialUrl]);

  useEffect(() => {
    if (sessionId) {
      // Fetch console messages and network events from session
      fetchSessionData();
    }
  }, [sessionId]);

  const fetchSessionData = async () => {
    if (!sessionId) return;

    try {
      // Fetch console messages
      const consoleResponse = await fetch(`/api/playground/playwright/${sessionId}/console`);
      if (consoleResponse.ok) {
        const { messages } = await consoleResponse.json();
        const parsedMessages = messages.map((msg: string) => {
          const match = msg.match(/\[(.*?)\]\s*(.*)/);
          return {
            type: match?.[1] || 'log',
            message: match?.[2] || msg,
            timestamp: new Date(),
          };
        });
        setConsoleMessages(parsedMessages);
      }

      // Fetch network events
      const networkResponse = await fetch(`/api/playground/playwright/${sessionId}/network`);
      if (networkResponse.ok) {
        const { events } = await networkResponse.json();
        setNetworkRequests(events);
      }

      // Fetch page HTML
      const htmlResponse = await fetch(`/api/playground/playwright/${sessionId}/html`);
      if (htmlResponse.ok) {
        const { html } = await htmlResponse.json();
        setElements(html);
      }
    } catch (error) {
      console.error('Failed to fetch session data:', error);
    }
  };

  const handleNavigate = async () => {
    if (!inputUrl) return;

    setIsLoading(true);
    setUrl(inputUrl);

    if (onNavigate) {
      await onNavigate(inputUrl);
    }

    // Refresh session data
    if (sessionId) {
      setTimeout(() => {
        fetchSessionData();
      }, 1000);
    }

    setIsLoading(false);
  };

  const handleRefresh = () => {
    handleNavigate();
  };

  const handleBack = () => {
    // Implementation would require history tracking
    console.log('Navigate back');
  };

  const handleForward = () => {
    // Implementation would require history tracking
    console.log('Navigate forward');
  };

  const handleHome = () => {
    setInputUrl('about:blank');
    setUrl('about:blank');
  };

  const handleOpenExternal = () => {
    window.open(url, '_blank');
  };

  const handleScreenshot = () => {
    if (onScreenshot) {
      onScreenshot();
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const viewport = VIEWPORT_SIZES[viewportSize];

  return (
    <div
      className={`flex flex-col bg-white ${
        isFullscreen ? 'fixed inset-0 z-50' : 'h-full'
      } ${className}`}
    >
      {/* Browser Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 border-b border-gray-300">
        <div className="flex items-center gap-1">
          <button
            onClick={handleBack}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>

          <button
            onClick={handleForward}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            title="Forward"
          >
            <ArrowRight className="w-4 h-4 text-gray-600" />
          </button>

          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleHome}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            title="Home"
          >
            <Home className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* URL Bar */}
        <div className="flex-1 flex items-center gap-2">
          <div className="flex-1 flex items-center bg-white border border-gray-300 rounded-lg px-3 py-1.5">
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleNavigate()}
              placeholder="Enter URL..."
              className="flex-1 text-sm text-gray-700 outline-none"
            />
          </div>

          <button
            onClick={handleNavigate}
            disabled={isLoading || !inputUrl}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors"
          >
            Go
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewportSize('desktop')}
            className={`p-1.5 rounded transition-colors ${
              viewportSize === 'desktop' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200 text-gray-600'
            }`}
            title="Desktop view"
          >
            <Monitor className="w-4 h-4" />
          </button>

          <button
            onClick={() => setViewportSize('tablet')}
            className={`p-1.5 rounded transition-colors ${
              viewportSize === 'tablet' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200 text-gray-600'
            }`}
            title="Tablet view"
          >
            <Tablet className="w-4 h-4" />
          </button>

          <button
            onClick={() => setViewportSize('mobile')}
            className={`p-1.5 rounded transition-colors ${
              viewportSize === 'mobile' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200 text-gray-600'
            }`}
            title="Mobile view"
          >
            <Smartphone className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {onScreenshot && (
            <button
              onClick={handleScreenshot}
              className="p-1.5 hover:bg-gray-200 rounded transition-colors"
              title="Take screenshot"
            >
              <Eye className="w-4 h-4 text-gray-600" />
            </button>
          )}

          <button
            onClick={handleOpenExternal}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4 text-gray-600" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-gray-600" />
            ) : (
              <Maximize2 className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Browser Preview */}
        <div className="flex-1 flex flex-col items-center bg-gray-50 p-4 overflow-auto">
          <div
            className="bg-white shadow-lg"
            style={{
              width: viewport.width,
              height: viewport.height,
              maxWidth: '100%',
              maxHeight: '100%',
            }}
          >
            {html ? (
              <iframe
                srcDoc={html}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin"
                title="Preview"
              />
            ) : url !== 'about:blank' ? (
              <iframe
                src={url}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin allow-forms"
                title="Browser Preview"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <Monitor className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Enter a URL to start browsing</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-2 text-xs text-gray-500">
            {viewport.label} - {viewport.width} x {viewport.height}
          </div>
        </div>

        {/* DevTools Panel */}
        {showDevTools && (
          <div className="w-96 border-l border-gray-300 flex flex-col bg-white">
            {/* DevTools Tabs */}
            <div className="flex border-b border-gray-300">
              <button
                onClick={() => setActiveTab('console')}
                className={`flex items-center gap-2 px-4 py-2 text-sm ${
                  activeTab === 'console'
                    ? 'bg-white border-b-2 border-blue-600 text-blue-600'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Bug className="w-4 h-4" />
                Console
              </button>

              <button
                onClick={() => setActiveTab('network')}
                className={`flex items-center gap-2 px-4 py-2 text-sm ${
                  activeTab === 'network'
                    ? 'bg-white border-b-2 border-blue-600 text-blue-600'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Network className="w-4 h-4" />
                Network
              </button>

              <button
                onClick={() => setActiveTab('elements')}
                className={`flex items-center gap-2 px-4 py-2 text-sm ${
                  activeTab === 'elements'
                    ? 'bg-white border-b-2 border-blue-600 text-blue-600'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Code className="w-4 h-4" />
                Elements
              </button>
            </div>

            {/* DevTools Content */}
            <div className="flex-1 overflow-auto">
              {activeTab === 'console' && (
                <div className="p-2 space-y-1 font-mono text-xs">
                  {consoleMessages.length === 0 ? (
                    <div className="text-gray-400 p-2">No console messages</div>
                  ) : (
                    consoleMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`p-1 ${
                          msg.type === 'error'
                            ? 'text-red-600'
                            : msg.type === 'warn'
                            ? 'text-yellow-600'
                            : msg.type === 'info'
                            ? 'text-blue-600'
                            : 'text-gray-700'
                        }`}
                      >
                        <span className="text-gray-400">
                          [{msg.timestamp.toLocaleTimeString()}]
                        </span>{' '}
                        {msg.message}
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'network' && (
                <div className="divide-y divide-gray-200">
                  {networkRequests.length === 0 ? (
                    <div className="text-gray-400 p-4 text-sm">No network requests</div>
                  ) : (
                    networkRequests.map((req, i) => (
                      <div key={i} className="p-2 hover:bg-gray-50">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-gray-700 truncate flex-1">
                            {req.url.split('/').pop() || req.url}
                          </span>
                          <span
                            className={`ml-2 ${
                              req.status && req.status >= 200 && req.status < 300
                                ? 'text-green-600'
                                : req.status && req.status >= 400
                                ? 'text-red-600'
                                : 'text-gray-500'
                            }`}
                          >
                            {req.status || 'pending'}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          {req.method} • {req.time}ms
                          {req.size && ` • ${(req.size / 1024).toFixed(1)} KB`}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'elements' && (
                <div className="p-2">
                  {elements ? (
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-x-auto">
                      {elements}
                    </pre>
                  ) : (
                    <div className="text-gray-400 text-sm">No elements to display</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowserPreview;
