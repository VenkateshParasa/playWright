import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { bulkUserOperations } from '../../lib/api/admin';
import { Ban, CheckCircle, Trash2, X } from 'lucide-react';

export default function BulkActions() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userIds = searchParams.get('ids')?.split(',') || [];

  const [operation, setOperation] = useState<'suspend' | 'activate' | 'delete' | null>(null);
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!operation) return;

    if (operation === 'suspend' && !reason) {
      setError('Reason is required for suspension');
      return;
    }

    if (
      operation === 'delete' &&
      !confirm(`Are you sure you want to delete ${userIds.length} users?`)
    ) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await bulkUserOperations({
        operation,
        userIds,
        data: operation === 'suspend' ? { reason } : undefined,
      });

      alert(`Successfully ${operation}ed ${userIds.length} users`);
      navigate('/admin/users');
    } catch (error: any) {
      setError(error.message || `Failed to ${operation} users`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Bulk Actions</h2>
            <button
              onClick={() => navigate('/admin/users')}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-6">
            <p className="text-gray-600">
              Selected {userIds.length} user{userIds.length !== 1 ? 's' : ''}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Action
              </label>
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => setOperation('suspend')}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    operation === 'suspend'
                      ? 'border-yellow-600 bg-yellow-50'
                      : 'border-gray-200 hover:border-yellow-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Ban className="w-6 h-6 text-yellow-600" />
                    <div>
                      <div className="font-medium">Suspend Users</div>
                      <div className="text-sm text-gray-600">
                        Temporarily disable user accounts
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setOperation('activate')}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    operation === 'activate'
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <div className="font-medium">Activate Users</div>
                      <div className="text-sm text-gray-600">
                        Re-enable suspended user accounts
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setOperation('delete')}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    operation === 'delete'
                      ? 'border-red-600 bg-red-50'
                      : 'border-gray-200 hover:border-red-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Trash2 className="w-6 h-6 text-red-600" />
                    <div>
                      <div className="font-medium">Delete Users</div>
                      <div className="text-sm text-gray-600">
                        Soft delete user accounts
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {operation === 'suspend' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Suspension
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter reason for suspension..."
                  required
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => navigate('/admin/users')}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!operation || isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : 'Execute Action'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
