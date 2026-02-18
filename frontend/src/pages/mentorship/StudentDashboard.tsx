import React, { useState, useEffect } from 'react';
import { Calendar, Target, TrendingUp, Book, CheckCircle, Clock } from 'lucide-react';

const StudentDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [mentorPrograms, setMentorPrograms] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, sessionsRes, programsRes] = await Promise.all([
        fetch('/api/mentorship/sessions/analytics?userType=student', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        }),
        fetch('/api/mentorship/sessions/upcoming?userType=student', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        }),
        fetch('/api/mentorship/programs/student', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        }),
      ]);

      const [statsData, sessionsData, programsData] = await Promise.all([
        statsRes.json(),
        sessionsRes.json(),
        programsRes.json(),
      ]);

      if (statsData.success) setStats(statsData.data);
      if (sessionsData.success) setUpcomingSessions(sessionsData.data);
      if (programsData.success) setMentorPrograms(programsData.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Mentorship Journey</h1>
          <button
            onClick={() => window.location.href = '/mentorship/mentors'}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Find a Mentor
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <Calendar className="text-blue-600 mb-3" size={24} />
            <p className="text-2xl font-bold">{stats?.completedSessions || 0}</p>
            <p className="text-sm text-gray-600">Sessions Completed</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <Clock className="text-purple-600 mb-3" size={24} />
            <p className="text-2xl font-bold">{stats?.totalHours || 0}h</p>
            <p className="text-sm text-gray-600">Learning Time</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <Target className="text-green-600 mb-3" size={24} />
            <p className="text-2xl font-bold">{mentorPrograms.length}</p>
            <p className="text-sm text-gray-600">Active Programs</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <TrendingUp className="text-orange-600 mb-3" size={24} />
            <p className="text-2xl font-bold">{stats?.mentorsWorkedWith || 0}</p>
            <p className="text-sm text-gray-600">Mentors</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Sessions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Upcoming Sessions</h2>
              <div className="space-y-4">
                {upcomingSessions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="mx-auto mb-2 opacity-50" size={48} />
                    <p>No upcoming sessions</p>
                    <button
                      onClick={() => window.location.href = '/mentorship/mentors'}
                      className="mt-4 text-blue-600 hover:text-blue-700"
                    >
                      Book a session
                    </button>
                  </div>
                ) : (
                  upcomingSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <img
                          src={session.mentorId?.userId?.avatar || '/default-avatar.png'}
                          alt={session.mentorId?.userId?.firstName}
                          className="w-12 h-12 rounded-full"
                        />
                        <div>
                          <h3 className="font-semibold">{session.title}</h3>
                          <p className="text-sm text-gray-600">
                            with {session.mentorId?.userId?.firstName}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                            <Clock size={14} />
                            <span>{new Date(session.scheduledAt).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => window.location.href = `/mentorship/session/${session.id}/room`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Join
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Active Programs */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Active Mentorship Programs</h2>
              <div className="space-y-4">
                {mentorPrograms.filter(p => p.status === 'active').map((program) => (
                  <div key={program.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{program.name}</h3>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        Active
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{program.description}</p>
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{program.progress.overall}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${program.progress.overall}%` }}
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => window.location.href = `/mentorship/programs/${program.id}`}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      View Details →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Goals */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold mb-4">Active Goals</h2>
              <div className="space-y-3">
                {goals.slice(0, 5).map((goal, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle className="text-green-500 mt-1 flex-shrink-0" size={16} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{goal.title}</p>
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                        <div
                          className="bg-green-500 h-1 rounded-full"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full text-sm text-blue-600 hover:text-blue-700">
                View all goals →
              </button>
            </div>

            {/* Resources */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold mb-4">Recommended Resources</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Book className="text-blue-600" size={20} />
                  <div>
                    <p className="text-sm font-medium">Playwright Best Practices</p>
                    <p className="text-xs text-gray-500">From your mentor</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Book className="text-purple-600" size={20} />
                  <div>
                    <p className="text-sm font-medium">API Testing Guide</p>
                    <p className="text-xs text-gray-500">Shared resource</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <button
                  onClick={() => window.location.href = '/mentorship/mentors'}
                  className="w-full py-2 px-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-left text-sm"
                >
                  Find a Mentor
                </button>
                <button
                  onClick={() => window.location.href = '/mentorship/sessions/history'}
                  className="w-full py-2 px-4 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 text-left text-sm"
                >
                  Session History
                </button>
                <button
                  onClick={() => window.location.href = '/mentorship/goals'}
                  className="w-full py-2 px-4 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 text-left text-sm"
                >
                  Manage Goals
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
