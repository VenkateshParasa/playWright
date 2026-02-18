# Live Streaming Guide

## Overview

This guide covers everything you need to know about implementing and using live streaming functionality for the Playwright & Selenium Learning Platform.

## Architecture

### System Components

1. **RTMP Server** - Ingests live video streams
2. **WebRTC Server** - Handles real-time communication
3. **Media Server** - Processes and distributes streams
4. **Signaling Server** - Manages WebRTC connections
5. **Chat Server** - Real-time messaging
6. **Recording Service** - Captures live sessions
7. **CDN** - Distributes live streams globally

### Streaming Protocols

#### RTMP (Real-Time Messaging Protocol)

Used for ingestion from streaming software:

- OBS Studio
- Streamlabs
- XSplit
- Hardware encoders

#### WebRTC (Web Real-Time Communication)

Used for browser-based streaming:

- Low latency (< 500ms)
- Peer-to-peer when possible
- Built-in browser support
- No plugins required

#### HLS (HTTP Live Streaming)

Used for playback:

- ~6-30 second latency
- Wide compatibility
- Adaptive bitrate
- CDN-friendly

## Setting Up Live Classes

### 1. Schedule a Live Class

```typescript
POST /api/live/schedule
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "Advanced Playwright Techniques",
  "description": "Learn advanced automation patterns",
  "scheduledStartTime": "2024-03-15T14:00:00Z",
  "scheduledEndTime": "2024-03-15T16:00:00Z",
  "maxParticipants": 100,
  "features": {
    "whiteboard": true,
    "breakoutRooms": false,
    "polls": true,
    "quizzes": true
  },
  "allowChat": true,
  "allowQA": true,
  "allowScreenShare": true,
  "allowRecording": true,
  "requireApproval": false,
  "isPremium": false,
  "tags": ["playwright", "advanced", "automation"]
}

Response:
{
  "message": "Live class scheduled successfully",
  "class": {
    "_id": "class123",
    "title": "Advanced Playwright Techniques",
    "status": "scheduled",
    "streamConfig": {
      "rtmpUrl": "rtmp://server.com/live/streamkey123",
      "streamKey": "streamkey123",
      "webrtcUrl": "https://server.com/rtc/streamkey123"
    },
    ...
  }
}
```

### 2. Start the Class

```typescript
POST /api/live/:id/start
Authorization: Bearer {token}

Response:
{
  "message": "Live class started",
  "class": {
    "status": "live",
    "actualStartTime": "2024-03-15T14:00:30Z",
    ...
  }
}
```

### 3. Streaming Options

#### Option A: Using OBS Studio

1. Download OBS Studio from https://obsproject.com
2. Configure stream settings:
   - Server: Use the RTMP URL from class details
   - Stream Key: Use the stream key from class details
3. Set up your scenes (camera, screen share, etc.)
4. Click "Start Streaming"

**OBS Settings:**
```
Video:
- Base Resolution: 1920x1080
- Output Resolution: 1920x1080 or 1280x720
- FPS: 30

Output:
- Encoder: x264 or Hardware (NVENC/QuickSync)
- Bitrate: 2500-5000 kbps
- Keyframe Interval: 2 seconds
- Preset: veryfast to medium

Audio:
- Sample Rate: 48 kHz
- Bitrate: 160-192 kbps
```

#### Option B: Using Browser

```typescript
// Join class and enable camera/mic
POST /api/live/:id/join
Content-Type: application/json
Authorization: Bearer {token}

{
  "role": "speaker" // or "moderator", "viewer"
}

Response:
{
  "playbackUrl": "https://server.com/rtc/streamkey123",
  "token": "access_token"
}
```

## Participant Management

### Join Class

```typescript
POST /api/live/:id/join
Authorization: Bearer {token}

{
  "role": "viewer" // viewer, moderator, or speaker
}
```

### Leave Class

```typescript
POST /api/live/:id/leave
Authorization: Bearer {token}
```

### Participant Roles

1. **Viewer**
   - Watch live stream
   - Send chat messages
   - Ask questions
   - Vote in polls

2. **Speaker**
   - All viewer permissions
   - Share camera
   - Share microphone
   - Share screen

3. **Moderator**
   - All speaker permissions
   - Manage participants
   - Moderate chat
   - Answer questions
   - Create polls

4. **Instructor**
   - All moderator permissions
   - Start/end class
   - Create breakout rooms
   - Access analytics

## Interactive Features

### Chat

#### Send Message

```typescript
POST /api/live/:id/chat
Content-Type: application/json
Authorization: Bearer {token}

{
  "message": "Great explanation!"
}
```

