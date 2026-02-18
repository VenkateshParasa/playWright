import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  FileText,
  PlayCircle,
  HelpCircle,
  FolderOpen,
  Plus,
  TrendingUp,
  Users,
  Clock,
  Star
} from 'lucide-react';

interface StudioStats {
  totalCourses: number;
  publishedCourses: number;
  totalLessons: number;
  totalQuizzes: number;
  totalAssets: number;
  totalStudents: number;
  averageRating: number;
}

interface RecentActivity {
  id: string;
  type: 'course' | 'lesson' | 'quiz' | 'asset';
  title: string;
  action: string;
  timestamp: Date;
}

const StudioDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<StudioStats>({
    totalCourses: 0,
    publishedCourses: 0,
    totalLessons: 0,
    totalQuizzes: 0,
    totalAssets: 0,
    totalStudents: 0,
    averageRating: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [draftCourses, setDraftCourses] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load stats
      const statsRes = await fetch('/api/studio/dashboard/stats', {
        credentials: 'include'
      });
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }

      // Load recent activity
      const activityRes = await fetch('/api/studio/dashboard/activity', {
        credentials: 'include'
      });
      if (activityRes.ok) {
        const data = await activityRes.json();
        setRecentActivity(data);
      }

      // Load draft courses
      const draftsRes = await fetch('/api/studio/courses?status=draft', {
        credentials: 'include'
      });
      if (draftsRes.ok) {
        const data = await draftsRes.json();
        setDraftCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const quickActions = [
    {
      icon: BookOpen,
      label: 'New Course',
      description: 'Create a new course',
      color: 'blue',
      action: () => navigate('/studio/courses/new')
    },
    {
      icon: FileText,
      label: 'New Lesson',
      description: 'Write a new lesson',
      color: 'green',
      action: () => navigate('/studio/lessons/new')
    },
    {
      icon: HelpCircle,
      label: 'New Quiz',
      description: 'Build a quiz',
      color: 'purple',
      action: () => navigate('/studio/quizzes/new')
    },
    {
      icon: FolderOpen,
      label: 'Asset Library',
      description: 'Manage your assets',
      color: 'orange',
      action: () => navigate('/studio/assets')
    }
  ];

  const statCards = [
    {
      label: 'Total Courses',
      value: stats.totalCourses,
      published: stats.publishedCourses,
      icon: BookOpen,
      color: 'blue'
    },
    {
      label: 'Lessons',
      value: stats.totalLessons,
      icon: FileText,
      color: 'green'
    },
    {
      label: 'Quizzes',
      value: stats.totalQuizzes,
      icon: HelpCircle,
      color: 'purple'
    },
    {
      label: 'Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'pink'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Content Studio</h1>
          <p className="text-gray-600 mt-1">Create and manage your courses</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className={`bg-white rounded-lg border-2 border-${action.color}-200 hover:border-${action.color}-400 p-6 text-left transition-all hover:shadow-lg`}
              >
                <div className={`w-12 h-12 bg-${action.color}-100 rounded-lg flex items-center justify-center mb-3`}>
                  <action.icon className={`text-${action.color}-600`} size={24} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{action.label}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Overview</h2>
          <div className="grid grid-cols-4 gap-4">
            {statCards.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`text-${stat.color}-600`} size={24} />
                  <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
                </div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                {stat.published !== undefined && (
                  <p className="text-xs text-gray-500 mt-1">
                    {stat.published} published
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* Draft Courses */}
          <div className="col-span-2">
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Draft Courses</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {draftCourses.length > 0 ? (
                  draftCourses.map(course => (
                    <div
                      key={course._id}
                      onClick={() => navigate(`/studio/courses/${course._id}`)}
                      className="p-6 hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {course.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {course.description?.substring(0, 100)}...
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <FileText size={14} />
                              {course.sections?.length || 0} sections
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              Last edited {new Date(course.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                          Draft
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <BookOpen className="mx-auto text-gray-400 mb-3" size={48} />
                    <p className="text-gray-500">No draft courses</p>
                    <button
                      onClick={() => navigate('/studio/courses/new')}
                      className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Create your first course
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              </div>
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {recentActivity.length > 0 ? (
                  recentActivity.map(activity => (
                    <div key={activity.id} className="p-4">
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-600 mb-1">{activity.action}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <Clock className="mx-auto text-gray-400 mb-2" size={32} />
                    <p className="text-sm text-gray-500">No recent activity</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg border border-gray-200 mt-6 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Performance</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="text-yellow-500" size={20} />
                    <span className="text-sm text-gray-700">Average Rating</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    {stats.averageRating.toFixed(1)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="text-green-500" size={20} />
                    <span className="text-sm text-gray-700">Total Assets</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    {stats.totalAssets}
                  </span>
                </div>
              </div>
            </div>

            {/* Help & Resources */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg mt-6 p-6">
              <h3 className="font-semibold text-blue-900 mb-3">Help & Resources</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>
                  <a href="/docs/content-studio-guide" className="hover:underline">
                    → Studio Guide
                  </a>
                </li>
                <li>
                  <a href="/docs/instructor-manual" className="hover:underline">
                    → Instructor Manual
                  </a>
                </li>
                <li>
                  <a href="/community/instructors" className="hover:underline">
                    → Instructor Community
                  </a>
                </li>
                <li>
                  <a href="/support" className="hover:underline">
                    → Contact Support
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudioDashboard;
