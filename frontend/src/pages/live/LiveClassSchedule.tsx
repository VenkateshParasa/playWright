import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LiveClassSchedule.css';

interface LiveClass {
  _id: string;
  title: string;
  description: string;
  scheduledStartTime: Date;
  scheduledEndTime: Date;
  instructorId: { name: string; email: string };
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  participants: any[];
  maxParticipants: number;
  isPremium: boolean;
  thumbnail?: string;
  tags: string[];
}

const LiveClassSchedule: React.FC = () => {
  const [upcomingClasses, setUpcomingClasses] = useState<LiveClass[]>([]);
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [pastClasses, setPastClasses] = useState<LiveClass[]>([]);
  const [activeTab, setActiveTab] = useState<'live' | 'upcoming' | 'past'>('live');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClasses();
    const interval = setInterval(fetchClasses, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchClasses = async () => {
    try {
      const [liveRes, upcomingRes] = await Promise.all([
        fetch('/api/live/live', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
        fetch('/api/live/upcoming', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
      ]);

      const liveData = await liveRes.json();
      const upcomingData = await upcomingRes.json();

      setLiveClasses(liveData.classes || []);
      setUpcomingClasses(upcomingData.classes || []);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch classes');
      setLoading(false);
    }
  };

  const getTimeUntilStart = (startTime: Date): string => {
    const now = new Date();
    const start = new Date(startTime);
    const diff = start.getTime() - now.getTime();

    if (diff < 0) return 'Started';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      return `${Math.floor(hours / 24)} days`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const ClassCard: React.FC<{ liveClass: LiveClass; isLive?: boolean }> = ({
    liveClass,
    isLive = false,
  }) => (
    <div className={`class-card ${isLive ? 'live-card' : ''}`}>
      {liveClass.thumbnail && (
        <div className="class-thumbnail">
          <img src={liveClass.thumbnail} alt={liveClass.title} />
          {isLive && (
            <div className="live-badge">
              <span className="live-dot"></span>
              LIVE
            </div>
          )}
        </div>
      )}

      <div className="class-info">
        <div className="class-header">
          <h3>{liveClass.title}</h3>
          {liveClass.isPremium && <span className="premium-badge">Premium</span>}
        </div>

        <p className="class-description">{liveClass.description}</p>

        <div className="class-meta">
          <div className="meta-item">
            <span className="meta-icon">👨‍🏫</span>
            <span>{liveClass.instructorId.name}</span>
          </div>

          <div className="meta-item">
            <span className="meta-icon">📅</span>
            <span>
              {new Date(liveClass.scheduledStartTime).toLocaleDateString()} at{' '}
              {new Date(liveClass.scheduledStartTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          <div className="meta-item">
            <span className="meta-icon">👥</span>
            <span>
              {liveClass.participants.length} / {liveClass.maxParticipants}
            </span>
          </div>

          {!isLive && (
            <div className="meta-item">
              <span className="meta-icon">⏱️</span>
              <span>Starts in {getTimeUntilStart(liveClass.scheduledStartTime)}</span>
            </div>
          )}
        </div>

        {liveClass.tags.length > 0 && (
          <div className="class-tags">
            {liveClass.tags.map((tag, index) => (
              <span key={index} className="tag">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="class-actions">
          {isLive ? (
            <Link to={`/live/${liveClass._id}`} className="btn btn-primary">
              Join Now
            </Link>
          ) : liveClass.status === 'scheduled' ? (
            <>
              <Link to={`/live/${liveClass._id}`} className="btn btn-secondary">
                View Details
              </Link>
              <button className="btn btn-outline">
                Set Reminder
              </button>
            </>
          ) : (
            <Link to={`/live/${liveClass._id}`} className="btn btn-secondary">
              View Recording
            </Link>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="schedule-loading">
        <div className="spinner"></div>
        <p>Loading classes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="schedule-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={fetchClasses}>Retry</button>
      </div>
    );
  }

  return (
    <div className="live-schedule-container">
      <div className="schedule-header">
        <h1>Live Classes</h1>
        <p>Join live coding sessions and interact with instructors in real-time</p>
      </div>

      <div className="schedule-tabs">
        <button
          className={activeTab === 'live' ? 'active' : ''}
          onClick={() => setActiveTab('live')}
        >
          <span className="tab-badge">{liveClasses.length}</span>
          Live Now
        </button>
        <button
          className={activeTab === 'upcoming' ? 'active' : ''}
          onClick={() => setActiveTab('upcoming')}
        >
          <span className="tab-badge">{upcomingClasses.length}</span>
          Upcoming
        </button>
        <button
          className={activeTab === 'past' ? 'active' : ''}
          onClick={() => setActiveTab('past')}
        >
          Past Classes
        </button>
      </div>

      <div className="schedule-content">
        {activeTab === 'live' && (
          <div className="classes-grid">
            {liveClasses.length === 0 ? (
              <div className="no-classes">
                <h3>No live classes at the moment</h3>
                <p>Check back later or view upcoming classes</p>
                <button onClick={() => setActiveTab('upcoming')} className="btn btn-primary">
                  View Upcoming Classes
                </button>
              </div>
            ) : (
              liveClasses.map((liveClass) => (
                <ClassCard key={liveClass._id} liveClass={liveClass} isLive />
              ))
            )}
          </div>
        )}

        {activeTab === 'upcoming' && (
          <div className="classes-grid">
            {upcomingClasses.length === 0 ? (
              <div className="no-classes">
                <h3>No upcoming classes scheduled</h3>
                <p>New classes will be announced soon</p>
              </div>
            ) : (
              upcomingClasses.map((liveClass) => (
                <ClassCard key={liveClass._id} liveClass={liveClass} />
              ))
            )}
          </div>
        )}

        {activeTab === 'past' && (
          <div className="classes-grid">
            {pastClasses.length === 0 ? (
              <div className="no-classes">
                <h3>No past classes available</h3>
                <p>Recordings will appear here after classes end</p>
              </div>
            ) : (
              pastClasses.map((liveClass) => (
                <ClassCard key={liveClass._id} liveClass={liveClass} />
              ))
            )}
          </div>
        )}
      </div>

      <div className="schedule-footer">
        <div className="info-cards">
          <div className="info-card">
            <h3>How Live Classes Work</h3>
            <ul>
              <li>Join scheduled sessions in real-time</li>
              <li>Ask questions and get instant answers</li>
              <li>Participate in live coding exercises</li>
              <li>Access recordings after the session</li>
            </ul>
          </div>

          <div className="info-card">
            <h3>Features</h3>
            <ul>
              <li>HD video streaming</li>
              <li>Interactive chat and Q&A</li>
              <li>Screen sharing and whiteboard</li>
              <li>Live polls and quizzes</li>
            </ul>
          </div>

          <div className="info-card">
            <h3>Tips for Best Experience</h3>
            <ul>
              <li>Use a stable internet connection</li>
              <li>Enable camera and mic for interaction</li>
              <li>Arrive 5 minutes early</li>
              <li>Have your IDE ready for coding</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveClassSchedule;
