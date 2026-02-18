/**
 * Tutoring Assistant Component
 * Interactive AI tutoring interface for students
 */

import React, { useState } from 'react';
import { MessageCircle, Lightbulb, Bug, Book, Send, Loader2 } from 'lucide-react';

type AssistanceType = 'hint' | 'debug' | 'explain' | 'question';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface TutoringAssistantProps {
  exerciseId: string;
  currentCode?: string;
}

export const TutoringAssistant: React.FC<TutoringAssistantProps> = ({
  exerciseId,
  currentCode,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [assistanceType, setAssistanceType] = useState<AssistanceType>('question');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const assistanceTypes = [
    { id: 'hint', label: 'Get Hint', icon: Lightbulb, description: 'Progressive hints' },
    { id: 'debug', label: 'Debug Help', icon: Bug, description: 'Find code issues' },
    { id: 'explain', label: 'Explain Concept', icon: Book, description: 'Learn concepts' },
    { id: 'question', label: 'Ask Question', icon: MessageCircle, description: 'General questions' },
  ];

  const handleSend = async () => {
    if (!input.trim() && assistanceType !== 'hint') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input || `Request ${assistanceType}`,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/tutoring/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseId,
          type: assistanceType,
          context: {
            currentCode,
            attempts,
            timeSpent: 0,
            errors: [],
          },
          specificQuestion: assistanceType === 'explain' || assistanceType === 'question' ? input : undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: data.response.content,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);

        if (assistanceType === 'hint') {
          setAttempts(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Tutoring error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg h-[600px] flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
        <h3 className="font-bold flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          AI Tutoring Assistant
        </h3>
        <p className="text-sm text-blue-100 mt-1">Get help anytime you need it</p>
      </div>

      {/* Assistance Type Selector */}
      <div className="p-3 border-b grid grid-cols-4 gap-2">
        {assistanceTypes.map(type => {
          const Icon = type.icon;
          return (
            <button
              key={type.id}
              onClick={() => setAssistanceType(type.id as AssistanceType)}
              className={`p-2 rounded-lg text-xs transition-all ${
                assistanceType === type.id
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
              title={type.description}
            >
              <Icon className="w-4 h-4 mx-auto mb-1" />
              <div className="font-medium">{type.label}</div>
            </button>
          );
        })}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Ask me anything! I'm here to help you learn.</p>
            <div className="mt-4 text-sm text-left max-w-md mx-auto space-y-2">
              <p className="font-medium text-gray-600">You can:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-500">
                <li>Request progressive hints</li>
                <li>Get debugging help</li>
                <li>Ask for concept explanations</li>
                <li>Get general guidance</li>
              </ul>
            </div>
          </div>
        ) : (
          messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                <div
                  className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-blue-200' : 'text-gray-500'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={
              assistanceType === 'hint'
                ? 'Press Send to get next hint'
                : assistanceType === 'debug'
                ? 'Describe your issue or press Send for automatic analysis'
                : 'Type your message...'
            }
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || (assistanceType !== 'hint' && !input.trim())}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                Send
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
