/**
 * AI Assistant Page for Instructors
 * Dashboard for managing AI-powered features
 */

import React, { useState } from 'react';
import { AIContentGenerator } from '../../components/ai/AIContentGenerator';
import { Bot, BarChart3, FileText, Settings, TrendingUp } from 'lucide-react';

type Tab = 'generate' | 'analytics' | 'settings';

export const AIAssistant: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('generate');

  const tabs = [
    { id: 'generate', label: 'Content Generation', icon: FileText },
    { id: 'analytics', label: 'AI Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Configuration', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Assistant</h1>
              <p className="text-sm text-gray-600">AI-powered content creation and analysis</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-6">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'generate' && <AIContentGenerator />}

        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">AI Usage Analytics</h2>

            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-purple-900">Content Generated</span>
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-purple-900">1,234</div>
                <div className="text-sm text-purple-600 mt-1">+12% from last month</div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-900">Submissions Graded</span>
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-blue-900">5,678</div>
                <div className="text-sm text-blue-600 mt-1">+8% from last month</div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-900">Tutoring Sessions</span>
                  <Bot className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-green-900">890</div>
                <div className="text-sm text-green-600 mt-1">+15% from last month</div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Most Generated Content</h3>
                <div className="space-y-2">
                  {[
                    { type: 'Quiz Questions', count: 456, percentage: 37 },
                    { type: 'Flashcards', count: 345, percentage: 28 },
                    { type: 'Exercises', count: 234, percentage: 19 },
                    { type: 'Summaries', count: 199, percentage: 16 },
                  ].map(item => (
                    <div key={item.type} className="flex items-center gap-4">
                      <div className="w-40 text-sm text-gray-700">{item.type}</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <div className="w-16 text-right text-sm font-medium text-gray-900">
                        {item.count}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Grading Statistics</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="border rounded-lg p-4">
                    <div className="text-2xl font-bold text-gray-900">92%</div>
                    <div className="text-sm text-gray-600">Avg Score</div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600">78%</div>
                    <div className="text-sm text-gray-600">Pass Rate</div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600">45s</div>
                    <div className="text-sm text-gray-600">Avg Time</div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="text-2xl font-bold text-orange-600">23</div>
                    <div className="text-sm text-gray-600">Reviews Pending</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">AI Configuration</h2>

            <div className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI Provider
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                  <option>OpenAI GPT-4</option>
                  <option>OpenAI GPT-3.5</option>
                  <option>Local Model</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperature (Creativity)
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  defaultValue="0.7"
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Precise (0.0)</span>
                  <span>Balanced (0.7)</span>
                  <span>Creative (1.0)</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  placeholder="sk-..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">Your API key is encrypted and secure</p>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Feature Toggles</h3>
                {[
                  { id: 'content-gen', label: 'Content Generation', enabled: true },
                  { id: 'auto-grade', label: 'Automated Grading', enabled: true },
                  { id: 'tutoring', label: 'AI Tutoring', enabled: true },
                  { id: 'plagiarism', label: 'Plagiarism Detection', enabled: true },
                ].map(feature => (
                  <div key={feature.id} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{feature.label}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={feature.enabled}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                ))}
              </div>

              <button className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors">
                Save Configuration
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
