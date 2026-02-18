import React, { useRef, useState, useEffect } from 'react';
import Hls from 'hls.js';
import './VideoPlayer.css';

interface Chapter {
  title: string;
  timestamp: number;
  description?: string;
}

interface Bookmark {
  timestamp: number;
  note?: string;
  createdAt: Date;
}

interface Note {
  timestamp: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

interface VideoPlayerProps {
  videoId: string;
  hlsUrl?: string;
  dashUrl?: string;
  directUrls?: Array<{ resolution: string; url: string }>;
  title: string;
  chapters?: Chapter[];
  subtitles?: Array<{ language: string; url: string; label?: string }>;
  bookmarks?: Bookmark[];
  notes?: Note[];
  onProgress?: (currentTime: number, watchedRanges: Array<{ start: number; end: number }>) => void;
  onBookmarkAdd?: (timestamp: number, note?: string) => void;
  onBookmarkRemove?: (timestamp: number) => void;
  onNoteAdd?: (timestamp: number, content: string) => void;
  onNoteRemove?: (timestamp: number) => void;
  resumePosition?: number;
  autoPlay?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoId,
  hlsUrl,
  dashUrl,
  directUrls,
  title,
  chapters = [],
  subtitles = [],
  bookmarks = [],
  notes = [],
  onProgress,
  onBookmarkAdd,
  onBookmarkRemove,
  onNoteAdd,
  onNoteRemove,
  resumePosition = 0,
  autoPlay = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [quality, setQuality] = useState('auto');
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPictureInPicture, setIsPictureInPicture] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  const [showChapters, setShowChapters] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [noteInput, setNoteInput] = useState('');
  const [bookmarkNote, setBookmarkNote] = useState('');
  const [watchedRanges, setWatchedRanges] = useState<Array<{ start: number; end: number }>>([]);

