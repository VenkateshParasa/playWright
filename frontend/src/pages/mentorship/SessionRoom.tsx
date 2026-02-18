import React, { useState, useEffect } from 'react';
import { Video, Mic, MicOff, VideoOff, Monitor, MessageSquare, FileText, Code, Save } from 'lucide-react';
import { useParams } from 'react-router-dom';

const SessionRoom: React.FC = () => {
  const { sessionId } = useParams();
  const [session, setSession] = useState<any>(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [notes, setNotes] = useState('');
  const [code, setCode] = useState('');
  const [activeTab, setActiveTab] = useState<'notes' | 'code' | 'whiteboard'>('notes');

  useEffect(() => {
    fetchSession();
    startSession();
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      const response = await fetch(`/api/mentorship/sessions/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setSession(data.data);
      }
    } catch (error) {
      console.error('Error fetching session:', error);
    }
  };

  const startSession = async () => {
    try {
      await fetch(`/api/mentorship/sessions/${sessionId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          userType: 'student', // or 'mentor' based on user role
        }),
      });
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  const endSession = async () => {
    try {
      await fetch(`/api/mentorship/sessions/${sessionId}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          userType: 'student',
        }),
      });
      window.location.href = '/mentorship/dashboard';
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  const saveNotes = async () => {
    try {
      await fetch(`/api/mentorship/sessions/${sessionId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          content: notes,
          isPrivate: false,
        }),
      });
      alert('Notes saved successfully');
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const saveCodeSnapshot = async () => {
    try {
      await fetch(`/api/mentorship/sessions/${sessionId}/code-snapshot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          language: 'javascript',
          code,
          description: 'Code from session',
        }),
      });
      alert('Code snapshot saved');
    } catch (error) {
      console.error('Error saving code:', error);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Top Bar */}
      <div className="bg-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="text-white">
          <h2 className="font-semibold">{session?.title || 'Loading...'}</h2>
          <p className="text-sm text-gray-400">Session with {session?.mentorId?.firstName}</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setVideoEnabled(!videoEnabled)}
            className={`p-3 rounded-full ${videoEnabled ? 'bg-gray-700' : 'bg-red-600'}`}
          >
            {videoEnabled ? <Video size={20} className="text-white" /> : <VideoOff size={20} className="text-white" />}
          </button>
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`p-3 rounded-full ${audioEnabled ? 'bg-gray-700' : 'bg-red-600'}`}
          >
            {audioEnabled ? <Mic size={20} className="text-white" /> : <MicOff size={20} className="text-white" />}
          </button>
          <button
            onClick={() => setScreenSharing(!screenSharing)}
            className={`p-3 rounded-full ${screenSharing ? 'bg-blue-600' : 'bg-gray-700'}`}
          >
            <Monitor size={20} className="text-white" />
          </button>
          <button
            onClick={endSession}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            End Session
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 flex items-center justify-center bg-black">
          <div className="grid grid-cols-2 gap-4 p-4">
            <div className="bg-gray-800 rounded-lg aspect-video flex items-center justify-center">
              <div className="text-white text-center">
                <Video size={48} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm opacity-75">Mentor Video</p>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg aspect-video flex items-center justify-center">
              <div className="text-white text-center">
                <Video size={48} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm opacity-75">Your Video</p>
              </div>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="w-96 bg-white border-l flex flex-col">
          {/* Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex-1 py-3 px-4 text-sm font-medium ${
                activeTab === 'notes' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
              }`}
            >
              <FileText size={16} className="inline mr-2" />
              Notes
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`flex-1 py-3 px-4 text-sm font-medium ${
                activeTab === 'code' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
              }`}
            >
              <Code size={16} className="inline mr-2" />
              Code
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-4 overflow-y-auto">
            {activeTab === 'notes' && (
              <div className="h-full flex flex-col">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Take notes during the session..."
                  className="flex-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <button
                  onClick={saveNotes}
                  className="mt-3 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  Save Notes
                </button>
              </div>
            )}

            {activeTab === 'code' && (
              <div className="h-full flex flex-col">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Share code snippets..."
                  className="flex-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none"
                />
                <button
                  onClick={saveCodeSnapshot}
                  className="mt-3 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  Save Code
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionRoom;
