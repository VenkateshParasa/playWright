import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAdminUserStore } from '../../stores/adminUserStore';
import {
  getUserById,
  suspendUser,
  activateUser,
  deleteUser,
  resetUserPassword,
  getUserActivity,
} from '../../lib/api/admin';
import {
  ArrowLeft,
  Mail,
  Calendar,
  Shield,
  Ban,
  CheckCircle,
  Trash2,
  Key,
  User as UserIcon,
  Activity,
} from 'lucide-react';
import UserEditor from '../../components/admin/UserEditor';
import ActivityTimeline from '../../components/admin/ActivityTimeline';

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, currentUserActivity, setCurrentUser, setCurrentUserActivity } =
    useAdminUserStore();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchUserDetails();
      fetchUserActivity();
    }
  }, [id]);

  const fetchUserDetails = async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await getUserById(id);
      setCurrentUser(data.user);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch user details');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserActivity = async () => {
    if (!id) return;

    try {
      const activity = await getUserActivity(id);
      setCurrentUserActivity(activity);
    } catch (error: any) {
      console.error('Failed to fetch user activity:', error);
    }
  };

  const handleSuspend = async () => {
    if (!id || !currentUser) return;

    const reason = prompt('Enter reason for suspension:');
    if (!reason) return;

    setActionLoading(true);
    try {
      const updatedUser = await suspendUser(id, reason);
      setCurrentUser(updatedUser);
      alert('User suspended successfully');
    } catch (error: any) {
      alert(error.message || 'Failed to suspend user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivate = async () => {
    if (!id) return;

    setActionLoading(true);
    try {
      const updatedUser = await activateUser(id);
      setCurrentUser(updatedUser);
      alert('User activated successfully');
    } catch (error: any) {
      alert(error.message || 'Failed to activate user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (hardDelete: boolean = false) => {
    if (!id) return;

    setActionLoading(true);
    try {
      await deleteUser(id, hardDelete);
      alert('User deleted successfully');
      navigate('/admin/users');
    } catch (error: any) {
      alert(error.message || 'Failed to delete user');
    } finally {
      setActionLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleResetPassword = async () => {
    if (!id) return;

    const sendEmail = confirm(
      'Send temporary password via email? (Click OK to send email, Cancel to show password)'
    );

    setActionLoading(true);
    try {
      const result = await resetUserPassword(id, sendEmail);
      if (result.tempPassword) {
        alert(`Temporary password: ${result.tempPassword}`);
      } else {
        alert('Password reset email sent successfully');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to reset password');
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (error || !currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'User not found'}</p>
          <Link
            to="/admin/users"
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2 justify-center"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Users
          </Link>
        </div>
      </div>
    );
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'instructor':
        return 'bg-blue-100 text-blue-800';
      case 'student':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800';
      case 'deleted':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/admin/users"
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Users
          </Link>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.fullName}
                  className="w-20 h-20 rounded-full"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 text-2xl font-medium">
                    {currentUser.firstName[0]}
                    {currentUser.lastName[0]}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {currentUser.fullName}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(
                      currentUser.role
                    )}`}
                  >
                    {currentUser.role}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(
                      currentUser.status
                    )}`}
                  >
                    {currentUser.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowEditor(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                disabled={actionLoading}
              >
                Edit User
              </button>
              {currentUser.status === 'active' ? (
                <button
                  onClick={handleSuspend}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center gap-2"
                  disabled={actionLoading}
                >
                  <Ban className="w-4 h-4" />
                  Suspend
                </button>
              ) : (
                <button
                  onClick={handleActivate}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  disabled={actionLoading}
                >
                  <CheckCircle className="w-4 h-4" />
                  Activate
                </button>
              )}
              <button
                onClick={handleResetPassword}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                disabled={actionLoading}
              >
                <Key className="w-4 h-4" />
                Reset Password
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                disabled={actionLoading}
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - User Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">User Information</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Mail className="w-4 h-4" />
                    Email
                  </div>
                  <div className="text-sm font-medium">{currentUser.email}</div>
                  <div className="text-xs text-gray-500">
                    {currentUser.isEmailVerified ? (
                      <span className="text-green-600">✓ Verified</span>
                    ) : (
                      <span className="text-red-600">✗ Not verified</span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Shield className="w-4 h-4" />
                    Role
                  </div>
                  <div className="text-sm font-medium capitalize">
                    {currentUser.role}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Calendar className="w-4 h-4" />
                    Joined
                  </div>
                  <div className="text-sm font-medium">
                    {new Date(currentUser.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Activity className="w-4 h-4" />
                    Last Active
                  </div>
                  <div className="text-sm font-medium">
                    {currentUser.lastLogin
                      ? new Date(currentUser.lastLogin).toLocaleString()
                      : 'Never'}
                  </div>
                </div>

                {currentUser.status === 'suspended' && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <div className="text-sm font-medium text-yellow-800 mb-1">
                      Suspended
                    </div>
                    {currentUser.suspendedReason && (
                      <div className="text-xs text-yellow-700">
                        Reason: {currentUser.suspendedReason}
                      </div>
                    )}
                    {currentUser.suspendedAt && (
                      <div className="text-xs text-yellow-600 mt-1">
                        {new Date(currentUser.suspendedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Activity Timeline */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Activity Timeline</h2>
              <ActivityTimeline activities={currentUserActivity} />
            </div>
          </div>
        </div>

        {/* Modals */}
        {showEditor && (
          <UserEditor
            user={currentUser}
            onClose={() => setShowEditor(false)}
            onSave={(updatedUser) => {
              setCurrentUser(updatedUser);
              setShowEditor(false);
            }}
          />
        )}

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Delete User</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this user? This action cannot be
                undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(false)}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                >
                  Soft Delete
                </button>
                <button
                  onClick={() => handleDelete(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Permanent Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
