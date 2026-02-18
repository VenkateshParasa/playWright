import React from 'react';

interface HeatmapProps {
  data: { dayOfWeek: number; hour: number; count: number }[];
  height?: number;
  title?: string;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export const Heatmap: React.FC<HeatmapProps> = ({ data, height = 400, title }) => {
  // Find min and max count for color scaling
  const counts = data.map((d) => d.count);
  const minCount = Math.min(...counts);
  const maxCount = Math.max(...counts);

  // Get color intensity based on count
  const getColor = (count: number) => {
    if (count === 0) return '#f3f4f6'; // gray-100
    const intensity = (count - minCount) / (maxCount - minCount);

    // Blue gradient
    if (intensity < 0.25) return '#dbeafe'; // blue-100
    if (intensity < 0.5) return '#93c5fd'; // blue-300
    if (intensity < 0.75) return '#3b82f6'; // blue-500
    return '#1e40af'; // blue-800
  };

  // Get count for specific day and hour
  const getCount = (day: number, hour: number) => {
    const cell = data.find((d) => d.dayOfWeek === day && d.hour === hour);
    return cell?.count || 0;
  };

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Hour labels */}
          <div className="flex mb-1">
            <div className="w-12"></div>
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="flex-shrink-0 w-8 text-xs text-center text-gray-600"
              >
                {hour % 4 === 0 ? hour : ''}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          {DAYS.map((day, dayIndex) => (
            <div key={day} className="flex items-center mb-1">
              <div className="w-12 text-xs text-right pr-2 text-gray-600">{day}</div>
              {HOURS.map((hour) => {
                const count = getCount(dayIndex, hour);
                return (
                  <div
                    key={hour}
                    className="flex-shrink-0 w-8 h-8 mx-px my-px rounded-sm cursor-pointer transition-all hover:scale-110 relative group"
                    style={{ backgroundColor: getColor(count) }}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                      {day} {hour}:00 - {count} activities
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {/* Legend */}
          <div className="flex items-center mt-4 text-xs text-gray-600">
            <span className="mr-2">Less</span>
            <div className="w-4 h-4 rounded-sm mx-1" style={{ backgroundColor: '#f3f4f6' }}></div>
            <div className="w-4 h-4 rounded-sm mx-1" style={{ backgroundColor: '#dbeafe' }}></div>
            <div className="w-4 h-4 rounded-sm mx-1" style={{ backgroundColor: '#93c5fd' }}></div>
            <div className="w-4 h-4 rounded-sm mx-1" style={{ backgroundColor: '#3b82f6' }}></div>
            <div className="w-4 h-4 rounded-sm mx-1" style={{ backgroundColor: '#1e40af' }}></div>
            <span className="ml-2">More</span>
          </div>
        </div>
      </div>
    </div>
  );
};
