# Video Infrastructure Documentation

## Overview

This document provides comprehensive information about the video streaming and live class infrastructure for the Playwright & Selenium Learning Platform.

## Architecture

### Components

1. **Video Processing Service** - Handles video upload, processing, and metadata extraction
2. **Transcoding Service** - Converts videos to multiple resolutions and formats
3. **Streaming Service** - Manages video delivery, sessions, and analytics
4. **Live Class Service** - Handles real-time live streaming classes
5. **CDN Integration** - Global content delivery for optimal performance
6. **Video Player** - Custom React component with advanced features
7. **Worker System** - Background processing queue for video transcoding

### Technology Stack

- **Backend**: Node.js with Express
- **Database**: MongoDB for metadata storage
- **Queue**: BullMQ with Redis for background jobs
- **Video Processing**: FFmpeg for transcoding and manipulation
- **Streaming**: HLS (HTTP Live Streaming) and DASH (Dynamic Adaptive Streaming over HTTP)
- **Live Streaming**: WebRTC for real-time communication
- **CDN**: CloudFlare / AWS CloudFront
- **Frontend**: React with TypeScript
- **Video Player**: HLS.js for adaptive streaming

## Video Processing Pipeline

### 1. Upload Process

```typescript
// Upload video
POST /api/videos/upload
Content-Type: multipart/form-data

{
  file: <video file>,
  title: "Video Title",
  description: "Video description",
  courseId: "course_id",
  lessonId: "lesson_id",
  isPremium: false,
  tags: "playwright,testing",
  category: "automation"
}
```

### 2. Processing Stages

1. **Upload** (0-10%)
   - File validation
   - Metadata extraction
   - Database record creation

2. **Thumbnail Generation** (10-30%)
   - Extract 5 thumbnails at different timestamps
   - Resize to 320px width
   - Store in thumbnail directory

3. **Transcoding** (30-70%)
   - Convert to multiple resolutions:
     - 1080p (1920x1080) - 5000k bitrate
     - 720p (1280x720) - 2500k bitrate
     - 480p (854x480) - 1000k bitrate
     - 360p (640x360) - 500k bitrate

4. **HLS Generation** (70-85%)
   - Create master playlist
   - Generate variant playlists for each resolution
   - Segment videos into 6-second chunks

5. **DASH Generation** (85-95%)
   - Create MPD manifest
   - Generate initialization segments
   - Create media segments

6. **Subtitle Generation** (95-100%)
   - Extract audio track
   - Convert to text using speech-to-text
   - Generate WebVTT files

### 3. Storage Structure

```
/uploads/
  /videos/          # Original uploaded videos
  /processed/       # Transcoded video files
  /hls/             # HLS segments and manifests
    /{videoId}/
      master.m3u8
      1080p.m3u8
      1080p_000.ts
      ...
  /dash/            # DASH segments and manifests
    /{videoId}/
      manifest.mpd
      ...
  /thumbnails/      # Video thumbnails
  /subtitles/       # Subtitle files
```

## Streaming

### Adaptive Bitrate Streaming (ABR)

The platform supports both HLS and DASH for adaptive bitrate streaming:

#### HLS (HTTP Live Streaming)

- Compatible with iOS, Safari, and modern browsers
- Master playlist contains references to variant playlists
- Automatically switches quality based on bandwidth

```typescript
// Get streaming URLs
GET /api/videos/:id/streaming-urls

Response:
{
  hlsUrl: "/hls/video123/master.m3u8",
  dashUrl: "/dash/video123/manifest.mpd",
  directUrls: [
    { resolution: "1080p", url: "/videos/video123_1080p.mp4" },
    { resolution: "720p", url: "/videos/video123_720p.mp4" },
    ...
  ]
}
```

#### DASH (Dynamic Adaptive Streaming over HTTP)

- Industry standard for adaptive streaming
- Better support for DRM
- More flexible codec options

### Session Management

#### Start Session

```typescript
POST /api/videos/:id/session
Content-Type: application/json

{
  quality: "auto" // or specific: "1080p", "720p", etc.
}

Response:
{
  sessionId: "session_unique_id"
}
```

#### Update Progress

```typescript
PUT /api/videos/session/:sessionId/progress
Content-Type: application/json

{
  currentPosition: 120.5,
  watchedRanges: [
    { start: 0, end: 50 },
    { start: 50, end: 120.5 }
  ]
}
```

#### End Session

```typescript
POST /api/videos/session/:sessionId/end

Response:
{
  analytics: {
    videoId: "video123",
    userId: "user123",
    watchedDuration: 120.5,
    completionRate: 85.5,
    droppedAt: 120.5,
    quality: "720p",
    buffering: 2,
    errors: 0
  }
}
```

## Video Player Features

### Basic Controls

- Play/Pause
- Seek
- Volume control
- Mute/Unmute
- Playback speed (0.5x to 2x)
- Fullscreen
- Picture-in-Picture

### Advanced Features

1. **Resume from Last Position**
   - Automatically saves progress
   - Resumes on next visit

2. **Quality Selector**
   - Manual quality selection
   - Auto mode for adaptive streaming

3. **Captions/Subtitles**
   - Multiple language support
   - Auto-generated subtitles
   - Toggle on/off

4. **Chapters**
   - Timeline markers
   - Click to navigate
   - Visual representation

5. **Bookmarks**
   - Save important moments
   - Add notes
   - Quick navigation

6. **Notes**
   - Time-stamped notes
   - Create while watching
   - Review later

### Keyboard Shortcuts

