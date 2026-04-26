/**
 * Dashboard Showcase - Live Route
 * Renders all dashboard components with real store data via DashboardLayoutExample.
 */

import { useNavigate } from 'react-router-dom';
import { DashboardLayoutExample } from '../../examples/DashboardShowcase';

export default function DashboardExample() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/examples')}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          ← Examples
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Showcase</h1>
          <p className="text-sm text-gray-500 mt-0.5">All dashboard components with live store data</p>
        </div>
      </div>
      <DashboardLayoutExample />
    </div>
  );
}
