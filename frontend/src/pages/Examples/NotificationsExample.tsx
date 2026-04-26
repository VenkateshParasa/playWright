/**
 * Notification System Example - Live Route
 * Re-exports the existing NotificationExample component with back navigation.
 */

import { useNavigate } from 'react-router-dom';
import NotificationExample from '../../examples/NotificationExample';

export default function NotificationsExample() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/examples')} className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
          ← Examples
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notification System</h1>
          <p className="text-sm text-gray-500 mt-0.5">Send, manage and push notifications — live store data</p>
        </div>
      </div>
      <NotificationExample />
    </div>
  );
}
