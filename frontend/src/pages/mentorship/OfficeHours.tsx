import React, { useState, useEffect } from 'react';
import { Users, Clock, Calendar, Video, UserCheck } from 'lucide-react';

interface OfficeHourSession {
  id: string;
  mentorId: any;
  title: string;
  scheduledAt: Date;
  duration: number;
  maxParticipants: number;
  currentParticipants: number;
  status: string;
}

const OfficeHours: React.FC = () => {
  const [sessions, setSessions] = useState<OfficeHourSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOfficeHours();
  }, []);

  const fetchOfficeHours = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/mentorship/sessions/office-hours', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setSessions(data.data);
      }
    } catch (error) {
      console.error('Error fetching office hours:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinOfficeHours = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/mentorship/sessions/${sessionId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        window.location.href = `/mentorship/session/${sessionId}/room`;
      } else {
        alert(data.message || 'Failed to join office hours');
      }
    } catch (error) {
      console.error('Error joining office hours:', error);
      alert('Failed to join office hours');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Office Hours</h1>
          <p className="text-gray-600">
            Join group sessions with mentors. First-come, first-served basis.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Calendar className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold mb-2">No Office Hours Available</h3>
            <p className="text-gray-600">Check back later for scheduled office hours</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sessions.map((session) => (
              <div key={session.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={session.mentorId?.userId?.avatar || '/default-avatar.png'}
                    alt={session.mentorId?.userId?.firstName}
                    className="w-16 h-16 rounded-full"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{session.title}</h3>
                    <p className="text-sm text-gray-600">
                      with {session.mentorId?.userId?.firstName} {session.mentorId?.userId?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{session.mentorId?.title}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={16} />
                    <span>{new Date(session.scheduledAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={16} />
                    <span>
                      {new Date(session.scheduledAt).toLocaleTimeString()} ({session.duration} min)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users size={16} />
                    <span>
                      {session.currentParticipants}/{session.maxParticipants} participants
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Video size={16} />
                    <span>{session.mentorId?.videoConferencePreference}</span>
                  </div>
                </div>

                {/* Participants Progress Bar */}
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        session.currentParticipants >= session.maxParticipants
                          ? 'bg-red-500'
                          : 'bg-blue-600'
                      }`}
                      style={{
                        width: `${(session.currentParticipants / session.maxParticipants) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => joinOfficeHours(session.id)}
                  disabled={session.currentParticipants >= session.maxParticipants}
                  className={`w-full py-2 rounded-lg transition ${
                    session.currentParticipants >= session.maxParticipants
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {session.currentParticipants >= session.maxParticipants ? 'Full' : 'Join Office Hours'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Info Panel */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">How Office Hours Work</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <UserCheck className="flex-shrink-0 mt-0.5" size={16} />
              <span>Join group sessions with mentors at scheduled times</span>
            </li>
            <li className="flex items-start gap-2">
              <Users className="flex-shrink-0 mt-0.5" size={16} />
              <span>Limited spots available - first-come, first-served</span>
            </li>
            <li className="flex items-start gap-2">
              <Video className="flex-shrink-0 mt-0.5" size={16} />
              <span>Ask questions, get help, and learn from others</span>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="flex-shrink-0 mt-0.5" size={16} />
              <span>Sessions are recorded for later review</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OfficeHours;
