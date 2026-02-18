import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../lib/api/client';

interface TenantSettings {
  name: string;
  branding: {
    logo?: string;
    primaryColor: string;
    secondaryColor: string;
    loginPageTitle?: string;
    loginPageSubtitle?: string;
  };
  settings: {
    allowedDomains?: string[];
    customFields?: Record<string, any>;
  };
}

export const TenantSettings: React.FC = () => {
  const [tenant, setTenant] = useState<any>(null);
  const [settings, setSettings] = useState<TenantSettings>({
    name: '',
    branding: {
      primaryColor: '#3b82f6',
      secondaryColor: '#8b5cf6',
    },
    settings: {},
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTenantDetails();
  }, []);

  const fetchTenantDetails = async () => {
    try {
      const response = await apiClient.get('/api/tenant/details');
      setTenant(response.data);
      setSettings({
        name: response.data.name,
        branding: response.data.branding,
        settings: response.data.settings,
      });
    } catch (error) {
      console.error('Error fetching tenant:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.put('/api/tenant/update', settings);
      alert('Tenant settings updated successfully');
      fetchTenantDetails();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Tenant Settings</h1>

      {/* Basic Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Tenant Name</label>
          <input
            type="text"
            value={settings.name}
            onChange={(e) => setSettings({ ...settings, name: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Slug</label>
            <input
              type="text"
              value={tenant?.slug}
              disabled
              className="w-full px-3 py-2 border rounded-lg bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Plan</label>
            <input
              type="text"
              value={tenant?.plan}
              disabled
              className="w-full px-3 py-2 border rounded-lg bg-gray-100"
            />
          </div>
        </div>
      </div>

      {/* Branding */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Branding</h2>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Primary Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.branding.primaryColor}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    branding: { ...settings.branding, primaryColor: e.target.value },
                  })
                }
                className="w-16 h-10 border rounded"
              />
              <input
                type="text"
                value={settings.branding.primaryColor}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    branding: { ...settings.branding, primaryColor: e.target.value },
                  })
                }
                className="flex-1 px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Secondary Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.branding.secondaryColor}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    branding: { ...settings.branding, secondaryColor: e.target.value },
                  })
                }
                className="w-16 h-10 border rounded"
              />
              <input
                type="text"
                value={settings.branding.secondaryColor}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    branding: { ...settings.branding, secondaryColor: e.target.value },
                  })
                }
                className="flex-1 px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Login Page Title</label>
          <input
            type="text"
            value={settings.branding.loginPageTitle || ''}
            onChange={(e) =>
              setSettings({
                ...settings,
                branding: { ...settings.branding, loginPageTitle: e.target.value },
              })
            }
            placeholder="Welcome to Learning Platform"
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Login Page Subtitle</label>
          <input
            type="text"
            value={settings.branding.loginPageSubtitle || ''}
            onChange={(e) =>
              setSettings({
                ...settings,
                branding: { ...settings.branding, loginPageSubtitle: e.target.value },
              })
            }
            placeholder="Sign in to continue your learning journey"
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
      </div>

      {/* Usage Stats */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Usage & Quotas</h2>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Users</span>
              <span className="text-sm text-gray-600">
                {tenant?.usage?.users || 0} / {tenant?.quotas?.maxUsers || 0}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{
                  width: `${Math.min(100, ((tenant?.usage?.users || 0) / (tenant?.quotas?.maxUsers || 1)) * 100)}%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Storage</span>
              <span className="text-sm text-gray-600">
                {tenant?.usage?.storage || 0} MB / {tenant?.quotas?.maxStorage || 0} MB
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{
                  width: `${Math.min(100, ((tenant?.usage?.storage || 0) / (tenant?.quotas?.maxStorage || 1)) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <button
          onClick={() => fetchTenantDetails()}
          className="px-6 py-2 border rounded-lg hover:bg-gray-50"
          disabled={saving}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default TenantSettings;
