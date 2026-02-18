/**
 * Daily Breakdown Component
 * Shows detailed breakdown of cards due on a selected day
 */

import React from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar, Clock, Play, X } from 'lucide-react';
import { useScheduleStore } from '../../stores/scheduleStore';
import { useNavigate } from 'react-router-dom';

export const DailyBreakdown: React.FC = () => {
  const navigate = useNavigate();

  const {
    selectedDate,
    dayBreakdown,
    breakdownLoading,
    breakdownError,
    setSelectedDate,
  } = useScheduleStore();

  if (!selectedDate) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>Select a day from the calendar to see details</p>
      </div>
    );
  }

  const handleStartReview = () => {
    navigate('/flashcards');
  };

  const handleClose = () => {
    setSelectedDate(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">
            {format(parseISO(selectedDate), 'EEEE, MMMM d, yyyy')}
          </h2>
        </div>

        <button
          onClick={handleClose}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Error State */}
      {breakdownError && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {breakdownError}
        </div>
      )}

      {/* Loading State */}
      {breakdownLoading ? (
        <div className="h-40 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : !dayBreakdown ? (
        <div className="text-center text-gray-500 py-8">
          No data available for this date
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Total Cards</p>
              <p className="text-2xl font-bold text-blue-600">{dayBreakdown.summary.total}</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">New</p>
              <p className="text-2xl font-bold text-green-600">{dayBreakdown.summary.byType.new}</p>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Learning</p>
              <p className="text-2xl font-bold text-yellow-600">{dayBreakdown.summary.byType.learning}</p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Review</p>
              <p className="text-2xl font-bold text-purple-600">{dayBreakdown.summary.byType.review}</p>
            </div>
          </div>

          {/* Estimated Time */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Estimated Time</p>
                <p className="text-lg font-semibold text-gray-800">
                  {dayBreakdown.summary.estimatedTime} minutes
                </p>
              </div>
            </div>

            {dayBreakdown.summary.total > 0 && (
              <button
                onClick={handleStartReview}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                <Play className="w-4 h-4" />
                Start Review
              </button>
            )}
          </div>

          {/* By Category */}
          {Object.keys(dayBreakdown.summary.byCategory).length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">By Category</h3>
              <div className="space-y-2">
                {Object.entries(dayBreakdown.summary.byCategory)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, count]) => (
                    <div
                      key={category}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-gray-700">{category}</span>
                      <span className="font-semibold text-gray-800">{count} cards</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Average Interval */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Average Interval</p>
            <p className="text-lg font-semibold text-blue-600">
              {dayBreakdown.summary.averageInterval.toFixed(1)} days
            </p>
          </div>

          {/* Card List */}
          {dayBreakdown.cards.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">
                Cards Due ({dayBreakdown.cards.length})
              </h3>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {dayBreakdown.cards.map(card => (
                  <div
                    key={card.id}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-gray-800 font-medium">{card.front}</p>
                        <p className="text-sm text-gray-600 mt-1">{card.category}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            card.type === 'new'
                              ? 'bg-green-100 text-green-700'
                              : card.type === 'learning'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}
                        >
                          {card.type}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            card.difficulty === 'easy'
                              ? 'bg-green-100 text-green-700'
                              : card.difficulty === 'medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {card.difficulty}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Interval: {card.interval} day{card.interval !== 1 ? 's' : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
