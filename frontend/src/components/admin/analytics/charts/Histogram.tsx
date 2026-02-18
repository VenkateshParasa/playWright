import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface HistogramProps {
  data: { range: string; count: number }[];
  height?: number;
  title?: string;
  xLabel?: string;
  yLabel?: string;
  color?: string;
}

export const Histogram: React.FC<HistogramProps> = ({
  data,
  height = 300,
  title,
  xLabel,
  yLabel,
  color = '#3b82f6',
}) => {
  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="range"
            label={xLabel ? { value: xLabel, position: 'insideBottom', offset: -5 } : undefined}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft' } : undefined}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
            }}
          />
          <Bar dataKey="count" fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
