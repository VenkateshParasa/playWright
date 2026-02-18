import crypto from 'crypto';
import Video, { IVideo } from '../../models/Video.js';
import VideoProgress, { IVideoProgress } from '../../models/VideoProgress.js';

interface ViewSession {
  userId: string;
  videoId: string;
  startTime: Date;
  currentPosition: number;
  quality: string;
}

interface WatchAnalytics {
  videoId: string;
  userId: string;
  watchedDuration: number;
  completionRate: number;
  droppedAt?: number;
  quality: string;
  buffering: number;
  errors: number;
}

interface EngagementHeatmap {
  timestamp: number;
  views: number;
  skips: number;
  replays: number;
}

class StreamingService {
  private activeSessions: Map<string, ViewSession> = new Map();
  private readonly CDN_BASE_URL = process.env.CDN_BASE_URL || '';
  private readonly SIGNED_URL_SECRET = process.env.SIGNED_URL_SECRET || 'your-secret-key';
  private readonly SIGNED_URL_EXPIRY = 3600; // 1 hour

  /**
   * Generate signed URL for video streaming
   */
  generateSignedUrl(videoPath: string, expiresIn: number = this.SIGNED_URL_EXPIRY): string {
    const expiry = Math.floor(Date.now() / 1000) + expiresIn;
    const stringToSign = `${videoPath}${expiry}`;
    const signature = crypto
      .createHmac('sha256', this.SIGNED_URL_SECRET)
      .update(stringToSign)
      .digest('hex');

    const url = `${this.CDN_BASE_URL}${videoPath}?expires=${expiry}&signature=${signature}`;
    return url;
  }

  /**
   * Verify signed URL
   */
  verifySignedUrl(videoPath: string, expiry: number, signature: string): boolean {
    const currentTime = Math.floor(Date.now() / 1000);

    // Check if URL has expired
    if (currentTime > expiry) {
      return false;
    }

    // Verify signature
    const stringToSign = `${videoPath}${expiry}`;
    const expectedSignature = crypto
      .createHmac('sha256', this.SIGNED_URL_SECRET)
      .update(stringToSign)
      .digest('hex');

    return signature === expectedSignature;
  }

  /**
   * Get video streaming URLs with authentication
   */
  async getStreamingUrls(
    videoId: string,
    userId: string,
    quality?: string
  ): Promise<{
    hlsUrl?: string;
    dashUrl?: string;
    directUrls: Array<{ resolution: string; url: string }>;
  }> {
    const video = await Video.findById(videoId);

    if (!video) {
      throw new Error('Video not found');
    }

    if (!video.isPublished) {
      throw new Error('Video is not published');
    }

    // Check if user has access to premium content
    if (video.isPremium) {
      // TODO: Check user subscription
    }

    const result: {
      hlsUrl?: string;
      dashUrl?: string;
      directUrls: Array<{ resolution: string; url: string }>;
    } = {
      directUrls: [],
    };

    // Generate signed URLs
    if (video.hlsManifest) {
      result.hlsUrl = this.generateSignedUrl(video.hlsManifest);
    }

    if (video.dashManifest) {
      result.dashUrl = this.generateSignedUrl(video.dashManifest);
    }

    // Direct URLs for each resolution
    for (const file of video.processedFiles) {
      if (!quality || file.resolution === quality) {
        result.directUrls.push({
          resolution: file.resolution,
          url: this.generateSignedUrl(file.url),
        });
      }
    }

    return result;
  }

  /**
   * Start video session
   */
  async startSession(videoId: string, userId: string, quality: string = 'auto'): Promise<string> {
    const sessionId = crypto.randomBytes(16).toString('hex');

    const session: ViewSession = {
      userId,
      videoId,
      startTime: new Date(),
      currentPosition: 0,
      quality,
    };

    this.activeSessions.set(sessionId, session);

    // Increment view count
    await Video.findByIdAndUpdate(videoId, {
      $inc: { 'analytics.views': 1 },
    });

    // Get or create progress record
    let progress = await VideoProgress.findOne({ userId, videoId });

    if (!progress) {
      const video = await Video.findById(videoId);
      if (!video) {
        throw new Error('Video not found');
      }

      progress = new VideoProgress({
        userId,
        videoId,
        totalDuration: video.originalFile.duration,
        watchedDuration: 0,
        progressPercentage: 0,
        lastWatchedPosition: 0,
        watchSessions: [],
        bookmarks: [],
        notes: [],
      });
    }

    return sessionId;
  }

