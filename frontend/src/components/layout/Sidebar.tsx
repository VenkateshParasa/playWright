import { NavLink, useLocation } from 'react-router-dom';
import React, { useEffect } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  Code,
  TrendingUp,
  Settings,
  ChevronRight,
  X,
} from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { getNavigationRoutes } from '../../routes/routes';

const iconMap: Record<string, any> = {
  LayoutDashboard,
  BookOpen,
  Layers,
  Code,
  TrendingUp,
  Settings,
};

export default function Sidebar() {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const location = useLocation();
  const navigationRoutes = getNavigationRoutes();

  // For mobile menu state (using local state for simplicity)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Close mobile menu when route changes
  useEffect(() => {
    closeMobileMenu();
  }, [location.pathname]);

  // Close mobile menu when clicking outside on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        closeMobileMenu();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isSidebarOpen = sidebarOpen && !sidebarCollapsed;

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-gray-200 z-40
          transition-all duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          ${isSidebarOpen ? 'lg:w-64' : 'lg:w-20'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Mobile close button */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200">
            <span className="font-semibold text-gray-900">Menu</span>
            <button
              onClick={closeMobileMenu}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <ul className="space-y-1">
              {navigationRoutes.map((route) => {
                const Icon = route.icon ? iconMap[route.icon] : null;
                const isActive = location.pathname === route.path;

                return (
                  <li key={route.path}>
                    <NavLink
                      to={route.path!}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
                        ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        }
                        ${!isSidebarOpen && 'lg:justify-center'}
                      `
                      }
                      title={!isSidebarOpen ? route.label : undefined}
                    >
                      {Icon && (
                        <Icon
                          className={`w-5 h-5 flex-shrink-0 ${
                            isActive ? 'text-blue-700' : 'text-gray-500 group-hover:text-gray-700'
                          }`}
                        />
                      )}
                      <span
                        className={`${
                          !isSidebarOpen ? 'lg:hidden' : ''
                        } truncate transition-opacity`}
                      >
                        {route.label}
                      </span>
                      {isActive && (
                        <ChevronRight
                          className={`w-4 h-4 ml-auto ${!isSidebarOpen ? 'lg:hidden' : ''}`}
                        />
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Sidebar footer */}
          <div
            className={`p-4 border-t border-gray-200 ${!isSidebarOpen ? 'lg:hidden' : ''}`}
          >
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">?</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Need Help?</h4>
                  <p className="text-xs text-gray-600 mb-2">
                    Check out our documentation and tutorials
                  </p>
                  <button className="text-xs font-medium text-blue-700 hover:text-blue-800">
                    Get Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
