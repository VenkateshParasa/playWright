import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  TrendingUp,
  BookOpen,
  Award,
  Activity,
  Clock,
  Target,
  Zap,
  AlertTriangle,
  Download,
} from 'lucide-react';

interface MetricCard {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
}

interface DashboardData {
  realTimeMetrics: any;
  userEngagement: any;
  learningOutcomes: any;
  contentPerformance: any;
  timeSeriesData: any[];
  cohortData: any[];
  funnelData: any[];
  churnPrediction: any[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [metricType, setMetricType] = useState('newUsers');
  const [granularity, setGranularity] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  useEffect(() => {
    fetchDashboardData();

    // Set up real-time updates
    const interval = setInterval(() => {
      fetchRealTimeMetrics();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [timeRange, metricType, granularity]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [overview, realTime, engagement, outcomes, content, timeSeries, cohort, funnel, churn] =
        await Promise.all([
          fetch('/api/analytics/dashboard/overview').then((r) => r.json()),
          fetch('/api/analytics/dashboard/realtime').then((r) => r.json()),
          fetch('/api/analytics/dashboard/engagement').then((r) => r.json()),
          fetch('/api/analytics/dashboard/learning-outcomes').then((r) => r.json()),
          fetch('/api/analytics/dashboard/content-performance').then((r) => r.json()),
          fetch(
            `/api/analytics/dashboard/timeseries?metric=${metricType}&granularity=${granularity}&startDate=${getStartDate()}&endDate=${new Date().toISOString()}`
          ).then((r) => r.json()),
          fetch(
            `/api/analytics/dashboard/cohort?startDate=${getCohortStartDate()}&endDate=${new Date().toISOString()}`
          ).then((r) => r.json()),
          fetch('/api/analytics/dashboard/funnel').then((r) => r.json()),
          fetch('/api/analytics/dashboard/churn-prediction').then((r) => r.json()),
        ]);

      setDashboardData({
        realTimeMetrics: realTime.data,
        userEngagement: engagement.data,
        learningOutcomes: outcomes.data,
        contentPerformance: content.data,
        timeSeriesData: timeSeries.data,
        cohortData: cohort.data,
        funnelData: funnel.data,
        churnPrediction: churn.data,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRealTimeMetrics = async () => {
    try {
      const response = await fetch('/api/analytics/dashboard/realtime');
      const data = await response.json();
      setDashboardData((prev) => (prev ? { ...prev, realTimeMetrics: data.data } : null));
    } catch (error) {
      console.error('Error fetching real-time metrics:', error);
    }
  };

  const getStartDate = () => {
    const date = new Date();
    switch (timeRange) {
      case '7d':
        date.setDate(date.getDate() - 7);
        break;
      case '30d':
        date.setDate(date.getDate() - 30);
        break;
      case '90d':
        date.setDate(date.getDate() - 90);
        break;
      case '1y':
        date.setFullYear(date.getFullYear() - 1);
        break;
      default:
        date.setDate(date.getDate() - 30);
    }
    return date.toISOString();
  };

  const getCohortStartDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 60);
    return date.toISOString();
  };

  const exportDashboard = async (format: 'pdf' | 'csv' | 'excel') => {
    try {
      const response = await fetch(`/api/analytics/dashboard/export?format=${format}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting dashboard:', error);
    }
  };

  if (loading || !dashboardData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const metricCards: MetricCard[] = [
    {
      title: 'Active Users (5 min)',
      value: dashboardData.realTimeMetrics.activeUsers.last5Minutes,
      icon: <Users className="h-6 w-6" />,
      trend: 'up',
    },
    {
      title: 'DAU',
      value: dashboardData.userEngagement.dau,
      change: 12.5,
      icon: <Activity className="h-6 w-6" />,
      trend: 'up',
    },
    {
      title: 'Completion Rate',
      value: `${dashboardData.learningOutcomes.completionRate.toFixed(1)}%`,
      change: 5.2,
      icon: <Target className="h-6 w-6" />,
      trend: 'up',
    },
    {
      title: 'Avg Study Time',
      value: `${Math.round(dashboardData.learningOutcomes.averageTimeToCompletion)}d`,
      icon: <Clock className="h-6 w-6" />,
      trend: 'down',
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-500 mt-1">Real-time insights and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => exportDashboard('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-500">{metric.title}</p>
                  <p className="text-2xl font-bold mt-2">{metric.value}</p>
                  {metric.change && (
                    <p
                      className={`text-sm mt-1 ${
                        metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {metric.trend === 'up' ? '↑' : '↓'} {Math.abs(metric.change)}%
                    </p>
                  )}
                </div>
                <div className="text-blue-600">{metric.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="cohorts">Cohorts</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Time Series Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>User Growth Trend</span>
                  <Select value={metricType} onValueChange={setMetricType}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newUsers">New Users</SelectItem>
                      <SelectItem value="activeUsers">Active Users</SelectItem>
                      <SelectItem value="lessonCompletions">Completions</SelectItem>
                    </SelectContent>
                  </Select>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dashboardData.timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Funnel Chart */}
            <Card>
              <CardHeader>
                <CardTitle>User Journey Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData.funnelData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="stage" type="category" width={150} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Engagement Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Retention Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Day-over-day</span>
                    <Badge variant="outline">
                      {dashboardData.userEngagement.retention.dayOverDay}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">7-day</span>
                    <Badge variant="outline">
                      {dashboardData.userEngagement.retention.sevenDay}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">30-day</span>
                    <Badge variant="outline">
                      {dashboardData.userEngagement.retention.thirtyDay}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Learning Velocity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-3xl font-bold">
                    {dashboardData.learningOutcomes.learningVelocity}
                  </div>
                  <p className="text-sm text-gray-500">activities per day</p>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Active Learners</span>
                      <span>{dashboardData.learningOutcomes.activeLearners}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${
                            (dashboardData.learningOutcomes.activeLearners /
                              dashboardData.learningOutcomes.totalLearners) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pass Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-3xl font-bold">
                    {dashboardData.learningOutcomes.passRate.toFixed(1)}%
                  </div>
                  <p className="text-sm text-gray-500">quiz success rate</p>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Perfect Scores</span>
                      <span>{dashboardData.learningOutcomes.perfectQuizRate.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${dashboardData.learningOutcomes.perfectQuizRate}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>User Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Daily Active Users (DAU)</p>
                      <p className="text-2xl font-bold">{dashboardData.userEngagement.dau}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Weekly Active Users (WAU)</p>
                      <p className="text-2xl font-bold">{dashboardData.userEngagement.wau}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Monthly Active Users (MAU)</p>
                      <p className="text-2xl font-bold">{dashboardData.userEngagement.mau}</p>
                    </div>
                    <Activity className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Stickiness (DAU/MAU)</p>
                      <p className="text-2xl font-bold">
                        {dashboardData.userEngagement.stickiness}%
                      </p>
                    </div>
                    <Zap className="h-8 w-8 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.contentPerformance.mostPopularLessons
                    .slice(0, 5)
                    .map((lesson: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{lesson.title}</p>
                          <p className="text-xs text-gray-500">
                            {lesson.completions} completions
                          </p>
                        </div>
                        <Badge>{lesson.avgRating}</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={dashboardData.contentPerformance.mostPopularLessons.slice(0, 10)}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="title" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="views" fill="#3b82f6" name="Views" />
                  <Bar dataKey="completions" fill="#10b981" name="Completions" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cohorts Tab */}
        <TabsContent value="cohorts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cohort Retention Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Cohort</th>
                      <th className="text-center p-2">Week 0</th>
                      <th className="text-center p-2">Week 1</th>
                      <th className="text-center p-2">Week 2</th>
                      <th className="text-center p-2">Week 3</th>
                      <th className="text-center p-2">Week 4</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.cohortData.map((cohort: any, index: number) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-medium">{cohort.cohort}</td>
                        <td className="text-center p-2">{cohort.week0}</td>
                        <td className="text-center p-2">
                          <span
                            className="px-2 py-1 rounded"
                            style={{
                              backgroundColor: `rgba(59, 130, 246, ${
                                cohort.week1 / cohort.week0
                              })`,
                            }}
                          >
                            {cohort.week1}
                          </span>
                        </td>
                        <td className="text-center p-2">
                          <span
                            className="px-2 py-1 rounded"
                            style={{
                              backgroundColor: `rgba(59, 130, 246, ${
                                cohort.week2 / cohort.week0
                              })`,
                            }}
                          >
                            {cohort.week2}
                          </span>
                        </td>
                        <td className="text-center p-2">
                          <span
                            className="px-2 py-1 rounded"
                            style={{
                              backgroundColor: `rgba(59, 130, 246, ${
                                cohort.week3 / cohort.week0
                              })`,
                            }}
                          >
                            {cohort.week3}
                          </span>
                        </td>
                        <td className="text-center p-2">
                          <span
                            className="px-2 py-1 rounded"
                            style={{
                              backgroundColor: `rgba(59, 130, 246, ${
                                cohort.week4 / cohort.week0
                              })`,
                            }}
                          >
                            {cohort.week4}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Churn Risk Prediction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.churnPrediction.slice(0, 10).map((user: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{user.userName}</p>
                      <p className="text-xs text-gray-500">{user.riskFactors.join(', ')}</p>
                    </div>
                    <Badge
                      variant={user.probability > 70 ? 'destructive' : 'warning'}
                      className="ml-2"
                    >
                      {user.probability}% risk
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
