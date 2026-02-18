/**
 * Smart Search Component
 * AI-powered semantic search
 */

import React, { useState } from 'react';
import { Search, Sparkles, BookOpen, FileText } from 'lucide-react';

export const SmartSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/ai/search/semantic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ query, limit: 10 }),
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.results);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl font-bold">Smart Search</h2>
        </div>

        <div className="flex space-x-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Ask a question or search for content..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-300"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="space-y-4">
          {results.map((result, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {result.type === 'lesson' ? (
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  ) : (
                    <FileText className="w-5 h-5 text-green-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{result.title}</h3>
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                      {result.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{result.content.substring(0, 200)}...</p>
                  {result.highlights.length > 0 && (
                    <div className="text-xs text-gray-500">
                      <p className="font-medium mb-1">Relevant passages:</p>
                      {result.highlights.map((highlight: string, i: number) => (
                        <p key={i} className="italic">"{highlight}"</p>
                      ))}
                    </div>
                  )}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Relevance: {Math.round(result.relevanceScore * 100)}%
                    </span>
                    <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                      View →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