  // Initialize video player
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Load HLS if supported
    if (hlsUrl) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90,
        });

        hls.loadSource(hlsUrl);
        hls.attachMedia(video);
        hlsRef.current = hls;

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (resumePosition > 0) {
            video.currentTime = resumePosition;
          }
          if (autoPlay) {
            video.play().catch(console.error);
          }
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                console.error('Fatal HLS error:', data);
                break;
            }
          }
        });

        return () => {
          hls.destroy();
        };
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        video.src = hlsUrl;
        if (resumePosition > 0) {
          video.currentTime = resumePosition;
        }
      }
    } else if (directUrls && directUrls.length > 0) {
      // Use direct URL
      video.src = directUrls[0].url;
      if (resumePosition > 0) {
        video.currentTime = resumePosition;
      }
    }
  }, [videoId, hlsUrl, directUrls, resumePosition, autoPlay]);

  // Track watched ranges
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let lastTime = 0;
    const interval = setInterval(() => {
      const current = video.currentTime;
      if (Math.abs(current - lastTime) < 2) {
        // User is watching continuously
        const lastRange = watchedRanges[watchedRanges.length - 1];
        if (lastRange && current - lastRange.end < 2) {
          lastRange.end = current;
        } else {
          setWatchedRanges([...watchedRanges, { start: current, end: current }]);
        }
      }
      lastTime = current;
    }, 1000);

    return () => clearInterval(interval);
  }, [watchedRanges]);

  // Send progress updates
  useEffect(() => {
    if (onProgress && currentTime > 0) {
      onProgress(currentTime, watchedRanges);
    }
  }, [currentTime, watchedRanges, onProgress]);

  // Event handlers
  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    setCurrentTime(video.currentTime);
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;

    setDuration(video.duration);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const progressBar = progressBarRef.current;
    if (!video || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    video.currentTime = percent * video.duration;
  };

  const handleVolumeChange = (value: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = value;
    setVolume(value);
    setIsMuted(value === 0);
  };

  const handleMuteToggle = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handlePlaybackRateChange = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const handleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handlePictureInPicture = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPictureInPicture(false);
      } else {
        await video.requestPictureInPicture();
        setIsPictureInPicture(true);
      }
    } catch (error) {
      console.error('PiP error:', error);
    }
  };

  const handleChapterClick = (timestamp: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = timestamp;
    setShowChapters(false);
  };

  const handleBookmarkAdd = () => {
    if (onBookmarkAdd) {
      onBookmarkAdd(currentTime, bookmarkNote);
      setBookmarkNote('');
    }
  };

  const handleNoteAdd = () => {
    if (onNoteAdd && noteInput.trim()) {
      onNoteAdd(currentTime, noteInput);
      setNoteInput('');
    }
  };

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const video = videoRef.current;
      if (!video) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          handlePlayPause();
          break;
        case 'f':
          handleFullscreen();
          break;
        case 'm':
          handleMuteToggle();
          break;
        case 'ArrowLeft':
          video.currentTime -= 5;
          break;
        case 'ArrowRight':
          video.currentTime += 5;
          break;
        case 'ArrowUp':
          handleVolumeChange(Math.min(1, volume + 0.1));
          break;
        case 'ArrowDown':
          handleVolumeChange(Math.max(0, volume - 0.1));
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [volume]);

  return (
    <div
      ref={containerRef}
      className="video-player-container"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(isPlaying ? false : true)}
    >
      <video
        ref={videoRef}
        className="video-player"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        crossOrigin="anonymous"
      >
        {subtitles.map((subtitle, index) => (
          <track
            key={index}
            kind="subtitles"
            src={subtitle.url}
            srcLang={subtitle.language}
            label={subtitle.label || subtitle.language}
          />
        ))}
      </video>

      {showControls && (
        <div className="video-controls">
          <div
            ref={progressBarRef}
            className="progress-bar"
            onClick={handleSeek}
          >
            <div
              className="progress-filled"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
            {bookmarks.map((bookmark, index) => (
              <div
                key={index}
                className="bookmark-marker"
                style={{ left: `${(bookmark.timestamp / duration) * 100}%` }}
                title={bookmark.note}
              />
            ))}
          </div>

          <div className="controls-row">
            <button onClick={handlePlayPause}>
              {isPlaying ? '⏸' : '▶'}
            </button>

            <span className="time-display">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            <button onClick={handleMuteToggle}>
              {isMuted ? '🔇' : '🔊'}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="volume-slider"
            />

            <select
              value={playbackRate}
              onChange={(e) => handlePlaybackRateChange(parseFloat(e.target.value))}
              className="playback-rate-select"
            >
              <option value="0.5">0.5x</option>
              <option value="0.75">0.75x</option>
              <option value="1">1x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2x</option>
            </select>

            <button onClick={() => setShowChapters(!showChapters)}>
              📑
            </button>

            <button onClick={() => setShowBookmarks(!showBookmarks)}>
              🔖
            </button>

            <button onClick={() => setShowNotes(!showNotes)}>
              📝
            </button>

            <button onClick={() => setShowSubtitles(!showSubtitles)}>
              CC
            </button>

            <button onClick={handlePictureInPicture}>
              ⧉
            </button>

            <button onClick={handleFullscreen}>
              {isFullscreen ? '⛶' : '⛶'}
            </button>
          </div>
        </div>
      )}

      {showChapters && chapters.length > 0 && (
        <div className="chapters-panel">
          <h3>Chapters</h3>
          {chapters.map((chapter, index) => (
            <div
              key={index}
              className="chapter-item"
              onClick={() => handleChapterClick(chapter.timestamp)}
            >
              <span className="chapter-time">{formatTime(chapter.timestamp)}</span>
              <span className="chapter-title">{chapter.title}</span>
            </div>
          ))}
        </div>
      )}

      {showBookmarks && (
        <div className="bookmarks-panel">
          <h3>Bookmarks</h3>
          <div className="add-bookmark">
            <input
              type="text"
              placeholder="Add note (optional)"
              value={bookmarkNote}
              onChange={(e) => setBookmarkNote(e.target.value)}
            />
            <button onClick={handleBookmarkAdd}>Add Bookmark</button>
          </div>
          {bookmarks.map((bookmark, index) => (
            <div key={index} className="bookmark-item">
              <span className="bookmark-time">{formatTime(bookmark.timestamp)}</span>
              <span className="bookmark-note">{bookmark.note}</span>
              <button onClick={() => onBookmarkRemove?.(bookmark.timestamp)}>×</button>
            </div>
          ))}
        </div>
      )}

      {showNotes && (
        <div className="notes-panel">
          <h3>Notes</h3>
          <div className="add-note">
            <textarea
              placeholder="Add note at current time"
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
            />
            <button onClick={handleNoteAdd}>Add Note</button>
          </div>
          {notes.map((note, index) => (
            <div key={index} className="note-item">
              <span className="note-time">{formatTime(note.timestamp)}</span>
              <p className="note-content">{note.content}</p>
              <button onClick={() => onNoteRemove?.(note.timestamp)}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
