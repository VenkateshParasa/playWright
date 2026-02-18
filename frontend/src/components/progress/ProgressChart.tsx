/**
 * ProgressChart Component
 * Visualizes progress data using various chart types
 */

import React, { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { TimeSeriesData, CategoryProgress } from '../../types/progress.types';

interface ProgressChartProps {
  data: TimeSeriesData[] | CategoryProgress[];
  type: 'line' | 'bar' | 'area' | 'pie';
  title: string;
  description?: string;
  className?: string;
}

export const ProgressChart: React.FC<ProgressChartProps> = ({
  data,
  type,
  title,
  description,
  className = '',
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Colors for charts
  const COLORS = {
    lessons: '#3B82F6',
    quizzes: '#10B981',
    exercises: '#8B5CF6',
    studyTime: '#F59E0B',
    score: '#EF4444',
  };

  const PIE_COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#F59E0B', '#EF4444'];

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600">{entry.name}:</span>
              <span className="font-medium text-gray-900">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom label for pie chart
  const renderCustomLabel = (entry: any) => {
    return `${entry.percentage}%`;
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data as TimeSeriesData[]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="date"
                stroke="#6B7280"
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="lessons"
                stroke={COLORS.lessons}
                strokeWidth={2}
                dot={{ fill: COLORS.lessons, r: 4 }}
                activeDot={{ r: 6 }}
                name="Lessons"
              />
              <Line
                type="monotone"
                dataKey="quizzes"
                stroke={COLORS.quizzes}
                strokeWidth={2}
                dot={{ fill: COLORS.quizzes, r: 4 }}
                activeDot={{ r: 6 }}
                name="Quizzes"
              />
              <Line
                type="monotone"
                dataKey="exercises"
                stroke={COLORS.exercises}
                strokeWidth={2}
                dot={{ fill: COLORS.exercises, r: 4 }}
                activeDot={{ r: 6 }}
                name="Exercises"
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data as TimeSeriesData[]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="date"
                stroke="#6B7280"
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="lessons" fill={COLORS.lessons} name="Lessons" radius={[4, 4, 0, 0]} />
              <Bar dataKey="quizzes" fill={COLORS.quizzes} name="Quizzes" radius={[4, 4, 0, 0]} />
              <Bar dataKey="exercises" fill={COLORS.exercises} name="Exercises" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data as TimeSeriesData[]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="date"
                stroke="#6B7280"
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="studyTime"
                stroke={COLORS.studyTime}
                fill={COLORS.studyTime}
                fillOpacity={0.6}
                name="Study Time (min)"
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        const pieData = data as CategoryProgress[];
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="completed"
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]}
                    opacity={activeIndex === null || activeIndex === index ? 1 : 0.6}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value, entry: any) => {
                  const item = pieData.find((d) => d.category === value);
                  return `${value} (${item?.completed}/${item?.total})`;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
      </div>

      {/* Chart */}
      <div className="w-full">{renderChart()}</div>

      {/* Legend for Pie Chart */}
      {type === 'pie' && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {(data as CategoryProgress[]).map((item, index) => (
            <div
              key={item.category}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color || PIE_COLORS[index % PIE_COLORS.length] }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{item.category}</p>
                <p className="text-xs text-gray-600">
                  {item.completed}/{item.total} ({item.percentage}%)
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
