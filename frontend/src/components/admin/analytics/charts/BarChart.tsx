import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface BarChartProps {
  data: any[];
  xKey: string;
  bars: {
    dataKey: string;
    fill?: string;
    name?: string;
  }[];
  height?: number;
  title?: string;
  xLabel?: string;
  yLabel?: string;
  layout?: 'horizontal' | 'vertical';
}

const COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // green-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
];

export const BarChart: React.FC<BarChartProps> = ({
  data,
  xKey,
  bars,
  height = 300,
  title,
  xLabel,
  yLabel,
  layout = 'horizontal',
}) => {
  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart
          data={data}
          layout={layout}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          {layout === 'horizontal' ? (
            <>
              <XAxis
                dataKey={xKey}
                label={xLabel ? { value: xLabel, position: 'insideBottom', offset: -5 } : undefined}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft' } : undefined}
                tick={{ fontSize: 12 }}
              />
            </>
          ) : (
            <>
              <XAxis
                type="number"
                label={xLabel ? { value: xLabel, position: 'insideBottom', offset: -5 } : undefined}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                dataKey={xKey}
                type="category"
                label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft' } : undefined}
                tick={{ fontSize: 12 }}
                width={150}
              />
            </>
          )}
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
            }}
          />
          <Legend />
          {bars.map((bar, index) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              fill={bar.fill || COLORS[index % COLORS.length]}
              name={bar.name || bar.dataKey}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};
