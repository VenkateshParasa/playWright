/**
 * Review Calendar Component
 * Month view calendar showing review counts per day with color coding
 */

import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useScheduleStore } from '../../stores/scheduleStore';
import { getHeatmapColor } from '../../types/schedule.types';

export const ReviewCalendar: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const {
    calendarData,
    calendarLoading,
    calendarError,
    loadCalendarData,
    setSelectedDate,
  } = useScheduleStore();

  // Load calendar data when month changes
  useEffect(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    loadCalendarData(start, end);
  }, [currentMonth, loadCalendarData]);

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const handleToday = () => {
    setCurrentMonth(new Date());
  };

  const handleDayClick = (date: string) => {
    setSelectedDate(date);
  };

  // Generate calendar grid
  const generateCalendarDays = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days: (Date | null)[] = [];

    // Add padding days from previous month
    const startDay = start.getDay(); // 0 = Sunday
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    // Add days of current month
    const daysInMonth = end.getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const today = format(new Date(), 'yyyy-MM-dd');
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">Review Calendar</h2>
        </div>

        <button
          onClick={handleToday}
          className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
        >
          Today
        </button>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePreviousMonth}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-semibold text-gray-800">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>

        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Error State */}
      {calendarError && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {calendarError}
        </div>
      )}

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Week day headers */}
        {weekDays.map(day => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-gray-600 py-2"
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {calendarDays.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const dateStr = format(day, 'yyyy-MM-dd');
          const dayData = calendarData[dateStr];
          const count = dayData?.count || 0;
          const isToday = dateStr === today;
          const color = getHeatmapColor(count);

          return (
            <button
              key={dateStr}
              onClick={() => handleDayClick(dateStr)}
              disabled={calendarLoading}
              className={`
                aspect-square p-1 rounded-lg border transition-all
                hover:scale-105 hover:shadow-md disabled:opacity-50
                ${isToday ? 'border-blue-500 border-2' : 'border-gray-200'}
              `}
              style={{ backgroundColor: color }}
              title={`${format(day, 'MMM d, yyyy')}\n${count} cards due`}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <span className={`text-sm font-medium ${count > 0 ? 'text-gray-800' : 'text-gray-600'}`}>
                  {format(day, 'd')}
                </span>
                {count > 0 && (
                  <span className="text-xs font-bold text-gray-700 mt-0.5">
                    {count}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-600">
        <span>Less</span>
        <div className="flex gap-1">
          {[0, 5, 10, 15, 25].map(count => (
            <div
              key={count}
              className="w-4 h-4 rounded"
              style={{ backgroundColor: getHeatmapColor(count) }}
              title={`${count}+ cards`}
            />
          ))}
        </div>
        <span>More</span>
      </div>

      {/* Loading Overlay */}
      {calendarLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      )}
    </div>
  );
};
