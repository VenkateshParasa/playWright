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
  colors?: string[];
  height?: number;
  showLegend?: boolean;
  showLabels?: boolean;
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  nameKey,
  valueKey,
  colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
  height = 300,
  showLegend = true,
  showLabels = true,
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          nameKey={nameKey}
          dataKey={valueKey}
          cx="50%"
          cy="50%"
          outerRadius={80}
          label={showLabels}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip />
        {showLegend && <Legend />}
      </RechartsPieChart>
    </ResponsiveContainer>
  );
};
