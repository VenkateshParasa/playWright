/**
 * AI Content Generator Component
 * Interface for generating quizzes, exercises, flashcards, and explanations
 */

import React, { useState } from 'react';
import {
  Wand2,
  FileText,
  Code,
  Lightbulb,
  BookOpen,
  Loader2,
  Download,
  Copy,
  Check,
} from 'lucide-react';

type ContentType = 'quiz' | 'exercise' | 'flashcards' | 'summary' | 'explanation';

interface GenerationOptions {
  questionCount?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  language?: string;
  includeExplanations?: boolean;
}

export const AIContentGenerator: React.FC = () => {
  const [contentType, setContentType] = useState<ContentType>('quiz');
  const [sourceContent, setSourceContent] = useState('');
  const [options, setOptions] = useState<GenerationOptions>({
    questionCount: 5,
    difficulty: 'medium',
    language: 'javascript',
    includeExplanations: true,
  });
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const contentTypes = [
    { id: 'quiz', label: 'Quiz Questions', icon: FileText, description: 'Generate multiple choice, true/false, and short answer questions' },
    { id: 'exercise', label: 'Coding Exercise', icon: Code, description: 'Create practice problems with test cases' },
    { id: 'flashcards', label: 'Flashcards', icon: BookOpen, description: 'Generate study flashcards from content' },
    { id: 'summary', label: 'Summary', icon: Lightbulb, description: 'Summarize long content or transcripts' },
    { id: 'explanation', label: 'Explanation', icon: Lightbulb, description: 'Generate detailed concept explanations' },
  ];

  const handleGenerate = async () => {
    if (!sourceContent.trim()) return;

    setGenerating(true);
    try {
      const response = await fetch(`/api/ai/content/${contentType}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: sourceContent,
          options,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setGeneratedContent(data);
      }
    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(generatedContent, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(generatedContent, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `generated-${contentType}-${Date.now()}.json`;
    link.click();
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Wand2 className="w-8 h-8" />
            <h1 className="text-2xl font-bold">AI Content Generator</h1>
          </div>
          <p className="text-purple-100">Generate educational content automatically using AI</p>
        </div>

        <div className="p-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Column - Input */}
            <div className="space-y-6">
              {/* Content Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What would you like to generate?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {contentTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setContentType(type.id as ContentType)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          contentType === type.id
                            ? 'border-purple-600 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className={`w-6 h-6 mb-2 ${
                          contentType === type.id ? 'text-purple-600' : 'text-gray-400'
                        }`} />
                        <div className="font-medium text-sm">{type.label}</div>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {contentTypes.find(t => t.id === contentType)?.description}
                </p>
              </div>

              {/* Source Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source Content
                </label>
                <textarea
                  value={sourceContent}
                  onChange={(e) => setSourceContent(e.target.value)}
                  placeholder="Paste your lesson content, video transcript, or documentation here..."
                  className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {sourceContent.length} characters
                </div>
              </div>

              {/* Options */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Generation Options</h3>

                {(contentType === 'quiz' || contentType === 'flashcards') && (
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Number of Items
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={options.questionCount}
                      onChange={(e) => setOptions({ ...options, questionCount: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                )}

                {contentType === 'exercise' && (
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Programming Language
                    </label>
                    <select
                      value={options.language}
                      onChange={(e) => setOptions({ ...options, language: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="typescript">TypeScript</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Difficulty Level
                  </label>
                  <div className="flex gap-2">
                    {['easy', 'medium', 'hard'].map((level) => (
                      <button
                        key={level}
                        onClick={() => setOptions({ ...options, difficulty: level as any })}
                        className={`flex-1 px-4 py-2 rounded-lg border font-medium text-sm transition-colors ${
                          options.difficulty === level
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="explanations"
                    checked={options.includeExplanations}
                    onChange={(e) => setOptions({ ...options, includeExplanations: e.target.checked })}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="explanations" className="text-sm text-gray-700">
                    Include detailed explanations
                  </label>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={!sourceContent.trim() || generating}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    Generate Content
                  </>
                )}
              </button>
            </div>

            {/* Right Column - Output */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Generated Content</h3>
                {generatedContent && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                      title="Copy to clipboard"
                    >
                      {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={handleExport}
                      className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                      title="Export as JSON"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 min-h-[600px]">
                {!generatedContent ? (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <Wand2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Generated content will appear here</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {contentType === 'quiz' && generatedContent.questions && (
                      <div className="space-y-4">
                        {generatedContent.questions.map((q: any, i: number) => (
                          <div key={i} className="bg-white rounded-lg p-4 border">
                            <div className="font-medium text-gray-900 mb-2">
                              {i + 1}. {q.question}
                            </div>
                            {q.options && (
                              <div className="space-y-1 ml-4">
                                {q.options.map((opt: string, j: number) => (
                                  <div key={j} className="flex items-start gap-2 text-sm">
                                    <span className={opt === q.correctAnswer ? 'text-green-600 font-medium' : 'text-gray-600'}>
                                      {String.fromCharCode(65 + j)}) {opt}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {q.explanation && (
                              <div className="mt-2 text-sm text-gray-600 bg-blue-50 rounded p-2">
                                <span className="font-medium">Explanation: </span>
                                {q.explanation}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {contentType === 'flashcards' && generatedContent.flashcards && (
                      <div className="grid gap-4">
                        {generatedContent.flashcards.map((card: any, i: number) => (
                          <div key={i} className="bg-white rounded-lg p-4 border">
                            <div className="text-sm text-purple-600 font-medium mb-2">
                              Card {i + 1}
                            </div>
                            <div className="font-medium text-gray-900 mb-2">
                              Q: {card.front}
                            </div>
                            <div className="text-sm text-gray-600 bg-gray-50 rounded p-2">
                              A: {card.back}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {(contentType === 'summary' || contentType === 'explanation') && (
                      <div className="bg-white rounded-lg p-4 border">
                        <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                          {generatedContent.summary || generatedContent.explanation}
                        </div>
                      </div>
                    )}

                    {contentType === 'exercise' && generatedContent.exercise && (
                      <div className="space-y-4">
                        <div className="bg-white rounded-lg p-4 border">
                          <h4 className="font-bold text-gray-900 mb-2">
                            {generatedContent.exercise.title}
                          </h4>
                          <p className="text-gray-700 mb-3">
                            {generatedContent.exercise.description}
                          </p>
                          <div className="text-sm text-gray-600 space-y-1">
                            {generatedContent.exercise.instructions.map((inst: string, i: number) => (
                              <div key={i}>• {inst}</div>
                            ))}
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border">
                          <div className="text-sm font-medium text-gray-700 mb-2">
                            Starter Code:
                          </div>
                          <pre className="bg-gray-900 text-gray-100 rounded p-3 text-sm overflow-x-auto">
                            <code>{generatedContent.exercise.starterCode}</code>
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Metadata */}
                    {generatedContent.metadata && (
                      <div className="bg-gray-100 rounded-lg p-3 text-xs text-gray-600">
                        <div>Generated: {new Date(generatedContent.metadata.generatedAt).toLocaleString()}</div>
                        {generatedContent.metadata.difficulty && (
                          <div>Difficulty: {generatedContent.metadata.difficulty}</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
