import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

// Lazy load page components for code splitting
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Lessons = lazy(() => import('../pages/Lessons'));
const LessonDetail = lazy(() => import('../pages/LessonDetail'));
const Flashcards = lazy(() => import('../pages/Flashcards'));
const Quiz = lazy(() => import('../pages/Quiz'));
const Exercises = lazy(() => import('../pages/Exercises'));
const Progress = lazy(() => import('../pages/Progress'));
const Settings = lazy(() => import('../pages/Settings'));
const Login = lazy(() => import('../pages/Auth/Login'));
const Register = lazy(() => import('../pages/Auth/Register'));
const ForgotPassword = lazy(() => import('../pages/Auth/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/Auth/ResetPassword'));
const NotFound = lazy(() => import('../pages/NotFound'));

export interface RouteConfig extends RouteObject {
  label?: string;
  icon?: string;
  showInNav?: boolean;
  protected?: boolean;
}

export const routes: RouteConfig[] = [
  {
    path: '/',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    showInNav: true,
    protected: true,
    element: Dashboard,
  },
  {
    path: '/lessons',
    label: 'Lessons',
    icon: 'BookOpen',
    showInNav: true,
    protected: true,
    element: Lessons,
  },
  {
    path: '/lessons/:id',
    label: 'Lesson Detail',
    showInNav: false,
    protected: true,
    element: LessonDetail,
  },
  {
    path: '/flashcards',
    label: 'Flashcards',
    icon: 'Layers',
    showInNav: true,
    protected: true,
    element: Flashcards,
  },
  {
    path: '/quiz',
    label: 'Quizzes',
    icon: 'ClipboardCheck',
    showInNav: true,
    protected: true,
    element: Quiz,
  },
  {
    path: '/exercises',
    label: 'Exercises',
    icon: 'Code',
    showInNav: true,
    protected: true,
    element: Exercises,
  },
  {
    path: '/progress',
    label: 'Progress',
    icon: 'TrendingUp',
    showInNav: true,
    protected: true,
    element: Progress,
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: 'Settings',
    showInNav: true,
    protected: true,
    element: Settings,
  },
  {
    path: '/login',
    label: 'Login',
    showInNav: false,
    protected: false,
    element: Login,
  },
  {
    path: '/register',
    label: 'Register',
    showInNav: false,
    protected: false,
    element: Register,
  },
  {
    path: '/forgot-password',
    label: 'Forgot Password',
    showInNav: false,
    protected: false,
    element: ForgotPassword,
  },
  {
    path: '/reset-password',
    label: 'Reset Password',
    showInNav: false,
    protected: false,
    element: ResetPassword,
  },
  {
    path: '*',
    label: 'Not Found',
    showInNav: false,
    protected: false,
    element: NotFound,
  },
];

// Helper to get navigation routes
export const getNavigationRoutes = () => routes.filter((route) => route.showInNav);

// Helper to get route by path
export const getRouteByPath = (path: string) => routes.find((route) => route.path === path);
