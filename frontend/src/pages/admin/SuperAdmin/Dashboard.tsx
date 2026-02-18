import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../lib/api/client';

export const SuperAdminDashboard: React.FC = () => {
  const [health, setHealth] = useState<any>(null);
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [healthRes, tenantsRes] = await Promise.all([
        apiClient.get('/api/super-admin/health'),
        apiClient.get('/api/super-admin/tenants?limit=10'),
      ]);
      setHealth(healthRes.data);
      setTenants(tenantsRes.data.tenants);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendTenant = async (tenantId: string) => {
    if (!confirm('Are you sure you want to suspend this tenant?')) return;

    try {
      await apiClient.post(`/api/super-admin/tenants/${tenantId}/suspend`, {
        reason: 'Administrative action',
      });
      alert('Tenant suspended successfully');
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to suspend tenant');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Super Admin Dashboard</h1>

      {/* Health Metrics */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">Total Tenants</div>
          <div className="text-3xl font-bold text-blue-600">{health?.tenants?.total || 0}</div>
          <div className="text-xs text-gray-500 mt-2">
            {health?.tenants?.active} active, {health?.tenants?.trial} trial
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">Total Users</div>
          <div className="text-3xl font-bold text-green-600">{health?.users?.total || 0}</div>
          <div className="text-xs text-gray-500 mt-2">{health?.users?.active} active</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">Active Sessions</div>
          <div className="text-3xl font-bold text-purple-600">
            {health?.sessions?.active || 0}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">Recent Logins (24h)</div>
          <div className="text-3xl font-bold text-indigo-600">
            {health?.activity?.recentLogins24h || 0}
          </div>
          <div className="text-xs text-red-500 mt-2">
            {health?.activity?.recentErrors24h || 0} errors
          </div>
        </div>
      </div>

      {/* Recent Tenants */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Recent Tenants</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tenants.map((tenant) => (
                <tr key={tenant.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{tenant.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {tenant.slug}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {tenant.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        tenant.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : tenant.status === 'suspended'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {tenant.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{tenant.userCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleSuspendTenant(tenant.id)}
                      className="text-red-600 hover:text-red-900 mr-3"
                      disabled={tenant.status === 'suspended'}
                    >
                      Suspend
                    </button>
                    <a href={`/admin/tenants/${tenant.id}`} className="text-blue-600 hover:text-blue-900">
                      Details
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