#### Get Messages

```typescript
GET /api/live/:id/chat?limit=50&before=2024-03-15T14:30:00Z
Authorization: Bearer {token}

Response:
{
  "messages": [
    {
      "messageId": "msg123",
      "userId": "user123",
      "userName": "John Doe",
      "message": "Great explanation!",
      "timestamp": "2024-03-15T14:25:30Z"
    },
    ...
  ]
}
```

### Q&A System

#### Ask Question

```typescript
POST /api/live/:id/qa
Content-Type: application/json
Authorization: Bearer {token}

{
  "question": "How do I handle dynamic selectors in Playwright?"
}
```

#### Answer Question (Instructor/Moderator)

```typescript
POST /api/live/:id/qa/:questionId/answer
Content-Type: application/json
Authorization: Bearer {token}

{
  "answer": "You can use dynamic XPath or CSS selectors..."
}
```

#### Get Q&A Queue

```typescript
GET /api/live/:id/qa?status=pending
Authorization: Bearer {token}

Response:
{
  "questions": [
    {
      "questionId": "q123",
      "userId": "user123",
      "userName": "Jane Smith",
      "question": "How do I handle dynamic selectors?",
      "askedAt": "2024-03-15T14:20:00Z",
      "upvotes": 5,
      "status": "pending"
    },
    ...
  ]
}
```

### Polls

#### Create Poll

```typescript
POST /api/live/:id/polls
Content-Type: application/json
Authorization: Bearer {token}

{
  "question": "Have you used Playwright before?",
  "options": ["Yes, extensively", "Yes, a little", "No, but interested", "No"],
  "expiresIn": 300 // seconds
}
```

#### Vote on Poll

```typescript
POST /api/live/:id/polls/:pollId/vote
Content-Type: application/json
Authorization: Bearer {token}

{
  "optionIndex": 0
}
```

#### Get Poll Results

```typescript
GET /api/live/:id/polls
Authorization: Bearer {token}

Response:
{
  "polls": [
    {
      "pollId": "poll123",
      "question": "Have you used Playwright before?",
      "options": [
        { "text": "Yes, extensively", "votes": 45 },
        { "text": "Yes, a little", "votes": 30 },
        { "text": "No, but interested", "votes": 20 },
        { "text": "No", "votes": 5 }
      ],
      "isActive": false
    }
  ]
}
```

### Hand Raising

#### Raise Hand

```typescript
POST /api/live/:id/raise-hand
Authorization: Bearer {token}
```

#### Lower Hand

```typescript
POST /api/live/:id/lower-hand
Authorization: Bearer {token}
```

## Recording

### Automatic Recording

Classes with `allowRecording: true` are automatically recorded when started.

### Recording Process

1. **During Live Class**
   - Stream is recorded to disk
   - Status: `recording`

2. **After Class Ends**
   - Recording is processed
   - Status: `processing`

3. **Processing Complete**
   - Video is transcoded
   - Subtitles generated
   - Status: `ready`

### Access Recording

```typescript
GET /api/live/:id
Authorization: Bearer {token}

Response:
{
  "class": {
    "recording": {
      "status": "ready",
      "url": "/videos/recorded/class123.mp4",
      "videoId": "video123",
      "duration": 7200,
      "size": 1024000000
    }
  }
}
```

## Attendance

### Track Attendance

Attendance is automatically tracked:
- Join time
- Leave time
- Total duration
- Attended flag (minimum 5 minutes)

### Get Attendance Report

```typescript
GET /api/live/:id/attendance
Authorization: Bearer {token}

Response:
{
  "attendance": [
    {
      "user": {
        "_id": "user123",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "joinedAt": "2024-03-15T14:05:00Z",
      "leftAt": "2024-03-15T15:50:00Z",
      "duration": 6300,
      "attended": true
    },
    ...
  ]
}
```

## Analytics

### Live Analytics

```typescript
GET /api/live/:id/analytics
Authorization: Bearer {token}

Response:
{
  "analytics": {
    "peakViewers": 87,
    "totalViews": 120,
    "averageDuration": 5400,
    "engagementRate": 78.5,
    "chatMessages": 256,
    "questionsAsked": 42
  }
}
```

### Engagement Metrics

- Peak concurrent viewers
- Total unique viewers
- Average watch duration
- Chat participation rate
- Question participation rate
- Poll participation rate

## Advanced Features

### Breakout Rooms

```typescript
// Create breakout room
POST /api/live/:id/breakout-rooms
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "Group 1 - Exercise",
  "participants": ["user1", "user2", "user3"]
}

// Join breakout room
POST /api/live/:id/breakout-rooms/:roomId/join
Authorization: Bearer {token}

// Close breakout room
POST /api/live/:id/breakout-rooms/:roomId/close
Authorization: Bearer {token}
```

