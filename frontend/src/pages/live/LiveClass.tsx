import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import './LiveClass.css';

interface Participant {
  userId: string;
  name: string;
  email: string;
  role: 'viewer' | 'moderator' | 'speaker';
  raisedHand: boolean;
  cameraEnabled: boolean;
  micEnabled: boolean;
  screenSharing: boolean;
}

interface ChatMessage {
  messageId: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
}

interface Question {
  questionId: string;
  userId: string;
  userName: string;
  question: string;
  askedAt: Date;
  upvotes: number;
  status: 'pending' | 'answered' | 'dismissed';
  answer?: string;
}

interface Poll {
  pollId: string;
  question: string;
  options: { text: string; votes: number }[];
  isActive: boolean;
}

const LiveClass: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const [liveClass, setLiveClass] = useState<any>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [activeTab, setActiveTab] = useState<'chat' | 'qa' | 'participants' | 'polls'>('chat');
  const [messageInput, setMessageInput] = useState('');
  const [questionInput, setQuestionInput] = useState('');
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch class details
  useEffect(() => {
    fetchClassDetails();
  }, [id]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const fetchClassDetails = async () => {
    try {
      const response = await fetch(`/api/live/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch class details');
      }

      const data = await response.json();
      setLiveClass(data.class);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  const joinClass = async () => {
    try {
      const response = await fetch(`/api/live/${id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ role: 'viewer' }),
      });

      if (!response.ok) {
        throw new Error('Failed to join class');
      }

      const data = await response.json();
      setHasJoined(true);

      // Initialize WebRTC stream
      if (videoRef.current && data.playbackUrl) {
        videoRef.current.src = data.playbackUrl;
        videoRef.current.play().catch(console.error);
      }

      // Fetch initial data
      fetchParticipants();
      fetchMessages();
      fetchQuestions();
      fetchPolls();

      // Setup WebSocket for real-time updates
      setupWebSocket();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join class');
    }
  };

  const leaveClass = async () => {
    try {
      await fetch(`/api/live/${id}/leave`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setHasJoined(false);
    } catch (err) {
      console.error('Failed to leave class:', err);
    }
  };

  const setupWebSocket = () => {
    // TODO: Implement WebSocket connection for real-time updates
    // This would typically connect to Socket.IO or native WebSocket
    console.log('Setting up WebSocket connection...');
  };

  const fetchParticipants = async () => {
    try {
      const response = await fetch(`/api/live/${id}/participants`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();
      setParticipants(data.participants);
    } catch (err) {
      console.error('Failed to fetch participants:', err);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/live/${id}/chat`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();
      setChatMessages(data.messages);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`/api/live/${id}/qa`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();
      setQuestions(data.questions);
    } catch (err) {
      console.error('Failed to fetch questions:', err);
    }
  };

  const fetchPolls = async () => {
    try {
      const response = await fetch(`/api/live/${id}/polls`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();
      setPolls(data.polls);
    } catch (err) {
      console.error('Failed to fetch polls:', err);
    }
  };

  const sendMessage = async () => {
    if (!messageInput.trim()) return;

    try {
      await fetch(`/api/live/${id}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ message: messageInput }),
      });

      setMessageInput('');
      fetchMessages();
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const askQuestion = async () => {
    if (!questionInput.trim()) return;

    try {
      await fetch(`/api/live/${id}/qa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ question: questionInput }),
      });

      setQuestionInput('');
      fetchQuestions();
    } catch (err) {
      console.error('Failed to ask question:', err);
    }
  };

  const toggleRaiseHand = async () => {
    try {
      const endpoint = isHandRaised ? 'lower-hand' : 'raise-hand';
      await fetch(`/api/live/${id}/${endpoint}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setIsHandRaised(!isHandRaised);
    } catch (err) {
      console.error('Failed to toggle hand:', err);
    }
  };

  const votePoll = async (pollId: string, optionIndex: number) => {
    try {
      await fetch(`/api/live/${id}/polls/${pollId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ optionIndex }),
      });

      fetchPolls();
    } catch (err) {
      console.error('Failed to vote on poll:', err);
    }
  };

  if (loading) {
    return (
      <div className="live-class-loading">
        <div className="spinner"></div>
        <p>Loading live class...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="live-class-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.history.back()}>Go Back</button>
      </div>
    );
  }

  if (!liveClass) {
    return (
      <div className="live-class-error">
        <h2>Class Not Found</h2>
        <p>The live class you're looking for doesn't exist.</p>
        <button onClick={() => window.history.back()}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="live-class-container">
      <div className="live-class-main">
        <div className="video-section">
          <video ref={videoRef} className="live-video" controls autoPlay />

          {liveClass.status === 'live' && (
            <div className="live-indicator">
              <span className="live-dot"></span>
              LIVE
            </div>
          )}

          <div className="video-info">
            <h1>{liveClass.title}</h1>
            <p>{liveClass.description}</p>
            <div className="class-meta">
              <span>👥 {participants.length} participants</span>
              <span>
                {new Date(liveClass.scheduledStartTime).toLocaleTimeString()}
              </span>
            </div>
          </div>

          {!hasJoined ? (
            <div className="join-overlay">
              <button onClick={joinClass} className="join-button">
                Join Live Class
              </button>
            </div>
          ) : (
            <div className="video-controls-bar">
              <button
                onClick={toggleRaiseHand}
                className={isHandRaised ? 'active' : ''}
              >
                ✋ {isHandRaised ? 'Lower Hand' : 'Raise Hand'}
              </button>
              <button onClick={() => setIsCameraOn(!isCameraOn)}>
                📷 {isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
              </button>
              <button onClick={() => setIsMicOn(!isMicOn)}>
                🎤 {isMicOn ? 'Mute' : 'Unmute'}
              </button>
              <button onClick={() => setIsScreenSharing(!isScreenSharing)}>
                🖥️ {isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
              </button>
              <button onClick={leaveClass} className="leave-button">
                Exit Class
              </button>
            </div>
          )}
        </div>

        <div className="sidebar">
          <div className="sidebar-tabs">
            <button
              className={activeTab === 'chat' ? 'active' : ''}
              onClick={() => setActiveTab('chat')}
            >
              Chat
            </button>
            <button
              className={activeTab === 'qa' ? 'active' : ''}
              onClick={() => setActiveTab('qa')}
            >
              Q&A
            </button>
            <button
              className={activeTab === 'participants' ? 'active' : ''}
              onClick={() => setActiveTab('participants')}
            >
              Participants
            </button>
            <button
              className={activeTab === 'polls' ? 'active' : ''}
              onClick={() => setActiveTab('polls')}
            >
              Polls
            </button>
          </div>

          <div className="sidebar-content">
            {activeTab === 'chat' && (
              <div className="chat-panel">
                <div ref={chatContainerRef} className="chat-messages">
                  {chatMessages.map((msg) => (
                    <div key={msg.messageId} className="chat-message">
                      <strong>{msg.userName}</strong>
                      <p>{msg.message}</p>
                      <span className="chat-time">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="chat-input">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                  />
                  <button onClick={sendMessage}>Send</button>
                </div>
              </div>
            )}

            {activeTab === 'qa' && (
              <div className="qa-panel">
                <div className="qa-questions">
                  {questions.map((q) => (
                    <div key={q.questionId} className="qa-question">
                      <div className="question-header">
                        <strong>{q.userName}</strong>
                        <span className={`status-${q.status}`}>{q.status}</span>
                      </div>
                      <p>{q.question}</p>
                      {q.answer && (
                        <div className="question-answer">
                          <strong>Answer:</strong>
                          <p>{q.answer}</p>
                        </div>
                      )}
                      <div className="question-meta">
                        <span>👍 {q.upvotes}</span>
                        <span>{new Date(q.askedAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="qa-input">
                  <textarea
                    value={questionInput}
                    onChange={(e) => setQuestionInput(e.target.value)}
                    placeholder="Ask a question..."
                    rows={3}
                  />
                  <button onClick={askQuestion}>Ask Question</button>
                </div>
              </div>
            )}

            {activeTab === 'participants' && (
              <div className="participants-panel">
                {participants.map((p) => (
                  <div key={p.userId} className="participant-item">
                    <div className="participant-info">
                      <strong>{p.name}</strong>
                      <span className="participant-role">{p.role}</span>
                    </div>
                    <div className="participant-status">
                      {p.raisedHand && <span>✋</span>}
                      {p.cameraEnabled && <span>📷</span>}
                      {p.micEnabled && <span>🎤</span>}
                      {p.screenSharing && <span>🖥️</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'polls' && (
              <div className="polls-panel">
                {polls.map((poll) => (
                  <div key={poll.pollId} className="poll-item">
                    <h3>{poll.question}</h3>
                    <div className="poll-options">
                      {poll.options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => votePoll(poll.pollId, index)}
                          className="poll-option"
                        >
                          <span>{option.text}</span>
                          <span className="poll-votes">{option.votes} votes</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveClass;
