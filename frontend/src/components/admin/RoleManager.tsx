import { useEffect } from 'react';
import { useAdminUserStore } from '../../stores/adminUserStore';
import { getRoles } from '../../lib/api/admin';
import { Shield, Check } from 'lucide-react';

export default function RoleManager() {
  const { roles, setRoles } = useAdminUserStore();

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const data = await getRoles();
      setRoles(data);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="w-6 h-6" />
          Role Management
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {roles.map((role) => (
          <div
            key={role.name}
            className="bg-white rounded-lg shadow p-6 border-2 border-gray-200"
          >
            <h3 className="text-lg font-semibold capitalize mb-4">{role.name}</h3>
            <div className="space-y-3">
              {role.permissions.map((permission) => (
                <div key={permission.resource} className="text-sm">
                  <div className="font-medium text-gray-700 mb-1 capitalize">
                    {permission.resource}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {permission.actions.map((action) => (
                      <span
                        key={action}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        {action}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Role Hierarchy</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Admin:</strong> Full system access and user management</li>
          <li>• <strong>Instructor:</strong> Content creation and student management</li>
          <li>• <strong>Student:</strong> Basic learning access</li>
        </ul>
      </div>
    </div>
  );
}