  /**
   * Update session progress
   */
  async updateProgress(
    sessionId: string,
    currentPosition: number,
    watchedRanges?: Array<{ start: number; end: number }>
  ): Promise<void> {
    const session = this.activeSessions.get(sessionId);

    if (!session) {
      throw new Error('Session not found');
    }

    session.currentPosition = currentPosition;

    // Update progress in database
    const progress = await VideoProgress.findOne({
      userId: session.userId,
      videoId: session.videoId,
    });

    if (progress) {
      progress.lastWatchedPosition = currentPosition;

      if (watchedRanges && watchedRanges.length > 0) {
        // Calculate total watched duration
        let totalWatched = 0;
        for (const range of watchedRanges) {
          totalWatched += range.end - range.start;
        }

        progress.watchedDuration = Math.max(progress.watchedDuration, totalWatched);
        progress.progressPercentage = Math.min(
          (progress.watchedDuration / progress.totalDuration) * 100,
          100
        );

        // Check if completed (watched 95% or more)
        if (progress.progressPercentage >= 95 && !progress.completedAt) {
          progress.completedAt = new Date();
        }
      }

      await progress.save();
    }
  }

  /**
   * End video session
   */
  async endSession(sessionId: string): Promise<WatchAnalytics> {
    const session = this.activeSessions.get(sessionId);

    if (!session) {
      throw new Error('Session not found');
    }

    const endTime = new Date();
    const duration = (endTime.getTime() - session.startTime.getTime()) / 1000;

    // Update progress
    const progress = await VideoProgress.findOne({
      userId: session.userId,
      videoId: session.videoId,
    });

    if (progress) {
      progress.watchSessions.push({
        startTime: session.startTime,
        endTime,
        duration,
        watchedRanges: [],
      });

      await progress.save();

      // Update video analytics
      await this.updateVideoAnalytics(session.videoId);
    }

    this.activeSessions.delete(sessionId);

    return {
      videoId: session.videoId,
      userId: session.userId,
      watchedDuration: duration,
      completionRate: progress ? progress.progressPercentage : 0,
      droppedAt: session.currentPosition,
      quality: session.quality,
      buffering: 0,
      errors: 0,
    };
  }

  /**
   * Update video analytics
   */
  async updateVideoAnalytics(videoId: string): Promise<void> {
    const progressRecords = await VideoProgress.find({ videoId });

    if (progressRecords.length === 0) {
      return;
    }

    // Calculate analytics
    let totalWatchTime = 0;
    let completedCount = 0;
    let totalSessions = 0;

    for (const progress of progressRecords) {
      totalWatchTime += progress.watchedDuration;
      totalSessions += progress.watchSessions.length;

      if (progress.completedAt) {
        completedCount++;
      }
    }

    const averageWatchTime = totalWatchTime / progressRecords.length;
    const completionRate = (completedCount / progressRecords.length) * 100;
    const engagementScore = this.calculateEngagementScore(
      averageWatchTime,
      completionRate,
      progressRecords.length
    );

    await Video.findByIdAndUpdate(videoId, {
      'analytics.totalWatchTime': totalWatchTime,
      'analytics.averageWatchTime': averageWatchTime,
      'analytics.completionRate': completionRate,
      'analytics.engagementScore': engagementScore,
    });
  }

  /**
   * Calculate engagement score
   */
  private calculateEngagementScore(
    averageWatchTime: number,
    completionRate: number,
    viewCount: number
  ): number {
    // Simple engagement score formula
    // Can be customized based on requirements
    const watchTimeScore = Math.min((averageWatchTime / 600) * 40, 40); // Max 40 points for 10+ minutes
    const completionScore = (completionRate / 100) * 40; // Max 40 points for 100% completion
    const popularityScore = Math.min((viewCount / 100) * 20, 20); // Max 20 points for 100+ views

    return watchTimeScore + completionScore + popularityScore;
  }

