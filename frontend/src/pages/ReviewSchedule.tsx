/**
 * Review Schedule Page
 * Main page combining calendar, forecast, heatmap, and analytics
 */

import React, { useState } from 'react';
import { Calendar, TrendingUp, Activity, Settings, Clock, Flame } from 'lucide-react';
import { ReviewCalendar } from '../components/flashcards/ReviewCalendar';
import { ReviewForecast } from '../components/flashcards/ReviewForecast';
import { ReviewHeatmap } from '../components/flashcards/ReviewHeatmap';
import { RetentionGraph } from '../components/flashcards/RetentionGraph';
import { ScheduleSettings } from '../components/flashcards/ScheduleSettings';
import { DailyBreakdown } from '../components/flashcards/DailyBreakdown';
import { StudyTimeAnalytics } from '../components/flashcards/StudyTimeAnalytics';

type Tab = 'overview' | 'forecast' | 'retention' | 'analytics' | 'settings';

export const ReviewSchedule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const tabs = [
    { id: 'overview' as Tab, label: 'Overview', icon: Calendar },
    { id: 'forecast' as Tab, label: 'Forecast', icon: TrendingUp },
    { id: 'retention' as Tab, label: 'Retention', icon: Activity },
    { id: 'analytics' as Tab, label: 'Analytics', icon: Clock },
    { id: 'settings' as Tab, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Schedule</h1>
          <p className="text-gray-600">
            Manage your review calendar, analyze retention, and optimize your study schedule
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-2">
          <div className="flex flex-wrap gap-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <>
              {/* Calendar and Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <ReviewCalendar />
                </div>
                <div className="lg:col-span-1">
                  <DailyBreakdown />
                </div>
              </div>

              {/* Heatmap */}
              <ReviewHeatmap />

              {/* Quick Stats */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Tips</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-1">Review Regularly</h3>
                      <p className="text-sm text-blue-800">
                        Consistent daily reviews lead to better retention
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-green-900 mb-1">Watch Your Forecast</h3>
                      <p className="text-sm text-green-800">
                        Plan ahead for days with high review counts
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                    <Flame className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-purple-900 mb-1">Build Streaks</h3>
                      <p className="text-sm text-purple-800">
                        Daily practice builds habits and improves retention
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'forecast' && (
            <>
              <ReviewForecast />

              {/* Forecast Tips */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Understanding Your Forecast</h2>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <p>
                      <strong>New cards</strong> are cards you haven't seen before. Start with these
                      if your review queue is manageable.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-600 font-bold">•</span>
                    <p>
                      <strong>Learning cards</strong> are in the initial learning phase. These should
                      be reviewed on the same day they appear.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <p>
                      <strong>Review cards</strong> are mature cards coming up for review. These are
                      your priority to maintain retention.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'retention' && (
            <>
              <RetentionGraph />

              {/* Retention Tips */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                  Improving Your Retention
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-2">For High Retention (80%+)</h3>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Your schedule is working well</li>
                      <li>• Consider increasing daily card limit</li>
                      <li>• Maintain your current review habits</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h3 className="font-semibold text-yellow-900 mb-2">
                      For Medium Retention (60-80%)
                    </h3>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      <li>• Review cards more consistently</li>
                      <li>• Don't skip reviews when cards are due</li>
                      <li>• Consider decreasing new card rate</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-red-50 rounded-lg">
                    <h3 className="font-semibold text-red-900 mb-2">For Low Retention (&lt;60%)</h3>
                    <ul className="text-sm text-red-800 space-y-1">
                      <li>• Reduce new cards to focus on reviews</li>
                      <li>• Review cards immediately when due</li>
                      <li>• Check if cards are too difficult</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">General Tips</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Study at the same time each day</li>
                      <li>• Use mnemonics for difficult cards</li>
                      <li>• Take breaks during long sessions</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'analytics' && (
            <>
              <StudyTimeAnalytics />

              {/* Analytics Insights */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Optimize Your Study Time</h2>
                <div className="space-y-3 text-sm text-gray-700">
                  <p>
                    <strong>Best Time to Study:</strong> Research shows that spaced repetition works
                    best when you review at consistent times each day. Your analytics show your most
                    productive study hours - try to schedule your reviews during these times.
                  </p>
                  <p>
                    <strong>Session Length:</strong> Optimal review sessions last 20-30 minutes.
                    Longer sessions may lead to fatigue and reduced effectiveness. Take breaks if you
                    have many reviews.
                  </p>
                  <p>
                    <strong>Consistency Matters:</strong> Daily practice, even for just 10 minutes, is
                    more effective than sporadic long sessions. Build a streak to form lasting habits.
                  </p>
                </div>
              </div>
            </>
          )}

          {activeTab === 'settings' && (
            <>
              <ScheduleSettings />

              {/* Settings Guide */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Settings Guide</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Recommended Settings</h3>
                    <ul className="text-sm text-gray-700 space-y-2">
                      <li>
                        <strong>Beginners:</strong> 10-20 new cards/day, 100-150 reviews/day
                      </li>
                      <li>
                        <strong>Intermediate:</strong> 20-30 new cards/day, 150-200 reviews/day
                      </li>
                      <li>
                        <strong>Advanced:</strong> 30-50 new cards/day, 200+ reviews/day
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">When to Adjust</h3>
                    <ul className="text-sm text-gray-700 space-y-2">
                      <li>• Reduce new cards if your review queue is growing too fast</li>
                      <li>• Increase review limit if you consistently hit the daily cap</li>
                      <li>• Adjust learning steps if cards are graduating too quickly or slowly</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
