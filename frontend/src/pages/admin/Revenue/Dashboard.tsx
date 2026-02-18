import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import './Dashboard.css';

interface RevenueMetrics {
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
  totalRevenue: number;
  growth: number;
  activeSubscriptions: number;
  newSubscriptions: number;
  canceledSubscriptions: number;
  churnRate: number;
  ltv: number; // Lifetime Value
  cac: number; // Customer Acquisition Cost
}

export const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<RevenueMetrics | null>(null);
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [subscriptionData, setSubscriptionData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const fetchDashboardData = async () => {
    try {
      // Mock data - replace with actual API calls
      const mockMetrics: RevenueMetrics = {
        mrr: 125000,
        arr: 1500000,
        totalRevenue: 2345678,
        growth: 23.5,
        activeSubscriptions: 1245,
        newSubscriptions: 156,
        canceledSubscriptions: 23,
        churnRate: 1.8,
        ltv: 2400,
        cac: 450
      };

      const mockRevenueData = [
        { month: 'Jan', revenue: 95000, subscriptions: 85000, courses: 10000 },
        { month: 'Feb', revenue: 105000, subscriptions: 92000, courses: 13000 },
        { month: 'Mar', revenue: 112000, subscriptions: 98000, courses: 14000 },
        { month: 'Apr', revenue: 118000, subscriptions: 103000, courses: 15000 },
        { month: 'May', revenue: 125000, subscriptions: 108000, courses: 17000 },
        { month: 'Jun', revenue: 135000, subscriptions: 115000, courses: 20000 }
      ];

      const mockSubscriptionData = [
        { name: 'Free', value: 450, color: '#94a3b8' },
        { name: 'Basic', value: 380, color: '#3b82f6' },
        { name: 'Pro', value: 295, color: '#8b5cf6' },
        { name: 'Enterprise', value: 120, color: '#10b981' }
      ];

      setMetrics(mockMetrics);
      setRevenueData(mockRevenueData);
      setSubscriptionData(mockSubscriptionData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <div className="revenue-dashboard">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="revenue-dashboard">
        <div className="error">Unable to load dashboard data</div>
      </div>
    );
  }

  return (
    <div className="revenue-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Revenue Analytics</h1>
          <p>Track and analyze your platform's financial performance</p>
        </div>
        <div className="period-selector">
          <button
            className={period === 'week' ? 'active' : ''}
            onClick={() => setPeriod('week')}
          >
            Week
          </button>
          <button
            className={period === 'month' ? 'active' : ''}
            onClick={() => setPeriod('month')}
          >
            Month
          </button>
          <button
            className={period === 'quarter' ? 'active' : ''}
            onClick={() => setPeriod('quarter')}
          >
            Quarter
          </button>
          <button
            className={period === 'year' ? 'active' : ''}
            onClick={() => setPeriod('year')}
          >
            Year
          </button>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card highlight">
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <div className="metric-label">MRR</div>
            <div className="metric-value">{formatCurrency(metrics.mrr)}</div>
            <div className="metric-change positive">
              +{metrics.growth}% vs last month
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📈</div>
          <div className="metric-content">
            <div className="metric-label">ARR</div>
            <div className="metric-value">{formatCurrency(metrics.arr)}</div>
            <div className="metric-info">
              ${(metrics.arr / metrics.activeSubscriptions).toFixed(0)} per customer
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">👥</div>
          <div className="metric-content">
            <div className="metric-label">Active Subscriptions</div>
            <div className="metric-value">{metrics.activeSubscriptions.toLocaleString()}</div>
            <div className="metric-change positive">
              +{metrics.newSubscriptions} this {period}
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📊</div>
          <div className="metric-content">
            <div className="metric-label">Churn Rate</div>
            <div className="metric-value">{metrics.churnRate}%</div>
            <div className="metric-info">
              {metrics.canceledSubscriptions} canceled
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🎯</div>
          <div className="metric-content">
            <div className="metric-label">LTV</div>
            <div className="metric-value">{formatCurrency(metrics.ltv)}</div>
            <div className="metric-info">Lifetime value</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">💸</div>
          <div className="metric-content">
            <div className="metric-label">CAC</div>
            <div className="metric-value">{formatCurrency(metrics.cac)}</div>
            <div className="metric-info">
              LTV/CAC: {(metrics.ltv / metrics.cac).toFixed(1)}x
            </div>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card full-width">
          <h2>Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#8b5cf6"
                strokeWidth={3}
                name="Total Revenue"
              />
              <Line
                type="monotone"
                dataKey="subscriptions"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Subscriptions"
              />
              <Line
                type="monotone"
                dataKey="courses"
                stroke="#10b981"
                strokeWidth={2}
                name="Course Sales"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Revenue by Source</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              <Bar dataKey="subscriptions" fill="#3b82f6" name="Subscriptions" />
              <Bar dataKey="courses" fill="#10b981" name="Course Sales" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Subscription Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={subscriptionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {subscriptionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="insights-section">
        <h2>Key Insights</h2>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-icon">🚀</div>
            <div className="insight-content">
              <h3>Strong Growth</h3>
              <p>
                MRR is growing at {metrics.growth}% month-over-month, indicating
                healthy platform expansion.
              </p>
            </div>
          </div>
          <div className="insight-card">
            <div className="insight-icon">✅</div>
            <div className="insight-content">
              <h3>Low Churn Rate</h3>
              <p>
                Churn rate of {metrics.churnRate}% is below industry average,
                showing strong customer retention.
              </p>
            </div>
          </div>
          <div className="insight-card">
            <div className="insight-icon">💪</div>
            <div className="insight-content">
              <h3>Healthy LTV/CAC</h3>
              <p>
                LTV/CAC ratio of {(metrics.ltv / metrics.cac).toFixed(1)}x indicates
                efficient customer acquisition.
              </p>
            </div>
          </div>
          <div className="insight-card">
            <div className="insight-icon">📈</div>
            <div className="insight-content">
              <h3>Upgrade Opportunity</h3>
              <p>
                Focus on converting Free tier users to paid plans to accelerate
                revenue growth.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
