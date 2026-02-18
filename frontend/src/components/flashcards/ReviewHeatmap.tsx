/**
 * Review Heatmap Component
 * GitHub-style contribution heatmap showing review activity
 */

import React, { useEffect } from 'react';
import { format, parseISO, startOfYear, endOfYear, eachDayOfInterval, getDay } from 'date-fns';
import { Flame, ChevronLeft, ChevronRight } from 'lucide-react';
import { useScheduleStore } from '../../stores/scheduleStore';
import { getHeatmapColor, HEATMAP_LEGEND } from '../../types/schedule.types';

export const ReviewHeatmap: React.FC = () => {
  const {
    heatmapData,
    heatmapYear,
    heatmapLoading,
    heatmapError,
    loadHeatmapData,
    setHeatmapYear,
  } = useScheduleStore();

  useEffect(() => {
    loadHeatmapData(heatmapYear);
  }, [heatmapYear, loadHeatmapData]);

  const handlePreviousYear = () => {
    setHeatmapYear(heatmapYear - 1);
  };

  const handleNextYear = () => {
    setHeatmapYear(heatmapYear + 1);
  };

  // Generate all days in year
  const yearStart = startOfYear(new Date(heatmapYear, 0, 1));
  const yearEnd = endOfYear(new Date(heatmapYear, 11, 31));
  const allDays = eachDayOfInterval({ start: yearStart, end: yearEnd });

  // Create data map for quick lookup
  const dataMap = new Map(heatmapData.map(d => [d.date, d.count]));

  // Group days into weeks
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  // Add padding for first week
  const firstDayOfWeek = getDay(allDays[0]);
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push(null as any);
  }

  allDays.forEach(day => {
    currentWeek.push(day);

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  // Add last incomplete week
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null as any);
    }
    weeks.push(currentWeek);
  }

  // Calculate streak
  const calculateStreak = () => {
    let current = 0;
    let longest = 0;
    let temp = 0;

    const sortedData = [...heatmapData].sort((a, b) => b.date.localeCompare(a.date));

    for (const data of sortedData) {
      if (data.count > 0) {
        temp++;
        longest = Math.max(longest, temp);
      } else {
        if (temp > 0 && current === 0) {
          current = temp;
        }
        temp = 0;
      }
    }

    if (temp > 0 && current === 0) {
      current = temp;
    }

    return { current, longest };
  };

  const streak = calculateStreak();
  const totalReviews = heatmapData.reduce((sum, d) => sum + d.count, 0);
  const activeDays = heatmapData.filter(d => d.count > 0).length;

  const currentYear = new Date().getFullYear();
  const canGoNext = heatmapYear < currentYear;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-600" />
          <h2 className="text-xl font-bold text-gray-800">Review Activity</h2>
        </div>

        {/* Year Selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePreviousYear}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            aria-label="Previous year"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-lg font-semibold text-gray-800 min-w-20 text-center">
            {heatmapYear}
          </span>

          <button
            onClick={handleNextYear}
            disabled={!canGoNext}
            className="p-2 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next year"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Error State */}
      {heatmapError && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {heatmapError}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-orange-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Current Streak</p>
          <p className="text-2xl font-bold text-orange-600">{streak.current} days</p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Total Reviews</p>
          <p className="text-2xl font-bold text-blue-600">{totalReviews}</p>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Active Days</p>
          <p className="text-2xl font-bold text-green-600">{activeDays}</p>
        </div>
      </div>

      {/* Heatmap */}
      <div className="overflow-x-auto">
        {heatmapLoading ? (
          <div className="h-40 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          <div className="inline-block min-w-full">
            {/* Month labels */}
            <div className="flex mb-2">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(
                (month, i) => (
                  <div
                    key={month}
                    className="text-xs text-gray-600"
                    style={{ width: `${(100 / 12)}%`, textAlign: 'left' }}
                  >
                    {month}
                  </div>
                )
              )}
            </div>

            {/* Day labels + Heatmap grid */}
            <div className="flex">
              {/* Day labels */}
              <div className="flex flex-col justify-around text-xs text-gray-600 mr-2">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              {/* Grid */}
              <div className="flex gap-1">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {week.map((day, dayIndex) => {
                      if (!day) {
                        return <div key={`empty-${dayIndex}`} className="w-3 h-3" />;
                      }

                      const dateStr = format(day, 'yyyy-MM-dd');
                      const count = dataMap.get(dateStr) || 0;
                      const color = getHeatmapColor(count);

                      return (
                        <div
                          key={dateStr}
                          className="w-3 h-3 rounded-sm hover:ring-2 hover:ring-blue-500 cursor-pointer transition-all"
                          style={{ backgroundColor: color }}
                          title={`${format(day, 'MMM d, yyyy')}\n${count} cards reviewed`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span>Less</span>
          <div className="flex gap-1">
            {HEATMAP_LEGEND.map(item => (
              <div
                key={item.label}
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: item.color }}
                title={item.label}
              />
            ))}
          </div>
          <span>More</span>
        </div>

        <div className="text-xs text-gray-600">
          Longest streak: <span className="font-semibold text-orange-600">{streak.longest} days</span>
        </div>
      </div>
    </div>
  );
};
