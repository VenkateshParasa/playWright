import React, { useState, useRef } from 'react';
import {
  Upload, Play, Pause, Volume2, Scissors, Plus,
  Download, Save, Film, Clock
} from 'lucide-react';

interface VideoSegment {
  id: string;
  start: number;
  end: number;
  duration: number;
}

interface VideoData {
  _id?: string;
  title: string;
  url: string;
  duration: number;
  thumbnail?: string;
  chapters: Array<{ time: number; title: string }>;
  captions: Array<{ language: string; url: string }>;
}

const VideoEditor: React.FC = () => {
  const [video, setVideo] = useState<VideoData | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [segments, setSegments] = useState<VideoSegment[]>([]);
  const [chapters, setChapters] = useState<Array<{ time: number; title: string }>>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoUpload = async (file: File) => {
    const url = URL.createObjectURL(file);
    const videoElement = document.createElement('video');
    videoElement.src = url;

    videoElement.onloadedmetadata = () => {
      setVideo({
        title: file.name.replace(/\.[^/.]+$/, ''),
        url,
        duration: videoElement.duration,
        chapters: [],
        captions: []
      });
    };
  };

  const addChapter = () => {
    if (!videoRef.current) return;

    const newChapter = {
      time: Math.floor(videoRef.current.currentTime),
      title: `Chapter ${chapters.length + 1}`
    };

    setChapters([...chapters, newChapter].sort((a, b) => a.time - b.time));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;

    if (playing) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setPlaying(!playing);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Video Editor</h1>

            <div className="flex items-center gap-3">
              {video && (
                <>
                  <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                    <Download size={18} />
                    Export
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg">
                    <Save size={18} />
                    Save
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-4 gap-6">
          {/* Main Video Area */}
          <div className="col-span-3 space-y-6">
            {video ? (
              <>
                {/* Video Player */}
                <div className="bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    src={video.url}
                    className="w-full"
                    onTimeUpdate={(e) => setCurrentTime((e.target as HTMLVideoElement).currentTime)}
                    onEnded={() => setPlaying(false)}
                  />

                  {/* Video Controls */}
                  <div className="bg-gray-900 p-4">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={togglePlayPause}
                        className="p-2 bg-white rounded-full hover:bg-gray-100"
                      >
                        {playing ? <Pause size={20} /> : <Play size={20} />}
                      </button>

                      <div className="flex-1">
                        <input
                          type="range"
                          min="0"
                          max={video.duration}
                          value={currentTime}
                          onChange={(e) => {
                            const time = parseFloat(e.target.value);
                            setCurrentTime(time);
                            if (videoRef.current) {
                              videoRef.current.currentTime = time;
                            }
                          }}
                          className="w-full"
                        />
                      </div>

                      <span className="text-white text-sm">
                        {formatTime(currentTime)} / {formatTime(video.duration)}
                      </span>

                      <button className="p-2 text-white hover:bg-gray-800 rounded">
                        <Volume2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Timeline & Chapters */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Chapters</h3>
                    <button
                      onClick={addChapter}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm"
                    >
                      <Plus size={16} />
                      Add Chapter
                    </button>
                  </div>

                  <div className="space-y-2">
                    {chapters.map((chapter, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <Clock size={16} className="text-gray-500" />
                        <span className="text-sm text-gray-600 w-16">
                          {formatTime(chapter.time)}
                        </span>
                        <input
                          type="text"
                          value={chapter.title}
                          onChange={(e) => {
                            const newChapters = [...chapters];
                            newChapters[index].title = e.target.value;
                            setChapters(newChapters);
                          }}
                          className="flex-1 border-gray-300 rounded-lg text-sm"
                          placeholder="Chapter title"
                        />
                      </div>
                    ))}

                    {chapters.length === 0 && (
                      <p className="text-gray-500 text-sm text-center py-4">
                        No chapters added yet. Play the video and click "Add Chapter" at key moments.
                      </p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12">
                <div className="text-center">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => e.target.files?.[0] && handleVideoUpload(e.target.files[0])}
                    className="hidden"
                    id="video-upload"
                  />
                  <label
                    htmlFor="video-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Film size={64} className="text-gray-400 mb-4" />
                    <p className="text-xl font-semibold text-gray-900 mb-2">
                      Upload a video to get started
                    </p>
                    <p className="text-gray-600">
                      Click to browse or drag and drop
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Supports MP4, WebM, and MOV (max 2GB)
                    </p>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Video Settings</h3>

              {video && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={video.title}
                      onChange={(e) => setVideo({ ...video, title: e.target.value })}
                      className="w-full border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration
                    </label>
                    <p className="text-gray-900">{formatTime(video.duration)}</p>
                  </div>
                </div>
              )}
            </div>

            {video && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">Tools</h3>

                <div className="space-y-2">
                  <button className="w-full flex items-center gap-2 px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg">
                    <Scissors size={18} />
                    Trim Video
                  </button>
                  <button className="w-full flex items-center gap-2 px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg">
                    <Upload size={18} />
                    Add Captions
                  </button>
                  <button className="w-full flex items-center gap-2 px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg">
                    <Film size={18} />
                    Generate Thumbnail
                  </button>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 text-sm mb-2">
                Video Editor Tips
              </h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Add chapters at key learning moments</li>
                <li>• Upload captions for accessibility</li>
                <li>• Keep videos under 15 minutes when possible</li>
                <li>• Use a clear thumbnail</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoEditor;