  /**
   * Get video progress for user
   */
  async getProgress(userId: string, videoId: string): Promise<IVideoProgress | null> {
    return await VideoProgress.findOne({ userId, videoId });
  }

  /**
   * Add bookmark
   */
  async addBookmark(
    userId: string,
    videoId: string,
    timestamp: number,
    note?: string
  ): Promise<void> {
    await VideoProgress.findOneAndUpdate(
      { userId, videoId },
      {
        $push: {
          bookmarks: {
            timestamp,
            note,
            createdAt: new Date(),
          },
        },
      },
      { upsert: true }
    );
  }

  /**
   * Remove bookmark
   */
  async removeBookmark(userId: string, videoId: string, timestamp: number): Promise<void> {
    await VideoProgress.findOneAndUpdate(
      { userId, videoId },
      {
        $pull: {
          bookmarks: { timestamp },
        },
      }
    );
  }

  /**
   * Add note
   */
  async addNote(
    userId: string,
    videoId: string,
    timestamp: number,
    content: string
  ): Promise<void> {
    const progress = await VideoProgress.findOne({ userId, videoId });

    if (!progress) {
      throw new Error('Progress record not found');
    }

    // Check if note exists at this timestamp
    const existingNote = progress.notes.find((n) => n.timestamp === timestamp);

    if (existingNote) {
      existingNote.content = content;
      existingNote.updatedAt = new Date();
    } else {
      progress.notes.push({
        timestamp,
        content,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await progress.save();
  }

  /**
   * Remove note
   */
  async removeNote(userId: string, videoId: string, timestamp: number): Promise<void> {
    await VideoProgress.findOneAndUpdate(
      { userId, videoId },
      {
        $pull: {
          notes: { timestamp },
        },
      }
    );
  }

  /**
   * Get engagement heatmap
   */
  async getEngagementHeatmap(videoId: string): Promise<EngagementHeatmap[]> {
    const video = await Video.findById(videoId);

    if (!video) {
      throw new Error('Video not found');
    }

    const duration = video.originalFile.duration;
    const segments = 100; // Divide video into 100 segments
    const segmentDuration = duration / segments;

    const heatmap: EngagementHeatmap[] = [];

    // Initialize heatmap
    for (let i = 0; i < segments; i++) {
      heatmap.push({
        timestamp: i * segmentDuration,
        views: 0,
        skips: 0,
        replays: 0,
      });
    }

    // Analyze watch sessions to populate heatmap
    const progressRecords = await VideoProgress.find({ videoId });

    for (const progress of progressRecords) {
      for (const session of progress.watchSessions) {
        for (const range of session.watchedRanges) {
          const startSegment = Math.floor(range.start / segmentDuration);
          const endSegment = Math.floor(range.end / segmentDuration);

          for (let i = startSegment; i <= endSegment && i < segments; i++) {
            heatmap[i].views++;
          }
        }
      }
    }

    return heatmap;
  }

  /**
   * Update playback settings
   */
  async updatePlaybackSettings(
    userId: string,
    videoId: string,
    settings: {
      playbackSpeed?: number;
      quality?: string;
      subtitlesEnabled?: boolean;
      subtitleLanguage?: string;
    }
  ): Promise<void> {
    await VideoProgress.findOneAndUpdate({ userId, videoId }, settings, { upsert: true });
  }

  /**
   * Get active sessions count
   */
  getActiveSessionsCount(): number {
    return this.activeSessions.size;
  }

  /**
   * Get active sessions for video
   */
  getActiveSessionsForVideo(videoId: string): ViewSession[] {
    const sessions: ViewSession[] = [];

    for (const [, session] of this.activeSessions) {
      if (session.videoId === videoId) {
        sessions.push(session);
      }
    }

    return sessions;
  }

  /**
   * Clean up inactive sessions
   */
  cleanupInactiveSessions(maxIdleTime: number = 3600000): void {
    const now = Date.now();

    for (const [sessionId, session] of this.activeSessions) {
      const idleTime = now - session.startTime.getTime();

      if (idleTime > maxIdleTime) {
        this.activeSessions.delete(sessionId);
      }
    }
  }
}

export default new StreamingService();