### Screen Sharing

```typescript
// Enable screen sharing
POST /api/live/:id/screen-share/start
Authorization: Bearer {token}

// Stop screen sharing
POST /api/live/:id/screen-share/stop
Authorization: Bearer {token}
```

### Virtual Whiteboard

```typescript
// WebSocket events for whiteboard
ws://server.com/live/:id/whiteboard

Events:
- draw: { type: 'line', points: [...], color, width }
- erase: { type: 'erase', area: {...} }
- clear: { type: 'clear' }
- undo: { type: 'undo' }
- redo: { type: 'redo' }
```

## WebSocket Events

### Connect to Live Class

```typescript
const socket = io('wss://server.com', {
  auth: { token: 'Bearer token' },
  query: { classId: 'class123' }
});

// Listen for events
socket.on('participant-joined', (data) => {
  console.log(`${data.userName} joined`);
});

socket.on('participant-left', (data) => {
  console.log(`${data.userName} left`);
});

socket.on('chat-message', (message) => {
  // Display message
});

socket.on('question-asked', (question) => {
  // Display question
});

socket.on('poll-created', (poll) => {
  // Display poll
});

socket.on('hand-raised', (data) => {
  // Show hand raised indicator
});
```

## Bandwidth Requirements

### Instructor/Speaker

**Upstream:**
- 720p @ 30fps: 2.5-3 Mbps
- 1080p @ 30fps: 4-5 Mbps

**Downstream:**
- Multiple participants: 1-2 Mbps

### Viewer

**Downstream:**
- 360p: 0.5-1 Mbps
- 480p: 1-1.5 Mbps
- 720p: 2-3 Mbps
- 1080p: 4-5 Mbps

## Troubleshooting

### Common Issues

1. **Cannot Connect to Stream**
   - Check internet connection
   - Verify firewall settings
   - Test RTMP/WebRTC connectivity
   - Check browser permissions

2. **Audio/Video Issues**
   - Check microphone/camera permissions
   - Test audio/video devices
   - Update browser
   - Disable browser extensions

3. **High Latency**
   - Use WebRTC instead of HLS
   - Check server location
   - Reduce video quality
   - Check network conditions

4. **Recording Failed**
   - Check disk space
   - Verify recording permissions
   - Check FFmpeg installation
   - Review error logs

### Debug Mode

```typescript
// Enable debug logging
const liveClass = new LiveClassService({
  debug: true,
  logLevel: 'verbose'
});
```

## Best Practices

### For Instructors

1. **Preparation**
   - Test setup 30 minutes before
   - Check audio and video quality
   - Prepare slides and materials
   - Have backup internet connection

2. **During Class**
   - Engage with participants
   - Monitor chat and Q&A
   - Use polls for interaction
   - Take regular breaks

3. **After Class**
   - Review analytics
   - Respond to unanswered questions
   - Share recording
   - Gather feedback

### For Participants

1. **Join Early**
   - Join 5 minutes before start
   - Test audio/video
   - Check internet speed
   - Close unnecessary apps

2. **Engagement**
   - Use chat for questions
   - Participate in polls
   - Raise hand to speak
   - Take notes

3. **Technical**
   - Use headphones
   - Stable internet connection
   - Close bandwidth-heavy apps
   - Use updated browser

## Security

### Access Control

- JWT authentication
- Role-based permissions
- Stream key encryption
- Signed URLs for recordings

### Privacy

- Participant consent for recording
- GDPR compliance
- Data encryption in transit
- Secure storage

## Scaling

### Horizontal Scaling

- Multiple media servers
- Load balancing
- Geographic distribution
- Auto-scaling based on load

### Capacity Planning

- 100 viewers per server instance
- 1-2 Gbps per 100 viewers
- CDN for distribution
- Redis for session management

## Monitoring

### Health Checks

```typescript
GET /api/live/health

Response:
{
  "status": "healthy",
  "services": {
    "rtmp": "operational",
    "webrtc": "operational",
    "recording": "operational",
    "chat": "operational"
  },
  "metrics": {
    "activeClasses": 5,
    "totalParticipants": 234,
    "bandwidth": "45 Gbps"
  }
}
```

### Alerts

- Stream connection failures
- Recording failures
- High latency warnings
- Bandwidth limits
- Server capacity

## Support

For technical support:
- Live Chat: Available during business hours
- Email: live-support@platform.com
- Documentation: https://docs.platform.com/live
- Status Page: https://status.platform.com
