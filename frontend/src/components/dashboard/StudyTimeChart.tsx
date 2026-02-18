import { BarChart3 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface StudyData {
  day: string;
  minutes: number;
  lessons: number;
}

interface StudyTimeChartProps {
  data: StudyData[];
  isLoading?: boolean;
}

export default function StudyTimeChart({
  data,
  isLoading = false,
}: StudyTimeChartProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  const totalMinutes = data.reduce((sum, item) => sum + item.minutes, 0);
  const averageMinutes = Math.round(totalMinutes / data.length);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-1">{payload[0].payload.day}</p>
          <p className="text-sm text-blue-600">
            Study Time: {payload[0].value} minutes
          </p>
          <p className="text-sm text-green-600">
            Lessons: {payload[0].payload.lessons}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Study Time (Last 7 Days)</h3>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs text-gray-600 mb-1">Total Time</p>
          <p className="text-lg font-bold text-blue-600">
            {totalHours}h {remainingMinutes}m
          </p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100">
          <p className="text-xs text-gray-600 mb-1">Daily Average</p>
          <p className="text-lg font-bold text-green-600">{averageMinutes}m</p>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-100">
          <p className="text-xs text-gray-600 mb-1">Total Lessons</p>
          <p className="text-lg font-bold text-purple-600">
            {data.reduce((sum, item) => sum + item.lessons, 0)}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="day"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              stroke="#9ca3af"
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 12 }}
              stroke="#9ca3af"
              label={{ value: 'Minutes', angle: -90, position: 'insideLeft', fill: '#6b7280', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
              iconType="circle"
            />
            <Bar
              dataKey="minutes"
              fill="#3b82f6"
              radius={[8, 8, 0, 0]}
              name="Study Time (min)"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Motivational Message */}
      {averageMinutes >= 30 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-lg">
          <p className="text-xs text-green-800 text-center">
            Great job! You're averaging {averageMinutes} minutes per day!
          </p>
        </div>
      )}
    </div>
  );
}
