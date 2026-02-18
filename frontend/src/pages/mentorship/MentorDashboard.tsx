import React, { useState, useEffect } from 'react';
import { Calendar, Users, DollarSign, Star, TrendingUp, Clock, CheckCircle } from 'lucide-react';

const MentorDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [recentReviews, setRecentReviews] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, sessionsRes] = await Promise.all([
        fetch('/api/mentorship/sessions/analytics?userType=mentor', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        }),
        fetch('/api/mentorship/sessions/upcoming?userType=mentor', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        }),
      ]);

      const statsData = await statsRes.json();
      const sessionsData = await sessionsRes.json();

      if (statsData.success) setStats(statsData.data);
      if (sessionsData.success) setUpcomingSessions(sessionsData.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Mentor Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="text-blue-600" size={24} />
              <TrendingUp className="text-green-500" size={16} />
            </div>
            <p className="text-2xl font-bold">{stats?.totalSessions || 0}</p>
            <p className="text-sm text-gray-600">Total Sessions</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="text-purple-600" size={24} />
            </div>
            <p className="text-2xl font-bold">{stats?.studentsHelped || 0}</p>
            <p className="text-sm text-gray-600">Students Helped</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="text-green-600" size={24} />
            </div>
            <p className="text-2xl font-bold">${stats?.totalEarnings || 0}</p>
            <p className="text-sm text-gray-600">Total Earnings</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <Star className="text-yellow-500" size={24} fill="currentColor" />
            </div>
            <p className="text-2xl font-bold">{stats?.averageRating || 0}</p>
            <p className="text-sm text-gray-600">Average Rating</p>
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Upcoming Sessions</h2>
          <div className="space-y-4">
            {upcomingSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <img
                    src={session.studentId?.avatar || '/default-avatar.png'}
                    alt={session.studentId?.firstName}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold">{session.title}</h3>
                    <p className="text-sm text-gray-600">
                      with {session.studentId?.firstName} {session.studentId?.lastName}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                      <Clock size={14} />
                      <span>{new Date(session.scheduledAt).toLocaleString()}</span>
                      <span>• {session.duration} min</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => window.location.href = `/mentorship/session/${session.id}/room`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Join Session
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => window.location.href = '/mentorship/availability'}
            className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition text-left"
          >
            <Calendar className="text-blue-600 mb-3" size={32} />
            <h3 className="font-semibold mb-1">Manage Availability</h3>
            <p className="text-sm text-gray-600">Update your schedule and time slots</p>
          </button>

          <button
            onClick={() => window.location.href = '/mentorship/students'}
            className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition text-left"
          >
            <Users className="text-purple-600 mb-3" size={32} />
            <h3 className="font-semibold mb-1">View Students</h3>
            <p className="text-sm text-gray-600">Track student progress and history</p>
          </button>

          <button
            onClick={() => window.location.href = '/mentorship/profile/edit'}
            className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition text-left"
          >
            <CheckCircle className="text-green-600 mb-3" size={32} />
            <h3 className="font-semibold mb-1">Update Profile</h3>
            <p className="text-sm text-gray-600">Edit your expertise and services</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;
