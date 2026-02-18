import { useEffect } from 'react';
import { useAdminUserStore } from '../../stores/adminUserStore';
import { getUserStats } from '../../lib/api/admin';
import { Users, UserCheck, UserX, UserPlus, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function UserStats() {
  const { stats, isLoadingStats, setStats, setLoadingStats } = useAdminUserStore();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const data = await getUserStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  if (isLoadingStats) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-200 rounded-lg"></div>
        <div className="h-32 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const roleData = [
    { name: 'Students', value: stats.roleDistribution.student || 0, color: '#10b981' },
    { name: 'Instructors', value: stats.roleDistribution.instructor || 0, color: '#3b82f6' },
    { name: 'Admins', value: stats.roleDistribution.admin || 0, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Users className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-3xl font-bold text-green-600">{stats.active}</p>
            </div>
            <UserCheck className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Suspended</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.suspended}</p>
            </div>
            <UserX className="w-12 h-12 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">New This Week</p>
              <p className="text-3xl font-bold text-purple-600">
                {stats.newRegistrations.thisWeek}
              </p>
            </div>
            <UserPlus className="w-12 h-12 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Active Users */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Active Users
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Today</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.activeUsers.today}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">This Week</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.activeUsers.thisWeek}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">This Month</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.activeUsers.thisMonth}
            </p>
          </div>
        </div>
      </div>

      {/* Role Distribution */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Role Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={roleData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {roleData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
