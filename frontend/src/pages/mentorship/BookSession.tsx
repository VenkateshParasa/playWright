import React, { useState, useEffect } from 'react';
import { Calendar, Clock, DollarSign, Video, FileText, ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

interface TimeSlot {
  startTime: Date;
  endTime: Date;
  available: boolean;
}

const BookSession: React.FC = () => {
  const { mentorId } = useParams();
  const navigate = useNavigate();
  const [mentor, setMentor] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [sessionType, setSessionType] = useState<'one-on-one' | 'office-hours'>('one-on-one');
  const [duration, setDuration] = useState(60);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [agenda, setAgenda] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMentor();
  }, [mentorId]);

  useEffect(() => {
    if (mentor && selectedDate) {
      fetchAvailableSlots();
    }
  }, [mentor, selectedDate, duration]);

  const fetchMentor = async () => {
    try {
      const response = await fetch(`/api/mentorship/mentors/${mentorId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setMentor(data.data);
      }
    } catch (error) {
      console.error('Error fetching mentor:', error);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const startDate = new Date(selectedDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);

      const response = await fetch(
        `/api/mentorship/sessions/available-slots/${mentorId}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&duration=${duration}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setAvailableSlots(data.data.filter((slot: TimeSlot) => slot.available));
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
    }
  };

  const handleBookSession = async () => {
    if (!selectedSlot || !title) {
      alert('Please select a time slot and enter a title');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/mentorship/sessions/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          mentorId,
          type: sessionType,
          title,
          description,
          agenda: agenda.filter(item => item.trim() !== ''),
          scheduledAt: selectedSlot.startTime,
          duration,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Session booked successfully!');
        navigate('/mentorship/dashboard');
      } else {
        alert(data.message || 'Failed to book session');
      }
    } catch (error) {
      console.error('Error booking session:', error);
      alert('Failed to book session');
    } finally {
      setLoading(false);
    }
  };

  if (!mentor) {
    return <div className="p-6 text-center">Loading mentor details...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} />
          Back to Mentors
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mentor Info Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <img
                src={mentor.userId.avatar || '/default-avatar.png'}
                alt={`${mentor.userId.firstName} ${mentor.userId.lastName}`}
                className="w-24 h-24 rounded-full mx-auto mb-4"
              />
              <h2 className="text-xl font-bold text-center mb-2">
                {mentor.userId.firstName} {mentor.userId.lastName}
              </h2>
              <p className="text-sm text-gray-600 text-center mb-4">{mentor.title}</p>

              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign size={16} className="text-gray-400" />
                  <span>${mentor.pricing.oneOnOne}/hr</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Video size={16} className="text-gray-400" />
                  <span>{mentor.videoConferencePreference}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock size={16} className="text-gray-400" />
                  <span>{mentor.timezone}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <h3 className="font-semibold mb-2">Specializations</h3>
                <div className="flex flex-wrap gap-2">
                  {mentor.specializations.map((spec: string, idx: number) => (
                    <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Session Type */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Session Type</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setSessionType('one-on-one')}
                  className={`p-4 border-2 rounded-lg transition ${
                    sessionType === 'one-on-one'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h4 className="font-semibold mb-1">1-on-1 Session</h4>
                  <p className="text-sm text-gray-600">Personal mentorship session</p>
                </button>
                <button
                  onClick={() => setSessionType('office-hours')}
                  className={`p-4 border-2 rounded-lg transition ${
                    sessionType === 'office-hours'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h4 className="font-semibold mb-1">Office Hours</h4>
                  <p className="text-sm text-gray-600">Drop-in session</p>
                </button>
              </div>
            </div>

            {/* Date and Duration */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Select Date & Duration</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <input
                    type="date"
                    value={selectedDate.toISOString().split('T')[0]}
                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Duration</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {mentor.sessionDurations.map((dur: number) => (
                      <option key={dur} value={dur}>
                        {dur} minutes
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <h4 className="font-medium mb-3">Available Time Slots</h4>
              <div className="grid grid-cols-3 gap-2">
                {availableSlots.map((slot, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-3 border rounded-lg text-sm transition ${
                      selectedSlot === slot
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {new Date(slot.startTime).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </button>
                ))}
              </div>
            </div>

            {/* Session Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Session Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Session Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Playwright Testing Best Practices"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What would you like to discuss?"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Agenda Items</label>
                  {agenda.map((item, idx) => (
                    <input
                      key={idx}
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const newAgenda = [...agenda];
                        newAgenda[idx] = e.target.value;
                        setAgenda(newAgenda);
                      }}
                      placeholder={`Agenda item ${idx + 1}`}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-2"
                    />
                  ))}
                  <button
                    onClick={() => setAgenda([...agenda, ''])}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    + Add agenda item
                  </button>
                </div>
              </div>
            </div>

            {/* Book Button */}
            <button
              onClick={handleBookSession}
              disabled={loading || !selectedSlot || !title}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Booking...' : `Book Session - $${mentor.pricing.oneOnOne * (duration / 60)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookSession;
