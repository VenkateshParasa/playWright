import React from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface PieChartProps {
  data: any[];
  nameKey: string;
  valueKey: string;
  height?: number;
  title?: string;
  colors?: string[];
  showPercentage?: boolean;
}

const DEFAULT_COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // green-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
];

export const PieChart: React.FC<PieChartProps> = ({
  data,
  nameKey,
  valueKey,
  height = 300,
  title,
  colors = DEFAULT_COLORS,
  showPercentage = true,
}) => {
  const renderLabel = (entry: any) => {
    if (showPercentage) {
      const total = data.reduce((sum, item) => sum + item[valueKey], 0);
      const percentage = ((entry[valueKey] / total) * 100).toFixed(1);
      return `${entry[nameKey]}: ${percentage}%`;
    }
    return entry[nameKey];
  };

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey={valueKey}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
            }}
          />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};
