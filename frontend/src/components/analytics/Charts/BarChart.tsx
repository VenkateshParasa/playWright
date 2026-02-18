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
  yKeys: string[];
  colors?: string[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  layout?: 'horizontal' | 'vertical';
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  xKey,
  yKeys,
  colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
  height = 300,
  showGrid = true,
  showLegend = true,
  layout = 'horizontal',
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data} layout={layout}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" />}
        <XAxis dataKey={xKey} type={layout === 'horizontal' ? 'category' : 'number'} />
        <YAxis type={layout === 'horizontal' ? 'number' : 'category'} />
        <Tooltip />
        {showLegend && <Legend />}
        {yKeys.map((key, index) => (
          <Bar key={key} dataKey={key} fill={colors[index % colors.length]} />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};