- `Space` - Play/Pause
- `F` - Toggle fullscreen
- `M` - Mute/Unmute
- `←` - Seek backward 5 seconds
- `→` - Seek forward 5 seconds
- `↑` - Increase volume
- `↓` - Decrease volume

## Video Analytics

### Metrics Tracked

1. **View Metrics**
   - Total views
   - Unique viewers
   - Active viewers
   - Peak concurrent viewers

2. **Engagement Metrics**
   - Total watch time
   - Average watch time
   - Completion rate
   - Drop-off points

3. **Performance Metrics**
   - Buffering events
   - Quality switches
   - Errors
   - Loading time

4. **Engagement Heatmap**
   - Views per segment
   - Skipped segments
   - Replayed segments

### Access Analytics

```typescript
GET /api/videos/:id/analytics

Response:
{
  analytics: {
    views: 1250,
    totalWatchTime: 45000,
    averageWatchTime: 36,
    completionRate: 72.5,
    engagementScore: 85.3,
    totalViewers: 500,
    activeViewers: 12,
    dropOffPoints: [
      { timestamp: 30, percentage: 10 },
      { timestamp: 120, percentage: 25 }
    ]
  }
}
```

### Engagement Heatmap

```typescript
GET /api/videos/:id/heatmap

Response:
{
  heatmap: [
    { timestamp: 0, views: 500, skips: 10, replays: 5 },
    { timestamp: 12, views: 480, skips: 15, replays: 8 },
    ...
  ]
}
```

## Security

### Signed URLs

All video URLs are signed with HMAC-SHA256 and expire after 1 hour:

```typescript
const expiry = Math.floor(Date.now() / 1000) + 3600;
const signature = crypto
  .createHmac('sha256', SECRET_KEY)
  .update(`${videoPath}${expiry}`)
  .digest('hex');

const url = `${CDN_URL}${videoPath}?expires=${expiry}&signature=${signature}`;
```

### DRM Support

The platform supports multiple DRM providers:

- Widevine (Android, Chrome)
- FairPlay (iOS, Safari)
- PlayReady (Windows, Edge)

```typescript
// Enable DRM for video
PUT /api/videos/:id
Content-Type: application/json

{
  drm: {
    enabled: true,
    provider: "widevine",
    contentId: "content_id"
  }
}
```

### Access Control

- Premium content requires subscription
- Per-video access control
- Course-based access
- Time-limited access

## Performance Optimization

### CDN Configuration

1. **Edge Caching**
   - Cache video segments at edge locations
   - Reduce latency
   - Improve bandwidth

2. **Origin Shield**
   - Protect origin server
   - Reduce origin requests
   - Improve cache hit ratio

3. **Compression**
   - Gzip/Brotli compression
   - Reduce transfer size
   - Faster delivery

### Video Optimization

1. **Encoding Settings**
   - H.264 codec for compatibility
   - AAC audio codec
   - Fast start (moov atom at beginning)
   - Optimal keyframe interval (2 seconds)

2. **Segment Duration**
   - 6-second segments for HLS
   - Balance between quality switching and overhead

3. **Preloading**
   - Preload video metadata
   - Buffer ahead based on bandwidth
   - Predictive preloading

## Monitoring

### Health Checks

```typescript
GET /api/videos/health

Response:
{
  status: "healthy",
  services: {
    processing: "operational",
    transcoding: "operational",
    streaming: "operational",
    cdn: "operational"
  },
  metrics: {
    activeTranscodings: 3,
    activeSessions: 127,
    queueSize: 5
  }
}
```

### Alerts

- Processing failures
- Transcoding errors
- High error rates
- CDN issues
- Storage capacity warnings

## Troubleshooting

### Common Issues

1. **Video Won't Play**
   - Check browser compatibility
   - Verify video format
   - Check network connection
   - Clear browser cache

2. **Buffering Issues**
   - Check internet speed
   - Try lower quality
   - Check CDN status
   - Verify segment availability

3. **Audio/Video Sync**
   - Re-encode video
   - Check source file
   - Verify player version

4. **Subtitle Issues**
   - Verify subtitle format (WebVTT)
   - Check encoding (UTF-8)
   - Verify CORS headers

### Debug Mode

Enable debug logging in video player:

```typescript
<VideoPlayer
  videoId={videoId}
  debug={true}
  onError={(error) => console.error(error)}
  onWarning={(warning) => console.warn(warning)}
/>
```

## API Reference

See complete API documentation in `/docs/API.md`

## Best Practices

1. **Video Encoding**
   - Use H.264 High profile for best quality
   - Keep keyframe interval at 2 seconds
   - Use 2-pass encoding for better quality
   - Add fast start flag for web streaming

2. **Storage**
   - Use object storage (S3, GCS) for scalability
   - Implement lifecycle policies
   - Archive old videos
   - Use compression

3. **Bandwidth**
   - Implement CDN caching
   - Use adaptive bitrate streaming
   - Optimize segment size
   - Monitor usage

4. **User Experience**
   - Show loading indicators
   - Provide quality selector
   - Enable keyboard shortcuts
   - Support mobile devices

## Future Enhancements

- [ ] AI-powered video analysis
- [ ] Automatic chapter detection
- [ ] Multi-language subtitle generation
- [ ] Live transcription
- [ ] Interactive video quizzes
- [ ] 360-degree video support
- [ ] VR/AR integration
- [ ] Collaborative watching
- [ ] Live annotations
- [ ] Video clipping and sharing

## Support

For technical support:
- Email: support@platform.com
- Documentation: https://docs.platform.com
- GitHub: https://github.com/platform/issues
