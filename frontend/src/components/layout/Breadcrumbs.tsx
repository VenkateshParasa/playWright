import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useMemo } from 'react';

interface Breadcrumb {
  label: string;
  path: string;
  isLast: boolean;
}

export default function Breadcrumbs() {
  const location = useLocation();

  const breadcrumbs = useMemo(() => {
    const paths = location.pathname.split('/').filter(Boolean);
    const crumbs: Breadcrumb[] = [];

    // Add home
    crumbs.push({
      label: 'Home',
      path: '/',
      isLast: paths.length === 0,
    });

    // Build breadcrumbs from path segments
    let currentPath = '';
    paths.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === paths.length - 1;

      // Format label (capitalize and replace hyphens with spaces)
      let label = segment
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // Handle special cases
      if (segment === 'settings') {
        label = 'Settings';
      } else if (segment === 'lessons') {
        label = 'Lessons';
      } else if (segment === 'flashcards') {
        label = 'Flashcards';
      } else if (segment === 'exercises') {
        label = 'Exercises';
      } else if (segment === 'progress') {
        label = 'Progress';
      } else if (segment === 'login') {
        label = 'Login';
      } else if (segment === 'register') {
        label = 'Register';
      } else if (!isNaN(Number(segment))) {
        // If it's a number (like an ID), don't create a breadcrumb for it
        // Instead, update the last breadcrumb to show "Detail" or similar
        if (crumbs.length > 0) {
          crumbs[crumbs.length - 1].label += ' Detail';
          crumbs[crumbs.length - 1].isLast = false;
        }
        label = `#${segment}`;
      }

      crumbs.push({
        label,
        path: currentPath,
        isLast,
      });
    });

    return crumbs;
  }, [location.pathname]);

  // Don't show breadcrumbs on auth pages
  if (
    location.pathname.startsWith('/login') ||
    location.pathname.startsWith('/register') ||
    location.pathname.startsWith('/forgot-password') ||
    location.pathname.startsWith('/reset-password')
  ) {
    return null;
  }

  // Don't show if only home
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-2 text-sm">
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.path} className="flex items-center gap-2">
            {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}

            {crumb.isLast ? (
              <span className="flex items-center gap-1.5 text-gray-900 font-medium">
                {index === 0 && <Home className="w-4 h-4" />}
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.path}
                className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition-colors"
              >
                {index === 0 && <Home className="w-4 h-4" />}
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
